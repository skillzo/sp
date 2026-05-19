import { CheckCircle, Gift, X } from 'lucide-react';

interface SuccessCardProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  amount: number;
  from?: string;
  to?: string;
  icon?: 'check' | 'gift';
  buttonText?: string;
}

export function SuccessCard({
  isOpen,
  onClose,
  title,
  message,
  amount,
  from,
  to,
  icon = 'check',
  buttonText = 'Done'
}: SuccessCardProps) {
  if (!isOpen) return null;

  const IconComponent = icon === 'gift' ? Gift : CheckCircle;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div 
        className="rounded-2xl shadow-xl max-w-md w-full p-8 text-center relative"
        style={{ backgroundColor: 'var(--bg-card)' }}
      >
        {/* Success Icon */}
        <div className="relative mb-6">
          <div 
            className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
            style={{ 
              backgroundColor: 'rgba(52, 211, 153, 0.15)',
            }}
          >
            <IconComponent className="w-10 h-10" style={{ color: '#34D399' }} />
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h2>
        
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          {message}
        </p>

        {/* Transaction Details */}
        <div 
          className="py-5 px-6 rounded-xl mb-6 space-y-3"
          style={{ backgroundColor: 'var(--bg-accent)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Amount:</span>
            <span className="text-lg font-bold" style={{ color: '#34D399' }}>
              ${Math.floor(amount).toLocaleString()} USDT
            </span>
          </div>
          
          {from && (
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>From:</span>
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {from}
              </span>
            </div>
          )}
          
          {to && (
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>To:</span>
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {to}
              </span>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-lg text-white font-medium transition-transform active:scale-95"
          style={{ backgroundColor: '#34D399' }}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}
