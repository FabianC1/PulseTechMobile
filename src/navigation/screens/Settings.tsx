import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface SettingsProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export function Settings({ isDarkMode, toggleTheme }: SettingsProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Settings Screen</Text>

      {/* ✅ Fix: Use TouchableOpacity instead of Button */}
      <TouchableOpacity onPress={toggleTheme} style={styles.button}>
        <Text style={styles.buttonText}>
          Switch to {isDarkMode ? 'Light' : 'Dark'} Mode
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  text: {
    fontSize: 18,
  },
  button: {
    backgroundColor: '#1E3A8A',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
