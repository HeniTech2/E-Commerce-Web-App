import { useContext } from "react";
import { Link } from "react-router-dom";
import { HiStar, HiOutlineShoppingCart } from "react-icons/hi";
import { ShopContext, currency, stockStatus } from "../context/ShopContext";

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(ShopContext);
  // Backend uses `id`, static data used `_id`
  const pid = product.id || product._id;
  const image = Array.isArray(product.image) ? product.image[0] : product.image;
  const stock = stockStatus(product.stock ?? 99); // backend may not have stock field
  const outOfStock = (product.stock ?? 99) <= 0;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    if (!outOfStock) addToCart(pid);
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
        <div className="price-tag absolute bottom-3 right-3 font-mono text-xs font-semibold px-3 py-1.5">
          {currency} {product.price.toLocaleString()}
        </div>
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
      </div>
    </Link>
  );
};

export default ProductCard;
