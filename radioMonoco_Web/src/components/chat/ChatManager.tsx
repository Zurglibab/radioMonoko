import { useState, useEffect } from 'react';
import { ChatContainer } from './ChatContainer';
import { HiOutlineChatBubbleLeftRight, HiXMark } from 'react-icons/hi2';
import { useUserCache } from '../../hooks/useUserCache';
import { DEFAULT_THEME } from "../../assets/themes/DefaultTheme.ts";
import { useAppearance } from "../../context/AppearanceContext.tsx";
import { useTranslation } from "react-i18next";
import { useNewChannel } from '../../hooks/useNewChannel';

export const ChatManager = ({ currentUserId }: { currentUserId: string }) => {
    const [channelNames, setChannelNames] = useState<Record<string, string>>({});
    const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    const { getPseudo } = useUserCache();
    const { theme } = useAppearance();
    const { t } = useTranslation();
    const { channels, hasNewChannel, newChannelIds, resetNewChannelFlag, refetch } = useNewChannel();

    useEffect(() => {
        const handleOpenChannel = (e: any) => {
            const channelId = e.detail;
            setIsOpen(true);
            setShowMenu(false);
            setActiveChannelId(channelId);
            resetNewChannelFlag();
            refetch();
        };
        window.addEventListener('open-channel', handleOpenChannel);
        return () => window.removeEventListener('open-channel', handleOpenChannel);
    }, [resetNewChannelFlag, refetch]);

    useEffect(() => {
        channels.forEach(async (c) => {
            if (c.type?.startsWith("DM:")) {
                const parts = c.type.split(':');
                const otherUserId = parts[1] === currentUserId ? parts[2] : parts[1];
                const name = await getPseudo(otherUserId);
                setChannelNames(prev => ({ ...prev, [c.id]: name }));
            } else {
                setChannelNames(prev => ({ ...prev, [c.id]: c.type || t("chat.room") }));
            }
        });
    }, [channels, currentUserId, getPseudo, t]);

    const toggleChat = () => {
        if (!isOpen) {
            resetNewChannelFlag();
        }
        setIsOpen(!isOpen);
        setShowMenu(!isOpen);
        setActiveChannelId(null);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 pointer-events-none">
            {isOpen && activeChannelId && (
                <div className="pointer-events-auto mb-2 shadow-2xl z-[70]">
                    <ChatContainer
                        channelId={activeChannelId}
                        channelName={channelNames[activeChannelId] || t("chat.loading")}
                        currentUserId={currentUserId}
                        onBack={() => { setActiveChannelId(null); setShowMenu(true); }}
                        onCloseAll={() => { setIsOpen(false); setActiveChannelId(null); setShowMenu(false); }}
                    />
                </div>
            )}

            {isOpen && showMenu && !activeChannelId && (
                <div className={`w-64 h-80 flex flex-col rounded-xl shadow-2xl p-2 pointer-events-auto mb-2 z-[60] transition-colors
                    ${theme === 'dark' ? 'bg-neutral-900 border border-neutral-800' : 'bg-white border border-neutral-200'}`}>

                    <div className="flex justify-between items-center px-3 py-2 shrink-0">
                        <p className={`text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-neutral-500' : 'text-neutral-400'}`}>
                            {t("chat.conversations")}
                        </p>
                        <button onClick={toggleChat} className={`${theme === 'dark' ? 'text-neutral-500 hover:text-white' : 'text-neutral-400 hover:text-neutral-900'}`}>
                            <HiXMark size={16}/>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto scrollbar-thin">
                        {channels.map((c) => {
                            const isNew = newChannelIds.has(c.id);
                            return (
                                <button
                                    key={c.id}
                                    onClick={() => { setActiveChannelId(c.id); setShowMenu(false); }}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center justify-between gap-2 
                                    ${DEFAULT_THEME.bgHover}
                                    ${isNew ? (theme === 'dark' ? 'bg-rose-500/10 text-rose-400 font-medium' : 'bg-rose-50 text-rose-600 font-medium') : (theme === 'dark' ? 'text-neutral-300' : 'text-neutral-700')}`}
                                >
                                    <span className="truncate">{channelNames[c.id] || t("chat.loading")}</span>
                                    {isNew && <span className="shrink-0 w-2 h-2 rounded-full bg-rose-500" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            <button
                onClick={toggleChat}
                style={{ boxShadow: isOpen ? `0 0 20px ${DEFAULT_THEME.glow}` : 'none' }}
                className={`w-12 h-12 rounded-full shadow-xl flex items-center justify-center pointer-events-auto transition-all z-[70] hover:scale-105 relative
                    ${theme === 'dark' ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-900 border border-neutral-200'}
                    hover:text-rose-500`}
            >
                <HiOutlineChatBubbleLeftRight size={24} />
                {hasNewChannel && !isOpen && (
                    <span className="absolute top-0 right-0 w-3 h-3 bg-rose-500 border-2 border-white dark:border-neutral-900 rounded-full" />
                )}
            </button>
        </div>
    );
};
