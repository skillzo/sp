import { useState, useEffect, useRef } from 'react';
import { useUser } from '../context/UserContext';
import { toast } from 'sonner';
import { Users, Clock, Trophy, Zap, TrendingUp, Info, Shield, Copy, Check, HelpCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router';
import { TopBar } from '../components/TopBar';
import { BackButton } from '../components/BackButton';
import { motion, AnimatePresence } from 'motion/react';
import { PvPWheelModals } from '../components/PvPWheelModals';
import { GameFooter } from '../components/GameFooter';

interface Player {
  id: string;
  username: string;
  avatar: string;
  betAmount: number;
  color: string;
  percentage: number;
}

interface Activity {
  id: string;
  username: string;
  amount: number;
  timestamp: number;
}

interface HistoryRecord {
  id: string;
  roundNumber: number;
  betAmount: number;
  result: 'win' | 'loss';
  payout: number;
  timestamp: number;
}

interface WinnerRecord {
  id: string;
  username: string;
  avatar: string;
  betAmount: number;
  payout: number;
  timestamp: number;
}

type GameState = 'waiting' | 'countdown' | 'spinning' | 'result';

export function PvPWheel() {
  const { gameBalance, updateGameBalance, formatUSDT } = useUser();
  const navigate = useNavigate();
  
  // Game State
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [betAmount, setBetAmount] = useState<number>(0);
  const [players, setPlayers] = useState<Player[]>([]);
  const [totalPool, setTotalPool] = useState<number>(0);
  const [countdown, setCountdown] = useState<number>(25);
  const [rotation, setRotation] = useState<number>(0);
  const [idleRotation, setIdleRotation] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<Player | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [hasJoined, setHasJoined] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [poolPulse, setPoolPulse] = useState(false);

  // Auto Join State
  const [autoJoinEnabled, setAutoJoinEnabled] = useState(false);
  const [showAutoJoinOptions, setShowAutoJoinOptions] = useState(false);
  const [autoJoinBetAmount, setAutoJoinBetAmount] = useState<number>(0);
  const [autoJoinMaxRounds, setAutoJoinMaxRounds] = useState<number | null>(null); // null = unlimited
  const [autoJoinStopOnWin, setAutoJoinStopOnWin] = useState(false);
  const [autoJoinStopOnLoss, setAutoJoinStopOnLoss] = useState(false);
  const [autoJoinRoundsPlayed, setAutoJoinRoundsPlayed] = useState(0);

  // History Tab State
  const [historyTab, setHistoryTab] = useState<'winners' | 'history'>('history');
  const [userHistory, setUserHistory] = useState<HistoryRecord[]>([]);
  const [recentWinnersList, setRecentWinnersList] = useState<WinnerRecord[]>([]);
  const [roundCounter, setRoundCounter] = useState(1);

  // Leaderboard State
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Trust System State
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showProvablyFairModal, setShowProvablyFairModal] = useState(false);
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null);
  const [clientSeed, setClientSeed] = useState('user_seed_' + Math.random().toString(36).substring(7));
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Wheel animation refs - PERSISTENT ROTATION (no reset)
  const currentRotationRef = useRef<number>(0);
  const countdownIntervalRef = useRef<number | null>(null);
  const wheelRef = useRef<SVGSVGElement>(null);
  const isTransitioning = useRef<boolean>(false);

  // Mock provably fair data
  const serverSeedHash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
  const nonce = 12345;

  // Player colors with gradients
  const playerColors = [
    '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B',
    '#10B981', '#06B6D4', '#F97316', '#6366F1',
  ];

  // Initialize with 1 player in WAITING state
  useEffect(() => {
    const initialPlayer: Player = {
      id: '1',
      username: 'CryptoKing',
      avatar: '👑',
      betAmount: 15,
      color: playerColors[0],
      percentage: 100
    };
    setPlayers([initialPlayer]);
    setTotalPool(15);
  }, []);

  // Idle rotation animation
  useEffect(() => {
    if ((gameState === 'waiting' || gameState === 'countdown') && !isSpinning) {
      const interval = setInterval(() => {
        setIdleRotation(prev => (prev + 0.15) % 360);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [gameState, isSpinning]);

  // Countdown timer with stable setInterval
  useEffect(() => {
    if (gameState === 'countdown' && countdown > 0) {
      const startTime = Date.now();
      const totalDuration = 25000; // 25 seconds in ms
      
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, Math.ceil((totalDuration - elapsed) / 1000));
        
        setCountdown(remaining);
        
        if (remaining <= 0) {
          clearInterval(interval);
          // Pre-spin delay (200ms for tension)
          setTimeout(() => handleSpin(), 200);
        }
      }, 50); // Update every 50ms for ultra-smooth countdown
      
      return () => clearInterval(interval);
    }
  }, [gameState]);

  // Random bot joining during countdown
  useEffect(() => {
    if (gameState === 'countdown' && countdown > 0) {
      const botNames = ['CryptoKing', 'LuckyMike', 'ProGamer', 'SpinMaster', 'WheelBoss', 'BetKing', 'Fortune777', 'MegaWin'];
      const botAvatars = ['👑', '🎲', '🎮', '🔥', '💎', '⚡', '🎯', '🌟'];
      
      // Random interval between 2-5 seconds
      const randomDelay = Math.random() * 3000 + 2000;
      
      const botJoinTimer = setTimeout(() => {
        // Only add bot if countdown is still active and less than 6 players
        if (gameState === 'countdown' && players.length < 6 && countdown > 3) {
          const randomBotIndex = Math.floor(Math.random() * botNames.length);
          const botBetAmount = Math.floor(Math.random() * 15) + 5; // $5-$20
          
          const newBot: Player = {
            id: 'bot_' + Date.now(),
            username: botNames[randomBotIndex],
            avatar: botAvatars[randomBotIndex],
            betAmount: botBetAmount,
            color: playerColors[players.length % playerColors.length],
            percentage: 0
          };

          const updatedPlayers = [...players, newBot];
          const newTotal = updatedPlayers.reduce((sum, p) => sum + p.betAmount, 0);

          const playersWithPercentage = updatedPlayers.map(p => ({
            ...p,
            percentage: (p.betAmount / newTotal) * 100
          }));

          setPlayers(playersWithPercentage);
          setTotalPool(newTotal);
          setPoolPulse(true);
          setTimeout(() => setPoolPulse(false), 1000);

          setRecentActivity(prev => [
            { id: Date.now().toString(), username: newBot.username, amount: botBetAmount, timestamp: Date.now() },
            ...prev.slice(0, 2)
          ]);

          toast.info(`${newBot.username} joined! 🎮`);
        }
      }, randomDelay);

      return () => clearTimeout(botJoinTimer);
    }
  }, [gameState, countdown, players.length]);

  // Automatic live game progression - players join one after another
  useEffect(() => {
    if (gameState === 'waiting' && players.length < 6) {
      const botNames = ['CryptoKing', 'LuckyMike', 'ProGamer', 'SpinMaster', 'WheelBoss', 'BetKing', 'Fortune777', 'MegaWin', 'DiamondHands', 'MoonShot'];
      const botAvatars = ['👑', '🎲', '🎮', '🔥', '💎', '⚡', '🎯', '🌟', '🚀', '💰'];
      
      // Random interval between 1.5-4 seconds
      const randomDelay = Math.random() * 2500 + 1500;
      
      const autoJoinTimer = setTimeout(() => {
        if (gameState === 'waiting' && players.length < 6) {
          const randomBotIndex = Math.floor(Math.random() * botNames.length);
          const botBetAmount = Math.floor(Math.random() * 45) + 5; // $5-$50
          
          const newBot: Player = {
            id: 'bot_' + Date.now(),
            username: botNames[randomBotIndex],
            avatar: botAvatars[randomBotIndex],
            betAmount: botBetAmount,
            color: playerColors[players.length % playerColors.length],
            percentage: 0
          };

          const updatedPlayers = [...players, newBot];
          const newTotal = updatedPlayers.reduce((sum, p) => sum + p.betAmount, 0);

          const playersWithPercentage = updatedPlayers.map(p => ({
            ...p,
            percentage: (p.betAmount / newTotal) * 100
          }));

          setPlayers(playersWithPercentage);
          setTotalPool(newTotal);
          setPoolPulse(true);
          setTimeout(() => setPoolPulse(false), 1000);

          setRecentActivity(prev => [
            { id: Date.now().toString(), username: newBot.username, amount: botBetAmount, timestamp: Date.now() },
            ...prev.slice(0, 2)
          ]);

          // Auto-start countdown when 3+ players join
          if (updatedPlayers.length >= 3) {
            setTimeout(() => {
              setGameState('countdown');
              setCountdown(25);
            }, 1000);
          }
        }
      }, randomDelay);

      return () => clearTimeout(autoJoinTimer);
    }
  }, [gameState, players.length]);

  // Auto-progress to new round after result is shown
  useEffect(() => {
    if (gameState === 'result') {
      const newRoundTimer = setTimeout(() => {
        handleNewRound();
      }, hasJoined ? 2500 : 1500); // 2.5s if user played, 1.5s if spectating

      return () => clearTimeout(newRoundTimer);
    }
  }, [gameState, hasJoined]);

  const handleJoinRound = () => {
    if (betAmount <= 0) {
      toast.error('Please enter a valid bet amount');
      return;
    }
    if (betAmount > gameBalance) {
      toast.error('Insufficient balance');
      return;
    }
    if (hasJoined) {
      toast.error('Already joined this round');
      return;
    }

    updateGameBalance(-betAmount);

    const newPlayer: Player = {
      id: 'you',
      username: 'You',
      avatar: '😎',
      betAmount,
      color: playerColors[players.length % playerColors.length],
      percentage: 0
    };

    const mockPlayers: Player[] = [
      { id: '2', username: 'LuckyMike', avatar: '🎲', betAmount: 10, color: playerColors[1], percentage: 0 },
      { id: '3', username: 'ProGamer', avatar: '🎮', betAmount: 8, color: playerColors[2], percentage: 0 },
      { id: '4', username: 'SpinKing', avatar: '🔥', betAmount: 12, color: playerColors[3], percentage: 0 },
    ];

    const updatedPlayers = [...players, newPlayer, ...mockPlayers.slice(0, 2)];
    const newTotal = updatedPlayers.reduce((sum, p) => sum + p.betAmount, 0);

    const playersWithPercentage = updatedPlayers.map(p => ({
      ...p,
      percentage: (p.betAmount / newTotal) * 100
    }));

    setPlayers(playersWithPercentage);
    setTotalPool(newTotal);
    setHasJoined(true);
    setPoolPulse(true);
    setTimeout(() => setPoolPulse(false), 1000);

    setRecentActivity([
      { id: Date.now().toString(), username: 'You', amount: betAmount, timestamp: Date.now() },
      { id: Date.now().toString() + '1', username: 'LuckyMike', amount: 10, timestamp: Date.now() - 2000 },
      { id: Date.now().toString() + '2', username: 'ProGamer', amount: 8, timestamp: Date.now() - 5000 },
    ]);

    toast.success(`Joined round with ${formatUSDT(betAmount)}!`);
    setTimeout(() => {
      setGameState('countdown');
      setCountdown(25);
    }, 500);
  };

  const handleSpin = () => {
    setGameState('spinning');
    
    // Calculate winner with weighted probability
    const random = Math.random() * 100;
    let cumulative = 0;
    let selectedWinner: Player | null = null;
    let winnerSegmentIndex = 0;

    for (let i = 0; i < players.length; i++) {
      cumulative += players[i].percentage;
      if (random <= cumulative) {
        selectedWinner = players[i];
        winnerSegmentIndex = i;
        break;
      }
    }

    if (!selectedWinner) {
      selectedWinner = players[players.length - 1];
      winnerSegmentIndex = players.length - 1;
    }

    // Calculate target angle - random landing inside winner's segment
    let segmentStartAngle = 0;
    for (let i = 0; i < winnerSegmentIndex; i++) {
      segmentStartAngle += (players[i].percentage / 100) * 360;
    }
    
    const segmentSize = (players[winnerSegmentIndex].percentage / 100) * 360;
    const randomOffset = Math.random() * segmentSize;
    const targetAngle = segmentStartAngle + randomOffset;

    // Calculate spin amount - MASSIVE initial rotations for explosive speed
    const spinAmount = 7200 + targetAngle; // 20 full spins for explosive visual
    const finalRotation = currentRotationRef.current + spinAmount;
    
    // INSTANT state update - no delay, pure speed
    setIsSpinning(true);
    currentRotationRef.current = finalRotation;
    setRotation(finalRotation);

    // Spin duration: 7000ms for ultra-dramatic slow ending
    const SPIN_DURATION = 7000;

    // Wait for spin to complete
    setTimeout(() => {
      setIsSpinning(false);
      setWinner(selectedWinner);
      setGameState('result');
      
      // Post-spin delay before modal
      setTimeout(() => {
        setShowResult(true);
        
        if (selectedWinner?.id === 'you') {
          updateGameBalance(totalPool);
          toast.success(`🎉 You won ${formatUSDT(totalPool)}!`);
          
          // Add to user history - WIN
          const userPlayer = players.find(p => p.id === 'you');
          if (userPlayer) {
            setUserHistory(prev => [{
              id: Date.now().toString(),
              roundNumber: roundCounter,
              betAmount: userPlayer.betAmount,
              result: 'win',
              payout: totalPool,
              timestamp: Date.now()
            }, ...prev]);
          }
        } else {
          toast.error('Better luck next time!');
          
          // Add to user history - LOSS
          const userPlayer = players.find(p => p.id === 'you');
          if (userPlayer) {
            setUserHistory(prev => [{
              id: Date.now().toString(),
              roundNumber: roundCounter,
              betAmount: userPlayer.betAmount,
              result: 'loss',
              payout: 0,
              timestamp: Date.now()
            }, ...prev]);
          }
        }
        
        // Add winner to recent winners list
        if (selectedWinner) {
          setRecentWinnersList(prev => [{
            id: Date.now().toString(),
            username: selectedWinner.username,
            avatar: selectedWinner.avatar,
            betAmount: selectedWinner.betAmount,
            payout: totalPool,
            timestamp: Date.now()
          }, ...prev.slice(0, 9)]); // Keep only last 10 winners
        }
      }, 500);
    }, SPIN_DURATION + 500);
  };

  const handleNewRound = () => {
    const currentWinner = winner; // Store winner before reset
    
    setShowResult(false);
    setWinner(null);
    setGameState('waiting');
    setCountdown(25);
    setHasJoined(false);
    setBetAmount(0);
    // Reset rotation state and ref
    setRotation(0);
    currentRotationRef.current = 0;
    setRecentActivity([]);
    setRoundCounter(prev => prev + 1); // Increment round counter
    
    const initialPlayer: Player = {
      id: '1',
      username: 'Player' + Math.floor(Math.random() * 1000),
      avatar: '👾',
      betAmount: Math.floor(Math.random() * 10) + 10,
      color: playerColors[0],
      percentage: 100
    };

    setPlayers([initialPlayer]);
    setTotalPool(initialPlayer.betAmount);
    toast.success('New round started!');

    // AUTO JOIN LOGIC - Trigger after new round starts
    if (autoJoinEnabled && autoJoinBetAmount > 0) {
      // Check max rounds limit
      if (autoJoinMaxRounds !== null && autoJoinRoundsPlayed >= autoJoinMaxRounds) {
        setAutoJoinEnabled(false);
        toast.info('Auto Join stopped: Max rounds reached');
        return;
      }

      // Check stop on win
      if (autoJoinStopOnWin && currentWinner?.id === 'you') {
        setAutoJoinEnabled(false);
        toast.info('Auto Join stopped: Won the round');
        return;
      }

      // Check stop on loss
      if (autoJoinStopOnLoss && currentWinner?.id !== 'you') {
        setAutoJoinEnabled(false);
        toast.info('Auto Join stopped: Lost the round');
        return;
      }

      // Check balance
      if (autoJoinBetAmount > gameBalance) {
        setAutoJoinEnabled(false);
        toast.error('Auto Join stopped: Insufficient balance');
        return;
      }

      // Auto join after delay
      setTimeout(() => {
        setBetAmount(autoJoinBetAmount);
        setAutoJoinRoundsPlayed(prev => prev + 1);
        
        // Trigger join
        setTimeout(() => {
          if (autoJoinBetAmount > 0 && autoJoinBetAmount <= gameBalance) {
            handleJoinRound();
          }
        }, 500);
      }, 1000);
    }
  };

  const generateWheelSegments = () => {
    let currentAngle = 0;
    return players.map((player, index) => {
      const segmentAngle = (player.percentage / 100) * 360;
      const segment = {
        player,
        startAngle: currentAngle,
        endAngle: currentAngle + segmentAngle,
        color: player.color,
        index
      };
      currentAngle += segmentAngle;
      return segment;
    });
  };

  const wheelSegments = generateWheelSegments();
  const highestBettor = players.reduce((max, player) => 
    player.betAmount > max.betAmount ? player : max
  , players[0] || { betAmount: 0 });

  // Copy to clipboard function
  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #0B1437 0%, #0F172A 50%, #1E293B 100%)' }}>
      <TopBar />
      <div className="w-full max-w-[480px] md:max-w-[768px] lg:max-w-[1024px] mx-auto px-4 md:px-6 pt-2">
        <BackButton />

        {/* Header - Compact */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-30 py-2 mb-3" 
          style={{ 
            backgroundColor: 'rgba(15, 23, 42, 0.95)', 
            backdropFilter: 'blur(12px)', 
            borderRadius: '12px',
            border: '1px solid rgba(148, 163, 184, 0.1)' 
          }}
        >
          <div className="flex items-center justify-between">
            <h1 className="text-base font-bold" style={{ color: '#FFFFFF' }}>
              PvP Wheel Battle
            </h1>
            <div className="flex items-center gap-3">
              {/* Leaderboard Icon */}
              <motion.button
                onClick={() => setShowLeaderboard(true)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
                style={{
                  backgroundColor: 'rgba(251, 146, 60, 0.15)',
                  border: '1px solid rgba(251, 146, 60, 0.3)',
                }}
              >
                <Trophy className="w-4 h-4" style={{ color: '#FB923C' }} />
              </motion.button>

              {/* Rules Icon */}
              <motion.button
                onClick={() => setShowRulesModal(true)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
                style={{
                  backgroundColor: 'rgba(148, 163, 184, 0.15)',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                }}
              >
                <HelpCircle className="w-4 h-4" style={{ color: '#94A3B8' }} />
              </motion.button>
              
              <div className="flex items-center gap-2">
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: '#34D399', boxShadow: '0 0 10px #34D399' }}
                />
                <span className="text-xs font-semibold" style={{ color: '#34D399' }}>Live</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* MAIN CONTENT - Responsive Grid Layout */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
            
          {/* POOL CARD - Mobile: first, Desktop: left column top */}
          <div className="lg:col-start-1 lg:row-start-1 order-1 lg:order-none">
          
          {/* 1. POOL CARD - Compact with Provably Fair */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              scale: poolPulse ? [1, 1.05, 1] : 1
            }}
            transition={{ duration: poolPulse ? 0.3 : 0.5 }}
            className="rounded-xl p-4 mb-2"
            style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
              border: '2px solid rgba(59, 130, 246, 0.3)',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 4px 20px rgba(59, 130, 246, 0.15)',
            }}
          >
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#94A3B8' }}>
                  Total Prize Pool
                </p>
                <div className="flex items-center gap-1 opacity-70">
                  <Shield className="w-3 h-3" style={{ color: '#22C55E' }} />
                  <span className="text-[10px] font-medium" style={{ color: '#22C55E' }}>Fair</span>
                </div>
              </div>
              
              <motion.p 
                key={totalPool}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="text-4xl font-black mb-1" 
                style={{ 
                  color: '#FFFFFF',
                  textShadow: '0 0 30px rgba(59, 130, 246, 0.7)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1
                }}
              >
                ${totalPool.toFixed(2)}
              </motion.p>
              
              <div className="flex items-center justify-center gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" style={{ color: '#8B5CF6' }} />
                  <span className="font-medium" style={{ color: '#94A3B8' }}>
                    {players.length} {players.length === 1 ? 'Player' : 'Players'}
                  </span>
                </div>
                <span style={{ color: '#8B5CF6' }}>•</span>
                <span className="font-semibold" style={{ color: '#8B5CF6' }}>
                  🏆 Winner takes all
                </span>
              </div>
            </div>
          </motion.div>

          </div>

          {/* ACTIVITY FEED - Mobile: 5th, Desktop: right column top */}
          <div className="lg:col-start-2 lg:row-start-1 order-5 lg:order-none">
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            className="rounded-lg p-3"
            style={{
              background: 'rgba(30, 41, 59, 0.4)',
              border: '1px solid rgba(148, 163, 184, 0.08)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-3 h-3" style={{ color: '#64748B' }} />
              <h3 className="text-xs font-semibold" style={{ color: '#64748B' }}>Recent Activity</h3>
            </div>

            <div className="space-y-1.5 max-h-[120px] overflow-y-auto">
              {recentActivity.length > 0 ? (
                recentActivity.slice(0, 3).map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-1.5 rounded"
                    style={{
                      backgroundColor: 'rgba(30, 41, 59, 0.3)',
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#34D399' }} />
                      <span className="text-[10px] font-medium" style={{ color: '#94A3B8' }}>
                        {activity.username} joined
                      </span>
                    </div>
                    <span className="text-xs font-bold" style={{ color: '#34D399' }}>
                      ${activity.amount.toFixed(2)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-2">
                  <p className="text-[10px]" style={{ color: '#64748B' }}>No activity yet</p>
                </div>
              )}
            </div>
          </motion.div>

          </div>

          {/* WHEEL - Mobile: 2nd, Desktop: left column row 2 */}
          <div className="lg:col-start-1 lg:row-start-2 order-2 lg:order-none">

          {/* 2. WHEEL - Dominant Element */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl p-4 mb-2"
            style={{
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.6) 100%)',
              border: '1px solid rgba(148, 163, 184, 0.15)',
              backdropFilter: 'blur(16px)',
            }}
          >
            {/* Auto Join Active Badge - Above Wheel */}
            <AnimatePresence>
              {autoJoinEnabled && hasJoined && (gameState === 'countdown' || gameState === 'spinning') && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center justify-center gap-2 mb-3 py-2 px-4 rounded-full mx-auto w-fit"
                  style={{
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%)',
                    border: '2px solid rgba(59, 130, 246, 0.5)',
                    boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)',
                  }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  >
                    <Zap className="w-4 h-4" style={{ color: '#60A5FA' }} />
                  </motion.div>
                  <span className="text-xs font-black" style={{ color: '#60A5FA' }}>
                    AUTO JOIN ACTIVE
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative flex items-center justify-center" style={{ minHeight: '400px' }}>
              {/* Arrow Pointer */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20" style={{ top: '2px' }}>
                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <svg width="44" height="56" viewBox="0 0 48 60">
                    <defs>
                      <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#60A5FA" />
                        <stop offset="100%" stopColor="#8B5CF6" />
                      </linearGradient>
                      <filter id="arrowGlow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    <path 
                      d="M 24 55 L 6 12 L 24 18 L 42 12 Z" 
                      fill="url(#arrowGradient)" 
                      stroke="#FFFFFF" 
                      strokeWidth="2.5"
                      filter="url(#arrowGlow)"
                    />
                  </svg>
                </motion.div>
              </div>

              {/* Wheel - Responsive SVG */}
              <div className="relative w-full max-w-[400px] mx-auto">
                <motion.svg
                  ref={wheelRef}
                  className="w-full h-auto"
                  viewBox="0 0 400 400"
                  animate={{
                    rotate: isSpinning ? rotation : rotation + idleRotation
                  }}
                  transition={
                    isSpinning 
                      ? { 
                          duration: 7,
                          ease: [0.05, 0.95, 0.05, 1.0] // EXPLOSIVE start → ULTRA-smooth slow landing
                        }
                      : { duration: 0 }
                  }
                  style={{
                    filter: isSpinning ? 'blur(3px)' : 'drop-shadow(0 12px 40px rgba(0, 0, 0, 0.5))',
                    willChange: 'transform',
                    backfaceVisibility: 'hidden' as const,
                    transform: 'translateZ(0)', // Force GPU acceleration
                  }}
                >
                  <circle 
                    cx="200" 
                    cy="200" 
                    r="195" 
                    fill="none" 
                    stroke="url(#glowGradient)" 
                    strokeWidth="6" 
                    opacity="0.8" 
                  />
                  <defs>
                    <linearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="50%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#3B82F6" />
                    </linearGradient>
                  </defs>

                  {wheelSegments.map((segment, i) => {
                    const startAngle = (segment.startAngle - 90) * (Math.PI / 180);
                    const endAngle = (segment.endAngle - 90) * (Math.PI / 180);
                    
                    const x1 = 200 + 185 * Math.cos(startAngle);
                    const y1 = 200 + 185 * Math.sin(startAngle);
                    const x2 = 200 + 185 * Math.cos(endAngle);
                    const y2 = 200 + 185 * Math.sin(endAngle);

                    const largeArc = (segment.endAngle - segment.startAngle) > 180 ? 1 : 0;

                    const midAngle = ((segment.startAngle + segment.endAngle) / 2 - 90) * (Math.PI / 180);
                    const textRadius = 140;
                    const textX = 200 + textRadius * Math.cos(midAngle);
                    const textY = 200 + textRadius * Math.sin(midAngle);

                    const gradientId = `gradient-${i}`;

                    return (
                      <g key={i}>
                        <defs>
                          <radialGradient id={gradientId}>
                            <stop offset="0%" stopColor={segment.color} stopOpacity="1" />
                            <stop offset="100%" stopColor={segment.color} stopOpacity="0.8" />
                          </radialGradient>
                        </defs>

                        <path
                          d={`M 200 200 L ${x1} ${y1} A 185 185 0 ${largeArc} 1 ${x2} ${y2} Z`}
                          fill={`url(#${gradientId})`}
                          stroke="rgba(15, 23, 42, 0.6)"
                          strokeWidth="3"
                          opacity="0.95"
                        />

                        <circle
                          cx={textX}
                          cy={textY}
                          r="26"
                          fill="rgba(15, 23, 42, 0.95)"
                          stroke={segment.color}
                          strokeWidth="3"
                        />

                        <text
                          x={textX}
                          y={textY}
                          textAnchor="middle"
                          dominantBaseline="central"
                          style={{ fontSize: '24px' }}
                        >
                          {segment.player.avatar}
                        </text>

                        {segment.player.percentage >= 8 && (
                          <text
                            x={200 + (textRadius + 40) * Math.cos(midAngle)}
                            y={200 + (textRadius + 40) * Math.sin(midAngle)}
                            textAnchor="middle"
                            dominantBaseline="central"
                            style={{ 
                              fontSize: '14px', 
                              fontWeight: '700',
                              fill: '#FFFFFF',
                              filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.8))'
                            }}
                          >
                            {segment.player.percentage.toFixed(0)}%
                          </text>
                        )}
                      </g>
                    );
                  })}

                  <circle cx="200" cy="200" r="75" fill="#0F172A" stroke="#3B82F6" strokeWidth="4" />
                  <circle cx="200" cy="200" r="65" fill="rgba(30, 41, 59, 0.98)" />
                </motion.svg>

                {/* Center text */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                  <AnimatePresence mode="wait">
                    {gameState === 'waiting' && (
                      <motion.div
                        key="waiting"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Clock className="w-10 h-10 mx-auto mb-2" style={{ color: '#94A3B8' }} />
                        <p className="text-xs font-semibold" style={{ color: '#94A3B8' }}>
                          Waiting for players
                        </p>
                      </motion.div>
                    )}

                    {gameState === 'countdown' && (
                      <motion.div
                        key="countdown"
                        initial={{ opacity: 1, scale: 1 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <p className="text-6xl font-black mb-1" style={{ 
                          color: countdown <= 5 ? '#EF4444' : '#FFFFFF',
                          textShadow: countdown <= 5 ? '0 0 30px #EF4444' : '0 0 30px #3B82F6',
                        }}>
                          {countdown}
                        </p>
                        <p className="text-xs font-semibold" style={{ color: '#94A3B8' }}>
                          {countdown <= 5 ? 'Get ready!' : 'Starting in...'}
                        </p>
                      </motion.div>
                    )}

                    {gameState === 'spinning' && (
                      <motion.div
                        key="spinning"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, rotate: 360 }}
                        exit={{ opacity: 0 }}
                        transition={{ 
                          opacity: { duration: 0.3 },
                          rotate: { duration: 1, repeat: Infinity, ease: 'linear' }
                        }}
                      >
                        <Zap className="w-12 h-12 mx-auto mb-2" style={{ color: '#F59E0B' }} />
                        <p className="text-sm font-bold" style={{ color: '#F59E0B' }}>
                          SPINNING...
                        </p>
                      </motion.div>
                    )}

                    {gameState === 'result' && winner && (
                      <motion.div
                        key="result"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      >
                        <Trophy className="w-12 h-12 mx-auto mb-2" style={{ 
                          color: '#FFD700', 
                          filter: 'drop-shadow(0 0 20px #FFD700)' 
                        }} />
                        <p className="text-sm font-bold" style={{ color: '#FFD700' }}>
                          WINNER!
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
            
            {/* Provably Fair Link - Under Wheel */}
            <motion.button
              onClick={() => setShowProvablyFairModal(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center gap-2 mx-auto mt-3 px-4 py-2 rounded-lg transition-all"
              style={{
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.2)',
              }}
            >
              <Check className="w-3 h-3" style={{ color: '#22C55E' }} />
              <span className="text-xs font-semibold" style={{ color: '#22C55E' }}>
                Provably fair
              </span>
            </motion.button>
          </motion.div>

          </div>

          {/* PLAYER LIST - Mobile: 3rd, Desktop: left column row 3 */}
          <div className="lg:col-start-1 lg:row-start-3 order-3 lg:order-none">

          {/* 3. PLAYERS LEGEND - Compact Grid */}
          <div className="grid grid-cols-2 gap-2 mb-2 p-4 rounded-xl" style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.6) 100%)',
            border: '1px solid rgba(148, 163, 184, 0.15)',
            backdropFilter: 'blur(16px)',
          }}>
            <AnimatePresence mode="popLayout">
              {players.slice(0, 6).map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-lg p-2 flex items-center gap-2"
                  style={{
                    backgroundColor: 'rgba(30, 41, 59, 0.6)',
                    border: player.id === highestBettor?.id 
                      ? `2px solid ${player.color}`
                      : `1px solid ${player.color}40`,
                    boxShadow: player.id === highestBettor?.id 
                      ? `0 0 15px ${player.color}30`
                      : 'none',
                  }}
                >
                  <div 
                    className="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                    style={{ 
                      backgroundColor: player.color,
                      border: '2px solid rgba(15, 23, 42, 0.8)',
                      boxShadow: player.id === highestBettor?.id ? `0 0 12px ${player.color}` : 'none',
                    }}
                  >
                    {player.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate" style={{ color: '#E2E8F0' }}>
                      {player.username}
                      {player.id === highestBettor?.id && <span className="ml-1">👑</span>}
                    </p>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="font-semibold" style={{ color: '#22C55E' }}>
                        ${player.betAmount}
                      </span>
                      <span style={{ color: '#94A3B8' }}>
                        {player.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          </div>

          {/* BET PANEL - Mobile: 4th, Desktop: left column row 4 */}
          <div className="lg:col-start-1 lg:row-start-4 order-4 lg:order-none">

          {/* 4. BET PANEL - Compact & Action-Focused */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl p-4"
            style={{
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.6) 100%)',
              border: '1px solid rgba(148, 163, 184, 0.15)',
              backdropFilter: 'blur(16px)',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold" style={{ color: '#FFFFFF' }}>
                Place Your Bet
              </h3>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wide" style={{ color: '#94A3B8' }}>Balance</p>
                <p className="text-sm font-bold" style={{ color: '#FFFFFF' }}>
                  {formatUSDT(gameBalance)}
                </p>
              </div>
            </div>

            {/* Bet Input - Compact */}
            <div className="relative mb-3">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold" style={{ color: '#94A3B8' }}>
                $
              </span>
              <input
                type="number"
                value={betAmount || ''}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                disabled={hasJoined || gameState === 'spinning' || gameState === 'result'}
                className="w-full pl-10 pr-4 py-3 rounded-lg text-lg font-bold text-center transition-all"
                style={{
                  backgroundColor: 'rgba(15, 23, 42, 0.8)',
                  border: inputFocused ? '2px solid rgba(59, 130, 246, 0.5)' : '2px solid rgba(148, 163, 184, 0.15)',
                  color: '#FFFFFF',
                  boxShadow: inputFocused ? '0 0 20px rgba(59, 130, 246, 0.3)' : 'none',
                }}
                placeholder="0.00"
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
              />
            </div>

            {/* Quick bet buttons - Compact */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[1, 5, 10].map((amount) => (
                <motion.button
                  key={amount}
                  onClick={() => setBetAmount(amount)}
                  disabled={hasJoined || gameState === 'spinning' || gameState === 'result'}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="py-2 rounded-lg font-bold text-xs transition-all disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%)',
                    border: '2px solid rgba(59, 130, 246, 0.4)',
                    color: '#FFFFFF',
                  }}
                >
                  ${amount}
                </motion.button>
              ))}
            </div>

            {/* Join button - Prominent */}
            <motion.button
              onClick={handleJoinRound}
              disabled={
                hasJoined || 
                gameState === 'spinning' || 
                gameState === 'result' || 
                gameState === 'countdown' || 
                betAmount <= 0
              }
              whileHover={{ scale: (hasJoined || gameState !== 'waiting') ? 1 : 1.03 }}
              whileTap={{ scale: (hasJoined || gameState !== 'waiting') ? 1 : 0.97 }}
              animate={{
                boxShadow: hasJoined 
                  ? ['0 8px 30px rgba(34, 197, 94, 0.3)', '0 8px 40px rgba(34, 197, 94, 0.5)', '0 8px 30px rgba(34, 197, 94, 0.3)']
                  : ['0 8px 30px rgba(59, 130, 246, 0.4)', '0 8px 50px rgba(139, 92, 246, 0.6)', '0 8px 30px rgba(59, 130, 246, 0.4)']
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-full py-3 rounded-lg font-black text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: hasJoined 
                  ? 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)'
                  : 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                color: '#FFFFFF',
              }}
            >
              {hasJoined ? '✓ Joined Round' : 'Join Round'}
            </motion.button>

            {/* AUTO JOIN TOGGLE - PRIMARY PLACEMENT */}
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ delay: 0.3 }}
              className="mt-3"
            >
              {/* Toggle Row */}
              <motion.div
                onClick={() => {
                  if (!autoJoinEnabled && betAmount > 0) {
                    setAutoJoinBetAmount(betAmount);
                  }
                  setAutoJoinEnabled(!autoJoinEnabled);
                  if (!autoJoinEnabled) {
                    toast.success('⚡ Auto Join activated!');
                  } else {
                    toast.info('Auto Join disabled');
                    setAutoJoinRoundsPlayed(0);
                  }
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all"
                style={{
                  background: autoJoinEnabled 
                    ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)'
                    : 'rgba(30, 41, 59, 0.4)',
                  border: autoJoinEnabled 
                    ? '2px solid rgba(59, 130, 246, 0.4)'
                    : '1px solid rgba(148, 163, 184, 0.15)',
                  boxShadow: autoJoinEnabled 
                    ? '0 0 20px rgba(59, 130, 246, 0.3)'
                    : 'none',
                }}
              >
                <div className="flex items-center gap-2">
                  {/* Checkbox */}
                  <div 
                    className="w-5 h-5 rounded flex items-center justify-center transition-all"
                    style={{
                      backgroundColor: autoJoinEnabled ? '#3B82F6' : 'rgba(15, 23, 42, 0.8)',
                      border: autoJoinEnabled ? '2px solid #60A5FA' : '2px solid rgba(148, 163, 184, 0.3)',
                    }}
                  >
                    {autoJoinEnabled && (
                      <Check className="w-3 h-3" style={{ color: '#FFFFFF' }} />
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold" style={{ color: '#FFFFFF' }}>
                        Auto Join
                      </span>
                      {autoJoinEnabled && (
                        <motion.div
                          animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: '#3B82F6', boxShadow: '0 0 8px #3B82F6' }}
                        />
                      )}
                    </div>
                    <p className="text-[10px] mt-0.5" style={{ color: '#94A3B8' }}>
                      Automatically joins next rounds with this amount
                    </p>
                  </div>
                </div>

                {/* Expand Icon */}
                <motion.div
                  animate={{ rotate: showAutoJoinOptions ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAutoJoinOptions(!showAutoJoinOptions);
                  }}
                  className="p-1"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 6L8 10L12 6" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.div>
              </motion.div>

              {/* Advanced Options - Expandable */}
              <AnimatePresence>
                {showAutoJoinOptions && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-2 rounded-lg p-3 space-y-3 overflow-hidden"
                    style={{
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: '1px solid rgba(148, 163, 184, 0.15)',
                    }}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#94A3B8' }}>
                      Advanced Options
                    </p>

                    {/* Bet Amount */}
                    <div>
                      <label className="text-xs font-semibold mb-1 block" style={{ color: '#E2E8F0' }}>
                        Bet Amount
                      </label>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm font-bold" style={{ color: '#94A3B8' }}>
                          $
                        </span>
                        <input
                          type="number"
                          value={autoJoinBetAmount || ''}
                          onChange={(e) => setAutoJoinBetAmount(Number(e.target.value))}
                          className="w-full pl-7 pr-3 py-2 rounded-lg text-sm font-bold transition-all"
                          style={{
                            backgroundColor: 'rgba(15, 23, 42, 0.8)',
                            border: '1px solid rgba(148, 163, 184, 0.2)',
                            color: '#FFFFFF',
                          }}
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    {/* Max Rounds */}
                    <div>
                      <label className="text-xs font-semibold mb-1 block" style={{ color: '#E2E8F0' }}>
                        Max Rounds
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {[5, 10, 20, null].map((value) => (
                          <motion.button
                            key={value?.toString() || 'unlimited'}
                            onClick={() => setAutoJoinMaxRounds(value)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="py-2 rounded-lg text-xs font-bold transition-all"
                            style={{
                              background: autoJoinMaxRounds === value 
                                ? 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)'
                                : 'rgba(30, 41, 59, 0.6)',
                              border: autoJoinMaxRounds === value 
                                ? '2px solid #60A5FA'
                                : '1px solid rgba(148, 163, 184, 0.2)',
                              color: '#FFFFFF',
                            }}
                          >
                            {value === null ? '∞' : value}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Stop Conditions */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold" style={{ color: '#E2E8F0' }}>
                        Stop Conditions
                      </p>
                      
                      {/* Stop on Win */}
                      <motion.div
                        onClick={() => setAutoJoinStopOnWin(!autoJoinStopOnWin)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all"
                        style={{
                          background: autoJoinStopOnWin 
                            ? 'rgba(34, 197, 94, 0.15)'
                            : 'rgba(30, 41, 59, 0.4)',
                          border: autoJoinStopOnWin 
                            ? '1px solid rgba(34, 197, 94, 0.3)'
                            : '1px solid rgba(148, 163, 184, 0.15)',
                        }}
                      >
                        <div 
                          className="w-4 h-4 rounded flex items-center justify-center transition-all"
                          style={{
                            backgroundColor: autoJoinStopOnWin ? '#22C55E' : 'rgba(15, 23, 42, 0.8)',
                            border: autoJoinStopOnWin ? '2px solid #34D399' : '2px solid rgba(148, 163, 184, 0.3)',
                          }}
                        >
                          {autoJoinStopOnWin && (
                            <Check className="w-2.5 h-2.5" style={{ color: '#FFFFFF' }} />
                          )}
                        </div>
                        <span className="text-xs font-medium" style={{ color: '#E2E8F0' }}>
                          Stop on Win
                        </span>
                      </motion.div>

                      {/* Stop on Loss */}
                      <motion.div
                        onClick={() => setAutoJoinStopOnLoss(!autoJoinStopOnLoss)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all"
                        style={{
                          background: autoJoinStopOnLoss 
                            ? 'rgba(239, 68, 68, 0.15)'
                            : 'rgba(30, 41, 59, 0.4)',
                          border: autoJoinStopOnLoss 
                            ? '1px solid rgba(239, 68, 68, 0.3)'
                            : '1px solid rgba(148, 163, 184, 0.15)',
                        }}
                      >
                        <div 
                          className="w-4 h-4 rounded flex items-center justify-center transition-all"
                          style={{
                            backgroundColor: autoJoinStopOnLoss ? '#EF4444' : 'rgba(15, 23, 42, 0.8)',
                            border: autoJoinStopOnLoss ? '2px solid #F87171' : '2px solid rgba(148, 163, 184, 0.3)',
                          }}
                        >
                          {autoJoinStopOnLoss && (
                            <Check className="w-2.5 h-2.5" style={{ color: '#FFFFFF' }} />
                          )}
                        </div>
                        <span className="text-xs font-medium" style={{ color: '#E2E8F0' }}>
                          Stop on Loss
                        </span>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Active State Indicator */}
              <AnimatePresence>
                {autoJoinEnabled && gameState === 'waiting' && !hasJoined && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="mt-2 flex items-center justify-between p-2 rounded-lg"
                    style={{
                      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      >
                        <Zap className="w-3 h-3" style={{ color: '#3B82F6' }} />
                      </motion.div>
                      <span className="text-xs font-semibold" style={{ color: '#3B82F6' }}>
                        Auto joining next round...
                      </span>
                    </div>
                    <span className="text-xs font-bold" style={{ color: '#94A3B8' }}>
                      {autoJoinMaxRounds !== null ? `${autoJoinRoundsPlayed}/${autoJoinMaxRounds}` : `${autoJoinRoundsPlayed} rounds`}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Win chance - Inline */}
            {hasJoined && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 rounded-lg p-2 flex items-center justify-between"
                style={{
                  background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                }}
              >
                <span className="text-xs font-semibold" style={{ color: '#94A3B8' }}>Your Win Chance</span>
                <span className="text-lg font-black" style={{ color: '#22C55E' }}>
                  {((betAmount / totalPool) * 100).toFixed(1)}%
                </span>
              </motion.div>
            )}
          </motion.div>

          </div>

          {/* HISTORY - Mobile: 6th, Desktop: right column row 2 */}
          <div className="lg:col-start-2 lg:row-start-2 order-6 lg:order-none">

          {/* RECENT WINNERS / YOUR HISTORY - Tabbed Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-xl p-4"
            style={{
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.6) 100%)',
              border: '1px solid rgba(148, 163, 184, 0.15)',
              backdropFilter: 'blur(16px)',
            }}
          >
            {/* Tab Headers */}
            <div className="flex items-center gap-4 mb-4 border-b" style={{ borderColor: 'rgba(148, 163, 184, 0.15)' }}>
              <motion.button
                onClick={() => setHistoryTab('winners')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="pb-3 px-2 text-sm font-bold transition-all relative"
                style={{
                  color: historyTab === 'winners' ? '#94A3B8' : '#64748B',
                }}
              >
                Recent Winners
                {historyTab === 'winners' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ backgroundColor: '#64748B' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>

              <motion.button
                onClick={() => setHistoryTab('history')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="pb-3 px-2 text-sm font-bold transition-all relative"
                style={{
                  color: historyTab === 'history' ? '#FFFFFF' : '#64748B',
                }}
              >
                Your History
                {historyTab === 'history' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ backgroundColor: '#F97316' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {historyTab === 'history' ? (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3"
                >
                  {userHistory.slice(0, 8).map((record, index) => (
                    <motion.div
                      key={record.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      whileHover={{ scale: 1.01 }}
                      className="rounded-lg p-2.5"
                      style={{
                        background: 'rgba(15, 23, 42, 0.4)',
                        border: record.result === 'win' 
                          ? '1px solid rgba(34, 197, 94, 0.25)' 
                          : '1px solid rgba(148, 163, 184, 0.1)',
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-medium mb-0.5" style={{ color: '#64748B' }}>
                            Round #{record.roundNumber}
                          </p>
                          <p className="text-sm font-bold" style={{ color: '#E2E8F0' }}>
                            ${record.betAmount.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-black mb-0.5" style={{ 
                            color: record.result === 'win' ? '#22C55E' : '#EF4444' 
                          }}>
                            {record.result === 'win' ? 'WIN' : 'LOSS'}
                          </p>
                          <p className="text-sm font-black" style={{ 
                            color: record.result === 'win' ? '#22C55E' : '#64748B' 
                          }}>
                            {record.result === 'win' 
                              ? `$${record.payout.toFixed(2)}` 
                              : '-'}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {userHistory.length === 0 && (
                    <div className="text-center py-6">
                      <Trophy className="w-10 h-10 mx-auto mb-2 opacity-30" style={{ color: '#94A3B8' }} />
                      <p className="text-xs font-semibold" style={{ color: '#64748B' }}>
                        No history yet. Play your first round!
                      </p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="winners"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3"
                >
                  {recentWinnersList.slice(0, 8).map((winner, index) => (
                    <motion.div
                      key={winner.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      whileHover={{ scale: 1.01 }}
                      className="rounded-lg p-2.5 flex items-center justify-between"
                      style={{
                        background: 'rgba(15, 23, 42, 0.4)',
                        border: '1px solid rgba(34, 197, 94, 0.15)',
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-7 h-7 rounded-full flex items-center justify-center text-sm"
                          style={{
                            background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
                            boxShadow: '0 0 10px rgba(34, 197, 94, 0.25)',
                          }}
                        >
                          {winner.avatar}
                        </div>
                        <div>
                          <p className="text-xs font-bold mb-0.5" style={{ color: '#E2E8F0' }}>
                            {winner.username}
                          </p>
                          <p className="text-[10px] font-medium" style={{ color: '#64748B' }}>
                            Bet: ${winner.betAmount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-bold mb-0.5 uppercase tracking-wider" style={{ color: '#22C55E' }}>
                          Won
                        </p>
                        <p className="text-sm font-black" style={{ color: '#22C55E' }}>
                          ${winner.payout.toFixed(2)}
                        </p>
                      </div>
                    </motion.div>
                  ))}

                  {recentWinnersList.length === 0 && (
                    <div className="text-center py-6">
                      <Trophy className="w-10 h-10 mx-auto mb-2 opacity-30" style={{ color: '#94A3B8' }} />
                      <p className="text-xs font-semibold" style={{ color: '#64748B' }}>
                        No recent winners yet
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          </div>

          </div>
        </div>
      </div>

      {/* Result Modal - Only shows when user has joined */}
      <AnimatePresence>
        {showResult && winner && hasJoined && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <motion.div
              initial={{ scale: 0.5, y: 100, rotate: winner.id === 'you' ? -10 : 0 }}
              animate={{ 
                scale: winner.id === 'you' ? [0.5, 1.1, 1] : [0.5, 1],
                y: 0,
                rotate: winner.id === 'you' ? [-10, 5, 0] : 0,
              }}
              exit={{ scale: 0.5, y: 100, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="rounded-2xl p-6 text-center max-w-sm w-full relative overflow-hidden"
              style={{
                background: winner.id === 'you'
                  ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(16, 185, 129, 0.3) 100%)'
                  : 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(51, 65, 85, 0.95) 100%)',
                border: winner.id === 'you' 
                  ? '3px solid rgba(34, 197, 94, 0.5)'
                  : '2px solid rgba(148, 163, 184, 0.3)',
                boxShadow: winner.id === 'you'
                  ? '0 20px 80px rgba(34, 197, 94, 0.5)'
                  : '0 20px 60px rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(16px)',
              }}
            >
              {winner.id === 'you' && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ y: -50, x: Math.random() * 500 - 50, opacity: 1, scale: 0 }}
                      animate={{ 
                        y: 700, 
                        x: Math.random() * 500 - 50,
                        opacity: [1, 1, 0],
                        rotate: Math.random() * 1080,
                        scale: [0, 1, 0.5],
                      }}
                      transition={{ 
                        duration: Math.random() * 2 + 2.5,
                        repeat: Infinity,
                        delay: Math.random() * 1.5,
                        ease: 'easeOut'
                      }}
                      className="absolute w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#FFD700'][i % 6],
                        left: `${Math.random() * 100}%`,
                      }}
                    />
                  ))}
                </div>
              )}

              <motion.div
                animate={winner.id === 'you' 
                  ? { rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.1, 1] } 
                  : {}
                }
                transition={{ duration: 0.6, times: [0, 0.2, 0.4, 0.6, 0.8, 1] }}
              >
                <Trophy className="w-16 h-16 mx-auto mb-3" style={{ 
                  color: winner.id === 'you' ? '#FFD700' : '#94A3B8',
                  filter: winner.id === 'you' ? 'drop-shadow(0 0 30px #FFD700)' : 'none',
                }} />
              </motion.div>

              <motion.h2 
                animate={winner.id === 'you' 
                  ? { scale: [1, 1.1, 1] } 
                  : { x: [-5, 5, -5, 0] }
                }
                transition={{ 
                  duration: winner.id === 'you' ? 0.5 : 0.4,
                  repeat: winner.id === 'you' ? 2 : 0
                }}
                className="text-2xl font-black mb-2" 
                style={{ 
                  color: winner.id === 'you' ? '#FFD700' : '#FFFFFF',
                  textShadow: winner.id === 'you' ? '0 0 30px rgba(255, 215, 0, 0.7)' : 'none',
                }}
              >
                {winner.id === 'you' ? '🎉 YOU WON!' : 'Round Lost'}
              </motion.h2>

              {winner.id !== 'you' && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-xs mb-3" 
                  style={{ color: '#94A3B8' }}
                >
                  Try again — next round is live
                </motion.p>
              )}

              <div className="mb-4">
                <p className="text-sm font-semibold mb-2" style={{ color: '#E2E8F0' }}>
                  Winner: {winner.username} {winner.avatar}
                </p>
                <motion.p 
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className="text-3xl font-black mb-1.5" 
                  style={{ 
                    color: winner.id === 'you' ? '#22C55E' : '#94A3B8',
                    textShadow: winner.id === 'you' ? '0 0 20px rgba(34, 197, 94, 0.5)' : 'none',
                  }}
                >
                  ${totalPool.toFixed(2)}
                </motion.p>
                {winner.id === 'you' && (
                  <p className="text-sm font-semibold" style={{ color: '#94A3B8' }}>
                    Profit: <span style={{ color: '#22C55E' }}>+${(totalPool - betAmount).toFixed(2)}</span>
                  </p>
                )}
              </div>

              <motion.button
                onClick={handleNewRound}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                animate={{ 
                  boxShadow: [
                    '0 8px 30px rgba(59, 130, 246, 0.4)', 
                    '0 12px 50px rgba(139, 92, 246, 0.7)', 
                    '0 8px 30px rgba(59, 130, 246, 0.4)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-full py-3 rounded-xl font-black text-sm"
                style={{
                  background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                  color: '#FFFFFF',
                }}
              >
                New Round →
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Trust System Modals */}
      <PvPWheelModals
        showRulesModal={showRulesModal}
        setShowRulesModal={setShowRulesModal}
        showProvablyFairModal={showProvablyFairModal}
        setShowProvablyFairModal={setShowProvablyFairModal}
        serverSeedHash={serverSeedHash}
        clientSeed={clientSeed}
        setClientSeed={setClientSeed}
        nonce={nonce}
        copiedField={copiedField}
        handleCopy={handleCopy}
      />

      {/* Leaderboard Modal */}
      <AnimatePresence>
        {showLeaderboard && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLeaderboard(false)}
              className="fixed inset-0 z-50"
              style={{
                background: 'rgba(0, 0, 0, 0.8)',
                backdropFilter: 'blur(8px)',
              }}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-[95%] max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl p-6"
              style={{
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%)',
                border: '2px solid rgba(251, 146, 60, 0.3)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #FB923C 0%, #F97316 100%)',
                      boxShadow: '0 0 20px rgba(251, 146, 60, 0.4)',
                    }}
                  >
                    <Trophy className="w-5 h-5" style={{ color: '#FFFFFF' }} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black" style={{ color: '#FFFFFF' }}>
                      Leaderboard
                    </h2>
                    <p className="text-xs font-medium" style={{ color: '#94A3B8' }}>
                      Top Players This Week
                    </p>
                  </div>
                </div>
                <motion.button
                  onClick={() => setShowLeaderboard(false)}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                  }}
                >
                  <X className="w-4 h-4" style={{ color: '#EF4444' }} />
                </motion.button>
              </div>

              {/* Leaderboard Content */}
              <div className="space-y-3">
                {/* Top 3 Podium */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {/* 2nd Place */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-col items-center"
                  >
                    <div 
                      className="w-14 h-14 rounded-full flex items-center justify-center text-xl mb-2 relative"
                      style={{
                        background: 'linear-gradient(135deg, #94A3B8 0%, #64748B 100%)',
                        boxShadow: '0 0 20px rgba(148, 163, 184, 0.3)',
                      }}
                    >
                      🎮
                      <div 
                        className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black"
                        style={{
                          background: 'linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%)',
                          color: '#1E293B',
                          border: '2px solid #1E293B',
                        }}
                      >
                        2
                      </div>
                    </div>
                    <p className="text-xs font-bold mb-0.5" style={{ color: '#E2E8F0' }}>ProGamer</p>
                    <p className="text-[10px] font-semibold" style={{ color: '#94A3B8' }}>$12,450</p>
                  </motion.div>

                  {/* 1st Place */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0 }}
                    className="flex flex-col items-center -mt-2"
                  >
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-2 relative"
                      style={{
                        background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
                        boxShadow: '0 0 30px rgba(251, 191, 36, 0.5)',
                      }}
                    >
                      👑
                      <div 
                        className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-sm font-black"
                        style={{
                          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                          color: '#1E293B',
                          border: '2px solid #1E293B',
                        }}
                      >
                        1
                      </div>
                    </div>
                    <p className="text-sm font-black mb-0.5" style={{ color: '#FBBF24' }}>CryptoKing</p>
                    <p className="text-xs font-bold" style={{ color: '#FB923C' }}>$25,890</p>
                  </motion.div>

                  {/* 3rd Place */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col items-center"
                  >
                    <div 
                      className="w-14 h-14 rounded-full flex items-center justify-center text-xl mb-2 relative"
                      style={{
                        background: 'linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)',
                        boxShadow: '0 0 20px rgba(205, 127, 50, 0.3)',
                      }}
                    >
                      🔥
                      <div 
                        className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black"
                        style={{
                          background: 'linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)',
                          color: '#FFFFFF',
                          border: '2px solid #1E293B',
                        }}
                      >
                        3
                      </div>
                    </div>
                    <p className="text-xs font-bold mb-0.5" style={{ color: '#E2E8F0' }}>SpinMaster</p>
                    <p className="text-[10px] font-semibold" style={{ color: '#94A3B8' }}>$9,120</p>
                  </motion.div>
                </div>

                {/* Divider */}
                <div className="h-px" style={{ background: 'rgba(148, 163, 184, 0.15)' }} />

                {/* Rest of Leaderboard (4-10) */}
                <div className="space-y-2">
                  {[
                    { rank: 4, username: 'LuckyMike', avatar: '🎲', winnings: 7250 },
                    { rank: 5, username: 'WheelBoss', avatar: '💎', winnings: 6800 },
                    { rank: 6, username: 'BetKing', avatar: '⚡', winnings: 5900 },
                    { rank: 7, username: 'Fortune777', avatar: '🎯', winnings: 4320 },
                    { rank: 8, username: 'MegaWin', avatar: '🌟', winnings: 3890 },
                    { rank: 9, username: 'DiamondHands', avatar: '🚀', winnings: 2750 },
                    { rank: 10, username: 'MoonShot', avatar: '💰', winnings: 1960 },
                  ].map((player, index) => (
                    <motion.div
                      key={player.rank}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                      whileHover={{ scale: 1.02, x: 5 }}
                      className="flex items-center justify-between p-3 rounded-lg"
                      style={{
                        background: 'rgba(30, 41, 59, 0.4)',
                        border: '1px solid rgba(148, 163, 184, 0.1)',
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black"
                          style={{
                            backgroundColor: 'rgba(148, 163, 184, 0.2)',
                            color: '#94A3B8',
                          }}
                        >
                          {player.rank}
                        </div>
                        <div 
                          className="w-9 h-9 rounded-full flex items-center justify-center text-lg"
                          style={{
                            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                          }}
                        >
                          {player.avatar}
                        </div>
                        <div>
                          <p className="text-sm font-bold" style={{ color: '#E2E8F0' }}>
                            {player.username}
                          </p>
                          <p className="text-[10px] font-medium" style={{ color: '#64748B' }}>
                            Total Winnings
                          </p>
                        </div>
                      </div>
                      <p className="text-base font-black" style={{ color: '#22C55E' }}>
                        ${player.winnings.toLocaleString()}
                      </p>
                    </motion.div>
                  ))}
                </div>

                {/* Your Rank */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-4 p-4 rounded-xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.15) 0%, rgba(249, 115, 22, 0.15) 100%)',
                    border: '2px solid rgba(251, 146, 60, 0.3)',
                  }}
                >
                  <p className="text-xs font-semibold mb-2" style={{ color: '#94A3B8' }}>
                    Your Rank
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black"
                        style={{
                          background: 'linear-gradient(135deg, #FB923C 0%, #F97316 100%)',
                          color: '#FFFFFF',
                        }}
                      >
                        #42
                      </div>
                      <div>
                        <p className="text-sm font-bold" style={{ color: '#FFFFFF' }}>
                          You
                        </p>
                        <p className="text-[10px] font-medium" style={{ color: '#94A3B8' }}>
                          Keep playing to climb!
                        </p>
                      </div>
                    </div>
                    <p className="text-lg font-black" style={{ color: '#FB923C' }}>
                      $850
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <GameFooter />
    </div>
  );
}