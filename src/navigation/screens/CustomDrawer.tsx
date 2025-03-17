import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import LinearGradient from 'react-native-linear-gradient';

export function CustomDrawer(props: any) {
  const activeRouteIndex = props.state.index; // Get active screen index
  const activeRouteName = props.state.routeNames[activeRouteIndex]; // Get active screen name

  return (
    <View style={styles.drawerContainer}>
      {/* Vertical Gradient Background */}
      <LinearGradient
        colors={['#040014de', '#040014de', '#34005f']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderTopRightRadius: 20, borderBottomRightRadius: 20 }]}
      />

      {/* Custom Drawer Content */}
      <DrawerContentScrollView {...props} contentContainerStyle={styles.container}>
        <View style={styles.drawerItems}>
          {props.state.routes.map((route: any, index: number) => {
            const isSelected = route.name === activeRouteName; // Check if active

            return (
              <View key={route.key}>
                {/* Drawer Button */}
                <DrawerItem
                  label={route.name}
                  onPress={() => props.navigation.navigate(route.name)}
                  style={isSelected ? styles.selectedDrawerButton : undefined} // Apply selection style
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
            );
          })}
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
    flex: 1,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  drawerItems: {
    flex: 1,
    paddingTop: 10,
  },
  drawerItemText: {
    color: '#ffffff',
    fontSize: 16,
  },
  selectedDrawerButton: {
    backgroundColor: '#008cffbe', // Change background when selected
    width: '85%', // Reduce width so it's smaller
    alignSelf: 'flex-start', // Align it properly
    right: -10, // Shift slightly to the right
    borderRadius: 8, // Rounded corners
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
    position: 'absolute',
    right: 0,
    top: 20,
    width: 3,
    height: '96%',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
});
