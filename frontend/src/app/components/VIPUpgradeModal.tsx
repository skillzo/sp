import { useState } from 'react';
import { X, Crown, Star, CheckCircle, Sparkles } from 'lucide-react';
import { VIPCrown } from './VIPCrown';
import { useUser } from '../context/UserContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';

interface VIPUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetLevel: 1 | 2 | 3;
}

export function VIPUpgradeModal({ isOpen, onClose, targetLevel }: VIPUpgradeModalProps) {
  const { gameBalance, setGameBalance, setIsVIP, setVipLevel, addTransaction } = useUser();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!isOpen) return null;

  // Only VIP 1 requires payment
  const price = targetLevel === 1 ? 3 : 0;

  const benefits = {
    1: [
      '✨ 7% daily rebate claim',
      'Daily bonus rewards',
      'AI Football predictions',
      'Access to VIP tasks',
      'Priority support',
      'Advertise & Earn access',
    ],
    2: [
      '✨ 8.5% daily rebate claim',
      'All VIP 1 benefits',
      'Higher withdrawal limits',
      'Exclusive game modes',
      'Double daily rewards',
      'Custom badge',
    ],
    3: [
      '✨ 10% daily rebate claim',
      'All VIP 2 benefits',
      'Unlimited withdrawals',
      '24/7 VIP support',
      'Triple daily rewards',
      'Diamond crown badge',
      'Exclusive tournaments',
    ],
  };

  const handleUpgrade = async () => {
    if (targetLevel === 1 && gameBalance < price) {
      toast.error('Insufficient balance. Please deposit USDT first.');
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      // Deduct from balance only for VIP 1
      if (targetLevel === 1) {
        setGameBalance(gameBalance - price);

        // Add transaction
        addTransaction({
          description: `VIP ${targetLevel} Upgrade`,
          amount: -price,
          status: 'Completed',
          icon: 'gamepad',
          type: 'game',
        });
      }

      // Set VIP status
      setIsVIP(true);
      setVipLevel(targetLevel);

      setIsProcessing(false);
      setShowSuccess(true);

      // Auto-close and navigate after 2 seconds
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
        navigate('/dashboard'); // Navigate to dashboard
        toast.success(`Welcome to VIP ${targetLevel}! 🎉`);
      }, 2000);
    }, 1500);
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div 
          className="w-full max-w-md rounded-2xl p-8 text-center relative overflow-hidden"
          style={{
            backgroundColor: 'var(--bg-card)',
          }}
        >
          {/* Animated background */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              background: 'linear-gradient(135deg, var(--blue-gradient-start) 0%, var(--blue-gradient-end) 100%)',
              animation: 'pulse 2s ease-in-out infinite',
            }}
          />

          {/* Success Icon */}
          <div className="relative mb-6 vip-success-animate">
            <VIPCrown level={targetLevel} size="lg" animate />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="absolute w-24 h-24 rounded-full border-4 border-dashed animate-spin-slow" style={{
                borderColor: targetLevel === 1 ? '#C0C0C0' : targetLevel === 2 ? '#FFD700' : '#00D4FF',
                opacity: 0.3,
              }} />
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            🎉 Congratulations!
          </h2>
          
          <p className="text-base mb-4" style={{ color: 'var(--text-secondary)' }}>
            You're now a VIP {targetLevel} member
          </p>

          <div 
            className="py-4 px-6 rounded-xl relative overflow-hidden"
            style={{ 
              background: 'linear-gradient(135deg, var(--blue-gradient-start) 0%, var(--blue-gradient-end) 100%)',
            }}
          >
            <p className="text-white text-sm">All premium features unlocked!</p>
          </div>

          <style>{`
            @keyframes vip-success-scale {
              0%, 100% {
                transform: scale(1);
              }
              50% {
                transform: scale(1.15);
              }
            }

            .vip-success-animate {
              animation: vip-success-scale 0.6s ease-in-out;
            }

            @keyframes spin-slow {
              from {
                transform: rotate(0deg);
              }
              to {
                transform: rotate(360deg);
              }
            }

            .animate-spin-slow {
              animation: spin-slow 3s linear infinite;
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div 
        className="w-full max-w-md rounded-2xl p-6 relative overflow-hidden max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: 'var(--bg-card)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <VIPCrown level={targetLevel} size="md" />
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Upgrade to VIP {targetLevel}
            </h2>
          </div>
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

        {/* Price Card */}
        <div 
          className="rounded-xl p-6 mb-6 text-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, var(--blue-gradient-start) 0%, var(--blue-gradient-end) 100%)',
          }}
        >
          <p className="text-white/80 text-sm mb-2">One-time payment</p>
          <p className="text-white text-4xl font-bold mb-1">${price}</p>
          <p className="text-white/80 text-xs">Lifetime VIP {targetLevel} access</p>
        </div>

        {/* Benefits List */}
        <div className="mb-6">
          <h3 className="text-base font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            What you'll get:
          </h3>
          <div className="space-y-3">
            {benefits[targetLevel].map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ 
                    background: 'linear-gradient(135deg, var(--blue-gradient-start) 0%, var(--blue-gradient-end) 100%)',
                  }}
                >
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {benefit}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Info */}
        <div 
          className="rounded-xl p-4 mb-6"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Your Game Balance
            </p>
            <p className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              ${gameBalance.toFixed(2)}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Upgrade Cost
            </p>
            <p className="text-base font-bold" style={{ color: 'var(--blue-primary)' }}>
              ${price.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-bold transition-all active:scale-95"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleUpgrade}
            disabled={isProcessing || (targetLevel === 1 && gameBalance < price)}
            className="flex-1 py-3 rounded-xl font-bold text-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, var(--blue-gradient-start) 0%, var(--blue-gradient-end) 100%)',
              boxShadow: '0 4px 16px rgba(45, 108, 223, 0.4)',
            }}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              `Upgrade for $${price}`
            )}
          </button>
        </div>

        {targetLevel === 1 && gameBalance < price && (
          <p className="text-xs text-center mt-3" style={{ color: '#FF3B30' }}>
            Insufficient balance. Please deposit USDT to continue.
          </p>
        )}
      </div>
    </div>
  );
}