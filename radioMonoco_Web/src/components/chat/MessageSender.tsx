import { useEffect, useState } from 'react';
import { useUserCache } from '../../hooks/useUserCache';
import { useTranslation } from 'react-i18next';

export const MessageSender = ({ userId }: { userId: string }) => {
    const { getPseudo } = useUserCache();
    const { t } = useTranslation();
    const [pseudo, setPseudo] = useState<string | null>(null);

    useEffect(() => {
        getPseudo(userId).then(setPseudo);
    }, [userId, getPseudo]);

    return <span className="font-bold text-xs">{pseudo || t("common.loading")}</span>;
};