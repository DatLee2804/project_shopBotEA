'use client';

import { create } from 'zustand';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setTokens: (accessToken: string, refreshToken?: string) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Try to load initial state from localStorage on client side
  let initialUser: User | null = null;
  let initialAccessToken: string | null = null;
  let initialRefreshToken: string | null = null;

  if (typeof window !== 'undefined') {
    try {
      const storedUser = localStorage.getItem('oceanea_user');
      const storedAccessToken = localStorage.getItem('oceanea_access_token');
      const storedRefreshToken = localStorage.getItem('oceanea_refresh_token');

      if (storedUser) initialUser = JSON.parse(storedUser);
      if (storedAccessToken) initialAccessToken = storedAccessToken;
      if (storedRefreshToken) initialRefreshToken = storedRefreshToken;
    } catch (e) {
      console.error('Failed to load auth from localStorage', e);
    }
  }

  return {
    user: initialUser,
    accessToken: initialAccessToken,
    refreshToken: initialRefreshToken,
    isAuthenticated: Boolean(initialAccessToken && initialUser),

    setAuth: (user, accessToken, refreshToken) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('oceanea_user', JSON.stringify(user));
        localStorage.setItem('oceanea_access_token', accessToken);
        localStorage.setItem('oceanea_refresh_token', refreshToken);
      }
      set({
        user,
        accessToken,
        refreshToken,
        isAuthenticated: true,
      });
    },

    setTokens: (accessToken, refreshToken) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('oceanea_access_token', accessToken);
        if (refreshToken) {
          localStorage.setItem('oceanea_refresh_token', refreshToken);
        }
      }
      set((state) => ({
        accessToken,
        refreshToken: refreshToken || state.refreshToken,
      }));
    },

    updateUser: (updatedFields) => {
      set((state) => {
        if (!state.user) return state;
        const newUser = { ...state.user, ...updatedFields };
        if (typeof window !== 'undefined') {
          localStorage.setItem('oceanea_user', JSON.stringify(newUser));
        }
        return { user: newUser };
      });
    },

    logout: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('oceanea_user');
        localStorage.removeItem('oceanea_access_token');
        localStorage.removeItem('oceanea_refresh_token');
      }
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
      });
    },
  };
});
