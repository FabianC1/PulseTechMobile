import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from 'styled-components/native';
import LinearGradient from 'react-native-linear-gradient';

interface SettingsProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export function Settings({ isDarkMode, toggleTheme }: SettingsProps) {
  const theme = useTheme(); // Get theme colors

  return (
    <LinearGradient colors={theme.colors.background} style={styles.container}>
      <Text style={[styles.text, { color: theme.colors.text }]}>Settings Screen</Text>

      <TouchableOpacity
        onPress={toggleTheme}
        style={[styles.button, { backgroundColor: theme.colors.primary }]}
      >
        <Text style={styles.buttonText}>
          Switch to {isDarkMode ? 'Light' : 'Dark'} Mode
        </Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
