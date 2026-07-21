"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { TOKEN_KEY, USER_KEY } from "@/lib/constants";
import { getApiErrorMessage, setApiAuthToken } from "@/lib/api-client";
import authService from "@/services/auth";
import type {
  LoginPayload,
  RegisterPayload,
  UpdateProfilePayload,
  User,
} from "@/types";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<User>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<User>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function persistSession(token: string, user: User) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  setApiAuthToken(token);
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  setApiAuthToken(null);
}

function readStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = readStoredUser();
    setApiAuthToken(storedToken);
    setToken(storedToken);
    setUser(storedUser);

    if (storedToken) {
      authService
        .getProfile()
        .then((profile) => {
          setUser(profile);
          localStorage.setItem(USER_KEY, JSON.stringify(profile));
        })
        .catch(() => {
          clearSession();
          setToken(null);
          setUser(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const response = await authService.login(payload);
    persistSession(response.access_token, response.user);
    setToken(response.access_token);
    setUser(response.user);
    return response.user;
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const response = await authService.register(payload);
    setUser(response.user);
    return response.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Clear local session even if API call fails
    } finally {
      clearSession();
      setToken(null);
      setUser(null);
      toast.success("You have been signed out");
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    const profile = await authService.getProfile();
    setUser(profile);
    localStorage.setItem(USER_KEY, JSON.stringify(profile));
    return profile;
  }, []);

  const updateProfile = useCallback(async (payload: UpdateProfilePayload) => {
    const profile = await authService.updateProfile(payload);
    setUser(profile);
    localStorage.setItem(USER_KEY, JSON.stringify(profile));
    return profile;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
      refreshProfile,
      updateProfile,
    }),
    [user, token, isLoading, login, register, logout, refreshProfile, updateProfile],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useAuthErrorMessage(error: unknown): string {
  return getApiErrorMessage(error);
}

export default AuthProvider;
