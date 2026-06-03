import {useAuth} from "../../context/AuthContext.tsx";
//import {useCallback, useEffect} from "react";
//import AdminService from "../../services/AdminService.ts";
//import {useState} from "react";

const AdminUsers = () => {
    const { user } = useAuth();
    // const [users, setUsers] = useState<User[]>([]);
    const users = user ? [user] : [];

    // useEffect(() => {
    //     fetchUsers();
    // }, []);

    // const fetchUsers = async () => {
    //     const data = await AdminService.getUsers();
    //     setUsers(data);
    // };

    // const handleBan = async (id: string, banned:boolean) => {
    //     try {
    //         await AdminService.banUser(id, !banned);
    //         fetchUsers();
    //     }catch(err) {
    //         console.error(err);
    //     }
    // };

    return (
        <div className="p-8">

            <h1 className="text-4xl font-bold text-white mb-8">
                Gestion des utilisateurs
            </h1>

            <div className="space-y-4">

                {users.map((u) => (

                    <div
                        key={u.id}
                        className="bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6"
                    >
                        <div className="flex items-center justify-between">

                            <div>

                                <h2 className="text-white font-semibold text-lg">
                                    {u.username}
                                </h2>

                                <p className="text-neutral-500">
                                    {u.email}
                                </p>

                            </div>

                            <button
                                disabled
                                className="bg-neutral-700 text-neutral-400 px-4 py-2 rounded-xl"
                            >
                                Route users en attente
                            </button>

                        </div>

                    </div>

                ))}

            </div>

        </div>
    );
};

export default AdminUsers;