'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getCurrentUser, loginUser, logoutUser, registerUser } from '@/lib/api';

type AuthUser = { id: string; username?: string; email: string };

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    getCurrentUser()
      .then((response) => setUser(response.user as AuthUser))
      .catch(() => {
        localStorage.removeItem('token');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const response = await loginUser({ email, password });
    localStorage.setItem('token', response.token);
    setUser(response.user);
  };

  const register = async (username: string, email: string, password: string) => {
    const response = await registerUser({ username, email, password });
    localStorage.setItem('token', response.token);
    setUser(response.user);
  };

  const logout = async () => {
    try {
      await logoutUser();
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
