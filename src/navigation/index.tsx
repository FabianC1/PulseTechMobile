import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Image, ScrollView, TouchableOpacity, View } from 'react-native';
import { Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';


import { Settings } from './screens/Settings';
import { NotFound } from './screens/NotFound';

// Main App Screens
import { Home } from './screens/Home';
import { HealthDashboard } from './screens/HealthDashboard';
import { MedicalRecords } from './screens/MedicalRecords';
import { SymptomChecker } from './screens/SymptomChecker';
import { Appointments } from './screens/Appointments';
import { Medication } from './screens/Medication';
import { Messages } from './screens/Messages';

// Icons
const homeIcon = require('../../assets/home.png');
import dashboardIcon from '../assets/dashboard.png';
import recordsIcon from '../assets/records.png';
import symptomIcon from '../assets/symptom.png';
import appointmentsIcon from '../assets/appointments.png';
import medicationIcon from '../assets/medication.png';
import messagesIcon from '../assets/messages.png';

interface NavigationProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const ScrollableTabBar = (props: any) => {
  return (
    <View style={{ position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#202020' }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          height: 70, // Keep the original height
          paddingBottom: 10, // Prevents screen peek issue
        }}
      >
        {props.state.routes.map((route: any, index: number) => {
          const isFocused = props.state.index === index;
          const scaleValue = new Animated.Value(isFocused ? 1.2 : 1);

          Animated.timing(scaleValue, {
            toValue: isFocused ? 1.4 : 1,
            duration: 150,
            useNativeDriver: true,
          }).start();

          return (
            <View key={route.key} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity
                onPress={() => props.navigation.navigate(route.name)}
                style={{ paddingHorizontal: 20 }}
              >
                <Animated.Image
                  source={getIcon(route.name)}
                  style={{
                    width: 40,
                    height: 40,
                    tintColor: isFocused ? '#0084ff' : '#FFFFFF',
                    transform: [{ scale: scaleValue }],
                  }}
                />
              </TouchableOpacity>

              {/* Add vertical separator except for the last icon */}
              {index < props.state.routes.length - 1 && (
                <LinearGradient
                colors={['#8740c1', '#0c62a2']} // Gradient colors (white to blue)
                style={{ width: 2, height: 30, marginHorizontal: 10 }}
                />
                )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};


// Function to return the correct icon for each tab
const getIcon = (name: string) => {
  switch (name) {
    case 'Home':
      return homeIcon;
    case 'Dashboard':
      return dashboardIcon;
    case 'Records':
      return recordsIcon;
    case 'Symptom':
      return symptomIcon;
    case 'Appointments':
      return appointmentsIcon;
    case 'Medication':
      return medicationIcon;
    case 'Messages':
      return messagesIcon;
    default:
      return homeIcon;
  }
};

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarShowLabel: false,
        headerStyle: { backgroundColor: '#002855' },
        headerTintColor: '#ffffff',
      }}
      tabBar={props => <ScrollableTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Dashboard" component={HealthDashboard} />
      <Tab.Screen name="Records" component={MedicalRecords} />
      <Tab.Screen name="Symptom" component={SymptomChecker} />
      <Tab.Screen name="Appointments" component={Appointments} />
      <Tab.Screen name="Medication" component={Medication} />
      <Tab.Screen name="Messages" component={Messages} />
    </Tab.Navigator>
  );
}

export function Navigation({ isDarkMode, toggleTheme }: NavigationProps) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#002855' },
        headerTintColor: '#ffffff',
      }}
    >
      <Stack.Screen name="HomeTabs" component={HomeTabs} options={{ headerShown: false }} />
      <Stack.Screen name="Settings">
        {() => <Settings isDarkMode={isDarkMode} toggleTheme={toggleTheme} />}
      </Stack.Screen>
      <Stack.Screen name="NotFound" component={NotFound} />
    </Stack.Navigator>
  );
}
