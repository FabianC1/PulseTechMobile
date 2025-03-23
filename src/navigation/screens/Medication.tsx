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
  logs?: MedicationLog[];
  nextDoseTime?: string;
};

export function Medication() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const [medications, setMedications] = useState<MedicationItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

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

  const renderMedicationCard = (med: MedicationItem) => {
    const now = new Date().getTime();
    const nextDoseTime = med.nextDoseTime ? new Date(med.nextDoseTime).getTime() : null;
    const withinWindow =
      nextDoseTime !== null && Math.abs(now - nextDoseTime) <= 15 * 60 * 1000;

    return (
      <View
        key={med.name + med.diagnosis}
        style={[
          styles.medCard,
          { backgroundColor: theme.colors.primary },
        ]}
      >
        <Text style={[styles.medName, { color: theme.colors.text }]}>{med.name}</Text>
        <Text style={[styles.medDetailText, { color: theme.colors.text }]}>Dosage: {med.dosage}</Text>
        <Text style={[styles.medDetailText, { color: theme.colors.text }]}>Frequency: {med.frequency}</Text>
        <Text style={[styles.medDetailText, { color: theme.colors.text }]}>Duration: {med.duration}</Text>
        <Text style={[styles.medDetailText, { color: theme.colors.text }]}>Diagnosis: {med.diagnosis}</Text>
        {nextDoseTime && (
          <Text style={[styles.medDetailText, { color: theme.colors.secondary }]}>
            Next Dose: {new Date(nextDoseTime).toLocaleTimeString()}
          </Text>
        )}
        {renderLogs(med.logs)}
        {withinWindow && (
          <TouchableOpacity
            style={[styles.markButton, { backgroundColor: theme.colors.quickActions }]}
            onPress={() => markAsTaken(med.name)}
          >
            <Text style={styles.markButtonText}>Mark as Taken</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <LinearGradient colors={theme.colors.background} style={styles.container}>
      {user ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1, width: '100%' }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            keyboardShouldPersistTaps="handled"
          >
            {medications.length === 0 ? (
              <Text style={[styles.emptyText, { color: theme.colors.text }]}>
                No medications found.
              </Text>
            ) : (
              <>
                {medications.map((med: MedicationItem, index: number) => {
                  const now = new Date().getTime();
                  const nextDoseTime = med.nextDoseTime ? new Date(med.nextDoseTime).getTime() : null;
                  const withinWindow =
                    nextDoseTime !== null && Math.abs(now - nextDoseTime) <= 15 * 60 * 1000;
  
                  const frequencyColorMap: Record<string, string> = {
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
                      <View style={[styles.medCard, { backgroundColor: theme.colors.card || '#fff' }]}>
                        <View style={styles.medInfoSection}>
                          <Text style={[styles.medName, { color: theme.colors.text }]}>{med.name}</Text>
                          <Text style={[styles.medDetailText, { color: theme.colors.text }]}>Dosage: {med.dosage}</Text>
                          <Text style={[styles.medDetailText, { color: theme.colors.text }]}>Frequency: {med.frequency}</Text>
                          <Text style={[styles.medDetailText, { color: theme.colors.text }]}>Duration: {med.duration}</Text>
                          <Text style={[styles.medDetailText, { color: theme.colors.text }]}>Diagnosis: {med.diagnosis}</Text>
                          {nextDoseTime && (
                            <Text style={[styles.nextDoseText, { color: theme.colors.secondary }]}>
                              Next Dose: {new Date(nextDoseTime).toLocaleTimeString()}
                            </Text>
                          )}
                        </View>
  
                        <View style={styles.medLogsSection}>
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
        </KeyboardAvoidingView>
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
    paddingBottom: 20,
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
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    padding: 12,
    backgroundColor: '#fff',
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
});

