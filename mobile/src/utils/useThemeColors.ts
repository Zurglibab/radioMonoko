import { useColorScheme } from "react-native";
import { useAuthContext } from "@/context/AuthContext";
import { theme } from "@/constants/theme";

export const useThemeColors = () => {
  const { appearanceSettings } = useAuthContext();
  const systemTheme = useColorScheme();

  const isDark = appearanceSettings.themeMode === 'system'
    ? systemTheme === 'dark'
    : appearanceSettings.themeMode === 'dark';

  return isDark ? theme.dark.colors : theme.light.colors;
};