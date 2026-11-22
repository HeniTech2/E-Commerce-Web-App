import { useContext, useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import {
  HiOutlineTruck,
  HiOutlineRefresh,
  HiOutlineCreditCard,
  HiCheck,
  HiHeart,
  HiOutlineHeart,
  HiChevronLeft,
  HiChevronRight,
  HiX,
  HiStar,
} from "react-icons/hi";
import { HiPlayCircle } from "react-icons/hi2";
import { ShopContext, currency, stockStatus } from "../context/ShopContext";
import ProductCard from "../components/ProductCard";
import ProductVideoSection from "../components/ProductVideoSection";
import { optimize, srcSet } from "../lib/img";

const arrowBtn =
  "absolute top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-card transition-opacity hover:bg-white md:flex [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100";

const ProductView = ({ id }) => {
  const {
    products,
    productsLoading,
    cart,
    updateQty,
    token,
    toggleWishlist,
    isWishlisted,
  } = useContext(ShopContext);

  const product = products.find((p) => (p.id || p._id) === id);
  const pid = product ? product.id || product._id : null;
  const images = product
    ? (Array.isArray(product.image) ? product.image : [product.image]).filter(Boolean)
    : [];

  const [activeImg, setActiveImg] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const [sizeError, setSizeError] = useState(false);
  const [barVisible, setBarVisible] = useState(false);

  const scrollerRef = useRef(null);
  const addRef = useRef(null);
  const sizesRef = useRef(null);
  const touchX = useRef(0);

  // Start at the top of the page
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  // Show the sticky "Add to cart" bar (mobile) only when the main button is off-screen
  useEffect(() => {
    const el = addRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setBarVisible(!entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, [pid]);

  // Lock page scroll while the photo viewer is open
  useEffect(() => {
    if (!lightbox) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [lightbox]);

  if (productsLoading) {
    return (
      <div className="mx-auto max-w-7xl animate-pulse px-5 py-10 md:px-8">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="aspect-[4/5] rounded-2xl bg-surface" />
          <div className="space-y-4 pt-4">
            <div className="h-4 w-24 rounded bg-surface" />
            <div className="h-9 w-3/4 rounded bg-surface" />
            <div className="h-8 w-40 rounded bg-surface" />
            <div className="h-24 rounded bg-surface" />
            <div className="h-12 rounded-xl bg-surface" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-24 text-center">
        <h1 className="font-display text-2xl font-bold">Product not found.</h1>
        <Link to="/shop" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">
          Back to shop
        </Link>
      </div>
    );
  }

  const n = images.length;
  const stockCount = product.stock ?? 99;
  const stock = stockStatus(stockCount);
  const outOfStock = stockCount <= 0;
  const hasVideo = !!product.video;
  const wishlisted = isWishlisted(pid);
  const related = products
    .filter((p) => p.category === product.category && (p.id || p._id) !== pid)
    .slice(0, 4);

  // ── Gallery ───────────────────────────────────────────────
  const goTo = (i, smooth = true) => {
    if (!n) return;
    const next = (i + n) % n;
    const el = scrollerRef.current;
    if (el) el.scrollTo({ left: next * el.clientWidth, behavior: smooth ? "smooth" : "auto" });
    setActiveImg(next);
  };

  const onScroll = (e) => {
    const el = e.currentTarget;
    if (!el.clientWidth) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== activeImg) setActiveImg(i);
  };

  const onLightboxKey = (e) => {
    if (e.key === "Escape") setLightbox(false);
    if (e.key === "ArrowRight") goTo(activeImg + 1, false);
    if (e.key === "ArrowLeft") goTo(activeImg - 1, false);
  };

  // ── Actions ───────────────────────────────────────────────
  const handleAdd = () => {
    if (product.sizes?.length > 0 && !selectedSize) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 2000);
      toast.error("Please select a size first");
      sizesRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const size = selectedSize || "default";
    const current = cart?.[pid]?.[size] || 0;
    if (current + qty > stockCount) {
      toast.error(`Only ${stockCount} in stock`);
      return;
    }
    updateQty(pid, size, current + qty);
    setAdded(true);
    toast.success(`${qty > 1 ? qty + " × " : ""}${product.name} added to cart`);
    setTimeout(() => setAdded(false), 1800);
  };

  const handleWishlist = () => {
    if (!token) {
      toast.error("Sign in to save items");
      return;
    }
    toggleWishlist(pid);
    toast.success(wishlisted ? "Removed from wishlist" : "Saved to wishlist");
  };

  return (
    <div className="mx-auto max-w-7xl px-5 pb-28 pt-6 md:px-8 md:pb-16 md:pt-10">
      {/* Breadcrumb */}
      <div className="mb-5 text-xs text-stone md:mb-8">
        <Link to="/" className="hover:text-primary">Home</Link> /{" "}
        <Link to="/shop" className="hover:text-primary">Shop</Link> / {product.name}
      </div>

      <div className="grid gap-8 md:grid-cols-[1.1fr_1fr] lg:gap-14">
        {/* ── Gallery ───────────────────────────────────────── */}
        <div>
          <div className="group relative -mx-5 overflow-hidden bg-surface md:mx-0 md:rounded-2xl">
            {n > 0 ? (
              <div
                ref={scrollerRef}
                onScroll={onScroll}
                className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setLightbox(true)}
                    aria-label="Zoom photo"
                    className="relative block aspect-[4/5] min-w-full cursor-zoom-in snap-center"
                  >
                    <img
                      src={optimize(img, 900)}
                      srcSet={srcSet(img, [600, 900, 1400])}
                      sizes="(min-width: 768px) 50vw, 100vw"
                      alt={i === 0 ? product.name : `${product.name} – photo ${i + 1}`}
                      loading={i === 0 ? "eager" : "lazy"}
                      fetchPriority={i === 0 ? "high" : "auto"}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex aspect-[4/5] items-center justify-center text-stoneLight">
                No photo
              </div>
            )}

            {product.bestseller && (
              <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-ink shadow-card">
                Bestseller
              </span>
            )}

            {hasVideo && (
              <button
                type="button"
                onClick={() =>
                  document.getElementById("product-video")?.scrollIntoView({ behavior: "smooth" })
                }
                className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur transition-colors hover:bg-black/80"
              >
                <HiPlayCircle size={15} /> Watch video
              </button>
            )}

            {n > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous photo"
                  onClick={() => goTo(activeImg - 1)}
                  className={`${arrowBtn} left-3`}
                >
                  <HiChevronLeft size={22} />
                </button>
                <button
                  type="button"
                  aria-label="Next photo"
                  onClick={() => goTo(activeImg + 1)}
                  className={`${arrowBtn} right-3`}
                >
                  <HiChevronRight size={22} />
                </button>
                <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white md:hidden">
                  {activeImg + 1}/{n}
                </span>
              </>
            )}
          </div>

          {/* Thumbnails (desktop) */}
          {n > 1 && (
            <div className="mt-3 hidden gap-2 overflow-x-auto md:flex">
              {images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Show photo ${i + 1}`}
                  className={`aspect-[4/5] w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                    activeImg === i ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={optimize(img, 200)} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Product info ──────────────────────────────────── */}
        <div className="md:sticky md:top-24 md:self-start">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            {product.category}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold leading-tight md:text-4xl">
            {product.name}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="font-mono text-3xl font-bold">
              {currency} {product.price.toLocaleString()}
            </span>
            <span className={`flex items-center gap-1.5 text-sm font-medium ${stock.text}`}>
              <span className={`stock-dot ${stock.dot}`} />
              {stock.label}
            </span>
          </div>

          {product.rating > 0 && (
            <div className="mt-2 flex items-center gap-1">
              <HiStar className="text-warning" size={16} />
              <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
              {product.reviews > 0 && (
                <span className="text-sm text-stone">({product.reviews} reviews)</span>
              )}
            </div>
          )}

          <p className="mt-5 leading-relaxed text-stone">{product.description}</p>

          {/* Sizes */}
          {product.sizes?.length > 0 && (
            <div ref={sizesRef} className="mt-6">
              <p className="mb-2 text-sm font-semibold">
                Size
                {sizeError && (
                  <span className="ml-2 text-xs font-normal text-danger">— please select a size</span>
                )}
              </p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setSelectedSize(s);
                      setSizeError(false);
                    }}
                    className={`h-11 min-w-[3rem] rounded-xl border px-4 text-sm font-medium transition-colors ${
                      selectedSize === s
                        ? "border-ink bg-ink text-white"
                        : sizeError
                        ? "border-danger text-danger"
                        : "border-border hover:border-ink"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity + add to cart + wishlist */}
          <div ref={addRef} className="mt-8 flex items-center gap-3">
            <div className="flex items-center rounded-xl border border-border">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="h-12 w-11 font-semibold transition-colors hover:bg-surface"
              >
                −
              </button>
              <span className="w-8 text-center font-semibold">{qty}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQty((q) => Math.min(q + 1, Math.max(1, stockCount)))}
                className="h-12 w-11 font-semibold transition-colors hover:bg-surface"
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              disabled={outOfStock}
              className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors ${
                outOfStock
                  ? "cursor-not-allowed bg-surface text-stoneLight"
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

            <button
              type="button"
              onClick={handleWishlist}
              aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border transition-colors ${
                wishlisted ? "text-rose-500" : "text-ink hover:text-rose-500"
              }`}
            >
              {wishlisted ? <HiHeart size={20} /> : <HiOutlineHeart size={20} />}
            </button>
          </div>

          {/* Delivery / returns / payment */}
          <div className="mt-8 space-y-4 border-t border-border pt-6 text-sm">
            <div className="flex items-start gap-3">
              <HiOutlineTruck className="mt-0.5 text-primary" size={20} />
              <div>
                <p className="font-semibold">Delivery</p>
                <p className="text-stone">2–5 days, Addis Ababa</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <HiOutlineRefresh className="mt-0.5 text-primary" size={20} />
              <div>
                <p className="font-semibold">Returns</p>
                <p className="text-stone">7-day exchange</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <HiOutlineCreditCard className="mt-0.5 text-primary" size={20} />
              <div>
                <p className="font-semibold">Payment</p>
                <p className="text-stone">Chapa, CBE bank transfer or cash on delivery</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video section */}
      {hasVideo && (
        <div id="product-video">
          <ProductVideoSection videoUrl={product.video} productName={product.name} />
        </div>
      )}

      {/* Related products */}
      {related.length > 0 && (
        <div className="mt-20">
          <h2 className="mb-6 font-display text-2xl font-bold">From the same category</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
            {related.map((p) => (
              <ProductCard key={p.id || p._id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Sticky add-to-cart bar (mobile only) */}
      {!outOfStock && (
        <div
          className={`fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 px-4 pt-3 backdrop-blur transition-transform duration-300 md:hidden ${
            barVisible ? "translate-y-0" : "translate-y-full"
          }`}
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
          <div className="flex items-center gap-3">
            <div className="min-w-0">
              <p className="truncate text-xs text-stone">{product.name}</p>
              <p className="font-mono text-base font-bold">
                {currency} {product.price.toLocaleString()}
              </p>
            </div>
            <button
              type="button"
              onClick={handleAdd}
              className="ml-auto h-11 shrink-0 rounded-xl bg-primary px-6 text-sm font-semibold text-white"
            >
              {added ? "Added ✓" : "Add to cart"}
            </button>
          </div>
        </div>
      )}

      {/* Full-screen photo viewer */}
      {lightbox && n > 0 && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Product photos"
          tabIndex={-1}
          autoFocus
          onKeyDown={onLightboxKey}
          onClick={() => setLightbox(false)}
          onTouchStart={(e) => {
            touchX.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (Math.abs(dx) > 50) goTo(activeImg + (dx < 0 ? 1 : -1), false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 outline-none"
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => setLightbox(false)}
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"
          >
            <HiX size={22} />
          </button>

          <img
            src={optimize(images[activeImg], 1600)}
            alt={product.name}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] max-w-[95vw] object-contain"
          />

          {n > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous photo"
                onClick={(e) => {
                  e.stopPropagation();
                  goTo(activeImg - 1, false);
                }}
                className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"
              >
                <HiChevronLeft size={24} />
              </button>
              <button
                type="button"
                aria-label="Next photo"
                onClick={(e) => {
                  e.stopPropagation();
                  goTo(activeImg + 1, false);
                }}
                className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"
              >
                <HiChevronRight size={24} />
              </button>
              <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white">
                {activeImg + 1} / {n}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// `key` resets the gallery, size and quantity when you open another product
const Product = () => {
  const { id } = useParams();
  return <ProductView key={id} id={id} />;
};

export default Product;