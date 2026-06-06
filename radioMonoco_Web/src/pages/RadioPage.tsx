import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import LiveCard from "../components/radiopage/LiveCard";
import { HiOutlineHeart, HiHeart, HiOutlineShare } from "react-icons/hi2";
import { useAppearance } from "../context/AppearanceContext";
import brandsService from "../services/BrandsService";
import showsService from "../services/ShowsService.ts";
import contentService from "../services/ContentsService";
import ratingContentService from "../services/RatingContentsService";
import reviewService from "../services/ReviewsService";
import usersService from "../services/UsersService";
import likeReviewsService from "../services/LikeReviewsService";
import type { Brand } from "../interfaces/Brands.types";
import type { ApiShow, ApiDiffusion } from "../interfaces/Shows.types";
import type { User } from "../interfaces/Users.types";
import { BRAND_THEMES } from "../assets/themes/BrandThemes";
import { DEFAULT_THEME } from "../assets/themes/DefaultTheme";
import { RadioCommunityZone } from "../components/radiopage/RadioCommunityZone";
import { RadioListsSection } from "../components/radiopage/RadioListsSection.tsx";

const RadioPage = () => {
    const { station } = useParams<{ station: string }>();
    const { theme } = useAppearance();

    const [currentUserId] = useState<string | null>(() => {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
            try {
                const parsed = JSON.parse(savedUser);
                return parsed.id || parsed._id || parsed.user_id || null;
            } catch (e) {
                console.error(e);
                return null;
            }
        }
        return null;
    });
    const isLoggedIn = !!currentUserId;

    const [brand, setBrand] = useState<Brand | null>(null);
    const [localRadios, setLocalRadios] = useState<Brand["localRadios"]>([]);
    const [webRadios, setWebRadios] = useState<Brand["webRadios"]>([]);
    const [diffusions, setDiffusions] = useState<ApiDiffusion[]>([]);
    const [dbContentId, setDbContentId] = useState<string | null>(null);

    const [loadingReviews, setLoadingReviews] = useState<boolean>(true);
    const [ratingSummary, setRatingSummary] = useState<any | null>(null);
    const [userRating, setUserRating] = useState<number>(0);
    const [totalVotes, setTotalVotes] = useState<number>(0);
    const [comments, setComments] = useState<any[]>([]);
    const [usersCache, setUsersCache] = useState<Record<string, User>>({});

    const [loading, setLoading] = useState<boolean>(true);
    const [isFavorite, setIsFavorite] = useState<boolean>(false);

    const fetchMissingUsers = useCallback(async (userIds: string[], currentCache: Record<string, User>) => {
        const uniqueIds = Array.from(new Set(userIds)).filter(id => id && !currentCache[id]);
        if (uniqueIds.length === 0) return {};

        try {
            const fetchedUsers = await Promise.all(
                uniqueIds.map(async (id) => {
                    try {
                        const profile = await usersService.getUserById(id);
                        return { id, profile };
                    } catch {
                        return { id, profile: null };
                    }
                })
            );

            const newCache: Record<string, User> = {};
            fetchedUsers.forEach(({ id, profile }) => {
                if (profile) newCache[id] = profile;
            });
            return newCache;
        } catch (err) {
            console.error("Erreur batch users:", err);
            return {};
        }
    }, []);

    useEffect(() => {
        if (!station) return;
        let isMounted = true;

        const fetchAllRadioData = async () => {
            try {
                setLoading(true);
                const [brandsData, showsData] = await Promise.all([
                    brandsService.getAllBrands(),
                    showsService.getShowsByStation(station).catch(() => [])
                ]);

                if (!isMounted) return;

                const currentBrand = brandsData.find((b) => b.id.toLowerCase() === station.toLowerCase());
                if (currentBrand) {
                    const extractedWeb = currentBrand.webRadios ?? [];
                    const extractedLocal = currentBrand.localRadios ?? [];
                    if (!currentBrand.liveStream) {
                        const fallbackRadio = extractedWeb[0] || extractedLocal[0];
                        if (fallbackRadio) currentBrand.liveStream = fallbackRadio.liveStream;
                    }
                    setBrand(currentBrand);
                    setLocalRadios(extractedLocal);
                    setWebRadios(extractedWeb);
                }

                if (Array.isArray(showsData) && showsData.length > 0) {
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
                }
            } catch (error) {
                console.error("Erreur lors du chargement initial:", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchAllRadioData();
        return () => { isMounted = false; };
    }, [station]);

    useEffect(() => {
        if (!brand) return;
        let isMounted = true;

        const loadCommunityData = async () => {
            try {
                setLoadingReviews(true);
                const dbContent = await contentService.resolveExternalApiId(brand.id);
                if (!dbContent || !dbContent.id || !isMounted) return;

                const targetContentId = dbContent.id;
                setDbContentId(targetContentId);

                const [summary, allRatings, reviewsList] = await Promise.all([
                    ratingContentService.getRatingSummary(targetContentId).catch(() => null),
                    ratingContentService.getAllRatings().catch(() => []),
                    reviewService.getReviewsByContent(targetContentId).catch(() => [])
                ]);

                if (!isMounted) return;
                setRatingSummary(summary);

                if (Array.isArray(allRatings)) {
                    const targetId = String(targetContentId).trim().toLowerCase();
                    const pageRatings = allRatings.filter((r: any) => {
                        if (!r) return false;
                        const cId = r.contentId ?? r.content_id ?? r.content_Id;
                        return cId ? String(cId).trim().toLowerCase() === targetId : false;
                    });
                    setTotalVotes(pageRatings.length);
                }

                if (Array.isArray(reviewsList)) {
                    const allUserIds = reviewsList.map((r: any) => r.user_id);
                    const newUsers = await fetchMissingUsers(allUserIds, {});
                    setUsersCache(newUsers);

                    const enrichedReviews = await Promise.all(
                        reviewsList.map(async (review: any) => {
                            const likesData = await likeReviewsService.getReviewLikes(review.id, currentUserId).catch(() => null);
                            return {
                                ...review,
                                likesCount: likesData?.likes_count ?? likesData?.likesCount ?? 0,
                                dislikesCount: likesData?.dislikes_count ?? likesData?.dislikesCount ?? 0,
                                userChoice: likesData?.userChoice ?? likesData?.user_choice ?? null
                            };
                        })
                    );

                    const parentComments = enrichedReviews.filter((r: any) => !r.parent_review_id);
                    const childReplies = enrichedReviews.filter((r: any) => !!r.parent_review_id);

                    const structuredComments = parentComments.map((parent) => ({
                        ...parent,
                        replies: childReplies.filter((reply) => reply.parent_review_id === parent.id)
                    }));
                    setComments(structuredComments);
                }

                if (isLoggedIn && currentUserId) {
                    try {
                        const existingRating = await ratingContentService.getRatingByIds(targetContentId, currentUserId);
                        if (existingRating && isMounted) {
                            setUserRating(existingRating.average_rating || 0);
                        }
                    } catch {
                        if (isMounted) setUserRating(0);
                    }
                }
            } catch (err) {
                console.error("Échec récupération des données communautaires :", err);
            } finally {
                if (isMounted) setLoadingReviews(false);
            }
        };

        loadCommunityData();
        return () => { isMounted = false; };
    }, [brand, isLoggedIn, currentUserId, fetchMissingUsers]);

    const handleRateStation = async (nextRating: number) => {
        if (!isLoggedIn || !currentUserId || !dbContentId) return;
        const previousRating = userRating;
        setUserRating(nextRating);
        const isFirstVote = previousRating === 0;
        if (isFirstVote) setTotalVotes((prev) => prev + 1);

        try {
            let existing = null;
            try { existing = await ratingContentService.getRatingByIds(dbContentId, currentUserId); } catch {}

            if (existing) {
                await ratingContentService.updateRating(dbContentId, currentUserId, { average_rating: nextRating });
            } else {
                await ratingContentService.createRating({ contentId: dbContentId, userId: currentUserId, average_rating: nextRating });
            }
            const updatedSummary = await ratingContentService.getRatingSummary(dbContentId);
            setRatingSummary(updatedSummary);
        } catch {
            setUserRating(previousRating);
            if (isFirstVote) setTotalVotes((prev) => Math.max(0, prev - 1));
        }
    };

    const handleDeleteRating = async () => {
        if (!isLoggedIn || !currentUserId || userRating === 0 || !dbContentId) return;
        const previousRating = userRating;
        setUserRating(0);
        setTotalVotes((prev) => Math.max(0, prev - 1));

        try {
            if (typeof ratingContentService.deleteRating === "function") {
                await ratingContentService.deleteRating(dbContentId, currentUserId);
            }
            const updatedSummary = await ratingContentService.getRatingSummary(dbContentId);
            setRatingSummary(updatedSummary);
        } catch {
            setUserRating(previousRating);
            setTotalVotes((prev) => prev + 1);
        }
    };

    const onPostReview = async (commentText: string) => {
        if (!isLoggedIn || !currentUserId || !dbContentId) return;
        try {
            const createdReview = await reviewService.createReview({
                contentId: dbContentId,
                userId: currentUserId,
                comment: commentText
            });
            if (createdReview) {
                const newUsers = await fetchMissingUsers([currentUserId], usersCache);
                setUsersCache(prev => ({ ...prev, ...newUsers }));
                setComments((prev) => [{
                    ...createdReview,
                    replies: [],
                    likesCount: 0,
                    dislikesCount: 0,
                    userChoice: null
                }, ...prev]);
            }
        } catch (err) {
            console.error("Erreur création avis :", err);
        }
    };

    const onPostReply = async (replyText: string, parentId: string) => {
        if (!isLoggedIn || !currentUserId || !dbContentId) return;
        try {
            const createdReply = await reviewService.createReview({
                contentId: dbContentId,
                userId: currentUserId,
                comment: replyText,
                parent_review_id: parentId
            });

            if (createdReply) {
                const newUsers = await fetchMissingUsers([currentUserId], usersCache);
                setUsersCache(prev => ({ ...prev, ...newUsers }));
                setComments((prev) =>
                    prev.map((comment) => {
                        if (comment.id === parentId) {
                            return { ...comment, replies: [...(comment.replies ?? []), {
                                    ...createdReply,
                                    likesCount: 0,
                                    dislikesCount: 0,
                                    userChoice: null
                                }] };
                        }
                        return comment;
                    })
                );
            }
        } catch (err) {
            console.error("Erreur réponse :", err);
        }
    };

    const handleDeleteReview = async (reviewId: string, parentId?: string) => {
        try {
            if (typeof reviewService.deleteReview === "function") {
                await reviewService.deleteReview(reviewId);
            }
            if (parentId) {
                setComments((prev) =>
                    prev.map((c) => {
                        if (c.id === parentId) {
                            return { ...c, replies: (c.replies ?? []).filter((r: any) => r.id !== reviewId) };
                        }
                        return c;
                    })
                );
            } else {
                setComments((prev) => prev.filter((c) => c.id !== reviewId));
            }
        } catch (err) {
            console.error("Erreur suppression :", err);
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

    const normalizedId = brand.id.toUpperCase();
    const foundKey = Object.keys(BRAND_THEMES).find((k) => normalizedId.startsWith(k));
    const matchedTheme = foundKey ? BRAND_THEMES[foundKey] : DEFAULT_THEME;
    const cleanMainTitle = brand.title.replace(/^ICI\s+/, "").replace(/["'«»]|<<|>>/g, "").trim();
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
                                ${isFavorite ? "bg-rose-500/10 border-rose-500/30 text-rose-500 shadow-md" : theme === "dark" ? "bg-white/[0.02] border-white/10 text-white/60 hover:bg-white/[0.06] hover:border-white/20 hover:text-white" : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300 hover:text-neutral-900 shadow-sm"}`}
                            >
                                {isFavorite ? <HiHeart size={18} className="scale-110 text-rose-500" /> : <HiOutlineHeart size={18} className="group-hover:scale-110" />}
                                <span className={isFavorite ? "font-black" : ""}>{isFavorite ? "Favori" : "Ajouter aux favoris"}</span>
                            </button>
                            <button className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-300 group ${theme === "dark" ? `bg-white/[0.02] border-white/10 ${matchedTheme.bgHover} ${matchedTheme.borderHover} text-white/60 ${matchedTheme.text}` : `bg-white border-neutral-200 ${matchedTheme.bgHover} ${matchedTheme.borderHover} text-neutral-600 shadow-sm`}`}>
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

                <RadioListsSection
                    filteredDiffusions={filteredDiffusions}
                    webRadios={webRadios}
                    localRadios={localRadios}
                    theme={theme}
                    matchedTheme={matchedTheme}
                />

                {dbContentId ? (
                    <RadioCommunityZone
                        contentId={dbContentId}
                        theme={theme}
                        isLoggedIn={isLoggedIn}
                        currentUserId={currentUserId}
                        loadingReviews={loadingReviews}
                        ratingSummary={ratingSummary}
                        userRating={userRating}
                        totalVotes={totalVotes}
                        comments={comments}
                        usersCache={usersCache}
                        handleRateStation={handleRateStation}
                        handleDeleteRating={handleDeleteRating}
                        onPostReview={onPostReview}
                        onPostReply={onPostReply}
                        handleDeleteReview={handleDeleteReview}
                    />
                ) : (
                    <div className="flex justify-center border-t pt-16 border-dashed border-neutral-300 dark:border-white/10">
                        <p className="text-xs font-semibold opacity-40">Connexion au serveur communautaire...</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default RadioPage;