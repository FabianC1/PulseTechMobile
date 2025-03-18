import React, { createContext, useState, ReactNode, useContext } from 'react';

// Define authentication context type
interface AuthContextType {
  user: string | null;
  login: (email: string, password: string) => boolean;
  signup: (data: { username: string; email: string; password: string; role: string; medicalLicense?: string }) => boolean;
  logout: () => void;
}

// Create AuthContext
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to safely use AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthProvider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<string | null>(null);

  // Mock Login Function
  const login = (email: string, password: string): boolean => {
    if (email === 'test@example.com' && password === 'password123') {
      setUser(email);
      return true;
    }
    return false;
  };

  //**Signup Function**
  const signup = (data: { username: string; email: string; password: string; role: string; medicalLicense?: string }): boolean => {
    console.log('Signing up user:', data);
    setUser(data.email); // Simulate successful signup
    return true;
  };

  // Logout function
  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
