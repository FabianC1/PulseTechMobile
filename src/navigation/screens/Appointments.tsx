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
import CustomAlerts from './CustomAlerts';
import Icon from 'react-native-vector-icons/MaterialIcons';//calender icon
import { scheduleNotification } from '../../NotificationService';

type RootStackParamList = {
  Auth: { screen: 'Login' | 'Signup' };
};

export function Appointments() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useAuth();


  const [appointmentsView, setAppointmentsView] = useState<'upcoming' | 'request'>('upcoming');
  const [doctorsList, setDoctorsList] = useState<any[]>([]);
  const [patientsList, setPatientsList] = useState<any[]>([]);
  const [editingDoctorEmail, setEditingDoctorEmail] = useState<string | null>(null);
  const [appointmentData, setAppointmentData] = useState<{ [email: string]: { date: string; reason: string } }>({});
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentDoctorForDate, setCurrentDoctorForDate] = useState<string | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');



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
    if (user && user.role === 'doctor') {
      fetchPatients();
    }
  }, [user]);

  useEffect(() => {
    if (user && appointmentsView === 'upcoming') {
      fetchAppointments();
    }
  }, [appointmentsView, user]);

  const fetchPatients = async () => {
    try {
      const res = await fetch('http://10.249.112.253:3000/get-patients');
      const data = await res.json();
      setPatientsList(data);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await fetch('http://10.249.112.253:3000/get-doctors');
      const data = await res.json();
      setDoctorsList(data);
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
    }
  };

  const fetchAppointments = async () => {
    if (!user?.email) return;
  
    try {
      const res = await fetch(`http://10.249.112.253:3000/get-appointments?email=${user.email}`);
      const data = await res.json();
  
      const filtered = data.filter((a: any) =>
        user.role === 'doctor' ? a.doctorEmail === user.email : a.patientEmail === user.email
      );
  
      setUpcomingAppointments(filtered);
  
      filtered.forEach((appt: { date: string; reason: string; status: string; patientEmail?: string; doctorEmail?: string }) => {
        if (appt.status === 'Scheduled') {
          const appointmentDate = new Date(appt.date);
          const dateStr = appointmentDate.toDateString();
      
          // Determine who the appointment is with
          const withWhom =
            user.role === 'doctor'
              ? `with ${appt.patientEmail}`
              : `with Dr. ${appt.doctorEmail}`;
      
          const message = `You have an appointment ${withWhom} on ${dateStr} for: ${appt.reason}`;
      
          // Schedule test notification (10s from now for each one)
          const testTime = new Date(Date.now() + 10000);
          console.log('Test appointment notification will fire at:', testTime);
      
          scheduleNotification('Test: Upcoming Appointment', message, testTime);
      
          //Schedule real notification (1 day before at 9 AM)
          const reminderTime = new Date(appointmentDate);
          reminderTime.setDate(reminderTime.getDate() - 1);
          reminderTime.setHours(9, 0, 0, 0);
      
          if (reminderTime > new Date()) {
            scheduleNotification('Upcoming Appointment', message, reminderTime);
          }
        }
      });
      
  
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    }
  };
  

  const submitAppointmentAsDoctor = async (patientEmail: string) => {
    const data = appointmentData[patientEmail];
    const doctorEmail = user?.email;

    if (!doctorEmail) {
      alert('User not logged in.');
      return;
    }

    if (!data?.date || !data?.reason) {
      setModalMessage('Please enter both date and reason.');
      setModalVisible(true);
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

      const res = await fetch('http://10.249.112.253:3000/create-appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok) {
        setModalMessage('Appointment requested successfully.');
        setModalVisible(true);

        setEditingDoctorEmail(null);
        setAppointmentData((prev) => {
          const updated = { ...prev };
          delete updated[patientEmail];
          return updated;
        });
      } else {
        alert(result.message || 'Something went wrong.');
      }
    } catch (err) {
      console.error('Error creating appointment:', err);
      alert('Failed to create appointment.');
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
      setModalMessage('Please enter both date and reason.');
      setModalVisible(true);
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

      const res = await fetch('http://10.249.112.253:3000/create-appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok) {
        setModalMessage('Appointment requested successfully.');
        setModalVisible(true);

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



  const markAppointmentCompleted = async (appointmentId: string) => {
    try {
      const res = await fetch('http://10.249.112.253:3000/update-appointment-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId, status: 'Completed' }),
      });

      const result = await res.json();

      if (res.ok) {
        setModalMessage('Appointment marked as completed.');
        setModalVisible(true);
        fetchAppointments(); // Refresh the list
      } else {
        alert(result.message || 'Failed to update appointment.');
      }
    } catch (err) {
      console.error('Error updating appointment:', err);
      alert('Failed to update appointment.');
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
            <>
              <View style={styles.contentWrapper}>
                <Text style={[styles.title, { color: theme.colors.text }]}>
                  {user.role === 'doctor'
                    ? `Welcome, Dr. ${user.fullName || user.email}`
                    : 'Here you can view your appointments'}
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
                      <Text style={styles.buttonText}>
                        {user.role === 'doctor' ? 'Give Appointment' : 'Request Appointment'}
                      </Text>
                    </TouchableOpacity>
                  </LinearGradient>
                </View>
              </View>

              {/* Upcoming Appointments for both doctor and patient */}
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
                        style={[styles.appointmentCard, { borderColor: theme.colors.primary }]}
                      >
                        <View style={styles.rowBetween}>
                          <Text style={[styles.cornerText, { color: theme.colors.text }]}>
                            {user?.role === 'doctor'
                              ? `Patient: ${appt.patientEmail}`
                              : `Doctor: ${appt.doctorEmail}`}
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

                        {user?.role === 'doctor' && appt.status !== 'Completed' && (
                          <LinearGradient
                            colors={['#8a5fff', '#0077ffea']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={[styles.gradientButtonWide, { marginTop: 10 }]}
                          >
                            <TouchableOpacity
                              onPress={() => markAppointmentCompleted(appt._id)}
                              style={styles.touchableWide}
                            >
                              <Text style={styles.buttonText}>Mark as Completed</Text>
                            </TouchableOpacity>
                          </LinearGradient>
                        )}



                      </View>
                    ))
                  )}
                </View>
              )}

              {/* Only for patient: Show doctor list to request appointment */}
              {appointmentsView === 'request' && user.role === 'patient' && (
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
                          { borderColor: theme.colors.primary },
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
                                style={[styles.textarea, { color: theme.colors.text, borderColor: theme.colors.text }]}
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
              {appointmentsView === 'request' && user.role === 'doctor' && (
                <View style={styles.sectionWrapper}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    Patients List
                  </Text>

                  {patientsList.map((patient, index) => {
                    const isEditing = editingDoctorEmail === patient.email;
                    const data = appointmentData[patient.email] || { date: '', reason: '' };

                    return (
                      <View
                        key={index}
                        style={[styles.doctorCard, { borderColor: theme.colors.primary }]}
                      >
                        {!isEditing ? (
                          <View style={styles.rowBetween}>
                            <Text style={[styles.doctorName, { color: theme.colors.text }]}>
                              {patient.fullName || patient.email}
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
                                  setEditingDoctorEmail(patient.email);
                                }}
                              >
                                <Text style={styles.buttonText}>Give</Text>
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
                              {patient.fullName || patient.email}
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
                                      [patient.email]: { ...data, date: text },
                                    }))
                                  }
                                  keyboardType="numeric"
                                />
                                <TouchableOpacity
                                  onPress={() => {
                                    setShowDatePicker(true);
                                    setCurrentDoctorForDate(patient.email);
                                  }}
                                  style={{ marginLeft: 10 }}
                                >
                                  <Icon name="calendar-today" size={24} color={theme.colors.primary} />
                                </TouchableOpacity>
                              </View>

                              <Text style={[styles.label, { color: theme.colors.text }]}>Reason:</Text>
                              <TextInput
                                style={[styles.textarea, { color: theme.colors.text, borderColor: theme.colors.text }]}
                                placeholder="Describe the appointment"
                                placeholderTextColor={theme.colors.text + '88'}
                                multiline
                                numberOfLines={4}
                                value={data.reason}
                                onChangeText={(text: string) =>
                                  setAppointmentData((prev) => ({
                                    ...prev,
                                    [patient.email]: { ...data, reason: text },
                                  }))
                                }
                              />

                              <View style={styles.buttonRow}>
                                <TouchableOpacity
                                  onPress={() => submitAppointmentAsDoctor(patient.email)}
                                  style={[styles.submitButton, { backgroundColor: theme.colors.primary }]}
                                >
                                  <Text style={styles.submitText}>Submit</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                  onPress={() => {
                                    setEditingDoctorEmail(null);
                                    setAppointmentData((prev) => {
                                      const copy = { ...prev };
                                      delete copy[patient.email];
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

            </>
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

        {/* These should be outside the ScrollView and conditional */}
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

        <CustomAlerts
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          message={modalMessage}
        />

      </KeyboardAvoidingView>
    </LinearGradient >
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
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 256,
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
  gradientButtonWide: {
    borderRadius: 8,
    width: 260,
    alignSelf: 'center',
  },
  touchableWide: {
    paddingVertical: 12,
    alignItems: 'center',
  },

});
