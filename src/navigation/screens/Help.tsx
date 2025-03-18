import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from 'styled-components/native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, NavigationProp } from '@react-navigation/native';

// Define navigation type
type RootStackParamList = {
  'Contact Us': undefined;
};

export function Help() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <LinearGradient colors={theme.colors.background} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Help Title */}
        <Text style={[styles.title, { color: theme.colors.text }]}>Help & Support</Text>
        <LinearGradient
          colors={['#0091ff', '#8400ff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.dynamicUnderline, getDynamicUnderline('Help & Support')]}
        />

        <Text style={[styles.description, { color: theme.colors.secondary }]}>
          If you're encountering any difficulties, here are some step-by-step guides to help you resolve common issues:
        </Text>

        {/* Account Setup */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Account Setup</Text>
          <LinearGradient
            colors={['#0091ff', '#8400ff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.dynamicUnderline, getDynamicUnderline('Account Setup')]}
          />
          <Text style={[styles.instructions, { color: theme.colors.secondary }]}>
            - Create an account by clicking on the "Sign Up" button on the homepage.{"\n"}
            - Enter your personal information and health preferences.{"\n"}
            - Confirm your email address by clicking the verification link sent to your inbox.{"\n"}
            - Once confirmed, you'll be redirected to your dashboard.{"\n"}
            - If you face any issues, please contact support.
          </Text>
        </View>

        {/* Booking Appointments */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Booking Appointments</Text>
          <LinearGradient
            colors={['#0091ff', '#8400ff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.dynamicUnderline, getDynamicUnderline('Booking Appointments')]}
          />
          <Text style={[styles.instructions, { color: theme.colors.secondary }]}>
            - Navigate to the "Appointments" tab on the dashboard.{"\n"}
            - Choose your preferred healthcare provider and available time slot.{"\n"}
            - Confirm your appointment and receive reminders via email or SMS.{"\n"}
            - If needed, you can reschedule or cancel your appointment from the same tab.{"\n"}
            - If you face any issues, you can contact your healthcare provider directly via the app.
          </Text>
        </View>

        {/* Managing Your Profile */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Managing Your Profile</Text>
          <LinearGradient
            colors={['#0091ff', '#8400ff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.dynamicUnderline, getDynamicUnderline('Managing Your Profile')]}
          />
          <Text style={[styles.instructions, { color: theme.colors.secondary }]}>
            - Go to the "Profile" section from your dashboard.{"\n"}
            - Edit your personal details such as name, age, and contact information.{"\n"}
            - You can also update your health preferences and notification settings here.
          </Text>
        </View>

        {/* Resetting Your Password */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Resetting Your Password</Text>
          <LinearGradient
            colors={['#0091ff', '#8400ff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.dynamicUnderline, getDynamicUnderline('Resetting Your Password')]}
          />
          <Text style={[styles.instructions, { color: theme.colors.secondary }]}>
            - Click on "Forgot Password" on the login page.{"\n"}
            - Enter your registered email address.{"\n"}
            - Follow the instructions in the email to reset your password.{"\n"}
            - If you encounter any issues during the reset process, please contact support.
          </Text>
        </View>

        {/* Contact Us Section */}
        <Text style={[styles.description, { color: theme.colors.secondary }]}>
          If you need further assistance, please feel free to contact us directly.
        </Text>
        <TouchableOpacity style={styles.contactButton} onPress={() => navigation.navigate('Contact Us')}>
          <Text style={styles.buttonText}>Contact Us</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

// **Dynamic Underline Function (Fixes the issue)**
const getDynamicUnderline = (text: string) => ({
  width: text.length * 10, // Adjust width dynamically based on text length
});

// **Styles**
const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'left', marginBottom: 5 },
  description: { fontSize: 16, textAlign: 'left', marginBottom: 15 },
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5, textAlign: 'left' },
  instructions: { fontSize: 16, lineHeight: 24, textAlign: 'left' },
  contactButton: {
    backgroundColor: '#0084ff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },

  dynamicUnderline: {
    height: 3,
    borderRadius: 5,
    marginBottom: 15,
    alignSelf: 'flex-start',
  },
});
