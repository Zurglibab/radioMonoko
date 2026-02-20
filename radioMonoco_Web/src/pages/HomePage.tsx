import { useState, useEffect } from "react";
import logo from "../assets/images/icon_large.png";
import LiveRadios from "../components/HomePage/LiveRadios";
import {IoMdArrowDropright} from "react-icons/io";

const HomePage = () => {
    const [hideMainLogo, setHideMainLogo] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setHideMainLogo(window.scrollY > 150);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white pb-20 font-sans">

            <div className={`flex flex-col items-center pt-24 mb-12 transition-all duration-700 ${
                hideMainLogo ? "opacity-0 scale-95" : "opacity-100 scale-100"
            }`}>
                <img src={logo} alt="RadioMonoco Logo" className="w-[400px] h-auto object-contain" />
                <p className="mt-4 text-neutral-500 uppercase tracking-[0.3em] text-[10px] font-bold">L'annuaire des ondes numériques</p>
            </div>

            <LiveRadios />

            <section className="max-w-6xl mx-auto px-6 mb-24">
                <div className="flex items-baseline gap-4 mb-10">
                    <h2 className="text-4xl font-black uppercase tracking-tighter text-rose-600">Explorez</h2>
                    <div className="h-px flex-grow bg-white/10"></div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { name: "Jazz & Blues", count: "42 stations", color: "from-amber-900/20" },
                        { name: "Électronique", count: "128 stations", color: "from-rose-900/20" },
                        { name: "Rock & Indie", count: "86 stations", color: "from-neutral-800" },
                        { name: "Talk & Infos", count: "35 stations", color: "from-emerald-900/20" },
                    ].map((cat, i) => (
                        <div key={i} className={`group relative h-40 rounded-2xl bg-gradient-to-br ${cat.color} to-neutral-900 border border-white/5 hover:border-rose-600/30 transition-all cursor-pointer overflow-hidden p-6 flex flex-col justify-end`}>
                            <h3 className="text-xl font-bold uppercase tracking-tight group-hover:text-rose-500 transition-colors">{cat.name}</h3>
                            <p className="text-xs text-neutral-500 uppercase tracking-widest mt-1">{cat.count}</p>
                        </div>
                    ))}
                </div>
            </section>

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
                    {[
                        { title: "Last Night", artist: "Morgan Wallen", country: "USA", trend: "+2", rank: "01" },
                        { title: "Cruel Summer", artist: "Taylor Swift", country: "USA", trend: "=", rank: "02" },
                        { title: "Houdini", artist: "Dua Lipa", country: "UK", trend: "+5", rank: "03" },
                        { title: "Greedy", artist: "Tate McRae", country: "CAN", trend: "-1", rank: "04" },
                        { title: "Water", artist: "Tyla", country: "RSA", trend: "NEW", rank: "05" },
                    ].map((track, i) => (
                        <div
                            key={i}
                            className="group flex items-center p-4 md:p-8 rounded-2xl bg-neutral-900/30 hover:bg-white/[0.05] transition-all border border-white/5"
                        >
                            <div className="relative w-16">
                                <span className="text-3xl font-black tracking-tighter group-hover:text-rose-600 transition-colors">
                                    {track.rank}
                                </span>
                            </div>

                            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 items-center">
                                <div>
                                    <h4 className="text-xl font-black tracking-tight uppercase leading-none mb-1 group-hover:text-rose-50 transition-colors">
                                        {track.title}
                                    </h4>
                                    <p className="text-neutral-500 text-sm uppercase tracking-widest font-medium">
                                        {track.artist}
                                    </p>
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
                                        }`}>
                                            {track.trend}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button className="ml-6 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block cursor-pointer">
                                <div className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all shadow-lg">
                                    <span className="text-3xl flex items-center justify-center translate-x-[1px]">
                                        <IoMdArrowDropright />
                                    </span>
                                </div>
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            <section className="max-w-6xl mx-auto px-6 mb-24 border-t border-white/5 pt-16">
                <h2 className="text-sm font-bold uppercase tracking-[0.4em] text-neutral-500 mb-12">Le Journal des Ondes</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                    <div className="group cursor-pointer">
                        <div className="aspect-video bg-neutral-900 rounded-3xl mb-6 overflow-hidden border border-white/5">
                            <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-950 group-hover:scale-105 transition-transform duration-700" />
                        </div>
                        <h3 className="text-2xl font-bold mb-3 tracking-tight group-hover:text-rose-400 transition-colors">Pourquoi la radio FM ne mourra jamais face au streaming ?</h3>
                        <p className="text-neutral-400 text-sm leading-relaxed">Une analyse sur l'attachement des auditeurs à la curation humaine face aux algorithmes.</p>
                    </div>
                    <div className="space-y-8">
                        {[
                            "Les 10 webradios japonaises à découvrir absolument.",
                            "Comment le format 'Talk' explose de nouveau en 2026.",
                            "Interview : Le programmateur de NTS nous livre ses secrets."
                        ].map((news, i) => (
                            <div key={i} className="group cursor-pointer border-l border-white/10 pl-6 hover:border-rose-600 transition-colors">
                                <h3 className="text-lg font-bold group-hover:text-rose-500 transition-colors">{news}</h3>
                                <p className="text-[10px] text-neutral-500 uppercase mt-2 font-bold tracking-widest">Lecture : 4 min</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <footer className="max-w-6xl mx-auto px-6 py-12 border-t border-white/5">
                <div className="flex flex-row justify-between items-center w-full">
                    <div className="flex items-center">
                        <img
                            src={logo}
                            alt="Logo"
                            className="h-5 w-auto opacity-20 grayscale hover:opacity-40 transition-opacity"
                        />
                    </div>

                    <nav className="flex items-center gap-10">
                        <a href="#" className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-500 hover:text-rose-500 transition-colors">
                            À propos
                        </a>
                        <a href="#" className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-500 hover:text-rose-500 transition-colors">
                            Contact
                        </a>
                    </nav>
                </div>
                <div className="mt-8 text-center">
                    <p className="text-[8px] uppercase tracking-[0.5em] text-neutral-800">
                        © 2026 RadioMonoco - Tous droits réservés
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;