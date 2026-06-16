const About = () => {
  return (
    <div className="max-w-4xl mx-auto px-5 md:px-8 py-16">
      <span className="inline-block bg-primaryLight text-primary text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wide">Our story</span>
      <h1 className="font-display text-4xl md:text-5xl font-bold mt-3 mb-8">From the lanes of Merkato to your door</h1>
      <div className="space-y-5 text-stone leading-relaxed text-base">
        <p>
          Merkato is one of the largest open-air markets in Africa — a maze of narrow lanes in Addis Ababa
          where weavers, potters, jewellers and leatherworkers have sold their craft for generations.
        </p>
        <p>
          Marqato started as a way to bring that energy online: real items from real vendors, photographed
          honestly, priced fairly, and delivered with the same care you'd expect walking the stalls yourself.
        </p>
        <p>
          Every product on this site is made by hand in Ethiopia. When you buy from Marqato, the money goes
          straight back to the artisans who made it — no middlemen, no markup games.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-6 mt-12">
        {[
          ["120+", "Artisans"],
          ["9", "Regions"],
          ["7-day", "Returns"],
        ].map(([num, label]) => (
          <div key={label} className="text-center bg-white border border-border rounded-2xl shadow-card py-6">
            <p className="font-display text-3xl font-bold text-primary">{num}</p>
            <p className="text-xs uppercase tracking-wide text-stone mt-1 font-medium">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default About;
