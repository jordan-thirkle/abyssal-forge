/**
 * @description Inventory screen with equipment slots and grid.
 * @author Abyssal Forge
 * @version 1.0.0
 */
import React from 'react';
import { usePlayerStore } from '../../store/playerStore';

export default function Inventory() {
  const profile = usePlayerStore(s => s.profile);
  const dust = profile?.dust ?? 0;
  
  if (!profile) return null;

  return (
    <div style={{
      position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
      width: 800, height: 600, background: 'linear-gradient(135deg, rgba(13,13,15,0.98) 0%, rgba(20,20,25,0.95) 100%)',
      border: '32px solid transparent',
      borderImageSource: 'url("/assets/ui_frame.png")',
      borderImageSlice: 120, // Adjust based on generated image scale
      borderImageWidth: '32px',
      borderRadius: 4,
      display: 'flex', color: '#F9FAFB', fontFamily: "'Outfit', sans-serif",
      boxShadow: '0 0 60px rgba(0,0,0,0.9)', pointerEvents: 'auto',
      zIndex: 50,
    }}>
      {/* Left side: Character Equipment */}
      <div style={{ width: 300, borderRight: '1px solid rgba(255,255,255,0.1)', padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#A855F7', marginBottom: 24 }}>Equipment</h2>
        
        {/* Placeholder character silhouette */}
        <div style={{ width: 120, height: 240, background: 'rgba(255,255,255,0.05)', borderRadius: 8, marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 40, opacity: 0.5 }}>👤</span>
        </div>

        {/* Equipment Slots Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, width: '100%' }}>
          {['Weapon', 'Offhand', 'Helmet', 'Chest', 'Gloves', 'Boots'].map(slot => (
            <div key={slot} style={{
              height: 48, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, color: '#6B7280'
            }}>
              {slot}
            </div>
          ))}
        </div>
      </div>

      {/* Right side: Backpack Grid */}
      <div style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Backpack</h2>
          <div style={{ display: 'flex', gap: 12 }}>
            <span style={{ color: '#9CA3AF', fontSize: 14 }}>Dust: <span style={{ color: '#F9FAFB', fontFamily: "'JetBrains Mono', monospace" }}>{dust}</span></span>
          </div>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8,
          overflowY: 'auto', paddingRight: 8
        }}>
          {Array.from({ length: 42 }).map((_, i) => (
            <div key={i} style={{
              aspectRatio: '1', background: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(255,255,255,0.05)', borderRadius: 6,
              cursor: 'pointer'
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}
