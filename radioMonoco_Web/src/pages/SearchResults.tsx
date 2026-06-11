import SearchService from "../services/SearchService.ts";
import type { SearchResult } from "../interfaces/Search.types";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import CollectionsService from "../services/CollectionsService.ts";
import {useTranslation} from "react-i18next";
import { useAppearance } from "../context/AppearanceContext";

const SearchResults = () => {
    const { theme } = useAppearance();
    const [results, setResults] = useState<SearchResult>({ users: [], collections: [], shows: [] });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const query = searchParams.get("q") || "";
    const {t} = useTranslation();

    useEffect(() => {
        const loadSearch = async () => {
            setLoading(true);
            try {
                const allCollections = await CollectionsService.getAllCollections();
                const data = await SearchService.searchUnified(query, allCollections);
                setResults(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        loadSearch();
    }, [query]);

    return (
        <div className={`min-h-screen transition-colors duration-300 px-10 py-24 ${theme === 'dark' ? 'bg-app-bg text-app-text' : 'bg-neutral-50 text-neutral-800'}`}>
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-full transition ${theme === 'dark' ? 'bg-neutral-800 text-white hover:bg-neutral-700' : 'bg-neutral-200 text-neutral-800 hover:bg-neutral-300'}`}
                >
                    ← {t("common.back")}
                </button>
            </div>
            <h1 className="text-4xl font-black text-app-text mb-8">
                {t("searchPage.title")}
                <span className="text-rose-500 ml-3">
                    {query}
                </span>
            </h1>
            {loading && (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <div className={`w-10 h-10 border-4 border-t-transparent rounded-full animate-spin 
            ${theme === 'dark' ? 'border-white' : 'border-rose-500'}`}
                    />
                    <p className={`font-medium animate-pulse ${theme === 'dark' ? 'text-white' : 'text-neutral-600'}`}>
                        Recherche en cours...
                    </p>
                </div>
            )}

            {!loading && (
                <div className="mb-12">
                    <h2 className={`text-2xl font-bold mb-4 ${theme === "dark" ? "text-white" : "text-neutral-900"}`}>
                        {t("searchPage.users")}
                    </h2>
                    {results.users.length === 0 ? (
                        <p className="text-neutral-500">
                            {t("searchPage.noUsers")}
                        </p>
                    ) : (
                        <div className="grid md:grid-cols-3 gap-4 mb-12">
                            {results.users.map((u) => (
                                <div
                                    key={u.id}
                                    onClick={() => navigate(`/users/${u.id}`)}
                                    className={`p-5 rounded-xl transition-all cursor-pointer hover:ring-2 hover:ring-rose-500/40 ${theme === 'dark' ? 'bg-neutral-900 hover:bg-neutral-800' : 'bg-white border border-neutral-200 hover:bg-neutral-50'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-500/40 to-blue-500/30 flex items-center justify-center overflow-hidden">
                                            {u.avatar ? (
                                                <img src={u.avatar} alt={u.username} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-white font-black">{u.username?.charAt(0)?.toUpperCase() || "U"}</span>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-neutral-900'}`}>
                                                {u.display_name || u.username}
                                            </h3>
                                            <p className="text-neutral-500 text-sm">@{u.username}</p>
                                        </div>
                                    </div>
                                    {u.bio && (
                                        <p className="text-neutral-500 text-sm mt-4 line-clamp-2">
                                            {u.bio}
                                        </p>
                                    )}
                                    <div className="flex items-center justify-between mt-5">
                                        <span className="text-xs text-neutral-500">
                                            {u.privacy === "public" ? t("searchPage.publicProfile") : t("searchPage.privateProfile")}
                                        </span>

                                        <span className="text-xs text-rose-400 font-semibold">
                                            {t("searchPage.viewProfile")}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}


                    <div className="mt-12">
                        <h2 className={`text-2xl font-bold mb-4 ${theme === "dark" ? "text-white" : "text-neutral-900"}`}>
                            Collections
                        </h2>

                        {results.collections.length === 0 ? (
                            <p className="text-neutral-500">
                                Aucune collection trouvée
                            </p>
                        ) : (
                            <div className="grid md:grid-cols-3 gap-4">
                                {results.collections.map((collection) => (
                                    <div
                                        key={collection.id}
                                        onClick={() => navigate(`/collections/${collection.id}`)}
                                        className={`p-4 rounded-xl cursor-pointer transition ${
                                            theme === "dark"
                                                ? "bg-neutral-900 hover:bg-neutral-800"
                                                : "bg-white border border-neutral-200 hover:bg-neutral-50"
                                        }`}
                                    >
                                        <h3 className={`font-bold ${theme === "dark" ? "text-white" : "text-neutral-900"}`}>
                                            {collection.name}
                                        </h3>

                                        <p className="text-neutral-500 text-sm mt-2 line-clamp-3">
                                            {collection.description || "Aucune description"}
                                        </p>

                                        <span className="text-xs text-rose-400 mt-3 inline-block">
                                            Voir la collection →
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>


                    <div className="mt-12">
                        <h2 className={`text-2xl font-bold mb-4 ${theme === "dark" ? "text-white" : "text-neutral-900"}`}>
                            {t("searchPage.shows")}
                        </h2>
                        {results.shows.length === 0 ? (
                            <p className="text-neutral-500">
                                {t("searchPage.noShows")}
                            </p>
                        ) : (
                            <div className="grid md:grid-cols-3 gap-4">
                                {results.shows.map((show) => (
                                    <div
                                        key={show.id ?? show.url}
                                        onClick={() => {
                                            if (!show?.url) return;
                                            navigate(`/show/${encodeURIComponent(show.url)}`, { state: { show } });
                                        }}
                                        className={`p-4 rounded-xl cursor-pointer transition ${theme === 'dark' ? 'bg-neutral-900 hover:bg-neutral-800' : 'bg-white border border-neutral-200 hover:bg-neutral-50'}`}
                                    >
                                        <h3 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-neutral-900'}`}>
                                            {show.title}
                                        </h3>
                                        <p className="text-neutral-500 text-sm mt-2 line-clamp-3">
                                            {show.standFirst || t("searchPage.noDescription")}
                                        </p>

                                        <span className="text-xs text-rose-400 mt-3 inline-block">
                                            {t("searchPage.viewShow")}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchResults;