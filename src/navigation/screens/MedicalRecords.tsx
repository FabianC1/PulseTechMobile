import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { useTheme } from 'styled-components/native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useAuth } from '../AuthContext';
import { useEffect } from 'react';

// Define navigation type
type RootStackParamList = {
  Auth: { screen: 'Login' | 'Signup' };
};


export function MedicalRecords() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useAuth(); // Get authentication state

  // State for tracking edits
  const [editedInfo, setEditedInfo] = useState({
    fullName: user?.fullName || '',
    dateOfBirth: user?.dateOfBirth || '',
    gender: user?.gender || '',
    bloodType: user?.bloodType || '',
    emergencyContact: user?.emergencyContact || '',
  });

  // State for storing medical records
  const [medicalRecords, setMedicalRecords] = useState<Record<string, any>>({});

  // Function to fetch medical records
  const fetchMedicalRecords = async () => {
    try {
      if (!user?.email) {
        console.error("User email is missing. Cannot fetch medical records.");
        return;
      }

      setRefreshing(true);

      const response = await fetch(
        `http://192.168.0.84:3000/get-medical-records?email=${encodeURIComponent(user.email)}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await response.json();


      if (!response.ok) {
        console.error("❌ Error fetching medical records:", data.message);
        setRefreshing(false);
        return;
      }

      setMedicalRecords(data);

      setRefreshing(false);
    } catch (error) {
      console.error("❌ Error fetching medical records:", error);
      setRefreshing(false);
    }
  };

  const saveMedicalRecords = async () => {
    if (!user?.email) {
      console.error("User email is missing. Cannot save medical records.");
      return;
    }
  
    try {
      const response = await fetch("http://192.168.0.84:3000/save-medical-records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          fullName: editedInfo.fullName || medicalRecords?.fullName || '',
          dateOfBirth: editedInfo.dateOfBirth || medicalRecords?.dateOfBirth || '',
          gender: editedInfo.gender || medicalRecords?.gender || '',
          bloodType: editedInfo.bloodType || medicalRecords?.bloodType || '',
          emergencyContact: editedInfo.emergencyContact || medicalRecords?.emergencyContact || '',
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        console.error("Error saving medical records:", data.message);
        return;
      }
  
      console.log("✅ Medical records updated successfully:", data.message);
  
      setMedicalRecords((prev) => ({
        ...prev,
        fullName: editedInfo.fullName || prev?.fullName || '',
        dateOfBirth: editedInfo.dateOfBirth || prev?.dateOfBirth || '',
        gender: editedInfo.gender || prev?.gender || '',
        bloodType: editedInfo.bloodType || prev?.bloodType || '',
        emergencyContact: editedInfo.emergencyContact || prev?.emergencyContact || '',
      }));
  
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving medical records:", error);
    }
  };
  

  // Other states
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [isEditing, setIsEditing] = useState(false); // Tracks whether user is editing

  // Function to toggle sections
  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Function to enable edit mode
  const startEditing = () => {
    setEditedInfo({
      fullName: medicalRecords?.fullName || '',
      dateOfBirth: medicalRecords?.dateOfBirth || '',
      gender: medicalRecords?.gender || '',
      bloodType: medicalRecords?.bloodType || '',
      emergencyContact: medicalRecords?.emergencyContact || '',
    });
    setIsEditing(true);
  };  

  // Function to cancel edits
  const cancelEdit = () => {
    setEditedInfo({
      fullName: user?.fullName || '',
      dateOfBirth: user?.dateOfBirth || '',
      gender: user?.gender || '',
      bloodType: user?.bloodType || '',
      emergencyContact: user?.emergencyContact || '',
    });
    setIsEditing(false);
  };

  const [refreshing, setRefreshing] = useState(false);

  // Fetch medical records when the component mounts
  useEffect(() => {
    fetchMedicalRecords();
  }, []);

  // Pull-to-refresh functionality
  const onRefresh = useCallback(() => {
    fetchMedicalRecords();
  }, []);

  const [expandAll, setExpandAll] = useState(false);

  const toggleAllSections = () => {
    const allExpanded = Object.values(expandedSections).every((isOpen) => isOpen);
    const newExpandState = !allExpanded;

    setExpandAll(newExpandState);
    setExpandedSections({
      personalInfo: newExpandState,
      medicalHistory: newExpandState,
      medications: newExpandState,
      emergency: newExpandState,
    });
  };



  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const saveChanges = () => {
    console.log("Saving changes:", editedInfo);
    setIsEditing(false);
  };


  const handleInputChange = (field: string, value: string) => {
    setEditedInfo((prev) => ({ ...prev, [field]: value }));
  };


  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <LinearGradient colors={theme.colors.background} style={{ flex: 1 }}>
          {user ? (
            <ScrollView
              contentContainerStyle={{ flexGrow: 1, padding: 20, paddingBottom: 100 }}
              showsVerticalScrollIndicator={true}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>

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

              {/* Content inside the section */}
              {expandedSections['personalInfo'] && (
                <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', padding: 12, borderRadius: 10, marginBottom: 20 }}>

                  {/* If editing, show input fields */}
                  {isEditing ? (
                    <>
                      <TextInput value={editedInfo.fullName} onChangeText={(text) => handleInputChange('fullName', text)} placeholder="Full Name" style={styles.input} />
                      <TextInput value={editedInfo.dateOfBirth} onChangeText={(text) => handleInputChange('dateOfBirth', text)} placeholder="DOB" style={styles.input} />
                      <TextInput value={editedInfo.gender} onChangeText={(text) => handleInputChange('gender', text)} placeholder="Gender" style={styles.input} />
                      <TextInput value={editedInfo.bloodType} onChangeText={(text) => handleInputChange('bloodType', text)} placeholder="Blood Type" style={styles.input} />
                      <TextInput value={editedInfo.emergencyContact} onChangeText={(text) => handleInputChange('emergencyContact', text)} placeholder="Emergency Contact" style={styles.input} />

                      {/* Cancel button */}
                      <TouchableOpacity onPress={cancelEdit} style={styles.cancelButton}>
                        <Text style={styles.buttonText}>Cancel</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <Text style={{ fontSize: 16, color: theme.colors.text }}>
                        <Text style={{ fontWeight: 'bold' }}>Full Name:</Text> {medicalRecords?.fullName || 'N/A'}
                      </Text>

                      <Text style={{ fontSize: 16, color: theme.colors.text }}>
                        <Text style={{ fontWeight: 'bold' }}>DOB:</Text> {medicalRecords?.dateOfBirth || 'N/A'}
                      </Text>

                      <Text style={{ fontSize: 16, color: theme.colors.text }}>
                        <Text style={{ fontWeight: 'bold' }}>Gender:</Text> {medicalRecords?.gender || 'N/A'}
                      </Text>

                      <Text style={{ fontSize: 16, color: theme.colors.text }}>
                        <Text style={{ fontWeight: 'bold' }}>Blood Type:</Text> {medicalRecords?.bloodType || 'N/A'}
                      </Text>

                      <Text style={{ fontSize: 16, color: theme.colors.text }}>
                        <Text style={{ fontWeight: 'bold' }}>Emergency Contact:</Text> {medicalRecords?.emergencyContact || 'N/A'}
                      </Text>


                      {/* Edit button */}
                      <TouchableOpacity onPress={startEditing} style={styles.editButton}>
                        <Text style={styles.buttonText}>Edit</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              )}

              {/* Dummy Section */}
              <View style={{ borderRadius: 12, padding: 2, marginBottom: 20 }}>
                <LinearGradient colors={['#ff7e5f', '#fd3a69']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 12, padding: 2 }}>
                  <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 10 }}>
                    <TouchableOpacity onPress={() => toggleSection('dummySection')} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 }}>
                      <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text }}>Dummy Section</Text>
                      <Text style={{ fontSize: 18, color: theme.colors.text }}>
                        {expandedSections['dummySection'] ? '▲' : '▼'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </View>

              {/* Content inside Dummy Section */}
              {expandedSections['dummySection'] && (
                <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', padding: 12, borderRadius: 10, marginBottom: 20 }}>
                  <Text style={{ fontSize: 16, color: theme.colors.text }}>This is a test section to check expand/collapse functionality.</Text>
                </View>
              )}


              {/* More Sections Here... */}




              {isEditing && (
                <TouchableOpacity
                  onPress={saveMedicalRecords}
                  style={[styles.saveButton, { backgroundColor: theme.colors.saveButton }]}
                >
                  <Text style={[styles.buttonText, { color: theme.colors.text }]}>Save</Text>
                </TouchableOpacity>
              )}


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
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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
  input: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 16,
  },
  editButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#0077ff',
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButton: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#28a745',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#dc3545',
    borderRadius: 8,
    alignItems: 'center',
  },
});
