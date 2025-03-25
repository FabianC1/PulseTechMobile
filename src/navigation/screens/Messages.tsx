import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  RefreshControl,
  ScrollView,
  Image,
  Platform,
  Dimensions
} from 'react-native';
import { useTheme } from 'styled-components/native';
import LinearGradient from 'react-native-linear-gradient';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useAuth } from '../AuthContext';
import { registerForPushNotificationsAsync, scheduleNotification } from '../../NotificationService';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';

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
  const [attachedRecord, setAttachedRecord] = useState<any>(null);
  const [viewRecordModalVisible, setViewRecordModalVisible] = useState(false);
  const [selectedMessageAttachment, setSelectedMessageAttachment] = useState<any | null>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);

  const screenHeight = Dimensions.get('window').height;

  const keyboardVerticalOffset = screenHeight; // Pushes up as much as possible



  const handleAttachPress = async () => {
    if (!user) return;
  
    try {
      const response = await axios.get<{ record: any }>(
        'http://192.168.0.84:3000/get-medical-records',
        {
          params: { email: user.email }
        }
      );
      console.log('Medical record response:', response.data);

      if (response.data) {
        setAttachedRecord(response.data || null);
      } else {
        console.warn('No medical record found for this user.');
      }
      
    } catch (error) {
      console.error('Failed to fetch medical record:', error);
    }
  };
  

  const handleViewRecord = () => {
    setViewRecordModalVisible(true);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !attachedRecord) return; // prevent empty sends

    const messageToSend = {
      sender: user?.email,
      receiver: selectedContact.email,
      message: newMessage.trim() || null,
      attachment: attachedRecord || null,
      timestamp: new Date().toISOString(),
    };

    try {
      await axios.post('http://192.168.0.84:3000/send-message', messageToSend);

      // Optimistically update UI
      setMessages(prev => [...prev, messageToSend]);

      // Clear input and attachment
      setNewMessage('');
      setAttachedRecord(null);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);


  const handleSelectContact = async (contact: any) => {
    setSelectedContact(contact);

    try {
      const response = await axios.get('http://192.168.0.84:3000/get-messages', {
        params: {
          sender: user?.email,
          recipient: contact.email,
        }
      });

      setMessages(response.data as any[]);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };


  useEffect(() => {
    let isMounted = true;
  
    const fetchContacts = async () => {
      if (!user || contacts.length > 0) return;
  
      try {
        const response = await axios.get(`http://192.168.0.84:3000/get-contacts`, {
          params: { email: user.email }
        });
  
        if (isMounted) {
          setContacts(response.data as any[]);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Failed to fetch contacts:', error);
        }
      }
    };
  
    fetchContacts();
  
    return () => {
      isMounted = false;
    };
  }, [user]);
  

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
                  {contacts.map((contact: any, index: number) => (
                    <View key={contact.id || index}>
                      <TouchableOpacity
                        style={styles.contactRow}
                        onPress={() => handleSelectContact(contact)}

                      >
                        {contact.profilePicture ? (
                          <Image
                            source={{ uri: contact.profilePicture }}
                            style={styles.contactAvatar}
                          />
                        ) : (
                          <View style={styles.avatarPlaceholder} />
                        )}

                        <Text style={[styles.contactName, { color: theme.colors.text }]}>
                          {contact.fullName || contact.name || 'Unnamed'}
                        </Text>
                      </TouchableOpacity>

                      {index < contacts.length - 1 && (
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
            <>
              <KeyboardAwareScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.chatFullPage}
                keyboardShouldPersistTaps="handled"
                enableOnAndroid
                extraScrollHeight={170}
                {...({ keyboardVerticalOffset } as any)}
              >

                <View style={[styles.chatBox, { borderColor: theme.colors.border }]}>
                  {/* Header Row */}
                  <View style={styles.chatHeaderRow}>
                    <TouchableOpacity onPress={() => setSelectedContact(null)} style={styles.backButton}>
                      <Icon name="arrow-back" size={24} color={theme.colors.primary} />
                    </TouchableOpacity>

                    <View style={styles.chatTitleContainer}>
                      <Text style={[styles.chatTitle, { color: theme.colors.text }]}>
                        Chat with {selectedContact.fullName || selectedContact.name || 'Unnamed'}
                      </Text>

                      <LinearGradient
                        colors={['#0091ff', '#8400ff']}
                        style={styles.chatTitleUnderline}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      />
                    </View>

                    <View style={styles.avatarWrapper}>
                      {selectedContact?.profilePicture ? (
                        <Image
                          source={{ uri: selectedContact.profilePicture }}
                          style={styles.contactAvatar}
                        />
                      ) : (
                        <View style={styles.avatarPlaceholder} />
                      )}
                    </View>
                  </View>

                  {/* Scrollable Messages */}
                  <View style={styles.messagesArea}>
                    <ScrollView
                      ref={scrollViewRef}
                      contentContainerStyle={{ paddingBottom: 10 }}
                      showsVerticalScrollIndicator={false}
                    >

                      <View style={styles.bubbleContainer}>
                        {messages.map((msg, index) => {
                          const isSent = msg.sender === user?.email;

                          return (
                            <View
                              key={index}
                              style={[
                                isSent ? styles.sentBubble : styles.receivedBubble,
                                {
                                  backgroundColor: isSent
                                    ? theme.colors.sentBubbleBackground
                                    : theme.colors.receivedBubbleBackground,
                                },
                              ]}
                            >
                              {msg.message && (
                                <Text style={[styles.bubbleText, { color: theme.colors.text }]}>
                                  {msg.message}
                                </Text>
                              )}

                              {msg.attachment && (
                                <View style={[styles.attachedBlock, { backgroundColor: theme.colors.attachmentBlockBackground }]}>
                                  <Text style={[styles.attachmentTitle, { color: theme.colors.text }]}>
                                    Attached Medical Record:
                                  </Text>
                                  <TouchableOpacity
                                    onPress={() => {
                                      setSelectedMessageAttachment(msg.attachment);
                                      setViewRecordModalVisible(true);
                                    }}
                                    style={[styles.viewChatRecordButton, { backgroundColor: theme.colors.sentBubbleBackground }]}
                                  >
                                    <Text style={[styles.viewChatRecordText, { color: theme.colors.text }]}>View</Text>
                                  </TouchableOpacity>
                                </View>
                              )}
                            </View>
                          );

                        })}
                      </View>


                    </ScrollView>
                  </View>

                  {attachedRecord && (
                    <View style={styles.attachmentButtonsContainer}>
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedMessageAttachment(attachedRecord);
                          setViewRecordModalVisible(true);
                        }}
                        style={styles.viewButton}
                      >
                        <Text style={styles.viewText}>View</Text>
                      </TouchableOpacity>

                      <TouchableOpacity onPress={() => setAttachedRecord(null)} style={styles.removeButton}>
                        <Text style={styles.removeText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Input Row */}
                  <View style={styles.chatInputRow}>
                    <TouchableOpacity style={styles.attachButton} onPress={handleAttachPress}>
                      <Icon name="attach-file" size={22} color={theme.colors.text} />
                    </TouchableOpacity>


                    <TextInput
                      value={newMessage}
                      onChangeText={setNewMessage}
                      placeholder="Type a message..."
                      placeholderTextColor={theme.colors.text + '99'}
                      style={[
                        styles.messageInput,
                        {
                          borderColor: theme.colors.primary,
                          color: theme.colors.text,
                          flex: attachedRecord ? 0.8 : 1,
                        },
                      ]}
                    />

                    <TouchableOpacity
                      onPress={handleSendMessage}
                      style={[styles.sendButton, { backgroundColor: theme.colors.primary, paddingHorizontal: 14 }]}
                    >
                      <Text style={styles.sendText}>Send</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </KeyboardAwareScrollView>

              {/* Medical Record Popup */}
              {viewRecordModalVisible && selectedMessageAttachment && (
                <View style={styles.modalOverlay}>
                  <View style={styles.popupContent}>
                    <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Attached Medical Record</Text>
                    <ScrollView style={styles.popupScroll}>
                      <Text style={{ color: theme.colors.text }}>
                        <Text style={{ fontWeight: 'bold' }}>Name:</Text> {selectedMessageAttachment.fullName}{"\n"}
                        <Text style={{ fontWeight: 'bold' }}>DOB:</Text> {selectedMessageAttachment.dateOfBirth}{"\n"}
                        <Text style={{ fontWeight: 'bold' }}>Gender:</Text> {selectedMessageAttachment.gender}{"\n"}
                        <Text style={{ fontWeight: 'bold' }}>Blood Type:</Text> {selectedMessageAttachment.bloodType || "N/A"}{"\n"}
                        <Text style={{ fontWeight: 'bold' }}>Emergency Contact:</Text> {selectedMessageAttachment.emergencyContact || "N/A"}{"\n\n"}

                        <Text style={{ fontWeight: 'bold' }}>Medical History:</Text>{"\n"}
                        {selectedMessageAttachment.medicalHistory || "No medical history available."}{"\n\n"}

                        <Text style={{ fontWeight: 'bold' }}>Current Medications:</Text>{"\n"}
                        {selectedMessageAttachment.medications?.length ? (
                          selectedMessageAttachment.medications.map((med: any, idx: number) => (
                            <Text key={idx}>
                              • {med.name} | {med.dosage} | {med.frequency} | {med.timeToTake} | {med.duration} | {med.diagnosis}{"\n"}
                            </Text>
                          ))
                        ) : "No current medications recorded."}{"\n\n"}

                        <Text style={{ fontWeight: 'bold' }}>Vaccinations:</Text>{"\n"}
                        {selectedMessageAttachment.vaccinations || "No vaccination records available."}{"\n\n"}

                        <Text style={{ fontWeight: 'bold' }}>Lifestyle:</Text>{"\n"}
                        Smoking: {selectedMessageAttachment.smokingStatus || "N/A"} |
                        Alcohol: {selectedMessageAttachment.alcoholConsumption || "N/A"} |
                        Exercise: {selectedMessageAttachment.exerciseRoutine || "N/A"} |
                        Sleep: {selectedMessageAttachment.sleepPatterns || "N/A"}{"\n\n"}

                        <Text style={{ fontWeight: 'bold' }}>Health Logs:</Text>{"\n"}
                        {selectedMessageAttachment.healthLogs || "No health logs available."}{"\n\n"}

                        <Text style={{ fontWeight: 'bold' }}>Wearable Data:</Text>{"\n"}
                        HR: {selectedMessageAttachment.heartRate || "N/A"} |
                        Steps: {selectedMessageAttachment.stepCount || "N/A"} |
                        Sleep: {selectedMessageAttachment.sleepTracking || "N/A"} |
                        O₂: {selectedMessageAttachment.bloodOxygen || "N/A"}
                      </Text>
                    </ScrollView>

                    <TouchableOpacity
                      onPress={() => {
                        setSelectedMessageAttachment(null);
                        setViewRecordModalVisible(false);
                      }}
                      style={styles.modalCloseBtn}
                    >
                      <Text style={styles.sendText}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

            </>
          )}



        </>
      </KeyboardAwareScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
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
    alignItems: 'center',
  },
  contactsBox: {
    flex: 1,
    width: '100%',
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#ffffff05',
  },
  contactsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
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
    backgroundColor: '#00000044',
    marginRight: 12,
  },
  contactName: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 20,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
    fontSize: 16,
  },
  searchIcon: {
    padding: 8,
  },
  gradientSeparator: {
    height: 3,
    width: '100%',
    marginVertical: 8,
    borderRadius: 15,
  },

  // Chat UI
  chatFullPage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 5,
    backgroundColor: '#00000010',
    justifyContent: 'flex-end',
    height: '89.8%',
  },
  chatBox: {
    flex: 1,
    width: '100%',
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 16,
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
  chatTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  avatarWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#cccccc44',
    marginLeft: 8,
  },
  messagesArea: {
    flex: 1,
    backgroundColor: '#ffffff10',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  chatInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  attachButton: {
    paddingHorizontal: 6,
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ffffff55',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
    color: '#fff',
  },
  sendButton: {
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
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
  // Chat Display
  panelTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  chatTitleUnderline: {
    height: 3,
    width: '80%',
    marginTop: 4,
    borderRadius: 15,
  },
  bubbleContainer: {
    gap: 10,
    flexDirection: 'column',
  },

  receivedBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff22',
    padding: 10,
    borderRadius: 16,
    borderBottomLeftRadius: 2,
    maxWidth: '80%',
  },

  sentBubble: {
    alignSelf: 'flex-end',
    padding: 10,
    borderRadius: 16,
    borderBottomRightRadius: 2,
    maxWidth: '80%',
  },

  bubbleText: {
    color: '#fff',
    fontSize: 15,
  },
  attachedBlock: {
    backgroundColor: '#ffffff8c',
    padding: 10,
    borderRadius: 10,
    marginTop: 6,
  },

  attachmentTitle: {
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#fff',
  },

  attachmentButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
    marginLeft: 6,
  },

  viewButton: {
    backgroundColor: '#0091ff',
    borderRadius: 8,
    paddingVertical: 4,  // Smaller vertical padding for the button
    paddingHorizontal: 10, // Smaller horizontal padding
  },

  removeButton: {
    backgroundColor: '#ff4d4d',
    borderRadius: 8,
    paddingVertical: 4,  // Smaller vertical padding for the button
    paddingHorizontal: 10, // Smaller horizontal padding
  },

  viewText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  removeText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  // Modal
  modalOverlay: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  popupContent: {
    backgroundColor: '#222',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
    justifyContent: 'space-between',
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },

  popupScroll: {
    maxHeight: 250,
    marginBottom: 20,
  },

  modalCloseBtn: {
    padding: 10,
    backgroundColor: '#d80000cc',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },


  // For view button inside chat bubbles
  viewChatRecordButton: {
    marginTop: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: '#0091ff',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  viewChatRecordText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#cccccc44',
    marginRight: 12,
  },

});
