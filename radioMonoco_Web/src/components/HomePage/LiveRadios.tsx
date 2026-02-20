import { useState, useEffect, useRef } from "react";

const radios = [
    { img: "https://www.radiofrance.fr/pikapi/images/894f4968-8833-4fbf-8fb9-cd6a7228e0ca/1200x680", title: "Radio Jazz Intense", desc: "Les classiques du jazz 24h/24 pour une ambiance tamisée." },
    { img: "https://www.radiofrance.fr/pikapi/images/affeb063-b0b2-4507-b9d5-eca3acbbeaa2/1200x680", title: "Electro Beat Radio", desc: "Le meilleur de la scène underground berlinoise." },
    { img: "https://www.radiofrance.fr/pikapi/images/e5729b6c-6f95-420b-afc3-c8166add9ce8/1200x680", title: "Classic Rock FM", desc: "Les plus grands hymnes du rock des années 70 à nos jours." }
];

const extendedRadios = [...radios, radios[0]];

const LiveRadios = () => {
    const [current, setCurrent] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(true);
    const timeoutRef = useRef(null);

    useEffect(() => {
        if (isPaused) return;
        const interval = setInterval(() => {
            handleNext();
        }, 5000);
        return () => clearInterval(interval);
    }, [isPaused, current]);

    const handleNext = () => {
        setIsTransitioning(true);
        setCurrent((prev) => prev + 1);
    };

    useEffect(() => {
        if (current === extendedRadios.length - 1) {
            timeoutRef.current = setTimeout(() => {
                setIsTransitioning(false);
                setCurrent(0);
            }, 1000);
        }
    }, [current]);

    const handleDotClick = (index) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsTransitioning(true);
        setCurrent(index);
    };

    return (
        <section className="max-w-6xl mx-auto px-6 mb-24">
            <h2 className="text-4xl font-black mb-8 tracking-tighter uppercase ">Radios en direct</h2>

            <div
                className="relative w-full overflow-hidden rounded-3xl shadow-2xl border border-white/5 bg-neutral-900"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                <div className="absolute top-6 left-6 z-40 flex items-center gap-2 px-3 py-1.5 bg-white/25 backdrop-blur-md rounded-full border border-white/10">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">En direct</span>
                </div>

                <div
                    className={`flex ${isTransitioning ? "transition-transform duration-1000 ease-in-out" : ""}`}
                    style={{ transform: `translateX(-${current * 100}%)` }}
                >
                    {extendedRadios.map((radio, index) => (
                        <div key={index} className="group flex-shrink-0 w-full relative h-80 md:h-[500px]">
                            <img
                                src={radio.img}
                                alt={radio.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />

                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 text-center px-4">
                                <h3 className="text-3xl md:text-5xl font-black mb-4 uppercase tracking-tighter">
                                    {radio.title}
                                </h3>
                                <p className="text-neutral-300 max-w-lg mb-8 text-lg hidden md:block">
                                    {radio.desc}
                                </p>
                                <button className="px-10 py-4 bg-white text-black font-black rounded-full hover:bg-neutral-200 transition-transform active:scale-95 shadow-xl cursor-pointer">
                                    ÉCOUTER LE DIRECT
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-30">
                    {radios.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => handleDotClick(index)}
                            className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                                (current % radios.length) === index
                                    ? "w-10 bg-white"
                                    : "w-2 bg-white/30 hover:bg-white/60"
                            }`}
                            aria-label={`Radio ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default LiveRadios;