"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { AuthResponse } from "@/interfaces";
import { authService } from "@/services/auth.service";

interface AuthContextValue {
  user: AuthResponse | null;
  token: string | null;
  rol: string | null;
  idCooperativa: number | null;
  nombreCooperativa: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<AuthResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function normalizeRole(role: string | null | undefined): string | null {
  if (!role) {
    return null;
  }

  const normalized = role.trim().toUpperCase();
  if (normalized === "ADMIN") {
    return "ADMINISTRADOR";
  }

  if (normalized === "ADMINISTRADOR" || normalized === "OPERADOR" || normalized === "SOCIO") {
    return normalized;
  }

  return null;
}

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
  const stored = getStoredAuthState();
  const [user, setUser] = useState<AuthResponse | null>(stored ? { ...stored, rol: normalizeRole(stored.rol) } : null);
  const [token, setToken] = useState<string | null>(stored?.token ?? null);
  const [rol, setRol] = useState<string | null>(normalizeRole(stored?.rol));
  const [idCooperativa, setIdCooperativa] = useState<number | null>(stored?.idCooperativa ?? null);
  const [nombreCooperativa, setNombreCooperativa] = useState<string | null>(stored?.nombreCooperativa ?? null);

  const login = async (username: string, password: string): Promise<AuthResponse> => {
    const data = await authService.login({ username, password });
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem("cooperativa_draft");
        window.localStorage.removeItem("selectedCooperativa");
        window.localStorage.removeItem("register_cooperativa");
      } catch {
        // ignore
      }
    }

    const storedAuth = {
      token: data.token ?? null,
      idUsuario: data.idUsuario ?? null,
      username: data.username ?? username,
      rol: normalizeRole(data.rol),
      idCooperativa: data.idCooperativa ?? null,
      nombreCooperativa: data.nombreCooperativa ?? null,
    } as AuthResponse;

    // guardar únicamente el estado de autenticación mínimo
    setUser(storedAuth);
    setToken(storedAuth.token ?? null);
    setRol(storedAuth.rol ?? null);
    setIdCooperativa(storedAuth.idCooperativa ?? null);
    setNombreCooperativa(storedAuth.nombreCooperativa ?? null);

    if (typeof window !== "undefined") {
      window.localStorage.setItem("coopfin_auth_state", JSON.stringify(storedAuth));
    }

    return storedAuth;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRol(null);
    setIdCooperativa(null);
    setNombreCooperativa(null);

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
      nombreCooperativa,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [user, token, rol, idCooperativa, nombreCooperativa]
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
