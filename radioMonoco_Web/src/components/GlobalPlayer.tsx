import React, { useState, useEffect } from "react";
import { HiOutlinePlay, HiOutlinePause } from "react-icons/hi2";
import { HiOutlineVolumeOff, HiOutlineVolumeUp } from "react-icons/hi";
import { useRadio } from "../context/RadioContext";
import AudioVisualiser from "./AudioVisualiser.tsx";

const GlobalPlayer: React.FC = () => {
    const { isPlaying, setIsPlaying, currentRadio, setCurrentRadio, volume, setVolume, toggleMute } = useRadio();
    const [isHoveringSlider, setIsHoveringSlider] = useState(false);

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

    if (!currentRadio) return null;

    return (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl h-24 bg-[#1a1a1a]/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] z-[50] shadow-2xl px-8 flex items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-full flex items-center justify-between">

                <div className="flex items-center gap-4 w-1/3">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-lg shrink-0 relative border border-white/5">
                        <img src={currentRadio.img} className="w-full h-full object-cover" alt={currentRadio.name} />
                        {isPlaying && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <AudioVisualiser isPlaying={isPlaying} barCount={3} color="bg-white" />
                            </div>
                        )}
                    </div>
                    <div className="hidden sm:block truncate">
                        <p className="text-sm font-semibold truncate text-white">{currentRadio.currentShow}</p>
                        <p className="text-[10px] text-rose-600 font-bold uppercase tracking-widest mt-0.5">
                            {isPlaying ? "En Direct" : "Pause"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center">
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-all shadow-xl active:scale-95 cursor-pointer"
                    >
                        {isPlaying ? <HiOutlinePause className="text-2xl" /> : <HiOutlinePlay className="text-2xl ml-0.5" />}
                    </button>
                </div>

                <div className="hidden md:flex items-center justify-end w-1/3 gap-4">
                    <div className="flex items-center py-2">
                        <button onClick={toggleMute} className="focus:outline-none cursor-pointer mr-2">
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
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVolume(parseInt(e.target.value))}
                            className="w-20 md:w-24 h-1 rounded-full appearance-none cursor-pointer bg-neutral-700 transition-all"
                            style={{
                                background: `linear-gradient(to right, ${isHoveringSlider ? '#ec003f' : '#a3a3a3'} ${volume}%, #404040 ${volume}%)`,
                            }}
                        />
                    </div>
                </div>
            </div>

            <style>{`
                input[type=range]::-webkit-slider-thumb {
                    appearance: none;
                    height: 12px;
                    width: 12px;
                    border-radius: 50%;
                    background: white;
                    opacity: ${isHoveringSlider ? 1 : 0};
                    transition: opacity 0.2s, transform 0.2s;
                    margin-top: -3.5px; /* Pour centrer le point de 8px sur la barre */
                }
                input[type=range]::-moz-range-thumb {
                    height: 12px;
                    width: 12px;
                    border-radius: 50%;
                    background: white;
                    border: none;
                    opacity: ${isHoveringSlider ? 1 : 0};
                    transition: opacity 0.2s;
                }
            `}</style>
        </div>
    );
};

export default GlobalPlayer;