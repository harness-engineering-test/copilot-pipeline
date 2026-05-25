import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

const TOKEN_KEY = 'auth_token';

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  token: null,

  login: async (token: string) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    set({ isAuthenticated: true, token });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    set({ isAuthenticated: false, token: null });
  },

  restoreSession: async () => {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    if (token) {
      set({ isAuthenticated: true, token });
    }
  },
}));
