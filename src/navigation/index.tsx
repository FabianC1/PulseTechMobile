import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Image } from 'react-native';
import { Profile } from './screens/Profile';
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

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#202020', // Customize bottom bar color
        },
        tabBarActiveTintColor: '#0084ff', // Active tab color
        tabBarInactiveTintColor: '#FFFFFF', // Inactive tab color
        headerStyle: {
          backgroundColor: '#002855', // Ensure top bar is same across all pages
        },
        headerTintColor: '#ffffff', // White text for the title
      }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          title: 'PulseTech',
          tabBarIcon: ({ color, size }) => (
            <Image source={homeIcon} tintColor={color} style={{ width: size, height: size }} />
          ),
        }}
      />
      <Tab.Screen
        name="Dashboard"
        component={HealthDashboard}
        options={{
          title: 'Health Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Image source={dashboardIcon} tintColor={color} style={{ width: size, height: size }} />
          ),
        }}
      />
      <Tab.Screen
        name="Records"
        component={MedicalRecords}
        options={{
          title: 'Medical Records',
          tabBarIcon: ({ color, size }) => (
            <Image source={recordsIcon} tintColor={color} style={{ width: size, height: size }} />
          ),
        }}
      />
      <Tab.Screen
        name="Symptom"
        component={SymptomChecker}
        options={{
          title: 'Symptom Checker',
          tabBarIcon: ({ color, size }) => (
            <Image source={symptomIcon} tintColor={color} style={{ width: size, height: size }} />
          ),
        }}
      />
      <Tab.Screen
        name="Appointments"
        component={Appointments}
        options={{
          title: 'Appointments',
          tabBarIcon: ({ color, size }) => (
            <Image source={appointmentsIcon} tintColor={color} style={{ width: size, height: size }} />
          ),
        }}
      />
      <Tab.Screen
        name="Medication"
        component={Medication}
        options={{
          title: 'Medication',
          tabBarIcon: ({ color, size }) => (
            <Image source={medicationIcon} tintColor={color} style={{ width: size, height: size }} />
          ),
        }}
      />
      <Tab.Screen
        name="Messages"
        component={Messages}
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, size }) => (
            <Image source={messagesIcon} tintColor={color} style={{ width: size, height: size }} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export function Navigation({ isDarkMode, toggleTheme }: NavigationProps) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#002855', // Ensure consistent top bar color
        },
        headerTintColor: '#ffffff', // White text for the title
      }}
    >
      <Stack.Screen
        name="HomeTabs"
        component={HomeTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Settings">
        {() => <Settings isDarkMode={isDarkMode} toggleTheme={toggleTheme} />}
      </Stack.Screen>
      <Stack.Screen name="NotFound" component={NotFound} />
    </Stack.Navigator>
  );
}
