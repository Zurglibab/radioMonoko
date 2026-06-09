import ChatService from '../../services/ChatService';
import { FiMessageSquare } from "react-icons/fi";

export const DMButton = ({ otherUserId, currentUserId }: {
    otherUserId: string,
    currentUserId: string
}) => {

    const startDM = async () => {
        try {
            const channels = await ChatService.listChannels();
            const existingChannel = channels.find(c =>
                c.type === `DM:${[currentUserId, otherUserId].sort().join(':')}`
            );

            if (existingChannel) {
                window.dispatchEvent(new CustomEvent('open-channel', { detail: existingChannel.id }));
            } else {
                const newChannel = await ChatService.createChannel(
                    `DM:${[currentUserId, otherUserId].sort().join(':')}`
                );
                await ChatService.addMember(newChannel.id, currentUserId);
                await ChatService.addMember(newChannel.id, otherUserId);
                window.dispatchEvent(new CustomEvent('open-channel', { detail: newChannel.id }));
            }
        } catch (err) {
            console.error("Erreur MP", err);
        }
    };

    return (
        <button
            onClick={startDM}
            className="flex items-center justify-center gap-2.5 px-5 py-3 rounded-full font-semibold transition-all duration-300 bg-neutral-800 hover:bg-neutral-700 text-white border border-white/5 hover:border-white/20 shadow-lg shadow-black/20"
        >
            <FiMessageSquare size={18} />
            <span>Message</span>
        </button>
    );
};