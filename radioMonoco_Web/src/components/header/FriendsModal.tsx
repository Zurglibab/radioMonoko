import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HiOutlineX, HiOutlineUserGroup, HiOutlineCheck } from "react-icons/hi";
import { useAppearance } from "../../context/AppearanceContext";
import UserRelationsService from "../../services/UserRelationsService";
import type {User} from "../../context/AuthContext.tsx";

export const FriendsModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    const { theme } = useAppearance();
    const [friends, setFriends] = useState<User[]>([]);
    const [pending, setPending] = useState<User[]>([]);
    const [following, setFollowing] = useState<User[]>([]);
    const [activeTab, setActiveTab] = useState<'friends' | 'pending' | 'following'>('friends');
    const [isLoading, setIsLoading] = useState(false);

    const refreshData = async () => {
        setIsLoading(true);
        try {
            const [f, p, fol] = await Promise.all([
                UserRelationsService.getFriends(),
                UserRelationsService.getRequests(),
                UserRelationsService.getFollowing()
            ]);
            setFriends(f as unknown as User[]);
            setPending(p as unknown as User[]);
            setFollowing(fol as unknown as User[]);
        } catch (err) {
            console.error("Erreur chargement réseau :", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) refreshData();
    }, [isOpen]);

    if (!isOpen) return null;

    const isDark = theme === 'dark';
    const bgClass = isDark ? "bg-neutral-900 text-white" : "bg-white text-neutral-800";

    const currentList = activeTab === 'friends' ? friends : activeTab === 'pending' ? pending : following;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className={`${bgClass} w-full max-w-sm rounded-[2rem] p-6 shadow-2xl border ${isDark ? 'border-white/10' : 'border-neutral-200'}`}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-black flex items-center gap-2 uppercase tracking-tight">
                        <HiOutlineUserGroup className="text-rose-500" /> Mes amis
                    </h2>
                    <button onClick={onClose} className="opacity-50 hover:opacity-100 transition"><HiOutlineX /></button>
                </div>

                <div className={`flex gap-1 p-1 rounded-2xl mb-6 ${isDark ? 'bg-white/5' : 'bg-neutral-100'}`}>
                    <TabButton active={activeTab === 'friends'} onClick={() => setActiveTab('friends')} label={`Amis (${friends.length})`} isDark={isDark} />
                    <TabButton active={activeTab === 'following'} onClick={() => setActiveTab('following')} label={`Suivis (${following.length})`} isDark={isDark} />
                    <TabButton active={activeTab === 'pending'} onClick={() => setActiveTab('pending')} label={`Attente (${pending.length})`} isDark={isDark} />
                </div>

                <div className="min-h-[200px] max-h-[50vh] overflow-y-auto">
                    {isLoading ? <div className="text-center mt-10 text-xs opacity-50">Chargement...</div> : (
                        <List
                            items={currentList}
                            isRequest={activeTab === 'pending'}
                            emptyText="Aucun utilisateur ici"
                            isDark={isDark}
                            onClose={onClose}
                            onUpdate={refreshData}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

const TabButton = ({ active, onClick, label, isDark }: any) => (
    <button onClick={onClick} className={`flex-1 py-2 text-[10px] font-bold rounded-xl transition-all ${active ? (isDark ? "bg-white/10 text-white" : "bg-white shadow-sm") : "text-neutral-500"}`}>
        {label}
    </button>
);

const List = ({ items, isRequest, emptyText, isDark, onClose, onUpdate }: any) => {
    const navigate = useNavigate();

    const handleAction = async (e: React.MouseEvent, action: 'accept' | 'decline', userId: string) => {
        e.stopPropagation();
        if (action === 'accept') await UserRelationsService.acceptRequest(userId);
        else await UserRelationsService.refuseRequest(userId);
        await onUpdate();
    };

    if (items.length === 0) return <div className="text-center mt-10 text-xs opacity-40">{emptyText}</div>;

    return (
        <div className="space-y-2">
            {items.map((u: any) => (
                <div key={u.id} onClick={() => { onClose(); navigate(`/users/${u.id}`); }} className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer ${isDark ? 'bg-white/5 border-white/5 hover:bg-white/[0.08]' : 'bg-neutral-50 hover:bg-white'}`}>
                    <span className="font-semibold text-sm">{u.username}</span>
                    {isRequest && (
                        <div className="flex gap-2">
                            <button onClick={(e) => handleAction(e, 'accept', u.id)} className="p-2 bg-rose-500 text-white rounded-lg"><HiOutlineCheck /></button>
                            <button onClick={(e) => handleAction(e, 'decline', u.id)} className={`p-2 rounded-lg ${isDark ? "bg-white/10" : "bg-neutral-200"}`}><HiOutlineX /></button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};