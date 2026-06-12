import {useAuth} from "../../context/AuthContext.tsx";
import {useEffect, useState} from "react";
import AdminService from "../../services/AdminService.ts";
import {useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";

const AdminDashboard = () => {
    const {user} = useAuth();
    const [reportCount, setReportCount] = useState(0);
    const [userCount, setUserCount] = useState(0);
    const [reviewCount, setReviewCount] = useState(0);
    const navigate = useNavigate()
    const {t} = useTranslation();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const reports = await AdminService.getReports();
                setReportCount(reports.length);

                const users = await AdminService.getUsers();
                setUserCount(users.length);

                const reviews = await AdminService.getReviews();
                setReviewCount(reviews.length);
            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="p-8">
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white px-3 py-2 rounded-full transition"
                >
                    ← {t("common.back")}
                </button>
            </div>

            <h1 className="text-5xl font-black text-app-text mb-10">
                {t("admin.dashboard")}
            </h1>

            <div className="grid md:grid-cols-4 gap-6">
                <div className="bg-neutral-900/40 backdrop-blur-xl rounded-3xl p-6 border border-white/5">
                    <p className="text-app-text-neutral-400">{t("admin.reports")}</p>
                    <p className="text-4xl font-bold text-app-text mt-2">{reportCount}</p>
                </div>

                <div className="bg-neutral-900/40 backdrop-blur-xl rounded-3xl p-6 border border-white/5">
                    <p className="text-app-text-neutral-400">{t("admin.users")}</p>
                    <p className="text-4xl font-bold text-app-text mt-2">{userCount}</p>
                </div>

                <div className="bg-neutral-900/40 backdrop-blur-xl rounded-3xl p-6 border border-white/5">
                    <p className="text-app-text-neutral-400">{t("admin.reviews")}</p>
                    <p className="text-4xl font-bold text-app-text mt-2">{reviewCount}</p>
                </div>

                <div className="bg-neutral-900/40 backdrop-blur-xl rounded-3xl p-6 border border-white/5">
                    <p className="text-app-text-neutral-400">{t("admin.connectedAdmin")}</p>
                    <p className="text-xl text-app-text mt-2">{user?.username}</p>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mt-12">
                <div
                    onClick={() => navigate("/admin/users")}
                    className="cursor-pointer bg-neutral-900/40 p-6 rounded-3xl border border-white/5 hover:border-rose-500 transition"
                >
                    <h2 className="text-app-text  font-bold text-xl">{t("admin.manageUsers")}</h2>
                    <p className="text-app-text-neutral-500 mt-2">
                        {t("admin.manageUsersText")}
                    </p>
                </div>

                <div
                    onClick={() => navigate("/admin/reports")}
                    className="cursor-pointer bg-neutral-900/40 p-6 rounded-3xl border border-white/5 hover:border-rose-500 transition"
                >
                    <h2 className="text-app-text  font-bold text-xl">{t("admin.manageReports")}</h2>
                    <p className="text-app-text-neutral-500 mt-2">
                        {t("admin.manageReportsText")}
                    </p>
                </div>

                <div
                    onClick={() => navigate("/admin/reviews")}
                    className="cursor-pointer bg-neutral-900/40 p-6 rounded-3xl border border-white/5 hover:border-rose-500 transition"
                >
                    <h2 className="text-app-text font-bold text-xl">{t("admin.manageReviews")}</h2>
                    <p className="text-app-text-neutral-500 mt-2">
                        {t("admin.manageReviewsText")}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;