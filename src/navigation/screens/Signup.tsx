import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Modal
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useTheme } from 'styled-components/native';
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '../AuthContext';

// Define navigation type
type RootStackParamList = {
  Signup: undefined;
  Login: undefined;
  MainApp: { screen: string }; // Allows navigating to drawer screens
  Auth: { screen: string }; // Allows navigating to Auth stack screens
};

export function Signup() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { signup } = useAuth();

  // State for form inputs
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [medicalLicense, setMedicalLicense] = useState('');

  // Error Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle Signup
  const handleSignup = async () => {
    if (!username || !email || !password || !confirmPassword || (role === 'doctor' && !medicalLicense)) {
      setErrorMessage('Please fill in all required fields.');
      setModalVisible(true);
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      setModalVisible(true);
      return;
    }

    const success = await signup({ username, email, password, role, medicalLicense });

    if (success) {
      navigation.navigate('MainApp', { screen: 'Account Settings' } as never);
    } else {
      setErrorMessage('Signup failed. Please try again.');
      setModalVisible(true);
    }
  };

  return (
    <LinearGradient colors={theme.colors.background} style={styles.container}>
      {/* Custom Error Modal */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackground}>
          <View style={[styles.modalContainer, { backgroundColor: Array.isArray(theme.colors.background) ? theme.colors.background[0] : theme.colors.background }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.primary }]}>Error</Text>
            <Text style={[styles.modalMessage, { color: theme.colors.text }]}>{errorMessage}</Text>
            <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
              <Text style={[styles.modalButtonText, { color: theme.colors.background[1] }]}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <KeyboardAvoidingView behavior="padding" style={styles.flex} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 80}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
            
            {/* Title and Role Toggle */}
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

            {/* Input Fields */}
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

            {/* Already have an account? */}
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

  bottomSection: { alignItems: 'center', marginTop: 40 },
  authText: { fontSize: 16 },
  authButton: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, marginTop: 10 },

  // **Modal Styles**
  modalBackground: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '80%', padding: 20, borderRadius: 10, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  modalMessage: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
  modalButton: { backgroundColor: '#0084ff', paddingVertical: 10, paddingHorizontal: 30, borderRadius: 8 },
  modalButtonText: { fontSize: 16, fontWeight: 'bold' },
});
