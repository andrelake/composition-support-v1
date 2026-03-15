import 'styled-components/native';

declare module 'styled-components/native' {
  export interface DefaultTheme {
    colors: {
      background: string;
      surface: string;
      surfaceHover: string;
      primary: string;
      primaryLight: string;
      text: string;
      textSecondary: string;
      border: string;
      success: string;
      warning: string;
      error: string;
      info: string;
      warm: string;
      cool: string;
    };
    spacing: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      xxl: number;
    };
    borderRadius: {
      sm: number;
      md: number;
      lg: number;
      full: number;
    };
    typography: {
      fontBody: string;
      fontMono: string;
      sizes: {
        xs: number;
        sm: number;
        md: number;
        lg: number;
        xl: number;
        xxl: number;
      };
    };
  }
}
