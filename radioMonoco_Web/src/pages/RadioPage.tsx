import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import LiveCard from "../components/radiopage/LiveCard.tsx";
import {
    HiOutlineHeart,
    HiHeart,
    HiOutlineShare,
    HiOutlinePlay,
    HiOutlinePause,
    HiStar,
    HiOutlineChatBubbleLeftRight,
    HiPaperAirplane,
    HiLockClosed,
} from "react-icons/hi2";
import { type Radio, useRadio } from "../context/RadioContext";
import { useAppearance } from "../context/AppearanceContext";
import brandsService from "../services/BrandsService";
import showsService from "../services/ShowService";
import type { Brand } from "../interfaces/Brands.types";

interface ApiPersonality {
    relation: string;
    info: string;
    node: {
        id: string;
        name: string;
    };
}

interface ApiDiffusion {
    id: string;
    title: string;
    url: string;
    publishedDate?: string;
    parentTitle?: string;
    podcastEpisode?: {
        id: string;
        title: string;
        url: string;
        playerUrl?: string;
    } | null;
    personalities?: ApiPersonality[];
}

interface ApiShow {
    id: string;
    title: string;
    url?: string;
    standFirst?: string;
    diffusions: ApiDiffusion[];
    taxonomies?: any[];
}

interface ThemeColors {
    color: string;
    text: string;
    bgHover: string;
    borderHover: string;
    glow: string;
}

const BRAND_THEMES: Record<string, ThemeColors> = {
    FRANCEINTER:   { color: "from-[#e20134]", text: "text-[#e20134]", bgHover: "hover:bg-[#e20134]/10", borderHover: "hover:border-[#e20134]/30", glow: "rgba(226,1,52,0.25)" },
    FRANCEINFO:    { color: "from-[#ffc203]", text: "text-[#ffc203]", bgHover: "hover:bg-[#ffc203]/10", borderHover: "hover:border-[#ffc203]/30", glow: "rgba(255,194,3,0.25)" },
    FRANCEMUSIQUE: { color: "from-[#a90042]", text: "text-[#a90042]", bgHover: "hover:bg-[#a90042]/10", borderHover: "hover:border-[#a90042]/30", glow: "rgba(169,0,66,0.25)" },
    FRANCECULTURE: { color: "from-[#762b84]", text: "text-[#762b84]", bgHover: "hover:bg-[#762b84]/10", borderHover: "hover:border-[#762b84]/30", glow: "rgba(118,43,132,0.25)" },
    MOUV:          { color: "from-[#00FB8E]", text: "text-[#00FB8E]", bgHover: "hover:bg-[#00FB8E]/10", borderHover: "hover:border-[#00FB8E]/30", glow: "rgba(0,251,142,0.25)" },
    FIP:           { color: "from-[#e2007a]", text: "text-[#e2007a]", bgHover: "hover:bg-[#e2007a]/10", borderHover: "hover:border-[#e2007a]/30", glow: "rgba(226,0,122,0.25)" },
    FRANCEBLEU:    { color: "from-[#0078d8]", text: "text-[#0078d8]", bgHover: "hover:bg-[#0078d8]/10", borderHover: "hover:border-[#0078d8]/30", glow: "rgba(0,120,216,0.25)" },
};

const DEFAULT_THEME: ThemeColors = {
    color: "from-neutral-800",
    text: "text-rose-500",
    bgHover: "hover:bg-rose-500/10",
    borderHover: "hover:border-rose-500/30",
    glow: "rgba(225,29,72,0.25)"
};

interface StarRatingProps {
    rating: number;
    hover: number;
    onRate: (rating: number) => void;
    onHover: (rating: number) => void;
    disabled: boolean;
    theme: string;
}

const StarRating = ({ rating, hover, onRate, onHover, disabled, theme }: StarRatingProps) => (
    <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => (
            <button
                type="button"
                key={star}
                disabled={disabled}
                onMouseEnter={() => !disabled && onHover(star)}
                onMouseLeave={() => !disabled && onHover(0)}
                onClick={() => !disabled && onRate(star)}
                className={`transition-all duration-300 ${disabled ? "opacity-20 cursor-not-allowed" : "hover:scale-125"}`}
            >
                <HiStar
                    className={`text-xl ${
                        star <= (hover || rating)
                            ? "text-rose-500 drop-shadow-[0_0_8px_rgba(225,29,72,0.5)]"
                            : theme === "dark" ? "text-white/10" : "text-neutral-200"
                    }`}
                />
            </button>
        ))}
    </div>
);

