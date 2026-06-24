import { useState, useRef } from "react";
import { useTheme, AVAILABLE_FONTS, DEFAULT_THEME } from "../context/ThemeContext";
import {
  HiOutlineColorSwatch,
  HiOutlinePhotograph,
  HiOutlineAdjustments,
  HiOutlineCog,
  HiOutlineRefresh,
  HiOutlineCheck,
  HiOutlineUpload,
  HiOutlineGlobe,
  HiOutlineSpeakerphone,
  HiOutlineTemplate,
  HiOutlinePencil,
  HiOutlineMenuAlt2,
} from "react-icons/hi";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Image-type setting keys (stored as multipart uploads, not JSON body)
const IMAGE_KEYS = new Set([
  "logoUrl",
  "bgImageUrl",
  "storefrontBgUrl",
  "heroBannerUrl",
  "heroSectionBg",
  "categorySectionBg",
  "featuredSectionBg",
  "paymentSectionBg",
  "newsletterSectionBg",
]);

// ── Reusable sub-components ───────────────────────────────────────────────────

const Section = ({ icon: Icon, title, subtitle, children }) => (
  <div
    className="rounded-2xl border p-6 mb-6"
    style={{ background: "var(--admin-card-bg)", borderColor: "#E2E8F0" }}
  >
    <div className="flex items-center gap-3 mb-5">
      <div className="relative w-9 h-9 flex-shrink-0">
        <div
          className="w-9 h-9 rounded-xl"
          style={{ background: "var(--admin-primary)", opacity: 0.15 }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon size={18} style={{ color: "var(--admin-primary)" }} />
        </div>
      </div>
      <div>
        <h2 className="font-semibold text-base">{title}</h2>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {children}
  </div>
);

const ColorRow = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
    <span className="text-sm text-slate-600">{label}</span>
    <div className="flex items-center gap-3">
      <span className="text-xs font-mono text-slate-400">{value}</span>
      <label className="cursor-pointer">
        <div
          className="w-9 h-9 rounded-xl border-2 border-white shadow-md transition-transform hover:scale-110"
          style={{ background: value }}
        />
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="sr-only" />
      </label>
    </div>
  </div>
);

