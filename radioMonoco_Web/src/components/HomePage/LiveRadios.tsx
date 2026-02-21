import { useState, useEffect, useRef, useCallback } from "react";

const radios = [
    { img: "https://www.radiofrance.fr/pikapi/images/894f4968-8833-4fbf-8fb9-cd6a7228e0ca/1200x680", title: "Radio Jazz Intense", desc: "Les classiques du jazz 24h/24 pour une ambiance tamisée." },
    { img: "https://www.radiofrance.fr/pikapi/images/affeb063-b0b2-4507-b9d5-eca3acbbeaa2/1200x680", title: "Electro Beat Radio", desc: "Le meilleur de la scène underground berlinoise." },
    { img: "https://www.radiofrance.fr/pikapi/images/e5729b6c-6f95-420b-afc3-c8166add9ce8/1200x680", title: "Classic Rock FM", desc: "Les plus grands hymnes du rock des années 70 à nos jours." }
];

const extendedRadios = [...radios, radios[0]];

const LiveRadios = () => {
    const [current, setCurrent] = useState(0);
    const [isPaused] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(true);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleNext = useCallback(() => {
        setIsTransitioning(true);
        setCurrent((prev) => prev + 1);
    }, []);

    const handleDotClick = (index: number) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsTransitioning(true);
        setCurrent(index);
    };

    useEffect(() => {
        if (isPaused) return;
        const interval = setInterval(() => {
            handleNext();
        }, 5000);
        return () => clearInterval(interval);
    }, [isPaused, handleNext]);

    useEffect(() => {
        if (current === extendedRadios.length - 1) {
            timeoutRef.current = setTimeout(() => {
                setIsTransitioning(false);
                setCurrent(0);
            }, 1000);
        }

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [current]);

    return (
        <section className="relative w-full h-[85vh] md:h-screen overflow-hidden bg-black">
            <div
                className={`flex h-full w-full ${isTransitioning ? "transition-transform duration-1000 ease-in-out" : ""}`}
                style={{
                    transform: `translateX(-${current * 100}%)`,
                    willChange: "transform"
                }}
            >
                {extendedRadios.map((radio, index) => (
                    <div key={index} className="relative flex-shrink-0 w-full h-full overflow-hidden">
                        {/* Overlays */}
                        <div className="absolute inset-0 bg-black/40 z-10" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20 z-10" />

                        <img
                            src={radio.img}
                            alt={radio.title}
                            className="w-full h-full object-cover blur-sm scale-105"
                        />

                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-end pb-32 md:pb-40 px-6 text-center">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-600 rounded-full mb-6 shadow-lg shadow-rose-900/20">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                                </span>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">En direct</span>
                            </div>

                            <h3 className="text-5xl md:text-8xl font-black mb-4 uppercase tracking-tighter italic drop-shadow-2xl">
                                {radio.title}
                            </h3>
                            <p className="text-neutral-200 max-w-2xl mb-10 text-lg md:text-xl font-medium drop-shadow-md">
                                {radio.desc}
                            </p>

                            <button className="px-12 py-5 bg-white text-black font-black rounded-full hover:scale-105 hover:bg-neutral-100 transition-all active:scale-95 shadow-2xl cursor-pointer">
                                ÉCOUTER LE DIRECT
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3 z-30">
                {radios.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => handleDotClick(index)}
                        className={`h-1 transition-all duration-500 cursor-pointer ${
                            (current % radios.length) === index
                                ? "w-16 bg-white"
                                : "w-8 bg-white/30 hover:bg-white/60"
                        }`}
                        aria-label={`Radio ${index + 1}`}
                    />
                ))}
            </div>
        </section>
    );
};

export default LiveRadios;