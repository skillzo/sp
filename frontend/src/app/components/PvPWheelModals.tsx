import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Check, Shield } from 'lucide-react';

interface PvPWheelModalsProps {
  showRulesModal: boolean;
  setShowRulesModal: (show: boolean) => void;
  showProvablyFairModal: boolean;
  setShowProvablyFairModal: (show: boolean) => void;
  serverSeedHash: string;
  clientSeed: string;
  setClientSeed: (seed: string) => void;
  nonce: number;
  copiedField: string | null;
  handleCopy: (text: string, fieldName: string) => void;
}

export function PvPWheelModals({
  showRulesModal,
  setShowRulesModal,
  showProvablyFairModal,
  setShowProvablyFairModal,
  serverSeedHash,
  clientSeed,
  setClientSeed,
  nonce,
  copiedField,
  handleCopy,
}: PvPWheelModalsProps) {
  return (
    <>
      {/* RULES MODAL */}
      <AnimatePresence>
        {showRulesModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(8px)',
            }}
            onClick={() => setShowRulesModal(false)}
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-t-3xl md:rounded-3xl overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                maxHeight: '90vh',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'rgba(148, 163, 184, 0.1)' }}>
                <h2 className="text-xl font-black" style={{ color: '#FFFFFF' }}>
                  How This Game Works
                </h2>
                <motion.button
                  onClick={() => setShowRulesModal(false)}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: 'rgba(148, 163, 184, 0.15)',
                    border: '1px solid rgba(148, 163, 184, 0.3)',
                  }}
                >
                  <X className="w-5 h-5" style={{ color: '#94A3B8' }} />
                </motion.button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
                {/* Game Flow */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm" style={{
                      background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                      color: '#FFFFFF'
                    }}>
                      1
                    </div>
                    <h3 className="text-base font-bold" style={{ color: '#FFFFFF' }}>Game Flow</h3>
                  </div>
                  <ul className="space-y-2 ml-10">
                    <li className="text-sm" style={{ color: '#CBD5E1' }}>
                      • Join the round with any amount
                    </li>
                    <li className="text-sm" style={{ color: '#CBD5E1' }}>
                      • Your bet determines your probability
                    </li>
                    <li className="text-sm" style={{ color: '#CBD5E1' }}>
                      • When the wheel spins, one winner is selected
                    </li>
                    <li className="text-sm" style={{ color: '#CBD5E1' }}>
                      • Winner takes the pool (minus platform fee)
                    </li>
                  </ul>
                </div>

                {/* Probability */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm" style={{
                      background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                      color: '#FFFFFF'
                    }}>
                      2
                    </div>
                    <h3 className="text-base font-bold" style={{ color: '#FFFFFF' }}>Probability</h3>
                  </div>
                  <ul className="space-y-2 ml-10">
                    <li className="text-sm" style={{ color: '#CBD5E1' }}>
                      • Bigger bets = larger wheel segments
                    </li>
                    <li className="text-sm" style={{ color: '#CBD5E1' }}>
                      • Your chance = your share of total pool
                    </li>
                    <li className="text-sm font-semibold mt-3 p-3 rounded-lg" style={{ 
                      color: '#22C55E',
                      backgroundColor: 'rgba(34, 197, 94, 0.1)',
                      border: '1px solid rgba(34, 197, 94, 0.2)'
                    }}>
                      Example: $10 bet in $50 pool = 20% win chance
                    </li>
                  </ul>
                </div>

                {/* Payout */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm" style={{
                      background: 'linear-gradient(135deg, #EC4899 0%, #F59E0B 100%)',
                      color: '#FFFFFF'
                    }}>
                      3
                    </div>
                    <h3 className="text-base font-bold" style={{ color: '#FFFFFF' }}>Payout</h3>
                  </div>
                  <ul className="space-y-2 ml-10">
                    <li className="text-sm" style={{ color: '#CBD5E1' }}>
                      • Platform fee is deducted from pool
                    </li>
                    <li className="text-sm" style={{ color: '#CBD5E1' }}>
                      • Winner receives remaining pool
                    </li>
                    <li className="text-sm" style={{ color: '#CBD5E1' }}>
                      • Instant payout to your balance
                    </li>
                  </ul>
                </div>

                {/* Fairness */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm" style={{
                      background: 'linear-gradient(135deg, #F59E0B 0%, #10B981 100%)',
                      color: '#FFFFFF'
                    }}>
                      4
                    </div>
                    <h3 className="text-base font-bold" style={{ color: '#FFFFFF' }}>Fairness</h3>
                  </div>
                  <ul className="space-y-2 ml-10">
                    <li className="text-sm" style={{ color: '#CBD5E1' }}>
                      • Result is provably fair using seeds
                    </li>
                    <li className="text-sm" style={{ color: '#CBD5E1' }}>
                      • Verify each round independently
                    </li>
                    <li className="text-sm" style={{ color: '#CBD5E1' }}>
                      • Transparent and auditable
                    </li>
                  </ul>
                </div>

                {/* CTA */}
                <motion.button
                  onClick={() => setShowRulesModal(false)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 rounded-xl font-black text-base mt-6"
                  style={{
                    background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                    color: '#FFFFFF',
                    boxShadow: '0 8px 30px rgba(59, 130, 246, 0.4)',
                  }}
                >
                  Got It!
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PROVABLY FAIR MODAL */}
      <AnimatePresence>
        {showProvablyFairModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(8px)',
            }}
            onClick={() => setShowProvablyFairModal(false)}
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-t-3xl md:rounded-3xl overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                maxHeight: '90vh',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'rgba(148, 163, 184, 0.1)' }}>
                <div className="flex items-center gap-2">
                  <Shield className="w-6 h-6" style={{ color: '#22C55E' }} />
                  <h2 className="text-xl font-black" style={{ color: '#FFFFFF' }}>
                    Provably Fair System
                  </h2>
                </div>
                <motion.button
                  onClick={() => setShowProvablyFairModal(false)}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: 'rgba(148, 163, 184, 0.15)',
                    border: '1px solid rgba(148, 163, 184, 0.3)',
                  }}
                >
                  <X className="w-5 h-5" style={{ color: '#94A3B8' }} />
                </motion.button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-5 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
                {/* Seeds Section */}
                <div>
                  <h3 className="text-sm font-bold mb-4 uppercase tracking-wider" style={{ color: '#94A3B8' }}>
                    Seeds
                  </h3>

                  {/* Server Seed (Hashed) */}
                  <div className="mb-4">
                    <label className="block text-xs font-semibold mb-2" style={{ color: '#CBD5E1' }}>
                      Server Seed (Hashed)
                    </label>
                    <div className="flex items-center gap-2">
                      <div 
                        className="flex-1 p-3 rounded-lg text-xs font-mono overflow-x-auto"
                        style={{
                          backgroundColor: 'rgba(15, 23, 42, 0.8)',
                          border: '1px solid rgba(148, 163, 184, 0.2)',
                          color: '#94A3B8',
                        }}
                      >
                        {serverSeedHash}
                      </div>
                      <motion.button
                        onClick={() => handleCopy(serverSeedHash, 'serverSeed')}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: 'rgba(148, 163, 184, 0.15)',
                          border: '1px solid rgba(148, 163, 184, 0.3)',
                        }}
                      >
                        {copiedField === 'serverSeed' ? (
                          <Check className="w-4 h-4" style={{ color: '#22C55E' }} />
                        ) : (
                          <Copy className="w-4 h-4" style={{ color: '#94A3B8' }} />
                        )}
                      </motion.button>
                    </div>
                  </div>

                  {/* Client Seed */}
                  <div className="mb-4">
                    <label className="block text-xs font-semibold mb-2" style={{ color: '#CBD5E1' }}>
                      Client Seed
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={clientSeed}
                        onChange={(e) => setClientSeed(e.target.value)}
                        className="flex-1 p-3 rounded-lg text-xs font-mono"
                        style={{
                          backgroundColor: 'rgba(15, 23, 42, 0.8)',
                          border: '2px solid rgba(59, 130, 246, 0.3)',
                          color: '#FFFFFF',
                        }}
                      />
                      <motion.button
                        onClick={() => handleCopy(clientSeed, 'clientSeed')}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: 'rgba(148, 163, 184, 0.15)',
                          border: '1px solid rgba(148, 163, 184, 0.3)',
                        }}
                      >
                        {copiedField === 'clientSeed' ? (
                          <Check className="w-4 h-4" style={{ color: '#22C55E' }} />
                        ) : (
                          <Copy className="w-4 h-4" style={{ color: '#94A3B8' }} />
                        )}
                      </motion.button>
                    </div>
                  </div>

                  {/* Nonce */}
                  <div className="mb-4">
                    <label className="block text-xs font-semibold mb-2" style={{ color: '#CBD5E1' }}>
                      Nonce
                    </label>
                    <div className="flex items-center gap-2">
                      <div 
                        className="flex-1 p-3 rounded-lg text-xs font-mono"
                        style={{
                          backgroundColor: 'rgba(15, 23, 42, 0.8)',
                          border: '1px solid rgba(148, 163, 184, 0.2)',
                          color: '#FFFFFF',
                        }}
                      >
                        {nonce}
                      </div>
                      <motion.button
                        onClick={() => handleCopy(nonce.toString(), 'nonce')}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: 'rgba(148, 163, 184, 0.15)',
                          border: '1px solid rgba(148, 163, 184, 0.3)',
                        }}
                      >
                        {copiedField === 'nonce' ? (
                          <Check className="w-4 h-4" style={{ color: '#22C55E' }} />
                        ) : (
                          <Copy className="w-4 h-4" style={{ color: '#94A3B8' }} />
                        )}
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Explanation */}
                <div className="p-4 rounded-xl" style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                }}>
                  <p className="text-sm leading-relaxed" style={{ color: '#CBD5E1' }}>
                    Results are generated using: <span className="font-bold" style={{ color: '#3B82F6' }}>Server Seed + Client Seed + Nonce</span>. You can verify each round independently to ensure fairness.
                  </p>
                </div>

                {/* Verify Button */}
                <motion.button
                  onClick={() => {
                    setShowProvablyFairModal(false);
                    // TODO: Implement verification logic
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 rounded-xl font-black text-base"
                  style={{
                    background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
                    color: '#FFFFFF',
                    boxShadow: '0 8px 30px rgba(34, 197, 94, 0.4)',
                  }}
                >
                  Verify Result
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
