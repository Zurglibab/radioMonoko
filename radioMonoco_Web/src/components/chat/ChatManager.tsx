import { useState, useEffect } from 'react';
import { ChatContainer } from './ChatContainer';
import ChatService from '../../services/ChatService';
import type { Channel } from '../../interfaces/Chat.types';
import { HiOutlineChatBubbleLeftRight, HiXMark } from 'react-icons/hi2';
import { useUserCache } from '../../hooks/useUserCache';
import { DEFAULT_THEME } from "../../assets/themes/DefaultTheme.ts";
import { useAppearance } from "../../context/AppearanceContext.tsx";

export const ChatManager = ({ currentUserId }: { currentUserId: string }) => {
    const [channels, setChannels] = useState<Channel[]>([]);
    const [channelNames, setChannelNames] = useState<Record<string, string>>({});
    const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    const { getPseudo } = useUserCache();
    const { theme } = useAppearance();

    useEffect(() => {
        ChatService.listChannels().then(setChannels).catch(console.error);
    }, []);

    useEffect(() => {
        const handleOpenChannel = (e: any) => {
            const channelId = e.detail;
            setIsOpen(true);
            setShowMenu(false);
            setActiveChannelId(channelId);
            ChatService.listChannels().then(setChannels).catch(console.error);
        };
        window.addEventListener('open-channel', handleOpenChannel);
        return () => window.removeEventListener('open-channel', handleOpenChannel);
    }, []);

    useEffect(() => {
        channels.forEach(async (c) => {
            if (c.type?.startsWith("DM:")) {
                const parts = c.type.split(':');
                const otherUserId = parts[1] === currentUserId ? parts[2] : parts[1];
                const name = await getPseudo(otherUserId);
                setChannelNames(prev => ({ ...prev, [c.id]: name }));
            } else {
                setChannelNames(prev => ({ ...prev, [c.id]: c.type || "Salon" }));
            }
        });
    }, [channels, currentUserId, getPseudo]);

    const toggleChat = () => {
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
                        channelName={channelNames[activeChannelId] || "Chargement..."}
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
                            Conversations
                        </p>
                        <button onClick={toggleChat} className={`${theme === 'dark' ? 'text-neutral-500 hover:text-white' : 'text-neutral-400 hover:text-neutral-900'}`}>
                            <HiXMark size={16}/>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto scrollbar-thin">
                        {channels.map((c) => (
                            <button
                                key={c.id}
                                onClick={() => { setActiveChannelId(c.id); setShowMenu(false); }}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 
                                ${DEFAULT_THEME.bgHover}
                                ${theme === 'dark' ? 'text-neutral-300' : 'text-neutral-700'}`}
                            >
                                {channelNames[c.id] || "Chargement..."}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <button
                onClick={toggleChat}
                style={{ boxShadow: isOpen ? `0 0 20px ${DEFAULT_THEME.glow}` : 'none' }}
                className={`w-12 h-12 rounded-full shadow-xl flex items-center justify-center pointer-events-auto transition-all z-[70] hover:scale-105
                    ${theme === 'dark' ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-900 border border-neutral-200'}
                    hover:text-rose-500`}
            >
                <HiOutlineChatBubbleLeftRight size={24} />
            </button>
        </div>
    );
};