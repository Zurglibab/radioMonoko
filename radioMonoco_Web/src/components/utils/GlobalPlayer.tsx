import React, { useState, useEffect, useRef } from "react";
import { HiOutlinePlay, HiOutlinePause } from "react-icons/hi2";
import { HiOutlineVolumeOff, HiOutlineVolumeUp } from "react-icons/hi";
import { useRadio } from "../../context/RadioContext.tsx";
import AudioVisualiser from "./AudioVisualiser.tsx";
import { useAppearance } from "../../context/AppearanceContext.tsx";

const GlobalPlayer: React.FC = () => {
    const { isPlaying, setIsPlaying, currentRadio, setCurrentRadio, volume, setVolume, toggleMute } = useRadio();
    const [isHoveringSlider, setIsHoveringSlider] = useState(false);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const { theme } = useAppearance();

    const containerRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLParagraphElement>(null);

    const isDark = theme === 'dark';

    const isPodcastStream = currentRadio?.streamUrl?.includes("proxycast.radiofrance.fr") || currentRadio?.desc === "Podcast";

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout> | undefined;

        if (!isPlaying && currentRadio) {
            timer = setTimeout(() => {
                setCurrentRadio(null);
            }, 30000);
        }

        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [isPlaying, currentRadio, setCurrentRadio]);

    useEffect(() => {
        if (!currentRadio?.currentShow) return;

        const checkOverflow = () => {
            if (containerRef.current && textRef.current) {
                const hasOverflow = textRef.current.scrollWidth > containerRef.current.clientWidth;
                setIsOverflowing(hasOverflow);
            }
        };

        checkOverflow();

        const observer = new ResizeObserver(checkOverflow);
        if (containerRef.current) observer.observe(containerRef.current);

        return () => observer.disconnect();
    }, [currentRadio?.currentShow]);

    if (!currentRadio) return null;

    return (
        <div className={`
            fixed bottom-12 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl h-24 
            backdrop-blur-3xl border rounded-[2.5rem] z-50 shadow-2xl px-8 flex items-center 
            animate-in fade-in slide-in-from-bottom-4 duration-500
            ${isDark
            ? "bg-[#1a1a1a]/80 border-white/10 shadow-black/50"
            : "bg-white/80 border-black/5 shadow-black/10"}
        `}>
            <div className="w-full flex items-center justify-between">

                <div className="flex items-center gap-4 w-1/3 min-w-0">
                    <div className={`w-12 h-12 rounded-2xl overflow-hidden shadow-lg shrink-0 relative border ${isDark ? "border-white/5" : "border-black/5"}`}>
                        {isPlaying && (
                            <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] bg-gradient-to-t from-black/50 to-transparent flex items-center justify-center">
                                <AudioVisualiser
                                    isPlaying={isPlaying}
                                    barCount={3}
                                    color="bg-white"
                                />
                            </div>
                        )}
                    </div>

                    <div className="hidden sm:block min-w-0 flex-1 select-none">
                        <div ref={containerRef} className="w-full overflow-hidden relative">
                            <div className={`inline-block whitespace-nowrap ${isOverflowing ? "animate-marquee" : ""}`}>
                                <p
                                    ref={textRef}
                                    className={`text-sm font-semibold ${isOverflowing ? "pr-12 inline-block" : "truncate"} ${isDark ? "text-white" : "text-neutral-900"}`}
                                >
                                    {currentRadio.currentShow}
                                </p>
                                {isOverflowing && (
                                    <p className={`text-sm font-semibold pr-12 inline-block ${isDark ? "text-white" : "text-neutral-900"}`}>
                                        {currentRadio.currentShow}
                                    </p>
                                )}
                            </div>
                        </div>
                        <p className="text-[10px] text-rose-600 font-bold uppercase tracking-widest mt-0.5">
                            {isPlaying ? (isPodcastStream ? "Lecture Épisode" : "En Direct") : "Pause"}
                        </p>
                    </div>
                </div>

                {/* BLOC CENTRAL */}
                <div className="flex items-center">
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={`
                            w-14 h-14 rounded-full flex items-center justify-center hover:scale-105 transition-all shadow-xl active:scale-95 cursor-pointer
                            ${isDark ? "bg-white text-black" : "bg-neutral-900 text-white"}
                        `}
                    >
                        {isPlaying ? <HiOutlinePause className="text-2xl" /> : <HiOutlinePlay className="text-2xl ml-0.5" />}
                    </button>
                </div>

                {/* BLOC DROIT */}
                <div className="hidden md:flex items-center justify-end w-1/3 gap-4">
                    <div className="flex items-center py-2">
                        <button onClick={toggleMute} className="focus:outline-none cursor-pointer mr-2">
                            {volume === 0 ? (
                                <HiOutlineVolumeOff className="text-rose-600 text-xl" />
                            ) : (
                                <HiOutlineVolumeUp className={`${isDark ? "text-neutral-400 hover:text-white" : "text-neutral-500 hover:text-black"} text-xl transition-colors`} />
                            )}
                        </button>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={volume}
                            onMouseEnter={() => setIsHoveringSlider(true)}
                            onMouseLeave={() => setIsHoveringSlider(false)}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVolume(parseInt(e.target.value))}
                            className={`w-20 md:w-24 h-1 rounded-full appearance-none cursor-pointer transition-all ${isDark ? "bg-neutral-700" : "bg-neutral-300"}`}
                            style={{
                                background: `linear-gradient(to right, #ec003f ${volume}%, ${isDark ? '#404040' : '#d4d4d4'} ${volume}%)`,
                            }}
                        />
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes marquee {
                    0% { transform: translate3d(0, 0, 0); }
                    100% { transform: translate3d(-50%, 0, 0); }
                }
                .animate-marquee {
                    animation: marquee 14s linear infinite;
                }
                .animate-marquee:hover {
                    animation-play-state: paused;
                }
                input[type=range]::-webkit-slider-thumb {
                    appearance: none;
                    height: 12px;
                    width: 12px;
                    border-radius: 50%;
                    background: ${isDark ? 'white' : '#1a1a1a'};
                    opacity: ${isHoveringSlider ? 1 : 0};
                    transition: opacity 0.2s, transform 0.2s;
                    margin-top: -4px;
                }
                input[type=range]::-moz-range-thumb {
                    height: 12px;
                    width: 12px;
                    border-radius: 50%;
                    background: ${isDark ? 'white' : '#1a1a1a'};
                    border: none;
                    opacity: ${isHoveringSlider ? 1 : 0};
                    transition: opacity 0.2s;
                }
            `}</style>
        </div>
    );
};

export default GlobalPlayer;