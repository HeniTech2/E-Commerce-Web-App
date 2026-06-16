import { useContext, useState } from "react";
import { ShopContext, currency } from "../../context/ShopContext";
import { addProduct, removeProduct } from "../../api";
import { HiOutlineTrash, HiOutlinePlus, HiStar, HiPhotograph } from "react-icons/hi";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Resolve image URL — handles both full URLs and relative paths
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

  return (
    <img
      src={resolved}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
};

const AdminProducts = () => {
  const { products, categories, reloadProducts } = useContext(ShopContext);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", price: "", category: "habesha", subCategory: "", description: "", sizes: "[]", bestseller: false });
  const [images, setImages] = useState({ image1: null, image2: null, image3: null, image4: null });
  const [previews, setPreviews] = useState({ image1: null, image2: null, image3: null, image4: null });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const inputClass = "w-full border border-border bg-paper2 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary";

  const openNew = () => {
    setForm({ name: "", price: "", category: categories[0]?.id || "habesha", subCategory: "", description: "", sizes: "[]", bestseller: false });
    setImages({ image1: null, image2: null, image3: null, image4: null });
    setPreviews({ image1: null, image2: null, image3: null, image4: null });
    setError("");
    setShowForm(true);
  };

  const handleImageChange = (key, file) => {
    if (!file) return;
    setImages((prev) => ({ ...prev, [key]: file }));
    // Create local preview URL so admin can see it immediately
    const previewUrl = URL.createObjectURL(file);
    setPreviews((prev) => ({ ...prev, [key]: previewUrl }));
  };

  const save = async (e) => {
    e.preventDefault();
    setError("");
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
      if (images.image1) fd.append("image1", images.image1);
      if (images.image2) fd.append("image2", images.image2);
      if (images.image3) fd.append("image3", images.image3);
      if (images.image4) fd.append("image4", images.image4);

      const data = await addProduct(fd);
      if (data.success) {
        setShowForm(false);
        reloadProducts();
      } else {
        setError(data.message || "Failed to add product");
      }
    } catch {
      setError("Could not connect to server");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm("Remove this product?")) return;
    await removeProduct(id);
    reloadProducts();
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1">Products</h1>
          <p className="text-stone text-sm">{products.length} items</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-primary text-white rounded-xl px-5 py-3 text-sm font-semibold hover:bg-primaryDark transition-colors shadow-card">
          <HiOutlinePlus size={18} /> Add product
        </button>
      </div>

      <div className="bg-white border border-border rounded-2xl shadow-card overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="text-left text-stone text-xs uppercase tracking-wide border-b border-border">
              <th className="py-3 px-4">Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Bestseller</th>
              <th className="text-right px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-border/60">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <ProductImage
                      src={p.image?.[0]}
                      alt={p.name}
                      className="w-10 h-12 object-cover rounded-lg"
                    />
                    <span className="font-display font-medium">{p.name}</span>
                  </div>
                </td>
                <td className="capitalize">{p.category}</td>
                <td className="font-mono">{currency} {p.price?.toLocaleString()}</td>
                <td>{p.bestseller ? <span className="flex items-center gap-1 text-warning"><HiStar size={14} /> Yes</span> : "—"}</td>
                <td className="text-right px-4">
                  <button onClick={() => remove(p.id)} className="p-2 hover:text-danger transition-colors" aria-label="Delete"><HiOutlineTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-ink/40 flex items-center justify-center p-4 z-50">
          <form onSubmit={save} className="bg-white w-full max-w-md rounded-2xl shadow-dropdown p-6 overflow-y-auto max-h-[90vh]">
            <h2 className="font-display text-xl font-bold mb-4">New product</h2>
            {error && <p className="text-danger text-sm mb-3 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>}
            <div className="space-y-3">
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product name" className={inputClass} />
              <div className="grid grid-cols-2 gap-3">
                <input required type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Price (ETB)" className={inputClass} />
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass}>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={3} className={inputClass} />
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.bestseller} onChange={(e) => setForm({ ...form, bestseller: e.target.checked })} />
                Mark as bestseller
              </label>

              {/* Image upload with live preview */}
              <div>
                <p className="text-xs text-stone mb-1">Product images (up to 4)</p>
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
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageChange(key, e.target.files[0])}
                      />
                    </label>
                  ))}
                </div>
                <p className="text-xs text-stone mt-1">Click a slot to upload. First image is the main photo.</p>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button type="button" onClick={() => setShowForm(false)} className="border border-border rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-surface transition-colors">Cancel</button>
              <button type="submit" disabled={saving} className="bg-primary text-white rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-primaryDark transition-colors disabled:opacity-60">
                {saving ? "Saving…" : "Save product"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
