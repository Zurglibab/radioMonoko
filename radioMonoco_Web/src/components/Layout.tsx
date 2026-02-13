import {Outlet} from "react-router-dom";
import Header from "../components/Header.tsx"

const Layout = () => {
    return (
        <div className="min-h-screen bg-neutral-950 text-white">
            <Header />
            <main className="w-full px-8 py-6">
                <Outlet />
            </main>
        </div>
    )
}

export default Layout