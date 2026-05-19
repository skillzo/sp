import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (amount: number) => void;
  onUSDTSuccess?: (amount: number) => void;
}

export function DepositModal({ isOpen, onClose, onSuccess, onUSDTSuccess }: DepositModalProps) {
  // Tab state
  const [activeTab, setActiveTab] = useState<'naira' | 'usdt'>('naira');

  // Naira deposit states
  const [depositAmount, setDepositAmount] = useState('');
  const [depositStep, setDepositStep] = useState<'input' | 'instructions' | 'processing' | 'success'>('input');
  const [depositTimer, setDepositTimer] = useState(900);
  const [depositAccountNumber, setDepositAccountNumber] = useState('');
  const [depositError, setDepositError] = useState('');

  // USDT deposit states
  const [usdtAmount, setUsdtAmount] = useState('');
  const [usdtStep, setUsdtStep] = useState<'input' | 'instructions' | 'hash' | 'verifying' | 'success' | 'error' | 'expired'>('input');
  const [usdtTimer, setUsdtTimer] = useState(600); // 10 minutes
  const [usdtWalletAddress] = useState('0xA7f92Ks8d2F3m9Lp4Hj7Nk5Qr6Ts8Vw3Xy9Z93Kd');
  const [usdtTxHash, setUsdtTxHash] = useState('');
  const [usdtError, setUsdtError] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);

  // Naira timer countdown
  useEffect(() => {
    if (depositStep === 'instructions' && depositTimer > 0) {
      const interval = setInterval(() => {
        setDepositTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [depositStep, depositTimer]);

  // USDT timer countdown
  useEffect(() => {
    if (usdtStep === 'instructions' && usdtTimer > 0) {
      const interval = setInterval(() => {
        setUsdtTimer(prev => {
          if (prev <= 1) {
            setUsdtStep('expired');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [usdtStep, usdtTimer]);

  // ============================================
  // NAIRA DEPOSIT HANDLERS
  // ============================================
  const handleDepositProceed = () => {
    const amount = parseFloat(depositAmount);
    if (!amount || amount < 1000) {
      setDepositError('Minimum deposit is ₦1,000');
      return;
    }
    
    setDepositError('');
    const accountNum = '30' + Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    setDepositAccountNumber(accountNum);
    setDepositTimer(900);
    setDepositStep('instructions');
  };

  const handleDepositPaid = () => {
    setDepositStep('processing');
    setTimeout(() => {
      setDepositStep('success');
    }, 3000);
  };

  const handleDepositSuccess = () => {
    const amount = parseFloat(depositAmount);
    onSuccess(amount);
    onClose();
    setDepositStep('input');
    setDepositAmount('');
    setDepositError('');
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(depositAccountNumber);
    toast.success('Copied!');
  };

  const handleCopyAmount = () => {
    navigator.clipboard.writeText(depositAmount);
    toast.success('Copied!');
  };

  const handleQuickAmount = (amount: number) => {
    setDepositAmount(amount.toString());
    setDepositError('');
  };

  const formatDepositTimer = () => {
    const mins = Math.floor(depositTimer / 60);
    const secs = depositTimer % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ============================================
  // USDT DEPOSIT HANDLERS
  // ============================================
  const handleUSDTGenerate = () => {
    const amount = parseFloat(usdtAmount);
    if (!amount || amount < 5) {
      setUsdtError('Minimum deposit is 5 USDT');
      return;
    }
    
    setUsdtError('');
    setUsdtTimer(600);
    setUsdtStep('instructions');
  };

  const handleUSDTProceedToHash = () => {
    setUsdtStep('hash');
  };

  const handleUSDTVerify = () => {
    if (!usdtTxHash || usdtTxHash.length < 10) {
      setUsdtError('Please enter a valid transaction hash');
      return;
    }

    setUsdtError('');
    setUsdtStep('verifying');

    // Simulate verification
    setTimeout(() => {
      // 80% success rate for demo
      if (Math.random() > 0.2) {
        setUsdtStep('success');
      } else {
        setUsdtStep('error');
      }
    }, 3000);
  };

  const handleUSDTSuccess = () => {
    const amount = parseFloat(usdtAmount);
    if (onUSDTSuccess) {
      onUSDTSuccess(amount);
    }
    onClose();
    resetUSDTFlow();
  };

  const handleCopyUSDTAddress = () => {
    navigator.clipboard.writeText(usdtWalletAddress);
    toast.success('Copied!');
  };

  const handleCopyUSDTAmount = () => {
    navigator.clipboard.writeText(usdtAmount);
    toast.success('Copied!');
  };

  const formatUSDTTimer = () => {
    const mins = Math.floor(usdtTimer / 60);
    const secs = usdtTimer % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const resetUSDTFlow = () => {
    setUsdtStep('input');
    setUsdtAmount('');
    setUsdtTxHash('');
    setUsdtError('');
    setShowQRCode(false);
  };

  const handleCancel = () => {
    onClose();
    setDepositStep('input');
    setDepositAmount('');
    setDepositError('');
    resetUSDTFlow();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="rounded-lg shadow-lg max-w-md w-full" style={{ backgroundColor: 'var(--bg-card)' }}>
        
        {/* TAB SWITCH - Only show on input steps */}
        {((activeTab === 'naira' && depositStep === 'input') || (activeTab === 'usdt' && usdtStep === 'input')) && (
          <div className="p-6 pb-0">
            <div className="flex gap-2 p-1 rounded-lg mb-4" style={{ backgroundColor: 'var(--bg-accent)' }}>
              <button
                onClick={() => setActiveTab('naira')}
                className="flex-1 py-2 px-4 rounded-md font-medium transition-all"
                style={{
                  backgroundColor: activeTab === 'naira' ? '#0A84FF' : 'transparent',
                  color: activeTab === 'naira' ? 'white' : 'var(--text-primary)'
                }}
              >
                ₦ Naira
              </button>
              <button
                onClick={() => setActiveTab('usdt')}
                className="flex-1 py-2 px-4 rounded-md font-medium transition-all"
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

        {/* ============================================ */}
        {/* NAIRA TAB CONTENT */}
        {/* ============================================ */}
        {activeTab === 'naira' && (
          <>
            {/* NAIRA - STEP 1: INPUT */}
            {depositStep === 'input' && (
              <div className="p-6 pt-0">
                <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Deposit Funds
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      Enter Amount (₦)
                    </label>
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => {
                        setDepositAmount(e.target.value);
                        setDepositError('');
                      }}
                      placeholder="₦0.00"
                      className="w-full px-4 py-3 border rounded-lg text-lg"
                      style={{ 
                        borderColor: depositError ? '#EF4444' : 'var(--border-color)', 
                        color: 'var(--text-primary)',
                        backgroundColor: 'var(--bg-secondary)'
                      }}
                    />
                    {depositError && (
                      <p className="text-sm mt-1" style={{ color: '#EF4444' }}>
                        {depositError}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {[5000, 10000, 20000, 50000].map(amount => (
                      <button
                        key={amount}
                        onClick={() => handleQuickAmount(amount)}
                        className="py-2 px-3 rounded-lg font-medium text-sm transition-all hover:scale-105"
                        style={{ 
                          backgroundColor: 'var(--bg-accent)', 
                          color: depositAmount === amount.toString() ? '#0A84FF' : 'var(--text-primary)',
                          border: depositAmount === amount.toString() ? '2px solid #0A84FF' : '2px solid transparent'
                        }}
                      >
                        ₦{(amount / 1000)}k
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      Payment Method
                    </label>
                    <div className="p-3 rounded-lg border-2 cursor-pointer" style={{ backgroundColor: 'var(--bg-accent)', borderColor: '#0A84FF' }}>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Bank Transfer</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Instant processing</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(10, 132, 255, 0.1)' }}>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      💡 Funds will be added to your NGN wallet
                    </p>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={handleCancel}
                      className="flex-1 py-3 rounded-lg border-2 font-medium"
                      style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDepositProceed}
                      disabled={!depositAmount || parseFloat(depositAmount) < 1000}
                      className="flex-1 py-3 rounded-lg text-white font-medium transition-all"
                      style={{ 
                        backgroundColor: depositAmount && parseFloat(depositAmount) >= 1000 ? '#0A84FF' : '#9CA3AF',
                        cursor: depositAmount && parseFloat(depositAmount) >= 1000 ? 'pointer' : 'not-allowed',
                        opacity: depositAmount && parseFloat(depositAmount) >= 1000 ? 1 : 0.6
                      }}
                    >
                      Proceed to Deposit
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* NAIRA - STEP 2: INSTRUCTIONS */}
            {depositStep === 'instructions' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Complete Your Payment
                </h2>

                <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: 'var(--bg-accent)' }}>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Bank Name</p>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Providus Bank</p>
                    </div>
                    <div>
                      <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Account Name</p>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Gaming Platform NGN</p>
                    </div>
                    <div>
                      <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Account Number</p>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-2xl font-bold" style={{ color: '#0A84FF' }}>{depositAccountNumber}</p>
                        <button
                          onClick={handleCopyAccount}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95"
                          style={{ backgroundColor: '#0A84FF', color: 'white' }}
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                    <div className="pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
                      <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Amount to Pay</p>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-2xl font-bold" style={{ color: '#10B981' }}>₦{Math.floor(parseFloat(depositAmount)).toLocaleString()}</p>
                        <button
                          onClick={handleCopyAmount}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95"
                          style={{ backgroundColor: '#10B981', color: 'white' }}
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg mb-4" style={{ backgroundColor: depositTimer <= 60 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(10, 132, 255, 0.1)' }}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium" style={{ color: depositTimer <= 60 ? '#EF4444' : '#0A84FF' }}>
                      Account expires in
                    </p>
                    <p className="text-lg font-bold" style={{ color: depositTimer <= 60 ? '#EF4444' : '#0A84FF' }}>
                      {formatDepositTimer()}
                    </p>
                  </div>
                  {depositTimer <= 0 && (
                    <button
                      onClick={() => {
                        const accountNum = '30' + Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
                        setDepositAccountNumber(accountNum);
                        setDepositTimer(900);
                      }}
                      className="w-full mt-2 py-2 rounded-lg text-white font-medium"
                      style={{ backgroundColor: '#EF4444' }}
                    >
                      Generate New Account
                    </button>
                  )}
                </div>

                <div className="p-3 rounded-lg mb-4" style={{ backgroundColor: 'rgba(251, 191, 36, 0.1)', borderLeft: '3px solid #FBBF24' }}>
                  <p className="text-xs font-medium mb-1" style={{ color: '#FBBF24' }}>⚠️ Important</p>
                  <ul className="text-xs space-y-1" style={{ color: 'var(--text-secondary)' }}>
                    <li>• Send the EXACT amount to avoid delay</li>
                    <li>• This account is valid for one-time use only</li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setDepositStep('input');
                      setDepositTimer(900);
                    }}
                    className="flex-1 py-3 rounded-lg border-2 font-medium"
                    style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDepositPaid}
                    disabled={depositTimer <= 0}
                    className="flex-1 py-3 rounded-lg text-white font-medium transition-all"
                    style={{ 
                      backgroundColor: depositTimer > 0 ? '#0A84FF' : '#9CA3AF',
                      cursor: depositTimer > 0 ? 'pointer' : 'not-allowed',
                      opacity: depositTimer > 0 ? 1 : 0.6
                    }}
                  >
                    I Have Paid
                  </button>
                </div>
              </div>
            )}

            {/* NAIRA - STEP 3: PROCESSING */}
            {depositStep === 'processing' && (
              <div className="p-12 text-center">
                <div className="mb-6 flex justify-center">
                  <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#0A84FF', borderTopColor: 'transparent' }}></div>
                </div>
                <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Confirming your payment…
                </h2>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  This may take a few seconds
                </p>
              </div>
            )}

            {/* NAIRA - STEP 4: SUCCESS */}
            {depositStep === 'success' && (
              <div className="p-8 text-center">
                <div className="mb-6 mx-auto w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                  <div className="text-5xl">✓</div>
                </div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: '#10B981' }}>
                  Deposit Successful
                </h2>
                <p className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                  ₦{Math.floor(parseFloat(depositAmount)).toLocaleString()}
                </p>
                <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                  credited to your wallet
                </p>
                <button
                  onClick={handleDepositSuccess}
                  className="w-full py-3 rounded-lg text-white font-medium transition-all active:scale-95"
                  style={{ backgroundColor: '#0A84FF' }}
                >
                  Continue
                </button>
              </div>
            )}
          </>
        )}

        {/* ============================================ */}
        {/* USDT TAB CONTENT */}
        {/* ============================================ */}
        {activeTab === 'usdt' && (
          <>
            {/* USDT - STEP 1: INPUT */}
            {usdtStep === 'input' && (
              <div className="p-6 pt-0">
                <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Deposit USDT
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      Enter Amount (USDT)
                    </label>
                    <input
                      type="number"
                      value={usdtAmount}
                      onChange={(e) => {
                        setUsdtAmount(e.target.value);
                        setUsdtError('');
                      }}
                      placeholder="0.00"
                      className="w-full px-4 py-3 border rounded-lg text-lg"
                      style={{ 
                        borderColor: usdtError ? '#EF4444' : 'var(--border-color)', 
                        color: 'var(--text-primary)',
                        backgroundColor: 'var(--bg-secondary)'
                      }}
                    />
                    {usdtError && (
                      <p className="text-sm mt-1" style={{ color: '#EF4444' }}>
                        {usdtError}
                      </p>
                    )}
                  </div>

                  <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(10, 132, 255, 0.1)' }}>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      Minimum deposit: 5 USDT
                    </p>
                  </div>

                  <button
                    onClick={handleUSDTGenerate}
                    disabled={!usdtAmount || parseFloat(usdtAmount) < 5}
                    className="w-full py-3 rounded-lg text-white font-medium transition-all"
                    style={{ 
                      backgroundColor: usdtAmount && parseFloat(usdtAmount) >= 5 ? '#0A84FF' : '#9CA3AF',
                      cursor: usdtAmount && parseFloat(usdtAmount) >= 5 ? 'pointer' : 'not-allowed',
                      opacity: usdtAmount && parseFloat(usdtAmount) >= 5 ? 1 : 0.6
                    }}
                  >
                    Generate Deposit
                  </button>
                </div>
              </div>
            )}

            {/* USDT - STEP 2: INSTRUCTIONS */}
            {usdtStep === 'instructions' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Deposit USDT
                  </h2>
                  <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg" style={{ backgroundColor: usdtTimer <= 120 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(10, 132, 255, 0.1)' }}>
                    <span className="text-sm">⏱</span>
                    <span className="text-sm font-bold" style={{ color: usdtTimer <= 120 ? '#EF4444' : '#0A84FF' }}>
                      {formatUSDTTimer()}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: 'var(--bg-accent)' }}>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Send EXACT amount</p>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-2xl font-bold" style={{ color: '#0A84FF' }}>{usdtAmount} USDT</p>
                        <button
                          onClick={handleCopyUSDTAmount}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95"
                          style={{ backgroundColor: '#0A84FF', color: 'white' }}
                        >
                          Copy Amount
                        </button>
                      </div>
                    </div>

                    <div className="pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
                      <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Network</p>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>BSC (BEP20)</p>
                    </div>

                    <div className="pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
                      <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>Wallet Address</p>
                      <p className="text-xs font-mono mb-2 break-all" style={{ color: 'var(--text-primary)' }}>
                        {usdtWalletAddress}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={handleCopyUSDTAddress}
                          className="flex-1 py-2 rounded-lg text-xs font-medium transition-all active:scale-95"
                          style={{ backgroundColor: '#0A84FF', color: 'white' }}
                        >
                          Copy Address
                        </button>
                        <button
                          onClick={() => setShowQRCode(!showQRCode)}
                          className="flex-1 py-2 rounded-lg text-xs font-medium transition-all active:scale-95"
                          style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                        >
                          {showQRCode ? 'Hide QR' : 'Show QR Code'}
                        </button>
                      </div>
                    </div>

                    {showQRCode && (
                      <div className="pt-3 border-t flex justify-center" style={{ borderColor: 'var(--border-color)' }}>
                        <div className="p-4 rounded-lg" style={{ backgroundColor: 'white' }}>
                          <div className="w-40 h-40 flex items-center justify-center" style={{ backgroundColor: '#E5E7EB' }}>
                            <p className="text-xs text-center px-2" style={{ color: '#6B7280' }}>QR Code<br/>(Demo)</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-lg mb-4" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderLeft: '3px solid #EF4444' }}>
                  <p className="text-xs font-medium mb-1" style={{ color: '#EF4444' }}>⚠️ Warning</p>
                  <ul className="text-xs space-y-1" style={{ color: 'var(--text-secondary)' }}>
                    <li>• Send only USDT via BSC (BEP20)</li>
                    <li>• Amount must match exactly</li>
                    <li>• Wrong network or token will result in loss of funds</li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleCancel}
                    className="flex-1 py-3 rounded-lg border-2 font-medium"
                    style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUSDTProceedToHash}
                    className="flex-1 py-3 rounded-lg text-white font-medium transition-all"
                    style={{ backgroundColor: '#0A84FF' }}
                  >
                    I Have Sent Payment
                  </button>
                </div>
              </div>
            )}

            {/* USDT - STEP 3: SUBMIT HASH */}
            {usdtStep === 'hash' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Confirm Payment
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      Enter Transaction Hash (TxID)
                    </label>
                    <input
                      type="text"
                      value={usdtTxHash}
                      onChange={(e) => {
                        setUsdtTxHash(e.target.value);
                        setUsdtError('');
                      }}
                      placeholder="0x8392ab...kdl3"
                      className="w-full px-4 py-3 border rounded-lg text-sm font-mono"
                      style={{ 
                        borderColor: usdtError ? '#EF4444' : 'var(--border-color)', 
                        color: 'var(--text-primary)',
                        backgroundColor: 'var(--bg-secondary)'
                      }}
                    />
                    <p className="text-xs mt-1" style={{ color: usdtError ? '#EF4444' : 'var(--text-secondary)' }}>
                      {usdtError || 'Paste the transaction hash from your wallet'}
                    </p>
                  </div>

                  <button
                    onClick={handleUSDTVerify}
                    disabled={!usdtTxHash || usdtTxHash.length < 10}
                    className="w-full py-3 rounded-lg text-white font-medium transition-all"
                    style={{ 
                      backgroundColor: usdtTxHash && usdtTxHash.length >= 10 ? '#0A84FF' : '#9CA3AF',
                      cursor: usdtTxHash && usdtTxHash.length >= 10 ? 'pointer' : 'not-allowed',
                      opacity: usdtTxHash && usdtTxHash.length >= 10 ? 1 : 0.6
                    }}
                  >
                    Verify Payment
                  </button>
                </div>
              </div>
            )}

            {/* USDT - STEP 4: VERIFYING */}
            {usdtStep === 'verifying' && (
              <div className="p-12 text-center">
                <div className="mb-6 flex justify-center">
                  <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#0A84FF', borderTopColor: 'transparent' }}></div>
                </div>
                <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  🔄 Verifying transaction...
                </h2>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Please wait while we confirm your deposit
                </p>
              </div>
            )}

            {/* USDT - SUCCESS */}
            {usdtStep === 'success' && (
              <div className="p-8 text-center">
                <div className="mb-6 mx-auto w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                  <div className="text-5xl">✓</div>
                </div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: '#10B981' }}>
                  ✅ Deposit Confirmed
                </h2>
                <p className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                  +{usdtAmount} USDT
                </p>
                <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                  added to wallet
                </p>
                <button
                  onClick={handleUSDTSuccess}
                  className="w-full py-3 rounded-lg text-white font-medium transition-all active:scale-95"
                  style={{ backgroundColor: '#0A84FF' }}
                >
                  Continue
                </button>
              </div>
            )}

            {/* USDT - ERROR */}
            {usdtStep === 'error' && (
              <div className="p-8 text-center">
                <div className="mb-6 mx-auto w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                  <div className="text-5xl">✕</div>
                </div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: '#EF4444' }}>
                  ❌ Transaction not found
                </h2>
                <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                  or incorrect amount
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleCancel}
                    className="flex-1 py-3 rounded-lg border-2 font-medium"
                    style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setUsdtStep('hash')}
                    className="flex-1 py-3 rounded-lg text-white font-medium"
                    style={{ backgroundColor: '#0A84FF' }}
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}

            {/* USDT - EXPIRED */}
            {usdtStep === 'expired' && (
              <div className="p-8 text-center">
                <div className="mb-6 mx-auto w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                  <div className="text-5xl">⏱</div>
                </div>
                <h2 className="text-2xl font-bold mb-6" style={{ color: '#EF4444' }}>
                  ❌ Session expired
                </h2>
                <button
                  onClick={resetUSDTFlow}
                  className="w-full py-3 rounded-lg text-white font-medium"
                  style={{ backgroundColor: '#0A84FF' }}
                >
                  Generate New Deposit
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
