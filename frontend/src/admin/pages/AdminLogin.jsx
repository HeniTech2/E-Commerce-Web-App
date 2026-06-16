import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "../../api";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputClass =
    "w-full bg-ink2 border border-white/15 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-white placeholder:text-stoneLight";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await adminLogin(form.email, form.password);
      if (data.success) {
        localStorage.setItem("marqato_token", data.token);
        navigate("/admin");
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch {
      setError("Could not connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center text-white">
      <form onSubmit={handleSubmit} className="bg-ink2 border border-white/10 rounded-2xl shadow-dropdown p-8 w-full max-w-sm">
        <span className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center font-display font-bold text-sm mb-6 mx-auto">MQ</span>
        <h1 className="font-display text-2xl font-bold text-center mb-1">Marqato Admin</h1>
        <p className="text-stoneLight text-xs text-center mb-6 uppercase tracking-wide">Restricted access</p>
        {error && <p className="text-red-400 text-sm text-center mb-4 bg-red-900/20 border border-red-800/40 rounded-xl px-4 py-2">{error}</p>}
        <div className="space-y-3">
          <input
            required type="email" placeholder="Admin email" className={inputClass}
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            required type="password" placeholder="Password" className={inputClass}
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <button disabled={loading} className="w-full mt-5 bg-primary text-white py-3 rounded-xl text-sm font-semibold hover:bg-primaryDark transition-colors disabled:opacity-60">
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
