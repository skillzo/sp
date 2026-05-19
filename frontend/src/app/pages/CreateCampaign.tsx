import { useState } from 'react';
import { Megaphone, DollarSign, Upload, Image, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router';
import { TopBar } from '../components/TopBar';
import { BackButton } from '../components/BackButton';
import { useUser } from '../context/UserContext';
import { toast } from 'sonner';

export function CreateCampaign() {
  const { isVIP, formatCurrency, gameBalance, updateGameBalance } = useUser();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    taskType: 'watch-video',
    targetUrl: '',
    budget: '',
    rewardPerUser: '',
    requiresProof: false
  });

  // Task types with their requirements
  const taskTypes = [
    { value: 'watch-video', label: 'Watch Video', icon: '📹', requiresProof: false },
    { value: 'visit-site', label: 'Visit Website', icon: '🌐', requiresProof: false },
    { value: 'install-app', label: 'Install App', icon: '📱', requiresProof: true },
    { value: 'survey', label: 'Complete Survey', icon: '📝', requiresProof: false },
    { value: 'join-telegram', label: 'Join Telegram Group', icon: '✈️', requiresProof: true },
    { value: 'subscribe-youtube', label: 'Subscribe to YouTube', icon: '▶️', requiresProof: true },
    { value: 'follow-twitter', label: 'Follow on Twitter/X', icon: '🐦', requiresProof: true },
    { value: 'share-telegram', label: 'Share Telegram Post', icon: '📢', requiresProof: true },
    { value: 'like-facebook', label: 'Like Facebook Page', icon: '👍', requiresProof: true },
    { value: 'follow-instagram', label: 'Follow on Instagram', icon: '📷', requiresProof: true },
    { value: 'retweet', label: 'Retweet/Share Post', icon: '🔄', requiresProof: true },
    { value: 'join-discord', label: 'Join Discord Server', icon: '💬', requiresProof: true }
  ];

  const selectedTaskType = taskTypes.find(t => t.value === formData.taskType);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.budget || !formData.rewardPerUser || !formData.targetUrl) {
      toast.error('Please fill in all fields');
      return;
    }

    const budget = parseFloat(formData.budget);
    const reward = parseFloat(formData.rewardPerUser);

    if (budget < 1) {
      toast.error('Minimum budget is $1');
      return;
    }

    if (reward < 0.10) {
      toast.error('Minimum reward per user is $0.10');
      return;
    }

    if (reward > budget) {
      toast.error('Reward per user cannot exceed total budget');
      return;
    }

    // Check game balance
    if (gameBalance < budget) {
      toast.error(`Insufficient Game Wallet balance! You need ${formatCurrency(budget, true)} but have ${formatCurrency(gameBalance, true)}`);
      return;
    }

    // Deduct from game balance
    updateGameBalance(-budget);

    // Calculate estimated reach
    const estimatedReach = Math.floor(budget / reward);

    toast.success(`Campaign created! ${formatCurrency(budget, true)} deducted from Game Wallet. Estimated reach: ${estimatedReach.toLocaleString()} users`);
    
    // Navigate back to advertiser dashboard
    setTimeout(() => {
      navigate('/advertiser');
    }, 1500);
  };

  // Redirect if not VIP
  if (!isVIP) {
    navigate('/upgrade');
    return null;
  }

  const estimatedReach = formData.budget && formData.rewardPerUser
    ? Math.floor(parseFloat(formData.budget) / parseFloat(formData.rewardPerUser))
    : 0;

  // Get placeholder text based on task type
  const getPlaceholder = () => {
    switch (formData.taskType) {
      case 'watch-video':
        return 'https://youtube.com/watch?v=...';
      case 'visit-site':
        return 'https://yourwebsite.com';
      case 'install-app':
        return 'https://play.google.com/store/apps/...';
      case 'survey':
        return 'https://forms.google.com/...';
      case 'join-telegram':
        return 'https://t.me/yourgroupname';
      case 'subscribe-youtube':
        return 'https://youtube.com/@yourchannel';
      case 'follow-twitter':
        return 'https://twitter.com/yourusername';
      case 'share-telegram':
        return 'https://t.me/c/...';
      case 'like-facebook':
        return 'https://facebook.com/yourpage';
      case 'follow-instagram':
        return 'https://instagram.com/yourusername';
      case 'retweet':
        return 'https://twitter.com/user/status/...';
      case 'join-discord':
        return 'https://discord.gg/...';
      default:
        return 'Enter URL';
    }
  };

  const getUrlLabel = () => {
    switch (formData.taskType) {
      case 'watch-video':
        return 'Video URL';
      case 'visit-site':
        return 'Website URL';
      case 'install-app':
        return 'App Store URL';
      case 'survey':
        return 'Survey URL';
      case 'join-telegram':
        return 'Telegram Group Link';
      case 'subscribe-youtube':
        return 'YouTube Channel URL';
      case 'follow-twitter':
        return 'Twitter/X Profile URL';
      case 'share-telegram':
        return 'Telegram Post Link';
      case 'like-facebook':
        return 'Facebook Page URL';
      case 'follow-instagram':
        return 'Instagram Profile URL';
      case 'retweet':
        return 'Tweet URL';
      case 'join-discord':
        return 'Discord Invite Link';
      default:
        return 'Target URL';
    }
  };

  const budgetAmount = parseFloat(formData.budget) || 0;
  const hasInsufficientBalance = budgetAmount > 0 && gameBalance < budgetAmount;

  return (
    <div className="min-h-screen overflow-y-auto" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <TopBar />
      
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <BackButton />

        <div className="flex items-center gap-3 mb-6">
          <Megaphone className="w-8 h-8" style={{ color: '#0A84FF' }} />
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Create Campaign
          </h1>
        </div>

        {/* Game Wallet Balance Display */}
        <div className="rounded-lg p-4 mb-6" style={{ background: 'linear-gradient(135deg, #0A84FF 0%, #0066CC 100%)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-white" />
              <span className="text-white/80 text-sm">Game Wallet Balance</span>
            </div>
            <span className="text-white font-bold text-xl">{formatCurrency(gameBalance, true)}</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campaign Title */}
          <div className="rounded-lg shadow-sm p-6" style={{ backgroundColor: 'var(--bg-card)' }}>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Campaign Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Subscribe to our YouTube Channel"
              className="w-full px-4 py-3 border rounded-lg"
              style={{ 
                borderColor: 'var(--border-color)', 
                color: 'var(--text-primary)',
                backgroundColor: 'var(--bg-secondary)'
              }}
            />
          </div>

          {/* Task Type */}
          <div className="rounded-lg shadow-sm p-6" style={{ backgroundColor: 'var(--bg-card)' }}>
            <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
              Task Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {taskTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({ 
                    ...formData, 
                    taskType: type.value,
                    requiresProof: type.requiresProof
                  })}
                  className="p-3 rounded-lg border-2 transition-all text-center"
                  style={{
                    borderColor: formData.taskType === type.value ? '#0A84FF' : 'var(--border-color)',
                    backgroundColor: formData.taskType === type.value ? 'rgba(10, 132, 255, 0.1)' : 'var(--bg-secondary)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <div className="text-2xl mb-1">{type.icon}</div>
                  <div className="text-xs">{type.label}</div>
                </button>
              ))}
            </div>
            
            {selectedTaskType?.requiresProof && (
              <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: 'rgba(10, 132, 255, 0.1)' }}>
                <p className="text-xs" style={{ color: '#0A84FF' }}>
                  ℹ️ This task type requires users to submit proof (screenshot) for verification
                </p>
              </div>
            )}
          </div>

          {/* Target URL */}
          <div className="rounded-lg shadow-sm p-6" style={{ backgroundColor: 'var(--bg-card)' }}>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              {getUrlLabel()}
            </label>
            <input
              type="url"
              value={formData.targetUrl}
              onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
              placeholder={getPlaceholder()}
              className="w-full px-4 py-3 border rounded-lg"
              style={{ 
                borderColor: 'var(--border-color)', 
                color: 'var(--text-primary)',
                backgroundColor: 'var(--bg-secondary)'
              }}
            />
          </div>

          {/* Budget & Reward */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-lg shadow-sm p-6" style={{ backgroundColor: 'var(--bg-card)' }}>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Total Budget (USDT)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  placeholder="Min: $1.00"
                  className="w-full pl-10 pr-4 py-3 border rounded-lg"
                  style={{ 
                    borderColor: hasInsufficientBalance ? '#EF4444' : 'var(--border-color)', 
                    color: 'var(--text-primary)',
                    backgroundColor: 'var(--bg-secondary)'
                  }}
                />
              </div>
              {hasInsufficientBalance && (
                <p className="text-xs mt-2" style={{ color: '#EF4444' }}>
                  Insufficient balance! Need {formatCurrency(budgetAmount, true)}
                </p>
              )}
            </div>

            <div className="rounded-lg shadow-sm p-6" style={{ backgroundColor: 'var(--bg-card)' }}>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Reward Per User (USDT)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                <input
                  type="number"
                  step="0.01"
                  min="0.10"
                  value={formData.rewardPerUser}
                  onChange={(e) => setFormData({ ...formData, rewardPerUser: e.target.value })}
                  placeholder="Min: $0.10"
                  className="w-full pl-10 pr-4 py-3 border rounded-lg"
                  style={{ 
                    borderColor: 'var(--border-color)', 
                    color: 'var(--text-primary)',
                    backgroundColor: 'var(--bg-secondary)'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Estimated Reach */}
          {estimatedReach > 0 && (
            <div className="rounded-lg p-4" style={{ background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.1) 100%)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium" style={{ color: '#22C55E' }}>Estimated Reach</span>
                <span className="text-xl font-bold" style={{ color: '#22C55E' }}>
                  {estimatedReach.toLocaleString()} users
                </span>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="rounded-lg p-4" style={{ backgroundColor: 'rgba(10, 132, 255, 0.1)', border: '1px solid rgba(10, 132, 255, 0.3)' }}>
            <p className="text-sm" style={{ color: '#0A84FF' }}>
              💡 <strong>Note:</strong> Campaign budget will be deducted from your Game Wallet. Users earn from Game Wallet when they complete tasks. Minimum budget: $1 | Minimum reward per user: $0.10
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={hasInsufficientBalance}
            className="w-full py-4 rounded-lg text-white font-semibold text-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#0A84FF' }}
          >
            Create Campaign
          </button>
        </form>
      </div>
    </div>
  );
}
