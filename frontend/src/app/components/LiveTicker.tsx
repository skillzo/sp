import { useEffect, useState } from 'react';

interface TickerItem {
  id: number;
  text: string;
  type: 'win' | 'join';
  amount?: number;
}

export function LiveTicker() {
  const [items] = useState<TickerItem[]>([
    { id: 1, text: 'CryptoKing won', type: 'win', amount: 120 },
    { id: 2, text: 'User715 joined', type: 'join', amount: 10 },
    { id: 3, text: 'LuckyMike won', type: 'win', amount: 75 },
    { id: 4, text: 'SpinQueen won', type: 'win', amount: 95 },
    { id: 5, text: 'User892 joined', type: 'join', amount: 25 },
    { id: 6, text: 'ProGamer won', type: 'win', amount: 150 },
    { id: 7, text: 'User431 joined', type: 'join', amount: 15 },
    { id: 8, text: 'WinnerX won', type: 'win', amount: 200 },
  ]);

  return (
    <div className="overflow-hidden py-3" style={{ 
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      borderBottom: '1px solid rgba(0, 255, 204, 0.1)'
    }}>
      <div className="ticker-wrapper">
        <div className="ticker-content">
          {/* Double the items for seamless loop */}
          {[...items, ...items].map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className="ticker-item inline-flex items-center gap-2 mx-2 px-4 py-2 rounded-full"
              style={{
                backgroundColor: item.type === 'win' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(14, 165, 233, 0.15)',
                border: `1px solid ${item.type === 'win' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(14, 165, 233, 0.3)'}`,
                boxShadow: item.type === 'win' ? '0 0 15px rgba(34, 197, 94, 0.2)' : '0 0 15px rgba(14, 165, 233, 0.2)',
              }}
            >
              <div
                className="w-2 h-2 rounded-full animate-pulse"
                style={{
                  backgroundColor: item.type === 'win' ? '#22C55E' : '#0EA5E9',
                  boxShadow: `0 0 8px ${item.type === 'win' ? '#22C55E' : '#0EA5E9'}`,
                }}
              />
              <span
                className="text-sm font-semibold whitespace-nowrap"
                style={{ color: item.type === 'win' ? '#22C55E' : '#0EA5E9' }}
              >
                {item.text} ${item.amount}
              </span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .ticker-wrapper {
          width: 100%;
          overflow: hidden;
        }
        
        .ticker-content {
          display: inline-flex;
          animation: scroll 30s linear infinite;
          will-change: transform;
        }
        
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .ticker-item {
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
}
