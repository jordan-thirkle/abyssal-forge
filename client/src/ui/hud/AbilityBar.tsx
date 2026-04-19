/**
 * @description AbilityBar — Q/E/R/F slots with glassmorphism, inline styles.
 * @author Abyssal Forge
 * @version 1.0.0
 */
import React from 'react';

const SLOTS = [
  { key: 'Q', label: 'Shadow Step',   icon: '🌑', color: '#A855F7' },
  { key: 'E', label: 'Reaping Slash', icon: '⚔️', color: '#A855F7' },
  { key: 'R', label: 'Ultimate',      icon: '💀', color: '#EF4444' },
  { key: 'F', label: 'Flask',         icon: '🧪', color: '#F59E0B' },
];

export default function AbilityBar() {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {SLOTS.map(slot => (
        <div key={slot.key} style={{
          width: 60, height: 60,
          background: 'rgba(13,13,15,0.85)',
          backdropFilter: 'blur(12px)',
          border: `1px solid ${slot.color}44`,
          borderRadius: 10,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 2, position: 'relative',
          boxShadow: `0 0 12px ${slot.color}22`,
        }}>
          {/* Keybind badge */}
          <div style={{
            position: 'absolute', top: -6, left: -6,
            background: slot.color, color: '#0D0D0F',
            fontSize: 9, fontWeight: 800,
            padding: '1px 4px', borderRadius: 4,
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {slot.key}
          </div>
          <span style={{ fontSize: 20 }}>{slot.icon}</span>
          <span style={{ fontSize: 8, color: '#6B7280', textAlign: 'center', lineHeight: 1.2 }}>{slot.label}</span>
        </div>
      ))}
    </div>
  );
}
