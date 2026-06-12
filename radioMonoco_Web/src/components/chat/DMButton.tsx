import { useState } from 'react';
import ChatService from '../../services/ChatService';
import { FiMessageSquare } from "react-icons/fi";
import { useTranslation } from "react-i18next";

export const DMButton = ({ otherUserId, currentUserId }: {
    otherUserId: string,
    currentUserId: string
}) => {
    const { t } = useTranslation();
    const [isStarting, setIsStarting] = useState(false);

    const startDM = async () => {
        if (isStarting) return;
        setIsStarting(true);
        try {
            const channels = await ChatService.listChannels();
            const type = `DM:${[currentUserId, otherUserId].sort().join(':')}`;
            const existingChannel = channels.find(c => c.type === type);

            let channelId;
            if (existingChannel) {
                channelId = existingChannel.id;
            } else {
                const newChannel = await ChatService.createChannel(type);
                await ChatService.addMember(newChannel.id, currentUserId);
                await ChatService.addMember(newChannel.id, otherUserId);
                channelId = newChannel.id;
            }
            window.dispatchEvent(new CustomEvent('open-channel', { detail: channelId }));
        } catch (err) {
            console.error("Erreur MP", err);
        } finally {
            setIsStarting(false);
        }
    };

    return (
        <button
            onClick={startDM}
            disabled={isStarting}
            className={`flex items-center justify-center gap-2.5 px-5 py-3 rounded-full font-semibold transition-all duration-300 bg-neutral-800 hover:bg-neutral-700 text-white border border-white/5 hover:border-white/20 shadow-lg shadow-black/20 ${isStarting ? 'opacity-50 cursor-wait' : ''}`}
        >
            <FiMessageSquare size={18} />
            <span>{isStarting ? t("chat.opening", "Ouverture...") : t("chat.message", "Message")}</span>
        </button>
    );
};