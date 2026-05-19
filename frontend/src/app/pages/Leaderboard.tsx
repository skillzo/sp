import { Trophy, Crown, Zap, Gift, Users, Share2, Copy, ChevronRight, ArrowUp, ArrowDown, Minus, Flame, Star, Target, Award, Sparkles, Check, Lock } from 'lucide-react';
import { TopBar } from '../components/TopBar';
import { BackButton } from '../components/BackButton';
import { useUser } from '../context/UserContext';
import { useState } from 'react';
import { toast } from 'sonner';

export function Leaderboard() {
  const { formatUSDT } = useUser();
  const [showShareModal, setShowShareModal] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [canClaimReward, setCanClaimReward] = useState(true);
  const [rewardClaimed, setRewardClaimed] = useState(false);

  const currentUser = {
    rank: 47,
    username: 'You',
    earnings: 12500,
    wins: 28,
    streak: 5,
    rankChange: 3,
    winsToNextRank: 2,
    nextRankTarget: 30,
    dailyStreak: 7,
    winStreak: 3,
  };

  const leaders = [
    { rank: 1, username: 'CryptoKing_2026', earnings: 125000, wins: 542, streak: 25, rankChange: 0, badges: ['fire', 'crown', 'star'] },
    { rank: 2, username: 'DiamondHands_99', earnings: 98500, wins: 428, streak: 18, rankChange: 1, badges: ['fire', 'star'] },
    { rank: 3, username: 'MoonShot_Elite', earnings: 87200, wins: 385, streak: 15, rankChange: -1, badges: ['fire', 'star'] },
    { rank: 4, username: 'ProTrader_777', earnings: 76000, wins: 348, streak: 12, rankChange: 2, badges: ['star'] },
    { rank: 5, username: 'BetMaster_2K', earnings: 68500, wins: 312, streak: 10, rankChange: -1, badges: ['star'] },
    { rank: 6, username: 'LuckyWhale_88', earnings: 62000, wins: 289, streak: 8, rankChange: 0, badges: [] },
    { rank: 7, username: 'GameChanger_X', earnings: 58500, wins: 267, streak: 7, rankChange: 3, badges: [] },
    { rank: 8, username: 'WinStreak_PRO', earnings: 54000, wins: 245, streak: 9, rankChange: -2, badges: ['fire'] },
    { rank: 9, username: 'TopGun_2026', earnings: 49500, wins: 228, streak: 6, rankChange: 1, badges: [] },
    { rank: 10, username: 'ElitePlayer_1', earnings: 46000, wins: 215, streak: 5, rankChange: 0, badges: [] },
  ];

  const rewards = [
    { tier: 'Top 1', prize: 500, icon: '👑', color: '#FFD700' },
    { tier: 'Top 3', prize: 250, icon: '🥇', color: '#FFA500' },
    { tier: 'Top 10', prize: 100, icon: '🏆', color: '#0A84FF' },
    { tier: 'Top 30', prize: 50, icon: '🎯', color: '#34D399' },
    { tier: 'Top 50', prize: 25, icon: '⭐', color: '#A78BFA' },
  ];

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleCopyReferral = () => {
    const referralCode = 'REF2026XYZ';
    navigator.clipboard.writeText(`Join me on the platform! Use code: ${referralCode}`);
    toast.success('Referral link copied!');
  };

  const handleClaimReward = () => {
    if (!canClaimReward || rewardClaimed) {
      toast.info('No rewards available to claim right now');
      return;
    }
    setShowRewardModal(true);
    setRewardClaimed(true);
    setTimeout(() => {
      setShowRewardModal(false);
    }, 3000);
  };

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case 'fire': return <Flame className="w-3.5 h-3.5" style={{ color: '#FF6B35' }} />;
      case 'crown': return <Crown className="w-3.5 h-3.5" style={{ color: '#FFD700' }} />;
      case 'star': return <Star className="w-3.5 h-3.5" style={{ color: '#FFA500' }} />;
      default: return null;
    }
  };

  const getRankChangeIndicator = (change: number) => {
    if (change > 0) {
      return (
        <div className="flex items-center gap-1">
          <ArrowUp className="w-3.5 h-3.5" style={{ color: '#34D399' }} />
          <span className="text-xs font-semibold" style={{ color: '#34D399' }}>+{change}</span>
        </div>
      );
    } else if (change < 0) {
      return (
        <div className="flex items-center gap-1">
          <ArrowDown className="w-3.5 h-3.5" style={{ color: '#EF4444' }} />
          <span className="text-xs font-semibold" style={{ color: '#EF4444' }}>{change}</span>
        </div>
      );
    }
    return <Minus className="w-3.5 h-3.5" style={{ color: '#6B7280' }} />;
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0B0F1A' }}>
      {/* HEADER */}
      <TopBar />

      {/* GLOBAL FRAME: Fill container, Max-width 1200px, Center aligned */}
      <div className="w-full max-w-[1200px] mx-auto px-4 md:px-6 flex-1 pb-32">
        
        {/* SECTION STRUCTURE: Auto Layout Vertical Stack, Spacing 16-24px */}
        <div className="flex flex-col gap-6">
          
          {/* Back Button Section */}
          <div className="w-full">
            <BackButton />
          </div>

          {/* PAGE TITLE Section - Fill Container */}
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 flex-shrink-0 rounded-2xl flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                boxShadow: '0 4px 16px rgba(255, 215, 0, 0.2)'
              }}>
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-white truncate">Leaderboard</h1>
                <p className="text-sm text-gray-400 truncate">Compete & Win Rewards</p>
              </div>
            </div>
            <button 
              onClick={handleShare}
              className="w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center transition-transform active:scale-95"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <Share2 className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* TOP PODIUM - Horizontal Auto Layout with Wrap, Gap 12-16px, Center Aligned */}
          <div className="w-full flex flex-col md:flex-row items-center justify-center gap-4">
            
            {/* Rank #2 - Fill Container, Max-width 200px */}
            <div className="w-full md:w-auto md:flex-1 md:max-w-[200px] order-2 md:order-1">
              <div 
                className="w-full rounded-2xl p-5 text-center transition-transform hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, rgba(192, 192, 192, 0.1) 0%, rgba(192, 192, 192, 0.05) 100%)',
                  border: '1px solid rgba(192, 192, 192, 0.2)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
                }}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center" style={{
                    background: 'linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%)',
                  }}>
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  
                  <div className="w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center font-bold text-white" style={{
                    backgroundColor: '#C0C0C0'
                  }}>
                    2
                  </div>
                  
                  <p className="w-full font-bold text-sm text-white truncate">
                    {leaders[1].username}
                  </p>
                  
                  <p className="text-lg font-bold" style={{ color: '#C0C0C0' }}>
                    {formatUSDT(leaders[1].earnings)}
                  </p>
                  
                  <div className="flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#FF6B35' }} />
                    <span className="text-xs font-medium text-gray-400">
                      {leaders[1].streak} streak
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-500">{leaders[1].wins} wins</p>
                </div>
              </div>
            </div>

            {/* Rank #1 - Fill Container, Max-width 260px */}
            <div className="w-full md:w-auto md:flex-1 md:max-w-[260px] order-1 md:order-2">
              <div 
                className="w-full rounded-2xl p-6 text-center transition-transform hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 165, 0, 0.1) 100%)',
                  border: '1px solid rgba(255, 215, 0, 0.3)',
                  boxShadow: '0 8px 24px rgba(255, 215, 0, 0.2), 0 0 40px rgba(255, 215, 0, 0.1)'
                }}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 flex-shrink-0 rounded-full flex items-center justify-center" style={{
                    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                    boxShadow: '0 0 20px rgba(255, 215, 0, 0.4)'
                  }}>
                    <Crown className="w-7 h-7 text-white" />
                  </div>
                  
                  <div className="w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center font-bold text-lg text-white" style={{
                    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                  }}>
                    1
                  </div>
                  
                  <p className="w-full font-bold text-base text-white truncate">
                    {leaders[0].username}
                  </p>
                  
                  <p className="text-xl font-bold" style={{ color: '#FFD700' }}>
                    {formatUSDT(leaders[0].earnings)}
                  </p>
                  
                  <div className="flex items-center gap-1">
                    <Flame className="w-4 h-4 flex-shrink-0" style={{ color: '#FF6B35' }} />
                    <span className="text-sm font-semibold" style={{ color: '#FF6B35' }}>
                      {leaders[0].streak} streak
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {leaders[0].badges.map((badge, idx) => (
                      <div key={idx} className="w-6 h-6 flex-shrink-0 rounded-full flex items-center justify-center" style={{
                        backgroundColor: 'rgba(255, 215, 0, 0.1)'
                      }}>
                        {getBadgeIcon(badge)}
                      </div>
                    ))}
                  </div>
                  
                  <p className="text-xs text-gray-500">{leaders[0].wins} wins</p>
                </div>
              </div>
            </div>

            {/* Rank #3 - Fill Container, Max-width 200px */}
            <div className="w-full md:w-auto md:flex-1 md:max-w-[200px] order-3">
              <div 
                className="w-full rounded-2xl p-5 text-center transition-transform hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, rgba(205, 127, 50, 0.1) 0%, rgba(205, 127, 50, 0.05) 100%)',
                  border: '1px solid rgba(205, 127, 50, 0.2)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
                }}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center" style={{
                    background: 'linear-gradient(135deg, #CD7F32 0%, #B87333 100%)',
                  }}>
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  
                  <div className="w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center font-bold text-white" style={{
                    backgroundColor: '#CD7F32'
                  }}>
                    3
                  </div>
                  
                  <p className="w-full font-bold text-sm text-white truncate">
                    {leaders[2].username}
                  </p>
                  
                  <p className="text-lg font-bold" style={{ color: '#CD7F32' }}>
                    {formatUSDT(leaders[2].earnings)}
                  </p>
                  
                  <div className="flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#FF6B35' }} />
                    <span className="text-xs font-medium text-gray-400">
                      {leaders[2].streak} streak
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-500">{leaders[2].wins} wins</p>
                </div>
              </div>
            </div>
          </div>

          {/* YOUR POSITION CARD - Fill Container, Internal Padding 16-20px */}
          <div 
            className="w-full rounded-2xl p-5 flex flex-col gap-5"
            style={{
              background: 'linear-gradient(135deg, rgba(10, 132, 255, 0.1) 0%, rgba(10, 132, 255, 0.05) 100%)',
              border: '1px solid rgba(10, 132, 255, 0.2)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
            }}
          >
            {/* Top Row: Rank + Earnings - Auto Layout Horizontal */}
            <div className="w-full flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-12 h-12 flex-shrink-0 rounded-xl flex items-center justify-center font-bold text-lg text-white" style={{
                  background: 'linear-gradient(135deg, #0A84FF 0%, #0066CC 100%)',
                }}>
                  #{currentUser.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white truncate">Your Position</p>
                  <div className="flex items-center gap-1 mt-1">
                    {getRankChangeIndicator(currentUser.rankChange)}
                  </div>
                </div>
              </div>
              
              <div className="text-right flex-shrink-0">
                <p className="text-2xl font-bold" style={{ color: '#0A84FF' }}>
                  {formatUSDT(currentUser.earnings)}
                </p>
                <p className="text-xs text-gray-400">{currentUser.wins} wins</p>
              </div>
            </div>

            {/* Progress Section - Fill Container */}
            <div className="w-full flex flex-col gap-2">
              <div className="w-full flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-300 truncate flex-1">
                  Progress to Top {currentUser.nextRankTarget}
                </p>
                <p className="text-sm font-semibold flex-shrink-0" style={{ color: '#0A84FF' }}>
                  {currentUser.winsToNextRank} more wins
                </p>
              </div>
              
              {/* Progress Bar - Fill Container */}
              <div className="w-full relative h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(10, 132, 255, 0.15)' }}>
                <div 
                  className="absolute top-0 left-0 h-full rounded-full"
                  style={{
                    width: `${((currentUser.wins) / (currentUser.wins + currentUser.winsToNextRank)) * 100}%`,
                    background: 'linear-gradient(90deg, #0A84FF 0%, #0066CC 100%)',
                  }}
                />
              </div>
            </div>

            {/* Badges Row - Auto Layout Horizontal Wrap */}
            <div className="w-full flex flex-wrap gap-2">
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg" style={{
                backgroundColor: 'rgba(255, 107, 53, 0.1)',
                border: '1px solid rgba(255, 107, 53, 0.2)'
              }}>
                <Flame className="w-4 h-4 flex-shrink-0" style={{ color: '#FF6B35' }} />
                <span className="text-xs font-semibold whitespace-nowrap" style={{ color: '#FF6B35' }}>
                  {currentUser.streak} Win Streak
                </span>
              </div>
              
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg" style={{
                backgroundColor: 'rgba(52, 211, 153, 0.1)',
                border: '1px solid rgba(52, 211, 153, 0.2)'
              }}>
                <Zap className="w-4 h-4 flex-shrink-0" style={{ color: '#34D399' }} />
                <span className="text-xs font-semibold whitespace-nowrap" style={{ color: '#34D399' }}>
                  Active Player
                </span>
              </div>
            </div>

            {/* CTA Button - Fill Container */}
            <button 
              className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-transform active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #0A84FF 0%, #0066CC 100%)',
              }}
              onClick={() => window.location.href = '/'}
            >
              <Target className="w-5 h-5 flex-shrink-0" />
              <span>Play to Rank Up</span>
              <ChevronRight className="w-5 h-5 flex-shrink-0" />
            </button>
          </div>

          {/* REWARDS STRIP - Horizontal Scroll Auto Layout, Fixed Width Cards 140-160px */}
          <div className="w-full flex flex-col gap-4">
            <div className="w-full flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Weekly Rewards</h2>
              <p className="text-xs text-gray-400">Resets in 3 days</p>
            </div>
            
            <div className="w-full flex gap-3 overflow-x-auto pb-2" style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(255, 255, 255, 0.1) transparent'
            }}>
              {rewards.map((reward, idx) => {
                const isUserTarget = reward.tier === 'Top 50';
                
                return (
                  <div 
                    key={idx}
                    className="flex-shrink-0 rounded-2xl p-4 transition-transform hover:scale-105"
                    style={{
                      width: '160px',
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                      border: isUserTarget ? `2px solid ${reward.color}` : '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: isUserTarget ? `0 4px 16px ${reward.color}40` : 'none'
                    }}
                  >
                    <div className="flex flex-col gap-2">
                      {isUserTarget && (
                        <div className="flex items-center justify-between">
                          <div className="w-6 h-6 flex-shrink-0 rounded-full flex items-center justify-center" style={{
                            backgroundColor: reward.color
                          }}>
                            <Target className="w-3.5 h-3.5 text-white" />
                          </div>
                          <span className="text-xs font-semibold truncate" style={{ color: reward.color }}>
                            Your Target
                          </span>
                        </div>
                      )}
                      
                      <div className="text-3xl">{reward.icon}</div>
                      <p className="text-xs font-semibold text-gray-400 truncate">
                        {reward.tier}
                      </p>
                      <p className="text-xl font-bold" style={{ color: reward.color }}>
                        ${reward.prize}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* LEADERBOARD LIST - Fill Container */}
          <div className="w-full rounded-2xl p-5 flex flex-col gap-5" style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}>
            <div className="w-full flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Top Players</h2>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <ArrowUp className="w-3 h-3 flex-shrink-0" style={{ color: '#34D399' }} />
                  <span>Up</span>
                </div>
                <div className="flex items-center gap-1">
                  <ArrowDown className="w-3 h-3 flex-shrink-0" style={{ color: '#EF4444' }} />
                  <span>Down</span>
                </div>
              </div>
            </div>

            {/* List Rows - Auto Layout Vertical Stack */}
            <div className="w-full flex flex-col gap-3">
              {leaders.map((leader) => {
                const isCurrentUser = leader.rank === currentUser.rank;
                
                return (
                  <div
                    key={leader.rank}
                    className="w-full flex items-center justify-between gap-4 p-4 rounded-xl transition-all hover:scale-[1.01]"
                    style={{
                      backgroundColor: isCurrentUser 
                        ? 'rgba(10, 132, 255, 0.1)' 
                        : leader.rank <= 3 
                          ? 'rgba(255, 215, 0, 0.05)' 
                          : 'rgba(255, 255, 255, 0.02)',
                      border: isCurrentUser ? '1px solid rgba(10, 132, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    {/* Left: Rank Circle - Fixed 40px */}
                    <div
                      className="w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center font-bold"
                      style={{
                        background: leader.rank === 1 
                          ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
                          : leader.rank === 2
                            ? 'linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%)'
                            : leader.rank === 3
                              ? 'linear-gradient(135deg, #CD7F32 0%, #B87333 100%)'
                              : isCurrentUser
                                ? 'linear-gradient(135deg, #0A84FF 0%, #0066CC 100%)'
                                : 'rgba(255, 255, 255, 0.05)',
                        color: leader.rank <= 3 || isCurrentUser ? 'white' : '#9CA3AF',
                        border: leader.rank <= 3 || isCurrentUser ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      {leader.rank}
                    </div>
                    
                    {/* Middle: Username + Badges - Fill */}
                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-white truncate">
                          {isCurrentUser ? 'You' : leader.username}
                        </p>
                        {leader.badges.length > 0 && (
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {leader.badges.slice(0, 2).map((badge, idx) => (
                              <div key={idx}>
                                {getBadgeIcon(badge)}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 truncate">
                        {leader.wins} wins • {leader.streak} streak
                      </p>
                    </div>
                    
                    {/* Right: Earnings + Rank Change - Hug */}
                    <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
                      <p className="font-bold whitespace-nowrap" style={{ 
                        color: leader.rank === 1 ? '#FFD700' : leader.rank === 2 ? '#C0C0C0' : leader.rank === 3 ? '#CD7F32' : '#0A84FF' 
                      }}>
                        {formatUSDT(leader.earnings)}
                      </p>
                      {getRankChangeIndicator(leader.rankChange)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* View More Button - Fill Container */}
            <button 
              className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-80"
              style={{
                backgroundColor: 'rgba(10, 132, 255, 0.1)',
                color: '#0A84FF',
                border: '1px solid rgba(10, 132, 255, 0.2)'
              }}
            >
              <span>View Full Leaderboard</span>
              <ChevronRight className="w-5 h-5 flex-shrink-0" />
            </button>
          </div>

          {/* STREAK CARDS - Auto Layout: Mobile Vertical, Desktop Horizontal 2 Columns */}
          <div className="w-full flex flex-col md:flex-row gap-4">
            {/* Daily Streak Card - Fill Container */}
            <div 
              className="w-full md:flex-1 rounded-2xl p-5 flex flex-col gap-4"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.1) 0%, rgba(255, 107, 53, 0.05) 100%)',
                border: '1px solid rgba(255, 107, 53, 0.2)',
              }}
            >
              <div className="flex items-center gap-3">
                <Flame className="w-6 h-6 flex-shrink-0" style={{ color: '#FF6B35' }} />
                <h3 className="text-lg font-bold text-white">Daily Streak</h3>
              </div>
              
              <p className="text-4xl font-bold" style={{ color: '#FF6B35' }}>
                {currentUser.dailyStreak} Days
              </p>
              
              <p className="text-sm text-gray-400">
                Keep playing daily to maintain your streak
              </p>
              
              {/* Progress Bar - Fill Container */}
              <div className="w-full flex flex-col gap-2">
                <div className="w-full relative h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255, 107, 53, 0.15)' }}>
                  <div 
                    className="absolute top-0 left-0 h-full rounded-full"
                    style={{
                      width: `${(currentUser.dailyStreak / 10) * 100}%`,
                      background: 'linear-gradient(90deg, #FF6B35 0%, #FF8C42 100%)',
                    }}
                  />
                </div>
                
                <p className="text-xs text-gray-500">
                  {10 - currentUser.dailyStreak} days to next reward
                </p>
              </div>
            </div>

            {/* Win Streak Card - Fill Container */}
            <div 
              className="w-full md:flex-1 rounded-2xl p-5 flex flex-col gap-4"
              style={{
                background: 'linear-gradient(135deg, rgba(52, 211, 153, 0.1) 0%, rgba(52, 211, 153, 0.05) 100%)',
                border: '1px solid rgba(52, 211, 153, 0.2)',
              }}
            >
              <div className="flex items-center gap-3">
                <Zap className="w-6 h-6 flex-shrink-0" style={{ color: '#34D399' }} />
                <h3 className="text-lg font-bold text-white">Win Streak</h3>
              </div>
              
              <p className="text-4xl font-bold" style={{ color: '#34D399' }}>
                {currentUser.winStreak} Wins
              </p>
              
              <p className="text-sm text-gray-400">
                Current winning streak. Keep it going!
              </p>
              
              {/* Progress Bar - Fill Container */}
              <div className="w-full flex flex-col gap-2">
                <div className="w-full relative h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(52, 211, 153, 0.15)' }}>
                  <div 
                    className="absolute top-0 left-0 h-full rounded-full"
                    style={{
                      width: `${(currentUser.winStreak / 5) * 100}%`,
                      background: 'linear-gradient(90deg, #34D399 0%, #10B981 100%)',
                    }}
                  />
                </div>
                
                <p className="text-xs text-gray-500">
                  {5 - currentUser.winStreak} wins to next milestone
                </p>
              </div>
            </div>
          </div>

          {/* CLAIM REWARD SECTION - Fill Container */}
          <div 
            className="w-full rounded-2xl p-5"
            style={{
              background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.1) 0%, rgba(167, 139, 250, 0.05) 100%)',
              border: '1px solid rgba(167, 139, 250, 0.2)',
            }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              {/* Left: Text */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-12 h-12 flex-shrink-0 rounded-xl flex items-center justify-center" style={{
                  background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)',
                }}>
                  <Gift className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-white truncate">Weekly Reward</h3>
                  <p className="text-sm text-gray-400 truncate">
                    {canClaimReward && !rewardClaimed ? 'Ready to claim!' : rewardClaimed ? 'Claimed!' : 'Not eligible yet'}
                  </p>
                </div>
              </div>
              
              {/* Right: Buttons */}
              <div className="w-full sm:w-auto flex items-center gap-3">
                <button 
                  onClick={handleClaimReward}
                  disabled={!canClaimReward || rewardClaimed}
                  className="flex-1 sm:flex-none px-6 py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  style={{
                    background: canClaimReward && !rewardClaimed 
                      ? 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)'
                      : 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
                  }}
                >
                  {rewardClaimed ? (
                    <>
                      <Check className="w-5 h-5 flex-shrink-0" />
                      <span>Claimed</span>
                    </>
                  ) : canClaimReward ? (
                    <>
                      <Sparkles className="w-5 h-5 flex-shrink-0" />
                      <span>Claim $25</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5 flex-shrink-0" />
                      <span>Locked</span>
                    </>
                  )}
                </button>
                
                <button 
                  className="px-4 py-3 flex-shrink-0 rounded-xl font-semibold transition-all hover:opacity-80"
                  style={{
                    backgroundColor: 'rgba(167, 139, 250, 0.1)',
                    color: '#A78BFA',
                    border: '1px solid rgba(167, 139, 250, 0.2)'
                  }}
                >
                  Rules
                </button>
              </div>
            </div>
          </div>

          {/* BOTTOM ACTION BUTTONS - Desktop Only (Inline) */}
          <div className="hidden md:block w-full">
            <div className="w-full flex gap-4">
              <button 
                onClick={handleShare}
                className="flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #0A84FF 0%, #0066CC 100%)',
                  color: 'white',
                }}
              >
                <Share2 className="w-4 h-4 flex-shrink-0" />
                <span>Share Rank</span>
              </button>
              
              <button 
                className="flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)',
                  color: 'white',
                }}
                onClick={() => window.location.href = '/referrals'}
              >
                <Users className="w-4 h-4 flex-shrink-0" />
                <span>Invite Friends</span>
              </button>
              
              <button 
                onClick={handleCopyReferral}
                className="flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)',
                  color: 'white',
                }}
              >
                <Copy className="w-4 h-4 flex-shrink-0" />
                <span>Copy Link</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ACTION BAR - Mobile Only, Fixed Bottom, Fill Container, Max-width 1200px, Center */}
      <div 
        className="md:hidden fixed bottom-0 left-0 right-0 z-50"
        style={{
          backgroundColor: '#0F1419',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.2)',
          paddingBottom: 'env(safe-area-inset-bottom)'
        }}
      >
        <div className="w-full max-w-[1200px] mx-auto px-4 py-3">
          {/* Buttons - Fill Equally */}
          <div className="w-full flex gap-2">
            <button 
              onClick={handleShare}
              className="flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #0A84FF 0%, #0066CC 100%)',
                color: 'white',
              }}
            >
              <Share2 className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs">Share</span>
            </button>
            
            <button 
              className="flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)',
                color: 'white',
              }}
              onClick={() => window.location.href = '/referrals'}
            >
              <Users className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs">Invite</span>
            </button>
            
            <button 
              onClick={handleCopyReferral}
              className="flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)',
                color: 'white',
              }}
            >
              <Copy className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs">Copy</span>
            </button>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowShareModal(false)}>
          <div 
            className="w-full max-w-md rounded-2xl p-6 flex flex-col gap-6"
            style={{ backgroundColor: '#0F1419' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Share Your Achievement</h3>
              <button 
                onClick={() => setShowShareModal(false)}
                className="w-8 h-8 flex-shrink-0 rounded-lg flex items-center justify-center transition-all hover:opacity-80"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div 
              className="w-full rounded-xl p-6 text-center flex flex-col gap-2"
              style={{
                background: 'linear-gradient(135deg, #0A84FF 0%, #0066CC 100%)',
              }}
            >
              <p className="text-white/80 text-sm">I'm Ranked</p>
              <p className="text-5xl font-bold text-white">#{currentUser.rank}</p>
              <p className="text-2xl font-bold text-white">{formatUSDT(currentUser.earnings)}</p>
              <p className="text-white/60 text-xs">Total Earnings</p>
            </div>

            <div className="w-full flex gap-3">
              <button 
                className="flex-1 py-3 rounded-xl font-semibold transition-all active:scale-95"
                style={{ backgroundColor: '#1DA1F2', color: 'white' }}
                onClick={() => {
                  window.open(`https://twitter.com/intent/tweet?text=I'm ranked %23${currentUser.rank} on the leaderboard!`, '_blank');
                  setShowShareModal(false);
                }}
              >
                Twitter
              </button>
              
              <button 
                className="flex-1 py-3 rounded-xl font-semibold transition-all active:scale-95"
                style={{ backgroundColor: '#25D366', color: 'white' }}
                onClick={() => {
                  const message = `I'm ranked #${currentUser.rank} with ${formatUSDT(currentUser.earnings)} earnings!`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
                  setShowShareModal(false);
                }}
              >
                WhatsApp
              </button>
            </div>

            <button 
              onClick={handleCopyReferral}
              className="w-full py-3 rounded-xl font-semibold transition-all active:scale-95"
              style={{
                backgroundColor: 'rgba(10, 132, 255, 0.1)',
                color: '#0A84FF',
                border: '1px solid rgba(10, 132, 255, 0.2)'
              }}
            >
              Copy Referral Link
            </button>
          </div>
        </div>
      )}

      {/* Reward Modal */}
      {showRewardModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div 
            className="w-full max-w-sm rounded-2xl p-8 text-center flex flex-col items-center gap-4"
            style={{ backgroundColor: '#0F1419' }}
          >
            <div className="w-20 h-20 flex-shrink-0 rounded-full flex items-center justify-center" style={{
              background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)',
            }}>
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            
            <h3 className="text-2xl font-bold text-white">Reward Claimed!</h3>
            <p className="text-4xl font-bold" style={{ color: '#A78BFA' }}>$25</p>
            <p className="text-sm text-gray-400">Added to your balance</p>
            
            <Check className="w-16 h-16" style={{ color: '#34D399' }} />
          </div>
        </div>
      )}
    </div>
  );
}
