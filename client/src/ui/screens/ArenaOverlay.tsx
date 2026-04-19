/**
 * @description ArenaOverlay — PvP wagering and duel status UI.
 * @author Abyssal Forge
 * @version 1.0.0
 */
import React from 'react';
import { motion } from 'framer-motion';
import { usePlayerStore } from '../../store/playerStore';
import { useGameStore } from '../../store/gameStore';

export default function ArenaOverlay() {
  const profile = usePlayerStore(s => s.profile);
  const [wager, setWager] = React.useState(100);
  const [isLocked, setIsLocked] = React.useState(false);
  const [status, setStatus] = React.useState('Finding opponent...');

  const handleLock = () => {
    setIsLocked(true);
    setStatus('Wager locked. Waiting for opponent...');
    // In actual implementation, send to network
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        width: 450,
        padding: 32,
        background: 'rgba(15,15,20,0.95)',
        borderImage: 'url(/assets/ui_frame_gothic.png) 40 fill stretch',
        borderWidth: 20,
        color: '#e0e0e0',
        textAlign: 'center',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 100,
        pointerEvents: 'auto'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <h2 style={{ fontFamily: "'Cinzel', serif", color: '#ffcc00', marginBottom: 24, fontSize: 32 }}>THE ARENA</h2>
      
      <p style={{ marginBottom: 32, fontSize: 18, color: '#aaa' }}>{status}</p>

      {!isLocked && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 14 }}>WAGER SHARDS</label>
            <input 
              type="number" 
              value={wager} 
              onChange={(e) => setWager(Number(e.target.value))}
              style={{
                width: '100%',
                background: '#0a0a0c',
                border: '1px solid #333',
                color: '#fff',
                padding: '12px',
                fontSize: 20,
                textAlign: 'center',
                outline: 'none'
              }}
            />
          </div>
          <button 
            onClick={handleLock}
            style={{
              background: 'linear-gradient(180deg, #b32d2d 0%, #7a1a1a 100%)',
              border: '1px solid #ff4444',
              color: '#fff',
              padding: '16px',
              cursor: 'pointer',
              fontWeight: 'bold',
              letterSpacing: 2,
              textTransform: 'uppercase'
            }}
          >
            LOCK WAGER
          </button>
        </div>
      )}

      <div style={{ marginTop: 24, fontSize: 12, opacity: 0.6 }}>
        Winner takes all. Loser loses their wagered shards.
      </div>
    </motion.div>
  );
}
