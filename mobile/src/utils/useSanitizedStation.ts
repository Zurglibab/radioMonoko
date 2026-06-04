import { useCallback } from "react";

export const useSanitizedStation = () => {
  const sanitizeStationId = useCallback((
    rawApiId: string | null | undefined, 
    title = "", 
    description = ""
  ): string => {
    const id = rawApiId ? rawApiId.trim().toUpperCase() : "";
    const isUuid = id.includes("-") || id.length > 25;

    // Si l'identifiant est déjà une chaîne valide propre (pas un UUID), on le garde !
    if (!isUuid && id) {
      return id;
    }

    // Sinon, scan textuel intelligent basé sur la liste officielle des Brands
    const searchTarget = `${title} ${description}`.toLowerCase();

    // franceinfo
    if (searchTarget.includes("info")) return "FRANCEINFO";

    // France Musique & Webradios
    if (searchTarget.includes("musique")) {
      if (searchTarget.includes("zen")) return "FRANCEMUSIQUE_PIANO_ZEN";
      if (searchTarget.includes("easy")) return "FRANCEMUSIQUE_CLASSIQUE_EASY";
      if (searchTarget.includes("concert")) return "FRANCEMUSIQUE_CONCERT_RF";
      if (searchTarget.includes("jazz")) return "FRANCEMUSIQUE_LA_JAZZ";
      if (searchTarget.includes("film") || searchTarget.includes(" bo ")) return "FRANCEMUSIQUE_LA_BO";
      if (searchTarget.includes("opera")) return "FRANCEMUSIQUE_OPERA";
      if (searchTarget.includes("baroque")) return "FRANCEMUSIQUE_LA_BAROQUE";
      return "FRANCEMUSIQUE";
    }

    // France Culture
    if (searchTarget.includes("culture")) return "FRANCECULTURE";

    // Mouv'
    if (searchTarget.includes("mouv")) return "MOUV";

    // FIP & Webradios
    if (searchTarget.includes("fip")) {
      if (searchTarget.includes("rock")) return "FIP_ROCK";
      if (searchTarget.includes("jazz")) return "FIP_JAZZ";
      if (searchTarget.includes("groove")) return "FIP_GROOVE";
      if (searchTarget.includes("monde") || searchTarget.includes("world")) return "FIP_WORLD";
      if (searchTarget.includes("reggae")) return "FIP_REGGAE";
      if (searchTarget.includes("electro")) return "FIP_ELECTRO";
      if (searchTarget.includes("pop")) return "FIP_POP";
      if (searchTarget.includes("hip")) return "FIP_HIP_HOP";
      if (searchTarget.includes("metal")) return "FIP_METAL";
      return "FIP";
    }

    // France Bleu & Régionales (Ici / France Bleu)
    if (searchTarget.includes("bleu") || searchTarget.includes("ici ")) {
      if (searchTarget.includes("paris")) return "FRANCEBLEU_PARIS";
      if (searchTarget.includes("alsace")) return "FRANCEBLEU_ALSACE";
      if (searchTarget.includes("armorique")) return "FRANCEBLEU_ARMORIQUE";
      if (searchTarget.includes("gironde")) return "FRANCEBLEU_GIRONDE";
      if (searchTarget.includes("provence")) return "FRANCEBLEU_PROVENCE";
      if (searchTarget.includes("chanson")) return "FRANCEBLEU_CHANSON_FRANCAISE";
      return "FRANCEBLEU";
    }

    return "FRANCEINTER";
  }, []);

  return { sanitizeStationId };
};