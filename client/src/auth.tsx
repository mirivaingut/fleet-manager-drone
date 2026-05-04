import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import axios from './utils/axios';
import {
  getToken,
  setToken,
  getRefreshToken,
  setRefreshToken,
  clearTokens,
  getUser,
  setUser,
  StoredUser,
} from './utils/token';

interface AuthContextType {
  token: string | null;
  user: StoredUser | null;
  login: (accessToken: string, refreshToken: string, user: StoredUser) => void;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(() => getToken());
  const [user, setUserState] = useState<StoredUser | null>(() => getUser());

  const login = (accessToken: string, refreshToken: string, user: StoredUser) => {
    setToken(accessToken);
    setRefreshToken(refreshToken);
    setUser(user);
    setTokenState(accessToken);
    setUserState(user);
  };

  const logout = () => {
    clearTokens();
    setTokenState(null);
    setUserState(null);
  };

  const refreshToken = async () => {
    const refresh = getRefreshToken();
    if (!refresh) {
      logout();
      return;
    }
    try {
      const resp = await axios.post('/auth/refresh', { refreshToken: refresh });
      setToken(resp.data.accessToken);
      setTokenState(resp.data.accessToken);
    } catch (err) {
      logout();
    }
  };

  useEffect(() => {
    // Check token expiration on app load
    const checkToken = async () => {
      if (token) {
        try {
          // Decode token to check expiration
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.exp * 1000 < Date.now()) {
            await refreshToken();
          }
        } catch {
          logout();
        }
      }
    };
    checkToken();
  }, [token]);

  return <AuthContext.Provider value={{ token, user, login, logout, refreshToken }}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}