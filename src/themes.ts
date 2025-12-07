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
  monokai: {
    name: 'Monokai',
    colors: {
      bgPrimary: '#232323',
      bgSecondary: '#1d1d1d',
      textPrimary: '#F7F7F7',
      textSecondary: '#808080',
      borderColor: '#353535',
      headingColor: '#F62D73',
      accentColor: '#a6e22e',
      codeBg: '#1a1a1a',
      linkColor: '#a6e22e',
    },
  },
  solarizedLight: {
    name: 'Solarized Light',
    colors: {
      bgPrimary: '#FDF6E3',
      bgSecondary: '#F7F0D9',
      textPrimary: '#657B83',
      textSecondary: '#657B83',
      borderColor: '#E4DFC8',
      headingColor: '#268BD2',
      accentColor: '#B58900',
      codeBg: '#F2EBD5',
      linkColor: '#268BD2',
    },
  },
};

export const defaultTheme = 'dark';
