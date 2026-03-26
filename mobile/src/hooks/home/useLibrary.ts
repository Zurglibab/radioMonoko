import { useState, useMemo, useEffect } from "react";
import { Alert } from "react-native";
import { Station, Playlist, MediaStatus } from "@/types/content";

/**
 * Store global
 * Ces variables persistent tant que l'application est ouverte.
 * Elles permettent de partager les données entre différents écrans 
 * sans avoir besoin d'un Context API complexe.
 */
let globalUserContent: (Station & { status: MediaStatus })[] = [
  { 
    id: 'r1', 
    title: 'FIP Rock', 
    artist: 'Radio France', 
    imageUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?auto=format&fit=crop&w=500&q=80', 
    type: 'radio', 
    isLive: true, 
    category: 'Rock', 
    description: 'Le meilleur du rock.', 
    status: 'in-progress' 
  },
  { 
    id: 'p1', 
    title: 'L’Heure du Monde', 
    artist: 'Le Monde', 
    imageUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=500&q=80', 
    type: 'podcast', 
    duration: '24 min', 
    category: 'Infos', 
    isLive: false, 
    description: 'Le podcast quotidien du Monde.', 
    status: 'finished' 
  },
  { 
    id: 'p3', 
    title: 'Affaires Sensibles', 
    artist: 'France Inter', 
    imageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=500&q=80', 
    type: 'podcast', 
    duration: '52 min', 
    category: 'Histoire', 
    isLive: false, 
    description: 'Les grandes affaires du siècle.', 
    status: 'to-listen' 
  },
  { 
    id: 'r4', 
    title: 'Radio Meuh', 
    artist: 'La Clusaz', 
    imageUrl: 'https://images.unsplash.com/photo-1459749411177-042180ec75c0?auto=format&fit=crop&w=500&q=80', 
    type: 'radio', 
    isLive: true, 
    category: 'Electronic', 
    description: 'Enjoy Music from Reblochonland.', 
    status: 'dropped' 
  },
];

let globalPlaylists: Playlist[] = [
  { 
    id: 'pl1', 
    name: 'Session Travail', 
    creator: 'Vous', 
    description: 'Focus et concentration', 
    coverImage: 'https://picsum.photos/405/405', 
    items: [], 
    isPublic: false,
    isCollaborative: false,
    createdAt: '2026-03-20' 
  }
];

/**
 * Système de notifications
 * Un pattern simple pour forcer la mise à jour de tous les 
 * composants utilisant useLibrary quand une donnée change globalement.
 */
const listeners = new Set<() => void>();
const notify = () => listeners.forEach(listener => listener());

export const useLibrary = () => {
  // États locaux synchronisés avec le store global
  const [activeTab, setActiveTab] = useState<'Tout' | 'Radios' | 'Podcasts' | 'Playlists'>('Tout');
  const [content, setContent] = useState(globalUserContent);
  const [playlistsState, setPlaylistsState] = useState(globalPlaylists);

  /**
   * Synchronisation au montage : on s'abonne aux changements globaux.
   */
  useEffect(() => {
    const handleChange = () => {
      setContent([...globalUserContent]);
      setPlaylistsState([...globalPlaylists]);
    };
    listeners.add(handleChange);
    return () => { listeners.delete(handleChange); };
  }, []);

  /**
   * Mémos : Calcul des compteurs de statuts pour l'UI
   */
  const statusItems = useMemo(() => [
    { name: 'À écouter', slug: 'to-listen', count: content.filter(m => m.status === 'to-listen').length },
    { name: 'En cours', slug: 'in-progress', count: content.filter(m => m.status === 'in-progress').length },
    { name: 'Terminé', slug: 'finished', count: content.filter(m => m.status === 'finished').length },
    { name: 'Abandonné', slug: 'dropped', count: content.filter(m => m.status === 'dropped').length },
  ], [content]);

  /**
   * Actions métiers (Favoris, Statuts, Playlists)
   */
  const toggleFavorite = (station: Station) => {
    const exists = globalUserContent.find(item => item.id === station.id);
    if (exists) {
      globalUserContent = globalUserContent.filter(item => item.id !== station.id);
      Alert.alert("Favoris", "Retiré de votre collection");
    } else {
      globalUserContent = [...globalUserContent, { ...station, status: 'to-listen' }];
      Alert.alert("Favoris", "Ajouté à vos Titres Likés");
    }
    notify(); // On prévient tout le monde que la liste a changé
  };

  const updateStatus = (stationId: string, newStatus: MediaStatus) => {
    globalUserContent = globalUserContent.map(item => 
      item.id === stationId ? { ...item, status: newStatus } : item
    );
    notify();
  };

  const addStationToPlaylist = (playlistId: string, station: Station) => {
    globalPlaylists = globalPlaylists.map(pl => {
      if (pl.id === playlistId) {
        if (pl.items.find(i => i.id === station.id)) return pl; // Évite les doublons
        return { ...pl, items: [...pl.items, station] };
      }
      return pl;
    });
    notify();
    Alert.alert("Playlist", `Ajouté à la playlist avec succès !`);
  };

  const createPlaylistWithMedia = (name: string, station: Station) => {
    const newPlaylist: Playlist = {
      id: Math.random().toString(36).substr(2, 9),
      name: name || "Ma Nouvelle Playlist",
      creator: "Vous",
      description: "Playlist personnalisée",
      coverImage: station.imageUrl || 'https://picsum.photos/400/400',
      items: station.id ? [station] : [],
      isPublic: false,
      isCollaborative: false,
      createdAt: new Date().toISOString()
    };
    globalPlaylists = [newPlaylist, ...globalPlaylists];
    notify();
    Alert.alert("Succès", `Playlist "${newPlaylist.name}" créée !`);
  };

  const renamePlaylist = (id: string, newName: string) => {
    globalPlaylists = globalPlaylists.map(pl => 
      pl.id === id ? { ...pl, name: newName } : pl
    );
    notify();
    Alert.alert("Playlist", "Le nom a été modifié.");
  };

  const toggleVisibility = (id: string) => {
    globalPlaylists = globalPlaylists.map(pl => {
      if (pl.id === id) {
        const newState = !pl.isPublic;
        Alert.alert("Visibilité", newState ? "La playlist est maintenant publique 🌍" : "La playlist est maintenant privée 🔒");
        return { ...pl, isPublic: newState };
      }
      return pl;
    });
    notify();
  };

  const toggleCollaboration = (id: string) => {
    globalPlaylists = globalPlaylists.map(pl => {
      if (pl.id === id) {
        const newState = !pl.isCollaborative;
        Alert.alert("Collaboration", newState ? "Mode collaboratif activé 🤝" : "Mode collaboratif désactivé");
        return { ...pl, isCollaborative: newState };
      }
      return pl;
    });
    notify();
  };

  const removePlaylist = (id: string) => {
    globalPlaylists = globalPlaylists.filter(pl => pl.id !== id);
    notify();
  };

  return { 
    activeTab, 
    favorites: content, 
    playlists: playlistsState, 
    statusItems,
    setActiveTab, 
    removePlaylist, 
    toggleFavorite,
    updateStatus, 
    addStationToPlaylist, 
    createPlaylistWithMedia,
    renamePlaylist,
    toggleVisibility,
    toggleCollaboration,
    getItemsByStatus: (slug: string) => content.filter(item => item.status === slug)
  };
};