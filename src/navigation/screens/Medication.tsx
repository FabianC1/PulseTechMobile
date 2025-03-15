import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from 'styled-components/native';
import LinearGradient from 'react-native-linear-gradient';

export function Medication() {
  const theme = useTheme();

  return (
    <LinearGradient colors={theme.colors.background} style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Track and take your medication here</Text>
    </LinearGradient>
  );
}

// Using StyleSheet instead of styled-components
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});
