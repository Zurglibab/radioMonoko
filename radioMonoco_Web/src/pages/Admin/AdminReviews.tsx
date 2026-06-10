import { useEffect, useState } from "react";
import AdminService from "../../services/AdminService.ts";
import type { Review } from "../../interfaces/Review.types.ts";
import { useNavigate } from "react-router-dom";
import {useTranslation} from "react-i18next";

const AdminReviews = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const {t} = useTranslation();

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await AdminService.getReviews();
            setReviews(data);
        } catch (err) {
            console.error(err);
            setError(t("admin.errorLoadingReviews"));
        } finally {
            setLoading(false);
        }
    };

    const isReviewFeatured = (review: any) => {
        return Boolean(review.featured ?? review.is_featured);
    };

    const getReviewText = (review: any) => {
        return review.comment || review.content || "Critique sans contenu";
    };

    const handleFeature = async (id: string, featured: boolean) => {
        try {
            await AdminService.featureReview(id, !featured);

            setReviews((prev) =>
                prev.map((review: any) =>
                    review.id === id
                        ? {
                            ...review,
                            featured: !featured,
                            is_featured: !featured,
                        }
                        : review
                )
            );
        } catch (err) {
            console.error("Erreur lors de la modification :", err);
        }
    };

    const handleDelete = async (id: string) => {
        const confirmDelete = window.confirm(
            t("admin.confirmDeleteReview")
        );

        if (!confirmDelete) return;

        try {
            await AdminService.deleteReview(id);
            setReviews((prev) => prev.filter((review) => review.id !== id));
        } catch (err) {
            console.error("Erreur lors de la suppression :", err);
        }
    };

    return (
        <div className="p-8">
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate("/admin")}
                    className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white px-3 py-2 rounded-full transition"
                >
                    ← {t("common.back")}
                </button>
            </div>

            <h1 className="text-4xl font-bold text-white mb-8">
                {t("admin.manageReviews")}
            </h1>

            {loading && (
                <p className="text-neutral-400">
                    {t("common.loading")}
                </p>
            )}

            {error && (
                <p className="text-red-500 mb-6">
                    {error}
                </p>
            )}

            {!loading && reviews.length === 0 && (
                <div className="bg-neutral-900/40 p-6 rounded-2xl text-center">
                    <p className="text-white font-semibold">
                        {t("admin.noReviews")}
                    </p>

                    <p className="text-neutral-500 mt-2">
                        {t("admin.reviewsCreatedText")}
                    </p>
                </div>
            )}

            <div className="space-y-4">
                {reviews.map((review: any) => {
                    const featured = isReviewFeatured(review);

                    return (
                        <div
                            key={review.id}
                            className="bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-xs px-3 py-1 rounded-full bg-neutral-800 text-neutral-400">
                                    {t("admin.review")}
                                </span>

                                {featured && (
                                    <span className="text-xs px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                        {t("admin.featured")}
                                    </span>
                                )}
                            </div>

                            <p className="text-white mb-4">
                                {getReviewText(review)}
                            </p>

                            <div className="grid md:grid-cols-3 gap-3 text-sm mb-4">
                                <div className="bg-black/20 border border-white/5 rounded-xl p-3">
                                    <p className="text-neutral-500 text-xs">
                                        {t("admin.reviewId")}
                                    </p>
                                    <p className="text-neutral-300 break-all mt-1">
                                        {review.id}
                                    </p>
                                </div>

                                <div className="bg-black/20 border border-white/5 rounded-xl p-3">
                                    <p className="text-neutral-500 text-xs">
                                        {t("admin.userId")}
                                    </p>
                                    <p className="text-neutral-300 break-all mt-1">
                                        {review.user_id || t("common.unavailable")}
                                    </p>
                                </div>

                                <div className="bg-black/20 border border-white/5 rounded-xl p-3">
                                    <p className="text-neutral-500 text-xs">
                                        {t("admin.contentId")}
                                    </p>
                                    <p className="text-neutral-300 break-all mt-1">
                                        {review.content_id || "Non renseigné"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3 mt-4">
                                <button
                                    onClick={() => handleFeature(review.id, featured)}
                                    className="bg-rose-600 hover:bg-rose-500 px-4 py-2 rounded-xl text-white"
                                >
                                    {featured ? t("admin.unfeature") : t("admin.feature")}
                                </button>

                                <button
                                    onClick={() => handleDelete(review.id)}
                                    className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-xl text-white"
                                >
                                    {t("common.delete")}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AdminReviews;