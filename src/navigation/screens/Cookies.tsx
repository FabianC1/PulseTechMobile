import React, { useEffect, useState } from 'react';
import { 
  View, Text, ScrollView, StyleSheet, Switch, TouchableOpacity, Animated 
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from 'styled-components/native';

export function Cookies() {
  const theme = useTheme();

  // State for each cookie preference
  const [performanceCookies, setPerformanceCookies] = useState(false);
  const [functionalCookies, setFunctionalCookies] = useState(false);
  const [targetingCookies, setTargetingCookies] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [saveButtonEnabled, setSaveButtonEnabled] = useState(false);

  // Animation for confirmation message
  const fadeAnim = useState(new Animated.Value(0))[0];

  // Load saved cookie preferences when the screen loads
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const performance = await AsyncStorage.getItem('performanceCookies');
        const functional = await AsyncStorage.getItem('functionalCookies');
        const targeting = await AsyncStorage.getItem('targetingCookies');

        if (performance !== null) setPerformanceCookies(JSON.parse(performance));
        if (functional !== null) setFunctionalCookies(JSON.parse(functional));
        if (targeting !== null) setTargetingCookies(JSON.parse(targeting));
      } catch (error) {
        console.error('Error loading cookie preferences:', error);
      }
    };

    loadPreferences();
  }, []);

  // Toggle switches and enable save button
  const toggleSetting = (setter: React.Dispatch<React.SetStateAction<boolean>>, value: boolean) => {
    setter(value);
    setSaveButtonEnabled(true); // Enable save button when changes are made
  };

  // Save preferences
  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem('performanceCookies', JSON.stringify(performanceCookies));
      await AsyncStorage.setItem('functionalCookies', JSON.stringify(functionalCookies));
      await AsyncStorage.setItem('targetingCookies', JSON.stringify(targetingCookies));

      setSaveButtonEnabled(false); // Disable save button after saving
      triggerConfirmation();
    } catch (error) {
      console.error('Error saving cookie settings:', error);
    }
  };

  // Reset preferences to last saved state
  const cancelSettings = async () => {
    try {
      const performance = await AsyncStorage.getItem('performanceCookies');
      const functional = await AsyncStorage.getItem('functionalCookies');
      const targeting = await AsyncStorage.getItem('targetingCookies');

      setPerformanceCookies(performance !== null ? JSON.parse(performance) : false);
      setFunctionalCookies(functional !== null ? JSON.parse(functional) : false);
      setTargetingCookies(targeting !== null ? JSON.parse(targeting) : false);

      setSaveButtonEnabled(false); // Disable save button after canceling
      triggerConfirmation();
    } catch (error) {
      console.error('Error reverting cookie settings:', error);
    }
  };

  // Trigger confirmation popup animation
  const triggerConfirmation = () => {
    setShowConfirmation(true);
    fadeAnim.setValue(1);
    
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 1500,
      useNativeDriver: true,
    }).start(() => setShowConfirmation(false));
  };

  return (
    <LinearGradient colors={theme.colors.background} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={[styles.pageTitle, { color: theme.colors.text }]}>Cookie Preferences</Text>

        {/* Essential Cookies - Always Enabled */}
        <View style={styles.cookieCard}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Essential Cookies</Text>
          <Text style={[styles.content, { color: theme.colors.secondary }]}>
            These cookies are necessary for the app to function properly and cannot be disabled.
          </Text>
          <Switch value={true} disabled={true} trackColor={{ true: '#ccc', false: '#888' }} />
        </View>

        {/* Performance Cookies */}
        <View style={styles.cookieCard}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Performance Cookies</Text>
          <Text style={[styles.content, { color: theme.colors.secondary }]}>
            Helps us analyze app performance and user experience.
          </Text>
          <Switch
            value={performanceCookies}
            onValueChange={(value) => toggleSetting(setPerformanceCookies, value)}
            trackColor={{ true: '#0084ff', false: '#888' }}
          />
        </View>

        {/* Functional Cookies */}
        <View style={styles.cookieCard}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Functional Cookies</Text>
          <Text style={[styles.content, { color: theme.colors.secondary }]}>
            Remembers preferences like theme and language settings.
          </Text>
          <Switch
            value={functionalCookies}
            onValueChange={(value) => toggleSetting(setFunctionalCookies, value)}
            trackColor={{ true: '#0084ff', false: '#888' }}
          />
        </View>

        {/* Targeting Cookies */}
        <View style={styles.cookieCard}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Targeting Cookies</Text>
          <Text style={[styles.content, { color: theme.colors.secondary }]}>
            Tracks browsing habits for personalized ads and content.
          </Text>
          <Switch
            value={targetingCookies}
            onValueChange={(value) => toggleSetting(setTargetingCookies, value)}
            trackColor={{ true: '#0084ff', false: '#888' }}
          />
        </View>

        {/* Save & Cancel Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.saveButton, saveButtonEnabled ? styles.activeButton : styles.disabledButton]} 
            onPress={saveSettings}
            disabled={!saveButtonEnabled}
          >
            <Text style={styles.buttonText}>Save Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={cancelSettings}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Confirmation Popup */}
      {showConfirmation && (
        <Animated.View style={[styles.confirmationPopup, { opacity: fadeAnim }]}>
          <Text style={styles.confirmationText}>Settings updated!</Text>
        </Animated.View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { padding: 20, alignItems: 'center' },
  pageTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  cookieCard: {
    width: '100%',
    padding: 15,
    backgroundColor: '#222',
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 },
  content: { fontSize: 16, textAlign: 'center', marginBottom: 10 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  saveButton: { padding: 12, borderRadius: 8, marginHorizontal: 10 },
  activeButton: { backgroundColor: '#0084ff' },
  disabledButton: { backgroundColor: '#555555' },
  cancelButton: { backgroundColor: '#555', padding: 12, borderRadius: 8, marginHorizontal: 10 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  confirmationPopup: { position: 'absolute', bottom: 50, backgroundColor: '#0091ff', padding: 10, borderRadius: 8 },
  confirmationText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
