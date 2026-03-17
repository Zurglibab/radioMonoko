import { useState } from "react";
import {
    HiOutlineHeart,
    HiOutlineShare,
    HiOutlinePlay,
    HiOutlinePause,
    HiStar,
    HiOutlineChatBubbleLeftRight,
    HiPaperAirplane,
    HiLockClosed
} from "react-icons/hi2";
import { useRadio, type Radio } from "../context/RadioContext";

interface StarRatingProps {
    rating: number;
    hover: number;
    onRate: (rating: number) => void;
    onHover: (rating: number) => void;
    disabled: boolean;
}

const StarRating = ({ rating, hover, onRate, onHover, disabled }: StarRatingProps) => (
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
                        star <= (hover || rating) ? "text-rose-500 drop-shadow-[0_0_8px_rgba(225,29,72,0.4)]" : "text-white/5"
                    }`}
                />
            </button>
        ))}
    </div>
);

const RadioPage = () => {
    const { playRadio, isPlaying, currentRadio } = useRadio();

    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [userRating, setUserRating] = useState<number>(0);
    const [hoverRating, setHoverRating] = useState<number>(0);
    const [commentText, setCommentText] = useState<string>("");

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

    const [comments, setComments] = useState([
        { id: 1, user: "Kylian", text: "Le mix de Dirty Swift hier était incroyable ! 🔥", time: "2h", avatar: "https://i.pravatar.cc/150?u=1" },
        { id: 2, user: "Sarah", text: "Mouv' Rap Club, la base chaque soir.", time: "5h", avatar: "https://i.pravatar.cc/150?u=2" },
    ]);

    const handlePostComment = () => {
        if (!commentText.trim() || !isLoggedIn) return;
        const newComment = {
            id: Date.now(),
            user: "Moi",
            text: commentText,
            time: "À l'instant",
            avatar: "https://i.pravatar.cc/150?u=me"
        };
        setComments([newComment, ...comments]);
        setCommentText("");
    };

    const isThisRadioPlaying = currentRadio?.name === radioInfo.name && isPlaying;

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans antialiased selection:bg-rose-500/30">
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-rose-600/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[10%] left-[-5%] w-[400px] h-[400px] bg-rose-900/5 blur-[100px] rounded-full" />
            </div>

            <div className="relative h-[65vh] w-full flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-[#050505]/60 to-[#050505] z-10" />
                <img src={radioInfo.img} className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale-[0.2] scale-110" alt="" />

                <div className="absolute inset-0 z-20 flex flex-col items-center justify-end pb-32 md:pb-40 px-6 text-center">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-600 rounded-full mb-6 shadow-lg">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">En direct</span>
                    </div>
                    <h1 className="text-8xl md:text-[11rem] font-bold tracking-tighter leading-[0.85] mb-6 italic drop-shadow-2xl">{radioInfo.name}</h1>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 lg:px-12 -mt-12 relative z-30 pb-32">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    <div className="lg:col-span-2 space-y-8">
                        <section className="bg-white/[0.03] backdrop-blur-2xl border border-white/5 p-8 md:p-10 rounded-[2.5rem] flex items-center justify-between group transition-all hover:bg-white/[0.05]">
                            <div className="space-y-1">
                                <span className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] block">Émission actuelle</span>
                                <h2 className="text-4xl md:text-5xl font-bold tracking-tight">{radioInfo.currentShow}</h2>
                                <p className="text-neutral-400 text-lg italic">avec <span className="text-white font-medium not-italic">{radioInfo.host}</span></p>
                            </div>
                            <button
                                type="button"
                                onClick={() => playRadio(radioInfo)}
                                className="w-20 h-20 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)]"
                            >
                                {isThisRadioPlaying ? <HiOutlinePause size={32} /> : <HiOutlinePlay size={32} className="ml-1" />}
                            </button>
                        </section>

                        <section className="space-y-6">
                            <h3 className="text-[11px] font-black text-neutral-500 uppercase tracking-[0.3em] ml-2">Épisodes Récents</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="flex items-center gap-5 p-5 bg-white/[0.02] border border-white/5 rounded-[1.8rem] hover:bg-white/[0.04] transition-all cursor-pointer group">
                                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-rose-600 transition-all shadow-inner">
                                            <HiOutlinePlay className="text-neutral-500 group-hover:text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold truncate tracking-tight group-hover:text-rose-500 transition-colors">Rap Club #{42 - i}</p>
                                            <p className="text-[10px] text-neutral-600 uppercase font-black tracking-widest mt-1">45:00 • Hier</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <aside className="space-y-6">
                        <div className="flex gap-3">
                            <button type="button" className="flex-1 h-14 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-center transition-all hover:bg-rose-600/10 hover:border-rose-600/20 group">
                                <HiOutlineHeart size={22} className="text-neutral-500 group-hover:text-rose-500 transition-all group-hover:scale-110" />
                            </button>
                            <button type="button" className="flex-1 h-14 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-center transition-all hover:bg-white/10 group">
                                <HiOutlineShare size={20} className="text-neutral-500 group-hover:text-white transition-all" />
                            </button>
                        </div>

                        <div className="bg-white/[0.02] backdrop-blur-md border border-white/5 rounded-[2.5rem] p-8">
                            <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em] mb-8 text-center">Programmation</h3>
                            <div className="space-y-7">
                                {[
                                    { t: "19:00", s: "Mouv' 100% Rap" },
                                    { t: "21:00", s: "Dirty Swift Show" },
                                    { t: "23:00", s: "Mix Nocturne" }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex gap-5 items-center group">
                                        <span className="text-[10px] font-black text-rose-500 bg-rose-500/5 border border-rose-500/10 px-2 py-1 rounded-lg">{item.t}</span>
                                        <span className="text-sm font-semibold text-neutral-300 group-hover:text-white transition-colors">{item.s}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-20 pt-16 border-t border-white/5">

                    <div className="lg:col-span-1 space-y-6">
                        <h3 className="text-[11px] font-black text-neutral-500 uppercase tracking-[0.3em]">Audience</h3>
                        <div className="bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 rounded-[2.5rem] p-8 shadow-inner">
                            <div className="flex items-end gap-4 mb-8">
                                <span className="text-6xl font-black tracking-tighter leading-none">4.8</span>
                                <div className="pb-1 space-y-1">
                                    <div className="flex text-rose-500">
                                        {[...Array(5)].map((_, i) => <HiStar key={i} size={14} />)}
                                    </div>
                                    <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-[0.1em]">1 240 votes</p>
                                </div>
                            </div>

                            <div className="space-y-3.5 mb-10">
                                {stats.map((s) => (
                                    <div key={s.stars} className="flex items-center gap-3 group">
                                        <span className="text-[10px] font-bold text-neutral-600 w-2">{s.stars}</span>
                                        <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-neutral-600 rounded-full transition-all group-hover:bg-rose-600 group-hover:shadow-[0_0_8px_rgba(225,29,72,0.4)]" style={{ width: `${s.percent}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-8 border-t border-white/5 flex flex-col items-center gap-5">
                                <StarRating
                                    rating={userRating}
                                    hover={hoverRating}
                                    onRate={setUserRating}
                                    onHover={setHoverRating}
                                    disabled={!isLoggedIn}
                                />
                                <p className="text-[10px] font-black uppercase tracking-widest text-rose-600">
                                    {!isLoggedIn ? "Connexion requise pour voter" : userRating > 0 ? "Vote enregistré" : "Laissez une note"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[11px] font-black text-neutral-500 uppercase tracking-[0.3em] flex items-center gap-3">
                                <HiOutlineChatBubbleLeftRight size={18} className="text-rose-600" /> Communauté
                            </h3>
                            <span className="text-[10px] font-bold text-neutral-500 bg-white/5 px-3 py-1 rounded-full border border-white/5">{comments.length} Avis</span>
                        </div>

                        {isLoggedIn ? (
                            <div className="relative group">
                                <input
                                    type="text"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
                                    placeholder="Partagez vos impressions sur le live..."
                                    className="w-full h-16 bg-white/[0.02] border border-white/10 rounded-2xl px-6 pr-16 focus:outline-none focus:border-rose-600/50 focus:bg-white/[0.04] transition-all placeholder:text-neutral-600 shadow-inner"
                                />
                                <button
                                    type="button"
                                    onClick={handlePostComment}
                                    className="absolute right-2.5 top-2.5 bottom-2.5 px-5 bg-rose-600 rounded-xl hover:bg-rose-500 active:scale-95 transition-all shadow-lg shadow-rose-600/20"
                                >
                                    <HiPaperAirplane size={18} />
                                </button>
                            </div>
                        ) : (
                            <div className="bg-white/[0.01] border border-dashed border-white/10 p-10 rounded-[2.5rem] text-center transition-all hover:bg-white/[0.02] group">
                                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-600 group-hover:scale-110 transition-transform">
                                    <HiLockClosed size={20} />
                                </div>
                                <p className="text-sm font-bold tracking-tight mb-1">Espace Membres</p>
                                <p className="text-xs text-neutral-500 mb-6 font-light">Identifiez-vous pour commenter et noter la station.</p>
                                <button
                                    type="button"
                                    onClick={() => setIsLoggedIn(true)}
                                    className="px-8 py-3 bg-white text-black text-[10px] font-black uppercase rounded-full hover:bg-rose-600 hover:text-white transition-all shadow-xl active:scale-95"
                                >
                                    Se Connecter
                                </button>
                            </div>
                        )}

                        <div className="space-y-4">
                            {comments.map((c) => (
                                <div key={c.id} className="p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] flex gap-5 hover:bg-white/[0.04] transition-all group">
                                    <img src={c.avatar} className="w-11 h-11 rounded-full border border-white/10 grayscale group-hover:grayscale-0 transition-all shadow-md" alt="" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-1.5">
                                            <span className="text-sm font-bold text-neutral-200">{c.user}</span>
                                            <span className="text-[10px] font-black text-neutral-600 uppercase tracking-tighter">Il y a {c.time}</span>
                                        </div>
                                        <p className="text-[13px] text-neutral-400 font-light leading-relaxed">{c.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default RadioPage;