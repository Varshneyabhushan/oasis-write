import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Theme, themes, defaultTheme } from '../themes';

const THEME_STORAGE_KEY = 'oasis-write-theme';
const FONT_STORAGE_KEY = 'oasis-write-font-family';
const DEFAULT_FONT_FAMILY = 'Inter, "SF Pro Text", "Segoe UI", system-ui, -apple-system, sans-serif';
const DEFAULT_CODE_FONT = '"SFMono-Regular", "JetBrains Mono", "Menlo", "Consolas", monospace';

interface ThemeContextType {
  currentTheme: Theme;
  themeName: string;
  setTheme: (themeName: string) => void;
  fontFamily: string;
  setFontFamily: (fontFamily: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [themeName, setThemeName] = useState<string>(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored && themes[stored]) {
        return stored;
      }
    } catch (error) {
      console.error('Failed to read stored theme:', error);
    }
    return defaultTheme;
  });

  const [fontFamily, setFontFamily] = useState<string>(() => {
    try {
      const stored = localStorage.getItem(FONT_STORAGE_KEY);
      if (stored) return stored;
    } catch (error) {
      console.error('Failed to read stored font family:', error);
    }
    return DEFAULT_FONT_FAMILY;
  });

  const currentTheme = themes[themeName] || themes[defaultTheme];

  useEffect(() => {
    // Apply theme colors to CSS variables
    const root = document.documentElement;
    const { colors } = currentTheme;

    root.style.setProperty('--bg-primary', colors.bgPrimary);
    root.style.setProperty('--bg-secondary', colors.bgSecondary);
    root.style.setProperty('--text-primary', colors.textPrimary);
    root.style.setProperty('--text-secondary', colors.textSecondary);
    root.style.setProperty('--border-color', colors.borderColor);
    root.style.setProperty('--heading-color', colors.headingColor);
    root.style.setProperty('--accent-color', colors.accentColor);
    root.style.setProperty('--code-bg', colors.codeBg);
    root.style.setProperty('--link-color', colors.linkColor);

    try {
      localStorage.setItem(THEME_STORAGE_KEY, themeName);
    } catch (error) {
      console.error('Failed to store theme preference:', error);
    }
  }, [currentTheme, themeName]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--app-font-family', fontFamily);
    root.style.setProperty('--code-font-family', DEFAULT_CODE_FONT);

    try {
      localStorage.setItem(FONT_STORAGE_KEY, fontFamily);
    } catch (error) {
      console.error('Failed to store font preference:', error);
    }
  }, [fontFamily]);

  const setTheme = (newThemeName: string) => {
    if (themes[newThemeName]) {
      setThemeName(newThemeName);
    }
  };

  const handleFontFamilyChange = (newFont: string) => {
    setFontFamily(newFont || DEFAULT_FONT_FAMILY);
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, themeName, setTheme, fontFamily, setFontFamily: handleFontFamilyChange }}>
      {children}
    </ThemeContext.Provider>
  );
};
