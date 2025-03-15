import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Image } from 'react-native';
import bell from '../assets/bell.png';
import newspaper from '../assets/newspaper.png';
import { Home } from './screens/Home';
import { Profile } from './screens/Profile';
import { Settings } from './screens/Settings';
import { Updates } from './screens/Updates';
import { NotFound } from './screens/NotFound';

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
          backgroundColor: '#202020', // Manually set bottom bar color (Dark Blue)
          borderTopWidth: 0, // Removes top border line
        },
        tabBarActiveTintColor: '#0084ff', // Gold color for active tab
        tabBarInactiveTintColor: '#FFFFFF', // White for inactive tabs
      }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          title: 'PulseTech',
          headerStyle: {
            backgroundColor: '#002855', // Manually set top header color (Deep Navy Blue)
          },
          headerTintColor: '#ffffff', // Gold color for the title text
          tabBarIcon: ({ color, size }) => (
            <Image
              source={newspaper}
              tintColor={color}
              style={{ width: size, height: size }}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Updates"
        component={Updates}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Image
              source={bell}
              tintColor={color}
              style={{ width: size, height: size }}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export function Navigation({ isDarkMode, toggleTheme }: NavigationProps) {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeTabs"
        component={HomeTabs}
        options={{ headerShown: false }}
      />
      
      {/* Pass Dark Mode Props to Settings */}
      <Stack.Screen name="Settings">
        {() => <Settings isDarkMode={isDarkMode} toggleTheme={toggleTheme} />}
      </Stack.Screen>

      <Stack.Screen name="NotFound" component={NotFound} />
    </Stack.Navigator>
  );
}
