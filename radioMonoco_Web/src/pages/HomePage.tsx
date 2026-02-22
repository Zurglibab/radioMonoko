import { useState, useEffect, useCallback } from "react";
import logo from "../assets/images/icon_large.png";

import LiveRadios from "../components/homepage/LiveRadios";
import Categories from "../components/homepage/Categories";
import TopMusics from "../components/homepage/TopMusics";
import PodCasts from "../components/homepage/PodCasts";
import Footer from "../components/utils/Footer";

const HomePage = () => {
    const [isScrolled, setIsScrolled] = useState(false);

    const handleScroll = useCallback(() => {
        setIsScrolled(window.scrollY > 250);
    }, []);

    useEffect(() => {
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [handleScroll]);

    return (
        <div className="relative min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-white/20 overflow-x-hidden">

            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.15]"
                     style={{ backgroundImage: `radial-gradient(#ffffff 0.5px, transparent 0.5px)`, backgroundSize: '24px 24px' }}>
                </div>
                <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px]"></div>
                <div className="absolute top-[40%] right-[-10%] w-[400px] h-[400px] bg-white/[0.03] rounded-full blur-[100px]"></div>
                <svg className="absolute inset-0 w-full h-full opacity-[0.03] contrast-150">
                    <filter id="noise">
                        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
                    </filter>
                    <rect width="100%" height="100%" filter="url(#noise)" />
                </svg>
            </div>

            <div className="relative z-10">
                <header className={`absolute top-40 left-0 right-0 z-50 flex flex-col items-center transition-all duration-700 pointer-events-none ${
                    isScrolled ? "opacity-0 -translate-y-10 blur-sm" : "opacity-100 translate-y-0"
                }`}>
                    <img
                        src={logo}
                        alt="RadioMonoco Logo"
                        className="w-[280px] md:w-[380px] h-auto object-contain drop-shadow-[0_10px_40px_rgba(0,0,0,0.8)]"
                    />
                </header>

                <main>
                    <LiveRadios />

                    <div className="container mx-auto px-6 space-y-24 md:space-y-32 py-24 md:py-32">
                        <Categories />
                        <TopMusics />
                        <PodCasts />
                    </div>
                </main>

                <Footer />
            </div>
        </div>
    );
};

export default HomePage;