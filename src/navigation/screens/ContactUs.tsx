import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Modal
} from 'react-native';
import { useTheme } from 'styled-components/native';
import LinearGradient from 'react-native-linear-gradient';
import { Linking } from 'react-native';

export function ContactUs() {
  const theme = useTheme();

  // Input states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Function to send email
  const sendEmail = () => {
    if (!name || !email || !message) {
      setErrorMessage('Please fill out all fields before sending.');
      setModalVisible(true);
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage('Please enter a valid email address.');
      setModalVisible(true);
      return;
    }

    const subject = 'User Inquiry - PulseTech Support';
    const body = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
    const emailUrl = `mailto:support@pulsetech.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    Linking.openURL(emailUrl).catch(() => {
      setErrorMessage('No email app found. Please set up an email client.');
      setModalVisible(true);
    });
  };

  // Validate Email Function
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <LinearGradient colors={theme.colors.background} style={styles.container}>
      {/* Keyboard Avoiding View */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 80}
        style={styles.flex}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
            <Text style={[styles.title, { color: theme.colors.text }]}>We are here if you need us</Text>
            <LinearGradient colors={['#0091ff', '#8400ff']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.underline} />

            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Questions or Feedback?</Text>
            <Text style={[styles.text, { color: theme.colors.secondary }]}>
              Email: support@pulsetech.com{'\n'}
              Phone: 1-800-123-4567{'\n'}
              Address: 123 Health St, Wellness City, Country
            </Text>

            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Our Working Hours:</Text>
            <Text style={[styles.text, { color: theme.colors.secondary }]}>
              Monday - Friday: 9:00 AM - 6:00 PM{'\n'}
              Weekends: 10:00 AM - 2:00 PM
            </Text>

            <LinearGradient colors={['#0091ff', '#8400ff']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.underline} />

            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Send Us a Message:</Text>

            {/* Name Input */}
            <TextInput
              style={[styles.input, { borderColor: theme.colors.primary, color: theme.colors.text }]}
              placeholder="Your Name"
              placeholderTextColor={theme.colors.secondary}
              value={name}
              onChangeText={setName}
            />

            {/* Email Input */}
            <TextInput
              style={[
                styles.input,
                { borderColor: email && !validateEmail(email) ? 'red' : theme.colors.primary, color: theme.colors.text }
              ]}
              placeholder="Your Email"
              placeholderTextColor={theme.colors.secondary}
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            {/* Show error message if email is invalid */}
            {email && !validateEmail(email) && (
              <Text style={[styles.errorText, { color: 'red' }]}>Please enter a valid email address.</Text>
            )}

            {/* Message Input */}
            <TextInput
              style={[styles.messageInput, { borderColor: theme.colors.primary, color: theme.colors.text }]}
              placeholder="Your Message"
              placeholderTextColor={theme.colors.secondary}
              multiline
              numberOfLines={4}
              value={message}
              onChangeText={setMessage}
            />

            {/* Send Button */}
            <TouchableOpacity style={styles.sendButton} onPress={sendEmail}>
              <Text style={styles.buttonText}>Send Message</Text>
            </TouchableOpacity>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Custom Error Modal */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackground}>
          <View style={[styles.modalContainer, { backgroundColor: theme.colors.background[0] }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.primary }]}>Error</Text>
            <Text style={[styles.modalMessage, { color: theme.colors.text }]}>{errorMessage}</Text>
            <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
              <Text style={[styles.modalButtonText, { color: theme.colors.background[1] }]}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

// **Styles**
const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scrollContainer: { padding: 20, flexGrow: 1 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  underline: { height: 3, width: '90%', borderRadius: 5, marginBottom: 20, alignSelf: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  text: { fontSize: 16, marginBottom: 15 },
  input: { height: 50, borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, fontSize: 16, marginBottom: 15 },
  messageInput: { height: 120, borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, fontSize: 16, textAlignVertical: 'top', marginBottom: 20 },
  sendButton: { backgroundColor: '#0084ff', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },

  // Modal Styles
  modalBackground: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '80%', padding: 20, borderRadius: 10, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  modalMessage: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
  modalButton: { backgroundColor: '#0084ff', paddingVertical: 10, paddingHorizontal: 30, borderRadius: 8 },
  modalButtonText: { fontSize: 16, fontWeight: 'bold' },
});
