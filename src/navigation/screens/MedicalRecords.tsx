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
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

// Define navigation type
type RootStackParamList = {
  Auth: { screen: 'Login' | 'Signup' };
};


export function MedicalRecords() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user, setUser } = useAuth();


  // State for tracking edits
  const [editedInfo, setEditedInfo] = useState({
    fullName: user?.fullName || '',
    dateOfBirth: user?.dateOfBirth || '',
    gender: user?.gender || '',
    bloodType: user?.bloodType || '',
    emergencyContact: user?.emergencyContact || '',
    medicalHistory: user?.medicalHistory || '',
    vaccinations: user?.vaccinations || '',
    smokingStatus: user?.smokingStatus || '',
    alcoholConsumption: user?.alcoholConsumption || '',
    exerciseRoutine: user?.exerciseRoutine || '',
    sleepPatterns: user?.sleepPatterns || '',
    healthLogs: user?.healthLogs || '',
    labResults: user?.labResults || '',
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
      await fetchMedicalRecords();

      const updatedMedicalRecords = {
        ...medicalRecords,
        email: user.email, // required for backend to match
        userEmail: user.email,
        fullName: editedInfo.fullName || medicalRecords?.fullName || '',
        dateOfBirth: editedInfo.dateOfBirth || medicalRecords?.dateOfBirth || '',
        gender: editedInfo.gender || medicalRecords?.gender || '',
        bloodType: editedInfo.bloodType || medicalRecords?.bloodType || '',
        emergencyContact: editedInfo.emergencyContact || medicalRecords?.emergencyContact || '',
        medications: medicalRecords?.medications || [],
        healthLogs: medicalRecords?.healthLogs || '',
        labResults: medicalRecords?.labResults || '',
        doctorVisits: medicalRecords?.doctorVisits || '',
        heartRate: medicalRecords?.heartRate || [],
        stepCount: medicalRecords?.stepCount || [],
        sleepTracking: medicalRecords?.sleepTracking || [],
        bloodOxygen: medicalRecords?.bloodOxygen || [],
        organDonorStatus: medicalRecords?.organDonorStatus || '',
        medicalDirectives: medicalRecords?.medicalDirectives || '',
      };

      const response = await fetch("http://192.168.0.84:3000/save-medical-records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedMedicalRecords),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Error saving medical records:", data.message);
        return;
      }

      console.log("✅ Medical records updated successfully:", data.message);

      setMedicalRecords(updatedMedicalRecords);

      setUser((prev) => ({
        ...prev!,
        ...updatedMedicalRecords,
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
    fetchMedicalRecords(); // Refresh first

    setTimeout(() => {
      setEditedInfo({
        fullName: medicalRecords?.fullName || '',
        dateOfBirth: medicalRecords?.dateOfBirth || '',
        gender: medicalRecords?.gender || '',
        bloodType: medicalRecords?.bloodType || '',
        emergencyContact: medicalRecords?.emergencyContact || '',
        medicalHistory: medicalRecords?.medicalHistory || '',
        vaccinations: medicalRecords?.vaccinations || '',
        smokingStatus: medicalRecords?.smokingStatus || '',
        alcoholConsumption: medicalRecords?.alcoholConsumption || '',
        exerciseRoutine: medicalRecords?.exerciseRoutine || '',
        sleepPatterns: medicalRecords?.sleepPatterns || '',
        healthLogs: medicalRecords?.healthLogs || '',
        labResults: medicalRecords?.labResults || '',
      });

      setIsEditing(true);
    }, 300); // Give it a moment to populate state (if needed)
  };

  // Function to cancel edits
  const cancelEdit = () => {
    setEditedInfo({
      fullName: user?.fullName || '',
      dateOfBirth: user?.dateOfBirth || '',
      gender: user?.gender || '',
      bloodType: user?.bloodType || '',
      emergencyContact: user?.emergencyContact || '',
      medicalHistory: user?.medicalHistory || '',
      vaccinations: user?.vaccinations || '',
      smokingStatus: user?.smokingStatus || '',
      alcoholConsumption: user?.alcoholConsumption || '',
      exerciseRoutine: user?.exerciseRoutine || '',
      sleepPatterns: user?.sleepPatterns || '',
      healthLogs: user?.healthLogs || '',
      labResults: user?.labResults || '',
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
      medications: newExpandState, // already present
      vaccinationRecords: newExpandState,
      lifestyleHabits: newExpandState,
      symptomsLogs: newExpandState,
      labReports: newExpandState,
      doctorVisits: newExpandState,
      wearableData: newExpandState,
      emergencyDetails: newExpandState,
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
            <KeyboardAwareScrollView
              contentContainerStyle={{ flexGrow: 1, padding: 20, paddingBottom: 150 }}
              showsVerticalScrollIndicator={true}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
              keyboardShouldPersistTaps="handled"
              extraScrollHeight={100} // 
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


              {/* Medical History Section */}
              <View style={{ borderRadius: 12, padding: 2, marginBottom: 20 }}>
                <LinearGradient colors={['#8a5fff', '#0077ffea']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 12, padding: 2 }}>
                  <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 10 }}>
                    <TouchableOpacity onPress={() => toggleSection('medicalHistory')} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 }}>
                      <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text }}>Medical History</Text>
                      <Text style={{ fontSize: 18, color: theme.colors.text }}>
                        {expandedSections['medicalHistory'] ? '▲' : '▼'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </View>

              {/* Content inside Medical History section */}
              {expandedSections['medicalHistory'] && (
                <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', padding: 12, borderRadius: 10, marginBottom: 20 }}>
                  {isEditing ? (
                    <>
                      <TextInput
                        value={editedInfo.medicalHistory || ''}
                        onChangeText={(text) => handleInputChange('medicalHistory', text)}
                        placeholder="Enter medical history"
                        style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                        multiline
                      />
                      <TouchableOpacity onPress={cancelEdit} style={styles.cancelButton}>
                        <Text style={styles.buttonText}>Cancel</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <Text style={{ fontSize: 16, color: theme.colors.text }}>
                        {medicalRecords?.medicalHistory || 'No records found'}
                      </Text>
                      <TouchableOpacity onPress={startEditing} style={styles.editButton}>
                        <Text style={styles.buttonText}>Edit</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              )}



              {/* Current Medications Section */}
              <View style={{ borderRadius: 12, padding: 2, marginBottom: 20 }}>
                <LinearGradient colors={['#8a5fff', '#0077ffea']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 12, padding: 2 }}>
                  <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 10 }}>
                    <TouchableOpacity onPress={() => toggleSection('medications')} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 }}>
                      <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text }}>Current Medications</Text>
                      <Text style={{ fontSize: 18, color: theme.colors.text }}>
                        {expandedSections['medications'] ? '▲' : '▼'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </View>

              {expandedSections['medications'] && (
                <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', padding: 12, borderRadius: 10, marginBottom: 20 }}>
                  {medicalRecords?.medications && medicalRecords.medications.length > 0 ? (
                    medicalRecords.medications.map((med: any, index: number) => (
                      <Text key={index} style={{ fontSize: 16, color: theme.colors.text, marginBottom: 10 }}>
                        <Text style={{ fontWeight: 'bold' }}>Medication {index + 1}:</Text> {med.name} |{' '}
                        <Text style={{ fontWeight: 'bold' }}>Dosage:</Text> {med.dosage} |{' '}
                        <Text style={{ fontWeight: 'bold' }}>Frequency:</Text> {med.frequency} |{' '}
                        <Text style={{ fontWeight: 'bold' }}>Time to Take:</Text> {med.timeToTake} |{' '}
                        <Text style={{ fontWeight: 'bold' }}>Duration:</Text> {med.duration} |{' '}
                        <Text style={{ fontWeight: 'bold' }}>Diagnosis:</Text> {med.diagnosis}
                      </Text>
                    ))
                  ) : (
                    <Text style={{ fontSize: 16, color: theme.colors.text }}>No medications recorded.</Text>
                  )}
                </View>
              )}


              {/* Vaccination Records Section */}
              <View style={{ borderRadius: 12, padding: 2, marginBottom: 20 }}>
                <LinearGradient
                  colors={['#8a5fff', '#0077ffea']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ borderRadius: 12, padding: 2 }}
                >
                  <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 10 }}>
                    <TouchableOpacity
                      onPress={() => toggleSection('vaccinations')}
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                      }}
                    >
                      <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text }}>
                        Vaccination Records
                      </Text>
                      <Text style={{ fontSize: 18, color: theme.colors.text }}>
                        {expandedSections['vaccinations'] ? '▲' : '▼'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </View>

              {expandedSections['vaccinations'] && (
                <View
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    padding: 12,
                    borderRadius: 10,
                    marginBottom: 20,
                  }}
                >
                  {isEditing ? (
                    <>
                      <TextInput
                        value={editedInfo.vaccinations}
                        onChangeText={(text) => handleInputChange('vaccinations', text)}
                        placeholder="Vaccination Records"
                        style={styles.input}
                      />
                      <TouchableOpacity onPress={cancelEdit} style={styles.cancelButton}>
                        <Text style={styles.buttonText}>Cancel</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <Text style={{ fontSize: 16, color: theme.colors.text }}>
                        <Text style={{ fontWeight: 'bold' }}>Vaccinations:</Text>{' '}
                        {medicalRecords?.vaccinations || 'N/A'}
                      </Text>
                      <TouchableOpacity onPress={startEditing} style={styles.editButton}>
                        <Text style={styles.buttonText}>Edit</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              )}


              {/* Lifestyle & Habits Section */}
              <View style={{ borderRadius: 12, padding: 2, marginBottom: 20 }}>
                <LinearGradient colors={['#8a5fff', '#0077ffea']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 12, padding: 2 }}>
                  <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 10 }}>
                    <TouchableOpacity
                      onPress={() => toggleSection('lifestyleHabits')}
                      style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 }}
                    >
                      <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text }}>
                        Lifestyle & Habits
                      </Text>
                      <Text style={{ fontSize: 18, color: theme.colors.text }}>
                        {expandedSections['lifestyleHabits'] ? '▲' : '▼'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </View>

              {expandedSections['lifestyleHabits'] && (
                <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', padding: 12, borderRadius: 10, marginBottom: 20 }}>
                  {isEditing ? (
                    <>
                      <TextInput
                        value={editedInfo.smokingStatus}
                        onChangeText={(text) => handleInputChange('smokingStatus', text)}
                        placeholder="Smoking Status"
                        style={styles.input}
                      />
                      <TextInput
                        value={editedInfo.alcoholConsumption}
                        onChangeText={(text) => handleInputChange('alcoholConsumption', text)}
                        placeholder="Alcohol Consumption"
                        style={styles.input}
                      />
                      <TextInput
                        value={editedInfo.exerciseRoutine}
                        onChangeText={(text) => handleInputChange('exerciseRoutine', text)}
                        placeholder="Exercise Routine"
                        style={styles.input}
                      />
                      <TextInput
                        value={editedInfo.sleepPatterns}
                        onChangeText={(text) => handleInputChange('sleepPatterns', text)}
                        placeholder="Sleep Patterns"
                        style={styles.input}
                      />
                      <TouchableOpacity onPress={cancelEdit} style={styles.cancelButton}>
                        <Text style={styles.buttonText}>Cancel</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <Text style={{ fontSize: 16, color: theme.colors.text }}>
                        <Text style={{ fontWeight: 'bold' }}>Smoking:</Text> {medicalRecords?.smokingStatus || 'N/A'} |{' '}
                        <Text style={{ fontWeight: 'bold' }}>Alcohol:</Text> {medicalRecords?.alcoholConsumption || 'N/A'} |{' '}
                        <Text style={{ fontWeight: 'bold' }}>Exercise:</Text> {medicalRecords?.exerciseRoutine || 'N/A'} |{' '}
                        <Text style={{ fontWeight: 'bold' }}>Sleep:</Text> {medicalRecords?.sleepPatterns || 'N/A'}
                      </Text>
                      <TouchableOpacity onPress={startEditing} style={styles.editButton}>
                        <Text style={styles.buttonText}>Edit</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              )}



              {/* Symptoms & Health Logs Section */}
              <View style={{ borderRadius: 12, padding: 2, marginBottom: 20 }}>
                <LinearGradient colors={['#8a5fff', '#0077ffea']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 12, padding: 2 }}>
                  <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 10 }}>
                    <TouchableOpacity onPress={() => toggleSection('symptomsLogs')} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 }}>
                      <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text }}>Symptoms & Health Logs</Text>
                      <Text style={{ fontSize: 18, color: theme.colors.text }}>
                        {expandedSections['symptomsLogs'] ? '▲' : '▼'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </View>

              {expandedSections['symptomsLogs'] && (
                <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', padding: 12, borderRadius: 10, marginBottom: 20 }}>
                  {isEditing ? (
                    <>
                      <TextInput
                        value={editedInfo.healthLogs}
                        onChangeText={(text) => handleInputChange('healthLogs', text)}
                        placeholder="Enter symptoms"
                        multiline
                        style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                      />
                      <TouchableOpacity onPress={cancelEdit} style={styles.cancelButton}>
                        <Text style={styles.buttonText}>Cancel</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <Text style={{ fontSize: 16, color: theme.colors.text }}>
                        {medicalRecords?.healthLogs || 'No symptoms recorded'}
                      </Text>
                      <TouchableOpacity onPress={startEditing} style={styles.editButton}>
                        <Text style={styles.buttonText}>Edit</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              )}

              {/* Lab Results & Reports Section */}
              <View style={{ borderRadius: 12, padding: 2, marginBottom: 20 }}>
                <LinearGradient colors={['#8a5fff', '#0077ffea']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 12, padding: 2 }}>
                  <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 10 }}>
                    <TouchableOpacity onPress={() => toggleSection('labReports')} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 }}>
                      <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text }}>Lab Results & Reports</Text>
                      <Text style={{ fontSize: 18, color: theme.colors.text }}>
                        {expandedSections['labReports'] ? '▲' : '▼'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </View>

              {expandedSections['labReports'] && (
                <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', padding: 12, borderRadius: 10, marginBottom: 20 }}>
                  {isEditing ? (
                    <>
                      <TextInput
                        value={editedInfo.labResults}
                        onChangeText={(text) => handleInputChange('labResults', text)}
                        placeholder="Enter lab results"
                        style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                        multiline
                      />
                      <TouchableOpacity onPress={cancelEdit} style={styles.cancelButton}>
                        <Text style={styles.buttonText}>Cancel</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <Text style={{ fontSize: 16, color: theme.colors.text }}>
                        {medicalRecords?.labResults || 'No reports available'}
                      </Text>
                      <TouchableOpacity onPress={startEditing} style={styles.editButton}>
                        <Text style={styles.buttonText}>Edit</Text>
                      </TouchableOpacity>
                    </>
                  )}
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

            </KeyboardAwareScrollView>
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
    backgroundColor: '#ae03e2f8',
    borderRadius: 8,
    alignItems: 'center',
  },
});
