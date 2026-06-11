import {useCallback, useEffect, useRef, useState} from "react";
import {useParams} from "react-router-dom";
import LiveCard from "../components/radiopage/LiveCard";
import {HiBookmark, HiCheck} from "react-icons/hi2";
import {useAppearance} from "../context/AppearanceContext";
import brandsService from "../services/BrandsService";
import showsService from "../services/ShowsService.ts";
import contentService from "../services/ContentsService";
import ratingContentService from "../services/RatingContentsService";
import reviewService from "../services/ReviewsService";
import {cached} from "../services/ApiCacheService";
import usersService from "../services/UsersService";
import likeReviewsService from "../services/LikeReviewsService";
import collectionItemsService from "../services/CollectionItemsService.ts";
import collectionsService from "../services/CollectionsService.ts";
import type {Brand} from "../interfaces/Brands.types";
import type {ApiDiffusion, ApiShow} from "../interfaces/Shows.types";
import type {User} from "../interfaces/Users.types";
import type {Collection} from "../interfaces/Collections.types.ts";
import {BRAND_THEMES} from "../assets/themes/BrandThemes";
import {DEFAULT_THEME} from "../assets/themes/DefaultTheme";
import {RadioCommunityZone} from "../components/radiopage/RadioCommunityZone";
import {RadioListsSection} from "../components/radiopage/RadioListsSection.tsx";
import {Loader} from "../components/utils/Loader.tsx";
import {useTranslation} from "react-i18next";
import {useAuth} from "../context/AuthContext.tsx";

