/**
 * Design System de l'application.
 * Optimisé pour une lisibilité maximale et un aspect Premium.
 */
export const theme = {
  light: {
    colors: {
      primary: "#000000",      
      secondary: "#FFFFFF",    
      background: "#F9FAFB",
      
      // Surface pour les cartes et les inputs
      surface: "#FFFFFF",      
      
      text: "#111827",         // Bleu-noir très profond
      muted: "#6B7280",        // Gris moyen pour les labels
      
      // Bordures
      border: "#E5E7EB",       // Gris clair
      
      // Accents et états
      accent: "#000000",       
      live: "#FF3B30",         // Rouge Live
      success: "#34C759",      // Vert système
      warning: "#FF9500",      // Orange système
      danger: "#FF3B30",       
    },
  },
  dark: {
    colors: {
      primary: "#FFFFFF",      
      secondary: "#000000",    
      background: "#000000",
      surface: "#121212",      // Gris anthracite pour les cartes et les inputs
      
      text: "#FFFFFF",         
      muted: "#9CA3AF",        
      border: "#262626",       
      
      accent: "#FFFFFF",
      live: "#FF453A",         
      success: "#32D74B",
      warning: "#FF9F0A",
      danger: "#FF453A",
    },
  },
} as const;

export type ThemeName = keyof typeof theme;
export type ThemeColorName = keyof typeof theme.light.colors;