import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logoSmall from "../../assets/images/icon_small.png";

const NavBar = () => {
    const [showLogo, setShowLogo] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setShowLogo(window.scrollY > 150);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const LinkStyle =
        "text-sm font-semibold text-white transition duration-300 relative after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1px] after:bg-white after:transition-all after:duration-300 hover:text-white hover:after:w-full";

    return (
        <nav className="fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-6 lg:px-12 bg-neutral-900/40 backdrop-blur-xl border-b border-white/10 z-50">

            <div className="flex items-center gap-8">
                <Link to="/search" className={LinkStyle}>Search</Link>
                <Link to="/feed" className={LinkStyle}>Feed</Link>
                <Link to="/collection" className={LinkStyle}>Collection</Link>
            </div>

            <div
                className={`absolute left-1/2 -translate-x-1/2 transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) ${
                    showLogo
                        ? "opacity-100 scale-100 blur-0 translate-y-0"
                        : "opacity-0 scale-50 blur-md -translate-y-4 pointer-events-none"
                }`}
            >
                <Link to="/" className="block hover:scale-110 transition-transform duration-300">
                    <img src={logoSmall} alt="Logo" className="h-9 w-auto object-contain" />
                </Link>
            </div>

            <div className="flex items-center gap-4">
                <Link
                    to="/login"
                    className="px-5 py-2 text-sm font-medium text-white hover:text-black transition-colors border-white border hover:bg-white"
                >
                    Login
                </Link>
                <Link
                    to="/register"
                    className="px-5 py-2 text-sm font-medium border-white bg-white text-black hover:bg-neutral-200 transition-all duration-300"
                >
                    Register
                </Link>
            </div>
        </nav>
    );
};

export default NavBar;