interface RadioCardProps {
    id: string;
    title: string;
    description?: string;
    liveStream: string;
    theme: string;
    brandTheme: ThemeColors;
    isPodcast?: boolean;
    isWeb?: boolean;
    host?: string;
}

const RadioCard = ({ title, description, liveStream, theme, brandTheme, isPodcast, isWeb, host }: RadioCardProps) => {
    const { playRadio, isPlaying, currentRadio } = useRadio();

    const cleanTitle = title
        .replace(/^ICI\s+/, "")
        .replace(/["'«»]|<<|>>/g, "")
        .trim();

    const radioInfo: Radio = {
        name: cleanTitle,
        desc: description || (isPodcast ? "Podcast" : isWeb ? "Web Radio" : "Radio Locale"),
        img: "",
        currentShow: cleanTitle,
        host: host || "",
        streamUrl: liveStream,
    };

    const isActive = currentRadio?.streamUrl === radioInfo.streamUrl && isPlaying;

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!liveStream) return;

        if (isPodcast && !liveStream.match(/\.(mp3|m3u8|aac|wav)(\?.*)?$/i)) {
            window.open(liveStream, "_blank");
        } else {
            playRadio(radioInfo);
        }
    };

    const initials = cleanTitle.split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
    const colorHex = brandTheme.text.match(/\[(.*?)\]/)?.[1] || "#f43f5e";

    return (
        <div
            onClick={handleClick}
            className={`group relative w-56 h-72 rounded-[2.2rem] overflow-hidden p-6 flex flex-col justify-between transition-all duration-500 cursor-pointer snap-start flex-shrink-0 border select-none
                ${isActive
                ? "border-current"
                : theme === "dark"
                    ? "bg-neutral-900/40 border-white/[0.03] shadow-md"
                    : "bg-white border-neutral-200/60 shadow-sm hover:shadow-md"
            }
                ${theme === "dark" ? brandTheme.borderHover : "hover:border-neutral-300"}
                ${isActive ? brandTheme.text : ""}`}
            style={{
                borderColor: isActive ? colorHex : undefined
            }}
        >
            <div
                className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br via-transparent to-transparent"
                style={{ backgroundImage: `linear-gradient(to bottom right, ${colorHex}15, transparent, transparent)` }}
            />

            <div className="flex items-start justify-between relative z-10 w-full">
                <span className={`text-[9px] font-black tracking-widest uppercase px-3 py-1 rounded-full backdrop-blur-md border max-w-[65%] truncate
                    ${theme === "dark" ? "bg-white/5 border-white/10 text-white/60" : "bg-neutral-100 border-neutral-200 text-neutral-600"}`}>
                    {isPodcast ? "Podcast" : isWeb ? "Digital" : "Studio"}
                </span>

                <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 backdrop-blur-md shadow-md shrink-0
                        ${isActive
                        ? "text-white scale-100 opacity-100"
                        : theme === "dark"
                            ? "bg-white/10 text-white scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100"
                            : "bg-neutral-100 text-neutral-700 scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100"
                    }`}
                    style={{ backgroundColor: isActive ? colorHex : undefined }}
                >
                    {isActive ? <HiOutlinePause size={16} /> : <HiOutlinePlay size={16} className="ml-0.5" />}
                </div>
            </div>

            <div className="space-y-4 relative z-10 w-full">
                <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xs font-black tracking-tighter shadow-inner transition-all duration-500 group-hover:scale-105
                        ${theme === "dark" ? "bg-white/5 border border-white/5" : "bg-neutral-100 border border-neutral-200/50 text-neutral-700"}`}
                    style={{
                        backgroundColor: isActive ? `${colorHex}20` : undefined,
                        borderColor: isActive ? `${colorHex}30` : undefined,
                        color: isActive ? colorHex : undefined
                    }}
                >
                    {initials}
                </div>

                <div className="space-y-1 w-full">
                    <h4
                        className={`text-[15px] font-bold tracking-tight truncate transition-colors duration-300 ${theme === 'dark' ? 'text-white' : 'text-neutral-800'}`}
                        style={{ color: isActive ? colorHex : undefined }}
                    >
                        {cleanTitle}
                    </h4>
                    <p className={`text-[11px] line-clamp-2 leading-relaxed font-medium min-h-[2rem] ${theme === 'dark' ? 'text-neutral-400 opacity-40' : 'text-neutral-500'}`}>
                        {description || "Flux disponible à la demande."}
                    </p>
                </div>
            </div>
        </div>
    );
};

