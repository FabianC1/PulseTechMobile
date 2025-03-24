import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useTheme } from 'styled-components/native';
import LinearGradient from 'react-native-linear-gradient';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useAuth } from '../AuthContext';
import { registerForPushNotificationsAsync, scheduleNotification } from '../../NotificationService';

type RootStackParamList = {
  Auth: { screen: 'Login' | 'Signup' };
};

export function Messages() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useAuth();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  if (!user) {
    return (
      <LinearGradient colors={theme.colors.background} style={styles.container}>
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
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={theme.colors.background} style={styles.container}>
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Message your {user.role === 'doctor' ? 'patients' : 'doctors'} here
        </Text>

        <View style={styles.chatLayout}>
          {/* Contacts Panel */}
          <View style={styles.contactsPanel}>
            <Text style={[styles.panelTitle, { color: theme.colors.text }]}>Contacts</Text>
            {/* Placeholder list */}
            {['Contact A', 'Contact B', 'Contact C'].map((name, index) => (
              <TouchableOpacity
                key={index}
                style={styles.contactItem}
                onPress={() => setSelectedContact(name)}
              >
                <Text style={{ color: theme.colors.text }}>{name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Chat Panel */}
          {/* Chat Panel */}
          <View style={styles.chatPanel}>
            {selectedContact ? (
              <>
                {/* Back Button */}
                <TouchableOpacity onPress={() => setSelectedContact(null)} style={{ marginBottom: 10 }}>
                  <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>← Back to Contacts</Text>
                </TouchableOpacity>

                {/* Chat Title */}
                <Text style={[styles.panelTitle, { color: theme.colors.text }]}>
                  Chat with {selectedContact}
                </Text>

                {/* Messages Area */}
                <View style={styles.messagesArea}>
                  <Text style={{ color: theme.colors.text, opacity: 0.5 }}>(Messages appear here)</Text>
                </View>

                {/* Input Row */}
                <View style={styles.chatInputRow}>
                  <TextInput
                    value={newMessage}
                    onChangeText={setNewMessage}
                    placeholder="Type a message..."
                    placeholderTextColor={theme.colors.text + '88'}
                    style={[styles.messageInput, { borderColor: theme.colors.primary, color: theme.colors.text }]}
                  />
                  <TouchableOpacity style={styles.sendButton}>
                    <Text style={styles.sendText}>Send</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <Text style={[styles.panelTitle, { color: theme.colors.text }]}>
                Select a contact to start chatting
              </Text>
            )}
          </View>




        </View>
      </KeyboardAwareScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 150,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  chatLayout: {
    flexDirection: 'row',
    gap: 10,
  },
  contactsPanel: {
    width: '35%',
    padding: 10,
    backgroundColor: '#ffffff12',
    borderRadius: 10,
  },
  chatPanel: {
    flex: 1,
    padding: 10,
    backgroundColor: '#ffffff12',
    borderRadius: 10,
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  contactItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff22',
  },
  messagesArea: {
    flex: 1,
    padding: 10,
    backgroundColor: '#ffffff10',
    borderRadius: 10,
    marginBottom: 10,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
  },
  sendButton: {
    backgroundColor: '#8a5fff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  sendText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  authPrompt: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 276,
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
