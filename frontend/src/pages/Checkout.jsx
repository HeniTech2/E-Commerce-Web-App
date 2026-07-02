import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiCheck } from "react-icons/hi";
import { ShopContext, currency, cbeBankDetails } from "../context/ShopContext";
import { placeOrderCOD, placeOrderChapa, placeOrderCBE } from "../api";

const Checkout = () => {
  const { cartItems, cartTotal, clearCart, userId, paymentProviders, token } = useContext(ShopContext);
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", address: "", city: "Addis Ababa" });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [cbeTxId, setCbeTxId] = useState("");
  const [cbeProof, setCbeProof] = useState(null);
  const [cbeProofPreview, setCbeProofPreview] = useState("");
  const [copied, setCopied] = useState(false);

  if (cartItems.length === 0) { navigate("/cart"); return null; }

  // Not logged in at all
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

  // Logged in as admin — admin accounts cannot place orders
  if (!userId) {
    return (
      <div className="max-w-md mx-auto px-5 py-24 text-center">
        <div className="bg-white border border-border rounded-2xl shadow-card p-10">
          <h2 className="font-display text-2xl font-bold mb-3">Admin accounts can't place orders</h2>
          <p className="text-stone text-sm mb-6">
            You're currently logged in as an admin. To place an order, please log out and sign in with a customer account.
          </p>
          <a
            href="/login"
            className="inline-block bg-primary text-white px-8 py-3.5 rounded-xl font-semibold text-sm hover:bg-primaryDark transition-colors"
          >
            Switch account
          </a>
        </div>
      </div>
    );
  }

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleCbeProofChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCbeProof(file);
    setCbeProofPreview(URL.createObjectURL(file));
  };

  const copyAccountNumber = async () => {
    try {
      await navigator.clipboard.writeText(cbeBankDetails.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API may be unavailable — fail silently
    }
  };

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
        const data = await placeOrderChapa(userId, items, amount, address);
        if (data.success && data.checkout_url) {
          clearCart();
          window.location.href = data.checkout_url;
        } else {
          setError(data.message || "Failed to initialize payment");
        }
      } else if (method?.id === "cbe") {
        if (!cbeTxId.trim()) {
          setError("Please enter the transaction ID from your CBE transfer.");
          setProcessing(false);
          return;
        }
        if (!cbeProof) {
          setError("Please upload a screenshot of your bank transfer.");
          setProcessing(false);
          return;
        }

        const formData = new FormData();
        formData.append("items", JSON.stringify(items));
        formData.append("address", JSON.stringify(address));
        formData.append("amount", amount);
        formData.append("txId", cbeTxId.trim());
        formData.append("txProof", cbeProof);

        const data = await placeOrderCBE(formData);
        if (data.success) {
          clearCart();
          navigate("/order-success", { state: { order: data.order } });
        } else {
          setError(data.message || "Failed to submit order for verification");
        }
      } else {
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

                {method?.id === "cbe" && (
                  <div className="mt-4 space-y-4">
                    <div className="bg-primaryLight border border-primary/20 rounded-xl p-4">
                      <p className="text-xs text-stone mb-3">
                        Transfer <strong>{currency} {(cartTotal + 150).toLocaleString()}</strong> to this CBE account, then fill in the details below.
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-stone">Bank</span>
                          <span className="font-medium">{cbeBankDetails.bankName}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-stone">Account name</span>
                          <span className="font-medium">{cbeBankDetails.accountName}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-stone">Account number</span>
                          <button
                            type="button"
                            onClick={copyAccountNumber}
                            className="font-mono font-semibold bg-white border border-border rounded-lg px-2.5 py-1 hover:border-primary/40 transition-colors"
                            title="Click to copy"
                          >
                            {cbeBankDetails.accountNumber} {copied ? "✓" : "⧉"}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-stone mb-1.5">CBE transaction ID</label>
                      <input
                        value={cbeTxId}
                        onChange={(e) => setCbeTxId(e.target.value)}
                        placeholder="e.g. FT24183XXXXX"
                        className={inputClass}
                      />
                      <p className="text-[11px] text-stoneLight mt-1">Found in your CBE SMS receipt or the CBE Mobile / CBE Birr app.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-stone mb-1.5">Screenshot of the transfer</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCbeProofChange}
                        className="text-xs w-full border border-border bg-paper2 rounded-xl px-3 py-2.5 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-primary file:text-white file:text-xs file:font-semibold file:cursor-pointer cursor-pointer"
                      />
                      {cbeProofPreview && (
                        <img src={cbeProofPreview} alt="Transfer screenshot preview" className="mt-3 max-h-48 rounded-xl border border-border object-contain" />
                      )}
                    </div>

                    <p className="text-[11px] text-stone bg-surface rounded-lg px-3 py-2">
                      Your order will show as <strong>Pending Verification</strong> until we confirm the transfer — usually within a few hours.
                    </p>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="border border-border rounded-xl px-6 py-3 font-semibold text-sm hover:bg-surface transition-colors">Back</button>
                <button
                  onClick={handleConfirm}
                  disabled={processing}
                  className="bg-primary text-white rounded-xl px-8 py-3 font-semibold text-sm hover:bg-primaryDark transition-colors disabled:opacity-60"
                >
                  {processing
                    ? "Processing…"
                    : method?.id === "chapa"
                    ? `Pay ETB ${(cartTotal + 150).toLocaleString()} via Chapa`
                    : method?.id === "cbe"
                    ? "Submit for verification"
                    : `Confirm — ${currency} ${(cartTotal + 150).toLocaleString()}`}
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