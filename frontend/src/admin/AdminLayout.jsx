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
  HiChevronLeft,
  HiChevronRight,
} from "react-icons/hi";
import { useTheme } from "./context/ThemeContext";

const NAV_LINKS = [
  { to: "/admin",            end: true, icon: HiOutlineViewGrid,     label: "Dashboard"  },
  { to: "/admin/products",              icon: HiOutlineCube,          label: "Products"   },
  { to: "/admin/orders",                icon: HiOutlineClipboardList, label: "Orders"     },
  { to: "/admin/settings",              icon: HiOutlineCog,           label: "Settings"   },
  { to: "/admin/customizer",            icon: HiOutlineColorSwatch,   label: "Customizer" },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  // Desktop: collapsed (icon-only) or expanded
  const [collapsed, setCollapsed] = useState(false);
  // Mobile: drawer open or closed
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("marqato_token");
    navigate("/admin/login");
  };

  const activeBg    = { background: "var(--admin-primary)" };
  const inactiveCol = { color: "var(--admin-sidebar-text)", opacity: 0.7 };

  /* ─── Sidebar inner content ─── */
  const SidebarInner = ({ isCollapsed, onClose }) => (
    <div
      className="flex flex-col h-full"
      style={{ background: "var(--admin-sidebar-bg)" }}
    >
      {/* Brand / toggle row */}
      <div
        className="flex items-center border-b px-4 py-5"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        {/* Logo icon */}
        {theme.logoUrl ? (
          <img
            src={theme.logoUrl}
            alt="logo"
            className="w-9 h-9 rounded-xl object-contain bg-white/10 shrink-0"
          />
        ) : (
          <span
            className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-sm shrink-0"
            style={{ background: "var(--admin-primary)" }}
          >
            {theme.brandName?.charAt(0) || "M"}
          </span>
        )}

        {/* Brand name — hidden when collapsed */}
        {!isCollapsed && (
          <div className="ml-3 overflow-hidden">
            <p
              className="text-base font-bold leading-none truncate"
              style={{ color: "var(--admin-sidebar-text)", fontFamily: "var(--admin-font)" }}
            >
              {theme.brandName}
            </p>
            <p
              className="text-[10px] uppercase tracking-wide mt-1"
              style={{ color: "var(--admin-sidebar-text)", opacity: 0.5 }}
            >
              Admin
            </p>
          </div>
        )}

        {/* Desktop collapse toggle */}
        {onClose == null && (
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="ml-auto p-1.5 rounded-lg hover:bg-white/10 transition-colors shrink-0"
            style={{ color: "var(--admin-sidebar-text)", opacity: 0.6 }}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <HiChevronRight size={16} /> : <HiChevronLeft size={16} />}
          </button>
        )}

        {/* Mobile close button */}
        {onClose != null && (
          <button
            onClick={onClose}
            className="ml-auto p-1.5 rounded-lg hover:bg-white/10 transition-colors shrink-0"
            style={{ color: "var(--admin-sidebar-text)", opacity: 0.6 }}
            aria-label="Close menu"
          >
            <HiX size={18} />
          </button>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-2 py-5 space-y-1">
        {NAV_LINKS.map(({ to, end, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => onClose?.()}
            className={({ isActive }) =>
              "flex items-center rounded-xl text-sm font-medium transition-colors " +
              (isCollapsed ? "justify-center px-0 py-3" : "gap-3 px-4 py-2.5") +
              (isActive ? " text-white" : " hover:bg-white/5")
            }
            style={({ isActive }) => (isActive ? activeBg : inactiveCol)}
            title={isCollapsed ? label : undefined}
          >
            <Icon size={20} className="shrink-0" />
            {!isCollapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className={
          "flex items-center mx-2 mb-5 rounded-xl text-sm font-medium transition-colors hover:bg-white/5 " +
          (isCollapsed ? "justify-center px-0 py-3" : "gap-3 px-4 py-2.5")
        }
        style={{ color: "var(--admin-sidebar-text)", opacity: 0.6 }}
        title={isCollapsed ? "Log out" : undefined}
      >
        <HiOutlineLogout size={20} className="shrink-0" />
        {!isCollapsed && <span>Log out</span>}
      </button>
    </div>
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
      {/* ── DESKTOP sidebar ── */}
      <aside
        className="hidden lg:flex lg:flex-col lg:shrink-0 overflow-hidden"
        style={{
          width: collapsed ? "64px" : "240px",
          transition: "width 0.25s ease",
        }}
      >
        <SidebarInner isCollapsed={collapsed} />
      </aside>

      {/* ── MOBILE backdrop ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── MOBILE drawer ── */}
      <aside
        className="fixed inset-y-0 left-0 z-50 w-64 flex flex-col lg:hidden"
        style={{
          transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.25s ease",
        }}
      >
        <SidebarInner isCollapsed={false} onClose={() => setMobileOpen(false)} />
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile top bar */}
        <header
          className="flex items-center gap-3 px-4 py-3 border-b lg:hidden"
          style={{
            background: "var(--admin-sidebar-bg)",
            borderColor: "rgba(255,255,255,0.08)",
          }}
        >
          <button
            onClick={() => setMobileOpen(true)}
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