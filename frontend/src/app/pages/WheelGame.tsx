import { useState } from 'react';
import { useUser } from '../context/UserContext';
import { toast } from 'sonner';
import { Menu, Info, Sparkles, History, Shield, Settings, Volume2, VolumeX, Zap } from 'lucide-react';
import { useNavigate } from 'react-router';
import { TopBar } from '../components/TopBar';
import { BackButton } from '../components/BackButton';
import { GameFooter } from '../components/GameFooter';

type GameResult = {
  id: number;
  multiplier: number;
  result: 'win' | 'loss';
  betAmount: number;
  profitLoss: number;
  timestamp: string;
};

export function WheelGame() {
  const { gameBalance, updateGameBalance, formatUSDT } = useUser();
  const navigate = useNavigate();
  const [betAmount, setBetAmount] = useState<number>(10);
  const [autoBetAmount, setAutoBetAmount] = useState<number>(1);
  const [selectedMultiplier, setSelectedMultiplier] = useState<{ value: number; label: string; chance: number; color: string }>({
    value: 1.5,
    label: 'Balanced',
    chance: 50,
    color: '#FBBF24'
  });
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [winAmount, setWinAmount] = useState(0);
  const [mode, setMode] = useState<'manual' | 'auto'>('manual');
  const [showRules, setShowRules] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showFairness, setShowFairness] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showWinPopup, setShowWinPopup] = useState(false);
  
  // Auto mode settings
  const [autoSpins, setAutoSpins] = useState<number>(10);
  const [stopOnProfit, setStopOnProfit] = useState<number>(100);
  const [stopOnLoss, setStopOnLoss] = useState<number>(50);
  const [isAutoRunning, setIsAutoRunning] = useState(false);
  const [autoSpinsRemaining, setAutoSpinsRemaining] = useState(0);
  
  // Settings
  const [difficulty, setDifficulty] = useState('Medium');
  const [segments, setSegments] = useState(50);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [animationEnabled, setAnimationEnabled] = useState(true);
  
  // Fairness
  const [serverSeed] = useState('a7f2d9e4c8b3a1f6e9d2c5b8a4e7d1c9');
  const [clientSeed, setClientSeed] = useState('c3f8e2a9d7b4f1e6a8c2d5b9e3f7a1d4');
  const [nonce, setNonce] = useState(1);
  
  // Game history
  const [gameHistory, setGameHistory] = useState<GameResult[]>([]);

  const multiplierOptions = [
    { value: 1.2, label: 'Safe', chance: 75, color: '#34D399' },
    { value: 1.5, label: 'Balanced', chance: 50, color: '#FBBF24' },
    { value: 3.0, label: 'Risky', chance: 25, color: '#EF4444' }
  ];

  // Generate wheel segments with random color distribution
  const generateWheelSegments = () => {
    const totalSegments = segments;
    const winSegments = Math.floor((selectedMultiplier.chance / 100) * totalSegments);
    
    // Create array of win/loss markers
    const markers = Array(totalSegments).fill(false);
    const winIndices: number[] = [];
    
    // Randomly distribute win segments
    while (winIndices.length < winSegments) {
      const randomIndex = Math.floor(Math.random() * totalSegments);
      if (!markers[randomIndex]) {
        markers[randomIndex] = true;
        winIndices.push(randomIndex);
      }
    }
    
    // Create segments
    const segs = [];
    for (let i = 0; i < totalSegments; i++) {
      segs.push({
        angle: (360 / totalSegments) * i,
        isWin: markers[i],
        color: markers[i] ? selectedMultiplier.color : (i % 3 === 0 ? '#1A1F2E' : i % 3 === 1 ? '#1E2433' : '#151923')
      });
    }
    
    return segs;
  };

  const wheelSegments = generateWheelSegments();
  const potentialWin = betAmount * selectedMultiplier.value;
  const autoPotentialWin = autoBetAmount * selectedMultiplier.value;
  const totalAutoBet = autoBetAmount * autoSpins;

  const handleSpin = () => {
    if (betAmount <= 0) {
      toast.error('Please enter a valid bet amount');
      return;
    }
    if (betAmount > gameBalance) {
      toast.error('Insufficient balance');
      return;
    }

    setIsSpinning(true);
    updateGameBalance(-betAmount);
    setNonce(prev => prev + 1);

    const spins = 5 + Math.random() * 3;
    const randomAngle = Math.random() * 360;
    const finalRotation = rotation + (spins * 360) + randomAngle;
    setRotation(finalRotation);

    setTimeout(() => {
      const normalizedAngle = finalRotation % 360;
      const segmentAngle = 360 / wheelSegments.length;
      const segmentIndex = Math.floor(normalizedAngle / segmentAngle);
      const landedSegment = wheelSegments[segmentIndex];

      if (landedSegment.isWin) {
        const won = betAmount * selectedMultiplier.value;
        setWinAmount(won);
        updateGameBalance(won);
        setIsWin(true);
        
        // Add to history - MANDATORY
        setGameHistory(prev => [{
          id: Date.now(),
          multiplier: selectedMultiplier.value,
          result: 'win',
          betAmount,
          profitLoss: won - betAmount,
          timestamp: new Date().toLocaleTimeString()
        }, ...prev].slice(0, 10));
        
        setShowWinPopup(true);
      } else {
        setIsWin(false);
        
        // Add to history - MANDATORY
        setGameHistory(prev => [{
          id: Date.now(),
          multiplier: selectedMultiplier.value,
          result: 'loss',
          betAmount,
          profitLoss: -betAmount,
          timestamp: new Date().toLocaleTimeString()
        }, ...prev].slice(0, 10));
        
        toast.error('Better luck next time!');
      }
      
      setIsSpinning(false);
      setShowResult(true);
      
      setTimeout(() => {
        setShowResult(false);
      }, 2000);
    }, 4000);
  };

  const handleCollect = () => {
    setShowWinPopup(false);
    toast.success(`Collected ${formatUSDT(winAmount)}!`);
  };

  const handlePlayAgain = () => {
    setShowWinPopup(false);
    handleSpin();
  };

  const startAutoPlay = async () => {
    if (autoBetAmount <= 0) {
      toast.error('Please enter a valid bet amount');
      return;
    }
    if (autoBetAmount > gameBalance) {
      toast.error('Insufficient balance');
      return;
    }

    setIsAutoRunning(true);
    setAutoSpinsRemaining(autoSpins);
    
    let spinsLeft = autoSpins;
    let totalProfitLoss = 0;
    
    const runAutoSpin = async () => {
      if (spinsLeft <= 0) {
        setIsAutoRunning(false);
        setAutoSpinsRemaining(0);
        toast.success('Auto spin completed!');
        return;
      }
      
      if (autoBetAmount > gameBalance) {
        setIsAutoRunning(false);
        setAutoSpinsRemaining(0);
        toast.error('Insufficient balance to continue');
        return;
      }
      
      // Check stop conditions
      if (totalProfitLoss >= stopOnProfit) {
        setIsAutoRunning(false);
        setAutoSpinsRemaining(0);
        toast.success(`Auto stopped: Profit target reached! +${formatUSDT(totalProfitLoss)}`);
        return;
      }
      
      if (Math.abs(totalProfitLoss) >= stopOnLoss && totalProfitLoss < 0) {
        setIsAutoRunning(false);
        setAutoSpinsRemaining(0);
        toast.error(`Auto stopped: Loss limit reached! ${formatUSDT(totalProfitLoss)}`);
        return;
      }
      
      setIsSpinning(true);
      updateGameBalance(-autoBetAmount);
      setNonce(prev => prev + 1);

      const spins = 5 + Math.random() * 3;
      const randomAngle = Math.random() * 360;
      const finalRotation = rotation + (spins * 360) + randomAngle;
      setRotation(finalRotation);

      setTimeout(() => {
        const normalizedAngle = finalRotation % 360;
        const segmentAngle = 360 / wheelSegments.length;
        const segmentIndex = Math.floor(normalizedAngle / segmentAngle);
        const landedSegment = wheelSegments[segmentIndex];

        let profitLoss = 0;

        if (landedSegment.isWin) {
          const won = autoBetAmount * selectedMultiplier.value;
          profitLoss = won - autoBetAmount;
          updateGameBalance(won);
          
          // Add to history - MANDATORY
          setGameHistory(prev => [{
            id: Date.now() + Math.random(),
            multiplier: selectedMultiplier.value,
            result: 'win',
            betAmount: autoBetAmount,
            profitLoss,
            timestamp: new Date().toLocaleTimeString()
          }, ...prev].slice(0, 10));
        } else {
          profitLoss = -autoBetAmount;
          
          // Add to history - MANDATORY
          setGameHistory(prev => [{
            id: Date.now() + Math.random(),
            multiplier: selectedMultiplier.value,
            result: 'loss',
            betAmount: autoBetAmount,
            profitLoss,
            timestamp: new Date().toLocaleTimeString()
          }, ...prev].slice(0, 10));
        }
        
        totalProfitLoss += profitLoss;
        setIsSpinning(false);
        spinsLeft--;
        setAutoSpinsRemaining(spinsLeft);
        
        // Delay before next spin
        setTimeout(() => {
          if (spinsLeft > 0 && isAutoRunning) {
            runAutoSpin();
          } else {
            setIsAutoRunning(false);
            setAutoSpinsRemaining(0);
            if (spinsLeft === 0) {
              toast.success('Auto spin completed!');
            }
          }
        }, 1500);
      }, 4000);
    };
    
    runAutoSpin();
  };

  const stopAutoPlay = () => {
    setIsAutoRunning(false);
    setAutoSpinsRemaining(0);
    toast.info('Auto mode stopped');
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #0B1437 0%, #1E293B 50%, #0F172A 100%)' }}>
      <TopBar />
      <div className="w-full max-w-[480px] md:max-w-[768px] lg:max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8 pt-2">
        <BackButton />
      </div>
      
      {/* Header - Reduced Height */}
      <div className="sticky top-0 z-30 py-3" style={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
        <div className="flex items-center justify-between w-full max-w-[480px] md:max-w-[768px] lg:max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8">
          <h1 className="text-lg font-bold" style={{ color: '#FFFFFF' }}>Wheel Game</h1>
          <div className="flex gap-2">
            <button onClick={() => setShowHistory(true)} className="p-1.5 hover:bg-white/5 rounded-lg transition-all">
              <History className="w-5 h-5" style={{ color: '#94A3B8' }} />
            </button>
            <button onClick={() => setShowSettings(true)} className="p-1.5 hover:bg-white/5 rounded-lg transition-all">
              <Settings className="w-5 h-5" style={{ color: '#94A3B8' }} />
            </button>
          </div>
        </div>
      </div>

      <div className="w-full max-w-[480px] md:max-w-[768px] lg:max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8"> {/* Removed pb-20 */}
        {/* Balance Card - Slick */}
        <div className="mb-4 rounded-xl p-4 hover:shadow-xl transition-all" style={{ 
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(51, 65, 85, 0.5) 100%)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
        }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium mb-0.5" style={{ color: '#94A3B8' }}>Balance</p>
              <p className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>{formatUSDT(gameBalance)}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#34D399', boxShadow: '0 0 8px #34D399' }}></div>
              <span className="text-xs font-medium" style={{ color: '#34D399' }}>Live</span>
            </div>
          </div>
        </div>

        {/* Wheel Section - Slick */}
        <div className="mb-4 rounded-xl p-5 hover:shadow-xl transition-all" style={{ 
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(51, 65, 85, 0.5) 100%)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
        }}>
          <div className="relative flex items-center justify-center" style={{ minHeight: '360px' }}>
            {/* Top Pointer */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20" style={{ top: '5px' }}>
              <svg width="36" height="45" viewBox="0 0 40 50">
                <defs>
                  <linearGradient id="arrowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#EF4444' }} />
                    <stop offset="100%" style={{ stopColor: '#DC2626' }} />
                  </linearGradient>
                </defs>
                <path d="M 20 45 L 5 10 L 20 15 L 35 10 Z" fill="url(#arrowGrad)" stroke="#FFFFFF" strokeWidth="2" filter="drop-shadow(0 3px 5px rgba(0, 0, 0, 0.4))" />
              </svg>
            </div>

            {/* Wheel */}
            <div className="relative">
              <svg
                width="320"
                height="320"
                viewBox="0 0 400 400"
                style={{ 
                  transform: `rotate(${rotation}deg)`,
                  transition: isSpinning && animationEnabled ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
                  filter: isSpinning ? 'blur(1.5px)' : 'drop-shadow(0 8px 25px rgba(0, 0, 0, 0.4))'
                }}
              >
                <circle cx="200" cy="200" r="192" fill="none" stroke="rgba(52, 211, 153, 0.4)" strokeWidth="3" opacity="0.7" />
                
                {wheelSegments.map((segment, i) => {
                  const segmentAngle = 360 / wheelSegments.length;
                  const startAngle = (segment.angle - 90) * (Math.PI / 180);
                  const endAngle = ((segment.angle + segmentAngle) - 90) * (Math.PI / 180);
                  
                  const x1 = 200 + 182 * Math.cos(startAngle);
                  const y1 = 200 + 182 * Math.sin(startAngle);
                  const x2 = 200 + 182 * Math.cos(endAngle);
                  const y2 = 200 + 182 * Math.sin(endAngle);

                  return (
                    <path
                      key={i}
                      d={`M 200 200 L ${x1} ${y1} A 182 182 0 0 1 ${x2} ${y2} Z`}
                      fill={segment.color}
                      stroke="rgba(15, 23, 42, 0.7)"
                      strokeWidth="1.5"
                      opacity={segment.isWin ? 1 : 0.65}
                      style={{ transition: 'all 0.3s ease' }}
                    />
                  );
                })}

                <circle cx="200" cy="200" r="55" fill="#0F172A" stroke="#34D399" strokeWidth="2.5" />
                <circle cx="200" cy="200" r="45" fill="rgba(30, 41, 59, 0.95)" />
              </svg>
              
              {/* Center Display */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                {isSpinning ? (
                  <>
                    <Sparkles className="w-9 h-9 mx-auto mb-1 animate-spin" style={{ color: '#34D399' }} />
                    <p className="text-xs font-semibold" style={{ color: '#94A3B8' }}>SPINNING...</p>
                  </>
                ) : (
                  <>
                    <p className="text-4xl font-bold mb-0.5" style={{ color: '#FFFFFF' }}>{selectedMultiplier.value}x</p>
                    <p className="text-xs font-semibold" style={{ color: '#94A3B8' }}>{selectedMultiplier.label}</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Multiplier Selection Cards - Slick */}
        <div className="mb-4">
          <p className="text-xs font-semibold mb-2.5 uppercase tracking-wide" style={{ color: '#94A3B8' }}>Select Risk Level</p>
          <div className="grid grid-cols-3 gap-2.5">
            {multiplierOptions.map((option) => (
              <button
                key={option.label}
                onClick={() => setSelectedMultiplier(option)}
                className="rounded-xl p-3.5 transition-all hover:scale-105 active:scale-95"
                style={{
                  background: selectedMultiplier.value === option.value 
                    ? `linear-gradient(135deg, ${option.color}35 0%, ${option.color}15 100%)`
                    : 'rgba(30, 41, 59, 0.5)',
                  border: selectedMultiplier.value === option.value 
                    ? `2px solid ${option.color}`
                    : '2px solid rgba(148, 163, 184, 0.08)',
                  boxShadow: selectedMultiplier.value === option.value 
                    ? `0 0 18px ${option.color}35`
                    : 'none'
                }}
              >
                <div className="text-center">
                  <p className="text-xl font-bold mb-0.5" style={{ color: option.color }}>{option.value}x</p>
                  <p className="text-xs font-semibold mb-0.5" style={{ color: '#FFFFFF' }}>{option.label}</p>
                  <p className="text-xs" style={{ color: '#94A3B8' }}>{option.chance}%</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {mode === 'manual' ? (
          <>
            {/* Bet Section - Slick */}
            <div className="mb-4 rounded-xl p-4 hover:shadow-xl transition-all" style={{ 
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(51, 65, 85, 0.5) 100%)',
              border: '1px solid rgba(148, 163, 184, 0.1)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
            }}>
              <label className="block text-xs font-semibold mb-2.5 uppercase tracking-wide" style={{ color: '#94A3B8' }}>
                Bet Amount
              </label>
              
              <div className="relative mb-3">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xl font-bold" style={{ color: '#94A3B8' }}>$</span>
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl text-xl font-bold text-center transition-all focus:ring-2 focus:ring-blue-500/50"
                  style={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.7)',
                    border: '2px solid rgba(148, 163, 184, 0.15)',
                    color: '#FFFFFF'
                  }}
                  placeholder="0.00"
                />
              </div>

              <div className="grid grid-cols-6 gap-2 mb-3.5">
                {[1, 5, 10, 50].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setBetAmount(amount)}
                    className="col-span-1 py-2 rounded-lg font-semibold text-sm hover:scale-105 active:scale-95 transition-all"
                    style={{ backgroundColor: 'rgba(51, 65, 85, 0.7)', color: '#FFFFFF' }}
                  >
                    ${amount}
                  </button>
                ))}
                <button
                  onClick={() => setBetAmount(prev => prev * 2)}
                  className="col-span-1 py-2 rounded-lg font-semibold text-sm hover:scale-105 active:scale-95 transition-all"
                  style={{ backgroundColor: 'rgba(251, 191, 36, 0.15)', color: '#FBBF24', border: '1px solid rgba(251, 191, 36, 0.4)' }}
                >
                  2×
                </button>
                <button
                  onClick={() => setBetAmount(prev => prev / 2)}
                  className="col-span-1 py-2 rounded-lg font-semibold text-sm hover:scale-105 active:scale-95 transition-all"
                  style={{ backgroundColor: 'rgba(251, 191, 36, 0.15)', color: '#FBBF24', border: '1px solid rgba(251, 191, 36, 0.4)' }}
                >
                  ½
                </button>
              </div>

              <div className="text-center py-2.5 rounded-lg" style={{ backgroundColor: 'rgba(52, 211, 153, 0.08)', border: '1px solid rgba(52, 211, 153, 0.25)' }}>
                <p className="text-xs font-medium mb-0.5" style={{ color: '#94A3B8' }}>Potential Win</p>
                <p className="text-xl font-bold" style={{ color: '#34D399' }}>${potentialWin.toFixed(2)}</p>
              </div>
            </div>

            {/* Spin Button */}
            <button
              onClick={handleSpin}
              disabled={isSpinning || betAmount <= 0}
              className="w-full py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4 hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #0EA5E9 0%, #0A84FF 50%, #2563EB 100%)',
                color: '#FFFFFF',
                boxShadow: isSpinning ? 'none' : '0 8px 30px rgba(10, 132, 255, 0.4)'
              }}
            >
              {isSpinning ? 'SPINNING...' : 'SPIN'}
            </button>
          </>
        ) : (
          // Auto Mode Panel - Bet Amount FIRST
          <div className="mb-4 rounded-xl p-4 hover:shadow-xl transition-all" style={{ 
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(51, 65, 85, 0.5) 100%)',
            border: '1px solid rgba(148, 163, 184, 0.1)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
          }}>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5" style={{ color: '#FBBF24' }} />
              <h3 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#FFFFFF' }}>Auto Mode</h3>
            </div>

            {/* BET AMOUNT - FIRST PRIORITY */}
            <div className="mb-4">
              <label className="block text-sm font-bold mb-2.5 uppercase tracking-wide" style={{ color: '#FFFFFF' }}>
                Bet Amount
              </label>
              
              <div className="relative mb-3">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold" style={{ color: '#94A3B8' }}>$</span>
                <input
                  type="number"
                  value={autoBetAmount}
                  onChange={(e) => setAutoBetAmount(Number(e.target.value))}
                  className="w-full pl-12 pr-4 py-4 rounded-xl text-2xl font-bold text-center transition-all focus:ring-2 focus:ring-yellow-500/50"
                  style={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.8)',
                    border: '2px solid rgba(251, 191, 36, 0.3)',
                    color: '#FFFFFF'
                  }}
                  placeholder="1.00"
                />
              </div>

              <div className="grid grid-cols-6 gap-2 mb-3">
                {[1, 5, 10, 50].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setAutoBetAmount(amount)}
                    className="col-span-1 py-2.5 rounded-lg font-bold text-sm hover:scale-105 active:scale-95 transition-all"
                    style={{ backgroundColor: 'rgba(51, 65, 85, 0.8)', color: '#FFFFFF' }}
                  >
                    ${amount}
                  </button>
                ))}
                <button
                  onClick={() => setAutoBetAmount(prev => prev * 2)}
                  className="col-span-1 py-2.5 rounded-lg font-bold text-sm hover:scale-105 active:scale-95 transition-all"
                  style={{ backgroundColor: 'rgba(251, 191, 36, 0.2)', color: '#FBBF24', border: '1px solid rgba(251, 191, 36, 0.5)' }}
                >
                  2×
                </button>
                <button
                  onClick={() => setAutoBetAmount(prev => Math.max(1, prev / 2))}
                  className="col-span-1 py-2.5 rounded-lg font-bold text-sm hover:scale-105 active:scale-95 transition-all"
                  style={{ backgroundColor: 'rgba(251, 191, 36, 0.2)', color: '#FBBF24', border: '1px solid rgba(251, 191, 36, 0.5)' }}
                >
                  ½
                </button>
              </div>
            </div>

            {/* NUMBER OF SPINS */}
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: '#94A3B8' }}>
                Number of Spins
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[10, 25, 50, 100].map((spin) => (
                  <button
                    key={spin}
                    onClick={() => setAutoSpins(spin)}
                    className="py-2.5 rounded-lg font-bold text-sm transition-all hover:scale-105 active:scale-95"
                    style={{
                      backgroundColor: autoSpins === spin ? '#FBBF24' : 'rgba(51, 65, 85, 0.6)',
                      color: autoSpins === spin ? '#1E293B' : '#FFFFFF',
                      border: autoSpins === spin ? '2px solid #F59E0B' : '1px solid rgba(148, 163, 184, 0.1)'
                    }}
                  >
                    {spin}
                  </button>
                ))}
              </div>
            </div>

            {/* STOP CONDITIONS */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: '#94A3B8' }}>Stop on Profit</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold" style={{ color: '#94A3B8' }}>$</span>
                  <input
                    type="number"
                    value={stopOnProfit}
                    onChange={(e) => setStopOnProfit(Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2.5 rounded-lg font-semibold text-center transition-all"
                    style={{ backgroundColor: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(52, 211, 153, 0.2)', color: '#FFFFFF' }}
                    placeholder="100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: '#94A3B8' }}>Stop on Loss</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold" style={{ color: '#94A3B8' }}>$</span>
                  <input
                    type="number"
                    value={stopOnLoss}
                    onChange={(e) => setStopOnLoss(Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2.5 rounded-lg font-semibold text-center transition-all"
                    style={{ backgroundColor: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#FFFFFF' }}
                    placeholder="50"
                  />
                </div>
              </div>
            </div>

            {/* RISK LEVEL CARDS */}
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: '#94A3B8' }}>
                Risk Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {multiplierOptions.map((option) => (
                  <button
                    key={option.label}
                    onClick={() => setSelectedMultiplier(option)}
                    className="rounded-lg p-3 transition-all hover:scale-105 active:scale-95"
                    style={{
                      background: selectedMultiplier.value === option.value 
                        ? `linear-gradient(135deg, ${option.color}40 0%, ${option.color}20 100%)`
                        : 'rgba(30, 41, 59, 0.5)',
                      border: selectedMultiplier.value === option.value 
                        ? `2px solid ${option.color}`
                        : '1px solid rgba(148, 163, 184, 0.1)',
                      boxShadow: selectedMultiplier.value === option.value 
                        ? `0 0 15px ${option.color}30`
                        : 'none'
                    }}
                  >
                    <div className="text-center">
                      <p className="text-lg font-bold" style={{ color: option.color }}>{option.value}x</p>
                      <p className="text-xs font-semibold" style={{ color: '#FFFFFF' }}>{option.label}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* SUMMARY BOX */}
            <div className="rounded-lg p-3 mb-4" style={{ backgroundColor: 'rgba(251, 191, 36, 0.08)', border: '1px solid rgba(251, 191, 36, 0.25)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium" style={{ color: '#94A3B8' }}>Total Bet</span>
                <span className="text-sm font-bold" style={{ color: '#FFFFFF' }}>${totalAutoBet.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium" style={{ color: '#94A3B8' }}>Potential Win (per spin)</span>
                <span className="text-sm font-bold" style={{ color: '#FBBF24' }}>${autoPotentialWin.toFixed(2)}</span>
              </div>
            </div>

            {isAutoRunning ? (
              <div className="space-y-3">
                <div className="text-center py-3 rounded-lg" style={{ backgroundColor: 'rgba(251, 191, 36, 0.15)', border: '1px solid rgba(251, 191, 36, 0.4)' }}>
                  <p className="text-xs font-medium mb-0.5" style={{ color: '#94A3B8' }}>Spins Remaining</p>
                  <p className="text-3xl font-bold" style={{ color: '#FBBF24' }}>{autoSpinsRemaining}</p>
                </div>
                <button
                  onClick={stopAutoPlay}
                  className="w-full py-3.5 rounded-xl font-bold transition-all hover:scale-105 active:scale-95"
                  style={{ backgroundColor: '#EF4444', color: '#FFFFFF', boxShadow: '0 8px 30px rgba(239, 68, 68, 0.4)' }}
                >
                  Stop Auto
                </button>
              </div>
            ) : (
              <button
                onClick={startAutoPlay}
                className="w-full py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)', color: '#1E293B', boxShadow: '0 8px 30px rgba(251, 191, 36, 0.5)' }}
              >
                Start Auto Spin
              </button>
            )}
          </div>
        )}

        {/* Mode Toggle */}
        <div className="flex rounded-xl p-1.5 hover:shadow-lg transition-all" style={{ backgroundColor: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(148, 163, 184, 0.08)' }}>
          <button
            onClick={() => setMode('manual')}
            className="flex-1 py-2.5 rounded-lg font-semibold transition-all hover:scale-105 active:scale-95"
            style={{
              backgroundColor: mode === 'manual' ? '#0A84FF' : 'transparent',
              color: mode === 'manual' ? '#FFFFFF' : '#94A3B8',
              boxShadow: mode === 'manual' ? '0 4px 15px rgba(10, 132, 255, 0.3)' : 'none'
            }}
          >
            Manual
          </button>
          <button
            onClick={() => setMode('auto')}
            className="flex-1 py-2.5 rounded-lg font-semibold transition-all hover:scale-105 active:scale-95"
            style={{
              backgroundColor: mode === 'auto' ? '#0A84FF' : 'transparent',
              color: mode === 'auto' ? '#FFFFFF' : '#94A3B8',
              boxShadow: mode === 'auto' ? '0 4px 15px rgba(10, 132, 255, 0.3)' : 'none'
            }}
          >
            Auto
          </button>
        </div>

        {/* Fairness Button */}
        <button
          onClick={() => setShowFairness(true)}
          className="w-full mt-4 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all"
          style={{ backgroundColor: 'rgba(52, 211, 153, 0.08)', color: '#34D399', border: '1px solid rgba(52, 211, 153, 0.2)' }}
        >
          <Shield className="w-4 h-4" />
          Provably Fair
        </button>
      </div>

      {/* Win Popup Modal */}
      {showWinPopup && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="rounded-2xl max-w-md w-full p-8 text-center transform scale-100 animate-bounce" style={{ 
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(51, 65, 85, 0.98) 100%)',
            border: '2px solid #34D399',
            boxShadow: '0 20px 60px rgba(52, 211, 153, 0.3)'
          }}>
            <div className="text-7xl mb-4">🎉</div>
            <h2 className="text-4xl font-bold mb-2" style={{ color: '#34D399' }}>You Won!</h2>
            <p className="text-5xl font-bold mb-3" style={{ color: '#FFFFFF' }}>${winAmount.toFixed(2)}</p>
            <p className="text-lg mb-6" style={{ color: '#94A3B8' }}>{selectedMultiplier.value}x Multiplier</p>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleCollect}
                className="py-3.5 rounded-xl font-bold transition-all hover:scale-105 active:scale-95"
                style={{ backgroundColor: '#34D399', color: '#FFFFFF', boxShadow: '0 8px 25px rgba(52, 211, 153, 0.4)' }}
              >
                Collect
              </button>
              <button
                onClick={handlePlayAgain}
                className="py-3.5 rounded-xl font-bold transition-all hover:scale-105 active:scale-95"
                style={{ backgroundColor: '#0A84FF', color: '#FFFFFF', boxShadow: '0 8px 25px rgba(10, 132, 255, 0.4)' }}
              >
                Play Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl max-w-md w-full p-5 max-h-[80vh] overflow-y-auto" style={{ 
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(51, 65, 85, 0.98) 100%)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)'
          }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold" style={{ color: '#FFFFFF' }}>Game History</h2>
              <button onClick={() => setShowHistory(false)} className="text-2xl" style={{ color: '#94A3B8' }}>×</button>
            </div>
            
            <div className="space-y-2">
              {gameHistory.length === 0 ? (
                <p className="text-center py-8" style={{ color: '#94A3B8' }}>No games played yet</p>
              ) : (
                gameHistory.map((game) => (
                  <div 
                    key={game.id}
                    className="rounded-lg p-3 flex items-center justify-between hover:scale-102 transition-all"
                    style={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.6)',
                      border: `1px solid ${game.result === 'win' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                    }}
                  >
                    <div>
                      <p className="text-sm font-bold mb-0.5" style={{ color: '#FFFFFF' }}>{game.multiplier}x</p>
                      <p className="text-xs" style={{ color: '#94A3B8' }}>${game.betAmount}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold mb-0.5" style={{ color: game.result === 'win' ? '#34D399' : '#EF4444' }}>
                        {game.result === 'win' ? 'WIN' : 'LOSS'}
                      </p>
                      <p className="text-xs font-semibold" style={{ color: game.result === 'win' ? '#34D399' : '#EF4444' }}>
                        {game.result === 'win' ? '+' : ''}{game.profitLoss.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs" style={{ color: '#64748B' }}>{game.timestamp}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Fairness Modal */}
      {showFairness && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl max-w-md w-full p-5" style={{ 
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(51, 65, 85, 0.98) 100%)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)'
          }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold" style={{ color: '#FFFFFF' }}>Fairness System</h2>
              <button onClick={() => setShowFairness(false)} className="text-2xl" style={{ color: '#94A3B8' }}>×</button>
            </div>
            
            <div className="space-y-3 mb-5">
              <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
                <p className="text-xs font-semibold mb-1" style={{ color: '#94A3B8' }}>Server Seed (Hashed)</p>
                <p className="text-xs font-mono break-all" style={{ color: '#FFFFFF' }}>{serverSeed}</p>
              </div>

              <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
                <p className="text-xs font-semibold mb-1" style={{ color: '#94A3B8' }}>Client Seed</p>
                <p className="text-xs font-mono break-all" style={{ color: '#FFFFFF' }}>{clientSeed}</p>
              </div>

              <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
                <p className="text-xs font-semibold mb-1" style={{ color: '#94A3B8' }}>Nonce</p>
                <p className="text-xl font-bold" style={{ color: '#FFFFFF' }}>{nonce}</p>
              </div>
            </div>

            <button
              onClick={() => toast.success('Result verified!')}
              className="w-full py-3 rounded-xl font-semibold transition-all hover:scale-105 active:scale-95"
              style={{ backgroundColor: '#34D399', color: '#FFFFFF', boxShadow: '0 8px 25px rgba(52, 211, 153, 0.4)' }}
            >
              Verify Result
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl max-w-md w-full p-5" style={{ 
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(51, 65, 85, 0.98) 100%)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)'
          }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold" style={{ color: '#FFFFFF' }}>Settings</h2>
              <button onClick={() => setShowSettings(false)} className="text-2xl" style={{ color: '#94A3B8' }}>×</button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: '#94A3B8' }}>Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg font-semibold transition-all"
                  style={{ backgroundColor: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(148, 163, 184, 0.15)', color: '#FFFFFF' }}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: '#94A3B8' }}>Segments</label>
                <select
                  value={segments}
                  onChange={(e) => setSegments(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-lg font-semibold transition-all"
                  style={{ backgroundColor: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(148, 163, 184, 0.15)', color: '#FFFFFF' }}
                >
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              <div className="flex items-center justify-between rounded-lg p-3" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
                <div className="flex items-center gap-2">
                  {soundEnabled ? <Volume2 className="w-5 h-5" style={{ color: '#34D399' }} /> : <VolumeX className="w-5 h-5" style={{ color: '#EF4444' }} />}
                  <span className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>Sound</span>
                </div>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="w-12 h-6 rounded-full transition-all"
                  style={{ 
                    backgroundColor: soundEnabled ? '#34D399' : '#334155',
                    boxShadow: soundEnabled ? '0 0 15px rgba(52, 211, 153, 0.4)' : 'none'
                  }}
                >
                  <div 
                    className="w-5 h-5 rounded-full bg-white transition-transform"
                    style={{ transform: soundEnabled ? 'translateX(24px)' : 'translateX(2px)' }}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between rounded-lg p-3" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" style={{ color: animationEnabled ? '#34D399' : '#EF4444' }} />
                  <span className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>Animation</span>
                </div>
                <button
                  onClick={() => setAnimationEnabled(!animationEnabled)}
                  className="w-12 h-6 rounded-full transition-all"
                  style={{ 
                    backgroundColor: animationEnabled ? '#34D399' : '#334155',
                    boxShadow: animationEnabled ? '0 0 15px rgba(52, 211, 153, 0.4)' : 'none'
                  }}
                >
                  <div 
                    className="w-5 h-5 rounded-full bg-white transition-transform"
                    style={{ transform: animationEnabled ? 'translateX(24px)' : 'translateX(2px)' }}
                  />
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowSettings(false)}
              className="w-full mt-5 py-3 rounded-xl font-semibold transition-all hover:scale-105 active:scale-95"
              style={{ backgroundColor: '#0A84FF', color: '#FFFFFF' }}
            >
              Save Settings
            </button>
          </div>
        </div>
      )}

      {/* Rules Modal */}
      {showRules && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl max-w-md w-full p-6" style={{ 
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(51, 65, 85, 0.95) 100%)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)'
          }}>
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#FFFFFF' }}>How to Play</h2>
            <div className="space-y-3 mb-6 text-sm" style={{ color: '#94A3B8' }}>
              <p><strong style={{ color: '#34D399' }}>1.</strong> Choose your risk level (Safe, Balanced, or Risky)</p>
              <p><strong style={{ color: '#34D399' }}>2.</strong> Enter your bet amount</p>
              <p><strong style={{ color: '#34D399' }}>3.</strong> Click SPIN to start the wheel</p>
              <p><strong style={{ color: '#34D399' }}>4.</strong> Win if the wheel lands on a highlighted segment</p>
              <p className="pt-2 border-t" style={{ borderColor: 'rgba(148, 163, 184, 0.2)' }}>
                <strong>Win Chances:</strong><br/>
                Safe: 75% | Balanced: 50% | Risky: 25%
              </p>
            </div>
            <button
              onClick={() => setShowRules(false)}
              className="w-full py-3 rounded-xl font-semibold"
              style={{ backgroundColor: '#0A84FF', color: '#FFFFFF' }}
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in;
        }
      `}</style>

      <GameFooter />
    </div>
  );
}