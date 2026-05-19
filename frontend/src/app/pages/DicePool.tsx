import { useState, useEffect } from 'react';
import { BackButton } from '../components/BackButton';
import { useUser } from '../context/UserContext';
import { Info, Crown, Send, MessageCircle, Shield, ChevronDown, ChevronUp, Swords, Zap, Target } from 'lucide-react';
import { GameFooter } from '../components/GameFooter';

type GameState = 'waiting' | 'countdown' | 'rolling' | 'result' | 'distributing';
type GameMode = 'classic' | 'pvp' | 'boss';
type PvPState = 'matching' | 'matched' | 'betting' | 'locked' | 'rolling' | 'result';

interface Player {
  username: string;
  number: number;
  final: number;
}

interface BetHistory {
  roundId: string;
  bet: number;
  dice: number;
  result: 'win' | 'loss' | 'pending';
  winnings: number;
}

interface UserBet {
  username: string;
  bet: number;
  dice: number;
  result: 'win' | 'loss';
}

interface PvPPlayer {
  username: string;
  avatar: string;
  betAmount: number;
  roll: number;
  status: 'ready' | 'locked';
}

export function DicePool() {
  const { formatCurrency, gameBalance, currencyPreference, updateGameBalance } = useUser();
  const [gameMode, setGameMode] = useState<GameMode>('classic');
  const [timeLeft, setTimeLeft] = useState(30);
  const [betAmount, setBetAmount] = useState(0);
  const [totalPool, setTotalPool] = useState(2847);
  const [playersCount, setPlayersCount] = useState(23);
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [poolGrowing, setPoolGrowing] = useState(false);
  const [roundId, setRoundId] = useState('RB-4782');
  const [showRules, setShowRules] = useState(false);
  const [myRoll, setMyRoll] = useState(0);
  const [myFinalRoll, setMyFinalRoll] = useState(0);
  const [myRank, setMyRank] = useState(0);
  const [hasJoined, setHasJoined] = useState(false);
  const [currentBetAmount, setCurrentBetAmount] = useState(0);
  
  // PvP specific states
  const [pvpState, setPvpState] = useState<PvPState>('matching');
  const [myPvPBet, setMyPvPBet] = useState(0);
  const [opponentPvPBet, setOpponentPvPBet] = useState(0);
  const [pvpPot, setPvpPot] = useState(0);
  const [myPvPRoll, setMyPvPRoll] = useState(0);
  const [opponentPvPRoll, setOpponentPvPRoll] = useState(0);
  const [pvpWinner, setPvpWinner] = useState<'you' | 'opponent' | null>(null);
  const [opponent, setOpponent] = useState<PvPPlayer | null>(null);

  const [chatMessages, setChatMessages] = useState([
    { type: 'system', text: 'User_abc123 joined the round' },
    { type: 'system', text: 'User_xyz456 placed a bet of ₦500' },
    { type: 'user', username: 'User_def789', text: 'Good luck everyone!' },
    { type: 'system', text: 'User_ghi012 joined the round' },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [shake, setShake] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showProvablyFair, setShowProvablyFair] = useState(false);
  const [showMyHistory, setShowMyHistory] = useState(false);
  const [showUsersHistory, setShowUsersHistory] = useState(false);
  const [betSuccess, setBetSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [players, setPlayers] = useState<Player[]>([]);

  const [myBettingHistory, setMyBettingHistory] = useState<BetHistory[]>([
    { roundId: 'RB-4780', bet: 500, dice: 45, result: 'loss', winnings: 0 },
    { roundId: 'RB-4779', bet: 1000, dice: 92, result: 'win', winnings: 2500 },
    { roundId: 'RB-4778', bet: 250, dice: 38, result: 'loss', winnings: 0 },
    { roundId: 'RB-4777', bet: 750, dice: 88, result: 'win', winnings: 1800 },
    { roundId: 'RB-4776', bet: 300, dice: 55, result: 'loss', winnings: 0 },
  ]);

  const usersBettingHistory: UserBet[] = [
    { username: 'User_abc123', bet: 800, dice: 98, result: 'win' },
    { username: 'User_xyz456', bet: 1200, dice: 95, result: 'win' },
    { username: 'User_def789', bet: 500, dice: 92, result: 'win' },
    { username: 'User_ghi012', bet: 350, dice: 89, result: 'win' },
    { username: 'User_jkl345', bet: 600, dice: 86, result: 'win' },
    { username: 'User_mno678', bet: 450, dice: 35, result: 'loss' },
    { username: 'User_pqr901', bet: 900, dice: 28, result: 'loss' },
    { username: 'User_stu234', bet: 250, dice: 67, result: 'loss' },
  ];

  const isLastFiveSeconds = timeLeft <= 5;
  const maxPlayers = 50;
  const progress = (timeLeft / 30) * 100;
  const fee = currencyPreference === 'ngn' ? 50 : 1;
  
  // PvP calculations
  const platformFee = 0.04; // 4% platform fee
  const pvpWinnings = pvpPot * (1 - platformFee);
  
  // Start PvP match
  const startPvPMatch = () => {
    if (myPvPBet < 5 || myPvPBet > 100) return;
    
    if (myPvPBet > gameBalance) {
      setErrorMessage('Insufficient gaming balance!');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    
    setPvpState('matching');
    updateGameBalance(-myPvPBet);
    
    // Simulate finding opponent
    setTimeout(() => {
      const opponentBet = Math.floor(Math.random() * (100 - 5 + 1)) + 5;
      setOpponentPvPBet(opponentBet);
      setPvpPot(myPvPBet + opponentBet);
      setOpponent({
        username: `Player_${Math.random().toString(36).substring(7)}`,
        avatar: '👤',
        betAmount: opponentBet,
        roll: 0,
        status: 'ready'
      });
      setPvpState('matched');
    }, 2000);
  };
  
  // PvP dice roll
  const rollPvPDice = () => {
    setPvpState('locked');
    
    setTimeout(() => {
      setPvpState('rolling');
      
      // Animate rolling
      const rollInterval = setInterval(() => {
        setMyPvPRoll(Math.floor(Math.random() * 50) + 1);
        setOpponentPvPRoll(Math.floor(Math.random() * 50) + 1);
      }, 100);
      
      setTimeout(() => {
        clearInterval(rollInterval);
        const finalMyRoll = Math.floor(Math.random() * 50) + 1;
        const finalOpponentRoll = Math.floor(Math.random() * 50) + 1;
        setMyPvPRoll(finalMyRoll);
        setOpponentPvPRoll(finalOpponentRoll);
        
        if (finalMyRoll > finalOpponentRoll) {
          setPvpWinner('you');
          updateGameBalance(pvpWinnings);
        } else if (finalOpponentRoll > finalMyRoll) {
          setPvpWinner('opponent');
        } else {
          // Tie - split pot
          setPvpWinner(null);
          updateGameBalance(myPvPBet);
        }
        
        setPvpState('result');
      }, 3000);
    }, 1000);
  };
  
  // Reset PvP
  const resetPvP = () => {
    setPvpState('matching');
    setMyPvPBet(0);
    setOpponentPvPBet(0);
    setPvpPot(0);
    setMyPvPRoll(0);
    setOpponentPvPRoll(0);
    setPvpWinner(null);
    setOpponent(null);
  };

  // Generate random players
  const generatePlayers = () => {
    const playerCount = Math.floor(Math.random() * 15) + 35; // 35-50 players
    const newPlayers: Player[] = [];
    
    for (let i = 0; i < playerCount; i++) {
      newPlayers.push({
        username: `User_${Math.random().toString(36).substring(7)}`,
        number: 0,
        final: Math.floor(Math.random() * 50) + 1 // 1-50 range
      });
    }
    
    return newPlayers;
  };

  // Initialize players on mount
  useEffect(() => {
    setPlayers(generatePlayers());
  }, []);

  // Get top 20 leaderboard for Classic, top 3 for Boss
  const leaderboard = [...players]
    .sort((a, b) => (gameState === 'result' || gameState === 'distributing' ? b.final - a.final : b.number - a.number))
    .slice(0, gameMode === 'boss' ? 3 : 20);

  // Calculate my rank
  useEffect(() => {
    if (hasJoined && (gameState === 'result' || gameState === 'distributing') && gameMode !== 'pvp') {
      const sortedPlayers = [...players].sort((a, b) => b.final - a.final);
      const rank = sortedPlayers.findIndex(p => p.final === myFinalRoll) + 1;
      setMyRank(rank);
      
      const winnerThreshold = gameMode === 'boss' ? 3 : 20;
      
      if (rank <= winnerThreshold) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
        
        // Calculate winnings based on mode
        let winnings = 0;
        if (gameMode === 'boss') {
          // Boss mode: 60% / 25% / 15% split
          const jackpot = totalPool * 1.5;
          if (rank === 1) winnings = jackpot * 0.6;
          else if (rank === 2) winnings = jackpot * 0.25;
          else if (rank === 3) winnings = jackpot * 0.15;
        } else {
          // Classic mode: even split among top 20
          winnings = Math.floor(totalPool / 20);
        }
        
        // Update betting history with result
        setMyBettingHistory(prev => {
          const updated = [...prev];
          const pendingIndex = updated.findIndex(h => h.result === 'pending');
          if (pendingIndex !== -1) {
            updated[pendingIndex] = {
              ...updated[pendingIndex],
              dice: myFinalRoll,
              result: 'win',
              winnings: winnings
            };
            // Add winnings to game balance
            updateGameBalance(winnings);
          }
          return updated;
        });
      } else {
        // Update betting history with loss
        setMyBettingHistory(prev => {
          const updated = [...prev];
          const pendingIndex = updated.findIndex(h => h.result === 'pending');
          if (pendingIndex !== -1) {
            updated[pendingIndex] = {
              ...updated[pendingIndex],
              dice: myFinalRoll,
              result: 'loss',
              winnings: 0
            };
          }
          return updated;
        });
      }
    }
  }, [gameState, hasJoined, players, myFinalRoll, totalPool, updateGameBalance, gameMode]);

  // State transitions (only for Classic and Boss modes)
  useEffect(() => {
    if (gameMode === 'pvp') return;
    
    let timer: NodeJS.Timeout;

    if (gameState === 'waiting') {
      timer = setTimeout(() => {
        setGameState('countdown');
        setTimeLeft(30);
      }, 3000);
    } else if (gameState === 'countdown') {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setGameState('rolling');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (gameState === 'rolling') {
      // Screen shake
      setShake(true);
      
      const rollingInterval = setInterval(() => {
        setPlayers(prev => prev.map(p => ({
          ...p,
          number: Math.floor(Math.random() * 50) + 1
        })));
        if (hasJoined) {
          setMyRoll(Math.floor(Math.random() * 50) + 1);
        }
      }, 150);

      const endRolling = setTimeout(() => {
        clearInterval(rollingInterval);
        setPlayers(prev => prev.map(p => ({ ...p, number: p.final })));
        if (hasJoined) {
          setMyRoll(myFinalRoll);
        }
        setShake(false);
        setGameState('result');
      }, 3000);

      return () => {
        clearInterval(rollingInterval);
        clearTimeout(endRolling);
        setShake(false);
      };
    } else if (gameState === 'result') {
      timer = setTimeout(() => {
        setGameState('distributing');
      }, 2000);
    } else if (gameState === 'distributing') {
      timer = setTimeout(() => {
        playAgain();
      }, 3000);
    }

    return () => clearInterval(timer);
  }, [gameState, hasJoined, myFinalRoll, gameMode]);

  const playAgain = () => {
    const newPlayers = generatePlayers();
    setPlayers(newPlayers);
    setMyFinalRoll(Math.floor(Math.random() * 50) + 1);
    setRoundId(`RB-${Math.floor(1000 + Math.random() * 9000)}`);
    setTimeLeft(30);
    setGameState('waiting');
    setBetAmount(0);
    setHasJoined(false);
    setMyRoll(0);
    setMyRank(0);
    setCurrentBetAmount(0);
    
    setPoolGrowing(true);
    setTotalPool(prev => prev + Math.floor(Math.random() * 500) + 300);
    setTimeout(() => setPoolGrowing(false), 600);
  };

  const joinRound = () => {
    if (!betAmount || betAmount <= 0) return;

    if (betAmount > gameBalance) {
      setErrorMessage('Insufficient gaming balance!');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    
    // Validate stake ranges by mode
    if (gameMode === 'classic' && (betAmount < 1 || betAmount > 50)) return;
    if (gameMode === 'boss' && (betAmount < 10 || betAmount > 200)) return;
    
    // Show success feedback
    setBetSuccess(true);
    setTimeout(() => setBetSuccess(false), 1000);
    
    // Deduct from game balance
    updateGameBalance(-betAmount);
    
    // Add to pool
    setPoolGrowing(true);
    setTotalPool(prev => prev + betAmount);
    setPlayersCount(prev => prev + 1);
    setHasJoined(true);
    setCurrentBetAmount(betAmount);
    
    // Generate my final roll
    const myDiceRoll = Math.floor(Math.random() * 50) + 1;
    setMyFinalRoll(myDiceRoll);
    
    // Add me to players list
    setPlayers(prev => [...prev, {
      username: 'You',
      number: 0,
      final: myDiceRoll
    }]);
    
    // Add to betting history
    setMyBettingHistory(prev => [{
      roundId: roundId,
      bet: betAmount,
      dice: 0,
      result: 'pending',
      winnings: 0
    }, ...prev]);
    
    setChatMessages(prev => [...prev, { type: 'system', text: `You placed a bet of ${formatCurrency(betAmount)}` }]);
    setTimeout(() => setPoolGrowing(false), 600);
  };

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, { type: 'user', username: 'You', text: chatInput }]);
    setChatInput('');
  };

  const getStatusLabel = () => {
    switch (gameState) {
      case 'waiting': return 'Waiting for Players';
      case 'countdown': return 'Place Your Bets';
      case 'rolling': return 'Rolling...';
      case 'result': return 'Round Complete';
      case 'distributing': return 'Distributing Rewards';
    }
  };

  const getStatusColor = () => {
    switch (gameState) {
      case 'waiting': return '#9CA3AF';
      case 'countdown': return timeLeft <= 10 && gameMode === 'boss' ? '#EF4444' : '#3B82F6';
      case 'rolling': return '#FBBF24';
      case 'result': return '#22C55E';
      case 'distributing': return '#22C55E';
    }
  };

  const winner = leaderboard[0];
  const isWinner = hasJoined && myRank <= (gameMode === 'boss' ? 3 : 20) && myRank > 0;

  // Get min/max stake by mode
  const getMinStake = () => {
    if (gameMode === 'classic') return 1;
    if (gameMode === 'pvp') return 5;
    if (gameMode === 'boss') return 10;
    return 1;
  };
  
  const getMaxStake = () => {
    if (gameMode === 'classic') return 50;
    if (gameMode === 'pvp') return 100;
    if (gameMode === 'boss') return 200;
    return 50;
  };

  const getBetPresets = () => {
    if (gameMode === 'classic') return [1, 5, 10, 20, 50];
    if (gameMode === 'pvp') return [5, 10, 20, 50, 100];
    if (gameMode === 'boss') return [10, 25, 50, 100, 200];
    return [1, 5, 10, 20, 50];
  };

  const updateBet = (val: number) => {
    if (gameMode === 'pvp') {
      setMyPvPBet(val);
    } else {
      setBetAmount(val);
    }
  };

  return (
    <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${shake ? 'animate-shake' : ''}`} style={{ backgroundColor: '#0B1220' }}>
      <div className="w-full max-w-[480px] md:max-w-[768px] lg:max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8 overflow-y-auto">
        {/* TOP HEADER BAR - Back Button + Mode Selector */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BackButton className="mb-0" />
              
              {/* MODE SELECTOR CLUSTER - Aggressively styled, tight spacing */}
              <div className="flex gap-1">
                <button
                  onClick={() => setGameMode('classic')}
                  className="px-3 py-2 rounded-lg font-bold text-xs transition-all duration-200 flex items-center gap-1"
                  style={{
                    backgroundColor: gameMode === 'classic' ? '#3B82F6' : '#1F2937',
                    color: gameMode === 'classic' ? '#FFFFFF' : '#9CA3AF',
                    boxShadow: gameMode === 'classic' ? '0 0 15px rgba(59, 130, 246, 0.6)' : 'none',
                    border: gameMode === 'classic' ? '2px solid #3B82F6' : '1px solid rgba(42, 58, 90, 0.3)',
                    transform: gameMode === 'classic' ? 'scale(1.05)' : 'scale(1)'
                  }}
                >
                  <span>🎲</span>
                  <span>Classic</span>
                </button>

                <button
                  onClick={() => {
                    setGameMode('pvp');
                    resetPvP();
                  }}
                  className="px-3 py-2 rounded-lg font-bold text-xs transition-all duration-200 flex items-center gap-1"
                  style={{
                    backgroundColor: gameMode === 'pvp' ? '#EF4444' : '#1F2937',
                    color: gameMode === 'pvp' ? '#FFFFFF' : '#9CA3AF',
                    boxShadow: gameMode === 'pvp' ? '0 0 15px rgba(239, 68, 68, 0.6)' : 'none',
                    border: gameMode === 'pvp' ? '2px solid #EF4444' : '1px solid rgba(42, 58, 90, 0.3)',
                    transform: gameMode === 'pvp' ? 'scale(1.05)' : 'scale(1)'
                  }}
                >
                  <Swords className="w-3 h-3" />
                  <span>PvP</span>
                </button>

                <button
                  onClick={() => setGameMode('boss')}
                  className="px-3 py-2 rounded-lg font-bold text-xs transition-all duration-200 flex items-center gap-1"
                  style={{
                    backgroundColor: gameMode === 'boss' ? '#FBBF24' : '#1F2937',
                    color: gameMode === 'boss' ? '#000000' : '#9CA3AF',
                    boxShadow: gameMode === 'boss' ? '0 0 15px rgba(251, 191, 36, 0.6)' : 'none',
                    border: gameMode === 'boss' ? '2px solid #FBBF24' : '1px solid rgba(42, 58, 90, 0.3)',
                    transform: gameMode === 'boss' ? 'scale(1.05)' : 'scale(1)'
                  }}
                >
                  <Crown className="w-3 h-3" />
                  <span>Boss</span>
                </button>
              </div>
            </div>

            {/* RIGHT SIDE - Wallet Balance (Always USD for Game) */}
            <div className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all" style={{ 
              backgroundColor: '#22C55E', 
              color: '#000',
              transform: poolGrowing ? 'scale(1.05)' : 'scale(1)'
            }}>
              {formatCurrency(gameBalance, true)}
            </div>
          </div>

        {/* BOSS MODE - TOP STRIP */}
        {gameMode === 'boss' && (
          <div className="mb-4 p-4 rounded-xl animate-fadeIn" style={{ 
            backgroundColor: 'rgba(251, 191, 36, 0.1)',
            border: '2px solid #FBBF24',
            boxShadow: timeLeft <= 10 && gameState === 'countdown' ? '0 0 20px rgba(239, 68, 68, 0.6)' : '0 0 20px rgba(251, 191, 36, 0.4)'
          }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 animate-pulse" style={{ color: '#FBBF24' }} />
                <span className="text-sm font-bold" style={{ color: '#FBBF24' }}>BOSS ROUND ACTIVE</span>
              </div>
              {gameState === 'countdown' && timeLeft <= 10 && (
                <span className="text-xs font-bold px-2 py-1 rounded-full animate-pulse" style={{ 
                  backgroundColor: '#EF4444',
                  color: '#FFFFFF'
                }}>
                  BOSS INCOMING IN {timeLeft}s
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p style={{ color: '#9CA3AF' }}>Jackpot Pool</p>
                <p className="text-lg font-bold" style={{ color: '#FBBF24' }}>
                  {formatCurrency(totalPool * 1.5, true)}
                </p>
              </div>
              <div>
                <p style={{ color: '#9CA3AF' }}>Slots Filled</p>
                <p className="text-lg font-bold" style={{ color: '#FFFFFF' }}>
                  {playersCount} / 50
                </p>
              </div>
            </div>
            <div className="mt-2 w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#1F2937' }}>
              <div 
                className="h-full transition-all duration-500" 
                style={{ 
                  backgroundColor: '#FBBF24',
                  width: `${(playersCount / 50) * 100}%`
                }}
              />
            </div>
          </div>
        )}

        {/* PvP MODE - FLOATING CARDS */}
        {gameMode === 'pvp' && (
          <div className="mb-4 animate-fadeIn">
            <div className="flex items-center justify-between gap-4">
              {/* LEFT CARD - YOU */}
              <div className="flex-1 rounded-xl p-4 transition-all duration-300" style={{ 
                backgroundColor: '#1F2530',
                border: pvpWinner === 'you' ? '3px solid #22C55E' : '2px solid rgba(59, 130, 246, 0.5)',
                boxShadow: pvpWinner === 'you' ? '0 0 30px rgba(34, 197, 94, 0.6)' : '0 4px 12px rgba(0, 0, 0, 0.5)',
                opacity: pvpWinner === 'opponent' ? 0.5 : 1
              }}>
                <div className="flex flex-col items-center gap-2">
                  <div className="text-3xl">👤</div>
                  <p className="text-xs font-bold" style={{ color: '#3B82F6' }}>YOU</p>
                  {myPvPBet > 0 && (
                    <>
                      <p className="text-sm font-bold" style={{ color: '#FFFFFF' }}>
                        {formatCurrency(myPvPBet, true)}
                      </p>
                      {pvpState === 'rolling' || pvpState === 'result' ? (
                        <p className="text-2xl font-bold" style={{ color: '#22C55E' }}>
                          {myPvPRoll}
                        </p>
                      ) : (
                        <span className="text-xs px-2 py-1 rounded-full font-bold" style={{ 
                          backgroundColor: pvpState === 'locked' ? '#FBBF24' : '#22C55E',
                          color: '#000'
                        }}>
                          {pvpState === 'locked' ? 'LOCKED' : 'READY'}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* CENTER - VS BADGE */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center animate-pulse" style={{ 
                  backgroundColor: '#EF4444',
                  boxShadow: '0 0 20px rgba(239, 68, 68, 0.6)'
                }}>
                  <Swords className="w-6 h-6 text-white" />
                </div>
                {pvpPot > 0 && (
                  <div className="mt-2 px-3 py-1 rounded-full text-xs font-bold" style={{ 
                    backgroundColor: '#FBBF24',
                    color: '#000'
                  }}>
                    {formatCurrency(pvpPot, true)}
                  </div>
                )}
              </div>

              {/* RIGHT CARD - OPPONENT */}
              <div className="flex-1 rounded-xl p-4 transition-all duration-300" style={{ 
                backgroundColor: '#1F2530',
                border: pvpWinner === 'opponent' ? '3px solid #22C55E' : '2px solid rgba(239, 68, 68, 0.5)',
                boxShadow: pvpWinner === 'opponent' ? '0 0 30px rgba(34, 197, 94, 0.6)' : '0 4px 12px rgba(0, 0, 0, 0.5)',
                opacity: pvpWinner === 'you' ? 0.5 : 1
              }}>
                <div className="flex flex-col items-center gap-2">
                  <div className="text-3xl">
                    {pvpState === 'matching' ? '?' : '👤'}
                  </div>
                  <p className="text-xs font-bold" style={{ color: '#EF4444' }}>
                    {pvpState === 'matching' ? 'MATCHING...' : 'OPPONENT'}
                  </p>
                  {opponent && (
                    <>
                      <p className="text-sm font-bold" style={{ color: '#FFFFFF' }}>
                        {formatCurrency(opponentPvPBet, true)}
                      </p>
                      {pvpState === 'rolling' || pvpState === 'result' ? (
                        <p className="text-2xl font-bold" style={{ color: '#EF4444' }}>
                          {opponentPvPRoll}
                        </p>
                      ) : (
                        <span className="text-xs px-2 py-1 rounded-full font-bold" style={{ 
                          backgroundColor: pvpState === 'matched' ? '#22C55E' : '#FBBF24',
                          color: '#000'
                        }}>
                          {pvpState === 'matched' ? 'READY' : 'LOCKED'}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* PvP RESULT INFO */}
            {pvpState === 'result' && (
              <div className="mt-4 p-4 rounded-xl text-center animate-scaleIn" style={{ 
                backgroundColor: pvpWinner === 'you' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                border: `2px solid ${pvpWinner === 'you' ? '#22C55E' : '#EF4444'}`
              }}>
                <p className="text-2xl font-bold mb-2" style={{ 
                  color: pvpWinner === 'you' ? '#22C55E' : '#EF4444'
                }}>
                  {pvpWinner === 'you' ? '🏆 YOU WIN!' : '😔 YOU LOST'}
                </p>
                {pvpWinner === 'you' && (
                  <p className="text-lg font-bold" style={{ color: '#22C55E' }}>
                    +{formatCurrency(pvpWinnings, true)}
                  </p>
                )}
                <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
                  Platform fee: {formatCurrency(pvpPot * platformFee, true)} (4%)
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={resetPvP}
                    className="flex-1 py-2 rounded-xl font-bold text-sm transition-all hover:scale-105"
                    style={{ backgroundColor: '#3B82F6', color: '#FFFFFF' }}
                  >
                    Rematch
                  </button>
                  <button
                    onClick={() => setGameMode('classic')}
                    className="flex-1 py-2 rounded-xl font-bold text-sm transition-all hover:scale-105"
                    style={{ backgroundColor: '#1F2937', color: '#FFFFFF' }}
                  >
                    Exit Arena
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TOP APP BAR */}
        <div className="flex items-center justify-between mb-4 p-4 rounded-2xl" style={{ 
          backgroundColor: '#1F2530',
          border: '1px solid rgba(42, 58, 90, 0.3)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
        }}>
          <div className="text-center flex-1">
            <p className="text-xs font-medium mb-1" style={{ color: '#9CA3AF' }}>Round ID</p>
            <p className="text-sm font-bold" style={{ color: '#3B82F6' }}>{roundId}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowProvablyFair(true)} className="p-2 rounded-xl" style={{ backgroundColor: '#1F2937' }}>
              <Shield className="w-5 h-5" style={{ color: '#22C55E' }} />
            </button>
            <button onClick={() => setShowRules(true)} className="p-2 rounded-xl" style={{ backgroundColor: '#1F2937' }}>
              <Info className="w-5 h-5" style={{ color: '#FFFFFF' }} />
            </button>
          </div>
        </div>

        <div className="max-w-md mx-auto space-y-4 relative">
          {/* ROUND INFO ROW (CHIPS) */}
          <div className="flex gap-2 flex-wrap items-center">
            <div className="px-3 py-1.5 rounded-full text-xs font-semibold" style={{ backgroundColor: '#1F2937', color: '#FFFFFF' }}>
              Round: {roundId}
            </div>
            <button
              onClick={() => setShowChat(true)}
              className="relative p-1.5 rounded-full transition-all hover:scale-105"
              style={{ 
                backgroundColor: '#1F2937'
              }}
            >
              <MessageCircle className="w-4 h-4" style={{ color: '#3B82F6' }} />
              {chatMessages.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: '#EF4444', color: '#FFFFFF' }}>
                  {chatMessages.length}
                </span>
              )}
            </button>
          </div>

          {gameMode !== 'pvp' && (
            <>
              {/* ROUND STATUS CARD */}
              <div className="rounded-2xl p-6 transition-all duration-500" style={{ 
                backgroundColor: '#1F2530',
                border: gameState === 'distributing' ? '2px solid rgba(34, 197, 94, 0.5)' : '1px solid rgba(42, 58, 90, 0.3)',
                boxShadow: gameState === 'distributing' ? '0 0 20px rgba(34, 197, 94, 0.4), 0 4px 12px rgba(0, 0, 0, 0.5)' : '0 4px 12px rgba(0, 0, 0, 0.5)',
                transform: `scale(${gameState === 'rolling' ? 0.98 : 1})` 
              }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: getStatusColor() }}></div>
                    <span className="text-sm font-semibold" style={{ color: getStatusColor() }}>
                      {getStatusLabel()}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium" style={{ color: '#9CA3AF' }}>Players</p>
                    <p className="text-sm font-bold" style={{ color: '#FFFFFF' }}>{playersCount}/{maxPlayers}</p>
                  </div>
                </div>

                {/* TOTAL POOL BALANCE */}
                <div className="mb-4 p-3 rounded-xl transition-all" style={{ 
                  backgroundColor: gameState === 'distributing' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(59, 130, 246, 0.1)', 
                  border: gameState === 'distributing' ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(59, 130, 246, 0.3)' 
                }}>
                  <p className="text-xs font-medium mb-1 text-center" style={{ color: '#9CA3AF' }}>
                    {gameMode === 'boss' ? 'Jackpot Pool' : 'Total Pool Balance'}
                  </p>
                  <p className="text-2xl font-bold text-center transition-transform duration-300" style={{ 
                    color: gameState === 'distributing' ? '#22C55E' : gameMode === 'boss' ? '#FBBF24' : '#3B82F6',
                    transform: poolGrowing ? 'scale(1.1)' : 'scale(1)'
                  }}>
                    {formatCurrency(gameMode === 'boss' ? totalPool * 1.5 : totalPool, true)}
                  </p>
                  {gameMode === 'classic' && betAmount > 0 && (
                    <p className="text-xs text-center mt-1" style={{ color: '#9CA3AF' }}>
                      Potential win: ~{formatCurrency(betAmount * 2, true)} (2.0x)
                    </p>
                  )}
                </div>

                <div className="text-center mb-3">
                  {gameState === 'waiting' && (
                    <p className="text-5xl font-bold animate-pulse" style={{ color: '#9CA3AF' }}>
                      ⏳
                    </p>
                  )}
                  {gameState === 'countdown' && (
                    <p className="text-7xl font-bold transition-all duration-300" style={{ 
                      color: isLastFiveSeconds ? '#EF4444' : gameMode === 'boss' ? '#FBBF24' : '#3B82F6',
                      textShadow: isLastFiveSeconds ? '0 0 20px rgba(239, 68, 68, 0.5)' : 'none',
                      transform: gameMode === 'boss' ? 'scale(1.1)' : 'scale(1)'
                    }}>
                      {timeLeft}
                    </p>
                  )}
                  {gameState === 'rolling' && (
                    <p className="text-7xl font-bold animate-pulse" style={{ 
                      color: '#FBBF24',
                      filter: 'blur(2px)',
                      transform: gameMode === 'boss' ? 'scale(1.2)' : 'scale(1)'
                    }}>
                      🎲
                    </p>
                  )}
                  {(gameState === 'result' || gameState === 'distributing') && (
                    <p className="text-7xl font-bold" style={{ color: '#22C55E' }}>
                      ✓
                    </p>
                  )}
                </div>

                {gameState === 'countdown' && (
                  <div className="w-full h-3 rounded-full overflow-hidden" style={{ backgroundColor: '#1F2937' }}>
                    <div 
                      className="h-full transition-all duration-1000" 
                      style={{ 
                        backgroundColor: isLastFiveSeconds ? '#EF4444' : gameMode === 'boss' ? '#FBBF24' : '#3B82F6',
                        width: `${progress}%`
                      }}
                    />
                  </div>
                )}

                {gameState === 'waiting' && (
                  <p className="text-center text-sm mt-3" style={{ color: '#9CA3AF' }}>
                    Waiting for players...
                  </p>
                )}
              </div>

              {/* MY DICE RESULT CARD */}
              {hasJoined && (gameState === 'rolling' || gameState === 'result' || gameState === 'distributing') && (
                <div 
                  className="rounded-2xl p-6 transition-all duration-500"
                  style={{ 
                    backgroundColor: '#1F2530',
                    border: myRank <= (gameMode === 'boss' ? 3 : 20) && (gameState === 'result' || gameState === 'distributing') ? 
                      `3px solid ${myRank === 1 ? '#FBBF24' : myRank <= 3 ? '#C0C0C0' : '#22C55E'}` : 
                      '1px solid rgba(42, 58, 90, 0.3)',
                    boxShadow: myRank <= (gameMode === 'boss' ? 3 : 20) && (gameState === 'result' || gameState === 'distributing') ? 
                      '0 0 30px rgba(34, 197, 94, 0.6), 0 4px 12px rgba(0, 0, 0, 0.5)' : 
                      '0 4px 12px rgba(0, 0, 0, 0.5)',
                    transform: (gameState === 'result' || gameState === 'distributing') ? 'scale(1)' : 'scale(0.95)',
                    opacity: (gameState === 'result' || gameState === 'distributing') ? 1 : 0.9
                  }}
                >
                  <div className="text-center">
                    <div className="text-6xl mb-3" style={{ 
                      filter: gameState === 'rolling' ? 'blur(3px)' : 'none',
                      transform: gameState === 'rolling' ? 'scale(1.1)' : 'scale(1)',
                      transition: 'all 0.2s'
                    }}>
                      🎲
                    </div>
                    <p className="text-4xl font-bold mb-2 transition-all duration-300" style={{ 
                      color: myRank <= (gameMode === 'boss' ? 3 : 20) && (gameState === 'result' || gameState === 'distributing') ? '#22C55E' : '#FFFFFF',
                      filter: gameState === 'rolling' ? 'blur(2px)' : 'none',
                      textShadow: myRank <= (gameMode === 'boss' ? 3 : 20) && (gameState === 'result' || gameState === 'distributing') ? 
                        '0 0 20px rgba(34, 197, 94, 0.8)' : 'none'
                    }}>
                      {gameState === 'rolling' ? myRoll : myFinalRoll}
                    </p>
                    {(gameState === 'result' || gameState === 'distributing') && (
                      <div className="flex items-center justify-center gap-2 animate-fadeIn">
                        <p className="text-lg font-semibold" style={{ color: '#9CA3AF' }}>
                          Rank #{myRank}
                        </p>
                        {myRank <= (gameMode === 'boss' ? 3 : 20) && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 animate-bounce" style={{ 
                            backgroundColor: myRank === 1 ? '#FBBF24' : '#22C55E', 
                            color: '#000' 
                          }}>
                            <Crown className="w-3 h-3" />
                            {myRank === 1 ? '1ST PLACE' : 'WINNER'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* LIVE LEADERBOARD */}
              <div className="rounded-2xl p-5 transition-all duration-500" style={{ 
                backgroundColor: '#1F2530',
                border: '1px solid rgba(42, 58, 90, 0.3)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
              }}>
                <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: '#FFFFFF' }}>
                  <span>🏆</span>
                  <span>{gameMode === 'boss' ? 'TOP 3 LEADERBOARD' : 'TOP 20 LEADERBOARD'}</span>
                </h3>
                
                {gameState === 'waiting' ? (
                  <div className="py-12 text-center">
                    <p className="text-sm animate-pulse" style={{ color: '#9CA3AF' }}>
                      Waiting for players...
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {leaderboard.map((player, index) => {
                      const rank = index + 1;
                      const currentNum = (gameState === 'result' || gameState === 'distributing') ? player.final : player.number;
                      const isTopThree = rank <= 3;
                      
                      return (
                        <div
                          key={index}
                          className="relative flex items-center justify-between p-3 rounded-xl transition-all duration-500"
                          style={{ 
                            backgroundColor: isTopThree && (gameState === 'result' || gameState === 'distributing') ? 
                              (rank === 1 ? 'rgba(251, 191, 36, 0.15)' : 'rgba(192, 192, 192, 0.1)') : '#1F2937',
                            border: isTopThree && (gameState === 'result' || gameState === 'distributing') ? 
                              `2px solid ${rank === 1 ? '#FBBF24' : rank === 2 ? '#C0C0C0' : '#CD7F32'}` : 'none',
                            transform: (gameState === 'result' || gameState === 'distributing') ? 'scale(1)' : 'scale(0.98)',
                            boxShadow: isTopThree && (gameState === 'result' || gameState === 'distributing') ? 
                              `0 0 15px ${rank === 1 ? 'rgba(251, 191, 36, 0.4)' : 'rgba(192, 192, 192, 0.3)'}` : 'none'
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300" style={{ 
                              backgroundColor: rank === 1 ? '#FBBF24' : rank === 2 ? '#C0C0C0' : rank === 3 ? '#CD7F32' : '#374151',
                              color: rank <= 3 ? '#000' : '#FFFFFF'
                            }}>
                              {rank === 1 ? <Crown className="w-4 h-4" /> : rank}
                            </div>
                            <span className="text-sm font-medium transition-all duration-300" style={{ 
                              color: isTopThree && (gameState === 'result' || gameState === 'distributing') ? 
                                (rank === 1 ? '#FBBF24' : '#FFFFFF') : '#9CA3AF' 
                            }}>
                              {player.username}
                            </span>
                            {rank <= (gameMode === 'boss' ? 3 : 20) && (gameState === 'result' || gameState === 'distributing') && (
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full animate-fadeIn" style={{ 
                                backgroundColor: '#22C55E', 
                                color: '#000' 
                              }}>
                                WINNER
                              </span>
                            )}
                          </div>
                          <span 
                            className="text-xl font-bold transition-all duration-300"
                            style={{ 
                              color: isTopThree && (gameState === 'result' || gameState === 'distributing') ? 
                                (rank === 1 ? '#FBBF24' : '#FFFFFF') : '#FFFFFF',
                              textShadow: isTopThree && (gameState === 'result' || gameState === 'distributing') ? 
                                `0 0 15px ${rank === 1 ? 'rgba(251, 191, 36, 0.8)' : 'rgba(255, 255, 255, 0.3)'}` : 'none',
                              filter: gameState === 'rolling' ? 'blur(2px)' : 'none'
                            }}
                          >
                            {currentNum}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* MY BETTING HISTORY */}
              <div className="rounded-2xl transition-all duration-500" style={{ 
                backgroundColor: '#1F2530',
                border: '1px solid rgba(42, 58, 90, 0.3)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
              }}>
                <button 
                  onClick={() => setShowMyHistory(!showMyHistory)}
                  className="w-full p-4 flex items-center justify-between"
                >
                  <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: '#FFFFFF' }}>
                    <span>📋</span>
                    <span>My Betting History</span>
                  </h3>
                  {showMyHistory ? <ChevronUp className="w-5 h-5" style={{ color: '#9CA3AF' }} /> : <ChevronDown className="w-5 h-5" style={{ color: '#9CA3AF' }} />}
                </button>
                
                {showMyHistory && (
                  <div className="px-4 pb-4 space-y-2">
                    {myBettingHistory.map((bet, index) => (
                      <div key={index} className="p-3 rounded-xl animate-fadeIn" style={{ backgroundColor: '#1F2937' }}>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p style={{ color: '#9CA3AF' }}>Round ID</p>
                            <p className="font-semibold" style={{ color: '#3B82F6' }}>{bet.roundId}</p>
                          </div>
                          <div>
                            <p style={{ color: '#9CA3AF' }}>Bet</p>
                            <p className="font-semibold" style={{ color: '#FFFFFF' }}>{formatCurrency(bet.bet, true)}</p>
                          </div>
                          <div>
                            <p style={{ color: '#9CA3AF' }}>Dice #</p>
                            <p className="font-semibold" style={{ color: '#FFFFFF' }}>
                              {bet.result === 'pending' ? '...' : bet.dice}
                            </p>
                          </div>
                          <div>
                            <p style={{ color: '#9CA3AF' }}>Result</p>
                            <p className="font-semibold" style={{ 
                              color: bet.result === 'win' ? '#22C55E' : bet.result === 'pending' ? '#FBBF24' : '#EF4444' 
                            }}>
                              {bet.result === 'win' ? '✓ Win' : bet.result === 'pending' ? '⏳ Pending' : '✗ Loss'}
                            </p>
                          </div>
                          {bet.result === 'win' && (
                            <div className="col-span-2">
                              <p style={{ color: '#9CA3AF' }}>Winnings</p>
                              <p className="font-bold" style={{ color: '#22C55E' }}>{formatCurrency(bet.winnings, true)}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* USERS' BETTING HISTORY */}
              <div className="rounded-2xl transition-all duration-500" style={{ 
                backgroundColor: '#1F2530',
                border: '1px solid rgba(42, 58, 90, 0.3)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
              }}>
                <button 
                  onClick={() => setShowUsersHistory(!showUsersHistory)}
                  className="w-full p-4 flex items-center justify-between"
                >
                  <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: '#FFFFFF' }}>
                    <span>👥</span>
                    <span>Users' Betting History</span>
                  </h3>
                  {showUsersHistory ? <ChevronUp className="w-5 h-5" style={{ color: '#9CA3AF' }} /> : <ChevronDown className="w-5 h-5" style={{ color: '#9CA3AF' }} />}
                </button>
                
                {showUsersHistory && (
                  <div className="px-4 pb-4 space-y-2">
                    {usersBettingHistory.map((bet, index) => (
                      <div key={index} className="p-3 rounded-xl" style={{ backgroundColor: '#1F2937' }}>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p style={{ color: '#9CA3AF' }}>Username</p>
                            <p className="font-semibold" style={{ color: '#FFFFFF' }}>{bet.username}</p>
                          </div>
                          <div>
                            <p style={{ color: '#9CA3AF' }}>Bet</p>
                            <p className="font-semibold" style={{ color: '#FFFFFF' }}>{formatCurrency(bet.bet, true)}</p>
                          </div>
                          <div>
                            <p style={{ color: '#9CA3AF' }}>Dice #</p>
                            <p className="font-semibold" style={{ color: '#FFFFFF' }}>{bet.dice}</p>
                          </div>
                          <div>
                            <p style={{ color: '#9CA3AF' }}>Result</p>
                            <p className="font-semibold" style={{ color: bet.result === 'win' ? '#22C55E' : '#EF4444' }}>
                              {bet.result === 'win' ? '✓ Win' : '✗ Loss'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* BETTING CARD - Fixed Bottom */}
      <div 
        className="fixed bottom-0 left-0 right-0 p-4 border-t"
        style={{ 
          backgroundColor: '#1F2530',
          borderColor: 'rgba(42, 58, 90, 0.3)',
          boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.5)'
        }}
      >
        <div className="max-w-md mx-auto space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold" style={{ color: '#FFFFFF' }}>
              {gameMode === 'pvp' ? 'Enter PvP Arena' : 'Place Your Bet'}
            </h3>
            {betSuccess && (
              <span className="text-xs font-bold px-3 py-1 rounded-full animate-fadeIn" style={{ backgroundColor: '#22C55E', color: '#000' }}>
                ✓ Success!
              </span>
            )}
            {errorMessage && (
              <span className="text-xs font-bold px-3 py-1 rounded-full animate-fadeIn" style={{ backgroundColor: '#EF4444', color: '#FFFFFF' }}>
                {errorMessage}
              </span>
            )}
          </div>

          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lg font-bold" style={{ color: '#FFFFFF' }}>
              $
            </span>
            <input
              type="number"
              value={gameMode === 'pvp' ? myPvPBet || '' : betAmount || ''}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (gameMode === 'pvp') {
                  setMyPvPBet(value);
                } else {
                  setBetAmount(value);
                }
              }}
              placeholder="0.00"
              disabled={gameMode !== 'pvp' && (gameState === 'rolling' || gameState === 'result' || gameState === 'distributing')}
              className="w-full pl-8 pr-3 py-3 border-2 rounded-xl text-lg font-semibold text-center disabled:opacity-50"
              style={{ 
                borderColor: 'rgba(42, 58, 90, 0.3)', 
                color: '#FFFFFF',
                backgroundColor: '#121A2B'
              }}
            />
          </div>

          <p className="text-xs text-center" style={{ color: '#9CA3AF' }}>
            Stakes: {formatCurrency(getMinStake(), true)} - {formatCurrency(getMaxStake(), true)}
          </p>

          <div className="grid grid-cols-3 gap-2">
            {getBetPresets().map((preset) => (
              <button
                key={preset}
                onClick={() => updateBet(preset)}
                disabled={gameMode === 'pvp' ? pvpState !== 'matching' || myPvPBet > 0 : (gameState === 'rolling' || gameState === 'result' || gameState === 'distributing' || hasJoined)}
                className="py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-105 disabled:opacity-50 active:scale-95"
                style={{ backgroundColor: '#1F2937', color: '#FFFFFF' }}
              >
                ${preset}
              </button>
            ))}
            <button
              onClick={() => updateBet(Math.min(gameBalance, getMaxStake()))}
              disabled={gameMode === 'pvp' ? pvpState !== 'matching' || myPvPBet > 0 : (gameState === 'rolling' || gameState === 'result' || gameState === 'distributing' || hasJoined)}
              className="py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-105 disabled:opacity-50 active:scale-95"
              style={{ backgroundColor: gameMode === 'boss' ? '#FBBF24' : '#3B82F6', color: gameMode === 'boss' ? '#000' : '#FFFFFF' }}
            >
              MAX
            </button>
          </div>

          {gameMode === 'pvp' ? (
            <>
              {pvpState === 'matching' && myPvPBet === 0 ? (
                <button
                  onClick={startPvPMatch}
                  disabled={myPvPBet < 5 || myPvPBet > 100 || myPvPBet > gameBalance}
                  className="w-full py-4 rounded-xl font-bold text-base transition-all hover:scale-105 disabled:opacity-50 active:scale-95"
                  style={{
                    backgroundColor: myPvPBet >= 5 && myPvPBet <= 100 && myPvPBet <= gameBalance ? '#EF4444' : '#374151',
                    color: '#FFFFFF'
                  }}
                >
                  Find Opponent
                </button>
              ) : pvpState === 'matched' ? (
                <button
                  onClick={rollPvPDice}
                  className="w-full py-4 rounded-xl font-bold text-base transition-all hover:scale-105 active:scale-95"
                  style={{ backgroundColor: '#22C55E', color: '#000' }}
                >
                  ROLL DICE
                </button>
              ) : pvpState === 'matching' ? (
                <button
                  disabled
                  className="w-full py-4 rounded-xl font-bold text-base opacity-50"
                  style={{ backgroundColor: '#FBBF24', color: '#000' }}
                >
                  Finding Opponent...
                </button>
              ) : null}
            </>
          ) : (
            <>
              <button
                disabled={!betAmount || betAmount <= 0 || betAmount > gameBalance || betAmount < getMinStake() || betAmount > getMaxStake() || gameState === 'rolling' || gameState === 'result' || gameState === 'distributing' || hasJoined}
                className="w-full py-4 rounded-xl font-bold text-base transition-all hover:scale-105 disabled:opacity-50 active:scale-95"
                style={{
                  backgroundColor: betAmount && gameState !== 'rolling' && gameState !== 'result' && gameState !== 'distributing' && !hasJoined && betAmount >= getMinStake() && betAmount <= getMaxStake() && betAmount <= gameBalance ? (gameMode === 'boss' ? '#FBBF24' : '#3B82F6') : '#374151',
                  color: gameMode === 'boss' && betAmount && gameState !== 'rolling' && gameState !== 'result' && gameState !== 'distributing' && !hasJoined && betAmount >= getMinStake() && betAmount <= getMaxStake() && betAmount <= gameBalance ? '#000' : '#FFFFFF'
                }}
                onClick={joinRound}
              >
                {hasJoined ? '✓ BET PLACED' : 'JOIN ROUND'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* CHAT MODAL */}
      {showChat && (
        <div className="fixed inset-0 bg-black/90 flex items-end justify-center z-50 animate-fadeIn" onClick={() => setShowChat(false)}>
          <div 
            className="w-full max-w-md rounded-t-3xl p-6 animate-slideUp max-h-[70vh] flex flex-col" 
            style={{ 
              backgroundColor: '#1F2530',
              border: '1px solid rgba(42, 58, 90, 0.3)',
              boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.7)'
            }} 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: '#FFFFFF' }}>
                <MessageCircle className="w-5 h-5" style={{ color: '#3B82F6' }} />
                <span>Chat</span>
              </h3>
              <button onClick={() => setShowChat(false)} className="text-2xl" style={{ color: '#9CA3AF' }}>×</button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-2 mb-3">
              {chatMessages.map((msg, index) => (
                <div key={index} className="animate-fadeIn">
                  {msg.type === 'system' ? (
                    <p className="text-xs text-center py-1.5 px-2 rounded-lg" style={{ backgroundColor: '#1F2937', color: '#9CA3AF' }}>
                      {msg.text}
                    </p>
                  ) : (
                    <div className="flex gap-2">
                      <span className="text-xs font-semibold" style={{ color: '#3B82F6' }}>
                        {msg.username}:
                      </span>
                      <span className="text-xs" style={{ color: '#FFFFFF' }}>
                        {msg.text}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type message..."
                className="flex-1 px-3 py-2 border-2 rounded-xl text-sm"
                style={{ 
                  borderColor: 'rgba(42, 58, 90, 0.3)', 
                  color: '#FFFFFF',
                  backgroundColor: '#121A2B'
                }}
              />
              <button
                onClick={sendMessage}
                className="p-2 rounded-xl transition-all hover:scale-105 active:scale-95"
                style={{ backgroundColor: '#3B82F6' }}
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROVABLY FAIR MODAL */}
      {showProvablyFair && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fadeIn" onClick={() => setShowProvablyFair(false)}>
          <div className="rounded-2xl shadow-xl max-w-md w-full p-6 animate-scaleIn" style={{ 
            backgroundColor: '#1F2530',
            border: '1px solid rgba(42, 58, 90, 0.3)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.7)'
          }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-8 h-8" style={{ color: '#22C55E' }} />
              <h2 className="text-xl font-bold" style={{ color: '#FFFFFF' }}>
                Provably Fair System
              </h2>
            </div>
            <div className="space-y-3 mb-5">
              <p className="text-sm" style={{ color: '#9CA3AF' }}>
                Our game uses cryptographic algorithms to ensure complete fairness and transparency.
              </p>
              <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                <p className="text-xs font-bold mb-1" style={{ color: '#22C55E' }}>Round Hash</p>
                <p className="text-xs font-mono break-all" style={{ color: '#9CA3AF' }}>
                  a7f3e9d2c1b4...8e6f2a
                </p>
              </div>
              <p className="text-sm" style={{ color: '#9CA3AF' }}>
                • All results are pre-determined and encrypted
              </p>
              <p className="text-sm" style={{ color: '#9CA3AF' }}>
                • Verify round integrity after completion
              </p>
              <p className="text-sm" style={{ color: '#9CA3AF' }}>
                • 100% transparent and auditable
              </p>
            </div>
            <button
              onClick={() => setShowProvablyFair(false)}
              className="w-full py-3 rounded-xl text-white font-semibold transition-all hover:scale-105"
              style={{ backgroundColor: '#22C55E' }}
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* RESULT OVERLAY PANEL */}
      {gameMode !== 'pvp' && (gameState === 'result' || gameState === 'distributing') && hasJoined && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 animate-fadeIn">
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(50)].map((_, i) => (
                <div
                  key={i}
                  className="absolute"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: '-10px',
                    animation: `fall ${2 + Math.random() * 3}s linear infinite`,
                    animationDelay: `${Math.random() * 2}s`,
                    fontSize: '24px'
                  }}
                >
                  {['🎉', '🎊', '⭐', '✨', '🏆'][Math.floor(Math.random() * 5)]}
                </div>
              ))}
            </div>
          )}
          
          <div className="rounded-2xl shadow-2xl max-w-md w-full p-8 text-center relative z-10 animate-scaleIn" style={{ 
            backgroundColor: '#1F2530',
            border: '1px solid rgba(42, 58, 90, 0.3)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.7)'
          }}>
            <div className="text-6xl mb-4 animate-bounce">
              {isWinner ? (myRank === 1 ? '👑' : '🏆') : '😔'}
            </div>
            
            <h2 className="text-3xl font-bold mb-2 transition-all" style={{ 
              color: isWinner ? (myRank === 1 ? '#FBBF24' : '#22C55E') : '#FFFFFF',
              textShadow: isWinner ? `0 0 20px ${myRank === 1 ? 'rgba(251, 191, 36, 0.6)' : 'rgba(34, 197, 94, 0.6)'}` : 'none'
            }}>
              {isWinner ? (myRank === 1 ? '1ST PLACE!' : 'You Won!') : 'Better Luck Next Time'}
            </h2>
            
            {gameMode === 'boss' && (
              <div className="my-6">
                <p className="text-sm mb-3" style={{ color: '#9CA3AF' }}>Boss Round Winners</p>
                <div className="space-y-2">
                  {leaderboard.slice(0, 3).map((player, idx) => {
                    const rank = idx + 1;
                    const jackpot = totalPool * 1.5;
                    const payout = rank === 1 ? jackpot * 0.6 : rank === 2 ? jackpot * 0.25 : jackpot * 0.15;
                    
                    return (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-xl" style={{ 
                        backgroundColor: rank === 1 ? 'rgba(251, 191, 36, 0.2)' : '#1F2937',
                        border: rank === 1 ? '2px solid #FBBF24' : 'none'
                      }}>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ 
                            backgroundColor: rank === 1 ? '#FBBF24' : rank === 2 ? '#C0C0C0' : '#CD7F32',
                            color: '#000'
                          }}>
                            {rank}
                          </div>
                          <span className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>
                            {player.username}
                          </span>
                        </div>
                        <span className="text-sm font-bold" style={{ color: rank === 1 ? '#FBBF24' : '#22C55E' }}>
                          {formatCurrency(payout, true)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mb-4 p-3 rounded-xl" style={{ backgroundColor: isWinner ? 'rgba(34, 197, 94, 0.15)' : '#1F2937' }}>
              <p className="text-sm mb-1" style={{ color: '#9CA3AF' }}>Your Score</p>
              <p className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>
                {myFinalRoll}
              </p>
              <p className="text-sm" style={{ color: '#9CA3AF' }}>
                Rank: #{myRank}
              </p>
              {isWinner && (
                <p className="text-sm mt-2 font-bold" style={{ color: '#22C55E' }}>
                  {gameMode === 'boss' ? `Top 3 Winner! 🎉` : `Top 20 Winner! 🎉`}
                </p>
              )}
            </div>

            <button
              onClick={playAgain}
              className="w-full py-4 rounded-xl text-white font-bold text-lg transition-all hover:scale-105"
              style={{ backgroundColor: isWinner && myRank === 1 ? '#FBBF24' : isWinner ? '#22C55E' : '#3B82F6' }}
            >
              Play Again
            </button>
          </div>
        </div>
      )}

      {/* Rules Modal */}
      {showRules && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fadeIn" onClick={() => setShowRules(false)}>
          <div className="rounded-2xl shadow-xl max-w-md w-full p-6 animate-scaleIn" style={{ 
            backgroundColor: '#1F2530',
            border: '1px solid rgba(42, 58, 90, 0.3)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.7)'
          }} onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4" style={{ color: '#FFFFFF' }}>
              Dice Pool Rules
            </h2>
            <div className="space-y-3 mb-5">
              <p className="text-sm" style={{ color: '#9CA3AF' }}>
                <strong style={{ color: '#3B82F6' }}>🎲 Classic Mode:</strong> Top 20 highest rolls split the entire pool evenly. Stakes: $1-$50
              </p>
              <p className="text-sm" style={{ color: '#9CA3AF' }}>
                <strong style={{ color: '#EF4444' }}>⚔️ PvP Mode:</strong> 1v1 battle. Highest roll wins 96% of the pot (4% platform fee). Stakes: $5-$100
              </p>
              <p className="text-sm" style={{ color: '#9CA3AF' }}>
                <strong style={{ color: '#FBBF24' }}>👑 Boss Mode:</strong> Top 3 winners split jackpot (60% / 25% / 15%). Stakes: $10-$200
              </p>
              <p className="text-sm" style={{ color: '#9CA3AF' }}>
                • Each player gets a random number between 1-50
              </p>
              <p className="text-sm" style={{ color: '#9CA3AF' }}>
                • Place your bet before countdown ends (30 seconds)
              </p>
            </div>
            <button
              onClick={() => setShowRules(false)}
              className="w-full py-3 rounded-xl text-white font-semibold transition-all hover:scale-105"
              style={{ backgroundColor: '#3B82F6' }}
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-2px) translateY(2px); }
          50% { transform: translateX(2px) translateY(-2px); }
          75% { transform: translateX(-2px) translateY(-2px); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.5s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        
        .animate-shake {
          animation: shake 0.3s ease-in-out infinite;
        }
      `}</style>

      <GameFooter />
    </div>
  );
}
