import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { HiOutlineViewGrid, HiOutlineCube, HiOutlineClipboardList, HiOutlineLogout } from "react-icons/hi";

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
    isActive ? "bg-primary text-white" : "text-stoneLight hover:bg-white/5 hover:text-white"
  }`;

const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("marqato_token");
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen flex bg-paper2 font-body text-ink">
      <aside className="w-64 bg-ink text-white flex flex-col shrink-0">
        <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
          <span className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-display font-bold text-xs">MQ</span>
          <div>
            <p className="font-display text-lg font-bold leading-none">Marqato</p>
            <p className="text-[11px] uppercase tracking-wide text-stoneLight mt-1">Admin</p>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          <NavLink to="/admin" end className={linkClass}>
            <HiOutlineViewGrid size={18} /> Dashboard
          </NavLink>
          <NavLink to="/admin/products" className={linkClass}>
            <HiOutlineCube size={18} /> Products
          </NavLink>
          <NavLink to="/admin/orders" className={linkClass}>
            <HiOutlineClipboardList size={18} /> Orders
          </NavLink>
        </nav>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 mx-4 mb-6 rounded-xl text-sm font-medium text-stoneLight hover:bg-white/5 hover:text-white transition-colors"
        >
          <HiOutlineLogout size={18} /> Log out
        </button>
      </aside>
      <main className="flex-1 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
