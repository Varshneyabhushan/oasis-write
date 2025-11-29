import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Theme, themes, defaultTheme } from '../themes';

interface ThemeContextType {
  currentTheme: Theme;
  themeName: string;
  setTheme: (themeName: string) => void;
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
  const [themeName, setThemeName] = useState<string>(defaultTheme);
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
  }, [currentTheme]);

  const setTheme = (newThemeName: string) => {
    if (themes[newThemeName]) {
      setThemeName(newThemeName);
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, themeName, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
