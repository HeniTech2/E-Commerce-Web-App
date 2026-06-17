import { useContext } from "react";
import { Link } from "react-router-dom";
import { HiOutlineHeart, HiOutlineShoppingBag } from "react-icons/hi";
import { ShopContext } from "../context/ShopContext";
import ProductCard from "../components/ProductCard";

const Wishlist = () => {
  const { wishlist, products, token } = useContext(ShopContext);

  if (!token) {
    return (
      <div className="max-w-7xl mx-auto px-5 py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primaryLight flex items-center justify-center mx-auto mb-5">
          <HiOutlineHeart className="text-primary" size={28} />
        </div>
        <h1 className="font-display text-3xl font-bold mb-3">Sign in to view your wishlist</h1>
        <p className="text-stone mb-6">Save items you love and come back to them anytime.</p>
        <Link
          to="/login"
          className="bg-primary text-white px-7 py-3.5 rounded-xl font-semibold text-sm hover:bg-primaryDark transition-colors shadow-card"
        >
          Sign in
        </Link>
      </div>
    );
  }

  const wishlistProducts = products.filter((p) => wishlist.includes(p.id || p._id));

  if (wishlistProducts.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-5 py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primaryLight flex items-center justify-center mx-auto mb-5">
          <HiOutlineHeart className="text-primary" size={28} />
        </div>
        <h1 className="font-display text-3xl font-bold mb-3">Your wishlist is empty</h1>
        <p className="text-stone mb-6">Tap the heart on any product to save it here.</p>
        <Link
          to="/shop"
          className="bg-primary text-white px-7 py-3.5 rounded-xl font-semibold text-sm hover:bg-primaryDark transition-colors shadow-card"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-8 py-10">
      <div className="mb-8 flex items-center gap-3">
        <HiOutlineHeart className="text-primary" size={24} />
        <div>
          <h1 className="font-display text-3xl font-bold">Wishlist</h1>
          <p className="text-stone text-sm mt-0.5">{wishlistProducts.length} saved item{wishlistProducts.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
        {wishlistProducts.map((p) => (
          <ProductCard key={p.id || p._id} product={p} />
        ))}
      </div>
    </div>
  );
};

export default Wishlist;