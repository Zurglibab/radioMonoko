import { useEffect, useRef } from "react";
import type { Message } from "../../interfaces/Chat.types";
import { MessageSender } from "./MessageSender";
import { DEFAULT_THEME } from "../../assets/themes/DefaultTheme.ts";
import { useAppearance } from "../../context/AppearanceContext.tsx";
import { Loader } from "../utils/Loader.tsx";

export const ChatMessages = ({
                                 messages,
                                 currentUserId,
                                 isLoading = false,
                                 removeMessage
                             }: {
    messages: Message[];
    currentUserId: string;
    isLoading?: boolean;
    removeMessage: (id: string) => void;
}) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const { theme } = useAppearance();

    useEffect(() => {
        if (scrollRef.current && !isLoading) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    if (isLoading) {
        return <Loader />;
    }

    return (
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
            {messages.length === 0 ? (
                <p className={`text-center text-sm ${theme === 'dark' ? 'text-neutral-500' : 'text-neutral-400'}`}>
                    Aucun message pour le moment.
                </p>
            ) : (
                messages.map((msg) => {
                    const isOwn = String(msg.sender_id) === String(currentUserId);
                    const isSending = msg.status === 'sending';
                    const isError = msg.status === 'error';

                    return (
                        <div key={msg.id} className={`flex group ${isOwn ? 'justify-end' : 'justify-start'}`}>
                            <div className="flex flex-col max-w-[85%]">
                                {!isOwn && (
                                    <div className="ml-2 mb-0.5">
                                        <div className={DEFAULT_THEME.text}>
                                            <MessageSender userId={msg.sender_id} />
                                        </div>
                                    </div>
                                )}

                                <div className={`relative px-4 py-2 rounded-2xl shadow-sm transition-all duration-300 ${
                                    isOwn
                                        ? (isError
                                        ? 'bg-red-950/60 border border-red-500/50 text-red-100'
                                        : `${DEFAULT_THEME.color.replace('from-', 'bg-')} text-white`) + ' rounded-tr-none'
                                        : `${theme === 'dark' ? 'bg-neutral-800 text-neutral-100' : 'bg-neutral-200 text-neutral-900'} rounded-tl-none`
                                } ${isSending ? 'opacity-70 scale-[0.98]' : 'opacity-100'}`}>

                                    {(isSending || isError) && isOwn && (
                                        <button
                                            onClick={() => removeMessage(msg.id)}
                                            className={`absolute -left-7 top-1 transition-all ${
                                                isError ? 'text-red-400 opacity-100' : 'text-neutral-500 opacity-0 group-hover:opacity-100'
                                            } hover:scale-110`}
                                        >
                                            ✕
                                        </button>
                                    )}

                                    <p className={`text-[15px] leading-relaxed ${isSending ? 'italic' : ''} ${isOwn ? 'text-white' : ''}`}>
                                        {msg.content}
                                    </p>

                                    <div className={`text-[10px] opacity-70 flex items-center justify-end gap-1.5 mt-1 ${isOwn ? 'text-white' : ''}`}>
                                        {isSending ? (
                                            <span className="flex items-center gap-1 animate-pulse">
                                                <span className="w-1.5 h-1.5 bg-current rounded-full"></span>
                                                Envoi...
                                            </span>
                                        ) : isError ? (
                                            <span className="flex items-center gap-1 text-red-500 font-medium">
                                                <span>⚠️</span> Échec
                                            </span>
                                        ) : (
                                            <span>{msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
};