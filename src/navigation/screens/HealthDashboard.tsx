import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, RefreshControl, Image } from 'react-native';
import { useTheme } from 'styled-components/native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useAuth } from '../AuthContext';
import { LineChart } from 'react-native-chart-kit';
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
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // Refreshing state

  // Move fetchHealthDashboard OUTSIDE useEffect
  const fetchHealthDashboard = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://192.168.0.84:3000/get-health-dashboard?email=${user?.email}`);
      const data = await response.json();

      console.log("Full API Response:", data);

      if (data.message !== "No Updates" && data.heartRateLogs) {
        const validHeartRateData = data.heartRateLogs
          .map((entry: any) => Number(entry.value)) 
          .filter((value: number) => !isNaN(value)); 

        console.log("Processed Heart Rate Data:", validHeartRateData);
        setHeartRateData(validHeartRateData);
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
          contentContainerStyle={{flexGrow: 1, paddingBottom: 100 }}
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

});
