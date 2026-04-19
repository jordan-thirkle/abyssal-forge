/**
 * @description XPBar — purple XP progress with inline styles.
 * @author Abyssal Forge
 * @version 1.0.0
 */
import React from 'react';
import { motion } from 'framer-motion';
import { usePlayerStore } from '../../store/playerStore';
import { XPSystem } from '../../game/systems/XPSystem';

export default function XPBar() {
  const xp = usePlayerStore(s => s.profile?.combatXP ?? 0);
  const { current, required } = XPSystem.getXPForNext(xp);
  const pct = Math.min(1, current / required);

  return (
    <div style={{
      background: 'rgba(13,13,15,0.75)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 10,
      padding: '6px 12px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, alignItems: 'center' }}>
        <span style={{ color: '#9CA3AF', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Experience</span>
        <span style={{ color: '#A855F7', fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}>{current}<span style={{ color: '#6B7280' }}>/{required}</span></span>
      </div>
      <div style={{ height: 5, background: '#1A1A1F', borderRadius: 4, overflow: 'hidden' }}>
        <motion.div
          style={{ height: '100%', borderRadius: 4, background: 'linear-gradient(90deg, #7c3aed, #a855f7)', boxShadow: '0 0 8px rgba(168,85,247,0.5)' }}
          animate={{ width: `${pct * 100}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
