import { Station } from "@/types/content";
import { Brand, WebRadio } from "@/types/brand";

const avatarUrl = (title: string) => {
  const clean = encodeURIComponent(title || "Radio");
  return `https://ui-avatars.com/api/?name=${clean}&background=1A1A1A&color=FFFFFF&length=3&bold=true&uppercase=true&font-size=0.4`;
};

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

export const flattenBrandsToStations = (brands: Brand[]): Station[] => {
  const stations: Station[] = [];
  for (const brand of brands) {
    if (brand.liveStream) stations.push(mapBrandToStation(brand));
    for (const wr of brand.webRadios ?? []) {
      stations.push(mapWebRadioToStation(wr, brand));
    }
  }
  return stations;
};
