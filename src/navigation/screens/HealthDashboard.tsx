import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, RefreshControl, Image } from 'react-native';
import { useTheme } from 'styled-components/native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useAuth } from '../AuthContext';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { useEffect, useState } from 'react';
import { ScrollView, ActivityIndicator } from 'react-native';

// Define navigation type
type RootStackParamList = {
  Auth: { screen: 'Login' | 'Signup' };
};

export function HealthDashboard() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useAuth();

  const [heartRateData, setHeartRateData] = useState<number[]>([]);
  const [medicationStats, setMedicationStats] = useState<{ dates: string[], taken: number[], missed: number[] }>({ dates: [], taken: [], missed: [] });
  const [healthAlerts, setHealthAlerts] = useState<string[]>([]);
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // Refreshing state

  type Appointment = {
    date: string;
    doctorName: string;
    patientName: string;
    reason: string;
  };

  // Move fetchHealthDashboard OUTSIDE useEffect
  const fetchHealthDashboard = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://192.168.0.84:3000/get-health-dashboard?email=${user?.email}`);
      const data = await response.json();

      console.log("Full API Response:", data);

      if (data.message !== "No Updates" && data.heartRateLogs) {
        // Process Appointments
        setRecentAppointments(data.recentAppointments || []);
        setUpcomingAppointments(data.upcomingAppointments || []);
        setHealthAlerts(data.healthAlerts || []);
        const validHeartRateData = data.heartRateLogs
          .map((entry: any) => Number(entry.value))
          .filter((value: number) => !isNaN(value));

        console.log("Processed Heart Rate Data:", validHeartRateData);
        setHeartRateData(validHeartRateData);
      }
      if (data.message !== "No Updates") {
        if (data.healthAlerts) {
          setHealthAlerts(data.healthAlerts);
        }
      }
      if (data.medicationStats) {
        setMedicationStats(data.medicationStats);
      }
    } catch (error) {
      console.error("Error fetching health dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Now this function can use fetchHealthDashboard
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHealthDashboard();
    setRefreshing(false);
  };

  // Call fetchHealthDashboard when the component mounts
  useEffect(() => {
    if (user) {
      fetchHealthDashboard();
    }
  }, [user]);

  return (
    <LinearGradient colors={theme.colors.background} style={styles.container}>
      {user ? (
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
        >

          {/* Profile Section */}
          <View style={styles.profileSection}>
            <View style={styles.profileContainer}>
              <Image
                source={user.profilePicture ? { uri: user.profilePicture } : require('../../../assets/ProfileIcon.png')}
                style={styles.profilePic}
              />
              <Text style={[styles.profileName, { color: theme.colors.text }]}>
                {user.fullName}
              </Text>
            </View>

            {/* Quick Actions Grid */}
            <View style={styles.quickActions}>
              <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Records' as never)}>
                <Text style={styles.buttonText}>Log Symptom</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Appointments' as never)}>
                <Text style={styles.buttonText}>Request Appointment</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Records' as never)}>
                <Text style={styles.buttonText}>View Medical Records</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Symptom' as never)}>
                <Text style={styles.buttonText}>Get Self-Diagnosis</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Medication' as never)}>
                <Text style={styles.buttonText}>Check Medication</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Messages' as never)}>
                <Text style={styles.buttonText}>Message Doctor</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Health Alerts Section */}
          <View style={styles.alertsSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Health Alerts
            </Text>

            {healthAlerts.length > 0 ? (
              healthAlerts.map((alert, index) => (
                <View key={index} style={styles.alertBox}>
                  <Text style={[styles.alertText, { color: theme.colors.text }]}>
                    {alert}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={[styles.noAlertsText, { color: theme.colors.text }]}>
                No health alerts at this time.
              </Text>
            )}
          </View>

          {/* Recent Appointments */}
          <View style={styles.appointmentsSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text, textAlign: "center" }]}>
              Recent Appointments
            </Text>
            {recentAppointments.length > 0 ? (
              recentAppointments.map((appt, index) => (
                <LinearGradient
                  key={index}
                  colors={[theme.colors.appointments, theme.colors.appointments2]}
                  style={styles.appointmentItem}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={[styles.appointmentDate, { color: theme.colors.text, textAlign: "center" }]}>
                    {appt.date}
                  </Text>
                  <Text style={[styles.appointmentName, { color: theme.colors.text, textAlign: "center" }]}>
                    {user.role === "patient" ? appt.doctorName : appt.patientName}
                  </Text>
                  <Text style={[styles.appointmentReason, { color: theme.colors.text, textAlign: "center" }]}>
                    {appt.reason}
                  </Text>
                </LinearGradient>
              ))
            ) : (
              <Text style={[styles.noAppointmentsText, { color: theme.colors.text, textAlign: "center" }]}>
                No recent appointments.
              </Text>
            )}
          </View>

          {/* Upcoming Appointments */}
          <View style={styles.appointmentsSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text, textAlign: "center" }]}>
              Upcoming Appointments
            </Text>
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((appt, index) => (
                <LinearGradient
                  key={index}
                  colors={[theme.colors.appointments, theme.colors.appointments2]}
                  style={styles.appointmentItem}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={[styles.appointmentDate, { color: theme.colors.text, textAlign: "center" }]}>
                    {appt.date}
                  </Text>
                  <Text style={[styles.appointmentName, { color: theme.colors.text, textAlign: "center" }]}>
                    {user.role === "patient" ? appt.doctorName : appt.patientName}
                  </Text>
                  <Text style={[styles.appointmentReason, { color: theme.colors.text, textAlign: "center" }]}>
                    {appt.reason}
                  </Text>
                </LinearGradient>
              ))
            ) : (
              <Text style={[styles.noAppointmentsText, { color: theme.colors.text, textAlign: "center" }]}>
                No upcoming appointments.
              </Text>
            )}
          </View>



          {/* Medication Adherence Chart */}
          <View style={styles.chartContainer}>
            <Text style={[styles.chartTitle, { color: theme.colors.text }]}>Medication Adherence</Text>

            {medicationStats.dates.length > 0 ? (
              <BarChart
                data={{
                  labels: medicationStats.dates.slice(-7).map(date => new Date(date).getDate().toString()), // ✅ Show only day
                  datasets: [
                    { data: medicationStats.taken.slice(-7), color: (opacity = 1) => `rgba(34, 139, 34, ${opacity})` },
                    { data: medicationStats.missed.slice(-7), color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})` },
                  ],
                }}
                width={Dimensions.get("window").width - 40}
                height={220}
                yAxisLabel="" // ✅ Fix: Explicitly define this, even if empty
                yAxisSuffix=" doses"
                chartConfig={{
                  backgroundGradientFrom: theme.colors.background[0],
                  backgroundGradientTo: theme.colors.background[1],
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) => theme.colors.text,
                  style: { borderRadius: 10 },
                }}
                style={{ marginVertical: 8, borderRadius: 10 }}
              />
            ) : (
              <Text style={[styles.noDataText, { color: theme.colors.text }]}>No medication data available.</Text>
            )}
          </View>
          
          {/* Heart Rate Chart */}
          {loading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} />
          ) : (
            <>
              <Text style={[styles.chartTitle, { color: theme.colors.text }]}>Heart Rate</Text>
              <LineChart
                data={{
                  labels: heartRateData.map((_, index) => `${index + 1}`),
                  datasets: [{ data: heartRateData }],
                }}
                width={Dimensions.get("window").width - 40}
                height={220}
                yAxisSuffix=" BPM"
                chartConfig={{
                  backgroundGradientFrom: theme.colors.background[0],
                  backgroundGradientTo: theme.colors.background[1],
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
                  labelColor: (opacity = 1) => theme.colors.text,
                  style: { borderRadius: 10 },
                  propsForDots: { r: "4", strokeWidth: "2", stroke: theme.colors.primary },
                }}
                bezier
                style={{ marginVertical: 8, borderRadius: 10 }}
              />
            </>
          )}
        </ScrollView>

      ) : (
        // If not logged in, show login/signup prompt
        <View style={styles.authPrompt}>
          <Text style={[styles.authText, { color: theme.colors.text }]}>
            You need to log in or sign up
          </Text>
          <Text style={[styles.authText, { color: theme.colors.secondary }]}>
            To access your health dashboard, please log in or create an account.
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
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
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 20,
  },

  profileContainer: {
    marginTop: 10,
    alignItems: 'center',
  },

  profilePic: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },

  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },

  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
    rowGap: 20,
    columnGap: 20,
  },

  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#0091ff',
    alignItems: 'center',
    justifyContent: 'center',
    width: '45%',
  },
  alertsSection: {
    width: "90%",
    marginVertical: 20,
    alignSelf: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },

  alertBox: {
    backgroundColor: "#FF00005E",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    width: "100%",
    alignItems: "center",
  },

  alertText: {
    fontSize: 14,
    textAlign: "center",
  },
  noAlertsText: {
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
  },
  appointmentsSection: {
    width: "90%",
    marginVertical: 20,
    alignSelf: "center",
    borderRadius: 10, // Smooth rounded corners
  },

  appointmentItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
    width: "100%",
  },

  appointmentDate: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0080ff",
  },

  appointmentName: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 5,
  },

  appointmentReason: {
    fontSize: 14,
    color: "#ffffff",
    marginTop: 3,
  },

  noAppointmentsText: {
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
  },
  chartContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  noDataText: {
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
  },

});
