import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Theme, ThemeColors } from "../types/chore";

export const themes: Theme[] = [
  {
    id: "8bit-classic",
    name: "8-Bit Classic",
    light: {
      background: "#CFEFEC",
      text: "#80171F",
      secondaryText: "#3D3737",
      accents: ["#2584BC", "#06A7A1", "#70A780", "#C0A77F"],
    },
    dark: {
      background: "#3D3737",
      text: "#CFEFEC",
      secondaryText: "#B8D4D2",
      accents: ["#2584BC", "#06A7A1", "#70A780", "#C0A77F"],
    },
  },
  {
    id: "ocean-blue",
    name: "Ocean Blue",
    light: {
      background: "#E0F7FA",
      text: "#01579B",
      secondaryText: "#263238",
      accents: ["#0277BD", "#00ACC1", "#4DD0E1", "#80DEEA"],
    },
    dark: {
      background: "#263238",
      text: "#E0F7FA",
      secondaryText: "#B2EBF2",
      accents: ["#0277BD", "#00ACC1", "#4DD0E1", "#80DEEA"],
    },
  },
  {
    id: "sunset-orange",
    name: "Sunset Orange",
    light: {
      background: "#FFF3E0",
      text: "#E65100",
      secondaryText: "#3E2723",
      accents: ["#F57C00", "#FF6F00", "#FFB74D", "#FFCC80"],
    },
    dark: {
      background: "#3E2723",
      text: "#FFF3E0",
      secondaryText: "#FFCCBC",
      accents: ["#F57C00", "#FF6F00", "#FFB74D", "#FFCC80"],
    },
  },
  {
    id: "forest-green",
    name: "Forest Green",
    light: {
      background: "#E8F5E9",
      text: "#1B5E20",
      secondaryText: "#263238",
      accents: ["#2E7D32", "#388E3C", "#66BB6A", "#81C784"],
    },
    dark: {
      background: "#263238",
      text: "#E8F5E9",
      secondaryText: "#C8E6C9",
      accents: ["#2E7D32", "#388E3C", "#66BB6A", "#81C784"],
    },
  },
  {
    id: "royal-purple",
    name: "Royal Purple",
    light: {
      background: "#F3E5F5",
      text: "#4A148C",
      secondaryText: "#263238",
      accents: ["#6A1B9A", "#7B1FA2", "#AB47BC", "#BA68C8"],
    },
    dark: {
      background: "#263238",
      text: "#F3E5F5",
      secondaryText: "#E1BEE7",
      accents: ["#6A1B9A", "#7B1FA2", "#AB47BC", "#BA68C8"],
    },
  },
];

interface ThemeState {
  themeId: string;
  isDarkMode: boolean;
}

interface ThemeActions {
  setTheme: (themeId: string) => void;
  toggleDarkMode: () => void;
  setDarkMode: (isDark: boolean) => void;
}

type ThemeStore = ThemeState & ThemeActions;

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      themeId: "8bit-classic",
      isDarkMode: false,

      setTheme: (themeId) => set({ themeId }),

      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),

      setDarkMode: (isDark) => set({ isDarkMode: isDark }),
    }),
    {
      name: "theme-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        themeId: state.themeId,
        isDarkMode: state.isDarkMode,
      }),
    }
  )
);

// Helper function to get colors - used outside of React components
export const getThemeColors = (themeId: string, isDarkMode: boolean): ThemeColors => {
  const theme = themes.find((t) => t.id === themeId) || themes[0];
  return isDarkMode ? theme.dark : theme.light;
};

// Custom hook that properly subscribes to theme changes
export const useThemeColors = (): ThemeColors => {
  const themeId = useThemeStore((s) => s.themeId);
  const isDarkMode = useThemeStore((s) => s.isDarkMode);

  const theme = themes.find((t) => t.id === themeId) || themes[0];
  return isDarkMode ? theme.dark : theme.light;
};
