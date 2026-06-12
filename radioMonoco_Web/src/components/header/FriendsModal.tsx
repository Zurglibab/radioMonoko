import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HiOutlineX, HiOutlineUserGroup, HiOutlineCheck } from "react-icons/hi";
import { useAppearance } from "../../context/AppearanceContext";
import UserRelationsService from "../../services/UserRelationsService";
import type { User } from "../../interfaces/Users.types.ts";

export const FriendsModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    const { theme } = useAppearance();
    const { t } = useTranslation();

    const [friends, setFriends] = useState<User[]>([]);
    const [pending, setPending] = useState<User[]>([]);
    const [following, setFollowing] = useState<User[]>([]);
    const [followers, setFollowers] = useState<User[]>([]);
    const [blocked, setBlocked] = useState<User[]>([]);

    const [activeTab, setActiveTab] = useState<'friends' | 'pending' | 'following' | 'followers' | 'blocked'>('friends');
    const [isLoading, setIsLoading] = useState(false);

    const refreshData = async () => {
        setIsLoading(true);
        try {
            const [friends, pending, following, followers, blocked] = await Promise.all([
                UserRelationsService.getFriends(),
                UserRelationsService.getRequests(),
                UserRelationsService.getFollowing(),
                UserRelationsService.getFollowers(),
                UserRelationsService.getBlocked()
            ]);
            setFriends(friends as unknown as User[]);
            setPending(pending as unknown as User[]);
            setFollowing(following as unknown as User[]);
            setFollowers(followers as unknown as User[]);
            setBlocked(blocked as unknown as User[]);
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

    const currentList = activeTab === 'friends' ? friends : activeTab === 'pending' ? pending : activeTab === 'following' ? following : activeTab === 'followers' ? followers : blocked;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className={`${bgClass} w-full max-w-2xl rounded-[2rem] p-8 shadow-2xl border ${isDark ? 'border-white/10' : 'border-neutral-200'}`}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-black flex items-center gap-2 uppercase tracking-tight">
                        <HiOutlineUserGroup className="text-rose-500" /> {t("friendsModal.title")}
                    </h2>
                    <button onClick={onClose} className="opacity-50 hover:opacity-100 transition"><HiOutlineX /></button>
                </div>

                <div className={`grid grid-cols-5 gap-1 p-1 rounded-2xl mb-6 ${isDark ? 'bg-white/5' : 'bg-neutral-100'}`}>
                    <TabButton active={activeTab === 'friends'} onClick={() => setActiveTab('friends')} label={t("friendsModal.tabs.friends", { count: friends.length })} isDark={isDark} />
                    <TabButton active={activeTab === 'following'} onClick={() => setActiveTab('following')} label={t("friendsModal.tabs.following", { count: following.length })} isDark={isDark} />
                    <TabButton active={activeTab === 'followers'} onClick={() => setActiveTab('followers')} label={t("friendsModal.tabs.followers", { count: followers.length })} isDark={isDark} />
                    <TabButton active={activeTab === 'pending'} onClick={() => setActiveTab('pending')} label={t("friendsModal.tabs.pending", { count: pending.length })} isDark={isDark} />
                    <TabButton active={activeTab === 'blocked'} onClick={() => setActiveTab('blocked')} label={t("friendsModal.tabs.blocked", { count: blocked.length })} isDark={isDark} />
                </div>

                <div className="min-h-[300px] max-h-[60vh] overflow-y-auto pr-2">
                    {isLoading ? (
                        <div className="text-center mt-20 text-sm opacity-50">{t("friendsModal.loading")}</div>
                    ) : (
                        <List
                            items={currentList}
                            isRequest={activeTab === 'pending'}
                            isBlocked={activeTab === 'blocked'}
                            emptyText={t("friendsModal.empty")}
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
    <button
        onClick={onClick}
        className={`flex-1 py-3 text-[10px] md:text-xs font-bold rounded-xl transition-all ${
            active
                ? (isDark ? "bg-white/10 text-white" : "bg-white shadow-sm ring-1 ring-neutral-200")
                : "text-neutral-500 hover:text-neutral-400"
        }`}
    >
        {label}
    </button>
);

const List = ({ items, isRequest, isBlocked, emptyText, isDark, onClose, onUpdate }: any) => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleAction = async (e: React.MouseEvent, action: 'accept' | 'decline' | 'unblock', userId: string) => {
        e.stopPropagation();
        if (action === 'accept') await UserRelationsService.acceptRequest(userId);
        else if (action === 'decline') await UserRelationsService.refuseRequest(userId);
        else if (action === 'unblock') await UserRelationsService.block(userId);
        await onUpdate();
    };

    if (items.length === 0) return <div className="text-center mt-10 text-xs opacity-40">{emptyText}</div>;

    return (
        <div className="space-y-2">
            {items.map((u: any) => (
                <div key={u.id} onClick={() => { onClose(); navigate(`/users/${u.id}`); }}
                     className={`flex items-center justify-between p-5 rounded-3xl border cursor-pointer transition ${
                         isDark ? 'bg-white/5 border-white/5 hover:bg-white/[0.08]' : 'bg-neutral-50 hover:bg-white border-neutral-100'
                     }`}>
                    <span className="font-bold text-base">{u.username || u.display_name}</span>
                    <div className="flex gap-2">
                        {isRequest && (
                            <>
                                <button onClick={(e) => handleAction(e, 'accept', u.id)} className="p-2 bg-rose-500 text-white rounded-lg"><HiOutlineCheck /></button>
                                <button onClick={(e) => handleAction(e, 'decline', u.id)} className={`p-2 rounded-lg ${isDark ? "bg-white/10" : "bg-neutral-200"}`}><HiOutlineX /></button>
                            </>
                        )}
                        {isBlocked && (
                            <button onClick={(e) => handleAction(e, 'unblock', u.id)} className="text-[10px] font-bold px-3 py-1 bg-emerald-500/20 text-emerald-500 rounded-lg harmonies-hover">{t("friendsModal.unblock")}</button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};