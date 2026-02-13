import {Link} from "react-router-dom";

const NavBar = () => {
    const LinkStyle = "text-sm font-medium text-neutral-300 hover:text-white transition"

    return (
        <nav className="h-16 flex items-center justify-between">
            <Link to="/" className="text-xl font-bold tracking-wide">RadioMonoco</Link>

            <div className="flex items-center gap-6">
                <Link to="/search" className={LinkStyle}>Search</Link>
                <Link to="/feed" className={LinkStyle}>Feed</Link>
                <Link to="/collection" className={LinkStyle}>Collection</Link>
            </div>

            <div className="flex items-center gap-4">
                <Link to="/login" className="text-sm text-neutral-300 hover:text-white">Login</Link>
                <Link to="/register" className="px-4 py-2 text-sm font-medium bg-white text-black rounded-lg hover:bg-neutral-200 transition">Register</Link>
            </div>
        </nav>
    )
}

export default NavBar;