import 'styled-components/native';
import { Appointments } from './navigation/screens/Appointments';

export const lightTheme = {
  colors: {
    background: ['#758FFF', '#ffffff'], // Light mode gradient
    text: '#0A1F44',
    primary: '#1E3A8A',
    secondary: '#000000',
    logout: '#000000',
    appointments: '#6d17f77e',
    appointments2: '#8d8d8d70',
    saveButton: '#758FFF',
    // Add these:
    placeholder: "#aaa",
    border: "#555",
  },
};

export const darkTheme = {
  colors: {
    background: ['#1f1f1f', '#013a85bd'], // Dark mode gradient
    text: '#FFFFFF',
    primary: '#4A90E2',
    secondary: '#ffffff',
    logout: '#002855',
    appointments: '#7407db9a',
    appointments2: '#ffffff6e',
    saveButton: '#4A90E2',
    // Add these:
    placeholder: "#aaa",
    border: "#555",
  },
};

// Define Theme Type
export type ThemeType = typeof lightTheme;

declare module 'styled-components' {
  export interface DefaultTheme extends ThemeType { }
}
