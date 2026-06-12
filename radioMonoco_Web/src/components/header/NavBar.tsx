import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logoSmall from "../../assets/images/icon_small.png";
import {
    HiOutlineBell,
    HiOutlineUser,
    HiOutlineCog,
    HiOutlineLogout,
    HiOutlineHeart,
    HiOutlineUserAdd,
    HiOutlineMenu,
    HiOutlineX,
    HiOutlineSearch,
    HiOutlineSun,
    HiOutlineMoon, HiOutlineUserGroup,
} from "react-icons/hi";
import { useAuth } from "../../context/AuthContext";
import { useAppearance } from "../../context/AppearanceContext";
import { SettingsModal } from "./SettingsModal";
import SearchService from "../../services/SearchService.ts";
import type { SearchResult } from "../../interfaces/Search.types.ts";
import CollectionsService from "../../services/CollectionsService.ts";
import {useNotificationContext} from "../../context/NotificationContext.tsx";
import LanguageSwitcher from "../utils/LanguageSwitcher.tsx";
import { useTranslation } from "react-i18next";
import { FriendsModal } from "./FriendsModal";

const NavBar = () => {
    const { user, logout } = useAuth();
    const { theme, setTheme } = useAppearance();
    const isConnected = !!user;
    const navigate = useNavigate();
    const location = useLocation();
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationContext();
    const { t } = useTranslation();

    const isHomePage = location.pathname === "/";

    const [isPastThreshold, setIsPastThreshold] = useState(!isHomePage);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isFriendsOpen, setIsFriendsOpen] = useState(false);

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchLoading, setSearchLoading] = useState(false);
    const [previewResults, setPreviewResults] = useState<SearchResult>({
        users: [],
        collections: [],
        shows: []
    });

    const dropdownRef = useRef<HTMLDivElement>(null);
    const notifRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const searchContainerRef = useRef<HTMLInputElement>(null);

    const showLogo = !isHomePage || isPastThreshold;

    const menuLinks = [
        { path: "/", label: t("navBar.menu.home"), authRequired: false },
        { path: "/feed", label: t("navBar.menu.feed"), authRequired: true },
        { path : "/collections",label: t("navBar.menu.collections"), authRequired: true },
        ...(user?.role === "admin" ? [{ path : "/admin", label: t("navBar.menu.admin"), authRequired: true  }] : [])
    ];

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    useEffect(() => {
        if (isSearchOpen) {
            setTimeout(() => searchInputRef.current?.focus(), 100);
        }
    }, [isSearchOpen]);

    useEffect(() => {
        if (!isHomePage) return;
        const handleScroll = () => setIsPastThreshold(window.scrollY > 250);
        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [isHomePage]);

    useEffect(() => {
        document.body.style.overflow = (isMenuOpen || isSettingsOpen) ? 'hidden' : 'unset';
    }, [isMenuOpen, isSettingsOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;

            if (dropdownRef.current && !dropdownRef.current.contains(target)) {
                setIsProfileOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(target)) {
                setIsNotifOpen(false);
            }
            if (isSearchOpen && searchContainerRef.current && !searchContainerRef.current.contains(target)) {
                if (searchQuery.trim() === "") {
                    setIsSearchOpen(false);
                }
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isSearchOpen, searchQuery]);

    const handleSearch = (value: string) => {
        setSearchQuery(value);
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'like':
                return <HiOutlineHeart className="text-rose-500 text-xl flex-shrink-0" />;
            case 'dislike':
                return <HiOutlineHeart className="text-amber-500 text-xl flex-shrink-0 rotate-180" />;
            case 'reply':
                return <HiOutlineMenu className="text-blue-500 text-xl flex-shrink-0" />;
            default:
                return <HiOutlineBell className="text-primary text-xl flex-shrink-0" />;
        }
    };

    useEffect(() => {
        const timeout = setTimeout(async () => {
            const trimmed = searchQuery.trim();

            if (!isSearchOpen || trimmed.length < 2) {
                setPreviewResults({
                    users: [],
                    collections: [],
                    shows: []
                });
                setSearchLoading(false);
                return;
            }
            try {
                setSearchLoading(true);

                const allCollections = await CollectionsService.getAllCollections();
                const results = await SearchService.searchUnified(
                    trimmed,
                    allCollections
                );
                setPreviewResults(results);
            } catch (error) {
                console.error("Erreur preview recherche :", error);
                setPreviewResults({
                    users: [],
                    collections: [],
                    shows: []
                });
            } finally {
                setSearchLoading(false);
            }
        }, 350);
        return () => clearTimeout(timeout);
    }, [searchQuery, isSearchOpen]);

    const handleLogout = async () => {
        logout();
        setIsProfileOpen(false);
        setIsMenuOpen(false);
        navigate("/");
    };

    const closeSearch = () => {
        setIsSearchOpen(false);
        setSearchQuery("");
        setPreviewResults({
            users: [],
            collections: [],
            shows: []
        });
    };

    const goToSearchPage = () => {
        const trimmed = searchQuery.trim();

        if (!trimmed) return;

        navigate(`/search?q=${encodeURIComponent(trimmed)}`);
        closeSearch();
    };

    const hasPreviewResults =
        previewResults.users.length > 0 ||
        previewResults.collections.length > 0 ||
        previewResults.shows.length > 0;

    const IconCircleStyle = "flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full transition-all duration-300 cursor-pointer active:scale-95 hover:bg-app-text/10 group";

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 h-14 md:h-16 flex items-center justify-between px-4 md:px-12 bg-app-bg/80 backdrop-blur-xl border-b border-app-border z-50 transition-colors duration-500">

                <div className="flex items-center gap-3">
                    <button onClick={() => setIsMenuOpen(true)} className={`${IconCircleStyle}`}>
                        <HiOutlineMenu className="text-lg md:text-xl text-app-text cursor-pointer" />
                    </button>
                    {(
                        <div
                            ref={searchContainerRef}
                            className={`flex items-center h-9 md:h-10 rounded-full transition-all duration-300
                            ${isSearchOpen
                                ? "absolute left-4 right-4 top-1/2 -translate-y-1/2 z-50 bg-app-text/10 backdrop-blur-md md:backdrop-blur-none px-3 border border-app-border shadow-lg md:relative md:inset-auto md:translate-y-0 md:w-96"
                                : "relative w-10 bg-transparent border-transparent z-10"}
                                `}
                        >
                            <button
                                onClick={() => {
                                    if (isSearchOpen) {
                                        closeSearch();
                                    } else {
                                        setIsSearchOpen(true);
                                    }
                                }}
                                className={`
                                ${IconCircleStyle} w-9! h-9! md:w-10! md:h-10! absolute left-0 transition-all duration-500 z-10
                                ${isSearchOpen
                                    ? "text-primary rotate-90 scale-110 hover:bg-transparent"
                                    : "text-app-text rotate-0 scale-100"}
                                    `}
                            >
                                {isSearchOpen ? (
                                    <HiOutlineX className="text-lg" />
                                ) : (
                                    <HiOutlineSearch className="text-lg md:text-xl" />
                                )}
                            </button>

                            {isSearchOpen && (
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    aria-label={t("common.search")}
                                    placeholder={t("navBar.searchPlaceholder")}
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            goToSearchPage();
                                        }

                                        if (e.key === "Escape") {
                                            closeSearch();
                                        }
                                    }}
                                    className="ml-8 w-full bg-transparent outline-none text-app-text placeholder-app-text-secondary text-sm"
                                />
                            )}

                            {isSearchOpen && searchQuery.trim().length >= 2 && (
                                <div className="absolute top-full left-0 mt-3 w-full md:w-[430px] bg-app-bg border border-app-border rounded-2xl shadow-2xl overflow-hidden z-[80]">

                                    <div className="px-4 py-3 border-b border-app-border text-app-text flex items-center justify-between">
                                        <p className="text-[10px] uppercase tracking-[0.2em] text-app-text-secondary font-black">
                                            {t("navBar.searchPopup.advancedSearch")}
                                        </p>

                                        {searchLoading && (
                                            <div className="w-4 h-4 border-2 border-app-text/20 border-t-primary rounded-full animate-spin" />
                                        )}
                                    </div>

                                    {!searchLoading && !hasPreviewResults && (
                                        <div className="px-4 py-6 text-center">
                                            <p className="text-sm text-app-text-secondary">
                                                {t("navBar.searchPopup.noResults")}
                                            </p>

                                            <button
                                                type="button"
                                                onClick={goToSearchPage}
                                                className="mt-4 text-xs text-rose-400 hover:text-rose-300 font-semibold"
                                            >
                                                {t("navBar.searchPopup.viewFullSearch")}
                                            </button>
                                        </div>
                                    )}

                                    {hasPreviewResults && (
                                        <div className="max-h-[420px] text-app-text overflow-y-auto">

                                            {previewResults.users.length > 0 && (
                                                <div className="py-2">
                                                    <p className="px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-app-text-secondary font-black">
                                                        {t("navBar.searchPopup.users")}
                                                    </p>

                                                    {previewResults.users.slice(0, 3).map((u) => (
                                                        <button
                                                            key={u.id}
                                                            type="button"
                                                            onClick={() => {
                                                                navigate(`/users/${u.id}`);
                                                                closeSearch();
                                                            }}
                                                            className="w-full px-4 py-3 hover:bg-app-bg-secondary cursor-pointer text-left flex items-center gap-3 transition"
                                                        >
                                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-500/40 to-blue-500/30 flex items-center justify-center overflow-hidden shrink-0">
                                                                {u.avatar ? (
                                                                    <img
                                                                        src={u.avatar}
                                                                        alt={u.username}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <span className="text-app-text font-black text-sm">
                                                                        {u.username?.charAt(0)?.toUpperCase() || "U"}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <div className="min-w-0">
                                                                <p className="font-semibold text-app-text truncate">
                                                                    {u.display_name || u.username}
                                                                </p>

                                                                <p className="text-xs text-app-text-secondary truncate">
                                                                    @{u.username}
                                                                </p>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {previewResults.shows.length > 0 && (
                                                <div className="py-2 border-t border-app-border">
                                                    <p className="px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-app-text-secondary font-black">
                                                        {t("navBar.searchPopup.shows")}
                                                    </p>

                                                    {previewResults.shows.slice(0, 4).map((show) => (
                                                        <button
                                                            key={show.id ?? show.url}
                                                            type="button"
                                                            onClick={() => {
                                                                if (!show.url) return;

                                                                navigate(`/show/${encodeURIComponent(show.url)}`, {
                                                                    state: { show }
                                                                });

                                                                closeSearch();
                                                            }}
                                                            className="w-full px-4 py-3 hover:bg-app-bg-secondary cursor-pointer text-left transition"
                                                        >
                                                            <p className="font-semibold text-app-text line-clamp-1">
                                                                {show.title}
                                                            </p>

                                                            <p className="text-xs text-app-text-secondary mt-1 line-clamp-2">
                                                                {show.standFirst || t("navBar.searchPopup.noDescription")}
                                                            </p>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {previewResults.collections.length > 0 && (
                                                <div className="py-2 border-t border-app-border">
                                                    <p className="px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-app-text-secondary font-black">
                                                        {t("navBar.searchPopup.collections")}
                                                    </p>

                                                    {previewResults.collections.slice(0, 3).map((collection) => (
                                                        <button
                                                            key={collection.id}
                                                            type="button"
                                                            onClick={() => {
                                                                navigate(`/collections/${collection.id}`);
                                                                closeSearch();
                                                            }}
                                                            className="w-full px-4 py-3 hover:bg-app-bg-secondary cursor-pointer text-left transition"
                                                        >
                                                            <p className="font-semibold text-app-text line-clamp-1">
                                                                {collection.name}
                                                            </p>

                                                            <p className="text-xs text-app-text-secondary mt-1 line-clamp-2">
                                                                {collection.description || t("navBar.searchPopup.noDescription")}
                                                            </p>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="border-t border-app-border p-3">
                                                <button
                                                    type="button"
                                                    onClick={goToSearchPage}
                                                    className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold transition"
                                                >
                                                    {t("navBar.searchPopup.viewAllResults", { query: searchQuery.trim() })}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className={`absolute left-1/2 -translate-x-1/2 transition-all duration-400 md:duration-700 ease-in-out ${showLogo ? "opacity-100 scale-100" : "opacity-0 scale-50 pointer-events-none"}`}>
                    <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="cursor-pointer">
                        <img
                            src={logoSmall}
                            alt="Logo"
                            className={`h-6 md:h-8 w-auto transition-all duration-500 ${theme === 'dark' ? 'brightness-200' : 'brightness-0'}`}
                        />
                    </Link>
                </div>

                <div className="flex items-center gap-2 md:gap-3">
                    <div className="hidden md:block">
                        <LanguageSwitcher />
                    </div>
                    <button
                        onClick={toggleTheme}
                        className={`${IconCircleStyle}`}
                        title={theme === 'dark' ? t("navBar.theme.toLight") : t("navBar.theme.toDark")}
                    >
                        {theme === 'dark' ? (
                            <HiOutlineSun className="text-lg md:text-xl text-white animate-in zoom-in spin-in-90 duration-500" />
                        ) : (
                            <HiOutlineMoon className="text-lg md:text-xl text-app-text animate-in zoom-in spin-in-90 duration-500" />
                        )}
                    </button>

                    {isConnected ? (
                        <>
                            <div className="relative" ref={notifRef}>
                                <button onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); }} className={`${IconCircleStyle} ${isNotifOpen ? 'bg-app-text/20' : ''}`}>
                                    <HiOutlineBell className={`text-lg md:text-xl ${isNotifOpen ? 'text-primary' : 'text-app-text'}`} />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-app-bg animate-pulse"></span>
                                    )}
                                </button>
                                {isNotifOpen && (
                                    <div className={`absolute top-12 right-0 w-72 md:w-80 border rounded-2xl shadow-2xl overflow-hidden z-60 
                                        ${theme === 'dark' ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'}`}
                                    >
                                        <div className={`px-4 py-3 border-b flex items-center justify-between 
                                            ${theme === 'dark' ? 'bg-white/5 border-neutral-800' : 'bg-neutral-100 border-neutral-200'}`}
                                        >
                                            <p className={`text-[10px] uppercase tracking-[0.2em] font-black 
                                                ${theme === 'dark' ? 'text-neutral-400' : 'text-neutral-500'}`}>
                                                {t("navBar.notifications.title")}
                                            </p>
                                            {unreadCount > 0 && (
                                                <button
                                                    onClick={markAllAsRead}
                                                    className="text-[10px] uppercase font-bold text-primary hover:underline cursor-pointer"
                                                >
                                                    {t("navBar.notifications.markAllRead")}
                                                </button>
                                            )}
                                        </div>
                                        <div className="max-h-80 overflow-y-auto">
                                            {notifications.length > 0 ? notifications.map((n) => (
                                                <div
                                                    key={n.id}
                                                    onClick={() => markAsRead(n.id)}
                                                    className={`px-4 py-4 border-b cursor-pointer flex gap-3 transition-colors 
                                                        ${theme === 'dark' ? 'border-neutral-800 hover:bg-neutral-800/50' : 'border-neutral-100 hover:bg-neutral-50'}
                                                        ${n.isRead ? 'opacity-60' : ''}`}
                                                >
                                                    <div className="mt-0.5">
                                                        {getNotificationIcon(n.type)}
                                                    </div>
                                                    <div>
                                                        <p className={`text-xs ${theme === 'dark' ? 'text-neutral-200' : 'text-neutral-800'}`}>
                                                            {n.message}
                                                        </p>
                                                        <p className={`text-[10px] mt-1 uppercase opacity-60 
                                                                ${theme === 'dark' ? 'text-neutral-400' : 'text-neutral-500'}`}>
                                                            {n.timestamp}
                                                        </p>
                                                    </div>
                                                </div>
                                            )) : (
                                                <p className={`p-4 text-center text-xs opacity-50 
                                                        ${theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'}`}>
                                                    {t("navBar.notifications.empty")}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); }}
                                    className={`
                                        flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full transition-all duration-300 ease-in-out cursor-pointer active:scale-95 group overflow-hidden border
                                        bg-app-card
                                        ${isProfileOpen ? 'border-primary shadow-lg shadow-primary/10' : 'border-app-border hover:border-app-text/30'}
                                    `}
                                >
                                    {user?.avatar ? (
                                        <img
                                            src={user.avatar.startsWith('data:image') ? user.avatar : `data:image/png;base64,${user.avatar}`}
                                            alt="Profil"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <HiOutlineUser className="text-lg md:text-xl text-app-text opacity-50" />
                                    )}
                                </button>
                                {isProfileOpen && (
                                    <div className="absolute top-12 right-0 w-56 md:w-64 bg-app-card border border-app-border rounded-2xl shadow-2xl py-3 animate-in fade-in zoom-in-95 duration-150 z-60">
                                        <div className="px-4 py-3 border-b border-app-border mb-2 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full border border-app-border overflow-hidden bg-app-bg shrink-0">
                                                {user?.avatar ? (
                                                    <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <HiOutlineUser className="text-app-text opacity-30 text-lg" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-[10px] uppercase tracking-widest opacity-50 font-bold leading-none mb-1 text-app-text">{t("navBar.profile.connected")}</p>
                                                <p className="text-xs md:text-sm text-app-text font-bold truncate">
                                                    {user?.display_name || user?.username || user?.email}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setIsFriendsOpen(true);
                                                setIsProfileOpen(false);
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-app-text/70 hover:text-app-text hover:bg-app-text/5 transition-colors text-left cursor-pointer outline-none"
                                        >
                                            <HiOutlineUserGroup className="text-lg" /> {t("friendsModal.title")}
                                        </button>
                                        <button
                                            onClick={() => { setIsSettingsOpen(true); setIsProfileOpen(false); }}
                                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-app-text/70 hover:text-app-text hover:bg-app-text/5 transition-colors text-left cursor-pointer outline-none"
                                        >
                                            <HiOutlineCog className="text-lg" /> {t("navBar.profile.settings")}
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-primary hover:bg-primary/10 transition-colors text-left cursor-pointer outline-none font-bold"
                                        >
                                            <HiOutlineLogout className="text-lg" /> {t("navBar.profile.logout")}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-2 md:gap-4">
                            <Link
                                to="/login"
                                className="group flex items-center justify-center h-9 md:h-10 px-4 rounded-full border border-app-border hover:border-app-text/30 transition-all duration-300 active:scale-95"
                            >
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
                                    {t("navBar.auth.login")}
                                </span>
                            </Link>

                            <Link
                                to="/register"
                                className="group flex items-center justify-center h-9 md:h-10 px-4 md:px-6 rounded-full bg-primary hover:bg-primary-hover transition-all duration-300 active:scale-95 shadow-lg shadow-primary/20"
                            >
                                <HiOutlineUserAdd className="text-white text-lg md:hidden" />
                                <span className="hidden md:block text-[10px] font-black uppercase tracking-widest text-white">
                                    {t("navBar.auth.register")}
                                </span>
                            </Link>
                        </div>
                    )}
                </div>
            </nav>

            {user && (<SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} user={user}/>)}

            <FriendsModal isOpen={isFriendsOpen} onClose={() => setIsFriendsOpen(false)} />

            <div className={`fixed inset-0 z-100 flex items-center transition-all duration-400 md:duration-700 ${isMenuOpen ? "visible opacity-100" : "invisible opacity-0"}`}>
                <div className={`absolute inset-0 bg-app-bg/98 backdrop-blur-3xl transition-opacity duration-400 md:duration-700 cursor-pointer ${isMenuOpen ? "opacity-100" : "opacity-0"}`} onClick={() => setIsMenuOpen(false)} />
                <button onClick={() => setIsMenuOpen(false)} className="absolute top-6 left-6 md:top-12 md:left-12 group flex items-center gap-4 z-120 cursor-pointer outline-none">
                    <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full border border-app-border group-hover:border-app-text transition-all duration-300 group-hover:rotate-90">
                        <HiOutlineX className="text-app-text text-lg md:text-xl" />
                    </div>
                </button>
                <div className="relative z-110 w-full max-w-7xl px-8 md:px-24">
                    <nav className="flex flex-col items-start space-y-4 md:space-y-6">
                        {menuLinks.map((link, index) => (
                            (!link.authRequired || isConnected) && (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsMenuOpen(false)}
                                    style={{
                                        transitionDelay: isMenuOpen ? `${window.innerWidth < 768 ? index * 50 : index * 100}ms` : '0ms',
                                        transform: isMenuOpen ? 'translateY(0)' : 'translateY(20px)',
                                        opacity: isMenuOpen ? 1 : 0
                                    }}
                                    className="group relative flex items-center transition-all duration-300 md:duration-700 ease-out cursor-pointer"
                                >
                                    <span className="text-primary font-black text-xl md:text-4xl mr-4 md:mr-6 opacity-0 group-hover:opacity-100 -translate-x-6 group-hover:translate-x-0 transition-all duration-300">/</span>
                                    <h2 className="text-4xl md:text-8xl font-black uppercase tracking-tighter text-app-text group-hover:text-primary group-hover:italic transition-all duration-200">
                                        {link.label}
                                    </h2>
                                </Link>
                            )
                        ))}
                    </nav>
                </div>
            </div>
        </>
    );
};

export default NavBar;