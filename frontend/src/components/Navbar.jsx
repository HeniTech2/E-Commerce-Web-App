import { useContext, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { HiOutlineShoppingBag, HiOutlineSearch, HiOutlineUser, HiOutlineMenu, HiX, HiOutlineLogout } from "react-icons/hi";
import { ShopContext } from "../context/ShopContext";

const navLinkClass = ({ isActive }) =>
  `relative text-sm font-medium transition-colors ${
    isActive ? "text-primary" : "text-ink hover:text-primary"
  }`;

const Navbar = () => {
  const { cartCount, token, logout } = useContext(ShopContext);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const submitSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/shop?q=${encodeURIComponent(search.trim())}`);
    setOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const links = [
    { to: "/", label: "Home" },
    { to: "/shop", label: "Shop" },
    { to: "/about", label: "Our Story" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-display font-bold text-xs">MQ</span>
            <span className="font-display text-xl font-bold tracking-tight">Marqato</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} className={navLinkClass} end={l.to === "/"}>
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <form onSubmit={submitSearch} className="hidden lg:flex items-center border border-border rounded-lg px-3.5 py-2 bg-paper2 focus-within:ring-2 focus-within:ring-primary/30">
              <HiOutlineSearch className="text-stoneLight mr-2" size={18} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products"
                className="bg-transparent outline-none text-sm w-40 placeholder:text-stoneLight"
              />
            </form>

            {token ? (
              <div className="hidden sm:flex items-center gap-1">
                <Link to="/orders" className="p-2 rounded-lg hover:bg-surface hover:text-primary transition-colors text-xs font-medium" title="My orders">
                  Orders
                </Link>
                <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-surface hover:text-danger transition-colors" title="Sign out" aria-label="Sign out">
                  <HiOutlineLogout size={20} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="hidden sm:flex p-2 rounded-lg hover:bg-surface hover:text-primary transition-colors" aria-label="Account">
                <HiOutlineUser size={20} />
              </Link>
            )}

            <Link to="/cart" className="relative p-2 rounded-lg hover:bg-surface hover:text-primary transition-colors" aria-label="Cart">
              <HiOutlineShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <button className="md:hidden p-2 rounded-lg hover:bg-surface" onClick={() => setOpen(!open)} aria-label="Menu">
              {open ? <HiX size={22} /> : <HiOutlineMenu size={22} />}
            </button>
          </div>
        </div>

        {open && (
          <div className="md:hidden pb-5 flex flex-col gap-4 border-t border-border pt-4">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} className={navLinkClass} end={l.to === "/"} onClick={() => setOpen(false)}>
                {l.label}
              </NavLink>
            ))}
            {token ? (
              <>
                <Link to="/orders" onClick={() => setOpen(false)} className="text-sm font-medium text-ink hover:text-primary">My orders</Link>
                <button onClick={() => { handleLogout(); setOpen(false); }} className="text-left text-sm font-medium text-danger">Sign out</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setOpen(false)} className="text-sm font-medium text-ink hover:text-primary">Sign in</Link>
            )}
            <form onSubmit={submitSearch} className="flex items-center border border-border rounded-lg px-3.5 py-2.5 bg-paper2 mt-2">
              <HiOutlineSearch className="text-stoneLight mr-2" size={18} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products"
                className="bg-transparent outline-none text-sm w-full placeholder:text-stoneLight"
              />
            </form>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
