import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CollectionsService from "../../services/CollectionsService.ts";
import type { Collection } from "../../interfaces/Collections.types.ts";
import {useAuth} from "../../context/AuthContext.tsx";
import { FiPlus } from "react-icons/fi";
import CreateCollection from "./CreateCollections.tsx";
import ModifyCollections from "./ModifyCollections.tsx";
import DeleteCollection from "./DeleteCollections.tsx";
import {useTranslation} from "react-i18next";


const Collections = () => {

    const { user } = useAuth();

    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isWindowOpen, setIsWindowOpen] = useState(false);
    const [isModifyWindowOpen, setIsModifyWindowOpen] = useState(false);
    const [isDeleteWindowOpen, setIsDeleteWindowOpen] = useState(false);
    const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
    const [collectionToDelete, setCollectionToDelete] = useState<Collection | null>(null);
    const [publicCollection, setPublicCollection] = useState<Collection[]>([]);
    const [recentCollection, setRecentCollection] = useState<Collection[]>([]);
    const navigate = useNavigate();
    const {t} = useTranslation();

    useEffect(() => {

        const fetchCollections = async () => {
            try {
                if (!user?.id) {
                    setLoading(false);
                    return;
                }
                const userCollectionsData = await CollectionsService.getUserCollections(user.id);
                setCollections(userCollectionsData);

                const allCollections = await CollectionsService.getAllCollections();

                const publicOnly = allCollections.filter((collection) => collection.is_public);
                setPublicCollection(publicOnly);

                const sortedCollections = [...allCollections].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                setRecentCollection(sortedCollections.slice(0, 5));

            } catch (err) {
                console.error(err);
                setError("Impossible de charger les collections");
            } finally {
                setLoading(false);
            }
        };
        fetchCollections();

    }, [user]);

    const handleCreateCollection = async (name:string, description:string, isPublic:boolean) => {
        try{
            if (!user?.id) return;

            const newCollection = await CollectionsService.createCollection(
                user.id,
                name,
                description,
                isPublic
            );
            setCollections((prev) => [newCollection, ...prev]);
        } catch (err) {
            console.error(err);
            setError("Erreur lors de la création de la collection");
        }
    };

    const handleModifyCollection = async (collection: Collection) => {
        try {
            const updated = await CollectionsService.updateCollection(collection.id, {
                name: collection.name,
                description: collection.description,
                is_public: collection.is_public
            });

            setCollections((prev) =>
                prev.map((col) => (col.id === updated.id ? updated : col))
            );
        } catch (err) {
            console.error(err);
            setError("Erreur lors de la modification de la collection");
        }
    };

    const handleDeleteCollection = async (collectionId: string) => {
        try {
            setError("");
            await CollectionsService.deleteCollection(collectionId);
            setCollections((prev) => prev.filter((col) => col.id !== collectionId));
        } catch (err) {
            console.error(err);
            setError("Erreur lors de la suppression de la collection");
        }
    };

    return (
        <div className="flex min-h-screen bg-[#0a0a0a]">

            <div className="flex-1 px-6 md:px-12 py-24 relative overflow-hidden">

                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-rose-600/10 rounded-full blur-[140px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />
                </div>

                <div className="relative z-10">

                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">
                                Votre Bibliothèque
                            </h1>
                        </div>
                        <button
                            onClick= {() => setIsWindowOpen(true)}
                            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-full font-semibold transition-all shadow-lg shadow-rose-600/20">
                            <FiPlus />
                            Créer
                        </button >
                    </div>
                    {loading && (
                        <p className="text-neutral-500 mt-4">Chargement des collections…</p>
                    )}
                    {error && (
                        <p className="text-rose-400 mt-4">{error}</p>
                    )}

                    <div>
                        <h2 className="text-2xl font-bold text-white mb-6">
                            Mes collections
                        </h2>

                        <div className="grid md:grid-cols-3 gap-6">
                            {collections.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => navigate(`/collections/${item.id}`)}
                                    className="cursor-pointer bg-neutral-900/40 border border-white/5 rounded-2xl p-5 hover:border-rose-500/30 transition"
                                >
                                    <h3 className="text-white font-semibold">
                                        {item.name}
                                    </h3>

                                    <p className="text-neutral-500 text-sm mt-2">
                                        {item.description || "Aucune description"}
                                    </p>

                                    <div className="flex justify-between items-center mt-5">
                                        <span className="text-xs text-neutral-500">
                                            {item.is_public ? "Public" : "Privé"}
                                        </span>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setCollectionToDelete(item);
                                                    setIsDeleteWindowOpen(true);
                                                }}
                                                className="text-red-400 hover:text-red-300 text-sm"
                                            >
                                                Supprimer
                                            </button>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedCollection(item);
                                                    setIsModifyWindowOpen(true);
                                                }}
                                                className="text-blue-400 hover:text-blue-300 text-sm"
                                            >
                                                Modifier
                                            </button>

                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-20">
                        <h2 className="text-2xl font-bold text-white mb-6">
                            Collections publiques
                        </h2>

                        <div className="grid md:grid-cols-3 gap-6">
                            {publicCollection.slice(0,6).map((collection) => (
                                <div
                                    key={collection.id}
                                    onClick={() =>
                                        navigate(`/collections/${collection.id}`)
                                    }
                                    className="cursor-pointer bg-neutral-900/40 border border-white/5 rounded-2xl p-5 hover:border-rose-500/30 transition"
                                >
                                    <h3 className="text-white font-semibold">
                                        {collection.name}
                                    </h3>

                                    <p className="text-neutral-500 text-sm mt-2">
                                        {collection.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="mt-20">
                        <h2 className="text-2xl font-bold text-white mb-6">
                            Dernières collections créées
                        </h2>

                        <div className="space-y-4">
                            {recentCollection.map((collection) => (
                                <div
                                    key={collection.id}
                                    className="bg-neutral-900/40 border border-white/5 rounded-xl p-4 flex justify-between items-center"
                                >
                                    <div>
                                        <p className="text-white font-semibold">
                                            {collection.name}
                                        </p>
                                        <p className="text-neutral-500 text-sm">
                                            {new Date(
                                                collection.created_at
                                            ).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() =>
                                            navigate(`/collections/${collection.id}`)
                                        }
                                        className="text-rose-400"
                                    >
                                        Voir →
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="mt-20">
                        <h2 className="text-2xl font-bold text-white mb-6">
                            Vos statistiques
                        </h2>

                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="bg-neutral-900/40 p-6 rounded-xl">
                                <p className="text-neutral-400 text-sm">
                                    Mes collections
                                </p>

                                <p className="text-3xl font-bold text-white">
                                    {collections.length}
                                </p>
                            </div>

                            <div className="bg-neutral-900/40 p-6 rounded-xl">
                                <p className="text-neutral-400 text-sm">
                                    Collections publiques
                                </p>
                                <p className="text-3xl font-bold text-white">
                                    {
                                        collections.filter(
                                            (c) => c.is_public
                                        ).length
                                    }
                                </p>
                            </div>
                            <div className="bg-neutral-900/40 p-6 rounded-xl">
                                <p className="text-neutral-400 text-sm">
                                    Collections privées
                                </p>

                                <p className="text-3xl font-bold text-white">
                                    {
                                        collections.filter(
                                            (c) => !c.is_public
                                        ).length
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <CreateCollection isOpen={isWindowOpen} onClose={()=> setIsWindowOpen(false)} onSubmit={handleCreateCollection}/>
            <ModifyCollections isOpen={isModifyWindowOpen} onClose={() => setIsModifyWindowOpen(false)} onSubmit={handleModifyCollection} collection={selectedCollection} />
            <DeleteCollection isOpen={isDeleteWindowOpen} onClose={() => {setIsDeleteWindowOpen(false); setCollectionToDelete(null);}} onSubmit={handleDeleteCollection} collection={collectionToDelete} />
        </div>
    );
};

export default Collections;
