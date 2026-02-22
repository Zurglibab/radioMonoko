const Categories = () => {
    const categories = [
        { name: "Jazz & Blues", count: "42 stations", color: "from-amber-900/20" },
        { name: "Électronique", count: "128 stations", color: "from-rose-900/20" },
        { name: "Rock & Indie", count: "86 stations", color: "from-neutral-800" },
        { name: "Talk & Infos", count: "35 stations", color: "from-emerald-900/20" },
    ];

    return (
        <section className="max-w-6xl mx-auto px-6 mb-24">
            <div className="flex items-baseline gap-4 mb-10">
                <h2 className="text-4xl font-black uppercase tracking-tighter text-rose-600">Explorez</h2>
                <div className="h-px flex-grow bg-white/10"></div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {categories.map((cat, i) => (
                    <div key={i} className={`group relative h-40 rounded-2xl bg-gradient-to-br ${cat.color} to-neutral-900 border border-white/5 hover:border-rose-600/30 transition-all cursor-pointer overflow-hidden p-6 flex flex-col justify-end`}>
                        <h3 className="text-xl font-bold uppercase tracking-tight group-hover:text-rose-500 transition-colors">{cat.name}</h3>
                        <p className="text-xs text-neutral-500 uppercase tracking-widest mt-1">{cat.count}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Categories;