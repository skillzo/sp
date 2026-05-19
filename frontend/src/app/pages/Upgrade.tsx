import { Crown, Check, Zap, Wallet, X } from 'lucide-react';
import { TopBar } from '../components/TopBar';
import { BackButton } from '../components/BackButton';
import { useUser } from '../context/UserContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { useState } from 'react';
import { VIPUpgradeModal } from '../components/VIPUpgradeModal';
import { VIPCrown } from '../components/VIPCrown';

export function Upgrade() {
  const { vipLevel, formatCurrency, gameBalance, vipProgress, setVipProgress } = useUser();
  const navigate = useNavigate();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [targetLevel, setTargetLevel] = useState<1 | 2 | 3>(1);

  const vipTiers = [
    {
      level: 1,
      name: 'VIP 1',
      price: 3,
      isPaid: true,
      features: [
        '7% daily rebate claim',
        'Daily earning tasks up to $0.50/day',
        'Premium AI football predictions',
        'Daily rewards up to $1',
        'Priority customer support',
        'Advertise & Earn access',
      ],
    },
    {
      level: 2,
      name: 'VIP 2',
      price: 0,
      isPaid: false,
      features: [
        '8.5% daily rebate claim',
        'All VIP 1 benefits',
        'Higher withdrawal limits',
        'Exclusive game modes',
        'Double daily rewards',
        'Custom gold badge',
      ],
    },
    {
      level: 3,
      name: 'VIP 3',
      price: 0,
      isPaid: false,
      features: [
        '10% daily rebate claim',
        'All VIP 2 benefits',
        'Unlimited withdrawals',
        '24/7 VIP support',
        'Triple daily rewards',
        'Diamond crown badge',
        'Exclusive tournaments',
      ],
    },
  ];

  const handleUpgradeClick = (level: 1 | 2 | 3) => {
    setTargetLevel(level);
    setShowUpgradeModal(true);
  };

  const getButtonState = (tierLevel: number) => {
    // Once user has VIP 1, all upgrade buttons are disabled
    if (vipLevel > 0) {
      if (vipLevel === tierLevel) {
        return { text: `VIP ${tierLevel}`, disabled: true, isActive: true };
      } else if (vipLevel > tierLevel) {
        return { text: 'Completed', disabled: true, isActive: false };
      } else {
        return { text: 'Auto-upgrade at 100%', disabled: true, isActive: false };
      }
    }
    
    // Before any VIP purchase
    if (tierLevel === 1) {
      return { text: 'Upgrade Now', disabled: false, isActive: false };
    } else {
      return { text: 'Locked', disabled: true, isActive: false };
    }
  };

  return (
    <div className="flex-1 overflow-y-auto" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <TopBar />

      <div className="w-full max-w-[480px] md:max-w-[768px] lg:max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8 pb-20">
        <BackButton />
        
        <div className="text-center mb-8">
          <Crown className="w-16 h-16 mx-auto mb-4" style={{ color: '#FFD700' }} />
          <h1 className="text-3xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            VIP Membership
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Unlock premium features and start earning more today
          </p>
        </div>

        {/* Game Balance Card */}
        <div className="rounded-lg shadow-sm p-4 mb-6" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5" style={{ color: 'var(--blue-primary)' }} />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Game Wallet Balance</span>
            </div>
            <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {formatCurrency(gameBalance, true)}
            </span>
          </div>
        </div>

        {/* VIP Tiers */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {vipTiers.map((tier) => {
            const buttonState = getButtonState(tier.level);
            
            return (
              <div
                key={tier.level}
                className="rounded-2xl shadow-lg p-6 relative overflow-hidden transition-all"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: vipLevel === tier.level ? '2px solid var(--blue-primary)' : '1px solid var(--border-color)',
                  opacity: vipLevel < tier.level - 1 ? 0.6 : 1,
                }}
              >
                {/* Current Badge */}
                {vipLevel === tier.level && (
                  <div
                    className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: 'var(--blue-primary)' }}
                  >
                    Current
                  </div>
                )}

                <div className="text-center mb-4">
                  <VIPCrown level={tier.level as 1 | 2 | 3} size="lg" animate={vipLevel === tier.level} />
                </div>

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                    {tier.name}
                  </h3>
                  <div className="flex items-baseline justify-center gap-2">
                    {tier.isPaid ? (
                      <>
                        <span className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
                          ${tier.price}
                        </span>
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          one-time
                        </span>
                      </>
                    ) : (
                      <span className="text-xl font-bold" style={{ color: 'var(--blue-primary)' }}>
                        Earn via Progress
                      </span>
                    )}
                  </div>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                    {tier.isPaid ? 'One-time payment' : 'Unlock through engagement'}
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  {tier.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: 'rgba(45, 108, 223, 0.1)' }}
                      >
                        <Check className="w-3 h-3" style={{ color: 'var(--blue-primary)' }} />
                      </div>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {feature}
                      </p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleUpgradeClick(tier.level as 1 | 2 | 3)}
                  disabled={buttonState.disabled}
                  className="w-full py-3 rounded-xl font-bold text-white transition-all disabled:active:scale-100"
                  style={{
                    background: buttonState.isActive
                      ? 'linear-gradient(135deg, var(--blue-gradient-start) 0%, var(--blue-gradient-end) 100%)'
                      : buttonState.disabled
                      ? 'var(--bg-secondary)'
                      : 'linear-gradient(135deg, var(--blue-gradient-start) 0%, var(--blue-gradient-end) 100%)',
                    color: buttonState.disabled && !buttonState.isActive ? 'var(--text-secondary)' : 'white',
                    cursor: buttonState.disabled ? 'not-allowed' : 'pointer',
                    opacity: buttonState.disabled ? 0.6 : 1,
                    pointerEvents: buttonState.disabled ? 'none' : 'auto',
                  }}
                >
                  {buttonState.text}
                </button>
              </div>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="rounded-lg shadow-sm p-6" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
            💡 How VIP Works
          </h3>
          <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <li>• Start with VIP 1 for just $3</li>
            <li>• Progress to higher tiers by playing games and completing tasks</li>
            <li>• Each tier unlocks more benefits and higher earning potential</li>
            <li>• VIP status is permanent once unlocked</li>
          </ul>
        </div>
      </div>

      {/* VIP Upgrade Modal */}
      <VIPUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        targetLevel={targetLevel}
      />

      <style>{`
        .vip-button-transition {
          transition: all 0.3s ease;
        }
      `}</style>
    </div>
  );
}