import { useState, useEffect, useRef } from "react";
import {
  HiOutlineMenu,
  HiOutlineViewGrid,
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineUpload,
  HiOutlinePhotograph,
  HiOutlineChevronUp,
  HiOutlineChevronDown,
  HiOutlineColorSwatch,
} from "react-icons/hi";
import { HiVideoCamera } from "react-icons/hi2";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const token = () => localStorage.getItem("marqato_token");

const api = async (path, opts = {}) => {
  const { headers: optHeaders, ...rest } = opts;
  const res = await fetch(`${BASE_URL}/api/customizer${path}`, {
    headers: { token: token(), ...optHeaders },
    ...rest,
  });
  return res.json();
};

const apiForm = async (path, formData) => {
  const res = await fetch(`${BASE_URL}/api/customizer${path}`, {
    method: "POST",
    headers: { token: token() },
    body: formData,
  });
  return res.json();
};

// ── Shared UI ─────────────────────────────────────────────────────────────────

const Card = ({ children, className = "" }) => (
  <div
    className={`rounded-2xl border p-5 mb-4 ${className}`}
    style={{ background: "var(--admin-card-bg)", borderColor: "#E2E8F0" }}
  >
    {children}
  </div>
);

const Btn = ({ onClick, children, variant = "default", size = "md", disabled, className = "" }) => {
  const base = "inline-flex items-center gap-1.5 font-medium rounded-xl transition-all disabled:opacity-50 cursor-pointer";
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm" };
  const variants = {
    default: "border border-slate-200 text-slate-600 hover:bg-slate-50",
    primary: "text-white",
    danger: "border border-red-200 text-red-500 hover:bg-red-50",
    ghost: "text-slate-500 hover:bg-slate-100",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      style={variant === "primary" ? { background: "var(--admin-primary)" } : {}}
    >
      {children}
    </button>
  );
};

const Input = ({ value, onChange, placeholder, className = "" }) => (
  <input
    value={value ?? ""}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className={`w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 ${className}`}
  />
);

const Textarea = ({ value, onChange, placeholder, rows = 3 }) => (
  <textarea
    value={value ?? ""}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    rows={rows}
    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 resize-none"
  />
);

