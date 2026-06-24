import { useContext, useEffect, useState } from "react";
import { ShopContext, currency, stockStatus } from "../../context/ShopContext";
import { getAllOrders } from "../../api";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, BarChart, Bar,
} from "recharts";
import {
  HiOutlineCurrencyDollar, HiOutlineShoppingBag,
  HiOutlineCube, HiOutlineExclamationCircle, HiArrowUp,
} from "react-icons/hi";

const statusStyle = (status) => {
  switch (status) {
    case "Delivered": return "bg-success/10 text-success";
    case "Shipped":   return "bg-primaryLight text-primary";
    case "Packed":    return "bg-warning/10 text-warning";
    default:          return "bg-surface text-stone";
  }
};

const accentClasses = {
  primary: { bg: "bg-primaryLight", text: "text-primary" },
  success: { bg: "bg-success/10",   text: "text-success" },
  warning: { bg: "bg-warning/10",   text: "text-warning" },
};

const StatCard = ({ icon: Icon, label, value, sub, accent = "primary" }) => {
  const a = accentClasses[accent];
  return (
    <div className="bg-white border border-border rounded-2xl shadow-card p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${a.bg} flex items-center justify-center`}>
          <Icon className={a.text} size={18} />
        </div>
        {sub && (
          <span className="flex items-center gap-1 text-xs font-semibold text-success">
            <HiArrowUp size={12} />{sub}
          </span>
        )}
      </div>
      <p className="font-display text-xl sm:text-2xl font-bold truncate">{value}</p>
      <p className="text-xs text-stone mt-1">{label}</p>
    </div>
  );
};

const Dashboard = () => {
  const { products, categories } = useContext(ShopContext);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    getAllOrders().then((data) => {
      if (data.success) setOrders(data.orders || []);
    });
  }, []);

  const revenue   = orders.reduce((s, o) => s + (o.amount || 0), 0);
  const lowStock  = products.filter((p) => p.stock > 0 && p.stock <= 5);
  const outOfStock = products.filter((p) => p.stock <= 0);

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const salesByDay = orders.reduce((acc, o) => {
    const day = days[new Date(o.date).getDay()];
    acc[day] = (acc[day] || 0) + (o.amount || 0);
    return acc;
  }, {});
  const salesData = days.map((day) => ({ day, sales: salesByDay[day] || 0 }));

  const categoryData = categories.map((c) => ({
    name: c.label,
    count: products.filter((p) => p.category === c.id).length,
  }));

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="font-display text-2xl sm:text-3xl font-bold mb-1">Dashboard</h1>
      <p className="text-stone text-sm mb-6 sm:mb-8">Live overview of the store.</p>

      {/* Stat cards — 2 cols on xs, 4 on md+ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <StatCard
          icon={HiOutlineCurrencyDollar}
          label="Revenue"
          value={`${currency} ${revenue.toLocaleString()}`}
          accent="success"
        />
        <StatCard icon={HiOutlineShoppingBag} label="Orders"   value={orders.length} />
        <StatCard icon={HiOutlineCube}        label="Products" value={products.length} accent="primary" />
        <StatCard
          icon={HiOutlineExclamationCircle}
          label="Low / out of stock"
          value={lowStock.length + outOfStock.length}
          accent="warning"
        />
      </div>

      {/* Charts — stacked on mobile, side-by-side on md+ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="md:col-span-2 bg-white border border-border rounded-2xl shadow-card p-4 sm:p-6">
          <h2 className="font-display font-bold mb-4">Orders by day (this week)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="sales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#4F46E5" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#4F46E5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#0F172A" strokeOpacity={0.06} vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11 }}
                stroke="#94A3B8"
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                stroke="#94A3B8"
                axisLine={false}
                tickLine={false}
                width={36}
              />
              <Tooltip
                contentStyle={{ fontSize: 12, border: "1px solid #E2E8F0", borderRadius: 8 }}
              />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#4F46E5"
                fill="url(#sales)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-border rounded-2xl shadow-card p-4 sm:p-6">
          <h2 className="font-display font-bold mb-4">Products by category</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={categoryData} layout="vertical" margin={{ left: 0 }}>
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                width={90}
                tick={{ fontSize: 11 }}
                stroke="#94A3B8"
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{ fontSize: 12, border: "1px solid #E2E8F0", borderRadius: 8 }}
              />
              <Bar dataKey="count" fill="#4F46E5" radius={[0, 6, 6, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent orders — horizontally scrollable on small screens */}
      <div className="bg-white border border-border rounded-2xl shadow-card p-4 sm:p-6">
        <h2 className="font-display font-bold mb-4">Recent orders</h2>
        {orders.length === 0 ? (
          <p className="text-stone text-sm">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-sm min-w-[480px]">
              <thead>
                <tr className="text-left text-stone text-xs uppercase tracking-wide border-b border-border">
                  <th className="py-2 pr-3">Order ID</th>
                  <th className="pr-3">Payment</th>
                  <th className="pr-3">Status</th>
                  <th className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 8).map((o) => (
                  <tr key={o.id} className="border-b border-border/60">
                    <td className="py-3 pr-3 font-mono text-xs truncate max-w-[100px]">
                      {o.id}
                    </td>
                    <td className="pr-3">{o.paymentMethod}</td>
                    <td className="pr-3">
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${statusStyle(o.status)}`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="text-right font-mono whitespace-nowrap">
                      {currency} {o.amount?.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;