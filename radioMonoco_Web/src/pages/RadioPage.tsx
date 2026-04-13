import { useState } from "react";
import {
    HiOutlineHeart,
    HiOutlineShare,
    HiOutlinePlay,
    HiOutlinePause,
    HiStar,
    HiOutlineChatBubbleLeftRight,
    HiPaperAirplane,
    HiLockClosed,
} from "react-icons/hi2";
import { useRadio, type Radio } from "../context/RadioContext";
import { useAppearance } from "../context/AppearanceContext";

const StarRating = ({ rating, hover, onRate, onHover, disabled, theme }: any) => (
    <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
            <button
                key={star}
                type="button"
                disabled={disabled}
                onMouseEnter={() => !disabled && onHover(star)}
                onMouseLeave={() => !disabled && onHover(0)}
                onClick={() => !disabled && onRate(star)}
                className={`transition-all duration-300 ${disabled ? 'opacity-20 cursor-not-allowed' : 'hover:scale-125 active:scale-90'}`}
            >
                <HiStar
                    className={`text-2xl ${
                        star <= (hover || rating)
                            ? "text-rose-500 drop-shadow-[0_0_8px_rgba(225,29,72,0.4)]"
                            : theme === 'dark' ? "text-white/10" : "text-black/10"
                    }`}
                />
            </button>
        ))}
    </div>
);

