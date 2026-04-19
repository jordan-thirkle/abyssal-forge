/**
 * @description HealthBar — glassmorphism health display with animated fill.
 * @author Abyssal Forge
 * @version 1.0.0
 */
import React from 'react';
import { motion } from 'framer-motion';
import { usePlayerStore } from '../../store/playerStore';

export default function HealthBar() {
  const health = usePlayerStore(s => s.stats.health);
  const maxHealth = usePlayerStore(s => s.stats.maxHealth);
  const pct = Math.max(0, health / maxHealth);
  const r = Math.round(pct > 0.5 ? (1 - pct) * 2 * 200 : 200);
  const g = Math.round(pct > 0.5 ? 180 : pct * 2 * 180);
  const barColor = `rgb(${r},${g},40)`;

  return (
    <div style={{
      background: 'rgba(13,13,15,0.8)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 10,
      padding: '8px 12px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, alignItems: 'center' }}>
        <span style={{ color: '#9CA3AF', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Health</span>
        <span style={{ color: '#F9FAFB', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>{health}<span style={{ color: '#6B7280' }}>/{maxHealth}</span></span>
      </div>
      <div style={{ height: 8, background: '#1A1A1F', borderRadius: 6, overflow: 'hidden' }}>
        <motion.div
          style={{ height: '100%', borderRadius: 6, background: barColor, boxShadow: `0 0 8px ${barColor}` }}
          animate={{ width: `${pct * 100}%` }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
