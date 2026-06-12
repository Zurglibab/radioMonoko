import FeedList from "../components/feed/FeedList.tsx";
import {useEffect, useState} from "react";
import FeedService from "../services/FeedService.ts";
import type {FeedItem} from "../interfaces/Feed.types.ts";
import {useNavigate} from "react-router-dom";
import {useAuth} from "../context/AuthContext.tsx";
import { FiRefreshCw, FiUsers } from "react-icons/fi";
import {useAppearance} from "../context/AppearanceContext.tsx";
import {useTranslation} from "react-i18next";

const Feed = () => {
    const navigate = useNavigate();
    const {user} = useAuth();
    const [items, setItems] = useState<FeedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const {theme} = useAppearance();
    const { t } = useTranslation();

    const fetchFeed = async () => {
        try {
            setLoading(true);
            setError("");
            const data = await FeedService.getMyFeed(30);
            setItems(data);
        } catch (err) {
            console.error("Erreur lors du chargement du flux", err);
            setError(t("feed.errorLoad"));
        } finally {
            setLoading(false);
        }
    };

    const handleContentClick = (item: FeedItem) => {
        if (item.content_type === "radio" && item.content_id) {
            navigate(`/radio/${item.content_id}`);
            return;
        }

        if (item.content_url) {
            navigate(`/show/${encodeURIComponent(item.content_url)}`);
            return;
        }

        console.warn("Contenu sans route exploitable :", item);
    };

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }
        fetchFeed();
    }, [user]);

    if (!user) {
        return (
            <div className={`min-h-screen px-6 md:px-12 py-24 flex items-center justify-center ${
                theme === "dark" ? "bg-app-bg text-app-text" : "bg-neutral-50 text-neutral-800"
            }`}>
                <div className={`rounded-3xl p-8 max-w-lg text-center border ${
                    theme === "dark"
                        ? "bg-neutral-900/40 border-white/5"
                        : "bg-white border-neutral-200 shadow-sm"
                }`}>
                    <FiUsers className="text-rose-400 mx-auto mb-4" size={36} />

                    <h1 className="text-3xl font-black mb-3">
                        {t("feed.title")}
                    </h1>

                    <p className={`mb-6 ${theme === "dark" ? "text-neutral-500" : "text-neutral-600"}`}>
                        {t("feed.loginPrompt")}
                    </p>

                    <button
                        onClick={() => navigate("/login")}
                        className="px-6 py-3 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-semibold transition"
                    >
                        {t("common.login") || t("nav.login") || "Se connecter"}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen px-6 md:px-12 py-24 relative overflow-hidden ${
            theme === "dark" ? "bg-app-bg text-app-text" : "bg-neutral-50 text-neutral-800"
        }`}>
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-rose-600/10 rounded-full blur-[140px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate("/")}
                        className={`flex items-center gap-2 px-3 py-2 rounded-full transition ${
                            theme === "dark"
                                ? "bg-neutral-800 hover:bg-neutral-700 text-white"
                                : "bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-200 shadow-sm"
                        }`}
                    >
                        ← {t("common.back")}
                    </button>
                </div>

                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
                    <div>
                        <p className="uppercase tracking-[0.2em] text-neutral-500 text-xs font-bold mb-3">
                            {t("feed.social")}
                        </p>

                        <h1 className="text-5xl md:text-6xl font-black tracking-tight">
                            {t("feed.title")}
                        </h1>

                        <p className={`mt-4 max-w-2xl ${theme === "dark" ? "text-neutral-500" : "text-neutral-600"}`}>
                            {t("feed.description")}
                        </p>
                    </div>

                    <button
                        onClick={fetchFeed}
                        disabled={loading}
                        className={`flex items-center justify-center gap-2 px-5 py-3 rounded-full border font-semibold transition disabled:opacity-50 ${
                            theme === "dark"
                                ? "bg-neutral-900/70 hover:bg-neutral-800 border-white/5 text-white"
                                : "bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-800 shadow-sm"
                        }`}
                    >
                        <FiRefreshCw className={loading ? "animate-spin" : ""} />
                        {t("feed.refresh")}
                    </button>
                </div>

                {loading && (
                    <div className="flex justify-center py-20">
                        <div className={`w-7 h-7 border-2 border-t-rose-500 rounded-full animate-spin ${
                            theme === "dark" ? "border-white/20" : "border-neutral-300"
                        }`} />
                    </div>
                )}

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl p-5 mb-6">
                        {error}
                    </div>
                )}

                {!loading && !error && items.length === 0 && (
                    <div className={`rounded-3xl p-10 text-center border ${
                        theme === "dark"
                            ? "bg-neutral-900/40 border-white/5"
                            : "bg-white border-neutral-200 shadow-sm"
                    }`}>
                        <FiUsers className={`${theme === "dark" ? "text-neutral-600" : "text-neutral-400"} mx-auto mb-5`} size={42} />

                        <h2 className="text-2xl font-bold mb-3">
                            {t("feed.emptyTitle")}
                        </h2>

                        <p className={`max-w-xl mx-auto ${theme === "dark" ? "text-neutral-500" : "text-neutral-600"}`}>
                            {t("feed.emptyDesc")}
                        </p>

                        <button
                            onClick={() => navigate("/")}
                            className="mt-8 px-6 py-3 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-semibold transition"
                        >
                            {t("feed.findUsers")}
                        </button>
                    </div>
                )}

                {!loading && !error && items.length > 0 && (
                    <FeedList
                        items={items}
                        onUserClick={(userId) => navigate(`/users/${userId}`)}
                        onCollectionClick={(collectionId) =>
                            navigate(`/collections/${collectionId}`)
                        }
                        onContentClick={handleContentClick}
                    />
                )}
            </div>
        </div>
    );
};

export default Feed;

