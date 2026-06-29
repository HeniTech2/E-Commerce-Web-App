import { useContext, useState } from "react";
import { toast } from "sonner";
import { ShopContext, currency } from "../../context/ShopContext";
import { addProduct, updateProduct, removeProduct } from "../../api";
import { HiOutlineTrash, HiOutlinePlus, HiOutlinePencil, HiStar, HiPhotograph } from "react-icons/hi";
import { HiVideoCamera, HiXMark } from "react-icons/hi2";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const resolveImage = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${BASE_URL}${url}`;
};

const ProductImage = ({ src, alt, className }) => {
  const [failed, setFailed] = useState(false);
  const resolved = resolveImage(src);
  if (!resolved || failed) {
    return (
      <div className={`${className} bg-surface border border-border rounded-lg flex items-center justify-center`}>
        <HiPhotograph className="text-stoneLight" size={20} />
      </div>
    );
  }
  return <img src={resolved} alt={alt} className={className} onError={() => setFailed(true)} />;
};

const emptyForm = { name: "", price: "", category: "habesha", subCategory: "", description: "", sizes: "[]", bestseller: false, stock: "99" };

const AdminProducts = () => {
  const { products, categories, reloadProducts } = useContext(ShopContext);
  const [mode, setMode] = useState(null); // null | "add" | "edit"
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState({ image1: null, image2: null, image3: null, image4: null });
  const [previews, setPreviews] = useState({ image1: null, image2: null, image3: null, image4: null });
  const [video, setVideo] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [clearVideo, setClearVideo] = useState(false);
  const [saving, setSaving] = useState(false);

  const inputClass = "w-full border border-border bg-paper2 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary";

  const openAdd = () => {
    setForm(emptyForm);
    setImages({ image1: null, image2: null, image3: null, image4: null });
    setPreviews({ image1: null, image2: null, image3: null, image4: null });
    setVideo(null);
    setVideoPreview(null);
    setClearVideo(false);
    setEditTarget(null);
    setMode("add");
  };

  const openEdit = (p) => {
    setForm({
      name: p.name,
      price: String(p.price),
      category: p.category,
      subCategory: p.subCategory || "",
      description: p.description || "",
      sizes: JSON.stringify(p.sizes || []),
      bestseller: p.bestseller || false,
      stock: String(p.stock ?? 99),
    });
    setImages({ image1: null, image2: null, image3: null, image4: null });
    setPreviews({ image1: null, image2: null, image3: null, image4: null });
    setVideo(null);
    setVideoPreview(null);
    setClearVideo(false);
    setEditTarget(p);
    setMode("edit");
  };

  const handleImageChange = (key, file) => {
    if (!file) return;
    setImages((prev) => ({ ...prev, [key]: file }));
    setPreviews((prev) => ({ ...prev, [key]: URL.createObjectURL(file) }));
  };

  const handleVideoChange = (file) => {
    if (!file) return;
    setVideo(file);
    setVideoPreview(URL.createObjectURL(file));
    setClearVideo(false);
  };

  const removeVideoSelection = () => {
    setVideo(null);
    setVideoPreview(null);
    setClearVideo(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("description", form.description);
      fd.append("price", form.price);
      fd.append("category", form.category);
      fd.append("subCategory", form.subCategory || form.category);
      fd.append("sizes", form.sizes || "[]");
      fd.append("bestseller", form.bestseller ? "true" : "false");
      fd.append("stock", form.stock || "99");
      if (images.image1) fd.append("image1", images.image1);
      if (images.image2) fd.append("image2", images.image2);
      if (images.image3) fd.append("image3", images.image3);
      if (images.image4) fd.append("image4", images.image4);
      if (video) fd.append("video", video);
      if (clearVideo) fd.append("clearVideo", "true");

      let data;
      if (mode === "edit") {
        fd.append("id", editTarget.id);
        data = await updateProduct(fd);
        if (data.success) toast.success("Product updated");
        else toast.error(data.message || "Failed to update product");
      } else {
        data = await addProduct(fd);
        if (data.success) toast.success("Product added");
        else toast.error(data.message || "Failed to add product");
      }

      if (data.success) {
        setMode(null);
        reloadProducts();
      }
    } catch {
      toast.error("Could not connect to server");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id, name) => {
    if (!confirm(`Remove "${name}"?`)) return;
    const data = await removeProduct(id);
    if (data.success) {
      toast.success("Product removed");
      reloadProducts();
    } else {
      toast.error("Failed to remove product");
    }
  };

  const existingImages = editTarget
    ? (editTarget.image || []).slice(0, 4)
    : [];

  const existingVideo = editTarget?.video || null;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1">Products</h1>
          <p className="text-stone text-sm">{products.length} items</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-primary text-white rounded-xl px-5 py-3 text-sm font-semibold hover:bg-primaryDark transition-colors shadow-card">
          <HiOutlinePlus size={18} /> Add product
        </button>
      </div>

      <div className="bg-white border border-border rounded-2xl shadow-card overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="text-left text-stone text-xs uppercase tracking-wide border-b border-border">
              <th className="py-3 px-4">Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Bestseller</th>
              <th className="text-right px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-border/60">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <ProductImage src={p.image?.[0]} alt={p.name} className="w-10 h-12 object-cover rounded-lg" />
                    <div>
                      <span className="font-display font-medium">{p.name}</span>
                      {p.video && <span className="ml-2 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-semibold">VIDEO</span>}
                    </div>
                  </div>
                </td>
                <td className="capitalize">{p.category}</td>
                <td className="font-mono">{currency} {p.price?.toLocaleString()}</td>
                <td>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    (p.stock ?? 99) <= 0 ? "bg-red-50 text-danger" :
                    (p.stock ?? 99) <= 5 ? "bg-warning/10 text-warning" :
                    "bg-success/10 text-success"
                  }`}>
                    {(p.stock ?? 99) <= 0 ? "Out of stock" : `${p.stock ?? 99} left`}
                  </span>
                </td>
                <td>{p.bestseller ? <span className="flex items-center gap-1 text-warning"><HiStar size={14} /> Yes</span> : "—"}</td>
                <td className="text-right px-4">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openEdit(p)} className="p-2 hover:text-primary transition-colors" aria-label="Edit"><HiOutlinePencil size={16} /></button>
                    <button onClick={() => remove(p.id, p.name)} className="p-2 hover:text-danger transition-colors" aria-label="Delete"><HiOutlineTrash size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {mode && (
        <div className="fixed inset-0 bg-ink/40 flex items-center justify-center p-4 z-50">
          <form onSubmit={save} className="bg-white w-full max-w-md rounded-2xl shadow-dropdown p-6 overflow-y-auto max-h-[90vh]">
            <h2 className="font-display text-xl font-bold mb-4">{mode === "edit" ? "Edit product" : "New product"}</h2>
            <div className="space-y-3">
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product name" className={inputClass} />
              <div className="grid grid-cols-2 gap-3">
                <input required type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Price (ETB)" className={inputClass} />
                <input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="Stock qty" className={inputClass} />
              </div>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass}>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={3} className={inputClass} />
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.bestseller} onChange={(e) => setForm({ ...form, bestseller: e.target.checked })} />
                Mark as bestseller
              </label>

              {/* Images */}
              <div>
                <p className="text-xs text-stone mb-1">
                  {mode === "edit" ? "New images (leave empty to keep current)" : "Product images (up to 4)"}
                </p>
                {mode === "edit" && existingImages.length > 0 && (
                  <div className="flex gap-2 mb-2">
                    {existingImages.map((img, i) => (
                      <div key={i} className="w-14 h-16 rounded-lg overflow-hidden border border-border">
                        <ProductImage src={img} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                    <p className="text-xs text-stone self-center ml-1">Current images</p>
                  </div>
                )}
                <div className="grid grid-cols-4 gap-2">
                  {["image1", "image2", "image3", "image4"].map((key) => (
                    <label key={key} className="aspect-square border-2 border-dashed border-border rounded-xl flex items-center justify-center cursor-pointer hover:border-primary/60 transition-colors overflow-hidden relative group">
                      {previews[key] ? (
                        <>
                          <img src={previews[key]} alt="" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-xs font-semibold">Change</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <HiPhotograph className="text-stoneLight" size={20} />
                          <span className="text-stone text-[10px]">Upload</span>
                        </div>
                      )}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(key, e.target.files[0])} />
                    </label>
                  ))}
                </div>
              </div>

              {/* Video */}
              <div>
                <p className="text-xs text-stone mb-1 flex items-center gap-1">
                  <HiVideoCamera size={13} /> Product video (optional — mp4, mov, webm)
                </p>

                {/* Existing video in edit mode */}
                {mode === "edit" && existingVideo && !clearVideo && !videoPreview && (
                  <div className="relative rounded-xl overflow-hidden border border-border mb-2">
                    <video src={existingVideo} className="w-full max-h-36 object-cover" muted />
                    <div className="absolute top-2 right-2 flex gap-1 items-center">
                      <span className="bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold">Current video</span>
                      <button type="button" onClick={removeVideoSelection} className="bg-danger text-white rounded-full p-1 hover:bg-red-700 transition-colors">
                        <HiXMark size={12} />
                      </button>
                    </div>
                  </div>
                )}

                {/* New video preview */}
                {videoPreview && (
                  <div className="relative rounded-xl overflow-hidden border border-primary mb-2">
                    <video src={videoPreview} className="w-full max-h-36 object-cover" muted />
                    <button type="button" onClick={removeVideoSelection} className="absolute top-2 right-2 bg-danger text-white rounded-full p-1 hover:bg-red-700 transition-colors">
                      <HiXMark size={12} />
                    </button>
                  </div>
                )}

                {/* Upload button — shown when no video selected yet */}
                {!videoPreview && !(mode === "edit" && existingVideo && !clearVideo) && (
                  <label className="flex items-center gap-2 border-2 border-dashed border-border rounded-xl px-4 py-3 cursor-pointer hover:border-primary/60 transition-colors text-sm text-stone">
                    <HiVideoCamera size={18} className="text-stoneLight" />
                    <span>Click to upload video</span>
                    <input type="file" accept="video/*" className="hidden" onChange={(e) => handleVideoChange(e.target.files[0])} />
                  </label>
                )}

                {/* Replace link — shown when existing video is visible */}
                {mode === "edit" && existingVideo && !clearVideo && !videoPreview && (
                  <label className="mt-1 flex items-center gap-1 text-xs text-primary cursor-pointer hover:underline">
                    <HiVideoCamera size={13} /> Upload new video to replace
                    <input type="file" accept="video/*" className="hidden" onChange={(e) => handleVideoChange(e.target.files[0])} />
                  </label>
                )}
              </div>

            </div>
            <div className="flex gap-3 mt-5">
              <button type="button" onClick={() => setMode(null)} className="border border-border rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-surface transition-colors">Cancel</button>
              <button type="submit" disabled={saving} className="bg-primary text-white rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-primaryDark transition-colors disabled:opacity-60">
                {saving ? "Saving…" : mode === "edit" ? "Save changes" : "Add product"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;