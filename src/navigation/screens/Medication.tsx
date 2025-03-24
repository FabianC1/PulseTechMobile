import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from 'styled-components/native';
import axios from 'axios';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useAuth } from '../AuthContext';

// Define navigation type
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


  const handleSecretPress = () => {
    setShowSimulators(prev => !prev);
  };

  const simulateTimeForward = (hours: number) => {
    const newTime = new Date(simulatedNow.getTime() + hours * 60 * 60 * 1000);
    setSimulatedNow(newTime);
  };

  const convertTo24Hour = (timeStr: string): string | null => {
    const match = timeStr.match(/^(\d{1,2})\s*(AM|PM)$/i);
    if (!match) return null;

    let hour = parseInt(match[1]);
    const period = match[2].toUpperCase();

    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;

    return `${hour.toString().padStart(2, '0')}:00`; // Always returns HH:00
  };

  const calculateNextDoseTime = (
    timeToTake: string,
    frequency: string,
    currentTime: Date | number
  ): number | null => {
    console.log('Checking med.timeToTake:', timeToTake);
  
    if (!timeToTake) return null;
  
    const timeParts = timeToTake.trim().toUpperCase().split(' ');
    if (timeParts.length !== 2) return null;
  
    let [hourStr, period] = timeParts;
    let hour = parseInt(hourStr);
    let minute = 0;
  
    if (isNaN(hour)) return null;
  
    // Convert to 24-hour format
    if (period === 'PM' && hour < 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
  
    const current = new Date(currentTime);
    const base = new Date(current);
    base.setHours(hour, minute, 0, 0);
  
    const nextDose = new Date(base);
  
    const frequencyMap: Record<string, number> = {
      'Every hour': 1,
      'Every 4 hours': 4,
      'Every 6 hours': 6,
      'Once a day': 24,
      '2 times a day': 12,
      '3 times a day': 8,
    };
  
    const freqHours = frequencyMap[frequency] || 24;
  
    while (nextDose.getTime() <= current.getTime()) {
      nextDose.setHours(nextDose.getHours() + freqHours);
    }
  
    console.log(`Next dose time for ${timeToTake}: ${nextDose.toLocaleTimeString()}`);
    return nextDose.getTime();
  };
  

  useEffect(() => {
    if (user?.email) fetchMedications();
  }, [user]);

  const fetchMedications = async () => {
    if (!user?.email) return;
    try {
      const res = await axios.get<{ medications: MedicationItem[] }>(
        `http://192.168.0.84:3000/get-medical-records?email=${user.email}`
      );
      setMedications(res.data.medications || []);
    } catch (err) {
      console.error('Error fetching medications:', err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMedications();
    setRefreshing(false);
  };

  const markAsTaken = async (medName: string) => {
    if (!user?.email) return;
    try {
      await axios.post('http://192.168.0.84:3000/mark-medication-taken', {
        email: user.email,
        medicationName: medName,
      });
      Alert.alert('Success', 'Medication marked as taken');
      fetchMedications();
    } catch (err) {
      console.error('Error marking medication as taken:', err);
      Alert.alert('Error', 'Could not update medication');
    }
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
              style={[styles.pageTitle, { color: theme.colors.text }]}
              onLongPress={handleSecretPress}
            >
              Track and take your medications here
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


          {medications.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.colors.text }]}>
              No medications found.
            </Text>
          ) : (
            <>
              {medications.map((med: MedicationItem, index: number) => {
                console.log(`Checking med.timeToTake for ${med.name}:`, med.timeToTake);
                const nextDoseTime = med.timeToTake
                  ? calculateNextDoseTime(med.timeToTake, med.frequency, simulatedNow)
                  : null;


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

                console.log('Next dose time for', med.name, ':', nextDoseTime);
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
                          const timeDiff = nextDoseTime - simulatedNow.getTime();

                          const hours = Math.floor(timeDiff / (1000 * 60 * 60));
                          const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

                          return (
                            <Text style={[styles.nextDoseText, { color: theme.colors.secondary, fontSize: 18 }]}>
                              <Text style={{ fontWeight: 'bold' }}>Next Dose in: </Text>{hours}h {minutes}m
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


                        {withinWindow && (
                          <TouchableOpacity
                            style={[styles.markButton, { backgroundColor: theme.colors.quickActions }]}
                            onPress={() => markAsTaken(med.name)}
                          >
                            <Text style={styles.markButtonText}>Mark as Taken</Text>
                          </TouchableOpacity>
                        )}
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
    marginBottom: 16,
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
    marginTop: 8,
    justifyContent: 'center',
  },

});

