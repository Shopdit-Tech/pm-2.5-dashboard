'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserCredentials } from '@/types/auth';
import { authService } from '@/services/authService';

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
    const storedData = localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        // Verify token is still valid by checking if it exists
        if (parsedData.access_token && parsedData.user) {
          setUser(parsedData.user);
        } else {
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      } catch (error) {
        console.error('Failed to parse stored auth data:', error);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials: UserCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      // Call real API - username field is used for email
      const response = await authService.login({
        email: credentials.username, // Use username field as email
        password: credentials.password,
      });
      
      // Map API user to app User type
      const appUser: User = {
        id: response.user.id,
        username: response.user.email, // Use email as username for now
        email: response.user.email,
        role: response.user.app_metadata.role,
      };
      
      // Store both user and token
      const authData = {
        user: appUser,
        access_token: response.access_token,
        refresh_token: response.refresh_token,
      };
      
      setUser(appUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
      
      console.log('✅ User logged in successfully:', appUser.email);
      return { success: true };
    } catch (error: any) {
      console.error('❌ Login error:', error);
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    console.log('👋 User logged out');
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
