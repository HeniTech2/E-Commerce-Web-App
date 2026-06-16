import { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShopContext, currency } from "../context/ShopContext";

const statusStyle = (status) => {
  switch (status) {
    case "Delivered": return "bg-success/10 text-success";
    case "Shipped": return "bg-primaryLight text-primary";
    case "Packed": return "bg-warning/10 text-warning";
    default: return "bg-surface text-stone";
  }
};

const Orders = () => {
  const { orders, reloadOrders, token } = useContext(ShopContext);

  useEffect(() => {
    reloadOrders();
  }, [reloadOrders]);

  if (!token) {
    return (
      <div className="max-w-7xl mx-auto px-5 py-24 text-center">
        <h1 className="font-display text-3xl font-bold mb-4">Sign in to view orders</h1>
        <Link to="/login" className="bg-primary text-white px-7 py-3.5 rounded-xl font-semibold text-sm hover:bg-primaryDark transition-colors shadow-card">
          Sign in
        </Link>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-5 py-24 text-center">
        <h1 className="font-display text-3xl font-bold mb-4">No orders yet</h1>
        <p className="text-stone mb-6">Once you place an order, it'll show up here.</p>
        <Link to="/shop" className="bg-primary text-white px-7 py-3.5 rounded-xl font-semibold text-sm hover:bg-primaryDark transition-colors shadow-card">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-5 md:px-8 py-12">
      <h1 className="font-display text-4xl font-bold mb-10">Your orders</h1>
      <div className="space-y-4">
        {orders.map((o) => (
          <div key={o.id} className="bg-white border border-border rounded-2xl shadow-card p-5">
            <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
              <span className="font-mono font-semibold text-sm">{o.id}</span>
              <span className="text-stone text-xs">{new Date(o.date).toLocaleDateString()}</span>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusStyle(o.status)}`}>{o.status}</span>
            </div>
            <div className="divide-y divide-border">
              {Array.isArray(o.items) && o.items.map((it, idx) => (
                <div key={idx} className="flex gap-4 py-3 items-center">
                  {it.image && <img src={it.image} alt={it.name} className="w-14 h-16 object-cover rounded-xl" />}
                  <div className="flex-1">
                    <p className="font-display font-medium">{it.name}</p>
                    <p className="text-xs text-stone">Qty {it.quantity || it.qty}</p>
                  </div>
                  <span className="font-mono text-sm font-medium">{currency} {(it.price * (it.quantity || it.qty)).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-3 pt-3 border-t border-border text-sm">
              <span className="text-stone">via {o.paymentMethod}</span>
              <span className="font-bold font-mono">{currency} {o.amount?.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
