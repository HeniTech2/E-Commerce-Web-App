import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const DEFAULT_SECTIONS = [
  {
    id: "shop",
    title: "Shop",
    links: [
      { id: "all",     label: "All products",     href: "/shop" },
      { id: "habesha", label: "Habesha wear",      href: "/shop?cat=habesha" },
      { id: "coffee",  label: "Coffee & ceremony", href: "/shop?cat=coffee" },
      { id: "jewelry", label: "Jewelry",           href: "/shop?cat=jewelry" },
    ],
  },
  {
    id: "support",
    title: "Support",
    links: [
      { id: "contact", label: "Contact us",    href: "/contact" },
      { id: "orders",  label: "Track an order", href: "/orders" },
      { id: "about",   label: "Our story",     href: "/about" },
    ],
  },
];

const DEFAULT_BRAND = { logoUrl: "", brandName: "Marqato", logoText: "MQ" };

const Footer = () => {
  const [sections, setSections]         = useState(DEFAULT_SECTIONS);
  const [pageSections, setPageSections] = useState([]);
  const [brand, setBrand]               = useState(DEFAULT_BRAND);

  // Fetch footer sections
  useEffect(() => {
    fetch(`${BASE_URL}/api/customizer/footer`)
      .then((r) => r.json())
      .then((d) => { if (d.success && d.sections?.length) setSections(d.sections); })
      .catch(() => {});
  }, []);

  // Fetch page sections (custom content above footer)
  useEffect(() => {
    fetch(`${BASE_URL}/api/customizer/sections`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setPageSections(d.sections.filter((s) => s.isVisible)); })
      .catch(() => {});
  }, []);

  // Fetch brand/logo
  useEffect(() => {
    fetch(`${BASE_URL}/api/customizer/brand`)
      .then((r) => r.json())
      .then((d) => { if (d.success && d.brand) setBrand({ ...DEFAULT_BRAND, ...d.brand }); })
      .catch(() => {});
  }, []);

  // ── Logo mark (image or coloured badge) ─────────────────────────────────
  const FooterLogo = () => {
    if (brand.logoUrl) {
      return (
        <img
          src={brand.logoUrl}
          alt={brand.brandName}
          className="w-9 h-9 rounded-xl object-cover border border-white/20"
        />
      );
    }
    return (
      <span className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-display font-bold text-xs shrink-0">
        {brand.logoText || "MQ"}
      </span>
    );
  };

  return (
    <>
      {/* ── Custom page sections rendered above footer ──────────────────── */}
      {pageSections.length > 0 && (
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-12 space-y-12">
          {pageSections.map((section) => (
            <div
              key={section.id}
              className={`flex gap-8 ${
                section.type === "text_image" ? "flex-col md:flex-row items-center" : "flex-col"
              }`}
            >
              {/* Image block */}
              {section.imageUrl && (section.type === "image" || section.type === "text_image") && (
                <img
                  src={section.imageUrl}
                  alt={section.title}
                  className="rounded-2xl object-cover w-full md:w-1/2 max-h-72"
                />
              )}

              {/* Text block */}
              {(section.type === "text" || section.type === "text_image") && (
                <div className="flex-1">
                  {section.title && (
                    <h2 className="text-2xl font-bold font-display mb-3">{section.title}</h2>
                  )}
                  {section.body && (
                    <p className="text-stone-600 leading-relaxed">{section.body}</p>
                  )}
                </div>
              )}

              {/* Image-only title */}
              {section.type === "image" && section.title && (
                <h2 className="text-2xl font-bold font-display text-center">{section.title}</h2>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="bg-ink text-white mt-24">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">

          {/* Brand column — uses dynamic logo + brand name */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <FooterLogo />
              <span className="font-display text-xl font-bold">{brand.brandName || "Marqato"}</span>
            </div>
            <p className="text-stoneLight text-sm leading-relaxed max-w-xs">
              Goods from Addis Ababa's open-air market, brought to your door. Every piece made by
              hand, every story worth telling.
            </p>
          </div>

          {/* Dynamic footer sections */}
          {sections.map((section) => (
            <div key={section.id}>
              <h4 className="font-display text-sm font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-2 text-sm text-stoneLight">
                {(section.links || []).map((link) => (
                  <li key={link.id}>
                    <Link to={link.href} className="hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Payments column */}
          <div>
            <h4 className="font-display text-sm font-semibold mb-4">We accept</h4>
            <div className="flex flex-wrap gap-2">
              {["telebirr", "CBE Birr", "Awash Bank", "BoA"].map((p) => (
                <span
                  key={p}
                  className="border border-white/15 rounded-full px-3 py-1 text-xs text-stoneLight font-medium"
                >
                  {p}
                </span>
              ))}
            </div>
            <p className="text-stoneLight text-xs mt-4">Addis Ababa · Mon–Sat, 9:00–18:00</p>
          </div>
        </div>

        <div className="border-t border-white/10 py-5 text-center text-xs text-stoneLight">
          © {new Date().getFullYear()} {brand.brandName || "Marqato"} — made with care in Addis Ababa
        </div>
      </footer>
    </>
  );
};

export default Footer;