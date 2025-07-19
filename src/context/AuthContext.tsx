"use client";

import { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react'; // <-- 1. Import useCallback
import { jwtDecode } from 'jwt-decode';

interface User { id: string; username: string; }

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        const decodedUser: User = jwtDecode(storedToken);
        setUser(decodedUser);
        setToken(storedToken);
      }
    } catch (error) {
      console.error("Failed to decode token", error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Wrap login function with useCallback
  const login = useCallback((newToken: string) => {
    localStorage.setItem('token', newToken);
    const decodedUser: User = jwtDecode(newToken);
    setUser(decodedUser);
    setToken(newToken);
  }, []);

  // 3. Wrap logout function with useCallback
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// The useAuth hook remains the same
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}