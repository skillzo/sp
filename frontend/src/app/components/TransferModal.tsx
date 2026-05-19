import { useState } from 'react';
import { X, Gamepad2, ArrowRight } from 'lucide-react';
import { useUser } from '../context/UserContext';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  direction: 'toGame' | 'toMain';
  onSuccess: (amount: number) => void;
}

export function TransferModal({ isOpen, onClose, direction, onSuccess }: TransferModalProps) {
  const { balance, gameBalance, formatUSDT } = useUser();
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [step, setStep] = useState<'amount' | 'pin'>('amount');

  const sourceBalance = direction === 'toGame' ? balance : gameBalance;
  const sourceName = direction === 'toGame' ? 'Main Balance' : 'Game Balance';
  const destinationName = direction === 'toGame' ? 'Game Balance' : 'Main Balance';

  if (!isOpen) return null;

  const handleAmountSubmit = () => {
    const transferAmount = parseFloat(amount);
    
    if (!transferAmount || transferAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (transferAmount > sourceBalance) {
      alert('Insufficient balance');
      return;
    }

    setStep('pin');
  };

  const handlePinSubmit = () => {
    if (pin.length !== 4) {
      alert('Please enter a 4-digit PIN');
      return;
    }

    const transferAmount = parseFloat(amount);
    onSuccess(transferAmount);
    
    // Reset and close
    setAmount('');
    setPin('');
    setStep('amount');
    onClose();
  };

  const handleClose = () => {
    setAmount('');
    setPin('');
    setStep('amount');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md rounded-2xl p-6" style={{
        backgroundColor: 'var(--bg-card)',
      }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Transfer Funds
          </h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-secondary)'
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'amount' ? (
          <>
            {/* Transfer Direction */}
            <div className="mb-6 p-4 rounded-xl" style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)'
            }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--blue-primary)' }}>
                    <rect x="2" y="5" width="20" height="14" rx="2"/>
                    <path d="M2 10h20"/>
                  </svg>
                  <div>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{sourceName}</p>
                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{formatUSDT(sourceBalance)}</p>
                  </div>
                </div>

                <ArrowRight className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />

                <div className="flex items-center gap-2">
                  {direction === 'toGame' ? (
                    <Gamepad2 className="w-5 h-5" style={{ color: 'var(--blue-primary)' }} />
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--blue-primary)' }}>
                      <rect x="2" y="5" width="20" height="14" rx="2"/>
                      <path d="M2 10h20"/>
                    </svg>
                  )}
                  <div>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{destinationName}</p>
                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                      {formatUSDT(direction === 'toGame' ? gameBalance : balance)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Amount Input */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                Transfer Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold" style={{ color: 'var(--text-secondary)' }}>
                  $
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-lg font-bold"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                  }}
                  step="0.01"
                  min="0"
                  max={sourceBalance}
                />
              </div>
              <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                Available: {formatUSDT(sourceBalance)}
              </p>
            </div>

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              {[10, 25, 50, 100].map((quickAmount) => (
                <button
                  key={quickAmount}
                  onClick={() => setAmount(quickAmount.toString())}
                  className="py-2 rounded-lg font-semibold text-sm transition-all active:scale-95"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                  }}
                >
                  ${quickAmount}
                </button>
              ))}
            </div>

            {/* Continue Button */}
            <button
              onClick={handleAmountSubmit}
              className="w-full py-3 rounded-xl font-bold text-white transition-all active:scale-95"
              style={{
                backgroundColor: 'var(--blue-primary)',
              }}
            >
              Continue
            </button>
          </>
        ) : (
          <>
            {/* Transfer Summary */}
            <div className="mb-6 p-4 rounded-xl text-center" style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)'
            }}>
              <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                Transfer Amount
              </p>
              <p className="text-3xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                ${parseFloat(amount).toFixed(2)}
              </p>
              <div className="flex items-center justify-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                <span>{sourceName}</span>
                <ArrowRight className="w-4 h-4" />
                <span>{destinationName}</span>
              </div>
            </div>

            {/* PIN Input */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-3 text-center" style={{ color: 'var(--text-primary)' }}>
                Enter Transaction PIN
              </label>
              <div className="flex gap-3 justify-center mb-2">
                {[0, 1, 2, 3].map((index) => (
                  <input
                    key={index}
                    type="password"
                    maxLength={1}
                    value={pin[index] || ''}
                    onChange={(e) => {
                      const newPin = pin.split('');
                      newPin[index] = e.target.value;
                      setPin(newPin.join(''));
                      
                      // Auto-focus next input
                      if (e.target.value && index < 3) {
                        const nextInput = e.target.parentElement?.nextElementSibling?.querySelector('input');
                        nextInput?.focus();
                      }
                    }}
                    className="w-14 h-14 text-center text-2xl font-bold rounded-xl"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                    }}
                  />
                ))}
              </div>
              <p className="text-xs text-center mt-3" style={{ color: 'var(--text-secondary)' }}>
                Enter your 4-digit transaction PIN
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setStep('amount')}
                className="py-3 rounded-xl font-bold transition-all active:scale-95"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                }}
              >
                Back
              </button>
              <button
                onClick={handlePinSubmit}
                className="py-3 rounded-xl font-bold text-white transition-all active:scale-95"
                style={{
                  backgroundColor: 'var(--blue-primary)',
                }}
              >
                Confirm
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
