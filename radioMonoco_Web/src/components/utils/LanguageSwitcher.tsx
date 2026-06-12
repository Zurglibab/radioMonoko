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
                className="flex items-center gap-1.5 md:gap-2 h-9 md:h-10 rounded-full px-3 transition-all duration-300 hover:bg-app-text/10 active:scale-95 cursor-pointer"
            >
                <FiGlobe className="text-app-text text-lg" />
                <FiChevronDown
                    className={`text-app-text text-sm transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-12 w-36 bg-app-card border border-app-border rounded-xl shadow-xl overflow-hidden z-60 animate-in fade-in zoom-in-95 duration-150">
                    <button
                        type="button"
                        onClick={() => changeLanguage("fr")}
                        className={`w-full px-4 py-2.5 text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
                            currentLanguage === "fr"
                                ? "bg-primary/10 text-primary"
                                : "text-app-text/70 hover:bg-app-text/5 hover:text-app-text"
                        }`}
                    >
                        🇫🇷 Français
                    </button>

                    <button
                        type="button"
                        onClick={() => changeLanguage("en")}
                        className={`w-full px-4 py-2.5 text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
                            currentLanguage === "en"
                                ? "bg-primary/10 text-primary"
                                : "text-app-text/70 hover:bg-app-text/5 hover:text-app-text"
                        }`}
                    >
                        🇬🇧 English
                    </button>

                    <button
                        type="button"
                        onClick={() => changeLanguage("es")}
                        className={`w-full px-4 py-2.5 text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
                            currentLanguage === "es"
                                ? "bg-primary/10 text-primary"
                                : "text-app-text/70 hover:bg-app-text/5 hover:text-app-text"
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