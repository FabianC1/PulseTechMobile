import React, { createContext, useState, ReactNode, useContext } from 'react';

// Define the authentication context type
interface AuthContextType {
  user: string | null;
  login: (email: string, password: string) => boolean; // Login function
  logout: () => void;
}

// Create the AuthContext with an initial value
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to safely use the context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthProvider component to wrap the app
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<string | null>(null);

  // Mock login function (Replace this with real authentication logic later)
  const login = (email: string, password: string): boolean => {
    if (email === 'test@example.com' && password === 'password123') {
      setUser(email); // Simulate login success
      return true;
    }
    return false; // Login failed
  };

  // Logout function
  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
