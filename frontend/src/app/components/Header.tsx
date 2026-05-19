import { User, Bell, Menu } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useSidebar } from '../context/SidebarContext';
import { Link } from 'react-router';

export function Header() {
  const { balance, gameBalance, formatCurrency, formatUSDT } = useUser();
  const { toggleSidebar } = useSidebar();

  return (
    <header className="rounded-lg shadow-sm p-4 mb-6" style={{ backgroundColor: '#0A84FF' }}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleSidebar}
            className="w-10 h-10 rounded-full flex items-center justify-center" 
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
          >
            <Menu className="w-6 h-6 text-white" />
          </button>
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
            <User className="w-6 h-6 text-white" />
          </div>
          <span className="text-white font-medium">Profile</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/notifications" className="relative">
            <Bell className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: '#EF4444', color: 'white' }}>
              3
            </span>
          </Link>
          <div className="flex flex-col items-end">
            <div className="text-white font-semibold text-xs">
              Balance: {formatCurrency(balance)}
            </div>
            <div className="text-white/80 font-medium text-xs">
              Game: {formatUSDT(gameBalance)}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}