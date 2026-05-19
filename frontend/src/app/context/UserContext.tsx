import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface UserContextType {
  balance: number;
  gameBalance: number;
  usdtBalance: number;
  advertiseBalance: number;
  referralBalance: number;
  isVIP: boolean;
  vipLevel: 0 | 1 | 2 | 3;
  vipProgress: number; // Progress to next level (0-100)
  isAgeVerified: boolean;
  hasPin: boolean;
  currencyPreference: 'ngn' | 'usd';
  theme: 'light' | 'dark';
  exchangeRate: number;
  userBankAccounts: Array<{ bankName: string; accountNumber: string; accountName: string }>;
  userWallets: Array<{ address: string; network: string }>;
  defaultBank: { bankName: string; accountNumber: string; accountName: string } | null;
  defaultWallet: { address: string; network: string } | null;
  transactions: Array<{
    id: string;
    description: string;
    amount: number;
    date: string;
    status: string;
    icon: string;
    type: 'deposit' | 'withdraw' | 'transfer' | 'game';
  }>;
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
  setCurrencyPreference: (pref: 'ngn' | 'usd') => void;
  setTheme: (theme: 'light' | 'dark') => void;
  updateBalance: (amount: number) => void;
  updateGameBalance: (amount: number) => void;
  updateUsdtBalance: (amount: number) => void;
  updateAdvertiseBalance: (amount: number) => void;
  updateReferralBalance: (amount: number) => void;
  addTransaction: (transaction: {
    description: string;
    amount: number;
    status: string;
    icon: string;
    type: 'deposit' | 'withdraw' | 'transfer' | 'game';
  }) => void;
  formatCurrency: (amount: number, forceUSD?: boolean) => string;
  formatUSDT: (amount: number) => string;
  convertAmount: (amount: number, from: 'ngn' | 'usd') => number;
  addBankAccount: (bank: { bankName: string; accountNumber: string; accountName: string }) => void;
  addWallet: (wallet: { address: string; network: string }) => void;
  setDefaultBank: (bank: { bankName: string; accountNumber: string; accountName: string } | null) => void;
  setDefaultWallet: (wallet: { address: string; network: string } | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [balance, setBalanceState] = useState(12500);
  const [gameBalance, setGameBalance] = useState(5000);
  const [usdtBalance, setUsdtBalance] = useState(25.50);
  const [advertiseBalance, setAdvertiseBalance] = useState(0);
  const [referralBalance, setReferralBalance] = useState(3500);
  const [isVIP, setIsVIP] = useState(false);
  const [vipLevel, setVipLevelState] = useState<0 | 1 | 2 | 3>(0);
  const [vipProgress, setVipProgress] = useState(0);
  const [isAgeVerified, setIsAgeVerified] = useState(false);
  const [hasPin, setHasPin] = useState(false);
  const [currencyPreference, setCurrencyPreferenceState] = useState<'ngn' | 'usd'>('usd');
  const [theme, setThemeState] = useState<'light' | 'dark'>('dark'); // Force dark mode permanently
  const [exchangeRate, setExchangeRate] = useState(1500);

  // Fixed conversion rate
  const FIXED_RATE = 1400;

  // Update VIP level and reset progress
  const setVipLevel = (level: 0 | 1 | 2 | 3) => {
    setVipLevelState(level);
    setVipProgress(0); // Reset progress when leveling up
  };

  // Force dark mode on mount
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('dark');
    root.classList.add('dark-theme');
    localStorage.setItem('theme', 'dark');
    
    // Remove light theme if it exists
    root.classList.remove('light-theme');
  }, []);

  // Simulate live market exchange rate updates
  useEffect(() => {
    const updateRate = () => {
      // Small random fluctuations around 1500-1550 range
      const fluctuation = (Math.random() * 50) - 25;
      const newRate = 1500 + fluctuation;
      setExchangeRate(Math.floor(newRate));
    };

    const interval = setInterval(updateRate, 30000); // Update every 30 seconds
    updateRate(); // Initial call
    return () => clearInterval(interval);
  }, []);

  // Load from localStorage on mount
  useEffect(() => {
    const savedCurrency = localStorage.getItem('currencyPreference') as 'ngn' | 'usd' | null;
    
    if (savedCurrency) {
      setCurrencyPreferenceState(savedCurrency);
    }
    // Force dark theme - ignore localStorage
    const root = document.documentElement;
    root.classList.add('dark');
    root.classList.add('dark-theme');
    root.classList.remove('light-theme');
  }, []);

  const setBalance = (newBalance: number) => {
    setBalanceState(newBalance);
  };

  const setCurrencyPreference = (pref: 'ngn' | 'usd') => {
    const previousPref = currencyPreference;
    setCurrencyPreferenceState(pref);
    localStorage.setItem('currencyPreference', pref);
    
    // Synchronize balance when switching from USDT to NGN
    if (previousPref === 'usd' && pref === 'ngn') {
      // Convert current USD balance to NGN at N1,400 per $1
      const convertedBalance = balance * FIXED_RATE;
      setBalanceState(convertedBalance);
    } else if (previousPref === 'ngn' && pref === 'usd') {
      // Convert current NGN balance to USD at N1,400 per $1
      const convertedBalance = balance / FIXED_RATE;
      setBalanceState(convertedBalance);
    }
  };

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  const applyTheme = (theme: 'light' | 'dark') => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark-theme');
    } else {
      root.classList.remove('dark-theme');
    }
  };

  const updateBalance = (amount: number) => {
    setBalanceState(prev => prev + amount);
  };

  const updateGameBalance = (amount: number) => {
    setGameBalance(prev => prev + amount);
  };

  const updateUsdtBalance = (amount: number) => {
    setUsdtBalance(prev => prev + amount);
  };

  const updateAdvertiseBalance = (amount: number) => {
    setAdvertiseBalance(prev => prev + amount);
  };

  const updateReferralBalance = (amount: number) => {
    setReferralBalance(prev => prev + amount);
  };

  const convertAmount = (amount: number, from: 'ngn' | 'usd'): number => {
    if (from === 'ngn') {
      return amount / exchangeRate; // NGN to USD
    } else {
      return amount * exchangeRate; // USD to NGN
    }
  };

  const formatCurrency = (amount: number, forceUSD: boolean = false): string => {
    // Remove .00 from all balances
    const roundedAmount = Math.floor(amount);
    if (currencyPreference === 'usd' || forceUSD) {
      return `$${roundedAmount.toLocaleString('en-US')}`;
    } else {
      return `₦${roundedAmount.toLocaleString('en-US')}`;
    }
  };

  const formatUSDT = (amount: number): string => {
    const roundedAmount = Math.floor(amount);
    return `$${roundedAmount.toLocaleString('en-US')}`;
  };

  const [userBankAccounts, setUserBankAccounts] = useState<Array<{ bankName: string; accountNumber: string; accountName: string }>>([]);
  const [userWallets, setUserWallets] = useState<Array<{ address: string; network: string }>>([]);
  const [defaultBank, setDefaultBank] = useState<{ bankName: string; accountNumber: string; accountName: string } | null>(null);
  const [defaultWallet, setDefaultWallet] = useState<{ address: string; network: string } | null>(null);
  const [transactions, setTransactions] = useState<Array<{
    id: string;
    description: string;
    amount: number;
    date: string;
    status: string;
    icon: string;
    type: 'deposit' | 'withdraw' | 'transfer' | 'game';
  }>>([]);

  const addBankAccount = (bank: { bankName: string; accountNumber: string; accountName: string }) => {
    setUserBankAccounts(prev => [...prev, bank]);
  };

  const addWallet = (wallet: { address: string; network: string }) => {
    setUserWallets(prev => [...prev, wallet]);
  };

  const addTransaction = (transaction: {
    description: string;
    amount: number;
    status: string;
    icon: string;
    type: 'deposit' | 'withdraw' | 'transfer' | 'game';
  }) => {
    const now = new Date();
    const dateString = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ', ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    
    const newTransaction = {
      id: Math.random().toString(36).substr(2, 9),
      description: transaction.description,
      amount: transaction.amount,
      date: dateString,
      status: transaction.status,
      icon: transaction.icon,
      type: transaction.type,
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  return (
    <UserContext.Provider
      value={{
        balance,
        gameBalance,
        usdtBalance,
        advertiseBalance,
        referralBalance,
        isVIP,
        vipLevel,
        vipProgress,
        isAgeVerified,
        hasPin,
        currencyPreference,
        theme,
        exchangeRate,
        setBalance,
        setGameBalance,
        setUsdtBalance,
        setAdvertiseBalance,
        setReferralBalance,
        setIsVIP,
        setVipLevel,
        setVipProgress,
        setIsAgeVerified,
        setHasPin,
        setCurrencyPreference,
        setTheme,
        updateBalance,
        updateGameBalance,
        updateUsdtBalance,
        updateAdvertiseBalance,
        updateReferralBalance,
        addTransaction,
        formatCurrency,
        formatUSDT,
        convertAmount,
        userBankAccounts,
        userWallets,
        defaultBank,
        defaultWallet,
        addBankAccount,
        addWallet,
        setDefaultBank,
        setDefaultWallet,
        transactions,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}