import { Wallet, ArrowUpCircle, Users, TrendingUp } from 'lucide-react';
import { TopBar } from '../components/TopBar';
import { BackButton } from '../components/BackButton';
import { SuccessCard } from '../components/SuccessCard';
import { useState } from 'react';
import { toast } from 'sonner';
import { useUser } from '../context/UserContext';

export function ReferralWallet() {
  const { updateGameBalance, formatUSDT, referralBalance, setReferralBalance } = useUser();
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0);
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [lastWithdrawAmount, setLastWithdrawAmount] = useState(0);

  const referralEarnings = [
    { id: 1, name: 'User #1234', amount: 500, date: 'April 5, 2026', status: 'Completed' },
    { id: 2, name: 'User #5678', amount: 500, date: 'April 3, 2026', status: 'Completed' },
    { id: 3, name: 'User #9012', amount: 500, date: 'March 28, 2026', status: 'Completed' },
    { id: 4, name: 'User #3456', amount: 500, date: 'March 25, 2026', status: 'Completed' },
    { id: 5, name: 'User #7890', amount: 500, date: 'March 20, 2026', status: 'Completed' },
  ];

  const handleWithdraw = () => {
    if (withdrawAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (withdrawAmount > referralBalance) {
      toast.error('Insufficient referral balance');
      return;
    }

    // Deduct from referral balance
    setReferralBalance(referralBalance - withdrawAmount);
    
    // Credit Game Balance
    updateGameBalance(withdrawAmount);
    
    setLastWithdrawAmount(withdrawAmount);
    setWithdrawAmount(0);
    
    // Show success card
    setShowSuccessCard(true);
  };

  return (
    <div className="flex-1 p-4 sm:p-6 overflow-y-auto" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <TopBar />

      <div className="max-w-4xl mx-auto">
        <BackButton />
        
        <div className="flex items-center gap-3 mb-6">
          <Wallet className="w-8 h-8" style={{ color: '#0A84FF' }} />
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Referral Wallet
          </h1>
        </div>

        {/* Compact Balance Card */}
        <div className="rounded-lg shadow-sm p-4 mb-6" style={{ backgroundColor: '#0A84FF' }}>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white/80 text-xs">Referral Earnings</p>
                <p className="text-white text-2xl font-bold">
                  {formatUSDT(referralBalance)}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setWithdrawAmount(referralBalance);
                handleWithdraw();
              }}
              className="px-6 py-2 bg-white rounded-lg font-medium flex items-center gap-2 transition-transform active:scale-95"
              style={{ color: '#0A84FF' }}
            >
              <ArrowUpCircle className="w-4 h-4" />
              <span className="text-sm">Withdraw All</span>
            </button>
          </div>

          <div className="mt-3 p-2 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
            <p className="text-white/90 text-xs">
              💡 Withdrawals move funds to your Main Wallet instantly
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="rounded-lg shadow-sm p-4 text-center" style={{ backgroundColor: 'var(--bg-card)' }}>
            <p className="text-3xl font-bold mb-1" style={{ color: '#0A84FF' }}>
              {referralEarnings.length}
            </p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total Referrals</p>
          </div>
          <div className="rounded-lg shadow-sm p-4 text-center" style={{ backgroundColor: 'var(--bg-card)' }}>
            <p className="text-3xl font-bold mb-1" style={{ color: '#34D399' }}>
              {formatUSDT(referralEarnings.length * 500)}
            </p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Lifetime Earnings</p>
          </div>
        </div>

        {/* Earnings History */}
        <div className="rounded-lg shadow-sm p-6" style={{ backgroundColor: 'var(--bg-card)' }}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5" style={{ color: '#0A84FF' }} />
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Earnings History
            </h2>
          </div>

          <div className="space-y-3">
            {referralEarnings.map((earning) => (
              <div
                key={earning.id}
                className="flex items-center justify-between p-4 rounded-lg"
                style={{ backgroundColor: 'var(--bg-accent)' }}
              >
                <div>
                  <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                    {earning.name}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {earning.date}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold mb-1" style={{ color: '#34D399' }}>
                    +{formatUSDT(earning.amount)}
                  </p>
                  <span
                    className="text-xs px-2 py-1 rounded-full"
                    style={{ backgroundColor: '#D1FAE5', color: '#34D399' }}
                  >
                    {earning.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Success Card */}
      <SuccessCard
        isOpen={showSuccessCard}
        onClose={() => setShowSuccessCard(false)}
        title="Withdrawal Successful"
        message="Your referral earnings have been transferred successfully."
        amount={lastWithdrawAmount}
        from="Referral Balance"
        to="Game Wallet"
      />
    </div>
  );
}