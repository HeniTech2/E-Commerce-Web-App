import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  HiOutlineViewGrid,
  HiOutlineCube,
  HiOutlineClipboardList,
  HiOutlineLogout,
  HiOutlineCog,
  HiOutlineColorSwatch,
  HiMenu,
  HiX,
} from "react-icons/hi";
import { useTheme } from "./context/ThemeContext";

const NAV_ITEMS = [
  { to: "/admin", end: true, icon: HiOutlineViewGrid, label: "Dashboard" },
  { to: "/admin/products", icon: HiOutlineCube, label: "Products" },
  { to: "/admin/orders", icon: HiOutlineClipboardList, label: "Orders" },
  { to: "/admin/settings", icon: HiOutlineCog, label: "Settings" },
  { to: "/admin/customizer", icon: HiOutlineColorSwatch, label: "Customizer" },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change (mobile navigation)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Close sidebar on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  const handleLogout = () => {
    localStorage.removeItem("marqato_token");
    navigate("/admin/login");
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
      isActive ? "text-white" : "hover:bg-white/5"
    }`;

  const activeBg = { background: "var(--admin-primary)" };
  const inactiveColor = { color: "var(--admin-sidebar-text)", opacity: 0.7 };

  const SidebarContent = () => (
    <>
      {/* Brand */}
      <div
        className="flex items-center gap-3 px-6 py-6 border-b"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        {theme.logoUrl ? (
          <img
            src={theme.logoUrl}
            alt="logo"
            className="w-10 h-10 rounded-xl object-contain bg-white/10"
          />
        ) : (
          <span
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm"
            style={{ background: "var(--admin-primary)" }}
          >
            {theme.brandName?.charAt(0) || "M"}
          </span>
        )}
        <div>
          <p
            className="text-lg font-bold leading-none"
            style={{
              color: "var(--admin-sidebar-text)",
              fontFamily: "var(--admin-font)",
            }}
          >
            {theme.brandName}
          </p>
          <p
            className="text-[11px] uppercase tracking-wide mt-1"
            style={{ color: "var(--admin-sidebar-text)", opacity: 0.5 }}
          >
            Admin
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {NAV_ITEMS.map(({ to, end, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={linkClass}
            style={({ isActive }) => (isActive ? activeBg : inactiveColor)}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-2.5 mx-4 mb-6 rounded-xl text-sm font-medium transition-colors hover:bg-white/5"
        style={{ color: "var(--admin-sidebar-text)", opacity: 0.6 }}
      >
        <HiOutlineLogout size={18} /> Log out
      </button>
    </>
  );

  return (
    <div
      className="min-h-screen flex font-body text-ink"
      style={{
        background: "var(--admin-dash-bg)",
        backgroundImage: "var(--admin-bg-image)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        fontFamily: "var(--admin-font)",
        fontSize: "var(--admin-font-size)",
      }}
    >
      {/* ── Desktop Sidebar (hidden on mobile) ── */}
      <aside
        className="hidden md:flex w-64 flex-col shrink-0"
        style={{ background: "var(--admin-sidebar-bg)" }}
      >
        <SidebarContent />
      </aside>

      {/* ── Mobile Overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile Drawer Sidebar ── */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 flex flex-col
          md:hidden
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{ background: "var(--admin-sidebar-bg)" }}
        aria-label="Admin navigation"
      >
        {/* Close button inside drawer */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          style={{ color: "var(--admin-sidebar-text)" }}
          aria-label="Close menu"
        >
          <HiX size={20} />
        </button>

        <SidebarContent />
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col overflow-x-hidden min-w-0">
        {/* Mobile top bar with hamburger */}
        <header
          className="md:hidden flex items-center gap-3 px-4 py-3 border-b shrink-0"
          style={{
            background: "var(--admin-sidebar-bg)",
            borderColor: "rgba(255,255,255,0.08)",
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl hover:bg-white/10 transition-colors"
            style={{ color: "var(--admin-sidebar-text)" }}
            aria-label="Open menu"
            aria-expanded={sidebarOpen}
          >
            <HiMenu size={22} />
          </button>

          {/* Brand mark in top bar */}
          <div className="flex items-center gap-2">
            {theme.logoUrl ? (
              <img
                src={theme.logoUrl}
                alt="logo"
                className="w-7 h-7 rounded-lg object-contain bg-white/10"
              />
            ) : (
              <span
                className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white text-xs"
                style={{ background: "var(--admin-primary)" }}
              >
                {theme.brandName?.charAt(0) || "M"}
              </span>
            )}
            <span
              className="text-sm font-bold"
              style={{ color: "var(--admin-sidebar-text)" }}
            >
              {theme.brandName}
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;