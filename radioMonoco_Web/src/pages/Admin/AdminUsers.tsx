import type {User} from "../../context/AuthContext.tsx";
import {useEffect, useState} from "react";
import AdminService from "../../services/AdminService.ts";
import {useNavigate} from "react-router-dom";

const AdminUsers = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate()

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await AdminService.getUsers();
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
            setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ban: !banned } : u)));
            await AdminService.banUser(id, !banned);
        }catch(err) {
            console.error("❌ Erreur ban/débannir:", err);
            setError(err instanceof Error ? err.message : "Erreur lors du ban");
            setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ban: banned } : u)));
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

    const filteredUsers = users.filter(u => 
        (u.username && u.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

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

            <div className="mb-8">
                <input 
                    type="text" 
                    placeholder="Rechercher par nom ou email..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full max-w-md bg-neutral-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-primary transition"
                />
            </div>

            {filteredUsers.length === 0 ? (
                <p className="text-neutral-400">
                    Aucun utilisateur trouvé
                </p>
            ) : (
                <div className="space-y-4">
                    {filteredUsers.map((u) => (

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
                                        u.ban ?? false
                                    )
                                }
                                className={`px-4 py-2 rounded-xl font-semibold transition ${
                                    u.ban
                                        ? "bg-green-600 hover:bg-green-500"
                                        : "bg-red-600 hover:bg-red-500"
                                }`}
                            >
                                {u.ban
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