import { useState } from 'react';

interface AuthState {
  userId: string | null;
  isAuthenticated: boolean;
}

export function useAuth(): AuthState & { login: (id: string) => void; logout: () => void } {
  const [state, setState] = useState<AuthState>({ userId: null, isAuthenticated: false });

  const login = (id: string) => setState({ userId: id, isAuthenticated: true });
  const logout = () => setState({ userId: null, isAuthenticated: false });

  return { ...state, login, logout };
}
