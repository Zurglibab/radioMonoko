import {useEffect, useState} from "react";
import AdminService from "../../services/AdminService.ts";
import type {Report} from "../../interfaces/Report.types.ts";
import {useNavigate} from "react-router-dom";

const AdminReports = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const navigate = useNavigate()

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const data = await AdminService.getReports();
            setReports(data);
        } catch (err) {
            console.error("Erreur lors de la récupération des signalements :", err);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/admin')}
                    className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white px-3 py-2 rounded-full transition"
                >
                    ← Retour
                </button>
            </div>
            {reports.map((report) => (
                <div
                    key={report.id}
                    className="bg-neutral-900/40 backdrop-blur-2xl p-4 rounded-3xl border border-white/5">

                    <p className="text-white font-semibold">
                        Utilisateur signalé
                    </p>

                    <p className="text-neutral-400 text-sm">
                        {report.reported_user_id}
                    </p>

                    <p className="mt-4 text-white">
                        {report.reason}
                    </p>
                </div>
            ))}
        </div>
    );
};
export default AdminReports;