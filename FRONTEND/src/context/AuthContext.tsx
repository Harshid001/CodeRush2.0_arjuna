'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { fetchUserProfile, updateUserProfileBackend, walletAuthBackend } from '@/lib/api';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'developer' | 'provider' | 'admin';
  walletAddress?: string;
  avatarUrl?: string;
  googleId?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (user: UserProfile, token: string) => void;
  loginWithWallet: (walletAddress: string, chainType?: string) => Promise<UserProfile | null>;
  logout: () => void;
  updateProfile: (updates: { name?: string; walletAddress?: string; avatarUrl?: string }) => Promise<boolean>;
  refetchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize from localStorage and sync profile from backend
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('auth_token') || localStorage.getItem('token');
      const storedUserRaw = localStorage.getItem('user');

      if (storedToken) {
        setToken(storedToken);
      }

      if (storedUserRaw) {
        try {
          const parsedUser = JSON.parse(storedUserRaw);
          setUser(parsedUser);
        } catch {
          // ignore parsing error
        }
      }
    } catch {
      // ignore SSR or localStorage access error
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch backend profile when token is available
  const refetchProfile = useCallback(async () => {
    const currentToken = localStorage.getItem('auth_token') || localStorage.getItem('token');
    if (!currentToken) return;

    try {
      const backendUser = await fetchUserProfile();
      if (backendUser) {
        const formattedUser: UserProfile = {
          id: backendUser._id || backendUser.id || 'usr_demo',
          email: backendUser.email || '',
          name: backendUser.name || 'Developer',
          role: backendUser.role || 'developer',
          walletAddress: backendUser.walletAddress || '',
          avatarUrl: backendUser.avatarUrl || '',
          googleId: backendUser.googleId || backendUser.googleSub,
          createdAt: backendUser.createdAt,
        };
        setUser(formattedUser);
        localStorage.setItem('user', JSON.stringify(formattedUser));
      }
    } catch (err) {
      console.warn('[AuthContext] Failed to fetch updated profile:', err);
    }
  }, []);

  useEffect(() => {
    if (token) {
      refetchProfile();
    }
  }, [token, refetchProfile]);

  const login = (userData: UserProfile, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    try {
      localStorage.setItem('auth_token', authToken);
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (e) {
      console.warn('[AuthContext] Failed to save to localStorage:', e);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (e) {
      console.warn('[AuthContext] Failed to clear localStorage:', e);
    }
  };

  const updateProfile = async (updates: { name?: string; walletAddress?: string; avatarUrl?: string }): Promise<boolean> => {
    try {
      // 1. Update backend if logged in with real token
      const updatedBackend = await updateUserProfileBackend(updates);
      
      // 2. Fallback or update local state
      const newName = updates.name !== undefined ? updates.name : (user?.name || 'Developer');
      const newWallet = updates.walletAddress !== undefined ? updates.walletAddress : (user?.walletAddress || '');
      const newAvatar = updates.avatarUrl !== undefined ? updates.avatarUrl : (user?.avatarUrl || '');

      const updatedUser: UserProfile = {
        id: user?.id || updatedBackend?._id || updatedBackend?.id || 'usr_demo',
        email: user?.email || updatedBackend?.email || 'user@example.com',
        name: updatedBackend?.name || newName,
        role: user?.role || updatedBackend?.role || 'developer',
        walletAddress: updatedBackend?.walletAddress || newWallet,
        avatarUrl: updatedBackend?.avatarUrl || newAvatar,
        googleId: user?.googleId || updatedBackend?.googleId,
        createdAt: user?.createdAt || updatedBackend?.createdAt,
      };

      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return true;
    } catch (err) {
      console.warn('[AuthContext] updateProfile error:', err);
      // Still update locally for smooth UI experience
      if (user) {
        const localUpdated: UserProfile = {
          ...user,
          name: updates.name ?? user.name,
          walletAddress: updates.walletAddress ?? user.walletAddress,
          avatarUrl: updates.avatarUrl ?? user.avatarUrl,
        };
        setUser(localUpdated);
        localStorage.setItem('user', JSON.stringify(localUpdated));
      }
      return true;
    }
  };

  const loginWithWallet = async (walletAddress: string, chainType: string = 'algorand'): Promise<UserProfile | null> => {
    try {
      const res = await walletAuthBackend(walletAddress, chainType);
      const bUser = res.user;
      const formattedUser: UserProfile = {
        id: bUser._id || bUser.id || 'usr_wallet',
        email: bUser.email || '',
        name: bUser.name || `Wallet (${walletAddress.slice(0, 6)}...)`,
        role: bUser.role || 'developer',
        walletAddress: bUser.walletAddress || walletAddress,
        avatarUrl: bUser.avatarUrl || '',
      };
      login(formattedUser, res.token);
      return formattedUser;
    } catch (err) {
      console.warn('[AuthContext] loginWithWallet error:', err);
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isLoggedIn: !!user || !!token,
        login,
        loginWithWallet,
        logout,
        updateProfile,
        refetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
