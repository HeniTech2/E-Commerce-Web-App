import { useContext } from "react";
import { Link } from "react-router-dom";
import { HiArrowRight } from "react-icons/hi";
import { ShopContext } from "../context/ShopContext";
import ProductCard from "../components/ProductCard";

const categoryIcons = {
  habesha: "👗",
  coffee: "☕",
  jewelry: "💎",
  home: "🏠",
  leather: "👜",
};

const Home = () => {
  const { products, categories, paymentProviders } = useContext(ShopContext);
  const bestsellers = products.filter((p) => p.bestseller).slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <section className="bg-paper2 border-b border-border">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block bg-primaryLight text-primary text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wide">
              Addis Ababa · New for 2026
            </span>
            <h1 className="font-display text-5xl md:text-6xl font-bold leading-[1.05] mt-4">
              Everything from the market,
              <span className="text-primary"> nothing</span> like the market.
            </h1>
            <p className="text-stone mt-6 text-base md:text-lg max-w-md leading-relaxed">
              Hand-picked goods from Merkato's stalls — habesha wear, coffee ceremony sets,
              jewelry and leatherwork — shipped across Ethiopia and beyond.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <Link to="/shop" className="bg-primary text-white px-7 py-3.5 rounded-xl font-semibold text-sm hover:bg-primaryDark transition-colors shadow-card">
                Browse products
              </Link>
              <Link to="/about" className="flex items-center gap-1.5 font-semibold text-sm text-ink hover:text-primary transition-colors">
                Our story <HiArrowRight />
              </Link>
            </div>
          </div>

          {/* Product preview grid */}
          <div className="grid grid-cols-2 gap-4">
            {products[0] && <div className="self-start"><ProductCard product={products[0]} /></div>}
            {products[3] && <div className="self-end"><ProductCard product={products[3]} /></div>}
            {products[8] && <div className="col-span-2"><ProductCard product={products[8]} /></div>}
          </div>
        </div>
      </section>

      {/* Category cards */}
      <section className="max-w-7xl mx-auto px-5 md:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-3xl font-bold">Browse by category</h2>
          <Link to="/shop" className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
            View all <HiArrowRight />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {categories.map((c) => (
            <Link key={c.id} to={`/shop?cat=${c.id}`} className="group flex flex-col items-center gap-3 text-center bg-white border border-border rounded-2xl p-5 shadow-card hover:shadow-cardHover hover:border-primary/30 transition-all">
              <span className="w-12 h-12 rounded-xl bg-primaryLight flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                {categoryIcons[c.id]}
              </span>
              <span className="font-display text-sm font-semibold">{c.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Bestsellers */}
      <section className="max-w-7xl mx-auto px-5 md:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-3xl font-bold">Best pickings this week</h2>
          <Link to="/shop" className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
            View all <HiArrowRight />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
          {bestsellers.map((p) => (
            <ProductCard key={p.id || p._id} product={p} />
          ))}
        </div>
      </section>

      {/* Payment trust strip */}
      <section className="bg-ink text-white">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-14 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-block bg-white/10 text-accent text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wide">
              Pay your way
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-3">Checkout with the wallets and banks you already use.</h2>
            <p className="text-stoneLight mt-3 max-w-md text-sm leading-relaxed">
              telebirr, CBE Birr, Awash Bank and Bank of Abyssinia — pick one at checkout and pay in seconds.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {paymentProviders.map((p) => (
              <div key={p.id} className="bg-ink2 rounded-xl p-4 flex flex-col gap-2">
                <span className="font-display text-lg font-semibold" style={{ color: p.color }}>{p.name}</span>
                <span className="text-stoneLight text-xs leading-relaxed">{p.note}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="max-w-7xl mx-auto px-5 md:px-8 py-20 text-center">
        <h2 className="font-display text-3xl md:text-4xl font-bold max-w-xl mx-auto">
          Get first pick of new arrivals from the market.
        </h2>
        <form className="mt-6 flex max-w-md mx-auto gap-2" onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            required
            placeholder="you@example.com"
            className="flex-1 border border-border bg-paper2 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button className="bg-primary text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-primaryDark transition-colors">
            Join
          </button>
        </form>
      </section>
    </div>
  );
};

export default Home;
