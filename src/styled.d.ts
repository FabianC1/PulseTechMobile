import 'styled-components';
import { lightTheme } from './theme';

// Ensure TypeScript knows the theme structure
type ThemeType = typeof lightTheme;

declare module 'styled-components' {
  export interface DefaultTheme extends ThemeType {}
}

