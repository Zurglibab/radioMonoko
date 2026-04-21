import { useState, useEffect, useCallback } from "react";
import logo from "../assets/images/icon_large.png";
import { useAppearance } from "../context/AppearanceContext";

import LiveRadios from "../components/homepage/LiveRadios";
import Footer from "../components/utils/Footer";

const HomePage = () => {
    const { theme } = useAppearance();
    const [isScrolled, setIsScrolled] = useState(false);

    const handleScroll = useCallback(() => {
        setIsScrolled(window.scrollY > 200);
    }, []);

    useEffect(() => {
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [handleScroll]);

    return (
        <div className="relative min-h-screen bg-app-bg text-app-text font-sans selection:bg-primary/20 overflow-x-hidden transition-colors duration-700">

            <div className="fixed inset-0 z-0 pointer-events-none">
                <div
                    className="absolute inset-0 opacity-[0.12] transition-opacity duration-700"
                    style={{
                        backgroundImage: theme === 'dark'
                            ? `radial-gradient(rgba(255,255,255,0.5) 0.5px, transparent 0.5px)`
                            : `radial-gradient(rgba(0,0,0,0.5) 0.5px, transparent 0.5px)`,
                        backgroundSize: '32px 32px'
                    }}
                />

                <div className={`absolute top-[-10%] left-[-5%] w-150 h-150 rounded-full blur-[140px] transition-all duration-1000 ${
                    theme === 'dark' ? 'bg-white/5 opacity-50' : 'bg-black/4 opacity-100'
                }`} />
                <div className={`absolute bottom-[-10%] right-[-10%] w-125 h-125 rounded-full blur-[120px] transition-all duration-1000 ${
                    theme === 'dark' ? 'bg-white/3 opacity-40' : 'bg-black/2 opacity-80'
                }`} />

                <svg className={`absolute inset-0 w-full h-full contrast-150 transition-opacity duration-700 ${
                    theme === 'dark' ? 'opacity-[0.04]' : 'opacity-[0.02]'
                }`}>
                    <filter id="noise">
                        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
                    </filter>
                    <rect width="100%" height="100%" filter="url(#noise)" />
                </svg>
            </div>

            <div className="relative z-10">

                <header className={`absolute top-32 md:top-40 left-0 right-0 z-50 flex flex-col items-center transition-all duration-1000 pointer-events-none ${
                    isScrolled
                        ? "opacity-0 -translate-y-16 blur-xl"
                        : "opacity-100 translate-y-0 blur-0"
                }`}>
                    <img
                        src={logo}
                        alt="RadioMonoco Logo"
                        className={`w-65 md:w-105 h-auto object-contain transition-all duration-700 will-change-transform ${
                            theme === 'dark'
                                ? 'drop-shadow-[0_20px_50px_rgba(0,0,0,0.9)] brightness-200'
                                : 'drop-shadow-[0_20px_50px_rgba(0,0,0,0.9)] brightness-200'
                        }`}
                    />
                </header>

                <main>
                    <LiveRadios />
                </main>

                <Footer />
            </div>
        </div>
    );
};

export default HomePage;