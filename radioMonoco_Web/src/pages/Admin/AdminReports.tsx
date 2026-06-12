import { useEffect, useMemo, useState } from "react";
import AdminService from "../../services/AdminService.ts";
import type { ReportReview, ReportUser } from "../../interfaces/Report.types.ts";

import type { Review } from "../../interfaces/Review.types.ts";
import { useNavigate } from "react-router-dom";
import {useTranslation} from "react-i18next";
import type {User} from "../../interfaces/Users.types.ts";


type ActiveTab = "users" | "reviews";

const AdminReports = () => {
    const [userReports, setUserReports] = useState<ReportUser[]>([]);
    const [reviewReports, setReviewReports] = useState<ReportReview[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [activeTab, setActiveTab] = useState<ActiveTab>("reviews");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const {t} = useTranslation();

    const navigate = useNavigate();

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            setLoading(true);
            setError("");

            const [userReportsData, reviewReportsData, usersData, reviewsData] =
                await Promise.all([
                    AdminService.getUserReports(),
                    AdminService.getReviewReports(),
                    AdminService.getUsers(),
                    AdminService.getReviews(),
                ]);

            setUserReports(userReportsData);
            setReviewReports(reviewReportsData);
            setUsers(usersData);
            setReviews(reviewsData);
        } catch (err) {
            console.error("Erreur récupération signalements :", err);
            setError(t("admin.errorLoadingReports"));
        } finally {
            setLoading(false);
        }
    };

    const usersMap = useMemo(() => {
        const map: Record<string, User> = {};
        users.forEach((u) => {
            map[u.id] = u;
        });
        return map;
    }, [users]);

    const reviewsMap = useMemo(() => {
        const map: Record<string, Review> = {};
        reviews.forEach((r: any) => {
            map[r.id] = r;
        });
        return map;
    }, [reviews]);

    const getReviewText = (review: any) => {
        return review?.comment || review?.content || "Critique introuvable ou supprimée";
    };

    const handleDeleteUserReport = async (id: string) => {
        try {
            await AdminService.deleteUserReport(id);
            setUserReports((prev) => prev.filter((r) => r.id !== id));
        } catch (err) {
            console.error("Erreur suppression report user :", err);
        }
    };

    const handleDeleteReviewReport = async (id: string) => {
        try {
            await AdminService.deleteReviewReport(id);
            setReviewReports((prev) => prev.filter((r) => r.id !== id));
        } catch (err) {
            console.error("Erreur suppression report review :", err);
        }
    };

    const handleClearUserReports = async (reportedUserId: string) => {
        try {
            await AdminService.clearUserReports(reportedUserId);
            setUserReports((prev) =>
                prev.filter((r) => r.reported_user_id !== reportedUserId)
            );
        } catch (err) {
            console.error("Erreur suppression reports user :", err);
        }
    };

    const handleClearReviewReports = async (reviewId: string) => {
        try {
            await AdminService.clearReviewReports(reviewId);
            setReviewReports((prev) =>
                prev.filter((r) => r.review_id !== reviewId)
            );
        } catch (err) {
            console.error("Erreur suppression reports review :", err);
        }
    };

    const handleDeleteReview = async (reviewId: string) => {
        const confirmDelete = window.confirm(
            t("admin.confirmDeleteReview")
        );

        if (!confirmDelete) return;

        try {
            await AdminService.deleteReview(reviewId);
            await AdminService.clearReviewReports(reviewId).catch(() => null);

            setReviews((prev) => prev.filter((r: any) => r.id !== reviewId));
            setReviewReports((prev) =>
                prev.filter((r) => r.review_id !== reviewId)
            );
        } catch (err) {
            console.error("Erreur suppression critique :", err);
        }
    };

    const handleBanUser = async (userId: string) => {
        const confirmBan = window.confirm(
            t("admin.confirmBanUser")
        );

        if (!confirmBan) return;

        try {
            await AdminService.banUser(userId, true);
            setUsers((prev) =>
                prev.map((u: any) =>
                    u.id === userId ? { ...u, ban: true } : u
                )
            );
        } catch (err) {
            console.error("Erreur ban utilisateur :", err);
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

            <h1 className="text-4xl font-black app-text mb-8">
                {t("admin.reports")}
            </h1>

            <div className="flex gap-3 mb-8">
                <button
                    onClick={() => setActiveTab("reviews")}
                    className={`px-5 py-2 rounded-full font-semibold transition ${
                        activeTab === "reviews"
                            ? "bg-rose-600 text-white"
                            : "bg-neutral-800 text-neutral-400 hover:text-white"
                    }`}
                >
                    {t("admin.reportedReviews")} ({reviewReports.length})
                </button>

                <button
                    onClick={() => setActiveTab("users")}
                    className={`px-5 py-2 rounded-full font-semibold transition ${
                        activeTab === "users"
                            ? "bg-rose-600 text-white"
                            : "bg-neutral-800 text-neutral-400 hover:text-white"
                    }`}
                >
                    {t("admin.reportedUsers")} ({userReports.length})
                </button>
            </div>

            {loading && (
                <p className="text-neutral-400 text-app-text">{t("admin.loadingReports")}</p>
            )}

            {error && (
                <p className="text-red-400 mb-6">{error}</p>
            )}

            {!loading && activeTab === "reviews" && (
                <div className="space-y-4">
                    {reviewReports.length === 0 ? (
                        <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-8 text-center">
                            <p className="text-app-text font-semibold">
                                {t("admin.noReviewReports")}
                            </p>
                            <p className="text-neutral-500 mt-2">
                                {t("admin.noReviewReportsText")}
                            </p>
                        </div>
                    ) : (
                        reviewReports.map((report) => {
                            const review: any = reviewsMap[report.review_id];
                            const author = review?.user_id
                                ? usersMap[review.user_id]
                                : null;
                            const reporter = usersMap[report.reporter_id];

                            return (
                                <div
                                    key={report.id}
                                    className="bg-neutral-900/40 backdrop-blur-2xl p-6 rounded-3xl border border-white/5"
                                >
                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className="text-xs px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                                                    {t("admin.reportedReview")}
                                                </span>

                                                <span className="text-xs text-neutral-500">
                                                    {new Date(report.created_at).toLocaleDateString()}
                                                </span>
                                            </div>

                                            <p className="text-neutral-400 text-app-text text-sm mb-2">
                                                {t("admin.reportType")}
                                                <span className="text-app-text font-semibold ml-2">
                                                    {report.report_type}
                                                </span>
                                            </p>

                                            {report.description && (
                                                <p className="text-neutral-300 text-sm mb-4">
                                                    {t("admin.description")} {report.description}
                                                </p>
                                            )}

                                            <div className="bg-black/20 border border-white/5 rounded-2xl p-4 mt-4">
                                                <p className="text-neutral-500 text-xs mb-2">
                                                    {t("admin.concernedReview")}
                                                </p>
                                                <p className="text-app-text">
                                                    {getReviewText(review)}
                                                </p>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-3 mt-4">
                                                <div className="bg-black/20 border border-white/5 rounded-xl p-3">
                                                    <p className="text-neutral-500 text-xs">
                                                        {t("admin.reviewAuthor")}
                                                    </p>
                                                    <p className="text-app-text text-sm mt-1">
                                                        {author
                                                            ? `@${author.username}`
                                                            : review?.user_id || "Inconnu"}
                                                    </p>
                                                </div>

                                                <div className="bg-black/20 border border-white/5 rounded-xl p-3">
                                                    <p className="text-neutral-500 text-xs">
                                                        {t("admin.reportedBy")}
                                                    </p>
                                                    <p className="text-app-text text-sm mt-1">
                                                        {reporter
                                                            ? `@${reporter.username}`
                                                            : report.reporter_id}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap md:flex-col gap-3">
                                            <button
                                                onClick={() => handleDeleteReview(report.review_id)}
                                                className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-xl text-app-text text-sm"
                                            >
                                                {t("admin.deleteReview")}
                                            </button>

                                            <button
                                                onClick={() => handleClearReviewReports(report.review_id)}
                                                className="bg-neutral-700 hover:bg-neutral-600 px-4 py-2 rounded-xl text-app-text text-sm"
                                            >
                                                {t("admin.clearReports")}
                                            </button>

                                            <button
                                                onClick={() => handleDeleteReviewReport(report.id)}
                                                className="bg-neutral-800 hover:bg-neutral-700 px-4 py-2 rounded-xl text-neutral-300 text-sm"
                                            >
                                                {t("admin.deleteReport")}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {!loading && activeTab === "users" && (
                <div className="space-y-4">
                    {userReports.length === 0 ? (
                        <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-8 text-center">
                            <p className="text-app-text font-semibold">
                                {t("admin.noUserReports")}
                            </p>
                            <p className="text-neutral-500 mt-2">
                                {t("admin.noUserReportsText")}
                            </p>
                        </div>
                    ) : (
                        userReports.map((report) => {
                            const reportedUser = usersMap[report.reported_user_id];
                            const reporter = usersMap[report.reporter_id];

                            return (
                                <div
                                    key={report.id}
                                    className="bg-neutral-900/40 backdrop-blur-2xl p-6 rounded-3xl border border-white/5"
                                >
                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className="text-xs px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                                                    {t("admin.reportedUser")}
                                                </span>

                                                <span className="text-xs text-neutral-500">
                                                    {new Date(report.created_at).toLocaleDateString()}
                                                </span>
                                            </div>

                                            <p className="text-neutral-400 text-sm mb-2">
                                                {t("admin.reportType")}
                                                <span className="text-app-text font-semibold ml-2">
                                                    {report.report_type}
                                                </span>
                                            </p>

                                            {report.description && (
                                                <p className="text-neutral-300 text-sm mb-4">
                                                    {t("admin.description")} {report.description}
                                                </p>
                                            )}

                                            <div className="grid md:grid-cols-2 gap-3 mt-4">
                                                <div className="bg-black/20 border border-white/5 rounded-xl p-3">
                                                    <p className="text-neutral-500 text-xs">
                                                        {t("admin.concernedUser")}
                                                    </p>
                                                    <p className="text-app-text text-sm mt-1">
                                                        {reportedUser
                                                            ? `@${reportedUser.username}`
                                                            : report.reported_user_id}
                                                    </p>
                                                    {reportedUser?.is_banned && (
                                                        <p className="text-red-400 text-xs mt-2">
                                                            {t("admin.userAlreadyBanned")}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="bg-black/20 border border-white/5 rounded-xl p-3">
                                                    <p className="text-neutral-500 text-xs">
                                                        {t("admin.reportedBy")}
                                                    </p>
                                                    <p className="text-app-text text-sm mt-1">
                                                        {reporter ? `@${reporter.username}` : report.reporter_id}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap md:flex-col gap-3">
                                            <button
                                                onClick={() => navigate(`/users/${report.reported_user_id}`)}
                                                className="bg-rose-600 hover:bg-rose-500 px-4 py-2 rounded-xl text-app-text text-sm"
                                            >
                                                {t("admin.viewProfile")}
                                            </button>

                                            <button
                                                onClick={() => handleBanUser(report.reported_user_id)}
                                                className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-xl text-app-text text-sm"
                                            >
                                                {t("admin.ban")}
                                            </button>

                                            <button
                                                onClick={() => handleClearUserReports(report.reported_user_id)}
                                                className="bg-neutral-700 hover:bg-neutral-600 px-4 py-2 rounded-xl text-app-text text-sm"
                                            >
                                                {t("admin.clearReports")}
                                            </button>

                                            <button
                                                onClick={() => handleDeleteUserReport(report.id)}
                                                className="bg-neutral-800 hover:bg-neutral-700 px-4 py-2 rounded-xl text-neutral-300 text-sm"
                                            >
                                                {t("admin.deleteReport")}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminReports;