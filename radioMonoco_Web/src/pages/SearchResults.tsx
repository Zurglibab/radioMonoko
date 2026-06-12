import SearchService from "../services/SearchService.ts";
import type { SearchResult,SearchFilters } from "../interfaces/Search.types";
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
    const genre = searchParams.get("genre") || "";
    const year = searchParams.get("year") || "";
    const author = searchParams.get("author") || "";

    const [genreFilter, setGenreFilter] = useState(genre);
    const [yearFilter, setYearFilter] = useState(year);
    const [authorFilter, setAuthorFilter] = useState(author);
    const {t} = useTranslation();

    useEffect(() => {
        setGenreFilter(genre);
        setYearFilter(year);
        setAuthorFilter(author);
    }, [genre, year, author]);

    useEffect(() => {
        const loadSearch = async () => {
            setLoading(true);
            try {
                const allCollections = await CollectionsService.getAllCollections();
                const filters: SearchFilters = {genre, year, author};
                const data = await SearchService.searchUnified(query, allCollections, filters);
                setResults(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        loadSearch();
    }, [query, genre, year, author]);

    const applyFilters = () => {
        const params = new URLSearchParams();

        if (query.trim()) {params.set("q", query.trim());}

        if (genreFilter.trim()) {params.set("genre", genreFilter.trim());}

        if (yearFilter.trim()) {params.set("year", yearFilter.trim());}

        if (authorFilter.trim()) {params.set("author", authorFilter.trim());}
        navigate(`/search?${params.toString()}`);
    };

    const resetFilters = () => {
        const params = new URLSearchParams();

        if (query.trim()) {params.set("q", query.trim());}

        setGenreFilter("");
        setYearFilter("");
        setAuthorFilter("");

        navigate(`/search?${params.toString()}`);
    };

    const hasActiveFilters = !!genre || !!year || !!author;

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
            <h1 className={`text-4xl font-black mb-8 ${theme === "dark" ? "text-app-text" : "text-neutral-900"}`}>
                {t("searchPage.title")}
                <span className="text-rose-500 ml-3">
                    {query}
                </span>
            </h1>

            <div
                className={`mb-10 rounded-3xl border p-5 ${
                    theme === "dark"
                        ? "bg-neutral-900/40 border-white/5"
                        : "bg-white border-neutral-200 shadow-sm"
                }`}
            >
                <div className="flex flex-col lg:flex-row lg:items-end gap-4">

                    <div className="flex-1">
                        <label
                            className={`text-xs uppercase tracking-[0.2em] font-black mb-2 block ${
                                theme === "dark" ? "text-neutral-500" : "text-neutral-600"
                            }`}
                        >
                            Genre
                        </label>

                        <input
                            type="text"
                            value={genreFilter}
                            onChange={(e) => setGenreFilter(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") applyFilters();
                            }}
                            placeholder="ex : culture, musique, humour..."
                            className={`w-full rounded-xl px-4 py-3 outline-none border transition ${
                                theme === "dark"
                                    ? "bg-neutral-950/60 border-white/5 text-white placeholder:text-neutral-600 focus:border-rose-500/50"
                                    : "bg-neutral-50 border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:border-rose-500/50"
                            }`}
                        />
                    </div>

                    <div className="flex-1">
                        <label
                            className={`text-xs uppercase tracking-[0.2em] font-black mb-2 block ${
                                theme === "dark" ? "text-neutral-500" : "text-neutral-600"
                            }`}
                        >
                            Année
                        </label>

                        <input
                            type="number"
                            value={yearFilter}
                            onChange={(e) => setYearFilter(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") applyFilters();
                            }}
                            placeholder="ex : 2024"
                            className={`w-full rounded-xl px-4 py-3 outline-none border transition ${
                                theme === "dark"
                                    ? "bg-neutral-950/60 border-white/5 text-white placeholder:text-neutral-600 focus:border-rose-500/50"
                                    : "bg-neutral-50 border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:border-rose-500/50"
                            }`}
                        />
                    </div>

                    <div className="flex-1">
                        <label
                            className={`text-xs uppercase tracking-[0.2em] font-black mb-2 block ${
                                theme === "dark" ? "text-neutral-500" : "text-neutral-600"
                            }`}
                        >
                            Auteur
                        </label>

                        <input
                            type="text"
                            value={authorFilter}
                            onChange={(e) => setAuthorFilter(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") applyFilters();
                            }}
                            placeholder="ex : journaliste, invité, chroniqueur..."
                            className={`w-full rounded-xl px-4 py-3 outline-none border transition ${
                                theme === "dark"
                                    ? "bg-neutral-950/60 border-white/5 text-white placeholder:text-neutral-600 focus:border-rose-500/50"
                                    : "bg-neutral-50 border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:border-rose-500/50"
                            }`}
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={applyFilters}
                            className="px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold transition"
                        >
                            Filtrer
                        </button>

                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={resetFilters}
                                className={`px-5 py-3 rounded-xl font-semibold transition border ${
                                    theme === "dark"
                                        ? "bg-neutral-800 hover:bg-neutral-700 text-white border-white/5"
                                        : "bg-white hover:bg-neutral-100 text-neutral-800 border-neutral-200"
                                }`}
                            >
                                Réinitialiser
                            </button>
                        )}
                    </div>
                </div>

                {hasActiveFilters && (
                    <div className="flex flex-wrap gap-2 mt-5">
                        {genre && (
                            <span className="text-xs px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                Genre : {genre}
                            </span>
                        )}

                        {year && (
                            <span className="text-xs px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                Année : {year}
                            </span>
                        )}

                        {author && (
                            <span className="text-xs px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                Auteur : {author}
                            </span>
                        )}
                    </div>
                )}
            </div>


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
                        <p className="text-app-text text-neutral-500">
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

                                        <p className={`text-sm mt-2 line-clamp-3 ${theme === "dark" ? "text-neutral-500" : "text-neutral-600"}`}>
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
                            <span className="text-rose-500 ml-2 text-base">
                                ({results.shows.length})
                            </span>
                        </h2>
                        {results.shows.length === 0 ? (
                            <p className={theme === "dark" ? "text-neutral-500" : "text-neutral-600"}>
                                {hasActiveFilters
                                    ? "Aucune émission ne correspond aux filtres sélectionnés."
                                    : t("searchPage.noShows")}
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