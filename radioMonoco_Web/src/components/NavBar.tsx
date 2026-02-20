import {Link} from "react-router-dom";
import { useAuth } from "../context/AuthContext.tsx";
import { useNavigate } from "react-router-dom";

const NavBar = () => {
    const { user, logout } = useAuth()
    const LinkStyle = "text-sm font-medium text-neutral-300 hover:text-white transition"
    const navigate = useNavigate();

    return (
        <nav className="h-16 flex items-center justify-between">
            <Link to="/" className="text-xl font-bold tracking-wide">RadioMonoco</Link>

            <div className="flex items-center gap-6">
                <Link to="/feed" className={LinkStyle}>Feed</Link>
            </div>

            <div className="flex items-center gap-4">
                {!user ? (
                    <>
                <Link to="/login" className="text-sm text-neutral-300 hover:text-white">Login</Link>
                <Link to="/register" className="px-4 py-2 text-sm font-medium bg-white text-black rounded-lg hover:bg-neutral-200 transition">Register</Link>
                    </>
                ) : (
                    <>
                        <span className="text-sm text-neutral-300"> Connecté en tant que : {user.name}</span>
                        <button onClick={() => {logout();navigate("/")}} className="px-4 py-2 text-sm font-medium bg-white text-black rounded-lg hover:bg-neutral-200 transition">Logout</button>
                    </>
                )}
            </div>
        </nav>
    )
}

export default NavBar;