import { X } from 'lucide-react';

interface LandingSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LandingSidebar({ isOpen, onClose }: LandingSidebarProps) {
  const menuItems = [
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Rewards / Earn', href: '#earn' },
    { label: 'Invite friends', href: '#invite' },
    { label: 'Support / Help', href: '#support' },
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
        }}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className="fixed top-0 right-0 bottom-0 z-50 w-[80%] max-w-sm animate-slide-in"
        style={{
          backgroundColor: '#12151C',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b" style={{
          borderColor: 'rgba(255, 255, 255, 0.06)',
        }}>
          <h2 className="text-lg font-bold" style={{ color: '#FFFFFF' }}>
            Menu
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
            }}
          >
            <X className="w-5 h-5" style={{ color: '#A0A6B1' }} />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item, index) => (
              <li key={index}>
                <a
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    onClose();
                  }}
                  className="block px-4 py-3 rounded-lg transition-all"
                  style={{
                    color: '#A0A6B1',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.color = '#FFFFFF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#A0A6B1';
                  }}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
