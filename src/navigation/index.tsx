import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { DrawerActions } from '@react-navigation/native';
import { NavigationContainer } from '@react-navigation/native';
import { Image, ScrollView, TouchableOpacity, View, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { CustomDrawer } from './screens/CustomDrawer'; // Import the custom drawer

// Screens
import { Settings } from './screens/Settings';
import { Home } from './screens/Home';
import { HealthDashboard } from './screens/HealthDashboard';
import { MedicalRecords } from './screens/MedicalRecords';
import { SymptomChecker } from './screens/SymptomChecker';
import { Appointments } from './screens/Appointments';
import { Medication } from './screens/Medication';
import { Messages } from './screens/Messages';
import { NotFound } from './screens/NotFound';

//Menu screens
import { TermsConditions } from './screens/TermsConditions';
import { PrivacySecurity } from './screens/PrivacySecurity';
import { HealthGuidelines } from './screens/HealthGuidelines';
import { Cookies } from './screens/Cookies';
import { ContactUs } from './screens/ContactUs';
import { Help } from './screens/Help';
import { EmergencyContact } from './screens/EmergencyContact';

// Icons
const homeIcon = require('../../assets/home.png');
const menuIcon = require('../../assets/menu.png');
const profileIcon = require('../../assets/ProfileIcon.png');
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
const Drawer = createDrawerNavigator();

// **Scrollable Bottom Tab Bar**
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
          height: 70, // Keep original height
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
                    width: 30,
                    height: 30,
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

// **Function to return the correct icon for each tab**
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

// **Bottom Tab Navigator**
function HomeTabs() {
  const navigation = useNavigation(); // Get navigation object to open drawer

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarShowLabel: false,
        headerStyle: { backgroundColor: '#002855' }, // Top bar color
        headerTintColor: '#ffffff', // White text
        headerTitleAlign: 'center', // Center the title
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
            style={{ marginLeft: 15 }}
          >
            <Image source={menuIcon} style={{ width: 25, height: 25 }} />
          </TouchableOpacity>
        ),
        headerRight: () => (
          <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.jumpTo('Account Settings'))}
            style={{ marginRight: 15 }}
          >
            <Image source={profileIcon} style={{ width: 30, height: 30, borderRadius: 15 }} />
          </TouchableOpacity>
        ),        
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

// **Drawer Navigator (With All Menu Screens)**
function DrawerNavigator({ isDarkMode, toggleTheme }: NavigationProps) {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawer {...props} />} // Use the custom drawer here
      screenOptions={{
        headerStyle: { backgroundColor: '#002855' },
        headerTintColor: '#ffffff',
      }}
    >
      <Drawer.Screen name="Home Page" component={HomeTabs} options={{ headerShown: false }} />
      <Drawer.Screen name="Terms & Conditions" component={TermsConditions} />
      <Drawer.Screen name="Privacy & Security" component={PrivacySecurity} />
      <Drawer.Screen name="Health & Wellness Guidelines" component={HealthGuidelines} />
      <Drawer.Screen name="Cookies Policy" component={Cookies} />
      <Drawer.Screen name="Contact Us" component={ContactUs} />
      <Drawer.Screen name="Help & Support" component={Help} />
      <Drawer.Screen name="Emergency Contact" component={EmergencyContact} />
      <Drawer.Screen name="Account Settings">
        {() => <Settings isDarkMode={isDarkMode} toggleTheme={toggleTheme} />}
      </Drawer.Screen>
    </Drawer.Navigator>
  );
}

// **Main Navigation with Stack**
export function Navigation({ isDarkMode, toggleTheme }: NavigationProps) {
  return (
    <NavigationContainer>
      <DrawerNavigator isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
    </NavigationContainer>
  );
}

export { DrawerNavigator };