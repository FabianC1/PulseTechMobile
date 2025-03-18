import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from 'styled-components/native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useAuth } from '../AuthContext';

// Define navigation type
type RootStackParamList = {
  Auth: { screen: 'Login' | 'Signup' };
};

interface SettingsProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export function Settings({ isDarkMode, toggleTheme }: SettingsProps) {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user, logout } = useAuth(); // Get authentication state

  return (
    <LinearGradient colors={theme.colors.background} style={styles.container}>
      {/* Settings Title */}
      <Text style={[styles.title, { color: theme.colors.text }]}>Settings</Text>

      {/* Theme Toggle (Always Available) */}
      <TouchableOpacity
        onPress={toggleTheme}
        style={[styles.button, { backgroundColor: theme.colors.primary }]}
      >
        <Text style={styles.buttonText}>
          Switch to {isDarkMode ? 'Light' : 'Dark'} Mode
        </Text>
      </TouchableOpacity>

      {/* If not logged in, show login/signup prompt */}
      {!user ? (
        <View style={styles.authPrompt}>
          <Text style={[styles.authText, { color: theme.colors.secondary }]}>
            Log in or sign up to access this page.
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.authButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => navigation.navigate('Auth', { screen: 'Login' })} // ✅ Fixes navigation
            >
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.authButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => navigation.navigate('Auth', { screen: 'Signup' })} // ✅ Fixes navigation
            >
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.loggedInSection}>
          <Text style={[styles.authText, { color: theme.colors.text }]}>
            Welcome, {user}! You can now access your settings.
          </Text>

          {/* Logout Button */}
          <TouchableOpacity style={[styles.settingOption, { backgroundColor: theme.colors.secondary }]} onPress={logout}>
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      )}
    </LinearGradient>
  );
}

// **Styles**
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
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
  authPrompt: {
    marginTop: 30,
    alignItems: 'center',
  },
  authText: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  authButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  loggedInSection: {
    marginTop: 30,
    alignItems: 'center',
  },
  settingOption: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 10,
    width: 200,
    alignItems: 'center',
  },
});
