import 'styled-components/native';

// Light Theme (ONLY ONE DECLARATION)
export const lightTheme = {
  colors: {
    background: '#ffffff', // Light background
    text: '#0A1F44', // Dark text for readability
    primary: '#1E3A8A',
    secondary: '#93C5FD',
  },
};

// Dark Theme
export const darkTheme = {
  colors: {
    background: '#010055', // Dark background
    text: '#ffffff', // Light text for readability
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
