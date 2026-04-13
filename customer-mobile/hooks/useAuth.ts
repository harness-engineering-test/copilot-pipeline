import { useState, useEffect } from 'react';

interface AuthState {
  userId: string | null;
  token: string | null;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    userId: null,
    token: null,
    isAuthenticated: false,
  });

  useEffect(() => {
    // セッション復元ロジック（簡略化）
    const storedToken = null; // AsyncStorage.getItem('token') の代わり
    if (storedToken) {
      setAuthState({ userId: 'user-123', token: storedToken, isAuthenticated: true });
    }
  }, []);

  const signOut = () => {
    setAuthState({ userId: null, token: null, isAuthenticated: false });
  };

  return { ...authState, signOut };
}
