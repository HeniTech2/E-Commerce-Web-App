import { useContext, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { HiOutlineAdjustments, HiOutlineX, HiOutlineViewGrid, HiOutlineViewList, HiStar } from "react-icons/hi";
import { ShopContext, currency, stockStatus } from "../context/ShopContext";
import ProductCard from "../components/ProductCard";

const PRICE_MAX = 4500;

const Shop = () => {
  const { products, categories, addToCart } = useContext(ShopContext);
  const [params, setParams] = useSearchParams();
  const activeCat = params.get("cat") || "";
  const query = params.get("q") || "";
  const [sort, setSort] = useState("default");
  const [priceMax, setPriceMax] = useState(PRICE_MAX);
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [view, setView] = useState("grid");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = [...products];
    if (activeCat) list = list.filter((p) => p.category === activeCat);
    if (query) list = list.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));
    list = list.filter((p) => p.price <= priceMax);
    if (minRating > 0) list = list.filter((p) => p.rating >= minRating);
    if (inStockOnly) list = list.filter((p) => (p.stock ?? 99) > 0);
    if (sort === "low") list.sort((a, b) => a.price - b.price);
    if (sort === "high") list.sort((a, b) => b.price - a.price);
    if (sort === "rating") list.sort((a, b) => b.rating - a.rating);
    return list;
  }, [products, activeCat, query, sort, priceMax, minRating, inStockOnly]);

  const setCat = (cat) => {
    const next = new URLSearchParams(params);
    if (cat) next.set("cat", cat); else next.delete("cat");
    next.delete("q");
    setParams(next);
  };

  const resetFilters = () => {
    setPriceMax(PRICE_MAX);
    setMinRating(0);
    setInStockOnly(false);
    setSort("default");
  };

  const activeFilterCount = (activeCat ? 1 : 0) + (priceMax < PRICE_MAX ? 1 : 0) + (minRating > 0 ? 1 : 0) + (inStockOnly ? 1 : 0);

  const FilterPanel = () => (
    <>
      <div className="mb-7">
        <h3 className="font-display text-sm font-semibold mb-3">Category</h3>
        <ul className="space-y-1.5">
          <li>
            <button
              onClick={() => setCat("")}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${!activeCat ? "bg-primaryLight text-primary font-medium" : "text-stone hover:bg-surface"}`}
            >
              All categories
            </button>
          </li>
          {categories.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => setCat(c.id)}
                className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${activeCat === c.id ? "bg-primaryLight text-primary font-medium" : "text-stone hover:bg-surface"}`}
              >
                {c.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-7">
        <h3 className="font-display text-sm font-semibold mb-3">Max price</h3>
        <input
          type="range"
          min="500"
          max={PRICE_MAX}
          step="50"
          value={priceMax}
          onChange={(e) => setPriceMax(Number(e.target.value))}
          className="w-full accent-primary"
        />
        <div className="flex justify-between text-xs text-stone mt-1 font-mono">
          <span>{currency} 500</span>
          <span className="font-semibold text-ink">{currency} {priceMax.toLocaleString()}</span>
        </div>
      </div>

      <div className="mb-7">
        <h3 className="font-display text-sm font-semibold mb-3">Minimum rating</h3>
        <div className="flex flex-col gap-1.5">
          {[4.5, 4, 3].map((r) => (
            <button
              key={r}
              onClick={() => setMinRating(minRating === r ? 0 : r)}
              className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-colors ${minRating === r ? "bg-primaryLight text-primary font-medium" : "text-stone hover:bg-surface"}`}
            >
              <HiStar className="text-warning" size={14} />
              {r}+ & up
            </button>
          ))}
        </div>
      </div>

      <div className="mb-7">
        <h3 className="font-display text-sm font-semibold mb-3">Availability</h3>
        <label className="flex items-center gap-2.5 text-sm text-stone cursor-pointer">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="w-4 h-4 rounded accent-primary"
          />
          In stock only
        </label>
      </div>

      {activeFilterCount > 0 && (
        <button onClick={resetFilters} className="w-full text-center text-sm font-medium text-primary border border-primaryLight rounded-lg py-2 hover:bg-primaryLight transition-colors">
          Clear all filters
        </button>
      )}
    </>
  );

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Shop</span>
          <h1 className="font-display text-3xl md:text-4xl font-bold mt-1">
            {query ? `Results for "${query}"` : activeCat ? categories.find((c) => c.id === activeCat)?.label : "All products"}
          </h1>
          <p className="text-stone text-sm mt-1">{filtered.length} item{filtered.length !== 1 ? "s" : ""} found</p>
        </div>

        <div className="flex items-center gap-3">
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="border border-border bg-white rounded-lg px-3 py-2.5 text-sm font-medium shadow-card focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option value="default">Sort: Featured</option>
            <option value="low">Price: Low to high</option>
            <option value="high">Price: High to low</option>
            <option value="rating">Top rated</option>
          </select>

          <div className="hidden sm:flex items-center border border-border rounded-lg bg-white shadow-card overflow-hidden">
            <button onClick={() => setView("grid")} className={`p-2.5 transition-colors ${view === "grid" ? "bg-primaryLight text-primary" : "text-stone hover:bg-surface"}`} aria-label="Grid view">
              <HiOutlineViewGrid size={18} />
            </button>
            <button onClick={() => setView("list")} className={`p-2.5 transition-colors ${view === "list" ? "bg-primaryLight text-primary" : "text-stone hover:bg-surface"}`} aria-label="List view">
              <HiOutlineViewList size={18} />
            </button>
          </div>

          <button onClick={() => setFiltersOpen(true)} className="lg:hidden flex items-center gap-2 border border-border bg-white rounded-lg px-3 py-2.5 text-sm font-medium shadow-card">
            <HiOutlineAdjustments size={18} />
            Filters
            {activeFilterCount > 0 && <span className="bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{activeFilterCount}</span>}
          </button>
        </div>
      </div>

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {activeCat && (
            <span className="flex items-center gap-1.5 bg-primaryLight text-primary text-xs font-medium px-3 py-1.5 rounded-full">
              {categories.find((c) => c.id === activeCat)?.label}
              <HiOutlineX className="cursor-pointer" size={14} onClick={() => setCat("")} />
            </span>
          )}
          {priceMax < PRICE_MAX && (
            <span className="flex items-center gap-1.5 bg-primaryLight text-primary text-xs font-medium px-3 py-1.5 rounded-full">
              Under {currency} {priceMax.toLocaleString()}
              <HiOutlineX className="cursor-pointer" size={14} onClick={() => setPriceMax(PRICE_MAX)} />
            </span>
          )}
          {minRating > 0 && (
            <span className="flex items-center gap-1.5 bg-primaryLight text-primary text-xs font-medium px-3 py-1.5 rounded-full">
              {minRating}+ stars
              <HiOutlineX className="cursor-pointer" size={14} onClick={() => setMinRating(0)} />
            </span>
          )}
          {inStockOnly && (
            <span className="flex items-center gap-1.5 bg-primaryLight text-primary text-xs font-medium px-3 py-1.5 rounded-full">
              In stock only
              <HiOutlineX className="cursor-pointer" size={14} onClick={() => setInStockOnly(false)} />
            </span>
          )}
        </div>
      )}

      <div className="flex gap-10">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="bg-white border border-border rounded-2xl p-5 shadow-card sticky top-24">
            <FilterPanel />
          </div>
        </aside>

        {/* Mobile filter drawer */}
        {filtersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-ink/40" onClick={() => setFiltersOpen(false)} />
            <div className="absolute right-0 top-0 h-full w-80 max-w-[85%] bg-white p-5 overflow-y-auto shadow-dropdown">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display text-lg font-bold">Filters</h2>
                <button onClick={() => setFiltersOpen(false)} aria-label="Close filters">
                  <HiOutlineX size={22} />
                </button>
              </div>
              <FilterPanel />
            </div>
          </div>
        )}

        {/* Results */}
        <div className="flex-1 min-w-0">
          {filtered.length === 0 ? (
            <div className="text-center py-20 bg-surface rounded-2xl border border-border">
              <p className="font-display text-lg font-semibold">No products match your filters</p>
              <p className="text-stone text-sm mt-1">Try adjusting price, rating, or category.</p>
              <button onClick={resetFilters} className="mt-4 text-sm font-medium text-primary">Reset filters</button>
            </div>
          ) : view === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10">
              {filtered.map((p) => (
                <ProductCard key={p.id || p._id} product={p} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filtered.map((p) => {
                const stock = stockStatus(p.stock ?? 99);
                return (
                  <div key={p.id || p._id} className="flex gap-4 bg-white border border-border rounded-2xl p-4 shadow-card">
                    <img src={Array.isArray(p.image) ? p.image[0] : p.image} alt={p.name} className="w-24 h-28 object-cover rounded-xl shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-display font-semibold">{p.name}</h3>
                          <p className="text-xs text-stone uppercase tracking-wide mt-0.5">{p.category}</p>
                        </div>
                        <span className="font-mono font-semibold text-sm whitespace-nowrap">{currency} {p.price.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs">
                        <div className="flex items-center gap-1 text-stone">
                          <HiStar className="text-warning" size={14} />
                          <span className="font-medium text-ink">{p.rating}</span>
                          <span>({p.reviews})</span>
                        </div>
                        <div className={`flex items-center gap-1.5 font-medium ${stock.text}`}>
                          <span className={`stock-dot ${stock.dot}`}></span>
                          {stock.label}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-3">
                        <button
                          onClick={() => (p.stock ?? 99) > 0 && addToCart(p.id || p._id)}
                          disabled={(p.stock ?? 99) <= 0}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${(p.stock ?? 99) <= 0 ? "bg-surface text-stoneLight cursor-not-allowed" : "bg-primary text-white hover:bg-primaryDark"}`}
                        >
                          Add to cart
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
