import { Bell, CheckCircle, Info, Gift, Trophy } from 'lucide-react';
import { TopBar } from '../components/TopBar';
import { BackButton } from '../components/BackButton';
import { useUser } from '../context/UserContext';
import { useState } from 'react';

export function Notifications() {
  const { formatCurrency } = useUser();
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'win', title: 'Game Win!', message: `You won ${formatCurrency(1800)} in the color prediction game`, time: '5 mins ago', read: false, icon: '🎮' },
    { id: 2, type: 'reward', title: 'Daily Reward', message: `${formatCurrency(300)} daily reward claimed successfully`, time: '2 hours ago', read: false, icon: '🎁' },
    { id: 3, type: 'referral', title: 'New Referral', message: `You earned ${formatCurrency(500)} from a referral!`, time: '1 day ago', read: true, icon: '👥' },
    { id: 4, type: 'prediction', title: 'AI Prediction Update', message: 'New premium predictions available', time: '1 day ago', read: true, icon: '⚽' },
    { id: 5, type: 'system', title: 'Welcome!', message: 'Welcome to the Gaming Platform', time: '2 days ago', read: true, icon: '✨' },
  ]);

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen overflow-y-auto" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <TopBar />

      <div className="w-full max-w-[480px] md:max-w-[768px] lg:max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8 pb-20">
        <BackButton />
        
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Bell className="w-8 h-8" style={{ color: '#0A84FF' }} />
            <div>
              <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                Notifications
              </h1>
              {unreadCount > 0 && (
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {unreadCount} unread
                </p>
              )}
            </div>
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{ backgroundColor: '#0A84FF', color: 'white' }}
            >
              Mark all as read
            </button>
          )}
        </div>

        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => markAsRead(notification.id)}
              className="rounded-lg shadow-sm p-4 cursor-pointer transition-all hover:opacity-80"
              style={{
                backgroundColor: notification.read ? 'var(--bg-card)' : 'rgba(10, 132, 255, 0.05)',
                borderLeft: notification.read ? 'none' : '3px solid #0A84FF',
              }}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">{notification.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {notification.title}
                    </h3>
                    {!notification.read && (
                      <div className="w-2 h-2 rounded-full flex-shrink-0 mt-2" style={{ backgroundColor: '#0A84FF' }} />
                    )}
                  </div>
                  <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                    {notification.message}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {notification.time}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {notifications.length === 0 && (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-tertiary)' }} />
            <p className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              No notifications
            </p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              You're all caught up!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}