import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
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

const AdminLayout = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const navLinks = [
    { to: "/admin", end: true, icon: HiOutlineViewGrid, label: "Dashboard" },
    { to: "/admin/products", icon: HiOutlineCube, label: "Products" },
    { to: "/admin/orders", icon: HiOutlineClipboardList, label: "Orders" },
    { to: "/admin/settings", icon: HiOutlineCog, label: "Settings" },
    { to: "/admin/customizer", icon: HiOutlineColorSwatch, label: "Customizer" },
  ];

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
        {navLinks.map(({ to, end, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={linkClass}
            style={({ isActive }) => (isActive ? activeBg : inactiveColor)}
            onClick={() => setSidebarOpen(false)}
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
      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar (desktop: static | mobile: drawer) ── */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-30
          w-64 flex flex-col shrink-0
          transform transition-transform duration-200
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
        style={{ background: "var(--admin-sidebar-bg)" }}
      >
        <SidebarContent />
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header
          className="lg:hidden flex items-center gap-3 px-4 py-3 border-b"
          style={{
            background: "var(--admin-sidebar-bg)",
            borderColor: "rgba(255,255,255,0.08)",
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            style={{ color: "var(--admin-sidebar-text)" }}
            aria-label="Open menu"
          >
            <HiMenu size={22} />
          </button>
          <span
            className="text-base font-bold"
            style={{ color: "var(--admin-sidebar-text)" }}
          >
            {theme.brandName}
          </span>
        </header>

        <main className="flex-1 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;