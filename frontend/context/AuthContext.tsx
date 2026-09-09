"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// User type definition
export interface User {
  id: string;
  name: string;
  email: string;
}

// AuthContext properties
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api") + "/auth";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is logged in on mount (by sending the cookie)
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const res = await fetch(`${API_URL}/me`, {
          method: "GET",
          credentials: "include", // Crucial: allows credentials (cookies) in cross-origin requests
        });
        const data = await res.json();
        
        if (res.ok && data.success) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.warn("User session check failed (unauthenticated or server unreachable):", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUserSession();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Invalid credentials.");
        return false;
      }

      setUser(data.user);
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to connect to authentication server.";
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Failed to register account.");
        return false;
      }

      setUser(data.user);
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to connect to authentication server.";
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await fetch(`${API_URL}/logout`, {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
    } catch (err) {
      console.error("Error during logout:", err);
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
