import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useTheme } from 'styled-components/native';
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '../AuthContext'; // Import useAuth

// Define navigation type
type RootStackParamList = {
  Signup: undefined;
  HealthDashboard: undefined;
};

export function Login() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { login } = useAuth(); // Get login function from AuthContext

  // State for email and password
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Handle login
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }
  
    const success = await login(email, password); // Wait for login result
  
    if (success) {
      navigation.navigate('HealthDashboard'); // Redirect after login
    } else {
      Alert.alert('Login Failed', 'Invalid credentials. Please try again.');
    }
  };  

  return (
    <LinearGradient colors={theme.colors.background} style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Login</Text>

      <TextInput
        style={[styles.input, { borderColor: theme.colors.primary, color: theme.colors.text }]}
        placeholder="Email"
        placeholderTextColor={theme.colors.secondary}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={[styles.input, { borderColor: theme.colors.primary, color: theme.colors.text }]}
        placeholder="Password"
        placeholderTextColor={theme.colors.secondary}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity onPress={handleLogin} style={[styles.button, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <Text style={[styles.authText, { color: theme.colors.secondary }]}>Don't have an account?</Text>

      <TouchableOpacity onPress={() => navigation.navigate('Signup')} style={[styles.authButton, { backgroundColor: theme.colors.primary }]}>
        <Text style={[styles.buttonText, { color: theme.colors.text }]}>Sign Up</Text>
      </TouchableOpacity>
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '90%',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
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
  authText: {
    marginTop: 15,
    fontSize: 16,
  },
  authButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 10,
  },
});  
