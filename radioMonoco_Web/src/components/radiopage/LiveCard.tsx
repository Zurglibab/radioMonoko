import { useEffect, useState } from "react";
import { HiOutlineRadio, HiOutlinePlay, HiOutlinePause } from "react-icons/hi2";
import { useRadio, type Radio } from "../../context/RadioContext";
import liveService from "../../services/LiveService";
import type { Brand } from "../../interfaces/Brands.types";
// 💡 Optionnel mais recommandé : importer le vrai type si disponible, exemple :
// import type { LiveInfo } from "../../interfaces/Live.types";

interface LiveCardProps {
    brandData: Brand;
    theme: "dark" | "light";
}

// 🛠️ Correction de l'interface pour correspondre au type LiveInfo du service
interface LiveDataStructure {
    title?: string | null;
    baseline?: string | null;
    program?: { name?: string } | null; // 👈 Rendu optionnel ou typé selon LiveProgram
    diffusion?: { title: string; standFirst?: string } | null;
}

const LiveCard = ({ brandData, theme }: LiveCardProps) => {
    const { playRadio, isPlaying, currentRadio } = useRadio();
    // 💡 Si tu as importé LiveInfo, tu peux faire : useState<LiveInfo | null>(null);
    const [liveData, setLiveData] = useState<LiveDataStructure | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const isDark = theme === "dark";

    useEffect(() => {
        if (!brandData?.id) return;

        const fetchLive = async () => {
            try {
                const data = await liveService.getLiveByStation(brandData.id);
                setLiveData(data as LiveDataStructure);
            } catch (error) {
                console.error("Erreur lors du fetch live :", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLive();
        const interval = setInterval(fetchLive, 60000);

        return () => clearInterval(interval);
    }, [brandData.id]);

    if (loading) {
        return (
            <div className={`relative z-20 backdrop-blur-3xl border p-8 md:p-10 rounded-[2.5rem] flex items-center justify-between gap-6 ${
                isDark ? "bg-white/4 border-white/10" : "bg-white border-neutral-200/60 shadow-xl"
            }`}>
                <div className="space-y-3 flex-1 animate-pulse">
                    <div className="h-3 w-20 bg-rose-500/20 rounded-full" />
                    <div className={`h-7 rounded-xl w-3/4 ${isDark ? "bg-white/10" : "bg-black/5"}`} />
                    <div className={`h-4 rounded-xl w-1/2 ${isDark ? "bg-white/5" : "bg-black/5"}`} />
                </div>
                <div className={`w-16 h-16 rounded-full shrink-0 animate-pulse ${isDark ? "bg-white/10" : "bg-black/5"}`} />
            </div>
        );
    }

    const programTitle =
        liveData?.diffusion?.title ||
        liveData?.program?.name ||
        liveData?.title ||
        "Émission en direct";

    const streamUrl = brandData.liveStream || `https://icecast.radiofrance.fr/${brandData.id.toLowerCase()}-midfi.mp3?id=openapi`;

    const radioInfo: Radio = {
        name: brandData.title === "ICI" ? "France Bleu" : brandData.title,
        desc: brandData.baseline || brandData.description || "Écouter le direct national",
        img: "",
        currentShow: programTitle,
        host: "Animateur",
        streamUrl: streamUrl,
    };

    const isThisRadioPlaying = currentRadio?.streamUrl === radioInfo.streamUrl && isPlaying;

    return (
        <div className={`relative z-20 backdrop-blur-3xl border p-8 md:p-10 rounded-[2.5rem] flex items-center justify-between gap-6 group transition-all duration-500 overflow-hidden ${
            isDark
                ? "bg-white/4 border-white/10 hover:bg-white/6 hover:border-white/20"
                : "bg-white border-neutral-200/60 shadow-xl shadow-neutral-200/30"
        }`}>

            <div className={`absolute -right-4 -bottom-4 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-700 z-0
                ${isDark ? "text-white" : "text-black"}`}>
                <HiOutlineRadio size={140} />
            </div>

            <div className="space-y-2 relative z-10 flex-1 min-w-0 select-none">
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500">En direct</span>
                </div>

                <h2 className={`text-xl md:text-2xl font-bold tracking-tight leading-tight line-clamp-2 ${isDark ? "text-white" : "text-neutral-900"}`}>
                    {programTitle}
                </h2>
            </div>

            <button
                onClick={() => playRadio(radioInfo)}
                className={`w-16 h-16 shrink-0 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md relative z-10 cursor-pointer
                    ${isDark ? "bg-white text-black hover:bg-neutral-100" : "bg-neutral-900 text-white hover:bg-neutral-800"}`}
                aria-label={isThisRadioPlaying ? "Mettre en pause" : "Écouter le direct"}
            >
                {isThisRadioPlaying ? <HiOutlinePause size={24} /> : <HiOutlinePlay size={24} className="ml-1" />}
            </button>
        </div>
    );
};

export default LiveCard;