import { useStorefrontTheme } from "../context/StorefrontThemeContext";

const StorefrontBackground = ({ children }) => {
  const { storefrontBgUrl, storefrontBgOverlay } = useStorefrontTheme();

  if (!storefrontBgUrl) {
    return <>{children}</>;
  }

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      {/* Fixed background image */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          backgroundImage: `url('${storefrontBgUrl}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      />
      {/* White overlay for readability */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1,
          background: `rgba(255, 255, 255, ${storefrontBgOverlay ?? 0.35})`,
        }}
      />
      {/* Page content on top */}
      <div style={{ position: "relative", zIndex: 2 }}>
        {children}
      </div>
    </div>
  );
};

export default StorefrontBackground;