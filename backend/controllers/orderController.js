import axios from "axios";
import crypto from "crypto";
import prisma from "../prismaClient.js";
import { sendOrderConfirmationEmail, sendStatusUpdateEmail } from "../utils/mailer.js";
import { priceOrder, cleanAddress, reserveStock, OrderError } from "../utils/orderPricing.js";

const ALLOWED_STATUSES = [
  "Order Placed",
  "Packing",
  "Shipped",
  "Out for delivery",
  "Delivered",
  "Cancelled",
];

const CHAPA_HEADERS = () => ({ Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}` });

const serializeOrder = (order) => ({
  ...order,
  date: Number(order.date),
});

const fail = (res, status, message) => res.status(status).json({ success: false, message });

// Customer-safe errors are shown; everything else is logged and hidden.
const handleError = (res, error, label) => {
  if (error instanceof OrderError) return fail(res, error.status, error.message);
  console.error(`[order] ${label}:`, error?.response?.data || error);
  return fail(res, 500, "Something went wrong. Please try again.");
};

// Emails must never slow down or break an order
const sendEmailSafely = (task) => {
  Promise.resolve()
    .then(task)
    .catch((err) => console.error("[mail]", err.message));
};

// ── COD ──────────────────────────────────────────────────────────
const placeOrder = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return fail(res, 401, "User account not found. Please log in again.");

    const address = cleanAddress(req.body.address);
    const { items, amount } = await priceOrder(req.body.items);

    // Take stock + create the order together: both happen or neither does
    const order = await prisma.$transaction(async (tx) => {
      await reserveStock(tx, items);
      const created = await tx.order.create({
        data: {
          userId,
          items,
          address,
          amount,
          paymentMethod: "COD",
          payment: false,
          date: BigInt(Date.now()),
        },
      });
      await tx.user.update({ where: { id: userId }, data: { cartData: {} } });
      return created;
    });

    const safe = serializeOrder(order);
    if (user.email) sendEmailSafely(() => sendOrderConfirmationEmail(user.email, user.name, safe));

    res.json({ success: true, message: "Order Placed", order: safe });
  } catch (error) {
    handleError(res, error, "placeOrder");
  }
};

// ── CBE bank transfer: held for admin review ─────────────────────
const placeOrderCBE = async (req, res) => {
  try {
    const userId = req.userId;

    const txId = typeof req.body.txId === "string" ? req.body.txId.trim() : "";
    if (!/^[A-Za-z0-9_-]{6,40}$/.test(txId)) {
      return fail(res, 400, "Please enter the CBE transaction ID from your transfer.");
    }
    if (!req.file) {
      return fail(res, 400, "Please upload a screenshot of your bank transfer.");
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return fail(res, 401, "User account not found. Please log in again.");

    const address = cleanAddress(req.body.address);
    const { items, amount } = await priceOrder(req.body.items);

    // The same transfer receipt must not pay for two orders
    const reused = await prisma.order.findFirst({
      where: { paymentMethod: "CBE Transfer", txId, status: { not: "Payment Rejected" } },
    });
    if (reused) {
      return fail(res, 409, "This transaction ID was already used for another order.");
    }

    const order = await prisma.order.create({
      data: {
        userId,
        items,
        address,
        amount,
        paymentMethod: "CBE Transfer",
        payment: false,
        status: "Pending Verification",
        txId,
        txProof: req.file.path,
        date: BigInt(Date.now()),
      },
    });

    // Stock is taken only when the admin approves the transfer
    await prisma.user.update({ where: { id: userId }, data: { cartData: {} } });

    const safe = serializeOrder(order);
    if (user.email) sendEmailSafely(() => sendOrderConfirmationEmail(user.email, user.name, safe));

    res.json({ success: true, message: "Order submitted for verification", order: safe });
  } catch (error) {
    handleError(res, error, "placeOrderCBE");
  }
};

// Admin: approve or reject a CBE transfer
const verifyCBEPayment = async (req, res) => {
  try {
    const { orderId, approve } = req.body;
    if (typeof orderId !== "string") return fail(res, 400, "orderId is required");

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return fail(res, 404, "Order not found");

    if (order.paymentMethod !== "CBE Transfer" || order.status !== "Pending Verification") {
      return fail(res, 409, "This order is not waiting for verification.");
    }

    const user = await prisma.user.findUnique({ where: { id: order.userId } });
    const approved = approve === true || approve === "true";

    if (approved) {
      const updated = await prisma.$transaction(async (tx) => {
        // Only one admin click can win; a double click does nothing
        const claimed = await tx.order.updateMany({
          where: { id: orderId, status: "Pending Verification" },
          data: { payment: true, status: "Order Placed" },
        });
        if (claimed.count === 0) throw new OrderError("This order was already processed.", 409);

        await reserveStock(tx, order.items);
        return tx.order.findUnique({ where: { id: orderId } });
      });

      if (user?.email) sendEmailSafely(() => sendStatusUpdateEmail(user.email, user.name, orderId, "Order Placed"));
      return res.json({ success: true, message: "Payment verified — order confirmed", order: serializeOrder(updated) });
    }

    const claimed = await prisma.order.updateMany({
      where: { id: orderId, status: "Pending Verification" },
      data: { status: "Payment Rejected" },
    });
    if (claimed.count === 0) return fail(res, 409, "This order was already processed.");

    const updated = await prisma.order.findUnique({ where: { id: orderId } });
    if (user?.email) sendEmailSafely(() => sendStatusUpdateEmail(user.email, user.name, orderId, "Payment Rejected"));

    res.json({ success: true, message: "Payment rejected", order: serializeOrder(updated) });
  } catch (error) {
    handleError(res, error, "verifyCBEPayment");
  }
};

// ── Chapa ────────────────────────────────────────────────────────
const placeOrderChapa = async (req, res) => {
  let createdOrderId = null;

  try {
    const userId = req.userId;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return fail(res, 401, "User not found. Please log in again.");

    if (!process.env.BASE_URL || !/^https?:\/\//.test(process.env.BASE_URL)) {
      console.error("[order] BASE_URL is missing or invalid");
      return fail(res, 500, "Online payment is not available right now. Please choose another method.");
    }
    if (!process.env.CLIENT_URL || !/^https?:\/\//.test(process.env.CLIENT_URL)) {
      console.error("[order] CLIENT_URL is missing or invalid");
      return fail(res, 500, "Online payment is not available right now. Please choose another method.");
    }

    const address = cleanAddress(req.body.address);
    const { items, amount } = await priceOrder(req.body.items);

    // Chapa allows max 50 characters in tx_ref
    const txRef = `mq-${Date.now().toString(36)}-${crypto.randomBytes(4).toString("hex")}`;

    const order = await prisma.order.create({
      data: {
        userId,
        items,
        address,
        amount,
        paymentMethod: "Chapa",
        payment: false,
        txRef,
        date: BigInt(Date.now()),
      },
    });
    createdOrderId = order.id;

    const chapaRes = await axios.post(
      "https://api.chapa.co/v1/transaction/initialize",
      {
        amount: amount.toString(),
        currency: "ETB",
        email: user.email,
        first_name: user.name.split(" ")[0],
        last_name: user.name.split(" ").slice(1).join(" ") || user.name,
        tx_ref: txRef,
        callback_url: `${process.env.BASE_URL}/api/order/chapa/verify`,
        return_url: `${process.env.CLIENT_URL}/order-success?orderId=${order.id}`,
        customization: {
          title: "Marqato Payment",
          description: `Order ${order.id}`,
        },
      },
      { headers: { ...CHAPA_HEADERS(), "Content-Type": "application/json" }, timeout: 15000 }
    );

    if (chapaRes.data?.status !== "success") {
      throw new Error("Chapa did not accept the payment request");
    }

    res.json({ success: true, checkout_url: chapaRes.data.data.checkout_url });
  } catch (error) {
    // Do not leave unpaid orders behind when we could not start the payment
    if (createdOrderId) {
      await prisma.order.delete({ where: { id: createdOrderId } }).catch(() => {});
    }

    if (error instanceof OrderError) return fail(res, error.status, error.message);

    // Chapa's own validation text (for example a bad name) is useful to the customer
    const chapaError = error?.response?.data;
    console.error("[order] placeOrderChapa:", chapaError || error.message);

    let message = "Could not start the payment. Please try again.";
    if (chapaError?.message && typeof chapaError.message === "object") {
      message = Object.values(chapaError.message).flat().join(" ");
    } else if (typeof chapaError?.message === "string") {
      message = chapaError.message;
    }
    fail(res, 502, message);
  }
};

// Chapa callback. It can arrive several times (GET + POST), so it must be safe to repeat.
const verifyChapaPayment = async (req, res) => {
  try {
    const txRef = String(
      req.query.trx_ref || req.query.tx_ref || req.body?.tx_ref || req.body?.trx_ref || ""
    );
    if (!/^mq-[a-z0-9-]{6,44}$/.test(txRef)) {
      return fail(res, 400, "Invalid transaction reference.");
    }

    const order = await prisma.order.findFirst({ where: { txRef } });
    if (!order) return fail(res, 404, "Order not found");

    // Already processed by an earlier callback
    if (order.payment) return res.json({ success: true });

    const verifyRes = await axios.get(
      `https://api.chapa.co/v1/transaction/verify/${encodeURIComponent(txRef)}`,
      { headers: CHAPA_HEADERS(), timeout: 15000 }
    );

    const tx = verifyRes.data?.data;
    const paidInFull =
      verifyRes.data?.status === "success" &&
      tx?.status === "success" &&
      (!tx.currency || tx.currency === "ETB") &&
      Number(tx.amount) + 0.01 >= order.amount;

    if (!paidInFull) return fail(res, 402, "Payment not verified");

    let outcome;
    try {
      outcome = await prisma.$transaction(async (tx2) => {
        const claimed = await tx2.order.updateMany({
          where: { id: order.id, payment: false },
          data: { payment: true },
        });
        if (claimed.count === 0) return "already";

        await reserveStock(tx2, order.items);
        await tx2.user.update({ where: { id: order.userId }, data: { cartData: {} } });
        return "done";
      });
    } catch (error) {
      if (!(error instanceof OrderError)) throw error;

      // The customer PAID but the item sold out meanwhile: keep the payment, flag it for the admin
      const claimed = await prisma.order.updateMany({
        where: { id: order.id, payment: false },
        data: { payment: true, status: "Stock Issue" },
      });
      outcome = claimed.count > 0 ? "stock_issue" : "already";
      if (outcome === "stock_issue") {
        console.warn(`[order] PAID but out of stock — contact customer. Order ${order.id}`);
      }
    }

    if (outcome === "done") {
      const [fresh, user] = await Promise.all([
        prisma.order.findUnique({ where: { id: order.id } }),
        prisma.user.findUnique({ where: { id: order.userId } }),
      ]);
      if (user?.email) {
        sendEmailSafely(() => sendOrderConfirmationEmail(user.email, user.name, serializeOrder(fresh)));
      }
    }

    res.json({ success: true });
  } catch (error) {
    handleError(res, error, "verifyChapaPayment");
  }
};

