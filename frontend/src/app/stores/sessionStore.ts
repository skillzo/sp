import { create } from "zustand";
import {
  authLogin,
  authMe,
  authRegister,
  type AuthUser,
} from "../api/endpoints/authApi";
import { useUserStore } from "./userStore";

const STORAGE_KEY = "sp_access_token";

function applyBalances(user: AuthUser): void {
  const { setGameBalance, setBalance } = useUserStore.getState();
  setGameBalance(Math.floor(Number(user.gamingBalance)));
  setBalance(Math.floor(Number(user.mainBalance)));
}

interface SessionState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  hydrate: () => void;
  clearInvalidSession: () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isReady: false,

  hydrate: () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    set({
      token: stored,
      isReady: true,
    });
  },

  clearInvalidSession: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ token: null, user: null, isAuthenticated: false });
  },

  refreshUser: async () => {
    const { token } = get();
    if (!token) return;
    const { user: next } = await authMe(token);
    set({ user: next, isAuthenticated: true });
    applyBalances(next);
  },

  login: async (email, password) => {
    const res = await authLogin(email, password);
    console.log("login", res);
    localStorage.setItem(STORAGE_KEY, res.token);
    set({
      token: res.token,
      user: res.user,
      isAuthenticated: true,
    });
    applyBalances(res.user);
  },

  register: async (email, password) => {
    const res = await authRegister(email, password);
    localStorage.setItem(STORAGE_KEY, res.token);
    set({
      token: res.token,
      user: res.user,
      isAuthenticated: true,
    });
    applyBalances(res.user);
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ token: null, user: null, isAuthenticated: false });
  },
}));

export function useSession() {
  return useSessionStore();
}
