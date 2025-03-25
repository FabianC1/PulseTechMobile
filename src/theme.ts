import 'styled-components/native';


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
    border: "#000000",
    quickActions: '#1E3A8A',
    Appointmentsbackground: ['#1100ff57', '#00a4b9bd'],
    card: '#f0f0f071',
    text1: '#FFFFFF',
    text2: '#0A1F44',
    sentBubbleBackground: '#b7f4ff7e',
    receivedBubbleBackground: '#a7a6ff',
    attachmentBlockBackground: '#549ef3',
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
    border: "#4A90E2",
    quickActions: '#4A90E2',
    Appointmentsbackground: ['#00566b', '#2a004d'],
    card: '#00014262',
    text1: '#0A1F44',
    text2: '#0A1F44',
    sentBubbleBackground: '#0A1F44',
    receivedBubbleBackground: '#0099ffcb',
    attachmentBlockBackground: '#0e47aaa4',
  },
};

// Define Theme Type
export type ThemeType = typeof lightTheme;

declare module 'styled-components' {
  export interface DefaultTheme extends ThemeType { }
}
