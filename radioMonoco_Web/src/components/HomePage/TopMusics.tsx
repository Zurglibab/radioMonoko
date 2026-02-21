import { IoMdArrowDropright } from "react-icons/io";

const TopMusics = () => {
    const tracks = [
        { title: "Last Night", artist: "Morgan Wallen", country: "USA", trend: "+2", rank: "01" },
        { title: "Cruel Summer", artist: "Taylor Swift", country: "USA", trend: "=", rank: "02" },
        { title: "Houdini", artist: "Dua Lipa", country: "UK", trend: "+5", rank: "03" },
        { title: "Greedy", artist: "Tate McRae", country: "CAN", trend: "-1", rank: "04" },
        { title: "Water", artist: "Tyla", country: "RSA", trend: "NEW", rank: "05" },
    ];

    return (
        <section className="max-w-6xl mx-auto px-6 mb-24">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-8 h-[1px] bg-rose-600"></span>
                        <span className="text-xs font-bold uppercase tracking-[0.4em] text-rose-600">Global Ranking</span>
                    </div>
                    <h2 className="text-5xl font-black tracking-tighter uppercase leading-none">
                        Top Monde <br/> <span className="text-neutral-500 italic font-light text-4xl">du moment</span>
                    </h2>
                </div>
                <div className="text-right">
                    <p className="text-neutral-500 font-mono text-[10px] uppercase tracking-widest">Basé sur 2500+ radios</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
                {tracks.map((track, i) => (
                    <div key={i} className="group flex items-center p-4 md:p-8 rounded-2xl bg-neutral-900/30 hover:bg-white/[0.05] transition-all border border-white/5">
                        <div className="relative w-16">
                            <span className="text-3xl font-black tracking-tighter group-hover:text-rose-600 transition-colors">{track.rank}</span>
                        </div>
                        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 items-center">
                            <div>
                                <h4 className="text-xl font-black tracking-tight uppercase leading-none mb-1 group-hover:text-rose-50 transition-colors">{track.title}</h4>
                                <p className="text-neutral-500 text-sm uppercase tracking-widest font-medium">{track.artist}</p>
                            </div>
                            <div className="flex items-center md:justify-end gap-8 mt-4 md:mt-0">
                                <div className="flex flex-col items-start md:items-end">
                                    <span className="text-[10px] text-neutral-600 uppercase font-bold tracking-widest">Origine</span>
                                    <span className="text-xs font-bold text-neutral-400">{track.country}</span>
                                </div>
                                <div className="w-16 text-right">
                                    <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded ${
                                        track.trend === "NEW" ? "bg-rose-600 text-white" :
                                            track.trend.startsWith("+") ? "text-emerald-500" :
                                                track.trend === "=" ? "text-neutral-500" : "text-rose-500"
                                    }`}>{track.trend}</span>
                                </div>
                            </div>
                        </div>
                        <button className="ml-6 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block cursor-pointer">
                            <div className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all shadow-lg">
                                <span className="text-3xl flex items-center justify-center translate-x-[1px]"><IoMdArrowDropright /></span>
                            </div>
                        </button>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default TopMusics;