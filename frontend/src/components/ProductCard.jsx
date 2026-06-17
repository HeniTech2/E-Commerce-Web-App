import { useContext } from "react";
import { Link } from "react-router-dom";
import { HiHeart, HiOutlineHeart, HiOutlineShoppingCart, HiStar } from "react-icons/hi";
import { ShopContext, currency, stockStatus } from "../context/ShopContext";
import { toast } from "sonner";

const ProductCard = ({ product }) => {
  const { addToCart, toggleWishlist, isWishlisted, token } = useContext(ShopContext);
  const pid = product.id || product._id;
  const image = Array.isArray(product.image) ? product.image[0] : product.image;
  const stock = stockStatus(product.stock ?? 99);
  const outOfStock = (product.stock ?? 99) <= 0;
  const wishlisted = isWishlisted(pid);

  const handleQuickAdd = (e) => {
    e.preventDefault();
    if (!outOfStock) {
      addToCart(pid);
      toast.success("Added to cart");
    }
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
      <div className="relative overflow-hidden rounded-xl bg-surface border border-border card-hover group-hover:shadow-cardHover">
        <img
          src={image}
          alt={product.name}
          className="w-full aspect-[4/5] object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {product.bestseller && (
          <span className="absolute top-3 left-3 bg-primary text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
            Bestseller
          </span>
        )}
        {outOfStock && (
          <span className="absolute top-3 right-3 bg-ink/80 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
            Sold out
          </span>
        )}

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-card transition-all
            ${outOfStock ? "top-10" : "top-3"}
            ${wishlisted
              ? "bg-white text-rose-500 opacity-100"
              : "bg-white text-stone opacity-0 group-hover:opacity-100 hover:text-rose-500"}`}
        >
          {wishlisted ? <HiHeart size={16} /> : <HiOutlineHeart size={16} />}
        </button>

        <div className="price-tag absolute bottom-3 right-3 font-mono text-xs font-semibold px-3 py-1.5">
          {currency} {product.price.toLocaleString()}
        </div>

        {/* Quick add button */}
        <button
          onClick={handleQuickAdd}
          disabled={outOfStock}
          aria-label="Quick add to cart"
          className={`absolute bottom-3 left-3 w-9 h-9 rounded-full flex items-center justify-center transition-all
            ${outOfStock
              ? "bg-surface text-stoneLight cursor-not-allowed"
              : "bg-white text-ink shadow-card opacity-0 group-hover:opacity-100 hover:bg-primary hover:text-white"}`}
        >
          <HiOutlineShoppingCart size={16} />
        </button>
      </div>

      <div className="pt-3">
        <h3 className="font-display text-sm font-semibold leading-snug group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-xs text-stone capitalize">{product.category}</span>
          <span className="font-mono text-xs font-semibold">{currency} {product.price.toLocaleString()}</span>
        </div>
        {(product.rating > 0 || product.reviews > 0) && (
          <div className="flex items-center gap-1 mt-1.5">
            <HiStar className="text-warning" size={13} />
            <span className="text-xs font-medium text-ink">{product.rating?.toFixed(1)}</span>
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