const RadioPage = () => {
    const { station } = useParams<{ station: string }>();
    const { theme } = useAppearance();
    const {t} = useTranslation();

    const { user: currentUser } = useAuth();
    const isLoggedIn = !!currentUser?.id;

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
     const [collections, setCollections] = useState<Collection[]>([]);
     const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
     const [collectionItemStates, setCollectionItemStates] = useState<Record<string, boolean>>({});
     const menuRef = useRef<HTMLDivElement>(null);

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
                    cached('brands_all', () => brandsService.getAllBrands(), 60_000),
                    cached(`shows_${station}`, () => showsService.getShowsByStation(station).catch(() => []), 30_000)
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
                            return [...acc, ...currentShow.diffusions.map(d => ({ ...d, parentTitle: currentShow.title }))];
                        }
                        return acc;
                    }, []);
                    setDiffusions(allDiffusions);
                }
            } catch (error) {
                console.error("Erreur chargement:", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchAllRadioData();
        return () => { isMounted = false; };
    }, [station]);

     useEffect(() => {
         if (isLoggedIn && currentUser?.id) {
             collectionsService.getUserCollections(currentUser?.id)
                 .then(setCollections)
                 .catch(console.error);
         }
     }, [isLoggedIn, currentUser?.id]);

     useEffect(() => {
         if (!dbContentId || collections.length === 0) return;

         const checkCollectionItems = async () => {
             const states: Record<string, boolean> = {};
             for (const col of collections) {
                 try {
                     const items = await collectionItemsService.getItemsByCollection(col.id);
                     states[col.id] = items.some((item: any) => item.content_id === dbContentId);
                 } catch (error) {
                     console.error(`[checkCollectionItems] Error checking collection ${col.id}:`, error);
                     states[col.id] = false;
                 }
             }
             setCollectionItemStates(states);
         };

         checkCollectionItems();
     }, [dbContentId, collections]);

    useEffect(() => {
        if (!brand) return;
        let isMounted = true;

        const loadCommunityData = async () => {
            try {
                setLoadingReviews(true);
                const dbContent = await cached(`content_${brand.id}`, () => contentService.resolveExternalApiId(brand.id), 60_000);
                if (!dbContent || !dbContent.id || !isMounted) return;

                const targetContentId = dbContent.id;
                setDbContentId(targetContentId);

                const [summary, allRatings, reviewsList] = await Promise.all([
                    ratingContentService.getRatingSummary(targetContentId).catch(() => null),
                    cached('ratings_all', () => ratingContentService.getAllRatings().catch(() => []), 30_000),
                    cached(`reviews_${targetContentId}`, () => reviewService.getReviewsByContent(targetContentId).catch(() => []), 30_000)
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
                            const likesData = await cached(`review_choice_${review.id}_${currentUser?.id}`, () => likeReviewsService.getReviewLikes(review.id, currentUser?.id).catch(() => null), 15_000);
                            const { likesCount, dislikesCount, userChoice } = likeReviewsService.transformLikesData(likesData, currentUser?.id);
                            return {
                                ...review,
                                likesCount,
                                dislikesCount,
                                userChoice
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

                if (isLoggedIn && currentUser?.id) {
                    try {
                        const existingRating = await ratingContentService.getRatingByIds(targetContentId, currentUser?.id);
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
    }, [brand, isLoggedIn, currentUser?.id, fetchMissingUsers]);

    const handleRateStation = async (nextRating: number) => {
        if (!isLoggedIn || !currentUser?.id || !dbContentId) return;
        const previousRating = userRating;
        setUserRating(nextRating);
        const isFirstVote = previousRating === 0;
        if (isFirstVote) setTotalVotes((prev) => prev + 1);

        try {
            let existing = null;
            try { existing = await ratingContentService.getRatingByIds(dbContentId, currentUser?.id); } catch(err) {console.error(err)}

            if (existing) {
                await ratingContentService.updateRating(dbContentId, currentUser?.id, { average_rating: nextRating });
            } else {
                await ratingContentService.createRating({ contentId: dbContentId, userId: currentUser?.id, average_rating: nextRating });
            }
            const updatedSummary = await ratingContentService.getRatingSummary(dbContentId);
            setRatingSummary(updatedSummary);
        } catch {
            setUserRating(previousRating);
            if (isFirstVote) setTotalVotes((prev) => Math.max(0, prev - 1));
        }
    };

    const handleDeleteRating = async () => {
        if (!isLoggedIn || !currentUser?.id || userRating === 0 || !dbContentId) return;
        const previousRating = userRating;
        setUserRating(0);
        setTotalVotes((prev) => Math.max(0, prev - 1));

        try {
            if (typeof ratingContentService.deleteRating === "function") {
                await ratingContentService.deleteRating(dbContentId, currentUser?.id);
            }
            const updatedSummary = await ratingContentService.getRatingSummary(dbContentId);
            setRatingSummary(updatedSummary);
        } catch {
            setUserRating(previousRating);
            setTotalVotes((prev) => prev + 1);
        }
    };

    const onPostReview = async (commentText: string) => {
        if (!isLoggedIn || !currentUser?.id || !dbContentId) return;
        try {
            const createdReview = await reviewService.createReview({
                contentId: dbContentId,
                userId: currentUser?.id,
                comment: commentText
            });
            if (createdReview) {
                const newUsers = await fetchMissingUsers([currentUser?.id], usersCache);
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
        if (!isLoggedIn || !currentUser?.id || !dbContentId) return;
        try {
            const createdReply = await reviewService.createReview({
                contentId: dbContentId,
                userId: currentUser?.id,
                comment: replyText,
                parent_review_id: parentId
            });

            if (createdReply) {
                const newUsers = await fetchMissingUsers([currentUser?.id], usersCache);
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

    const handleLikeInteraction = async (
        reviewId: string,
        actionType: "like" | "dislike" | "remove"
    ) => {

        if (!isLoggedIn || !currentUser?.id) {
            console.warn("[DEBUG] User not logged in or currentUser?.id missing");
            return;
        }

        if (!reviewId) {
            console.error("[DEBUG] reviewId is missing!");
            return;
        }

        const previousCommentsSnapshot = JSON.parse(JSON.stringify(comments));

        setComments((prevComments) => {

            const updateCommentCounters = (c: any) => {
                if (c.id !== reviewId) return c;

                const previousChoice = c.userChoice;
                let newLikes = c.likesCount ?? 0;
                let newDislikes = c.dislikesCount ?? 0;

                if (previousChoice === "like") newLikes = Math.max(0, newLikes - 1);
                if (previousChoice === "dislike") newDislikes = Math.max(0, newDislikes - 1);

                if (actionType === "like") newLikes++;
                if (actionType === "dislike") newDislikes++;

                return {
                    ...c,
                    likesCount: newLikes,
                    dislikesCount: newDislikes,
                    userChoice: actionType === "remove" ? null : actionType
                };
            };

            return prevComments.map((comment) => {
                if (comment.id === reviewId) return updateCommentCounters(comment);

                if (comment.replies?.length > 0) {
                    return {
                        ...comment,
                        replies: comment.replies.map(updateCommentCounters)
                    };
                }

                return comment;
            });
        });

        try {

            if (actionType === "remove") {
                await likeReviewsService.removeLikeReview(
                    reviewId,
                    currentUser?.id
                );
            } else {
                const isLikeBool = actionType === "like";

                await likeReviewsService.toggleLikeReview(
                    reviewId,
                    currentUser?.id,
                    isLikeBool
                );
            }

            let freshData = null;

            try {

                freshData = await likeReviewsService.getReviewLikes(
                    reviewId,
                    currentUser?.id
                );

            } catch (err) {
                console.error("[DEBUG] getReviewLikes failed:", err);
            }

            if (freshData) {
                const transformed =
                    likeReviewsService.transformLikesData(
                        freshData,
                        currentUser?.id
                    );

                const {
                    likesCount: finalLikes,
                    dislikesCount: finalDislikes,
                    userChoice: finalUserChoice
                } = transformed;

                setComments((prevComments) => {
                    const alignWithDb = (c: any) => {
                        if (c.id !== reviewId) return c;

                        return {
                            ...c,
                            likesCount: finalLikes,
                            dislikesCount: finalDislikes,
                            userChoice: finalUserChoice
                        };
                    };

                    return prevComments.map((comment) => {
                        if (comment.id === reviewId) return alignWithDb(comment);

                        if (comment.replies?.length > 0) {
                            return {
                                ...comment,
                                replies: comment.replies.map(alignWithDb)
                            };
                        }

                        return comment;
                    });
                });
            } else {
                console.warn(
                    "[DEBUG] No fresh data returned, keeping optimistic state"
                );
            }
        } catch (err) {
            console.error("[DEBUG] CRITICAL ERROR:", err);
            try {
                setComments(previousCommentsSnapshot);
            } catch (e) {
                console.error("[DEBUG] Failed to revert state:", e);
            }
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

     const toggleCollectionItem = async (collectionId: string) => {
         if (!dbContentId) return;
         try {
             const isCurrentlyInCollection = collectionItemStates[collectionId];
             if (isCurrentlyInCollection) {
                 try {
                     await collectionItemsService.deleteItemFromCollection(collectionId, dbContentId);
                 } catch (err) {
                     console.error(err);
                 }
             } else {
                 const newItem: any = {
                     collection_id: collectionId,
                     content_id: dbContentId,
                     position: 0,
                     note: null
                 };

                 await collectionItemsService.addItemToCollection(newItem);
             }
             setCollectionItemStates((prev) => ({
                 ...prev,
                 [collectionId]: !isCurrentlyInCollection
             }));
         } catch (error) {
             console.error("[toggleCollectionItem] Error:", error);
         }
     };

    if (loading) {
        return (
            <div className={`flex justify-center items-center min-h-screen ${theme === 'dark' ? 'bg-app-bg text-app-text' : 'bg-neutral-50 text-neutral-800'}`}>
                <Loader />
            </div>
        );
    }

    if (!brand) return null;

    const normalizedId = brand.id.toUpperCase();
    const foundKey = Object.keys(BRAND_THEMES).find((k) => normalizedId.startsWith(k));
    const matchedTheme = foundKey ? BRAND_THEMES[foundKey] : DEFAULT_THEME;
    const cleanMainTitle = brand.title.replace(/^ICI\s+/, "").replace(/["'«»]|<<|>>/g, "").trim();
    const filteredDiffusions = diffusions.filter(e => e.podcastEpisode?.url);

    return (
        <div className={`relative min-h-screen ${theme === 'dark' ? 'bg-app-bg text-app-text' : 'bg-neutral-50 text-neutral-800'}`}>
            <main className="max-w-[1400px] mx-auto px-6 pt-24 pb-32">
                <section className="grid lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-5 space-y-8">
                        <h1 className="text-4xl md:text-6xl font-black uppercase">{cleanMainTitle}</h1>

                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className={`h-12 px-6 rounded-2xl font-bold text-xs flex items-center gap-2.5 border transition-all duration-300 group
        ${collections.length > 0 && Object.values(collectionItemStates).some(v => v)
                                    ? theme === 'dark'
                                        ? 'bg-rose-500/10 border-rose-500/50 text-rose-400 hover:bg-rose-500/20 hover:border-rose-400'
                                        : 'bg-rose-50 border-rose-300 text-rose-600 hover:bg-rose-100 hover:border-rose-400 shadow-sm'
                                    : theme === 'dark'
                                        ? 'bg-white/[0.02] border-white/10 text-white hover:bg-white/[0.06]'
                                        : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50 shadow-sm'}`}
                            >
                                <HiBookmark size={18} className="group-hover:scale-110 transition-transform" />
                                <span>{t("radio.save")}</span>
                                {collections.length > 0 && Object.values(collectionItemStates).some(v => v) && (
                                    <span className="ml-1 h-2 w-2 rounded-full bg-current"></span>
                                )}
                            </button>

                            {/* Collections Menu */}
                            {isMenuOpen && (
                                <div className={`absolute top-14 left-0 w-80 py-3 rounded-2xl border shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200
            ${theme === 'dark' ? 'bg-neutral-900 border-white/10' : 'bg-white border-neutral-200'}`}>
                                    {/* Header */}
                                    <div className={`px-5 py-3 font-bold text-xs uppercase tracking-wider opacity-70 ${theme === 'dark' ? 'text-neutral-300' : 'text-neutral-600'}`}>
                                        {t("radio.myCollections")}
                                    </div>

                                    {/* Collections List */}
                                    <div className="max-h-72 overflow-y-auto">
                                        {collections.length === 0 ? (
                                            <div className={`px-5 py-4 text-xs text-center ${theme === 'dark' ? 'text-neutral-500' : 'text-neutral-500'}`}>
                                                {t("radio.noCollection")}
                                            </div>
                                        ) : (
                                            collections.map((col) => {
                                                const isInCollection = collectionItemStates[col.id] ?? false;
                                                return (
                                                    <button
                                                        key={col.id}
                                                        onClick={() => toggleCollectionItem(col.id)}
                                                        className={`w-full flex items-center gap-3 px-5 py-3 transition-all duration-200 text-sm group
                                        ${isInCollection
                                                            ? theme === 'dark'
                                                                ? 'bg-rose-500/15 hover:bg-rose-500/25'
                                                                : 'bg-rose-50 hover:bg-rose-100'
                                                            : theme === 'dark'
                                                                ? 'hover:bg-white/5'
                                                                : 'hover:bg-neutral-50'
                                        }`}
                                    >
                                        {/* Checkbox */}
                                        <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200
                                        ${isInCollection
                                                ? theme === 'dark'
                                                    ? 'bg-rose-500 border-rose-400'
                                                    : 'bg-rose-500 border-rose-600'
                                                : theme === 'dark'
                                                    ? 'border-white/20 group-hover:border-white/40'
                                                    : 'border-neutral-300 group-hover:border-neutral-400'
                                        }`}>
                                            {isInCollection && (
                                                <HiCheck size={14} className="text-white animate-in scale-in duration-200" />
                                            )}
                                        </div>

                                        {/* Collection Name */}
                                        <span className={`flex-1 text-left font-medium transition-colors duration-200
                                        ${isInCollection
                                                ? theme === 'dark'
                                                    ? 'text-rose-300'
                                                    : 'text-rose-700'
                                                : theme === 'dark'
                                                    ? 'text-white'
                                                    : 'text-neutral-800'
                                        }`}>
                                            {col.name}
                                        </span>

                                        {/* Indicator dot */}
                                        {isInCollection && (
                                            <div className="w-2 h-2 rounded-full bg-rose-500/80"></div>
                                        )}
                                    </button>
                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="lg:col-span-7 w-full lg:mt-8 pb-4">
                        <div className={`rounded-[2.5rem] overflow-hidden transition-all duration-500  ${theme === "dark" ? "shadow-[0_40px_80px_-30px_rgba(0,0,0,0.7)]" : "shadow-[0_30px_60px_-20px_rgba(0,0,0,0.08)] border border-neutral-200/50"}`}>
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
                        currentUser={currentUser}
                        loadingReviews={loadingReviews}
                        ratingSummary={ratingSummary}
                        userRating={userRating}
                        totalVotes={totalVotes}
                        comments={comments}
                        usersCache={usersCache}
                        onLikeInteraction={handleLikeInteraction}
                        handleRateStation={handleRateStation}
                        handleDeleteRating={handleDeleteRating}
                        onPostReview={onPostReview}
                        onPostReply={onPostReply}
                        handleDeleteReview={handleDeleteReview}
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