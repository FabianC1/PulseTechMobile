import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from 'styled-components/native';
import LinearGradient from 'react-native-linear-gradient';

export function Home() {
  const theme = useTheme();

  return (
    <LinearGradient colors={theme.colors.background} style={styles.container}>
      <ScrollView contentContainerStyle={[styles.scrollContainer, { paddingBottom: 100 }]}>

        {/* What is PulseTech? */}
        <View style={styles.section}>
          <Text style={[styles.title, { color: theme.colors.text }]}>What is PulseTech?</Text>
          <LinearGradient colors={['#0091ff', '#8400ff']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={getDynamicUnderline('What is PulseTech?')} />
          <Text style={[styles.paragraph, { color: theme.colors.secondary }]}>
            PulseTech is a revolutionary digital health companion designed to empower you to take control of your health and well-being.
            Whether tracking your health metrics, booking appointments, or seeking instant health advice, PulseTech is your one-stop solution.
          </Text>
        </View>

        {/* How Does PulseTech Work? */}
        <View style={styles.section}>
          <Text style={[styles.title, { color: theme.colors.text }]}>How Does PulseTech Work?</Text>
          <LinearGradient colors={['#0091ff', '#8400ff']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={getDynamicUnderline('How Does PulseTech Work?')} />
          <Text style={[styles.paragraph, { color: theme.colors.secondary }]}>
            PulseTech integrates health data from various sources—wearable devices, medical records, and symptom inputs—to provide a complete
            picture of your health.
          </Text>
        </View>

        {/* Core Features */}
        <View style={styles.section}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Core Features</Text>
          <LinearGradient colors={['#0091ff', '#8400ff']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={getDynamicUnderline('Core Features')} />
          <Text style={[styles.paragraph, { color: theme.colors.secondary }]}>
            - Health Dashboard: Track metrics like heart rate, blood pressure, activity levels, and sleep patterns.
            {'\n'}- Appointments: Schedule medical visits and receive reminders.
            {'\n'}- Symptom Checker: Input symptoms for potential diagnoses and recommendations.
            {'\n'}- Medication Management: Track medications and set reminders.
            {'\n'}- Messages: Communicate with healthcare providers for guidance.
          </Text>
        </View>

        {/* How to Use PulseTech */}
        <View style={styles.section}>
          <Text style={[styles.title, { color: theme.colors.text }]}>How to Use PulseTech</Text>
          <LinearGradient colors={['#0091ff', '#8400ff']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={getDynamicUnderline('How to Use PulseTech')} />
          <Text style={[styles.paragraph, { color: theme.colors.secondary }]}>
            1. Create an Account – Set up your profile with health preferences.
            {'\n'}2. Connect Health Devices – Sync fitness bands, smartwatches, etc.
            {'\n'}3. Track Progress – Access the health dashboard for insights.
            {'\n'}4. Book Appointments – Find and schedule medical visits.
            {'\n'}5. Use Symptom Checker – Get health guidance when needed.
            {'\n'}6. Manage Medications – Never miss a dose.
            {'\n'}7. Communicate with Healthcare Providers – Stay connected with experts.
          </Text>
        </View>

        {/* Privacy and Security */}
        <View style={styles.section}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Privacy and Security</Text>
          <LinearGradient colors={['#0091ff', '#8400ff']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={getDynamicUnderline('Privacy and Security')} />
          <Text style={[styles.paragraph, { color: theme.colors.secondary }]}>
            PulseTech prioritizes data privacy, using encryption and strict security protocols to keep your information safe.
          </Text>
        </View>

        {/* Your Partner in Health */}
        <View style={styles.section}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Your Partner in Health</Text>
          <LinearGradient colors={['#0091ff', '#8400ff']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={getDynamicUnderline('Your Partner in Health')} />
          <Text style={[styles.paragraph, { color: theme.colors.secondary }]}>
            PulseTech is more than an app—it's your health companion, ensuring a better, more informed future.
          </Text>
        </View>

        {/* Footer */}
        <Text style={[styles.footer, { color: theme.colors.text }]}>
          PulseTech™ is a trademark of PulseTech, Inc. © 2025. All rights reserved.
        </Text>

      </ScrollView>
    </LinearGradient>
  );
}

const getDynamicUnderline = (text: string) => {
  return StyleSheet.create({
    underline: {
      height: 3,
      width: text.length * 11, 
      marginBottom: 10,
      borderRadius: 5,
      alignSelf: 'flex-start', 
    },
  }).underline;
};

// **Styles**
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 25, // Space between sections
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'left', // Title aligned left
    marginBottom: 5,
  },
  underline: {
    height: 3,
    width: '100%', // Full-width underline
    marginBottom: 10,
    borderRadius: 5,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'left', // Paragraph aligned left
  },
  footer: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
});

