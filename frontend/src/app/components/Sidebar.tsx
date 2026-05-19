import { NavLink } from 'react-router';
import { Wallet, Gamepad2, Trophy, Gift, Users, User, LogOut, Settings, TrendingUp, Megaphone, DollarSign, Percent, Lock, CheckSquare } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';

export function Sidebar() {
  const { isVIP } = useUser();
  const { openAuthModal } = useAuth();

  const handleLogout = () => {
    // Open login modal
    openAuthModal('login');
  };

  const navItems = [
    { to: '/wallet', label: 'Wallet', icon: Wallet },
    { to: '/dashboard', label: 'Games', icon: Gamepad2 },
    { to: '/predictions', label: 'AI Predictions', icon: Trophy },
    { to: '/vip-tasks', label: 'Daily Tasks', icon: CheckSquare },
    { to: '/advertiser', label: 'Advertise & Earn', icon: Megaphone, locked: !isVIP },
    { to: '/daily-rebate', label: 'Daily Rebate', icon: Percent },
    { to: '/referrals', label: 'Referrals', icon: Users },
    { to: '/affiliate-wallet', label: 'Affiliate Wallet', icon: DollarSign },
    { to: '/leaderboard', label: 'Leaderboard', icon: TrendingUp },
    { to: '/settings', label: 'Settings', icon: Settings },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <aside className="w-64 min-h-screen border-r flex-shrink-0" style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border-color)' }}>
      <div className="p-4">
        <h1 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>
          Gaming Platform
        </h1>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  item.locked ? 'opacity-50 cursor-not-allowed' : ''
                }`
              }
              style={({ isActive }) => ({
                backgroundColor: isActive ? '#0A84FF' : 'transparent',
                color: isActive ? '#FFFFFF' : 'var(--text-primary)',
              })}
              onClick={(e) => item.locked && e.preventDefault()}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
              {item.locked && <Lock className="w-4 h-4 ml-auto" style={{ color: '#EF4444' }} />}
            </NavLink>
          ))}

          <button
            className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors w-full mt-4"
            style={{ color: 'var(--text-primary)' }}
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Logout</span>
          </button>
        </nav>
      </div>
    </aside>
  );
}