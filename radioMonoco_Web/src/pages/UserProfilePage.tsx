import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import UsersService from "../services/UsersService.ts";
import CollectionsService from "../services/CollectionsService.ts";
import UserRelationsService from "../services/UserRelationsService.ts";
import { useAuth } from "../context/AuthContext.tsx";
import { DMButton } from "../components/chat/DMButton.tsx";
import type { User } from "../interfaces/Users.types.ts";
import type { Collection } from "../interfaces/Collections.types.ts";
import ReportButton from "../components/utils/ReportButton.tsx";
import {useTranslation} from "react-i18next";
import {FiGlobe, FiLock, FiUserPlus, FiCheck, FiUserCheck, FiUserX} from "react-icons/fi";
import NotificationsService from "../services/NotificationsService.ts";
import {Loader} from "../components/utils/Loader.tsx";


const UserProfilePage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user: connectedUser } = useAuth();
    const [profilUser, setProfilUser] = useState<User | null>(null);
    const [collections, setCollections] = useState<Collection[]>([]);
    const [isFriend, setIsFriend] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const {t} = useTranslation();
    const [isFollow, setFollow] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [friends, setFriends] = useState<User[]>([]);
    const [isBlocked, setIsBlocked] = useState(false);
    const [isBlockLoading, setIsBlockLoading] = useState(false);

    const isOwnProfile = connectedUser?.id === profilUser?.id;
    const isPrivateProfil = profilUser?.privacy === "private";

    useEffect(() => {
        const loadProfile = async () => {
            try {
                setLoading(true);
                setError("");
                if (!id) {
                    setError("ID utilisateur manquant.");
                    return;
                }

                const userData = await UsersService.getUserById(id);
                if (!userData) {
                    setError(t("userProfile.userNotFound"));
                    return;
                }
                setProfilUser(userData);

                const userFriends = await UserRelationsService.getFriendsById(id);
                setFriends(userFriends);

                if (connectedUser?.id && id !== connectedUser.id) {
                    const blockedStatus = await UserRelationsService.checkIsBlocked(id);
                    setIsBlocked(blockedStatus);

                    if (!blockedStatus){
                        const friendStatus = await UserRelationsService.checkIsFriend(id);
                        setIsFriend(friendStatus);

                        const followingList = await UserRelationsService.getFollowing();
                        const isFollowing = followingList.some((rel) => rel.id === id);
                        setFollow(isFollowing);
                    }

                }

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
                setError(t("userProfile.loadError"));
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
        alert(t("userProfile.privateCollectionAlert"));
    };

    const sendNotification = async (targetUserId: string, type: "follow") => {
        if (!connectedUser) return;
        const senderName = connectedUser?.display_name || connectedUser?.username || "Quelqu'un";
        if (targetUserId === connectedUser?.id) return;
        const messages = {
            follow: `${senderName} a commencé à vous suivre`
        };

        const user = await UsersService.getUserById(targetUserId);
        if (!user) {
            console.error("Utilisateur cible introuvable pour la notification");
            return;
        }
        try {
            await NotificationsService.createNotification({
                user_id: targetUserId,
                type: type,
                message: messages[type],
                is_read: false
            });
        } catch (error) {
            console.error("Erreur notification:", error);
        }
    };

    const handleFollowToggle = async () => {
        if (!id || !connectedUser?.id || isActionLoading) return;
        setIsActionLoading(true);
        try {
            if (isFollow) {
                await UserRelationsService.unfollow(id);
                try { await UserRelationsService.unfollow(id); } catch(e) {}

                setFollow(false);
                setIsFriend(false);
            } else {
                await UserRelationsService.follow(id);
                setFollow(true);
                await sendNotification(id, "follow");
                const friendStatus = await UserRelationsService.checkIsFriend(id);
                setIsFriend(friendStatus);
            }
        } catch (err) {
            console.error("Erreur lors de l'interaction :", err);
            alert("Une erreur est survenue.");
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleBlockToggle = async () => {
        if (!id || isBlockLoading) return;
        if (!isBlocked && !window.confirm("Êtes-vous sûr de vouloir bloquer cet utilisateur ?")) return;
        setIsBlockLoading(true);
        try {
            if (isBlocked) {
                await UserRelationsService.block(id);
                setIsBlocked(false);
            } else {
                await UserRelationsService.block(id);
                setIsBlocked(true);
                setFollow(false);
                setIsFriend(false);
            }
        } catch (err) {
            alert("Une erreur est survenue lors du blocage.");
        } finally {
            setIsBlockLoading(false);
        }
    };


    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="text-neutral-400">
                    <Loader />
                </div>
            </div>
        );
    }

    if (error || !profilUser) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
                <div className="text-center">
                    <p className="text-white text-xl font-bold">
                        {error || t("userProfile.userNotFound")}
                    </p>

                    <button
                        onClick={() => navigate("/search")}
                        className="mt-6 px-5 py-2 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-semibold transition"
                    >
                        {t("userProfile.backToSearch")}
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
                    ← {t("common.back")}
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
                                    {t("userProfile.title")}
                                </p>

                                <span
                                    className={`inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full border ${
                                        profilUser.privacy === "public"
                                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                                            : "border-neutral-600 bg-neutral-800 text-neutral-400"
                                    }`}
                                >
                                    {profilUser.privacy === "public" ? <FiGlobe /> : <FiLock />}
                                    {profilUser.privacy === "public" ? t("userProfile.public") : t("userProfile.private")}
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
                                    {t("userProfile.privateProfileNotice")}
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
                            <div className="flex gap-3">
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleFollowToggle}
                                        disabled={isActionLoading || isBlocked}
                                        className={`flex items-center justify-center gap-2 px-5 py-3 rounded-full font-semibold transition shadow-lg min-w-[120px] ${
                                            isFollow
                                                ? "bg-neutral-800 hover:bg-neutral-700 text-white"
                                                : "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20"
                                        } ${isBlocked ? "opacity-50 cursor-not-allowed" : ""}`}
                                    >
                                        {isActionLoading ? (
                                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                {isFollow ? <FiCheck /> : <FiUserPlus />}
                                                {isFollow ? "Abonné" : "Suivre"}
                                            </>
                                        )}
                                    </button>

                                    {(!isOwnProfile && isFriend && !isBlocked) && (
                                        <DMButton otherUserId={id!} currentUserId={connectedUser!.id} />
                                    )}
                                </div>

                                <button
                                    onClick={handleBlockToggle}
                                    disabled={isBlockLoading}
                                    className={`flex items-center justify-center gap-2 px-5 py-3 rounded-full font-semibold transition border ${
                                        isBlocked
                                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                                            : "border-red-500/30 bg-red-500/10 text-red-500 hover:bg-red-500/20"
                                    } ${isBlockLoading ? "opacity-70 cursor-wait" : ""}`}
                                >
                                    {isBlockLoading ? (
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            {isBlocked ? <FiUserCheck /> : <FiUserX />}
                                            {isBlocked ? "Utilisateur bloqué" : "Bloquer"}
                                        </>
                                    )}
                                </button>

                                <ReportButton
                                    type="user"
                                    targetId={profilUser.id}
                                    targetLabel={`@${profilUser.username}`}
                                />
                            </div>
                        )}
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 mt-10">
                        <div className="bg-black/20 border border-white/5 rounded-2xl p-5">
                            <p className="text-neutral-500 text-sm">
                                {t("userProfile.displayedCollections")}
                            </p>
                            <p className="text-3xl font-black mt-2">
                                {collections.length}
                            </p>
                        </div>

                        <div className="bg-black/20 border border-white/5 rounded-2xl p-5">
                            <p className="text-neutral-500 text-sm">
                                {t("userProfile.publicCollections")}
                            </p>
                            <p className="text-3xl font-black mt-2">
                                {collections.filter((c) => c.is_public).length}
                            </p>
                        </div>

                        <div className="bg-black/20 border border-white/5 rounded-2xl p-5">
                            <p className="text-neutral-500 text-sm">
                                Amis
                            </p>
                            <p className="text-3xl font-black mt-2">
                                {friends.length}
                            </p>
                        </div>
                    </div>
                </div>

                <div>
                    <h2 className="text-2xl font-bold mb-6">
                        {t("userProfile.collectionsOf")}{" "}
                        <span className="text-rose-500">
                            {profilUser.username}
                        </span>
                    </h2>

                    {collections.length === 0 ? (
                        <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-8 text-center">
                            <p className="text-neutral-400">
                                {t("userProfile.noVisibleCollections")}
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
                                                {t("userProfile.collectionLabel")}
                                            </span>

                                            <span
                                                className={`text-xs inline-flex items-center gap-1 ${
                                                    collection.is_public
                                                        ? "text-emerald-400"
                                                        : "text-yellow-400"
                                                }`}
                                            >
                                                {collection.is_public ? <FiGlobe /> : <FiLock />}
                                                {collection.is_public ? t("userProfile.public") : t("userProfile.private")}
                                            </span>
                                        </div>

                                        <h3 className="text-white font-bold text-lg">
                                            {collection.name}
                                        </h3>

                                        <p className="text-neutral-500 text-sm mt-2 line-clamp-3">
                                            {collection.description || t("userProfile.noDescription")}
                                        </p>

                                        <span
                                            className={`text-xs mt-5 inline-block ${
                                                isLocked ? "text-yellow-400" : "text-rose-400"
                                            }`}
                                        >
                                            {isLocked
                                                ? t("userProfile.lockedPrivateCollection")
                                                : t("userProfile.viewCollection")}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="mt-12">
                    <h2 className="text-2xl font-bold mb-6">
                        Amis de <span className="text-rose-500">{profilUser.username}</span>
                    </h2>

                    {friends.length === 0 ? (
                        <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-8 text-center">
                            <p className="text-neutral-400">
                                Cet utilisateur n'a pas encore d'amis.
                            </p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-3 gap-6">
                            {friends.map((friend) => (
                                <div
                                    key={friend.id}
                                    onClick={() => navigate(`/users/${friend.id}`)}
                                    className="cursor-pointer bg-neutral-900/40 border border-white/5 rounded-2xl p-5 hover:border-rose-500/30 transition"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-rose-500/40 to-blue-500/30 overflow-hidden flex items-center justify-center">
                                            {friend.avatar ? (
                                                <img
                                                    src={friend.avatar}
                                                    alt={friend.username}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-xl font-bold">
                                                    {friend.username.charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                        </div>

                                        <div>
                                            <h3 className="font-bold">
                                                {friend.display_name || friend.username}
                                            </h3>
                                            <p className="text-sm text-neutral-500">
                                                @{friend.username}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default UserProfilePage;