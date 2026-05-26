import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from "expo-av";
import { Station } from "@/types/content";
import { LiveService } from "@/services/live/live.service";

/**
 * Interface PlayerContextType : Le contrat de pilotage matériel du flux audio.
 * Expose les états physiques du décodeur et les actions de contrôle de l'antenne.
 */
interface PlayerContextType {
  currentTrack: Station | null;
  liveSongTitle: string | null;
  isPlaying: boolean;
  isLoadingAudio: boolean;
  playTrack: (track: Station | null) => Promise<void>;
  togglePlay: () => Promise<void>;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

/**
 * PlayerProvider : Le contrôleur matériel et le gestionnaire de session audio de l'app.
 * Enveloppe l'application au plus haut niveau de la racine (RootLayout) pour garantir
 * qu'aucun changement de route ou navigation n'interrompe le signal audio.
 */
export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<Station | null>(null);
  const [liveSongTitle, setLiveSongTitle] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);

  // Références persistantes pour l'instance audio et le timer de polling des métadonnées live
  const soundInstance = useRef<Audio.Sound | null>(null);
  const livePollingInterval = useRef<any>(null);

  /**
   * Configuration initiale du système audio natif d'Expo.
   * Permet de définir les comportements de lecture en arrière-plan, les interruptions et les routes audio.
   * S'exécute une seule fois à l'initialisation du provider pour préparer le terrain au streaming.
   */
  useEffect(() => {
    const setupAudioSystem = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          interruptionModeIOS: InterruptionModeIOS.DoNotMix,
          playsInSilentModeIOS: true,
          interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
          playThroughEarpieceAndroid: false,
        });
      } catch (e) {
        console.error("[PlayerProvider] Erreur configuration système audio :", e);
      }
    };
    setupAudioSystem();

    /**
     * Nettoyage à la désactivation du provider : Arrêt du flux audio et libération des ressources.
     * Garantit que les ressources système sont correctement libérées pour éviter les fuites de mémoire
     * ou les conflits avec d'autres applications utilisant l'audio sur le même appareil.
     */
    return () => {
      if (soundInstance.current) {
        soundInstance.current.unloadAsync();
      }
      if (livePollingInterval.current) clearInterval(livePollingInterval.current);
    };
  }, []);

  /**
   * updateLiveMetadata : Interroge le service pour récupérer la chanson qui passe actuellement à l'antenne.
   * Enrichit dynamiquement l'UI (MiniPlayer/FullPlayer) avec les données chaudes du flux de streaming.
   */
  const updateLiveMetadata = async (stationId: string) => {
    try {
      const trackInfo = await LiveService.fetchLiveTrackInfo(stationId);
      if (trackInfo) {
        setLiveSongTitle(trackInfo.currentSongTitle);
      } else {
        setLiveSongTitle(null);
      }
    } catch (e) {
      console.error("[PlayerProvider] Impossible de récupérer les métadonnées en direct :", e);
      setLiveSongTitle(null);
    }
  };

  /**
   * playTrack : Arrête le flux précédent, instancie et décode le nouveau flux de streaming.
   * Gère la mise en cache (buffering), sécurise l'arrêt complet et démarre le cycle de rafraîchissement des morceaux.
   */
  const playTrack = async (track: Station | null) => {
    try {
      setIsLoadingAudio(true);
      setLiveSongTitle(null); // Reset du titre le temps de charger la nouvelle antenne

      // Arrêt et nettoyage de l'ancien flux audio avant d'en lancer un nouveau
      if (soundInstance.current) {
        await soundInstance.current.unloadAsync();
        soundInstance.current = null;
      }

      // Nettoyage de l'ancien intervalle de polling pour éviter les conflits de données live entre les stations
      if (livePollingInterval.current) {
        clearInterval(livePollingInterval.current);
        livePollingInterval.current = null;
      }

      /**
       * Gestion de l'arrêt complet du lecteur : Si la fonction reçoit null, cela signifie que l'on souhaite couper le flux audio. 
       * Dans ce cas, on réinitialise les états et on quitte la fonction sans tenter de charger un nouveau flux, assurant ainsi une transition propre vers un état de repos du lecteur.
        * Cela permet de différencier clairement entre le changement de station (playTrack avec une nouvelle station) et l'arrêt complet du lecteur (playTrack avec null).
       */
      if (!track) {
        setCurrentTrack(null);
        setIsPlaying(false);
        setIsLoadingAudio(false);
        return;
      }

      // Configuration de la piste active
      setCurrentTrack(track);

      // Détermination de l'URL de streaming : Priorité à l'URL fournie par le back, sinon construction d'une URL générique basée sur l'ID de la station
      const finalStreamUrl = (track as any).streamUrl || `https://icecast.radiofrance.fr/${track.id.toLowerCase()}-midfi.mp3?id=openapi`;

      if (__DEV__) console.log(`[PlayerContext] Lancement du flux natif : ${finalStreamUrl}`);

      // Création de l'instance audio avec le flux de streaming et configuration du gestionnaire de statut pour synchroniser les états de lecture et de buffering avec l'UI
      const { sound } = await Audio.Sound.createAsync(
        { uri: finalStreamUrl },
        { shouldPlay: true, isLooping: false },
        (status: any) => {
          /**
           * Gestionnaire de statut du décodeur natif : Synchronise les états physiques du moteur audio avec les états React.
           * Permet de refléter fidèlement les conditions de lecture (en cours, buffering, erreurs) dans l'UI.
           * Important pour offrir une expérience utilisateur réactive et informative, notamment en cas de problèmes réseau.
           */
          if (status.isLoaded) {
            setIsPlaying(status.isPlaying);
            setIsLoadingAudio(status.isBuffering); // Capte si le réseau ralentit (Buffering actif)
          } else if (status.error) {
            console.error(`[PlayerContext] Erreur décodeur natif : ${status.error}`);
          }
        }
      );

      soundInstance.current = sound;
      setIsLoadingAudio(false);

      /**
       * Gestion des flux live : Si la station est un flux en direct, on lance immédiatement la récupération des métadonnées live pour afficher le titre en cours.
       * Ensuite, on met en place un intervalle de polling pour rafraîchir ces métadonnées toutes les 20 secondes, garantissant que l'UI reste à jour avec le morceau diffusé en direct.
       * Cette approche permet de fournir une expérience riche et dynamique pour les stations live, où les titres changent fréquemment, tout en évitant une surcharge de requêtes réseau grâce à un intervalle raisonnable.
       * Le polling est proprement nettoyé lors du changement de station ou de l'arrêt du lecteur pour éviter les conflits de données ou les fuites de mémoire.
       */
      if (track.isLive) {
        // Récupération initiale des métadonnées live dès le lancement du flux pour afficher rapidement le titre en cours
        await updateLiveMetadata(track.id);
        // Mise en place d'un intervalle de polling pour rafraîchir les métadonnées live toutes les 20 secondes, garantissant que l'UI reste à jour avec le morceau diffusé en direct
        livePollingInterval.current = setInterval(() => updateLiveMetadata(track.id), 20000);
      }

    } catch (error) {
      console.error("[PlayerContext] Échec du chargement du flux audio :", error);
      setIsLoadingAudio(false);
      setIsPlaying(false);
    }
  };

  /**
   * togglePlay : Interrupteur matériel Play / Pause.
   * Pilote directement les états du moteur d'exécution d'Expo Audio.
   */
  const togglePlay = async () => {
    if (!soundInstance.current) return;

    try {
      if (isPlaying) {
        await soundInstance.current.pauseAsync();
        setIsPlaying(false);
      } else {
        setIsLoadingAudio(true);
        await soundInstance.current.playAsync();
        setIsPlaying(true);
        setIsLoadingAudio(false);
      }
    } catch (error) {
      console.error("[PlayerContext] Impossible de basculer la lecture :", error);
    }
  };

  return (
    <PlayerContext.Provider value={{ 
      currentTrack, 
      liveSongTitle, 
      isPlaying, 
      isLoadingAudio, 
      playTrack, 
      togglePlay 
    }}>
      {children}
    </PlayerContext.Provider>
  );
};

/**
 * usePlayer : Hook d'accès universel au lecteur.
 * Utilisable par n'importe quel élément graphique (MiniPlayer, Listes, Suggestions)
 * pour envoyer des ordres au décodeur audio centralisé.
 */
export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error("usePlayer doit être utilisé au sein d'un PlayerProvider");
  return context;
};