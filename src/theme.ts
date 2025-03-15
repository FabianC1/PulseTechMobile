import 'styled-components/native';

export const lightTheme = {
  colors: {
    background: ['#758FFF', '#ffffff'], // Light mode gradient
    text: '#0A1F44',
    primary: '#1E3A8A',
    secondary: '#000000',
  },
};

export const darkTheme = {
  colors: {
    background: ['#1f1f1f', '#013a85bd'], // Dark mode gradient
    text: '#FFFFFF',
    primary: '#4A90E2',
    secondary: '#A0CFFF',
  },
};

// Define Theme Type
export type ThemeType = typeof lightTheme;

declare module 'styled-components' {
  export interface DefaultTheme extends ThemeType {}
}
