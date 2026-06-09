import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HiOutlineX, HiOutlineUserGroup, HiOutlineCheck } from "react-icons/hi";
import { useAppearance } from "../../context/AppearanceContext";
import UserRelationsService from "../../services/UserRelationsService";
import type { Friend } from "../../interfaces/UserRelations.types";

export const FriendsModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    const { theme } = useAppearance();
    const [friends, setFriends] = useState<Friend[]>([]);
    const [pending, setPending] = useState<Friend[]>([]);
    const [activeTab, setActiveTab] = useState<'friends' | 'pending'>('friends');

    useEffect(() => {
        if (isOpen) {
            const loadData = async () => {
                const [f, p] = await Promise.all([
                    UserRelationsService.getFriends(),
                    UserRelationsService.getRequests()
                ]);
                setFriends(f as unknown as Friend[]);
                setPending(p as unknown as Friend[]);
            };
            loadData();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const isDark = theme === 'dark';
    const bgClass = isDark ? "bg-app-bg text-white" : "bg-white text-neutral-800";
    const borderClass = isDark ? "border-white/10" : "border-neutral-200";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className={`${bgClass} w-full max-w-sm rounded-[2rem] p-6 shadow-2xl border ${borderClass}`}>

                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-black flex items-center gap-2 uppercase tracking-tight">
                        <HiOutlineUserGroup className="text-rose-500" /> Réseau
                    </h2>
                    <button onClick={onClose} className="opacity-50 hover:opacity-100 transition">
                        <HiOutlineX className="text-xl" />
                    </button>
                </div>

                <div className={`flex gap-1 p-1 rounded-2xl mb-6 ${isDark ? 'bg-white/5' : 'bg-neutral-100'}`}>
                    <TabButton
                        active={activeTab === 'friends'}
                        onClick={() => setActiveTab('friends')}
                        label={`Amis (${friends.length})`}
                        isDark={isDark}
                    />
                    <TabButton
                        active={activeTab === 'pending'}
                        onClick={() => setActiveTab('pending')}
                        label={`Attente (${pending.length})`}
                        isDark={isDark}
                    />
                </div>

                <div className="min-h-[200px] max-h-[50vh] overflow-y-auto">
                    {activeTab === 'friends' ? (
                        <List
                            items={friends}
                            emptyText="Aucun ami pour l'instant"
                            isDark={isDark}
                            onClose={onClose}
                        />
                    ) : (
                        <List
                            items={pending}
                            isRequest
                            emptyText="Pas de demandes"
                            isDark={isDark}
                            onClose={onClose}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

const TabButton = ({ active, onClick, label, isDark }: { active: boolean, onClick: () => void, label: string, isDark: boolean }) => (
    <button
        onClick={onClick}
        className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
            active
                ? (isDark ? "bg-white/10 text-white" : "bg-white shadow-sm text-neutral-900")
                : "text-neutral-500 hover:text-rose-500"
        }`}
    >
        {label}
    </button>
);

const List = ({ items, isRequest = false, emptyText, isDark, onClose }: {
    items: Friend[],
    isRequest?: boolean,
    emptyText: string,
    isDark: boolean,
    onClose: () => void
}) => {
    const navigate = useNavigate();

    const handleAction = async (e: React.MouseEvent, action: 'accept' | 'decline', userId: string) => {
        e.stopPropagation();
        if (action === 'accept') {
            await UserRelationsService.acceptRequest(userId);
        } else {
            await UserRelationsService.refuseRequest(userId);
        }
    };

    if (items.length === 0) return <div className="text-center mt-10 text-xs font-medium opacity-40">{emptyText}</div>;

    return (
        <div className="space-y-2">
            {items.map((u) => (
                <div
                    key={u.id}
                    onClick={() => { onClose(); navigate(`/users/${u.id}`); }}
                    className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all duration-300 group
                        ${isDark
                        ? 'bg-white/5 border-white/5 hover:bg-white/[0.08] hover:border-rose-500/30'
                        : 'bg-neutral-50 border-neutral-100 hover:bg-white hover:border-rose-200 hover:shadow-md'
                    }`}
                >
                    <span className="font-semibold text-sm transition-colors group-hover:text-rose-500">
                        {u.username}
                    </span>

                    {isRequest && (
                        <div className="flex gap-2">
                            <button
                                onClick={(e) => handleAction(e, 'accept', u.id)}
                                className="p-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 active:scale-90 transition-all"
                                title="Accepter"
                            >
                                <HiOutlineCheck />
                            </button>

                            <button
                                onClick={(e) => handleAction(e, 'decline', u.id)}
                                className={`p-2 rounded-lg transition-all active:scale-90 ${
                                    isDark ? "bg-white/10 hover:bg-white/20" : "bg-neutral-200 hover:bg-neutral-300"
                                }`}
                                title="Refuser"
                            >
                                <HiOutlineX />
                            </button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};