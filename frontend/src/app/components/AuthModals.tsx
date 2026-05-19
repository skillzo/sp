import { useState } from 'react';
import { X, Mail, Lock, User, Phone, MapPin } from 'lucide-react';

interface AuthModalsProps {
  show: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onSuccess?: () => void;
}

export function AuthModals({ show, onClose, initialMode = 'login', onSuccess }: AuthModalsProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Register form state
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Mock success
      onClose();
      if (onSuccess) onSuccess();
    }, 1000);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (registerData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Mock success
      onClose();
      if (onSuccess) onSuccess();
    }, 1000);
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
  };

  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
        }}
        onClick={onClose}
      >
        {/* Modal Container */}
        <div
          className="relative w-full max-w-md animate-modal-in"
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: '#111111',
            borderRadius: '20px',
            padding: '32px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(0, 255, 204, 0.1)',
            border: '1px solid rgba(0, 255, 204, 0.2)',
          }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            }}
          >
            <X className="w-5 h-5" style={{ color: '#94A3B8' }} />
          </button>

          {/* LOGIN MODE */}
          {mode === 'login' && (
            <div>
              {/* Title */}
              <h2 className="text-3xl font-black mb-2" style={{ color: '#FFFFFF' }}>
                Welcome back
              </h2>
              <p className="text-base mb-8" style={{ color: '#94A3B8' }}>
                Login to join the round
              </p>

              {/* Error Message */}
              {error && (
                <div
                  className="mb-6 p-3 rounded-lg animate-shake"
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                  }}
                >
                  <p className="text-sm font-semibold" style={{ color: '#EF4444' }}>
                    {error}
                  </p>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-5">
                {/* Email/Username Input */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#CBD5E1' }}>
                    Email or Username
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                      style={{ color: '#64748B' }}
                    />
                    <input
                      type="text"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      placeholder="Enter your email or username"
                      required
                      className="w-full pl-12 pr-4 py-4 rounded-xl text-base transition-all focus:outline-none focus-glow"
                      style={{
                        backgroundColor: 'rgba(30, 41, 59, 0.5)',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        color: '#FFFFFF',
                      }}
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#CBD5E1' }}>
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                      style={{ color: '#64748B' }}
                    />
                    <input
                      type="password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      placeholder="Enter your password"
                      required
                      className="w-full pl-12 pr-4 py-4 rounded-xl text-base transition-all focus:outline-none focus-glow"
                      style={{
                        backgroundColor: 'rgba(30, 41, 59, 0.5)',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        color: '#FFFFFF',
                      }}
                    />
                  </div>
                </div>

                {/* Forgot Password */}
                <div className="text-right">
                  <button
                    type="button"
                    className="text-sm font-semibold transition-colors hover:opacity-80"
                    style={{ color: '#00ffcc' }}
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 rounded-xl font-black text-lg transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, #00ffcc 0%, #00d4aa 100%)',
                    color: '#0B0F14',
                    boxShadow: '0 10px 30px rgba(0, 255, 204, 0.4)',
                    letterSpacing: '0.5px',
                  }}
                >
                  {isLoading ? 'Logging in...' : 'Login & Join Round'}
                </button>
              </form>

              {/* Register Link */}
              <div className="mt-6 text-center">
                <p className="text-sm" style={{ color: '#94A3B8' }}>
                  Don't have an account?{' '}
                  <button
                    onClick={switchMode}
                    className="font-bold transition-colors hover:opacity-80"
                    style={{ color: '#00ffcc' }}
                  >
                    Register
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* REGISTER MODE */}
          {mode === 'register' && (
            <div>
              {/* Title */}
              <h2 className="text-3xl font-black mb-2" style={{ color: '#FFFFFF' }}>
                Create account
              </h2>
              <p className="text-base mb-8" style={{ color: '#94A3B8' }}>
                Start playing in seconds
              </p>

              {/* Error Message */}
              {error && (
                <div
                  className="mb-6 p-3 rounded-lg animate-shake"
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                  }}
                >
                  <p className="text-sm font-semibold" style={{ color: '#EF4444' }}>
                    {error}
                  </p>
                </div>
              )}

              {/* Register Form */}
              <form onSubmit={handleRegister} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {/* Email Input */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#CBD5E1' }}>
                    Email
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                      style={{ color: '#64748B' }}
                    />
                    <input
                      type="email"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      placeholder="Enter your email"
                      required
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl text-base transition-all focus:outline-none focus-glow"
                      style={{
                        backgroundColor: 'rgba(30, 41, 59, 0.5)',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        color: '#FFFFFF',
                      }}
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#CBD5E1' }}>
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                      style={{ color: '#64748B' }}
                    />
                    <input
                      type="password"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      placeholder="Create a password"
                      required
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl text-base transition-all focus:outline-none focus-glow"
                      style={{
                        backgroundColor: 'rgba(30, 41, 59, 0.5)',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        color: '#FFFFFF',
                      }}
                    />
                  </div>
                </div>

                {/* Confirm Password Input */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#CBD5E1' }}>
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                      style={{ color: '#64748B' }}
                    />
                    <input
                      type="password"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                      placeholder="Confirm your password"
                      required
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl text-base transition-all focus:outline-none focus-glow"
                      style={{
                        backgroundColor: 'rgba(30, 41, 59, 0.5)',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        color: '#FFFFFF',
                      }}
                    />
                  </div>
                </div>

                {/* Register Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 rounded-xl font-black text-lg transition-all hover:scale-105 active:scale-95 mt-6"
                  style={{
                    background: 'linear-gradient(135deg, #00ffcc 0%, #00d4aa 100%)',
                    color: '#0B0F14',
                    boxShadow: '0 10px 30px rgba(0, 255, 204, 0.4)',
                    letterSpacing: '0.5px',
                  }}
                >
                  {isLoading ? 'Creating Account...' : 'Create Account & Join'}
                </button>
              </form>

              {/* Login Link */}
              <div className="mt-6 text-center">
                <p className="text-sm" style={{ color: '#94A3B8' }}>
                  Already have an account?{' '}
                  <button
                    onClick={switchMode}
                    className="font-bold transition-colors hover:opacity-80"
                    style={{ color: '#00ffcc' }}
                  >
                    Login
                  </button>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes modal-in {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-modal-in {
          animation: modal-in 0.3s ease-out;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }

        .focus-glow:focus {
          border-color: rgba(0, 255, 204, 0.5) !important;
          box-shadow: 0 0 0 3px rgba(0, 255, 204, 0.1), 0 0 20px rgba(0, 255, 204, 0.2) !important;
        }

        /* Custom Scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 255, 204, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 255, 204, 0.5);
        }
      `}</style>
    </>
  );
}