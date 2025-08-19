"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User, Tokens } from "@/types/auth";
import {
  login as loginAPI,
  logout as logoutAPI,
  getProfile,
  refreshAccessToken,
} from "@/app/api/auth";

interface AuthContextType {
  user: User | null;
  tokens: Tokens | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<Tokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!tokens;

  // Check for existing tokens on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const accessToken = localStorage.getItem("token");
        const refreshToken = localStorage.getItem("refresh");

        if (accessToken && refreshToken) {
          // Try to get user profile with existing token
          try {
            const userProfile = await getProfile();
            setUser(userProfile);
            setTokens({ access: accessToken, refresh: refreshToken });
          } catch (error) {
            // Token might be expired, try to refresh
            try {
              const newAccessToken = await refreshAccessToken(refreshToken);
              localStorage.setItem("token", newAccessToken.access);
              const userProfile = await getProfile();
              setUser(userProfile);
              setTokens({
                access: newAccessToken.access,
                refresh: refreshToken,
              });
            } catch (refreshError) {
              // Refresh failed, clear everything
              localStorage.removeItem("token");
              localStorage.removeItem("refresh");
            }
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await loginAPI({ email, password });

      // Store tokens
      localStorage.setItem("token", response.tokens.access);
      localStorage.setItem("refresh", response.tokens.refresh);

      // Update state
      setUser(response.user);
      setTokens(response.tokens);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (tokens?.refresh) {
        await logoutAPI(tokens.refresh);
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Continue with logout even if API call fails
    } finally {
      // Always clear everything regardless of API call success/failure
      localStorage.removeItem("token");
      localStorage.removeItem("refresh");
      setUser(null);
      setTokens(null);
    }
  };

  const refreshToken = async () => {
    try {
      if (tokens?.refresh) {
        const newAccessToken = await refreshAccessToken(tokens.refresh);
        localStorage.setItem("token", newAccessToken.access);
        setTokens((prev) =>
          prev ? { ...prev, access: newAccessToken.access } : null
        );
      }
    } catch (error) {
      console.error("Token refresh error:", error);
      // Refresh failed, logout user
      await logout();
    }
  };

  const value: AuthContextType = {
    user,
    tokens,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
