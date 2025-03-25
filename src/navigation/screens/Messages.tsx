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
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState('');


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
            <View style={[styles.contactsFullPage, { marginBottom: 50 }]}>
              <View style={[styles.contactsBox, { borderColor: theme.colors.primary }]}>
                <View style={styles.contactsHeader}>
                  <View style={styles.contactsLabel}>
                    <Text style={[styles.panelTitle, { color: theme.colors.text }]}>Contacts</Text>
                    <LinearGradient
                      colors={['#0091ff', '#8400ff']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.contactsUnderline}
                    />
                  </View>

                  <TouchableOpacity onPress={() => setShowSearch(!showSearch)} style={styles.searchIcon}>
                    <Icon name="search" size={28} color={theme.colors.text} />
                  </TouchableOpacity>
                </View>


                {showSearch && (
                  <TextInput
                    value={searchText}
                    onChangeText={setSearchText}
                    placeholder="Search contacts..."
                    placeholderTextColor={theme.colors.text + '66'}
                    style={[styles.searchInput, { borderColor: theme.colors.primary, color: theme.colors.text }]}
                  />
                )}

                <ScrollView
                  style={{ flex: 1 }}
                  contentContainerStyle={{ paddingBottom: 20 }}
                  showsVerticalScrollIndicator={false}
                >
                  {['Contact A', 'Contact B', 'Contact C', 'Contact D', 'Contact E', 'Contact D', 'Contact E', 'Contact D', 'Contact E'].map((name, index, array) => (
                    <View key={index}>
                      <TouchableOpacity
                        style={styles.contactRow}
                        onPress={() => setSelectedContact(name)}
                      >
                        <View style={styles.avatarPlaceholder} />
                        <Text style={[styles.contactName, { color: theme.colors.text }]}>{name}</Text>
                      </TouchableOpacity>

                      {index < array.length && (
                        <LinearGradient
                          colors={['#0091ff', '#8400ff']}
                          style={styles.gradientSeparator}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                        />
                      )}
                    </View>
                  ))}
                </ScrollView>
              </View>
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

                <View style={styles.chatTitleContainer}>
                  <Text style={[styles.chatTitle, { color: theme.colors.text }]}>
                    Chat with {selectedContact}
                  </Text>
                </View>

                <View style={styles.avatarWrapper}>
                  <View style={styles.avatarPlaceholder} />
                </View>
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
    marginTop: 30,
  },
  contactsFullPage: {
    flex: 1,
    paddingVertical: 20,
    width: '100%',
    alignItems: 'center', // optional: center the inner content
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
    height: '90%',
  },
  gradientSeparator: {
    height: 3,
    width: '100%',
    marginVertical: 8,
    borderRadius: 15,
  },
  // Contact Row
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    width: '100%',
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#cccccc44',
    marginRight: 12,
  },
  contactName: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 20,
  },
  // Chat Display
  panelTitle: {
    fontSize: 24,
    fontWeight: 'bold',
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
    marginTop: 5,
  },
  chatTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  avatarWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#cccccc44',
    marginLeft: 8,
  },
  contactsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
    fontSize: 16,
  },
  contactsBox: {
    flex: 1,
    width: '100%',
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#ffffff05',
  },
  searchIcon: {
    padding: 8,
  },
  contactsLabel: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  contactsUnderline: {
    height: 3,
    width: '100%',
    marginTop: 4,
    borderRadius: 10,
  },
});