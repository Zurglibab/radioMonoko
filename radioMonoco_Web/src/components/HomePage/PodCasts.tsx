const PostCasts = () => {
    const newsItems = [
        "Les 10 webradios japonaises à découvrir absolument.",
        "Comment le format 'Talk' explose de nouveau en 2026.",
        "Interview : Le programmateur de NTS nous livre ses secrets."
    ];

    return (
        <section className="max-w-6xl mx-auto px-6 mb-24 border-t border-white/5 pt-16">
        <h2 className="text-sm font-bold uppercase tracking-[0.4em] text-neutral-500 mb-12">PostCasts</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
    <div className="group cursor-pointer">
    <div className="aspect-video bg-neutral-900 rounded-3xl mb-6 overflow-hidden border border-white/5">
    <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-950 group-hover:scale-105 transition-transform duration-700" />
        </div>
        <h3 className="text-2xl font-bold mb-3 tracking-tight group-hover:text-rose-400 transition-colors">Pourquoi la radio FM ne mourra jamais face au streaming ?</h3>
        <p className="text-neutral-400 text-sm leading-relaxed">Une analyse sur l'attachement des auditeurs à la curation humaine face aux algorithmes.</p>
    </div>
    <div className="space-y-8">
        {newsItems.map((news, i) => (
                <div key={i} className="group cursor-pointer border-l border-white/10 pl-6 hover:border-rose-600 transition-colors">
            <h3 className="text-lg font-bold group-hover:text-rose-500 transition-colors">{news}</h3>
                <p className="text-[10px] text-neutral-500 uppercase mt-2 font-bold tracking-widest">Lecture : 4 min</p>
    </div>
))}
    </div>
    </div>
    </section>
);
};

export default PostCasts;