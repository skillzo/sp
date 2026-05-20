import { create } from "zustand";

const FIXED_RATE = 1400;

export type Transaction = {
  id: string;
  description: string;
  amount: number;
  date: string;
  status: string;
  icon: string;
  type: "deposit" | "withdraw" | "transfer" | "game";
};

export type BankAccount = {
  bankName: string;
  accountNumber: string;
  accountName: string;
};

export type Wallet = { address: string; network: string };

interface UserState {
  balance: number;
  gameBalance: number;
  usdtBalance: number;
  advertiseBalance: number;
  referralBalance: number;
  isVIP: boolean;
  vipLevel: 0 | 1 | 2 | 3;
  vipProgress: number;
  isAgeVerified: boolean;
  hasPin: boolean;
  currencyPreference: "ngn" | "usd";
  theme: "light" | "dark";
  exchangeRate: number;
  userBankAccounts: BankAccount[];
  userWallets: Wallet[];
  defaultBank: BankAccount | null;
  defaultWallet: Wallet | null;
  transactions: Transaction[];
  setBalance: (balance: number) => void;
  setGameBalance: (balance: number) => void;
  setUsdtBalance: (balance: number) => void;
  setAdvertiseBalance: (balance: number) => void;
  setReferralBalance: (balance: number) => void;
  setIsVIP: (isVIP: boolean) => void;
  setVipLevel: (level: 0 | 1 | 2 | 3) => void;
  setVipProgress: (progress: number) => void;
  setIsAgeVerified: (verified: boolean) => void;
  setHasPin: (hasPin: boolean) => void;
  setCurrencyPreference: (pref: "ngn" | "usd") => void;
  setTheme: (theme: "light" | "dark") => void;
  updateBalance: (amount: number) => void;
  updateGameBalance: (amount: number) => void;
  updateUsdtBalance: (amount: number) => void;
  updateAdvertiseBalance: (amount: number) => void;
  updateReferralBalance: (amount: number) => void;
  addTransaction: (transaction: Omit<Transaction, "id" | "date">) => void;
  formatCurrency: (amount: number, forceUSD?: boolean) => string;
  formatUSDT: (amount: number) => string;
  convertAmount: (amount: number, from: "ngn" | "usd") => number;
  addBankAccount: (bank: BankAccount) => void;
  addWallet: (wallet: Wallet) => void;
  setDefaultBank: (bank: BankAccount | null) => void;
  setDefaultWallet: (wallet: Wallet | null) => void;
  initUserEffects: () => () => void;
}

function applyTheme(theme: "light" | "dark") {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark-theme");
  } else {
    root.classList.remove("dark-theme");
  }
}

export const useUserStore = create<UserState>((set, get) => ({
  balance: 12500,
  gameBalance: 5000,
  usdtBalance: 25.5,
  advertiseBalance: 0,
  referralBalance: 3500,
  isVIP: false,
  vipLevel: 0,
  vipProgress: 0,
  isAgeVerified: false,
  hasPin: false,
  currencyPreference: "usd",
  theme: "dark",
  exchangeRate: 1500,
  userBankAccounts: [],
  userWallets: [],
  defaultBank: null,
  defaultWallet: null,
  transactions: [],

  setBalance: (balance) => set({ balance }),
  setGameBalance: (gameBalance) => set({ gameBalance }),
  setUsdtBalance: (usdtBalance) => set({ usdtBalance }),
  setAdvertiseBalance: (advertiseBalance) => set({ advertiseBalance }),
  setReferralBalance: (referralBalance) => set({ referralBalance }),
  setIsVIP: (isVIP) => set({ isVIP }),
  setVipLevel: (vipLevel) => set({ vipLevel, vipProgress: 0 }),
  setVipProgress: (vipProgress) => set({ vipProgress }),
  setIsAgeVerified: (isAgeVerified) => set({ isAgeVerified }),
  setHasPin: (hasPin) => set({ hasPin }),

  setCurrencyPreference: (pref) => {
    const { currencyPreference, balance } = get();
    const previousPref = currencyPreference;
    set({ currencyPreference: pref });
    localStorage.setItem("currencyPreference", pref);
    if (previousPref === "usd" && pref === "ngn") {
      set({ balance: balance * FIXED_RATE });
    } else if (previousPref === "ngn" && pref === "usd") {
      set({ balance: balance / FIXED_RATE });
    }
  },

  setTheme: (theme) => {
    set({ theme });
    localStorage.setItem("theme", theme);
    applyTheme(theme);
  },

  updateBalance: (amount) => set((s) => ({ balance: s.balance + amount })),
  updateGameBalance: (amount) =>
    set((s) => ({ gameBalance: s.gameBalance + amount })),
  updateUsdtBalance: (amount) =>
    set((s) => ({ usdtBalance: s.usdtBalance + amount })),
  updateAdvertiseBalance: (amount) =>
    set((s) => ({ advertiseBalance: s.advertiseBalance + amount })),
  updateReferralBalance: (amount) =>
    set((s) => ({ referralBalance: s.referralBalance + amount })),

  convertAmount: (amount, from) => {
    const { exchangeRate } = get();
    return from === "ngn" ? amount / exchangeRate : amount * exchangeRate;
  },

  formatCurrency: (amount, forceUSD = false) => {
    const roundedAmount = Math.floor(amount);
    const { currencyPreference } = get();
    if (currencyPreference === "usd" || forceUSD) {
      return `$${roundedAmount.toLocaleString("en-US")}`;
    }
    return `₦${roundedAmount.toLocaleString("en-US")}`;
  },

  formatUSDT: (amount) => {
    const roundedAmount = Math.floor(amount);
    return `$${roundedAmount.toLocaleString("en-US")}`;
  },

  addBankAccount: (bank) =>
    set((s) => ({ userBankAccounts: [...s.userBankAccounts, bank] })),
  addWallet: (wallet) =>
    set((s) => ({ userWallets: [...s.userWallets, wallet] })),
  setDefaultBank: (defaultBank) => set({ defaultBank }),
  setDefaultWallet: (defaultWallet) => set({ defaultWallet }),

  addTransaction: (transaction) => {
    const now = new Date();
    const dateString =
      now.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
      ", " +
      now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    const newTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      ...transaction,
      date: dateString,
    };
    set((s) => ({ transactions: [newTransaction, ...s.transactions] }));
  },

  initUserEffects: () => {
    const root = document.documentElement;
    root.classList.add("dark");
    root.classList.add("dark-theme");
    root.classList.remove("light-theme");
    localStorage.setItem("theme", "dark");

    const savedCurrency = localStorage.getItem("currencyPreference") as
      | "ngn"
      | "usd"
      | null;
    if (savedCurrency) {
      set({ currencyPreference: savedCurrency });
    }

    const updateRate = () => {
      const fluctuation = Math.random() * 50 - 25;
      set({ exchangeRate: Math.floor(1500 + fluctuation) });
    };
    updateRate();
    const interval = setInterval(updateRate, 30000);

    return () => clearInterval(interval);
  },
}));

export function useUser() {
  return useUserStore();
}
