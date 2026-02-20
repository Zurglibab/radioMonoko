/**
 * Design System de l'application.
 * * Centralise les couleurs pour les modes Light et Dark afin d'assurer
 * une cohérence visuelle sur l'ensemble des composants.
 * Utilise l'assertion 'as const' pour garantir l'immutabilité et permettre l'inférence de types.
 */
export const theme = {
  light: {
    colors: {
      // Identité visuelle, contraste élevé basé sur un duo Noir/Blanc
      primary: "#000000",      // Actions principales, boutons dominants
      secondary: "#FFFFFF",    // Éléments de contraste
      background: "#FFFFFF",   // Arrière-plan principal
      surface: "#F3F4F6",      // Composants de second plan (badges, champs de saisie)
      
      // Hiérarchie de texte
      text: "#000000",         // Titres et corps de texte
      muted: "#6B7280",        // Labels, placeholders et textes secondaires
      border: "#E5E7EB",       // Délimitation discrète des éléments
      
      // États et indicateurs fonctionnels
      accent: "#000000",       
      live: "#EF4444",         // Utilisé pour les indicateurs de direct ou états critiques
      success: "#10B981",      // Validation et succès
      warning: "#F59E0B",      // Alertes non-bloquantes
      danger: "#EF4444",       // Erreurs et actions destructives
    },
  },
  dark: {
    colors: {
      // Adaptation Dark Mode : Focus sur le confort visuel et le noir OLED
      primary: "#FFFFFF",      
      secondary: "#000000",    
      background: "#000000",   // Full Black 
      surface: "#111111",      // Surélévation visuelle (Card/Modal) sur fond noir
      
      text: "#FFFFFF",         
      muted: "#888888",        
      border: "#222222",       
      
      // Accents pour une meilleure luminance sur fond sombre
      accent: "#FFFFFF",
      live: "#FF453A",         
      success: "#34D399",
      warning: "#FBBF24",
      danger: "#F87171",
    },
  },
} as const;

/**
 * Types utilitaires extraits du thème.
 * Permettent de typer les props des composants
 * pour profiter de l'autocomplétion et éviter les erreurs de saisie.
 */
export type ThemeName = keyof typeof theme;
export type ThemeColorName = keyof typeof theme.light.colors;