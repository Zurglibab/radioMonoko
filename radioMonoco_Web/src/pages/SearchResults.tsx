import SearchService, {type SearchResult} from "../services/SearchService.ts";
import {useEffect, useState} from "react";
import {useNavigate, useSearchParams} from "react-router-dom";
import CollectionsService from "../services/CollectionsService.ts";
import {useAuth} from "../context/AuthContext.tsx";

const SearchResults = () => {
    const { user } = useAuth();
    const [results, setResults] = useState<SearchResult>({users: [], collections: [], shows:[]});
    const [loading, setLoading] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [userCollections, setUserCollections] = useState<any[]>([]);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const query = searchParams.get("q") || "";

    useEffect(() => {
        const loadSearch = async () => {
            setLoading(true);
            setSelectedUserId(null); // Reset user selection on new search
            setUserCollections([]);

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

    // Afficher les collections du user sélectionné
    const handleUserClick = async (selectedUser: any) => {
        setSelectedUserId(selectedUser.id);

        try {
            const allCollections = await CollectionsService.getAllCollections();
            // Filtrer les collections: publiques OU appartenant à l'user courant
            const filtered = allCollections.filter(
                (c: any) =>
                    (c.user_id === selectedUser.id && (c.is_public || (user && user.id === selectedUser.id)))
            );
            setUserCollections(filtered);
        } catch (error) {
            console.error("Erreur lors de la récupération des collections:", error);
            setUserCollections([]);
        }
    };

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
                                    className={`bg-app-bg-secondary p-4 rounded-xl transition-all cursor-pointer ${
                                        selectedUserId === u.id ? 'ring-2 ring-rose-500' : 'hover:bg-app-bg-secondary/80'
                                    }`}
                                    onClick={() => handleUserClick(u)}
                                >
                                    <h3 className="text-white font-bold">
                                        {u.username}
                                    </h3>

                                    {u.bio && (
                                        <p className="text-neutral-500 text-sm mt-2">
                                            {u.bio}
                                        </p>
                                    )}

                                    <p className="text-xs text-rose-400 mt-3 font-semibold">
                                        → Voir ses collections
                                    </p>
                                </div>

                            ))}
                        </div>
                    )}

                    {selectedUserId && (
                        <div className="mb-12">
                            <h2 className="text-2xl font-bold text-white mb-4">
                                Collections de
                                <span className="text-rose-500 ml-2">
                                    {results.users.find(u => u.id === selectedUserId)?.username}
                                </span>
                            </h2>

                            {userCollections.length === 0 ? (
                                <p className="text-neutral-500">
                                    Aucune collection accessible
                                </p>
                            ) : (
                                <div className="grid md:grid-cols-3 gap-4">
                                    {userCollections.map((collection) => (
                                        <div
                                            key={collection.id}
                                            className="bg-app-bg-secondary p-4 rounded-xl cursor-pointer hover:bg-app-bg-secondary/80 transition"
                                            onClick={() => navigate(`/collections/${collection.id}`)}
                                        >
                                            <h3 className="text-white font-bold">
                                                {collection.name}
                                            </h3>

                                            <p className="text-neutral-500 text-sm mt-2">
                                                {collection.description}
                                            </p>

                                            <span className="text-xs text-rose-400 mt-3 inline-block">
                                                {collection.is_public ? "Public" : "Privé"}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div>

                        <h2 className="text-2xl font-bold text-white mb-4">
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
                                        className="bg-neutral-900 p-4 rounded-xl cursor-pointer hover:bg-neutral-800 transition"
                                        onClick={() => {
                                            if (collection.is_public || (user && user.id === collection.user_id)) {
                                                navigate(`/collections/${collection.id}`);
                                            } else {
                                                alert("Cette collection est privée. Vous pouvez y accéder seulement si vous en êtes le propriétaire.");
                                            }
                                        }}
                                    >
                                        <h3 className="text-white font-bold">
                                            {collection.name}
                                        </h3>

                                        <p className="text-neutral-500 text-sm">
                                            {collection.description}
                                        </p>

                                        <span className="text-xs text-rose-400">
                                            {collection.is_public ? "Public" : "Privé"}
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
