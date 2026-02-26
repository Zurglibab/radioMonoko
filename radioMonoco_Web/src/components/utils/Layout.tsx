import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { FaArrowUp } from "react-icons/fa";
import Header from "./Header.tsx";
import GlobalPlayer from "../GlobalPlayer";
import { useRadio } from "../../context/RadioContext";

const Layout = () => {
    const [isVisible, setIsVisible] = useState(false);
    const { currentRadio } = useRadio();

    useEffect(() => {
        const toggleVisibility = () => {
            setIsVisible(window.scrollY > 300);
        };

        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <div className="min-h-screen bg-neutral-950 text-white relative">
            <Header />

            <main className="w-full">
                <Outlet />
            </main>

            <GlobalPlayer />

            <button
                onClick={scrollToTop}
                className={`
                    fixed right-8 p-4 z-50 rounded-full shadow-2xl transition-all duration-500 ease-in-out
                    bg-neutral-900 text-white border border-neutral-800
                    /* Ajustement dynamique de la hauteur si le player est présent */
                    ${currentRadio ? "bottom-36" : "bottom-8"}
                    ${isVisible
                    ? "opacity-100 translate-y-0 scale-100 cursor-pointer"
                    : "opacity-0 translate-y-10 scale-50 pointer-events-none"
                }
                    hover:bg-white hover:text-black hover:border-white
                    hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]
                    hover:-translate-y-2
                    active:scale-90
                `}
                aria-label="Back to top"
            >
                <FaArrowUp size={20} className="transition-transform duration-300 group-hover:scale-110" />
            </button>
        </div>
    );
};

export default Layout;