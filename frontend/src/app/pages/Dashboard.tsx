import { Gamepad2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { TopBar } from '../components/TopBar';
import { useUser } from '../context/UserContext';
import { useState, useEffect } from 'react';
import { ResponsiveContainer } from '../components/ResponsiveContainer';

export function Dashboard() {
  const { formatCurrency, formatUSDT, gameBalance, usdtBalance } = useUser();
  const navigate = useNavigate();

  // ===== LIVE COUNTERS =====
  const [onlineCount, setOnlineCount] = useState(1245);
  const [totalEarningsToday, setTotalEarningsToday] = useState(32647);
  const [flickerOnline, setFlickerOnline] = useState(false);
  const [flickerEarnings, setFlickerEarnings] = useState(false);
  
  // ===== CRASH GAME MULTIPLIER ANIMATION =====
  const [currentMultiplier, setCurrentMultiplier] = useState(1.1);
  const [crashLoading, setCrashLoading] = useState(false);
  const [playersInRound, setPlayersInRound] = useState(124);
  
  // ===== CRASH GAME URGENCY & PRESSURE FEATURES =====
  const [roundStatus, setRoundStatus] = useState<'started' | 'countdown'>('started');
  const [countdownSeconds, setCountdownSeconds] = useState(2);
  const [playersJoinedThisRound, setPlayersJoinedThisRound] = useState(12);
  const [showCrashMessage, setShowCrashMessage] = useState(false);
  const [crashedAt, setCrashedAt] = useState(7.9);
  const [buttonIntensity, setButtonIntensity] = useState(false);
  const [buttonText, setButtonText] = useState('Play Now');
  const [lastFiveRounds] = useState([2.1, 5.4, 1.8, 7.2, 3.3]);
  
  // ===== FLOATING TICKER (RECENT WINS) =====
  const [currentWinnerIndex, setCurrentWinnerIndex] = useState(0);
  const [slideIn, setSlideIn] = useState(true);
  const recentWinners = [
    { name: 'David', amount: 8.73, action: 'won' },
    { name: 'Aisha', amount: 3.27, action: 'won' },
    { name: 'Kelvin', amount: 15.04, action: 'cashed out' },
    { name: 'Sarah', amount: 12.89, action: 'won' },
    { name: 'Michael', amount: 6.51, action: 'won' },
    { name: 'Blessing', amount: 22.36, action: 'cashed out' },
    { name: 'James', amount: 4.92, action: 'won' },
    { name: 'Fatima', amount: 18.47, action: 'cashed out' }
  ];

  // ===== LOADING STATES FOR GAME CARDS =====
  const [colorPredictionLoading, setColorPredictionLoading] = useState(false);
  const [wheelLoading, setWheelLoading] = useState(false);
  const [diceLoading, setDiceLoading] = useState(false);
  const [pvpWheelLoading, setPvpWheelLoading] = useState(false);

  // Live online counter (updates every 3 seconds with flicker)
  useEffect(() => {
    const interval = setInterval(() => {
      setFlickerOnline(true);
      setTimeout(() => setFlickerOnline(false), 200);
      const randomIncrease = Math.floor(Math.random() * 6) + 1;
      setOnlineCount(prev => prev + randomIncrease);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Animated earnings counter (updates every 5 seconds with counting effect)
  useEffect(() => {
    const interval = setInterval(() => {
      setFlickerEarnings(true);
      setTimeout(() => setFlickerEarnings(false), 300);
      const randomIncrease = Math.floor(Math.random() * 250) + 50; // $50-$300
      setTotalEarningsToday(prev => prev + randomIncrease);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Crash game multiplier animation (continuous cycling)
  useEffect(() => {
    const multipliers = [1.1, 1.8, 2.4, 3.2, 5.7, 7.8, 4.3, 2.1, 1.5, 6.4, 9.2, 3.8];
    let index = 0;

    const interval = setInterval(() => {
      index = (index + 1) % multipliers.length;
      setCurrentMultiplier(multipliers[index]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Players in round randomization
  useEffect(() => {
    const interval = setInterval(() => {
      const randomChange = Math.floor(Math.random() * 11) - 5; // -5 to +5
      setPlayersInRound(prev => Math.max(80, Math.min(200, prev + randomChange)));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Floating ticker animation (cycles through winners with slide animation)
  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIn(false);
      setTimeout(() => {
        setCurrentWinnerIndex(prev => (prev + 1) % recentWinners.length);
        setSlideIn(true);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Round status animation ("Round already started" / "Next round in Xs")
  useEffect(() => {
    const interval = setInterval(() => {
      const randomDuration = Math.random() * 4000 + 6000; // 6-10 seconds
      
      setRoundStatus('countdown');
      setCountdownSeconds(3);
      
      const countdown = setInterval(() => {
        setCountdownSeconds(prev => {
          if (prev <= 1) {
            clearInterval(countdown);
            setRoundStatus('started');
            return 2;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(countdown);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Players joined this round (updates every few seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      const randomChange = Math.floor(Math.random() * 5) - 2; // -2 to +2
      setPlayersJoinedThisRound(prev => Math.max(5, Math.min(30, prev + randomChange)));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Near-miss psychology (show "Crashed at X" occasionally)
  useEffect(() => {
    const interval = setInterval(() => {
      const randomCrashValue = (Math.random() * 8 + 2).toFixed(1); // 2.0 - 10.0
      setCrashedAt(parseFloat(randomCrashValue));
      setShowCrashMessage(true);
      
      setTimeout(() => {
        setShowCrashMessage(false);
      }, 2000);
    }, 25000); // Every 25 seconds

    return () => clearInterval(interval);
  }, []);

  // CTA intensifier (increase glow + change text after 5 seconds)
  useEffect(() => {
    const timer = setTimeout(() => {
      setButtonIntensity(true);
      setButtonText('Join Round');
      
      setTimeout(() => {
        setButtonIntensity(false);
        setButtonText('Play Now');
      }, 3000);
    }, 5000);

    return () => clearTimeout(timer);
  }, [buttonText]);

  // Handle game navigation with realistic delay
  const handleGameNavigation = (route: string, setLoading: (loading: boolean) => void) => {
    setLoading(true);
    setTimeout(() => {
      navigate(route);
      setLoading(false);
    }, 150);
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden" style={{ backgroundColor: 'var(--bg-primary)', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <TopBar />
      
      <div className="w-full mx-auto" style={{ 
        maxWidth: '1280px',
        paddingLeft: 'clamp(12px, 4vw, 32px)',
        paddingRight: 'clamp(12px, 4vw, 32px)',
        paddingBottom: '5rem'
      }}>
        {/* STATS STRIP */}
        <div className="w-full rounded-2xl flex items-center justify-between" style={{ 
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          padding: 'clamp(8px, 2.5vw, 16px)',
          marginTop: '1rem',
          marginBottom: '1rem',
          gap: 'clamp(8px, 2vw, 16px)'
        }}>
          <div className="flex items-center shrink-0" style={{ gap: '0.5rem' }}>
            {/* Pulsing green dot */}
            <div className="relative flex items-center justify-center">
              <div 
                className="absolute w-3 h-3 rounded-full animate-ping" 
                style={{ 
                  backgroundColor: '#10B981',
                  opacity: 0.75,
                  animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite'
                }} 
              />
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: '#10B981' }} 
              />
            </div>
            <p 
              className="font-semibold whitespace-nowrap transition-opacity duration-200" 
              style={{ 
                color: 'var(--text-primary)',
                fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)',
                opacity: flickerOnline ? 0.5 : 1
              }}
            >
              {onlineCount.toLocaleString()} online
            </p>
          </div>
          <div className="flex items-center shrink-0" style={{ gap: '0.25rem' }}>
            <span className="text-sm">💰</span>
            <p 
              className="font-semibold whitespace-nowrap transition-opacity duration-300" 
              style={{ 
                color: 'var(--text-primary)',
                fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)',
                opacity: flickerEarnings ? 0.6 : 1
              }}
            >
              ${totalEarningsToday.toLocaleString()} today
            </p>
          </div>
          <button 
            onClick={() => navigate('/wallet')}
            className="font-semibold rounded-lg whitespace-nowrap shrink-0 active:scale-95 transition-all"
            style={{
              color: 'var(--blue-primary)',
              padding: 'clamp(4px, 1.5vw, 8px) clamp(8px, 2.5vw, 12px)',
              fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)'
            }}
          >
            Deposit
          </button>
        </div>

        {/* FLOATING TICKER (RECENT WINS) */}
        <div 
          className="w-full rounded-xl overflow-hidden mb-3"
          style={{
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            padding: '10px 16px'
          }}
        >
          <div 
            className="flex items-center gap-2"
            style={{
              transition: 'all 0.3s ease-out',
              transform: slideIn ? 'translateX(0)' : 'translateX(100%)',
              opacity: slideIn ? 1 : 0
            }}
          >
            <span className="text-base">🎉</span>
            <p className="text-sm font-semibold" style={{ color: '#10B981' }}>
              {recentWinners[currentWinnerIndex].name} just {recentWinners[currentWinnerIndex].action} ${recentWinners[currentWinnerIndex].amount.toFixed(2)}!
            </p>
          </div>
        </div>

        <div className="w-full flex flex-col" style={{ gap: '1rem' }}>
          {/* FEATURED CRASH GAME */}
          <div 
            className="w-full rounded-3xl relative overflow-hidden cursor-pointer transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #2ECC71 0%, #27AE60 50%, #16A085 100%)',
              minHeight: '200px',
              padding: 'clamp(16px, 5vw, 24px)',
              transform: crashLoading ? 'scale(0.98)' : 'scale(1)',
              boxShadow: crashLoading ? '0 8px 24px rgba(46, 204, 113, 0.3)' : '0 4px 12px rgba(46, 204, 113, 0.2)'
            }}
            onClick={() => handleGameNavigation('/crash-game', setCrashLoading)}
            onMouseEnter={(e) => {
              if (!crashLoading) {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(46, 204, 113, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!crashLoading) {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(46, 204, 113, 0.2)';
              }
            }}
          >
            <div className="absolute rounded-full text-xs font-bold flex items-center shrink-0" style={{
              backgroundColor: 'rgba(255,255,255,0.9)',
              color: '#FF6B00',
              top: 'clamp(12px, 3vw, 16px)',
              left: 'clamp(12px, 3vw, 16px)',
              padding: '0.25rem 0.75rem',
              gap: '0.25rem'
            }}>
              🔥 Trending
            </div>

            {/* Floating Multiplier Animation */}
            <div 
              className="absolute rounded-xl font-black flex items-center justify-center gap-2 transition-all duration-500"
              style={{
                backgroundColor: 'rgba(255,255,255,0.95)',
                color: currentMultiplier >= 5 ? '#FF6B00' : '#2ECC71',
                top: 'clamp(12px, 3vw, 16px)',
                right: 'clamp(12px, 3vw, 16px)',
                padding: '0.5rem 1rem',
                fontSize: 'clamp(1.25rem, 4vw, 1.75rem)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                transform: `scale(${currentMultiplier >= 5 ? 1.1 : 1})`
              }}
            >
              {/* Blinking live indicator dot */}
              <div 
                className="absolute -top-1 -left-1 w-2.5 h-2.5 rounded-full"
                style={{
                  backgroundColor: '#EF4444',
                  animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite'
                }}
              />
              <div 
                className="absolute -top-1 -left-1 w-2.5 h-2.5 rounded-full"
                style={{
                  backgroundColor: '#EF4444'
                }}
              />
              {currentMultiplier.toFixed(1)}x
            </div>

            <div className="absolute top-0 right-0 hidden sm:block" style={{
              width: '150px',
              height: '150px'
            }}>
              <div className="absolute top-8 right-4">
                <svg width="100" height="120" viewBox="0 0 100 120" fill="none">
                  <ellipse cx="50" cy="110" rx="20" ry="8" fill="rgba(255,255,255,0.2)"/>
                  <path d="M50 20 L60 100 L50 95 L40 100 Z" fill="#FFFFFF" opacity="0.9"/>
                  <circle cx="50" cy="40" r="15" fill="#E8F5E9"/>
                  <circle cx="50" cy="40" r="10" fill="#4A90E2"/>
                  <path d="M45 100 L40 115 L45 110 Z" fill="#FF6B00"/>
                  <path d="M55 100 L60 115 L55 110 Z" fill="#FF6B00"/>
                </svg>
              </div>
            </div>

            <div className="relative z-10" style={{ marginTop: 'clamp(48px, 15vw, 64px)' }}>
              <h2 className="font-bold text-white mb-0.5" style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)' }}>
                Crash Game
              </h2>
              
              {/* Near-miss psychology message */}
              {showCrashMessage && (
                <p className="mb-0.5 animate-pulse" style={{ 
                  color: '#FF6B00',
                  fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)',
                  fontWeight: 700
                }}>
                  💥 Crashed at {crashedAt.toFixed(1)}x
                </p>
              )}
              
              {/* Entry pressure text (when multiplier > 2x) */}
              {currentMultiplier > 2 && !showCrashMessage && (
                <p className="mb-0.5" style={{ 
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: 'clamp(0.7rem, 2vw, 0.8rem)',
                  fontWeight: 600
                }}>
                  ✓ You can still join
                </p>
              )}
              
              {/* Subtle FOMO (when multiplier > 3x) */}
              {currentMultiplier > 3 && !showCrashMessage && (
                <p className="mb-0.5" style={{ 
                  color: '#FFD700',
                  fontSize: 'clamp(0.7rem, 2vw, 0.8rem)',
                  fontWeight: 600
                }}>
                  🔥 High payouts happening now
                </p>
              )}
              
              {/* Micro urgency text */}
              {!showCrashMessage && (
                <p className="mb-0.5" style={{ 
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: 'clamp(0.7rem, 2vw, 0.8rem)',
                  fontWeight: 500
                }}>
                  ⚠️ Round ends anytime
                </p>
              )}
              
              {/* Last 5 rounds - Reward Bait */}
              <p className="mb-0.5" style={{ 
                color: 'rgba(255,255,255,0.75)',
                fontSize: 'clamp(0.65rem, 2vw, 0.75rem)',
                fontWeight: 500,
                letterSpacing: '0.02em'
              }}>
                Last 5: {lastFiveRounds.map(r => r.toFixed(1) + 'x').join(' • ')}
              </p>
              
              <p className="mb-1" style={{ 
                color: 'rgba(255,255,255,0.95)',
                fontSize: 'clamp(0.875rem, 3vw, 1rem)'
              }}>
                Cash out before it crashes
              </p>
              
              {/* Social pressure - players joined */}
              <p className="mb-1" style={{ 
                color: 'rgba(255,255,255,0.75)',
                fontSize: 'clamp(0.65rem, 2vw, 0.75rem)',
                fontWeight: 600
              }}>
                👥 {playersJoinedThisRound} players joined this round
              </p>
              
              {/* Players in round */}
              <p className="mb-2" style={{ 
                color: 'rgba(255,255,255,0.8)',
                fontSize: 'clamp(0.7rem, 2vw, 0.8rem)',
                fontWeight: 600
              }}>
                {playersInRound} watching now
              </p>

              <div className="flex flex-col" style={{ gap: '0.5rem' }}>
                {/* Round status (dynamic text) */}
                <p className="text-center transition-all" style={{ 
                  color: roundStatus === 'started' ? '#FFD700' : 'rgba(255,255,255,0.9)',
                  fontSize: 'clamp(0.7rem, 2vw, 0.8rem)',
                  fontWeight: 700
                }}>
                  {roundStatus === 'started' ? '🎮 Round already started' : `⏱️ Next round in ${countdownSeconds}s`}
                </p>
                
                <div className="flex items-center justify-between w-full" style={{ gap: '0.75rem' }}>
                  <span className="rounded-full font-semibold shrink-0" style={{
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    color: '#FFFFFF',
                    padding: 'clamp(4px, 1.5vw, 6px) clamp(10px, 3vw, 12px)',
                    fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)'
                  }}>
                    Win up to 10x
                  </span>

                  <button 
                    disabled={crashLoading}
                    className="rounded-2xl font-bold shrink-0 transition-all" 
                    style={{
                      backgroundColor: crashLoading ? '#4A4A4A' : '#1A1A1A',
                      color: '#FFFFFF',
                      padding: 'clamp(8px, 2.5vw, 12px) clamp(14px, 4vw, 24px)',
                      fontSize: 'clamp(0.875rem, 3vw, 1rem)',
                      opacity: crashLoading ? 0.7 : 1,
                      cursor: crashLoading ? 'wait' : 'pointer',
                      boxShadow: buttonIntensity 
                        ? '0 0 30px rgba(26, 26, 26, 0.8), 0 0 60px rgba(255, 255, 255, 0.4)' 
                        : '0 0 20px rgba(26, 26, 26, 0.6), 0 0 40px rgba(255, 255, 255, 0.2)',
                      animation: crashLoading ? 'none' : 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                      transform: 'scale(0.98)'
                    }}
                    onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                    onMouseUp={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                  >
                    {crashLoading ? 'Loading...' : buttonText}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* GAMES GRID */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* COLOR PREDICTION */}
            <div 
              className="w-full rounded-2xl transition-all duration-200 cursor-pointer" 
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                padding: 'clamp(12px, 4vw, 16px)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
              }}
            >
              <div className="flex items-start justify-between w-full mb-3" style={{ gap: '0.75rem' }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center mb-2" style={{ gap: '0.5rem' }}>
                    <Gamepad2 className="shrink-0" style={{ 
                      color: 'var(--blue-primary)',
                      width: 'clamp(20px, 5vw, 24px)',
                      height: 'clamp(20px, 5vw, 24px)'
                    }} />
                    <h3 className="font-bold truncate" style={{ 
                      color: 'var(--text-primary)',
                      fontSize: 'clamp(1rem, 3.5vw, 1.125rem)'
                    }}>
                      Color Prediction
                    </h3>
                  </div>
                  <p className="mb-2 truncate" style={{ 
                    color: 'var(--text-secondary)',
                    fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)'
                  }}>
                    Predict colors and win rewards
                  </p>
                  
                  {/* Status Badge */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-block rounded-full text-xs font-semibold" style={{
                      backgroundColor: 'rgba(16, 185, 129, 0.12)',
                      color: '#10B981',
                      padding: '0.25rem 0.75rem'
                    }}>
                      🟢 Low Risk
                    </span>
                  </div>
                  
                  {/* Earnings Preview */}
                  <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                    💰 Avg win: $0.50 – $5.00
                  </p>
                </div>
              </div>
              
              <button 
                onClick={() => handleGameNavigation('/game', setColorPredictionLoading)}
                disabled={colorPredictionLoading}
                className="w-full rounded-xl font-semibold active:scale-97 transition-all whitespace-nowrap" 
                style={{
                  backgroundColor: colorPredictionLoading ? 'rgba(45, 108, 223, 0.7)' : 'var(--blue-primary)',
                  color: '#FFFFFF',
                  padding: 'clamp(10px, 3vw, 12px)',
                  fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)',
                  cursor: colorPredictionLoading ? 'wait' : 'pointer'
                }}
              >
                {colorPredictionLoading ? 'Loading...' : 'Play Now'}
              </button>
            </div>

            {/* WHEEL GAME */}
            <div 
              className="w-full rounded-2xl transition-all duration-200 cursor-pointer" 
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                padding: 'clamp(12px, 4vw, 16px)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
              }}
            >
              <div className="flex items-start justify-between w-full mb-3" style={{ gap: '0.75rem' }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center mb-2" style={{ gap: '0.5rem' }}>
                    <Gamepad2 className="shrink-0" style={{ 
                      color: '#9C27B0',
                      width: 'clamp(20px, 5vw, 24px)',
                      height: 'clamp(20px, 5vw, 24px)'
                    }} />
                    <h3 className="font-bold truncate" style={{ 
                      color: 'var(--text-primary)',
                      fontSize: 'clamp(1rem, 3.5vw, 1.125rem)'
                    }}>
                      Wheel Game
                    </h3>
                  </div>
                  <p className="mb-2 truncate" style={{ 
                    color: 'var(--text-secondary)',
                    fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)'
                  }}>
                    Spin the wheel and win
                  </p>
                  
                  {/* Status Badge */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-block rounded-full text-xs font-semibold" style={{
                      backgroundColor: 'rgba(255, 152, 0, 0.12)',
                      color: '#FF9800',
                      padding: '0.25rem 0.75rem'
                    }}>
                      ⚡ Fast Win
                    </span>
                  </div>
                  
                  {/* Earnings Preview */}
                  <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                    💰 Avg win: $1.00 – $10.00
                  </p>
                </div>
              </div>
              
              <button 
                onClick={() => handleGameNavigation('/wheel-game', setWheelLoading)}
                disabled={wheelLoading}
                className="w-full rounded-xl font-semibold active:scale-97 transition-all whitespace-nowrap" 
                style={{
                  backgroundColor: wheelLoading ? 'rgba(45, 108, 223, 0.7)' : 'var(--blue-primary)',
                  color: '#FFFFFF',
                  padding: 'clamp(10px, 3vw, 12px)',
                  fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)',
                  cursor: wheelLoading ? 'wait' : 'pointer'
                }}
              >
                {wheelLoading ? 'Loading...' : 'Play Now'}
              </button>
            </div>

            {/* DICE POOL */}
            <div 
              className="w-full rounded-2xl transition-all duration-200 cursor-pointer" 
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                padding: 'clamp(12px, 4vw, 16px)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
              }}
            >
              <div className="flex items-start justify-between w-full mb-3" style={{ gap: '0.75rem' }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center mb-2" style={{ gap: '0.5rem' }}>
                    <Gamepad2 className="shrink-0" style={{ 
                      color: 'var(--text-secondary)',
                      width: 'clamp(20px, 5vw, 24px)',
                      height: 'clamp(20px, 5vw, 24px)'
                    }} />
                    <h3 className="font-bold truncate" style={{ 
                      color: 'var(--text-primary)',
                      fontSize: 'clamp(1rem, 3.5vw, 1.125rem)'
                    }}>
                      Dice Pool
                    </h3>
                  </div>
                  <p className="mb-2 truncate" style={{ 
                    color: 'var(--text-secondary)',
                    fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)'
                  }}>
                    Roll high, win big
                  </p>
                  
                  {/* Status Badge */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-block rounded-full text-xs font-semibold" style={{
                      backgroundColor: 'rgba(239, 68, 68, 0.12)',
                      color: '#EF4444',
                      padding: '0.25rem 0.75rem'
                    }}>
                      🔥 Hot
                    </span>
                  </div>
                  
                  {/* Earnings Preview */}
                  <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                    💰 Avg win: $2.00 – $50.00
                  </p>
                </div>
              </div>
              
              <button 
                onClick={() => handleGameNavigation('/dice-pool', setDiceLoading)}
                disabled={diceLoading}
                className="w-full rounded-xl font-semibold active:scale-97 transition-all whitespace-nowrap" 
                style={{
                  backgroundColor: diceLoading ? 'rgba(45, 108, 223, 0.7)' : 'var(--blue-primary)',
                  color: '#FFFFFF',
                  padding: 'clamp(10px, 3vw, 12px)',
                  fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)',
                  cursor: diceLoading ? 'wait' : 'pointer'
                }}
              >
                {diceLoading ? 'Loading...' : 'Play Now'}
              </button>
            </div>

            {/* PVP WHEEL - NEW */}
            <div 
              className="w-full rounded-2xl transition-all duration-200 cursor-pointer" 
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                padding: 'clamp(12px, 4vw, 16px)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
              }}
            >
              <div className="flex items-start justify-between w-full mb-3" style={{ gap: '0.75rem' }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center mb-2" style={{ gap: '0.5rem' }}>
                    <Gamepad2 className="shrink-0" style={{ 
                      color: '#8B5CF6',
                      width: 'clamp(20px, 5vw, 24px)',
                      height: 'clamp(20px, 5vw, 24px)'
                    }} />
                    <h3 className="font-bold truncate" style={{ 
                      color: 'var(--text-primary)',
                      fontSize: 'clamp(1rem, 3.5vw, 1.125rem)'
                    }}>
                      PvP Wheel Battle
                    </h3>
                  </div>
                  <p className="mb-2 truncate" style={{ 
                    color: 'var(--text-secondary)',
                    fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)'
                  }}>
                    Compete live, winner takes all
                  </p>
                  
                  {/* Status Badge */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-block rounded-full text-xs font-semibold" style={{
                      backgroundColor: 'rgba(139, 92, 246, 0.12)',
                      color: '#8B5CF6',
                      padding: '0.25rem 0.75rem'
                    }}>
                      ⚔️ PvP
                    </span>
                  </div>
                  
                  {/* Earnings Preview */}
                  <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                    💰 Avg win: $5.00 – $200.00
                  </p>
                </div>
              </div>
              
              <button 
                onClick={() => handleGameNavigation('/pvp-wheel', setPvpWheelLoading)}
                disabled={pvpWheelLoading}
                className="w-full rounded-xl font-semibold active:scale-97 transition-all whitespace-nowrap" 
                style={{
                  backgroundColor: pvpWheelLoading ? 'rgba(139, 92, 246, 0.7)' : '#8B5CF6',
                  color: '#FFFFFF',
                  padding: 'clamp(10px, 3vw, 12px)',
                  fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)',
                  cursor: pvpWheelLoading ? 'wait' : 'pointer'
                }}
              >
                {pvpWheelLoading ? 'Loading...' : 'Join Battle'}
              </button>
            </div>
          </div>
        </div>

        {/* PROVABLY FAIR BADGE */}
        <div 
          className="w-full rounded-xl flex items-center justify-center gap-3 mt-6"
          style={{
            backgroundColor: 'rgba(45, 108, 223, 0.08)',
            border: '1px solid rgba(45, 108, 223, 0.2)',
            padding: '14px 20px'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--blue-primary)" strokeWidth="2.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <path d="M9 12l2 2 4-4"/>
          </svg>
          <p className="text-sm font-bold" style={{ color: 'var(--blue-primary)' }}>
            Provably Fair · Secure Play · Verified Games
          </p>
        </div>
      </div>
    </div>
  );
}