const Badge = ({ children, color = "slate" }) => {
  const colors = {
    slate: "bg-slate-100 text-slate-600",
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-600",
    indigo: "text-white",
  };
  return (
    <span
      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${colors[color]}`}
      style={color === "indigo" ? { background: "var(--admin-primary)" } : {}}
    >
      {children}
    </span>
  );
};

const Toggle = ({ value, onChange }) => (
  <button
    onClick={() => onChange(!value)}
    className="relative w-10 h-5 rounded-full transition-colors shrink-0"
    style={{ background: value ? "var(--admin-primary)" : "#E2E8F0" }}
  >
    <span
      className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
      style={{ transform: value ? "translateX(20px)" : "translateX(2px)" }}
    />
  </button>
);

// ══════════════════════════════════════════════════════════════════════════════
//  LOGO / BRAND MANAGER
// ══════════════════════════════════════════════════════════════════════════════

const LogoManager = () => {
  const [brand, setBrand] = useState({ logoUrl: "", brandName: "Marqato", logoText: "MQ" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ brandName: "", logoText: "", logoUrl: "" });
  const [previewFile, setPreviewFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const fileRef = useRef();

  const load = async () => {
    setLoading(true);
    const d = await api("/brand");
    if (d.success && d.brand) {
      setBrand(d.brand);
      setForm({ brandName: d.brand.brandName, logoText: d.brand.logoText, logoUrl: d.brand.logoUrl });
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }; }, [previewUrl]);

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const removeImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewFile(null);
    setPreviewUrl("");
    setForm((p) => ({ ...p, logoUrl: "" }));
  };

  const save = async () => {
    setSaving(true);
    const fd = new FormData();
    fd.append("brandName", form.brandName);
    fd.append("logoText", form.logoText);
    if (previewFile) {
      fd.append("logo", previewFile);
    } else if (!form.logoUrl && brand.logoUrl) {
      fd.append("removeImage", "true");
    }
    const d = await apiForm("/brand/update", fd);
    if (d.success) {
      setBrand(d.brand);
      setForm({ brandName: d.brand.brandName, logoText: d.brand.logoText, logoUrl: d.brand.logoUrl });
      setPreviewFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
    setSaving(false);
  };

  const currentLogoDisplay = previewUrl || form.logoUrl;
  if (loading) return <div className="text-sm text-slate-400 py-8 text-center">Loading…</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold">Logo &amp; Brand</h2>
          <p className="text-xs text-slate-400 mt-0.5">Upload your logo image and set the brand name shown across the storefront</p>
        </div>
      </div>
      <Card>
        <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-100">
          <p className="text-xs text-slate-400 mb-3 font-medium uppercase tracking-wide">Preview</p>
          <div className="flex items-center gap-2.5">
            {currentLogoDisplay ? (
              <img src={currentLogoDisplay} alt="logo" className="w-9 h-9 rounded-xl object-cover border border-slate-200" />
            ) : (
              <span className="w-9 h-9 rounded-xl text-white flex items-center justify-center font-bold text-xs shrink-0" style={{ background: "var(--admin-primary)" }}>
                {form.logoText || "MQ"}
              </span>
            )}
            <span className="font-bold text-lg tracking-tight">{form.brandName || "Marqato"}</span>
          </div>
        </div>
        <div className="space-y-5">
          <div>
            <label className="text-xs text-slate-500 mb-2 block font-medium">Logo image (replaces text badge)</label>
            {currentLogoDisplay ? (
              <div className="flex items-center gap-3 mb-3">
                <img src={currentLogoDisplay} alt="logo" className="w-16 h-16 rounded-xl object-cover border border-slate-200" />
                <div className="flex flex-col gap-2">
                  <Btn size="sm" onClick={() => fileRef.current?.click()}><HiOutlineUpload size={13} /> Change image</Btn>
                  <Btn size="sm" variant="danger" onClick={removeImage}><HiOutlineX size={13} /> Remove image</Btn>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-200 rounded-xl h-24 flex flex-col items-center justify-center text-slate-400 text-sm mb-3 cursor-pointer hover:border-indigo-300 hover:text-indigo-400 transition-colors gap-1" onClick={() => fileRef.current?.click()}>
                <HiOutlinePhotograph size={22} />
                <span>Click to upload logo</span>
                <span className="text-xs">PNG, JPG, SVG recommended</span>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={onFileChange} />
            <p className="text-xs text-slate-400">When no image is set, a coloured badge with the text below is shown instead.</p>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block font-medium">Badge text (fallback, 2–4 chars)</label>
            <Input value={form.logoText} onChange={(v) => setForm((p) => ({ ...p, logoText: v }))} placeholder="MQ" className="max-w-xs" />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block font-medium">Brand name</label>
            <Input value={form.brandName} onChange={(v) => setForm((p) => ({ ...p, brandName: v }))} placeholder="Marqato" className="max-w-xs" />
          </div>
          <div className="flex gap-2 pt-2">
            <Btn variant="primary" onClick={save} disabled={saving}>
              <HiOutlineCheck size={14} /> {saving ? "Saving…" : saved ? "Saved!" : "Save changes"}
            </Btn>
          </div>
        </div>
      </Card>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
//  NAV MANAGER
// ══════════════════════════════════════════════════════════════════════════════

const NavManager = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [adding, setAdding] = useState(false);
  const [newItem, setNewItem] = useState({ label: "", href: "" });

  const load = async () => { setLoading(true); const d = await api("/nav"); if (d.success) setItems(d.items); setLoading(false); };
  useEffect(() => { load(); }, []);

  const startEdit = (item) => { setEditId(item.id); setEditData({ label: item.label, href: item.href }); };
  const cancelEdit = () => { setEditId(null); setEditData({}); };

  const saveEdit = async () => {
    const d = await api("/nav/update", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editId, ...editData }) });
    if (d.success) { setItems((prev) => prev.map((i) => (i.id === editId ? d.item : i))); cancelEdit(); }
    else alert(d.message || "Save failed");
  };

  const remove = async (id) => {
    if (!confirm("Delete this nav item?")) return;
    const d = await api("/nav/delete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    if (d.success) setItems((prev) => prev.filter((i) => i.id !== id));
    else alert(d.message || "Delete failed");
  };

  const toggleVisible = async (item) => {
    const d = await api("/nav/update", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: item.id, isVisible: !item.isVisible }) });
    if (d.success) setItems((prev) => prev.map((i) => (i.id === item.id ? d.item : i)));
  };

  const move = async (index, dir) => {
    const arr = [...items]; const swapIdx = index + dir;
    if (swapIdx < 0 || swapIdx >= arr.length) return;
    [arr[index], arr[swapIdx]] = [arr[swapIdx], arr[index]]; setItems(arr);
    await api("/nav/reorder", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: arr.map((i) => i.id) }) });
  };

  const addItem = async () => {
    if (!newItem.label || !newItem.href) return alert("Label and link are required");
    const d = await api("/nav/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...newItem, order: items.length }) });
    if (d.success) { setItems((prev) => [...prev, d.item]); setNewItem({ label: "", href: "" }); setAdding(false); }
    else alert(d.message || "Create failed");
  };

  if (loading) return <div className="text-sm text-slate-400 py-8 text-center">Loading…</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold">Navigation Items</h2>
          <p className="text-xs text-slate-400 mt-0.5">Reorder, toggle visibility, edit labels and links</p>
        </div>
        <Btn variant="primary" onClick={() => setAdding(true)}><HiOutlinePlus size={15} /> Add item</Btn>
      </div>
      {adding && (
        <Card>
          <p className="text-sm font-semibold mb-3">New nav item</p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div><label className="text-xs text-slate-500 mb-1 block">Label</label><Input value={newItem.label} onChange={(v) => setNewItem((p) => ({ ...p, label: v }))} placeholder="e.g. Sale" /></div>
            <div><label className="text-xs text-slate-500 mb-1 block">Link (href)</label><Input value={newItem.href} onChange={(v) => setNewItem((p) => ({ ...p, href: v }))} placeholder="/sale" /></div>
          </div>
          <div className="flex gap-2">
            <Btn variant="primary" onClick={addItem}><HiOutlineCheck size={14} /> Save</Btn>
            <Btn onClick={() => { setAdding(false); setNewItem({ label: "", href: "" }); }}><HiOutlineX size={14} /> Cancel</Btn>
          </div>
        </Card>
      )}
      {items.length === 0 && !adding && <div className="text-center py-12 text-slate-400 text-sm">No nav items yet. Add one above.</div>}
      <div className="space-y-2">
        {items.map((item, idx) => (
          <Card key={item.id} className="!p-4 !mb-2">
            {editId === item.id ? (
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-slate-500 mb-1 block">Label</label><Input value={editData.label} onChange={(v) => setEditData((p) => ({ ...p, label: v }))} /></div>
                <div><label className="text-xs text-slate-500 mb-1 block">Link (href)</label><Input value={editData.href} onChange={(v) => setEditData((p) => ({ ...p, href: v }))} /></div>
                <div className="col-span-2 flex gap-2">
                  <Btn variant="primary" size="sm" onClick={saveEdit}><HiOutlineCheck size={13} /> Save</Btn>
                  <Btn size="sm" onClick={cancelEdit}><HiOutlineX size={13} /> Cancel</Btn>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => move(idx, -1)} disabled={idx === 0} className="p-0.5 hover:text-indigo-500 disabled:opacity-20 transition-colors"><HiOutlineChevronUp size={14} /></button>
                  <button onClick={() => move(idx, 1)} disabled={idx === items.length - 1} className="p-0.5 hover:text-indigo-500 disabled:opacity-20 transition-colors"><HiOutlineChevronDown size={14} /></button>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p className="text-xs text-slate-400 truncate">{item.href}</p>
                </div>
                <Badge color={item.isVisible ? "green" : "red"}>{item.isVisible ? "Visible" : "Hidden"}</Badge>
                <div className="flex items-center gap-1">
                  <button onClick={() => toggleVisible(item)} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400" title={item.isVisible ? "Hide" : "Show"}>{item.isVisible ? <HiOutlineEye size={16} /> : <HiOutlineEyeOff size={16} />}</button>
                  <button onClick={() => startEdit(item)} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400"><HiOutlinePencil size={16} /></button>
                  <button onClick={() => remove(item.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors"><HiOutlineTrash size={16} /></button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
//  FOOTER MANAGER
// ══════════════════════════════════════════════════════════════════════════════

const FooterManager = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingSection, setAddingSection] = useState(false);
  const [newSection, setNewSection] = useState("");
  const [editSection, setEditSection] = useState(null);
  const [editSectionTitle, setEditSectionTitle] = useState("");
  const [addingLink, setAddingLink] = useState(null);
  const [newLink, setNewLink] = useState({ label: "", href: "" });
  const [editLink, setEditLink] = useState(null);
  const [editLinkData, setEditLinkData] = useState({});

  const load = async () => { setLoading(true); const d = await api("/footer"); if (d.success) setSections(d.sections); setLoading(false); };
  useEffect(() => { load(); }, []);

  const createSection = async () => {
    if (!newSection.trim()) return;
    const d = await api("/footer/section/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: newSection, order: sections.length }) });
    if (d.success) { setSections((p) => [...p, d.section]); setNewSection(""); setAddingSection(false); }
    else alert(d.message || "Create failed");
  };

  const startEditSection = (section) => { setEditSection(section.id); setEditSectionTitle(section.title); };

  const saveSection = async (id) => {
    const d = await api("/footer/section/update", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, title: editSectionTitle }) });
    if (d.success) { setSections((p) => p.map((s) => (s.id === id ? { ...d.section, links: s.links } : s))); setEditSection(null); }
    else alert(d.message || "Save failed");
  };

  const deleteSection = async (id) => {
    if (!confirm("Delete this footer section and all its links?")) return;
    const d = await api("/footer/section/delete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    if (d.success) setSections((p) => p.filter((s) => s.id !== id));
    else alert(d.message || "Delete failed");
  };

  const createLink = async (sectionId) => {
    if (!newLink.label || !newLink.href) return alert("Label and link are required");
    const section = sections.find((s) => s.id === sectionId);
    const d = await api("/footer/link/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sectionId, ...newLink, order: section?.links?.length ?? 0 }) });
    if (d.success) { setSections((p) => p.map((s) => s.id === sectionId ? { ...s, links: [...(s.links || []), d.link] } : s)); setNewLink({ label: "", href: "" }); setAddingLink(null); }
    else alert(d.message || "Create failed");
  };

  const startEditLink = (link) => { setEditLink(link.id); setEditLinkData({ label: link.label, href: link.href }); };

  const saveLink = async () => {
    const d = await api("/footer/link/update", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editLink, ...editLinkData }) });
    if (d.success) { setSections((p) => p.map((s) => ({ ...s, links: (s.links || []).map((l) => (l.id === editLink ? d.link : l)) }))); setEditLink(null); }
    else alert(d.message || "Save failed");
  };

  const deleteLink = async (id, sectionId) => {
    if (!confirm("Delete this link?")) return;
    const d = await api("/footer/link/delete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    if (d.success) setSections((p) => p.map((s) => s.id === sectionId ? { ...s, links: s.links.filter((l) => l.id !== id) } : s));
    else alert(d.message || "Delete failed");
  };

  if (loading) return <div className="text-sm text-slate-400 py-8 text-center">Loading…</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold">Footer Sections</h2>
          <p className="text-xs text-slate-400 mt-0.5">Manage footer columns and their links</p>
        </div>
        <Btn variant="primary" onClick={() => setAddingSection(true)}><HiOutlinePlus size={15} /> Add section</Btn>
      </div>
      {addingSection && (
        <Card>
          <p className="text-sm font-semibold mb-3">New footer section</p>
          <Input value={newSection} onChange={setNewSection} placeholder="e.g. Company" className="mb-3" />
          <div className="flex gap-2">
            <Btn variant="primary" onClick={createSection}><HiOutlineCheck size={14} /> Create</Btn>
            <Btn onClick={() => { setAddingSection(false); setNewSection(""); }}><HiOutlineX size={14} /> Cancel</Btn>
          </div>
        </Card>
      )}
      {sections.length === 0 && !addingSection && <div className="text-center py-12 text-slate-400 text-sm">No footer sections yet. Add one above.</div>}
      <div className="grid md:grid-cols-2 gap-4">
        {sections.map((section) => (
          <Card key={section.id}>
            <div className="flex items-center gap-2 mb-3">
              {editSection === section.id ? (
                <>
                  <input value={editSectionTitle} onChange={(e) => setEditSectionTitle(e.target.value)} className="flex-1 text-sm font-semibold border-b border-indigo-300 focus:outline-none bg-transparent" autoFocus />
                  <button onClick={() => saveSection(section.id)} className="text-indigo-500 hover:text-indigo-700 p-1"><HiOutlineCheck size={15} /></button>
                  <button onClick={() => setEditSection(null)} className="text-slate-400 hover:text-slate-600 p-1"><HiOutlineX size={15} /></button>
                </>
              ) : (
                <>
                  <p className="flex-1 text-sm font-semibold">{section.title}</p>
                  <button onClick={() => startEditSection(section)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400" title="Edit section title"><HiOutlinePencil size={14} /></button>
                  <button onClick={() => deleteSection(section.id)} className="p-1 hover:bg-red-50 rounded-lg text-red-400" title="Delete section"><HiOutlineTrash size={14} /></button>
                </>
              )}
            </div>
            <div className="space-y-1 mb-3">
              {(section.links || []).length === 0 && <p className="text-xs text-slate-400 italic px-2">No links yet</p>}
              {(section.links || []).map((link) => (
                <div key={link.id}>
                  {editLink === link.id ? (
                    <div className="flex gap-2 items-center p-2 bg-slate-50 rounded-xl">
                      <input value={editLinkData.label ?? ""} onChange={(e) => setEditLinkData((p) => ({ ...p, label: e.target.value }))} placeholder="Label" className="flex-1 text-xs border border-slate-200 rounded-lg px-2 py-1 focus:outline-none" autoFocus />
                      <input value={editLinkData.href ?? ""} onChange={(e) => setEditLinkData((p) => ({ ...p, href: e.target.value }))} placeholder="href" className="flex-1 text-xs border border-slate-200 rounded-lg px-2 py-1 focus:outline-none" />
                      <button onClick={saveLink} className="text-indigo-500 p-1"><HiOutlineCheck size={13} /></button>
                      <button onClick={() => setEditLink(null)} className="text-slate-400 p-1"><HiOutlineX size={13} /></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-50 group">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{link.label}</p>
                        <p className="text-[11px] text-slate-400 truncate">{link.href}</p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <button onClick={() => startEditLink(link)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400" title="Edit link"><HiOutlinePencil size={12} /></button>
                        <button onClick={() => deleteLink(link.id, section.id)} className="p-1 hover:bg-red-50 rounded-lg text-red-400" title="Delete link"><HiOutlineTrash size={12} /></button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {addingLink === section.id ? (
              <div className="border border-dashed border-slate-200 rounded-xl p-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input value={newLink.label} onChange={(e) => setNewLink((p) => ({ ...p, label: e.target.value }))} placeholder="Label" className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none w-full" autoFocus />
                  <input value={newLink.href} onChange={(e) => setNewLink((p) => ({ ...p, href: e.target.value }))} placeholder="/path" className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none w-full" />
                </div>
                <div className="flex gap-2">
                  <Btn size="sm" variant="primary" onClick={() => createLink(section.id)}><HiOutlineCheck size={12} /> Add</Btn>
                  <Btn size="sm" onClick={() => { setAddingLink(null); setNewLink({ label: "", href: "" }); }}><HiOutlineX size={12} /> Cancel</Btn>
                </div>
              </div>
            ) : (
              <button onClick={() => { setAddingLink(section.id); setNewLink({ label: "", href: "" }); }} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-500 transition-colors w-full py-1">
                <HiOutlinePlus size={13} /> Add link
              </button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
//  PAGE SECTIONS MANAGER
// ══════════════════════════════════════════════════════════════════════════════

const SectionTypeLabel = { text: "Text", image: "Image", text_image: "Text + Image", video: "Video" };
const PositionLabel = { left: "Left", center: "Center", right: "Right" };

const EMPTY_FORM = { type: "text", title: "", body: "", isVisible: true, position: "center", imagePosition: "center", bgColor: "" };
const EMPTY_IMAGES = { img1: null, img2: null, img3: null, img4: null, prev1: "", prev2: "", prev3: "", prev4: "", url1: "", url2: "", url3: "", url4: "" };
const MAX_VIDEOS = 6;

const PageSectionsManager = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  // Image state
  const [imgs, setImgs] = useState({ ...EMPTY_IMAGES });
  const [bgImageFile, setBgImageFile] = useState(null);
  const [bgImagePreview, setBgImagePreview] = useState("");
  const [existingBgImageUrl, setExistingBgImageUrl] = useState("");
  const bgFileRef = useRef();
  const fileRef1 = useRef();
  const fileRef2 = useRef();
  const fileRef3 = useRef();
  const fileRef4 = useRef();

  // Video state — up to 6 videos.
  // existingVideoUrls: URLs already saved on the server that the admin wants to KEEP.
  // newVideoFiles: newly selected File objects (not yet uploaded) with local preview URLs.
  const [existingVideoUrls, setExistingVideoUrls] = useState([]); // string[]
  const [newVideoFiles, setNewVideoFiles] = useState([]); // { file, preview }[]
  const videoFileRef = useRef();

  const [saving, setSaving] = useState(false);

  const totalVideoCount = existingVideoUrls.length + newVideoFiles.length;

  const load = async () => {
    setLoading(true);
    const d = await api("/sections");
    if (d.success) setSections(d.sections);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { return () => { if (bgImagePreview) URL.revokeObjectURL(bgImagePreview); }; }, [bgImagePreview]);
  useEffect(() => {
    return () => { newVideoFiles.forEach((v) => URL.revokeObjectURL(v.preview)); };
  }, [newVideoFiles]);

  const resetForm = () => {
    setForm({ ...EMPTY_FORM });
    setAdding(false);
    setEditId(null);
    setImgs({ ...EMPTY_IMAGES });
    setExistingBgImageUrl("");
    setBgImageFile(null);
    if (bgImagePreview) URL.revokeObjectURL(bgImagePreview);
    setBgImagePreview("");
    newVideoFiles.forEach((v) => URL.revokeObjectURL(v.preview));
    setNewVideoFiles([]);
    setExistingVideoUrls([]);
  };

  const onImageChange = (slot, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const prevKey = `prev${slot}`;
    if (imgs[prevKey]) URL.revokeObjectURL(imgs[prevKey]);
    setImgs((p) => ({ ...p, [`img${slot}`]: file, [prevKey]: URL.createObjectURL(file) }));
  };

  const removeImg = (slot) => {
    const prevKey = `prev${slot}`;
    if (imgs[prevKey]) URL.revokeObjectURL(imgs[prevKey]);
    setImgs((p) => ({ ...p, [`img${slot}`]: null, [prevKey]: "", [`url${slot}`]: "" }));
  };

  const onBgImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (bgImagePreview) URL.revokeObjectURL(bgImagePreview);
    setBgImageFile(file);
    setBgImagePreview(URL.createObjectURL(file));
  };

  const removeBgImage = () => {
    if (bgImagePreview) URL.revokeObjectURL(bgImagePreview);
    setBgImageFile(null);
    setBgImagePreview("");
    setExistingBgImageUrl("");
  };

  // ── Video handlers (up to 6 total, existing + new combined) ──────────────────
  const onVideoFilesSelected = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const room = MAX_VIDEOS - totalVideoCount;
    if (room <= 0) {
      alert(`You can upload a maximum of ${MAX_VIDEOS} videos per section.`);
      e.target.value = "";
      return;
    }
    const toAdd = files.slice(0, room).map((file) => ({ file, preview: URL.createObjectURL(file) }));
    if (files.length > room) {
      alert(`Only ${room} more video(s) could be added (max ${MAX_VIDEOS} total). The rest were skipped.`);
    }
    setNewVideoFiles((prev) => [...prev, ...toAdd]);
    e.target.value = "";
  };

  const removeExistingVideo = (url) => {
    setExistingVideoUrls((prev) => prev.filter((u) => u !== url));
  };

  const removeNewVideo = (index) => {
    setNewVideoFiles((prev) => {
      const copy = [...prev];
      URL.revokeObjectURL(copy[index].preview);
      copy.splice(index, 1);
      return copy;
    });
  };

  const save = async () => {
    setSaving(true);
    const endpoint = editId ? "/sections/update" : "/sections/create";
    const fd = new FormData();
    fd.append("type", form.type);
    fd.append("title", form.title || "");
    fd.append("body", form.body || "");
    fd.append("isVisible", String(form.isVisible));
    fd.append("position", form.position || "center");
    fd.append("imagePosition", form.imagePosition || "center");
    fd.append("bgColor", form.bgColor || "");
    fd.append("order", editId ? (sections.find((s) => s.id === editId)?.order ?? 0) : sections.length);
    if (editId) fd.append("id", editId);

    // Images
    const imgKeys = ["image", "image2", "image3", "image4"];
    const imgFields = [imgs.img1, imgs.img2, imgs.img3, imgs.img4];
    const urlFields = [imgs.url1, imgs.url2, imgs.url3, imgs.url4];
    const removeKeys = ["removeImage", "removeImage2", "removeImage3", "removeImage4"];
    imgKeys.forEach((key, i) => {
      if (imgFields[i]) { fd.append(key, imgFields[i]); }
      else if (editId && !urlFields[i]) { fd.append(removeKeys[i], "true"); }
    });

    // Background image
    if (bgImageFile) { fd.append("bgImage", bgImageFile); }
    else if (editId && !existingBgImageUrl) { fd.append("removeBgImage", "true"); }

    // Videos — tell the backend which existing URLs to keep, then attach new files as video1..video6
    fd.append("existingVideoUrls", JSON.stringify(existingVideoUrls));
    newVideoFiles.forEach((v, i) => {
      fd.append(`video${i + 1}`, v.file);
    });

    const d = await apiForm(endpoint, fd);
    if (d.success) {
      if (editId) setSections((p) => p.map((s) => (s.id === editId ? d.section : s)));
      else setSections((p) => [...p, d.section]);
      resetForm();
    } else {
      alert(d.message || "Save failed");
    }
    setSaving(false);
  };

  const remove = async (id) => {
    if (!confirm("Delete this section?")) return;
    const d = await api("/sections/delete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    if (d.success) setSections((p) => p.filter((s) => s.id !== id));
    else alert(d.message || "Delete failed");
  };

  const toggleVisible = async (section) => {
    const fd = new FormData();
    fd.append("id", section.id);
    fd.append("isVisible", String(!section.isVisible));
    const d = await apiForm("/sections/update", fd);
    if (d.success) setSections((p) => p.map((s) => (s.id === section.id ? d.section : s)));
  };

  const move = async (index, dir) => {
    const arr = [...sections]; const si = index + dir;
    if (si < 0 || si >= arr.length) return;
    [arr[index], arr[si]] = [arr[si], arr[index]]; setSections(arr);
    await api("/sections/reorder", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: arr.map((s) => s.id) }) });
  };

  const startEdit = (section) => {
    setEditId(section.id);
    setForm({ type: section.type, title: section.title || "", body: section.body || "", isVisible: section.isVisible, position: section.position || "center", imagePosition: section.imagePosition || "center", bgColor: section.bgColor || "" });
    setImgs({ img1: null, img2: null, img3: null, img4: null, prev1: "", prev2: "", prev3: "", prev4: "", url1: section.imageUrl || "", url2: section.image2Url || "", url3: section.image3Url || "", url4: section.image4Url || "" });
    setExistingBgImageUrl(section.bgImageUrl || "");
    setBgImageFile(null);
    if (bgImagePreview) URL.revokeObjectURL(bgImagePreview);
    setBgImagePreview("");
    newVideoFiles.forEach((v) => URL.revokeObjectURL(v.preview));
    setNewVideoFiles([]);
    setExistingVideoUrls(Array.isArray(section.videoUrls) ? section.videoUrls : []);
    setAdding(true);
  };

  if (loading) return <div className="text-sm text-slate-400 py-8 text-center">Loading…</div>;

  const showImages = form.type === "image" || form.type === "text_image";
  const showText = form.type === "text" || form.type === "text_image";
  const showVideo = form.type === "video";

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold">Custom Page Sections</h2>
          <p className="text-xs text-slate-400 mt-0.5">Add text blocks, images, videos, or mixed sections to your storefront</p>
        </div>
        {!adding && <Btn variant="primary" onClick={() => setAdding(true)}><HiOutlinePlus size={15} /> New section</Btn>}
      </div>

      {adding && (
        <Card>
          <p className="text-sm font-semibold mb-4">{editId ? "Edit section" : "New section"}</p>
          <div className="space-y-4">

            {/* Type selector */}
            <div>
              <label className="text-xs text-slate-500 mb-1.5 block">Section type</label>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(SectionTypeLabel).map(([val, lbl]) => (
                  <button
                    key={val}
                    onClick={() => setForm((p) => ({ ...p, type: val }))}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1"
                    style={form.type === val ? { background: "var(--admin-primary)", color: "#fff", borderColor: "transparent" } : { borderColor: "#E2E8F0", color: "#64748B" }}
                  >
                    {val === "video" && <HiVideoCamera size={12} />}
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            {/* Title — shown for all types */}
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Title</label>
              <Input value={form.title} onChange={(v) => setForm((p) => ({ ...p, title: v }))} placeholder="Section title" />
            </div>

            {/* Body text */}
            {showText && (
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Body text</label>
                <Textarea value={form.body} onChange={(v) => setForm((p) => ({ ...p, body: v }))} placeholder="Enter content…" rows={4} />
              </div>
            )}

            {/* Image upload — 4 slots */}
            {showImages && (
              <div>
                <label className="text-xs text-slate-500 mb-2 block font-medium">Images <span className="text-slate-300">(up to 4 — displayed as a grid)</span></label>
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((slot) => {
                    const refs = [fileRef1, fileRef2, fileRef3, fileRef4];
                    const cur = imgs[`prev${slot}`] || imgs[`url${slot}`];
                    return (
                      <div key={slot}>
                        <p className="text-xs text-slate-400 mb-1">Image {slot}</p>
                        {cur ? (
                          <div className="relative h-28 rounded-xl overflow-hidden border border-slate-100">
                            <img src={cur} alt={`Image ${slot}`} className="w-full h-full object-cover" />
                            <button onClick={() => removeImg(slot)} className="absolute top-1.5 right-1.5 bg-white/90 hover:bg-white rounded-lg p-1 text-red-500 shadow"><HiOutlineX size={13} /></button>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-slate-200 rounded-xl h-28 flex flex-col items-center justify-center text-slate-400 text-xs cursor-pointer hover:border-indigo-300 hover:text-indigo-400 transition-colors gap-1" onClick={() => refs[slot - 1].current?.click()}>
                            <HiOutlinePhotograph size={20} />
                            <span>Click to upload</span>
                          </div>
                        )}
                        <input ref={refs[slot - 1]} type="file" accept="image/*" className="sr-only" onChange={(e) => onImageChange(slot, e)} />
                        <button onClick={() => refs[slot - 1].current?.click()} className="mt-1.5 text-xs text-indigo-500 hover:text-indigo-700 font-medium">{cur ? "Change" : "Upload"}</button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── VIDEO UPLOAD — up to 6 videos, grid layout ── */}
            {showVideo && (
              <div>
                <label className="text-xs text-slate-500 mb-2 block font-medium flex items-center gap-1">
                  <HiVideoCamera size={13} /> Videos
                  <span className="text-slate-300 font-normal">
                    (up to {MAX_VIDEOS} — displayed as a grid · {totalVideoCount}/{MAX_VIDEOS} added)
                  </span>
                </label>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  {/* Existing videos already saved on the server */}
                  {existingVideoUrls.map((url) => (
                    <div key={url} className="relative h-28 rounded-xl overflow-hidden border border-slate-100">
                      <video src={url} className="w-full h-full object-cover" muted playsInline preload="metadata" />
                      <span className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded-full font-semibold">Saved</span>
                      <button onClick={() => removeExistingVideo(url)} className="absolute top-1.5 right-1.5 bg-white/90 hover:bg-white rounded-lg p-1 text-red-500 shadow"><HiOutlineX size={13} /></button>
                    </div>
                  ))}

                  {/* Newly selected videos (not yet uploaded) */}
                  {newVideoFiles.map((v, i) => (
                    <div key={v.preview} className="relative h-28 rounded-xl overflow-hidden border border-indigo-300">
                      <video src={v.preview} className="w-full h-full object-cover" muted playsInline preload="metadata" />
                      <span className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded-full font-semibold">
                        {(v.file.size / (1024 * 1024)).toFixed(1)} MB
                      </span>
                      <button onClick={() => removeNewVideo(i)} className="absolute top-1.5 right-1.5 bg-white/90 hover:bg-white rounded-lg p-1 text-red-500 shadow"><HiOutlineX size={13} /></button>
                    </div>
                  ))}

                  {/* Upload tile — shown while there's room left */}
                  {totalVideoCount < MAX_VIDEOS && (
                    <div
                      className="border-2 border-dashed border-slate-200 rounded-xl h-28 flex flex-col items-center justify-center text-slate-400 text-xs cursor-pointer hover:border-indigo-300 hover:text-indigo-400 transition-colors gap-1"
                      onClick={() => videoFileRef.current?.click()}
                    >
                      <HiVideoCamera size={20} />
                      <span>Click to upload</span>
                    </div>
                  )}
                </div>

                <input
                  ref={videoFileRef}
                  type="file"
                  accept="video/*"
                  multiple
                  className="sr-only"
                  onChange={onVideoFilesSelected}
                />

                <p className="text-[10px] text-slate-400">mp4, mov, webm · max 100 MB each</p>
                {newVideoFiles.length > 0 && (
                  <p className="text-[10px] text-slate-400 mt-1">⏳ Large videos may take 15–60 seconds to upload. Please wait after clicking Save.</p>
                )}
              </div>
            )}

            {/* Text position */}
            {showText && (
              <div>
                <label className="text-xs text-slate-500 mb-1.5 block">Text position</label>
                <div className="flex gap-2">
                  {Object.entries(PositionLabel).map(([val, lbl]) => (
                    <button key={val} onClick={() => setForm((p) => ({ ...p, position: val }))} className="px-3 py-1.5 rounded-xl text-xs font-medium border transition-all" style={form.position === val ? { background: "var(--admin-primary)", color: "#fff", borderColor: "transparent" } : { borderColor: "#E2E8F0", color: "#64748B" }}>{lbl}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Image position */}
            {showImages && (
              <div>
                <label className="text-xs text-slate-500 mb-1.5 block">Image position</label>
                <div className="flex gap-2">
                  {Object.entries(PositionLabel).map(([val, lbl]) => (
                    <button key={val} onClick={() => setForm((p) => ({ ...p, imagePosition: val }))} className="px-3 py-1.5 rounded-xl text-xs font-medium border transition-all" style={form.imagePosition === val ? { background: "var(--admin-primary)", color: "#fff", borderColor: "transparent" } : { borderColor: "#E2E8F0", color: "#64748B" }}>{lbl}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Background color */}
            <div>
              <label className="text-xs text-slate-500 mb-1.5 block">Section background color</label>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer">
                  <div className="w-9 h-9 rounded-xl border-2 border-white shadow-md transition-transform hover:scale-110" style={{ background: form.bgColor || "#ffffff" }} />
                  <input type="color" value={form.bgColor || "#ffffff"} onChange={(e) => setForm((p) => ({ ...p, bgColor: e.target.value }))} className="sr-only" />
                </label>
                <span className="text-xs font-mono text-slate-400">{form.bgColor || "default"}</span>
                {form.bgColor && <button onClick={() => setForm((p) => ({ ...p, bgColor: "" }))} className="text-xs text-red-400 hover:text-red-600">✕ Clear</button>}
              </div>
            </div>

            {/* Background image */}
            <div>
              <label className="text-xs text-slate-500 mb-1.5 block">Section background image</label>
              <p className="text-xs text-slate-400 mb-2">Overrides background color if set</p>
              {(bgImagePreview || existingBgImageUrl) ? (
                <div className="relative h-28 rounded-xl overflow-hidden mb-2 border border-slate-100">
                  <img src={bgImagePreview || existingBgImageUrl} alt="background preview" className="w-full h-full object-cover" />
                  <button onClick={removeBgImage} className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-lg p-1 text-red-500 shadow"><HiOutlineX size={14} /></button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-200 rounded-xl h-24 flex flex-col items-center justify-center text-slate-400 text-sm mb-2 cursor-pointer hover:border-indigo-300 hover:text-indigo-400 transition-colors gap-1" onClick={() => bgFileRef.current?.click()}>
                  <HiOutlinePhotograph size={20} />
                  <span>Click to upload background</span>
                </div>
              )}
              <Btn onClick={() => bgFileRef.current?.click()}><HiOutlineUpload size={14} /> {(bgImagePreview || existingBgImageUrl) ? "Change background" : "Upload background"}</Btn>
              <input ref={bgFileRef} type="file" accept="image/*" className="sr-only" onChange={onBgImageChange} />
            </div>

            {/* Visibility */}
            <div className="flex items-center gap-3">
              <Toggle value={form.isVisible} onChange={(v) => setForm((p) => ({ ...p, isVisible: v }))} />
              <span className="text-sm text-slate-600">Visible on storefront</span>
            </div>

            <div className="flex gap-2">
              <Btn variant="primary" onClick={save} disabled={saving}>
                <HiOutlineCheck size={14} /> {saving ? (newVideoFiles.length > 0 ? "Uploading videos…" : "Saving…") : editId ? "Update" : "Create"}
              </Btn>
              <Btn onClick={resetForm}><HiOutlineX size={14} /> Cancel</Btn>
            </div>
          </div>
        </Card>
      )}

      {sections.length === 0 && !adding && (
        <div className="text-center py-12 text-slate-400 text-sm">No custom sections yet. Add one above.</div>
      )}

      <div className="space-y-3">
        {sections.map((section, idx) => {
          const sectionVideoCount = Array.isArray(section.videoUrls) ? section.videoUrls.length : 0;
          return (
            <Card key={section.id} className="!p-4 !mb-2">
              <div className="flex items-start gap-3">
                {/* Reorder */}
                <div className="flex flex-col gap-0.5 pt-1">
                  <button onClick={() => move(idx, -1)} disabled={idx === 0} className="p-0.5 hover:text-indigo-500 disabled:opacity-20 transition-colors"><HiOutlineChevronUp size={14} /></button>
                  <button onClick={() => move(idx, 1)} disabled={idx === sections.length - 1} className="p-0.5 hover:text-indigo-500 disabled:opacity-20 transition-colors"><HiOutlineChevronDown size={14} /></button>
                </div>

                {/* Thumbnail */}
                {section.type === "video" && sectionVideoCount > 0 ? (
                  <div className="grid grid-cols-2 gap-0.5 w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-slate-100 bg-black relative">
                    {section.videoUrls.slice(0, 4).map((url, i) => (
                      <video key={i} src={url} className="w-full h-full object-cover opacity-70" muted playsInline preload="metadata" />
                    ))}
                    <HiVideoCamera className="absolute inset-0 m-auto text-white" size={16} />
                  </div>
                ) : (section.imageUrl || section.image2Url || section.image3Url || section.image4Url) ? (
                  <div className="grid grid-cols-2 gap-0.5 w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-slate-100">
                    {[section.imageUrl, section.image2Url, section.image3Url, section.image4Url].filter(Boolean).slice(0, 4).map((url, i) => (
                      <img key={i} src={url} alt="" className="w-full h-full object-cover" />
                    ))}
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center text-slate-300 shrink-0">
                    <HiOutlinePhotograph size={20} />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge color="slate">{SectionTypeLabel[section.type] || section.type}</Badge>
                    {section.type !== "video" && <Badge color="slate">{PositionLabel[section.position] || "Center"}</Badge>}
                    <Badge color={section.isVisible ? "green" : "red"}>{section.isVisible ? "Visible" : "Hidden"}</Badge>
                    {section.bgColor && <span className="w-4 h-4 rounded-full border border-slate-200" style={{ background: section.bgColor }} title={`Background: ${section.bgColor}`} />}
                    {sectionVideoCount > 0 && <Badge color="indigo">{sectionVideoCount} video{sectionVideoCount > 1 ? "s" : ""}</Badge>}
                  </div>
                  <p className="text-sm font-semibold truncate">{section.title || "(No title)"}</p>
                  {section.body && <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">{section.body}</p>}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => toggleVisible(section)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400" title={section.isVisible ? "Hide" : "Show"}>
                    {section.isVisible ? <HiOutlineEye size={16} /> : <HiOutlineEyeOff size={16} />}
                  </button>
                  <button onClick={() => startEdit(section)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400" title="Edit"><HiOutlinePencil size={16} /></button>
                  <button onClick={() => remove(section.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400" title="Delete"><HiOutlineTrash size={16} /></button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
//  MAIN CUSTOMIZER PAGE
// ══════════════════════════════════════════════════════════════════════════════

const TABS = [
  { id: "logo",     label: "Logo & Brand",  icon: HiOutlineColorSwatch },
  { id: "nav",      label: "Navigation",    icon: HiOutlineMenu },
  { id: "footer",   label: "Footer",        icon: HiOutlineViewGrid },
  { id: "sections", label: "Page Sections", icon: HiOutlineViewGrid },
];

const Customizer = () => {
  const [tab, setTab] = useState("logo");

  return (
    <div className="min-h-screen p-8" style={{ background: "var(--admin-dash-bg)" }}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-display">Storefront Customizer</h1>
        <p className="text-sm text-slate-500 mt-1">Manage logo, navigation, footer sections, and custom page content.</p>
      </div>
      <div className="flex gap-1 mb-8 bg-slate-100 p-1 rounded-xl w-fit flex-wrap">
        {TABS.map(({ id, label }) => (
          <button key={id} onClick={() => setTab(id)} className="px-5 py-2 rounded-lg text-sm font-medium transition-all" style={tab === id ? { background: "var(--admin-primary)", color: "#fff" } : { color: "#64748B" }}>
            {label}
          </button>
        ))}
      </div>
      {tab === "logo"     && <LogoManager />}
      {tab === "nav"      && <NavManager />}
      {tab === "footer"   && <FooterManager />}
      {tab === "sections" && <PageSectionsManager />}
    </div>
  );
};

export default Customizer;