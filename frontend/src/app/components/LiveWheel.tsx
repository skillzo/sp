import { useState, useEffect } from 'react';

interface Player {
  name: string;
  bet: number;
  percentage: number;
  color: string;
}

export function LiveWheel() {
  const [countdown, setCountdown] = useState(12);
  const [poolAmount, setPoolAmount] = useState(187);

  const players: Player[] = [
    { name: 'CryptoKing', bet: 50, percentage: 27, color: '#3B82F6' },
    { name: 'LuckyMike', bet: 40, percentage: 21, color: '#8B5CF6' },
    { name: 'SpinQueen', bet: 35, percentage: 19, color: '#EC4899' },
    { name: 'ProGamer', bet: 30, percentage: 16, color: '#F59E0B' },
    { name: 'User892', bet: 20, percentage: 11, color: '#10B981' },
    { name: 'Others', bet: 12, percentage: 6, color: '#6B7280' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) return 15;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Calculate rotation offset for visual effect
  const totalDegrees = 360;
  let currentRotation = 0;

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Pool Amount Badge */}
      <div
        className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 px-6 py-3 rounded-full"
        style={{
          background: 'linear-gradient(135deg, #00ffcc 0%, #00d4aa 100%)',
          boxShadow: '0 0 30px rgba(0, 255, 204, 0.5)',
        }}
      >
        <p className="text-2xl font-black" style={{ color: '#0B0F1A' }}>
          ${poolAmount}
        </p>
      </div>

      {/* LIVE NOW Badge */}
      <div
        className="absolute top-0 right-0 z-10 flex items-center gap-2 px-4 py-2 rounded-full"
        style={{
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          border: '1px solid rgba(239, 68, 68, 0.5)',
          boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)',
        }}
      >
        <div
          className="w-2 h-2 rounded-full animate-pulse"
          style={{
            backgroundColor: '#EF4444',
            boxShadow: '0 0 10px #EF4444',
          }}
        />
        <span className="text-sm font-bold" style={{ color: '#EF4444' }}>
          LIVE NOW
        </span>
      </div>

      {/* Wheel Container */}
      <div className="relative aspect-square w-full mt-8">
        {/* Outer Glow Ring */}
        <div
          className="absolute inset-0 rounded-full animate-pulse-slow"
          style={{
            background: 'radial-gradient(circle, rgba(0, 255, 204, 0.2) 0%, transparent 70%)',
            filter: 'blur(20px)',
          }}
        />

        {/* Wheel */}
        <div
          className="relative w-full h-full rounded-full overflow-hidden animate-spin-slow"
          style={{
            boxShadow: '0 0 40px rgba(0, 255, 204, 0.3), inset 0 0 40px rgba(0, 0, 0, 0.5)',
            border: '4px solid rgba(0, 255, 204, 0.3)',
          }}
        >
          {/* Wheel Segments */}
          {players.map((player, index) => {
            const segmentDegrees = (player.percentage / 100) * totalDegrees;
            const rotation = currentRotation;
            currentRotation += segmentDegrees;

            return (
              <div
                key={index}
                className="absolute inset-0"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.sin((segmentDegrees * Math.PI) / 180)}% ${50 - 50 * Math.cos((segmentDegrees * Math.PI) / 180)}%)`,
                  transformOrigin: 'center',
                }}
              >
                <div
                  className="w-full h-full"
                  style={{
                    background: `linear-gradient(135deg, ${player.color} 0%, ${player.color}dd 100%)`,
                  }}
                />
              </div>
            );
          })}

          {/* Center Circle */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full flex flex-col items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
              border: '3px solid rgba(0, 255, 204, 0.5)',
              boxShadow: '0 0 30px rgba(0, 0, 0, 0.8)',
            }}
          >
            <p className="text-xs font-semibold mb-1" style={{ color: '#94A3B8' }}>
              ROUND ENDS
            </p>
            <p className="text-4xl font-black" style={{ color: '#00ffcc' }}>
              {countdown}s
            </p>
          </div>
        </div>

        {/* Pointer Arrow */}
        <div
          className="absolute -top-4 left-1/2 -translate-x-1/2 z-20"
          style={{
            width: 0,
            height: 0,
            borderLeft: '12px solid transparent',
            borderRight: '12px solid transparent',
            borderTop: '20px solid #00ffcc',
            filter: 'drop-shadow(0 0 8px rgba(0, 255, 204, 0.8))',
          }}
        />
      </div>

      {/* Player List */}
      <div className="mt-6 space-y-2">
        {players.slice(0, 4).map((player, index) => (
          <div
            key={index}
            className="flex items-center justify-between px-4 py-2 rounded-lg"
            style={{
              backgroundColor: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid rgba(148, 163, 184, 0.1)',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: player.color }}
              />
              <span className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>
                {player.name}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm" style={{ color: '#94A3B8' }}>
                ${player.bet}
              </span>
              <span className="text-sm font-bold" style={{ color: '#00ffcc' }}>
                {player.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
