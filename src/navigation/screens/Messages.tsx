import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  RefreshControl,
  ScrollView
} from 'react-native';
import { useTheme } from 'styled-components/native';
import LinearGradient from 'react-native-linear-gradient';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useAuth } from '../AuthContext';
import { registerForPushNotificationsAsync, scheduleNotification } from '../../NotificationService';
import Icon from 'react-native-vector-icons/MaterialIcons'; // or use your preferred icon set


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
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >

        {!selectedContact && (
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Message your {user.role === 'doctor' ? 'patients' : 'doctors'} here
          </Text>
        )}


        <>


          {/* Contacts View */}
          {!selectedContact && (
            <View style={styles.contactsFullPage}>
              <Text style={[styles.panelTitle, { color: theme.colors.text }]}>Contacts</Text>

              <ScrollView style={{ marginTop: 10 }}>
                {['Contact A', 'Contact B', 'Contact C', 'Contact D', 'Contact E'].map((name, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.contactRow}
                    onPress={() => setSelectedContact(name)}
                  >
                    <View style={styles.avatarPlaceholder} />
                    <Text style={[styles.contactName, { color: theme.colors.text }]}>{name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Chat View */}
          {selectedContact && (
            <View style={styles.chatFullPage}>
              {/* Back Button */}
              <View style={styles.chatHeaderRow}>
                <TouchableOpacity onPress={() => setSelectedContact(null)} style={styles.backButton}>
                  <Icon name="arrow-back" size={24} color={theme.colors.primary} />
                </TouchableOpacity>

                <Text style={[styles.chatTitle, { color: theme.colors.text }]}>
                  Chat with {selectedContact}
                </Text>
              </View>


              {/* Scrollable Messages */}
              <View style={styles.messagesArea}>
                <ScrollView
                  contentContainerStyle={{ paddingBottom: 10 }}
                  showsVerticalScrollIndicator={false}
                >
                  <Text style={{ color: theme.colors.text, opacity: 0.5 }}>(Messages appear here)</Text>
                </ScrollView>
              </View>

              {/* Sticky Input Bar */}
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
            </View>
          )}




        </>
      </KeyboardAwareScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative', // Required for absolute children
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

  contactsFullPage: {
    position: 'absolute',
    marginTop: 30,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
    backgroundColor: '#00000010', // Optional for semi-transparent feel
    height: '1200%',
  },

  chatFullPage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
    backgroundColor: '#00000010',
    justifyContent: 'flex-end',
    height: '86%',
  },


  // Contact Row
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff22',
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#cccccc44',
    marginRight: 12,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '500',
  },

  // Chat Display
  panelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  messagesArea: {
    flex: 1,
    padding: 10,
    backgroundColor: '#ffffff10',
    borderRadius: 10,
    marginBottom: 10,
    width: '100%',
  },
  chatInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },

  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 42,
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

  // Auth fallback
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
  chatHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  backButton: {
    padding: 6,
  },

  chatTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right',
  },

});