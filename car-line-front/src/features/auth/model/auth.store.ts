import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, AuthState, AuthResponse } from "./types";

interface AuthStore extends AuthState {
  setAuth: (authData: AuthResponse) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...initialState,
      setAuth: (authData: AuthResponse) =>
        set({
          user: authData.user,
          accessToken: authData.accessToken,
          refreshToken: authData.refreshToken,
          isAuthenticated: true,
        }),
      setTokens: (accessToken: string, refreshToken: string) =>
        set({
          accessToken,
          refreshToken,
        }),
      setUser: (user: User) =>
        set({
          user,
        }),
      logout: () =>
        set({
          ...initialState,
        }),
    }),
    {
      name: "auth-storage",
    }
  )
);
