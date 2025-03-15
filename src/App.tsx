import { Navigation } from './navigation/index';
import { ThemeProvider } from 'styled-components/native';
import { lightTheme } from './theme';
import styled from 'styled-components/native';
import { SafeAreaView } from 'react-native';

export default function App() {
  return (
    <ThemeProvider theme={lightTheme}>
      <AppContainer>
        <Navigation />
      </AppContainer>
    </ThemeProvider>
  );
}

// ✅ This applies the background color globally
const AppContainer = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }: { theme: typeof lightTheme }) => theme.colors.background};
`;
