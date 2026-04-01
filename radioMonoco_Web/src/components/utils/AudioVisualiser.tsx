import React from "react";

interface VisualizerProps {
    isPlaying: boolean;
    barCount?: number;
    color?: string;
}

const AudioVisualiser: React.FC<VisualizerProps> = ({ isPlaying, barCount = 5, color = "bg-rose-600" }) => {
    return (
        <div className="flex items-end gap-[3px] h-6">
            <style>{`
                @keyframes equalizer {
                    0%, 100% { height: 30%; }
                    50% { height: 100%; }
                }
            `}</style>
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

export default AudioVisualiser;