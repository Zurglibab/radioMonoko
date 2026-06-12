import { useColorScheme } from "react-native";
import { useAuthContext } from "@/context/AuthContext";
import { theme } from "@/constants/theme";

export const useIsDarkMode = () => {
  const { appearanceSettings } = useAuthContext();
  const systemTheme = useColorScheme();

  return appearanceSettings.themeMode === 'system'
    ? systemTheme === 'dark'
    : appearanceSettings.themeMode === 'dark';
};

export const useThemeColors = () => {
  const isDark = useIsDarkMode();
  return isDark ? theme.dark.colors : theme.light.colors;
};