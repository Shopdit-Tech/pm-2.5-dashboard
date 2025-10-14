'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserCredentials } from '@/types/auth';
import { authenticateUser } from '@/data/users';

type AuthContextType = {
  user: User | null;
  login: (credentials: UserCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'pm25_auth_user';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials: UserCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const authUser = authenticateUser(credentials.username, credentials.password);
      
      if (authUser) {
        // Remove password before storing
        const { password, ...userWithoutPassword } = authUser;
        
        setUser(userWithoutPassword);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userWithoutPassword));
        
        return { success: true };
      } else {
        return { success: false, error: 'Invalid username or password' };
      }
    } catch (error) {
      return { success: false, error: 'An error occurred during login' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
