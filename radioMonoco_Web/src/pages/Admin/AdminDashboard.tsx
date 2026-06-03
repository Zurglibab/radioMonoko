import {useAuth} from "../../context/AuthContext.tsx";
import {useEffect, useState} from "react";
import AdminService from "../../services/AdminService.ts";
import {useNavigate} from "react-router-dom";

const AdminDashboard = () => {
    const {user} = useAuth();
    const [reportCount, setReportCount] = useState(0);
    const navigate = useNavigate()

    useEffect(() => {
        const fetchData = async () => {
            try {
                const reports = await AdminService.getReports();
                setReportCount(reports.length);
                // const users = await AdminService.getUsers();
                // setUserCount(users.length);
            } catch (error) {
                console.log(error);
            }
        };
        fetchData();
    }, []);

    // if (!user || user.role !== "admin") {
    //     return (
    //         <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
    //             <p className="text-white">Accès refusé</p>
    //         </div>
    //     );
    // }

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
                        Signalements
                    </p>

                    <p className="text-4xl font-bold text-white mt-2">
                        {reportCount}
                    </p>

                </div>

                <div className="bg-neutral-900/40 backdrop-blur-xl rounded-3xl p-6 border border-white/5">

                    <p className="text-neutral-400">
                        Utilisateurs
                    </p>

                    <p className="text-4xl font-bold text-white mt-2">
                        67
                        {/*{userCount}*/}
                    </p>

                    <p className="text-xs text-neutral-500 mt-2">
                        Temporaire
                    </p>

                </div>

                <div className="bg-neutral-900/40 backdrop-blur-xl rounded-3xl p-6 border border-white/5">

                    <p className="text-neutral-400">
                        Administrateur connecté
                    </p>

                    <p className="text-xl text-white mt-2">
                        {user?.username}
                    </p>

                </div>

            </div>

        </div>
    );
}
export default AdminDashboard;