import { Station } from "@/types/content";

/**
 * mapBrandToStation : Fonction de transformation des données de l'API en format Station.
 * Prend un objet brut de l'API et le convertit en un objet Station adapté à l'affichage dans l'UI.
 * Gère les champs manquants avec des valeurs par défaut et génère une image dynamique si nécessaire.
 * @param brand - L'objet brut de l'API représentant une marque ou une station.
 * @returns Un objet Station formaté pour l'UI.
 */
export const mapBrandToStation = (brand: any): Station => {
  const cleanTitle = brand.title ? encodeURIComponent(brand.title) : "Radio";
  const ImageUrl = `https://ui-avatars.com/api/?name=${cleanTitle}&background=1A1A1A&color=FFFFFF&length=3&bold=true&uppercase=true&font-size=0.4`;

  // Construction de l'objet Station avec des valeurs par défaut pour les champs manquants
  return {
    id: brand.id,
    title: brand.title || "Station inconnue",
    artist: brand.baseline || "Radio Monoco", 
    description: brand.description || "Aucune description.",
    imageUrl: ImageUrl, 
    isLive: !!brand.liveStream,
    category: "Radio France",
    type: 'radio'
  };
};