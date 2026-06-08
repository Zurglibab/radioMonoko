import { Station } from "@/types/content";
import { Brand, WebRadio } from "@/types/brand";

const avatarUrl = (title: string) => {
  const clean = encodeURIComponent(title || "Radio");
  return `https://ui-avatars.com/api/?name=${clean}&background=1A1A1A&color=FFFFFF&length=3&bold=true&uppercase=true&font-size=0.4`;
};

/**
 * mapBrandToStation : Mappe une marque (Brand) en une station (Station) pour l'affichage dans l'application.
 * Les champs de la marque sont utilisés pour remplir les informations de la station, avec des valeurs par défaut si nécessaire.
 * Le streamUrl est défini uniquement si la marque a un liveStream actif, sinon il est omis pour éviter les erreurs de lecture.
 * @param brand 
 * @returns 
 */
export const mapBrandToStation = (brand: Brand): Station => ({
  id: brand.id,
  title: brand.title || "Station inconnue",
  artist: brand.baseline || "Radio France",
  description: brand.description || "Aucune description.",
  imageUrl: avatarUrl(brand.title),
  isLive: !!brand.liveStream,
  category: "Radio France",
  type: 'radio',
  streamUrl: brand.liveStream || undefined,
});

/**
 * mapWebRadioToStation : WebRadio secondaire, Station sans streamUrl (car souvent non fonctionnel), mais avec les infos de la marque parente pour l'affichage.
 * Le streamUrl est volontairement omis pour éviter les erreurs de lecture, mais la catégorie est enrichie avec le titre de la marque parente.
 * Les autres champs sont mappés de manière similaire à la marque principale, avec des valeurs par défaut si nécessaire.
 * @param webRadio 
 * @param parent 
 * @returns 
 */
export const mapWebRadioToStation = (webRadio: WebRadio, parent: Brand): Station => ({
  id: webRadio.id,
  title: webRadio.title || "Station inconnue",
  artist: parent.title || "Radio France",
  description: webRadio.description || "Aucune description.",
  imageUrl: avatarUrl(webRadio.title),
  isLive: !!webRadio.liveStream,
  category: parent.title,
  type: 'radio',
  streamUrl: webRadio.liveStream || undefined,
  brandId: parent.id,
});
