import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import LinearGradient from 'react-native-linear-gradient';

export function CustomDrawer(props: any) {
  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.container}>
      <View style={styles.drawerItems}>
        {props.state.routes.map((route: any, index: number) => (
          <View key={route.key}>
            {/* Drawer Button */}
            <DrawerItem
              label={route.name}
              onPress={() => props.navigation.navigate(route.name)}
              labelStyle={styles.drawerItemText}
            />

            {/* Horizontal Separator (Left to Right Gradient) */}
            {index < props.state.routes.length - 1 && (
              <LinearGradient
                colors={['#8400ff', '#0091ff']} // White to Blue Gradient
                start={{ x: 0, y: 0 }} // Start from the left
                end={{ x: 1, y: 0 }} // End at the right
                style={styles.separator}
              />
            )}
          </View>
        ))}
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={() => console.log('Logging out...')}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#002855', // Dark blue background
  },
  drawerItems: {
    flex: 1,
    paddingTop: 10,
  },
  drawerItemText: {
    color: '#ffffff',
    fontSize: 16,
  },
  separator: {
    height: 2, // Thickness of the separator
    width: '80%', // Keeps it aligned with buttons
    alignSelf: 'flex-start', // Aligns to the left
    marginVertical: 8, // Space between items
    marginLeft: 20, // Moves it left to match text alignment
  },
  logoutButton: {
    paddingVertical: 12,
    backgroundColor: 'red',
    marginHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom:10,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
