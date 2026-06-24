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

export const updateProduct = (formData) =>
  fetch(`${BASE_URL}/api/product/update`, {
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

export const getOrderById = (orderId) =>
  api("/api/order/single", { method: "POST", body: JSON.stringify({ orderId }) });

export const getAllOrders = () =>
  api("/api/order/list", { method: "POST", body: JSON.stringify({}) });

export const updateOrderStatus = (orderId, status) =>
  api("/api/order/status", { method: "POST", body: JSON.stringify({ orderId, status }) });

// Profile
export const updateProfile = (name, email) =>
  api("/api/user/profile", { method: "POST", body: JSON.stringify({ name, email }) });

export const changePassword = (currentPassword, newPassword) =>
  api("/api/user/password", { method: "POST", body: JSON.stringify({ currentPassword, newPassword }) });

// Wishlist
export const getWishlist = (userId) =>
  api("/api/wishlist/get", { method: "POST", body: JSON.stringify({ userId }) });

export const toggleWishlistAPI = (userId, productId) =>
  api("/api/wishlist/toggle", { method: "POST", body: JSON.stringify({ userId, productId }) });

// ── Image keys — these are saved as item.image in the DB ─────────────────────
const IMAGE_KEYS = new Set([
  "logoUrl",
  "bgImageUrl",
  "storefrontBgUrl",
  "heroBannerUrl",
  "heroSectionBg",
  "categorySectionBg",
  "featuredSectionBg",
  "paymentSectionBg",
  "newsletterSectionBg",
]);

// ── Admin Settings ────────────────────────────────────────────────────────────
export const getAdminSettings = async () => {
  const data = await api("/api/content/list");
  if (!data.success) return { success: false };

  const settings = {};
  (data.content || []).forEach((item) => {
    if (!item.key.startsWith("admin_")) return;
    const k = item.key.replace("admin_", "");
    // Image fields are stored in item.image; text/color fields in item.body
    if (IMAGE_KEYS.has(k)) {
      settings[k] = item.image || "";
    } else {
      settings[k] = item.body ?? item.title ?? "";
    }
  });

  return { success: true, settings };
};

export const saveAdminSetting = async (key, value) => {
  // Reset: delete all admin_* keys
  if (key === "__reset__") {
    return api("/api/content/list").then(async (data) => {
      if (!data.success) return;
      const adminKeys = (data.content || [])
        .filter((c) => c.key.startsWith("admin_"))
        .map((c) => c.key);
      for (const k of adminKeys) {
        await api("/api/content/remove", {
          method: "POST",
          body: JSON.stringify({ key: k }),
        });
      }
    });
  }

  // Image keys are uploaded as multipart from Settings.jsx — skip here
  if (IMAGE_KEYS.has(key)) return;

  // Save text/color settings as body field
  return api("/api/content/save", {
    method: "POST",
    body: JSON.stringify({
      key: `admin_${key}`,
      body: String(value),
    }),
  });
};