import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/Api";

interface Brand {
    id: string;
    title: string;
    baseline: string | null;
    description: string;
    websiteUrl: string;
    playerUrl: string | null;
    liveStream: string | null;
}

const BRAND_THEMES: Record<string, { bg: string; text: string; accent: string }> = {
    FRANCEINTER: { bg: "bg-red-600/20 text-red-500", text: "text-red-500", accent: "border-red-500" },
    FRANCEINFO: { bg: "bg-amber-500/20 text-amber-500", text: "text-amber-500", accent: "border-amber-500" },
    FRANCEMUSIQUE: { bg: "bg-pink-600/20 text-pink-500", text: "text-pink-500", accent: "border-pink-500" },
    FRANCECULTURE: { bg: "bg-purple-600/20 text-purple-500", text: "text-purple-500", accent: "border-purple-500" },
    MOUV: { bg: "bg-black/50 text-neutral-200", text: "text-neutral-200", accent: "border-yellow-400" },
    FIP: { bg: "bg-indigo-600/20 text-indigo-400", text: "text-indigo-400", accent: "border-indigo-400" },
    FRANCEBLEU: { bg: "bg-blue-600/20 text-blue-500", text: "text-blue-500", accent: "border-blue-500" },
};

const RadioBackground = ({ color, children }: { color: string; children: React.ReactNode }) => (
    <div className={`absolute inset-0 flex items-center justify-center ${color} blur-md transition-all duration-500 select-none`}>
        <div className="w-[60%] md:w-[40%] opacity-30 drop-shadow-2xl flex items-center justify-center">
            {children}
        </div>
    </div>
);

const MouvLogo = () => (
    <svg viewBox="0 0 88 44" xmlns="http://www.w3.org/2000/svg" className="w-full fill-current">
        <path d="M66.999 14.004c-.226.175-.162.511-.302.742-.11.362-.274.712-.314 1.092.182.241-.123.515-.062.779-.07.22-.153.433-.105.635-.042.241-.117.471-.152.72a4.63 4.63 0 0 1-.06 1.062 1.65 1.65 0 0 0-.003.82c.06.3.163.595.328.854.32.06.335-.415.37-.64.112-.594.483-1.092.684-1.656.053-.107.065-.392.196-.287.143-.438.218-.895.334-1.34.054-.296.18-.572.242-.865.016-.299.044-.622-.098-.897-.105-.227-.202-.461-.386-.64a1.214 1.214 0 0 0-.632-.364l-.04-.015Zm-24.335-2.52c-1.207.074-2.427.247-3.582.628-.9.443-1.974.728-2.788 1.39-.404.144-.864.625-1.35.936-.646.597-1.458 1.202-1.866 1.952-.366.043-.167.405-.49.789-.398.51-.743 1.04-.77 1.688-.169.477-.287 1.167-.297 1.774-.03.98 0 1.978.185 2.944.13.802.327 1.58.734 2.282.159.481 1.102 1.494.729 1.624.409.624 1.016 1.067 1.386 1.672.133.47.64.73 1.007 1.129-.06-.498.618.641.481.178.468.568 1.285.693 1.936.992.55.272 1.19.486 1.716.643a15.54 15.54 0 0 0 1.577.21c.794.324 1.625.169 2.407.258 1.438-.151 2.965-.496 4.004-1.57.529-.458 1.066-.746 1.581-1.238.507-.72 1.216-1.088 1.618-1.823.564-.802 1.052-1.703 1.284-2.66.451-1.512.745-3.145.246-4.685-.403-.783-.618-1.826-1.484-2.185-.4-.18-.982-.558-.633.17.007 1.303-.126 2.596-.31 3.885a13.59 13.59 0 0 1-1.317 4.56c.382-.787.294.162-.021.17-.421.315-.909 1.427-1.526 1.904-.763.834-1.9 1.168-2.82 1.722-.857.348-1.76.41-2.677.372-.8-.03-1.521-.28-2.272-.482-1.046-.369-2.109-.809-2.898-1.63-.922-.898-1.842-1.874-2.228-3.126z" />
    </svg>
);

