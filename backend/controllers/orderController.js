import axios from "axios";
import prisma from "../prismaClient.js";
import { sendOrderConfirmationEmail, sendStatusUpdateEmail } from "../utils/mailer.js";
import { decrementStock } from "./productController.js";

const serializeOrder = (order) => ({
  ...order,
  date: Number(order.date),
});

// COD Order
const placeOrder = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;

    if (!userId) {
      return res.json({ success: false, message: "You must be logged in as a customer to place an order." });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.json({ success: false, message: "User account not found. Please log in again." });
    }

    const newOrder = await prisma.order.create({
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

    await prisma.user.update({ where: { id: userId }, data: { cartData: {} } });
    await decrementStock(items);

    if (user.email) {
      await sendOrderConfirmationEmail(user.email, user.name, serializeOrder(newOrder));
    }

    res.json({ success: true, message: "Order Placed", order: serializeOrder(newOrder) });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Chapa Payment
const placeOrderChapa = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;

    if (!userId) {
      return res.json({ success: false, message: "You must be logged in as a customer to place an order." });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.json({ success: false, message: "User not found" });

    const newOrder = await prisma.order.create({
      data: {
        userId,
        items,
        address,
        amount,
        paymentMethod: "Chapa",
        payment: false,
        date: BigInt(Date.now()),
      },
    });

    const txRef = `marqato-${newOrder.id}-${Date.now()}`;

    await prisma.order.update({
      where: { id: newOrder.id },
      data: { txRef },
    });

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
        return_url: `${process.env.CLIENT_URL}/order-success?orderId=${newOrder.id}`,
        customization: {
          title: "Marqato Payment",
          description: `Order #${newOrder.id}`,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (chapaRes.data.status === "success") {
      res.json({ success: true, checkout_url: chapaRes.data.data.checkout_url });
    } else {
      await prisma.order.delete({ where: { id: newOrder.id } });
      res.json({ success: false, message: "Failed to initialize Chapa payment" });
    }
  } catch (error) {
    console.log(error?.response?.data || error.message);
    res.json({ success: false, message: error.message });
  }
};

// Chapa Webhook / Callback
const verifyChapaPayment = async (req, res) => {
  try {
    const { trx_ref } = req.query;
    const txRef = trx_ref || req.body.tx_ref;

    if (!txRef) return res.json({ success: false, message: "No tx_ref provided" });

    const verifyRes = await axios.get(
      `https://api.chapa.co/v1/transaction/verify/${txRef}`,
      { headers: { Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}` } }
    );

    if (verifyRes.data.status === "success" && verifyRes.data.data.status === "success") {
      const order = await prisma.order.findFirst({ where: { txRef } });
      if (order) {
        await prisma.order.update({
          where: { id: order.id },
          data: { payment: true },
        });
        await prisma.user.update({
          where: { id: order.userId },
          data: { cartData: {} },
        });

        await decrementStock(order.items);

        const updatedOrder = await prisma.order.findUnique({ where: { id: order.id } });
        const user = await prisma.user.findUnique({ where: { id: order.userId } });
        if (user?.email) {
          await sendOrderConfirmationEmail(user.email, user.name, serializeOrder(updatedOrder));
        }
      }
      res.json({ success: true });
    } else {
      res.json({ success: false, message: "Payment not verified" });
    }
  } catch (error) {
    console.log(error?.response?.data || error.message);
    res.json({ success: false, message: error.message });
  }
};

// Admin: All Orders
const allOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({ orderBy: { date: "desc" } });
    res.json({ success: true, orders: orders.map(serializeOrder) });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// User Orders
const userOrders = async (req, res) => {
  try {
    const { userId } = req.body;
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });
    res.json({ success: true, orders: orders.map(serializeOrder) });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Single Order by ID (used by OrderSuccess on page reload)
const singleOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.json({ success: false, message: "orderId required" });
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return res.json({ success: false, message: "Order not found" });
    res.json({ success: true, order: serializeOrder(order) });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Update Status
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    await prisma.order.update({ where: { id: orderId }, data: { status } });

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    const user = await prisma.user.findUnique({ where: { id: order.userId } });
    if (user?.email) {
      await sendStatusUpdateEmail(user.email, user.name, orderId, status);
    }

    res.json({ success: true, message: "Status Updated" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export {
  placeOrder,
  placeOrderChapa,
  verifyChapaPayment,
  allOrders,
  userOrders,
  singleOrder,
  updateStatus,
};