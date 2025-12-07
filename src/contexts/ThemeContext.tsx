import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Theme, themes, defaultTheme } from '../themes';

const THEME_STORAGE_KEY = 'oasis-write-theme';
const FONT_STORAGE_KEY = 'oasis-write-font-family';
const DEFAULT_FONT_FAMILY = 'Inter, "SF Pro Text", "Segoe UI", system-ui, -apple-system, sans-serif';
const DEFAULT_CODE_FONT = '"SFMono-Regular", "JetBrains Mono", "Menlo", "Consolas", monospace';

const hexToRgb = (hex: string) => {
  const normalized = hex.replace('#', '');
  if (normalized.length !== 3 && normalized.length !== 6) return null;

  const expand = normalized.length === 3 ? normalized.split('').map((c) => c + c).join('') : normalized;
  const r = parseInt(expand.slice(0, 2), 16);
  const g = parseInt(expand.slice(2, 4), 16);
  const b = parseInt(expand.slice(4, 6), 16);

  if ([r, g, b].some((val) => Number.isNaN(val))) return null;
  return { r, g, b };
};

const rgbToHex = (r: number, g: number, b: number) =>
  `#${[r, g, b].map((val) => Math.max(0, Math.min(255, Math.round(val))).toString(16).padStart(2, '0')).join('')}`;

// Blend the heading color toward the body text color so deeper headings visually recede.
const mixHeadingColor = (heading: string, text: string, headingWeight: number) => {
  const headingRgb = hexToRgb(heading);
  const textRgb = hexToRgb(text);
  if (!headingRgb || !textRgb) return heading;

  const weight = Math.max(0, Math.min(1, headingWeight));
  const r = headingRgb.r * weight + textRgb.r * (1 - weight);
  const g = headingRgb.g * weight + textRgb.g * (1 - weight);
  const b = headingRgb.b * weight + textRgb.b * (1 - weight);

  return rgbToHex(r, g, b);
};

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
    root.style.setProperty('--heading-color-1', colors.headingColor);
    root.style.setProperty('--heading-color-2', mixHeadingColor(colors.headingColor, colors.textPrimary, 0.8));
    root.style.setProperty('--heading-color-3', mixHeadingColor(colors.headingColor, colors.textPrimary, 0.6));
    root.style.setProperty('--heading-color-4', mixHeadingColor(colors.headingColor, colors.textPrimary, 0.4));
    root.style.setProperty('--heading-color-5', mixHeadingColor(colors.headingColor, colors.textPrimary, 0.3));
    root.style.setProperty('--heading-color-6', mixHeadingColor(colors.headingColor, colors.textPrimary, 0.25));
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
