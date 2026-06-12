import { useEffect, useState } from 'react';
import { useUserCache } from '../../hooks/useUserCache';

export const MessageSender = ({ userId }: { userId: string }) => {
    const { getPseudo } = useUserCache();
    const [pseudo, setPseudo] = useState("Chargement...");

    useEffect(() => {
        getPseudo(userId).then(setPseudo);
    }, [userId, getPseudo]);

    return <span className="font-bold text-xs">{pseudo}</span>;
};