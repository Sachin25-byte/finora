import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeId = 'light-blue' | 'dark-navy' | 'emerald-green' | 'modern-purple';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  description: string;
  isDark: boolean;
  colors: {
    background: string;
    card: string;
    primary: string;
    text: string;
    border: string;
    highlight: string;
  };
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  'light-blue': {
    id: 'light-blue',
    name: 'Light Blue',
    description: 'Clean fintech aesthetic with vibrant royal blue',
    isDark: false,
    colors: {
      background: '#F5F7FB',
      card: '#FFFFFF',
      primary: '#2563EB',
      text: '#111827',
      border: '#E5E7EB',
      highlight: '#EFF6FF',
    },
  },
  'dark-navy': {
    id: 'dark-navy',
    name: 'Dark Navy',
    description: 'Modern high-contrast midnight finance cockpit',
    isDark: true,
    colors: {
      background: '#0F172A',
      card: '#1E293B',
      primary: '#38BDF8',
      text: '#FFFFFF',
      border: '#334155',
      highlight: 'rgba(56, 189, 248, 0.15)',
    },
  },
  'emerald-green': {
    id: 'emerald-green',
    name: 'Emerald Green',
    description: 'Fresh organic prosperity & wealth theme',
    isDark: false,
    colors: {
      background: '#F0FDF4',
      card: '#FFFFFF',
      primary: '#059669',
      text: '#14532D',
      border: '#D1FAE5',
      highlight: '#ECFDF5',
    },
  },
  'modern-purple': {
    id: 'modern-purple',
    name: 'Modern Purple',
    description: 'Sophisticated creative capital & luxury violet',
    isDark: false,
    colors: {
      background: '#F5F3FF',
      card: '#FFFFFF',
      primary: '#7C3AED',
      text: '#2E1065',
      border: '#DDD6FE',
      highlight: '#EDE9FE',
    },
  },
};

interface ThemeContextType {
  theme: ThemeId;
  themeConfig: ThemeConfig;
  setTheme: (theme: ThemeId) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    const saved = localStorage.getItem('finora_theme') as ThemeId;
    if (saved && THEMES[saved]) {
      return saved;
    }
    return 'light-blue';
  });

  const applyTheme = (t: ThemeId) => {
    document.documentElement.setAttribute('data-theme', t);
    if (THEMES[t].isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('finora_theme', t);
  };

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = (newTheme: ThemeId) => {
    if (THEMES[newTheme]) {
      setThemeState(newTheme);
      applyTheme(newTheme);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeConfig: THEMES[theme],
        setTheme,
        isDark: THEMES[theme].isDark,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
