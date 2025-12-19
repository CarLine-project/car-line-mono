import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, AuthResponse } from "./types";

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (authData: AuthResponse) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
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

// Селектор для isAuthenticated
export const useIsAuthenticated = () => {
  return useAuthStore((state) => !!state.accessToken);
};
