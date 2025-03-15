import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from 'styled-components/native';
import { lightTheme, darkTheme } from './theme';
import { Navigation } from './navigation/index';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <NavigationContainer>
        <Navigation isDarkMode={isDarkMode} toggleTheme={() => setIsDarkMode(!isDarkMode)} />
      </NavigationContainer>
    </ThemeProvider>
  );
}
