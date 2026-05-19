import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useUser } from '../context/UserContext';

interface BackButtonProps {
  className?: string;
}

export function BackButton({ className = "mb-4" }: BackButtonProps) {
  const navigate = useNavigate();
  const { theme } = useUser();

  return (
    <button
      onClick={() => navigate(-1)}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all active:scale-95 ${className}`}
      style={{
        backgroundColor: theme === 'dark' ? 'var(--bg-card)' : '#F3F4F6',
        color: theme === 'dark' ? 'var(--text-primary)' : '#1F2937',
      }}
    >
      <ArrowLeft className="w-5 h-5" />
      <span className="text-sm font-medium">Back</span>
    </button>
  );
}
