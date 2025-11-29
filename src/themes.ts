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
};

export const defaultTheme = 'dark';
