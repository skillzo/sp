import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Shield, Info, BarChart3, ChevronUp, ChevronDown, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useUser } from '../context/UserContext';
import { toast } from 'sonner';
import { GameFooter } from '../components/GameFooter';

interface Player {
  id: string;
  name: string;
  bet: number;
  cashoutAt?: number;
  status: 'active' | 'cashedout' | 'lost';
}

interface GameEvent {
  id: string;
  player: string;
  type: 'join' | 'cashout' | 'bigwin' | 'loss';
  amount?: number;
  multiplier?: number;
  time: string;
}

interface BetHistoryItem {
  id: string;
  betAmount: number;
  cashoutMultiplier: number;
  result: 'win' | 'loss';
  profit: number;
  time: string;
  roundId: string;
}

export function CrashGame() {
  const navigate = useNavigate();
  const { gameBalance, updateGameBalance, formatUSDT } = useUser();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [betAmount, setBetAmount] = useState<number>(10);
  const [autoCashout, setAutoCashout] = useState<number>(2.0);
  const [gameState, setGameState] = useState<'waiting' | 'running' | 'crashed'>('waiting');
  const [currentMultiplier, setCurrentMultiplier] = useState<number>(1.00);
  const [crashPoint, setCrashPoint] = useState<number>(0);
  const [hasPlacedBet, setHasPlacedBet] = useState(false);
  const [hasCashedOut, setHasCashedOut] = useState(false);
  const [cashoutMultiplier, setCashoutMultiplier] = useState<number>(0);
  const [waitingTime, setWaitingTime] = useState(10);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [multiplierHistory, setMultiplierHistory] = useState<number[]>([1.52, 3.24, 1.08, 2.67, 1.94, 5.43, 1.23, 2.88]);
  const [autoMode, setAutoMode] = useState(false);
  const [pulseButton, setPulseButton] = useState(false);
  const [liveFeedExpanded, setLiveFeedExpanded] = useState(false);
  const [showCrashResult, setShowCrashResult] = useState(false);
  const [balanceFlash, setBalanceFlash] = useState<'none' | 'green' | 'red'>('none');
  const [activePlayers, setActivePlayers] = useState(1);
  const [poolAmount, setPoolAmount] = useState(0);
  const [poolLocked, setPoolLocked] = useState(false);
  const [playerPulse, setPlayerPulse] = useState(false);
  const [betHistory, setBetHistory] = useState<BetHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'wins' | 'losses'>('all');
  const [cashoutDisabled, setCashoutDisabled] = useState(false);
  const [currentRoundId, setCurrentRoundId] = useState('');
  const [currentBetAmount, setCurrentBetAmount] = useState(0);
  
  const [players, setPlayers] = useState<Player[]>([
    { id: '1', name: 'Player ***421', bet: 50, status: 'active' },
    { id: '2', name: 'Player ***892', bet: 100, status: 'active' },
    { id: '3', name: 'Player ***156', bet: 25, status: 'active' },
  ]);
  
  const [events, setEvents] = useState<GameEvent[]>([
    { id: '1', player: 'John', type: 'join', amount: 50, time: '12:34:21' },
    { id: '2', player: 'Ayo', type: 'join', amount: 100, time: '12:34:22' },
    { id: '3', player: 'Mike', type: 'join', amount: 25, time: '12:34:23' },
    { id: '4', player: 'Sarah', type: 'cashout', multiplier: 2.45, amount: 50, time: '12:34:28' },
  ]);

  const [showRules, setShowRules] = useState(false);
  const [showFairness, setShowFairness] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const totalRoundStake = players.reduce((sum, p) => sum + p.bet, 0);
  const expectedProfit = betAmount * autoCashout;

  const getMultiplierColor = (multiplier: number) => {
    if (multiplier < 1.5) return '#00FF9A';
    if (multiplier < 3) return '#FFD60A';
    return '#FF3B30';
  };

  const drawGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const padding = { left: 60, right: 40, top: 40, bottom: 50 };
    const graphWidth = canvas.width - padding.left - padding.right;
    const graphHeight = canvas.height - padding.top - padding.bottom;
    
    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    
    // Y-axis labels (multiplier)
    const yLabels = [1, 2, 3, 5, 10];
    yLabels.forEach(mult => {
      const y = canvas.height - padding.bottom - ((mult - 1) / 9) * graphHeight;
      
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(canvas.width - padding.right, y);
      ctx.stroke();
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px Inter';
      ctx.textAlign = 'right';
      ctx.shadowBlur = 8;
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.fillText(`${mult.toFixed(1)}x`, padding.left - 10, y + 5);
      ctx.shadowBlur = 0;
    });
    
    // Vertical grid lines (time)
    for (let i = 0; i <= 10; i++) {
      const x = padding.left + (graphWidth / 10) * i;
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, canvas.height - padding.bottom);
      ctx.stroke();
    }
    
    if (gameState === 'waiting') {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 28px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(`Starting in ${waitingTime}s...`, canvas.width / 2, canvas.height / 2);
      return;
    }
    
    // Calculate progress (0 to 1 based on time)
    const maxTime = 20; // Max 20 seconds for visualization
    const progress = Math.min(elapsedTime / maxTime, 1);
    
    // Draw curve from bottom-left to current position
    const points: [number, number][] = [];
    const steps = 100;
    
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * progress;
      const x = padding.left + t * graphWidth;
      
      // Multiplier at this time point
      const multAtTime = 1 + (currentMultiplier - 1) * (i / steps);
      
      // Y position based on multiplier (1.00x at bottom, higher values go up)
      const y = canvas.height - padding.bottom - ((multAtTime - 1) / 9) * graphHeight;
      
      points.push([x, y]);
    }
    
    if (points.length < 2) return;
    
    // Gradient for the line
    const gradient = ctx.createLinearGradient(padding.left, canvas.height - padding.bottom, padding.left, padding.top);
    
    if (currentMultiplier < 1.5) {
      gradient.addColorStop(0, '#00FF9A');
      gradient.addColorStop(1, '#00FF9A');
    } else if (currentMultiplier < 3) {
      gradient.addColorStop(0, '#00FF9A');
      gradient.addColorStop(0.5, '#FFD60A');
      gradient.addColorStop(1, '#FFD60A');
    } else {
      gradient.addColorStop(0, '#FFD60A');
      gradient.addColorStop(0.6, '#FF9500');
      gradient.addColorStop(1, '#FF3B30');
    }
    
    // Draw the curve
    ctx.save();
    ctx.shadowBlur = 25;
    ctx.shadowColor = getMultiplierColor(currentMultiplier);
    
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    
    for (let i = 1; i < points.length; i++) {
      const xc = (points[i][0] + points[i - 1][0]) / 2;
      const yc = (points[i][1] + points[i - 1][1]) / 2;
      ctx.quadraticCurveTo(points[i - 1][0], points[i - 1][1], xc, yc);
    }
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.restore();
    
    // Draw particle trail
    if (gameState === 'running' && points.length > 10) {
      const trailLength = 15;
      for (let i = Math.max(0, points.length - trailLength); i < points.length; i++) {
        const opacity = (i - (points.length - trailLength)) / trailLength;
        ctx.beginPath();
        ctx.arc(points[i][0], points[i][1], 3, 0, Math.PI * 2);
        ctx.fillStyle = `${getMultiplierColor(currentMultiplier)}${Math.floor(opacity * 100).toString(16).padStart(2, '0')}`;
        ctx.fill();
      }
    }
    
    // Draw moving pointer at current position
    if (gameState === 'running' && points.length > 0) {
      const lastPoint = points[points.length - 1];
      
      // Glowing orb
      ctx.save();
      ctx.shadowBlur = 30;
      ctx.shadowColor = getMultiplierColor(currentMultiplier);
      ctx.beginPath();
      ctx.arc(lastPoint[0], lastPoint[1], 10, 0, Math.PI * 2);
      ctx.fillStyle = getMultiplierColor(currentMultiplier);
      ctx.fill();
      
      // Inner white dot
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(lastPoint[0], lastPoint[1], 4, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.restore();
      
      // Live multiplier label following the dot
      ctx.fillStyle = 'rgba(11, 15, 26, 0.95)';
      ctx.font = 'bold 16px Inter';
      const text = `${currentMultiplier.toFixed(2)}x`;
      const metrics = ctx.measureText(text);
      
      // Position label above the dot
      const labelX = lastPoint[0] - metrics.width / 2;
      const labelY = lastPoint[1] - 25;
      
      ctx.fillRect(labelX - 6, labelY - 18, metrics.width + 12, 26);
      ctx.strokeStyle = getMultiplierColor(currentMultiplier);
      ctx.lineWidth = 2;
      ctx.strokeRect(labelX - 6, labelY - 18, metrics.width + 12, 26);
      
      ctx.fillStyle = getMultiplierColor(currentMultiplier);
      ctx.fillText(text, labelX, labelY);
    }
    
    if (gameState === 'crashed') {
      // Crash overlay
      ctx.fillStyle = 'rgba(255, 59, 48, 0.4)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw crash point marker
      if (points.length > 0) {
        const crashPointPos = points[points.length - 1];
        
        // Explosion lines
        ctx.strokeStyle = 'rgba(255, 59, 48, 0.6)';
        ctx.lineWidth = 3;
        
        for (let i = 0; i < 8; i++) {
          const angle = (Math.PI * 2 * i) / 8;
          ctx.beginPath();
          ctx.moveTo(crashPointPos[0], crashPointPos[1]);
          ctx.lineTo(crashPointPos[0] + Math.cos(angle) * 100, crashPointPos[1] + Math.sin(angle) * 100);
          ctx.stroke();
        }
        
        // Crash circle
        ctx.beginPath();
        ctx.arc(crashPointPos[0], crashPointPos[1], 15, 0, Math.PI * 2);
        ctx.fillStyle = '#FF3B30';
        ctx.fill();
      }
      
      // Crash text
      ctx.fillStyle = '#FF3B30';
      ctx.font = 'bold 56px Inter';
      ctx.textAlign = 'center';
      ctx.shadowBlur = 40;
      ctx.shadowColor = '#FF3B30';
      ctx.fillText(`CRASHED @ ${crashPoint.toFixed(2)}x`, canvas.width / 2, canvas.height / 2);
    }
  };

  useEffect(() => {
    drawGraph();
  }, [currentMultiplier, gameState, waitingTime, crashPoint, elapsedTime]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (gameState === 'waiting') {
      // Simulate players joining
      if (activePlayers < 2 && !hasPlacedBet) {
        const joinInterval = setInterval(() => {
          setActivePlayers(prev => {
            const newCount = Math.min(prev + 1, 5);
            setPlayerPulse(true);
            setTimeout(() => setPlayerPulse(false), 300);
            return newCount;
          });
        }, 2000);
        
        setTimeout(() => clearInterval(joinInterval), 6000);
      }
      
      // Calculate pool amount
      const basePool = players.reduce((sum, p) => sum + p.bet, 0);
      setPoolAmount(basePool + (hasPlacedBet ? betAmount : 0));
      
      // Only countdown if we have minimum players
      if (activePlayers >= 2 || hasPlacedBet) {
        interval = setInterval(() => {
          setWaitingTime(prev => {
            if (prev <= 1) {
              startGame();
              return 10;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } else if (gameState === 'running') {
      // Lock pool during round
      setPoolLocked(true);
      
      const startTime = Date.now();
      const crashAt = 1 + Math.random() * 8;
      setCrashPoint(crashAt);
      setElapsedTime(0);
      
      interval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        setElapsedTime(elapsed);
        const newMultiplier = 1 + Math.pow(elapsed * 0.3, 1.5);
        
        if (newMultiplier >= crashAt) {
          setGameState('crashed');
          setCurrentMultiplier(crashAt);
          setMultiplierHistory(prev => [crashAt, ...prev].slice(0, 8));
          
          if (hasPlacedBet && !hasCashedOut) {
            toast.error(`Crashed at ${crashAt.toFixed(2)}x - You lost!`);
            setPlayers(prev => prev.map(p => p.id === 'player' ? { ...p, status: 'lost' as const } : p));
            setBalanceFlash('red');
            setTimeout(() => setBalanceFlash('none'), 300);
            
            const now = new Date();
            const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
            setBetHistory(prev => [{
              id: `bet_${Date.now()}`,
              betAmount,
              cashoutMultiplier: crashAt,
              result: 'loss',
              profit: -betAmount,
              time,
              roundId: currentRoundId
            }, ...prev]);
          }
          
          setShowCrashResult(true);
          setLiveFeedExpanded(true);
          setTimeout(() => setShowCrashResult(false), 5000);
          
          setTimeout(() => {
            setGameState('waiting');
            setCurrentMultiplier(1.00);
            setHasPlacedBet(false);
            setHasCashedOut(false);
            setWaitingTime(10);
            setElapsedTime(0);
            setLiveFeedExpanded(false);
            setPoolLocked(false);
            setActivePlayers(1);
            setPoolAmount(0);
            setCashoutDisabled(false);
            setPlayers([
              { id: '1', name: 'Player ***421', bet: 50, status: 'active' },
              { id: '2', name: 'Player ***892', bet: 100, status: 'active' },
              { id: '3', name: 'Player ***156', bet: 25, status: 'active' },
            ]);
          }, 3000);
        } else {
          setCurrentMultiplier(newMultiplier);
          
          if (hasPlacedBet && !hasCashedOut && autoCashout > 0 && newMultiplier >= autoCashout) {
            handleCashout();
          }
        }
      }, 100);
    }
    
    return () => clearInterval(interval);
  }, [gameState, hasPlacedBet, hasCashedOut, autoCashout, activePlayers]);

  const startGame = () => {
    setGameState('running');
    setCurrentMultiplier(1.00);
    setElapsedTime(0);
    setPulseButton(true);
    setTimeout(() => setPulseButton(false), 200);
    const roundId = `round_${Date.now()}`;
    setCurrentRoundId(roundId);
    if (hasPlacedBet) {
      setCurrentBetAmount(betAmount);
    }
  };

  const handlePlaceBet = () => {
    if (betAmount <= 0) {
      toast.error('Invalid bet amount');
      return;
    }
    if (betAmount > gameBalance) {
      toast.error('Insufficient balance');
      return;
    }
    
    updateGameBalance(-betAmount);
    setHasPlacedBet(true);
    setPlayers(prev => [...prev, { id: 'player', name: 'You', bet: betAmount, status: 'active' }]);
    toast.success(`Bet placed: ${formatUSDT(betAmount)}`);
  };

  const handleCashout = () => {
    if (!hasPlacedBet || hasCashedOut || cashoutDisabled) return;
    
    setCashoutDisabled(true);
    const finalMultiplier = currentMultiplier;
    const payout = betAmount * finalMultiplier;
    
    updateGameBalance(payout);
    setHasCashedOut(true);
    setCashoutMultiplier(finalMultiplier);
    
    setBalanceFlash('green');
    setTimeout(() => setBalanceFlash('none'), 300);
    
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    const profit = payout - betAmount;
    
    setBetHistory(prev => [{
      id: `bet_${Date.now()}`,
      betAmount,
      cashoutMultiplier: finalMultiplier,
      result: 'win',
      profit,
      time,
      roundId: currentRoundId
    }, ...prev]);
    
    setPlayers(prev => prev.map(p => p.id === 'player' ? { ...p, status: 'cashedout' as const, cashoutAt: finalMultiplier } : p));
    
    if (finalMultiplier >= 5) {
      toast.success(`🎉 BIG WIN! Cashed out at ${finalMultiplier.toFixed(2)}x - Won ${formatUSDT(payout)}!`, { duration: 5000 });
    } else {
      toast.success(`Cashed out at ${finalMultiplier.toFixed(2)}x - Won ${formatUSDT(payout)}!`);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: '#0B0F1A', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div className="w-full max-w-[480px] md:max-w-[768px] lg:max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all hover:scale-105"
            style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.1)', minHeight: '44px' }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-semibold text-sm">Back</span>
          </button>
          
          {/* BALANCE DISPLAY */}
          <div 
            className="px-4 py-2 rounded-xl transition-all"
            style={{ 
              backgroundColor: balanceFlash === 'green' ? 'rgba(0,255,154,0.2)' : balanceFlash === 'red' ? 'rgba(255,59,48,0.2)' : 'rgba(0,194,255,0.1)', 
              border: balanceFlash === 'green' ? '1px solid rgba(0,255,154,0.4)' : balanceFlash === 'red' ? '1px solid rgba(255,59,48,0.4)' : '1px solid rgba(0,194,255,0.2)',
              transition: 'all 0.3s ease-out'
            }}
          >
            <p className="text-xs font-semibold mb-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>Balance</p>
            <p className="text-lg font-bold" style={{ 
              color: balanceFlash === 'green' ? '#00FF9A' : balanceFlash === 'red' ? '#FF3B30' : '#00C2FF'
            }}>
              {formatUSDT(gameBalance)}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowStats(!showStats)}
              className="p-2 rounded-lg transition-all hover:scale-105"
              style={{ backgroundColor: 'rgba(0,194,255,0.1)', color: '#00C2FF', border: '1px solid rgba(0,194,255,0.2)', minHeight: '44px', minWidth: '44px' }}
            >
              <BarChart3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowFairness(!showFairness)}
              className="p-2 rounded-lg transition-all hover:scale-105"
              style={{ backgroundColor: 'rgba(0,255,154,0.1)', color: '#00FF9A', border: '1px solid rgba(0,255,154,0.2)', minHeight: '44px', minWidth: '44px' }}
            >
              <Shield className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowRules(!showRules)}
              className="p-2 rounded-lg transition-all hover:scale-105"
              style={{ backgroundColor: 'rgba(168,85,247,0.1)', color: '#A855F7', border: '1px solid rgba(168,85,247,0.2)', minHeight: '44px', minWidth: '44px' }}
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* GRAPH AREA */}
        <div className="rounded-2xl p-4 mb-3 relative" style={{
          background: 'linear-gradient(135deg, #0a0e17 0%, #050810 100%)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(0,255,154,0.1)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          transform: pulseButton ? 'scale(1.02)' : 'scale(1)',
          transition: 'transform 0.2s ease-out',
          width: '100%',
          maxWidth: '100%',
          overflow: 'hidden'
        }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-xl font-bold" style={{ color: '#FFFFFF' }}>Crash</h2>
              {/* PvP ROUND INFO */}
              <div className="flex items-center gap-3 mt-2">
                <div 
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all"
                  style={{
                    backgroundColor: playerPulse ? 'rgba(0,194,255,0.2)' : 'rgba(0,194,255,0.1)',
                    border: '1px solid rgba(0,194,255,0.3)',
                    transition: 'all 0.3s ease-out'
                  }}
                >
                  <span style={{ fontSize: '14px' }}>👥</span>
                  <span className="text-sm font-bold" style={{ color: '#00C2FF' }}>{activePlayers}</span>
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Players</span>
                </div>
                <div 
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                  style={{
                    backgroundColor: 'rgba(168,85,247,0.1)',
                    border: poolLocked ? '1px solid rgba(255,214,10,0.4)' : '1px solid rgba(168,85,247,0.3)'
                  }}
                >
                  <span style={{ fontSize: '14px' }}>💰</span>
                  <span className="text-sm font-bold" style={{ color: poolLocked ? '#FFD60A' : '#A855F7' }}>${poolAmount}</span>
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Pool</span>
                  {poolLocked && <span className="text-xs ml-1" style={{ color: '#FFD60A' }}>🔒</span>}
                </div>
              </div>
              {activePlayers < 2 && !hasPlacedBet && gameState === 'waiting' && (
                <p className="text-xs mt-2" style={{ color: 'rgba(255,214,10,0.8)' }}>Waiting for players...</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Multiplier</p>
              <p className="text-4xl font-bold" style={{ 
                color: getMultiplierColor(currentMultiplier),
                textShadow: `0 0 30px ${getMultiplierColor(currentMultiplier)}80`
              }}>
                {currentMultiplier.toFixed(2)}x
              </p>
            </div>
          </div>

          <canvas
            ref={canvasRef}
            width={800}
            height={gameState === 'running' ? 300 : 350}
            className="w-full rounded-xl"
            style={{ backgroundColor: 'rgba(0,0,0,0.4)', display: 'block', maxWidth: '100%' }}
          />
        </div>

        {/* HISTORY STRIP */}
        <div className="mb-3">
          <h3 className="text-xs font-semibold mb-2 px-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Recent</h3>
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            overflowX: 'auto', 
            paddingBottom: '8px',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}>
            {multiplierHistory.map((mult, idx) => {
              const getHistoryColor = (m: number) => {
                if (m >= 3) return { bg: 'rgba(0,255,154,0.15)', text: '#00FF9A', border: 'rgba(0,255,154,0.3)' };
                if (m >= 2) return { bg: 'rgba(255,214,10,0.15)', text: '#FFD60A', border: 'rgba(255,214,10,0.3)' };
                return { bg: 'rgba(255,59,48,0.15)', text: '#FF3B30', border: 'rgba(255,59,48,0.3)' };
              };
              const colors = getHistoryColor(mult);
              
              return (
                <div
                  key={idx}
                  className="rounded-lg font-bold"
                  style={{
                    backgroundColor: colors.bg,
                    color: colors.text,
                    border: `1px solid ${colors.border}`,
                    fontSize: idx === 0 ? '16px' : '14px',
                    minWidth: '60px',
                    padding: '8px 16px',
                    textAlign: 'center',
                    flexShrink: 0,
                    boxShadow: idx === 0 ? `0 0 12px ${colors.text}30` : 'none'
                  }}
                >
                  {mult.toFixed(2)}x
                </div>
              );
            })}
          </div>
        </div>

        {/* BETTING CARD */}
        <div className="rounded-2xl p-5 mb-3" style={{
          background: 'linear-gradient(135deg, rgba(20,25,38,0.95) 0%, rgba(15,18,28,0.98) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
          width: '100%',
          maxWidth: '100%'
        }}>
          {/* Amount Input */}
          <div className="mb-4">
            <label className="block text-xs font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Bet Amount
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'nowrap' }}>
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                disabled={gameState === 'running' && hasPlacedBet}
                style={{
                  flex: 1,
                  minWidth: 0,
                  padding: '14px 16px',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  border: '2px solid rgba(0,255,154,0.35)',
                  color: '#FFFFFF',
                  fontSize: '18px'
                }}
                placeholder="10"
              />
              <button
                onClick={() => setBetAmount(prev => Math.max(1, prev / 2))}
                disabled={gameState === 'running' && hasPlacedBet}
                className="font-bold transition-all hover:scale-105"
                style={{ 
                  padding: '14px 16px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255,255,255,0.08)', 
                  color: '#FFFFFF', 
                  border: '1px solid rgba(255,255,255,0.15)', 
                  fontSize: '14px',
                  minHeight: '50px',
                  flexShrink: 0
                }}
              >
                ½
              </button>
              <button
                onClick={() => setBetAmount(prev => prev * 2)}
                disabled={gameState === 'running' && hasPlacedBet}
                className="font-bold transition-all hover:scale-105"
                style={{ 
                  padding: '14px 16px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255,255,255,0.08)', 
                  color: '#FFFFFF', 
                  border: '1px solid rgba(255,255,255,0.15)', 
                  fontSize: '14px',
                  minHeight: '50px',
                  flexShrink: 0
                }}
              >
                2×
              </button>
            </div>
          </div>

          {/* Cashout Control */}
          <div className="mb-4">
            <label className="block text-xs font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Auto Cashout At
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'nowrap' }}>
              <input
                type="number"
                value={autoCashout}
                onChange={(e) => setAutoCashout(Number(e.target.value))}
                disabled={gameState === 'running' && hasPlacedBet}
                step="0.1"
                style={{
                  flex: 1,
                  minWidth: 0,
                  padding: '14px 16px',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  border: '2px solid rgba(255,214,10,0.35)',
                  color: '#FFFFFF',
                  fontSize: '18px'
                }}
                placeholder="2.00"
              />
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '4px',
                width: '48px',
                flexShrink: 0,
                alignItems: 'center'
              }}>
                <button
                  onClick={() => setAutoCashout(prev => Number((prev + 0.1).toFixed(1)))}
                  disabled={gameState === 'running' && hasPlacedBet}
                  className="transition-all hover:scale-105"
                  style={{ 
                    padding: '8px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255,255,255,0.08)', 
                    color: '#FFFFFF', 
                    border: '1px solid rgba(255,255,255,0.15)',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setAutoCashout(prev => Math.max(1.1, Number((prev - 0.1).toFixed(1))))}
                  disabled={gameState === 'running' && hasPlacedBet}
                  className="transition-all hover:scale-105"
                  style={{ 
                    padding: '8px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255,255,255,0.08)', 
                    color: '#FFFFFF', 
                    border: '1px solid rgba(255,255,255,0.15)',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Profit Preview */}
          <div className="p-4 rounded-xl mb-4" style={{ backgroundColor: 'rgba(0,194,255,0.08)', border: '1px solid rgba(0,194,255,0.2)' }}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>Expected Profit</span>
              <span className="text-xl font-bold" style={{ color: '#00C2FF' }}>{formatUSDT(expectedProfit)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            {gameState === 'waiting' && !hasPlacedBet && (
              <>
                <button
                  onClick={() => { setAutoMode(false); handlePlaceBet(); }}
                  className="font-bold transition-all hover:scale-105"
                  style={{
                    flex: 1,
                    minWidth: 0,
                    padding: '16px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #00FF9A 0%, #00CC7A 100%)',
                    color: '#0B0F1A',
                    boxShadow: pulseButton ? '0 0 40px rgba(0,255,154,0.8)' : '0 8px 30px rgba(0,255,154,0.4)',
                    fontSize: '17px',
                    minHeight: '56px'
                  }}
                >
                  Manual Bet
                </button>
                <button
                  onClick={() => { setAutoMode(true); handlePlaceBet(); }}
                  className="font-bold transition-all hover:scale-105"
                  style={{
                    flex: 1,
                    minWidth: 0,
                    padding: '16px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #FFD60A 0%, #FF9500 100%)',
                    color: '#0B0F1A',
                    boxShadow: '0 8px 30px rgba(255,214,10,0.4)',
                    fontSize: '17px',
                    minHeight: '56px'
                  }}
                >
                  Auto Bet
                </button>
              </>
            )}

            {gameState === 'running' && hasPlacedBet && !hasCashedOut && (
              <button
                onClick={handleCashout}
                className="font-bold transition-all hover:scale-105"
                style={{
                  width: '100%',
                  padding: '18px',
                  borderRadius: '12px',
                  background: `linear-gradient(135deg, ${getMultiplierColor(currentMultiplier)} 0%, ${getMultiplierColor(currentMultiplier)}CC 100%)`,
                  color: '#FFFFFF',
                  boxShadow: `0 8px 30px ${getMultiplierColor(currentMultiplier)}60`,
                  fontSize: '20px',
                  minHeight: '60px'
                }}
              >
                CASH OUT @ {currentMultiplier.toFixed(2)}x
              </button>
            )}

            {gameState === 'waiting' && hasPlacedBet && (
              <div style={{ 
                width: '100%',
                textAlign: 'center', 
                padding: '14px', 
                borderRadius: '12px', 
                backgroundColor: 'rgba(0,255,154,0.1)', 
                border: '1px solid rgba(0,255,154,0.3)' 
              }}>
                <p className="font-bold" style={{ color: '#00FF9A' }}>Bet Placed! Waiting for round...</p>
              </div>
            )}

            {hasCashedOut && (
              <div style={{ 
                width: '100%',
                textAlign: 'center', 
                padding: '14px', 
                borderRadius: '12px', 
                backgroundColor: 'rgba(255,214,10,0.1)', 
                border: '1px solid rgba(255,214,10,0.3)' 
              }}>
                <p className="font-bold" style={{ color: '#FFD60A' }}>Cashed out at {cashoutMultiplier.toFixed(2)}x!</p>
              </div>
            )}
          </div>
        </div>

        {/* LIVE FEED */}
        {(liveFeedExpanded || showCrashResult) && (
          <div className="rounded-xl p-3 mb-3" style={{
            background: 'rgba(15,18,28,0.6)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(0,194,255,0.15)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            width: '100%',
            maxWidth: '100%'
          }}>
            <button
              onClick={() => setLiveFeedExpanded(!liveFeedExpanded)}
              className="flex items-center justify-between w-full mb-2"
            >
              <h3 className="text-xs font-bold flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Live Feed
              </h3>
              <ChevronUp className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.5)' }} />
            </button>
            <div style={{ 
              maxHeight: '128px', 
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              {events.slice(0, 5).map(event => (
                <div key={event.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                  <span className="text-xs font-semibold" style={{ color: '#FFFFFF' }}>{event.player}</span>
                  <span style={{ color: 'rgba(255,255,255,0.3)' }}>•</span>
                  <span className="text-xs font-bold" style={{ 
                    color: event.type === 'cashout' ? '#00FF9A' : event.amount && event.amount > 50 ? '#FFD60A' : 'rgba(255,255,255,0.6)'
                  }}>
                    ${event.amount || 0}
                  </span>
                  {event.type === 'cashout' && event.multiplier && (
                    <span className="text-xs font-bold ml-auto" style={{ color: '#00FF9A' }}>
                      {event.multiplier}x
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {!liveFeedExpanded && !showCrashResult && gameState !== 'running' && (
          <button
            onClick={() => setLiveFeedExpanded(true)}
            className="w-full py-2.5 rounded-xl mb-3 flex items-center justify-center gap-2 transition-all hover:scale-105"
            style={{
              backgroundColor: 'rgba(0,194,255,0.05)',
              border: '1px solid rgba(0,194,255,0.15)',
              color: 'rgba(255,255,255,0.6)',
              minHeight: '44px'
            }}
          >
            <span className="text-xs font-semibold">Live Feed</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        )}

        {/* BET HISTORY */}
        <div className="rounded-xl p-4 mb-3" style={{
          background: 'rgba(15,18,28,0.8)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(168,85,247,0.2)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          width: '100%',
          maxWidth: '100%'
        }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold" style={{ color: '#FFFFFF' }}>Your Bet History</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setHistoryFilter('all')}
                className="px-3 py-1 rounded-lg text-xs font-semibold transition-all"
                style={{
                  backgroundColor: historyFilter === 'all' ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.05)',
                  color: historyFilter === 'all' ? '#A855F7' : 'rgba(255,255,255,0.5)',
                  border: historyFilter === 'all' ? '1px solid rgba(168,85,247,0.4)' : '1px solid rgba(255,255,255,0.1)'
                }}
              >
                All
              </button>
              <button
                onClick={() => setHistoryFilter('wins')}
                className="px-3 py-1 rounded-lg text-xs font-semibold transition-all"
                style={{
                  backgroundColor: historyFilter === 'wins' ? 'rgba(0,255,154,0.2)' : 'rgba(255,255,255,0.05)',
                  color: historyFilter === 'wins' ? '#00FF9A' : 'rgba(255,255,255,0.5)',
                  border: historyFilter === 'wins' ? '1px solid rgba(0,255,154,0.4)' : '1px solid rgba(255,255,255,0.1)'
                }}
              >
                Wins
              </button>
              <button
                onClick={() => setHistoryFilter('losses')}
                className="px-3 py-1 rounded-lg text-xs font-semibold transition-all"
                style={{
                  backgroundColor: historyFilter === 'losses' ? 'rgba(255,59,48,0.2)' : 'rgba(255,255,255,0.05)',
                  color: historyFilter === 'losses' ? '#FF3B30' : 'rgba(255,255,255,0.5)',
                  border: historyFilter === 'losses' ? '1px solid rgba(255,59,48,0.4)' : '1px solid rgba(255,255,255,0.1)'
                }}
              >
                Losses
              </button>
            </div>
          </div>

          <div style={{
            maxHeight: '240px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {betHistory.length === 0 && (
              <div className="text-center py-8" style={{ color: 'rgba(255,255,255,0.4)' }}>
                <p className="text-sm">No bets yet. Place a bet to see your history!</p>
              </div>
            )}
            {betHistory
              .filter(item => {
                if (historyFilter === 'all') return true;
                return item.result === (historyFilter === 'wins' ? 'win' : 'loss');
              })
              .map(item => (
                <div
                  key={item.id}
                  className="p-3 rounded-lg"
                  style={{
                    backgroundColor: item.result === 'win' ? 'rgba(0,255,154,0.08)' : 'rgba(255,59,48,0.08)',
                    border: item.result === 'win' ? '1px solid rgba(0,255,154,0.2)' : '1px solid rgba(255,59,48,0.2)'
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold" style={{ 
                      color: item.result === 'win' ? '#00FF9A' : '#FF3B30' 
                    }}>
                      {item.result === 'win' ? '✓ WIN' : '✗ LOSS'}
                    </span>
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      {item.time}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>Bet: ${item.betAmount}</p>
                      <p className="text-xs font-bold" style={{ color: '#FFFFFF' }}>
                        @ {item.cashoutMultiplier.toFixed(2)}x
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>Profit</p>
                      <p className="text-base font-bold" style={{ 
                        color: item.profit > 0 ? '#00FF9A' : '#FF3B30'
                      }}>
                        {item.profit > 0 ? '+' : ''}${item.profit.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {showRules && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }} onClick={() => setShowRules(false)}>
          <div className="rounded-2xl p-6 w-full" style={{ backgroundColor: '#111827', border: '1px solid rgba(168,85,247,0.3)', maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4" style={{ color: '#A855F7' }}>Game Rules</h3>
            <ul className="space-y-2 text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
              <li>• Place your bet before the round starts</li>
              <li>• Watch the multiplier increase from 1.00x</li>
              <li>• Cash out anytime before the crash</li>
              <li>• Set auto cashout for automatic wins</li>
              <li>• If you don't cash out before crash, you lose</li>
            </ul>
            <button
              onClick={() => setShowRules(false)}
              className="mt-4 w-full py-2 rounded-lg font-bold"
              style={{ backgroundColor: '#A855F7', color: '#FFFFFF' }}
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {showFairness && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }} onClick={() => setShowFairness(false)}>
          <div className="rounded-2xl p-6 w-full" style={{ backgroundColor: '#111827', border: '1px solid rgba(0,255,154,0.3)', maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: '#00FF9A' }}>
              <Shield className="w-6 h-6" />
              Provably Fair
            </h3>
            <p className="text-sm mb-3" style={{ color: 'rgba(255,255,255,0.8)' }}>
              This game uses cryptographic hashing to ensure fairness. Each round's outcome is predetermined and verifiable.
            </p>
            <div className="p-3 rounded-lg mb-3" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
              <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Server Seed (SHA256)</p>
              <p className="text-xs font-mono break-all" style={{ color: '#00FF9A' }}>a7f2d9e4c8b3a1f6...</p>
            </div>
            <button
              onClick={() => setShowFairness(false)}
              className="w-full py-2 rounded-lg font-bold"
              style={{ backgroundColor: '#00FF9A', color: '#0B0F1A' }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showStats && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }} onClick={() => setShowStats(false)}>
          <div className="rounded-2xl p-6 w-full" style={{ backgroundColor: '#111827', border: '1px solid rgba(0,194,255,0.3)', maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4" style={{ color: '#00C2FF' }}>Game Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span style={{ color: 'rgba(255,255,255,0.7)' }}>Total Rounds</span>
                <span className="font-bold" style={{ color: '#FFFFFF' }}>156</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'rgba(255,255,255,0.7)' }}>Average Crash</span>
                <span className="font-bold" style={{ color: '#FFFFFF' }}>2.34x</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'rgba(255,255,255,0.7)' }}>Highest Crash</span>
                <span className="font-bold" style={{ color: '#00FF9A' }}>12.45x</span>
              </div>
            </div>
            <button
              onClick={() => setShowStats(false)}
              className="mt-4 w-full py-2 rounded-lg font-bold"
              style={{ backgroundColor: '#00C2FF', color: '#0B0F1A' }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <GameFooter />
    </div>
  );
}