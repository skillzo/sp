import { Menu } from 'lucide-react';
import { useState } from 'react';
import logoImg from '../../imports/1000609262.png';
import { useAuth } from '../context/AuthContext';

interface LandingHeaderProps {
  onMenuClick: () => void;
}

export function LandingHeader({ onMenuClick }: LandingHeaderProps) {
  const { openAuthModal } = useAuth();

  const handleSignIn = () => {
    openAuthModal('login');
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40"
      style={{
        height: '56px',
        backgroundColor: 'rgba(13, 15, 20, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      <div className="h-full max-w-[1280px] mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden" style={{
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
          }}>
            <img src={logoImg} alt="Logo" className="w-full h-full object-contain p-1.5" />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSignIn}
            className="text-sm font-medium transition-colors"
            style={{
              color: '#FFFFFF',
            }}
          >
            Sign In
          </button>
          <button
            onClick={onMenuClick}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:bg-opacity-20"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
            }}
          >
            <Menu className="w-5 h-5" style={{ color: '#A0A6B1' }} />
          </button>
        </div>
      </div>
    </header>
  );
}
