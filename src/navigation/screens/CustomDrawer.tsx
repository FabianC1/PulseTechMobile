import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import LinearGradient from 'react-native-linear-gradient';

export function CustomDrawer(props: any) {
  return (
    <View style={styles.drawerContainer}>
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
                  colors={['#8400ff', '#0091ff']} // Gradient colors
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
        colors={['#ff00aa', '#00ffdd']} // Gradient colors
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
    backgroundColor: '#040014de', // Actual drawer background color
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
    width: 3, // Width of the gradient strip
    height: '100%', // Make it cover the full height
  },
});