const RadioPage = () => {
    const { playRadio, isPlaying, currentRadio } = useRadio();
    const { theme } = useAppearance();

    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [userRating, setUserRating] = useState<number>(0);
    const [hoverRating, setHoverRating] = useState<number>(0);

    const radioInfo: Radio = {
        name: "Mouv'",
        desc: "L'esprit hip-hop, le son Radio France.",
        img: "https://www.radiofrance.fr/pikapi/images/894f4968-8833-4fbf-8fb9-cd6a7228e0ca/1200x680",
        currentShow: "Mouv' Rap Club",
        host: "Pascal Cefran",
        streamUrl: "https://icecast.radiofrance.fr/mouv-midfi.mp3?id=openapi",
    };

    const stats = [
        { stars: 5, percent: 75 },
        { stars: 4, percent: 15 },
        { stars: 3, percent: 7 },
        { stars: 2, percent: 2 },
        { stars: 1, percent: 1 },
    ];

    const [comments] = useState([
        { id: 1, user: "Kylian", text: "Le mix de Dirty Swift hier était incroyable ! 🔥", time: "2h", avatar: "https://i.pravatar.cc/150?u=1" },
        { id: 2, user: "Sarah", text: "Mouv' Rap Club, la base chaque soir.", time: "5h", avatar: "https://i.pravatar.cc/150?u=2" },
    ]);

    const isThisRadioPlaying = currentRadio?.name === radioInfo.name && isPlaying;

    return (
        <div className="relative min-h-screen bg-app-bg text-app-text font-sans antialiased selection:bg-rose-500/20 overflow-x-hidden transition-colors duration-700">

            <div className="fixed inset-0 z-0 pointer-events-none">
                <div
                    className="absolute inset-0 opacity-[0.12]"
                    style={{
                        backgroundImage: theme === 'dark'
                            ? `radial-gradient(rgba(255,255,255,0.5) 0.5px, transparent 0.5px)`
                            : `radial-gradient(rgba(0,0,0,0.5) 0.5px, transparent 0.5px)`,
                        backgroundSize: '32px 32px'
                    }}
                />
                <div className={`absolute top-[-5%] right-[-5%] w-[600px] h-[600px] rounded-full blur-[140px] transition-all duration-1000 ${
                    theme === 'dark' ? 'bg-rose-600/5 opacity-50' : 'bg-rose-500/[0.08] opacity-100'
                }`} />
                <svg className={`absolute inset-0 w-full h-full contrast-150 transition-opacity duration-700 ${
                    theme === 'dark' ? 'opacity-[0.04]' : 'opacity-[0.02]'
                }`}>
                    <filter id="noisePage"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" /></filter>
                    <rect width="100%" height="100%" filter="url(#noisePage)" />
                </svg>
            </div>

            {/* Content Layer */}
            <div className="relative z-10">
                {/* Hero Section */}
                <div className="relative h-[60vh] w-full flex items-center justify-center overflow-hidden">
                    <div className={`absolute inset-0 z-10 bg-gradient-to-b from-transparent transition-colors duration-700
                        ${theme === 'dark' ? "via-app-bg/60 to-app-bg" : "via-app-bg/40 to-app-bg"}`} />
                    <img
                        src={radioInfo.img}
                        className={`absolute inset-0 w-full h-full object-cover scale-110 transition-all duration-1000
                            ${theme === 'dark' ? "opacity-30 grayscale-[0.4]" : "opacity-50 grayscale-[0.2]"}`}
                        alt=""
                    />
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-end pb-32 px-6 text-center">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-600 rounded-full mb-6 shadow-lg shadow-rose-600/30">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">En direct</span>
                        </div>
                        <h1 className="text-7xl md:text-[11rem] font-bold tracking-tighter leading-[0.85] italic drop-shadow-2xl">{radioInfo.name}</h1>
                    </div>
                </div>

                <main className="max-w-7xl mx-auto px-6 lg:px-12 -mt-16 relative pb-32">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        <div className="lg:col-span-2 space-y-12">
                            <section className={`relative z-20 backdrop-blur-3xl border p-8 md:p-10 rounded-[2.5rem] flex items-center justify-between group transition-all duration-500
                                ${theme === 'dark'
                                ? "bg-white/[0.04] border-white/10 hover:bg-white/[0.06] hover:border-white/20"
                                : "bg-white border-black/5 shadow-2xl shadow-black/5 hover:bg-white"}`}>
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 block mb-1">Émission actuelle</span>
                                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight">{radioInfo.currentShow}</h2>
                                    <p className="text-lg italic opacity-60">avec <span className="font-semibold not-italic opacity-100">{radioInfo.host}</span></p>
                                </div>
                                <button
                                    onClick={() => playRadio(radioInfo)}
                                    className={`w-20 h-20 shrink-0 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-2xl relative z-30
                                        ${theme === 'dark' ? "bg-white text-black" : "bg-black text-white"}`}
                                >
                                    {isThisRadioPlaying ? <HiOutlinePause size={32} /> : <HiOutlinePlay size={32} className="ml-1" />}
                                </button>
                            </section>

                            {/* Episodes Récents */}
                            <section className="space-y-6 relative z-10">
                                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] ml-2 opacity-40">Épisodes Récents</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className={`flex items-center gap-5 p-5 border rounded-[1.8rem] transition-all cursor-pointer group
                                            ${theme === 'dark' ? "bg-white/[0.02] border-white/5 hover:bg-white/[0.04]" : "bg-white border-black/5 hover:shadow-lg"}`}>
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${theme === 'dark' ? 'bg-white/5' : 'bg-black/5'} group-hover:bg-rose-600 group-hover:text-white shadow-inner`}>
                                                <HiOutlinePlay />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold truncate group-hover:text-rose-500 transition-colors">Rap Club #{42 - i}</p>
                                                <p className="text-[10px] uppercase font-black tracking-widest mt-1 opacity-40">45:00 • Hier</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        <aside className="space-y-6 relative z-30">
                            <div className="flex gap-4">
                                <button className={`flex-1 h-16 rounded-2xl border flex items-center justify-center transition-all duration-300 group
                                    ${theme === 'dark' ? "bg-white/5 border-white/10 hover:bg-rose-600/10 hover:border-rose-600/30" : "bg-white border-black/5 shadow-sm hover:bg-rose-50"}`}>
                                    <HiOutlineHeart size={24} className="text-rose-500 transition-transform group-hover:scale-110" />
                                </button>
                                <button className={`flex-1 h-16 rounded-2xl border flex items-center justify-center transition-all duration-300 group
                                    ${theme === 'dark' ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-white border-black/5 shadow-sm hover:bg-slate-50"}`}>
                                    <HiOutlineShare size={22} className="opacity-60 group-hover:opacity-100 transition-transform group-hover:rotate-6" />
                                </button>
                            </div>

                            <div className={`backdrop-blur-md border rounded-[2.5rem] p-8 transition-all
                                ${theme === 'dark' ? "bg-white/[0.02] border-white/10" : "bg-white border-black/5 shadow-xl shadow-black/5"}`}>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-8 text-center opacity-40">Programmation</h3>
                                <div className="space-y-7">
                                    {[{ t: "19:00", s: "Mouv' 100% Rap" }, { t: "21:00", s: "Dirty Swift Show" }, { t: "23:00", s: "Mix Nocturne" }].map((item, idx) => (
                                        <div key={idx} className="flex gap-5 items-center group">
                                            <span className="text-[10px] font-black text-rose-500 bg-rose-500/10 border border-rose-500/20 px-2 py-1 rounded-lg">{item.t}</span>
                                            <span className="text-sm font-semibold opacity-70 group-hover:opacity-100 transition-opacity">{item.s}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </aside>
                    </div>

                    <div className={`grid grid-cols-1 lg:grid-cols-3 gap-12 mt-20 pt-16 border-t relative z-10 ${theme === 'dark' ? 'border-white/5' : 'border-black/5'}`}>
                        <div className="lg:col-span-1 space-y-6">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] opacity-40">Audience</h3>
                            <div className={`border rounded-[2.5rem] p-8 shadow-inner transition-all ${theme === 'dark' ? "bg-gradient-to-br from-white/[0.03] to-transparent border-white/5" : "bg-white border-black/5 shadow-xl"}`}>
                                <div className="flex items-end gap-4 mb-8">
                                    <span className="text-6xl font-black tracking-tighter">4.8</span>
                                    <div className="pb-1 space-y-1">
                                        <div className="flex text-rose-500">{[...Array(5)].map((_, i) => <HiStar key={i} size={14} />)}</div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.1em] opacity-40">1 240 votes</p>
                                    </div>
                                </div>
                                <div className="space-y-3.5 mb-10">
                                    {stats.map((s) => (
                                        <div key={s.stars} className="flex items-center gap-3 group">
                                            <span className="text-[10px] font-bold w-2 opacity-30">{s.stars}</span>
                                            <div className={`flex-1 h-1 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-white/5' : 'bg-black/5'}`}>
                                                <div className="h-full rounded-full transition-all group-hover:bg-rose-600 bg-rose-500/40" style={{ width: `${s.percent}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="pt-8 border-t border-white/5 flex flex-col items-center gap-5">
                                    <StarRating rating={userRating} hover={hoverRating} onRate={setUserRating} onHover={setHoverRating} disabled={!isLoggedIn} theme={theme} />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-rose-600">
                                        {!isLoggedIn ? "Connexion requise pour voter" : userRating > 0 ? "Vote enregistré" : "Laissez une note"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-2 space-y-8">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-3 opacity-40">
                                    <HiOutlineChatBubbleLeftRight size={18} className="text-rose-600" /> Communauté
                                </h3>
                                <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${theme === 'dark' ? "bg-white/5 border-white/5" : "bg-black/5 border-black/5"}`}>{comments.length} Avis</span>
                            </div>
                            {!isLoggedIn ? (
                                <div className={`border border-dashed p-10 rounded-[2.5rem] text-center transition-all ${theme === 'dark' ? "bg-white/[0.01] border-white/10" : "bg-black/[0.01] border-black/10"}`}>
                                    <HiLockClosed size={20} className="mx-auto mb-4 opacity-20" />
                                    <p className="text-sm font-bold tracking-tight mb-6">Identifiez-vous pour commenter et voter.</p>
                                    <button onClick={() => setIsLoggedIn(true)} className="px-8 py-3 bg-app-text text-app-bg text-[10px] font-black uppercase rounded-full transition-all hover:bg-rose-600 hover:text-white shadow-xl">Se Connecter</button>
                                </div>
                            ) : (
                                <div className="relative group z-20">
                                    <input
                                        type="text"
                                        placeholder="Partagez vos impressions..."
                                        className={`w-full h-16 border rounded-2xl px-6 pr-16 focus:outline-none focus:border-rose-600/50 transition-all ${theme === 'dark' ? "bg-white/[0.02] border-white/10 text-white" : "bg-white border-black/10 text-black"}`}
                                    />
                                    <button className="absolute right-2.5 top-2.5 bottom-2.5 px-5 bg-rose-600 text-white rounded-xl shadow-lg shadow-rose-600/20 active:scale-95 transition-all">
                                        <HiPaperAirplane size={18} />
                                    </button>
                                </div>
                            )}
                            <div className="space-y-4">
                                {comments.map((c) => (
                                    <div key={c.id} className={`p-6 border rounded-[2rem] flex gap-5 transition-all ${theme === 'dark' ? "bg-white/[0.02] border-white/5 hover:bg-white/[0.04]" : "bg-white border-black/5 shadow-sm"}`}>
                                        <img src={c.avatar} className="w-11 h-11 rounded-full border border-black/5 grayscale opacity-80" alt="" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-1.5">
                                                <span className="text-sm font-bold opacity-80">{c.user}</span>
                                                <span className="text-[10px] font-black uppercase opacity-30">{c.time}</span>
                                            </div>
                                            <p className="text-[13px] font-light leading-relaxed opacity-60">{c.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default RadioPage;