import { useState } from 'react';
import { Shield, Zap, Clock, ArrowRight, TrendingUp, Users, Target } from 'lucide-react';
import { LandingHeader } from '../components/LandingHeader';
import { LandingSidebar } from '../components/LandingSidebar';
import { LiveWheel } from '../components/LiveWheel';
import { LiveActivityFeed } from '../components/LiveActivityFeed';
import { LiveGameScreen } from '../components/LiveGameScreen';
import { useAuth } from '../context/AuthContext';

export function HomePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { openAuthModal } = useAuth();

  const handleJoinNow = () => {
    openAuthModal('register');
  };

  const handleSignIn = () => {
    openAuthModal('login');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0D0F14' }}>
      {/* Header */}
      <LandingHeader onMenuClick={() => setIsSidebarOpen(true)} />

      {/* Sidebar */}
      <LandingSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <div className="pt-[56px]">
        {/* ABOVE THE FOLD — LIVE GAME SCREEN */}
        <LiveGameScreen />

        {/* SECTION 1 — HERO (SIMPLIFIED) */}
        <section className="px-4 py-8">
          <div className="max-w-[480px] mx-auto text-center">
            {/* Headline */}
            <h1 className="mb-3" style={{ 
              fontSize: '32px',
              lineHeight: '1.1',
              fontWeight: '900',
              color: '#FFFFFF',
            }}>
              Earn. Play.
            </h1>
            <h1 className="mb-4" style={{ 
              fontSize: '32px',
              lineHeight: '1.1',
              fontWeight: '900',
              color: '#00FF88',
            }}>
              Predict. Repeat.
            </h1>

            {/* Subtext */}
            <p className="mb-6" style={{
              fontSize: '15px',
              lineHeight: '1.5',
              color: '#A0A6B1',
            }}>
              Real players. Real pools. Multiple ways to earn.
            </p>

            {/* Trust Row */}
            <div className="flex items-center justify-center gap-2 flex-wrap" style={{
              fontSize: '12px',
              color: '#6B7280',
            }}>
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" style={{ color: '#00FF88' }} />
                <span>Provably fair</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" style={{ color: '#00FF88' }} />
                <span>Instant payouts</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ 
                  backgroundColor: '#00FF88',
                  boxShadow: '0 0 8px #00FF88',
                }} />
                <span>Live activity</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3 — PLATFORM LOOP */}
        <section className="px-4 py-12">
          <div className="max-w-[480px] mx-auto">
            {/* Horizontal Icons */}
            <div className="flex items-center justify-center gap-3 mb-4">
              {[
                { icon: Target, label: 'Play' },
                { icon: TrendingUp, label: 'Win' },
                { icon: Zap, label: 'Earn' },
                { icon: ArrowRight, label: 'Repeat' },
              ].map((item, index) => (
                <div key={index} className="flex flex-col items-center gap-2">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.2) 0%, rgba(0, 255, 136, 0.05) 100%)',
                      border: '1px solid rgba(0, 255, 136, 0.2)',
                    }}
                  >
                    <item.icon className="w-6 h-6" style={{ color: '#00FF88' }} />
                  </div>
                  <span className="text-xs font-semibold" style={{ color: '#A0A6B1' }}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Caption */}
            <p className="text-center text-sm" style={{ color: '#6B7280' }}>
              Stay active. Keep earning.
            </p>
          </div>
        </section>

        {/* SECTION 4 — MULTIPLE WAYS TO EARN */}
        <section className="px-4 py-12" style={{
          backgroundColor: '#12151C',
        }}>
          <div className="max-w-[480px] mx-auto">
            <h2 className="text-2xl font-black text-center mb-8" style={{ color: '#FFFFFF' }}>
              Multiple Ways to Earn
            </h2>

            <div className="space-y-3">
              {[
                {
                  emoji: '🎯',
                  title: 'AI Predictions',
                  description: 'Daily football picks with confidence scores',
                },
                {
                  emoji: '💰',
                  title: 'Earn Rewards',
                  description: 'Complete tasks and stack bonuses',
                },
                {
                  emoji: '👥',
                  title: 'Invite & Earn',
                  description: 'Bring users, earn from activity',
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl transition-all hover:scale-[1.02]"
                  style={{
                    backgroundColor: '#171A22',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{item.emoji}</div>
                    <div className="flex-1">
                      <h3 className="text-base font-bold mb-1" style={{ color: '#FFFFFF' }}>
                        {item.title}
                      </h3>
                      <p className="text-sm" style={{ color: '#A0A6B1' }}>
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 5 — LIVE ACTIVITY */}
        <section className="px-4 py-12">
          <div className="max-w-[480px] mx-auto">
            <h2 className="text-2xl font-black text-center mb-8" style={{ color: '#FFFFFF' }}>
              Happening Now
            </h2>

            <LiveActivityFeed />
          </div>
        </section>

        {/* SECTION 6 — SOCIAL PROOF */}
        <section className="px-4 py-12" style={{
          backgroundColor: '#12151C',
        }}>
          <div className="max-w-[480px] mx-auto">
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: '10,000+', label: 'Rounds' },
                { value: '250K+', label: 'Players' },
                { value: '$5M+', label: 'Paid Out' },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl text-center"
                  style={{
                    backgroundColor: '#171A22',
                    border: '1px solid rgba(0, 255, 136, 0.2)',
                    boxShadow: '0 0 20px rgba(0, 255, 136, 0.1)',
                  }}
                >
                  <p className="text-2xl font-black mb-1" style={{ color: '#00FF88' }}>
                    {stat.value}
                  </p>
                  <p className="text-xs font-semibold" style={{ color: '#A0A6B1' }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 7 — FINAL CTA */}
        <section className="px-4 py-16 relative overflow-hidden">
          {/* Radial Glow Background */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at center, rgba(0, 255, 136, 0.15) 0%, transparent 70%)',
            }}
          />

          <div className="max-w-[480px] mx-auto text-center relative z-10">
            <h2 className="text-3xl font-black mb-2" style={{ color: '#FFFFFF' }}>
              Next round is filling…
            </h2>
            <p className="text-lg font-semibold mb-8" style={{ color: '#A0A6B1' }}>
              Don't miss it.
            </p>

            <button
              onClick={handleJoinNow}
              className="w-full transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                height: '52px',
                background: '#00FF88',
                color: '#0D0F14',
                fontSize: '16px',
                fontWeight: '700',
                borderRadius: '999px',
                boxShadow: '0 0 40px rgba(0, 255, 136, 0.5), 0 4px 12px rgba(0, 0, 0, 0.2)',
                border: 'none',
                letterSpacing: '0.5px',
              }}
            >
              JOIN ROUND NOW
            </button>
          </div>
        </section>

        {/* SECTION 8 — FOOTER */}
        <footer className="px-4 py-8" style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        }}>
          <div className="max-w-[480px] mx-auto text-center">
            <p className="text-xs mb-4" style={{ color: '#6B7280' }}>
              Provably Fair • Play responsibly • 18+
            </p>
            <div className="flex items-center justify-center gap-4 text-xs" style={{ color: '#6B7280' }}>
              <a href="#terms" className="hover:underline">Terms</a>
              <span>•</span>
              <a href="#privacy" className="hover:underline">Privacy</a>
            </div>
          </div>
        </footer>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}