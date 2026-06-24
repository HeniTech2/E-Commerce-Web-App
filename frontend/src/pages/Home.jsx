import { useContext } from "react";
import { Link } from "react-router-dom";
import { HiArrowRight } from "react-icons/hi";
import { ShopContext } from "../context/ShopContext";
import { useStorefrontTheme, SF_DEFAULTS } from "../context/StorefrontThemeContext";
import ProductCard from "../components/ProductCard";
import DynamicSections from "../components/DynamicSections";

const categoryIcons = {
  habesha: "👗",
  coffee: "☕",
  jewelry: "💎",
  home: "🏠",
  leather: "👜",
};

// Helper: build section style from theme keys
const sectionStyle = (bgKey, colorKey, t, fallback = {}) => {
  if (t[bgKey]) {
    return {
      backgroundImage: `url('${t[bgKey]}')`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      ...fallback,
    };
  }
  if (t[colorKey]) return { background: t[colorKey], ...fallback };
  return fallback;
};

const Home = () => {
  const { products, categories, paymentProviders } = useContext(ShopContext);
  const sf = useStorefrontTheme();
  const t = { ...SF_DEFAULTS, ...sf };

  const bestsellers = products.filter((p) => p.bestseller).slice(0, 4);

  return (
    <div style={{ fontFamily: t.sfFontFamily || "inherit" }}>

      {/* ── Announcement bar ─────────────────────────────────── */}
      {t.announcementEnabled && t.announcementText && (
        <div
          className="w-full px-4 py-2.5 text-sm text-center font-medium"
          style={{ background: t.announcementBg, color: t.announcementColor }}
        >
          {t.announcementText}
        </div>
      )}

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section
        className="border-b border-border"
        style={sectionStyle("heroSectionBg", "heroSectionColor", t, { background: "var(--color-paper2, #F8FAFC)" })}
      >
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
          <div>
            {t.heroBadge && (
              <span
                className="inline-block text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wide"
                style={{ background: `${t.sfPrimaryColor}18`, color: t.sfPrimaryColor }}
              >
                {t.heroBadge}
              </span>
            )}
            <h1 className="font-display text-5xl md:text-6xl font-bold leading-[1.05] mt-4">
              {t.heroTitle}{" "}
              <span style={{ color: t.sfPrimaryColor }}>{t.heroTitleAccent}</span>
            </h1>
            {t.heroSubtitle && (
              <p className="text-stone mt-6 text-base md:text-lg max-w-md leading-relaxed">
                {t.heroSubtitle}
              </p>
            )}
            <div className="mt-8 flex items-center gap-4">
              <Link
                to="/shop"
                className="text-white px-7 py-3.5 rounded-xl font-semibold text-sm transition-colors shadow-card"
                style={{ background: t.sfPrimaryColor }}
              >
                {t.heroPrimaryBtn || "Browse products"}
              </Link>
              <Link
                to="/about"
                className="flex items-center gap-1.5 font-semibold text-sm hover:opacity-75 transition-opacity"
                style={{ color: t.sfPrimaryColor }}
              >
                {t.heroSecondaryBtn || "Our story"} <HiArrowRight />
              </Link>
            </div>
          </div>

          {t.heroBannerUrl ? (
            <div className="rounded-2xl overflow-hidden shadow-card">
              <img src={t.heroBannerUrl} alt="Hero banner" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {products[0] && <div className="self-start"><ProductCard product={products[0]} /></div>}
              {products[3] && <div className="self-end"><ProductCard product={products[3]} /></div>}
              {products[8] && <div className="col-span-2"><ProductCard product={products[8]} /></div>}
            </div>
          )}
        </div>
      </section>

      {/* ── Category cards ────────────────────────────────────── */}
      <section
        style={sectionStyle("categorySectionBg", "categorySectionColor", t)}
      >
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-3xl font-bold">
              {t.categoryTitle || "Browse by category"}
            </h2>
            <Link
              to="/shop"
              className="flex items-center gap-1.5 text-sm font-semibold hover:underline"
              style={{ color: t.sfPrimaryColor }}
            >
              View all <HiArrowRight />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {categories.map((c) => (
              <Link
                key={c.id}
                to={`/shop?cat=${c.id}`}
                className="group flex flex-col items-center gap-3 text-center bg-white border border-border rounded-2xl p-5 shadow-card hover:shadow-cardHover transition-all"
              >
                <span
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform"
                  style={{ background: `${t.sfPrimaryColor}18` }}
                >
                  {categoryIcons[c.id]}
                </span>
                <span className="font-display text-sm font-semibold">{c.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bestsellers ───────────────────────────────────────── */}
      <section
        style={sectionStyle("featuredSectionBg", "featuredSectionColor", t)}
      >
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-3xl font-bold">
              {t.featuredTitle || "Best pickings this week"}
            </h2>
            <Link
              to="/shop"
              className="flex items-center gap-1.5 text-sm font-semibold hover:underline"
              style={{ color: t.sfPrimaryColor }}
            >
              View all <HiArrowRight />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
            {bestsellers.map((p) => (
              <ProductCard key={p.id || p._id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Custom sections created in Admin Customizer ─────────── */}
      <DynamicSections />

      {/* ── Payment trust strip ───────────────────────────────── */}
      <section
        style={sectionStyle("paymentSectionBg", "paymentSectionColor", t, { background: "#1C1917" })}
      >
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-14 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-block bg-white/10 text-accent text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wide">
              Pay your way
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-3 text-white">
              Checkout with the wallets and banks you already use.
            </h2>
            <p className="text-stone-400 mt-3 max-w-md text-sm leading-relaxed">
              telebirr, CBE Birr, Awash Bank and Bank of Abyssinia — pick one at checkout and pay in seconds.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {paymentProviders.map((p) => (
              <div key={p.id} className="bg-white/10 rounded-xl p-4 flex flex-col gap-2">
                <span className="font-display text-lg font-semibold" style={{ color: p.color }}>{p.name}</span>
                <span className="text-stone-400 text-xs leading-relaxed">{p.note}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Newsletter ────────────────────────────────────────── */}
      <section
        style={sectionStyle("newsletterSectionBg", "newsletterSectionColor", t)}
      >
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-20 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold max-w-xl mx-auto">
            Get first pick of new arrivals from the market.
          </h2>
          <div className="mt-6 flex max-w-md mx-auto gap-2">
            <input
              type="email"
              placeholder="you@example.com"
              className="flex-1 border border-border bg-paper2 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2"
            />
            <button
              className="text-white px-6 py-3 rounded-xl text-sm font-semibold transition-colors"
              style={{ background: t.sfPrimaryColor }}
            >
              Join
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;