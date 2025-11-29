import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { mockAuth } from '../services/mockBackend';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password?: string) => Promise<void>;
  register: (username: string, email: string, password?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const u = await mockAuth.getCurrentUser();
        setUser(u);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (username: string, password?: string) => {
    setIsLoading(true);
    try {
      const u = await mockAuth.login(username, password);
      setUser(u);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password?: string) => {
    setIsLoading(true);
    try {
      const u = await mockAuth.register(username, email, password);
      setUser(u);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    mockAuth.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    const u = await mockAuth.getCurrentUser();
    setUser(u);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};