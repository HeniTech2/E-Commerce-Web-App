import { useState } from "react";
import { HiOutlineLocationMarker, HiOutlinePhone, HiOutlineMail, HiOutlineClock, HiCheck } from "react-icons/hi";
import { api } from "../api";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");

  const inputClass = "w-full border border-border bg-paper2 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary";

  const details = [
    { icon: HiOutlineLocationMarker, label: "Visit", value: "Merkato, Addis Ababa, Ethiopia" },
    { icon: HiOutlinePhone, label: "Call", value: "+251 9XX XXX XXX" },
    { icon: HiOutlineMail, label: "Email", value: "hello@marqato.et" },
    { icon: HiOutlineClock, label: "Hours", value: "Mon – Sat, 9:00 – 18:00" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      const data = await api("/api/user/contact", {
        method: "POST",
        body: JSON.stringify(form),
      });
      if (data.success) {
        setStatus("success");
        setForm({ name: "", email: "", message: "" });
      } else {
        setStatus("error");
        setErrorMsg(data.message || "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-5 md:px-8 py-16 grid md:grid-cols-2 gap-12">
      <div>
        <span className="inline-block bg-primaryLight text-primary text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wide">Get in touch</span>
        <h1 className="font-display text-4xl md:text-5xl font-bold mt-3 mb-6">Questions about an order or a product?</h1>
        <div className="space-y-4">
          {details.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primaryLight flex items-center justify-center shrink-0">
                <Icon className="text-primary" size={18} />
              </div>
              <div>
                <p className="text-stone text-xs uppercase tracking-wide mb-0.5">{label}</p>
                <p className="font-medium text-sm">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <form className="bg-white border border-border rounded-2xl shadow-card p-6 space-y-4" onSubmit={handleSubmit}>

        {/* Success state */}
        {status === "success" && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <HiCheck className="text-green-600" size={18} />
            </div>
            <div>
              <p className="text-green-800 font-semibold text-sm">Message sent!</p>
              <p className="text-green-600 text-xs">We'll get back to you within 24 hours.</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {status === "error" && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        <input
          required
          placeholder="Your name"
          className={inputClass}
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
        <input
          required
          type="email"
          placeholder="Email"
          className={inputClass}
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        />
        <textarea
          required
          placeholder="Message"
          rows={5}
          className={inputClass}
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="bg-primary text-white px-8 py-3.5 rounded-xl font-semibold text-sm hover:bg-primaryDark transition-colors w-full disabled:opacity-60"
        >
          {status === "loading" ? "Sending…" : "Send message"}
        </button>
      </form>
    </div>
  );
};

export default Contact;
