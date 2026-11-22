import { useContext, useMemo } from "react";
import { Link } from "react-router-dom";
import { HiArrowRight, HiTruck, HiShieldCheck, HiSparkles } from "react-icons/hi";
import { ShopContext } from "../context/ShopContext";
import { useStorefrontTheme, SF_DEFAULTS } from "../context/StorefrontThemeContext";
import ProductCard from "../components/ProductCard";
import DynamicSections from "../components/DynamicSections";
import { optimize } from "../lib/img";

const categoryIcons = {
  habesha: "👗",
  coffee: "☕",
  jewelry: "💎",
  home: "🏠",
  leather: "👜",
};

const firstImage = (p) =>
  p ? (Array.isArray(p.image) ? p.image[0] : p.image) : undefined;

// Build section style from theme keys (used by the admin customizer)
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

const SectionHeader = ({ title, t }) => (
  <div className="mb-8 flex items-end justify-between">
    <h2 className="font-display text-3xl font-bold md:text-4xl">{title}</h2>
    <Link
      to="/shop"
      className="flex items-center gap-1.5 text-sm font-semibold hover:underline"
      style={{ color: t.sfPrimaryColor }}
    >
      View all <HiArrowRight />
    </Link>
  </div>
);

const Home = () => {
  const { products, categories, paymentProviders } = useContext(ShopContext);
  const sf = useStorefrontTheme();
  const t = { ...SF_DEFAULTS, ...sf };

  const bestsellers = products.filter((p) => p.bestseller).slice(0, 4);
  const featured = bestsellers.length > 0 ? bestsellers : products.slice(0, 4);

  // Hero image: admin banner first, then admin hero background, else a mosaic of product photos
  const heroImage = t.heroBannerUrl || t.heroSectionBg;
  const mosaic = products.map(firstImage).filter(Boolean).slice(0, 3);

  // Category photo = first product photo found in that category
  const categoryCards = useMemo(
    () =>
      categories.map((c) => ({
        ...c,
        image: firstImage(products.find((p) => p.category === c.id && firstImage(p))),
      })),
    [categories, products]
  );

  const storyImage = t.storyImageUrl || firstImage(products[1]) || firstImage(products[0]);

  return (
    <div style={{ fontFamily: t.sfFontFamily || "inherit" }}>
      {/* ── Announcement bar ─────────────────────────────────── */}
      {t.announcementEnabled && t.announcementText && (
        <div
          className="w-full px-4 py-2.5 text-center text-sm font-medium"
          style={{ background: t.announcementBg, color: t.announcementColor }}
        >
          {t.announcementText}
        </div>
      )}

      {/* ── Hero: full-width photo with text on top ───────────── */}
      <section
        className="relative isolate overflow-hidden text-white"
        style={{ background: t.heroSectionColor || "#0F172A" }}
      >
        {heroImage ? (
          <img
            src={optimize(heroImage, 1600)}
            alt=""
            fetchPriority="high"
            className="absolute inset-0 -z-10 h-full w-full object-cover"
          />
        ) : (
          mosaic.length > 0 && (
            <div className="absolute inset-0 -z-10 grid grid-cols-3">
              {mosaic.map((src, i) => (
                <img
                  key={i}
                  src={optimize(src, 700)}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ))}
            </div>
          )
        )}
        {/* Dark gradient so the text is always readable */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/75 via-black/35 to-black/20 md:bg-gradient-to-r md:from-black/75 md:via-black/40 md:to-black/10" />

        <div className="relative mx-auto flex min-h-[78vh] max-w-7xl items-end px-5 py-16 md:min-h-[85vh] md:items-center md:px-8 md:py-24">
          <div className="max-w-2xl">
            {t.heroBadge && (
              <span className="inline-block rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide backdrop-blur">
                {t.heroBadge}
              </span>
            )}
            <h1 className="mt-4 font-display text-4xl font-bold leading-[1.05] sm:text-5xl md:text-7xl">
              {t.heroTitle}{" "}
              <span className="italic text-white/80">{t.heroTitleAccent}</span>
            </h1>
            {t.heroSubtitle && (
              <p className="mt-6 max-w-lg text-base leading-relaxed text-white/85 md:text-lg">
                {t.heroSubtitle}
              </p>
            )}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/shop"
                className="rounded-xl px-7 py-3.5 text-sm font-semibold text-white shadow-cardHover transition-opacity hover:opacity-90"
                style={{ background: t.sfPrimaryColor }}
              >
                {t.heroPrimaryBtn || "Browse products"}
              </Link>
              <Link
                to="/about"
                className="flex items-center gap-1.5 rounded-xl border border-white/50 px-6 py-3.5 text-sm font-semibold backdrop-blur transition-colors hover:bg-white/10"
              >
                {t.heroSecondaryBtn || "Our story"} <HiArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust strip ───────────────────────────────────────── */}
      <section className="border-b border-border bg-white">
        <div className="mx-auto grid max-w-7xl gap-4 px-5 py-5 text-sm md:grid-cols-3 md:px-8">
          {[
            { icon: HiTruck, text: "Delivery across Ethiopia" },
            { icon: HiShieldCheck, text: "Pay with Chapa, CBE transfer or cash on delivery" },
            { icon: HiSparkles, text: "Handmade and carefully selected goods" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <Icon size={20} style={{ color: t.sfPrimaryColor }} />
              <span className="font-medium text-ink2">{text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Categories: photo cards ───────────────────────────── */}
      <section style={sectionStyle("categorySectionBg", "categorySectionColor", t)}>
        <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-20">
          <SectionHeader title={t.categoryTitle || "Browse by category"} t={t} />
          <div className="grid auto-rows-[180px] grid-cols-2 gap-3 md:auto-rows-[230px] md:grid-cols-4 md:gap-4">
            {categoryCards.map((c, i) => (
              <Link
                key={c.id}
                to={`/shop?cat=${c.id}`}
                className={`group relative overflow-hidden rounded-2xl bg-surface ${
                  i === 0 ? "col-span-2 row-span-2" : ""
                }`}
              >
                {c.image ? (
                  <img
                    src={optimize(c.image, i === 0 ? 900 : 500)}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primaryLight to-surface text-6xl">
                    {categoryIcons[c.id]}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-4 text-white md:p-5">
                  <div>
                    {c.seal && (
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-white/75">
                        {c.seal}
                      </span>
                    )}
                    <h3 className={`font-display font-bold ${i === 0 ? "text-2xl md:text-3xl" : "text-base md:text-lg"}`}>
                      {c.label}
                    </h3>
                  </div>
                  <HiArrowRight
                    size={20}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bestsellers ───────────────────────────────────────── */}
      <section style={sectionStyle("featuredSectionBg", "featuredSectionColor", t)}>
        <div className="mx-auto max-w-7xl px-5 pb-16 md:px-8 md:pb-20">
          <SectionHeader title={t.featuredTitle || "Best pickings this week"} t={t} />
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
            {featured.map((p) => (
              <ProductCard key={p.id || p._id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Story banner (full-width photo) ───────────────────── */}
      <section
        className="relative isolate overflow-hidden text-white"
        style={{ background: "#1C1917" }}
      >
        {storyImage && (
          <img
            src={optimize(storyImage, 1600)}
            alt=""
            loading="lazy"
            className="absolute inset-0 -z-10 h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 -z-10 bg-black/55" />
        <div className="relative mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl font-bold md:text-5xl">
              {t.storyTitle || "Made by hand. Chosen with care."}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/85 md:text-lg">
              {t.storySubtitle ||
                "Every piece comes from Ethiopian makers and markets. Find something that tells a story."}
            </p>
            <Link
              to="/about"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-ink transition-opacity hover:opacity-90"
            >
              Our story <HiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Custom sections created in Admin Customizer ─────────── */}
      <DynamicSections />

      {/* ── Payment trust strip ───────────────────────────────── */}
      <section
        style={sectionStyle("paymentSectionBg", "paymentSectionColor", t, {
          background: "#1C1917",
        })}
      >
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 md:grid-cols-2 md:px-8">
          <div>
            <span className="inline-block rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-accent">
              Pay your way
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold text-white md:text-4xl">
              Checkout with the wallets and banks you already use.
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-stone-400">
              telebirr, CBE Birr, Awash Bank and Bank of Abyssinia — pick one at
              checkout and pay in seconds.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {paymentProviders.map((p) => (
              <div key={p.id} className="flex flex-col gap-2 rounded-xl bg-white/10 p-4">
                <span className="font-display text-lg font-semibold" style={{ color: p.color }}>
                  {p.name}
                </span>
                <span className="text-xs leading-relaxed text-stone-400">{p.note}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Newsletter ────────────────────────────────────────── */}
      <section style={sectionStyle("newsletterSectionBg", "newsletterSectionColor", t)}>
        <div className="mx-auto max-w-7xl px-5 py-20 text-center md:px-8">
          <h2 className="mx-auto max-w-xl font-display text-3xl font-bold md:text-4xl">
            Get first pick of new arrivals from the market.
          </h2>
          <div className="mx-auto mt-6 flex max-w-md gap-2">
            <input
              type="email"
              placeholder="you@example.com"
              aria-label="Email address"
              className="flex-1 rounded-xl border border-border bg-paper2 px-4 py-3 text-sm outline-none focus:ring-2"
            />
            <button
              type="button"
              className="rounded-xl px-6 py-3 text-sm font-semibold text-white transition-colors"
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