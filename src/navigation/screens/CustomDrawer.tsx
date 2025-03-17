import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import LinearGradient from 'react-native-linear-gradient';

export function CustomDrawer(props: any) {
  return (
    <View style={styles.drawerContainer}>
      {/* Vertical Gradient Background */}
      <LinearGradient
        colors={['#040014de', '#040014de', '#34005f']} // Gradient colors
        start={{ x: 0, y: 0 }} // Start from the top
        end={{ x: 0, y: 1 }} // End at the bottom
        style={[StyleSheet.absoluteFill, { borderTopRightRadius: 20, borderBottomRightRadius: 20 }]}
      />

      {/* Custom Drawer Content */}
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
                  colors={['#8400ff', '#0091ff']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
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

      {/* Right-side gradient */}
      <LinearGradient
        colors={['#8740c1', '#0c62a2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.rightGradient}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    flexDirection: 'row', // Makes the drawer and gradient sit side by side
  },
  container: {
    flex: 1, // Keeps the drawer flexible
    borderTopRightRadius: 20, // Optional: Add rounded corners
    borderBottomRightRadius: 20, // Optional: Add rounded corners
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
    height: 2,
    width: '80%',
    alignSelf: 'flex-start',
    marginVertical: 8,
    marginLeft: 20,
  },
  logoutButton: {
    paddingVertical: 12,
    backgroundColor: 'red',
    marginHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  rightGradient: {
    position: 'absolute', // Ensure it stays in place
    right: 0, // Stick to the right edge
    top: 20, // Align with the top
    width: 3, // Make it slightly wider for better visibility
    height: '96%', // Stretch from top to bottom
    borderTopRightRadius: 20, // Match the drawer's top corner
    borderBottomRightRadius: 20, // Match the drawer's bottom corner
  },
});

