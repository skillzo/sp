import { Trophy, Lock, TrendingUp, Info, Copy, Circle, BarChart3, MessageCircle, Target, Clock, Send, Zap, Award, Users, CheckCircle, ArrowRight, X } from 'lucide-react';
import { TopBar } from '../components/TopBar';
import { BackButton } from '../components/BackButton';
import { useUser } from '../context/UserContext';
import { Link, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { GameFooter } from '../components/GameFooter';

interface UserPrediction {
  matchId: number;
  userChoice: string;
  aiSuggestion: string;
  followedAI: boolean;
  timestamp: Date;
  result?: 'pending' | 'won' | 'lost';
  actualOutcome?: string;
}

export function Predictions() {
  const { isVIP, formatCurrency, updateGameBalance } = useUser();
  const navigate = useNavigate();
  const [showInfo, setShowInfo] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState<'predictions' | 'chat' | 'challenge' | 'leaderboard'>('predictions');
  const [chatMessage, setChatMessage] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showChallengeDetail, setShowChallengeDetail] = useState<number | null>(null);
  const [showPredictionModal, setShowPredictionModal] = useState<number | null>(null);
  
  // User predictions tracking
  const [userPredictions, setUserPredictions] = useState<UserPrediction[]>([]);
  
  // Challenge state management
  const [challengeStates, setChallengeStates] = useState({
    daily: { progress: 0, completed: false, claimed: false },
    weekly: { progress: 0, completed: false, claimed: false },
    streak: { progress: 0, completed: false, claimed: false }
  });

  // Stats tracking
  const [userStats, setUserStats] = useState({
    totalPredictions: 0,
    correctPredictions: 0,
    followedAI: 0,
    accuracy: 0,
    aiFollowAccuracy: 0
  });

  // Separate timers for each challenge
  const [dailyTimer, setDailyTimer] = useState({ hours: 23, minutes: 45, seconds: 30 });
  const [weeklyTimer, setWeeklyTimer] = useState({ days: 6, hours: 12, minutes: 30, seconds: 15 });

  // Daily challenge countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setDailyTimer(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { hours: prev.hours, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        setChallengeStates(states => ({
          ...states,
          daily: { progress: 0, completed: false, claimed: false }
        }));
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Weekly challenge countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setWeeklyTimer(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        setChallengeStates(states => ({
          ...states,
          weekly: { progress: 0, completed: false, claimed: false }
        }));
        return { days: 7, hours: 0, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const predictions = [
    {
      id: 1,
      match: 'Arsenal vs Chelsea',
      team1: 'Arsenal',
      team2: 'Chelsea',
      aiPrediction: 'Arsenal Win',
      confidence: 78,
      risk: 'Medium',
      status: 'upcoming' as const,
      score: null,
      date: 'April 10, 2026 - 15:00',
      reasoning: 'Arsenal won 4 of last 5 home games. Chelsea has 3 key injuries. Head-to-head stats favor Arsenal at home (70% win rate).',
      league: 'Premier League',
      possibleOutcomes: ['Arsenal Win', 'Draw', 'Chelsea Win', 'Over 2.5 Goals', 'Under 2.5 Goals', 'Both Teams to Score']
    },
    {
      id: 2,
      match: 'Manchester United vs Liverpool',
      team1: 'Man United',
      team2: 'Liverpool',
      aiPrediction: 'Over 2.5 Goals',
      confidence: 85,
      risk: 'Low',
      status: 'live' as const,
      score: '2-1',
      date: 'April 10, 2026 - 12:30',
      reasoning: 'Both teams average 3+ goals in last 5 matches. Historical data shows 82% of their meetings have 3+ goals.',
      league: 'Premier League',
      possibleOutcomes: ['Man United Win', 'Draw', 'Liverpool Win', 'Over 2.5 Goals', 'Under 2.5 Goals', 'Both Teams to Score']
    },
    {
      id: 3,
      match: 'Real Madrid vs Barcelona',
      team1: 'Real Madrid',
      team2: 'Barcelona',
      aiPrediction: 'Real Madrid Win',
      confidence: 72,
      risk: 'Medium',
      status: 'ht' as const,
      score: '1-0',
      date: 'April 11, 2026 - 20:00',
      reasoning: 'Real Madrid unbeaten at home this season. Barcelona missing 2 key defenders.',
      league: 'La Liga',
      possibleOutcomes: ['Real Madrid Win', 'Draw', 'Barcelona Win', 'Over 2.5 Goals', 'Under 2.5 Goals', 'Both Teams to Score']
    },
    {
      id: 4,
      match: 'Bayern Munich vs Dortmund',
      team1: 'Bayern',
      team2: 'Dortmund',
      aiPrediction: 'Both Teams to Score',
      confidence: 92,
      risk: 'Low',
      status: 'upcoming' as const,
      score: null,
      date: 'April 11, 2026 - 17:30',
      reasoning: 'Both teams scored in last 8 consecutive meetings.',
      league: 'Bundesliga',
      possibleOutcomes: ['Bayern Win', 'Draw', 'Dortmund Win', 'Over 2.5 Goals', 'Under 2.5 Goals', 'Both Teams to Score']
    },
  ];

  const challenges = [
    {
      id: 1,
      type: 'daily' as const,
      title: 'Daily Prediction Challenge',
      goal: 'Get 1 prediction correct today',
      description: 'Make your own prediction and get it correct to earn your daily reward. Your choice, your challenge!',
      rules: [
        'Make your own prediction (can differ from AI suggestion)',
        'Only correct USER predictions count toward progress',
        'One correct prediction = challenge complete',
        'Challenge resets every 24 hours',
        'Rewards must be claimed before reset'
      ],
      progress: challengeStates.daily.progress,
      total: 1,
      reward: 0.50,
      icon: '🎯',
      color: '#0A84FF',
      completed: challengeStates.daily.completed,
      claimed: challengeStates.daily.claimed
    },
    {
      id: 2,
      type: 'weekly' as const,
      title: 'Weekly Prediction Challenge',
      goal: 'Get 5 predictions correct this week',
      description: 'Complete 5 correct predictions throughout the week. Build your winning record!',
      rules: [
        'Make your own predictions',
        'Only correct predictions count',
        'Progress carries through the week',
        'Challenge resets every Monday',
        'AI suggestions are guidance only'
      ],
      progress: challengeStates.weekly.progress,
      total: 5,
      reward: 2.50,
      icon: '📅',
      color: '#FFD700',
      completed: challengeStates.weekly.completed,
      claimed: challengeStates.weekly.claimed
    },
    {
      id: 3,
      type: 'streak' as const,
      title: 'Win Streak',
      goal: 'Win 3 predictions in a row',
      description: 'Build a winning streak! Get 3 consecutive predictions correct. One wrong breaks the streak!',
      rules: [
        'Must be consecutive correct predictions',
        'Based on YOUR predictions, not AI',
        'One wrong prediction resets progress to 0',
        'Can be completed multiple times',
        'Proves your prediction skills'
      ],
      progress: challengeStates.streak.progress,
      total: 3,
      reward: 1.50,
      icon: '🔥',
      color: '#EF4444',
      completed: challengeStates.streak.completed,
      claimed: challengeStates.streak.claimed
    }
  ];

  // Make user prediction
  const makeUserPrediction = (matchId: number, userChoice: string) => {
    const match = predictions.find(p => p.id === matchId);
    if (!match) return;

    const prediction: UserPrediction = {
      matchId,
      userChoice,
      aiSuggestion: match.aiPrediction,
      followedAI: userChoice === match.aiPrediction,
      timestamp: new Date(),
      result: 'pending'
    };

    setUserPredictions([...userPredictions, prediction]);
    setShowPredictionModal(null);
    toast.success(`Prediction placed: ${userChoice}!`);
    
    // Simulate match result after 3 seconds (for demo)
    setTimeout(() => {
      simulateMatchResult(matchId, userChoice);
    }, 3000);
  };

  // Simulate match result and check if user was correct
  const simulateMatchResult = (matchId: number, userChoice: string) => {
    const match = predictions.find(p => p.id === matchId);
    if (!match) return;

    // Random outcome from possible outcomes (70% chance to match AI prediction for realism)
    const actualOutcome = Math.random() < 0.7 
      ? match.aiPrediction 
      : match.possibleOutcomes[Math.floor(Math.random() * match.possibleOutcomes.length)];

    const isCorrect = userChoice === actualOutcome;

    // Update prediction result
    setUserPredictions(prev => prev.map(p => 
      p.matchId === matchId && p.result === 'pending'
        ? { ...p, result: isCorrect ? 'won' : 'lost', actualOutcome }
        : p
    ));

    // Update stats
    setUserStats(prev => {
      const total = prev.totalPredictions + 1;
      const correct = prev.correctPredictions + (isCorrect ? 1 : 0);
      const followed = prev.followedAI + (userChoice === match.aiPrediction ? 1 : 0);
      
      return {
        totalPredictions: total,
        correctPredictions: correct,
        followedAI: followed,
        accuracy: Math.round((correct / total) * 100),
        aiFollowAccuracy: followed > 0 ? Math.round((correct / followed) * 100) : 0
      };
    });

    if (isCorrect) {
      // Update daily challenge
      if (challengeStates.daily.progress < 1) {
        const newProgress = challengeStates.daily.progress + 1;
        setChallengeStates(prev => ({
          ...prev,
          daily: {
            progress: newProgress,
            completed: newProgress >= 1,
            claimed: false
          }
        }));
        toast.success('🎯 Daily Challenge progress updated!');
        if (newProgress >= 1) {
          toast.success('🎉 Daily Challenge completed!');
        }
      }

      // Update weekly challenge
      if (challengeStates.weekly.progress < 5) {
        const newProgress = challengeStates.weekly.progress + 1;
        setChallengeStates(prev => ({
          ...prev,
          weekly: {
            progress: newProgress,
            completed: newProgress >= 5,
            claimed: false
          }
        }));
        if (newProgress >= 5) {
          toast.success('📅 Weekly Challenge completed!');
        }
      }

      // Update streak challenge
      if (challengeStates.streak.progress < 3) {
        const newProgress = challengeStates.streak.progress + 1;
        setChallengeStates(prev => ({
          ...prev,
          streak: {
            progress: newProgress,
            completed: newProgress >= 3,
            claimed: false
          }
        }));
        if (newProgress >= 3) {
          toast.success('🔥 Win Streak Challenge completed!');
        }
      }

      toast.success(`✅ Correct! Outcome: ${actualOutcome}`);
    } else {
      // Break streak on incorrect prediction
      if (challengeStates.streak.progress > 0) {
        setChallengeStates(prev => ({
          ...prev,
          streak: { progress: 0, completed: false, claimed: false }
        }));
        toast.error('💔 Streak broken!');
      }
      toast.error(`❌ Incorrect. Outcome: ${actualOutcome}`);
    }
  };

  // Claim challenge reward
  const claimReward = (challengeType: 'daily' | 'weekly' | 'streak', reward: number) => {
    const challenge = challengeStates[challengeType];
    
    if (!challenge.completed) {
      toast.error('Complete the challenge first!');
      return;
    }
    
    if (challenge.claimed) {
      toast.error('Reward already claimed!');
      return;
    }

    updateGameBalance(reward);
    
    setChallengeStates(prev => ({
      ...prev,
      [challengeType]: { ...prev[challengeType], claimed: true }
    }));

    toast.success(`🎉 Claimed ${formatCurrency(reward, true)}!`);
  };

  const aiPerformance = {
    winRate: 78,
    totalPredictions: 156,
    wins: 122,
    losses: 34,
    currentStreak: 8,
    pastPredictions: [
      { match: 'PSG vs Lyon', prediction: 'PSG Win', result: 'Won', date: 'Apr 7', confidence: 82 },
      { match: 'Juventus vs AC Milan', prediction: 'Over 2.5', result: 'Won', date: 'Apr 6', confidence: 75 },
      { match: 'Atletico vs Sevilla', prediction: 'Draw', result: 'Lost', date: 'Apr 5', confidence: 68 },
      { match: 'Inter vs Napoli', prediction: 'Inter Win', result: 'Won', date: 'Apr 4', confidence: 88 },
      { match: 'Porto vs Benfica', prediction: 'BTTS', result: 'Won', date: 'Apr 3', confidence: 79 },
    ]
  };

  const leaderboard = [
    { rank: 1, username: 'BetKing_Pro', score: 2450, accuracy: 92, isCurrentUser: false },
    { rank: 2, username: 'FootballGuru', score: 2180, accuracy: 89, isCurrentUser: false },
    { rank: 3, username: 'You', score: 1950, accuracy: userStats.accuracy || 85, isCurrentUser: true },
    { rank: 4, username: 'GoalHunter', score: 1820, accuracy: 83, isCurrentUser: false },
    { rank: 5, username: 'ScorePredictor', score: 1650, accuracy: 80, isCurrentUser: false },
  ];

  const liveMatches = predictions.filter(p => p.status === 'live' || p.status === 'ht');

  const [chatMessages, setChatMessages] = useState([
    { id: 1, user: 'Sarah_K', message: 'What do you think about Arsenal vs Chelsea?', time: '2m ago', avatar: '👩' },
    { id: 2, user: 'Mike_87', message: 'Arsenal looks strong at home!', time: '1m ago', avatar: '👨' },
    { id: 3, user: 'You', message: 'I agree! Going with Arsenal Win', time: 'Just now', avatar: '👤', isOwn: true },
  ]);

  const copyPrediction = (prediction: string, match: string, confidence: number) => {
    const text = `⚽ ${match}\n📊 AI Prediction: ${prediction}\n🎯 AI Confidence: ${confidence}%\n🤖 Powered by AI Analysis`;
    navigator.clipboard.writeText(text);
    toast.success('AI prediction copied to clipboard!');
  };

  const getRiskColor = (risk: string) => {
    const colors = {
      Low: '#34D399',
      Medium: '#F59E0B',
      High: '#EF4444'
    };
    return colors[risk as keyof typeof colors] || '#6B7280';
  };

  const getStatusBadge = (status: 'live' | 'upcoming' | 'ht' | 'ft', score: string | null) => {
    const badges = {
      live: { text: 'LIVE', bg: '#EF4444', pulse: true },
      ht: { text: 'HT', bg: '#F59E0B', pulse: false },
      ft: { text: 'FT', bg: '#6B7280', pulse: false },
      upcoming: { text: 'Upcoming', bg: '#0A84FF', pulse: false }
    };
    const badge = badges[status];
    
    return (
      <div className="flex items-center gap-2">
        <span 
          className="text-xs px-2 py-1 rounded-full text-white font-medium flex items-center gap-1" 
          style={{ backgroundColor: badge.bg }}
        >
          {badge.pulse && <Circle className="w-2 h-2 fill-white animate-pulse" />}
          {badge.text}
        </span>
        {score && (
          <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
            {score}
          </span>
        )}
      </div>
    );
  };

  const sendMessage = () => {
    if (!chatMessage.trim()) return;
    
    const newMessage = {
      id: chatMessages.length + 1,
      user: 'You',
      message: chatMessage,
      time: 'Just now',
      avatar: '👤',
      isOwn: true
    };
    
    setChatMessages([...chatMessages, newMessage]);
    setChatMessage('');
    toast.success('Message sent!');
  };

  const getUserPredictionForMatch = (matchId: number) => {
    return userPredictions.find(p => p.matchId === matchId);
  };

  if (!isVIP) {
    return (
      <div className="min-h-screen overflow-y-auto" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <TopBar />

        <div className="w-full max-w-[480px] md:max-w-[768px] lg:max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8">
          <BackButton />
          
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8" style={{ color: '#0A84FF' }} />
              <div>
                <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                  AI Football Predictions
                </h1>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  3 free predictions daily • Upgrade for unlimited access
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setActiveSection('predictions')}
                className="px-4 py-2 rounded-lg font-medium text-sm transition-all"
                style={{
                  backgroundColor: activeSection === 'predictions' ? '#0A84FF' : 'var(--bg-card)',
                  color: activeSection === 'predictions' ? 'white' : 'var(--text-primary)'
                }}
              >
                📊 Predictions
              </button>
              
              <button
                onClick={() => setActiveSection('challenge')}
                className="px-4 py-2 rounded-lg font-medium text-sm transition-all"
                style={{
                  backgroundColor: activeSection === 'challenge' ? '#0A84FF' : 'var(--bg-card)',
                  color: activeSection === 'challenge' ? 'white' : 'var(--text-primary)'
                }}
              >
                🎯 Challenge
              </button>

              <button
                onClick={() => setActiveSection('chat')}
                className="px-4 py-2 rounded-lg font-medium text-sm transition-all relative"
                style={{
                  backgroundColor: activeSection === 'chat' ? '#0A84FF' : 'var(--bg-card)',
                  color: activeSection === 'chat' ? 'white' : 'var(--text-primary)'
                }}
              >
                💬 Chat
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center" style={{ backgroundColor: '#EF4444', color: 'white' }}>3</span>
              </button>

              <button
                disabled
                className="px-4 py-2 rounded-lg font-medium text-sm cursor-not-allowed opacity-50"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-secondary)'
                }}
              >
                🏆 Leaderboard
              </button>
            </div>
          </div>

          {activeSection === 'predictions' && (
            <div className="space-y-6">
              <div className="rounded-lg shadow-sm p-4" style={{ backgroundColor: 'rgba(10, 132, 255, 0.1)', border: '1px solid #0A84FF' }}>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <Info className="w-5 h-5" style={{ color: '#0A84FF' }} />
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      You have <strong>3 free predictions</strong> today. Upgrade to VIP for unlimited access!
                    </p>
                  </div>
                  <Link to="/upgrade">
                    <button className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: '#0A84FF' }}>
                      Upgrade
                    </button>
                  </Link>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  ⚽ Today's AI Predictions
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {predictions.map((pred, index) => {
                    const isFree = index < 3;
                    
                    return (
                      <div
                        key={pred.id}
                        className="rounded-lg shadow-sm p-5 relative"
                        style={{ 
                          backgroundColor: 'var(--bg-card)',
                          opacity: isFree ? 1 : 0.6,
                          cursor: isFree ? 'default' : 'pointer'
                        }}
                        onClick={() => !isFree && setShowUpgradeModal(true)}
                      >
                        {!isFree && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-lg backdrop-blur-sm z-10">
                            <div className="text-center">
                              <Lock className="w-12 h-12 mx-auto mb-2" style={{ color: '#EF4444' }} />
                              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                                Upgrade to VIP to unlock
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                              {pred.match}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{pred.league}</p>
                              {isFree && getStatusBadge(pred.status, pred.score)}
                            </div>
                          </div>
                          {isFree && (
                            <button
                              onClick={() => setShowInfo(showInfo === pred.id ? null : pred.id)}
                              className="p-2 rounded-full transition-colors"
                              style={{ backgroundColor: showInfo === pred.id ? '#0A84FF' : 'var(--bg-accent)' }}
                            >
                              <Info className="w-4 h-4" style={{ color: showInfo === pred.id ? 'white' : '#0A84FF' }} />
                            </button>
                          )}
                        </div>

                        {isFree && showInfo === pred.id && (
                          <div className="mb-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-accent)' }}>
                            <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                              📊 AI Analysis:
                            </p>
                            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                              {pred.reasoning}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>AI Suggestion</p>
                            <p className="font-semibold" style={{ color: isFree ? '#0A84FF' : 'var(--text-secondary)' }}>
                              {isFree ? pred.aiPrediction : '???'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Confidence</p>
                            <p className="text-2xl font-bold" style={{ color: isFree ? getRiskColor(pred.risk) : 'var(--text-secondary)' }}>
                              {isFree ? `${pred.confidence}%` : '--'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mb-3">
                          {isFree ? (
                            <span 
                              className="text-xs px-3 py-1 rounded-full font-medium"
                              style={{ backgroundColor: `${getRiskColor(pred.risk)}20`, color: getRiskColor(pred.risk) }}
                            >
                              {pred.risk} Risk
                            </span>
                          ) : (
                            <span 
                              className="text-xs px-3 py-1 rounded-full font-medium"
                              style={{ backgroundColor: 'var(--bg-accent)', color: 'var(--text-secondary)' }}
                            >
                              Locked
                            </span>
                          )}
                          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{pred.date}</p>
                        </div>

                        {isFree ? (
                          <button
                            onClick={() => copyPrediction(pred.aiPrediction, pred.match, pred.confidence)}
                            className="w-full py-2 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95"
                            style={{ backgroundColor: 'var(--bg-accent)', color: 'var(--text-primary)' }}
                          >
                            <Copy className="w-4 h-4" />
                            <span className="text-sm font-medium">Copy AI Prediction</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => setShowUpgradeModal(true)}
                            className="w-full py-2 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95"
                            style={{ backgroundColor: '#0A84FF', color: 'white' }}
                          >
                            <Lock className="w-4 h-4" />
                            <span className="text-sm font-medium">Unlock with VIP</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-lg shadow-sm p-6 text-center" style={{ backgroundColor: 'var(--bg-card)' }}>
                <Trophy className="w-16 h-16 mx-auto mb-4" style={{ color: '#FFD700' }} />
                <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Unlock Unlimited AI Predictions
                </h3>
                <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                  Upgrade to VIP and get access to all predictions, challenges, and leaderboards!
                </p>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-accent)' }}>
                    <p className="text-2xl mb-1">∞</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Unlimited Predictions</p>
                  </div>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-accent)' }}>
                    <p className="text-2xl mb-1">🎯</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Challenges</p>
                  </div>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-accent)' }}>
                    <p className="text-2xl mb-1">📊</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Analytics</p>
                  </div>
                </div>
                <Link to="/upgrade">
                  <button
                    className="px-8 py-3 rounded-lg text-white font-medium text-lg transition-transform active:scale-95"
                    style={{ backgroundColor: '#FFD700' }}
                  >
                    Upgrade to VIP Now
                  </button>
                </Link>
              </div>
            </div>
          )}

          {activeSection === 'chat' && (
            <div className="rounded-lg shadow-sm p-6" style={{ backgroundColor: 'var(--bg-card)', minHeight: '600px' }}>
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="w-6 h-6" style={{ color: '#0A84FF' }} />
                <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Football Chat
                </h2>
                <div className="ml-auto flex items-center gap-2">
                  <Users className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>127 online</span>
                </div>
              </div>

              <div className="space-y-3 mb-4" style={{ maxHeight: '450px', overflowY: 'auto' }}>
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.isOwn ? 'flex-row-reverse' : ''}`}
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: msg.isOwn ? '#0A84FF' : 'var(--bg-accent)' }}>
                      <span>{msg.avatar}</span>
                    </div>
                    <div className={`flex-1 max-w-[70%] ${msg.isOwn ? 'items-end' : ''}`}>
                      {!msg.isOwn && (
                        <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                          {msg.user}
                        </p>
                      )}
                      <div
                        className="p-3 rounded-lg"
                        style={{
                          backgroundColor: msg.isOwn ? '#0A84FF' : 'var(--bg-accent)',
                          color: msg.isOwn ? 'white' : 'var(--text-primary)'
                        }}
                      >
                        <p className="text-sm">{msg.message}</p>
                      </div>
                      <p className={`text-xs mt-1 ${msg.isOwn ? 'text-right' : ''}`} style={{ color: 'var(--text-secondary)' }}>
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 border rounded-lg"
                  style={{
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)',
                    backgroundColor: 'var(--bg-secondary)'
                  }}
                />
                <button
                  onClick={sendMessage}
                  className="px-6 py-3 rounded-lg text-white font-medium flex items-center gap-2 transition-transform active:scale-95"
                  style={{ backgroundColor: '#0A84FF' }}
                >
                  <Send className="w-4 h-4" />
                  Send
                </button>
              </div>
            </div>
          )}

          {activeSection === 'challenge' && (
            <div className="space-y-6">
              <div className="rounded-lg shadow-sm p-6" style={{ backgroundColor: 'var(--bg-card)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-6 h-6" style={{ color: '#0A84FF' }} />
                  <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Daily Prediction Challenge
                  </h2>
                </div>

                <div className="rounded-lg shadow-sm p-6 mb-4" style={{ backgroundColor: 'var(--bg-accent)' }}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">🎯</span>
                      <div>
                        <p className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {challenges[0].title}
                        </p>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {challenges[0].goal}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 mb-1">
                        <Zap className="w-5 h-5" style={{ color: '#FFD700' }} />
                        <span className="text-xl font-bold" style={{ color: '#FFD700' }}>
                          {formatCurrency(challenges[0].reward, true)}
                        </span>
                      </div>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Reward</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        Progress: {challenges[0].progress}/{challenges[0].total}
                      </span>
                      <span className="text-sm font-bold" style={{ color: challenges[0].color }}>
                        {Math.round((challenges[0].progress / challenges[0].total) * 100)}%
                      </span>
                    </div>
                    <div className="w-full h-4 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${(challenges[0].progress / challenges[0].total) * 100}%`,
                          backgroundColor: challenges[0].color
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg mb-4" style={{ backgroundColor: 'var(--bg-card)' }}>
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5" style={{ color: challenges[0].color }} />
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        Time Remaining
                      </span>
                    </div>
                    <span className="text-lg font-bold" style={{ color: challenges[0].color }}>
                      {dailyTimer.hours}h {dailyTimer.minutes}m {dailyTimer.seconds}s
                    </span>
                  </div>

                  <button
                    onClick={() => navigate('/predictions')}
                    className="w-full py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition-transform active:scale-95"
                    style={{ backgroundColor: '#0A84FF' }}
                  >
                    Start Predicting
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {challenges.slice(1).map((challenge) => (
                  <div
                    key={challenge.id}
                    className="rounded-lg shadow-sm p-6 mb-4 relative cursor-pointer opacity-60"
                    style={{ backgroundColor: 'var(--bg-accent)' }}
                    onClick={() => setShowUpgradeModal(true)}
                  >
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-lg backdrop-blur-sm z-10">
                      <div className="text-center">
                        <Lock className="w-10 h-10 mx-auto mb-2" style={{ color: '#EF4444' }} />
                        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                          VIP Only
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl">{challenge.icon}</span>
                        <div>
                          <p className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {challenge.title}
                          </p>
                          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {challenge.goal}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 mb-1">
                          <Zap className="w-5 h-5" style={{ color: '#FFD700' }} />
                          <span className="text-xl font-bold" style={{ color: '#FFD700' }}>
                            {formatCurrency(challenge.reward, true)}
                          </span>
                        </div>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Reward</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showUpgradeModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="rounded-2xl shadow-xl max-w-md w-full p-6" style={{ backgroundColor: 'var(--bg-card)' }}>
                <div className="text-center mb-6">
                  <Trophy className="w-16 h-16 mx-auto mb-4" style={{ color: '#FFD700' }} />
                  <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                    Upgrade to VIP
                  </h2>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Unlock all AI predictions, challenges, and exclusive rewards
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-accent)' }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#34D399' }}>
                      <span className="text-white">✓</span>
                    </div>
                    <p className="text-sm" style={{ color: 'var(--text-primary)' }}>Unlimited AI Predictions</p>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-accent)' }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#34D399' }}>
                      <span className="text-white">✓</span>
                    </div>
                    <p className="text-sm" style={{ color: 'var(--text-primary)' }}>All Challenges & Rewards</p>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-accent)' }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#34D399' }}>
                      <span className="text-white">✓</span>
                    </div>
                    <p className="text-sm" style={{ color: 'var(--text-primary)' }}>Leaderboard Access</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowUpgradeModal(false)}
                    className="flex-1 py-3 rounded-lg font-medium transition-all"
                    style={{ backgroundColor: 'var(--bg-accent)', color: 'var(--text-primary)' }}
                  >
                    Maybe Later
                  </button>
                  <Link to="/upgrade" className="flex-1">
                    <button
                      className="w-full py-3 rounded-lg text-white font-medium transition-transform active:scale-95"
                      style={{ backgroundColor: '#FFD700' }}
                    >
                      Upgrade Now
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // VIP USER VIEW - Continue in next file part due to length...
  return (
    <div className="min-h-screen overflow-y-auto" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <TopBar />
      <div className="w-full max-w-[480px] md:max-w-[768px] lg:max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8">
        <BackButton />
        
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8" style={{ color: '#0A84FF' }} />
            <div>
              <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                AI Football Predictions
              </h1>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Your Accuracy: {userStats.accuracy}% • AI Accuracy: 78%
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setActiveSection('predictions')}
              className="px-4 py-2 rounded-lg font-medium text-sm transition-all"
              style={{
                backgroundColor: activeSection === 'predictions' ? '#0A84FF' : 'var(--bg-card)',
                color: activeSection === 'predictions' ? 'white' : 'var(--text-primary)'
              }}
            >
              📊 Predictions
            </button>
            <button
              onClick={() => setActiveSection('chat')}
              className="px-4 py-2 rounded-lg font-medium text-sm transition-all relative"
              style={{
                backgroundColor: activeSection === 'chat' ? '#0A84FF' : 'var(--bg-card)',
                color: activeSection === 'chat' ? 'white' : 'var(--text-primary)'
              }}
            >
              💬 Chat
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center" style={{ backgroundColor: '#EF4444', color: 'white' }}>3</span>
            </button>
            <button
              onClick={() => setActiveSection('challenge')}
              className="px-4 py-2 rounded-lg font-medium text-sm transition-all"
              style={{
                backgroundColor: activeSection === 'challenge' ? '#0A84FF' : 'var(--bg-card)',
                color: activeSection === 'challenge' ? 'white' : 'var(--text-primary)'
              }}
            >
              🎯 Challenges
            </button>
            <button
              onClick={() => setActiveSection('leaderboard')}
              className="px-4 py-2 rounded-lg font-medium text-sm transition-all"
              style={{
                backgroundColor: activeSection === 'leaderboard' ? '#0A84FF' : 'var(--bg-card)',
                color: activeSection === 'leaderboard' ? 'white' : 'var(--text-primary)'
              }}
            >
              🏆 Leaderboard
            </button>
          </div>
        </div>

        {activeSection === 'predictions' && (
          <div className="space-y-6">
            {/* User Stats Dashboard */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-lg shadow-sm p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
                <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Your Accuracy</p>
                <p className="text-2xl font-bold" style={{ color: '#34D399' }}>{userStats.accuracy || 0}%</p>
              </div>
              <div className="rounded-lg shadow-sm p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
                <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Total Predictions</p>
                <p className="text-2xl font-bold" style={{ color: '#0A84FF' }}>{userStats.totalPredictions}</p>
              </div>
              <div className="rounded-lg shadow-sm p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
                <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Correct</p>
                <p className="text-2xl font-bold" style={{ color: '#34D399' }}>{userStats.correctPredictions}</p>
              </div>
              <div className="rounded-lg shadow-sm p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
                <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Current Streak</p>
                <p className="text-2xl font-bold" style={{ color: '#FFD700' }}>{challengeStates.streak.progress}</p>
              </div>
            </div>

            {liveMatches.length > 0 && (
              <div className="rounded-lg shadow-sm p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <Circle className="w-4 h-4 fill-red-500 text-red-500 animate-pulse" />
                  <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Live Matches
                  </h2>
                </div>
                <div className="space-y-2">
                  {liveMatches.map((match) => (
                    <div
                      key={match.id}
                      className="flex items-center justify-between p-3 rounded-lg"
                      style={{ backgroundColor: 'var(--bg-accent)' }}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                            {match.team1} vs {match.team2}
                          </p>
                          {getStatusBadge(match.status, match.score)}
                        </div>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{match.league}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>AI Suggests</p>
                        <p className="text-sm font-semibold" style={{ color: '#0A84FF' }}>{match.aiPrediction}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                🎯 Active Challenges
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {challenges.map((challenge) => (
                  <div
                    key={challenge.id}
                    onClick={() => setShowChallengeDetail(challenge.id)}
                    className="rounded-lg shadow-sm p-4 cursor-pointer transition-transform hover:scale-105"
                    style={{ backgroundColor: 'var(--bg-card)' }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{challenge.icon}</span>
                        <div>
                          <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                            {challenge.title}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                            {challenge.goal}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                          {challenge.progress}/{challenge.total}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          {Math.round((challenge.progress / challenge.total) * 100)}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-accent)' }}>
                        <div
                          className="h-full transition-all"
                          style={{
                            width: `${(challenge.progress / challenge.total) * 100}%`,
                            backgroundColor: challenge.color
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Zap className="w-4 h-4" style={{ color: '#FFD700' }} />
                        <span className="text-sm font-semibold" style={{ color: '#FFD700' }}>
                          {formatCurrency(challenge.reward, true)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" style={{ color: 'var(--text-secondary)' }} />
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          {challenge.type === 'daily' ? `${dailyTimer.hours}h ${dailyTimer.minutes}m` : `${weeklyTimer.days}d ${weeklyTimer.hours}h`}
                        </span>
                      </div>
                    </div>

                    {challenge.completed && !challenge.claimed && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          claimReward(challenge.type, challenge.reward);
                        }}
                        className="w-full mt-3 py-2 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition-transform active:scale-95"
                        style={{ backgroundColor: '#34D399' }}
                      >
                        <Zap className="w-4 h-4" />
                        Claim Reward
                      </button>
                    )}

                    {challenge.claimed && (
                      <div className="w-full mt-3 py-2 rounded-lg flex items-center justify-center gap-2" style={{ backgroundColor: 'var(--bg-accent)' }}>
                        <CheckCircle className="w-4 h-4" style={{ color: '#34D399' }} />
                        <span className="text-sm font-medium" style={{ color: '#34D399' }}>Claimed</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                ⚽ Today's AI Predictions
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {predictions.map((pred) => {
                  const userPred = getUserPredictionForMatch(pred.id);
                  
                  return (
                    <div
                      key={pred.id}
                      className="rounded-lg shadow-sm p-5"
                      style={{ backgroundColor: 'var(--bg-card)' }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                            {pred.match}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{pred.league}</p>
                            {getStatusBadge(pred.status, pred.score)}
                          </div>
                        </div>
                        <button
                          onClick={() => setShowInfo(showInfo === pred.id ? null : pred.id)}
                          className="p-2 rounded-full transition-colors"
                          style={{ backgroundColor: showInfo === pred.id ? '#0A84FF' : 'var(--bg-accent)' }}
                        >
                          <Info className="w-4 h-4" style={{ color: showInfo === pred.id ? 'white' : '#0A84FF' }} />
                        </button>
                      </div>

                      {showInfo === pred.id && (
                        <div className="mb-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-accent)' }}>
                          <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                            📊 AI Analysis:
                          </p>
                          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                            {pred.reasoning}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>AI Suggests</p>
                          <p className="font-semibold" style={{ color: '#0A84FF' }}>{pred.aiPrediction}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Confidence</p>
                          <div className="flex items-center gap-2">
                            <p className="text-2xl font-bold" style={{ color: getRiskColor(pred.risk) }}>
                              {pred.confidence}%
                            </p>
                          </div>
                        </div>
                      </div>

                      {userPred && (
                        <div className="mb-3 p-3 rounded-lg" style={{ 
                          backgroundColor: userPred.result === 'won' ? 'rgba(52, 211, 153, 0.1)' : userPred.result === 'lost' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(10, 132, 255, 0.1)',
                          border: `1px solid ${userPred.result === 'won' ? '#34D399' : userPred.result === 'lost' ? '#EF4444' : '#0A84FF'}`
                        }}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Your Prediction</p>
                              <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{userPred.userChoice}</p>
                              {userPred.followedAI && <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>✓ Followed AI</p>}
                            </div>
                            {userPred.result !== 'pending' && (
                              <div className="text-right">
                                <p className={`text-lg font-bold ${userPred.result === 'won' ? 'text-green-500' : 'text-red-500'}`}>
                                  {userPred.result === 'won' ? '✓ WON' : '✗ LOST'}
                                </p>
                                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Result: {userPred.actualOutcome}</p>
                              </div>
                            )}
                            {userPred.result === 'pending' && (
                              <p className="text-sm" style={{ color: '#0A84FF' }}>⏳ Pending</p>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between mb-3">
                        <span 
                          className="text-xs px-3 py-1 rounded-full font-medium"
                          style={{ backgroundColor: `${getRiskColor(pred.risk)}20`, color: getRiskColor(pred.risk) }}
                        >
                          {pred.risk} Risk
                        </span>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{pred.date}</p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => copyPrediction(pred.aiPrediction, pred.match, pred.confidence)}
                          className="flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95"
                          style={{ backgroundColor: 'var(--bg-accent)', color: 'var(--text-primary)' }}
                        >
                          <Copy className="w-4 h-4" />
                          <span className="text-sm font-medium">Copy</span>
                        </button>
                        {!userPred && (
                          <button
                            onClick={() => setShowPredictionModal(pred.id)}
                            className="flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95"
                            style={{ backgroundColor: '#0A84FF', color: 'white' }}
                          >
                            <Target className="w-4 h-4" />
                            <span className="text-sm font-medium">Make Prediction</span>
                          </button>
                        )}
                        {userPred && userPred.result === 'pending' && (
                          <div className="flex-1 py-2 rounded-lg flex items-center justify-center gap-2" style={{ backgroundColor: 'var(--bg-accent)' }}>
                            <Clock className="w-4 h-4" style={{ color: '#0A84FF' }} />
                            <span className="text-sm font-medium" style={{ color: '#0A84FF' }}>Pending Result</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* My Predictions History */}
            {userPredictions.length > 0 && (
              <div className="rounded-lg shadow-sm p-6" style={{ backgroundColor: 'var(--bg-card)' }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                  📊 My Prediction History
                </h3>
                <div className="space-y-2">
                  {userPredictions.slice().reverse().map((pred, idx) => {
                    const match = predictions.find(p => p.id === pred.matchId);
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-lg"
                        style={{ backgroundColor: 'var(--bg-accent)' }}
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                            {match?.match}
                          </p>
                          <div className="flex items-center gap-3">
                            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                              Your pick: <strong>{pred.userChoice}</strong>
                            </p>
                            {pred.followedAI && (
                              <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(10, 132, 255, 0.1)', color: '#0A84FF' }}>
                                Followed AI
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          {pred.result === 'won' && (
                            <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ backgroundColor: '#D1FAE5', color: '#34D399' }}>
                              ✓ WON
                            </span>
                          )}
                          {pred.result === 'lost' && (
                            <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ backgroundColor: '#FEE2E2', color: '#EF4444' }}>
                              ✗ LOST
                            </span>
                          )}
                          {pred.result === 'pending' && (
                            <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ backgroundColor: 'rgba(10, 132, 255, 0.1)', color: '#0A84FF' }}>
                              ⏳ Pending
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {activeSection === 'chat' && (
          <div className="rounded-lg shadow-sm p-6" style={{ backgroundColor: 'var(--bg-card)', minHeight: '600px' }}>
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="w-6 h-6" style={{ color: '#0A84FF' }} />
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Football Chat
              </h2>
              <div className="ml-auto flex items-center gap-2">
                <Users className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>127 online</span>
              </div>
            </div>

            <div className="space-y-3 mb-4" style={{ maxHeight: '450px', overflowY: 'auto' }}>
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.isOwn ? 'flex-row-reverse' : ''}`}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: msg.isOwn ? '#0A84FF' : 'var(--bg-accent)' }}>
                    <span>{msg.avatar}</span>
                  </div>
                  <div className={`flex-1 max-w-[70%] ${msg.isOwn ? 'items-end' : ''}`}>
                    {!msg.isOwn && (
                      <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                        {msg.user}
                      </p>
                    )}
                    <div
                      className="p-3 rounded-lg"
                      style={{
                        backgroundColor: msg.isOwn ? '#0A84FF' : 'var(--bg-accent)',
                        color: msg.isOwn ? 'white' : 'var(--text-primary)'
                      }}
                    >
                      <p className="text-sm">{msg.message}</p>
                    </div>
                    <p className={`text-xs mt-1 ${msg.isOwn ? 'text-right' : ''}`} style={{ color: 'var(--text-secondary)' }}>
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 border rounded-lg"
                style={{
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                  backgroundColor: 'var(--bg-secondary)'
                }}
              />
              <button
                onClick={sendMessage}
                className="px-6 py-3 rounded-lg text-white font-medium flex items-center gap-2 transition-transform active:scale-95"
                style={{ backgroundColor: '#0A84FF' }}
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </div>
          </div>
        )}

        {activeSection === 'challenge' && (
          <div className="space-y-6">
            {challenges.map((challenge) => (
              <div
                key={challenge.id}
                className="rounded-lg shadow-sm p-6"
                style={{ backgroundColor: 'var(--bg-card)' }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-5xl">{challenge.icon}</span>
                    <div>
                      <p className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                        {challenge.title}
                      </p>
                      <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                        {challenge.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-6 h-6" style={{ color: '#FFD700' }} />
                      <span className="text-3xl font-bold" style={{ color: '#FFD700' }}>
                        {formatCurrency(challenge.reward, true)}
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Reward</p>
                  </div>
                </div>

                <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-accent)' }}>
                  <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>📋 Rules:</p>
                  <ul className="space-y-1">
                    {challenge.rules.map((rule, idx) => (
                      <li key={idx} className="text-xs flex items-start gap-2" style={{ color: 'var(--text-secondary)' }}>
                        <span>•</span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      Progress: {challenge.progress}/{challenge.total}
                    </span>
                    <span className="text-lg font-bold" style={{ color: challenge.color }}>
                      {Math.round((challenge.progress / challenge.total) * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-6 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                    <div
                      className="h-full transition-all flex items-center justify-center text-white text-xs font-bold"
                      style={{
                        width: `${(challenge.progress / challenge.total) * 100}%`,
                        backgroundColor: challenge.color
                      }}
                    >
                      {challenge.progress > 0 && `${challenge.progress}/${challenge.total}`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg mb-4" style={{ backgroundColor: 'var(--bg-accent)' }}>
                  <div className="flex items-center gap-2">
                    <Clock className="w-6 h-6" style={{ color: challenge.color }} />
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      Time Remaining
                    </span>
                  </div>
                  <span className="text-xl font-bold" style={{ color: challenge.color }}>
                    {challenge.type === 'daily' 
                      ? `${dailyTimer.hours}h ${dailyTimer.minutes}m ${dailyTimer.seconds}s`
                      : challenge.type === 'weekly'
                      ? `${weeklyTimer.days}d ${weeklyTimer.hours}h ${weeklyTimer.minutes}m`
                      : 'Ongoing'
                    }
                  </span>
                </div>

                <div className="flex gap-3">
                  {!challenge.completed && (
                    <button
                      onClick={() => {
                        setActiveSection('predictions');
                        toast.info('Make YOUR predictions to complete this challenge!');
                      }}
                      className="flex-1 py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition-transform active:scale-95"
                      style={{ backgroundColor: challenge.color }}
                    >
                      Make Predictions
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  )}

                  {challenge.completed && !challenge.claimed && (
                    <button
                      onClick={() => claimReward(challenge.type, challenge.reward)}
                      className="flex-1 py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition-transform active:scale-95"
                      style={{ backgroundColor: '#34D399' }}
                    >
                      <Zap className="w-5 h-5" />
                      Claim {formatCurrency(challenge.reward, true)} Reward
                    </button>
                  )}

                  {challenge.claimed && (
                    <div className="flex-1 py-3 rounded-lg flex items-center justify-center gap-2" style={{ backgroundColor: 'var(--bg-accent)' }}>
                      <CheckCircle className="w-5 h-5" style={{ color: '#34D399' }} />
                      <span className="font-medium" style={{ color: '#34D399' }}>Reward Claimed!</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            <div className="rounded-lg shadow-sm p-4" style={{ backgroundColor: 'rgba(10, 132, 255, 0.1)', border: '1px solid #0A84FF' }}>
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                💡 <strong>Remember:</strong> Challenges are based on YOUR predictions, not AI suggestions. AI is here to guide you!
              </p>
            </div>
          </div>
        )}

        {activeSection === 'leaderboard' && (
          <div className="rounded-lg shadow-sm p-6" style={{ backgroundColor: 'var(--bg-card)' }}>
            <div className="flex items-center gap-2 mb-6">
              <Award className="w-6 h-6" style={{ color: '#FFD700' }} />
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Top Predictors Leaderboard
              </h2>
            </div>

            <div className="space-y-2">
              {leaderboard.map((user) => (
                <div
                  key={user.rank}
                  className="flex items-center justify-between p-4 rounded-lg transition-all"
                  style={{
                    backgroundColor: user.isCurrentUser ? 'rgba(10, 132, 255, 0.1)' : 'var(--bg-accent)',
                    border: user.isCurrentUser ? '2px solid #0A84FF' : 'none'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                      style={{
                        backgroundColor: user.rank <= 3 ? '#FFD700' : '#0A84FF',
                        color: 'white'
                      }}
                    >
                      {user.rank}
                    </div>
                    <div>
                      <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {user.username}
                        {user.isCurrentUser && <span className="text-xs ml-2 px-2 py-0.5 rounded-full" style={{ backgroundColor: '#0A84FF', color: 'white' }}>You</span>}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {user.accuracy}% accuracy
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold" style={{ color: user.rank <= 3 ? '#FFD700' : '#0A84FF' }}>
                      {user.score}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>points</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-lg text-center" style={{ backgroundColor: 'var(--bg-accent)' }}>
              <p className="text-sm mb-2" style={{ color: 'var(--text-primary)' }}>
                🏆 <strong>Weekly Prizes:</strong>
              </p>
              <div className="flex justify-center gap-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
                <span>🥇 1st: $20</span>
                <span>🥈 2nd: $10</span>
                <span>🥉 3rd: $5</span>
              </div>
            </div>
          </div>
        )}

        {/* Prediction Modal */}
        {showPredictionModal !== null && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="rounded-2xl shadow-xl max-w-md w-full p-6" style={{ backgroundColor: 'var(--bg-card)' }}>
              {(() => {
                const match = predictions.find(p => p.id === showPredictionModal);
                if (!match) return null;

                return (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        Make Your Prediction
                      </h3>
                      <button
                        onClick={() => setShowPredictionModal(null)}
                        className="p-2 rounded-full transition-colors"
                        style={{ backgroundColor: 'var(--bg-accent)' }}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-accent)' }}>
                      <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{match.match}</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{match.league} • {match.date}</p>
                    </div>

                    <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(10, 132, 255, 0.1)', border: '1px solid #0A84FF' }}>
                      <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>AI Suggests:</p>
                      <p className="font-bold" style={{ color: '#0A84FF' }}>{match.aiPrediction}</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Confidence: {match.confidence}%</p>
                    </div>

                    <p className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                      Select Your Prediction:
                    </p>

                    <div className="space-y-2 mb-4">
                      {match.possibleOutcomes.map((outcome) => (
                        <button
                          key={outcome}
                          onClick={() => makeUserPrediction(match.id, outcome)}
                          className="w-full py-3 px-4 rounded-lg font-medium text-left transition-all hover:scale-105 active:scale-95"
                          style={{
                            backgroundColor: outcome === match.aiPrediction ? 'rgba(10, 132, 255, 0.2)' : 'var(--bg-accent)',
                            border: outcome === match.aiPrediction ? '2px solid #0A84FF' : '1px solid transparent',
                            color: 'var(--text-primary)'
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span>{outcome}</span>
                            {outcome === match.aiPrediction && (
                              <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: '#0A84FF', color: 'white' }}>
                                AI Pick
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>

                    <p className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
                      💡 You can choose any outcome - AI suggestions are for guidance only!
                    </p>
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {showChallengeDetail !== null && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="rounded-2xl shadow-xl max-w-lg w-full p-6" style={{ backgroundColor: 'var(--bg-card)' }}>
              {(() => {
                const challenge = challenges.find(c => c.id === showChallengeDetail);
                if (!challenge) return null;

                return (
                  <>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-5xl">{challenge.icon}</span>
                        <div>
                          <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                            {challenge.title}
                          </p>
                          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {challenge.goal}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowChallengeDetail(null)}
                        className="p-2 rounded-full transition-colors"
                        style={{ backgroundColor: 'var(--bg-accent)' }}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-accent)' }}>
                      <p className="text-sm mb-2" style={{ color: 'var(--text-primary)' }}>{challenge.description}</p>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Rules:</p>
                      <ul className="space-y-1">
                        {challenge.rules.map((rule, idx) => (
                          <li key={idx} className="text-xs flex items-start gap-2" style={{ color: 'var(--text-secondary)' }}>
                            <span>•</span>
                            <span>{rule}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => {
                        setShowChallengeDetail(null);
                        setActiveSection('predictions');
                      }}
                      className="w-full py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition-transform active:scale-95"
                      style={{ backgroundColor: challenge.color }}
                    >
                      Make Predictions
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </div>

      <GameFooter />
    </div>
  );
}
