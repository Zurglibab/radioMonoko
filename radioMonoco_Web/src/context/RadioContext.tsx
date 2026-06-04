import { createContext, useContext, useState, useRef, useEffect, type ReactNode } from "react";

export interface Radio {
    name: string;
    desc: string;
    img: string;
    currentShow: string;
    host: string;
    streamUrl?: string;
}

interface RadioContextType {
    isPlaying: boolean;
    setIsPlaying: (playing: boolean) => void;
    currentRadio: Radio | null;
    setCurrentRadio: (radio: Radio | null) => void;
    playRadio: (radio: Radio) => void;
    volume: number;
    setVolume: (v: number) => void;
    toggleMute: () => void;
}

const RadioContext = createContext<RadioContextType | undefined>(undefined);

export const RadioProvider = ({ children }: { children: ReactNode }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentRadio, setCurrentRadio] = useState<Radio | null>(null);
    const [volume, setVolume] = useState(80);
    const [prevVolume, setPrevVolume] = useState(80);

    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume / 100;
        }
    }, [volume]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !currentRadio?.streamUrl) return;

        if (audio.src !== currentRadio.streamUrl) {
            audio.src = currentRadio.streamUrl;
            audio.load();
        }

        if (isPlaying) {
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch((err) => {
                    if (err.name !== "AbortError") {
                        console.error("Erreur de lecture stream:", err);
                        setIsPlaying(false);
                    }
                });
            }
        } else {
            audio.pause();
        }
    }, [isPlaying, currentRadio?.streamUrl, setIsPlaying]);

    const playRadio = (radio: Radio) => {
        if (currentRadio?.streamUrl === radio.streamUrl) {
            setIsPlaying(!isPlaying);
        } else {
            setCurrentRadio(radio);
            setIsPlaying(true);
        }
    };

    const toggleMute = () => {
        if (volume > 0) {
            setPrevVolume(volume);
            setVolume(0);
        } else {
            setVolume(prevVolume || 80);
        }
    };

    return (
        <RadioContext.Provider
            value={{
                isPlaying,
                setIsPlaying,
                currentRadio,
                setCurrentRadio,
                playRadio,
                volume,
                setVolume,
                toggleMute
            }}
        >
            {children}
            {currentRadio && (
                <audio
                    ref={audioRef}
                    preload="auto"
                />
            )}
        </RadioContext.Provider>
    );
};

export const useRadio = () => {
    const context = useContext(RadioContext);
    if (!context) throw new Error("useRadio must be used within a RadioProvider");
    return context;
};