const RadioPage = () => {
    const { station } = useParams<{ station: string }>();
    const { theme } = useAppearance();

    const [brand, setBrand] = useState<Brand | null>(null);
    const [localRadios, setLocalRadios] = useState<Brand["localRadios"]>([]);
    const [webRadios, setWebRadios] = useState<Brand["webRadios"]>([]);

    const [currentLiveShow, setCurrentLiveShow] = useState<ApiShow | null>(null);
    const [diffusions, setDiffusions] = useState<ApiDiffusion[]>([]);

    const [loading, setLoading] = useState<boolean>(true);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [userRating, setUserRating] = useState<number>(0);
    const [hoverRating, setHoverRating] = useState<number>(0);
    const [isFavorite, setIsFavorite] = useState<boolean>(false);

    const [webScrollPercent, setWebScrollPercent] = useState(0);
    const [localScrollPercent, setLocalScrollPercent] = useState(0);
    const [episodesScrollPercent, setEpisodesScrollPercent] = useState(0);

    const webRef = useRef<HTMLDivElement>(null);
    const localRef = useRef<HTMLDivElement>(null);
    const episodesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchAllRadioData = async () => {
            if (!station) return;
            try {
                setLoading(true);

                const brandsData = await brandsService.getAllBrands();
                const currentBrand = brandsData.find((b) => b.id.toLowerCase() === station.toLowerCase());

                if (currentBrand) {
                    const extractedWeb = currentBrand.webRadios ?? [];
                    const extractedLocal = currentBrand.localRadios ?? [];

                    if (!currentBrand.liveStream) {
                        const fallbackRadio = extractedWeb[0] || extractedLocal[0];
                        if (fallbackRadio) {
                            currentBrand.liveStream = fallbackRadio.liveStream;
                        }
                    }

                    setBrand(currentBrand);
                    setLocalRadios(extractedLocal);
                    setWebRadios(extractedWeb);
                }

                try {
                    const response = await showsService.getShowsByStation(station);
                    const showsData = response?.data || response;

                    if (Array.isArray(showsData) && showsData.length > 0) {
                        setCurrentLiveShow(showsData[0]);

                        const allDiffusions = showsData.reduce((acc: ApiDiffusion[], currentShow: ApiShow) => {
                            if (currentShow.diffusions && Array.isArray(currentShow.diffusions)) {
                                const diffusionsWithParent = currentShow.diffusions.map((d) => ({
                                    ...d,
                                    parentTitle: currentShow.title
                                }));
                                return [...acc, ...diffusionsWithParent];
                            }
                            return acc;
                        }, []);

                        setDiffusions(allDiffusions);
                    } else {
                        setCurrentLiveShow(null);
                        setDiffusions([]);
                    }
                } catch (apiErr) {
                    console.warn("L'API d'émissions n'a pas pu charger les données :", apiErr);
                    setCurrentLiveShow(null);
                    setDiffusions([]);
                }

            } catch (error) {
                console.error("Erreur globale lors du chargement :", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAllRadioData();
    }, [station]);

    const handleScroll = (ref: React.RefObject<HTMLDivElement | null>, setPercent: (p: number) => void) => {
        if (ref.current) {
            const { scrollLeft, scrollWidth, clientWidth } = ref.current;
            const totalScroll = scrollWidth - clientWidth;
            if (totalScroll > 0) {
                setPercent((scrollLeft / totalScroll) * 100);
            }
        }
    };

    if (loading) {
        return (
            <div className={`flex items-center justify-center min-h-screen ${theme === 'dark' ? 'bg-app-bg text-app-text' : 'bg-neutral-50 text-neutral-800'}`}>
                <div className="w-6 h-6 border-2 border-current border-t-rose-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (!brand) return null;

    const stats = [
        { stars: 5, percent: 75 },
        { stars: 4, percent: 15 },
        { stars: 3, percent: 7 },
        { stars: 2, percent: 2 },
        { stars: 1, percent: 1 },
    ];

    const comments = [
        { id: 1, user: "Kylian", text: "Le live est super fluide ! 🔥", time: "2h", avatar: "https://i.pravatar.cc/150?u=1" },
        { id: 2, user: "Sarah", text: "Ma station préférée de la journée.", time: "5h", avatar: "https://i.pravatar.cc/150?u=2" },
    ];

    const normalizedId = brand.id.toUpperCase();
    const foundKey = Object.keys(BRAND_THEMES).find((k) => normalizedId.startsWith(k));
    const matchedTheme = foundKey ? BRAND_THEMES[foundKey] : DEFAULT_THEME;

    const cleanMainTitle = brand.title
        .replace(/^ICI\s+/, "")
        .replace(/["'«»]|<<|>>/g, "")
        .trim();

    // ICI : Strict filter. Si podcastEpisode est absent (undefined), null ou sans URL -> Dehors !
    const filteredDiffusions = diffusions.filter(
        (episode) => episode.podcastEpisode !== null && episode.podcastEpisode !== undefined && !!episode.podcastEpisode.url
    );

    return (
        <div className={`relative min-h-screen font-sans antialiased selection:bg-rose-500/10 overflow-x-hidden ${theme === 'dark' ? 'bg-app-bg text-app-text' : 'bg-neutral-50 text-neutral-800'}`}>
            <div className={`absolute top-0 left-0 right-0 h-[70vh] bg-gradient-to-b ${matchedTheme.color} to-transparent opacity-[0.06] pointer-events-none blur-3xl`} />

            <main className="max-w-[1400px] mx-auto px-6 md:px-12 pt-24 pb-32 space-y-28">
                <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
                    <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-24">
                        <div className="space-y-5">
                            <div className="inline-flex items-center gap-2">
                            </div>
                            <h1 className={`text-4xl md:text-6xl font-black tracking-tight uppercase leading-[0.9] ${theme === 'dark' ? 'text-transparent bg-clip-text bg-gradient-to-b from-app-text to-app-text/60' : 'text-neutral-900'}`}>
                                {cleanMainTitle}
                            </h1>
                            <p className={`text-sm font-medium max-w-sm leading-relaxed ${theme === 'dark' ? 'opacity-50' : 'text-neutral-500'}`}>
                                {brand.baseline || brand.description || "Découvrez le flux officiel, les déclinaisons web locales et l'espace communautaire."}
                            </p>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <button
                                onClick={() => setIsFavorite(!isFavorite)}
                                className={`h-12 px-6 rounded-2xl font-bold text-xs tracking-tight flex items-center gap-2.5 border transition-all duration-300 group
                                ${isFavorite
                                    ? "bg-rose-500/10 border-rose-500/30 text-rose-500 shadow-md"
                                    : theme === "dark"
                                        ? "bg-white/[0.02] border-white/10 text-white/60 hover:bg-white/[0.06] hover:border-white/20 hover:text-white"
                                        : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300 hover:text-neutral-900 shadow-sm"}`}
                            >
                                {isFavorite ? <HiHeart size={18} className="scale-110 text-rose-500" /> : <HiOutlineHeart size={18} className="group-hover:scale-110" />}
                                <span className={isFavorite ? "font-black" : ""}>{isFavorite ? "Favori" : "Ajouter aux favoris"}</span>
                            </button>

                            <button
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-300 group
                                ${theme === "dark" ? `bg-white/[0.02] border-white/10 ${matchedTheme.bgHover} ${matchedTheme.borderHover} text-white/60 ${matchedTheme.text}` : `bg-white border-neutral-200 ${matchedTheme.bgHover} ${matchedTheme.borderHover} text-neutral-600 text-neutral-600 shadow-sm`}`}
                                title="Partager la station"
                            >
                                <HiOutlineShare size={18} className="transition-transform group-hover:rotate-6" />
                            </button>
                        </div>
                    </div>

                    <div className="lg:col-span-7 w-full lg:mt-8">
                        <div className={`rounded-[2.5rem] overflow-hidden transition-all duration-500 ${theme === "dark" ? "shadow-[0_40px_80px_-30px_rgba(0,0,0,0.7)]" : "shadow-[0_30px_60px_-20px_rgba(0,0,0,0.08)] border border-neutral-200/50"}`}>
                            <LiveCard brandData={brand} theme={theme} />
                        </div>
                    </div>
                </section>

                <div className="space-y-24 max-w-[1400px] mx-auto w-full">
                    {filteredDiffusions.length > 0 && (
                        <section className="space-y-6 w-full animate-fadeIn">
                            <div className={`flex items-end justify-between border-b pb-4 ${theme === 'dark' ? 'border-white/5' : 'border-neutral-200'}`}>
                                <h3 className={`text-xs font-black uppercase tracking-[0.2em] ${theme === 'dark' ? 'opacity-30' : 'text-neutral-400'}`}>Podcasts & Émissions Récentes</h3>
                                <span className={`text-[10px] font-bold ${theme === 'dark' ? 'opacity-40' : 'text-neutral-400'}`}>{filteredDiffusions.length} Épisodes</span>
                            </div>

                            <div className="relative w-full">
                                <div
                                    ref={episodesRef}
                                    onScroll={() => handleScroll(episodesRef, setEpisodesScrollPercent)}
                                    className="flex gap-6 overflow-x-auto pb-4 scrollbar-none w-full snap-x snap-mandatory"
                                >
                                    {filteredDiffusions.map((episode, index) => {
                                        const producer = episode.personalities?.find(p => p.relation === "producer")?.node.name;

                                        return (
                                            <RadioCard
                                                key={`api-ep-${episode.id || index}`}
                                                id={`api-ep-${episode.id || index}`}
                                                title={episode.title}
                                                description={episode.parentTitle ? episode.parentTitle.replace(/["'«»]|<<|>>/g, "") : "Émission disponible en réécoute."}
                                                // On est sûr à 100% que podcastEpisode existe ici grâce au filtre strict
                                                liveStream={episode.podcastEpisode!.url}
                                                theme={theme}
                                                brandTheme={matchedTheme}
                                                isPodcast
                                                host={producer}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        </section>
                    )}

                    {webRadios && webRadios.length > 0 && (
                        <section className="space-y-6 w-full">
                            <div className={`flex items-end justify-between border-b pb-4 ${theme === 'dark' ? 'border-white/5' : 'border-neutral-200'}`}>
                                <h3 className={`text-xs font-black uppercase tracking-[0.2em] ${theme === 'dark' ? 'opacity-30' : 'text-neutral-400'}`}>Web Radios</h3>
                                <span className={`text-[10px] font-bold ${theme === 'dark' ? 'opacity-40' : 'text-neutral-400'}`}>{webRadios.length} Stations</span>
                            </div>

                            <div className="relative w-full">
                                <div
                                    ref={webRef}
                                    onScroll={() => handleScroll(webRef, setWebScrollPercent)}
                                    className="flex gap-6 overflow-x-auto pb-4 scrollbar-none w-full snap-x snap-mandatory"
                                >
                                    {webRadios.map((r) => (
                                        <RadioCard key={r.id} id={r.id} title={r.title} description={r.description} liveStream={r.liveStream || ""} theme={theme} brandTheme={matchedTheme} isWeb />
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                    {localRadios && localRadios.length > 0 && (
                        <section className="space-y-6 w-full">
                            <div className={`flex items-end justify-between border-b pb-4 ${theme === 'dark' ? 'border-white/5' : 'border-neutral-200'}`}>
                                <h3 className={`text-xs font-black uppercase tracking-[0.2em] ${theme === 'dark' ? 'opacity-30' : 'text-neutral-400'}`}>Antennes Régionales</h3>
                                <span className={`text-[10px] font-bold ${theme === 'dark' ? 'opacity-40' : 'text-neutral-400'}`}>{localRadios.length} Stations</span>
                            </div>

                            <div className="relative w-full">
                                <div
                                    ref={localRef}
                                    onScroll={() => handleScroll(localRef, setLocalScrollPercent)}
                                    className="flex gap-6 overflow-x-auto pb-4 scrollbar-none w-full snap-x snap-mandatory"
                                >
                                    {localRadios.map((r) => (
                                        <RadioCard key={r.id} id={r.id} title={r.title} description={r.description} liveStream={r.liveStream || ""} theme={theme} brandTheme={matchedTheme} />
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}
                </div>

                <section className={`grid grid-cols-1 lg:grid-cols-12 gap-16 border-t pt-16 ${theme === 'dark' ? 'border-white/5' : 'border-neutral-200'}`}>
                    <div className="lg:col-span-4 space-y-6">
                        <h3 className={`text-xs font-black uppercase tracking-[0.2em] ${theme === 'dark' ? 'opacity-30' : 'text-neutral-400'}`}>Audience Rating</h3>
                        <div className="flex items-baseline gap-4">
                            <span className={`text-7xl font-black tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-neutral-900'}`}>4.8</span>
                            <span className={`text-xs font-bold uppercase tracking-widest ${theme === 'dark' ? 'opacity-30' : 'text-neutral-400'}`}>/ 5.0</span>
                        </div>

                        <div className="space-y-2.5 max-w-xs">
                            {stats.map((s) => (
                                <div key={s.stars} className="flex items-center gap-3 text-[11px] font-bold">
                                    <span className={`w-3 ${theme === 'dark' ? 'opacity-20' : 'text-neutral-400'}`}>{s.stars}</span>
                                    <div className={`flex-1 h-1 rounded-full ${theme === "dark" ? "bg-white/5" : "bg-neutral-200"}`}>
                                        <div className={`h-full rounded-full ${theme === 'dark' ? 'bg-white/40' : 'bg-neutral-600'}`} style={{ width: `${s.percent}%` }} />
                                    </div>
                                    <span className={`text-right w-6 ${theme === 'dark' ? 'opacity-40' : 'text-neutral-500'}`}>{s.percent}%</span>
                                </div>
                            ))}
                        </div>

                        <div className="pt-6 flex flex-col gap-3">
                            <StarRating rating={userRating} hover={hoverRating} onRate={setUserRating} onHover={setHoverRating} disabled={!isLoggedIn} theme={theme} />
                            <p className={`text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'opacity-40' : 'text-neutral-400'}`}>
                                {!isLoggedIn ? "Connexion requise pour voter" : "Avis pris en compte"}
                            </p>
                        </div>
                    </div>

                    <div className="lg:col-span-8 space-y-8">
                        <div className="flex items-center justify-between">
                            <h3 className={`text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 ${theme === 'dark' ? 'opacity-30' : 'text-neutral-400'}`}>
                                <HiOutlineChatBubbleLeftRight size={16} /> Espace d'échange
                            </h3>
                        </div>

                        {!isLoggedIn ? (
                            <div className={`p-8 rounded-3xl text-center border border-dashed transition-all ${theme === "dark" ? "bg-white/[0.01] border-white/10" : "bg-white border-neutral-200 shadow-inner"}`}>
                                <HiLockClosed size={16} className={`mx-auto mb-2 ${theme === 'dark' ? 'opacity-30' : 'text-neutral-400'}`} />
                                <p className={`text-xs font-bold mb-4 ${theme === 'dark' ? 'opacity-50' : 'text-neutral-500'}`}>Inscrivez-vous pour rejoindre le salon des auditeurs.</p>
                                <button
                                    onClick={() => setIsLoggedIn(true)}
                                    className={`px-6 py-2.5 text-[10px] font-black uppercase rounded-lg hover:opacity-90 transition-opacity shadow-sm ${theme === 'dark' ? 'bg-white text-neutral-900' : 'bg-neutral-900 text-white'}`}
                                >
                                    Se connecter
                                </button>
                            </div>
                        ) : (
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Écrire un message public..."
                                    className={`w-full h-14 border rounded-xl px-5 pr-14 focus:outline-none transition-all text-sm ${theme === "dark" ? "bg-white/[0.02] border-white/10 text-white focus:border-white/30" : "bg-white border-neutral-300 text-neutral-800 focus:border-neutral-500 shadow-sm"}`}
                                />
                                <button className={`absolute right-2 top-2 bottom-2 px-4 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center ${theme === 'dark' ? 'bg-white text-neutral-900' : 'bg-neutral-900 text-white'}`}>
                                    <HiPaperAirplane size={14} />
                                </button>
                            </div>
                        )}

                        <div className={`divide-y ${theme === 'dark' ? 'divide-white/5' : 'divide-neutral-200'}`}>
                            {comments.map((c) => (
                                <div key={c.id} className="py-5 flex gap-4 first:pt-0">
                                    <img src={c.avatar} className="w-9 h-9 rounded-full filter grayscale opacity-70" alt="" />
                                    <div className="space-y-1 flex-1">
                                        <div className="flex justify-between items-baseline">
                                            <span className={`text-xs font-bold ${theme === 'dark' ? 'text-neutral-200' : 'text-neutral-800'}`}>{c.user}</span>
                                            <span className={`text-[9px] font-bold uppercase ${theme === 'dark' ? 'opacity-30' : 'text-neutral-400'}`}>{c.time} ago</span>
                                        </div>
                                        <p className={`text-sm leading-relaxed font-light ${theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'}`}>{c.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default RadioPage;