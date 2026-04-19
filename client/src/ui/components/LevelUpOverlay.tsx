/**
 * @description LevelUpOverlay — animated full-screen level-up with inline styles.
 * @author Abyssal Forge
 * @version 1.0.0
 */
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePlayerStore } from '../../store/playerStore';

export default function LevelUpOverlay() {
  const level = usePlayerStore(s => s.profile?.level ?? 1);
  const setLevelingUp = usePlayerStore(s => s.setLevelingUp);

  useEffect(() => {
    const t = setTimeout(() => setLevelingUp(false), 2800);
    return () => clearTimeout(t);
  }, [setLevelingUp]);

  return (
    <motion.div
      style={{
        position: 'fixed', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        zIndex: 100, pointerEvents: 'none',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Dark overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} />

      {/* Content */}
      <motion.div
        style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}
        initial={{ scale: 0.5, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      >
        <motion.p
          style={{ color: '#A855F7', fontSize: 12, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.4em', textTransform: 'uppercase' }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        >
          Level Up
        </motion.p>
        <motion.div
          style={{ fontSize: 96, fontWeight: 900, color: '#A855F7', textShadow: '0 0 40px rgba(168,85,247,0.8), 0 0 80px rgba(168,85,247,0.4)', lineHeight: 1 }}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 0.6, repeat: 2 }}
        >
          {level}
        </motion.div>
        <p style={{ color: '#6B7280', fontSize: 14, letterSpacing: '0.05em' }}>Your power grows stronger</p>
        <div style={{
          marginTop: 8, padding: '6px 20px',
          border: '1px solid rgba(168,85,247,0.4)',
          borderRadius: 20, color: '#A855F7', fontSize: 12,
          background: 'rgba(168,85,247,0.1)',
        }}>
          +10 HP · +2 ATK · +1 DEF
        </div>
      </motion.div>
    </motion.div>
  );
}
