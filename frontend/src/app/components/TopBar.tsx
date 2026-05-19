import { Menu, User, Bell } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useSidebar } from '../context/SidebarContext';
import { useNavigate } from 'react-router';
import logoImg from '../../imports/1000609262.png';
import { VIPCrown } from './VIPCrown';
import { useState } from 'react';
import { VIPProgressModal } from './VIPProgressModal';

export function TopBar() {
  const { balance, gameBalance, formatUSDT, vipLevel } = useUser();
  const { toggleSidebar } = useSidebar();
  const navigate = useNavigate();
  const [showVIPProgress, setShowVIPProgress] = useState(false);

  // Calculate total balance (main + game)
  const totalBalance = balance + gameBalance;

  return (
    <>
      <div className="py-4" style={{
        background: 'linear-gradient(135deg, var(--blue-gradient-start) 0%, var(--blue-gradient-end) 100%)',
      }}>
        <div className="flex items-center justify-between w-full max-w-[480px] md:max-w-[768px] lg:max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleSidebar}
              className="w-10 h-10 flex items-center justify-center"
            >
              <Menu className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden transition-all hover:scale-110 active:scale-95"
              style={{
                backgroundColor: 'rgba(255,255,255,0.15)'
              }}
            >
              <img src={logoImg} alt="Logo" className="w-full h-full object-contain p-1.5" />
            </button>
          </div>

          {/* VIP Badge - Centered */}
          {vipLevel > 0 && (
            <button
              onClick={() => vipLevel < 3 && setShowVIPProgress(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all active:scale-95"
              style={{
                backgroundColor: 'rgba(255, 215, 0, 0.15)',
                border: '2px solid rgba(255, 215, 0, 0.3)',
                cursor: vipLevel < 3 ? 'pointer' : 'default',
                boxShadow: '0 2px 8px rgba(255, 215, 0, 0.3)',
              }}
            >
              <VIPCrown level={vipLevel as 1 | 2 | 3} size="sm" />
              <span className="text-base font-black tracking-wide" style={{
                color: '#FFD700',
                textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                letterSpacing: '0.5px',
              }}>
                VIP {vipLevel}
              </span>
            </button>
          )}
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/notifications')}
              className="w-10 h-10 rounded-full flex items-center justify-center relative" style={{
              backgroundColor: 'rgba(255,255,255,0.12)'
            }}>
              <Bell className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs font-bold flex items-center justify-center">3</span>
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{
              backgroundColor: 'rgba(255,255,255,0.12)'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <rect x="2" y="5" width="20" height="14" rx="2"/>
                <path d="M2 10h20"/>
              </svg>
              <div className="text-right">
                <p className="text-xs text-white/80">Balance</p>
                <p className="text-sm font-bold text-white">{formatUSDT(totalBalance)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* VIP Progress Modal */}
      <VIPProgressModal
        isOpen={showVIPProgress}
        onClose={() => setShowVIPProgress(false)}
      />
    </>
  );
}