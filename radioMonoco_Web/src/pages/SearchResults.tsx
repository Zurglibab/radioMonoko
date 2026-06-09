import SearchService from "../services/SearchService.ts";
import type { SearchResult } from "../interfaces/Search.types";
import {useEffect, useState} from "react";
import {useNavigate, useSearchParams} from "react-router-dom";
import CollectionsService from "../services/CollectionsService.ts";
//import {useAuth} from "../context/AuthContext.tsx";

const SearchResults = () => {
    const [results, setResults] = useState<SearchResult>({users: [], collections: [], shows:[]});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const query = searchParams.get("q") || "";

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
        <div className="min-h-screen bg-app-bg text-app-text px-10 py-24">
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-app-text px-3 py-2 rounded-full transition"
                >
                    ← Retour
                </button>
            </div>

            <h1 className="text-4xl font-black text-app-text mb-8">
                Résultats pour :
                <span className="text-rose-500 ml-3">
                    {query}
                </span>
            </h1>

            {loading && (
                <p className="text-app-text-secondary">
                    Recherche en cours...
                </p>
            )}

            {!loading && (
                <div className="mb-12">

                    <h2 className="text-2xl font-bold text-white mb-4">
                        Utilisateurs
                    </h2>

                    {results.users.length === 0 ? (
                        <p className="text-neutral-500">
                            Aucun utilisateur trouvé
                        </p>
                    ) : (
                        <div className="grid md:grid-cols-3 gap-4 mb-12">
                            {results.users.map((u) => (
                                <div
                                    key={u.id}
                                    onClick={() => navigate(`/users/${u.id}`)}
                                    className="bg-app-bg-secondary p-5 rounded-xl transition-all cursor-pointer hover:bg-app-bg-secondary/80 hover:ring-2 hover:ring-rose-500/40"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-500/40 to-blue-500/30 flex items-center justify-center overflow-hidden">
                                            {u.avatar ? (
                                                <img
                                                    src={u.avatar}
                                                    alt={u.username}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-white font-black">
                                {u.username?.charAt(0)?.toUpperCase() || "U"}
                            </span>
                                            )}
                                        </div>

                                        <div>
                                            <h3 className="text-white font-bold">
                                                {u.display_name || u.username}
                                            </h3>

                                            <p className="text-neutral-500 text-sm">
                                                @{u.username}
                                            </p>
                                        </div>
                                    </div>

                                    {u.bio && (
                                        <p className="text-neutral-500 text-sm mt-4 line-clamp-2">
                                            {u.bio}
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between mt-5">
                                        <span className="text-xs text-neutral-500">
                                            {u.privacy === "public" ? "Profil public" : "Profil privé"}
                                        </span>

                                        <span className="text-xs text-rose-400 font-semibold">
                                            Voir le profil →
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-12">
                        <h2 className="text-2xl font-bold text-white mb-4">
                            Émissions
                        </h2>
                        {results.shows.length === 0 ? (
                            <p className="text-neutral-500">
                                Aucune émission trouvée
                            </p>
                        ) : (
                            <div className="grid md:grid-cols-3 gap-4">
                                {results.shows.map((show) => (
                                    <div
                                        key={show.id ?? show.url}
                                        onClick={() =>
                                        {
                                            if (!show?.url) {console.warn("Show sans URL :", show);
                                                return;
                                            }
                                            navigate(`/show/${encodeURIComponent(show.url)}`, {state: { show }});
                                        }}
                                        className="bg-neutral-900 p-4 rounded-xl cursor-pointer hover:bg-neutral-800 transition"
                                    >
                                        <h3 className="text-white font-bold">
                                            {show.title}
                                        </h3>

                                        <p className="text-neutral-500 text-sm mt-2 line-clamp-3">
                                            {show.standFirst || "Aucune description disponible"}
                                        </p>

                                        <span className="text-xs text-rose-400 mt-3 inline-block">
                                            Voir l'émission →
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
export default SearchResults;
