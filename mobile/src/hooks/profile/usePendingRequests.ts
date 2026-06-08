import { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import { SocialService } from "@/services/social/social.service";
import { PendingFriendRequest } from "@/types/social";

/**
 * usePendingRequests : Hook personnalisé pour gérer les demandes d'amitié en attente.
 * Il récupère la liste des demandes d'amitié reçues, et fournit des fonctions pour accepter ou refuser ces demandes.
 * @param token 
 * @returns 
 */
export const usePendingRequests = (token: string | null) => {
  const [requests, setRequests] = useState<PendingFriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [respondingId, setRespondingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await SocialService.fetchPendingRequests(token);
      setRequests(Array.isArray(data) ? data : []);
    } catch {
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const accept = async (fromUserId: string) => {
    if (!token) return;
    setRespondingId(fromUserId);
    try {
      await SocialService.acceptRequest(token, fromUserId);
      setRequests((prev) => prev.filter((r) => r.id !== fromUserId));
    } catch {
      Alert.alert("Erreur", "Impossible d'accepter cette demande.");
    } finally {
      setRespondingId(null);
    }
  };

  const refuse = async (fromUserId: string) => {
    if (!token) return;
    setRespondingId(fromUserId);
    try {
      await SocialService.refuseRequest(token, fromUserId);
      setRequests((prev) => prev.filter((r) => r.id !== fromUserId));
    } catch {
      Alert.alert("Erreur", "Impossible de refuser cette demande.");
    } finally {
      setRespondingId(null);
    }
  };

  return { requests, isLoading, respondingId, accept, refuse };
};
