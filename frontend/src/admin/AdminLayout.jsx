import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  HiOutlineViewGrid,
  HiOutlineCube,
  HiOutlineClipboardList,
  HiOutlineLogout,
  HiOutlineCog,
  HiOutlineColorSwatch,
} from "react-icons/hi";
import { useTheme } from "./context/ThemeContext";

const AdminLayout = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

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
      {/* Sidebar */}
      <aside
        className="w-64 flex flex-col shrink-0"
        style={{ background: "var(--admin-sidebar-bg)" }}
      >
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
          {[
            { to: "/admin", end: true, icon: HiOutlineViewGrid, label: "Dashboard" },
            { to: "/admin/products", icon: HiOutlineCube, label: "Products" },
            { to: "/admin/orders", icon: HiOutlineClipboardList, label: "Orders" },
            { to: "/admin/settings", icon: HiOutlineCog, label: "Settings" },
            { to: "/admin/customizer", icon: HiOutlineColorSwatch, label: "Customizer" },
          ].map(({ to, end, icon: Icon, label }) => (
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
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;