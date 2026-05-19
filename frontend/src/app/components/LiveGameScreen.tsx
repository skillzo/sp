import { useState, useEffect } from 'react';
import { Target, Gift, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Player {
  id: string;
  avatar: string;
  chance: number;
}

interface ActivityItem {
  id: number;
  text: string;
  type: 'join' | 'win';
  timestamp: string;
}

export function LiveGameScreen() {
  const { openAuthModal } = useAuth();
  const [countdown, setCountdown] = useState(9);
  const [poolValue, setPoolValue] = useState(342);
  const [playersJoined, setPlayersJoined] = useState(32);
  const [isLocked, setIsLocked] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [activities, setActivities] = useState<ActivityItem[]>([
    { id: 1, text: 'User842 joined $20', type: 'join', timestamp: '2s ago' },
    { id: 2, text: 'KingDex won $167', type: 'win', timestamp: '5s ago' },
  ]);
  const [nextUpdateIn, setNextUpdateIn] = useState(2000);

  // Countdown timer with lock behavior
  useEffect(() => {
    if (isLocked || isResetting) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Lock the round
          setIsLocked(true);
          
          // Show locked state for 0.3-0.6s
          const lockDuration = Math.random() * 300 + 300;
          setTimeout(() => {
            setIsResetting(true);
            setTimeout(() => {
              // Reset with variation
              const newPlayerCount = Math.floor(Math.random() * 20) + 30; // 30-50
              const basePool = Math.floor(Math.random() * 100) + 150; // 150-250
              setPlayersJoined(newPlayerCount);
              setPoolValue(basePool);
              setCountdown(Math.floor(Math.random() * 3) + 8); // 8-10s
              setIsLocked(false);
              setIsResetting(false);
            }, 1000);
          }, lockDuration);
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isLocked, isResetting]);

  // Realistic player count increase (burst near end)
  useEffect(() => {
    if (isLocked || isResetting) return;

    const interval = setInterval(() => {
      setPlayersJoined((prev) => {
        if (prev >= 50) return 50;
        
        // Burst behavior when close to full or time running out
        const isBurst = (prev >= 45) || (countdown <= 3);
        const increase = isBurst 
          ? Math.random() > 0.5 ? 3 : 1
          : Math.random() > 0.6 ? 1 : 0;
        
        return Math.min(prev + increase, 50);
      });
    }, Math.random() * 2000 + 1000); // 1-3s

    return () => clearInterval(interval);
  }, [countdown, isLocked, isResetting]);

  // Non-linear pool growth with spikes
  useEffect(() => {
    if (isLocked || isResetting) return;

    const interval = setInterval(() => {
      const isSpike = Math.random() > 0.85; // 15% chance of spike
      const increase = isSpike 
        ? Math.floor(Math.random() * 45) + 40 // $40-85 spike
        : [2, 3, 4, 5, 8, 12, 15, 18][Math.floor(Math.random() * 8)]; // Normal growth
      
      setPoolValue((prev) => prev + increase);
    }, Math.random() * 2000 + 1500); // 1.5-3.5s

    return () => clearInterval(interval);
  }, [isLocked, isResetting]);

  // Realistic activity feed with random timing
  useEffect(() => {
    if (isLocked || isResetting) return;

    const usernames = ['User842', 'KingDex', 'CryptoMike', 'SpinMaster', 'Player391', 'LuckyDave', 'BetKing', 'User573'];
    const activityTemplates = [
      { text: (user: string) => `${user} joined $${[10, 15, 20, 25, 30, 50][Math.floor(Math.random() * 6)]}`, type: 'join' as const },
      { text: (user: string) => `${user} won $${[85, 120, 167, 203, 145][Math.floor(Math.random() * 5)]}`, type: 'win' as const },
      { text: () => `+${[2, 3, 4][Math.floor(Math.random() * 3)]} players joined`, type: 'join' as const },
    ];

    const scheduleNext = () => {
      const delay = Math.random() * 2500 + 1500; // 1.5-4s
      setNextUpdateIn(delay);

      setTimeout(() => {
        const template = activityTemplates[Math.floor(Math.random() * activityTemplates.length)];
        const username = usernames[Math.floor(Math.random() * usernames.length)];
        
        const newActivity: ActivityItem = {
          id: Date.now(),
          text: template.text(username),
          type: template.type,
          timestamp: 'just now',
        };

        setActivities((prev) => [newActivity, ...prev.slice(0, 3)]);
        
        // Sometimes have silence (no updates for 2-3s)
        if (Math.random() > 0.8) {
          setTimeout(scheduleNext, Math.random() * 1000 + 2000);
        } else {
          scheduleNext();
        }
      }, delay);
    };

    scheduleNext();
  }, [isLocked, isResetting]);

  // Update timestamps
  useEffect(() => {
    const interval = setInterval(() => {
      setActivities((prev) => 
        prev.map((activity, index) => ({
          ...activity,
          timestamp: index === 0 ? 'just now' : `${(index + 1) * 2}s ago`,
        }))
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Mock players
  const players: Player[] = [
    { id: '1', avatar: '👤', chance: 15.2 },
    { id: '2', avatar: '👤', chance: 12.8 },
    { id: '3', avatar: '👤', chance: 9.4 },
    { id: '4', avatar: '👤', chance: 8.1 },
    { id: '5', avatar: '👤', chance: 7.5 },
    { id: '6', avatar: '👤', chance: 6.2 },
    { id: '7', avatar: '👤', chance: 5.8 },
  ];

  const isUrgent = countdown <= 5 && countdown > 3;
  const isCritical = countdown <= 3 && countdown > 0;
  const fillPercentage = (playersJoined / 50) * 100;

  // Dynamic pressure text
  const getPressureText = () => {
    if (fillPercentage >= 90) return 'Last spots remaining';
    if (fillPercentage >= 70) return 'Almost full';
    return 'Pool filling fast';
  };

  // CTA text escalation
  const getCtaText = () => {
    if (isCritical) return 'LAST CHANCE – ENTER NOW';
    if (isUrgent) return 'JOIN BEFORE LOCK';
    return 'JOIN THIS ROUND NOW';
  };

  return (
    <div>
      {/* ROUND STATUS STRIP */}
      <div
        className="w-full py-5 text-center relative overflow-hidden"
        style={{
          background: isLocked 
            ? 'linear-gradient(135deg, rgba(255, 90, 95, 0.2) 0%, rgba(255, 90, 95, 0.1) 100%)'
            : 'linear-gradient(135deg, rgba(0, 255, 198, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
          borderBottom: `1px solid ${isLocked ? 'rgba(255, 90, 95, 0.3)' : 'rgba(0, 255, 198, 0.2)'}`,
        }}
      >
        {/* Glow effect */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background: isLocked
              ? 'radial-gradient(circle at center, rgba(255, 90, 95, 0.3) 0%, transparent 70%)'
              : 'radial-gradient(circle at center, rgba(0, 255, 198, 0.2) 0%, transparent 70%)',
            animation: isCritical ? 'pulse-fast 0.5s infinite' : isUrgent ? 'pulse-medium 1s infinite' : 'pulse-slow 2s infinite',
          }}
        />

        <div className="relative z-10">
          {isLocked ? (
            <>
              <h1
                className="font-black mb-1"
                style={{
                  fontSize: '28px',
                  color: '#FF5A5F',
                  textShadow: '0 0 20px #FF5A5F',
                }}
              >
                {isResetting ? 'Next round starting…' : 'Entry closed — full'}
              </h1>
              <p className="text-xs" style={{ color: '#9CA3AF' }}>
                {isResetting ? 'Get ready' : 'Round filled instantly'}
              </p>
            </>
          ) : (
            <>
              <h1
                className="font-black mb-1"
                style={{
                  fontSize: isCritical ? '34px' : isUrgent ? '32px' : '28px',
                  color: isCritical ? '#FF5A5F' : isUrgent ? '#FFA500' : '#00FFC6',
                  textShadow: `0 0 ${isCritical ? '30px' : '20px'} ${isCritical ? '#FF5A5F' : isUrgent ? '#FFA500' : '#00FFC6'}`,
                  animation: isCritical ? 'pulse-fast 0.5s infinite' : 'none',
                }}
              >
                {countdown}s TO LOCK
              </h1>
              <p className="text-xs font-semibold" style={{ color: '#9CA3AF' }}>
                Round closing soon
              </p>
            </>
          )}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="px-4 py-6 max-w-[480px] mx-auto">
        {/* MAIN WHEEL CARD */}
        <div
          className="rounded-2xl p-4 mb-6"
          style={{
            backgroundColor: '#121821',
            border: '1px solid #1F2A37',
            boxShadow: isCritical 
              ? '0 0 40px rgba(255, 90, 95, 0.3)' 
              : '0 0 30px rgba(0, 255, 198, 0.15)',
          }}
        >
          {/* Top Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎲</span>
              <span className="font-bold" style={{ color: '#FFFFFF' }}>
                Live Round
              </span>
            </div>
            <div
              className="px-3 py-1 rounded-full flex items-center gap-2"
              style={{
                backgroundColor: 'rgba(255, 90, 95, 0.2)',
                border: '1px solid rgba(255, 90, 95, 0.4)',
              }}
            >
              <div
                className="w-2 h-2 rounded-full animate-pulse"
                style={{
                  backgroundColor: '#FF5A5F',
                  boxShadow: '0 0 8px #FF5A5F',
                }}
              />
              <span className="text-xs font-bold" style={{ color: '#FF5A5F' }}>
                LIVE
              </span>
            </div>
          </div>

          {/* Pool Value */}
          <div className="text-center mb-1">
            <div
              className="text-4xl font-black inline-block"
              style={{
                color: '#00FFC6',
                textShadow: '0 0 20px rgba(0, 255, 198, 0.5)',
              }}
            >
              ${poolValue}
            </div>
          </div>
          <p className="text-center text-xs font-semibold mb-4" style={{ color: '#9CA3AF' }}>
            Total Pool
          </p>

          {/* WHEEL */}
          <div className="relative mx-auto mb-4" style={{ width: '240px', height: '240px' }}>
            {/* Wheel Container */}
            <div
              className="w-full h-full rounded-full relative overflow-hidden"
              style={{
                background: 'conic-gradient(from 0deg, #FF6B6B 0deg 60deg, #4ECDC4 60deg 120deg, #FFE66D 120deg 180deg, #95E1D3 180deg 240deg, #F38181 240deg 300deg, #AA96DA 300deg 360deg)',
                boxShadow: '0 0 40px rgba(0, 255, 198, 0.3), inset 0 0 40px rgba(0, 0, 0, 0.5)',
                animation: isLocked ? 'none' : 'spin-slow 20s linear infinite',
                opacity: isLocked ? 0.5 : 1,
              }}
            >
              {/* Center Circle */}
              <div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full flex flex-col items-center justify-center"
                style={{
                  width: '120px',
                  height: '120px',
                  backgroundColor: '#0B0F14',
                  border: `3px solid ${isCritical ? '#FF5A5F' : '#00FFC6'}`,
                  boxShadow: `0 0 30px ${isCritical ? 'rgba(255, 90, 95, 0.6)' : 'rgba(0, 255, 198, 0.6)'}`,
                }}
              >
                <div
                  className="text-4xl font-black"
                  style={{
                    color: isCritical ? '#FF5A5F' : isUrgent ? '#FFA500' : '#00FFC6',
                  }}
                >
                  {countdown}s
                </div>
                <div className="text-xs font-semibold" style={{ color: '#9CA3AF' }}>
                  TO LOCK
                </div>
              </div>

              {/* Pointer */}
              <div
                className="absolute top-0 left-1/2 transform -translate-x-1/2"
                style={{
                  width: '0',
                  height: '0',
                  borderLeft: '8px solid transparent',
                  borderRight: '8px solid transparent',
                  borderTop: '20px solid #FFFFFF',
                  filter: 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.8))',
                }}
              />
            </div>
          </div>

          {/* Player Count + Pressure Text */}
          <div className="text-center mb-4">
            <p className="text-lg font-black mb-1" style={{ color: '#FFFFFF' }}>
              {playersJoined} / 50 players
            </p>
            <p 
              className="text-sm font-bold mb-2" 
              style={{ 
                color: fillPercentage >= 90 ? '#FF5A5F' : fillPercentage >= 70 ? '#FFA500' : '#00FFC6' 
              }}
            >
              {getPressureText()}
            </p>
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#1F2A37' }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${fillPercentage}%`,
                  background: fillPercentage >= 90 
                    ? 'linear-gradient(90deg, #FF5A5F 0%, #FF3333 100%)'
                    : 'linear-gradient(90deg, #00FFC6 0%, #3B82F6 100%)',
                  boxShadow: fillPercentage >= 90 
                    ? '0 0 12px rgba(255, 90, 95, 0.6)'
                    : '0 0 10px rgba(0, 255, 198, 0.5)',
                }}
              />
            </div>
          </div>

          {/* Human Presence */}
          <div className="text-center mb-4">
            <p className="text-xs" style={{ color: '#9CA3AF' }}>
              User842, KingDex +{playersJoined - 2} others joined
            </p>
          </div>

          {/* PRIMARY CTA */}
          <button
            onClick={() => openAuthModal('register')}
            disabled={isLocked}
            className="w-full rounded-2xl font-black text-base transition-all hover:scale-[1.02] active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              height: '52px',
              background: isCritical
                ? 'linear-gradient(135deg, #FF5A5F 0%, #FF3333 100%)'
                : 'linear-gradient(135deg, #00FFC6 0%, #00D9A5 100%)',
              color: '#0B0F14',
              boxShadow: isCritical
                ? '0 0 40px rgba(255, 90, 95, 0.6), 0 4px 12px rgba(0, 0, 0, 0.3)'
                : '0 0 30px rgba(0, 255, 198, 0.5), 0 4px 12px rgba(0, 0, 0, 0.3)',
              letterSpacing: '0.5px',
              animation: isCritical ? 'pulse-glow 0.5s infinite' : 'none',
            }}
          >
            {getCtaText()}
          </button>

          {/* SECONDARY URGENCY TEXT */}
          {(isUrgent || isCritical) && (
            <p className="text-center text-xs font-bold mt-2 animate-pulse" style={{ color: '#FF5A5F' }}>
              {isCritical ? '⚡ SECONDS LEFT' : 'Last chance to enter'}
            </p>
          )}
        </div>

        {/* ACTIVITY FEED CARD */}
        <div
          className="rounded-2xl p-4 mb-6"
          style={{
            backgroundColor: '#121821',
            border: '1px solid #1F2A37',
          }}
        >
          <h3 className="text-lg font-bold mb-3" style={{ color: '#FFFFFF' }}>
            Happening Now
          </h3>

          <div className="space-y-2">
            {activities.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center justify-between"
                style={{
                  animation: index === 0 ? 'slide-fade-in 0.5s ease-out' : 'none',
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: item.type === 'win' ? 'rgba(0, 255, 198, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                    }}
                  >
                    <span className="text-sm">👤</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: item.type === 'win' ? '#00FFC6' : '#3B82F6' }}>
                      {item.text}
                    </p>
                  </div>
                </div>
                <span className="text-xs" style={{ color: '#6B7280' }}>
                  {item.timestamp}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* EXTRA FEATURES (COMPACT) */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { icon: Target, label: 'AI Predictions', color: '#00FFC6' },
            { icon: Gift, label: 'Earn Rewards', color: '#3B82F6' },
            { icon: UserPlus, label: 'Invite & Earn', color: '#FF5A5F' },
          ].map((feature, index) => (
            <div
              key={index}
              className="rounded-xl p-3 text-center transition-all hover:scale-105"
              style={{
                backgroundColor: '#121821',
                border: '1px solid #1F2A37',
              }}
            >
              <feature.icon className="w-6 h-6 mx-auto mb-2" style={{ color: feature.color }} />
              <p className="text-xs font-semibold" style={{ color: '#9CA3AF' }}>
                {feature.label}
              </p>
            </div>
          ))}
        </div>

        {/* FOOTER STRIP */}
        <div className="text-center py-4">
          <p className="text-xs leading-relaxed" style={{ color: '#6B7280' }}>
            Provably Fair • Results are random • Play responsibly • 18+ only
          </p>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse-fast {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        @keyframes pulse-medium {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.85; }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 40px rgba(255, 90, 95, 0.6), 0 4px 12px rgba(0, 0, 0, 0.3); }
          50% { box-shadow: 0 0 60px rgba(255, 90, 95, 0.8), 0 4px 12px rgba(0, 0, 0, 0.3); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes slide-fade-in {
          from {
            transform: translateX(-10px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
