import NavBar from "./NavBar.tsx";
import {useAuth} from "../../context/AuthContext.tsx";
import {useState} from "react";

const Header = () => {
    const { user } = useAuth()
    const [isConnected] = useState(!!user);
    return (
        <header className="sticky top-0 z-50 w-full bg-neutral-950 border-b border-neutral-800">
            <div className="w-full px-8">
                <NavBar isConnected={isConnected} />
            </div>
        </header>
    )
}

export default Header;