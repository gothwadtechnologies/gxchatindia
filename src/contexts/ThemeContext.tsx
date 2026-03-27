import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../services/StorageService';

type Theme = 'original' | 'dark';
type Language = 'en';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = storage.getItem('app-theme');
    return (saved as Theme) || 'original';
  });

  const [language, setLanguage] = useState<Language>(() => {
    const saved = storage.getItem('app-lang');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    storage.setItem('app-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    storage.setItem('app-lang', language);
  }, [language]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, language, setLanguage }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
