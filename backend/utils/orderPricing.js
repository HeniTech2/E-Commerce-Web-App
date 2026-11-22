import prisma from "../prismaClient.js";

// Delivery fee added to every order. Keep in sync with the "150" shown in the frontend.
export const SHIPPING_FEE = Number(process.env.SHIPPING_FEE ?? 150);

const MAX_LINES = 50;
const MAX_QTY = 99;

// An error that is safe to show to the customer.
export class OrderError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "OrderError";
    this.status = status;
  }
}

const text = (value, max) => (typeof value === "string" ? value.trim().slice(0, max) : "");

const parseMaybeJson = (value) => {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

// Validate and clean the delivery address sent by the browser.
export const cleanAddress = (raw) => {
  const a = parseMaybeJson(raw);
  if (!a || typeof a !== "object") {
    throw new OrderError("Please enter your delivery address.");
  }

  const address = {
    name: text(a.name, 100),
    phone: text(a.phone, 20),
    street: text(a.street, 200),
    city: text(a.city, 80) || "Addis Ababa",
  };

  if (!address.name || !address.street) {
    throw new OrderError("Please enter your name and street address.");
  }
  if (!/^[0-9+\s-]{7,20}$/.test(address.phone)) {
    throw new OrderError("Please enter a valid phone number.");
  }
  return address;
};

// Build the order from the DATABASE, never from prices sent by the browser.
// The browser only decides WHICH products, WHICH size and HOW MANY.
export const priceOrder = async (rawItems) => {
  const list = parseMaybeJson(rawItems);

  if (!Array.isArray(list) || list.length === 0) {
    throw new OrderError("Your cart is empty.");
  }
  if (list.length > MAX_LINES) {
    throw new OrderError("Too many items in one order.");
  }

  // Merge duplicate product+size lines
  const lines = new Map();
  for (const raw of list) {
    const id = typeof raw?.id === "string" ? raw.id : typeof raw?.productId === "string" ? raw.productId : "";
    const quantity = Number(raw?.quantity ?? raw?.qty);
    const size = text(raw?.size, 30) || "default";

    if (!id || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QTY) {
      throw new OrderError("Invalid item in your cart.");
    }

    const key = `${id}::${size}`;
    const existing = lines.get(key);
    if (existing) existing.quantity += quantity;
    else lines.set(key, { id, size, quantity });
  }

  const ids = [...new Set([...lines.values()].map((l) => l.id))];
  const products = await prisma.product.findMany({ where: { id: { in: ids } } });
  const byId = new Map(products.map((p) => [p.id, p]));

  const items = [];
  const totalPerProduct = new Map();
  let subtotal = 0;

  for (const line of lines.values()) {
    const product = byId.get(line.id);
    if (!product) {
      throw new OrderError("A product in your cart is no longer available. Please refresh your cart.");
    }

    const hasSizes = Array.isArray(product.sizes) && product.sizes.length > 0;
    if (hasSizes && !product.sizes.includes(line.size)) {
      throw new OrderError(`Please choose a valid size for "${product.name}".`);
    }

    totalPerProduct.set(product.id, (totalPerProduct.get(product.id) || 0) + line.quantity);

    items.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: Array.isArray(product.image) ? product.image[0] || "" : "",
      size: hasSizes ? line.size : "default",
      quantity: line.quantity,
    });
    subtotal += product.price * line.quantity;
  }

  // Stock check (the real, safe reservation happens later in reserveStock)
  for (const [productId, total] of totalPerProduct) {
    const product = byId.get(productId);
    if (product.stock < total) {
      throw new OrderError(
        product.stock <= 0
          ? `"${product.name}" is sold out.`
          : `Only ${product.stock} of "${product.name}" left in stock.`,
        409
      );
    }
  }

  subtotal = Math.round(subtotal * 100) / 100;
  const amount = Math.round((subtotal + SHIPPING_FEE) * 100) / 100;

  return { items, subtotal, amount };
};

// Take stock inside a database transaction. The "gte" condition makes this safe
// when two customers buy the last item at the same moment: only one can win.
export const reserveStock = async (tx, items) => {
  for (const item of Array.isArray(items) ? items : []) {
    const productId = item.id || item.productId;
    const quantity = Number(item.quantity || item.qty || 1);
    if (!productId) continue;

    const result = await tx.product.updateMany({
      where: { id: productId, stock: { gte: quantity } },
      data: { stock: { decrement: quantity } },
    });

    if (result.count === 0) {
      throw new OrderError(`"${item.name || "An item"}" just sold out or does not have enough stock.`, 409);
    }
  }
};