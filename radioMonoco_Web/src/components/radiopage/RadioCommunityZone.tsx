import { useState, useEffect } from "react";
import { HiOutlineChatBubbleLeftRight, HiLockClosed, HiOutlineTrash } from "react-icons/hi2";
import { StarRating } from "../reviews/StarRating";
import ratingContentService from "../../services/RatingContentsService";
import reviewService from "../../services/ReviewsService";
import usersService from "../../services/UsersService";
import likeReviewsService from "../../services/LikeReviewsService";
import { cached } from "../../services/ApiCacheService";
import type { User } from "../../interfaces/Users.types";
import { CommentForm } from "./CommentForm.tsx";
import { CommentItem } from "./CommentItem.tsx";
import type { RadioCommunityZoneProps } from "../../interfaces/Props.types.ts";
import { useTranslation } from "react-i18next";
import {useLocation, useNavigate} from "react-router-dom";

export const RadioCommunityZone = ({
    contentId,
    theme,
    currentUser,
    loadingReviews: externalLoadingReviews,
    ratingSummary: externalRatingSummary,
    userRating: externalUserRating,
    totalVotes: externalTotalVotes,
    comments: externalComments,
    usersCache: externalUsersCache,
    handleRateStation: externalHandleRateStation,
    handleDeleteRating: externalHandleDeleteRating,
    onPostReview: externalOnPostReview,
    onPostReply: externalOnPostReply,
    handleDeleteReview: externalHandleDeleteReview,
    onLikeInteraction: externalOnLikeInteraction
}: RadioCommunityZoneProps) => {

    const { t } = useTranslation();
    const isLoggedIn = !!currentUser?.id;
    const [loadingReviews, setLoadingReviews] = useState<boolean>(externalLoadingReviews ?? true);
    const [ratingSummary, setRatingSummary] = useState<any | null>(externalRatingSummary ?? null);
    const [userRating, setUserRating] = useState<number>(externalUserRating ?? 0);
    const [hoverRating, setHoverRating] = useState<number>(0);
    const [comments, setComments] = useState<any[]>(externalComments ?? []);
    const [usersCache, setUsersCache] = useState<Record<string, User>>(externalUsersCache ?? {});
    const [totalVotes, setTotalVotes] = useState<number>(externalTotalVotes ?? 0);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (externalLoadingReviews !== undefined) {
            setLoadingReviews(externalLoadingReviews);
        }
    }, [externalLoadingReviews]);

    useEffect(() => {
        if (externalRatingSummary !== undefined) {
            setRatingSummary(externalRatingSummary);
        }
    }, [externalRatingSummary]);

    useEffect(() => {
        if (externalUserRating !== undefined) {
            setUserRating(externalUserRating);
        }
    }, [externalUserRating]);

    useEffect(() => {
        if (externalTotalVotes !== undefined) {
            setTotalVotes(externalTotalVotes);
        }
    }, [externalTotalVotes]);

    useEffect(() => {
        if (externalComments !== undefined) {
            setComments(externalComments);
        }
    }, [externalComments]);

    useEffect(() => {
        if (externalUsersCache !== undefined) {
            setUsersCache(externalUsersCache);
        }
    }, [externalUsersCache]);

    const fetchMissingUsers = async (userIds: string[]) => {
        const uniqueIds = Array.from(new Set(userIds)).filter(id => id && !usersCache[id]);
        if (uniqueIds.length === 0) return;

        try {
            const fetchedUsers = await Promise.all(
                uniqueIds.map(async (id) => {
                    try {
                        const profile = await cached(`user_${id}`, () => usersService.getUserById(id), 60_000);
                        return { id, profile };
                    } catch {
                        return { id, profile: null };
                    }
                })
            );

            setUsersCache((prev) => {
                const nextCache = { ...prev };
                fetchedUsers.forEach(({ id, profile }) => {
                    if (profile) nextCache[id] = profile;
                });
                return nextCache;
            });
        } catch (err) {
            console.error("Erreur batch users:", err);
        }
    };


    const internalHandleLikeInteraction = async (reviewId: string, actionType: "like" | "dislike" | "remove") => {
        if (!isLoggedIn || !currentUser?.id) return;
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
                await likeReviewsService.removeLikeReview(reviewId, currentUser?.id);
            } else {
                const isLikeBool = actionType === "like";
                await likeReviewsService.toggleLikeReview(reviewId, currentUser?.id, isLikeBool);
            }

            const countData = await cached(`review_count_${reviewId}`, () => likeReviewsService.getReviewLikesCount(reviewId).catch(() => null), 15_000);

            if (countData) {
                setComments((prevComments) => {
                    const alignWithDb = (c: any) => {
                        if (c.id !== reviewId) return c;
                        return {
                            ...c,
                            likesCount: countData?.likes ?? countData?.likesCount ?? countData?.likes_count ?? c.likesCount,
                            dislikesCount: countData?.dislikes ?? countData?.dislikesCount ?? countData?.dislikes_count ?? c.dislikesCount,
                            userChoice: actionType === "remove" ? null : actionType
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
            }
        } catch (err) {
            console.error("Erreur durant l'interaction de vote :", err);
        }
    };

    const handleLikeInteraction = externalOnLikeInteraction ?? internalHandleLikeInteraction;

    const handleRateStation = async (nextRating: number) => {
        if (externalHandleRateStation) {
            await externalHandleRateStation(nextRating);
        } else if (!isLoggedIn || !currentUser?.id) {
            return;
        } else {
            const previousRating = userRating;
            setUserRating(nextRating);
            const isFirstVote = previousRating === 0;
            if (isFirstVote) setTotalVotes((prev) => prev + 1);

            try {
                let existing = null;
                try { existing = await ratingContentService.getRatingByIds(contentId, currentUser?.id); } catch (err) { console.error(err); }

                if (existing) {
                    await ratingContentService.updateRating(contentId, currentUser?.id, { average_rating: nextRating });
                } else {
                    await ratingContentService.createRating({ contentId, userId: currentUser?.id, average_rating: nextRating });
                }

                const updatedSummary = await ratingContentService.getRatingSummary(contentId);
                setRatingSummary(updatedSummary);
            } catch (err) {
                console.error(err);
                setUserRating(previousRating);
                if (isFirstVote) setTotalVotes((prev) => Math.max(0, prev - 1));
            }
        }
    };

    const handleDeleteRating = async () => {
        if (externalHandleDeleteRating) {
            await externalHandleDeleteRating();
        } else if (!isLoggedIn || !currentUser?.id || userRating === 0) {
            return;
        } else {
            const previousRating = userRating;
            setUserRating(0);
            setTotalVotes((prev) => Math.max(0, prev - 1));

            try {
                if (typeof ratingContentService.deleteRating === "function") {
                    await ratingContentService.deleteRating(contentId, currentUser?.id);
                }
                const updatedSummary = await ratingContentService.getRatingSummary(contentId);
                setRatingSummary(updatedSummary);
            } catch (err) {
                console.error(err);
                setUserRating(previousRating);
                setTotalVotes((prev) => prev + 1);
            }
        }
    };

    const onPostReview = async (commentText: string) => {
        if (externalOnPostReview) {
            await externalOnPostReview(commentText);
        } else if (!isLoggedIn || !currentUser?.id) {
            return;
        } else {
            try {
                const createdReview = await reviewService.createReview({
                    contentId: contentId,
                    userId: currentUser?.id,
                    comment: commentText
                });
                if (createdReview) {
                    await fetchMissingUsers([currentUser?.id]);
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
        }
    };

    const onPostReply = async (replyText: string, parentId: string) => {
        if (externalOnPostReply) {
            await externalOnPostReply(replyText, parentId);
        } else if (!isLoggedIn || !currentUser?.id) {
            return;
        } else {
            try {
                const createdReply = await reviewService.createReview({
                    contentId: contentId,
                    userId: currentUser?.id,
                    comment: replyText,
                    parent_review_id: parentId
                });

                if (createdReply) {
                    await fetchMissingUsers([currentUser?.id]);
                    setComments((prev) =>
                        prev.map((comment) => {
                            if (comment.id === parentId) {
                                return {
                                    ...comment,
                                    replies: [...(comment.replies ?? []), {
                                        ...createdReply,
                                        likesCount: 0,
                                        dislikesCount: 0,
                                        userChoice: null
                                    }]
                                };
                            }
                            return comment;
                        })
                    );
                }
            } catch (err) {
                console.error("Erreur réponse :", err);
            }
        }
    };

    const handleDeleteReview = async (reviewId: string, parentId?: string) => {
        if (externalHandleDeleteReview) {
            await externalHandleDeleteReview(reviewId, parentId);
        } else {
            try {
                if (typeof reviewService.deleteReview === "function") {
                    await reviewService.deleteReview(reviewId);
                }
                if (parentId) {
                    setComments((prev) =>
                        prev.map((c) => {
                            if (c.id !== parentId) return c;
                            return { ...c, replies: (c.replies ?? []).filter((r: any) => r.id !== reviewId) };
                        })
                    );
                } else {
                    setComments((prev) => prev.filter((c) => c.id !== reviewId));
                }
            } catch (err) {
                console.error("Erreur suppression :", err);
            }
        }
    };

    const currentAverage = ratingSummary?.average_rating ?? ratingSummary?.averageRating ?? ratingSummary?.average_id ?? 0;
    const totalCommentsCount = comments.reduce((acc, c) => acc + 1 + (c.replies?.length ?? 0), 0);

    return (
        <section className={`grid grid-cols-1 lg:grid-cols-12 gap-16 border-t pt-16 ${theme === 'dark' ? 'border-white/5' : 'border-neutral-200'}`}>
            <div className="lg:col-span-4 space-y-6">
                <h3 className={`text-xs font-black uppercase tracking-[0.2em] ${theme === 'dark' ? 'opacity-30' : 'text-neutral-400'}`}>Notes de la communauté</h3>
                <div className="flex items-baseline gap-4">
                    <span className={`text-7xl font-black tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-neutral-900'}`}>
                        {currentAverage > 0 ? Number(currentAverage).toFixed(1) : "0.0"}
                    </span>
                    <span className={`text-xs font-bold uppercase tracking-widest ${theme === 'dark' ? 'opacity-30' : 'text-neutral-400'}`}>
                        / 5.0 ({totalVotes} {totalVotes > 1 ? t("radio.votes") : t("radio.vote")})
                    </span>
                </div>
                <div className="pt-2 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                        <StarRating rating={userRating} hover={hoverRating} onRate={handleRateStation} onHover={setHoverRating} disabled={!isLoggedIn} theme={theme} />
                        {isLoggedIn && userRating > 0 && (
                            <button
                                onClick={handleDeleteRating}
                                className={`p-1.5 rounded-lg transition-colors group ${theme === 'dark' ? 'hover:bg-white/5 text-neutral-500 hover:text-rose-400' : 'hover:bg-neutral-100 text-neutral-400 hover:text-rose-600'}`}
                                title={t("radio.deleteRating")}
                            >
                                <HiOutlineTrash size={16} className="transition-transform group-hover:scale-105" />
                            </button>
                        )}
                    </div>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'opacity-40' : 'text-neutral-400'}`}>
                        {!isLoggedIn ? t("radio.loginToRate") : userRating > 0 ? t("radio.ratingSaved") : t("radio.clickToRate")}
                    </p>
                </div>
            </div>

            <div className="lg:col-span-8 space-y-8">
                <div className="flex items-center justify-between border-b pb-4 border-transparent">
                    <h3 className={`text-sm font-black uppercase tracking-[0.15em] flex items-center gap-2.5 ${theme === 'dark' ? 'text-white/80' : 'text-neutral-800'}`}>
                        <HiOutlineChatBubbleLeftRight size={18} className="text-rose-500" /> {t("radio.comments")}
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${theme === 'dark' ? 'bg-white/10 text-white/60' : 'bg-neutral-200/60 text-neutral-500'}`}>{totalCommentsCount}</span>
                    </h3>
                </div>

                {!isLoggedIn ? (
                    <div className={`p-10 rounded-[2rem] text-center border border-dashed transition-all ${theme === "dark" ? "bg-white/[0.01] border-white/10" : "bg-neutral-100/40 border-neutral-200 shadow-inner"}`}>
                        <HiLockClosed size={20} className="mx-auto mb-3 text-rose-500/70" />
                        <p className={`text-sm font-semibold mb-5 ${theme === 'dark' ? 'text-neutral-300' : 'text-neutral-600'}`}>{t("radio.joinAudience")}</p>
                        <button
                            onClick={() =>
                                navigate("/login", {state: {from: location.pathname}
                                })
                            }
                            className={`px-7 py-3 text-[10px] font-black uppercase tracking-wider rounded-xl hover:opacity-90 transition-all duration-300 active:scale-95 shadow-md ${
                                theme === "dark"
                                    ? "bg-white text-neutral-900"
                                    : "bg-neutral-900 text-white"
                            }`}
                        >
                            {t("auth.loginButton")}
                        </button>
                    </div>
                ) : (
                    <CommentForm dbContentId={contentId} theme={theme} onPostReview={onPostReview} />
                )}

                {loadingReviews ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                        <div className="w-5 h-5 border-2 border-neutral-400 border-t-rose-500 rounded-full animate-spin" />
                        <p className="text-xs font-medium opacity-50">{t("radio.loadingLounge")}</p>
                    </div>
                ) : (
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin">
                        {comments.length === 0 ? (
                            <p className={`text-xs italic py-8 text-center ${theme === 'dark' ? 'opacity-40' : 'text-neutral-400'}`}>{t("radio.noComments")}</p>
                        ) : (
                            comments.map((c) => (
                                <CommentItem
                                    key={c.id}
                                    comment={c}
                                    usersCache={usersCache}
                                    currentUser={currentUser}
                                    isLoggedIn={isLoggedIn}
                                    theme={theme}
                                    onPostReply={onPostReply}
                                    onDeleteReview={handleDeleteReview}
                                    onLikeInteraction={handleLikeInteraction}
                                />
                            ))
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};