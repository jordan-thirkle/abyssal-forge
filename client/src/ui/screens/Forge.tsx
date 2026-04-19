/**
 * @description Forge UI for crafting and upgrading items.
 * @author Abyssal Forge
 * @version 1.0.0
 */
import React from 'react';
import { usePlayerStore } from '../../store/playerStore';

export default function Forge() {
  const profile = usePlayerStore(s => s.profile);
  
  if (!profile) return null;

  return (
    <div style={{
      position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
      width: 600, height: 450, background: 'linear-gradient(180deg, rgba(20,15,10,0.98) 0%, rgba(10,10,12,0.95) 100%)',
      border: '24px solid transparent',
      borderImageSource: 'url("/assets/ui_frame.png")',
      borderImageSlice: 120,
      borderImageWidth: '24px',
      display: 'flex', flexDirection: 'column', color: '#F9FAFB', fontFamily: "'Outfit', sans-serif",
      boxShadow: '0 0 50px rgba(245,158,11,0.15)', pointerEvents: 'auto',
      zIndex: 50, padding: 12
    }}
    onClick={(e) => e.stopPropagation()}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#F59E0B' }}>The Abyssal Forge</h2>
        <div style={{ fontSize: 14, color: '#9CA3AF' }}>Craft XP: <span style={{ color: '#F9FAFB' }}>{profile.craftXP}</span></div>
      </div>

      <div style={{ display: 'flex', gap: 24, flex: 1 }}>
        {/* Left: Input Slot */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px dashed rgba(255,255,255,0.1)' }}>
          <div style={{ width: 64, height: 64, background: 'rgba(0,0,0,0.5)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', marginBottom: 16 }} />
          <span style={{ fontSize: 12, color: '#6B7280' }}>Drop Item to Upgrade/Dismantle</span>
        </div>

        {/* Right: Actions */}
        <div style={{ width: 200, display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center' }}>
          <button style={{
            padding: '12px 16px', background: 'rgba(245,158,11,0.1)', border: '1px solid #F59E0B',
            color: '#F59E0B', borderRadius: 6, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
          }}>
            Upgrade Item
          </button>
          <button style={{
            padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid #EF4444',
            color: '#EF4444', borderRadius: 6, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
          }}>
            Dismantle
          </button>
          <div style={{ marginTop: 16, fontSize: 12, color: '#9CA3AF', textAlign: 'center' }}>
            Success Chance: <span style={{ color: '#10B981' }}>75%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
