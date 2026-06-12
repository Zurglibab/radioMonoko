import {useTranslation} from "react-i18next";
import {FiGlobe, FiChevronDown} from "react-icons/fi";
import {useState, useRef, useEffect} from "react";

const LanguageSwitcher = () => {
    const {i18n} = useTranslation();
    const currentLanguage = i18n.language;
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const changeLanguage = (language: "fr" | "en" | "es") => {
        i18n.changeLanguage(language);
        localStorage.setItem("language", language);
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div ref={dropdownRef} className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-neutral-900/60 border border-white/10 hover:border-white/20 rounded-full px-3 py-2 transition"
            >
                <FiGlobe className="text-neutral-400" />
                <FiChevronDown
                    className={`text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 bg-neutral-900 border border-white/10 rounded-xl shadow-lg overflow-hidden z-50 animate-in fade-in">
                    <button
                        type="button"
                        onClick={() => changeLanguage("fr")}
                        className={`w-full px-4 py-2 text-sm font-semibold transition flex items-center gap-2 ${
                            currentLanguage === "fr" 
                                ? "bg-rose-600/20 text-rose-500" 
                                : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                        }`}
                    >
                        🇫🇷 Français
                    </button>

                    <button
                        type="button"
                        onClick={() => changeLanguage("en")}
                        className={`w-full px-4 py-2 text-sm font-semibold transition flex items-center gap-2 ${
                            currentLanguage === "en" 
                                ? "bg-rose-600/20 text-rose-500" 
                                : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                        }`}
                    >
                        🇬🇧 English
                    </button>

                    <button
                        type="button"
                        onClick={() => changeLanguage("es")}
                        className={`w-full px-4 py-2 text-sm font-semibold transition flex items-center gap-2 ${
                            currentLanguage === "es" 
                                ? "bg-rose-600/20 text-rose-500" 
                                : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                        }`}
                    >
                        🇪🇸 Español
                    </button>
                </div>
            )}
        </div>
    );
};
export default LanguageSwitcher;