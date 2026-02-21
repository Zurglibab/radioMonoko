import { useState, useEffect, useCallback } from "react";
import logo from "../assets/images/icon_large.png";

import LiveRadios from "../components/HomePage/LiveRadios";
import Categories from "../components/HomePage/Categories";
import TopMusics from "../components/HomePage/TopMusics";
import PodCasts from "../components/HomePage/PodCasts";
import Footer from "../components/utils/Footer";

const HomePage = () => {
    const [isScrolled, setIsScrolled] = useState(false);

    const handleScroll = useCallback(() => {
        setIsScrolled(window.scrollY > 150);
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
                <div className="absolute bottom-[10%] left-[20%] w-[300px] h-[300px] bg-white/[0.02] rounded-full blur-[80px]"></div>

                <svg className="absolute inset-0 w-full h-full opacity-[0.03] contrast-150">
                    <filter id="noise">
                        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
                    </filter>
                    <rect width="100%" height="100%" filter="url(#noise)" />
                </svg>
            </div>

            <div className="relative z-10">
                <header className="relative flex flex-col items-center pt-24 pb-20 overflow-hidden">
                    <div
                        className={`flex flex-col items-center transition-all duration-700 ease-out ${
                            isScrolled ? "opacity-0 scale-95 blur-sm translate-y-[-20px]" : "opacity-100 scale-100 blur-0 translate-y-0"
                        }`}
                    >
                        <img
                            src={logo}
                            alt="RadioMonoco Logo"
                            className="w-[320px] md:w-[400px] h-auto object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                        />
                        <p className="mt-6 text-neutral-500 uppercase tracking-[0.4em] text-[10px] md:text-[11px] font-black">
                            L'annuaire des ondes numériques
                        </p>
                    </div>
                </header>

                <main className="space-y-24 md:space-y-32 pb-24">
                    <LiveRadios />
                    <div className="container mx-auto">
                        <Categories />
                    </div>
                    <TopMusics />
                    <div className="container mx-auto">
                        <PodCasts />
                    </div>
                </main>

                <Footer />
            </div>
        </div>
    );
};

export default HomePage;