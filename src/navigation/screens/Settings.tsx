import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Button } from 'react-native';
import { useTheme } from 'styled-components/native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useAuth } from '../AuthContext';
import { useEffect, useState } from 'react';
import { Image, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';


// Define navigation type
type RootStackParamList = {
  Auth: { screen: 'Login' | 'Signup' };
};

interface SettingsProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export function Settings({ isDarkMode, toggleTheme }: SettingsProps) {
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user, logout } = useAuth(); // Get authentication state
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfilePicture(); //
    setRefreshing(false);
  };

  // Holds a copy of user data for editing (does NOT update real profile until saved)
  const [editableUser, setEditableUser] = useState({
    fullName: user?.fullName || "",
    username: user?.username || "",
    email: user?.email || "",
    password: "",
    dateOfBirth: user?.dateOfBirth || "",
    ethnicity: user?.ethnicity || "",
    address: user?.address || "",
    phoneNumber: user?.phoneNumber || "",
    gender: user?.gender || "",
  });

  // Tracks which fields are in edit mode
  const [isEditing, setIsEditing] = useState({
    fullName: false,
    username: false,
    email: false,
    password: false,
    dateOfBirth: false,
    ethnicity: false,
    address: false,
    phoneNumber: false,
    gender: false,
  });

  // Controls when to show the "Save Changes" button
  const [showSaveButton, setShowSaveButton] = useState(false);

  // Controls the "Profile updated successfully" message
  const [saveSuccess, setSaveSuccess] = useState(false);

  const toggleEdit = (field: keyof typeof isEditing) => {
    setIsEditing({ ...isEditing, [field]: !isEditing[field] });
  };

  useEffect(() => {
    const isChanged = Object.keys(editableUser).some(
      (key) => editableUser[key as keyof typeof editableUser] !== user?.[key as keyof typeof user]
    );
    setShowSaveButton(isChanged);
  }, [editableUser, user]);

  useEffect(() => {
    if (user?.email) {
      fetchProfilePicture();
    }
  }, [user]);

  const fetchProfilePicture = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://192.168.0.84:3000/getUserProfile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email }),
      });

      const data = await response.json();
      setProfilePicture(data.profilePicture || null);
    } catch (error) {
      console.error('Error fetching profile picture:', error);
    } finally {
      setLoading(false);
    }
  };

  const { updateProfilePicture } = useAuth(); // ✅ Get function from context

  const handleProfilePictureUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const selectedImage = result.assets[0].uri;

      setProfilePicture(selectedImage); // ✅ Update local state
      updateProfilePicture(selectedImage); // ✅ Update global state
    }
  };

  const handleRemoveProfilePicture = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await fetch("http://192.168.0.84:3000/removeProfilePicture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });

      const data = await response.json();

      if (data.message === "Profile picture removed successfully") {
        user.profilePicture = null; //Remove from UI
        setProfilePicture(null); //Update local state
        updateProfilePicture(null); //Update global AuthContext

        //Sync with AsyncStorage (same as Vue.js localStorage)
        await AsyncStorage.setItem("user", JSON.stringify({ ...user, profilePicture: null }));

        console.log("Profile picture removed successfully.");
      } else {
        alert("There was an error removing your profile picture.");
      }
    } catch (error) {
      console.error("Error removing profile picture:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveChanges = async () => {
    try {
      const updatedData: any = { ...editableUser, email: user?.email };

      // Remove password if unchanged
      if (!editableUser.password.trim()) {
        delete updatedData.password;
      }

      const response = await fetch("http://192.168.0.84:3000/updateProfile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      const data = await response.json();

      if (data.message === "User profile updated successfully") {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000); // Hide success message after 3 sec

        // Update global auth context
        updateProfilePicture(updatedData.profilePicture || null);

        // Update local AsyncStorage
        await AsyncStorage.setItem("user", JSON.stringify({ ...user, ...updatedData }));

        // Exit edit mode
        setIsEditing({
          fullName: false,
          username: false,
          email: false,
          password: false,
          dateOfBirth: false,
          ethnicity: false,
          address: false,
          phoneNumber: false,
          gender: false,
        });

        setShowSaveButton(false);
      } else {
        alert("No changes were made.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("An error occurred while saving your changes.");
    }
  };


  return (
    <LinearGradient colors={theme.colors.background} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Settings Title */}
        <Text style={[styles.title, { color: theme.colors.text }]}>Settings</Text>

        {/* Theme Toggle (Always Available) */}
        <TouchableOpacity
          onPress={toggleTheme}
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
        >
          <Text style={styles.buttonText}>
            Switch to {isDarkMode ? 'Light' : 'Dark'} Mode
          </Text>
        </TouchableOpacity>

        {/* If not logged in, show login/signup prompt */}
        {!user ? (
          <View style={styles.authPrompt}>
            <Text style={[styles.authText, { color: theme.colors.secondary }]}>
              Log in or sign up to access this page.
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
        ) : (
          <View style={styles.loggedInSection}>
            {/* Welcome Text */}
            <Text style={[styles.authText, { color: theme.colors.text }]}>
              Welcome, {user.username}
            </Text>

            {/* Profile Picture Section */}
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              {loading ? (
                <ActivityIndicator size="large" color={theme.colors.primary} />
              ) : (
                <Image
                  source={profilePicture ? { uri: profilePicture } : require('../../../assets/ProfileIcon.png')}
                  style={{ width: 100, height: 100, borderRadius: 50 }}
                />
              )}

              {user && (
                <>
                  <TouchableOpacity onPress={handleProfilePictureUpload} style={[styles.button, { backgroundColor: theme.colors.primary }]}>
                    <Text style={styles.buttonText}>Change Picture</Text>
                  </TouchableOpacity>

                  {user.profilePicture && (
                    <TouchableOpacity onPress={handleRemoveProfilePicture} style={[styles.button, { backgroundColor: 'red' }]}>
                      <Text style={styles.buttonText}>Remove Picture</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>

            {/* Editable Profile Information */}
            <View>
              {/* Full Name */}
              <View style={styles.fieldRow}>
                <Text>Full Name:</Text>
                {isEditing.fullName ? (
                  <TextInput
                    style={styles.input}
                    value={editableUser.fullName}
                    onChangeText={(text) => setEditableUser({ ...editableUser, fullName: text })}
                  />
                ) : (
                  <Text>{user?.fullName}</Text>
                )}
                <TouchableOpacity onPress={() => toggleEdit("fullName")}>
                  <Text style={styles.editButton}>{isEditing.fullName ? "Cancel" : "Edit"}</Text>
                </TouchableOpacity>
              </View>

              {/* Username */}
              <View style={styles.fieldRow}>
                <Text>Username:</Text>
                {isEditing.username ? (
                  <TextInput
                    style={styles.input}
                    value={editableUser.username}
                    onChangeText={(text) => setEditableUser({ ...editableUser, username: text })}
                  />
                ) : (
                  <Text>{user?.username}</Text>
                )}
                <TouchableOpacity onPress={() => toggleEdit("username")}>
                  <Text style={styles.editButton}>{isEditing.username ? "Cancel" : "Edit"}</Text>
                </TouchableOpacity>
              </View>

              {/* Email */}
              <View style={styles.fieldRow}>
                <Text>Email:</Text>
                {isEditing.email ? (
                  <TextInput
                    style={styles.input}
                    value={editableUser.email}
                    onChangeText={(text) => setEditableUser({ ...editableUser, email: text })}
                  />
                ) : (
                  <Text>{user?.email}</Text>
                )}
                <TouchableOpacity onPress={() => toggleEdit("email")}>
                  <Text style={styles.editButton}>{isEditing.email ? "Cancel" : "Edit"}</Text>
                </TouchableOpacity>
              </View>

              {/* Password */}
              <View style={styles.fieldRow}>
                <Text>Password:</Text>
                {isEditing.password ? (
                  <TextInput
                    style={styles.input}
                    value={editableUser.password}
                    onChangeText={(text) => setEditableUser({ ...editableUser, password: text })}
                    secureTextEntry
                  />
                ) : (
                  <Text>••••••••</Text>
                )}
                <TouchableOpacity onPress={() => toggleEdit("password")}>
                  <Text style={styles.editButton}>{isEditing.password ? "Cancel" : "Edit"}</Text>
                </TouchableOpacity>
              </View>

              {/* Date of Birth */}
              <View style={styles.fieldRow}>
                <Text>Date of Birth:</Text>
                {isEditing.dateOfBirth ? (
                  <TextInput
                    style={styles.input}
                    value={editableUser.dateOfBirth}
                    onChangeText={(text) => setEditableUser({ ...editableUser, dateOfBirth: text })}
                  />
                ) : (
                  <Text>{user?.dateOfBirth}</Text>
                )}
                <TouchableOpacity onPress={() => toggleEdit("dateOfBirth")}>
                  <Text style={styles.editButton}>{isEditing.dateOfBirth ? "Cancel" : "Edit"}</Text>
                </TouchableOpacity>
              </View>

              {/* Ethnicity */}
              <View style={styles.fieldRow}>
                <Text>Ethnicity:</Text>
                {isEditing.ethnicity ? (
                  <TextInput
                    style={styles.input}
                    value={editableUser.ethnicity}
                    onChangeText={(text) => setEditableUser({ ...editableUser, ethnicity: text })}
                  />
                ) : (
                  <Text>{user?.ethnicity}</Text>
                )}
                <TouchableOpacity onPress={() => toggleEdit("ethnicity")}>
                  <Text style={styles.editButton}>{isEditing.ethnicity ? "Cancel" : "Edit"}</Text>
                </TouchableOpacity>
              </View>

              {/* Address */}
              <View style={styles.fieldRow}>
                <Text>Address:</Text>
                {isEditing.address ? (
                  <TextInput
                    style={styles.input}
                    value={editableUser.address}
                    onChangeText={(text) => setEditableUser({ ...editableUser, address: text })}
                  />
                ) : (
                  <Text>{user?.address}</Text>
                )}
                <TouchableOpacity onPress={() => toggleEdit("address")}>
                  <Text style={styles.editButton}>{isEditing.address ? "Cancel" : "Edit"}</Text>
                </TouchableOpacity>
              </View>

              {/* Phone Number */}
              <View style={styles.fieldRow}>
                <Text>Phone Number:</Text>
                {isEditing.phoneNumber ? (
                  <TextInput
                    style={styles.input}
                    value={editableUser.phoneNumber}
                    onChangeText={(text) => setEditableUser({ ...editableUser, phoneNumber: text })}
                  />
                ) : (
                  <Text>{user?.phoneNumber}</Text>
                )}
                <TouchableOpacity onPress={() => toggleEdit("phoneNumber")}>
                  <Text style={styles.editButton}>{isEditing.phoneNumber ? "Cancel" : "Edit"}</Text>
                </TouchableOpacity>
              </View>

              {/* Gender */}
              <View style={styles.fieldRow}>
                <Text>Gender:</Text>
                {isEditing.gender ? (
                  <TextInput
                    style={styles.input}
                    value={editableUser.gender}
                    onChangeText={(text) => setEditableUser({ ...editableUser, gender: text })}
                  />
                ) : (
                  <Text>{user?.gender}</Text>
                )}
                <TouchableOpacity onPress={() => toggleEdit("gender")}>
                  <Text style={styles.editButton}>{isEditing.gender ? "Cancel" : "Edit"}</Text>
                </TouchableOpacity>
              </View>

              {/* Show Save Changes Button Only If Changes Are Made */}
              {showSaveButton && (
                <TouchableOpacity style={styles.saveButton} onPress={saveChanges}>
                  <Text style={styles.buttonText}>Save Changes</Text>
                </TouchableOpacity>
              )}

              {/* Success Popup */}
              {saveSuccess && <Text style={styles.successText}>Profile updated successfully!</Text>}
            </View>


            {/* Logout Button */}
            <TouchableOpacity style={[styles.settingOption, { backgroundColor: theme.colors.logout }]} onPress={logout}>
              <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

// **Styles**
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  authPrompt: {
    marginTop: 30,
    alignItems: 'center',
  },
  authText: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  authButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  loggedInSection: {
    marginTop: 30,
    alignItems: 'center',
  },
  settingOption: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 10,
    width: 200,
    alignItems: 'center',
  },
  scrollContainer: {
    flexGrow: 1, // Ensures full height for pull-to-refresh
    alignItems: 'center',
    paddingVertical: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    width: "100%",
    backgroundColor: "#fff",
  },
  saveButton: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 15,
    alignItems: "center",
  },
  successText: {
    color: "green",
    fontSize: 16,
    marginTop: 10,
    textAlign: "center",
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    width: "100%",
  },
  
  editButton: {
    color: "#007bff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
});
