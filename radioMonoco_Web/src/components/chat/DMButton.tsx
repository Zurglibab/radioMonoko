import ChatService from '../../services/ChatService';

export const  DMButton = ({ otherUserId, currentUserId }: { otherUserId: string, otherUserName: string, currentUserId: string }) => {

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
        <button onClick={startDM} className="...">
            Message Privé
        </button>
    );
};