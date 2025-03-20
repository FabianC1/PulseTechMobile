import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from 'styled-components/native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useAuth } from '../AuthContext';

// Define navigation type
type RootStackParamList = {
  Auth: { screen: 'Login' | 'Signup' };
};

export function MedicalRecords() {


  const theme = useTheme();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useAuth(); // Get authentication state
  const [expandAll, setExpandAll] = useState(false);

// State to track which sections are expanded
const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

// Expand All / Collapse All function (now correctly accessing expandedSections)
const toggleAllSections = () => {
  const newExpandState = !expandAll;
  setExpandAll(newExpandState);

  // Expand/collapse all sections correctly
  const updatedSections: Record<string, boolean> = {
    personalInfo: newExpandState,
    medicalHistory: newExpandState,
    medications: newExpandState,
    emergency: newExpandState,
  };

  setExpandedSections(updatedSections);
};

  // Function to toggle sections
  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <LinearGradient colors={theme.colors.background} style={styles.container}>
      {/* If user is logged in, show medical records */}
      {user ? (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            View and manage your medical records
          </Text>

          {/* Expand All / Collapse All Button */}
          <TouchableOpacity style={styles.expandAllButton} onPress={toggleAllSections}>
            <Text style={[styles.expandAllText, { color: theme.colors.text }]}>
              {expandAll ? 'Collapse All' : 'Expand All'}
            </Text>
          </TouchableOpacity>


          {/* Personal Information Section */}
          <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection('personalInfo')}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Personal Information</Text>
            <Text style={[styles.arrow, { color: theme.colors.text }]}>
              {expandedSections['personalInfo'] ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>
          {expandedSections['personalInfo'] && (
            <View style={styles.sectionContent}>
              <Text style={[styles.sectionText, { color: theme.colors.text }]}>
                <Text style={styles.bold}>Full Name:</Text> {user.fullName}
              </Text>
              <Text style={[styles.sectionText, { color: theme.colors.text }]}>
                <Text style={styles.bold}>DOB:</Text> {user.dateOfBirth}
              </Text>
              <Text style={[styles.sectionText, { color: theme.colors.text }]}>
                <Text style={styles.bold}>Gender:</Text> {user.gender}
              </Text>
            </View>
          )}

          {/* Medical History Section */}
          <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection('medicalHistory')}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Medical History</Text>
            <Text style={[styles.arrow, { color: theme.colors.text }]}>
              {expandedSections['medicalHistory'] ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>
          {expandedSections['medicalHistory'] && (
            <View style={styles.sectionContent}>
              <Text style={[styles.sectionText, { color: theme.colors.text }]}>
                {user.medicalHistory || 'No medical history recorded'}
              </Text>
            </View>
          )}

          {/* Medications Section */}
          <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection('medications')}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Medications</Text>
            <Text style={[styles.arrow, { color: theme.colors.text }]}>
              {expandedSections['medications'] ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>
          {expandedSections['medications'] && (
            <View style={styles.sectionContent}>
              {user.medications && user.medications.length > 0 ? (
                user.medications.map((medication: any, index: number) => (
                  <Text key={index} style={[styles.sectionText, { color: theme.colors.text }]}>
                    <Text style={styles.bold}>{medication.name}:</Text> {medication.dosage}, {medication.frequency}
                  </Text>
                ))
              ) : (
                <Text style={[styles.sectionText, { color: theme.colors.text }]}>No medications recorded.</Text>
              )}
            </View>
          )}

          {/* Emergency Contacts */}
          <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection('emergency')}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Emergency Contacts</Text>
            <Text style={[styles.arrow, { color: theme.colors.text }]}>
              {expandedSections['emergency'] ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>
          {expandedSections['emergency'] && (
            <View style={styles.sectionContent}>
              <Text style={[styles.sectionText, { color: theme.colors.text }]}>
                <Text style={styles.bold}>Contact:</Text> {user.emergencyContact}
              </Text>
            </View>
          )}
        </ScrollView>
      ) : (
        // If not logged in, show login/signup prompt
        <View style={styles.authPrompt}>
          <Text style={[styles.authText, { color: theme.colors.text }]}>
            You need to log in or sign up
          </Text>
          <Text style={[styles.authText, { color: theme.colors.secondary }]}>
            To access your medical records, please log in or create an account.
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.authButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => navigation.navigate('Auth', { screen: 'Login' })}
            >
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.authButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => navigation.navigate('Auth', { screen: 'Signup' })}
            >
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </LinearGradient>
  );
}

// **Styles**
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContainer: {
    paddingVertical: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Fallback color
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  arrow: {
    fontSize: 18,
  },
  sectionContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  sectionText: {
    fontSize: 16,
    marginBottom: 5,
  },
  bold: {
    fontWeight: 'bold',
  },
  authPrompt: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  authText: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
  },
  authButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  expandAllButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: 'center',
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  expandAllText: {
    fontSize: 16,
    fontWeight: 'bold',
  },

});
