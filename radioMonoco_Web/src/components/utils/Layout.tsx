import {Outlet} from "react-router-dom";
import Header from "./Header.tsx"

const Layout = () => {
    return (
        <div className="min-h-screen bg-neutral-950 text-white">
            <Header />
            <main className="w-full">
                <Outlet />
            </main>
        </div>
    )
}

export default Layout