export const RadioDashboard = () => {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [activeIndex, setActiveIndex] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const response = await api.get("/brands");
                const extractedBrands = response.data?.data?.brands || response.data?.brands;
                if (Array.isArray(extractedBrands)) {
                    setBrands(extractedBrands);
                } else {
                    console.error("Format de données inconnu reçu de l'API:", response.data);
                }
            } catch (error) {
                console.error("Erreur lors de la récupération des radios principales :", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBrands();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-neutral-950 text-white">
                <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    if (brands.length === 0) {
        return (
            <div className="flex items-center justify-center h-screen bg-neutral-950 text-white">
                <p className="opacity-60 text-sm font-medium">Aucune station radio disponible.</p>
            </div>
        );
    }

    const currentRadio = brands[activeIndex];
    const currentTheme = BRAND_THEMES[currentRadio.id] || { bg: "bg-neutral-800/20", text: "text-white", accent: "border-white" };

    return (
        <div className="relative w-full h-screen bg-neutral-950 text-white overflow-hidden flex flex-col justify-between p-6 md:p-12 transition-colors duration-500">

            {/* Arrière-plan graphique dynamique flouté */}
            <RadioBackground color={currentTheme.bg}>
                {currentRadio.id === "MOUV" ? (
                    <MouvLogo />
                ) : (
                    <span className={`text-5xl md:text-8xl font-black tracking-tighter uppercase select-none opacity-25 whitespace-nowrap ${currentTheme.text}`}>
                        {currentRadio.title}
                    </span>
                )}
            </RadioBackground>

            {/* En-tête de l'application */}
            <div className="relative z-10 flex items-center justify-between">
                <h1 className="text-sm font-black tracking-widest uppercase opacity-80">Radio France Stream</h1>
                <span className="text-xs font-mono opacity-40 bg-white/5 px-2.5 py-1 rounded-md border border-white/10">
                    {activeIndex + 1} / {brands.length}
                </span>
            </div>

            {/* Zone de Contenu Focus (Infos de la station active) */}
            <div className="relative z-10 max-w-xl space-y-5 my-auto animate-in fade-in slide-in-from-bottom-6 duration-500">
                <div className="inline-flex">
                    <span className={`text-[10px] font-black tracking-widest uppercase border-b-2 pb-1 ${currentTheme.accent}`}>
                        Direct Antenne
                    </span>
                </div>

                <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">
                    {currentRadio.title === "ICI" ? "France Bleu" : currentRadio.title}
                </h2>

                {currentRadio.baseline && (
                    <p className="text-lg md:text-xl font-medium opacity-90 italic max-w-lg">
                        "{currentRadio.baseline}"
                    </p>
                )}

                {currentRadio.description && (
                    <p className="text-xs md:text-sm opacity-50 max-w-md leading-relaxed">
                        {currentRadio.description}
                    </p>
                )}

                {currentRadio.liveStream && (
                    <div className="pt-2">
                        <button
                            onClick={() => navigate(`/player/${currentRadio.id.toLowerCase()}`)}
                            className="bg-white text-black font-black px-7 py-3.5 rounded-full text-xs uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/40 cursor-pointer"
                        >
                            Lancer le lecteur
                        </button>
                    </div>
                )}
            </div>

            {/* Navigation Carrousel du bas (Sélection des antennes) */}
            <div className="relative z-10 border-t border-white/10 pt-6">
                <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x">
                    {brands.map((brand, index) => {
                        const isSelected = index === activeIndex;
                        const theme = BRAND_THEMES[brand.id] || { text: "text-white" };

                        return (
                            <button
                                key={brand.id}
                                onClick={() => setActiveIndex(index)}
                                className={`snap-start shrink-0 px-5 py-4 rounded-2xl border text-left transition-all duration-300 min-w-[190px] cursor-pointer outline-none ${
                                    isSelected
                                        ? "bg-white/10 border-white/20 shadow-2xl scale-102"
                                        : "bg-white/5 border-transparent opacity-40 hover:opacity-80"
                                }`}
                            >
                                <p className={`text-xs font-black uppercase tracking-wider ${isSelected ? theme.text : "text-white"}`}>
                                    {brand.title === "ICI" ? "France Bleu" : brand.title}
                                </p>
                                <p className="text-[10px] opacity-50 truncate mt-1.5 font-medium">
                                    {brand.baseline ?? "Écouter l'antenne nationale"}
                                </p>
                            </button>
                        );
                    })}
                </div>
            </div>

        </div>
    );
};