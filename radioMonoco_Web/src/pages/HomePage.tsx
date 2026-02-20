import { useState, useEffect } from "react";
import logo from "../assets/images/icon_large.png";

const images = [
    "https://www.radiofrance.fr/pikapi/images/894f4968-8833-4fbf-8fb9-cd6a7228e0ca/1200x680",
    "https://www.radiofrance.fr/pikapi/images/affeb063-b0b2-4507-b9d5-eca3acbbeaa2/1200x680",
    "https://www.radiofrance.fr/pikapi/images/e5729b6c-6f95-420b-afc3-c8166add9ce8/1200x680"
];

const HomePage = () => {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % images.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-neutral-950 text-white pb-2">

            <div className="flex flex-col items-center pt-16 mb-8">
                <img src={logo} alt="Logo" className="w-100 h-auto object-contain" />
            </div>

            <div className="relative w-full max-w-4xl mx-auto overflow-hidden rounded-xl mb-16">
                <div
                    className="flex transition-transform duration-700 ease-in-out"
                    style={{ transform: `translateX(-${current * 100}%)` }}
                >
                    {images.map((img, index) => (
                        <div key={index} className="flex-shrink-0 w-full">
                            <img
                                src={img}
                                alt={`Slide ${index + 1}`}
                                className="w-full h-64 md:h-96 object-cover"
                            />
                        </div>
                    ))}
                </div>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((_, index) => (
                        <span
                            key={index}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                current === index ? "bg-white" : "bg-neutral-500"
                            }`}
                        />
                    ))}
                </div>
            </div>

            <section className="max-w-6xl mx-auto px-4 mb-16">
                <h2 className="text-3xl font-bold mb-6">Émissions à l’antenne</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-neutral-900 p-4 rounded-xl shadow-md hover:shadow-lg transition">
                        <h3 className="text-xl font-semibold mb-2">Morning Radio</h3>
                        <p>6h - 9h | Actualités, musique et bonne humeur pour bien commencer la journée.</p>
                    </div>
                    <div className="bg-neutral-900 p-4 rounded-xl shadow-md hover:shadow-lg transition">
                        <h3 className="text-xl font-semibold mb-2">L’Afterwork</h3>
                        <p>17h - 20h | Détente et hits du moment pour finir la journée en beauté.</p>
                    </div>
                    <div className="bg-neutral-900 p-4 rounded-xl shadow-md hover:shadow-lg transition">
                        <h3 className="text-xl font-semibold mb-2">Electro Night</h3>
                        <p>22h - 2h | Les meilleurs sons électro et house pour les noctambules.</p>
                    </div>
                </div>
            </section>

            <section className="max-w-6xl mx-auto px-4 mb-16">
                <h2 className="text-3xl font-bold mb-6">Nos animateurs</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {["Alice", "Bob", "Charlie", "Diane"].map((name) => (
                        <div key={name} className="bg-neutral-900 p-4 rounded-xl shadow-md hover:shadow-lg transition flex flex-col items-center">
                            <div className="w-24 h-24 rounded-full bg-gray-700 mb-4" />
                            <h3 className="text-xl font-semibold">{name}</h3>
                        </div>
                    ))}
                </div>
            </section>

            <section className="max-w-6xl mx-auto px-4 mb-16">
                <h2 className="text-3xl font-bold mb-6">Prochains événements</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-neutral-900 p-4 rounded-xl shadow-md hover:shadow-lg transition">
                        <h3 className="text-xl font-semibold mb-2">Concert Pop</h3>
                        <p>12 Mars 2026 | Live sur notre antenne et réseaux sociaux.</p>
                    </div>
                    <div className="bg-neutral-900 p-4 rounded-xl shadow-md hover:shadow-lg transition">
                        <h3 className="text-xl font-semibold mb-2">Interview Exclusive</h3>
                        <p>18 Mars 2026 | Rencontre avec vos artistes préférés.</p>
                    </div>
                    <div className="bg-neutral-900 p-4 rounded-xl shadow-md hover:shadow-lg transition">
                        <h3 className="text-xl font-semibold mb-2">Festival Radio</h3>
                        <p>25 Mars 2026 | Événement spécial avec animations et cadeaux.</p>
                    </div>
                </div>
            </section>

            <section className="max-w-4xl mx-auto px-4 mb-16 text-center">
                <h2 className="text-3xl font-bold mb-4">À propos de RadioMonoco</h2>
                <p className="text-neutral-300">
                    RadioMonoco est votre station de radio de référence, diffusant musique, actualités et programmes exclusifs 24/7. Rejoignez-nous pour vivre la meilleure expérience musicale.
                </p>
            </section>

            <section className="max-w-4xl mx-auto px-4 mb-16 text-center">
                <h2 className="text-3xl font-bold mb-4">Suivez-nous</h2>
                <div className="flex justify-center gap-6 text-2xl">
                    <a href="#" className="hover:text-gray-300 transition">🐦</a>
                    <a href="#" className="hover:text-gray-300 transition">📘</a>
                    <a href="#" className="hover:text-gray-300 transition">📸</a>
                </div>
            </section>

        </div>
    );
};

export default HomePage;