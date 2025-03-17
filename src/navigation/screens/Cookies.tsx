import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from 'styled-components/native';

export function Cookies() {
  const theme = useTheme();

  // State for each cookie preference
  const [performanceCookies, setPerformanceCookies] = useState(false);
  const [functionalCookies, setFunctionalCookies] = useState(false);
  const [targetingCookies, setTargetingCookies] = useState(false);

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

  // Save preferences
  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem('performanceCookies', JSON.stringify(performanceCookies));
      await AsyncStorage.setItem('functionalCookies', JSON.stringify(functionalCookies));
      await AsyncStorage.setItem('targetingCookies', JSON.stringify(targetingCookies));
      console.log('Cookie settings saved!');
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
      console.log('Changes reverted');
    } catch (error) {
      console.error('Error reverting cookie settings:', error);
    }
  };

  return (
    <LinearGradient colors={theme.colors.background} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={[styles.pageTitle, { color: theme.colors.text }]}>Cookie Preferences</Text>

        {/* Essential Cookies - Always Enabled */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Essential Cookies</Text>
          <LinearGradient colors={['#0091ff', '#8400ff']} style={styles.underline} />
          <Text style={[styles.content, { color: theme.colors.secondary }]}>
            These cookies are necessary for the app to function properly and cannot be disabled.
          </Text>
          <Switch value={true} disabled={true} trackColor={{ true: '#ccc', false: '#888' }} />
        </View>

        {/* Performance Cookies */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Performance Cookies</Text>
          <LinearGradient colors={['#0091ff', '#8400ff']} style={styles.underline} />
          <Text style={[styles.content, { color: theme.colors.secondary }]}>
            Helps us analyze app performance and user experience.
          </Text>
          <Switch
            value={performanceCookies}
            onValueChange={() => setPerformanceCookies(!performanceCookies)}
            trackColor={{ true: '#0084ff', false: '#888' }}
          />
        </View>

        {/* Functional Cookies */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Functional Cookies</Text>
          <LinearGradient colors={['#0091ff', '#8400ff']} style={styles.underline} />
          <Text style={[styles.content, { color: theme.colors.secondary }]}>
            Remembers preferences like theme and language settings.
          </Text>
          <Switch
            value={functionalCookies}
            onValueChange={() => setFunctionalCookies(!functionalCookies)}
            trackColor={{ true: '#0084ff', false: '#888' }}
          />
        </View>

        {/* Targeting Cookies */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Targeting Cookies</Text>
          <LinearGradient colors={['#0091ff', '#8400ff']} style={styles.underline} />
          <Text style={[styles.content, { color: theme.colors.secondary }]}>
            Tracks browsing habits for personalized ads and content.
          </Text>
          <Switch
            value={targetingCookies}
            onValueChange={() => setTargetingCookies(!targetingCookies)}
            trackColor={{ true: '#0084ff', false: '#888' }}
          />
        </View>

        {/* Save & Cancel Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.saveButton} onPress={saveSettings}>
            <Text style={styles.buttonText}>Save Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={cancelSettings}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { padding: 20, alignItems: 'center' },
  pageTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  section: { width: '100%', marginBottom: 25, alignItems: 'center' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 },
  underline: { height: 3, width: '50%', borderRadius: 5, marginBottom: 10 },
  content: { fontSize: 16, textAlign: 'center', marginBottom: 10 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  saveButton: {
    backgroundColor: '#0084ff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 10,
  },
  cancelButton: {
    backgroundColor: '#555',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 10,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

