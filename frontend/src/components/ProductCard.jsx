import { useContext } from "react";
import { Link } from "react-router-dom";
import {
  HiHeart,
  HiOutlineHeart,
  HiOutlineShoppingCart,
  HiStar,
} from "react-icons/hi";
import { toast } from "sonner";
import { ShopContext, currency, stockStatus } from "../context/ShopContext";
import { optimize, srcSet } from "../lib/img";

// Buttons are always visible on touch screens, and appear on hover on desktop.
const hoverReveal =
  "opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 focus-visible:opacity-100";

const ProductCard = ({ product }) => {
  const { addToCart, toggleWishlist, isWishlisted, token } =
    useContext(ShopContext);

  const pid = product.id || product._id;
  const images = (Array.isArray(product.image) ? product.image : [product.image]).filter(Boolean);
  const [first, second] = images;

  const stockCount = product.stock ?? 99;
  const stock = stockStatus(stockCount);
  const outOfStock = stockCount <= 0;
  const lowStock = stockCount > 0 && stockCount <= 5;
  const wishlisted = isWishlisted(pid);

  const handleQuickAdd = (e) => {
    e.preventDefault();
    if (outOfStock) return;
    addToCart(pid);
    toast.success("Added to cart");
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    if (!token) {
      toast.error("Sign in to save items");
      return;
    }
    toggleWishlist(pid);
    toast.success(wishlisted ? "Removed from wishlist" : "Saved to wishlist");
  };

  return (
    <Link to={`/product/${pid}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-surface">
        {first && (
          <img
            src={optimize(first, 600)}
            srcSet={srcSet(first)}
            sizes="(min-width: 1024px) 25vw, 50vw"
            alt={product.name}
            loading="lazy"
            className={`absolute inset-0 h-full w-full object-cover transition-transform duration-700 ${
              second ? "" : "group-hover:scale-105"
            }`}
          />
        )}

        {/* Second photo appears on hover (desktop) */}
        {second && (
          <img
            src={optimize(second, 600)}
            srcSet={srcSet(second)}
            sizes="(min-width: 1024px) 25vw, 50vw"
            alt=""
            loading="lazy"
            className="absolute inset-0 hidden h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100 [@media(hover:hover)]:block"
          />
        )}

        {outOfStock && <div className="absolute inset-0 bg-white/50" />}

        {/* Badges (top-left) */}
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {product.bestseller && (
            <span className="rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-ink shadow-card">
              Bestseller
            </span>
          )}
          {outOfStock && (
            <span className="rounded-full bg-ink px-2.5 py-1 text-[11px] font-semibold text-white">
              Sold out
            </span>
          )}
        </div>

        {/* Wishlist (top-right) */}
        <button
          type="button"
          onClick={handleWishlist}
          aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
          className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-card backdrop-blur transition-colors ${
            wishlisted ? "text-rose-500" : "text-ink hover:text-rose-500"
          }`}
        >
          {wishlisted ? <HiHeart size={18} /> : <HiOutlineHeart size={18} />}
        </button>

        {/* Quick add (bottom-right) */}
        {!outOfStock && (
          <button
            type="button"
            onClick={handleQuickAdd}
            aria-label="Quick add to cart"
            className={`absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink shadow-cardHover transition-all hover:bg-primary hover:text-white ${hoverReveal}`}
          >
            <HiOutlineShoppingCart size={18} />
          </button>
        )}
      </div>

      <div className="pt-3">
        <h3 className="font-display text-sm font-semibold leading-snug transition-colors group-hover:text-primary">
          {product.name}
        </h3>

        <div className="mt-1 flex items-center justify-between gap-2">
          <span className="font-mono text-sm font-semibold">
            {currency} {product.price.toLocaleString()}
          </span>
          <span className="truncate text-xs capitalize text-stone">
            {product.category}
          </span>
        </div>

        {lowStock && (
          <p className={`mt-1 text-xs font-medium ${stock.text}`}>{stock.label}</p>
        )}

        {(product.rating > 0 || product.reviews > 0) && (
          <div className="mt-1.5 flex items-center gap-1">
            <HiStar className="text-warning" size={13} />
            <span className="text-xs font-medium text-ink">
              {product.rating?.toFixed(1)}
            </span>
            {product.reviews > 0 && (
              <span className="text-xs text-stone">({product.reviews})</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;