import {useCallback, useEffect, useRef, useState} from "react";
import {useParams, useLocation} from "react-router-dom";
import {HiBookmark, HiCheck} from "react-icons/hi2";
import {useAppearance} from "../context/AppearanceContext";
import showsService from "../services/ShowsService.ts";
import contentService from "../services/ContentsService";
import ratingContentService from "../services/RatingContentsService";
import reviewService from "../services/ReviewsService";
import {cached} from "../services/ApiCacheService";
import usersService from "../services/UsersService";
import likeReviewsService from "../services/LikeReviewsService";
import collectionItemsService from "../services/CollectionItemsService.ts";
import collectionsService from "../services/CollectionsService.ts";
import type {ApiDiffusion, ApiShow} from "../interfaces/Shows.types";
import type {User} from "../interfaces/Users.types";
import type {Collection} from "../interfaces/Collections.types.ts";
import {BRAND_THEMES} from "../assets/themes/BrandThemes";
import {DEFAULT_THEME} from "../assets/themes/DefaultTheme";
import {RadioCommunityZone} from "../components/radiopage/RadioCommunityZone";
import {RadioListsSection} from "../components/radiopage/RadioListsSection.tsx";
import {useTranslation} from "react-i18next";

const ShowPage = () => {
    const { id } = useParams<{ id:string }>();
    const { theme } = useAppearance();
    const {t} = useTranslation();

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

    const [show, setShow] = useState<ApiShow | null>(null);
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
    const location = useLocation();
    const fallbackShow = location.state?.show as ApiShow | undefined;

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
        if (!id) return;
        let isMounted = true;

        const fetchShowData = async () => {
            try {
                setLoading(true);

                const decoded = decodeURIComponent(id);

                const data = await cached(`show_${decoded}`, () => showsService.getShowByUrl(decoded), 30000);

                if (!data) {
                    console.warn("Show introuvable via URL, utilisation du fallback :", decoded);
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

            } catch (error) {
                console.error(error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchShowData();
        return () => { isMounted = false; };
    }, [id, fallbackShow]);

    useEffect(() => {
        if (isLoggedIn && currentUserId) {
            collectionsService.getUserCollections(currentUserId)
                .then(setCollections)
                .catch(console.error);
        }
    }, [isLoggedIn, currentUserId]);

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
        if (!show) return;
        let isMounted = true;

        const loadCommunityData = async () => {
            try {
                setLoadingReviews(true);
                const dbContent = await cached(`content_${show.id}`, () => contentService.resolveExternalApiId(show.id), 60_000);
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
                            const likesData = await cached(`review_choice_${review.id}_${currentUserId}`, () => likeReviewsService.getReviewLikes(review.id, currentUserId).catch(() => null), 15_000);
                            const { likesCount, dislikesCount, userChoice } = likeReviewsService.transformLikesData(likesData, currentUserId);
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
    }, [show, isLoggedIn, currentUserId, fetchMissingUsers]);

    const handleRateStation = async (nextRating: number) => {
        if (!isLoggedIn || !currentUserId || !dbContentId) return;
        const previousRating = userRating;
        setUserRating(nextRating);
        const isFirstVote = previousRating === 0;
        if (isFirstVote) setTotalVotes((prev) => prev + 1);

        try {
            let existing = null;
            try { existing = await ratingContentService.getRatingByIds(dbContentId, currentUserId); } catch(err) {console.error(err)}

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

    const handleLikeInteraction = async (reviewId: string, actionType: "like" | "dislike" | "remove") => {
        if (!isLoggedIn || !currentUserId) return;
        const previousCommentsSnapshot = JSON.parse(JSON.stringify(comments));

        setComments((prevComments) => {
            const updateCommentCounters = (c: any) => {
                if (c.id !== reviewId) return c;
                const previousChoice = c.userChoice;
                let newLikes = c.likesCount ?? 0;
                let newDislikes = c.dislikesCount ?? 0;

                if (previousChoice === "like") newLikes = Math.max(0, newLikes - 1);
                if (previousChoice === "dislike") newDislikes = Math.max(0, newDislikes - 1);

                if (actionType === "like") newLikes += 1;
                if (actionType === "dislike") newDislikes += 1;

                return {
                    ...c,
                    likesCount: newLikes,
                    dislikesCount: newDislikes,
                    userChoice: actionType === "remove" ? null : actionType
                };
            };

            return prevComments.map((comment) => {
                if (comment.id === reviewId) return updateCommentCounters(comment);
                if (comment.replies && comment.replies.length > 0) {
                    return { ...comment, replies: comment.replies.map(updateCommentCounters) };
                }
                return comment;
            });
        });

        try {
            if (actionType === "remove") {
                await likeReviewsService.removeLikeReview(reviewId, currentUserId);
            } else {
                const isLikeBool = actionType === "like";
                await likeReviewsService.toggleLikeReview(reviewId, currentUserId, isLikeBool);
            }
            let freshData = null;
            try {
                freshData = await likeReviewsService.getReviewLikes(reviewId, currentUserId);
            } catch (err) {
                console.error("[handleLikeInteraction] Error fetching fresh likes:", {
                    error: err,
                    reviewId,
                    currentUserId,
                    timestamp: new Date().toISOString()
                });
                freshData = null;
            }

            if (freshData) {
                const { likesCount: finalLikes, dislikesCount: finalDislikes, userChoice: finalUserChoice } = likeReviewsService.transformLikesData(freshData, currentUserId);
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
                        if (comment.replies && comment.replies.length > 0) {
                            return { ...comment, replies: comment.replies.map(alignWithDb) };
                        }
                        return comment;
                    });
                });
            } else {
                console.warn("[handleLikeInteraction] No fresh data from API, keeping optimistic state");
            }
        } catch (err) {
            console.error("[handleLikeInteraction] CRITICAL ERROR during like interaction:", {
                error: err,
                reviewId,
                currentUserId,
                timestamp: new Date().toISOString()
            });
            try {
                setComments(previousCommentsSnapshot);
            } catch (e) {
                console.error("[handleLikeInteraction] CRITICAL ERROR: Failed to revert state:", e);
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
            <div className={`flex items-center justify-center min-h-screen ${theme === 'dark' ? 'bg-app-bg text-app-text' : 'bg-neutral-50 text-neutral-800'}`}>
                <div className="w-6 h-6 border-2 border-current border-t-rose-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (!show) {
        return (
            <div className={`flex items-center justify-center min-h-screen ${
                theme === "dark"
                    ? "bg-app-bg text-app-text"
                    : "bg-neutral-50 text-neutral-800"
            }`}>
                <div className="max-w-lg text-center px-6">
                    <h2 className="text-2xl font-bold mb-3">
                        {t("radio.showNotFound")}
                    </h2>

                    <p className="text-sm opacity-60">
                        {t("radio.showNotFoundText")}
                    </p>
                </div>
            </div>
        );
    }

    const normalizedId = show.id.toUpperCase();
    const foundKey = Object.keys(BRAND_THEMES).find((k) => normalizedId.startsWith(k));
    const matchedTheme = foundKey ? BRAND_THEMES[foundKey] : DEFAULT_THEME;
    const cleanMainTitle = (show.title ?? "").replace(/^ICI\s+/, "").replace(/["'«»]|<<|>>/g, "").trim();
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

                            {isMenuOpen && (
                                <div className={`absolute top-14 left-0 w-80 py-3 rounded-2xl border shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200
                                                ${theme === 'dark' ? 'bg-neutral-900 border-white/10' : 'bg-white border-neutral-200'}`}>
                                    <div className={`px-5 py-3 font-bold text-xs uppercase tracking-wider opacity-70 ${theme === 'dark' ? 'text-neutral-300' : 'text-neutral-600'}`}>
                                        {t("radio.myCollections")}
                                    </div>
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
                        <div className="lg:col-span-7 w-full lg:mt-8 pb-4">
                            <div className="bg-neutral-100 dark:bg-white/[0.03] rounded-[2.5rem] p-12 border border-neutral-200 dark:border-white/5 flex flex-col justify-center min-h-[300px]">
                                <h2 className="text-xl font-bold mb-4 opacity-80">{t("radio.aboutShow")}</h2>
                                <p className="text-base leading-relaxed opacity-60">
                                    {show?.standFirst ?? t("radio.noDescription")}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <RadioListsSection
                    filteredDiffusions={filteredDiffusions}
                    theme={theme}
                    matchedTheme={matchedTheme}
                />

                {dbContentId ? (
                    <RadioCommunityZone
                        contentId={dbContentId}
                        theme={theme}
                        currentUserId={currentUserId}
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

export default ShowPage;