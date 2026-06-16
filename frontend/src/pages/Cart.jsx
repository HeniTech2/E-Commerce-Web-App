import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShopContext, currency } from "../context/ShopContext";
import { HiOutlineTrash, HiOutlineShoppingBag } from "react-icons/hi";

const Cart = () => {
  const { cartItems, updateQty, removeFromCart, cartTotal } = useContext(ShopContext);
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-5 py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primaryLight flex items-center justify-center mx-auto mb-5">
          <HiOutlineShoppingBag className="text-primary" size={28} />
        </div>
        <h1 className="font-display text-3xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-stone mb-6">Time to find something you'll love.</p>
        <Link to="/shop" className="bg-primary text-white px-7 py-3.5 rounded-xl font-semibold text-sm hover:bg-primaryDark transition-colors shadow-card">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-8 py-12">
      <h1 className="font-display text-4xl font-bold mb-10">Your cart</h1>
      <div className="grid md:grid-cols-3 gap-12">
        <div className="md:col-span-2 flex flex-col gap-4">
          {cartItems.map(({ id, size, qty, product: p }) => {
            const image = Array.isArray(p.image) ? p.image[0] : p.image;
            const pid = p.id || p._id;
            return (
              <div key={`${id}-${size}`} className="flex gap-5 bg-white border border-border rounded-2xl p-4 shadow-card">
                <img src={image} alt={p.name} className="w-24 h-28 object-cover rounded-xl" />
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between">
                    <div>
                      <Link to={`/product/${pid}`} className="font-display font-semibold hover:text-primary transition-colors">{p.name}</Link>
                      <p className="text-xs text-stone uppercase tracking-wide mt-1">{p.category}</p>
                      {size !== "default" && <p className="text-xs text-stone mt-0.5">Size: {size}</p>}
                    </div>
                    <button onClick={() => removeFromCart(id, size)} className="text-stoneLight hover:text-danger transition-colors" aria-label="Remove">
                      <HiOutlineTrash size={18} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-border rounded-lg overflow-hidden">
                      <button onClick={() => updateQty(id, size, qty - 1)} className="px-3 py-1.5 hover:bg-surface transition-colors font-semibold text-sm">−</button>
                      <span className="px-3 text-sm font-semibold">{qty}</span>
                      <button onClick={() => updateQty(id, size, qty + 1)} className="px-3 py-1.5 hover:bg-surface transition-colors font-semibold text-sm">+</button>
                    </div>
                    <span className="font-mono font-semibold">{currency} {(p.price * qty).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white border border-border rounded-2xl p-6 shadow-card h-fit sticky top-24">
          <h2 className="font-display text-lg font-bold mb-4">Order summary</h2>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between"><span className="text-stone">Subtotal</span><span className="font-medium">{currency} {cartTotal.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-stone">Delivery</span><span className="font-medium">{currency} 150</span></div>
            <div className="flex justify-between border-t border-border pt-3 mt-1 font-bold text-base">
              <span>Total</span><span>{currency} {(cartTotal + 150).toLocaleString()}</span>
            </div>
          </div>
          <button onClick={() => navigate("/checkout")} className="mt-6 w-full bg-primary text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-primaryDark transition-colors">
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
