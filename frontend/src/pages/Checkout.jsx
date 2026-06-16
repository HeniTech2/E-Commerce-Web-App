import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiCheck } from "react-icons/hi";
import { ShopContext, currency } from "../context/ShopContext";
import { placeOrderCOD, placeOrderChapa } from "../api";

const Checkout = () => {
  const { cartItems, cartTotal, clearCart, userId, paymentProviders, token } = useContext(ShopContext);
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", address: "", city: "Addis Ababa" });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  if (cartItems.length === 0) { navigate("/cart"); return null; }

  // Guest users must log in before placing an order
  if (!token) {
    return (
      <div className="max-w-md mx-auto px-5 py-24 text-center">
        <div className="bg-white border border-border rounded-2xl shadow-card p-10">
          <h2 className="font-display text-2xl font-bold mb-3">Sign in to checkout</h2>
          <p className="text-stone text-sm mb-6">You need to be signed in to place an order. Your cart will be saved.</p>
          <a
            href="/login"
            className="inline-block bg-primary text-white px-8 py-3.5 rounded-xl font-semibold text-sm hover:bg-primaryDark transition-colors"
          >
            Sign in
          </a>
          <p className="text-stone text-xs mt-4">
            No account? <a href="/login" className="text-primary underline">Create one — it's free</a>
          </p>
        </div>
      </div>
    );
  }

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleConfirm = async () => {
    setProcessing(true);
    setError("");
    try {
      const items = cartItems.map(({ id, size, qty, product }) => ({
        id,
        name: product.name,
        price: product.price,
        image: Array.isArray(product.image) ? product.image[0] : product.image,
        size,
        quantity: qty,
      }));

      const address = { name: form.name, phone: form.phone, street: form.address, city: form.city };
      const amount = cartTotal + 150;

      if (method?.id === "chapa") {
        // Redirect to Chapa checkout
        const data = await placeOrderChapa(userId, items, amount, address);
        if (data.success && data.checkout_url) {
          clearCart();
          window.location.href = data.checkout_url; // redirect to Chapa
        } else {
          setError(data.message || "Failed to initialize payment");
        }
      } else {
        // COD or manual payment
        const data = await placeOrderCOD(userId, items, amount, address);
        if (data.success) {
          clearCart();
          navigate("/order-success", { state: { order: data.order } });
        } else {
          setError(data.message || "Failed to place order");
        }
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const inputClass = "w-full border border-border bg-paper2 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary";

  return (
    <div className="max-w-5xl mx-auto px-5 md:px-8 py-12">
      <h1 className="font-display text-4xl font-bold mb-10">Checkout</h1>



      {/* Steps */}
      <div className="flex items-center gap-3 mb-10 text-sm">
        {["Details", "Payment", "Confirm"].map((s, i) => (
          <div key={s} className="flex items-center gap-3">
            <span className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold ${
              step === i + 1 ? "bg-primary text-white" : step > i + 1 ? "bg-success/10 text-success" : "bg-surface text-stoneLight"
            }`}>
              {step > i + 1 ? <HiCheck size={18} /> : i + 1}
            </span>
            <span className={step === i + 1 ? "text-ink font-medium" : "text-stone"}>{s}</span>
            {i < 2 && <span className="w-8 h-px bg-border" />}
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-12">
        <div className="md:col-span-2">
          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input required value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Full name" className={inputClass} />
                <input required value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="Phone (09xx xxx xxx)" className={inputClass} />
              </div>
              <input required value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="Street address / Kebele" className={inputClass} />
              <input required value={form.city} onChange={(e) => update("city", e.target.value)} placeholder="City" className={inputClass} />
              <button
                onClick={() => form.name && form.phone && form.address && setStep(2)}
                className="bg-primary text-white px-8 py-3.5 rounded-xl font-semibold text-sm hover:bg-primaryDark transition-colors"
              >Continue to payment</button>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div>
              <p className="text-stone text-sm mb-4">Choose how you'd like to pay.</p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {paymentProviders.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setMethod(p)}
                    className={`text-left border rounded-xl p-4 transition-all ${method?.id === p.id ? "border-primary ring-2 ring-primary/20 bg-primaryLight" : "border-border bg-white hover:border-primary/40"}`}
                  >
                    <span className="font-display font-semibold text-base block" style={{ color: p.color }}>{p.name}</span>
                    <span className="text-xs text-stone block mt-1 leading-relaxed">{p.note}</span>
                    {p.id === "chapa" && (
                      <span className="inline-block mt-2 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">✓ Secure payment</span>
                    )}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="border border-border rounded-xl px-6 py-3 font-semibold text-sm hover:bg-surface transition-colors">Back</button>
                <button
                  onClick={() => method && setStep(3)}
                  disabled={!method}
                  className="bg-primary text-white rounded-xl px-8 py-3 font-semibold text-sm hover:bg-primaryDark transition-colors disabled:opacity-40"
                >Review order</button>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div>
              {error && <p className="text-danger text-sm mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-2">{error}</p>}
              <div className="border border-border bg-white rounded-xl p-5 mb-4 shadow-card">
                <h3 className="font-display font-semibold mb-2">Deliver to</h3>
                <p className="text-sm text-stone">{form.name} · {form.phone}</p>
                <p className="text-sm text-stone">{form.address}, {form.city}</p>
              </div>
              <div className="border border-border bg-white rounded-xl p-5 mb-6 shadow-card">
                <h3 className="font-display font-semibold mb-2">Payment</h3>
                <p className="text-sm font-medium" style={{ color: method?.color }}>{method?.name}</p>
                {method?.id === "chapa" && (
                  <p className="text-xs text-stone mt-1">You'll be redirected to Chapa's secure payment page.</p>
                )}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="border border-border rounded-xl px-6 py-3 font-semibold text-sm hover:bg-surface transition-colors">Back</button>
                <button
                  onClick={handleConfirm}
                  disabled={processing}
                  className="bg-primary text-white rounded-xl px-8 py-3 font-semibold text-sm hover:bg-primaryDark transition-colors disabled:opacity-60"
                >
                  {processing ? "Processing…" : method?.id === "chapa" ? `Pay ETB ${(cartTotal + 150).toLocaleString()} via Chapa` : `Confirm — ${currency} ${(cartTotal + 150).toLocaleString()}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="bg-white border border-border rounded-2xl p-6 shadow-card h-fit sticky top-24">
          <h2 className="font-display text-lg font-bold mb-4">Order summary</h2>
          <div className="divide-y divide-border mb-4">
            {cartItems.map(({ id, size, qty, product }) => (
              <div key={`${id}-${size}`} className="flex justify-between py-2 text-sm">
                <span>{product.name} × {qty}</span>
                <span className="font-mono font-medium">{currency} {(product.price * qty).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between"><span className="text-stone">Subtotal</span><span>{currency} {cartTotal.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-stone">Delivery</span><span>{currency} 150</span></div>
            <div className="flex justify-between border-t border-border pt-3 font-bold text-base">
              <span>Total</span><span>{currency} {(cartTotal + 150).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
