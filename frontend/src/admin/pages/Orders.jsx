import { useState, useEffect } from "react";
import { getAllOrders, updateOrderStatus } from "../../api";
import { currency } from "../../context/ShopContext";

const STATUSES = ["Order Placed", "Packing", "Shipped", "Out for delivery", "Delivered"];

const statusStyle = (status) => {
  switch (status) {
    case "Delivered": return "bg-success/10 text-success";
    case "Shipped": return "bg-primaryLight text-primary";
    case "Packing": return "bg-warning/10 text-warning";
    default: return "bg-surface text-stone";
  }
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllOrders().then((data) => {
      if (data.success) setOrders(data.orders || []);
      setLoading(false);
    });
  }, []);

  const handleStatusChange = async (orderId, status) => {
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o));
    await updateOrderStatus(orderId, status);
  };

  if (loading) return <div className="p-8 text-stone text-sm">Loading orders…</div>;

  return (
    <div className="p-8">
      <h1 className="font-display text-3xl font-bold mb-1">Orders</h1>
      <p className="text-stone text-sm mb-8">{orders.length} orders total</p>

      {orders.length === 0 ? (
        <div className="bg-white border border-border rounded-2xl shadow-card p-8 text-center text-stone text-sm">
          No orders yet — they'll show up here once customers check out.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="bg-white border border-border rounded-2xl shadow-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div>
                  <p className="font-display font-bold font-mono text-sm">{o.id}</p>
                  <p className="text-xs text-stone">{new Date(o.date).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusStyle(o.status)}`}>{o.status}</span>
                  <span className="text-sm text-stone">{o.paymentMethod}</span>
                  <select
                    value={o.status}
                    onChange={(e) => handleStatusChange(o.id, e.target.value)}
                    className="border border-border bg-paper2 rounded-lg px-3 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Items */}
              {Array.isArray(o.items) && o.items.length > 0 && (
                <div className="divide-y divide-border border-t border-border pt-3 mb-3">
                  {o.items.map((it, idx) => (
                    <div key={idx} className="flex items-center gap-3 py-2 text-sm">
                      {it.image && <img src={it.image} alt={it.name} className="w-10 h-12 object-cover rounded-lg" />}
                      <span className="flex-1">{it.name}</span>
                      <span className="text-stone text-xs">× {it.quantity}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Address */}
              {o.address && (
                <p className="text-xs text-stone mb-2">
                  {o.address.name} · {o.address.phone} · {o.address.street}, {o.address.city}
                </p>
              )}

              <div className="flex justify-between border-t border-border pt-3 text-sm">
                <span className="text-stone">Total</span>
                <span className="font-bold font-mono">{currency} {o.amount?.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
