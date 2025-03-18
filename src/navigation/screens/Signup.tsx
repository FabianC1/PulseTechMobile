import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
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
      <KeyboardAvoidingView behavior="padding" style={styles.flex} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 80}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
            
            {/* Title and Role Toggle (Fixed Position at Top) */}
            <View style={styles.topSection}>
              <Text style={[styles.title, { color: theme.colors.text }]}>Create an Account</Text>

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
            </View>

            {/* Inputs (Centered Properly) */}
            <View style={styles.formContainer}>
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
            </View>

            {/* Already have an account? (Fixed at Bottom) */}
            <View style={styles.bottomSection}>
              <Text style={[styles.authText, { color: theme.colors.secondary }]}>Already have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')} style={[styles.authButton, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.buttonText}>Login</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

// **Styles**
const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },

  topSection: { alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  roleToggle: { flexDirection: 'row', marginBottom: 15 },
  roleButton: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8, borderWidth: 1, marginHorizontal: 5 },
  activeRole: { backgroundColor: '#6200EE' },
  roleText: { fontSize: 16, fontWeight: 'bold', color: '#ffffff' },

  formContainer: { width: '100%', alignItems: 'center' },
  input: { width: '90%', borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 20 },

  button: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, marginTop: 10 },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },

  bottomSection: { alignItems: 'center', marginTop: 40 }, // 🔥 Fixed Position for Login Button
  authText: { fontSize: 16 },
  authButton: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, marginTop: 10 },
});

