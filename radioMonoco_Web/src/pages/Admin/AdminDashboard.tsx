import {useAuth} from "../../context/AuthContext.tsx";
import {useEffect, useState} from "react";
import AdminService from "../../services/AdminService.ts";
import {useNavigate} from "react-router-dom";

const AdminDashboard = () => {
    const {user} = useAuth();
    const [reportCount, setReportCount] = useState(0);
    const [userCount, setUserCount] = useState(0);
    const navigate = useNavigate()

    useEffect(() => {
        const fetchData = async () => {
            try {
                const reports = await AdminService.getReports();
                setReportCount(reports.length);

                const users = await AdminService.getUsers();
                setUserCount(users.length);
            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="p-8">

            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white px-3 py-2 rounded-full transition"
                >
                    ← Retour
                </button>
            </div>

            <h1 className="text-5xl font-black text-white mb-10">
                Dashboard Admin
            </h1>
            <div className="grid md:grid-cols-3 gap-6">

                <div className="bg-neutral-900/40 backdrop-blur-xl rounded-3xl p-6 border border-white/5">
                    <p className="text-neutral-400">
                        Signalements :
                    </p>
                    <p className="text-4xl font-bold text-white mt-2">
                        {reportCount}
                    </p>
                </div>
                <div className="bg-neutral-900/40 backdrop-blur-xl rounded-3xl p-6 border border-white/5">
                    <p className="text-neutral-400">
                        Utilisateurs inscrits :
                    </p>

                    <p className="text-4xl font-bold text-white mt-2">
                        {userCount}
                    </p>
                </div>
                <div className="bg-neutral-900/40 backdrop-blur-xl rounded-3xl p-6 border border-white/5">
                    <p className="text-neutral-400">
                        Administrateur connecté :
                    </p>

                    <p className="text-xl text-white mt-2">
                        {user?.username}
                    </p>
                </div>

            </div>
            <div className="grid md:grid-cols-3 gap-6 mt-12">
                <div
                    onClick={() => navigate("/admin/users")}
                    className="cursor-pointer bg-neutral-900/40 p-6 rounded-3xl border border-white/5 hover:border-rose-500 transition"
                >
                    <h2 className="text-white font-bold text-xl">
                        Utilisateurs
                    </h2>

                    <p className="text-neutral-500 mt-2">
                        Gérer les comptes et bannissements
                    </p>
                </div>

                <div
                    onClick={() => navigate("/admin/reports")}
                    className="cursor-pointer bg-neutral-900/40 p-6 rounded-3xl border border-white/5 hover:border-rose-500 transition"
                >
                    <h2 className="text-white font-bold text-xl">
                        Signalements
                    </h2>

                    <p className="text-neutral-500 mt-2">
                        Consulter les reports utilisateurs
                    </p>
                </div>
                <div
                    onClick={() => navigate("/admin/recommendations")}
                    className="cursor-pointer bg-neutral-900/40 p-6 rounded-3xl border border-white/5 hover:border-rose-500 transition"
                >
                    <h2 className="text-white font-bold text-xl">
                        Recommandations
                    </h2>

                    <p className="text-neutral-500 mt-2">
                        Recommander des œuvres
                    </p>
                </div>

            </div>

        </div>
    );
}
export default AdminDashboard;