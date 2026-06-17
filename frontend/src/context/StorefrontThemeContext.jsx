import { createContext, useContext, useEffect, useState } from "react";
import { getAdminSettings } from "../api";

const StorefrontThemeContext = createContext({});

export const SF_DEFAULTS = {
  // background
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
  // banner image (shown inside hero right side instead of product grid)
  heroBannerUrl: "",
  // sections
  featuredTitle: "Best pickings this week",
  categoryTitle: "Browse by category",
};

export const StorefrontThemeProvider = ({ children }) => {
  const [sfTheme, setSfTheme] = useState(SF_DEFAULTS);

  useEffect(() => {
    getAdminSettings()
      .then((data) => {
        if (data.success && data.settings) {
          setSfTheme({
            ...SF_DEFAULTS,
            ...data.settings,
            storefrontBgOverlay: parseFloat(
              data.settings.storefrontBgOverlay ?? SF_DEFAULTS.storefrontBgOverlay
            ),
            announcementEnabled:
              data.settings.announcementEnabled === "true" ||
              data.settings.announcementEnabled === true,
          });
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