import 'styled-components/native';

export const lightTheme = {
  colors: {
    background: '#010055a2',
    text: '#0A1F44',
    primary: '#1E3A8A',
    secondary: '#93C5FD',
  },
};

// Define Theme Type
export type ThemeType = typeof lightTheme;

// Extend Styled Components Theme to Avoid Type Errors
declare module 'styled-components' {
  export interface DefaultTheme extends ThemeType {}
}
