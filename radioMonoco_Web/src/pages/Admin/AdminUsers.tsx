import type {User} from "../../context/AuthContext.tsx";
import {useEffect, useState} from "react";
import AdminService from "../../services/AdminService.ts";
import {useNavigate} from "react-router-dom";

const AdminUsers = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate()

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await AdminService.getUsers();
            console.log("📊 USERS récupérés:", data);
            console.log("📊 Nombre d'utilisateurs:", data.length);
            if (!Array.isArray(data)) {
                console.error("Les données retournées ne sont pas un tableau:", data);
                setError("Format de données invalide");
                return;
            }
            setUsers(data);
        } catch (error) {
            console.error("Erreur lors de la récupération des utilisateurs:", error);
            setError(error instanceof Error ? error.message : "Erreur inconnue");
        } finally {
            setLoading(false);
        }
    };

    const handleBan = async (id: string, banned:boolean) => {
        try {
            await AdminService.banUser(id, !banned);
            await fetchUsers();
        }catch(err) {
            console.error("❌ Erreur ban/débannir:", err);
            setError(err instanceof Error ? err.message : "Erreur lors du ban");
        }
    };

    if (loading) {
        return (
            <div className="p-8">
                <h1 className="text-4xl font-bold text-white mb-8">
                    Gestion des utilisateurs
                </h1>
                <p className="text-neutral-400">
                    ⏳ Chargement...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8">
                <h1 className="text-4xl font-bold text-white mb-8">
                    Gestion des utilisateurs
                </h1>
                <div className="bg-red-900/40 border border-red-600 rounded-2xl p-4 text-red-400">
                    Erreur: {error}
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">

            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/admin')}
                    className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white px-3 py-2 rounded-full transition"
                >
                    ← Retour
                </button>
            </div>

            <h1 className="text-4xl font-bold text-white mb-8">
                Gestion des utilisateurs ({users.length})
            </h1>

            {users.length === 0 ? (
                <p className="text-neutral-400">
                    Aucun utilisateur trouvé
                </p>
            ) : (
                <div className="space-y-4">
                    {users.map((u) => (

                    <div
                        key={u.id}
                        className="bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6"
                    >
                        <div className="flex items-center justify-between">

                            <div>

                                <h2 className="text-white font-semibold text-lg">
                                    {u.username ?? "sans nom"}
                                </h2>

                                <p className="text-neutral-500">
                                    {u.email}
                                </p>

                                <p className="text-xs text-neutral-600 mt-1">
                                    {u.role}
                                </p>

                            </div>

                            <button
                                onClick={() =>
                                    handleBan(
                                        u.id,
                                        u.is_banned ?? false
                                    )
                                }
                                className={`px-4 py-2 rounded-xl font-semibold transition ${
                                    u.is_banned
                                        ? "bg-green-600 hover:bg-green-500"
                                        : "bg-red-600 hover:bg-red-500"
                                }`}
                            >
                                {u.is_banned
                                    ? "Débannir"
                                    : "Bannir"}

                            </button>
                        </div>
                    </div>
                ))}

                </div>
            )}

        </div>
    );
};

export default AdminUsers;