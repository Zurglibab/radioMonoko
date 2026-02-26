import React, { createContext, useContext, useState } from "react";

/**
 * Interface Track : Modèle de métadonnées pour le lecteur.
 * Contient tout ce dont le MiniPlayer et le Plein Écran ont besoin pour l'affichage.
 */
interface Track {
  id: string;
  title: string;
  artist: string;
  image: string;
}

/**
 * Interface PlayerContextType : Le contrat de pilotage du flux audio.
 * Définit comment commander la lecture depuis n'importe quel point de l'app.
 */
interface PlayerContextType {
  currentTrack: Track | null; // Le média chargé (null si rien n'est sélectionné)
  isPlaying: boolean;         // État de lecture (Lecture / Pause)
  playTrack: (track: Track) => void; // Fonction pour charger un nouveau morceau
  togglePlay: () => void;     // Fonction pour basculer l'état Play/Pause
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

/**
 * PlayerProvider : Le chef d'orchestre de RadioMonoko.
 * Enveloppe l'application pour maintenir la session audio active durant la navigation.
 */
export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // État de la piste actuelle
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  // État binaire de lecture
  const [isPlaying, setIsPlaying] = useState(false);

  /**
   * playTrack : Action d'injection d'un média.
   * Remplace la piste actuelle et lance la lecture automatiquement.
   */
  const playTrack = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true); 
  };

  /**
   * togglePlay : Bascule simple de l'état de lecture.
   */
  const togglePlay = () => setIsPlaying(!isPlaying);

  return (
    <PlayerContext.Provider 
      value={{ 
        currentTrack, 
        isPlaying, 
        playTrack, 
        togglePlay 
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

/**
 * usePlayer : Hook de consommation du lecteur.
 * Permet à n'importe quel composant (MediaSuggestion, MiniPlayer) de piloter l'audio.
 */
export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error("usePlayer doit être utilisé au sein d'un PlayerProvider");
  return context;
};