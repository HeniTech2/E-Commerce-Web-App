import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { loginUser, registerUser } from "../api";

const Login = () => {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useContext(ShopContext);
  const navigate = useNavigate();
  const inputClass =
    "w-full border border-border bg-paper2 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data =
        mode === "login"
          ? await loginUser(form.email, form.password)
          : await registerUser(form.name, form.email, form.password);

      if (data.success) {
        login(data.token);
        navigate("/");
      } else {
        setError(data.message || "Something went wrong");
      }
    } catch {
      setError("Could not connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-5 py-20">
      <div className="bg-white border border-border rounded-2xl shadow-card p-8">
        <span className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center font-display font-bold text-sm mx-auto mb-6">
          MQ
        </span>
        <h1 className="font-display text-3xl font-bold text-center mb-8">
          {mode === "login" ? "Welcome back" : "Create an account"}
        </h1>
        {error && (
          <p className="text-danger text-sm text-center mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
            {error}
          </p>
        )}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <input
              required
              placeholder="Full name"
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          )}
          <input
            required
            type="email"
            placeholder="Email"
            className={inputClass}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            required
            type="password"
            placeholder="Password"
            className={inputClass}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <button
            disabled={loading}
            className="w-full bg-primary text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-primaryDark transition-colors disabled:opacity-60"
          >
            {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>
        <p className="text-center text-sm text-stone mt-6">
          {mode === "login" ? "New to Marqato? " : "Already have an account? "}
          <button
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
            className="text-primary font-medium hover:underline"
          >
            {mode === "login" ? "Create one" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
