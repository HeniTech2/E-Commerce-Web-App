import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-ink text-white mt-24">
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <span className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-display font-bold text-xs">MQ</span>
            <span className="font-display text-xl font-bold">Marqato</span>
          </div>
          <p className="text-stoneLight text-sm leading-relaxed max-w-xs">
            Goods from Addis Ababa's open-air market, brought to your door. Every piece made by hand, every story worth telling.
          </p>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold mb-4">Shop</h4>
          <ul className="space-y-2 text-sm text-stoneLight">
            <li><Link to="/shop" className="hover:text-white transition-colors">All products</Link></li>
            <li><Link to="/shop?cat=habesha" className="hover:text-white transition-colors">Habesha wear</Link></li>
            <li><Link to="/shop?cat=coffee" className="hover:text-white transition-colors">Coffee & ceremony</Link></li>
            <li><Link to="/shop?cat=jewelry" className="hover:text-white transition-colors">Jewelry</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold mb-4">Support</h4>
          <ul className="space-y-2 text-sm text-stoneLight">
            <li><Link to="/contact" className="hover:text-white transition-colors">Contact us</Link></li>
            <li><Link to="/orders" className="hover:text-white transition-colors">Track an order</Link></li>
            <li><Link to="/about" className="hover:text-white transition-colors">Our story</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold mb-4">We accept</h4>
          <div className="flex flex-wrap gap-2">
            {["telebirr", "CBE Birr", "Awash Bank", "BoA"].map((p) => (
              <span key={p} className="border border-white/15 rounded-full px-3 py-1 text-xs text-stoneLight font-medium">
                {p}
              </span>
            ))}
          </div>
          <p className="text-stoneLight text-xs mt-4">Addis Ababa · Mon–Sat, 9:00–18:00</p>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-stoneLight">
        © {new Date().getFullYear()} Marqato — made with care in Addis Ababa
      </div>
    </footer>
  );
};

export default Footer;
