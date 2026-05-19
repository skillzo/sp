interface VIPCrownProps {
  level: 1 | 2 | 3;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

export function VIPCrown({ level, size = 'md', animate = false }: VIPCrownProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-8 h-8',
  };

  const colors = {
    1: {
      fill: '#C0C0C0', // Silver
      glow: 'rgba(192, 192, 192, 0.5)',
      shadow: '0 0 12px rgba(192, 192, 192, 0.6)',
    },
    2: {
      fill: '#FFD700', // Gold
      glow: 'rgba(255, 215, 0, 0.5)',
      shadow: '0 0 12px rgba(255, 215, 0, 0.8)',
    },
    3: {
      fill: '#00D4FF', // Diamond (cyan/blue)
      glow: 'rgba(0, 212, 255, 0.5)',
      shadow: '0 0 16px rgba(0, 212, 255, 0.9)',
    },
  };

  const color = colors[level];

  return (
    <div 
      className={`${sizeClasses[size]} ${animate ? 'vip-crown-animate' : ''}`}
      style={{
        filter: `drop-shadow(${color.shadow})`,
      }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 2L14.5 8.5L21 9L16 14L17.5 21L12 17.5L6.5 21L8 14L3 9L9.5 8.5L12 2Z"
          fill={color.fill}
        />
        <path
          d="M12 2L14.5 8.5L21 9L16 14L17.5 21L12 17.5L6.5 21L8 14L3 9L9.5 8.5L12 2Z"
          stroke={color.fill}
          strokeWidth="1"
          strokeLinejoin="round"
        />
        {/* Inner glow */}
        <path
          d="M12 5L13.5 9.5L18 10L15 13L15.8 17.5L12 15L8.2 17.5L9 13L6 10L10.5 9.5L12 5Z"
          fill={color.glow}
          opacity="0.6"
        />
      </svg>

      <style>{`
        @keyframes vip-crown-pulse {
          0%, 100% {
            transform: scale(1);
            filter: drop-shadow(${color.shadow});
          }
          50% {
            transform: scale(1.1);
            filter: drop-shadow(${color.shadow}) brightness(1.2);
          }
        }

        .vip-crown-animate {
          animation: vip-crown-pulse 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
