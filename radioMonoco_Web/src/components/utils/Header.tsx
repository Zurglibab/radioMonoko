import NavBar from "../header/NavBar.tsx";
const Header = () => {
    return (
        <header className="sticky top-0 z-50 w-full bg-neutral-950 border-b border-neutral-800">
            <div className="w-full px-8">
                <NavBar/>
            </div>
        </header>
    )
}

export default Header;