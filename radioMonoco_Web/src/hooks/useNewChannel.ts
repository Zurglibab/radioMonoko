import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../context/AuthContext.tsx";
import ChatService from "../services/ChatService.ts";
import type { Channel } from "../interfaces/Chat.types";

const POLL_INTERVAL = 30_000;

export const useNewChannel = () => {
    const { user } = useAuth();
    const [channels, setChannels] = useState<Channel[]>([]);
    const [hasNewChannel, setHasNewChannel] = useState<boolean>(false);
    const [newChannelIds, setNewChannelIds] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const intervalRef = useRef<number | null>(null);
    const knownChannelIds = useRef<Set<string>>(new Set());

    const checkForNewChannels = useCallback(async (silent = false) => {
        const token = localStorage.getItem('token');
        if (!token || !user?.id) return;

        if (!silent) setIsLoading(true);
        try {
            const fetchedChannels = await ChatService.listChannels();

            if (knownChannelIds.current.size > 0) {
                const newChannels = fetchedChannels.filter(c => !knownChannelIds.current.has(c.id));
                if (newChannels.length > 0) {
                    console.log("[useNewChannel] Nouveau(x) canal(aux) détecté(s) :", newChannels);
                    setHasNewChannel(true);
                    setNewChannelIds(prev => new Set([...prev, ...newChannels.map(c => c.id)]));
                }
            }

            fetchedChannels.forEach(c => knownChannelIds.current.add(c.id));
            setChannels(fetchedChannels);
            setError(null);
        } catch (err: any) {
            if (err.code !== 'ERR_CANCELED') {
              if (!silent) setError("Impossible de charger les canaux.");
            }
            return err;
        } finally {
            if (!silent) setIsLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        if (user) {
            ChatService.listChannels().then(fetchedChannels => {
                fetchedChannels.forEach(c => knownChannelIds.current.add(c.id));
                setChannels(fetchedChannels);
                console.log("[useNewChannel] Canaux initiaux chargés :", fetchedChannels.length);
                setIsLoading(false);
            }).catch((err) => {
                if (err.code !== 'ERR_CANCELED') {
                  setError("Impossible de charger les canaux initiaux.");
                }
                setIsLoading(false);
            });
        }
    }, [user]);

    useEffect(() => {
        if (!user) return;

        const stopPolling = () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };

        const startPolling = () => {
            stopPolling();
            intervalRef.current = setInterval(() => checkForNewChannels(true), POLL_INTERVAL);
        };

        const handleVisibilityChange = () => {
            if (document.hidden) {
                stopPolling();
            } else {
                checkForNewChannels(true);
                startPolling();
            }
        };

        startPolling();
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            stopPolling();
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [user, checkForNewChannels]);

    const resetNewChannelFlag = useCallback(() => {
        setHasNewChannel(false);
        setNewChannelIds(new Set());
    }, []);

    return {
        channels,
        hasNewChannel,
        newChannelIds,
        isLoading,
        error,
        resetNewChannelFlag,
        refetch: checkForNewChannels,
    };
};
