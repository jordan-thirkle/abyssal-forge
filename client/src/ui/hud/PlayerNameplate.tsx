/**
 * @description PlayerNameplate — username + level badge, top-left HUD.
 * @author Abyssal Forge
 * @version 1.0.0
 */
import React from 'react';
import { usePlayerStore } from '../../store/playerStore';

export default function PlayerNameplate() {
  const username = usePlayerStore(s => s.profile?.username ?? '');
  const level = usePlayerStore(s => s.profile?.level ?? 1);
  const cls = usePlayerStore(s => s.profile?.class ?? 'wanderer');

  return (
    <div style={{
      background: 'rgba(13,13,15,0.75)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(168,85,247,0.3)',
      borderRadius: 10,
      padding: '8px 14px',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      boxShadow: '0 0 20px rgba(168,85,247,0.15)',
    }}>
      {/* Class icon */}
      <div style={{
        width: 36, height: 36, borderRadius: 8,
        background: 'linear-gradient(135deg, #4c1d95, #7c3aed)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, border: '1px solid rgba(168,85,247,0.5)',
      }}>
        ⚔️
      </div>
      <div>
        <div style={{ color: '#F9FAFB', fontWeight: 600, fontSize: 13, letterSpacing: '0.02em' }}>
          {username}
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 2 }}>
          <span style={{
            background: '#A855F7', color: '#0D0D0F', fontSize: 10,
            fontWeight: 700, padding: '1px 5px', borderRadius: 4,
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            LV.{level}
          </span>
          <span style={{ color: '#6B7280', fontSize: 10, textTransform: 'capitalize' }}>{cls}</span>
        </div>
      </div>
    </div>
  );
}
