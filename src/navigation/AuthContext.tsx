import React, { createContext, useState, ReactNode, useContext } from 'react';

// Define authentication context type
interface AuthContextType {
  user: string | null;
  login: (email: string, password: string) => Promise<boolean>; // Make it async
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

// **AuthProvider component to wrap the app**
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<string | null>(null);

  // **Mock Login Function (Replace with real API call later)**
  const login = async (email: string, password: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (email === 'test@example.com' && password === 'password123') {
          setUser(email); // Simulate setting logged-in user
          resolve(true); // Return true to indicate success
        } else {
          resolve(false); // Return false for failed login
        }
      }, 1000); // Simulate network delay
    });
  };

  // **Logout Function**
  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
  