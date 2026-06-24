import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getAdminSettings, saveAdminSetting } from "../../api";

const ThemeContext = createContext(null);

export const DEFAULT_THEME = {
  // ── Admin panel ──────────────────────────────────────────────
  primaryColor: "#4F46E5",
  accentColor: "#A5B4FC",
  sidebarBg: "#0F172A",
  sidebarText: "#FFFFFF",
  dashboardBg: "#F8FAFC",
  cardBg: "#FFFFFF",
  fontFamily: "Inter",
  fontSize: "14",
  borderRadius: "12",
  brandName: "Marqato",
  welcomeMsg: "Welcome back 👋",
  logoUrl: "",
  bgImageUrl: "",
  darkMode: false,

  // ── Storefront background ────────────────────────────────────
  storefrontBgUrl: "",
  storefrontBgOverlay: 0.35,

  // ── Storefront colors & fonts ────────────────────────────────
  sfPrimaryColor: "#4F46E5",
  sfFontFamily: "Inter",

  // ── Announcement bar ─────────────────────────────────────────
  announcementEnabled: false,
  announcementText: "Free shipping on orders over 500 ETB 🎉",
  announcementBg: "#4F46E5",
  announcementColor: "#FFFFFF",

  // ── Hero section ─────────────────────────────────────────────
  heroTitle: "Everything from the market,",
  heroTitleAccent: "nothing like the market.",
  heroSubtitle:
    "Hand-picked goods from Merkato's stalls — habesha wear, coffee ceremony sets, jewelry and leatherwork — shipped across Ethiopia and beyond.",
  heroBadge: "Addis Ababa · New for 2026",
  heroPrimaryBtn: "Browse products",
  heroSecondaryBtn: "Our story",
  heroBannerUrl: "",

  // ── Section titles ────────────────────────────────────────────
  featuredTitle: "Best pickings this week",
  categoryTitle: "Browse by category",

  // ── Navbar ───────────────────────────────────────────────────
  navBg: "#FFFFFF",
  navText: "#1C1917",
  navLinkColor: "#1C1917",
  navLinkHover: "#4F46E5",

  // ── Section backgrounds ───────────────────────────────────────
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

export const AVAILABLE_FONTS = [
  "Inter",
  "Plus Jakarta Sans",
  "Poppins",
  "Nunito",
  "Raleway",
  "DM Sans",
  "Lato",
  "Roboto",
  "Montserrat",
  "Open Sans",
];

const applyTheme = (theme) => {
  const root = document.documentElement;
  root.style.setProperty("--admin-primary", theme.primaryColor);
  root.style.setProperty("--admin-sidebar-bg", theme.sidebarBg);
  root.style.setProperty("--admin-sidebar-text", theme.sidebarText);
  root.style.setProperty("--admin-dash-bg", theme.dashboardBg);
  root.style.setProperty("--admin-card-bg", theme.cardBg);
  root.style.setProperty("--admin-font", theme.fontFamily);
  root.style.setProperty("--admin-font-size", `${theme.fontSize}px`);
  root.style.setProperty("--admin-radius", `${theme.borderRadius}px`);
  root.style.setProperty("--admin-accent", theme.accentColor);
  root.style.setProperty(
    "--admin-bg-image",
    theme.bgImageUrl ? `url('${theme.bgImageUrl}')` : "none"
  );
};

// Convert string values back to correct types after loading from DB
const coerceSettings = (raw) => {
  const s = { ...raw };
  if (s.storefrontBgOverlay !== undefined)
    s.storefrontBgOverlay = parseFloat(s.storefrontBgOverlay) || 0.35;
  s.announcementEnabled =
    s.announcementEnabled === "true" || s.announcementEnabled === true;
  s.darkMode = s.darkMode === "true" || s.darkMode === true;
  return s;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAdminSettings();
        if (data.success && data.settings) {
          // Only override keys that have a real non-empty value saved
          const overrides = {};
          Object.entries(data.settings).forEach(([k, v]) => {
            if (v !== "" && v !== null && v !== undefined) {
              overrides[k] = v;
            }
          });
          const merged = coerceSettings({ ...DEFAULT_THEME, ...overrides });
          setTheme(merged);
          applyTheme(merged);
        } else {
          applyTheme(DEFAULT_THEME);
        }
      } catch {
        applyTheme(DEFAULT_THEME);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const updateTheme = useCallback(
    async (key, value) => {
      const updated = { ...theme, [key]: value };
      setTheme(updated);
      applyTheme(updated);
      try {
        await saveAdminSetting(key, value);
      } catch (e) {
        console.error("Failed to save setting", e);
      }
    },
    [theme]
  );

  const resetTheme = useCallback(async () => {
    setTheme(DEFAULT_THEME);
    applyTheme(DEFAULT_THEME);
    try {
      await saveAdminSetting("__reset__", "true");
    } catch (e) {
      console.error("Failed to reset", e);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, resetTheme, loading }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);