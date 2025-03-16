import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

export function Home() {
  const theme = useTheme();
  const navigation = useNavigation();

  return (
    <LinearGradient colors={theme.colors.background} style={styles.container}>
      <ScrollView contentContainerStyle={[styles.scrollContainer, { paddingBottom: 100 }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>What is PulseTech?</Text>
        <Text style={[styles.paragraph, { color: theme.colors.secondary }]}>
          PulseTech is a revolutionary digital health companion designed to empower you to take control of your health and well-being.
          Whether tracking your health metrics, booking appointments, or seeking instant health advice, PulseTech is your one-stop solution.
        </Text>

        <Text style={[styles.title, { color: theme.colors.text }]}>How Does PulseTech Work?</Text>
        <Text style={[styles.paragraph, { color: theme.colors.secondary }]}>
          PulseTech integrates health data from various sources—wearable devices, medical records, and symptom inputs—to provide a complete
          picture of your health.
        </Text>

        <Text style={[styles.title, { color: theme.colors.text }]}>Core Features</Text>
        <Text style={[styles.paragraph, { color: theme.colors.secondary }]}>
          - Health Dashboard: Track metrics like heart rate, blood pressure, activity levels, and sleep patterns.
          {'\n'}- Appointments: Schedule medical visits and receive reminders.
          {'\n'}- Symptom Checker: Input symptoms for potential diagnoses and recommendations.
          {'\n'}- Medication Management: Track medications and set reminders.
          {'\n'}- Messages: Communicate with healthcare providers for guidance.
        </Text>

        <Text style={[styles.title, { color: theme.colors.text }]}>How to Use PulseTech</Text>
        <Text style={[styles.paragraph, { color: theme.colors.secondary }]}>
          1. Create an Account – Set up your profile with health preferences.
          {'\n'}2. Connect Health Devices – Sync fitness bands, smartwatches, etc.
          {'\n'}3. Track Progress – Access the health dashboard for insights.
          {'\n'}4. Book Appointments – Find and schedule medical visits.
          {'\n'}5. Use Symptom Checker – Get health guidance when needed.
          {'\n'}6. Manage Medications – Never miss a dose.
          {'\n'}7. Communicate with Healthcare Providers – Stay connected with experts.
        </Text>

        <Text style={[styles.title, { color: theme.colors.text }]}>Privacy and Security</Text>
        <Text style={[styles.paragraph, { color: theme.colors.secondary }]}>
          PulseTech prioritizes data privacy, using encryption and strict security protocols to keep your information safe.
        </Text>

        <Text style={[styles.title, { color: theme.colors.text }]}>Your Partner in Health</Text>
        <Text style={[styles.paragraph, { color: theme.colors.secondary }]}>
          PulseTech is more than an app—it's your health companion, ensuring a better, more informed future.
        </Text>

        <Text style={styles.footer}>PulseTech™ is a trademark of PulseTech, Inc. © 2025. All rights reserved.</Text>


        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.navigate('Settings' as never)}
        >
          <Text style={styles.buttonText}>Go to Settings</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

// **Styles**
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 24,
  },
  footer: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
