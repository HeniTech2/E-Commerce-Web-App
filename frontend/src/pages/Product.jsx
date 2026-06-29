import { useContext, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { HiOutlineTruck, HiOutlineRefresh, HiCheck } from "react-icons/hi";
import { HiPlayCircle } from "react-icons/hi2";
import { ShopContext, currency, stockStatus } from "../context/ShopContext";
import ProductCard from "../components/ProductCard";
import ProductVideoSection from "../components/ProductVideoSection";

const Product = () => {
  const { id } = useParams();
  const { products, addToCart, productsLoading } = useContext(ShopContext);
  const product = products.find((p) => (p.id || p._id) === id);
  const [activeImg, setActiveImg] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const [sizeError, setSizeError] = useState(false);

  if (productsLoading)
    return (
      <div className="max-w-7xl mx-auto px-5 py-24 text-center text-stone">
        Loading…
      </div>
    );

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-5 py-24 text-center font-display text-2xl font-bold">
        Product not found.
      </div>
    );
  }

  const images = Array.isArray(product.image) ? product.image : [product.image];
  const stock = stockStatus(product.stock ?? 99);
  const outOfStock = (product.stock ?? 99) <= 0;
  const pid = product.id || product._id;
  const related = products
    .filter((p) => p.category === product.category && (p.id || p._id) !== pid)
    .slice(0, 4);
  const hasVideo = !!product.video;

  const handleAdd = () => {
    if (product.sizes?.length > 0 && !selectedSize) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 2000);
      toast.error("Please select a size first");
      return;
    }
    const size = selectedSize || "default";
    addToCart(pid, size);
    setAdded(true);
    toast.success(`${product.name} added to cart`);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-8 py-12">
      {/* Breadcrumb */}
      <div className="text-xs text-stone mb-8">
        <Link to="/" className="hover:text-primary">
          Home
        </Link>{" "}
        /{" "}
        <Link to="/shop" className="hover:text-primary">
          Shop
        </Link>{" "}
        / {product.name}
      </div>

      {/* Main grid */}
      <div className="grid md:grid-cols-2 gap-12">
        {/* ── Left: images + inline video toggle ── */}
        <div>
          <div className="relative mb-3">
            {showVideo && hasVideo ? (
              <video
                src={product.video}
                controls
                autoPlay
                className="w-full aspect-[4/5] object-cover rounded-2xl border border-border bg-black"
              />
            ) : (
              <img
                src={images[activeImg]}
                alt={product.name}
                className="w-full aspect-[4/5] object-cover rounded-2xl border border-border"
              />
            )}
            {product.bestseller && !showVideo && (
              <span className="absolute top-4 left-4 bg-primary text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                Bestseller
              </span>
            )}
            {!showVideo && (
              <div className="price-tag absolute bottom-4 right-4 font-mono text-sm font-semibold px-5 py-2">
                {currency} {product.price.toLocaleString()}
              </div>
            )}
            {hasVideo && (
              <button
                onClick={() => setShowVideo((v) => !v)}
                className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/60 text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-black/80 transition-colors"
              >
                <HiPlayCircle size={15} />
                {showVideo ? "View photos" : "Watch video"}
              </button>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && !showVideo && (
            <div className="flex gap-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`w-16 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    activeImg === i ? "border-primary" : "border-border"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
              {hasVideo && (
                <button
                  onClick={() => setShowVideo(true)}
                  className="w-16 h-20 rounded-lg overflow-hidden border-2 border-border bg-black flex items-center justify-center relative"
                >
                  <video
                    src={product.video}
                    className="w-full h-full object-cover opacity-60"
                    muted
                  />
                  <HiPlayCircle className="absolute text-white" size={22} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Right: product info ── */}
        <div>
          <span className="inline-block bg-primaryLight text-primary text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wide">
            {product.category}
          </span>
          <h1 className="font-display text-3xl md:text-4xl font-bold mt-3">
            {product.name}
          </h1>

          <div className="flex items-center gap-4 mt-3">
            <div
              className={`flex items-center gap-1.5 text-sm font-medium ${stock.text}`}
            >
              <span className={`stock-dot ${stock.dot}`} />
              {stock.label}
            </div>
          </div>

          <p className="text-stone mt-5 leading-relaxed">{product.description}</p>

          {/* Sizes */}
          {product.sizes?.length > 0 && (
            <div className="mt-5">
              <p className="text-sm font-semibold mb-2">
                Sizes
                {sizeError && (
                  <span className="ml-2 text-danger font-normal text-xs">
                    — Please select a size
                  </span>
                )}
              </p>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setSelectedSize(s);
                      setSizeError(false);
                    }}
                    className={`border rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                      selectedSize === s
                        ? "border-primary bg-primary text-white"
                        : sizeError
                        ? "border-danger text-danger"
                        : "border-border hover:border-primary hover:text-primary"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add to cart row */}
          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center border border-border rounded-xl overflow-hidden">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-4 py-3 hover:bg-surface transition-colors font-semibold"
              >
                −
              </button>
              <span className="px-4 font-semibold">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="px-4 py-3 hover:bg-surface transition-colors font-semibold"
              >
                +
              </button>
            </div>
            <button
              onClick={handleAdd}
              disabled={outOfStock}
              className={`flex-1 px-8 py-3.5 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 ${
                outOfStock
                  ? "bg-surface text-stoneLight cursor-not-allowed"
                  : added
                  ? "bg-success text-white"
                  : "bg-primary text-white hover:bg-primaryDark"
              }`}
            >
              {added ? (
                <>
                  <HiCheck size={18} /> Added to cart
                </>
              ) : outOfStock ? (
                "Out of stock"
              ) : (
                "Add to cart"
              )}
            </button>
          </div>

          {/* Delivery / returns */}
          <div className="mt-10 border-t border-border pt-6 grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <HiOutlineTruck className="text-primary mt-0.5" size={20} />
              <div>
                <p className="font-semibold">Delivery</p>
                <p className="text-stone">2–5 days, Addis Ababa</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <HiOutlineRefresh className="text-primary mt-0.5" size={20} />
              <div>
                <p className="font-semibold">Returns</p>
                <p className="text-stone">7-day exchange</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Dedicated video section (NEW) ── */}
      {hasVideo && (
        <ProductVideoSection
          videoUrl={product.video}
          productName={product.name}
        />
      )}

      {/* Related products */}
      {related.length > 0 && (
        <div className="mt-20">
          <h2 className="font-display text-2xl font-bold mb-6">
            From the same category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
            {related.map((p) => (
              <ProductCard key={p.id || p._id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Product;