import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
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
  Signup: undefined;
  Login: undefined;
  MainApp: { screen: string }; // Allows navigating to drawer screens
  Auth: { screen: string }; // Allows navigating to Auth stack screens
};

export function Login() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { login } = useAuth(); // Get login function from AuthContext

  // State for email, password, loading, and modal
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle login
  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      setModalVisible(true);
      return;
    }

    if (loading) return; // Prevent multiple presses
    setLoading(true);

    const success = await login(email, password);

    if (success) {
      navigation.navigate('MainApp', { screen: 'Account Settings' } as never);
    } else {
      setErrorMessage('Invalid email or password. Please try again.');
      setModalVisible(true);
    }

    setLoading(false);
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
            <View style={styles.topSection}>
              <Text style={[styles.title, { color: theme.colors.text }]}>Login</Text>
            </View>

            <View style={styles.formContainer}>
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

              <TouchableOpacity
                onPress={handleLogin}
                disabled={loading}
                style={[styles.button, { backgroundColor: loading ? 'gray' : theme.colors.primary }]}
              >
                <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.bottomSection}>
              <Text style={[styles.authText, { color: theme.colors.secondary }]}>Don't have an account?</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Signup')}
                style={[styles.authButton, { backgroundColor: theme.colors.primary }]}
              >
                <Text style={[styles.buttonText, { color: '#ffffff' }]}>Sign Up</Text>
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

  formContainer: { width: '100%', alignItems: 'center' },
  input: { width: '90%', borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 20 },

  button: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, marginTop: 10 },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },

  bottomSection: { alignItems: 'center', marginTop: 40 },
  authText: { fontSize: 16 },
  authButton: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, marginTop: 10 },

  // **Modal Styles**
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#0084ff',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
