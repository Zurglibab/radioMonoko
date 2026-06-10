import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import brandsService from "../../services/BrandsService";
import type { Brand } from "../../interfaces/Brands.types";

const BRAND_THEMES: Record<string, { color: string }> = {
    FRANCEINTER: { color: "bg-[#e20134]" },
    FRANCEINFO: { color: "bg-[#ffc203]" },
    FRANCEMUSIQUE: { color: "bg-[#a90042]" },
    FRANCECULTURE: { color: "bg-[#762b84]" },
    MOUV: { color: "bg-[#00FB8E]" },
    FIP: { color: "bg-[#e2007a]" },
    FRANCEBLEU: { color: "bg-[#0078d8]" },
};

const RadioBackground = ({ color }: { color: string }) => (
    <div className={`absolute inset-0 ${color} blur-sm`} />
);

const LiveRadios = () => {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [current, setCurrent] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(true);
    const [loading, setLoading] = useState(true);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const data = await brandsService.getAllBrands();
                setBrands(data);
            } catch (error) {
                console.error("Erreur lors de la récupération des radios :", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBrands();
    }, []);

    const extendedBrands = brands.length > 0 ? [...brands, brands[0]] : [];

    const handleNext = useCallback(() => {
        if (brands.length === 0) return;
        setIsTransitioning(true);
        setCurrent((prev) => prev + 1);
    }, [brands.length]);

    const handleDotClick = (index: number) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsTransitioning(true);
        setCurrent(index);
    };

    useEffect(() => {
        if (brands.length === 0) return;

        const interval = setInterval(handleNext, 5000);

        return () => clearInterval(interval);
    }, [handleNext, brands.length, current]);

    useEffect(() => {
        if (extendedBrands.length === 0) return;
        if (current === extendedBrands.length - 1) {
            timeoutRef.current = setTimeout(() => {
                setIsTransitioning(false);
                setCurrent(0);
            }, 1000);
        }
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [current, extendedBrands.length]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[85vh] md:h-screen bg-black text-white">
                <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    if (brands.length === 0) {
        return (
            <div className="flex items-center justify-center h-[85vh] md:h-screen bg-black text-white">
                <p className="opacity-60 text-sm font-medium">{t("homePage.noStations")}</p>
            </div>
        );
    }

    return (
        <section className="relative w-full h-[85vh] md:h-screen overflow-hidden bg-black text-white font-sans">
            <div
                className={`flex h-full w-full ${isTransitioning ? "transition-transform duration-1000 ease-in-out" : ""}`}
                style={{ transform: `translateX(-${current * 100}%)`, willChange: "transform" }}
            >
                {extendedBrands.map((brand, index) => {
                    const theme = BRAND_THEMES[brand.id] || { color: "bg-neutral-800/30" };

                    return (
                        <div key={index} className="relative shrink-0 w-full h-full overflow-hidden">
                            <RadioBackground color={theme.color} />
                            <div className="absolute inset-0 bg-black/20 z-10" />
                            <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/40 via-25% to-transparent z-10" />
                            <div className="absolute inset-0 z-20 flex flex-col items-center justify-end pb-32 md:pb-40 px-6 text-center">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-600 rounded-full mb-6 shadow-lg">
                                    <span className="relative flex h-2 w-2">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                                    </span>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t("homePage.live")}</span>
                                </div>

                                <h3 className="text-3xl md:text-6xl font-black mb-4 uppercase tracking-tighter drop-shadow-2xl">
                                    {brand.title === "ICI" ? "France Bleu" : brand.title}
                                </h3>

                                <p className="text-neutral-200 max-w-2xl mb-10 text-lg md:text-2xl font-medium drop-shadow-md line-clamp-2 md:line-clamp-none">
                                    {brand.baseline || brand.description || t("homePage.listenNationalLive")}
                                </p>

                                <button
                                    className="px-12 py-5 bg-white text-black font-black rounded-full hover:scale-105 hover:bg-neutral-100 transition-all active:scale-95 shadow-2xl cursor-pointer text-xs uppercase tracking-wider"
                                    onClick={() => navigate(`/radio/${brand.id.toLowerCase()}`)}
                                >
                                    {t("homePage.listenLiveButton")}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3 z-30 max-w-[90vw] overflow-x-auto no-scrollbar">
                {brands.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => handleDotClick(index)}
                        className={`h-1.5 transition-all duration-500 cursor-pointer rounded-full shrink-0 ${
                            (current % brands.length) === index ? "w-16 bg-white" : "w-8 bg-white/30"
                        }`}
                    />
                ))}
            </div>
        </section>
    );
};

export default LiveRadios;