// AuthContext — Spring Boot JWT authentication
// No Supabase. Session is restored on browser refresh by reading the JWT from
// localStorage and calling GET /api/auth/me.

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '@/lib/types';
import { getCurrentUser, loginUser, registerUser, logoutUser, updateProfile } from '@/lib/api';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    role: 'STUDENT' | 'STAFF';
    department: string;
    phone: string;
  }) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount: attempt to restore session from stored JWT via GET /api/auth/me.
  // If the token is missing or expired (401), getCurrentUser returns null and
  // the token will have been cleared by the HTTP client.
  useEffect(() => {
    let mounted = true;
    (async () => {
      const u = await getCurrentUser();
      if (mounted) {
        setUser(u);
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  async function refreshUser(): Promise<void> {
    const u = await getCurrentUser();
    setUser(u);
  }

  const value: AuthContextValue = {
    user,
    loading,
    login: async (email, password) => {
      const u = await loginUser(email, password);
      setUser(u);
      return u;
    },
    register: async (data) => {
      const u = await registerUser(data);
      setUser(u);
      return u;
    },
    logout: async () => {
      await logoutUser();
      setUser(null);
    },
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
