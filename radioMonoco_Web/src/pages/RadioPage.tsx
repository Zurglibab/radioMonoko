import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiOutlineHeart, HiOutlineShare, HiOutlinePlay, HiOutlinePause, HiOutlineChevronLeft } from "react-icons/hi2";
import { HiOutlineVolumeOff, HiOutlineVolumeUp } from "react-icons/hi";

const AudioVisualizer = ({ isPlaying, barCount = 5, color = "bg-rose-600" }) => {
    return (
        <div className="flex items-end gap-[3px] h-6">
            <style>
                {`
                    @keyframes equalizer {
                        0%, 100% { height: 30%; }
                        50% { height: 100%; }
                    }
                `}
            </style>
            {[...Array(barCount)].map((_, i) => (
                <div
                    key={i}
                    className={`w-1 rounded-full ${color} transition-all duration-500 ${
                        isPlaying ? "animate-[equalizer_0.8s_ease-in-out_infinite]" : "h-1 opacity-30"
                    }`}
                    style={{
                        animationDelay: `${i * 0.15}s`,
                        height: isPlaying ? `${Math.floor(Math.random() * 60) + 40}%` : "4px"
                    }}
                />
            ))}
        </div>
    );
};

const RadioPage = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(80);
    const [prevVolume, setPrevVolume] = useState(80);
    const [isHoveringSlider, setIsHoveringSlider] = useState(false);
    const navigate = useNavigate();

    const toggleMute = () => {
        if (volume > 0) {
            setPrevVolume(volume);
            setVolume(0);
        } else {
            setVolume(prevVolume || 80);
        }
    };

    const radioInfo = {
        name: "Mouv'",
        desc: "L'esprit hip-hop, le son Radio France.",
        img: "https://www.radiofrance.fr/pikapi/images/894f4968-8833-4fbf-8fb9-cd6a7228e0ca/1200x680",
        currentShow: "Mouv' Rap Club",
        host: "Pascal Cefran",
    };

    const upcomingShows = [
        { time: "17:00", title: "Mouv' Rap Club", host: "Pascal Cefran" },
        { time: "19:00", title: "Mouv' 100% Rap", host: "Sélection Antenne" },
        { time: "20:00", title: "Dirty Swift", host: "DJ Swift" },
    ];

    return (
        <div className="min-h-screen bg-[#080808] text-white font-sans antialiased">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -right-[10%] w-[600px] h-[600px] bg-rose-600/10 blur-[120px] rounded-full" />
                <div className="absolute top-[20%] -left-[10%] w-[400px] h-[400px] bg-white/5 blur-[100px] rounded-full" />
            </div>

            <div className="relative h-[55vh] md:h-[65vh] w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-[#080808] z-10" />
                <img src={radioInfo.img} alt={radioInfo.name} className="w-full h-full object-cover scale-105 blur-sm opacity-60" />

                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-8 left-6 md:left-12 z-30 flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full hover:bg-white/20 transition-all text-sm font-medium"
                >
                    <HiOutlineChevronLeft className="text-lg" />
                    <span>Retour</span>
                </button>

                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center translate-y-8">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-600 rounded-full mb-6 shadow-lg shadow-rose-900/20">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">En direct</span>
                    </div>
                    <h1 className="text-7xl md:text-[10rem] font-bold mb-4 tracking-tighter leading-none">{radioInfo.name}</h1>
                    <p className="text-neutral-400 max-w-xl text-lg md:text-xl font-light italic">{radioInfo.desc}</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-12 -mt-12 relative z-30 pb-44">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-10">
                        <section className="group relative p-1 bg-gradient-to-br from-white/10 to-transparent rounded-[2.5rem]">
                            <div className="bg-[#121212]/90 backdrop-blur-2xl p-8 md:p-12 rounded-[2.4rem] flex flex-col md:flex-row justify-between items-center gap-8 transition-all group-hover:bg-[#121212]/70">
                                <div className="flex-1">
                                    <span className="text-xs font-bold text-rose-600 uppercase tracking-widest mb-3 block">Émission actuelle</span>
                                    <h2 className="text-4xl md:text-5xl font-bold mb-2">{radioInfo.currentShow}</h2>
                                    <p className="text-lg text-neutral-400 font-light">Animé par <span className="text-white font-medium">{radioInfo.host}</span></p>
                                </div>
                                <button
                                    onClick={() => setIsPlaying(!isPlaying)}
                                    className="w-24 h-24 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.15)] active:scale-95"
                                >
                                    {isPlaying ? <HiOutlinePause className="text-4xl" /> : <HiOutlinePlay className="text-4xl ml-1" />}
                                </button>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xs uppercase tracking-[0.3em] text-neutral-500 font-bold mb-8 ml-4">Derniers Podcasts</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="flex items-center gap-5 p-4 bg-white/[0.03] border border-white/5 rounded-3xl hover:bg-white/[0.06] transition-all cursor-pointer group">
                                        <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-rose-600 transition-colors">
                                            <HiOutlinePlay className="text-xl opacity-50 group-hover:opacity-100 group-hover:text-white" />
                                        </div>
                                        <div className="overflow-hidden">
                                            <h4 className="font-semibold text-sm truncate">Mouv' Rap Club : Episode {i}</h4>
                                            <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-1">45 min • Hier</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <div className="space-y-10">
                        <section className="flex gap-3">
                            <button className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-xs uppercase hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                                <HiOutlineHeart className="text-lg" /> Favoris
                            </button>
                            <button className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-xs uppercase hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                                <HiOutlineShare className="text-lg" /> Partager
                            </button>
                        </section>

                        <section className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-8">
                            <h3 className="text-xs uppercase tracking-[0.3em] text-neutral-500 font-bold mb-8">À venir</h3>
                            <div className="space-y-8">
                                {upcomingShows.map((show, idx) => (
                                    <div key={idx} className="flex gap-6 items-start group cursor-default">
                                        <span className="text-xs font-bold text-rose-600 mt-1">{show.time}</span>
                                        <div>
                                            <h4 className="font-semibold text-sm mb-1 group-hover:text-rose-500 transition-colors">{show.title}</h4>
                                            <p className="text-[10px] text-neutral-500 font-bold uppercase">{show.host}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl h-24 bg-[#1a1a1a]/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] z-[50] shadow-2xl px-8 flex items-center">
                <div className="w-full flex items-center justify-between">
                    <div className="flex items-center gap-4 w-1/3">
                        <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-lg shrink-0 relative">
                            <img src={radioInfo.img} className="w-full h-full object-cover" alt={radioInfo.name} />
                            {isPlaying && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <AudioVisualizer isPlaying={isPlaying} barCount={3} color="bg-white" />
                                </div>
                            )}
                        </div>
                        <div className="hidden sm:block truncate">
                            <p className="text-sm font-semibold truncate">{radioInfo.currentShow}</p>
                            <p className="text-[10px] text-rose-600 font-bold uppercase tracking-widest">En Direct</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-all shadow-xl active:scale-95"
                        >
                            {isPlaying ? <HiOutlinePause className="text-2xl" /> : <HiOutlinePlay className="text-2xl ml-0.5" />}
                        </button>
                    </div>

                    <div className="hidden md:flex items-center justify-end w-1/3 gap-4">
                        <div className="flex items-center py-2">
                            <button
                                onClick={toggleMute}
                                className="focus:outline-none cursor-pointer mr-2"
                            >
                                {volume === 0 ? (
                                    <HiOutlineVolumeOff className="text-rose-600 text-xl" />
                                ) : (
                                    <HiOutlineVolumeUp className="text-neutral-400 text-xl hover:text-white transition-colors" />
                                )}
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={volume}
                                onMouseEnter={() => setIsHoveringSlider(true)}
                                onMouseLeave={() => setIsHoveringSlider(false)}
                                onChange={(e) => setVolume(parseInt(e.target.value))}
                                className="w-20 md:w-24 h-1 rounded-full appearance-none cursor-pointer bg-neutral-700 transition-all
                                /* Le thumb n'est visible que si isHoveringSlider est vrai */
                                [&::-webkit-slider-thumb]:appearance-none
                                [&::-webkit-slider-thumb]:h-3
                                [&::-webkit-slider-thumb]:w-3
                                [&::-webkit-slider-thumb]:rounded-full
                                [&::-webkit-slider-thumb]:bg-white
                                [&::-webkit-slider-thumb]:transition-opacity
                                [&::-webkit-slider-thumb]:duration-200

                                [&::-moz-range-thumb]:h-3
                                [&::-moz-range-thumb]:w-3
                                [&::-moz-range-thumb]:rounded-full
                                [&::-moz-range-thumb]:bg-white
                                [&::-moz-range-thumb]:border-none
                                [&::-moz-range-thumb]:transition-opacity
                                [&::-moz-range-thumb]:duration-200"
                                style={{
                                    background: `linear-gradient(to right, 
                                        ${isHoveringSlider ? '#ec003f' : '#a3a3a3'} ${volume}%, 
                                        #404040 ${volume}%)`,
                                }}
                            />
                            <style>
                                {`
                                    input[type=range]::-webkit-slider-thumb {
                                        opacity: ${isHoveringSlider ? 1 : 0};
                                    }
                                    input[type=range]::-moz-range-thumb {
                                        opacity: ${isHoveringSlider ? 1 : 0};
                                    }
                                `}
                            </style>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RadioPage;