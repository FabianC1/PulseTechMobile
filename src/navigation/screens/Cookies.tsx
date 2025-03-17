import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Switch, TouchableOpacity, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from 'styled-components/native';

export function Cookies() {
  const theme = useTheme();
  const [performanceCookies, setPerformanceCookies] = useState(false);
  const [functionalCookies, setFunctionalCookies] = useState(false);
  const [targetingCookies, setTargetingCookies] = useState(false);
  const [savedState, setSavedState] = useState({ performance: false, functional: false, targeting: false });

  // State for showing the popup
  const [showPopup, setShowPopup] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  // Load saved preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const performance = await AsyncStorage.getItem('performanceCookies');
        const functional = await AsyncStorage.getItem('functionalCookies');
        const targeting = await AsyncStorage.getItem('targetingCookies');

        const newState = {
          performance: performance !== null ? JSON.parse(performance) : false,
          functional: functional !== null ? JSON.parse(functional) : false,
          targeting: targeting !== null ? JSON.parse(targeting) : false,
        };

        setPerformanceCookies(newState.performance);
        setFunctionalCookies(newState.functional);
        setTargetingCookies(newState.targeting);
        setSavedState(newState);
      } catch (error) {
        console.error('Error loading cookie preferences:', error);
      }
    };

    loadPreferences();
  }, []);

  // Save preferences and show popup
  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem('performanceCookies', JSON.stringify(performanceCookies));
      await AsyncStorage.setItem('functionalCookies', JSON.stringify(functionalCookies));
      await AsyncStorage.setItem('targetingCookies', JSON.stringify(targetingCookies));

      setSavedState({ performance: performanceCookies, functional: functionalCookies, targeting: targetingCookies });

      // Show the popup
      setShowPopup(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Hide popup after 2 seconds
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setShowPopup(false));
      }, 2000);
      
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  // Cancel and revert to last saved state
  const cancelSettings = () => {
    setPerformanceCookies(savedState.performance);
    setFunctionalCookies(savedState.functional);
    setTargetingCookies(savedState.targeting);
    console.log('Changes reverted');
  };

  return (
    <LinearGradient colors={theme.colors.background} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={[styles.pageTitle, { color: theme.colors.text }]}>Cookie Preferences</Text>

        {/* Essential Cookies (Always Enabled) */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Essential Cookies</Text>
          <View style={styles.row}>
            <Text style={[styles.content, { color: theme.colors.secondary }]}>
              Necessary for app functionality and cannot be disabled.
            </Text>
            <Switch value={true} disabled={true} />
          </View>
        </View>

        <LinearGradient colors={['#0091ff', '#8400ff']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.separator} />

        {/* Performance Cookies */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Performance Cookies</Text>
          <View style={styles.row}>
            <Text style={[styles.content, { color: theme.colors.secondary }]}>
              Helps analyze app performance and user experience.
            </Text>
            <Switch 
              value={performanceCookies} 
              onValueChange={() => setPerformanceCookies(!performanceCookies)} 
              trackColor={{ true: '#8400ff', false: '#888' }} 
              thumbColor={performanceCookies ? '#0091ff' : '#ccc'} 
            />
          </View>
        </View>

        <LinearGradient colors={['#0091ff', '#8400ff']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.separator} />

        {/* Functional Cookies */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Functional Cookies</Text>
          <View style={styles.row}>
            <Text style={[styles.content, { color: theme.colors.secondary }]}>
              Remembers preferences like theme and language settings.
            </Text>
            <Switch 
              value={functionalCookies} 
              onValueChange={() => setFunctionalCookies(!functionalCookies)} 
              trackColor={{ true: '#8400ff', false: '#888' }} 
              thumbColor={functionalCookies ? '#0091ff' : '#ccc'} 
            />
          </View>
        </View>

        <LinearGradient colors={['#0091ff', '#8400ff']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.separator} />

        {/* Targeting Cookies */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Targeting Cookies</Text>
          <View style={styles.row}>
            <Text style={[styles.content, { color: theme.colors.secondary }]}>
              Tracks browsing habits for personalized content.
            </Text>
            <Switch 
              value={targetingCookies} 
              onValueChange={() => setTargetingCookies(!targetingCookies)} 
              trackColor={{ true: '#8400ff', false: '#888' }} 
              thumbColor={targetingCookies ? '#0091ff' : '#ccc'} 
            />
          </View>
        </View>

        <LinearGradient colors={['#0091ff', '#8400ff']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.separator} />

        {/* Save & Cancel Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={saveSettings}>
            <Text style={styles.buttonText}>Save Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={cancelSettings}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Animated Popup */}
      {showPopup && (
        <Animated.View style={[styles.popup, { opacity: fadeAnim }]}>
          <Text style={styles.popupText}>Settings saved!</Text>
        </Animated.View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  scrollContainer: { 
    padding: 20 
  },
  pageTitle: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginBottom: 20 
  },
  section: { 
    paddingBottom: 15, 
    paddingTop: 20 
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginBottom: 12 
  },
  row: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 10 
  },
  content: { 
    fontSize: 16, 
    flex: 1, 
    textAlign: 'left' 
  },
  separator: { 
    height: 2, width: '100%', marginVertical: 15 
  },
  buttonContainer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    marginTop: 25 
  },
  saveButton: { 
    backgroundColor: '#0084ff', 
    paddingVertical: 12, 
    paddingHorizontal: 20, 
    borderRadius: 8, 
    marginHorizontal: 10 
  },
  cancelButton: { 
    backgroundColor: '#6200ff', 
    paddingVertical: 12, 
    paddingHorizontal: 20,
    borderRadius: 8, 
    marginHorizontal: 10 
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  popup: {
    position: 'absolute',
    top: '50%', // Center it vertically
    left: '50%', // Center it horizontally
    transform: [{ translateX: -75 }, { translateY: -50 }], // Offset to truly center
    backgroundColor: '#0084ff',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 10,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 5, // For Android shadow
  },
  popupText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
