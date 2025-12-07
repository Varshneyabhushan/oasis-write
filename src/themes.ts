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
  nightfall: {
    name: 'Nightfall',
    colors: {
      bgPrimary: '#1E1E1E',
      bgSecondary: '#343434',
      textPrimary: '#C7C7C7',
      textSecondary: '#888888',
      borderColor: '#2a2a2a',
      headingColor: '#00A6B2',
      accentColor: '#00A600',
      codeBg: '#1a1a1a',
      linkColor: '#990000',
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
  dracula: {
    name: 'Dracula',
    colors: {
      bgPrimary: '#282a36',
      bgSecondary: '#1e1f29',
      textPrimary: '#f8f8f2',
      textSecondary: '#bcbccd',
      borderColor: '#3a3c4e',
      headingColor: '#bd93f9',
      accentColor: '#ff79c6',
      codeBg: '#1e1f29',
      linkColor: '#8be9fd',
    },
  },
  atomOneLight: {
    name: 'Atom One Light',
    colors: {
      bgPrimary: '#FAFAFA',
      bgSecondary: '#F0F0F0',
      textPrimary: '#383A42',
      textSecondary: '#6C6F93',
      borderColor: '#E5E5E6',
      headingColor: '#005CC5',
      accentColor: '#0184BC',
      codeBg: '#F5F5F5',
      linkColor: '#005CC5',
    },
  },
  solarizedLight: {
    name: 'Solarized',
    colors: {
      bgPrimary: '#FDF6E3',
      bgSecondary: '#F7F0D9',
      textPrimary: '#657B83',
      textSecondary: '#839596',
      borderColor: '#E4DFC8',
      headingColor: '#268BD2',
      accentColor: '#B58900',
      codeBg: '#F2EBD5',
      linkColor: '#B58900',
    },
  },
};

export const defaultTheme = 'dark';
