import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useAppearance } from "../context/AppearanceContext";
import showsService from "../services/ShowsService";
import { cached } from "../services/ApiCacheService";
import type { ApiDiffusion, ApiShow } from "../interfaces/Shows.types";
import { BRAND_THEMES } from "../assets/themes/BrandThemes";
import { DEFAULT_THEME } from "../assets/themes/DefaultTheme";
import { RadioCommunityZone } from "../components/radiopage/RadioCommunityZone";
import { RadioListsSection } from "../components/radiopage/RadioListsSection";
import { CollectionMenu } from "../components/radiopage/CollectionMenu";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { useCommunityData } from "../hooks/useCommunityData";
import { useCollections } from "../hooks/useCollections";

const ShowPage = () => {
    const { id } = useParams<{ id: string }>();
    const { theme } = useAppearance();
    const { t } = useTranslation();
    const { user: currentUser } = useAuth();
    const isLoggedIn = !!currentUser;
    const currentUserId = currentUser?.id ?? null;

    const [show, setShow]             = useState<ApiShow | null>(null);
    const [diffusions, setDiffusions] = useState<ApiDiffusion[]>([]);
    const [loading, setLoading]       = useState(true);

    const location = useLocation();
    const fallbackShow = location.state?.show as ApiShow | undefined;

    useEffect(() => {
        if (!id) return;
        let isMounted = true;

        const fetch = async () => {
            try {
                setLoading(true);
                const decoded = decodeURIComponent(id);
                const data = await cached(`show_${decoded}`, () => showsService.getShowByUrl(decoded), 30_000);

                if (!data) {
                    if (fallbackShow) {
                        setShow(fallbackShow);
                        setDiffusions(fallbackShow.diffusions ?? []);
                        return;
                    }
                    setShow(null);
                    setDiffusions([]);
                    return;
                }
                setShow(data);
                setDiffusions(data.diffusions ?? []);
            } catch (err) {
                console.error(err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetch();
        return () => { isMounted = false; };
    }, [id, fallbackShow]);

    const community = useCommunityData({
        externalId: show?.id,
        currentUserId,
        isLoggedIn,
    });

    const collections = useCollections({
        dbContentId: community.dbContentId,
        currentUserId,
        isLoggedIn,
    });

    if (loading) {
        return (
            <div className={`flex items-center justify-center min-h-screen ${theme === "dark" ? "bg-app-bg text-app-text" : "bg-neutral-50 text-neutral-800"}`}>
                <div className="w-6 h-6 border-2 border-current border-t-rose-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (!show) {
        return (
            <div className={`flex items-center justify-center min-h-screen ${theme === "dark" ? "bg-app-bg text-app-text" : "bg-neutral-50 text-neutral-800"}`}>
                <div className="max-w-lg text-center px-6">
                    <h2 className="text-2xl font-bold mb-3">{t("radio.showNotFound")}</h2>
                    <p className="text-sm opacity-60">{t("radio.showNotFoundText")}</p>
                </div>
            </div>
        );
    }

    const normalizedId = show.id.toUpperCase();
    const foundKey = Object.keys(BRAND_THEMES).find(k => normalizedId.startsWith(k));
    const matchedTheme = foundKey ? BRAND_THEMES[foundKey] : DEFAULT_THEME;
    const cleanMainTitle = (show.title ?? "").replace(/^ICI\s+/, "").replace(/["'«»]|<<|>>/g, "").trim();
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
                        <div className="bg-neutral-100 dark:bg-white/[0.03] rounded-[2.5rem] p-12 border border-neutral-200 dark:border-white/5 flex flex-col justify-center min-h-[300px]">
                            <h2 className="text-xl font-bold mb-4 opacity-80">{t("radio.aboutShow")}</h2>
                            <p className="text-base leading-relaxed opacity-60">
                                {show.standFirst ?? t("radio.noDescription")}
                            </p>
                        </div>
                    </div>
                </section>

                <RadioListsSection
                    filteredDiffusions={filteredDiffusions}
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

export default ShowPage;
