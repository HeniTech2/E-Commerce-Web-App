import { useState, useEffect, useContext } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { HiCheck, HiOutlineClipboardCopy } from "react-icons/hi";
import { ShopContext, currency } from "../context/ShopContext";
import { getOrderById } from "../api";

const CopyableRef = ({ value }) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (_) {
      // Clipboard API may be unavailable — fail silently
    }
  };

  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 font-mono text-xs bg-surface border border-border rounded-lg px-2.5 py-1 hover:border-primary/40 transition-colors"
      title="Click to copy"
    >
      {value}
      {copied ? (
        <HiCheck size={13} className="text-success shrink-0" />
      ) : (
        <HiOutlineClipboardCopy size={13} className="text-stoneLight shrink-0" />
      )}
    </button>
  );
};

const OrderSuccess = () => {
  const { state } = useLocation();
  const [searchParams] = useSearchParams();
  const { token } = useContext(ShopContext);

  const [order, setOrder] = useState(state?.order || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If we have the order from router state, no fetch needed
    if (order) return;

    // On reload or Chapa redirect, fetch by orderId query param
    const orderId = searchParams.get("orderId");
    if (!orderId || !token) return;

    setLoading(true);
    getOrderById(orderId)
      .then((data) => {
        if (data.success) setOrder(data.order);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-24 text-center text-stone">
        Loading order details…
      </div>
    );
  }

  const isChapa = order?.paymentMethod === "Chapa";

  return (
    <div className="max-w-2xl mx-auto px-5 py-24 text-center">
      <div className="w-16 h-16 rounded-full bg-success/10 text-success flex items-center justify-center mx-auto mb-6">
        <HiCheck size={32} />
      </div>
      <h1 className="font-display text-4xl font-bold mb-3">Order confirmed</h1>
      <p className="text-stone mb-8">
        {order
          ? `Your order ${order.id} is being prepared. We'll send updates to your phone.`
          : "Thanks for shopping with us."}
      </p>

      {order && (
        <div className="bg-white border border-border rounded-2xl shadow-card p-6 text-left mb-8">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-stone">Order ID</span>
            <span className="font-mono font-medium">{order.id}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-stone">Paid via</span>
            <span className="font-medium">{order.paymentMethod}</span>
          </div>
          {isChapa && order.txRef && (
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-stone">Transaction ID</span>
              <CopyableRef value={order.txRef} />
            </div>
          )}
          <div className="flex justify-between text-sm mb-2">
            <span className="text-stone">Payment status</span>
            <span className={`font-medium ${order.payment ? "text-success" : "text-danger"}`}>
              {order.payment ? "Paid" : "Pending"}
            </span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-stone">Status</span>
            <span className="font-medium">{order.status}</span>
          </div>
          <div className="flex justify-between text-sm font-bold border-t border-border pt-3 mt-1">
            <span>Total</span>
            <span className="font-mono">{currency} {order.amount?.toLocaleString()}</span>
          </div>
          {isChapa && order.txRef && (
            <p className="text-xs text-stoneLight mt-4 leading-relaxed">
              Keep this transaction ID as proof of payment. If you paid via CBE through Chapa and have any issue with your order, share this ID with our support team.
            </p>
          )}
        </div>
      )}

      <div className="flex gap-4 justify-center">
        <Link
          to="/orders"
          className="bg-primary text-white px-7 py-3.5 rounded-xl font-semibold text-sm hover:bg-primaryDark transition-colors shadow-card"
        >
          View orders
        </Link>
        <Link
          to="/shop"
          className="border border-border rounded-xl px-7 py-3.5 font-semibold text-sm hover:bg-surface transition-colors"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;