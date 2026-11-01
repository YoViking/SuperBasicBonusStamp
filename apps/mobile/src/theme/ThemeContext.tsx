import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'system' | 'light' | 'dark';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceInput: string;
  surfaceMuted: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  placeholder: string;
  border: string;
  borderInput: string;
  borderSubtle: string;
  primary: string;
  primaryText: string;
  primaryStrongText: string;
  primarySoft: string;
  primarySoftBorder: string;
  modePillBg: string;
  success: string;
  warning: string;
  warningText: string;
  warningSoft: string;
  danger: string;
  dangerText: string;
  dangerSoft: string;
  stampCircleBg: string;
  stampCircleBorder: string;
  stampCircleText: string;
  disabled: string;
}

export const lightColors: ThemeColors = {
  background: '#f4f6f9',
  surface: '#ffffff',
  surfaceInput: '#f9fafb',
  surfaceMuted: '#f3f4f6',
  text: '#111827',
  textSecondary: '#374151',
  textMuted: '#6b7280',
  placeholder: '#9ca3af',
  border: '#e5e7eb',
  borderInput: '#d1d5db',
  borderSubtle: '#f3f4f6',
  primary: '#2563eb',
  primaryText: '#2563eb',
  primaryStrongText: '#1d4ed8',
  primarySoft: '#eff6ff',
  primarySoftBorder: '#bfdbfe',
  modePillBg: '#e0e7ff',
  success: '#16a34a',
  warning: '#f59e0b',
  warningText: '#d97706',
  warningSoft: '#fef3c7',
  danger: '#ef4444',
  dangerText: '#dc2626',
  dangerSoft: '#fee2e2',
  stampCircleBg: '#f8fafc',
  stampCircleBorder: '#cbd5e1',
  stampCircleText: '#94a3b8',
  disabled: '#9ca3af',
};

export const darkColors: ThemeColors = {
  background: '#0f172a',
  surface: '#1e293b',
  surfaceInput: '#0f172a',
  surfaceMuted: '#334155',
  text: '#f8fafc',
  textSecondary: '#cbd5e1',
  textMuted: '#94a3b8',
  placeholder: '#64748b',
  border: '#334155',
  borderInput: '#475569',
  borderSubtle: '#334155',
  primary: '#3b82f6',
  primaryText: '#60a5fa',
  primaryStrongText: '#93c5fd',
  primarySoft: '#1e3a8a',
  primarySoftBorder: '#2563eb',
  modePillBg: '#1e3a8a',
  success: '#16a34a',
  warning: '#f59e0b',
  warningText: '#fbbf24',
  warningSoft: '#451a03',
  danger: '#ef4444',
  dangerText: '#f87171',
  dangerSoft: '#450a0a',
  stampCircleBg: '#0f172a',
  stampCircleBorder: '#475569',
  stampCircleText: '#64748b',
  disabled: '#475569',
};

const THEME_STORAGE_KEY = '@sbbs_theme_mode';

interface ThemeContextValue {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  isDark: boolean;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextValue>({
  themeMode: 'system',
  setThemeMode: () => {},
  toggleTheme: () => {},
  isDark: false,
  colors: lightColors,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((saved) => {
        if (saved === 'light' || saved === 'dark' || saved === 'system') {
          setThemeModeState(saved);
        }
      })
      .catch(() => {});
  }, []);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    AsyncStorage.setItem(THEME_STORAGE_KEY, mode).catch(() => {});
  };

  const isDark =
    themeMode === 'dark' ||
    (themeMode === 'system' && systemColorScheme === 'dark');

  const toggleTheme = () => {
    setThemeMode(isDark ? 'light' : 'dark');
  };

  const colors = isDark ? darkColors : lightColors;

  const value = useMemo(
    () => ({
      themeMode,
      setThemeMode,
      toggleTheme,
      isDark,
      colors,
    }),
    [themeMode, isDark, colors]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

