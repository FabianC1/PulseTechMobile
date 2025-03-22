import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from 'styled-components/native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useAuth } from '../AuthContext';

type RootStackParamList = {
  Auth: { screen: 'Login' | 'Signup' };
};

export function Appointments() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useAuth();


  const [appointmentsView, setAppointmentsView] = useState<'upcoming' | 'request'>('upcoming');


  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  return (
    <LinearGradient colors={theme.colors.background} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          keyboardShouldPersistTaps="handled"
        >
          {user ? (
            <View style={styles.contentWrapper}>
              <Text style={[styles.title, { color: theme.colors.text }]}>
                Here you can view your appointments
              </Text>

              <View style={styles.toggleButtonsRow}>
                <LinearGradient
                  colors={['#8a5fff', '#0077ffea']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientButtonSmall}
                >
                  <TouchableOpacity
                    onPress={() => setAppointmentsView('upcoming')}
                    style={styles.touchableSmall}
                  >
                    <Text style={styles.buttonText}>View Upcoming</Text>
                  </TouchableOpacity>
                </LinearGradient>

                <LinearGradient
                  colors={['#8a5fff', '#0077ffea']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientButtonSmall}
                >
                  <TouchableOpacity
                    onPress={() => setAppointmentsView('request')}
                    style={styles.touchableSmall}
                  >
                    <Text style={styles.buttonText}>Request Appointment</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            </View>
          ) : (
            <View style={styles.authPrompt}>
              <Text style={[styles.authText, { color: theme.colors.text }]}>
                You need to log in or sign up
              </Text>
              <Text style={[styles.authText, { color: theme.colors.secondary }]}>
                To access your appointments, please log in or create an account.
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
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 100,

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
  loggedInContent: {
    paddingTop: 30,
    alignItems: 'center',
  },
  contentWrapper: {
    paddingTop: 20,
    alignItems: 'center',
  },
  toggleButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    gap: 10,
    flexWrap: 'wrap',
  },
  gradientButtonSmall: {
    borderRadius: 8,
    width: 160,
  },
  touchableSmall: {
    paddingVertical: 12,
    alignItems: 'center',
  },
});
