import { useState, useEffect } from "react";
import logo from "../assets/images/icon_large.png";
import LiveRadios from "../components/HomePage/LiveRadios";
import Footer from "../components/utils/Footer.tsx";
import Categories from "../components/HomePage/Categories.tsx";
import TopMusics from "../components/HomePage/TopMusics.tsx";
import PodCasts from "../components/HomePage/PodCasts.tsx";

const HomePage = () => {
    const [hideMainLogo, setHideMainLogo] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setHideMainLogo(window.scrollY > 150);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white pb-20 font-sans">

            <div className={`flex flex-col items-center pt-24 mb-12 transition-all duration-700 ${
                hideMainLogo ? "opacity-0 scale-95" : "opacity-100 scale-100"
            }`}>
                <img src={logo} alt="RadioMonoco Logo" className="w-[400px] h-auto object-contain" />
                <p className="mt-4 text-neutral-500 uppercase tracking-[0.3em] text-[10px] font-bold">L'annuaire des ondes numériques</p>
            </div>

            <LiveRadios />

            <Categories/>

            <TopMusics/>

            <PodCasts/>

            <Footer/>
        </div>
    );
};

export default HomePage;