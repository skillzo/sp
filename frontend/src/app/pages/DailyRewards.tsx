import { Gift, Lock, CheckCircle } from 'lucide-react';
import { TopBar } from '../components/TopBar';
import { BackButton } from '../components/BackButton';
import { SuccessCard } from '../components/SuccessCard';
import { useUser } from '../context/UserContext';
import { Link } from 'react-router';
import { useState } from 'react';
import { toast } from 'sonner';

export function DailyRewards() {
  const { isVIP, updateGameBalance, formatUSDT } = useUser();
  const [claimedToday, setClaimedToday] = useState(false);
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [rewardAmount, setRewardAmount] = useState(0);

  const weeklyRewards = [
    { day: 'Monday', reward: 300, claimed: true },
    { day: 'Tuesday', reward: 300, claimed: true },
    { day: 'Wednesday', reward: 300, claimed: false, isToday: true },
    { day: 'Thursday', reward: 300, claimed: false },
    { day: 'Friday', reward: 500, claimed: false },
    { day: 'Saturday', reward: 500, claimed: false },
    { day: 'Sunday', reward: 1000, claimed: false },
  ];

  const claimReward = () => {
    if (claimedToday) {
      toast.error('Already claimed today\'s reward');
      return;
    }

    const todayReward = weeklyRewards.find(r => r.isToday);
    if (todayReward) {
      // Credit Game Balance
      updateGameBalance(todayReward.reward);
      setClaimedToday(true);
      setRewardAmount(todayReward.reward);
      
      // Show success card
      setShowSuccessCard(true);
    }
  };

  if (!isVIP) {
    return (
      <div className="min-h-screen overflow-y-auto" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <TopBar />

        <div className="w-full max-w-[480px] md:max-w-[768px] lg:max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8 pb-20">
          <BackButton />
          
          <div className="flex items-center gap-3 mb-6">
            <Gift className="w-8 h-8" style={{ color: '#0A84FF' }} />
            <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              Daily Rewards
            </h1>
          </div>

          <div className="rounded-lg shadow-sm p-8 text-center" style={{ backgroundColor: 'var(--bg-card)' }}>
            <Lock className="w-16 h-16 mx-auto mb-4" style={{ color: '#EF4444' }} />
            <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              VIP Only Feature
            </h2>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
              Upgrade to VIP to unlock daily rewards and earn up to {formatUSDT(1000)} every Sunday!
            </p>
            <Link to="/upgrade">
              <button
                className="px-8 py-3 rounded-lg text-white font-medium"
                style={{ backgroundColor: '#0A84FF' }}
              >
                Upgrade to VIP
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-y-auto" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <TopBar />

      <div className="w-full max-w-[480px] md:max-w-[768px] lg:max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8 pb-20">
        <BackButton />
        
        <div className="flex items-center gap-3 mb-6">
          <Gift className="w-8 h-8" style={{ color: '#FFD700' }} />
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Daily Rewards
          </h1>
        </div>

        {/* Weekly Progress */}
        <div className="rounded-lg shadow-sm p-6 mb-6" style={{ backgroundColor: 'var(--bg-card)' }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Weekly Progress
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {weeklyRewards.map((day, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg text-center transition-all ${
                  day.isToday ? 'ring-2 ring-blue-500' : ''
                }`}
                style={{
                  backgroundColor: day.claimed ? 'rgba(52, 211, 153, 0.1)' : 'var(--bg-accent)',
                }}
              >
                {day.claimed && (
                  <CheckCircle className="w-5 h-5 mx-auto mb-2" style={{ color: '#34D399' }} />
                )}
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                  {day.day}
                </p>
                <p className="text-lg font-bold" style={{ color: day.claimed ? '#34D399' : '#0A84FF' }}>
                  {formatUSDT(day.reward)}
                </p>
                {day.isToday && !day.claimed && (
                  <span className="text-xs px-2 py-1 rounded-full mt-2 inline-block" style={{ backgroundColor: '#0A84FF', color: 'white' }}>
                    Today
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Claim Button */}
        <div className="rounded-lg shadow-sm p-6 mb-6" style={{ backgroundColor: 'var(--bg-card)' }}>
          <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
            Today's Reward
          </h3>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-3xl font-bold mb-1" style={{ color: '#FFD700' }}>
                {formatUSDT(300)}
              </p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Available to claim
              </p>
            </div>
            <button
              onClick={claimReward}
              disabled={claimedToday}
              className="px-6 py-3 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-transform active:scale-95"
              style={{ backgroundColor: '#FFD700' }}
            >
              {claimedToday ? '✓ Claimed' : 'Claim Reward'}
            </button>
          </div>
        </div>

        {/* Reward Info */}
        <div className="rounded-lg shadow-sm p-6" style={{ backgroundColor: 'var(--bg-card)' }}>
          <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
            📋 How It Works
          </h3>
          <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <li>• Login daily to claim your reward</li>
            <li>• Earn {formatUSDT(300)} on weekdays (Mon-Thu)</li>
            <li>• Earn {formatUSDT(500)} on Fri-Sat</li>
            <li>• Earn {formatUSDT(1000)} on Sundays!</li>
            <li>• Rewards reset every week</li>
          </ul>
        </div>
      </div>

      {/* Success Card */}
      <SuccessCard
        isOpen={showSuccessCard}
        onClose={() => setShowSuccessCard(false)}
        title="Reward Claimed"
        message="Your daily reward has been successfully added."
        amount={rewardAmount}
        to="Game Wallet"
        icon="gift"
        buttonText="Continue"
      />
    </div>
  );
}