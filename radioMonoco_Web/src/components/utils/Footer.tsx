import logo from "../../assets/images/icon_large.png"

const Footer = () => {
    const LinkStyle =
        "text-[10px] font-semibold text-neutral-500 uppercase tracking-[0.3em] transition duration-300 relative after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1px] after:bg-rose-500 after:transition-all after:duration-300 hover:text-white hover:after:w-full uppercase tracking-widest text-[11px]";

    return (
        <footer className="max-w-6xl mx-auto px-6 py-12 border-t border-white/5">
            <div className="flex flex-row justify-between items-center w-full">
                <div className="flex items-center">
                    <img
                        src={logo}
                        alt="Logo"
                        className="h-5 w-auto opacity-40 grayscale hover:opacity-100 transition-opacity"
                    />
                </div>

                <nav className="flex items-center gap-10">
                    <a href="#" className={LinkStyle}>
                        À propos
                    </a>
                    <a href="#" className={LinkStyle}>
                        Contact
                    </a>
                </nav>
            </div>
            <div className="mt-8 text-center">
                <p className="text-[8px] uppercase tracking-[0.5em] text-neutral-800">
                    © 2026 RadioMonoco - Tous droits réservés
                </p>
            </div>
        </footer>
    );
};

export default Footer;