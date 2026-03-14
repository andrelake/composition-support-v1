import type { DefaultTheme } from 'styled-components/native';

export const theme: DefaultTheme = {
  colors: {
    background: '#121214',
    surface: '#202024',
    surfaceHover: '#29292e',
    primary: '#8257e6',
    primaryLight: '#996DFF',
    text: '#e1e1e6',
    textSecondary: '#a8a8b3',
    border: '#323238',

    // Status colors
    success: '#04D361',
    warning: '#FBA94C',
    error: '#E83F5B',
    info: '#3B82F6',

    // Tonality specific
    warm: '#F59E0B',
    cool: '#3B82F6',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
    full: 9999,
  },
  typography: {
    fontBody: 'System',
    fontMono: 'monospace',
    sizes: {
      xs: 11,
      sm: 13,
      md: 15,
      lg: 18,
      xl: 22,
      xxl: 28,
    },
  },
};

export type AppTheme = typeof theme;
