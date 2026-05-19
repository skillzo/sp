import { AlertCircle } from 'lucide-react';
import { useUser } from '../context/UserContext';

export function AgeVerificationModal() {
  const { isAgeVerified, setIsAgeVerified } = useUser();

  if (isAgeVerified) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-8 h-8" style={{ color: '#EF4444' }} />
          <h2 className="text-xl" style={{ color: '#1F2937' }}>Age Confirmation</h2>
        </div>
        
        <p className="mb-6" style={{ color: '#6B7280' }}>
          This game is for users 18+ only. You must be of legal age to participate.
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => setIsAgeVerified(true)}
            className="flex-1 py-3 rounded-lg text-white font-medium"
            style={{ backgroundColor: '#0A84FF' }}
          >
            I am 18+
          </button>
          <button
            onClick={() => window.location.href = 'https://www.google.com'}
            className="flex-1 py-3 rounded-lg border-2 font-medium"
            style={{ borderColor: '#0A84FF', color: '#0A84FF' }}
          >
            Exit
          </button>
        </div>

        <p className="mt-4 text-xs" style={{ color: '#6B7280' }}>
          If fiat payments are enabled, appropriate gambling and financial licenses may be required depending on jurisdiction. Users participate at their own risk.
        </p>
      </div>
    </div>
  );
}
