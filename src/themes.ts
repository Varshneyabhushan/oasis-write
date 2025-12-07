export interface Theme {
  name: string;
  colors: {
    bgPrimary: string;
    bgSecondary: string;
    textPrimary: string;
    textSecondary: string;
    borderColor: string;
    headingColor: string;
    accentColor: string;
    codeBg: string;
    linkColor: string;
  };
}

export const themes: Record<string, Theme> = {
  dark: {
    name: 'Dark',
    colors: {
      bgPrimary: '#181818',
      bgSecondary: '#141414',
      textPrimary: '#C7C7C7',
      textSecondary: '#888888',
      borderColor: '#2a2a2a',
      headingColor: '#337DC2',
      accentColor: '#289FAC',
      codeBg: '#1a1a1a',
      linkColor: '#289FAC',
    },
  },
  midnight: {
    name: 'Midnight',
    colors: {
      bgPrimary: '#0f172a',
      bgSecondary: '#0b1220',
      textPrimary: '#e2e8f0',
      textSecondary: '#94a3b8',
      borderColor: '#1f2937',
      headingColor: '#5eead4',
      accentColor: '#38bdf8',
      codeBg: '#111827',
      linkColor: '#38bdf8',
    },
  },
  light: {
    name: 'Light',
    colors: {
      bgPrimary: '#f6f7fb',
      bgSecondary: '#ffffff',
      textPrimary: '#1f2937',
      textSecondary: '#4b5563',
      borderColor: '#e5e7eb',
      headingColor: '#0f172a',
      accentColor: '#2563eb',
      codeBg: '#f1f5f9',
      linkColor: '#2563eb',
    },
  },
};

export const defaultTheme = 'dark';
