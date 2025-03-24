import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Keyboard,
  TextInput,
  TouchableWithoutFeedback,
} from 'react-native';
import { useTheme } from 'styled-components/native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '../AuthContext';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import CustomAlerts from './CustomAlerts';
import { registerForPushNotificationsAsync, scheduleNotification } from '../../NotificationService'; // ✅ Included

// Navigation type
type RootStackParamList = {
  Auth: { screen: 'Login' | 'Signup' };
};

export function Messages() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useAuth();

  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <LinearGradient colors={theme.colors.background} style={{ flex: 1 }}>
          {user ? (
            <KeyboardAwareScrollView
              contentContainerStyle={styles.scrollContent}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              keyboardShouldPersistTaps="handled"
              extraScrollHeight={100}
            >
              <Text style={[styles.header, { color: theme.colors.text }]}>
                {user.role === 'doctor'
                  ? 'Message your patients here'
                  : 'Message your doctors here'}
              </Text>

              {/* Chat UI will be built here next */}

            </KeyboardAwareScrollView>
          ) : (
            <View style={styles.authPrompt}>
              <Text style={[styles.authText, { color: theme.colors.text }]}>
                You need to log in or sign up
              </Text>
              <Text style={[styles.authText, { color: theme.colors.secondary }]}>
                To access your messages, please log in or create an account.
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

          <CustomAlerts
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            message={modalMessage}
          />
        </LinearGradient>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 150,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  authPrompt: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: 20,
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
});
