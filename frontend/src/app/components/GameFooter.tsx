import { useState } from 'react';

type ModalType = 'fair' | 'random' | 'responsible' | 'age' | 'profit' | null;

export function GameFooter() {
  const [modalType, setModalType] = useState<ModalType>(null);

  const openModal = (type: ModalType) => {
    setModalType(type);
  };

  const closeModal = () => {
    setModalType(null);
  };

  const getModalContent = () => {
    switch (modalType) {
      case 'fair':
        return {
          title: 'Provably Fair',
          text: 'Game results are generated using a transparent system that can be verified by users.'
        };
      case 'random':
        return {
          title: 'Random Results',
          text: 'All outcomes are randomly generated and not influenced by the platform or other players.'
        };
      case 'responsible':
        return {
          title: 'Play Responsibly',
          text: 'Always participate within your limits. This platform is designed for entertainment.'
        };
      case 'age':
        return {
          title: 'Age Requirement',
          text: 'This platform is intended for users aged 18 and above.'
        };
      case 'profit':
        return {
          title: 'No Guaranteed Profits',
          text: 'Earnings and wins are not guaranteed. Outcomes depend on participation and randomness.'
        };
      default:
        return { title: '', text: '' };
    }
  };

  const modalContent = getModalContent();

  return (
    <>
      {/* Spacer */}
      <div style={{ height: '40px' }} />

      {/* Footer - Scrollable (NOT fixed) */}
      <div
        style={{
          width: '100%',
          textAlign: 'center',
          fontSize: '11px',
          color: '#888',
          paddingBottom: '20px',
          paddingLeft: '16px',
          paddingRight: '16px'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '4px' }}>
          <span
            onClick={() => openModal('fair')}
            style={{
              cursor: 'pointer',
              margin: '0 4px',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#888')}
          >
            Provably Fair
          </span>
          <span style={{ margin: '0 2px', color: '#888' }}>•</span>
          <span
            onClick={() => openModal('random')}
            style={{
              cursor: 'pointer',
              margin: '0 4px',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#888')}
          >
            Results are random
          </span>
          <span style={{ margin: '0 2px', color: '#888' }}>•</span>
          <span
            onClick={() => openModal('responsible')}
            style={{
              cursor: 'pointer',
              margin: '0 4px',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#888')}
          >
            Play responsibly
          </span>
          <span style={{ margin: '0 2px', color: '#888' }}>•</span>
          <span
            onClick={() => openModal('age')}
            style={{
              cursor: 'pointer',
              margin: '0 4px',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#888')}
          >
            18+ only
          </span>
          <span style={{ margin: '0 2px', color: '#888' }}>•</span>
          <span
            onClick={() => openModal('profit')}
            style={{
              cursor: 'pointer',
              margin: '0 4px',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#888')}
          >
            No guaranteed profits
          </span>
        </div>
      </div>

      {/* Modal */}
      {modalType && (
        <>
          {/* Backdrop with blur */}
          <div
            onClick={closeModal}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 50,
              animation: 'fadeIn 0.2s ease-out'
            }}
          />

          {/* Modal Content */}
          <div
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              width: '100%',
              background: '#111',
              color: '#fff',
              padding: '20px',
              borderTopLeftRadius: '20px',
              borderTopRightRadius: '20px',
              boxShadow: '0 -5px 20px rgba(0,0,0,0.5)',
              zIndex: 51,
              animation: 'slideUp 0.3s ease-out',
              maxWidth: '600px',
              margin: '0 auto'
            }}
          >
            <h3
              style={{
                marginBottom: '10px',
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#00ffcc'
              }}
            >
              {modalContent.title}
            </h3>
            <p
              style={{
                fontSize: '14px',
                color: '#ccc',
                lineHeight: '1.5',
                marginBottom: '15px'
              }}
            >
              {modalContent.text}
            </p>
            <button
              onClick={closeModal}
              style={{
                marginTop: '15px',
                padding: '12px',
                width: '100%',
                border: 'none',
                background: '#00ffcc',
                color: '#000',
                borderRadius: '10px',
                fontWeight: 'bold',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'transform 0.2s, opacity 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.opacity = '1';
              }}
            >
              Close
            </button>
          </div>

          {/* Animations */}
          <style>{`
            @keyframes fadeIn {
              from {
                opacity: 0;
              }
              to {
                opacity: 1;
              }
            }

            @keyframes slideUp {
              from {
                transform: translateY(100%);
              }
              to {
                transform: translateY(0);
              }
            }
          `}</style>
        </>
      )}
    </>
  );
}
