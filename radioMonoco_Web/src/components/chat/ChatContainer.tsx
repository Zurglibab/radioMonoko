import { ChatMessages } from "./ChatMessages.tsx";
import { ChatInput } from "./ChatInput.tsx";
import { useChat } from "../../hooks/useChat.ts";
import { useState } from "react";
import { HiXMark, HiChevronLeft } from "react-icons/hi2";
import type { ChatContainerProps } from "../../interfaces/Props.types.ts";
import { DEFAULT_THEME } from "../../assets/themes/DefaultTheme.ts";
import { useAppearance } from "../../context/AppearanceContext.tsx";

export const ChatContainer = ({ channelId, channelName, currentUserId, onBack, onCloseAll }: ChatContainerProps) => {
    const { messages, sendMessage, removeMessage, isLoading } = useChat(channelId, currentUserId);
    const [isMinimized, setIsMinimized] = useState(false);
    const { theme } = useAppearance();

    return (
        <div className={`w-80 flex flex-col rounded-t-2xl shadow-2xl transition-all duration-300 overflow-hidden 
            ${isMinimized ? 'h-12' : 'h-[500px]'}
            ${theme === 'dark' ? 'bg-neutral-900 border border-neutral-800' : 'bg-white border border-neutral-200'}`}>

            <div className={`h-12 px-4 flex items-center justify-between border-b cursor-pointer backdrop-blur-sm
                ${theme === 'dark' ? 'bg-neutral-800/50 border-neutral-700' : 'bg-neutral-100 border-neutral-200'}`}
                 onClick={() => setIsMinimized(!isMinimized)}>

                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); onBack(); }}
                        className={`transition-colors ${DEFAULT_THEME.text} ${theme === 'dark' ? 'hover:text-white' : 'hover:text-neutral-900'}`}
                    >
                        <HiChevronLeft size={20} />
                    </button>
                    <span className={`font-semibold text-sm truncate max-w-[150px] 
                        ${theme === 'dark' ? 'text-neutral-100' : 'text-neutral-900'}`}>
                        {channelName}
                    </span>
                </div>

                <button
                    onClick={(e) => { e.stopPropagation(); onCloseAll(); }}
                    className={`transition-colors ${theme === 'dark' ? 'text-neutral-400 hover:text-red-400' : 'text-neutral-500 hover:text-red-500'}`}
                >
                    <HiXMark size={18} />
                </button>
            </div>

            {!isMinimized && (
                <>
                    <ChatMessages
                        messages={messages}
                        currentUserId={currentUserId}
                        isLoading={isLoading}
                        removeMessage={removeMessage}
                    />
                    <ChatInput
                        onSend={sendMessage}
                        disabled={isLoading}
                    />
                </>
            )}
        </div>
    );
};