const Field = ({ label, hint, children }) => (
  <div>
    <label className="text-sm font-medium text-slate-700 block mb-1.5">{label}</label>
    {children}
    {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
  </div>
);

const Input = ({ value, onChange, placeholder }) => (
  <input
    value={value ?? ""}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
  />
);

const Textarea = ({ value, onChange, placeholder, rows = 3 }) => (
  <textarea
    value={value ?? ""}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    rows={rows}
    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
  />
);

const ImageUploadBox = ({ label, hint, value, uploading, onUpload, onRemove }) => {
  const ref = useRef();
  return (
    <div>
      {value ? (
        <div className="relative rounded-xl overflow-hidden mb-3 h-32">
          <img src={value} alt={label} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <span className="text-white text-xs font-medium">{label}</span>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border-2 border-dashed border-slate-200 h-32 flex flex-col items-center justify-center text-slate-400 text-sm mb-3 gap-1">
          <HiOutlinePhotograph size={24} />
          <span>No image set</span>
        </div>
      )}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={() => ref.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          <HiOutlineUpload size={15} />
          {uploading ? "Uploading..." : "Upload image"}
        </button>
        <input
          ref={ref}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => e.target.files[0] && onUpload(e.target.files[0])}
        />
        {value && (
          <button
            onClick={onRemove}
            className="px-4 py-2 rounded-xl border border-red-200 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            Remove
          </button>
        )}
      </div>
      {hint && <p className="text-xs text-slate-400 mt-2">{hint}</p>}
    </div>
  );
};

// ── Section BG editor (image + color for one section) ────────────────────────
const SectionBgEditor = ({ label, bgKey, colorKey, theme, handle, uploadFile, uploading }) => (
  <div className="border border-slate-100 rounded-2xl p-4 mb-4">
    <p className="text-sm font-semibold text-slate-700 mb-3">{label}</p>
    <div className="mb-3">
      <p className="text-xs font-medium text-slate-600 mb-2">Background color</p>
      <div className="flex items-center gap-3">
        <label className="cursor-pointer">
          <div
            className="w-9 h-9 rounded-xl border-2 border-white shadow-md transition-transform hover:scale-110"
            style={{ background: theme[colorKey] || "#ffffff" }}
          />
          <input
            type="color"
            value={theme[colorKey] || "#ffffff"}
            onChange={(e) => handle(colorKey)(e.target.value)}
            className="sr-only"
          />
        </label>
        <span className="text-xs font-mono text-slate-400">{theme[colorKey] || "#ffffff"}</span>
        {theme[colorKey] && (
          <button onClick={() => handle(colorKey)("")} className="text-xs text-red-400 hover:text-red-600">
            ✕ Clear
          </button>
        )}
      </div>
    </div>
    <Field label="Background image" hint="Overrides color if set">
      <ImageUploadBox
        label={label}
        value={theme[bgKey] || ""}
        uploading={uploading}
        onUpload={(file) => uploadFile(file, bgKey)}
        onRemove={() => handle(bgKey)("")}
      />
    </Field>
  </div>
);

// ── Tab bar ───────────────────────────────────────────────────────────────────

const TABS = [
  { id: "admin", label: "Admin Panel" },
  { id: "storefront", label: "Storefront" },
];

// ── Main component ────────────────────────────────────────────────────────────

const Settings = () => {
  const { theme, updateTheme, resetTheme } = useTheme();
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tab, setTab] = useState("admin");
  const logoRef = useRef();

  const handle = (key) => (val) => {
    updateTheme(key, val);
    setSaved(false);
    // If clearing an image key, delete it from the server too
    if (val === "" && IMAGE_KEYS.has(key)) {
      fetch(`${BASE_URL}/api/content/remove`, {
        method: "POST",
        headers: { "Content-Type": "application/json", token: localStorage.getItem("marqato_token") },
        body: JSON.stringify({ key: `admin_${key}` }),
      }).catch(() => {});
    }
  };

  const handleSaveAll = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const uploadFile = async (file, settingKey) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("key", `admin_${settingKey}`);
      formData.append("title", settingKey);
      const token = localStorage.getItem("marqato_token");
      const res = await fetch(`${BASE_URL}/api/content/save`, {
        method: "POST",
        headers: { token },
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.content?.image) {
        await updateTheme(settingKey, data.content.image);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen p-8" style={{ background: "var(--admin-dash-bg)" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold font-display">Appearance Settings</h1>
          <p className="text-sm text-slate-500 mt-1">
            Customize your admin panel and storefront — changes apply instantly.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={resetTheme}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <HiOutlineRefresh size={16} /> Reset defaults
          </button>
          <button
            onClick={handleSaveAll}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: "var(--admin-primary)" }}
          >
            {saved ? <><HiOutlineCheck size={16} /> Saved!</> : "Save settings"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-slate-100 p-1 rounded-xl w-fit">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="px-5 py-2 rounded-lg text-sm font-medium transition-all"
            style={
              tab === t.id
                ? { background: "var(--admin-primary)", color: "#fff" }
                : { color: "#64748B" }
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════
          ADMIN PANEL TAB
      ══════════════════════════════════════════════════════════ */}
      {tab === "admin" && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* LEFT */}
          <div>
            <Section icon={HiOutlineCog} title="Brand & Identity">
              <div className="space-y-4">
                <Field label="Store name">
                  <Input value={theme.brandName} onChange={handle("brandName")} placeholder="Marqato" />
                </Field>
                <Field label="Welcome message">
                  <Input value={theme.welcomeMsg} onChange={handle("welcomeMsg")} placeholder="Welcome back 👋" />
                </Field>
                <Field label="Logo">
                  <div className="flex items-center gap-4">
                    {theme.logoUrl ? (
                      <img src={theme.logoUrl} alt="logo" className="w-14 h-14 rounded-xl object-contain border border-slate-200 bg-slate-50" />
                    ) : (
                      <div className="w-14 h-14 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xs">
                        No logo
                      </div>
                    )}
                    <button
                      onClick={() => logoRef.current?.click()}
                      disabled={uploading}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                      <HiOutlineUpload size={15} />
                      {uploading ? "Uploading..." : "Upload logo"}
                    </button>
                    <input
                      ref={logoRef}
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => e.target.files[0] && uploadFile(e.target.files[0], "logoUrl")}
                    />
                    {theme.logoUrl && (
                      <button onClick={() => handle("logoUrl")("")} className="text-xs text-red-500 hover:text-red-700">
                        Remove
                      </button>
                    )}
                  </div>
                </Field>
              </div>
            </Section>

            <Section icon={HiOutlineColorSwatch} title="Colors">
              <ColorRow label="Primary color" value={theme.primaryColor} onChange={handle("primaryColor")} />
              <ColorRow label="Accent color" value={theme.accentColor} onChange={handle("accentColor")} />
              <ColorRow label="Sidebar background" value={theme.sidebarBg} onChange={handle("sidebarBg")} />
              <ColorRow label="Sidebar text" value={theme.sidebarText} onChange={handle("sidebarText")} />
              <ColorRow label="Dashboard background" value={theme.dashboardBg} onChange={handle("dashboardBg")} />
              <ColorRow label="Card background" value={theme.cardBg} onChange={handle("cardBg")} />
            </Section>

            <Section icon={HiOutlineAdjustments} title="Typography">
              <div className="space-y-5">
                <Field label="Font family">
                  <select
                    value={theme.fontFamily}
                    onChange={(e) => handle("fontFamily")(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none bg-white"
                  >
                    {AVAILABLE_FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                  <p className="mt-2 text-base" style={{ fontFamily: theme.fontFamily }}>
                    Preview: The quick brown fox jumps over the lazy dog.
                  </p>
                </Field>
                <Field label={`Base font size: ${theme.fontSize}px`}>
                  <input
                    type="range" min="12" max="18" step="1"
                    value={theme.fontSize}
                    onChange={(e) => handle("fontSize")(e.target.value)}
                    className="w-full"
                    style={{ accentColor: "var(--admin-primary)" }}
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>12px (Small)</span><span>18px (Large)</span>
                  </div>
                </Field>
                <Field label={`Border radius: ${theme.borderRadius}px`}>
                  <input
                    type="range" min="0" max="24" step="2"
                    value={theme.borderRadius}
                    onChange={(e) => handle("borderRadius")(e.target.value)}
                    className="w-full"
                    style={{ accentColor: "var(--admin-primary)" }}
                  />
                  <div className="flex gap-3 mt-2">
                    {[0, 6, 12, 24].map((r) => (
                      <button
                        key={r}
                        onClick={() => handle("borderRadius")(String(r))}
                        className="w-12 h-8 border-2 text-xs transition-all"
                        style={{
                          borderRadius: `${r}px`,
                          borderColor: String(theme.borderRadius) === String(r) ? "var(--admin-primary)" : "#E2E8F0",
                          color: String(theme.borderRadius) === String(r) ? "var(--admin-primary)" : "#94A3B8",
                        }}
                      >
                        {r}px
                      </button>
                    ))}
                  </div>
                </Field>
              </div>
            </Section>
          </div>

          {/* RIGHT */}
          <div>
            <Section icon={HiOutlineGlobe} title="Storefront background" subtitle="Shown to customers on all pages">
              <div className="space-y-4">
                <ImageUploadBox
                  label="Storefront background"
                  hint="Recommended: 1920×1080px."
                  value={theme.storefrontBgUrl}
                  uploading={uploading}
                  onUpload={(file) => uploadFile(file, "storefrontBgUrl")}
                  onRemove={() => handle("storefrontBgUrl")("")}
                />
                {theme.storefrontBgUrl && (
                  <Field label={`Overlay opacity: ${Math.round((theme.storefrontBgOverlay ?? 0.35) * 100)}%`} hint="White overlay so text stays readable">
                    <input
                      type="range" min="0" max="0.9" step="0.05"
                      value={theme.storefrontBgOverlay ?? 0.35}
                      onChange={(e) => handle("storefrontBgOverlay")(parseFloat(e.target.value))}
                      className="w-full"
                      style={{ accentColor: "var(--admin-primary)" }}
                    />
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                      <span>0% (full image)</span><span>90% (almost white)</span>
                    </div>
                  </Field>
                )}
              </div>
            </Section>

            <Section icon={HiOutlinePhotograph} title="Admin panel background" subtitle="Only visible to you">
              <ImageUploadBox
                label="Admin background"
                hint="Recommended: 1920×1080px, max 2MB."
                value={theme.bgImageUrl}
                uploading={uploading}
                onUpload={(file) => uploadFile(file, "bgImageUrl")}
                onRemove={() => handle("bgImageUrl")("")}
              />
            </Section>

            {/* Live preview */}
            <div className="rounded-2xl border p-5" style={{ background: "var(--admin-card-bg)", borderColor: "#E2E8F0" }}>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Live preview</p>
              <div className="rounded-xl overflow-hidden mb-3" style={{ height: 120, position: "relative" }}>
                {theme.storefrontBgUrl ? (
                  <>
                    <img src={theme.storefrontBgUrl} alt="bg" className="w-full h-full object-cover" />
                    <div className="absolute inset-0" style={{ background: `rgba(255,255,255,${theme.storefrontBgOverlay ?? 0.35})` }} />
                  </>
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 text-xs">No storefront background</div>
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="font-bold text-sm" style={{ fontFamily: theme.fontFamily }}>{theme.brandName}</p>
                    <p className="text-xs text-slate-500">Your storefront</p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl p-4" style={{ background: "var(--admin-sidebar-bg)", borderRadius: "var(--admin-radius)" }}>
                <div className="flex items-center gap-2 mb-2">
                  {theme.logoUrl ? (
                    <img src={theme.logoUrl} alt="logo" className="w-6 h-6 rounded-lg object-contain" />
                  ) : (
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ background: "var(--admin-primary)" }}>
                      {theme.brandName?.charAt(0) || "M"}
                    </div>
                  )}
                  <span className="font-bold text-xs" style={{ color: "var(--admin-sidebar-text)", fontFamily: "var(--admin-font)" }}>
                    {theme.brandName}
                  </span>
                </div>
                {["Dashboard", "Products", "Settings"].map((item, i) => (
                  <div
                    key={item}
                    className="px-3 py-1 mb-1 text-xs rounded-lg"
                    style={{
                      background: i === 0 ? "var(--admin-primary)" : "transparent",
                      color: "var(--admin-sidebar-text)",
                      fontFamily: "var(--admin-font)",
                      opacity: i === 0 ? 1 : 0.6,
                      borderRadius: "var(--admin-radius)",
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          STOREFRONT TAB
      ══════════════════════════════════════════════════════════ */}
      {tab === "storefront" && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* LEFT */}
          <div>
            {/* Announcement bar */}
            <Section icon={HiOutlineSpeakerphone} title="Announcement Bar" subtitle="Shown at the very top of every page">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Enable announcement bar</span>
                  <button
                    onClick={() => handle("announcementEnabled")(!theme.announcementEnabled)}
                    className="relative w-11 h-6 rounded-full transition-colors"
                    style={{ background: theme.announcementEnabled ? "var(--admin-primary)" : "#E2E8F0" }}
                  >
                    <span
                      className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                      style={{ transform: theme.announcementEnabled ? "translateX(20px)" : "translateX(2px)" }}
                    />
                  </button>
                </div>
                {theme.announcementEnabled && (
                  <>
                    <Field label="Message">
                      <Input
                        value={theme.announcementText}
                        onChange={handle("announcementText")}
                        placeholder="Free shipping on orders over 500 ETB 🎉"
                      />
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                      <ColorRow label="Background" value={theme.announcementBg} onChange={handle("announcementBg")} />
                      <ColorRow label="Text color" value={theme.announcementColor} onChange={handle("announcementColor")} />
                    </div>
                    <div
                      className="rounded-xl px-4 py-2.5 text-sm text-center font-medium"
                      style={{ background: theme.announcementBg, color: theme.announcementColor }}
                    >
                      {theme.announcementText || "Your message here"}
                    </div>
                  </>
                )}
              </div>
            </Section>

            {/* Navbar colors */}
            <Section icon={HiOutlineMenuAlt2} title="Navbar" subtitle="Customer-facing navigation bar">
              <ColorRow label="Navbar background" value={theme.navBg || "#FFFFFF"} onChange={handle("navBg")} />
              <ColorRow label="Navbar text color" value={theme.navText || "#1C1917"} onChange={handle("navText")} />
              <ColorRow label="Nav link color" value={theme.navLinkColor || "#1C1917"} onChange={handle("navLinkColor")} />
              <ColorRow label="Nav link hover color" value={theme.navLinkHover || "#4F46E5"} onChange={handle("navLinkHover")} />
              {/* Live mini preview */}
              <div
                className="mt-4 rounded-xl px-4 py-3 flex items-center justify-between"
                style={{ background: theme.navBg || "#FFFFFF", border: "1px solid #E2E8F0" }}
              >
                <span className="font-bold text-sm" style={{ color: theme.navText || "#1C1917" }}>
                  {theme.brandName || "Marqato"}
                </span>
                <div className="flex gap-4">
                  {["Home", "Shop", "About"].map((l, i) => (
                    <span
                      key={l}
                      className="text-xs font-medium"
                      style={{ color: i === 0 ? theme.navLinkHover || "#4F46E5" : theme.navLinkColor || "#1C1917" }}
                    >
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            </Section>

            {/* Hero content */}
            <Section icon={HiOutlinePencil} title="Hero Section" subtitle="The big banner customers see first">
              <div className="space-y-4">
                <Field label="Badge text" hint="Small pill above the headline">
                  <Input value={theme.heroBadge} onChange={handle("heroBadge")} placeholder="Addis Ababa · New for 2026" />
                </Field>
                <Field label="Headline">
                  <Input value={theme.heroTitle} onChange={handle("heroTitle")} placeholder="Everything from the market," />
                </Field>
                <Field label="Headline accent" hint="Second part shown in primary color">
                  <Input value={theme.heroTitleAccent} onChange={handle("heroTitleAccent")} placeholder="nothing like the market." />
                </Field>
                <Field label="Subtitle">
                  <Textarea value={theme.heroSubtitle} onChange={handle("heroSubtitle")} placeholder="Short description under the headline" />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Primary button">
                    <Input value={theme.heroPrimaryBtn} onChange={handle("heroPrimaryBtn")} placeholder="Browse products" />
                  </Field>
                  <Field label="Secondary button">
                    <Input value={theme.heroSecondaryBtn} onChange={handle("heroSecondaryBtn")} placeholder="Our story" />
                  </Field>
                </div>
              </div>
            </Section>

            {/* Section titles */}
            <Section icon={HiOutlineTemplate} title="Section Titles">
              <div className="space-y-4">
                <Field label="Featured products heading">
                  <Input value={theme.featuredTitle} onChange={handle("featuredTitle")} placeholder="Best pickings this week" />
                </Field>
                <Field label="Categories heading">
                  <Input value={theme.categoryTitle} onChange={handle("categoryTitle")} placeholder="Browse by category" />
                </Field>
              </div>
            </Section>
          </div>

          {/* RIGHT */}
          <div>
            {/* Storefront Colors & Fonts */}
            <Section icon={HiOutlineColorSwatch} title="Storefront Colors & Fonts" subtitle="Applied on the customer-facing site">
              <ColorRow label="Primary color" value={theme.sfPrimaryColor} onChange={handle("sfPrimaryColor")} />
              <div className="py-3">
                <Field label="Font family">
                  <select
                    value={theme.sfFontFamily}
                    onChange={(e) => handle("sfFontFamily")(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none bg-white"
                  >
                    {AVAILABLE_FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                  <p className="mt-2 text-base" style={{ fontFamily: theme.sfFontFamily }}>
                    Preview: The quick brown fox jumps over the lazy dog.
                  </p>
                </Field>
              </div>
            </Section>

            {/* Hero Banner Image */}
            <Section icon={HiOutlinePhotograph} title="Hero Banner Image" subtitle="Shown on the right side of your hero section">
              <ImageUploadBox
                label="Hero banner"
                hint="Recommended: 800×600px. Replaces the product grid preview in the hero."
                value={theme.heroBannerUrl}
                uploading={uploading}
                onUpload={(file) => uploadFile(file, "heroBannerUrl")}
                onRemove={() => handle("heroBannerUrl")("")}
              />
            </Section>

            {/* Per-section backgrounds */}
            <Section icon={HiOutlineGlobe} title="Section Backgrounds" subtitle="Set a background image or color for each storefront section">
              <SectionBgEditor
                label="Hero Section"
                bgKey="heroSectionBg"
                colorKey="heroSectionColor"
                theme={theme}
                handle={handle}
                uploadFile={uploadFile}
                uploading={uploading}
              />
              <SectionBgEditor
                label="Categories Section"
                bgKey="categorySectionBg"
                colorKey="categorySectionColor"
                theme={theme}
                handle={handle}
                uploadFile={uploadFile}
                uploading={uploading}
              />
              <SectionBgEditor
                label="Bestsellers Section"
                bgKey="featuredSectionBg"
                colorKey="featuredSectionColor"
                theme={theme}
                handle={handle}
                uploadFile={uploadFile}
                uploading={uploading}
              />
              <SectionBgEditor
                label="Payment Strip"
                bgKey="paymentSectionBg"
                colorKey="paymentSectionColor"
                theme={theme}
                handle={handle}
                uploadFile={uploadFile}
                uploading={uploading}
              />
              <SectionBgEditor
                label="Newsletter Section"
                bgKey="newsletterSectionBg"
                colorKey="newsletterSectionColor"
                theme={theme}
                handle={handle}
                uploadFile={uploadFile}
                uploading={uploading}
              />
            </Section>

            {/* Live storefront preview */}
            <div className="rounded-2xl border p-5" style={{ background: "var(--admin-card-bg)", borderColor: "#E2E8F0" }}>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Hero preview</p>
              <div
                className="rounded-xl p-5 relative overflow-hidden"
                style={{
                  background: theme.heroSectionBg
                    ? `url('${theme.heroSectionBg}') center/cover`
                    : theme.heroSectionColor || (theme.storefrontBgUrl
                      ? `linear-gradient(rgba(255,255,255,${theme.storefrontBgOverlay ?? 0.35}), rgba(255,255,255,${theme.storefrontBgOverlay ?? 0.35})), url('${theme.storefrontBgUrl}') center/cover`
                      : "#F8FAFC"),
                  fontFamily: theme.sfFontFamily,
                }}
              >
                {theme.announcementEnabled && (
                  <div
                    className="text-xs text-center font-medium py-1.5 rounded-lg mb-3"
                    style={{ background: theme.announcementBg, color: theme.announcementColor }}
                  >
                    {theme.announcementText}
                  </div>
                )}
                <div
                  className="inline-block text-xs font-semibold px-2 py-1 rounded-full mb-2"
                  style={{ background: `${theme.sfPrimaryColor}20`, color: theme.sfPrimaryColor }}
                >
                  {theme.heroBadge || "Badge text"}
                </div>
                <p className="font-bold text-base leading-snug">
                  {theme.heroTitle || "Headline"}{" "}
                  <span style={{ color: theme.sfPrimaryColor }}>
                    {theme.heroTitleAccent || "accent"}
                  </span>
                </p>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{theme.heroSubtitle}</p>
                <div className="flex gap-2 mt-3">
                  <span
                    className="text-xs px-3 py-1.5 rounded-lg font-semibold text-white"
                    style={{ background: theme.sfPrimaryColor }}
                  >
                    {theme.heroPrimaryBtn || "Primary"}
                  </span>
                  <span className="text-xs px-3 py-1.5 rounded-lg font-semibold border border-slate-200">
                    {theme.heroSecondaryBtn || "Secondary"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;