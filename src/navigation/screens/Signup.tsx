import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useTheme } from 'styled-components/native';
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '../AuthContext';

// Define navigation type
type RootStackParamList = {
  Login: undefined;
  HealthDashboard: undefined;
};

export function Signup() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { signup } = useAuth(); // Get signup function from AuthContext

  // State for form inputs
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [medicalLicense, setMedicalLicense] = useState('');

  // Handle Signup
  const handleSignup = async () => {
    if (!username || !email || !password || !confirmPassword || (role === 'doctor' && !medicalLicense)) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    const success = await signup({ username, email, password, role, medicalLicense });

    if (success) {
      navigation.navigate('HealthDashboard'); // Redirect after signup
    } else {
      Alert.alert('Signup Failed', 'Something went wrong. Please try again.');
    }
  };

  return (
    <LinearGradient colors={theme.colors.background} style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Create an Account</Text>

      {/* Role Toggle */}
      <View style={styles.roleToggle}>
        <TouchableOpacity
          onPress={() => setRole('patient')}
          style={[styles.roleButton, role === 'patient' && styles.activeRole]}
        >
          <Text style={styles.roleText}>Patient</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setRole('doctor')}
          style={[styles.roleButton, role === 'doctor' && styles.activeRole]}
        >
          <Text style={styles.roleText}>Doctor</Text>
        </TouchableOpacity>
      </View>

      {/* Shared Inputs */}
      <TextInput
        style={[styles.input, { borderColor: theme.colors.primary, color: theme.colors.text }]}
        placeholder="Username"
        placeholderTextColor={theme.colors.secondary}
        value={username}
        onChangeText={setUsername}
      />

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

      <TextInput
        style={[styles.input, { borderColor: theme.colors.primary, color: theme.colors.text }]}
        placeholder="Confirm Password"
        placeholderTextColor={theme.colors.secondary}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      {/* Doctor-Only Input */}
      {role === 'doctor' && (
        <TextInput
          style={[styles.input, { borderColor: theme.colors.primary, color: theme.colors.text }]}
          placeholder="Medical License"
          placeholderTextColor={theme.colors.secondary}
          value={medicalLicense}
          onChangeText={setMedicalLicense}
        />
      )}

      {/* Sign Up Button */}
      <TouchableOpacity onPress={handleSignup} style={[styles.button, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      {/* Already have an account? */}
      <Text style={[styles.authText, { color: theme.colors.secondary }]}>Already have an account?</Text>
      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={[styles.authButton, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.buttonText}>Login</Text>
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
  roleToggle: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 5,
  },
  activeRole: {
    backgroundColor: '#6200EE', // Adjust to theme
  },
  roleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
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

