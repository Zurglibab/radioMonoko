import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import logoSmall from "../../assets/images/icon_small.png";
import { HiOutlineBell, HiOutlineUserCircle, HiOutlineChatBubbleLeft } from "react-icons/hi2";
import { HiOutlineCog, HiOutlineLogout, HiOutlineHeart, HiOutlineUserAdd } from "react-icons/hi";
import { useAuth } from "../../context/AuthContext";

interface NavBarProps {
    isConnected: boolean;
}

const NavBar = ({ isConnected }: NavBarProps) => {
    const [showLogo, setShowLogo] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const dropdownRef = useRef<HTMLDivElement>(null);
    const notifRef = useRef<HTMLDivElement>(null);

    const notifications = [
        { id: 1, type: 'like', text: 'Lucas a aimé votre critique sur "Interstellar"', time: 'il y a 2m', icon: <HiOutlineHeart className="text-rose-500" /> },
        { id: 2, type: 'follow', text: 'Sarah s\'est abonnée à votre profil', time: 'il y a 1h', icon: <HiOutlineUserAdd className="text-blue-500" /> },
        { id: 3, type: 'comment', text: 'Nouveau commentaire sur votre liste "Jazz Classics"', time: 'il y a 3h', icon: <HiOutlineChatBubbleLeft className="text-emerald-500" /> },
    ];

    useEffect(() => {
        const handleScroll = () => setShowLogo(window.scrollY > 150);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setIsNotifOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        setIsProfileOpen(false);
        navigate("/");
    };

    const LinkStyle = "text-sm font-semibold text-white transition duration-300 relative after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1px] after:bg-rose-500 after:transition-all after:duration-300 hover:text-white hover:after:w-full uppercase tracking-widest text-[11px]";
    const IconCircleStyle = "relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 hover:bg-white/10 group cursor-pointer border border-transparent active:scale-95";

    return (
        <nav className="fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-6 lg:px-12 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 z-50">

            <div className="flex items-center gap-8">
                {isConnected ? (
                    <>
                        <Link to="/search" className={LinkStyle}>Search</Link>
                        <Link to="/feed" className={LinkStyle}>Feed</Link>
                    </>
                ) : (
                    <>
                        <span className="text-sm font-semibold text-white uppercase tracking-widest text-[11px] opacity-30 cursor-not-allowed">Search</span>
                        <span className="text-sm font-semibold text-white uppercase tracking-widest text-[11px] opacity-30 cursor-not-allowed">Feed</span>
                    </>
                )}
            </div>

            <div className={`absolute left-1/2 -translate-x-1/2 transition-all duration-500 ${showLogo ? "opacity-100 scale-100" : "opacity-0 scale-50 pointer-events-none"}`}>
                <Link to="/">
                    <img src={logoSmall} alt="Logo" className="h-8 w-auto brightness-200" />
                </Link>
            </div>

            <div className="flex items-center gap-3">
                {isConnected ? (
                    <div className="flex items-center gap-2">

                        <div className="relative" ref={notifRef}>
                            <button
                                onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); }}
                                className={`${IconCircleStyle} ${isNotifOpen ? 'bg-white/10' : ''}`}
                            >
                                <HiOutlineBell className={`text-xl transition-colors ${isNotifOpen ? 'text-rose-500' : 'text-white'}`} />
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
                            <button
                                onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); }}
                                className={`${IconCircleStyle} ${isProfileOpen ? 'bg-white/10' : ''}`}
                            >
                                <HiOutlineUserCircle className={`text-xl transition-colors ${isProfileOpen ? 'text-rose-500' : 'text-white'}`} />
                            </button>

                            {isProfileOpen && (
                                <div className="absolute top-12 right-0 w-64 bg-[#111] border border-white/10 rounded-2xl shadow-2xl py-3 animate-in fade-in zoom-in-95 duration-200 z-[60]">
                                    <div className="px-4 py-3 border-b border-white/5 mb-2">
                                        <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Connecté en tant que</p>
                                        <p className="text-white font-bold truncate">{user?.name || "Utilisateur"}</p>
                                        <p className="text-neutral-400 text-xs truncate">{user?.email}</p>
                                    </div>
                                    <Link to="/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-300 hover:bg-white/5 hover:text-white transition-colors">
                                        <HiOutlineCog className="text-lg" /> Paramètres
                                    </Link>
                                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-rose-500 hover:bg-rose-500/10 transition-colors">
                                        <HiOutlineLogout className="text-lg" /> Déconnexion
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-4">
                        <Link to="/login" className="px-4 py-1.5 text-[10px] uppercase tracking-widest font-bold border border-white text-white hover:bg-white hover:text-black transition-all rounded-sm">Login</Link>
                        <Link to="/register" className="px-4 py-1.5 text-[10px] uppercase tracking-widest font-bold bg-rose-600 text-white hover:bg-white hover:text-black transition-all rounded-sm">Register</Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default NavBar;