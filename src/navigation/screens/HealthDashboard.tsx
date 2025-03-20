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
  const [stepCountData, setStepCountData] = useState<number[]>([]);
  const [stepTrackingDates, setStepTrackingDates] = useState<string[]>([]);
  const [sleepTrackingData, setSleepTrackingData] = useState<number[]>([]);
  const [sleepTrackingDates, setSleepTrackingDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // Refreshing state

  type Appointment = {
    date: string;
    doctorName: string;
    patientName: string;
    reason: string;
  };

  const fetchHealthDashboard = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://192.168.0.84:3000/get-health-dashboard?email=${user?.email}`);
      const data = await response.json();

      console.log("Full API Response:", data); // Log full API response

      if (data.message !== "No Updates") {
        setRecentAppointments(data.recentAppointments || []);
        setUpcomingAppointments(data.upcomingAppointments || []);
        setHealthAlerts(data.healthAlerts || []);

        // Process & validate heart rate data
        if (data.heartRateLogs) {
          const validHeartRateData = data.heartRateLogs
            .map((entry: { value: string }) => Number(entry.value))
            .filter((value: number) => !isNaN(value));

          setHeartRateData(validHeartRateData);
        }

        // Process & sort medication stats properly
        if (data.medicationStats && data.medicationStats.dates) {
          const medicationEntries: { date: number; taken: number; missed: number }[] =
            data.medicationStats.dates.map((date: string, index: number) => ({
              date: new Date(date).getTime(),
              taken: data.medicationStats.taken[index] || 0,
              missed: data.medicationStats.missed[index] || 0,
            }));

          medicationEntries.sort((a, b) => a.date - b.date);

          const sortedMedicationStats = {
            dates: medicationEntries.map((entry) => new Date(entry.date).toISOString().split("T")[0]),
            taken: medicationEntries.map((entry) => entry.taken),
            missed: medicationEntries.map((entry) => entry.missed),
          };

          console.log("Sorted Medication Data:", sortedMedicationStats);
          setMedicationStats(sortedMedicationStats);
        }

        // Process & extract latest step count per day
        if (data.stepCountLogs) {
          const stepEntries: { date: number; value: number }[] = Object.values(
            data.stepCountLogs.reduce(
              (acc: Record<string, { date: number; value: number }>, entry: { time: string; value: string }) => {
                const day = new Date(entry.time).toISOString().split("T")[0];
                const numericValue = Number(entry.value);

                if (!isNaN(numericValue)) {
                  if (!acc[day] || new Date(entry.time).getTime() > acc[day].date) {
                    acc[day] = { date: new Date(entry.time).getTime(), value: numericValue };
                  }
                }
                return acc;
              },
              {} as Record<string, { date: number; value: number }>
            )
          );

          stepEntries.sort((a, b) => a.date - b.date);
          setStepCountData(stepEntries.map((entry) => entry.value));
          setStepTrackingDates(stepEntries.map((entry) => new Date(entry.date).toISOString().split("T")[0])); // Store formatted dates
        }

        // Process & extract latest sleep tracking per day
        if (data.sleepTrackingLogs) {
          const sleepEntries: { date: number; value: number }[] = Object.values(
            data.sleepTrackingLogs.reduce(
              (acc: Record<string, { date: number; value: number }>, entry: { time: string; value: string }) => {
                const day = new Date(entry.time).toISOString().split("T")[0];
                const numericValue = Number(entry.value);

                if (!isNaN(numericValue)) {
                  if (!acc[day] || new Date(entry.time).getTime() > acc[day].date) {
                    acc[day] = { date: new Date(entry.time).getTime(), value: numericValue };
                  }
                }
                return acc;
              },
              {} as Record<string, { date: number; value: number }>
            )
          );

          sleepEntries.sort((a, b) => a.date - b.date);
          setSleepTrackingData(sleepEntries.map((entry) => entry.value));
          setSleepTrackingDates(sleepEntries.map((entry) => new Date(entry.date).toISOString().split("T")[0])); // Store formatted dates
        }
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
                  {/* Top Row - Date Left, Doctor/Patient Name Right */}
                  <View style={styles.appointmentRow}>
                    <Text style={[styles.appointmentDate, { color: theme.colors.text }]}>
                      {appt.date}
                    </Text>

                    <Text style={[styles.appointmentDoctor, { color: theme.colors.text }]}>
                      {user.role === "patient" ? appt.doctorName : appt.patientName}
                    </Text>
                  </View>

                  {/* Centered Appointment Reason Below */}
                  <Text style={[styles.appointmentName, { color: theme.colors.text }]}>
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
                  {/* Top Row - Date Left, Doctor/Patient Name Right */}
                  <View style={styles.appointmentRow}>
                    <Text style={[styles.appointmentDate, { color: theme.colors.text }]}>
                      {appt.date}
                    </Text>

                    <Text style={[styles.appointmentDoctor, { color: theme.colors.text }]}>
                      {user.role === "patient" ? appt.doctorName : appt.patientName}
                    </Text>
                  </View>

                  {/* Centered Appointment Reason Below */}
                  <Text style={[styles.appointmentName, { color: theme.colors.text }]}>
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

          {/* Medication Taken Chart */}
          <View style={styles.chartContainer}>
            <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
              Medication Taken (Last 5 Days)
            </Text>

            {medicationStats.dates.length > 0 ? (
              <BarChart
                data={{
                  labels: medicationStats.dates
                    .map(date => new Date(date).getTime()) // Convert to timestamps
                    .sort((a, b) => a - b) // Sort in ascending order
                    .slice(-5) //  Keep only the last 5 dates
                    .map(timestamp => new Date(timestamp).getDate().toString()), // Convert back to day numbers

                  datasets: [
                    {
                      data: medicationStats.taken
                        .map((val, index) => ({ date: medicationStats.dates[index], value: val })) // Pair values with dates
                        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) // Sort by date
                        .slice(-5) //  Keep only the last 5 values
                        .map(entry => entry.value || 0), // Extract values
                    },
                  ],
                }}
                width={Dimensions.get("window").width - 30} //  Reduced width slightly to create left margin
                height={220}
                yAxisLabel=""
                yAxisSuffix=" doses"
                chartConfig={{
                  backgroundGradientFrom: theme.colors.background[0],
                  backgroundGradientTo: theme.colors.background[1],
                  decimalPlaces: 0,
                  color: () => theme.colors.text, //  Themed text
                  labelColor: () => theme.colors.text, //  Themed labels
                  fillShadowGradient: "#228B22", //  Green bars for Taken
                  fillShadowGradientOpacity: 1, //  Solid color bars
                  barPercentage: 0.5,
                  propsForLabels: { fontSize: 14 },
                  propsForBackgroundLines: {
                    stroke: theme.colors.text, //  Themed grid lines
                    strokeWidth: 0.5,
                  },
                }}
                style={{ marginVertical: 8, borderRadius: 10, marginLeft: 10 }} //  Added left margin here
                showValuesOnTopOfBars
                fromZero
                withHorizontalLabels
                withInnerLines
              />
            ) : (
              <Text style={[styles.noDataText, { color: theme.colors.text }]}>
                No medication data available.
              </Text>
            )}
          </View>

          {/* Medication Missed Chart */}
          <View style={styles.chartContainer}>
            <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
              Medication Missed (Last 5 Days)
            </Text>

            {medicationStats.dates.length > 0 ? (
              <BarChart
                data={{
                  labels: medicationStats.dates
                    .map(date => new Date(date).getTime()) // Convert to timestamps
                    .sort((a, b) => a - b) // Sort in ascending order
                    .slice(-5) // Keep only the last 5 dates
                    .map(timestamp => new Date(timestamp).getDate().toString()), // Convert back to day numbers

                  datasets: [
                    {
                      data: medicationStats.missed
                        .map((val, index) => ({ date: medicationStats.dates[index], value: val })) // Pair values with dates
                        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) // Sort by date
                        .slice(-5) // Keep only the last 5 values
                        .map(entry => entry.value || 0), // Extract values
                    },
                  ],
                }}
                width={Dimensions.get("window").width - 30} // Reduced width slightly to create left margin
                height={220}
                yAxisLabel=""
                yAxisSuffix=" doses"
                chartConfig={{
                  backgroundGradientFrom: theme.colors.background[0],
                  backgroundGradientTo: theme.colors.background[1],
                  decimalPlaces: 0,
                  color: () => theme.colors.text, // Themed text color
                  labelColor: () => theme.colors.text, // Themed labels
                  fillShadowGradient: "#FF4C4C", // Red bars for Missed
                  fillShadowGradientOpacity: 1, // Solid color bars
                  barPercentage: 0.5,
                  propsForLabels: { fontSize: 14 },
                  propsForBackgroundLines: {
                    stroke: theme.colors.text, // Themed grid lines
                    strokeWidth: 0.5,
                  },
                }}
                style={{ marginVertical: 8, borderRadius: 10, marginLeft: 10 }} // Added left margin
                showValuesOnTopOfBars
                fromZero
                withHorizontalLabels
                withInnerLines
              />
            ) : (
              <Text style={[styles.noDataText, { color: theme.colors.text }]}>
                No medication data available.
              </Text>
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
                  labels: heartRateData.slice(0, 15).map((_, index) => `${index + 1}`),
                  datasets: [{ data: heartRateData.slice(0, 15) }],
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


          {/* Wearable Data - Step Count */}
          <View style={styles.chartContainer}>
            <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
              Step Count (Last 15 Days)
            </Text>

            {stepCountData.length > 0 ? (
              <LineChart
                data={{
                  labels: stepTrackingDates.slice(-7).map(date => {
                    const parts = date.split("-");
                    return `${parts[1]}/${parts[2]}`; // Converts "2025-03-08" → "03/08"
                  }),                  
                  datasets: [{ data: stepCountData.slice(-7) }],
                }}
                width={Dimensions.get("window").width - 40}
                height={220}
                yAxisLabel=""
                yAxisSuffix=" steps"
                chartConfig={{
                  backgroundGradientFrom: theme.colors.background[0],
                  backgroundGradientTo: theme.colors.background[1],
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(0, 150, 255, ${opacity})`,
                  labelColor: () => theme.colors.text,
                  style: { borderRadius: 10 },
                  propsForDots: { r: "4", strokeWidth: "2", stroke: theme.colors.primary },
                }}
                bezier
                style={{ marginVertical: 8, borderRadius: 10 }}
              />
            ) : (
              <Text style={[styles.noDataText, { color: theme.colors.text }]}>
                No step count data available.
              </Text>
            )}
          </View>

          {/* Wearable Data - Sleep Tracking */}
          <View style={styles.chartContainer}>
            <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
              Sleep Tracking (Last 15 Days)
            </Text>

            {sleepTrackingData.length > 0 ? (
              <LineChart
                data={{
                  labels: sleepTrackingDates.slice(-7).map(date => date.split("-").slice(1).join("/")),
                  datasets: [{ data: sleepTrackingData.slice(-7) }],
                }}
                width={Dimensions.get("window").width - 40}
                height={220}
                yAxisSuffix=" hrs"
                chartConfig={{
                  backgroundGradientFrom: theme.colors.background[0],
                  backgroundGradientTo: theme.colors.background[1],
                  decimalPlaces: 1,
                  color: (opacity = 1) => `rgba(138, 43, 226, ${opacity})`,
                  labelColor: () => theme.colors.text,
                  style: { borderRadius: 10 },
                  propsForDots: { r: "4", strokeWidth: "2", stroke: theme.colors.primary },
                }}
                bezier
                style={{ marginVertical: 8, borderRadius: 10 }}
              />
            ) : (
              <Text style={[styles.noDataText, { color: theme.colors.text }]}>
                No sleep tracking data available.
              </Text>
            )}
          </View>




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
    width: "100%",
  },

  appointmentRow: {
    flexDirection: "row",
    justifyContent: "space-between", // Date on left, Doctor/Patient on right
    alignItems: "center",
    width: "100%",
  },

  appointmentDate: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0080ff",
  },

  appointmentDoctor: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
  },

  appointmentName: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 5, // Adds space below the row
  },

  noAppointmentsText: {
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
  },
  noDataText: {
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
  },
  chartContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  chartWrapper: {
    borderRadius: 10,
  },
  chartStyle: {
    marginVertical: 8,
    borderRadius: 10,
  },
});
