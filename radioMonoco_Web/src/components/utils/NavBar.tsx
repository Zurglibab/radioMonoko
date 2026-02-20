import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logoSmall from "../../assets/images/icon_small.png";
import { HiOutlineBell, HiOutlineUserCircle } from "react-icons/hi2";

interface NavBarProps {
    isConnected: boolean;
}

const NavBar = ({ isConnected }: NavBarProps) => {
    const [showLogo, setShowLogo] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setShowLogo(window.scrollY > 150);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const LinkStyle =
        "text-sm font-semibold text-white transition duration-300 relative after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1px] after:bg-rose-500 after:transition-all after:duration-300 hover:text-white hover:after:w-full uppercase tracking-widest text-[11px]";

    const IconCircleStyle =
        "relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 hover:bg-white/10 group cursor-pointer border border-transparent active:scale-95";

    return (
        <nav className="fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-6 lg:px-12 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 z-50">

            <div className="flex items-center gap-8">
                <Link to="/search" className={LinkStyle}>Search</Link>
                <Link to="/feed" className={LinkStyle}>Feed</Link>
                <Link to="/collection" className={LinkStyle}>Collection</Link>
            </div>

            <div
                className={`absolute left-1/2 -translate-x-1/2 transition-all duration-500 ${
                    showLogo
                        ? "opacity-100 scale-100 blur-0 translate-y-0"
                        : "opacity-0 scale-50 blur-md -translate-y-4 pointer-events-none"
                }`}
            >
                <Link to="/" className="block hover:scale-105 transition-transform duration-300">
                    <img src={logoSmall} alt="Logo" className="h-8 w-auto object-contain brightness-200" />
                </Link>
            </div>

            <div className="flex items-center gap-3">
                {isConnected ? (
                    <div className="flex items-center gap-2">
                        <button className={IconCircleStyle}>
                            <HiOutlineBell className="text-xl text-white  transition-colors" />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-600 rounded-full border-2 border-[#0a0a0a] animate-pulse"></span>
                        </button>

                        <Link to="/profile" className={IconCircleStyle}>
                            <HiOutlineUserCircle className="text-xl text-white transition-colors" />
                        </Link>
                    </div>
                ) : (
                    <div className="flex items-center gap-4">
                        <Link
                            to="/login"
                            className="text-[10px] uppercase tracking-widest font-bold text-white hover:text-rose-500 transition-colors"
                        >
                            Login
                        </Link>
                        <Link
                            to="/register"
                            className="px-4 py-1.5 text-[10px] uppercase tracking-widest font-bold border-rose-600 bg-rose-600 text-white hover:bg-transparent hover:border-white border transition-all duration-300 rounded-sm"
                        >
                            Register
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default NavBar;