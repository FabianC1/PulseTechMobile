import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useTheme } from 'styled-components/native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, NavigationProp } from '@react-navigation/native';

// Define navigation type
type RootStackParamList = {
  'Contact Us': undefined;
};

export function EmergencyContact() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  // Emergency contacts list
  const emergencyContacts = [
    { name: 'Emergency Services', number: '911' },
    { name: 'Health Helpline', number: '1-800-555-EMERGENCY' },
    { name: 'PulseTech Emergency', number: '1-800-123-HEALTH' },
    { name: 'Local Poison Control', number: '1-800-222-1222' },
    { name: 'Fire Department', number: '1-800-555-FIRE' },
    { name: 'Police Department', number: '1-800-555-POLICE' },
    { name: 'Ambulance Services', number: '1-800-555-AMBULANCE' },
    { name: 'Poison Control Center', number: '1-800-333-POISON' },
    { name: 'Mental Health Crisis Line', number: '1-800-555-MIND' },
  ];

  // Function to dial emergency numbers
  const dialNumber = (number: string) => {
    Linking.openURL(`tel:${number}`).catch(() => {
      alert('Unable to make a call. Please check your phone settings.');
    });
  };

  return (
    <LinearGradient colors={theme.colors.background} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Page Title */}
        <Text style={[styles.title, { color: theme.colors.text }]}>Emergency Contact</Text>
        <LinearGradient
          colors={['#0091ff', '#8400ff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.underline}
        />

        <Text style={[styles.description, { color: theme.colors.secondary }]}>
          In case of an emergency, please reach out to the following contacts immediately:
        </Text>

        {/* Emergency Contacts List */}
        {emergencyContacts.map((contact, index) => (
          <View key={index} style={styles.contactItem}>
            <View style={styles.contactInfo}>
              <Text style={[styles.contactName, { color: theme.colors.text }]}>{contact.name}</Text>
              <Text style={[styles.contactNumber, { color: theme.colors.secondary }]}>{contact.number}</Text>
            </View>
            <TouchableOpacity style={styles.sosButton} onPress={() => dialNumber(contact.number)}>
              <Text style={styles.sosText}>SOS</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Contact Us Section */}
        <Text style={[styles.description, { color: theme.colors.secondary }]}>
          For non-urgent inquiries, please feel free to contact us directly.
        </Text>
        <TouchableOpacity
          style={styles.contactButton}
          onPress={() => navigation.navigate('Contact Us')}
        >
          <Text style={styles.buttonText}>Contact Us</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

// **Styles**
const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { padding: 20 },
  
  // Centered Title & Description
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  description: { fontSize: 16, textAlign: 'center', marginBottom: 15 },
  
  // Underline (Not Dynamic)
  underline: {
    height: 3,
    width: '90%', 
    borderRadius: 5,
    marginBottom: 15,
    alignSelf: 'center',
  },

  // Emergency Contact List
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Subtle background
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  contactInfo: {
    flexDirection: 'column',
  },
  contactName: { fontSize: 18, fontWeight: 'bold' },
  contactNumber: { fontSize: 16 },

  // SOS Button
  sosButton: {
    backgroundColor: '#ff0033',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  sosText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Contact Us Button (Centered)
  contactButton: {
    backgroundColor: '#0084ff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
    alignSelf: 'center',
    width: '50%', // Adjust width to fit better
  },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
});
