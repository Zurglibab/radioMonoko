import { useEffect, useMemo, useState } from "react";
import AdminService from "../../services/AdminService.ts";
import type { ReportReview, ReportUser } from "../../interfaces/Report.types.ts";
import type { User } from "../../context/AuthContext.tsx";
import type { Review } from "../../interfaces/Review.types.ts";
import { useNavigate } from "react-router-dom";

type ActiveTab = "users" | "reviews";

const AdminReports = () => {
    const [userReports, setUserReports] = useState<ReportUser[]>([]);
    const [reviewReports, setReviewReports] = useState<ReportReview[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [activeTab, setActiveTab] = useState<ActiveTab>("reviews");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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
            setError("Impossible de charger les signalements");
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
            "Voulez-vous vraiment supprimer cette critique ?"
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
            "Voulez-vous vraiment bannir cet utilisateur ?"
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
                    ← Retour
                </button>
            </div>

            <h1 className="text-4xl font-black text-white mb-8">
                Signalements
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
                    Critiques signalées ({reviewReports.length})
                </button>

                <button
                    onClick={() => setActiveTab("users")}
                    className={`px-5 py-2 rounded-full font-semibold transition ${
                        activeTab === "users"
                            ? "bg-rose-600 text-white"
                            : "bg-neutral-800 text-neutral-400 hover:text-white"
                    }`}
                >
                    Utilisateurs signalés ({userReports.length})
                </button>
            </div>

            {loading && (
                <p className="text-neutral-400">Chargement des signalements...</p>
            )}

            {error && (
                <p className="text-red-400 mb-6">{error}</p>
            )}

            {!loading && activeTab === "reviews" && (
                <div className="space-y-4">
                    {reviewReports.length === 0 ? (
                        <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-8 text-center">
                            <p className="text-white font-semibold">
                                Aucun signalement de critique
                            </p>
                            <p className="text-neutral-500 mt-2">
                                Les critiques signalées apparaîtront ici.
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
                                                    Critique signalée
                                                </span>

                                                <span className="text-xs text-neutral-500">
                                                    {new Date(report.created_at).toLocaleDateString()}
                                                </span>
                                            </div>

                                            <p className="text-neutral-400 text-sm mb-2">
                                                Type de signalement :
                                                <span className="text-white font-semibold ml-2">
                                                    {report.report_type}
                                                </span>
                                            </p>

                                            {report.description && (
                                                <p className="text-neutral-300 text-sm mb-4">
                                                    Description : {report.description}
                                                </p>
                                            )}

                                            <div className="bg-black/20 border border-white/5 rounded-2xl p-4 mt-4">
                                                <p className="text-neutral-500 text-xs mb-2">
                                                    Critique concernée
                                                </p>
                                                <p className="text-white">
                                                    {getReviewText(review)}
                                                </p>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-3 mt-4">
                                                <div className="bg-black/20 border border-white/5 rounded-xl p-3">
                                                    <p className="text-neutral-500 text-xs">
                                                        Auteur de la critique
                                                    </p>
                                                    <p className="text-white text-sm mt-1">
                                                        {author
                                                            ? `@${author.username}`
                                                            : review?.user_id || "Inconnu"}
                                                    </p>
                                                </div>

                                                <div className="bg-black/20 border border-white/5 rounded-xl p-3">
                                                    <p className="text-neutral-500 text-xs">
                                                        Signalé par
                                                    </p>
                                                    <p className="text-white text-sm mt-1">
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
                                                className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-xl text-white text-sm"
                                            >
                                                Supprimer critique
                                            </button>

                                            <button
                                                onClick={() => handleClearReviewReports(report.review_id)}
                                                className="bg-neutral-700 hover:bg-neutral-600 px-4 py-2 rounded-xl text-white text-sm"
                                            >
                                                Retirer tous les reports
                                            </button>

                                            <button
                                                onClick={() => handleDeleteReviewReport(report.id)}
                                                className="bg-neutral-800 hover:bg-neutral-700 px-4 py-2 rounded-xl text-neutral-300 text-sm"
                                            >
                                                Retirer ce report
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
                            <p className="text-white font-semibold">
                                Aucun signalement utilisateur
                            </p>
                            <p className="text-neutral-500 mt-2">
                                Les utilisateurs signalés apparaîtront ici.
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
                                                    Utilisateur signalé
                                                </span>

                                                <span className="text-xs text-neutral-500">
                                                    {new Date(report.created_at).toLocaleDateString()}
                                                </span>
                                            </div>

                                            <p className="text-neutral-400 text-sm mb-2">
                                                Type de signalement :
                                                <span className="text-white font-semibold ml-2">
                                                    {report.report_type}
                                                </span>
                                            </p>

                                            {report.description && (
                                                <p className="text-neutral-300 text-sm mb-4">
                                                    Description : {report.description}
                                                </p>
                                            )}

                                            <div className="grid md:grid-cols-2 gap-3 mt-4">
                                                <div className="bg-black/20 border border-white/5 rounded-xl p-3">
                                                    <p className="text-neutral-500 text-xs">
                                                        Utilisateur concerné
                                                    </p>
                                                    <p className="text-white text-sm mt-1">
                                                        {reportedUser
                                                            ? `@${reportedUser.username}`
                                                            : report.reported_user_id}
                                                    </p>
                                                    {reportedUser?.is_banned && (
                                                        <p className="text-red-400 text-xs mt-2">
                                                            Utilisateur déjà banni
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="bg-black/20 border border-white/5 rounded-xl p-3">
                                                    <p className="text-neutral-500 text-xs">
                                                        Signalé par
                                                    </p>
                                                    <p className="text-white text-sm mt-1">
                                                        {reporter ? `@${reporter.username}` : report.reporter_id}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap md:flex-col gap-3">
                                            <button
                                                onClick={() => navigate(`/users/${report.reported_user_id}`)}
                                                className="bg-rose-600 hover:bg-rose-500 px-4 py-2 rounded-xl text-white text-sm"
                                            >
                                                Voir profil
                                            </button>

                                            <button
                                                onClick={() => handleBanUser(report.reported_user_id)}
                                                className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-xl text-white text-sm"
                                            >
                                                Bannir
                                            </button>

                                            <button
                                                onClick={() => handleClearUserReports(report.reported_user_id)}
                                                className="bg-neutral-700 hover:bg-neutral-600 px-4 py-2 rounded-xl text-white text-sm"
                                            >
                                                Retirer tous les reports
                                            </button>

                                            <button
                                                onClick={() => handleDeleteUserReport(report.id)}
                                                className="bg-neutral-800 hover:bg-neutral-700 px-4 py-2 rounded-xl text-neutral-300 text-sm"
                                            >
                                                Retirer ce report
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