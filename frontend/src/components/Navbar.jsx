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
  HiOutlineHeart,
} from "react-icons/hi";
import { ShopContext } from "../context/ShopContext";
import { useStorefrontTheme, SF_DEFAULTS } from "../context/StorefrontThemeContext";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const DEFAULT_LINKS = [
  { id: "home",    label: "Home",      href: "/",        end: true },
  { id: "shop",    label: "Shop",      href: "/shop" },
  { id: "about",   label: "Our Story", href: "/about" },
  { id: "contact", label: "Contact",   href: "/contact" },
];

const DEFAULT_BRAND = { logoUrl: "", brandName: "Marqato", logoText: "MQ" };

const Navbar = () => {
  const { cartCount, wishlist, token, logout } = useContext(ShopContext);
  const sf = useStorefrontTheme();
  const t = { ...SF_DEFAULTS, ...sf };

  const [menuOpen, setMenuOpen]   = useState(false);
  const [search, setSearch]       = useState("");
  const [links, setLinks]         = useState(DEFAULT_LINKS);
  const [brand, setBrand]         = useState(DEFAULT_BRAND);
  const navigate  = useNavigate();
  const location  = useLocation();

  const wishlistCount = wishlist?.length || 0;

  // Dynamic theme values
  const navBg        = t.navBg        || "#FFFFFF";
  const navText      = t.navText      || "#1C1917";
  const navLinkColor = t.navLinkColor || "#1C1917";
  const navLinkHover = t.navLinkHover || (t.sfPrimaryColor || "#4F46E5");

  // Fetch dynamic nav from backend
  useEffect(() => {
    fetch(`${BASE_URL}/api/customizer/nav`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.items?.length) {
          setLinks(
            d.items
              .filter((i) => i.isVisible)
              .map((i) => ({ id: i.id, label: i.label, href: i.href }))
          );
        }
      })
      .catch(() => {});
  }, []);

  // Fetch brand/logo from backend
  useEffect(() => {
    fetch(`${BASE_URL}/api/customizer/brand`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.brand) setBrand({ ...DEFAULT_BRAND, ...d.brand });
      })
      .catch(() => {});
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);
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

  // ── Logo rendering helper ─────────────────────────────────────────────────
  const LogoMark = () => {
    if (brand.logoUrl) {
      return (
        <img
          src={brand.logoUrl}
          alt={brand.brandName}
          className="w-9 h-9 rounded-xl object-cover border border-slate-100"
        />
      );
    }
    return (
      <span
        className="w-9 h-9 rounded-xl text-white flex items-center justify-center font-display font-bold text-xs shrink-0"
        style={{ background: t.sfPrimaryColor || "#4F46E5" }}
      >
        {brand.logoText || "MQ"}
      </span>
    );
  };

  return (
    <>
      <header
        className="sticky top-0 z-40 backdrop-blur-sm border-b border-border"
        style={{ background: navBg, color: navText }}
      >
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <LogoMark />
              <span className="font-display text-xl font-bold tracking-tight" style={{ color: navText }}>
                {brand.brandName || "Marqato"}
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-8">
              {links.map((l) => (
                <NavLink
                  key={l.id}
                  to={l.href}
                  end={!!l.end}
                  className="relative text-sm font-medium transition-colors"
                  style={({ isActive }) => ({
                    color: isActive ? navLinkHover : navLinkColor,
                  })}
                >
                  {l.label}
                </NavLink>
              ))}
            </nav>

            {/* Desktop right actions */}
            <div className="hidden md:flex items-center gap-2">
              <form
                onSubmit={submitSearch}
                className="flex items-center border border-border rounded-lg px-3.5 py-2 bg-paper2 focus-within:ring-2"
                style={{ "--tw-ring-color": `${t.sfPrimaryColor}40` }}
              >
                <HiOutlineSearch className="mr-2 shrink-0 opacity-40" size={16} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products"
                  className="bg-transparent outline-none text-sm w-36 placeholder:opacity-40"
                  style={{ color: navText }}
                />
              </form>

              {token ? (
                <>
                  <Link to="/profile"  className="p-2 rounded-lg hover:bg-black/5 transition-colors" style={{ color: navLinkColor }} title="Profile"><HiOutlineUser size={20} /></Link>
                  <Link to="/orders"   className="p-2 rounded-lg hover:bg-black/5 transition-colors" style={{ color: navLinkColor }} title="My orders"><HiOutlineClipboardList size={20} /></Link>
                  <Link to="/wishlist" className="relative p-2 rounded-lg hover:bg-black/5 transition-colors" style={{ color: navLinkColor }} title="Wishlist">
                    <HiOutlineHeart size={20} />
                    {wishlistCount > 0 && (
                      <span className="absolute top-0.5 right-0.5 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {wishlistCount > 99 ? "99+" : wishlistCount}
                      </span>
                    )}
                  </Link>
                  <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-black/5 transition-colors" style={{ color: navLinkColor }}><HiOutlineLogout size={20} /></button>
                </>
              ) : (
                <Link to="/login" className="p-2 rounded-lg hover:bg-black/5 transition-colors" style={{ color: navLinkColor }}><HiOutlineUser size={20} /></Link>
              )}

              <Link to="/cart" className="relative p-2 rounded-lg hover:bg-black/5 transition-colors" style={{ color: navLinkColor }}>
                <HiOutlineShoppingBag size={20} />
                {cartCount > 0 && (
                  <span
                    className="absolute top-0.5 right-0.5 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: t.sfPrimaryColor }}
                  >
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>
            </div>

            {/* Mobile right */}
            <div className="flex md:hidden items-center gap-1">
              <Link to="/cart" className="relative p-2 rounded-lg hover:bg-black/5 transition-colors" style={{ color: navLinkColor }}>
                <HiOutlineShoppingBag size={22} />
                {cartCount > 0 && (
                  <span
                    className="absolute top-0.5 right-0.5 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: t.sfPrimaryColor }}
                  >
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 rounded-lg hover:bg-black/5 transition-colors"
                style={{ color: navLinkColor }}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
              >
                {menuOpen ? <HiX size={22} /> : <HiOutlineMenu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`fixed top-16 left-0 right-0 z-30 md:hidden border-b border-border shadow-lg transition-all duration-200 ${
          menuOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
        style={{ background: navBg }}
      >
        <div className="max-w-7xl mx-auto px-5 py-5 flex flex-col gap-1">
          <form
            onSubmit={submitSearch}
            className="flex items-center border border-border rounded-xl px-3.5 py-2.5 bg-paper2 focus-within:ring-2 mb-3"
          >
            <HiOutlineSearch className="mr-2 shrink-0 opacity-40" size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products"
              className="bg-transparent outline-none text-sm w-full placeholder:opacity-40"
            />
          </form>

          {links.map((l) => (
            <NavLink
              key={l.id}
              to={l.href}
              end={!!l.end}
              onClick={() => setMenuOpen(false)}
              className="px-3 py-3 rounded-xl text-sm font-medium transition-colors"
              style={({ isActive }) => ({
                background: isActive ? `${navLinkHover}15` : "transparent",
                color: isActive ? navLinkHover : navLinkColor,
              })}
            >
              {l.label}
            </NavLink>
          ))}

          <div className="border-t border-border my-2" />

          {token ? (
            <>
              <Link to="/profile"  onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium hover:bg-black/5 transition-colors" style={{ color: navLinkColor }}><HiOutlineUser size={18} /> My profile</Link>
              <Link to="/orders"   onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium hover:bg-black/5 transition-colors" style={{ color: navLinkColor }}><HiOutlineClipboardList size={18} /> My orders</Link>
              <Link to="/wishlist" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium hover:bg-black/5 transition-colors" style={{ color: navLinkColor }}>
                <HiOutlineHeart size={18} /> Wishlist
                {wishlistCount > 0 && (
                  <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${t.sfPrimaryColor}20`, color: t.sfPrimaryColor }}>
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors w-full text-left"
              >
                <HiOutlineLogout size={18} /> Sign out
              </button>
            </>
          ) : (
            <Link to="/login" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium hover:bg-black/5 transition-colors" style={{ color: navLinkColor }}>
              <HiOutlineUser size={18} /> Sign in
            </Link>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;