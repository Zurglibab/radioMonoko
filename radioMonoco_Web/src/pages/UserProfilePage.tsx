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
import {FiGlobe, FiLock, FiUserPlus, FiCheck, FiUserCheck, FiUserX, FiAlertCircle} from "react-icons/fi";
import NotificationsService from "../services/NotificationsService.ts";
import {Loader} from "../components/utils/Loader.tsx";
import {useAppearance} from "../context/AppearanceContext.tsx";

const UserProfilePage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user: connectedUser } = useAuth();
    const [profilUser, setProfilUser] = useState<User | null>(null);
    const [collections, setCollections] = useState<Collection[]>([]);

    const [followers, setFollowers] = useState<User[]>([]);
    const [following, setFollowing] = useState<User[]>([]);

    const [isFriend, setIsFriend] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionError, setActionError] = useState("");
    const {t} = useTranslation();
    const [isFollow, setFollow] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);
    const [isBlockLoading, setIsBlockLoading] = useState(false);

    const isOwnProfile = connectedUser?.id === profilUser?.id;
    const isPrivateProfil = profilUser?.privacy === "private";
    const {theme} = useAppearance();

    useEffect(() => {
        if (actionError) {
            const timer = setTimeout(() => setActionError(""), 5000);
            return () => clearTimeout(timer);
        }
    }, [actionError]);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                setLoading(true);
                setError("");
                if (!id) {
                    setError(t("userProfile.missingUserId"));
                    return;
                }

                const userData = await UsersService.getUserById(id);
                if (!userData) {
                    setError(t("userProfile.userNotFound"));
                    return;
                }
                setProfilUser(userData);

                try {
                    const [followersData, followingData] = await Promise.all([
                        UserRelationsService.getFollowers(),
                        UserRelationsService.getFollowing()
                    ]);
                    setFollowers(followersData || []);
                    setFollowing(followingData || []);
                } catch (e) {
                    console.error("Erreur récupération relations :", e);
                }

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
        setActionError(t("userProfile.privateCollectionAlert"));
    };

    const sendNotification = async (targetUserId: string, type: "follow") => {
        if (!connectedUser) return;
        const senderName = connectedUser?.display_name || connectedUser?.username || t("userProfile.someone", "Quelqu'un");
        if (targetUserId === connectedUser?.id) return;
        const messages = {
            follow: `${senderName} ${t("userProfile.startedFollowing")}`
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
        setActionError("");
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
            setActionError(t("userProfile.errorOccurred"));
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleBlockToggle = async () => {
        if (!id || isBlockLoading) return;
        if (!isBlocked && !window.confirm(t("userProfile.confirmBlock"))) return;
        setIsBlockLoading(true);
        setActionError("");
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
            setActionError(t("userProfile.errorBlocking"));
        } finally {
            setIsBlockLoading(false);
        }
    };

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${
                theme === "dark" ? "bg-app-bg text-app-text" : "bg-neutral-50 text-neutral-800"
            }`}>
                <div className={theme === "dark" ? "text-neutral-400" : "text-neutral-500"}>
                    <Loader />
                </div>
            </div>
        );
    }

    if (error || !profilUser) {
        return (
            <div className={`min-h-screen flex items-center justify-center px-6 ${
                theme === "dark" ? "bg-app-bg text-app-text" : "bg-neutral-50 text-neutral-800"
            }`}>
                <div className="text-center">
                    <p className={`text-xl font-bold ${
                        theme === "dark" ? "text-white" : "text-neutral-900"
                    }`}>
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
        <div className={`min-h-screen px-6 md:px-12 py-24 relative overflow-hidden transition-colors duration-300 ${
            theme === "dark" ? "bg-app-bg text-app-text" : "bg-neutral-50 text-neutral-800"}`}>

            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-rose-600/10 rounded-full blur-[140px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-full transition ${
                            theme === "dark"
                                ? "bg-neutral-800 hover:bg-neutral-700 text-white"
                                : "bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-200 shadow-sm"
                        }`}
                    >
                        ← {t("common.back")}
                    </button>
                </div>

                {actionError && (
                    <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-4">
                        <FiAlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
                        <p className="text-red-400 text-sm font-medium">
                            {actionError}
                        </p>
                    </div>
                )}

                <div className={`rounded-3xl p-8 md:p-10 mb-12 border ${
                    theme === "dark"
                        ? "bg-neutral-900/40 border-white/5"
                        : "bg-white border-neutral-200 shadow-sm"
                }`}>

                    <div className="flex flex-col md:flex-row md:items-center gap-8">

                        <div className={`w-32 h-32 md:w-40 md:h-40 shrink-0 rounded-full bg-gradient-to-br from-rose-500/40 to-blue-500/30 border flex items-center justify-center overflow-hidden mx-auto md:mx-0 ${
                            theme === "dark" ? "border-white/10" : "border-neutral-200"
                        }`}>
                            {profilUser.avatar ? (
                                <img
                                    src={profilUser.avatar}
                                    alt={profilUser.username || "User"}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-5xl md:text-6xl font-black text-white">
                                    {profilUser.username?.charAt(0)?.toUpperCase() || "U"}
                                </span>
                            )}
                        </div>

                        <div className="flex-1 text-center md:text-left">

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3">
                                <p className="uppercase tracking-[0.2em] text-neutral-500 text-xs font-bold">
                                    {t("userProfile.title")}
                                </p>

                                <span
                                    className={`inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full border ${
                                        profilUser.privacy === "public"
                                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                                            : theme === "dark"
                                                ? "border-neutral-600 bg-neutral-800 text-neutral-400"
                                                : "border-neutral-300 bg-neutral-100 text-neutral-600"
                                    }`}
                                >
                                    {profilUser.privacy === "public" ? <FiGlobe /> : <FiLock />}
                                    {profilUser.privacy === "public" ? t("userProfile.public") : t("userProfile.private")}
                                </span>
                            </div>

                            <h1 className="text-4xl md:text-6xl font-black tracking-tight break-words">
                                {profilUser.display_name || profilUser.username || t("userProfile.unknownUser", "Utilisateur inconnu")}
                            </h1>

                            <p className={theme === "dark" ? "text-neutral-500 mt-2" : "text-neutral-600 mt-2"}>
                                @{profilUser.username || "unknown"}
                            </p>

                            {isPrivateProfil && !isOwnProfile ? (
                                <p className={`mt-5 max-w-2xl mx-auto md:mx-0 ${theme === "dark" ? "text-neutral-500" : "text-neutral-600"}`}>
                                    {t("userProfile.privateProfileNotice")}
                                </p>
                            ) : (
                                <>
                                    {profilUser.bio && (
                                        <p className={`mt-5 max-w-2xl mx-auto md:mx-0 ${theme === "dark" ? "text-neutral-300" : "text-neutral-700"}`}>
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
                            <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 mt-6 md:mt-0 w-full md:w-auto">
                                <button
                                    onClick={handleFollowToggle}
                                    disabled={isActionLoading || isBlocked}
                                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 md:px-5 md:py-3 text-sm md:text-base rounded-full font-semibold transition shadow-lg min-w-[120px] ${
                                        isFollow
                                            ? theme === "dark"
                                                ? "bg-neutral-800 hover:bg-neutral-700 text-white"
                                                : "bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-200"
                                            : "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20"
                                    } ${isBlocked ? "opacity-50 cursor-not-allowed" : ""}`}
                                >
                                    {isActionLoading ? (
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            {isFollow ? <FiCheck /> : <FiUserPlus />}
                                            <span className="whitespace-nowrap">{isFollow ? t("userProfile.following") : t("userProfile.follow")}</span>
                                        </>
                                    )}
                                </button>

                                {(!isOwnProfile && isFriend && !isBlocked) && (
                                    <div className="flex-1 sm:flex-none flex min-w-[120px]">
                                        <DMButton otherUserId={id!} currentUserId={connectedUser!.id} />
                                    </div>
                                )}

                                <button
                                    onClick={handleBlockToggle}
                                    disabled={isBlockLoading}
                                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 md:px-5 md:py-3 text-sm md:text-base rounded-full font-semibold transition border min-w-[120px] ${
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
                                            <span className="whitespace-nowrap">{isBlocked ? t("userProfile.blockedUser") : t("userProfile.block")}</span>
                                        </>
                                    )}
                                </button>

                                <div className="flex items-center justify-center shrink-0">
                                    <ReportButton
                                        type="user"
                                        targetId={profilUser.id}
                                        targetLabel={`@${profilUser.username || profilUser.id}`}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10">
                        <div className={`rounded-2xl p-5 border text-center md:text-left ${
                            theme === "dark"
                                ? "bg-black/20 border-white/5"
                                : "bg-neutral-50 border-neutral-200"
                        }`}>
                            <p className={`text-sm ${theme === "dark" ? "text-neutral-500" : "text-neutral-600"}`}>
                                {t("userProfile.displayedCollections")}
                            </p>
                            <p className="text-3xl font-black mt-2">
                                {collections.length}
                            </p>
                        </div>

                        <div className={`rounded-2xl p-5 border text-center md:text-left ${
                            theme === "dark"
                                ? "bg-black/20 border-white/5"
                                : "bg-neutral-50 border-neutral-200"
                        }`}>
                            <p className={`text-sm ${theme === "dark" ? "text-neutral-500" : "text-neutral-600"}`}>
                                {t("userProfile.publicCollections")}
                            </p>
                            <p className="text-3xl font-black mt-2">
                                {collections.filter((c) => c.is_public).length}
                            </p>
                        </div>

                        <div className={`rounded-2xl p-5 border text-center md:text-left ${
                            theme === "dark"
                                ? "bg-black/20 border-white/5"
                                : "bg-neutral-50 border-neutral-200"
                        }`}>
                            <p className={`text-sm ${theme === "dark" ? "text-neutral-500" : "text-neutral-600"}`}>
                                {t("userProfile.followers", "Abonnés")}
                            </p>
                            <p className="text-3xl font-black mt-2">
                                {followers.length}
                            </p>
                        </div>

                        <div className={`rounded-2xl p-5 border text-center md:text-left ${
                            theme === "dark"
                                ? "bg-black/20 border-white/5"
                                : "bg-neutral-50 border-neutral-200"
                        }`}>
                            <p className={`text-sm ${theme === "dark" ? "text-neutral-500" : "text-neutral-600"}`}>
                                {t("userProfile.following", "Abonnements")}
                            </p>
                            <p className="text-3xl font-black mt-2">
                                {following.length}
                            </p>
                        </div>
                    </div>
                </div>

                <div>
                    <h2 className="text-2xl font-bold mb-6 text-center md:text-left">
                        {t("userProfile.collectionsOf")}{" "}
                        <span className="text-rose-500">
                            {profilUser.username || t("userProfile.unknownUser", "Utilisateur inconnu")}
                        </span>
                    </h2>

                    {collections.length === 0 ? (
                        <div className={`rounded-2xl p-8 text-center border ${
                            theme === "dark"
                                ? "bg-neutral-900/40 border-white/5"
                                : "bg-white border-neutral-200 shadow-sm"
                        }`}>
                            <p className={theme === "dark" ? "text-neutral-400" : "text-neutral-600"}>
                                {t("userProfile.noVisibleCollections")}
                            </p>
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                            {collections.map((collection) => {
                                const isLocked = !collection.is_public && !isOwnProfile;

                                return (
                                    <div
                                        key={collection.id}
                                        onClick={() => handleCollectionClick(collection)}
                                        className={`cursor-pointer border rounded-2xl p-5 transition ${
                                            theme === "dark"
                                                ? `bg-neutral-900/40 ${
                                                    isLocked
                                                        ? "border-yellow-500/20 hover:border-yellow-500/40"
                                                        : "border-white/5 hover:border-rose-500/30 hover:bg-neutral-900/70"
                                                }`
                                                : `bg-white shadow-sm ${
                                                    isLocked
                                                        ? "border-yellow-400/40 hover:border-yellow-500/60"
                                                        : "border-neutral-200 hover:border-rose-400/50 hover:bg-neutral-50"
                                                }`
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

                                        <h3 className={`font-bold text-lg ${theme === "dark" ? "text-white" : "text-neutral-900"}`}>
                                            {collection.name}
                                        </h3>

                                        <p className={`text-sm mt-2 line-clamp-3 ${theme === "dark" ? "text-neutral-500" : "text-neutral-600"}`}>
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
                    <h2 className="text-2xl font-bold mb-6 text-center md:text-left">
                        {t("userProfile.followers", "Abonnés de")} <span className="text-rose-500">{profilUser.username || t("userProfile.unknownUser", "Utilisateur inconnu")}</span>
                    </h2>

                    {followers.length === 0 ? (
                        <div className={`rounded-2xl p-8 text-center border ${
                            theme === "dark"
                                ? "bg-neutral-900/40 border-white/5"
                                : "bg-white border-neutral-200 shadow-sm"
                        }`}>
                            <p className={theme === "dark" ? "text-neutral-400" : "text-neutral-600"}>
                                {t("userProfile.noFollowers", "Aucun abonné pour le moment.")}
                            </p>
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                            {followers.map((user) => (
                                <div
                                    key={user.id}
                                    onClick={() => navigate(`/users/${user.id}`)}
                                    className={`cursor-pointer rounded-2xl p-5 border transition ${
                                        theme === "dark"
                                            ? "bg-neutral-900/40 border-white/5 hover:border-rose-500/30 hover:bg-neutral-900/70"
                                            : "bg-white border-neutral-200 hover:border-rose-400/50 hover:bg-neutral-50 shadow-sm"
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 shrink-0 rounded-full bg-gradient-to-br from-rose-500/40 to-blue-500/30 overflow-hidden flex items-center justify-center">
                                            {user.avatar ? (
                                                <img
                                                    src={user.avatar}
                                                    alt={user.username || "User"}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-xl font-bold">
                                                    {user.username?.charAt(0)?.toUpperCase() || "U"}
                                                </span>
                                            )}
                                        </div>

                                        <div className="min-w-0">
                                            <h3 className={`font-bold truncate ${theme === "dark" ? "text-white" : "text-neutral-900"}`}>
                                                {user.display_name || user.username || t("userProfile.unknownUser", "Utilisateur inconnu")}
                                            </h3>
                                            <p className="text-sm text-neutral-500 truncate">
                                                @{user.username || "unknown"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-12">
                    <h2 className="text-2xl font-bold mb-6 text-center md:text-left">
                        {t("userProfile.followingOf", "Abonnements de")} <span className="text-rose-500">{profilUser.username || t("userProfile.unknownUser", "Utilisateur inconnu")}</span>
                    </h2>

                    {following.length === 0 ? (
                        <div className={`rounded-2xl p-8 text-center border ${
                            theme === "dark"
                                ? "bg-neutral-900/40 border-white/5"
                                : "bg-white border-neutral-200 shadow-sm"
                        }`}>
                            <p className={theme === "dark" ? "text-neutral-400" : "text-neutral-600"}>
                                {t("userProfile.noFollowing", "Ne suit personne pour le moment.")}
                            </p>
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                            {following.map((user) => (
                                <div
                                    key={user.id}
                                    onClick={() => navigate(`/users/${user.id}`)}
                                    className={`cursor-pointer rounded-2xl p-5 border transition ${
                                        theme === "dark"
                                            ? "bg-neutral-900/40 border-white/5 hover:border-rose-500/30 hover:bg-neutral-900/70"
                                            : "bg-white border-neutral-200 hover:border-rose-400/50 hover:bg-neutral-50 shadow-sm"
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 shrink-0 rounded-full bg-gradient-to-br from-rose-500/40 to-blue-500/30 overflow-hidden flex items-center justify-center">
                                            {user.avatar ? (
                                                <img
                                                    src={user.avatar}
                                                    alt={user.username || "User"}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-xl font-bold">
                                                    {user.username?.charAt(0)?.toUpperCase() || "U"}
                                                </span>
                                            )}
                                        </div>

                                        <div className="min-w-0">
                                            <h3 className={`font-bold truncate ${theme === "dark" ? "text-white" : "text-neutral-900"}`}>
                                                {user.display_name || user.username || t("userProfile.unknownUser", "Utilisateur inconnu")}
                                            </h3>
                                            <p className="text-sm text-neutral-500 truncate">
                                                @{user.username || "unknown"}
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
