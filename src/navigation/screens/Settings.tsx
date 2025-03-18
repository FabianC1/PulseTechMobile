import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from 'styled-components/native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useAuth } from '../AuthContext';
import { useEffect, useState } from 'react';
import { Image, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';


// Define navigation type
type RootStackParamList = {
  Auth: { screen: 'Login' | 'Signup' };
};

interface SettingsProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export function Settings({ isDarkMode, toggleTheme }: SettingsProps) {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user, logout } = useAuth(); // Get authentication state
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.email) {
      fetchProfilePicture();
    }
  }, [user]);

  const fetchProfilePicture = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://192.168.0.84:3000/getUserProfile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email }),
      });

      const data = await response.json();
      setProfilePicture(data.profilePicture || null);
    } catch (error) {
      console.error('Error fetching profile picture:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePictureUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const selectedImage = result.assets[0].uri;
      setProfilePicture(selectedImage);

      // TODO: Send this image to the backend for saving (Not implemented yet)
      console.log('Selected image:', selectedImage);
    }
  };

  const handleRemoveProfilePicture = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://192.168.0.84:3000/removeProfilePicture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email }),
      });

      const data = await response.json();
      if (data.message === 'Profile picture removed successfully') {
        setProfilePicture(null);
      }
    } catch (error) {
      console.error('Error removing profile picture:', error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <LinearGradient colors={theme.colors.background} style={styles.container}>
      {/* Settings Title */}
      <Text style={[styles.title, { color: theme.colors.text }]}>Settings</Text>

      {/* Theme Toggle (Always Available) */}
      <TouchableOpacity
        onPress={toggleTheme}
        style={[styles.button, { backgroundColor: theme.colors.primary }]}
      >
        <Text style={styles.buttonText}>
          Switch to {isDarkMode ? 'Light' : 'Dark'} Mode
        </Text>
      </TouchableOpacity>

      {/* If not logged in, show login/signup prompt */}
      {!user ? (
        <View style={styles.authPrompt}>
          <Text style={[styles.authText, { color: theme.colors.secondary }]}>
            Log in or sign up to access this page.
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.authButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => navigation.navigate('Auth', { screen: 'Login' })} //Fixes navigation
            >
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.authButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => navigation.navigate('Auth', { screen: 'Signup' })} //Fixes navigation
            >
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.loggedInSection}>
          {/* Welcome Text */}
          <Text style={[styles.authText, { color: theme.colors.text }]}>
            Welcome, {user.username}! You can now access your settings.
          </Text>

          {/* Profile Picture Section */}
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            {loading ? (
              <ActivityIndicator size="large" color={theme.colors.primary} />
            ) : (
              <Image
                source={profilePicture ? { uri: profilePicture } : require('../../assets/ProfileIcon.png')}
                style={{ width: 100, height: 100, borderRadius: 50 }}
              />
            )}

            <TouchableOpacity onPress={handleProfilePictureUpload} style={[styles.button, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.buttonText}>Change Picture</Text>
            </TouchableOpacity>

            {profilePicture && (
              <TouchableOpacity onPress={handleRemoveProfilePicture} style={[styles.button, { backgroundColor: 'red' }]}>
                <Text style={styles.buttonText}>Remove Picture</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={[styles.settingOption, { backgroundColor: theme.colors.logout }]} onPress={logout}>
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
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
    marginBottom: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  authPrompt: {
    marginTop: 30,
    alignItems: 'center',
  },
  authText: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  authButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  loggedInSection: {
    marginTop: 30,
    alignItems: 'center',
  },
  settingOption: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 10,
    width: 200,
    alignItems: 'center',
  },
});
