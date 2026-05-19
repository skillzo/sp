import { X, Star, TrendingUp } from 'lucide-react';
import { VIPCrown } from './VIPCrown';
import { useUser } from '../context/UserContext';
import { useState } from 'react';
import { VIPUpgradeModal } from './VIPUpgradeModal';

interface VIPProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VIPProgressModal({ isOpen, onClose }: VIPProgressModalProps) {
  const { vipLevel, vipProgress } = useUser();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  if (!isOpen || vipLevel === 0 || vipLevel === 3) return null;

  const nextLevel = (vipLevel + 1) as 1 | 2 | 3;
  const progressPercent = vipProgress;

  const benefits = {
    2: [
      '✨ 8.5% daily rebate claim',
      'Higher withdrawal limits',
      'Priority customer support',
      'Exclusive game modes',
      'Double daily rewards',
    ],
    3: [
      '✨ 10% daily rebate claim',
      'Unlimited withdrawals',
      '24/7 VIP support',
      'All premium features',
      'Triple daily rewards',
      'Custom avatar & badge',
    ],
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div 
        className="w-full max-w-md rounded-2xl p-6 relative overflow-hidden"
        style={{
          backgroundColor: 'var(--bg-card)',
        }}
      >
        {/* Gradient overlay */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            background: 'linear-gradient(135deg, var(--blue-gradient-start) 0%, var(--blue-gradient-end) 100%)',
          }}
        />

        {/* Header */}
        <div className="flex items-center justify-between mb-6 relative z-10">
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            VIP Progress
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-secondary)'
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Level */}
        <div className="mb-6 relative z-10">
          <div 
            className="rounded-xl p-5 flex items-center gap-4"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
            }}
          >
            <VIPCrown level={vipLevel as 1 | 2} size="lg" animate />
            <div className="flex-1">
              <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                Current Level
              </p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                VIP {vipLevel}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6 relative z-10">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Progress to VIP {nextLevel}
            </p>
            <p className="text-sm font-bold" style={{ color: 'var(--blue-primary)' }}>
              {progressPercent}%
            </p>
          </div>

          <div 
            className="h-3 rounded-full overflow-hidden"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressPercent}%`,
                background: 'linear-gradient(90deg, var(--blue-gradient-start) 0%, var(--blue-gradient-end) 100%)',
                boxShadow: '0 0 12px rgba(45, 108, 223, 0.5)',
              }}
            />
          </div>

          <p className="text-xs mt-2 text-center" style={{ color: 'var(--text-secondary)' }}>
            {progressPercent < 100 
              ? `${100 - progressPercent}% more to unlock VIP ${nextLevel}`
              : `Ready to upgrade to VIP ${nextLevel}!`
            }
          </p>
        </div>

        {/* Next Level Preview */}
        <div className="mb-6 relative z-10">
          <div 
            className="rounded-xl p-4"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <VIPCrown level={nextLevel} size="md" />
              <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                VIP {nextLevel} Benefits
              </h3>
            </div>

            <div className="space-y-2">
              {benefits[nextLevel as 2 | 3].map((benefit, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'rgba(45, 108, 223, 0.1)' }}
                  >
                    <Star className="w-3 h-3" style={{ color: 'var(--blue-primary)' }} />
                  </div>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {benefit}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* How to Progress */}
        <div 
          className="rounded-xl p-4 mb-6 relative z-10"
          style={{
            backgroundColor: 'rgba(45, 108, 223, 0.05)',
            border: '1px solid rgba(45, 108, 223, 0.2)',
          }}
        >
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 mt-0.5" style={{ color: 'var(--blue-primary)' }} />
            <div>
              <h4 className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                How to Progress
              </h4>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Earn progress by playing games, making deposits, and completing daily tasks. Progress automatically saves!
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        {progressPercent >= 100 && (
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="w-full py-3 rounded-xl font-bold text-white transition-all active:scale-95 relative z-10"
            style={{
              background: 'linear-gradient(135deg, var(--blue-gradient-start) 0%, var(--blue-gradient-end) 100%)',
              boxShadow: '0 4px 16px rgba(45, 108, 223, 0.4)',
            }}
          >
            Upgrade to VIP {nextLevel} Now
          </button>
        )}
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <VIPUpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          targetLevel={nextLevel}
        />
      )}
    </div>
  );
}