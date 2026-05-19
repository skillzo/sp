import { useState, useEffect } from 'react';
import { Bell, Copy, ChevronDown, ChevronUp, Check, X, TrendingUp, Wallet, Users, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { TopBar } from '../components/TopBar';
import { BackButton } from '../components/BackButton';
import { motion } from 'motion/react';

interface EarningRecord {
  id: string;
  date: string;
  type: 'Rake' | 'VIP';
  user: string;
  amount: number;
  status: 'Available' | 'Pending';
  createdAt: number;
}

interface Transaction {
  id: string;
  amount: number;
  method: string;
  timestamp: string;
  status: string;
}

// Animated Counter Component
function AnimatedCounter({ value, prefix = '', suffix = '', decimals = 2 }: { value: number; prefix?: string; suffix?: string; decimals?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    const duration = 1200;
    const startValue = 0;
    const endValue = value;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = startValue + (endValue - startValue) * easeOutQuart;

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return <span>{prefix}{displayValue.toFixed(decimals)}{suffix}</span>;
}

export function AffiliateWallet() {
  const navigate = useNavigate();
  const [isHowYouEarnOpen, setIsHowYouEarnOpen] = useState(false);
  const [isEarningsHistoryOpen, setIsEarningsHistoryOpen] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Main Wallet');
  const [filterTab, setFilterTab] = useState('All');
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [lastWithdrawal, setLastWithdrawal] = useState({ amount: 0, destination: '', time: '' });
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  
  // Core state
  const [walletBalance, setWalletBalance] = useState(120.50);
  const [pendingEarnings, setPendingEarnings] = useState(138.25);
  const [activeReferrals] = useState(14);
  const [user] = useState({
    isVerified: true,
    hasFraudFlag: false
  });
  
  // Countdown timer for withdrawal unlock
  const [unlockHours, setUnlockHours] = useState(6);
  const [unlockMinutes, setUnlockMinutes] = useState(12);
  const [unlockSeconds, setUnlockSeconds] = useState(30);
  
  const [earningsHistory, setEarningsHistory] = useState<EarningRecord[]>([
    { id: '1', date: '2024-04-17', type: 'Rake', user: '***3421', amount: 12.50, status: 'Available', createdAt: Date.now() - 2 * 60 * 60 * 1000 },
    { id: '2', date: '2024-04-17', type: 'VIP', user: '***8765', amount: 0.50, status: 'Available', createdAt: Date.now() - 4 * 60 * 60 * 1000 },
    { id: '3', date: '2024-04-17', type: 'Rake', user: '***2341', amount: 8.30, status: 'Pending', createdAt: Date.now() - 12 * 60 * 60 * 1000 },
    { id: '4', date: '2024-04-16', type: 'Rake', user: '***9012', amount: 15.40, status: 'Available', createdAt: Date.now() - 26 * 60 * 60 * 1000 },
    { id: '5', date: '2024-04-16', type: 'VIP', user: '***4532', amount: 0.50, status: 'Available', createdAt: Date.now() - 28 * 60 * 60 * 1000 },
    { id: '6', date: '2024-04-16', type: 'Rake', user: '***6789', amount: 6.80, status: 'Pending', createdAt: Date.now() - 8 * 60 * 60 * 1000 },
    { id: '7', date: '2024-04-15', type: 'Rake', user: '***1122', amount: 9.20, status: 'Available', createdAt: Date.now() - 50 * 60 * 60 * 1000 },
    { id: '8', date: '2024-04-15', type: 'VIP', user: '***3344', amount: 0.50, status: 'Available', createdAt: Date.now() - 52 * 60 * 60 * 1000 },
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  const affiliateCode = 'AFF2024XYZ';
  const affiliateLink = 'https://platform.com/ref/AFF2024XYZ';

  // Auto transition system - check every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = Date.now();
      let balanceIncrease = 0;
      let pendingDecrease = 0;
      
      setEarningsHistory(prev => prev.map(record => {
        if (record.status === 'Pending') {
          const ageInHours = (currentTime - record.createdAt) / (1000 * 60 * 60);
          if (ageInHours >= 24) {
            balanceIncrease += record.amount;
            pendingDecrease += record.amount;
            return { ...record, status: 'Available' as const };
          }
        }
        return record;
      }));
      
      if (balanceIncrease > 0) {
        setWalletBalance(prev => prev + balanceIncrease);
        setPendingEarnings(prev => Math.max(0, prev - pendingDecrease));
        toast.success(`${balanceIncrease.toFixed(2)} USDT matured and added to wallet!`);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Countdown timer for withdrawal unlock
  useEffect(() => {
    const timer = setInterval(() => {
      setUnlockSeconds(prev => {
        if (prev > 0) return prev - 1;
        setUnlockMinutes(min => {
          if (min > 0) {
            setUnlockSeconds(59);
            return min - 1;
          }
          setUnlockHours(hr => {
            if (hr > 0) {
              setUnlockMinutes(59);
              setUnlockSeconds(59);
              return hr - 1;
            }
            return 0;
          });
          return 0;
        });
        return 0;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Calculate dynamic values
  const totalEarnings = earningsHistory.reduce((sum, record) => sum + record.amount, 0);
  const rakeEarnings = earningsHistory.filter(r => r.type === 'Rake').reduce((sum, r) => sum + r.amount, 0);
  const vipBonuses = earningsHistory.filter(r => r.type === 'VIP').reduce((sum, r) => sum + r.amount, 0);
  const pendingRake = earningsHistory.filter(r => r.type === 'Rake' && r.status === 'Pending').reduce((sum, r) => sum + r.amount, 0);
  
  // Today's earnings
  const today = new Date().toISOString().slice(0, 10);
  const todayEarnings = earningsHistory
    .filter(r => r.date === today)
    .reduce((sum, r) => sum + r.amount, 0);

  // Withdrawal validation
  const withdrawAmountNum = parseFloat(withdrawAmount) || 0;
  const minAmountReached = withdrawAmountNum >= 5;
  const balanceCheck = withdrawAmountNum <= walletBalance && withdrawAmountNum > 0;
  const hasActiveReferral = activeReferrals >= 1;
  const accountVerified = user.isVerified;
  const noFraudDetected = !user.hasFraudFlag;
  const earningsMatured = unlockHours === 0 && unlockMinutes === 0 && unlockSeconds === 0;

  const allConditionsMet = minAmountReached && balanceCheck && hasActiveReferral && accountVerified && noFraudDetected && earningsMatured;

  // Checklist progress
  const checklistItems = [
    { label: 'Minimum amount ≥ $5', met: minAmountReached },
    { label: 'Available balance ≥ $5', met: balanceCheck },
    { label: 'Has at least 1 referral', met: hasActiveReferral },
    { label: 'Earnings matured (24h)', met: earningsMatured },
    { label: 'Account verified', met: accountVerified },
    { label: 'No fraud detected', met: noFraudDetected },
  ];
  const completedCount = checklistItems.filter(item => item.met).length;
  const progressPercent = (completedCount / checklistItems.length) * 100;
  
  // Withdrawal progress (time-based)
  const totalUnlockSeconds = 6 * 60 * 60 + 12 * 60 + 30; // Initial time
  const remainingSeconds = unlockHours * 60 * 60 + unlockMinutes * 60 + unlockSeconds;
  const withdrawalProgressPercent = Math.max(0, ((totalUnlockSeconds - remainingSeconds) / totalUnlockSeconds) * 100);

  // Real-time error messages
  useEffect(() => {
    if (!withdrawAmount) {
      setErrorMessage('');
      return;
    }
    
    if (withdrawAmountNum < 5) {
      setErrorMessage('Minimum withdrawal is $5');
    } else if (withdrawAmountNum > walletBalance) {
      setErrorMessage('Insufficient balance');
    } else if (!hasActiveReferral) {
      setErrorMessage('No active referrals');
    } else if (!accountVerified) {
      setErrorMessage('Account not verified');
    } else if (noFraudDetected === false) {
      setErrorMessage('Withdrawal blocked (fraud check)');
    } else {
      setErrorMessage('');
    }
  }, [withdrawAmount, withdrawAmountNum, walletBalance, hasActiveReferral, accountVerified, noFraudDetected]);

  const filteredHistory = filterTab === 'All' 
    ? earningsHistory 
    : earningsHistory.filter(item => {
        if (filterTab === 'Rake') return item.type === 'Rake';
        if (filterTab === 'VIP') return item.type === 'VIP';
        if (filterTab === 'Pending') return item.status === 'Pending';
        if (filterTab === 'Available') return item.status === 'Available';
        return true;
      });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    if (label === 'Code') {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
    toast.success(`${label} copied!`);
  };

  const handleWithdraw = () => {
    // Hard block at logic level
    if (withdrawAmountNum > walletBalance) {
      toast.error('Insufficient balance');
      return;
    }

    if (!allConditionsMet) {
      toast.error(errorMessage || 'Requirements not met');
      return;
    }

    const amount = parseFloat(withdrawAmount);
    
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amount < 5) {
      toast.error('Minimum withdrawal is $5');
      return;
    }

    // Deduct from wallet balance
    setWalletBalance(prev => prev - amount);

    // Log transaction
    const transaction: Transaction = {
      id: Date.now().toString(),
      amount,
      method: paymentMethod,
      timestamp: new Date().toLocaleTimeString(),
      status: 'success'
    };

    setTransactions(prev => [transaction, ...prev]);
    
    setLastWithdrawal({
      amount,
      destination: paymentMethod,
      time: transaction.timestamp
    });

    setShowSuccessCard(true);
    toast.success(`Withdrawal to ${paymentMethod} successful!`);
    setWithdrawAmount('');
    
    setTimeout(() => {
      setShowSuccessCard(false);
    }, 5000);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <TopBar />
      <div className="px-4 pt-4">
        <BackButton />
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* HERO BALANCE - LARGE & GLOWING */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl text-center relative overflow-hidden" 
          style={{ 
            backgroundColor: '#131A24', 
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            border: '1px solid rgba(34, 197, 94, 0.15)',
            padding: '20px 16px 16px 16px',
            marginBottom: '16px'
          }}
        >
          {/* Subtle glow effect */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              background: 'radial-gradient(circle at center, #22C55E 0%, transparent 60%)',
              animation: 'pulse 3s ease-in-out infinite'
            }}
          />
          
          <p style={{ fontSize: '13px', color: '#AEB6C2', marginBottom: '6px', letterSpacing: '1px', fontWeight: '600' }}>
            💰 READY TO WITHDRAW
          </p>
          <p style={{ fontSize: '52px', fontWeight: '800', color: '#22C55E', lineHeight: 1.1, marginTop: '6px', marginBottom: '6px' }}>
            $<AnimatedCounter value={walletBalance} decimals={2} />
          </p>
          <p style={{ fontSize: '12px', color: '#7C8796', marginBottom: '12px', fontWeight: '500' }}>
            Instant payout when unlocked
          </p>

          {/* Mini stats row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg" style={{ backgroundColor: 'rgba(237, 137, 54, 0.08)', border: '1px solid rgba(237, 137, 54, 0.15)', padding: '12px' }}>
              <p style={{ fontSize: '10px', color: '#AEB6C2', marginBottom: '4px', letterSpacing: '0.5px' }}>PENDING</p>
              <p style={{ fontSize: '20px', fontWeight: '700', color: '#F59E0B' }}>$<AnimatedCounter value={pendingEarnings} decimals={2} /></p>
            </div>
            <div className="rounded-lg" style={{ backgroundColor: 'rgba(66, 153, 225, 0.08)', border: '1px solid rgba(66, 153, 225, 0.15)', padding: '12px' }}>
              <p style={{ fontSize: '10px', color: '#AEB6C2', marginBottom: '4px', letterSpacing: '0.5px' }}>REFERRALS</p>
              <p style={{ fontSize: '20px', fontWeight: '700', color: '#4299E1' }}><AnimatedCounter value={activeReferrals} decimals={0} /></p>
            </div>
          </div>
        </motion.div>

        {/* Psychology Boost */}
        {completedCount >= 4 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl text-center"
            style={{ 
              backgroundColor: 'rgba(245, 158, 11, 0.1)', 
              border: '1px solid rgba(245, 158, 11, 0.2)',
              padding: '16px',
              marginBottom: '16px'
            }}
          >
            <p style={{ fontSize: '14px', fontWeight: '700', color: '#F59E0B' }}>
              🎯 {completedCount === checklistItems.length - 1 ? "Almost there — don't miss your earnings!" : "You're very close to your first payout"}
            </p>
          </motion.div>
        )}

        {/* Success Card */}
        {showSuccessCard && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border-2" 
            style={{ backgroundColor: '#F0FFF4', borderColor: '#22C55E', padding: '16px', marginBottom: '16px' }}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full" style={{ backgroundColor: '#22C55E' }}>
                <Check style={{ width: '16px', height: '16px', color: '#FFFFFF' }} />
              </div>
              <div className="flex-1">
                <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#22543D', marginBottom: '2px' }}>Withdrawal Successful</h3>
                <p style={{ fontSize: '11px', color: '#2F855A' }}>
                  ${lastWithdrawal.amount.toFixed(2)} sent to {lastWithdrawal.destination} at {lastWithdrawal.time}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Withdraw Funds & Checklist */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={{ marginBottom: '16px' }}>
          {/* Withdraw Funds */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl" 
            style={{ backgroundColor: '#131A24', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '16px' }}
          >
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#FFFFFF', marginBottom: '8px' }}>Withdraw Funds</h2>
            
            {/* Balance Breakdown */}
            <div style={{ marginBottom: '12px' }}>
              <div className="rounded-lg" style={{ backgroundColor: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.15)', padding: '12px', marginBottom: '8px' }}>
                <p style={{ fontSize: '10px', color: '#16A34A', marginBottom: '2px', fontWeight: '600', letterSpacing: '0.5px' }}>AVAILABLE BALANCE</p>
                <p style={{ fontSize: '24px', fontWeight: '800', color: '#22C55E' }}>${walletBalance.toFixed(2)}</p>
              </div>

              <motion.div
                animate={{ 
                  boxShadow: ['0 0 0 rgba(245, 158, 11, 0)', '0 0 12px rgba(245, 158, 11, 0.2)', '0 0 0 rgba(245, 158, 11, 0)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="rounded-lg" 
                style={{ backgroundColor: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '12px' }}
              >
                <p style={{ fontSize: '10px', color: '#D97706', marginBottom: '2px', fontWeight: '600', letterSpacing: '0.5px' }}>
                  PENDING EARNINGS
                </p>
                <p style={{ fontSize: '20px', fontWeight: '700', color: '#F59E0B' }}>${pendingEarnings.toFixed(2)}</p>
                <p style={{ fontSize: '10px', color: '#FCD34D', marginTop: '4px' }}>Unlocking soon → moves to withdrawable balance</p>
              </motion.div>
            </div>

            {/* Withdrawal Progress */}
            {!earningsMatured && (
              <div className="rounded-lg" style={{ backgroundColor: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.15)', padding: '16px', marginBottom: '12px' }}>
                <div className="flex items-center gap-2" style={{ marginBottom: '8px' }}>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Clock style={{ width: '16px', height: '16px', color: '#6366F1' }} />
                  </motion.div>
                  <p style={{ fontSize: '12px', fontWeight: '700', color: '#C7D2FE' }}>⏳ Unlocking your withdrawal</p>
                </div>
                
                <div className="w-full rounded-full" style={{ height: '10px', backgroundColor: '#2A3442', overflow: 'hidden', marginTop: '8px', marginBottom: '12px' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${withdrawalProgressPercent}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="rounded-full relative"
                    style={{ 
                      height: '10px', 
                      background: 'linear-gradient(90deg, #6366F1 0%, #8B5CF6 100%)',
                    }}
                  >
                    <motion.div
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                      className="absolute inset-0"
                      style={{
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                        width: '50%'
                      }}
                    />
                  </motion.div>
                </div>
                
                <p style={{ fontSize: '11px', color: '#A5B4FC', fontWeight: '600' }}>
                  {withdrawalProgressPercent.toFixed(0)}% • Available in {unlockHours}h {unlockMinutes}m
                </p>
              </div>
            )}

            <div style={{ marginBottom: '12px' }}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '11px', fontWeight: '600', color: '#AEB6C2', marginBottom: '6px', display: 'block' }}>
                  Enter Amount
                </label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-lg"
                  style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid rgba(255, 255, 255, 0.08)', color: '#FFFFFF', fontSize: '15px', fontWeight: '600', height: '44px', padding: '0 12px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '600', color: '#AEB6C2', marginBottom: '6px', display: 'block' }}>
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full rounded-lg"
                  style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid rgba(255, 255, 255, 0.08)', color: '#FFFFFF', fontSize: '14px', fontWeight: '600', height: '44px', padding: '0 12px' }}
                >
                  <option value="Main Wallet">Main Wallet</option>
                  <option value="Game Wallet">Game Wallet</option>
                </select>
              </div>
            </div>

            <motion.button
              whileHover={allConditionsMet ? { scale: 1.02 } : {}}
              whileTap={allConditionsMet ? { scale: 0.98 } : {}}
              onClick={allConditionsMet ? handleWithdraw : () => toast.error('Complete requirements to unlock withdrawal')}
              className="w-full rounded-lg font-bold transition-all text-sm relative overflow-hidden"
              style={{
                background: allConditionsMet 
                  ? 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)' 
                  : 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                color: '#FFFFFF',
                cursor: 'pointer',
                height: '48px',
                marginTop: '12px',
                marginBottom: '12px',
                boxShadow: allConditionsMet ? '0 4px 12px rgba(34, 197, 94, 0.2)' : '0 0 8px rgba(99, 102, 241, 0.2)'
              }}
            >
              {allConditionsMet ? `Withdraw $${walletBalance.toFixed(2)}` : `Unlocking… ${unlockHours}h left`}
              
              {!allConditionsMet && (
                <motion.div
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
                    width: '50%'
                  }}
                />
              )}
            </motion.button>

            {/* Trust Info */}
            <div className="rounded-lg" style={{ backgroundColor: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.15)', padding: '12px' }}>
              <p style={{ fontSize: '11px', color: '#22C55E', lineHeight: 1.6, marginBottom: '4px', fontWeight: '600' }}>
                ✓ Withdrawals processed within 1–5 minutes
              </p>
              <p style={{ fontSize: '11px', color: '#22C55E', lineHeight: 1.6, marginBottom: '4px', fontWeight: '600' }}>
                ✓ Secure & verified payouts
              </p>
              <p style={{ fontSize: '11px', color: '#22C55E', lineHeight: 1.6, fontWeight: '600' }}>
                ✓ No hidden fees
              </p>
            </div>
          </motion.div>

          {/* Withdrawal Checklist */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl" 
            style={{ backgroundColor: '#131A24', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '16px' }}
          >
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#FFFFFF', marginBottom: '8px' }}>Withdrawal Progress</h2>
            
            {/* Progress header */}
            <div style={{ marginBottom: '12px' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
                <p style={{ fontSize: '13px', fontWeight: '600', color: '#AEB6C2' }}>
                  {completedCount} / {checklistItems.length} completed
                </p>
                <p style={{ fontSize: '13px', fontWeight: '700', color: '#22C55E' }}>
                  {progressPercent.toFixed(0)}%
                </p>
              </div>
              
              <div className="w-full rounded-full" style={{ height: '8px', backgroundColor: '#2A3442', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="rounded-full"
                  style={{ 
                    height: '8px', 
                    background: progressPercent === 100 
                      ? 'linear-gradient(90deg, #22C55E 0%, #16A34A 100%)'
                      : 'linear-gradient(90deg, #6366F1 0%, #8B5CF6 100%)'
                  }}
                />
              </div>
            </div>
            
            <ul style={{ marginBottom: '12px' }}>
              {checklistItems.map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ 
                    opacity: 1, 
                    x: item.met ? 0 : [0, -3, 3, -3, 0],
                  }}
                  transition={{ 
                    opacity: { delay: index * 0.1 },
                    x: item.met ? {} : { delay: 0.5, duration: 0.5 }
                  }}
                  className="flex items-center gap-2"
                  style={{ marginBottom: index < checklistItems.length - 1 ? '10px' : '0' }}
                >
                  <div 
                    className="p-1 rounded-full flex items-center justify-center" 
                    style={{ 
                      backgroundColor: item.met ? '#D1FAE5' : (index === 3 && !item.met ? '#FEF3C7' : '#FEE2E2'),
                      minWidth: '24px',
                      height: '24px'
                    }}
                  >
                    {item.met ? (
                      <Check style={{ width: '14px', height: '14px', color: '#22C55E' }} />
                    ) : index === 3 ? (
                      <Clock style={{ width: '14px', height: '14px', color: '#F59E0B' }} />
                    ) : (
                      <X style={{ width: '14px', height: '14px', color: '#EF4444' }} />
                    )}
                  </div>
                  <div className="flex-1">
                    <span style={{ fontSize: '13px', fontWeight: '600', color: item.met ? '#22C55E' : '#AEB6C2' }}>
                      {item.label}
                    </span>
                    {index === 3 && !item.met && (
                      <p style={{ fontSize: '10px', color: '#F59E0B', marginTop: '2px', fontWeight: '600' }}>
                        ⏳ {unlockHours}h {unlockMinutes}m {unlockSeconds}s remaining
                      </p>
                    )}
                  </div>
                </motion.li>
              ))}
            </ul>

            <div className="rounded-lg text-center" style={{ backgroundColor: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.15)', padding: '12px' }}>
              <p style={{ fontSize: '11px', color: '#C7D2FE', fontWeight: '600' }}>
                Complete all steps to unlock your payout
              </p>
            </div>
          </motion.div>
        </div>

        {/* Earnings History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl" 
          style={{ backgroundColor: '#131A24', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '16px', marginBottom: '16px' }}
        >
          <button 
            onClick={() => setIsEarningsHistoryOpen(!isEarningsHistoryOpen)}
            className="flex items-center justify-between w-full"
            style={{ marginBottom: '8px' }}
          >
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#FFFFFF' }}>Earnings History</h2>
            {isEarningsHistoryOpen ? <ChevronUp style={{ width: '18px', height: '18px', color: '#AEB6C2' }} /> : <ChevronDown style={{ width: '18px', height: '18px', color: '#AEB6C2' }} />}
          </button>
          
          {isEarningsHistoryOpen && (
            <>
              {/* Today's Earnings */}
              {todayEarnings > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-lg text-center"
                  style={{ 
                    backgroundColor: 'rgba(34, 197, 94, 0.1)', 
                    border: '1px solid rgba(34, 197, 94, 0.2)',
                    padding: '12px',
                    marginBottom: '12px'
                  }}
                >
                  <p style={{ fontSize: '13px', fontWeight: '700', color: '#22C55E' }}>
                    💸 You earned ${todayEarnings.toFixed(2)} today
                  </p>
                </motion.div>
              )}

              {/* Pending Rake Progress */}
              {pendingRake > 0 && (
                <motion.div
                  animate={{ 
                    boxShadow: ['0 0 0 rgba(245, 158, 11, 0)', '0 0 10px rgba(245, 158, 11, 0.15)', '0 0 0 rgba(245, 158, 11, 0)']
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="rounded-lg"
                  style={{ backgroundColor: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '12px', marginBottom: '12px' }}
                >
                  <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
                    <p style={{ fontSize: '12px', fontWeight: '700', color: '#F59E0B' }}>Unlocking: ${pendingRake.toFixed(2)}</p>
                    <p style={{ fontSize: '11px', color: '#D97706', fontWeight: '600' }}>60%</p>
                  </div>
                  
                  <div className="w-full rounded-full" style={{ height: '6px', backgroundColor: '#2A3442', overflow: 'hidden', marginBottom: '8px' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '60%' }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="rounded-full"
                      style={{ 
                        height: '6px', 
                        background: 'linear-gradient(90deg, #F59E0B 0%, #D97706 100%)'
                      }}
                    />
                  </div>
                  
                  <p style={{ fontSize: '10px', color: '#FCD34D' }}>Moves to available in {unlockHours}h</p>
                </motion.div>
              )}

              <div className="flex gap-2 overflow-x-auto pb-1" style={{ marginBottom: '12px' }}>
                {['All', 'Rake', 'VIP', 'Pending', 'Available'].map((tab) => (
                  <motion.button
                    key={tab}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFilterTab(tab)}
                    className="rounded-md whitespace-nowrap transition-all"
                    style={{
                      background: filterTab === tab ? 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)' : '#2A3442',
                      color: filterTab === tab ? '#FFFFFF' : '#AEB6C2',
                      fontWeight: '600',
                      fontSize: '12px',
                      padding: '8px 12px',
                      boxShadow: filterTab === tab ? '0 0 8px rgba(99, 102, 241, 0.2)' : 'none',
                      border: 'none'
                    }}
                  >
                    {tab}
                  </motion.button>
                ))}
              </div>

              <div>
                {filteredHistory.length === 0 ? (
                  <div className="text-center" style={{ paddingTop: '32px', paddingBottom: '32px' }}>
                    <p style={{ fontSize: '14px', color: '#AEB6C2', marginBottom: '12px' }}>🚀 Start earning by inviting users</p>
                    <button
                      onClick={() => copyToClipboard(affiliateLink, 'Link')}
                      className="rounded-lg font-semibold"
                      style={{ background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)', color: '#FFFFFF', fontSize: '13px', padding: '8px 16px' }}
                    >
                      Copy referral link
                    </button>
                  </div>
                ) : (
                  filteredHistory.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-2 transition-all cursor-pointer"
                      style={{ 
                        backgroundColor: 'transparent',
                        borderBottom: index < filteredHistory.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                        padding: '12px 0'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      {/* Date - Small & Muted */}
                      <div style={{ minWidth: '50px' }}>
                        <p style={{ fontSize: '11px', color: '#8FA3B8', fontWeight: '500' }}>
                          {item.date.slice(5)}
                        </p>
                      </div>

                      {/* Type Badge */}
                      <div 
                        className="rounded-md"
                        style={{ 
                          backgroundColor: item.type === 'Rake' ? 'rgba(74, 222, 128, 0.15)' : 'rgba(192, 132, 252, 0.15)',
                          border: `1px solid ${item.type === 'Rake' ? 'rgba(74, 222, 128, 0.25)' : 'rgba(192, 132, 252, 0.25)'}`,
                          padding: '6px 10px'
                        }}
                      >
                        <span style={{ fontSize: '10px', fontWeight: '700', color: item.type === 'Rake' ? '#4ADE80' : '#C084FC', letterSpacing: '0.3px' }}>
                          {item.type}
                        </span>
                      </div>

                      {/* Center: Amount & User */}
                      <div className="flex-1" style={{ marginLeft: '8px' }}>
                        <p style={{ fontSize: '14px', fontWeight: '700', color: '#FFFFFF', lineHeight: 1.3 }}>
                          +${item.amount.toFixed(2)}
                        </p>
                        <p style={{ fontSize: '11px', color: '#AEB6C2', marginTop: '4px', fontWeight: '500' }}>
                          from {item.user}
                        </p>
                      </div>

                      {/* Status Badge */}
                      <div 
                        className="rounded-md"
                        style={{ 
                          backgroundColor: item.status === 'Available' 
                            ? 'rgba(34, 197, 94, 0.15)' 
                            : 'rgba(245, 158, 11, 0.18)',
                          boxShadow: item.status === 'Pending' 
                            ? '0 0 8px rgba(245, 158, 11, 0.15)' 
                            : 'none',
                          padding: '6px 10px'
                        }}
                      >
                        <span style={{ 
                          fontSize: '11px', 
                          fontWeight: '700', 
                          color: item.status === 'Available' ? '#22C55E' : '#F59E0B',
                          letterSpacing: '0.3px'
                        }}>
                          {item.status}
                        </span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </>
          )}
        </motion.div>

        {/* How You Earn & Affiliate Tools */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={{ marginBottom: '16px' }}>
          {/* How You Earn */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl" 
            style={{ backgroundColor: '#131A24', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '16px' }}
          >
            <button 
              onClick={() => setIsHowYouEarnOpen(!isHowYouEarnOpen)}
              className="flex items-center justify-between w-full"
              style={{ marginBottom: isHowYouEarnOpen ? '8px' : '0' }}
            >
              <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#FFFFFF' }}>How You Earn</h2>
              {isHowYouEarnOpen ? <ChevronUp style={{ width: '16px', height: '16px', color: '#AEB6C2' }} /> : <ChevronDown style={{ width: '16px', height: '16px', color: '#AEB6C2' }} />}
            </button>
            
            {isHowYouEarnOpen && (
              <ul>
                <li className="flex items-center gap-2" style={{ marginBottom: '8px' }}>
                  <Check style={{ width: '14px', height: '14px', color: '#22C55E', flexShrink: 0 }} />
                  <span style={{ fontSize: '12px', color: '#AEB6C2' }}>18% rake commission</span>
                </li>
                <li className="flex items-center gap-2" style={{ marginBottom: '8px' }}>
                  <Check style={{ width: '14px', height: '14px', color: '#22C55E', flexShrink: 0 }} />
                  <span style={{ fontSize: '12px', color: '#AEB6C2' }}>$0.50 VIP bonus</span>
                </li>
                <li className="flex items-center gap-2" style={{ marginBottom: '8px' }}>
                  <Check style={{ width: '14px', height: '14px', color: '#22C55E', flexShrink: 0 }} />
                  <span style={{ fontSize: '12px', color: '#AEB6C2' }}>Active users only</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock style={{ width: '14px', height: '14px', color: '#F59E0B', flexShrink: 0 }} />
                  <span style={{ fontSize: '12px', color: '#AEB6C2' }}>24h lock period</span>
                </li>
              </ul>
            )}
          </motion.div>

          {/* Affiliate Tools */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-2xl" 
            style={{ backgroundColor: '#131A24', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '16px' }}
          >
            <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#FFFFFF', marginBottom: '8px' }}>Affiliate Tools</h2>
            
            {/* Header Stats */}
            <div className="grid grid-cols-2 gap-2" style={{ marginBottom: '8px' }}>
              <div className="rounded-lg" style={{ backgroundColor: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.15)', padding: '8px' }}>
                <p style={{ fontSize: '10px', color: '#22C55E', fontWeight: '600' }}>Earn 18% commission per referral</p>
              </div>
              <div className="rounded-lg" style={{ backgroundColor: 'rgba(167, 139, 250, 0.08)', border: '1px solid rgba(167, 139, 250, 0.15)', padding: '8px' }}>
                <p style={{ fontSize: '10px', color: '#C084FC', fontWeight: '600' }}>$0.50 bonus per active user</p>
              </div>
            </div>

            <div className="rounded-lg text-center" style={{ backgroundColor: 'rgba(66, 153, 225, 0.08)', border: '1px solid rgba(66, 153, 225, 0.15)', padding: '8px', marginBottom: '12px' }}>
              <p style={{ fontSize: '12px', color: '#4299E1' }}>
                <span style={{ fontWeight: '700' }}>Total earned from referrals:</span> ${totalEarnings.toFixed(2)}
              </p>
            </div>
            
            <div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '11px', fontWeight: '600', color: '#AEB6C2', marginBottom: '6px', display: 'block', letterSpacing: '0.5px' }}>
                  AFFILIATE CODE
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={affiliateCode}
                    readOnly
                    className="flex-1 rounded-lg"
                    style={{ backgroundColor: '#1F2937', border: '1px solid rgba(255, 255, 255, 0.08)', color: '#FFFFFF', fontSize: '13px', fontWeight: '600', height: '44px', padding: '0 12px' }}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => copyToClipboard(affiliateCode, 'Code')}
                    className="rounded-lg transition-all flex items-center gap-1"
                    style={{ background: copiedCode ? '#22C55E' : 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)', color: '#FFFFFF', padding: '0 12px', height: '44px' }}
                  >
                    {copiedCode ? <Check style={{ width: '14px', height: '14px' }} /> : <Copy style={{ width: '14px', height: '14px' }} />}
                  </motion.button>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '600', color: '#AEB6C2', marginBottom: '6px', display: 'block', letterSpacing: '0.5px' }}>
                  AFFILIATE LINK
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={affiliateLink}
                    readOnly
                    className="flex-1 rounded-lg"
                    style={{ backgroundColor: '#1F2937', border: '1px solid rgba(255, 255, 255, 0.08)', color: '#FFFFFF', fontSize: '13px', fontWeight: '600', height: '44px', padding: '0 12px' }}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => copyToClipboard(affiliateLink, 'Link')}
                    className="rounded-lg transition-all flex items-center gap-1"
                    style={{ background: copiedLink ? '#22C55E' : 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)', color: '#FFFFFF', padding: '0 12px', height: '44px' }}
                  >
                    {copiedLink ? <Check style={{ width: '14px', height: '14px' }} /> : <Copy style={{ width: '14px', height: '14px' }} />}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.15; }
        }
      `}</style>
    </div>
  );
}
