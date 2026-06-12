import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { FaArrowUp } from "react-icons/fa";
import Header from "../header/Header.tsx";
import GlobalPlayer from "./GlobalPlayer.tsx";
import { ChatManager } from "../chat/ChatManager.tsx";
import { useAuth } from "../../context/AuthContext.tsx";
import { useRadio } from "../../context/RadioContext";
import { useAppearance } from "../../context/AppearanceContext.tsx";

const Layout = () => {
    const [isVisible, setIsVisible] = useState(false);
    const { currentRadio } = useRadio();
    const { user } = useAuth();
    const { theme } = useAppearance();

    useEffect(() => {
        const toggleVisibility = () => {
            setIsVisible(window.scrollY > 300);
        };
        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="min-h-screen bg-app-bg text-app-text transition-colors duration-500 relative">
            <Header />

            <main className="w-full">
                <Outlet />
            </main>

            {user && <ChatManager currentUserId={user.id} />}

            <GlobalPlayer />

            <button
                onClick={scrollToTop}
                className={`
                    fixed right-6 z-50 flex items-center justify-center w-12 h-12 rounded-full shadow-xl transition-all duration-300 ease-in-out hover:scale-105 active:scale-95
                    ${theme === 'dark' ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-900 border border-neutral-200'}
                    hover:text-rose-500
                    bottom-20 ${currentRadio ? "md:bottom-40" : ""}
                    ${isVisible
                    ? "opacity-100 translate-y-0 pointer-events-auto cursor-pointer"
                    : "opacity-0 translate-y-10 pointer-events-none"
                }
                `}
                aria-label="Back to top"
            >
                <FaArrowUp size={16} className="transition-transform duration-300" />
            </button>
        </div>
    );
};

export default Layout;