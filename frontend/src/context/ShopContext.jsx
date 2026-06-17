import { createContext, useState, useEffect, useCallback } from "react";
import {
  fetchProducts,
  getCart,
  addToCartAPI,
  updateCartAPI,
  getUserOrders,
  placeOrderCOD,
  getWishlist,
  toggleWishlistAPI,
} from "../api";

export const ShopContext = createContext(null);

export const currency = "ETB";

export const categories = [
  { id: "habesha", label: "Habesha Wear", seal: "Heritage" },
  { id: "coffee", label: "Coffee & Ceremony", seal: "Original" },
  { id: "jewelry", label: "Jewelry", seal: "Handmade" },
  { id: "home", label: "Home & Decor", seal: "Curated" },
  { id: "leather", label: "Leather Goods", seal: "Crafted" },
];

export const stockStatus = (stock) => {
  if (stock <= 0) return { label: "Out of stock", dot: "stock-out", text: "text-danger" };
  if (stock <= 5) return { label: `Only ${stock} left`, dot: "stock-low", text: "text-warning" };
  return { label: "In stock", dot: "stock-in", text: "text-success" };
};

export const paymentProviders = [
  { id: "chapa", name: "Chapa (Card/Bank)", color: "#1DBF73", note: "Pay securely online — cards, telebirr, CBE & more." },
  { id: "cod", name: "Cash on Delivery", color: "#1a1a1a", note: "Pay when your order arrives." },
];

// Decode JWT to get user id
const parseToken = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.id;
  } catch {
    return null;
  }
};

export const ShopProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("marqato_token") || "");
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [cart, setCart] = useState({});
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]); // array of product ids

  const userId = token ? parseToken(token) : null;

  // ── Products ──────────────────────────────────────────────────
  const loadProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const data = await fetchProducts();
      if (data.success) setProducts(data.products);
    } catch (e) {
      console.error("Failed to load products", e);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  // ── Cart ──────────────────────────────────────────────────────
  const loadCart = useCallback(async () => {
    if (!userId) { setCart({}); return; }
    try {
      const data = await getCart(userId);
      if (data.success) setCart(data.cartData || {});
    } catch (e) {
      console.error("Failed to load cart", e);
    }
  }, [userId]);

  useEffect(() => { loadCart(); }, [loadCart]);

  const addToCart = async (itemId, size = "default") => {
    setCart((prev) => {
      const next = { ...prev };
      if (!next[itemId]) next[itemId] = {};
      next[itemId][size] = (next[itemId][size] || 0) + 1;
      return next;
    });
    if (userId) {
      await addToCartAPI(userId, itemId, size);
    }
  };

  const updateQty = async (itemId, size = "default", qty) => {
    setCart((prev) => {
      const next = { ...prev };
      if (!next[itemId]) next[itemId] = {};
      if (qty <= 0) {
        delete next[itemId][size];
        if (Object.keys(next[itemId]).length === 0) delete next[itemId];
      } else {
        next[itemId][size] = qty;
      }
      return next;
    });
    if (userId) {
      await updateCartAPI(userId, itemId, size, qty);
    }
  };

  const removeFromCart = (itemId, size = "default") => updateQty(itemId, size, 0);
  const clearCart = () => setCart({});

  const cartCount = Object.values(cart).reduce(
    (sum, sizes) => sum + Object.values(sizes).reduce((a, b) => a + b, 0),
    0
  );

  const cartTotal = Object.entries(cart).reduce((sum, [id, sizes]) => {
    const p = products.find((p) => p.id === id);
    const qty = Object.values(sizes).reduce((a, b) => a + b, 0);
    return sum + (p ? p.price * qty : 0);
  }, 0);

  const cartItems = Object.entries(cart).flatMap(([id, sizes]) =>
    Object.entries(sizes).map(([size, qty]) => {
      const p = products.find((p) => p.id === id);
      return { id, size, qty, product: p };
    })
  ).filter((item) => item.product);

  // ── Orders ────────────────────────────────────────────────────
  const loadOrders = useCallback(async () => {
    if (!userId) { setOrders([]); return; }
    try {
      const data = await getUserOrders(userId);
      if (data.success) setOrders(data.orders || []);
    } catch (e) {
      console.error("Failed to load orders", e);
    }
  }, [userId]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const placeOrder = async (orderData) => {
    const items = cartItems.map(({ id, size, qty, product }) => ({
      id,
      name: product.name,
      price: product.price,
      image: product.image?.[0] || "",
      size,
      quantity: qty,
    }));

    const address = {
      name: orderData.customer?.name || "",
      phone: orderData.customer?.phone || "",
      street: orderData.customer?.address || "",
      city: orderData.customer?.city || "Addis Ababa",
    };

    const amount = cartTotal + 150;

    if (userId) {
      const data = await placeOrderCOD(userId, items, amount, address);
      if (data.success) {
        clearCart();
        await loadOrders();
        return data.order;
      }
    } else {
      const order = {
        id: "MQ" + Date.now().toString().slice(-8),
        date: Date.now(),
        status: "Order Placed",
        items: cartItems.map(({ id, size, qty, product }) => ({
          id, size, qty,
          name: product.name,
          price: product.price,
          image: product.image?.[0] || "",
        })),
        amount: cartTotal + 150,
        ...orderData,
      };
      setOrders((prev) => [order, ...prev]);
      clearCart();
      return order;
    }
  };

  // ── Wishlist ──────────────────────────────────────────────────
  const loadWishlist = useCallback(async () => {
    if (!userId) { setWishlist([]); return; }
    try {
      const data = await getWishlist(userId);
      if (data.success) setWishlist(data.wishlist || []);
    } catch (e) {
      console.error("Failed to load wishlist", e);
    }
  }, [userId]);

  useEffect(() => { loadWishlist(); }, [loadWishlist]);

  const toggleWishlist = async (productId) => {
    if (!userId) return;
    // Optimistic update
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
    try {
      const data = await toggleWishlistAPI(userId, productId);
      if (data.success) setWishlist(data.wishlist);
    } catch (e) {
      // Revert on failure
      loadWishlist();
    }
  };

  const isWishlisted = (productId) => wishlist.includes(productId);

  // ── Auth ──────────────────────────────────────────────────────
  const login = (newToken) => {
    localStorage.setItem("marqato_token", newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("marqato_token");
    setToken("");
    setCart({});
    setOrders([]);
    setWishlist([]);
  };

  return (
    <ShopContext.Provider
      value={{
        // products
        products,
        productsLoading,
        reloadProducts: loadProducts,
        categories,
        // cart
        cart,
        cartItems,
        addToCart,
        updateQty,
        removeFromCart,
        clearCart,
        cartCount,
        cartTotal,
        // orders
        orders,
        placeOrder,
        reloadOrders: loadOrders,
        // wishlist
        wishlist,
        toggleWishlist,
        isWishlisted,
        reloadWishlist: loadWishlist,
        // auth
        token,
        userId,
        login,
        logout,
        // misc
        paymentProviders,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};