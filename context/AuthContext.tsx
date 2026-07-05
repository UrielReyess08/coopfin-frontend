"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AuthResponse } from "@/interfaces";
import { authService } from "@/services/auth.service";

interface AuthContextValue {
  user: AuthResponse | null;
  token: string | null;
  rol: string | null;
  idCooperativa: number | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<AuthResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getStoredAuthState() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem("coopfin_auth_state");
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthResponse;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [rol, setRol] = useState<string | null>(null);
  const [idCooperativa, setIdCooperativa] = useState<number | null>(null);

  useEffect(() => {
    const stored = getStoredAuthState();
    if (!stored) {
      return;
    }

    setUser(stored);
    setToken(stored.token ?? null);
    setRol(stored.rol ?? null);
    setIdCooperativa(stored.idCooperativa ?? null);
  }, []);

  const login = async (username: string, password: string): Promise<AuthResponse> => {
    const data = await authService.login({ username, password });
    const nextUser = {
      ...data,
      username: data.username ?? username,
    };

    setUser(nextUser);
    setToken(nextUser.token ?? null);
    setRol(nextUser.rol ?? null);
    setIdCooperativa(nextUser.idCooperativa ?? null);

    if (typeof window !== "undefined") {
      window.localStorage.setItem("coopfin_auth_state", JSON.stringify(nextUser));
      if (nextUser.token) {
        window.localStorage.setItem("auth_token", nextUser.token);
      }
    }
    return nextUser
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRol(null);
    setIdCooperativa(null);

    if (typeof window !== "undefined") {
      window.localStorage.removeItem("coopfin_auth_state");
      window.localStorage.removeItem("auth_token");
    }
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      rol,
      idCooperativa,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [user, token, rol, idCooperativa]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}
