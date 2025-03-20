import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useTheme } from 'styled-components/native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useAuth } from '../AuthContext';

// Define navigation type
type RootStackParamList = {
  Auth: { screen: 'Login' | 'Signup' };
};

export function MedicalRecords() {

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);


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
    <LinearGradient colors={theme.colors.background} style={{ flex: 1 }}>
      {user ? (
        <ScrollView
          contentContainerStyle={{ padding: 20 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <Text style={{ fontSize: 22, fontWeight: 'bold', textAlign: 'center', color: theme.colors.text, marginBottom: 20 }}>
            View and manage your medical records
          </Text>

          {/* Expand All / Collapse All Button */}
          <TouchableOpacity onPress={toggleAllSections} style={{ padding: 12, alignSelf: 'center', borderRadius: 8, marginBottom: 15, backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.text }}>
              {expandAll ? 'Collapse All' : 'Expand All'}
            </Text>
          </TouchableOpacity>

          {/* Personal Information Section */}
          <View style={{ borderRadius: 12, padding: 2, marginBottom: 20 }}>
            <LinearGradient colors={['#8a5fff', '#0077ffea']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 12, padding: 2 }}>
              <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 10 }}>
                <TouchableOpacity onPress={() => toggleSection('personalInfo')} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 }}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text }}>Personal Information</Text>
                  <Text style={{ fontSize: 18, color: theme.colors.text }}>
                    {expandedSections['personalInfo'] ? '▲' : '▼'}
                  </Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>

          {expandedSections['personalInfo'] && (
            <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', padding: 12, borderRadius: 10, marginBottom: 20 }}>
              <Text style={{ fontSize: 16, color: theme.colors.text }}>
                <Text style={{ fontWeight: 'bold' }}>Full Name:</Text> {user.fullName}
              </Text>
            </View>
          )}

          {/* More Sections Here... */}

        </ScrollView>
      ) : (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 16, textAlign: 'center', color: theme.colors.text }}>You need to log in or sign up</Text>
          <Text style={{ fontSize: 16, textAlign: 'center', color: theme.colors.secondary, marginBottom: 10 }}>
            To access your medical records, please log in or create an account.
          </Text>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 15 }}>
            <TouchableOpacity onPress={() => navigation.navigate('Auth', { screen: 'Login' })} style={{ paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, backgroundColor: theme.colors.primary }}>
              <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: 'bold' }}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Auth', { screen: 'Signup' })} style={{ paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, backgroundColor: theme.colors.primary }}>
              <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: 'bold' }}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </LinearGradient>
  );
}

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
  },
  sectionContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // Normal background for content
    padding: 12,
    borderRadius: 10,
    marginBottom: 20, // Extra spacing after content as well
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  arrow: {
    fontSize: 18,
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
  gradientWrapper: {
    borderRadius: 12, // Smooth corners for border
    padding: 2, // Creates space for border effect
    marginBottom: 20, // Increased spacing between each section
  },
  gradientBorder: {
    borderRadius: 12, // Smooth edges for border
    padding: 2, // Creates the illusion of a border
  },
  innerSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
  },
});
