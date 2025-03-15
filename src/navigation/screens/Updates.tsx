import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useTheme } from 'styled-components/native';
import LinearGradient from 'react-native-linear-gradient';

export function Updates() {
  const theme = useTheme(); // Get theme colors

  return (
    <LinearGradient colors={theme.colors.background} style={styles.container}>
      <Text style={[styles.text, { color: theme.colors.text }]}>Updates Screen</Text>
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
});
