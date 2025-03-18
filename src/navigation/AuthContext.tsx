import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define user type
interface User {
  username: string;
  email: string;
  role: 'patient' | 'doctor';
  [key: string]: any; // Allow additional fields
}

// Define context type
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signup: (userData: any) => Promise<boolean>;
}

// Create AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook for using AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthProvider Component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Load user from AsyncStorage on app startup
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error loading user from storage:', error);
      }
    };
    loadUser();
  }, []);

  // **Login Function**
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("http://192.168.0.84:3000/login", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.message === 'Login successful') {
        const { password, ...userData } = data.user; // Exclude password
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        return true;
      } else {
        Alert.alert('Login Failed', 'Invalid email or password.');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
      return false;
    }
  };

  // **Signup Function**
  const signup = async (userData: any): Promise<boolean> => {
    try {
      const response = await fetch("http://192.168.0.84:3000/register", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.message === 'User registered successfully') {
        Alert.alert('Signup Successful', 'You can now log in.');
        return true;
      } else {
        Alert.alert('Signup Failed', data.message);
        return false;
      }
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
      return false;
    }
  };

  // **Logout Function**
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
};
