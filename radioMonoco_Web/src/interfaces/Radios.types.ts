export interface Radio {
    name: string;
    desc: string;
    img: string;
    currentShow: string;
    host: string;
    streamUrl?: string;
}

export interface RadioContextType {
    isPlaying: boolean;
    setIsPlaying: (playing: boolean) => void;
    currentRadio: Radio | null;
    setCurrentRadio: (radio: Radio | null) => void;
    playRadio: (radio: Radio) => void;
    volume: number;
    setVolume: (v: number) => void;
    toggleMute: () => void;
}