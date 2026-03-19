import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

// Base API host (pulled from Expo env). Fallback keeps dev usable if .env is missing.
export const API_URL = process.env.EXPO_PUBLIC_API_URL || "https://nurtura-backend-zgz8.onrender.com";

// User type for context
export type User = {
  username: string;
  role: string;
  access_token: string;
  refresh_token: string;
};

// Login payload type
export type LoginPayload = {
  identifier: string; // email or username
  password: string;
  role?: string;
};

// Registration payload type
export type RegisterPayload = {
  first_name: string;
  middle_name?: string;
  last_name: string;
  username: string;
  email: string;
  role: string;
  sex: string;
  birthdate: string;
  phone_number?: string;
  password: string;
};

// Context value type
type AuthContextValue = {
  user: User | null;
  authChecking: boolean;
  loading: boolean;
  error: string | null;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<unknown>;
  refreshAccessToken: () => Promise<string | null>;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user from SecureStore on app start
  const checkAuth = async () => {
    setAuthChecking(true);
    setLoading(true);
    try {
      const username = await SecureStore.getItemAsync("username");
      const role = await SecureStore.getItemAsync("role");
      const access_token = await SecureStore.getItemAsync("access_token");
      const refresh_token = await SecureStore.getItemAsync("refresh_token");

      if (username && role && access_token && refresh_token) {
        setUser({ username, role, access_token, refresh_token });
      } else {
        setUser(null);
      }
    } catch (err) {
      console.log("Failed to load user from storage", err);
      setUser(null);
    } finally {
      setLoading(false);
      setAuthChecking(false);
    }
  };

  // Login function
  const login = async ({ identifier, password }: LoginPayload) => {
    setLoading(true);
    setError(null);

    try {
      const body =
        `username=${encodeURIComponent(identifier.trim())}` +
        `&password=${encodeURIComponent(password)}` +
        `&grant_type=password`;

      const response = await fetch(`${API_URL}/api/v1/auth/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: body,
      });

      const data = await response.json();

      if (!response.ok) {
        if (Array.isArray(data.detail)) {
          throw new Error(data.detail.map((d: any) => d.msg).join(", "));
        } else {
          throw new Error(data.detail || "Login failed");
        }
      }

      // Store tokens securely
      await SecureStore.setItemAsync("access_token", data.access_token);
      await SecureStore.setItemAsync("refresh_token", data.refresh_token);
      await SecureStore.setItemAsync("username", data.username);
      await SecureStore.setItemAsync("role", data.role);

      const loggedInUser: User = {
        username: data.username,
        role: data.role,
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      };

      setUser(loggedInUser);
      return loggedInUser;

    } catch (err) {
      console.log("LOGIN ERROR:", err);
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Registration function
  const register = async (payload: RegisterPayload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/v1/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        if (Array.isArray(data.detail)) {
          throw new Error(data.detail.map((d: any) => d.msg).join(", "));
        }
        throw new Error(data.detail || data.message || "Registration failed");
      }

      return data;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Refresh access token using refresh token
  const refreshAccessToken = async (): Promise<string | null> => {
    try {
      const refresh_token = await SecureStore.getItemAsync("refresh_token");
      if (!refresh_token) {
        return null;
      }

      // Try explicit refresh endpoint first.
      let response = await fetch(`${API_URL}/api/v1/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ refresh_token }),
      });

      // Fallback to OAuth token endpoint with refresh grant.
      if (!response.ok) {
        const body =
          `grant_type=refresh_token` +
          `&refresh_token=${encodeURIComponent(refresh_token)}`;

        response = await fetch(`${API_URL}/api/v1/auth/token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
          },
          body,
        });
      }

      const data = await response.json();
      if (!response.ok || !data?.access_token) {
        return null;
      }

      await SecureStore.setItemAsync("access_token", data.access_token);
      const nextRefreshToken = data.refresh_token || refresh_token;
      await SecureStore.setItemAsync("refresh_token", nextRefreshToken);

      setUser((prev) => {
        if (!prev) {
          return prev;
        }

        return {
          ...prev,
          access_token: data.access_token,
          refresh_token: nextRefreshToken,
        };
      });

      return data.access_token;
    } catch (err) {
      console.log("REFRESH TOKEN ERROR:", err);
      return null;
    }
  };

  // Logout function
    const logout = async () => {
    setLoading(true);
    setError(null);

    try {
        const refresh_token = await SecureStore.getItemAsync("refresh_token");

        if (refresh_token) {
        await fetch(`${API_URL}/api/v1/auth/logout`, {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            },
            body: JSON.stringify({ refresh_token }),
        });
        }

        // Clear stored credentials
        await SecureStore.deleteItemAsync("access_token");
        await SecureStore.deleteItemAsync("refresh_token");
        await SecureStore.deleteItemAsync("username");
        await SecureStore.deleteItemAsync("role");

        // Reset user state
        setUser(null);
    } catch (err) {
        console.log("LOGOUT ERROR:", err);
        setError((err as Error).message);
    } finally {
        setLoading(false);
    }
    };

  // Memoize context value
  const value = useMemo<AuthContextValue>(
    () => ({ user, authChecking, loading, error, login, register, refreshAccessToken, checkAuth, logout }),
    [user, authChecking, loading, error, login, register, refreshAccessToken, checkAuth, logout]
  );

  // Rehydrate user on app start
  useEffect(() => {
    checkAuth();
  }, []);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to access AuthContext
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}