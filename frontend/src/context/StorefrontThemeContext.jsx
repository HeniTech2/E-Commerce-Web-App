import { createContext, useContext, useEffect, useState } from "react";
import { getAdminSettings } from "../api";

const StorefrontThemeContext = createContext({});

export const SF_DEFAULTS = {
  // global background
  storefrontBgUrl: "",
  storefrontBgOverlay: 0.35,
  // colors & fonts
  sfPrimaryColor: "#4F46E5",
  sfFontFamily: "Inter",
  // announcement bar
  announcementEnabled: false,
  announcementText: "Free shipping on orders over 500 ETB 🎉",
  announcementBg: "#4F46E5",
  announcementColor: "#FFFFFF",
  // hero
  heroTitle: "Everything from the market,",
  heroTitleAccent: "nothing like the market.",
  heroSubtitle:
    "Hand-picked goods from Merkato's stalls — habesha wear, coffee ceremony sets, jewelry and leatherwork — shipped across Ethiopia and beyond.",
  heroBadge: "Addis Ababa · New for 2026",
  heroPrimaryBtn: "Browse products",
  heroSecondaryBtn: "Our story",
  heroBannerUrl: "",
  // sections
  featuredTitle: "Best pickings this week",
  categoryTitle: "Browse by category",

  // ── Navbar ───────────────────────────────────────────────
  navBg: "#FFFFFF",
  navText: "#1C1917",
  navLinkColor: "#1C1917",
  navLinkHover: "#4F46E5",

  // ── Per-section backgrounds ──────────────────────────────
  heroSectionBg: "",
  heroSectionColor: "",
  categorySectionBg: "",
  categorySectionColor: "",
  featuredSectionBg: "",
  featuredSectionColor: "",
  paymentSectionBg: "",
  paymentSectionColor: "",
  newsletterSectionBg: "",
  newsletterSectionColor: "",
};

// The last settings are remembered in the browser, so the shop shows your own
// colours and hero text immediately instead of flashing the defaults first.
const THEME_CACHE_KEY = "marqato_theme_cache_v1";

const readThemeCache = () => {
  try {
    const raw = localStorage.getItem(THEME_CACHE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
};

const buildTheme = (settings) => ({
  ...SF_DEFAULTS,
  ...settings,
  storefrontBgOverlay: parseFloat(
    settings.storefrontBgOverlay ?? SF_DEFAULTS.storefrontBgOverlay
  ),
  announcementEnabled:
    settings.announcementEnabled === "true" ||
    settings.announcementEnabled === true,
});

export const StorefrontThemeProvider = ({ children }) => {
  const [sfTheme, setSfTheme] = useState(() => {
    const cached = readThemeCache();
    return cached ? buildTheme(cached) : SF_DEFAULTS;
  });

  useEffect(() => {
    getAdminSettings()
      .then((data) => {
        if (data.success && data.settings) {
          setSfTheme(buildTheme(data.settings));
          try {
            localStorage.setItem(THEME_CACHE_KEY, JSON.stringify(data.settings));
          } catch {
            // Storage full or blocked — fine, we just skip the cache
          }
        }
      })
      .catch(() => {});
  }, []);

  return (
    <StorefrontThemeContext.Provider value={sfTheme}>
      {children}
    </StorefrontThemeContext.Provider>
  );
};

export const useStorefrontTheme = () => useContext(StorefrontThemeContext);