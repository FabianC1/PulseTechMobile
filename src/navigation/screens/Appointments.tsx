import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from 'styled-components/native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useAuth } from '../AuthContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialIcons';//calender icon

type RootStackParamList = {
  Auth: { screen: 'Login' | 'Signup' };
};

export function Appointments() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useAuth();


  const [appointmentsView, setAppointmentsView] = useState<'upcoming' | 'request'>('upcoming');
  const [doctorsList, setDoctorsList] = useState<any[]>([]);
  const [editingDoctorEmail, setEditingDoctorEmail] = useState<string | null>(null);
  const [appointmentData, setAppointmentData] = useState<{ [email: string]: { date: string; reason: string } }>({});
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentDoctorForDate, setCurrentDoctorForDate] = useState<string | null>(null);


  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);


  useEffect(() => {
    if (user && user.role === 'patient') {
      fetchDoctors();
    }
  }, [user]);

  useEffect(() => {
    if (user && appointmentsView === 'upcoming') {
      fetchAppointments();
    }
  }, [appointmentsView, user]);


  const fetchDoctors = async () => {
    try {
      const res = await fetch('http://192.168.0.84:3000/get-doctors');
      const data = await res.json();
      setDoctorsList(data);
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
    }
  };

  const fetchAppointments = async () => {
    if (!user?.email) return;

    try {
      const res = await fetch(`http://192.168.0.84:3000/get-appointments?email=${user.email}`);
      const data = await res.json();

      // Only show appointments where user is the patient
      const filtered = data.filter((a: any) => a.patientEmail === user.email);

      setUpcomingAppointments(filtered);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    }
  };


  const submitAppointmentRequest = async (doctorEmail: string) => {
    const data = appointmentData[doctorEmail];
    const patientEmail = user?.email;

    if (!patientEmail) {
      alert('User not logged in.');
      return;
    }

    if (!data?.date || !data?.reason) {
      alert('Please enter both date and reason.');
      return;
    }

    try {
      const payload = {
        doctorEmail,
        patientEmail,
        date: data.date,
        reason: data.reason,
        status: 'Scheduled',
      };

      const res = await fetch('http://192.168.0.84:3000/create-appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok) {
        alert('Appointment requested successfully.');

        // Clean up only after success
        setEditingDoctorEmail(null);
        setAppointmentData((prev) => {
          const updated = { ...prev };
          delete updated[doctorEmail];
          return updated;
        });
      } else {
        alert(result.message || 'Something went wrong.');
      }
    } catch (err) {
      console.error('Error submitting appointment:', err);
      alert('Failed to request appointment.');
    }
  };


  return (
    <LinearGradient colors={theme.colors.background} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          keyboardShouldPersistTaps="handled"
        >
          {user ? (
            <View style={styles.contentWrapper}>
              <Text style={[styles.title, { color: theme.colors.text }]}>
                Here you can view your appointments
              </Text>

              <View style={styles.toggleButtonsRow}>
                <LinearGradient
                  colors={['#8a5fff', '#0077ffea']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientButtonSmall}
                >
                  <TouchableOpacity
                    onPress={() => setAppointmentsView('upcoming')}
                    style={styles.touchableSmall}
                  >
                    <Text style={styles.buttonText}>View Upcoming</Text>
                  </TouchableOpacity>
                </LinearGradient>

                <LinearGradient
                  colors={['#8a5fff', '#0077ffea']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientButtonSmall}
                >
                  <TouchableOpacity
                    onPress={() => setAppointmentsView('request')}
                    style={styles.touchableSmall}
                  >
                    <Text style={styles.buttonText}>Request Appointment</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>

              {appointmentsView === 'upcoming' && (
                <View style={styles.sectionWrapper}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    Upcoming Appointments
                  </Text>

                  {upcomingAppointments.length === 0 ? (
                    <Text style={{ color: theme.colors.text, marginTop: 10 }}>
                      You have no upcoming appointments.
                    </Text>
                  ) : (
                    upcomingAppointments.map((appt, index) => (
                      <View
                        key={index}
                        style={[
                          styles.appointmentCard,
                          { borderColor: theme.colors.primary }
                        ]}
                      >
                        <View style={styles.rowBetween}>
                          <Text style={[styles.cornerText, { color: theme.colors.text }]}>
                            {user?.role === 'doctor' ? `Patient: ${appt.patientEmail}` : `Doctor: ${appt.doctorEmail}`}
                          </Text>
                          <Text style={[styles.cornerText, { color: theme.colors.text }]}>
                            Reason: {appt.reason}
                          </Text>
                        </View>

                        <View style={styles.rowBetween2}>
                          <Text style={[styles.cornerText, { color: theme.colors.text }]}>
                            Date: {appt.date}
                          </Text>
                          <Text style={[styles.cornerText, { color: theme.colors.text }]}>
                            Status: {appt.status}
                          </Text>
                        </View>
                      </View>
                    ))

                  )}
                </View>
              )}


              {appointmentsView === 'request' && (
                <View style={styles.sectionWrapper}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    Doctors List
                  </Text>

                  {doctorsList.map((doctor, index) => {
                    const isEditing = editingDoctorEmail === doctor.email;
                    const data = appointmentData[doctor.email] || { date: '', reason: '' };

                    return (
                      <View
                        key={index}
                        style={[
                          styles.doctorCard,
                          { borderColor: theme.colors.primary }, // Or another theme color like theme.colors.text
                        ]}
                      >
                        {!isEditing ? (
                          <View style={styles.rowBetween}>
                            <Text style={[styles.doctorName, { color: theme.colors.text }]}>
                              {doctor.fullName}
                            </Text>
                            <LinearGradient
                              colors={['#8a5fff', '#0077ffea']}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 0 }}
                              style={styles.gradientButtonSmall}
                            >
                              <TouchableOpacity
                                style={styles.touchableSmall}
                                onPress={() => {
                                  setEditingDoctorEmail(doctor.email);
                                }}
                              >
                                <Text style={styles.buttonText}>Request</Text>
                              </TouchableOpacity>
                            </LinearGradient>
                          </View>
                        ) : (
                          <LinearGradient
                            colors={theme.colors.Appointmentsbackground}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.expandedCard}
                          >
                            <Text style={[styles.doctorName, { color: theme.colors.text, marginBottom: 8 }]}>
                              {doctor.fullName}
                            </Text>
                            <View>
                              <Text style={[styles.label, { color: theme.colors.text }]}>Date:</Text>
                              <View style={styles.dateRow}>
                                <TextInput
                                  style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.text, flex: 1 }]}
                                  placeholder="YYYY-MM-DD"
                                  placeholderTextColor={theme.colors.text + '88'}
                                  value={data.date}
                                  onChangeText={(text: string) =>
                                    setAppointmentData((prev) => ({
                                      ...prev,
                                      [doctor.email]: { ...data, date: text },
                                    }))
                                  }
                                  keyboardType="numeric"
                                />
                                <TouchableOpacity
                                  onPress={() => {
                                    setShowDatePicker(true);
                                    setCurrentDoctorForDate(doctor.email);
                                  }}
                                  style={{ marginLeft: 10 }}
                                >
                                  <Icon name="calendar-today" size={24} color={theme.colors.primary} />
                                </TouchableOpacity>
                              </View>

                              <Text style={[styles.label, { color: theme.colors.text }]}>Reason:</Text>
                              <TextInput
                                style={[
                                  styles.textarea,
                                  {
                                    color: theme.colors.text,
                                    borderColor: theme.colors.text,
                                  },
                                ]}
                                placeholder="Describe your reason"
                                placeholderTextColor={theme.colors.text + '88'}
                                multiline
                                numberOfLines={4}
                                value={data.reason}
                                onChangeText={(text: string) =>
                                  setAppointmentData((prev) => ({
                                    ...prev,
                                    [doctor.email]: { ...data, reason: text },
                                  }))
                                }
                              />

                              <View style={styles.buttonRow}>
                                <TouchableOpacity
                                  onPress={() => submitAppointmentRequest(doctor.email)}
                                  style={[styles.submitButton, { backgroundColor: theme.colors.primary }]}
                                >
                                  <Text style={styles.submitText}>Submit</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                  onPress={() => {
                                    setEditingDoctorEmail(null);
                                    setAppointmentData((prev) => {
                                      const copy = { ...prev };
                                      delete copy[doctor.email];
                                      return copy;
                                    });
                                  }}
                                  style={styles.cancelButton}
                                >
                                  <Text style={[styles.submitText, { color: theme.colors.text }]}>Cancel</Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          </LinearGradient>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
              {showDatePicker && (
                <DateTimePicker
                  value={new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (event.type === 'set' && selectedDate && currentDoctorForDate) {
                      const formatted = selectedDate.toISOString().split('T')[0];
                      setAppointmentData((prev) => ({
                        ...prev,
                        [currentDoctorForDate]: {
                          ...prev[currentDoctorForDate],
                          date: formatted,
                        },
                      }));
                    }
                  }}
                />
              )}

            </View>

          ) : (
            <View style={styles.authPrompt}>
              <Text style={[styles.authText, { color: theme.colors.text }]}>
                You need to log in or sign up
              </Text>
              <Text style={[styles.authText, { color: theme.colors.secondary }]}>
                To access your appointments, please log in or create an account.
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
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 500,

  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  authPrompt: {
    alignItems: 'center',
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
  loggedInContent: {
    paddingTop: 30,
    alignItems: 'center',
  },
  contentWrapper: {
    paddingTop: 20,
    alignItems: 'center',
  },
  toggleButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    gap: 10,
    flexWrap: 'wrap',
  },
  gradientButtonSmall: {
    borderRadius: 8,
    width: 160,
  },
  touchableSmall: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  sectionWrapper: {
    marginTop: 30,
    width: '90%',
  },

  doctorCard: {
    backgroundColor: '#88888836',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1.5,
  },

  doctorName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expandedCard: {
    width: '95%',
    alignSelf: 'center',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },

  label: {
    fontSize: 14,
    marginTop: 10,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    marginBottom: 10,
  },
  textarea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  submitButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#ff0000b6',
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  appointmentCard: {
    width: '100%',
    backgroundColor: '#ffffff10',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ffffff20',
    flexDirection: 'column',
  },
  appointmentText: {
    fontSize: 15,
    marginBottom: 6,
  },
  bold: {
    fontWeight: 'bold',
  },
  appointmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  appointmentColumn: {
    width: '48%',
  },

  valueText: {
    fontSize: 15,
    marginTop: 4,
  },
  rowBetween2: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  cornerText: {
    fontSize: 15,
    fontWeight: '500',
    width: '48%',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
