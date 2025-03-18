import React, { createContext, useState, ReactNode, useContext } from 'react';

// Define the authentication context type
interface AuthContextType {
  user: string | null;
  setUser: (user: string | null) => void;
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

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
