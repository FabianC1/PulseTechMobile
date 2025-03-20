import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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
  const { user } = useAuth(); // Get authentication state

  const [heartRateData, setHeartRateData] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHealthDashboard = async () => {
      try {
        setLoading(true); // ✅ Start loading indicator
  
        const response = await fetch(`http://192.168.0.84:3000/get-health-dashboard?email=${user?.email}`);
        const data = await response.json();
  
        console.log("Full API Response:", data); // 🔍 Debugging
  
        if (data.message !== "No Updates" && data.heartRateLogs) {
          // ✅ Extract numbers from objects
          const validHeartRateData = data.heartRateLogs
            .map((entry: any) => Number(entry.value)) // Convert "78" → 78
            .filter((value: number) => !isNaN(value)); // Remove invalid numbers
  
          console.log("Processed Heart Rate Data:", validHeartRateData); // 🔍 Debugging
          setHeartRateData(validHeartRateData);
        }
      } catch (error) {
        console.error("Error fetching health dashboard data:", error);
      } finally {
        setLoading(false); // ✅ Stop loading after data fetch (even if error)
      }
    };
  
    if (user) {
      fetchHealthDashboard();
    }
  }, [user]);    

  return (
    <LinearGradient colors={theme.colors.background} style={styles.container}>
      {user ? (
        <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: 20 }}>

          <Text style={[styles.title, { color: theme.colors.text }]}>
            Welcome to your Health Dashboard!
          </Text>

          {/* Loading Indicator */}
          {loading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} />
          ) : (
            <>
              {/* Heart Rate Chart */}
              <Text style={[styles.chartTitle, { color: theme.colors.text }]}>Heart Rate</Text>
              <LineChart
                data={{
                  labels: heartRateData
                    .filter((entry: number) => !isNaN(entry) && entry !== undefined && entry !== null) // ✅ Ensure only valid numbers
                    .map((_: number, index: number) => `${index + 1}`),
                  datasets: [
                    {
                      data: heartRateData.map((entry: number) =>
                        isNaN(entry) || entry === undefined || entry === null ? 0 : entry // ✅ Replace invalid values with 0
                      ),
                    },
                  ],
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
});
