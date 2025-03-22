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

    placeholder: "#ff0000",
    border: "#9c0000",
    quickActions: '#1E3A8A',
    Appointmentsbackground: ['#1100ff57', '#00a4b9bd'],
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

    placeholder: "#ff0000",
    border: "#a10000",
    quickActions: '#4A90E2',
    Appointmentsbackground: ['#00566b',  '#2a004d']
  },
};

// Define Theme Type
export type ThemeType = typeof lightTheme;

declare module 'styled-components' {
  export interface DefaultTheme extends ThemeType { }
}
