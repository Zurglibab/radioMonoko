import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import UsersService from "../services/UsersService.ts";
import CollectionsService from "../services/CollectionsService.ts";
import { useAuth } from "../context/AuthContext.tsx";
import type { User } from "../interfaces/Users.types.ts";
import type { Collection } from "../interfaces/Collections.types.ts";
import { FiGlobe, FiLock, FiUserPlus } from "react-icons/fi";

const UserProfilePage = () => {
    const {id} = useParams<{id:string}>();
    const navigate = useNavigate();
    const {user : connectedUser} = useAuth();
    const [profilUser, setProfilUser] = useState<User | null>(null);
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const isOwnProfile = connectedUser?.id === profilUser?.id;
    const isPrivateProfil = profilUser?.privacy === "private";

    useEffect(() => {
        const loadProfile = async () => {
            try {
                setLoading(true);
                setError("");

                if(!id) {
                    setError("ID utilisateur manquant.");
                    return;
                }

                const userData = await UsersService.getUserById(id);
                if (!userData) {
                    setError("Utilisateur introuvable.");
                    return;
                }
                setProfilUser(userData);

                const allCollections = await CollectionsService.getAllCollections();
                const userCollections = allCollections.filter((collection) => collection.user_id === userData.id);
                let visibleCollections: Collection[] = [];

                if (connectedUser?.id === userData.id) {
                    visibleCollections = userCollections;
                } else if (userData.privacy === "private") {
                    visibleCollections = userCollections.filter(collection => collection.is_public);
                } else {
                    visibleCollections = userCollections;
                }
                setCollections(visibleCollections);
            } catch (err) {
                console.error("Erreur chargement profil utilisateur :", err);
                setError("Impossible de charger le profil utilisateur");
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, [id, connectedUser?.id]);

    const handleCollectionClick = (collection: Collection) => {
        if (collection.is_public || isOwnProfile) {
            navigate(`/collections/${collection.id}`);
            return;
        }
        alert("Cette collection est privée vous ne pouvez pas y accéder .");
    };

    const handleFollowClick = () => {
        alert("La fonctionnalité de follow click arrive apres zebi");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <p className="text-neutral-400">
                    Chargement du profil...
                </p>
            </div>
        );
    }
    if (error || !profilUser) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
                <div className="text-center">
                    <p className="text-white text-xl font-bold">
                        {error || "Utilisateur introuvable"}
                    </p>

                    <button
                        onClick={() => navigate("/search")}
                        className="mt-6 px-5 py-2 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-semibold transition"
                    >
                        Retour à la recherche
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white px-6 md:px-12 py-24 relative overflow-hidden">

            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-rose-600/10 rounded-full blur-[140px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto">

                <button
                    onClick={() => navigate(-1)}
                    className="mb-8 flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white px-3 py-2 rounded-full transition"
                >
                    ← Retour
                </button>

                <div className="bg-neutral-900/40 border border-white/5 rounded-3xl p-8 md:p-10 mb-12">

                    <div className="flex flex-col md:flex-row md:items-center gap-8">

                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-rose-500/40 to-blue-500/30 border border-white/10 flex items-center justify-center overflow-hidden">
                            {profilUser.avatar ? (
                                <img
                                    src={profilUser.avatar}
                                    alt={profilUser.username}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-5xl font-black text-white">
                                    {profilUser.username?.charAt(0)?.toUpperCase() || "U"}
                                </span>
                            )}
                        </div>

                        <div className="flex-1">

                            <div className="flex flex-wrap items-center gap-3 mb-3">
                                <p className="uppercase tracking-[0.2em] text-neutral-500 text-xs font-bold">
                                    Profil utilisateur
                                </p>

                                <span
                                    className={`inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full border ${
                                        profilUser.privacy === "public"
                                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                                            : "border-neutral-600 bg-neutral-800 text-neutral-400"
                                    }`}
                                >
                                    {profilUser.privacy === "public" ? <FiGlobe /> : <FiLock />}
                                    {profilUser.privacy === "public" ? "Public" : "Privé"}
                                </span>
                            </div>

                            <h1 className="text-4xl md:text-6xl font-black tracking-tight">
                                {profilUser.display_name || profilUser.username}
                            </h1>

                            <p className="text-neutral-500 mt-2">
                                @{profilUser.username}
                            </p>

                            {isPrivateProfil && !isOwnProfile ? (
                                <p className="text-neutral-500 mt-5 max-w-2xl">
                                    Ce profil est privé. Seules les informations publiques et les collections publiques sont visibles.
                                </p>
                            ) : (
                                <>
                                    {profilUser.bio && (
                                        <p className="text-neutral-300 mt-5 max-w-2xl">
                                            {profilUser.bio}
                                        </p>
                                    )}

                                    {profilUser.website && (
                                        <a
                                            href={profilUser.website}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-block text-rose-400 hover:text-rose-300 mt-4 text-sm"
                                        >
                                            {profilUser.website}
                                        </a>
                                    )}
                                </>
                            )}
                        </div>

                        {!isOwnProfile && (
                            <button
                                onClick={handleFollowClick}
                                className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-5 py-3 rounded-full font-semibold transition shadow-lg shadow-rose-600/20"
                            >
                                <FiUserPlus />
                                Suivre
                            </button>
                        )}
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 mt-10">
                        <div className="bg-black/20 border border-white/5 rounded-2xl p-5">
                            <p className="text-neutral-500 text-sm">
                                Collections affichées
                            </p>
                            <p className="text-3xl font-black mt-2">
                                {collections.length}
                            </p>
                        </div>

                        <div className="bg-black/20 border border-white/5 rounded-2xl p-5">
                            <p className="text-neutral-500 text-sm">
                                Collections publiques
                            </p>
                            <p className="text-3xl font-black mt-2">
                                {collections.filter((c) => c.is_public).length}
                            </p>
                        </div>

                        <div className="bg-black/20 border border-white/5 rounded-2xl p-5">
                            <p className="text-neutral-500 text-sm">
                                Membre depuis
                            </p>
                            <p className="text-lg font-bold mt-3">
                                {profilUser.created_at
                                    ? new Date(profilUser.created_at).toLocaleDateString()
                                    : "Non renseigné"}
                            </p>
                        </div>
                    </div>
                </div>

                <div>
                    <h2 className="text-2xl font-bold mb-6">
                        Collections de{" "}
                        <span className="text-rose-500">
                            {profilUser.username}
                        </span>
                    </h2>

                    {collections.length === 0 ? (
                        <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-8 text-center">
                            <p className="text-neutral-400">
                                Aucune collection visible pour cet utilisateur.
                            </p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-3 gap-6">
                            {collections.map((collection) => {
                                const isLocked = !collection.is_public && !isOwnProfile;

                                return (
                                    <div
                                        key={collection.id}
                                        onClick={() => handleCollectionClick(collection)}
                                        className={`cursor-pointer bg-neutral-900/40 border rounded-2xl p-5 transition ${
                                            isLocked
                                                ? "border-yellow-500/20 hover:border-yellow-500/40"
                                                : "border-white/5 hover:border-rose-500/30 hover:bg-neutral-900/70"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-xs text-rose-400 font-semibold">
                                                Collection
                                            </span>

                                            <span
                                                className={`text-xs inline-flex items-center gap-1 ${
                                                    collection.is_public
                                                        ? "text-emerald-400"
                                                        : "text-yellow-400"
                                                }`}
                                            >
                                                {collection.is_public ? <FiGlobe /> : <FiLock />}
                                                {collection.is_public ? "Public" : "Privé"}
                                            </span>
                                        </div>

                                        <h3 className="text-white font-bold text-lg">
                                            {collection.name}
                                        </h3>

                                        <p className="text-neutral-500 text-sm mt-2 line-clamp-3">
                                            {collection.description || "Aucune description"}
                                        </p>

                                        <span
                                            className={`text-xs mt-5 inline-block ${
                                                isLocked ? "text-yellow-400" : "text-rose-400"
                                            }`}
                                        >
                                            {isLocked
                                                ? "Collection privée verrouillée"
                                                : "Voir la collection →"}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default UserProfilePage;