// ── Reading orders ───────────────────────────────────────────────
const allOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({ orderBy: { date: "desc" } });
    res.json({ success: true, orders: orders.map(serializeOrder) });
  } catch (error) {
    handleError(res, error, "allOrders");
  }
};

const userOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.userId },
      orderBy: { date: "desc" },
    });
    res.json({ success: true, orders: orders.map(serializeOrder) });
  } catch (error) {
    handleError(res, error, "userOrders");
  }
};

// A customer can only open THEIR OWN order
const singleOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (typeof orderId !== "string" || !orderId) return fail(res, 400, "orderId required");

    const order = await prisma.order.findFirst({ where: { id: orderId, userId: req.userId } });
    if (!order) return fail(res, 404, "Order not found");

    res.json({ success: true, order: serializeOrder(order) });
  } catch (error) {
    handleError(res, error, "singleOrder");
  }
};

// Admin: change delivery status
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    if (typeof orderId !== "string" || !ALLOWED_STATUSES.includes(status)) {
      return fail(res, 400, "Invalid order or status");
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return fail(res, 404, "Order not found");

    await prisma.order.update({ where: { id: orderId }, data: { status } });

    const user = await prisma.user.findUnique({ where: { id: order.userId } });
    if (user?.email) sendEmailSafely(() => sendStatusUpdateEmail(user.email, user.name, orderId, status));

    res.json({ success: true, message: "Status Updated" });
  } catch (error) {
    handleError(res, error, "updateStatus");
  }
};

export {
  placeOrder,
  placeOrderCBE,
  verifyCBEPayment,
  placeOrderChapa,
  verifyChapaPayment,
  allOrders,
  userOrders,
  singleOrder,
  updateStatus,
};