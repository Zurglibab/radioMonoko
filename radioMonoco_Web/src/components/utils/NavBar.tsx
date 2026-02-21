import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import logoSmall from "../../assets/images/icon_small.png";
import { HiOutlineBell, HiOutlineUserCircle } from "react-icons/hi2";
import { HiOutlineCog, HiOutlineLogout, HiOutlineHeart, HiOutlineUserAdd, HiOutlineMenu, HiOutlineX, HiOutlineSearch } from "react-icons/hi";
import { useAuth } from "../../context/AuthContext";

interface NavBarProps {
    isConnected: boolean;
}

const NavBar = ({ isConnected }: NavBarProps) => {
    const [showLogo, setShowLogo] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const dropdownRef = useRef<HTMLDivElement>(null);
    const notifRef = useRef<HTMLDivElement>(null);

    const notifications = [
        { id: 1, text: 'Lucas a aimé votre critique', time: 'il y a 2m', icon: <HiOutlineHeart className="text-rose-500" /> },
        { id: 2, text: 'Sarah s\'est abonnée', time: 'il y a 1h', icon: <HiOutlineUserAdd className="text-blue-500" /> },
    ];

    useEffect(() => {
        const handleScroll = () => setShowLogo(window.scrollY > 250);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

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

    const IconCircleStyle = "relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 hover:bg-white/10 cursor-pointer active:scale-95";

    const menuLinks = [
        { label: "Accueil", path: "/" },
        { label: "Fil d'actualité", path: "/feed", authRequired: true },
        { label: "Paramètres", path: "/settings", authRequired: true },
    ];

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-6 lg:px-12 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 z-50">
                <div className={"flex items-center gap-3"}>
                    <button
                        onClick={() => setIsMenuOpen(true)}
                        className="flex items-center gap-3 group"
                    >
                        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 group-hover:bg-rose-600 transition-all duration-300 cursor-pointer">
                            <HiOutlineMenu className="text-xl text-white transition-transform group-hover:scale-110" />
                        </div>
                    </button>

                    {isConnected &&
                        <button
                            className="flex items-center gap-3 group"
                        >
                            <div
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 group-hover:bg-rose-600 transition-all duration-300 cursor-pointer">
                                <HiOutlineSearch className="text-xl text-white transition-transform group-hover:scale-110"/>
                            </div>
                        </button>
                    }
                </div>



                <div className={`absolute left-1/2 -translate-x-1/2 transition-all duration-700 ease-in-out ${showLogo ? "opacity-100 scale-100" : "opacity-0 scale-50 pointer-events-none"}`}>
                    <Link to="/">
                        <img src={logoSmall} alt="Logo" className="h-8 w-auto brightness-200" />
                    </Link>
                </div>

                <div className="flex items-center gap-3">
                    {isConnected ? (
                        <div className="flex items-center gap-2">
                            <div className="relative" ref={notifRef}>
                                <button onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); }} className={`${IconCircleStyle} ${isNotifOpen ? 'bg-white/10' : ''}`}>
                                    <HiOutlineBell className={`text-xl ${isNotifOpen ? 'text-rose-500' : 'text-white'}`} />
                                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-600 rounded-full border-2 border-[#0a0a0a] animate-pulse"></span>
                                </button>
                                {isNotifOpen && (
                                    <div className="absolute top-12 right-0 w-80 bg-[#111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-[60]">
                                        <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                                            <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-black">Notifications</p>
                                        </div>
                                        <div className="max-h-96 overflow-y-auto">
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
                                        <button className="w-full py-3 text-[10px] uppercase tracking-widest text-neutral-500 hover:text-white hover:bg-white/5 transition-all font-bold">
                                            Tout marquer comme lu
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="relative" ref={dropdownRef}>
                                <button onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); }} className={`${IconCircleStyle} ${isProfileOpen ? 'bg-white/10' : ''}`}>
                                    <HiOutlineUserCircle className={`text-xl ${isProfileOpen ? 'text-rose-500' : 'text-white'}`} />
                                </button>
                                {isProfileOpen && (
                                    <div className="absolute top-12 right-0 w-64 bg-[#111] border border-white/10 rounded-2xl shadow-2xl py-3 animate-in fade-in zoom-in-95 duration-200 z-[60]">
                                        <div className="px-4 py-3 border-b border-white/5 mb-2">
                                            <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Connecté</p>
                                            <p className="text-white font-bold truncate">{user?.name || "Utilisateur"}</p>
                                        </div>
                                        <Link to="/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-300 hover:bg-white/5 hover:text-white transition-colors">
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
                        <div className="flex items-center gap-3">
                            <Link
                                to="/login"
                                className="px-6 py-2 text-[10px] font-black text-white/70 hover:text-white border border-white/10 hover:border-white/40 bg-white/5 hover:bg-white/10 transition-all duration-300 rounded-full"
                            >
                                Se connecter
                            </Link>
                            <Link
                                to="/register"
                                className="px-6 py-2 text-[10px] font-black text-white bg-rose-600  border border-white/10 hover:border-white  hover:bg-white hover:text-neutral-950 transition-all duration-300 rounded-full"
                            >
                                S'inscrire
                            </Link>
                        </div>
                    )}
                </div>
            </nav>

            <div className={`fixed inset-0 z-[100] flex items-center transition-all duration-700 ${isMenuOpen ? "visible opacity-100" : "invisible opacity-0"}`}>
                <div
                    className={`absolute inset-0 bg-[#050505]/98 backdrop-blur-3xl transition-opacity duration-700 ${isMenuOpen ? "opacity-100" : "opacity-0"}`}
                    onClick={() => setIsMenuOpen(false)}
                />

                <button
                    onClick={() => setIsMenuOpen(false)}
                    className="absolute top-8 left-8 md:top-12 md:left-12 group flex items-center gap-4 z-[120] cursor-pointer"
                >
                    <div className="w-12 h-12 flex items-center justify-center rounded-full border border-white/10 group-hover:border-white/40 transition-all duration-500 group-hover:rotate-90">
                        <HiOutlineX className="text-white text-xl" />
                    </div>
                </button>

                <div className="relative z-[110] w-full max-w-7xl px-12 md:px-24">
                    <nav className="flex flex-col items-start space-y-4 md:space-y-6">
                        {menuLinks.map((link, index) => (
                            (!link.authRequired || isConnected) && (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsMenuOpen(false)}
                                    style={{
                                        transitionDelay: isMenuOpen ? `${index * 100}ms` : '0ms',
                                        transform: isMenuOpen ? 'translateY(0)' : 'translateY(40px)',
                                        opacity: isMenuOpen ? 1 : 0
                                    }}
                                    className="group relative flex items-center transition-all duration-700 ease-out"
                                >
                                    <span className="text-rose-600 font-black text-2xl md:text-4xl mr-6 opacity-0 group-hover:opacity-100 -translate-x-6 group-hover:translate-x-0 transition-all duration-300">/</span>
                                    <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter text-white group-hover:text-rose-600 group-hover:italic transition-all duration-300">
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