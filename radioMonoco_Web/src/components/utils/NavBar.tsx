import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logoSmall from "../../assets/images/icon_small.png";
import {
    HiOutlineBell,
    HiOutlineUserCircle,
    HiOutlineCog,
    HiOutlineLogout,
    HiOutlineHeart,
    HiOutlineUserAdd,
    HiOutlineMenu,
    HiOutlineX,
    HiOutlineSearch,
    HiOutlineLogin
} from "react-icons/hi";
import { useAuth } from "../../context/AuthContext";

const NavBar = () => {
    const [isPastThreshold, setIsPastThreshold] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const { user, logout } = useAuth();
    const isConnected = !!user;
    const navigate = useNavigate();
    const location = useLocation();

    const dropdownRef = useRef<HTMLDivElement>(null);
    const notifRef = useRef<HTMLDivElement>(null);

    const isHomePage = location.pathname === "/";
    const showLogo = !isHomePage || isPastThreshold;

    useEffect(() => {
        if (!isHomePage) return;
        const handleScroll = () => setIsPastThreshold(window.scrollY > 250);
        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [isHomePage]);

    useEffect(() => {
        document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';
    }, [isMenuOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsProfileOpen(false);
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) setIsNotifOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        setIsProfileOpen(false);
        setIsMenuOpen(false);
        navigate("/");
    };

    const IconCircleStyle = "flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full transition-all duration-300 cursor-pointer active:scale-90";

    const menuLinks = [
        { label: "Accueil", path: "/" },
        { label: "Fil d'actualité", path: "/feed", authRequired: true },
        { label: "Paramètres", path: "/settings", authRequired: true },
    ];

    const notifications = [
        { id: 1, text: 'Lucas a aimé votre critique', time: 'il y a 2m', icon: <HiOutlineHeart className="text-rose-500" /> },
        { id: 2, text: 'Sarah s\'est abonnée', time: 'il y a 1h', icon: <HiOutlineUserAdd className="text-blue-500" /> },
    ];

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 h-14 md:h-16 flex items-center justify-between px-4 md:px-12 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 z-50">
                <div className="flex items-center gap-1 md:gap-2">
                    <button onClick={() => setIsMenuOpen(true)} className={IconCircleStyle}>
                        <HiOutlineMenu className="text-lg md:text-xl text-white transition-transform hover:scale-110" />
                    </button>
                    {isConnected && (
                        <button className={IconCircleStyle}>
                            <HiOutlineSearch className="text-lg md:text-xl text-white transition-transform hover:scale-110"/>
                        </button>
                    )}
                </div>

                {/* Animation logo accélérée (duration-400) */}
                <div className={`absolute left-1/2 -translate-x-1/2 transition-all duration-400 md:duration-700 ease-in-out ${showLogo ? "opacity-100 scale-100" : "opacity-0 scale-50 pointer-events-none"}`}>
                    <Link to="/">
                        <img src={logoSmall} alt="Logo" className="h-6 md:h-8 w-auto brightness-200" />
                    </Link>
                </div>

                <div className="flex items-center gap-1 md:gap-2">
                    {isConnected ? (
                        <div className="flex items-center gap-1 md:gap-2">
                            <div className="relative" ref={notifRef}>
                                <button onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); }} className={`${IconCircleStyle} ${isNotifOpen ? 'bg-white/10' : ''}`}>
                                    <HiOutlineBell className={`text-lg md:text-xl ${isNotifOpen ? 'text-rose-500' : 'text-white'}`} />
                                    <span className="absolute top-2 right-2 md:top-2.5 md:right-2.5 w-1.5 h-1.5 md:w-2 md:h-2 bg-rose-600 rounded-full border-2 border-[#0a0a0a] animate-pulse"></span>
                                </button>
                                {isNotifOpen && (
                                    <div className="absolute top-12 right-0 w-72 md:w-80 bg-[#111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 z-[60]">
                                        <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                                            <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-black">Notifications</p>
                                        </div>
                                        <div className="max-h-80 overflow-y-auto">
                                            {notifications.map((n) => (
                                                <div key={n.id} className="px-4 py-4 border-b border-white/5 hover:bg-white/[0.03] transition-colors cursor-pointer flex gap-3">
                                                    <div className="text-xl mt-0.5">{n.icon}</div>
                                                    <div>
                                                        <p className="text-xs text-neutral-200 leading-tight">{n.text}</p>
                                                        <p className="text-[10px] text-neutral-600 mt-1 font-medium uppercase tracking-tighter">{n.time}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="relative" ref={dropdownRef}>
                                <button onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); }} className={`${IconCircleStyle} ${isProfileOpen ? 'bg-white/10' : ''}`}>
                                    <HiOutlineUserCircle className={`text-lg md:text-xl ${isProfileOpen ? 'text-rose-500' : 'text-white'}`} />
                                </button>
                                {isProfileOpen && (
                                    <div className="absolute top-12 right-0 w-56 md:w-64 bg-[#111] border border-white/10 rounded-2xl shadow-2xl py-3 animate-in fade-in zoom-in-95 duration-150 z-[60]">
                                        <div className="px-4 py-3 border-b border-white/5 mb-2">
                                            <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Connecté</p>
                                            <p className="text-xs md:text-sm text-white font-bold truncate">{user?.email || "Utilisateur"}</p>
                                        </div>
                                        <Link to="/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-300 hover:bg-white/5 transition-colors">
                                            <HiOutlineCog className="text-lg" /> Paramètres
                                        </Link>
                                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-rose-500 hover:bg-rose-500/10 transition-colors text-left">
                                            <HiOutlineLogout className="text-lg" /> Déconnexion
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link to="/login" className={`group ${IconCircleStyle} hover:bg-white/10 border border-white/10 bg-white/5 md:w-auto md:px-5`}>
                                <HiOutlineLogin className="text-lg text-white/70 group-hover:text-white md:hidden" />
                                <span className="hidden md:block text-[10px] font-black uppercase tracking-widest text-white/70 group-hover:text-white">Se connecter</span>
                            </Link>
                            <Link to="/register" className={`group ${IconCircleStyle} bg-rose-600 md:w-auto md:px-5 shadow-lg hover:bg-white`}>
                                <HiOutlineUserAdd className="text-lg text-white group-hover:text-black md:hidden" />
                                <span className="hidden md:block text-[10px] font-black uppercase tracking-widest text-white group-hover:text-black">S'inscrire</span>
                            </Link>
                        </div>
                    )}
                </div>
            </nav>

            {/* Menu plein écran : Transition réduite à 400ms pour plus de nervosité */}
            <div className={`fixed inset-0 z-[100] flex items-center transition-all duration-400 md:duration-700 ${isMenuOpen ? "visible opacity-100" : "invisible opacity-0"}`}>
                <div className={`absolute inset-0 bg-[#050505]/98 backdrop-blur-3xl transition-opacity duration-400 md:duration-700 ${isMenuOpen ? "opacity-100" : "opacity-0"}`} onClick={() => setIsMenuOpen(false)} />
                <button onClick={() => setIsMenuOpen(false)} className="absolute top-6 left-6 md:top-12 md:left-12 group flex items-center gap-4 z-[120]">
                    <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full border border-white/10 group-hover:border-white/40 transition-all duration-300 group-hover:rotate-90">
                        <HiOutlineX className="text-white text-lg md:text-xl" />
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
                                        // Délai réduit sur mobile (50ms au lieu de 100ms)
                                        transitionDelay: isMenuOpen ? `${window.innerWidth < 768 ? index * 50 : index * 100}ms` : '0ms',
                                        transform: isMenuOpen ? 'translateY(0)' : 'translateY(20px)',
                                        opacity: isMenuOpen ? 1 : 0
                                    }}
                                    className="group relative flex items-center transition-all duration-300 md:duration-700 ease-out"
                                >
                                    <span className="text-rose-600 font-black text-xl md:text-4xl mr-4 md:mr-6 opacity-0 group-hover:opacity-100 -translate-x-6 group-hover:translate-x-0 transition-all duration-300">/</span>
                                    <h2 className="text-4xl md:text-8xl font-black uppercase tracking-tighter text-white group-hover:text-rose-600 group-hover:italic transition-all duration-200">
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