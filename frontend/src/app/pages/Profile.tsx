import { User, Mail, Phone, MapPin, Calendar, Edit, Crown } from 'lucide-react';
import { TopBar } from '../components/TopBar';
import { BackButton } from '../components/BackButton';
import { useUser } from '../context/UserContext';
import { VIPCrown } from '../components/VIPCrown';
import { useState } from 'react';
import { toast } from 'sonner';

export function Profile() {
  const { isVIP, vipLevel, formatCurrency } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+234 801 234 5678',
    location: 'Lagos, Nigeria',
    memberSince: 'March 2026',
  });

  const stats = {
    totalGames: 145,
    totalWins: 87,
    winRate: '60%',
    totalEarnings: 45600,
  };

  const handleSave = () => {
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  return (
    <div className="min-h-screen overflow-y-auto" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <TopBar />

      <div className="w-full max-w-[480px] md:max-w-[768px] lg:max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8 pb-20">
        <BackButton />
        
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <User className="w-8 h-8" style={{ color: '#0A84FF' }} />
            <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              Profile
            </h1>
          </div>
          
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium"
            style={{ backgroundColor: '#0A84FF', color: 'white' }}
          >
            <Edit className="w-4 h-4" />
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {/* Profile Card */}
        <div className="rounded-lg shadow-sm p-6 mb-6" style={{ backgroundColor: 'var(--bg-card)' }}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: '#0A84FF' }}>
              <User className="w-10 h-10 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {profile.name}
                </h2>
                {vipLevel > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ 
                    backgroundColor: 'rgba(255, 215, 0, 0.15)',
                    border: '2px solid rgba(255, 215, 0, 0.4)',
                    boxShadow: '0 2px 8px rgba(255, 215, 0, 0.3)',
                  }}>
                    <VIPCrown level={vipLevel as 1 | 2 | 3} size="sm" />
                    <span className="text-sm font-black tracking-wide" style={{ 
                      color: '#FFD700',
                      letterSpacing: '0.5px',
                      textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                    }}>
                      VIP {vipLevel}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Member since {profile.memberSince}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
              {isEditing ? (
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="flex-1 px-3 py-2 border rounded-lg"
                  style={{ 
                    borderColor: 'var(--border-color)', 
                    color: 'var(--text-primary)',
                    backgroundColor: 'var(--bg-secondary)'
                  }}
                />
              ) : (
                <span style={{ color: 'var(--text-primary)' }}>{profile.email}</span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
              {isEditing ? (
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="flex-1 px-3 py-2 border rounded-lg"
                  style={{ 
                    borderColor: 'var(--border-color)', 
                    color: 'var(--text-primary)',
                    backgroundColor: 'var(--bg-secondary)'
                  }}
                />
              ) : (
                <span style={{ color: 'var(--text-primary)' }}>{profile.phone}</span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
              {isEditing ? (
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  className="flex-1 px-3 py-2 border rounded-lg"
                  style={{ 
                    borderColor: 'var(--border-color)', 
                    color: 'var(--text-primary)',
                    backgroundColor: 'var(--bg-secondary)'
                  }}
                />
              ) : (
                <span style={{ color: 'var(--text-primary)' }}>{profile.location}</span>
              )}
            </div>
          </div>

          {isEditing && (
            <button
              onClick={handleSave}
              className="w-full mt-6 py-3 rounded-lg text-white font-medium"
              style={{ backgroundColor: '#0A84FF' }}
            >
              Save Changes
            </button>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="rounded-lg shadow-sm p-4 text-center" style={{ backgroundColor: 'var(--bg-card)' }}>
            <p className="text-2xl font-bold mb-1" style={{ color: '#0A84FF' }}>
              {stats.totalGames}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Total Games</p>
          </div>
          <div className="rounded-lg shadow-sm p-4 text-center" style={{ backgroundColor: 'var(--bg-card)' }}>
            <p className="text-2xl font-bold mb-1" style={{ color: '#34D399' }}>
              {stats.totalWins}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Total Wins</p>
          </div>
          <div className="rounded-lg shadow-sm p-4 text-center" style={{ backgroundColor: 'var(--bg-card)' }}>
            <p className="text-2xl font-bold mb-1" style={{ color: '#FFD700' }}>
              {stats.winRate}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Win Rate</p>
          </div>
          <div className="rounded-lg shadow-sm p-4 text-center" style={{ backgroundColor: 'var(--bg-card)' }}>
            <p className="text-2xl font-bold mb-1" style={{ color: '#0A84FF' }}>
              {formatCurrency(stats.totalEarnings)}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Total Earned</p>
          </div>
        </div>

        {/* Account Actions */}
        <div className="rounded-lg shadow-sm p-6" style={{ backgroundColor: 'var(--bg-card)' }}>
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Account Actions
          </h3>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 rounded-lg hover:opacity-80 transition-opacity" style={{ backgroundColor: 'var(--bg-accent)', color: 'var(--text-primary)' }}>
              Change Password
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg hover:opacity-80 transition-opacity" style={{ backgroundColor: 'var(--bg-accent)', color: 'var(--text-primary)' }}>
              Verification Documents
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg hover:opacity-80 transition-opacity" style={{ backgroundColor: 'var(--bg-accent)', color: '#EF4444' }}>
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}