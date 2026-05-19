import { Settings as SettingsIcon, DollarSign, Moon, Lock, CreditCard, Globe, Save } from 'lucide-react';
import { TopBar } from '../components/TopBar';
import { BackButton } from '../components/BackButton';
import { useUser } from '../context/UserContext';
import { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';

export function Settings() {
  const navigate = useNavigate();
  const { 
    currencyPreference, 
    setCurrencyPreference, 
    theme, 
    setTheme, 
    hasPin, 
    setHasPin,
    addBankAccount,
    addWallet,
    setDefaultBank,
    setDefaultWallet
  } = useUser();
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [language, setLanguage] = useState('English');
  const [usdtAddress, setUsdtAddress] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');

  const handleCurrencyChange = (newCurrency: 'ngn' | 'usd') => {
    setCurrencyPreference(newCurrency);
    toast.success(`Currency changed to ${newCurrency === 'ngn' ? 'Nigerian Naira (₦)' : 'US Dollar ($)'}`);
  };

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    toast.success(`Theme changed to ${newTheme} mode`);
  };

  const handleSetPin = () => {
    if (pin.length !== 4) {
      toast.error('PIN must be 4 digits');
      return;
    }
    if (pin !== confirmPin) {
      toast.error('PINs do not match');
      return;
    }
    setHasPin(true);
    setShowPinModal(false);
    toast.success('PIN set successfully!');
    setPin('');
    setConfirmPin('');
  };

  const handleSavePayment = () => {
    if (!usdtAddress) {
      toast.error('Please enter a USDT address');
      return;
    }
    const wallet = { address: usdtAddress, network: 'BSC (BEP20)' };
    addWallet(wallet);
    setDefaultWallet(wallet);
    toast.success('Wallet address saved ✅');
  };

  const handleSaveBankAccount = () => {
    if (!accountName || !accountNumber || !bankName) {
      toast.error('Please fill all bank details');
      return;
    }
    const bank = { accountName, accountNumber, bankName };
    addBankAccount(bank);
    setDefaultBank(bank);
    toast.success('Bank account saved successfully ✅');
  };

  return (
    <div className="min-h-screen overflow-y-auto" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <TopBar />

      <div className="w-full max-w-[480px] md:max-w-[768px] lg:max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8 pb-20">
        <BackButton />
        
        <div className="flex items-center gap-3 mb-6">
          <SettingsIcon className="w-8 h-8" style={{ color: '#0A84FF' }} />
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Settings
          </h1>
        </div>

        {/* Currency Preference */}
        <div className="rounded-lg shadow-sm p-6 mb-4" style={{ backgroundColor: 'var(--bg-card)' }}>
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5" style={{ color: '#0A84FF' }} />
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              💱 Currency Preference
            </h2>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Select Currency
            </label>
            <select
              value={currencyPreference}
              onChange={(e) => handleCurrencyChange(e.target.value as 'ngn' | 'usd')}
              className="w-full px-4 py-3 border rounded-lg transition-all"
              style={{ 
                borderColor: 'var(--border-color)', 
                color: 'var(--text-primary)',
                backgroundColor: 'var(--bg-secondary)'
              }}
            >
              <option value="ngn">NGN (₦ Nigerian Naira)</option>
              <option value="usd">USD ($ US Dollar)</option>
            </select>
          </div>

          <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-accent)' }}>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              💡 Exchange Rate: 1 USD = ₦1,400.00 | Balance will auto-convert when switching
            </p>
          </div>
        </div>

        {/* Theme */}
        <div className="rounded-lg shadow-sm p-6 mb-4" style={{ backgroundColor: 'var(--bg-card)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Moon className="w-5 h-5" style={{ color: '#0A84FF' }} />
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              🌙 Theme
            </h2>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: 'rgba(10, 132, 255, 0.1)', opacity: 0.6, cursor: 'not-allowed' }}>
              <input
                type="radio"
                name="theme"
                checked={false}
                disabled={true}
                className="w-4 h-4"
                style={{ accentColor: '#0A84FF' }}
              />
              <span style={{ color: 'var(--text-primary)' }}>Light</span>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: 'rgba(10, 132, 255, 0.1)' }}>
              <input
                type="radio"
                name="theme"
                checked={true}
                disabled={true}
                className="w-4 h-4"
                style={{ accentColor: '#0A84FF' }}
              />
              <span style={{ color: 'var(--text-primary)' }}>Dark (Locked) 🖤</span>
            </label>
          </div>
          
          <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-accent)' }}>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              💡 Dark theme is permanently enabled for the best experience
            </p>
          </div>
        </div>

        {/* Security */}
        <div className="rounded-lg shadow-sm p-6 mb-4" style={{ backgroundColor: 'var(--bg-card)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5" style={{ color: '#0A84FF' }} />
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              🔒 Security
            </h2>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setShowPinModal(true)}
              className="w-full text-left px-4 py-3 rounded-lg hover:opacity-80 transition-opacity"
              style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-accent)' }}
            >
              {hasPin ? 'Change PIN' : 'Set PIN'}
            </button>
            <button
              className="w-full text-left px-4 py-3 rounded-lg hover:opacity-80 transition-opacity"
              style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-accent)' }}
            >
              Change Password
            </button>
          </div>
        </div>

        {/* Payment Settings */}
        <div className="rounded-lg shadow-sm p-6 mb-4" style={{ backgroundColor: 'var(--bg-card)' }}>
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5" style={{ color: '#0A84FF' }} />
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              💳 Payment Settings
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                USDT Address (BSC Network)
              </label>
              <input
                type="text"
                value={usdtAddress}
                onChange={(e) => setUsdtAddress(e.target.value)}
                placeholder="Enter your USDT wallet address"
                className="w-full px-4 py-3 border rounded-lg"
                style={{ 
                  borderColor: 'var(--border-color)', 
                  color: 'var(--text-primary)',
                  backgroundColor: 'var(--bg-secondary)'
                }}
              />
            </div>
            <button
              onClick={handleSavePayment}
              className="w-full py-3 rounded-lg text-white font-medium"
              style={{ backgroundColor: '#0A84FF' }}
            >
              Save Wallet Address
            </button>
          </div>
        </div>

        {/* Bank Account Settings */}
        <div className="rounded-lg shadow-sm p-6 mb-4" style={{ backgroundColor: 'var(--bg-card)' }}>
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5" style={{ color: '#0A84FF' }} />
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              🏦 Bank Account Settings
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Account Name
              </label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Enter account name"
                className="w-full px-4 py-3 border rounded-lg"
                style={{ 
                  borderColor: 'var(--border-color)', 
                  color: 'var(--text-primary)',
                  backgroundColor: 'var(--bg-secondary)'
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Account Number
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Enter account number"
                className="w-full px-4 py-3 border rounded-lg"
                style={{ 
                  borderColor: 'var(--border-color)', 
                  color: 'var(--text-primary)',
                  backgroundColor: 'var(--bg-secondary)'
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Bank Name
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="Enter bank name"
                className="w-full px-4 py-3 border rounded-lg"
                style={{ 
                  borderColor: 'var(--border-color)', 
                  color: 'var(--text-primary)',
                  backgroundColor: 'var(--bg-secondary)'
                }}
              />
            </div>
            <button
              onClick={handleSaveBankAccount}
              className="w-full py-3 rounded-lg text-white font-medium"
              style={{ backgroundColor: '#0A84FF' }}
            >
              Save Bank Account
            </button>
          </div>
        </div>

        {/* Language */}
        <div className="rounded-lg shadow-sm p-6 mb-4" style={{ backgroundColor: 'var(--bg-card)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5" style={{ color: '#0A84FF' }} />
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Language
            </h2>
          </div>

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg"
            style={{ 
              borderColor: 'var(--border-color)', 
              color: 'var(--text-primary)',
              backgroundColor: 'var(--bg-secondary)'
            }}
          >
            <option>English</option>
            <option>Spanish</option>
            <option>French</option>
            <option>German</option>
          </select>
        </div>
      </div>

      {/* PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="rounded-lg shadow-lg max-w-md w-full p-6" style={{ backgroundColor: 'var(--bg-card)' }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              {hasPin ? 'Change PIN' : 'Set PIN'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Enter 4-Digit PIN
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="••••"
                  className="w-full px-4 py-3 border rounded-lg text-center text-2xl tracking-widest"
                  style={{ 
                    borderColor: 'var(--border-color)', 
                    color: 'var(--text-primary)',
                    backgroundColor: 'var(--bg-secondary)'
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Confirm PIN
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  placeholder="••••"
                  className="w-full px-4 py-3 border rounded-lg text-center text-2xl tracking-widest"
                  style={{ 
                    borderColor: 'var(--border-color)', 
                    color: 'var(--text-primary)',
                    backgroundColor: 'var(--bg-secondary)'
                  }}
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowPinModal(false);
                    setPin('');
                    setConfirmPin('');
                  }}
                  className="flex-1 py-3 rounded-lg border-2 font-medium"
                  style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSetPin}
                  className="flex-1 py-3 rounded-lg text-white font-medium"
                  style={{ backgroundColor: '#0A84FF' }}
                >
                  Save PIN
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}