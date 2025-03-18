import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from 'styled-components/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme } from './theme';
import { AuthProvider } from './navigation/AuthContext';
import { MainNavigator } from './navigation';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load the theme from AsyncStorage when the app starts
  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme === 'dark') {
        setIsDarkMode(true);
      }
    };
    loadTheme();
  }, []);

  // Toggle theme and save it in AsyncStorage
  const toggleTheme = async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  return (
    <AuthProvider>
      <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
        <NavigationContainer>
          {/* Use MainNavigator instead of DrawerNavigator */}
          <MainNavigator isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
        </NavigationContainer>
      </ThemeProvider>
    </AuthProvider>
  );
}
