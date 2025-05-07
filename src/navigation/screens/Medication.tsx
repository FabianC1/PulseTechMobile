import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from 'styled-components/native';
import axios from 'axios';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useAuth } from '../AuthContext';
import CustomAlerts from './CustomAlerts';
import { Picker } from '@react-native-picker/picker';
import DropDownPicker from 'react-native-dropdown-picker';
import { registerForPushNotificationsAsync, scheduleNotification } from '../../NotificationService';

type RootStackParamList = {
  Auth: { screen: 'Login' | 'Signup' };
};

type MedicationLog = {
  time: string;
  status: 'Taken' | 'Missed';
};

type MedicationItem = {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  diagnosis: string;
  timeToTake: string; // example: "16:00" (4 PM)
  logs?: MedicationLog[];
  nextDoseTime?: string;
};

export function Medication() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const [medications, setMedications] = useState<MedicationItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const [showSimulators, setShowSimulators] = useState(false);
  const [simulatedNow, setSimulatedNow] = useState<Date>(new Date());

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const [markedMissed, setMarkedMissed] = useState<Set<string>>(new Set());
  const [medicationsLoaded, setMedicationsLoaded] = useState(false);
  const prevDoseTimesRef = useRef<Record<string, number>>({});
  const takenThisWindowRef = useRef<Set<string>>(new Set());
  const [isEditing, setIsEditing] = useState<Record<string, boolean>>({});
  const [medicationInputs, setMedicationInputs] = useState<Record<string, string>>({});
  const [medicationSuggestions, setMedicationSuggestions] = useState<{ [email: string]: string[] }>({});
  const [medicationForm, setMedicationForm] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState<{ [email: string]: boolean }>({});

  const missedLoggedRef = useRef<Set<string>>(new Set());


  const [originalMedicationForm, setOriginalMedicationForm] = useState<{
    [email: string]: MedicationFormFields;
  }>({});



  const [medicationData, setMedicationData] = useState<Record<string, {
    dosage: string;
    frequency: string;
    time: string;
    duration: string;
    diagnosis: string;
  }>>({});


  type Patient = {
    fullName: string;
    email: string;
  };

  const [patientsList, setPatientsList] = useState<Patient[]>([]);

  type MedicationFormFields = {
    name?: string;
    dosage?: string;
    frequency?: string;
    timeToTake?: string;
    duration?: string;
    diagnosis?: string;
  };

  const toggleMedicationEdit = (email: string) => {
    setIsEditing(prev => ({ ...prev, [email]: !prev[email] }));

    if (!isEditing[email]) {
      // Save original values only when starting to edit
      setOriginalMedicationForm(prev => ({
        ...prev,
        [email]: medicationForm[email] || {}
      }));
    }
  };


  const cancelMedicationEdit = (email: string) => {
    setMedicationForm(prev => ({
      ...prev,
      [email]: originalMedicationForm[email] || {}
    }));

    setIsEditing(prev => ({ ...prev, [email]: false }));
  };



  const fetchPatients = async () => {
    try {
      const response = await fetch('http://10.249.112.253:3000/get-patients');
      const data = await response.json();

      if (response.ok && Array.isArray(data)) {
        setPatientsList(data);
      } else {
        console.error('Invalid patient list response:', data);
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
    }
  };

  useEffect(() => {
    if (user?.role === 'doctor') {
      fetchPatients();
    }
  }, [user]);


  const handleSecretPress = () => {
    setShowSimulators(prev => !prev);
  };

  const simulateTimeForward = (hours: number) => {
    const newTime = new Date(simulatedNow.getTime() + hours * 60 * 60 * 1000);
    setSimulatedNow(newTime);
  };


  const calculateNextDoseTime = (
    timeToTake: string, // "8 PM"
    frequency: string,  // "Every 12 hours"
    currentTime: Date | number
  ): number | null => {
    if (!timeToTake) return null;

    const frequencyMap: Record<string, number> = {
      'Every hour': 1,
      'Every 4 hours': 4,
      'Every 6 hours': 6,
      'Every 8 hours': 8,
      'Every 12 hours': 12,
      'Once a day': 24,
      '2 times a day': 12,
      '3 times a day': 8,
    };

    const freqHours = frequencyMap[frequency] || 24;

    // Convert "8 PM" or "12 AM" → hours and minutes
    const parsed = new Date(`1970-01-01T${convertTo24Hour(timeToTake)}:00`);
    if (isNaN(parsed.getTime())) return null;

    const startHour = parsed.getHours();
    const startMinute = parsed.getMinutes();

    const now = new Date(currentTime);
    const start = new Date(now);
    start.setHours(startHour, startMinute, 0, 0);

    // Go backward in time until we find the last possible dose time before now
    while (start.getTime() > now.getTime()) {
      start.setHours(start.getHours() - freqHours);
    }

    // Step forward until we pass the current time
    let nextDose = new Date(start);
    while (nextDose.getTime() <= now.getTime()) {
      nextDose.setHours(nextDose.getHours() + freqHours);
    }

    return nextDose.getTime();
  };

  // Converts "8 PM" or "12 AM" etc. → "20:00"
  function convertTo24Hour(time: string): string {
    const [_, hh, mm = '00', period] = time.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i) || [];
    if (!hh || !period) return '00:00';
    let hour = parseInt(hh);
    if (period.toUpperCase() === 'PM' && hour !== 12) hour += 12;
    if (period.toUpperCase() === 'AM' && hour === 12) hour = 0;
    return `${hour.toString().padStart(2, '0')}:${mm}`;
  }

  useEffect(() => {
    if (user?.email) {
      fetchMedications();
      registerForPushNotificationsAsync();
    }
  }, [user]);

  const fetchMedications = async () => {
    if (!user?.email) return;
    try {
      const res = await axios.get<{ medications: MedicationItem[] }>(
        `http://10.249.112.253:3000/get-medical-records?email=${user.email}`
      );

      setMedications(res.data.medications || []);
      setMedicationsLoaded(true);
    } catch (err) {
      console.error('Error fetching medications:', err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setSimulatedNow(new Date());  // Reset simulated time to the current time
    await fetchMedications();
    setRefreshing(false);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setSimulatedNow(new Date());
    }, 60 * 1000); // update every 1 minute
  
    return () => clearInterval(interval); // cleanup on unmount
  }, []);

  const markAsTaken = async (medName: string) => {
    if (!user?.email) return;
    try {
      await axios.post('http://10.249.112.253:3000/mark-medication-taken', {
        email: user.email,
        medicationName: medName,
      });
      takenThisWindowRef.current.add(medName); // add here
      setModalMessage('Success, Medication marked as taken');
      setModalVisible(true);
      await fetchMedications(); // refresh logs
    } catch (err) {
      setModalMessage('ErrorCould not update medication');
      setModalVisible(true);
    }
  };


  const markAsMissed = async (medName: string) => {
    if (!user?.email) return;
    try {
      await axios.post('http://10.249.112.253:3000/mark-medication-missed', {
        email: user.email,
        medicationName: medName,
      });
      setModalMessage('Medication marked as missed');
      setModalVisible(true);
      fetchMedications();
    } catch (err) {
      setModalMessage('Error: Could not mark as missed');
      setModalVisible(true);
    }
  };

  const getMissedDoseTimes = (
    med: MedicationItem,
    currentTime: Date
  ): number[] => {
    const frequencyMap: Record<string, number> = {
      'Every hour': 1,
      'Every 4 hours': 4,
      'Every 6 hours': 6,
      'Every 8 hours': 8,
      'Every 12 hours': 12,
      'Once a day': 24,
      '2 times a day': 12,
      '3 times a day': 8,
    };

    const freqHours = frequencyMap[med.frequency] || 24;
    const freqMs = freqHours * 60 * 60 * 1000;

    const logs = med.logs || [];

    const takenOrMissedTimes = logs.map(log => new Date(log.time).getTime());

    const startTime = new Date(currentTime);
    const firstDose = new Date(`1970-01-01T${convertTo24Hour(med.timeToTake)}:00`);
    startTime.setHours(firstDose.getHours(), firstDose.getMinutes(), 0, 0);

    // go backward to find latest dose time before current
    while (startTime.getTime() > currentTime.getTime()) {
      startTime.setTime(startTime.getTime() - freqMs);
    }

    const missedDoseTimes: number[] = [];

    let doseTime = new Date(startTime);
    const nowMs = currentTime.getTime();

    while (doseTime.getTime() + 60 * 60 * 1000 < nowMs) {
      const alreadyLogged = takenOrMissedTimes.some(
        logTime => Math.abs(logTime - doseTime.getTime()) < 5 * 60 * 1000
      );

      if (!alreadyLogged) {
        missedDoseTimes.push(doseTime.getTime());
      }

      doseTime.setTime(doseTime.getTime() + freqMs);
    }

    return missedDoseTimes;
  };


  const renderLogs = (logs: MedicationLog[] = []) => {
    return logs
      .slice(-5)
      .reverse()
      .map((log, index) => (
        <Text key={index} style={styles.logEntry}>
          {new Date(log.time).toLocaleString()} - {log.status}
        </Text>
      ));
  };

  const previousDoseTimeRef = useRef<{ [key: string]: number }>({});

  useEffect(() => {
    if (!medications.length) return;

    medications.forEach((med) => {
      const nextDoseTime = med.timeToTake
        ? calculateNextDoseTime(med.timeToTake, med.frequency, simulatedNow)
        : null;

      if (!nextDoseTime) return;

      if (nextDoseTime && nextDoseTime > Date.now()) {
        // Test notification (for dev/testing purposes)
        const testTime = new Date(Date.now() + 5000);
        console.log("Test notification will fire at:", testTime);
        scheduleNotification(
          `Test: Time to take ${med.name}`,
          `Take ${med.dosage} for ${med.diagnosis}`,
          testTime
        );
      
        // Real scheduled notification
        scheduleNotification(
          `Time to take ${med.name}`,
          `Take ${med.dosage} for ${med.diagnosis}`,
          new Date(nextDoseTime)
        );
      }      

      const frequencyMap: Record<string, number> = {
        'Every hour': 1,
        'Every 4 hours': 4,
        'Every 6 hours': 6,
        'Every 8 hours': 8,
        'Every 12 hours': 12,
        'Once a day': 24,
        '2 times a day': 12,
        '3 times a day': 8,
      };

      const freqMs = (frequencyMap[med.frequency] || 24) * 60 * 60 * 1000;
      const previousDoseTime = nextDoseTime - freqMs;

      const alreadyLogged = (med.logs || []).some(log => {
        const logTime = new Date(log.time).getTime();
        return (
          Math.abs(logTime - previousDoseTime) < 5 * 60 * 1000 &&
          (log.status === 'Taken' || log.status === 'Missed')
        );
      });

      const hasDoseJustReset =
        previousDoseTimeRef.current[med.name] &&
        previousDoseTime > previousDoseTimeRef.current[med.name];

      if (hasDoseJustReset) {
        takenThisWindowRef.current.delete(med.name);

        const missedKey = `${med.name}-${previousDoseTime}`;

        if (!alreadyLogged && !missedLoggedRef.current.has(missedKey)) {
          missedLoggedRef.current.add(missedKey);
          markAsMissed(med.name);
        }
      }


      previousDoseTimeRef.current[med.name] = previousDoseTime;
    });
  }, [simulatedNow, medications]);



  const fetchMedicationSuggestions = async (email: string, query: string) => {
    if (query.length < 3) {
      setMedicationSuggestions((prev) => ({ ...prev, [email]: [] }));
      return;
    }

    try {
      const response = await axios.get<{ medications: string[] }[]>(
        `http://10.249.112.253:3000/collections/Medications?name=${encodeURIComponent(query)}`
      );

      const data = response.data;
      const names = data[0]?.medications || [];

      // Filter to only those that START with the query (case-insensitive)
      const filtered = names.filter((name) =>
        name.toLowerCase().startsWith(query.toLowerCase())
      );

      setMedicationSuggestions((prev) => ({
        ...prev,
        [email]: filtered,
      }));

    } catch (err) {
      console.error('Error fetching medication suggestions:', err);
    }
  };


  const submitMedication = async (email: string) => {
    console.log("Submitting form for:", email, medicationForm[email]);
    const form = medicationForm[email];

    if (!form?.name || !form?.dosage || !form?.frequency || !form?.timeToTake || !form?.duration || !form?.diagnosis) {
      setModalMessage("Please fill in all fields before prescribing.");
      setModalVisible(true);
      return;
    }

    setIsSubmitting((prev) => ({ ...prev, [email]: true }));

    const medication = {
      name: form.name,
      dosage: form.dosage,
      frequency: form.frequency,
      timeToTake: form.timeToTake,
      duration: form.duration,
      diagnosis: form.diagnosis,
      logs: [],
    };

    try {
      const response = await axios.post("http://10.249.112.253:3000/save-medication", {
        email,
        medication,
      });

      if (response.status === 200) {
        setModalMessage("Medication prescribed successfully.");
        setModalVisible(true);
        setIsEditing((prev) => ({ ...prev, [email]: false }));
        setMedicationForm((prev) => ({ ...prev, [email]: {} }));
        setMedicationInputs((prev) => ({ ...prev, [email]: '' }));
        await fetchMedications();
      } else {
        setModalMessage("Failed to prescribe medication. Please try again.");
        setModalVisible(true);
      }
    } catch (err) {
      console.error("Error prescribing medication:", err);
      setModalMessage("An error occurred while prescribing the medication.");
      setModalVisible(true);
    } finally {
      setIsSubmitting((prev) => ({ ...prev, [email]: false }));
    }
  };



  return (
    <LinearGradient colors={theme.colors.background} style={styles.container}>
      {user ? (
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity onLongPress={() => setShowSimulators(prev => !prev)}>
            <Text
              style={[
                styles.pageTitle,
                { color: theme.colors.text },
                user.role === 'doctor' && { marginTop: 16 }
              ]}
            >
              {user.role === 'doctor'
                ? `Welcome, Dr. ${user.fullName}`
                : 'Track and take your medications here'}
            </Text>
          </TouchableOpacity>


          {showSimulators && (
            <View style={styles.simulatorControls}>
              <Text style={[styles.simTitle, { color: theme.colors.text }]}>Time Simulators</Text>

              <View style={styles.simButtonRow}>
                <TouchableOpacity
                  style={[styles.simButton, { backgroundColor: theme.colors.quickActions }]}
                  onPress={() => simulateTimeForward(10 / 60)} // 10 minutes
                >
                  <Text style={styles.simButtonText}>+10 min</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.simButton, { backgroundColor: theme.colors.quickActions }]}
                  onPress={() => simulateTimeForward(1)}
                >
                  <Text style={styles.simButtonText}>+1 hr</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.simButton, { backgroundColor: theme.colors.quickActions }]}
                  onPress={() => simulateTimeForward(4)}
                >
                  <Text style={styles.simButtonText}>+4 hr</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}



          {user.role === 'doctor' && patientsList.map((patient, index) => (
            <View key={index} style={[styles.doctorCard, { borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.patientName, { color: theme.colors.text }]}>
                  {patient.fullName}
                </Text>

                {!isEditing[patient.email] && (
                  <LinearGradient
                    colors={['#8a5fff', '#0077ffea']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.prescribeGradient}
                  >
                    <TouchableOpacity
                      style={styles.prescribeButton}
                      onPress={() => toggleMedicationEdit(patient.email)}
                    >
                      <Text style={styles.prescribeButtonText}>Prescribe</Text>
                    </TouchableOpacity>
                  </LinearGradient>
                )}
              </View>

              {/* Medication Name (Autofill input) */}
              {isEditing[patient.email] && (
                <View style={styles.medForm}>
                  <TextInput
                    style={[styles.inputField, { color: theme.colors.text1 }]}
                    placeholder="Start typing..."
                    placeholderTextColor="gray"
                    value={medicationForm[patient.email]?.name || ''}
                    onChangeText={(text) => {
                      setMedicationForm((prev) => ({
                        ...prev,
                        [patient.email]: { ...prev[patient.email], name: text },
                      }));
                      fetchMedicationSuggestions(patient.email, text);
                    }}
                  />

                  {/* Suggestion List */}
                  {medicationSuggestions[patient.email]?.length > 0 && (
                    <View style={styles.suggestionsContainer}>
                      {medicationSuggestions[patient.email].map((suggestion, idx) => (
                        <TouchableOpacity
                          key={idx}
                          onPress={() => {
                            setMedicationInputs((prev) => ({ ...prev, [patient.email]: suggestion }));
                            setMedicationForm((prev) => ({
                              ...prev,
                              [patient.email]: { ...prev[patient.email], name: suggestion },
                            }));
                            setMedicationSuggestions((prev) => ({ ...prev, [patient.email]: [] }));
                          }}
                          style={styles.suggestionItem}
                        >
                          <Text style={{ color: theme.colors.text }}>{suggestion}</Text>
                        </TouchableOpacity>

                      ))}
                    </View>
                  )}
                  {/* Dosage */}
                  <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Dosage</Text>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={medicationForm[patient.email]?.dosage}
                      onValueChange={(value) =>
                        setMedicationForm((prev) => ({
                          ...prev,
                          [patient.email]: { ...prev[patient.email], dosage: value }
                        }))
                      }
                      dropdownIconColor={theme.colors.text2}
                      style={{ color: theme.colors.text2 }}
                    >
                      <Picker.Item label="Select dosage" value="" color="white" />
                      <Picker.Item label="1 pill" value="1 pill" color="white" />
                      <Picker.Item label="2 pills" value="2 pills" color="white" />
                      <Picker.Item label="5ml syrup" value="5ml syrup" color="white" />
                      <Picker.Item label="10ml syrup" value="10ml syrup" color="white" />
                      <Picker.Item label="1 tablet" value="1 tablet" color="white" />
                      <Picker.Item label="2 tablets" value="2 tablets" color="white" />
                      <Picker.Item label="1 tsp" value="1 tsp" color="white" />
                      <Picker.Item label="2 tsp" value="2 tsp" color="white" />
                    </Picker>
                  </View>

                  {/* Frequency */}
                  <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Frequency</Text>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={medicationForm[patient.email]?.frequency}
                      onValueChange={(value) =>
                        setMedicationForm((prev) => ({
                          ...prev,
                          [patient.email]: { ...prev[patient.email], frequency: value }
                        }))
                      }
                      dropdownIconColor={theme.colors.text2}
                      style={{ color: theme.colors.text2 }}
                    >
                      <Picker.Item label="Select frequency" value="" color="white" />
                      <Picker.Item label="Twice a day" value="Twice a day" color="white" />
                      <Picker.Item label="Every hour" value="Every hour" color="white" />
                      <Picker.Item label="Every 4 hours" value="Every 4 hours" color="white" />
                      <Picker.Item label="Every 6 hours" value="Every 6 hours" color="white" />
                      <Picker.Item label="Every 8 hours" value="Every 8 hours" color="white" />
                      <Picker.Item label="Every 12 hours" value="Every 12 hours" color="white" />
                      <Picker.Item label="Once a week" value="Once a week" color="white" />
                    </Picker>
                  </View>

                  {/* Time to Take */}
                  <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Time to Take</Text>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={medicationForm[patient.email]?.timeToTake}
                      onValueChange={(value) =>
                        setMedicationForm((prev) => ({
                          ...prev,
                          [patient.email]: { ...prev[patient.email], timeToTake: value }
                        }))
                      }
                      dropdownIconColor={theme.colors.text2}
                      style={{ color: theme.colors.text2 }}
                    >
                      <Picker.Item label="Select time" value="" color="white" />
                      <Picker.Item label="7 AM" value="7 AM" color="white" />
                      <Picker.Item label="8 AM" value="8 AM" color="white" />
                      <Picker.Item label="12 PM" value="12 PM" color="white" />
                      <Picker.Item label="1 PM" value="1 PM" color="white" />
                      <Picker.Item label="4 PM" value="4 PM" color="white" />
                      <Picker.Item label="8 PM" value="8 PM" color="white" />
                      <Picker.Item label="10 PM" value="10 PM" color="white" />
                    </Picker>
                  </View>

                  {/* Duration */}
                  <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Duration</Text>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={medicationForm[patient.email]?.duration}
                      onValueChange={(value) =>
                        setMedicationForm((prev) => ({
                          ...prev,
                          [patient.email]: { ...prev[patient.email], duration: value }
                        }))
                      }
                      dropdownIconColor={theme.colors.text2}
                      style={{ color: theme.colors.text2 }}
                    >
                      <Picker.Item label="Select duration" value="" color="white" />
                      <Picker.Item label="3 days" value="3 days" color="white" />
                      <Picker.Item label="5 days" value="5 days" color="white" />
                      <Picker.Item label="1 week" value="1 week" color="white" />
                      <Picker.Item label="2 weeks" value="2 weeks" color="white" />
                      <Picker.Item label="1 month" value="1 month" color="white" />
                      <Picker.Item label="Until further notice" value="Until further notice" color="white" />
                    </Picker>
                  </View>

                  {/* Diagnosis */}
                  <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Diagnosis</Text>
                  <TextInput
                    style={[styles.inputField, { color: theme.colors.text1 }]}
                    placeholder="e.g. Headache"
                    placeholderTextColor="gray"
                    value={medicationForm[patient.email]?.diagnosis || ''}
                    onChangeText={(text) =>
                      setMedicationForm((prev) => ({
                        ...prev,
                        [patient.email]: { ...prev[patient.email], diagnosis: text },
                      }))
                    }
                  />

                  <View style={styles.buttonRow}>
                    <LinearGradient
                      colors={['#8a5fff', '#0077ffea']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.prescribeGradient, { flex: 1, marginRight: 8 }]}
                    >
                      <TouchableOpacity
                        style={[styles.prescribeButton, { width: '100%', opacity: isSubmitting[patient.email] ? 0.6 : 1 }]}
                        onPress={() => submitMedication(patient.email)}
                        disabled={isSubmitting[patient.email]}
                      >
                        <Text style={styles.prescribeButtonText}>
                          {isSubmitting[patient.email] ? 'Submitting...' : 'Prescribe'}
                        </Text>
                      </TouchableOpacity>
                    </LinearGradient>

                    <TouchableOpacity
                      style={[styles.cancelButton, { flex: 1, marginLeft: 8 }]}
                      onPress={() => cancelMedicationEdit(patient.email)}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>


                </View>
              )}

            </View>
          ))}



          {user.role !== 'doctor' && medications.length === 0 && (
            <Text style={[styles.emptyText, { color: theme.colors.text }]}>
              No medications found.
            </Text>
          )}

          {(user.role !== 'doctor' || medications.length > 0) && (
            <>
              {medications.map((med: MedicationItem, index: number) => {
                const nextDoseTime = med.timeToTake
                  ? calculateNextDoseTime(med.timeToTake, med.frequency, simulatedNow)
                  : null;

                const frequencyMap: Record<string, number> = {
                  'Every hour': 1,
                  'Every 4 hours': 4,
                  'Every 6 hours': 6,
                  'Every 8 hours': 8,
                  'Every 12 hours': 12,
                  'Once a day': 24,
                  '2 times a day': 12,
                  '3 times a day': 8,
                };

                const freqHours = frequencyMap[med.frequency] || 24;
                const freqInMs = freqHours * 60 * 60 * 1000;

                const previousDoseTime = nextDoseTime ? nextDoseTime - freqInMs : null;
                const windowEnd = previousDoseTime ? previousDoseTime + 60 * 60 * 1000 : null;

                const alreadyTakenThisDose = (med.logs || []).some(log => {
                  const logTime = new Date(log.time).getTime();
                  return (
                    previousDoseTime &&
                    Math.abs(logTime - previousDoseTime) < 5 * 60 * 1000 &&
                    log.status === 'Taken'
                  );
                });


                const withinWindow =
                  nextDoseTime !== null &&
                  Math.abs(simulatedNow.getTime() - nextDoseTime) <= 60 * 60 * 1000;


                const frequencyColorMap: Record<string, string> = {
                  'Every hour': '#e84393',
                  'Once a day': '#3498db',
                  '2 times a day': '#2ecc71',
                  '3 times a day': '#f1c40f',
                  'Every 4 hours': '#e67e22',
                  'Every 6 hours': '#9b59b6',
                };
                const colorBar = frequencyColorMap[med.frequency] || '#95a5a6';

                return (
                  <View key={`${med.name}-${index}`} style={styles.medCardWrapper}>
                    <View style={[styles.colorBar, { backgroundColor: colorBar }]} />
                    <View style={[styles.medCard, {
                      backgroundColor: theme.colors.card || '#fff',
                      borderColor: theme.colors.border,
                      borderWidth: 1,
                    }]}>
                      <View style={styles.medInfoSection}>
                        <Text style={[styles.medName, { color: theme.colors.text }]}>{med.name}</Text>

                        <Text style={[styles.medDetailText, { color: theme.colors.text }]}>
                          <Text style={{ fontWeight: 'bold' }}>Dosage: </Text>{med.dosage}
                        </Text>

                        <Text style={[styles.medDetailText, { color: theme.colors.text }]}>
                          <Text style={{ fontWeight: 'bold' }}>Frequency: </Text>{med.frequency}
                        </Text>

                        <Text style={[styles.medDetailText, { color: theme.colors.text }]}>
                          <Text style={{ fontWeight: 'bold' }}>Duration: </Text>{med.duration}
                        </Text>

                        <Text style={[styles.medDetailText, { color: theme.colors.text }]}>
                          <Text style={{ fontWeight: 'bold' }}>Diagnosis: </Text>{med.diagnosis}
                        </Text>

                        <Text style={[styles.medDetailText, { color: theme.colors.text }]}>
                          <Text style={{ fontWeight: 'bold' }}>Time to Take: </Text>{med.timeToTake}
                        </Text>

                        {nextDoseTime && (() => {
                          const diffMs = nextDoseTime - simulatedNow.getTime();
                          if (diffMs <= 0) return null;

                          const diffMins = Math.floor(diffMs / (1000 * 60));
                          const hours = Math.floor(diffMins / 60);
                          const mins = diffMins % 60;

                          return (
                            <Text
                              style={[
                                styles.nextDoseText,
                                { color: theme.colors.secondary, fontSize: 18, fontWeight: 'bold' },
                              ]}
                            >
                              Next Dose in: {hours}h {mins}m
                            </Text>
                          );
                        })()}


                      </View>

                      <View style={styles.medLogsSection}>
                        <View
                          style={{
                            borderTopWidth: 2,
                            borderTopColor: theme.colors.border,
                            paddingTop: 8,
                            marginLeft: -4,
                            width: '100%',
                          }}
                        >
                          <Text style={{ color: theme.colors.text, fontWeight: 'bold', fontSize: 16 }}>
                            Medication Logs
                          </Text>
                        </View>

                        {(med.logs || []).slice(-5).reverse().map((log: MedicationLog, logIndex: number) => (
                          <Text
                            key={logIndex}
                            style={[
                              styles.logEntry,
                              log.status === 'Taken' ? styles.logTaken : styles.logMissed,
                            ]}
                          >
                            {new Date(log.time).toLocaleString()} - {log.status}
                          </Text>
                        ))}

                        {(() => {
                          const alreadyTakenThisDose =
                            previousDoseTime !== null &&
                            (med.logs || []).some(log => {
                              const logTime = new Date(log.time).getTime();
                              return (
                                Math.abs(logTime - previousDoseTime) < 5 * 60 * 1000 &&
                                log.status === 'Taken'
                              );
                            });

                          const takenInCurrentWindow = takenThisWindowRef.current.has(med.name);

                          if (withinWindow && !alreadyTakenThisDose && !takenInCurrentWindow) {
                            return (
                              <TouchableOpacity
                                style={[styles.markButton, { backgroundColor: theme.colors.quickActions }]}
                                onPress={() => markAsTaken(med.name)}
                              >
                                <Text style={styles.markButtonText}>Mark as Taken</Text>
                              </TouchableOpacity>
                            );
                          }

                          return null;
                        })()}

                      </View>
                    </View>
                  </View>
                );
              })}
            </>
          )}
        </ScrollView>
      ) : (
        <View style={styles.authPrompt}>
          <Text style={[styles.authText, { color: theme.colors.text }]}>
            You need to log in or sign up
          </Text>
          <Text style={[styles.authText, { color: theme.colors.secondary }]}>
            To access your medication tracking, please log in or create an account.
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

      <CustomAlerts
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        message={modalMessage}
      />

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  scrollContainer: {
    paddingBottom: 200,
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
  medCardWrapper: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  colorBar: {
    width: 8,
    backgroundColor: '#ccc',
  },
  medCard: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  medInfoSection: {
    padding: 16,
  },
  medLogsSection: {
    padding: 12,
  },
  medName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  medDetailText: {
    fontSize: 14,
    marginBottom: 2,
  },
  nextDoseText: {
    fontSize: 13,
    marginTop: 6,
    fontStyle: 'italic',
  },
  logEntry: {
    fontSize: 13,
    marginBottom: 4,
    marginLeft: 8,
    color: '#666',
  },
  logTaken: {
    color: '#2ecc71',
  },
  logMissed: {
    color: '#e74c3c',
  },
  logTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  markButton: {
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  markButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyText: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
  },
  simulatorControls: {
    marginBottom: 20,
    alignItems: 'center',
  },

  simTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  simButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 5,
  },

  simButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  simButtonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
    justifyContent: 'center',
  },
  doctorCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1, // added
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },

  prescribeButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 10,
  },

  prescribeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  medForm: {
    marginTop: 12,
  },

  inputLabel: {
    fontSize: 14,
    color: '#ddd',
    marginTop: 10,
    marginBottom: 4,
  },

  inputField: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
  },

  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },

  submitButton: {
    flex: 1,
    backgroundColor: '#4caf50',
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },

  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  cancelButton: {
    flex: 1,
    backgroundColor: '#ff0000ee',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },

  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  prescribeGradient: {
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 10,
  },
  suggestionsContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    marginTop: 4,
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: '#ccc',
  },

  suggestionItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc', // or theme.colors.border
    borderRadius: 8,
    backgroundColor: '#ffffff', // or theme.colors.card if defined
    marginBottom: 16,
    paddingHorizontal: 10,
  },

});

