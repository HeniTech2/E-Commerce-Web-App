import { useContext, useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  HiOutlineShoppingBag,
  HiOutlineSearch,
  HiOutlineUser,
  HiOutlineLogout,
  HiOutlineMenu,
  HiX,
  HiOutlineClipboardList,
} from "react-icons/hi";
import { ShopContext } from "../context/ShopContext";

const navLinkClass = ({ isActive }) =>
  `relative text-sm font-medium transition-colors ${
    isActive ? "text-primary" : "text-ink hover:text-primary"
  }`;

const Navbar = () => {
  const { cartCount, token, logout } = useContext(ShopContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const submitSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/shop?q=${encodeURIComponent(search.trim())}`);
      setSearch("");
      setMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/");
  };

  const links = [
    { to: "/", label: "Home", end: true },
    { to: "/shop", label: "Shop" },
    { to: "/about", label: "Our Story" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <span className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-display font-bold text-xs">MQ</span>
              <span className="font-display text-xl font-bold tracking-tight">Marqato</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-8">
              {links.map((l) => (
                <NavLink key={l.to} to={l.to} end={l.end} className={navLinkClass}>
                  {l.label}
                </NavLink>
              ))}
            </nav>

            {/* Desktop right actions */}
            <div className="hidden md:flex items-center gap-2">
              <form onSubmit={submitSearch} className="flex items-center border border-border rounded-lg px-3.5 py-2 bg-paper2 focus-within:ring-2 focus-within:ring-primary/30">
                <HiOutlineSearch className="text-stoneLight mr-2 shrink-0" size={16} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products"
                  className="bg-transparent outline-none text-sm w-36 placeholder:text-stoneLight"
                />
              </form>

              {token ? (
                <>
                  <Link to="/profile" className="p-2 rounded-lg hover:bg-surface hover:text-primary transition-colors" title="Profile" aria-label="Profile">
                    <HiOutlineUser size={20} />
                  </Link>
                  <Link to="/orders" className="p-2 rounded-lg hover:bg-surface hover:text-primary transition-colors" title="My orders" aria-label="Orders">
                    <HiOutlineClipboardList size={20} />
                  </Link>
                  <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-surface hover:text-danger transition-colors" title="Sign out" aria-label="Sign out">
                    <HiOutlineLogout size={20} />
                  </button>
                </>
              ) : (
                <Link to="/login" className="p-2 rounded-lg hover:bg-surface hover:text-primary transition-colors" aria-label="Sign in">
                  <HiOutlineUser size={20} />
                </Link>
              )}

              <Link to="/cart" className="relative p-2 rounded-lg hover:bg-surface hover:text-primary transition-colors" aria-label="Cart">
                <HiOutlineShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>
            </div>

            {/* Mobile right actions */}
            <div className="flex md:hidden items-center gap-1">
              <Link to="/cart" className="relative p-2 rounded-lg hover:bg-surface transition-colors" aria-label="Cart">
                <HiOutlineShoppingBag size={22} />
                {cartCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 rounded-lg hover:bg-surface transition-colors"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
              >
                {menuOpen ? <HiX size={22} /> : <HiOutlineMenu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-30 bg-ink/30 md:hidden"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile menu drawer */}
      <div className={`fixed top-16 left-0 right-0 z-30 md:hidden bg-white border-b border-border shadow-dropdown transition-all duration-200 ${menuOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"}`}>
        <div className="max-w-7xl mx-auto px-5 py-5 flex flex-col gap-1">

          {/* Search */}
          <form onSubmit={submitSearch} className="flex items-center border border-border rounded-xl px-3.5 py-2.5 bg-paper2 focus-within:ring-2 focus-within:ring-primary/30 mb-3">
            <HiOutlineSearch className="text-stoneLight mr-2 shrink-0" size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products"
              className="bg-transparent outline-none text-sm w-full placeholder:text-stoneLight"
            />
          </form>

          {/* Nav links */}
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `px-3 py-3 rounded-xl text-sm font-medium transition-colors ${isActive ? "bg-primaryLight text-primary" : "text-ink hover:bg-surface"}`
              }
            >
              {l.label}
            </NavLink>
          ))}

          <div className="border-t border-border my-2" />

          {/* Auth actions */}
          {token ? (
            <>
              <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-ink hover:bg-surface transition-colors">
                <HiOutlineUser size={18} /> My profile
              </Link>
              <Link to="/orders" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-ink hover:bg-surface transition-colors">
                <HiOutlineClipboardList size={18} /> My orders
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-danger hover:bg-red-50 transition-colors w-full text-left">
                <HiOutlineLogout size={18} /> Sign out
              </button>
            </>
          ) : (
            <Link to="/login" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-ink hover:bg-surface transition-colors">
              <HiOutlineUser size={18} /> Sign in
            </Link>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;