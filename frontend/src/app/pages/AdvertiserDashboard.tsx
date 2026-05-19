import { useState } from 'react';
import { Megaphone, Plus, TrendingUp, Eye, MousePointerClick, Users, DollarSign, ArrowRightLeft, ArrowUpCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { TopBar } from '../components/TopBar';
import { BackButton } from '../components/BackButton';
import { SuccessCard } from '../components/SuccessCard';
import { useUser } from '../context/UserContext';
import { toast } from 'sonner';

interface Campaign {
  id: number;
  title: string;
  taskType: string;
  budget: number;
  rewardPerUser: number;
  status: 'active' | 'completed' | 'paused';
  stats: {
    views: number;
    clicks: number;
    conversions: number;
  };
}

export function AdvertiserDashboard() {
  const { isVIP, formatUSDT, formatCurrency, gameBalance, updateGameBalance, advertiseBalance, setAdvertiseBalance } = useUser();
  const navigate = useNavigate();
  
  const [showFundModal, setShowFundModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [successDetails, setSuccessDetails] = useState({
    title: '',
    message: '',
    amount: 0,
    from: '',
    to: ''
  });
  const [fundAmount, setFundAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  // Mock campaigns data
  const [campaigns] = useState<Campaign[]>([
    {
      id: 1,
      title: 'Download Finance App',
      taskType: 'Install app',
      budget: 50000,
      rewardPerUser: 100,
      status: 'active',
      stats: {
        views: 1240,
        clicks: 450,
        conversions: 180
      }
    },
    {
      id: 2,
      title: 'Visit E-commerce Store',
      taskType: 'Visit site',
      budget: 30000,
      rewardPerUser: 50,
      status: 'active',
      stats: {
        views: 850,
        clicks: 320,
        conversions: 240
      }
    },
    {
      id: 3,
      title: 'Watch Product Demo',
      taskType: 'Watch video',
      budget: 15000,
      rewardPerUser: 25,
      status: 'completed',
      stats: {
        views: 2100,
        clicks: 890,
        conversions: 600
      }
    }
  ]);

  const campaignBalance = 125000;
  const totalSpent = campaigns.reduce((sum, c) => sum + (c.stats.conversions * c.rewardPerUser), 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + c.stats.conversions, 0);

  const handleFund = () => {
    const amount = parseFloat(fundAmount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (amount > gameBalance) {
      toast.error('Insufficient Game Balance');
      return;
    }

    // Deduct from Game Balance
    updateGameBalance(-amount);
    // Credit Advertise Balance
    setAdvertiseBalance(advertiseBalance + amount);
    
    setSuccessDetails({
      title: 'Transaction Successful',
      message: 'Your transaction has been completed successfully.',
      amount: amount,
      from: 'Game Wallet',
      to: 'Advertise Wallet'
    });
    
    setShowFundModal(false);
    setFundAmount('');
    setShowSuccessCard(true);
  };

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (amount > advertiseBalance) {
      toast.error('Insufficient Advertise Balance');
      return;
    }

    // Deduct from Advertise Balance
    setAdvertiseBalance(advertiseBalance - amount);
    // Credit Game Balance
    updateGameBalance(amount);
    
    setSuccessDetails({
      title: 'Transaction Successful',
      message: 'Your transaction has been completed successfully.',
      amount: amount,
      from: 'Advertise Wallet',
      to: 'Game Wallet'
    });
    
    setShowWithdrawModal(false);
    setWithdrawAmount('');
    setShowSuccessCard(true);
  };

  // Redirect if not VIP
  if (!isVIP) {
    navigate('/upgrade');
    return null;
  }

  return (
    <div className="min-h-screen overflow-y-auto" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <TopBar />
      
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <BackButton />

        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Megaphone className="w-8 h-8" style={{ color: '#0A84FF' }} />
            <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              Advertise & Earn
            </h1>
          </div>
          <Link to="/advertiser/create">
            <button className="px-6 py-3 rounded-lg text-white font-medium flex items-center gap-2" style={{ backgroundColor: '#0A84FF' }}>
              <Plus className="w-5 h-5" />
              Create Campaign
            </button>
          </Link>
        </div>

        {/* Advertise Balance Card */}
        <div className="rounded-lg p-6 mb-6 shadow-lg" style={{ background: 'linear-gradient(135deg, #0A84FF 0%, #0066CC 100%)' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/80 text-sm mb-1">Advertise Wallet Balance</p>
              <p className="text-white text-3xl font-bold">{formatCurrency(advertiseBalance, true)}</p>
            </div>
            <DollarSign className="w-12 h-12 text-white/30" />
          </div>
          
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setShowFundModal(true)}
              className="flex-1 py-2 rounded-lg text-white font-medium flex items-center justify-center gap-2 border-2 border-white/30 hover:bg-white/10 transition-colors"
            >
              <ArrowUpCircle className="w-4 h-4" />
              Fund
            </button>
            <button
              onClick={() => setShowWithdrawModal(true)}
              className="flex-1 py-2 rounded-lg text-white font-medium flex items-center justify-center gap-2 border-2 border-white/30 hover:bg-white/10 transition-colors"
            >
              <ArrowRightLeft className="w-4 h-4" />
              Withdraw
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="rounded-lg shadow-sm p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5" style={{ color: '#22C55E' }} />
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Total Spent</p>
            </div>
            <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {formatCurrency(totalSpent, true)}
            </p>
          </div>

          <div className="rounded-lg shadow-sm p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5" style={{ color: '#0A84FF' }} />
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Conversions</p>
            </div>
            <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {totalConversions.toLocaleString()}
            </p>
          </div>

          <div className="rounded-lg shadow-sm p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-5 h-5" style={{ color: '#F59E0B' }} />
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Active Campaigns</p>
            </div>
            <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {campaigns.filter(c => c.status === 'active').length}
            </p>
          </div>

          <div className="rounded-lg shadow-sm p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5" style={{ color: '#8B5CF6' }} />
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Campaign Balance</p>
            </div>
            <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {formatCurrency(campaignBalance, true)}
            </p>
          </div>
        </div>

        {/* Campaigns List */}
        <div className="rounded-lg shadow-sm p-6" style={{ backgroundColor: 'var(--bg-card)' }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Your Campaigns
          </h2>

          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="border rounded-lg p-4"
                style={{ borderColor: 'var(--border-color)' }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                      {campaign.title}
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {campaign.taskType} • {formatCurrency(campaign.rewardPerUser, true)} per user
                    </p>
                  </div>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: campaign.status === 'active' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                      color: campaign.status === 'active' ? '#22C55E' : '#6B7280'
                    }}
                  >
                    {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <Eye className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Views</p>
                    </div>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {campaign.stats.views.toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <MousePointerClick className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Clicks</p>
                    </div>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {campaign.stats.clicks.toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <Users className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Conversions</p>
                    </div>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {campaign.stats.conversions.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
                  <div className="flex items-center justify-between text-sm">
                    <span style={{ color: 'var(--text-secondary)' }}>Budget:</span>
                    <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {formatCurrency(campaign.budget, true)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fund Modal */}
      {showFundModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="rounded-lg shadow-lg max-w-md w-full p-6" style={{ backgroundColor: 'var(--bg-card)' }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Fund Advertise Wallet
            </h2>

            <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-accent)' }}>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Game Wallet Balance: <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(gameBalance, true)}</span>
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Amount (USDT)
              </label>
              <input
                type="number"
                step="0.01"
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-4 py-3 border rounded-lg"
                style={{ 
                  borderColor: 'var(--border-color)', 
                  color: 'var(--text-primary)',
                  backgroundColor: 'var(--bg-secondary)'
                }}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowFundModal(false);
                  setFundAmount('');
                }}
                className="flex-1 py-3 rounded-lg border-2 font-medium"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleFund}
                className="flex-1 py-3 rounded-lg text-white font-medium"
                style={{ backgroundColor: '#0A84FF' }}
              >
                Fund Wallet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="rounded-lg shadow-lg max-w-md w-full p-6" style={{ backgroundColor: 'var(--bg-card)' }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Withdraw to Game Wallet
            </h2>

            <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-accent)' }}>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Advertise Wallet Balance: <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(advertiseBalance, true)}</span>
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Amount (USDT)
              </label>
              <input
                type="number"
                step="0.01"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-4 py-3 border rounded-lg"
                style={{ 
                  borderColor: 'var(--border-color)', 
                  color: 'var(--text-primary)',
                  backgroundColor: 'var(--bg-secondary)'
                }}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowWithdrawModal(false);
                  setWithdrawAmount('');
                }}
                className="flex-1 py-3 rounded-lg border-2 font-medium"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleWithdraw}
                className="flex-1 py-3 rounded-lg text-white font-medium"
                style={{ backgroundColor: '#0A84FF' }}
              >
                Withdraw
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Card */}
      {showSuccessCard && (
        <SuccessCard
          title={successDetails.title}
          message={successDetails.message}
          amount={successDetails.amount}
          from={successDetails.from}
          to={successDetails.to}
          onClose={() => setShowSuccessCard(false)}
        />
      )}
    </div>
  );
}