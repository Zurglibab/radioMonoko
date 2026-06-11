import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import LiveCard from "../components/radiopage/LiveCard";
import { useAppearance } from "../context/AppearanceContext";
import brandsService from "../services/BrandsService";
import showsService from "../services/ShowsService";
import { cached } from "../services/ApiCacheService";
import type { Brand } from "../interfaces/Brands.types";
import type { ApiDiffusion, ApiShow } from "../interfaces/Shows.types";
import { BRAND_THEMES } from "../assets/themes/BrandThemes";
import { DEFAULT_THEME } from "../assets/themes/DefaultTheme";
import { RadioCommunityZone } from "../components/radiopage/RadioCommunityZone";
import { RadioListsSection } from "../components/radiopage/RadioListsSection";
import { CollectionMenu } from "../components/radiopage/CollectionMenu";
import { Loader } from "../components/utils/Loader";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { useCommunityData } from "../hooks/useCommunityData";
import { useCollections } from "../hooks/useCollections";

const RadioPage = () => {
    const { station } = useParams<{ station: string }>();
    const { theme } = useAppearance();
    const { t } = useTranslation();
    const { user: currentUser } = useAuth();
    const isLoggedIn = !!currentUser?.id;

    const [brand, setBrand]           = useState<Brand | null>(null);
    const [localRadios, setLocalRadios] = useState<Brand["localRadios"]>([]);
    const [webRadios, setWebRadios]   = useState<Brand["webRadios"]>([]);
    const [diffusions, setDiffusions] = useState<ApiDiffusion[]>([]);
    const [loading, setLoading]       = useState(true);

    // ── Données de la radio ───────────────────────────────────────────────────

    useEffect(() => {
        if (!station) return;
        let isMounted = true;

        const fetch = async () => {
            try {
                setLoading(true);
                const [brandsData, showsData] = await Promise.all([
                    cached("brands_all", () => brandsService.getAllBrands(), 60_000),
                    cached(`shows_${station}`, () => showsService.getShowsByStation(station).catch(() => []), 30_000),
                ]);
                if (!isMounted) return;

                const currentBrand = brandsData.find((b) => b.id.toLowerCase() === station.toLowerCase());
                if (currentBrand) {
                    const web = currentBrand.webRadios ?? [];
                    const local = currentBrand.localRadios ?? [];
                    if (!currentBrand.liveStream) {
                        const fallback = web[0] || local[0];
                        if (fallback) currentBrand.liveStream = fallback.liveStream;
                    }
                    setBrand(currentBrand);
                    setLocalRadios(local);
                    setWebRadios(web);
                }

                if (Array.isArray(showsData) && showsData.length > 0) {
                    const allDiffusions = showsData.reduce((acc: ApiDiffusion[], show: ApiShow) => {
                        if (show.diffusions && Array.isArray(show.diffusions)) {
                            return [...acc, ...show.diffusions.map(d => ({ ...d, parentTitle: show.title }))];
                        }
                        return acc;
                    }, []);
                    setDiffusions(allDiffusions);
                }
            } catch (err) {
                console.error("Erreur chargement:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetch();
        return () => { isMounted = false; };
    }, [station]);

    // ── Hooks partagés ────────────────────────────────────────────────────────

    const community = useCommunityData({
        externalId: brand?.id,
        currentUserId: currentUser?.id,
        isLoggedIn,
    });

    const collections = useCollections({
        dbContentId: community.dbContentId,
        currentUserId: currentUser?.id,
        isLoggedIn,
    });

    // ── Render ────────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className={`flex justify-center items-center min-h-screen ${theme === "dark" ? "bg-app-bg text-app-text" : "bg-neutral-50 text-neutral-800"}`}>
                <Loader />
            </div>
        );
    }

    if (!brand) return null;

    const normalizedId = brand.id.toUpperCase();
    const foundKey = Object.keys(BRAND_THEMES).find(k => normalizedId.startsWith(k));
    const matchedTheme = foundKey ? BRAND_THEMES[foundKey] : DEFAULT_THEME;
    const cleanMainTitle = brand.title.replace(/^ICI\s+/, "").replace(/["'«»]|<<|>>/g, "").trim();
    const filteredDiffusions = diffusions.filter(e => e.podcastEpisode?.url);

    return (
        <div className={`relative min-h-screen ${theme === "dark" ? "bg-app-bg text-app-text" : "bg-neutral-50 text-neutral-800"}`}>
            <main className="max-w-[1400px] mx-auto px-6 pt-24 pb-32">
                <section className="grid lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-5 space-y-8">
                        <h1 className="text-4xl md:text-6xl font-black uppercase">{cleanMainTitle}</h1>
                        <CollectionMenu theme={theme} {...collections} />
                    </div>
                    <div className="lg:col-span-7 w-full lg:mt-8 pb-4">
                        <div className={`rounded-[2.5rem] overflow-hidden transition-all duration-500 ${theme === "dark" ? "shadow-[0_40px_80px_-30px_rgba(0,0,0,0.7)]" : "shadow-[0_30px_60px_-20px_rgba(0,0,0,0.08)] border border-neutral-200/50"}`}>
                            <LiveCard brandData={brand} theme={theme} />
                        </div>
                    </div>
                </section>

                <RadioListsSection
                    filteredDiffusions={filteredDiffusions}
                    webRadios={webRadios}
                    localRadios={localRadios}
                    theme={theme}
                    matchedTheme={matchedTheme}
                />

                {community.dbContentId ? (
                    <RadioCommunityZone
                        contentId={community.dbContentId}
                        theme={theme}
                        currentUser={currentUser}
                        loadingReviews={community.loadingReviews}
                        ratingSummary={community.ratingSummary}
                        userRating={community.userRating}
                        totalVotes={community.totalVotes}
                        comments={community.comments}
                        usersCache={community.usersCache}
                        onLikeInteraction={community.handleLikeInteraction}
                        handleRateStation={community.handleRateStation}
                        handleDeleteRating={community.handleDeleteRating}
                        onPostReview={community.onPostReview}
                        onPostReply={community.onPostReply}
                        handleDeleteReview={community.handleDeleteReview}
                        onUpdateReview={community.onUpdateReview}
                    />
                ) : (
                    <div className="flex justify-center border-t pt-16 border-dashed border-neutral-300 dark:border-white/10">
                        <p className="text-xs font-semibold opacity-40">{t("radio.communityLoading")}</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default RadioPage;
