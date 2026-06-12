import logo from "../../assets/images/icon_large.png";
import { useAppearance } from "../../context/AppearanceContext";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Footer = () => {
    const { theme } = useAppearance();
    const { t } = useTranslation();

    const LinkStyle = `
        text-[10px] font-semibold uppercase tracking-[0.3em] transition duration-300 relative 
        after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1px] after:bg-primary after:transition-all after:duration-300 
        hover:after:w-full uppercase tracking-widest text-[11px]
        ${theme === 'dark' ? 'text-neutral-500 hover:text-white' : 'text-neutral-400 hover:text-black'}
    `;

    return (
        <footer className="max-w-6xl mx-auto px-6 py-12 border-t border-app-border transition-colors duration-500">
            <div className="flex flex-col md:flex-row justify-between items-center w-full gap-6 md:gap-0">
                <div className="flex items-center">
                    <img
                        src={logo}
                        alt="Logo"
                        className={`h-5 w-auto transition-all duration-500 opacity-40 grayscale hover:opacity-100 
                            ${theme === 'dark' ? 'brightness-200' : 'brightness-0'}`}
                    />
                </div>

                <nav className="flex items-center gap-10">
                    <Link to="/about" className={LinkStyle}>
                        {t("footer.about")}
                    </Link>
                    <Link to="/contact" className={LinkStyle}>
                        {t("footer.contact")}
                    </Link>
                </nav>
            </div>
            <div className="mt-8 text-center">
                <p className={`text-[8px] uppercase tracking-[0.5em] transition-colors duration-500 
                    ${theme === 'dark' ? 'text-neutral-800' : 'text-neutral-300'}`}>
                    {t("footer.rights")}
                </p>
            </div>
        </footer>
    );
};

export default Footer;