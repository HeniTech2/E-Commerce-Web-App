const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const api = async (path, options = {}) => {
  const token = localStorage.getItem("marqato_token");
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { token } : {}),
      ...options.headers,
    },
    ...options,
  });
  return res.json();
};

// Auth
export const loginUser = (email, password) =>
  api("/api/user/login", { method: "POST", body: JSON.stringify({ email, password }) });

export const registerUser = (name, email, password) =>
  api("/api/user/register", { method: "POST", body: JSON.stringify({ name, email, password }) });

export const adminLogin = (email, password) =>
  api("/api/user/admin", { method: "POST", body: JSON.stringify({ email, password }) });

// Products
export const fetchProducts = () => api("/api/product/list");

export const addProduct = (formData) =>
  fetch(`${BASE_URL}/api/product/add`, {
    method: "POST",
    headers: { token: localStorage.getItem("marqato_token") },
    body: formData,
  }).then((r) => r.json());

export const removeProduct = (id) =>
  api("/api/product/remove", { method: "POST", body: JSON.stringify({ id }) });

// Cart
export const getCart = (userId) =>
  api("/api/cart/get", { method: "POST", body: JSON.stringify({ userId }) });

export const addToCartAPI = (userId, itemId, size = "default") =>
  api("/api/cart/add", { method: "POST", body: JSON.stringify({ userId, itemId, size }) });

export const updateCartAPI = (userId, itemId, size = "default", quantity) =>
  api("/api/cart/update", { method: "POST", body: JSON.stringify({ userId, itemId, size, quantity }) });

// Orders
export const placeOrderCOD = (userId, items, amount, address) =>
  api("/api/order/place", { method: "POST", body: JSON.stringify({ userId, items, amount, address }) });

export const placeOrderChapa = (userId, items, amount, address) =>
  api("/api/order/chapa", { method: "POST", body: JSON.stringify({ userId, items, amount, address }) });

export const getUserOrders = (userId) =>
  api("/api/order/userorders", { method: "POST", body: JSON.stringify({ userId }) });

export const getAllOrders = () =>
  api("/api/order/list", { method: "POST", body: JSON.stringify({}) });

export const updateOrderStatus = (orderId, status) =>
  api("/api/order/status", { method: "POST", body: JSON.stringify({ orderId, status }) });
