import { useEffect, useState } from 'react';

interface Activity {
  id: number;
  user: string;
  action: 'win' | 'join';
  amount: number;
  timestamp: number;
}

export function LiveActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([
    { id: 1, user: 'ProGamer', action: 'join', amount: 8, timestamp: Date.now() },
    { id: 2, user: 'SpinKing', action: 'join', amount: 12, timestamp: Date.now() - 1000 },
    { id: 3, user: 'User586', action: 'win', amount: 130, timestamp: Date.now() - 2000 },
    { id: 4, user: 'LuckyMike', action: 'win', amount: 95, timestamp: Date.now() - 3000 },
    { id: 5, user: 'User892', action: 'join', amount: 15, timestamp: Date.now() - 4000 },
    { id: 6, user: 'CryptoQueen', action: 'win', amount: 180, timestamp: Date.now() - 5000 },
  ]);

  useEffect(() => {
    // Add new activity every 3-5 seconds
    const interval = setInterval(() => {
      const names = ['User' + Math.floor(Math.random() * 1000), 'Player' + Math.floor(Math.random() * 100), 'ProGamer', 'SpinKing', 'LuckyMike'];
      const actions: ('win' | 'join')[] = ['win', 'join', 'join']; // More joins than wins
      const action = actions[Math.floor(Math.random() * actions.length)];
      
      const newActivity: Activity = {
        id: Date.now(),
        user: names[Math.floor(Math.random() * names.length)],
        action,
        amount: action === 'win' ? Math.floor(Math.random() * 200) + 50 : Math.floor(Math.random() * 50) + 5,
        timestamp: Date.now(),
      };

      setActivities((prev) => [newActivity, ...prev.slice(0, 9)]); // Keep last 10
    }, Math.random() * 2000 + 3000); // 3-5 seconds

    return () => clearInterval(interval);
  }, []);

  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    return `${Math.floor(seconds / 60)}m ago`;
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-2">
      {activities.map((activity, index) => (
        <div
          key={activity.id}
          className="flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300"
          style={{
            backgroundColor: '#171A22',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            animation: index === 0 ? 'slideIn 0.5s ease-out' : 'none',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm"
              style={{
                backgroundColor: activity.action === 'win' 
                  ? 'rgba(0, 255, 136, 0.15)' 
                  : 'rgba(160, 166, 177, 0.1)',
                color: activity.action === 'win' ? '#00FF88' : '#A0A6B1',
              }}
            >
              {activity.action === 'win' ? '🎉' : '👤'}
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>
                {activity.user}
              </p>
              <p className="text-xs" style={{ color: '#6B7280' }}>
                {activity.action === 'win' ? 'Won' : 'Joined'} ${activity.amount}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div
              className="text-sm font-bold"
              style={{
                color: activity.action === 'win' ? '#00FF88' : '#A0A6B1',
              }}
            >
              {activity.action === 'win' ? '+$' + activity.amount : ''}
            </div>
          </div>
        </div>
      ))}

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}