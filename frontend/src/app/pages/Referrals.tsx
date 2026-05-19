import { Users, Copy, Gift, TrendingUp, Check } from 'lucide-react';
import { TopBar } from '../components/TopBar';
import { BackButton } from '../components/BackButton';
import { useUser } from '../context/UserContext';
import { toast } from 'sonner';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { useState } from 'react';

export function Referrals() {
  const { formatCurrency } = useUser();
  const [copied, setCopied] = useState(false);
  const referralCode = 'GAME2024XYZ';
  const referralLink = `https://gamingplatform.com/ref/${referralCode}`;

  const stats = {
    totalReferrals: 12,
    activeReferrals: 8,
    totalEarnings: 6000,
    pendingEarnings: 1500,
  };

  const recentReferrals = [
    { id: 1, username: 'User_7834', status: 'Active', earnings: 500, date: 'Apr 5, 2026' },
    { id: 2, username: 'User_5621', status: 'Active', earnings: 500, date: 'Apr 3, 2026' },
    { id: 3, username: 'User_9102', status: 'Pending', earnings: 0, date: 'Apr 2, 2026' },
    { id: 4, username: 'User_4563', status: 'Active', earnings: 500, date: 'Mar 28, 2026' },
  ];

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Referral link copied to clipboard!');
  };

  return (
    <div className="min-h-screen overflow-y-auto" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <TopBar />

      <div className="w-full max-w-[480px] md:max-w-[768px] lg:max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8 pb-20">
        <BackButton />
        
        <div className="flex items-center gap-3" style={{ marginBottom: '20px' }}>
          <Users style={{ width: '20px', height: '20px', color: '#3B82F6' }} />
          <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#F0F4F9', letterSpacing: '-0.01em' }}>
            Referral Program
          </h1>
        </div>

        {/* Referral Link - PREMIUM GLASS CARD */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl relative overflow-hidden" 
          style={{ 
            background: 'linear-gradient(135deg, #1E3A8A, #2563EB)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
            padding: '16px',
            marginBottom: '12px'
          }}
        >
          {/* Glass overlay for depth */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(0,0,0,0.15))'
            }}
          />
          
          <div className="relative z-10">
            <h2 style={{ color: '#FFFFFF', fontSize: '13px', fontWeight: '600', marginBottom: '8px', letterSpacing: '-0.01em' }}>
              Your Referral Link
            </h2>
            
            {/* Compact Horizontal Layout */}
            <div className="flex gap-3 items-stretch mb-3">
              <input
                type="text"
                value={referralLink}
                readOnly
                className="flex-1 rounded-xl min-w-0"
                style={{ 
                  backgroundColor: '#F1F5F9', 
                  color: '#0F172A',
                  padding: '0 14px',
                  fontSize: '12px',
                  fontWeight: '500',
                  border: 'none',
                  height: '44px'
                }}
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={copyReferralLink}
                className="rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                style={{ 
                  background: copied 
                    ? 'linear-gradient(135deg, #22C55E, #16A34A)' 
                    : 'linear-gradient(135deg, #FFFFFF, #F1F5F9)',
                  color: copied ? '#FFFFFF' : '#1E3A8A',
                  padding: '0 20px',
                  border: 'none',
                  height: '44px',
                  minWidth: '100px',
                  boxShadow: copied 
                    ? '0 4px 12px rgba(34, 197, 94, 0.3)' 
                    : '0 2px 8px rgba(255, 255, 255, 0.2)',
                  flexShrink: 0
                }}
              >
                {copied ? (
                  <>
                    <Check style={{ width: '16px', height: '16px' }} />
                    <span className="text-sm">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy style={{ width: '16px', height: '16px' }} />
                    <span className="text-sm">Copy</span>
                  </>
                )}
              </motion.button>
            </div>
            
            <p style={{ color: '#D1D9E6', fontSize: '11px', lineHeight: '1.3' }}>
              💰 Earn {formatCurrency(500)} for every friend who signs up and completes verification!
            </p>
          </div>
        </motion.div>

        {/* Stats Grid - CONNECTED SYSTEM */}
        <div className="grid grid-cols-2 sm:grid-cols-4" style={{ gap: '10px', marginBottom: '12px' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-lg text-center" 
            style={{ 
              backgroundColor: '#131A24',
              background: 'linear-gradient(135deg, #131A24, rgba(59,130,246,0.05))',
              border: '1px solid rgba(255, 255, 255, 0.04)', 
              padding: '10px',
              boxShadow: '0 3px 10px rgba(0,0,0,0.15)'
            }}
          >
            <p style={{ fontSize: '18px', fontWeight: '700', color: '#3B82F6', marginBottom: '2px', letterSpacing: '-0.01em' }}>
              {stats.totalReferrals}
            </p>
            <p style={{ fontSize: '10px', color: '#7A8A9F' }}>Total Referrals</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-lg text-center" 
            style={{ 
              backgroundColor: '#131A24',
              background: 'linear-gradient(135deg, #131A24, rgba(34,197,94,0.05))',
              border: '1px solid rgba(255, 255, 255, 0.04)', 
              padding: '10px',
              boxShadow: '0 3px 10px rgba(0,0,0,0.15)'
            }}
          >
            <p style={{ fontSize: '18px', fontWeight: '700', color: '#22C55E', marginBottom: '2px', letterSpacing: '-0.01em' }}>
              {stats.activeReferrals}
            </p>
            <p style={{ fontSize: '10px', color: '#7A8A9F' }}>Active</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-lg text-center" 
            style={{ 
              backgroundColor: '#131A24',
              background: 'linear-gradient(135deg, #131A24, rgba(255,215,0,0.05))',
              border: '1px solid rgba(255, 255, 255, 0.04)', 
              padding: '10px',
              boxShadow: '0 3px 10px rgba(0,0,0,0.15)'
            }}
          >
            <p style={{ fontSize: '18px', fontWeight: '700', color: '#FFD700', marginBottom: '2px', letterSpacing: '-0.01em' }}>
              {formatCurrency(stats.totalEarnings)}
            </p>
            <p style={{ fontSize: '10px', color: '#7A8A9F' }}>Total Earned</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-lg text-center" 
            style={{ 
              backgroundColor: '#131A24',
              background: 'linear-gradient(135deg, #131A24, rgba(245,158,11,0.05))',
              border: '1px solid rgba(255, 255, 255, 0.04)', 
              padding: '10px',
              boxShadow: '0 3px 10px rgba(0,0,0,0.15)'
            }}
          >
            <p style={{ fontSize: '18px', fontWeight: '700', color: '#F59E0B', marginBottom: '2px', letterSpacing: '-0.01em' }}>
              {formatCurrency(stats.pendingEarnings)}
            </p>
            <p style={{ fontSize: '10px', color: '#7A8A9F' }}>Pending</p>
          </motion.div>
        </div>

        {/* Quick Access to Referral Wallet */}
        <Link to="/referral-wallet">
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-lg flex items-center justify-between cursor-pointer transition-all" 
            style={{ 
              backgroundColor: 'rgba(59, 130, 246, 0.08)',
              border: '1px solid rgba(59, 130, 246, 0.12)',
              padding: '12px',
              marginBottom: '12px',
              boxShadow: '0 3px 10px rgba(0,0,0,0.15)'
            }}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#3B82F6', width: '34px', height: '34px' }}>
                <Gift style={{ width: '17px', height: '17px', color: '#FFFFFF' }} />
              </div>
              <div className="min-w-0">
                <p style={{ fontWeight: '600', color: '#F0F4F9', fontSize: '14px', marginBottom: '2px', letterSpacing: '-0.01em' }}>
                  Referral Wallet
                </p>
                <p style={{ fontSize: '11px', color: '#7A8A9F' }}>
                  View and withdraw earnings
                </p>
              </div>
            </div>
            <p className="flex-shrink-0 ml-3" style={{ fontSize: '18px', fontWeight: '700', color: '#3B82F6', letterSpacing: '-0.01em' }}>
              {formatCurrency(3500)}
            </p>
          </motion.div>
        </Link>

        {/* Recent Referrals - SHARP LIST */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-lg" 
          style={{ 
            backgroundColor: '#131A24', 
            border: '1px solid rgba(255, 255, 255, 0.04)', 
            padding: '14px', 
            marginBottom: '12px',
            boxShadow: '0 3px 10px rgba(0,0,0,0.15)'
          }}
        >
          <div className="flex items-center gap-2" style={{ marginBottom: '10px' }}>
            <TrendingUp style={{ width: '17px', height: '17px', color: '#3B82F6' }} />
            <h2 style={{ fontSize: '14px', fontWeight: '600', color: '#F0F4F9', letterSpacing: '-0.01em' }}>
              Recent Referrals
            </h2>
          </div>

          <div>
            {recentReferrals.map((referral, index) => (
              <motion.div
                key={referral.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + index * 0.05 }}
                whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-between transition-all cursor-pointer rounded-lg"
                style={{ 
                  backgroundColor: 'transparent',
                  padding: '10px 6px',
                  borderBottom: index < recentReferrals.length - 1 ? '1px solid rgba(255, 255, 255, 0.03)' : 'none'
                }}
              >
                <div className="flex-1 min-w-0 mr-3">
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#F0F4F9', marginBottom: '2px', letterSpacing: '-0.01em' }}>
                    {referral.username}
                  </p>
                  <p style={{ fontSize: '10px', color: '#6B7A8F' }}>
                    {referral.date}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p style={{ 
                    fontSize: '13px', 
                    fontWeight: '700', 
                    color: referral.status === 'Active' ? '#22C55E' : '#F59E0B',
                    marginBottom: '5px',
                    letterSpacing: '-0.01em'
                  }}>
                    {referral.status === 'Active' ? formatCurrency(referral.earnings) : 'Pending'}
                  </p>
                  <span
                    className="rounded-full inline-flex items-center justify-center"
                    style={{
                      backgroundColor: referral.status === 'Active' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                      color: referral.status === 'Active' ? '#22C55E' : '#F59E0B',
                      padding: '3px 8px',
                      fontSize: '10px',
                      fontWeight: '500',
                      height: '20px',
                      letterSpacing: '0.2px'
                    }}
                  >
                    {referral.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* How it Works - CLEAN */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-lg" 
          style={{ 
            backgroundColor: '#131A24', 
            border: '1px solid rgba(255, 255, 255, 0.04)', 
            padding: '14px',
            boxShadow: '0 3px 10px rgba(0,0,0,0.15)'
          }}
        >
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#F0F4F9', marginBottom: '8px', letterSpacing: '-0.01em' }}>
            📋 How It Works
          </h3>
          <ul style={{ fontSize: '12px', color: '#7A8A9F', lineHeight: 1.3 }}>
            <li className="flex items-start gap-2" style={{ marginBottom: '4px' }}>
              <Check style={{ width: '13px', height: '13px', marginTop: '1px', flexShrink: 0, color: '#7A8A9F' }} />
              <span>Share your unique referral link with friends</span>
            </li>
            <li className="flex items-start gap-2" style={{ marginBottom: '4px' }}>
              <Check style={{ width: '13px', height: '13px', marginTop: '1px', flexShrink: 0, color: '#7A8A9F' }} />
              <span>Earn {formatCurrency(500)} when they sign up and verify</span>
            </li>
            <li className="flex items-start gap-2" style={{ marginBottom: '4px' }}>
              <Check style={{ width: '13px', height: '13px', marginTop: '1px', flexShrink: 0, color: '#7A8A9F' }} />
              <span>Earnings are added to your Referral Wallet</span>
            </li>
            <li className="flex items-start gap-2" style={{ marginBottom: '4px' }}>
              <Check style={{ width: '13px', height: '13px', marginTop: '1px', flexShrink: 0, color: '#7A8A9F' }} />
              <span>Withdraw anytime to your main wallet</span>
            </li>
            <li className="flex items-start gap-2">
              <Check style={{ width: '13px', height: '13px', marginTop: '1px', flexShrink: 0, color: '#7A8A9F' }} />
              <span>No limit on referrals!</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}