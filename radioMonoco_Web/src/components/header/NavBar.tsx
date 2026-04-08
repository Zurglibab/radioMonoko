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
} from "react-icons/hi";
import { useAuth } from "../../context/AuthContext";
import { SettingsModal } from "./SettingsModal";

const NavBar = () => {
    const { user, logout } = useAuth();
    const isConnected = !!user;
    const navigate = useNavigate();
    const location = useLocation();

    const isHomePage = location.pathname === "/";

    const [isPastThreshold, setIsPastThreshold] = useState(!isHomePage);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const dropdownRef = useRef<HTMLDivElement>(null);
    const notifRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const showLogo = !isHomePage || isPastThreshold;

    const menuLinks = [
        { path: "/", label: "Accueil", authRequired: false },
        { path: "/feed", label: "Fil d'actualité", authRequired: true },
    ];

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
            if (dropdownRef.current && !dropdownRef.current.contains(target)) setIsProfileOpen(false);
            if (notifRef.current && !notifRef.current.contains(target)) setIsNotifOpen(false);

            if (isSearchOpen && searchInputRef.current && !searchInputRef.current.contains(target)) {
                if (searchQuery === "") setIsSearchOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isSearchOpen, searchQuery]);

    const handleLogout = async () => {
        logout();
        setIsProfileOpen(false);
        setIsMenuOpen(false);
        navigate("/");
    };

    const IconCircleStyle = "flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full transition-all duration-300 cursor-pointer active:scale-95 hover:bg-app-text/10 group";

    const notifications = [
        { id: 1, text: 'Lucas a aimé votre critique', time: 'il y a 2m', icon: <HiOutlineHeart className="text-rose-500" /> },
        { id: 2, text: 'Sarah s\'est abonnée', time: 'il y a 1h', icon: <HiOutlineUserAdd className="text-blue-500" /> },
    ];

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 h-14 md:h-16 flex items-center justify-between px-4 md:px-12 bg-app-bg/80 backdrop-blur-xl border-b border-app-border z-50 transition-colors duration-500">

                <div className="flex items-center gap-3">
                    <button onClick={() => setIsMenuOpen(true)} className={`${IconCircleStyle}`}>
                        <HiOutlineMenu className="text-lg md:text-xl text-app-text cursor-pointer" />
                    </button>

                    {isConnected && (
                        <div
                            className={`
                                relative flex items-center h-9 md:h-10 rounded-full transition-all 
                                duration-500 cubic-bezier(0.4, 0, 0.2, 1)
                                ${isSearchOpen
                                ? 'bg-app-text/10 px-3 w-40 md:w-72 border border-app-border shadow-lg'
                                : 'w-10 bg-transparent border-transparent'}
                            `}
                        >
                            <button
                                onClick={() => {
                                    if(isSearchOpen) setSearchQuery("");
                                    setIsSearchOpen(!isSearchOpen);
                                }}
                                className={`
                                    ${IconCircleStyle} !w-9 !h-9 md:!w-10 md:!h-10 absolute left-0
                                    transition-all duration-500 z-10
                                    ${isSearchOpen ? 'text-primary rotate-90 scale-110 hover:bg-transparent' : 'text-app-text rotate-0 scale-100'}
                                `}
                            >
                                {isSearchOpen ? <HiOutlineX className="text-lg" /> : <HiOutlineSearch className="text-lg md:text-xl" />}
                            </button>

                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="RECHERCHER..."
                                className={`
                                    ml-10 bg-transparent border-none outline-none text-app-text text-[10px] md:text-xs font-black 
                                    uppercase tracking-widest transition-all duration-500
                                    ${isSearchOpen
                                    ? 'opacity-100 translate-x-0 w-full visible'
                                    : 'opacity-0 -translate-x-4 w-0 invisible'}
                                `}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    )}
                </div>

                <div className={`absolute left-1/2 -translate-x-1/2 transition-all duration-400 md:duration-700 ease-in-out ${showLogo ? "opacity-100 scale-100" : "opacity-0 scale-50 pointer-events-none"}`}>
                    <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="cursor-pointer">
                        <img src={logoSmall} alt="Logo" className="h-6 md:h-8 w-auto brightness-200" />
                    </Link>
                </div>

                <div className="flex items-center gap-2 md:gap-3">
                    {isConnected ? (
                        <>
                            <div className="relative" ref={notifRef}>
                                <button onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); }} className={`${IconCircleStyle} ${isNotifOpen ? 'bg-app-text/20' : ''}`}>
                                    <HiOutlineBell className={`text-lg md:text-xl transition-colors cursor-pointer ${isNotifOpen ? 'text-primary' : 'text-app-text'}`} />
                                    <span className="absolute top-2 right-2 md:top-2.5 md:right-2.5 w-1.5 h-1.5 md:w-2 md:h-2 bg-primary rounded-full border-2 border-app-bg animate-pulse"></span>
                                </button>
                                {isNotifOpen && (
                                    <div className="absolute top-12 right-0 w-72 md:w-80 bg-app-card border border-app-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 z-[60]">
                                        <div className="px-4 py-3 border-b border-app-border bg-app-text/[0.02]">
                                            <p className="text-[10px] uppercase tracking-[0.2em] opacity-50 font-black">Notifications</p>
                                        </div>
                                        <div className="max-h-80 overflow-y-auto">
                                            {notifications.map((n) => (
                                                <div key={n.id} className="px-4 py-4 border-b border-app-border hover:bg-app-text/[0.03] transition-colors cursor-pointer flex gap-3">
                                                    <div className="text-xl mt-0.5">{n.icon}</div>
                                                    <div>
                                                        <p className="text-xs text-app-text leading-tight">{n.text}</p>
                                                        <p className="text-[10px] opacity-40 mt-1 font-medium uppercase tracking-tighter">{n.time}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); }}
                                    className={`
                                        flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full transition-all duration-300 ease-in-out cursor-pointer active:scale-95 group overflow-hidden border-2
                                        bg-app-card p-0.5
                                        ${isProfileOpen ? 'border-app-text/30' : 'border-app-border hover:border-app-text/30'}
                                    `}
                                >
                                    {user?.avatar ? (
                                        <img src={user.avatar} alt="Profil" className="w-full h-full object-cover rounded-full" />
                                    ) : (
                                        <HiOutlineUser className={`text-lg md:text-xl transition-all duration-300 ease-in-out text-white`} />
                                    )}
                                </button>
                                {isProfileOpen && (
                                    <div className="absolute top-12 right-0 w-56 md:w-64 bg-app-card border border-app-border rounded-2xl shadow-2xl py-3 animate-in fade-in zoom-in-95 duration-150 z-[60]">
                                        <div className="px-4 py-3 border-b border-app-border mb-2 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full border-2 border-app-border overflow-hidden bg-app-bg p-0.5 flex-shrink-0">
                                                {user?.avatar ? (
                                                    <img src={user.avatar} alt="" className="w-full h-full object-cover rounded-full" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center rounded-full">
                                                        <HiOutlineUser className="text-white text-lg" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-[10px] uppercase tracking-widest opacity-50 font-bold leading-none mb-1">Connecté</p>
                                                <p className="text-xs md:text-sm text-app-text font-bold truncate">
                                                    {user?.display_name || user?.username || user?.email}
                                                </p>
                                            </div>
                                        </div>
                                        <button onClick={() => { setIsSettingsOpen(true); setIsProfileOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm opacity-70 hover:opacity-100 hover:bg-app-text/5 transition-colors text-left cursor-pointer outline-none">
                                            <HiOutlineCog className="text-lg" /> Paramètres
                                        </button>
                                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-primary hover:bg-primary/10 transition-colors text-left cursor-pointer outline-none">
                                            <HiOutlineLogout className="text-lg" /> Déconnexion
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
                                    Connexion
                                </span>
                            </Link>

                            <Link
                                to="/register"
                                className="group flex items-center justify-center h-9 md:h-10 px-4 md:px-6 rounded-full bg-primary hover:bg-primary-hover transition-all duration-300 active:scale-95 shadow-lg shadow-primary/20"
                            >
                                <HiOutlineUserAdd className="text-white text-lg md:hidden" />
                                <span className="hidden md:block text-[10px] font-black uppercase tracking-widest text-white">
                                    S'inscrire
                                </span>
                            </Link>
                        </div>
                    )}
                </div>
            </nav>

            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} user={user} />

            <div className={`fixed inset-0 z-[100] flex items-center transition-all duration-400 md:duration-700 ${isMenuOpen ? "visible opacity-100" : "invisible opacity-0"}`}>
                <div className={`absolute inset-0 bg-app-bg/98 backdrop-blur-3xl transition-opacity duration-400 md:duration-700 cursor-pointer ${isMenuOpen ? "opacity-100" : "opacity-0"}`} onClick={() => setIsMenuOpen(false)} />
                <button onClick={() => setIsMenuOpen(false)} className="absolute top-6 left-6 md:top-12 md:left-12 group flex items-center gap-4 z-[120] cursor-pointer outline-none">
                    <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full border border-app-border group-hover:border-app-text transition-all duration-300 group-hover:rotate-90">
                        <HiOutlineX className="text-app-text text-lg md:text-xl" />
                    </div>
                </button>
                <div className="relative z-[110] w-full max-w-7xl px-8 md:px-24">
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