import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { DrawerActions } from '@react-navigation/native';
import { NavigationContainer } from '@react-navigation/native';
import { Image, ScrollView, TouchableOpacity, View, Animated, StyleSheet, RefreshControl } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { CustomDrawer } from './screens/CustomDrawer'; 


// Screens
import { Settings } from './screens/Settings';
import { Home } from './screens/Home';
import { HealthDashboard } from './screens/HealthDashboard';
import { MedicalRecords } from './screens/MedicalRecords';
import { SymptomChecker } from './screens/SymptomChecker';
import { Appointments } from './screens/Appointments';
import { Medication } from './screens/Medication';
import { Messages } from './screens/Messages';

//Menu screens
import { TermsConditions } from './screens/TermsConditions';
import { PrivacySecurity } from './screens/PrivacySecurity';
import { HealthGuidelines } from './screens/HealthGuidelines';
import { Cookies } from './screens/Cookies';
import { ContactUs } from './screens/ContactUs';
import { Help } from './screens/Help';
import { EmergencyContact } from './screens/EmergencyContact';

//Account screens
import { AuthStack } from './AuthStack';
import { useAuth } from './AuthContext';

type RootStackParamList = {
  MainApp: { screen: string }; 
  AccountSettings: undefined; 
};

// **Main Navigator (Handles Both Drawer and AuthStack)**
export function MainNavigator({ isDarkMode, toggleTheme }: NavigationProps) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Main App (Drawer Navigation) */}
      <Stack.Screen name="MainApp">
        {() => <DrawerNavigator isDarkMode={isDarkMode} toggleTheme={toggleTheme} />}
      </Stack.Screen>

      {/* Auth Screens (Login & Signup) */}
      <Stack.Screen name="Auth" component={AuthStack} />
    </Stack.Navigator>
  );
}

// Icons
import homeIcon from '../assets/home.png';
const menuIcon = require('../../assets/menu.png');
const profileIcon = require('../../assets/ProfileIcon.png');
import dashboardIcon from '../assets/dashboard.png';
import recordsIcon from '../assets/records.png';
import symptomIcon from '../assets/AI.png';
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
    <LinearGradient
      colors={['#001d24', '#141414ff', '#2a004d']} // Gradient colors for the bottom bar
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.bottomNavGradient} // Apply styles
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
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
            <View key={route.key} style={styles.iconContainer}>
              <TouchableOpacity
                onPress={() => props.navigation.navigate(route.name)}
                style={styles.iconButton}
              >
                <Animated.Image
                  source={getIcon(route.name)}
                  style={[
                    getIconStyle(route.name, isFocused),
                    { transform: [{ scale: scaleValue }] },
                  ]}
                />
              </TouchableOpacity>

              {/* Add vertical separator except for the last icon */}
              {index < props.state.routes.length - 1 && (
                <LinearGradient
                  colors={['#8c00ff', '#0091ff']}
                  style={styles.verticalSeparator}
                />
              )}
            </View>
          );
        })}
      </ScrollView>
    </LinearGradient>
  );
};


const styles = StyleSheet.create({
  bottomNavGradient: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 70, // Keep the height consistent
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 70,
    paddingBottom: 10,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    paddingHorizontal: 20,
  },
  verticalSeparator: {
    width: 2,
    height: 30,
    marginHorizontal: 10,
  },
});


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

const getIconStyle = (name: string, isFocused: boolean) => {
  return {
    width: name === 'Home' || name === 'Symptom' ? (isFocused ? 40 : 35) : 30, // Bigger size for Home
    height: name === 'Home' || name === 'Symptom' ? (isFocused ? 40 : 35) : 30, // Bigger size for Home
    tintColor: isFocused ? '#0084ff' : '#FFFFFF', // Keep tinting
  };
};

// **Bottom Tab Navigator**
function HomeTabs() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || null);

  useEffect(() => {
    setProfilePicture(user?.profilePicture || null);
  }, [user?.profilePicture]); // ✅ Updates profile picture when changed

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarShowLabel: false,
        headerTintColor: '#ffffff',
        headerTitleAlign: 'center',
        headerStyle: {
          height: 85,
        },
        headerBackground: () => (
          <LinearGradient
            colors={['#8740c1', '#0c62a2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1 }}
          />
        ),
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
            <Image
              source={profilePicture ? { uri: profilePicture } : require('../../assets/ProfileIcon.png')}
              style={{ width: 30, height: 30, borderRadius: 15 }}
            />
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


function DrawerNavigator({ isDarkMode, toggleTheme }: NavigationProps) {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || null);

  useEffect(() => {
    setProfilePicture(user?.profilePicture || null);
  }, [user?.profilePicture]); // ✅ Updates profile picture when changed

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{
        drawerStyle: {
          backgroundColor: 'transparent',
        },
        headerTintColor: '#ffffff',
        headerTitleAlign: 'center',
        headerStyle: {
          height: 85,
        },
        headerBackground: () => (
          <LinearGradient
            colors={['#8740c1', '#0c62a2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1 }}
          />
        ),
        headerRight: () => (
          <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.jumpTo('Account Settings'))}
            style={{ marginRight: 15 }}
          >
            <Image
              source={profilePicture ? { uri: profilePicture } : require('../../assets/ProfileIcon.png')}
              style={{ width: 30, height: 30, borderRadius: 15 }}
            />
          </TouchableOpacity>
        ),
      }}
    >
      <Drawer.Screen name="Home Page" component={HomeTabs} options={{ headerShown: false }} />
      <Drawer.Screen name="Terms & Conditions" component={TermsConditions} />
      <Drawer.Screen name="Privacy & Security" component={PrivacySecurity} />
      <Drawer.Screen name="Health & Wellness Guidelines" component={HealthGuidelines} />
      <Drawer.Screen name="Cookies" component={Cookies} />
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