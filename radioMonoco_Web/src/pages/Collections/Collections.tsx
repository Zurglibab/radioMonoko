import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CollectionsService from "../../services/CollectionsService.ts";
import type { Collection } from "../../interfaces/Collections.types.ts";
import {useAuth} from "../../context/AuthContext.tsx";
import { FiPlus } from "react-icons/fi";
import CreateCollection from "./CreateCollections.tsx";

const Collections = () => {

    const { user } = useAuth();

    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isWindowOpen, setIsWindowOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {

        const fetchCollections = async () => {
            try {
                if (!user?.id) {
                    setLoading(false);
                    return;
                }

                const data = await CollectionsService.getUserCollections(user.id);

                setCollections(data);
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

    return (
        <div className="flex min-h-screen bg-[#0a0a0a]">

            {/* CONTENU PRINCIPAL */}
            <div className="flex-1 px-6 md:px-12 py-24 relative overflow-hidden">

                {/* background glow */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-rose-600/10 rounded-full blur-[140px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />
                </div>

                <div className="relative z-10">

                    {/* HEADER */}
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">
                                Votre Bibliothèque
                            </h1>
                            <p className="text-neutral-500 mt-2 text-sm">
                                Organise et retrouve ta musique
                            </p>
                        </div>

                        <button
                            onClick= {() => setIsWindowOpen(true)}
                            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-full font-semibold transition-all shadow-lg shadow-rose-600/20">
                            <FiPlus />
                            Créer
                        </button >
                    </div>

                    {/* COLLECTIONS */}
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-6">Tes collections</h2>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

                            {loading && (
                                <p className="text-neutral-400">
                                    Chargement des collections...
                                </p>
                            )}

                            {error && (
                                <p className="text-red-500">
                                    {error}
                                </p>
                            )}

                            {!loading && collections.length === 0 && (
                                <div className="col-span-full bg-neutral-900/40 border border-white/5 rounded-2xl p-8 text-center">
                                    <p className="text-white font-semibold">
                                        Aucune collection trouvée
                                    </p>

                                    <p className="text-neutral-500 text-sm mt-2">
                                        Crée ta première collection
                                    </p>
                                </div>
                            )}

                            {collections.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => navigate(`/collections/${item.id}`)}
                                    className="group cursor-pointer"
                                >
                                    <div className="relative rounded-2xl overflow-hidden bg-neutral-900/40 backdrop-blur-xl border border-white/5 hover:border-rose-500/30 transition-all duration-300 p-6">

                                        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                        <div className="relative z-10">
                                            <h2 className="text-white font-bold text-lg group-hover:text-rose-400 transition-colors">
                                                {item.name}
                                            </h2>

                                            <p className="text-neutral-500 text-sm mt-2 line-clamp-2">
                                                {item.description || "Aucune description"}
                                            </p>

                                            <div className="flex items-center justify-between mt-6">
                                                <span className="text-xs text-neutral-600">
                                                    {item.is_public ? "Public" : "Privé"}
                                                </span>
                                                <span className="text-xs text-rose-400 font-semibold">
                                                    Voir →
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RECENT */}
                    <div className="mt-16">
                        <h2 className="text-2xl font-bold text-white mb-6">Récemment écouté</h2>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {[1,2,3,4,5,6].map((i) => (
                                <div key={i} className="bg-neutral-900/40 p-4 rounded-xl hover:bg-neutral-900/60 transition cursor-pointer">
                                    <img src={`https://picsum.photos/200?random=${i}`} className="rounded-lg mb-3"  alt={"image"}/>
                                    <p className="text-white text-sm font-semibold">Track {i}</p>
                                    <p className="text-neutral-500 text-xs">Artiste</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CONTINUE */}
                    <div className="mt-16">
                        <h2 className="text-2xl font-bold text-white mb-6">Continue ton écoute</h2>

                        <div className="flex gap-4 overflow-x-auto pb-2">
                            {[1,2,3,4].map((i) => (
                                <div key={i} className="min-w-[250px] bg-neutral-900/40 p-4 rounded-xl">
                                    <p className="text-white font-semibold mb-2">Playlist {i}</p>
                                    <div className="h-2 bg-neutral-700 rounded-full overflow-hidden">
                                        <div className="w-1/3 h-full bg-rose-500"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* STATUS */}
                    <div className="mt-16">
                        <h2 className="text-2xl font-bold text-white mb-6">Votre suivi</h2>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { title: "À découvrir", count: 12 },
                                { title: "En cours", count: 5 },
                                { title: "Terminé", count: 34 },
                                { title: "Abandonné", count: 2 },
                            ].map((item, index) => (
                                <div
                                    key={index}
                                    className="bg-neutral-900/40 border border-white/5 rounded-xl p-4 backdrop-blur-xl hover:bg-neutral-900/60 transition"
                                >
                                    <p className="text-neutral-400 text-sm">{item.title}</p>
                                    <p className="text-2xl font-bold text-white">{item.count}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* STATS */}
                    <div className="mt-16">
                        <h2 className="text-2xl font-bold text-white mb-6">Statistiques</h2>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="bg-gradient-to-br from-rose-600/20 to-purple-600/20 p-6 rounded-xl border border-white/5">
                                <p className="text-neutral-400 text-sm">Œuvres terminées</p>
                                <p className="text-3xl font-bold text-white">128</p>
                            </div>

                            <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 p-6 rounded-xl border border-white/5">
                                <p className="text-neutral-400 text-sm">Temps total</p>
                                <p className="text-3xl font-bold text-white">320h</p>
                            </div>

                            <div className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 p-6 rounded-xl border border-white/5">
                                <p className="text-neutral-400 text-sm">Collections</p>
                                <p className="text-3xl font-bold text-white">8</p>
                            </div>
                        </div>
                    </div>

                    {/* ACTIVITÉ */}
                    <div className="mt-16">
                        <h2 className="text-2xl font-bold text-white mb-6">Activité récente</h2>

                        <div className="space-y-4">
                            {[
                                "Tu as ajouté 'Chill vibes'",
                                "Nouvelle playlist créée",
                                "Album ajouté aux favoris"
                            ].map((activity, i) => (
                                <div key={i} className="bg-neutral-900/40 p-4 rounded-xl border border-white/5">
                                    <p className="text-neutral-300 text-sm">{activity}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
            <CreateCollection isOpen={isWindowOpen} onClose={()=> setIsWindowOpen(false)} onSubmit={handleCreateCollection}></CreateCollection>
        </div>
    );
};

export default Collections;
