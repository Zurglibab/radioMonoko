import { useCallback, useEffect, useState } from "react";
import ratingContentService from "../services/RatingContentsService";
import reviewService from "../services/ReviewsService";
import likeReviewsService from "../services/LikeReviewsService";
import usersService from "../services/UsersService";
import contentService from "../services/ContentsService";
import { cached } from "../services/ApiCacheService";
import type { User } from "../interfaces/Users.types";
import type { Review } from "../interfaces/Reviews.types";
import type {UseCommunityDataOptions} from "../interfaces/UseCommunity.types.ts";

export const useCommunityData = ({ externalId, currentUserId, isLoggedIn }: UseCommunityDataOptions) => {
    const [dbContentId, setDbContentId]     = useState<string | null>(null);
    const [loadingReviews, setLoadingReviews] = useState(true);
    const [ratingSummary, setRatingSummary] = useState<any | null>(null);
    const [userRating, setUserRating]       = useState(0);
    const [totalVotes, setTotalVotes]       = useState(0);
    const [comments, setComments]           = useState<any[]>([]);
    const [usersCache, setUsersCache]       = useState<Record<string, User>>({});

    const fetchMissingUsers = useCallback(async (
        userIds: string[],
        currentCache: Record<string, User>
    ): Promise<Record<string, User>> => {
        const uniqueIds = Array.from(new Set(userIds)).filter(id => id && !currentCache[id]);
        if (uniqueIds.length === 0) return {};
        try {
            const fetched = await Promise.all(
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
            fetched.forEach(({ id, profile }) => { if (profile) newCache[id] = profile; });
            return newCache;
        } catch (err) {
            console.error("Erreur batch users:", err);
            return {};
        }
    }, []);

    useEffect(() => {
        if (!externalId) return;
        let isMounted = true;

        const load = async () => {
            try {
                setLoadingReviews(true);
                const dbContent = await cached(
                    `content_${externalId}`,
                    () => contentService.resolveExternalApiId(externalId),
                    60_000
                );
                if (!dbContent?.id || !isMounted) return;

                const targetContentId = dbContent.id;
                setDbContentId(targetContentId);

                const [summary, allRatings, reviewsList] = await Promise.all([
                    ratingContentService.getRatingSummary(targetContentId).catch(() => null),
                    cached("ratings_all", () => ratingContentService.getAllRatings().catch(() => []), 30_000),
                    cached(`reviews_${targetContentId}`, () => reviewService.getReviewsByContent(targetContentId).catch(() => []), 30_000),
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

                    const enriched = await Promise.all(
                        reviewsList.map(async (review: any) => {
                            const likesData = await cached(
                                `review_choice_${review.id}_${currentUserId}`,
                                () => likeReviewsService.getReviewLikes(review.id, currentUserId).catch(() => null),
                                15_000
                            );
                            const { likesCount, dislikesCount, userChoice } =
                                likeReviewsService.transformLikesData(likesData, currentUserId);
                            return { ...review, likesCount, dislikesCount, userChoice };
                        })
                    );

                    const parents = enriched.filter((r: any) => !r.parent_review_id);
                    const children = enriched.filter((r: any) => !!r.parent_review_id);
                    setComments(parents.map(p => ({
                        ...p,
                        replies: children.filter(c => c.parent_review_id === p.id),
                    })));
                }

                if (isLoggedIn && currentUserId) {
                    try {
                        const existingRating = await ratingContentService.getRatingByIds(targetContentId, currentUserId);
                        if (existingRating && isMounted) setUserRating(existingRating.average_rating || 0);
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

        load();
        return () => { isMounted = false; };
    }, [externalId, isLoggedIn, currentUserId, fetchMissingUsers]);

    const handleRateStation = async (nextRating: number) => {
        if (!isLoggedIn || !currentUserId || !dbContentId) return;
        const previousRating = userRating;
        const isFirstVote = previousRating === 0;
        setUserRating(nextRating);
        if (isFirstVote) setTotalVotes(prev => prev + 1);
        try {
            let existing = null;
            try { existing = await ratingContentService.getRatingByIds(dbContentId, currentUserId); } catch { /* noop */ }
            if (existing) {
                await ratingContentService.updateRating(dbContentId, currentUserId, { average_rating: nextRating });
            } else {
                await ratingContentService.createRating({ contentId: dbContentId, userId: currentUserId, average_rating: nextRating });
            }
            setRatingSummary(await ratingContentService.getRatingSummary(dbContentId));
        } catch {
            setUserRating(previousRating);
            if (isFirstVote) setTotalVotes(prev => Math.max(0, prev - 1));
        }
    };

    const handleDeleteRating = async () => {
        if (!isLoggedIn || !currentUserId || userRating === 0 || !dbContentId) return;
        const previousRating = userRating;
        setUserRating(0);
        setTotalVotes(prev => Math.max(0, prev - 1));
        try {
            if (typeof ratingContentService.deleteRating === "function") {
                await ratingContentService.deleteRating(dbContentId, currentUserId);
            }
            setRatingSummary(await ratingContentService.getRatingSummary(dbContentId));
        } catch {
            setUserRating(previousRating);
            setTotalVotes(prev => prev + 1);
        }
    };

    const onPostReview = async (commentText: string) => {
        if (!isLoggedIn || !currentUserId || !dbContentId) return;
        try {
            const created = await reviewService.createReview({
                contentId: dbContentId, userId: currentUserId, comment: commentText,
            });
            if (created) {
                const newUsers = await fetchMissingUsers([currentUserId], usersCache);
                setUsersCache(prev => ({ ...prev, ...newUsers }));
                setComments(prev => [{
                    ...created, replies: [], likesCount: 0, dislikesCount: 0, userChoice: null,
                }, ...prev]);
            }
        } catch (err) {
            console.error("Erreur création avis :", err);
        }
    };

    const onPostReply = async (replyText: string, parentId: string): Promise<Review | null> => {
        if (!isLoggedIn || !currentUserId || !dbContentId) return null;
        try {
            const created = await reviewService.createReview({
                contentId: dbContentId, userId: currentUserId, comment: replyText, parent_review_id: parentId,
            });
            if (created) {
                const newUsers = await fetchMissingUsers([currentUserId], usersCache);
                setUsersCache(prev => ({ ...prev, ...newUsers }));
                setComments(prev => prev.map(c =>
                    c.id === parentId
                        ? { ...c, replies: [...(c.replies ?? []), { ...created, likesCount: 0, dislikesCount: 0, userChoice: null }] }
                        : c
                ));
                return created;
            }
            return null;
        } catch (err) {
            console.error("Erreur réponse :", err);
            return null;
        }
    };

    const onUpdateReview = async (reviewId: string, commentData: { comment: string }): Promise<Review | null> => {
        try {
            const updated = await reviewService.updateReview(reviewId, commentData);
            if (!updated) return null;
            setComments(prev => prev.map(c => {
                if (c.id === reviewId) return { ...c, comment: updated.comment };
                if (c.replies?.length > 0) {
                    return { ...c, replies: c.replies.map((r: any) => r.id === reviewId ? { ...r, comment: updated.comment } : r) };
                }
                return c;
            }));
            return updated;
        } catch (err) {
            console.error("Erreur mise à jour avis :", err);
            return null;
        }
    };

    const handleDeleteReview = async (reviewId: string, parentId?: string) => {
        try {
            await reviewService.deleteReview(reviewId);
            if (parentId) {
                setComments(prev => prev.map(c =>
                    c.id === parentId
                        ? { ...c, replies: (c.replies ?? []).filter((r: any) => r.id !== reviewId) }
                        : c
                ));
            } else {
                setComments(prev => prev.filter(c => c.id !== reviewId));
            }
        } catch (err) {
            console.error("Erreur suppression :", err);
        }
    };

    const handleLikeInteraction = async (reviewId: string, actionType: "like" | "dislike" | "remove") => {
        if (!isLoggedIn || !currentUserId || !reviewId) return;
        const snapshot = JSON.parse(JSON.stringify(comments));

        setComments(prev => {
            const update = (c: any) => {
                if (c.id !== reviewId) return c;
                let likes = c.likesCount ?? 0;
                let dislikes = c.dislikesCount ?? 0;
                if (c.userChoice === "like") likes = Math.max(0, likes - 1);
                if (c.userChoice === "dislike") dislikes = Math.max(0, dislikes - 1);
                if (actionType === "like") likes++;
                if (actionType === "dislike") dislikes++;
                return { ...c, likesCount: likes, dislikesCount: dislikes, userChoice: actionType === "remove" ? null : actionType };
            };
            return prev.map(c => ({
                ...update(c),
                replies: c.replies?.map(update) ?? [],
            }));
        });

        try {
            if (actionType === "remove") {
                await likeReviewsService.removeLikeReview(reviewId, currentUserId);
            } else {
                await likeReviewsService.toggleLikeReview(reviewId, currentUserId, actionType === "like");
            }
            let freshData = null;
            try { freshData = await likeReviewsService.getReviewLikes(reviewId, currentUserId); } catch { /* noop */ }

            if (freshData) {
                const { likesCount, dislikesCount, userChoice } = likeReviewsService.transformLikesData(freshData, currentUserId);
                setComments(prev => {
                    const align = (c: any) =>
                        c.id === reviewId ? { ...c, likesCount, dislikesCount, userChoice } : c;
                    return prev.map(c => ({ ...align(c), replies: c.replies?.map(align) ?? [] }));
                });
            }
        } catch (err) {
            console.error("Erreur like :", err);
            setComments(snapshot);
        }
    };

    return {
        dbContentId,
        loadingReviews,
        ratingSummary,
        userRating,
        totalVotes,
        comments,
        usersCache,
        handleRateStation,
        handleDeleteRating,
        onPostReview,
        onPostReply,
        onUpdateReview,
        handleDeleteReview,
        handleLikeInteraction,
    };
};