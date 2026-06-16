import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Orders from "./pages/Orders";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import AdminLayout from "./admin/AdminLayout";
import Dashboard from "./admin/pages/Dashboard";
import AdminProducts from "./admin/pages/Products";
import AdminOrders from "./admin/pages/Orders";
import AdminLogin from "./admin/pages/AdminLogin";

function App() {
  return (
    <Routes>
      {/* Admin */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders" element={<AdminOrders />} />
      </Route>

      {/* Storefront */}
      <Route
        path="/*"
        element={
          <div className="min-h-screen flex flex-col font-body text-ink bg-paper">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:id" element={<Product />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-success" element={<OrderSuccess />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
              </Routes>
            </main>
            <Footer />
          </div>
        }
      />
    </Routes>
  );
}

export default App;
