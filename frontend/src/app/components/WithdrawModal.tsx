import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { X } from 'lucide-react';
import { useUser } from '../context/UserContext';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (amount: number, type: 'naira' | 'usdt') => void;
}

export function WithdrawModal({ isOpen, onClose, onSuccess }: WithdrawModalProps) {
  const navigate = useNavigate();
  const { balance, gameBalance, userBankAccounts, userWallets, defaultBank, defaultWallet } = useUser();
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'naira' | 'usdt'>('naira');

  // Naira withdrawal states
  const [nairaAmount, setNairaAmount] = useState('');
  const [nairaStep, setNairaStep] = useState<'input' | 'confirm' | 'processing' | 'success' | 'pending'>('input');
  const [nairaError, setNairaError] = useState('');

  // USDT withdrawal states
  const [usdtAmount, setUsdtAmount] = useState('');
  const [usdtStep, setUsdtStep] = useState<'input' | 'confirm' | 'processing' | 'success' | 'pending'>('input');
  const [usdtError, setUsdtError] = useState('');

  // Session expiry (10 minutes)
  const [sessionTimer, setSessionTimer] = useState(600);
  const [sessionExpired, setSessionExpired] = useState(false);

  // Session timer countdown
  useEffect(() => {
    if (isOpen && !sessionExpired && sessionTimer > 0) {
      const interval = setInterval(() => {
        setSessionTimer(prev => {
          if (prev <= 1) {
            setSessionExpired(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isOpen, sessionExpired, sessionTimer]);

  // Reset session
  const resetSession = () => {
    setSessionTimer(600);
    setSessionExpired(false);
    setNairaStep('input');
    setUsdtStep('input');
    setNairaAmount('');
    setUsdtAmount('');
  };

  // NAIRA WITHDRAWAL HANDLERS
  const handleNairaContinue = () => {
    const amount = parseFloat(nairaAmount);
    if (!amount || amount < 1000) {
      setNairaError('Minimum withdrawal is ₦1,000');
      return;
    }
    if (amount > balance) {
      setNairaError('Insufficient balance');
      return;
    }

    if (!defaultBank) {
      setNairaError('No bank account found');
      return;
    }

    setNairaError('');
    setNairaStep('confirm');
  };

  const handleNairaConfirm = () => {
    setNairaStep('processing');
    
    setTimeout(() => {
      if (Math.random() > 0.3) {
        setNairaStep('pending');
      } else {
        setNairaStep('success');
      }
    }, 2000);
  };

  const handleNairaSuccess = () => {
    const amount = parseFloat(nairaAmount);
    onSuccess(amount, 'naira');
    onClose();
    resetNairaFlow();
  };

  const resetNairaFlow = () => {
    setNairaStep('input');
    setNairaAmount('');
    setNairaError('');
  };

  const handleQuickNairaAmount = (amount: number) => {
    setNairaAmount(amount.toString());
    setNairaError('');
  };

  // USDT WITHDRAWAL HANDLERS
  const handleUSDTContinue = () => {
    const amount = parseFloat(usdtAmount);
    if (!amount || amount < 5) {
      setUsdtError('Minimum withdrawal is 5 USDT');
      return;
    }
    if (amount > gameBalance) {
      setUsdtError('Insufficient balance');
      return;
    }

    if (!defaultWallet) {
      setUsdtError('No wallet address found');
      return;
    }

    setUsdtError('');
    setUsdtStep('confirm');
  };

  const handleUSDTConfirm = () => {
    setUsdtStep('processing');
    
    setTimeout(() => {
      if (Math.random() > 0.3) {
        setUsdtStep('pending');
      } else {
        setUsdtStep('success');
      }
    }, 2000);
  };

  const handleUSDTSuccess = () => {
    const amount = parseFloat(usdtAmount);
    onSuccess(amount, 'usdt');
    onClose();
    resetUSDTFlow();
  };

  const resetUSDTFlow = () => {
    setUsdtStep('input');
    setUsdtAmount('');
    setUsdtError('');
  };

  const handleCancel = () => {
    onClose();
    resetNairaFlow();
    resetUSDTFlow();
    resetSession();
  };

  const handleGoToSettings = () => {
    onClose();
    navigate('/settings');
  };

  if (!isOpen) return null;

  // Session expired state
  if (sessionExpired) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="rounded-lg shadow-lg max-w-md w-full p-8 text-center" style={{ backgroundColor: 'var(--bg-card)' }}>
          <div className="mb-6 mx-auto w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
            <div className="text-5xl">⏱</div>
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#EF4444' }}>
            Session expired
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            Your withdrawal session has timed out
          </p>
          <button
            onClick={resetSession}
            className="w-full py-3 rounded-lg text-white font-medium"
            style={{ backgroundColor: '#0A84FF' }}
          >
            Restart Withdrawal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="rounded-lg shadow-lg max-w-md w-full max-h-[85vh] overflow-y-auto" style={{ backgroundColor: 'var(--bg-card)' }}>
        
        {/* Close Button - Top Right */}
        <div className="sticky top-0 z-10 flex justify-end p-4 pb-0" style={{ backgroundColor: 'var(--bg-card)' }}>
          <button
            onClick={handleCancel}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ backgroundColor: 'var(--bg-accent)' }}
          >
            <X className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
          </button>
        </div>

        {/* TAB SWITCH - Only show on input steps */}
        {((activeTab === 'naira' && nairaStep === 'input') || (activeTab === 'usdt' && usdtStep === 'input')) && (
          <div className="px-6 pb-4">
            <div className="flex gap-2 p-1 rounded-lg" style={{ backgroundColor: 'var(--bg-accent)' }}>
              <button
                onClick={() => setActiveTab('naira')}
                className="flex-1 py-2 px-4 rounded-md font-medium transition-all text-sm"
                style={{
                  backgroundColor: activeTab === 'naira' ? '#0A84FF' : 'transparent',
                  color: activeTab === 'naira' ? 'white' : 'var(--text-primary)'
                }}
              >
                ₦ Naira
              </button>
              <button
                onClick={() => setActiveTab('usdt')}
                className="flex-1 py-2 px-4 rounded-md font-medium transition-all text-sm"
                style={{
                  backgroundColor: activeTab === 'usdt' ? '#0A84FF' : 'transparent',
                  color: activeTab === 'usdt' ? 'white' : 'var(--text-primary)'
                }}
              >
                USDT
              </button>
            </div>
          </div>
        )}

        {/* NAIRA TAB CONTENT */}
        {activeTab === 'naira' && (
          <>
            {/* NAIRA - STEP 1: INPUT */}
            {nairaStep === 'input' && (
              <div className="px-6 pb-6">
                <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  Withdraw Funds
                </h2>

                {/* Balance Card */}
                <div className="p-3 rounded-lg mb-3" style={{ backgroundColor: 'var(--bg-accent)' }}>
                  <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>NGN Balance</p>
                  <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    ₦{Math.floor(balance).toLocaleString()}
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      Enter Amount (₦)
                    </label>
                    <input
                      type="number"
                      value={nairaAmount}
                      onChange={(e) => {
                        setNairaAmount(e.target.value);
                        setNairaError('');
                      }}
                      placeholder="₦0"
                      className="w-full px-4 py-2.5 border rounded-lg"
                      style={{ 
                        borderColor: nairaError ? '#EF4444' : 'var(--border-color)', 
                        color: 'var(--text-primary)',
                        backgroundColor: 'var(--bg-secondary)'
                      }}
                    />
                    {nairaError && (
                      <p className="text-xs mt-1" style={{ color: '#EF4444' }}>
                        {nairaError}
                      </p>
                    )}
                  </div>

                  {/* Quick Amount Chips */}
                  <div className="grid grid-cols-4 gap-2">
                    {[5000, 10000, 20000, 50000].map(amount => (
                      <button
                        key={amount}
                        onClick={() => handleQuickNairaAmount(amount)}
                        className="py-2 rounded-lg font-medium text-xs transition-all"
                        style={{ 
                          backgroundColor: 'var(--bg-accent)', 
                          color: nairaAmount === amount.toString() ? '#0A84FF' : 'var(--text-primary)',
                          border: nairaAmount === amount.toString() ? '2px solid #0A84FF' : '2px solid transparent'
                        }}
                      >
                        ₦{(amount / 1000)}k
                      </button>
                    ))}
                  </div>

                  {/* Helper Text */}
                  <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(10, 132, 255, 0.1)' }}>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      Minimum withdrawal: ₦1,000
                    </p>
                  </div>

                  {/* Bank Account Check */}
                  {!defaultBank ? (
                    <div className="p-3 rounded-lg border-2" style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', borderColor: '#EF4444' }}>
                      <div className="text-center mb-2">
                        <div className="text-3xl mb-1">🚫</div>
                        <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
                          No Bank Account Found
                        </h3>
                        <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
                          Add a bank account before withdrawing
                        </p>
                      </div>
                      <button
                        onClick={handleGoToSettings}
                        className="w-full py-2 rounded-lg text-white font-medium text-sm"
                        style={{ backgroundColor: '#0A84FF' }}
                      >
                        Go to Settings
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg border-2" style={{ backgroundColor: 'var(--bg-accent)', borderColor: '#0A84FF' }}>
                      <div className="flex items-start justify-between mb-1">
                        <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>🏦 Bank Account</p>
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#0A84FF', color: 'white' }}>⭐ Default</span>
                      </div>
                      <p className="text-sm font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>{defaultBank.bankName}</p>
                      <p className="text-xs mb-0.5" style={{ color: 'var(--text-primary)' }}>{defaultBank.accountNumber}</p>
                      <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>{defaultBank.accountName}</p>
                      <button
                        onClick={handleGoToSettings}
                        className="text-xs font-medium"
                        style={{ color: '#0A84FF' }}
                      >
                        [ Manage in Settings ]
                      </button>
                    </div>
                  )}

                  <button
                    onClick={handleNairaContinue}
                    disabled={!nairaAmount || parseFloat(nairaAmount) < 1000 || !defaultBank}
                    className="w-full py-2.5 rounded-lg text-white font-medium transition-all text-sm"
                    style={{ 
                      backgroundColor: nairaAmount && parseFloat(nairaAmount) >= 1000 && defaultBank ? '#0A84FF' : '#9CA3AF',
                      cursor: nairaAmount && parseFloat(nairaAmount) >= 1000 && defaultBank ? 'pointer' : 'not-allowed',
                      opacity: nairaAmount && parseFloat(nairaAmount) >= 1000 && defaultBank ? 1 : 0.6
                    }}
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* NAIRA - STEP 2: CONFIRM */}
            {nairaStep === 'confirm' && (
              <div className="px-6 pb-6">
                <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  Confirm Withdrawal
                </h2>

                {/* Summary */}
                <div className="p-3 rounded-lg mb-3 space-y-2" style={{ backgroundColor: 'var(--bg-accent)' }}>
                  <div className="flex justify-between">
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Amount</p>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>₦{Math.floor(parseFloat(nairaAmount)).toLocaleString()}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Fee</p>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>₦0</p>
                  </div>
                  <div className="pt-2 border-t flex justify-between" style={{ borderColor: 'var(--border-color)' }}>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>You Receive</p>
                    <p className="text-base font-bold" style={{ color: '#10B981' }}>₦{Math.floor(parseFloat(nairaAmount)).toLocaleString()}</p>
                  </div>
                </div>

                {/* Bank Details */}
                {defaultBank && (
                  <div className="p-3 rounded-lg mb-3" style={{ backgroundColor: 'var(--bg-accent)' }}>
                    <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Withdrawal To:</p>
                    <p className="text-sm font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>{defaultBank.bankName}</p>
                    <p className="text-xs mb-0.5" style={{ color: 'var(--text-primary)' }}>{defaultBank.accountNumber}</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{defaultBank.accountName}</p>
                  </div>
                )}

                {/* Warning */}
                <div className="p-2 rounded-lg mb-3" style={{ backgroundColor: 'rgba(251, 191, 36, 0.1)', borderLeft: '3px solid #FBBF24' }}>
                  <p className="text-xs font-medium" style={{ color: '#FBBF24' }}>⚠️ Withdrawals are irreversible</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setNairaStep('input')}
                    className="flex-1 py-2.5 rounded-lg border-2 font-medium text-sm"
                    style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleNairaConfirm}
                    className="flex-1 py-2.5 rounded-lg text-white font-medium text-sm"
                    style={{ backgroundColor: '#0A84FF' }}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            )}

            {/* NAIRA - PROCESSING */}
            {nairaStep === 'processing' && (
              <div className="p-8 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#0A84FF', borderTopColor: 'transparent' }}></div>
                </div>
                <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                  Processing...
                </h2>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Please wait
                </p>
              </div>
            )}

            {/* NAIRA - SUCCESS */}
            {nairaStep === 'success' && (
              <div className="p-6 text-center">
                <div className="mb-4 mx-auto w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                  <div className="text-4xl">✓</div>
                </div>
                <h2 className="text-xl font-bold mb-2" style={{ color: '#10B981' }}>
                  Withdrawal successful
                </h2>
                <p className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                  ₦{Math.floor(parseFloat(nairaAmount)).toLocaleString()}
                </p>
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                  sent to your bank account
                </p>
                <button
                  onClick={handleNairaSuccess}
                  className="w-full py-2.5 rounded-lg text-white font-medium"
                  style={{ backgroundColor: '#0A84FF' }}
                >
                  Done
                </button>
              </div>
            )}

            {/* NAIRA - PENDING */}
            {nairaStep === 'pending' && (
              <div className="p-6 text-center">
                <div className="mb-4 mx-auto w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(251, 191, 36, 0.1)' }}>
                  <div className="text-4xl">⏳</div>
                </div>
                <h2 className="text-xl font-bold mb-2" style={{ color: '#FBBF24' }}>
                  Processing
                </h2>
                <p className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                  ₦{Math.floor(parseFloat(nairaAmount)).toLocaleString()}
                </p>
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                  Will arrive in 5-30 minutes
                </p>
                <button
                  onClick={handleNairaSuccess}
                  className="w-full py-2.5 rounded-lg text-white font-medium"
                  style={{ backgroundColor: '#0A84FF' }}
                >
                  Done
                </button>
              </div>
            )}
          </>
        )}

        {/* USDT TAB CONTENT */}
        {activeTab === 'usdt' && (
          <>
            {/* USDT - STEP 1: INPUT */}
            {usdtStep === 'input' && (
              <div className="px-6 pb-6">
                <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  Withdraw USDT
                </h2>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      Amount (USDT)
                    </label>
                    <input
                      type="number"
                      value={usdtAmount}
                      onChange={(e) => {
                        setUsdtAmount(e.target.value);
                        setUsdtError('');
                      }}
                      placeholder="0.00"
                      className="w-full px-4 py-2.5 border rounded-lg"
                      style={{ 
                        borderColor: usdtError ? '#EF4444' : 'var(--border-color)', 
                        color: 'var(--text-primary)',
                        backgroundColor: 'var(--bg-secondary)'
                      }}
                    />
                    {usdtError && (
                      <p className="text-xs mt-1" style={{ color: '#EF4444' }}>
                        {usdtError}
                      </p>
                    )}
                  </div>

                  <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(10, 132, 255, 0.1)' }}>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      Minimum: 5 USDT
                    </p>
                  </div>

                  {/* Wallet Check */}
                  {!defaultWallet ? (
                    <div className="p-3 rounded-lg border-2" style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', borderColor: '#EF4444' }}>
                      <div className="text-center mb-2">
                        <div className="text-3xl mb-1">🚫</div>
                        <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
                          No USDT Wallet Found
                        </h3>
                        <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
                          Add a wallet address before withdrawing
                        </p>
                      </div>
                      <button
                        onClick={handleGoToSettings}
                        className="w-full py-2 rounded-lg text-white font-medium text-sm"
                        style={{ backgroundColor: '#0A84FF' }}
                      >
                        Go to Settings
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg border-2" style={{ backgroundColor: 'var(--bg-accent)', borderColor: '#0A84FF' }}>
                      <div className="flex items-start justify-between mb-1">
                        <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>🌐 USDT Wallet</p>
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#0A84FF', color: 'white' }}>⭐ Default</span>
                      </div>
                      <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Network: {defaultWallet.network}</p>
                      <p className="text-xs font-mono mb-2 break-all" style={{ color: 'var(--text-primary)' }}>
                        {defaultWallet.address.slice(0, 10)}...{defaultWallet.address.slice(-6)}
                      </p>
                      <button
                        onClick={handleGoToSettings}
                        className="text-xs font-medium"
                        style={{ color: '#0A84FF' }}
                      >
                        [ Manage in Settings ]
                      </button>
                    </div>
                  )}

                  <button
                    onClick={handleUSDTContinue}
                    disabled={!usdtAmount || parseFloat(usdtAmount) < 5 || !defaultWallet}
                    className="w-full py-2.5 rounded-lg text-white font-medium text-sm"
                    style={{ 
                      backgroundColor: usdtAmount && parseFloat(usdtAmount) >= 5 && defaultWallet ? '#0A84FF' : '#9CA3AF',
                      cursor: usdtAmount && parseFloat(usdtAmount) >= 5 && defaultWallet ? 'pointer' : 'not-allowed',
                      opacity: usdtAmount && parseFloat(usdtAmount) >= 5 && defaultWallet ? 1 : 0.6
                    }}
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* USDT - STEP 2: CONFIRM */}
            {usdtStep === 'confirm' && (
              <div className="px-6 pb-6">
                <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  Confirm Withdrawal
                </h2>

                {/* Summary */}
                <div className="p-3 rounded-lg mb-3 space-y-2" style={{ backgroundColor: 'var(--bg-accent)' }}>
                  <div className="flex justify-between">
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Amount</p>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{usdtAmount} USDT</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Network Fee</p>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>0.5 USDT</p>
                  </div>
                  <div className="pt-2 border-t flex justify-between" style={{ borderColor: 'var(--border-color)' }}>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>You Receive</p>
                    <p className="text-base font-bold" style={{ color: '#10B981' }}>{(parseFloat(usdtAmount) - 0.5).toFixed(1)} USDT</p>
                  </div>
                </div>

                {/* Wallet Details */}
                {defaultWallet && (
                  <div className="p-3 rounded-lg mb-3" style={{ backgroundColor: 'var(--bg-accent)' }}>
                    <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Withdrawal To:</p>
                    <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Network: {defaultWallet.network}</p>
                    <p className="text-xs font-mono break-all" style={{ color: 'var(--text-primary)' }}>{defaultWallet.address}</p>
                  </div>
                )}

                {/* Warning */}
                <div className="p-2 rounded-lg mb-3" style={{ backgroundColor: 'rgba(251, 191, 36, 0.1)', borderLeft: '3px solid #FBBF24' }}>
                  <p className="text-xs font-medium" style={{ color: '#FBBF24' }}>⚠️ Withdrawals are irreversible</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setUsdtStep('input')}
                    className="flex-1 py-2.5 rounded-lg border-2 font-medium text-sm"
                    style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUSDTConfirm}
                    className="flex-1 py-2.5 rounded-lg text-white font-medium text-sm"
                    style={{ backgroundColor: '#0A84FF' }}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            )}

            {/* USDT - PROCESSING */}
            {usdtStep === 'processing' && (
              <div className="p-8 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#0A84FF', borderTopColor: 'transparent' }}></div>
                </div>
                <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                  Sending...
                </h2>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Please wait
                </p>
              </div>
            )}

            {/* USDT - SUCCESS */}
            {usdtStep === 'success' && (
              <div className="p-6 text-center">
                <div className="mb-4 mx-auto w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                  <div className="text-4xl">✓</div>
                </div>
                <h2 className="text-xl font-bold mb-2" style={{ color: '#10B981' }}>
                  USDT sent successfully
                </h2>
                <p className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                  {usdtAmount} USDT
                </p>
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                  sent to your wallet
                </p>
                <button
                  onClick={handleUSDTSuccess}
                  className="w-full py-2.5 rounded-lg text-white font-medium"
                  style={{ backgroundColor: '#0A84FF' }}
                >
                  Done
                </button>
              </div>
            )}

            {/* USDT - PENDING */}
            {usdtStep === 'pending' && (
              <div className="p-6 text-center">
                <div className="mb-4 mx-auto w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(251, 191, 36, 0.1)' }}>
                  <div className="text-4xl">⏳</div>
                </div>
                <h2 className="text-xl font-bold mb-2" style={{ color: '#FBBF24' }}>
                  Processing
                </h2>
                <p className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                  {usdtAmount} USDT
                </p>
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                  Awaiting blockchain confirmation
                </p>
                <button
                  onClick={handleUSDTSuccess}
                  className="w-full py-2.5 rounded-lg text-white font-medium"
                  style={{ backgroundColor: '#0A84FF' }}
                >
                  Done
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
