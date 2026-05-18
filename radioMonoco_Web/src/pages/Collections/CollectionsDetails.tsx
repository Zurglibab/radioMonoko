import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import CollectionsService from "../../services/CollectionsService.ts";
import type { Collection } from "../../interfaces/Collections.types.ts";
import { useNavigate } from "react-router-dom";

const CollectionsDetails = () => {
    const { id } = useParams()
    const [collection, setCollection] = useState<Collection | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const navigate = useNavigate()

    useEffect(() => {
        const fetchCollection = async () => {
            try {
                if (!id) return;

                const data = await CollectionsService.getCollectionById(id);
                setCollection(data);
            } catch (err) {
                console.error("Erreur lors de la récupération de la collection :", err);
                setError("Impossible de charger la collection");
            } finally {
                setLoading(false)
            }
        };
        fetchCollection()

    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <p className="text-white">Chargement...</p>
            </div>
        );
    }
    if (error || !collection) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <p className="text-white">{error || "Collection introuvable"}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] px-6 md:px-12 py-24">

            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/collections')}
                    className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white px-3 py-2 rounded-full transition"
            >
                    ← Retour
                </button>
            </div>

            <div className="max-w-6xl mx-auto">

                {/* cover playlist */}
                <div className="flex flex-col md:flex-row gap-8 items-start mb-12">

                    <div className="w-48 h-48 rounded-3xl bg-gradient-to-br from-rose-500/30 to-blue-500/20 border border-white/10" />

                    <div>

                        <p className="uppercase tracking-[0.2em] text-neutral-500 text-xs font-bold mb-3">
                            Collection
                        </p>

                        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight">
                            {collection.name}
                        </h1>

                        <p className="text-neutral-400 mt-6 max-w-2xl">
                            {collection.description || "Aucune description"}
                        </p>

                        <div className="flex items-center gap-4 mt-6">

                            <span className="text-sm text-neutral-500">
                                {collection.is_public ? "🌍 Publique" : "🔒 Privée"}
                            </span>

                            <span className="text-sm text-neutral-600">
                                {new Date(collection.created_at).toLocaleDateString()}
                            </span>

                        </div>
                    </div>
                </div>

                {/* EMPTY STATE */}
                <div className="bg-neutral-900/40 border border-white/5 rounded-3xl p-10 text-center">

                    <h2 className="text-2xl font-bold text-white mb-3">
                        Cette collection est vide
                    </h2>

                    <p className="text-neutral-500">
                        Tu pourras bientôt ajouter des albums, playlists ou artistes.
                    </p>

                </div>
            </div>
        </div>
    );
};

export default CollectionsDetails