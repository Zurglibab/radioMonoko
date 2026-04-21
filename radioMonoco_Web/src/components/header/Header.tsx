import NavBar from "./NavBar.tsx";

const Header = () => {
    return (
        <header className="sticky top-0 z-50 w-full bg-app-bg border-b border-app-border transition-colors duration-500">
            <div className="w-full">
                <NavBar/>
            </div>
        </header>
    );
};

export default Header;