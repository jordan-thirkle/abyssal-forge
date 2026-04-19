/**
 * @description Auction House UI for player trading.
 * @author Abyssal Forge
 * @version 1.0.0
 */
import React from 'react';

export default function AuctionHouse() {
  return (
    <div style={{
      position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
      width: 900, height: 600, background: 'linear-gradient(135deg, rgba(10,15,25,0.98) 0%, rgba(5,5,10,0.96) 100%)',
      border: '32px solid transparent',
      borderImageSource: 'url("/assets/ui_frame.png")',
      borderImageSlice: 120,
      borderImageWidth: '32px',
      display: 'flex', flexDirection: 'column', color: '#F9FAFB', fontFamily: "'Outfit', sans-serif",
      boxShadow: '0 0 60px rgba(0,0,0,0.95)', pointerEvents: 'auto',
      zIndex: 50
    }}
    onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div style={{ padding: 24, borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#3B82F6' }}>Auction House</h2>
        <div style={{ display: 'flex', gap: 16 }}>
          <button style={{ background: 'transparent', color: '#F9FAFB', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>Browse</button>
          <button style={{ background: 'transparent', color: '#9CA3AF', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>My Listings</button>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex' }}>
        {/* Sidebar Filters */}
        <div style={{ width: 220, borderRight: '1px solid rgba(255,255,255,0.1)', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 style={{ fontSize: 12, textTransform: 'uppercase', color: '#6B7280', letterSpacing: '0.05em' }}>Filters</h3>
          <select style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: '#F9FAFB', padding: 8, borderRadius: 6 }}>
            <option>All Items</option>
            <option>Weapons</option>
            <option>Armor</option>
            <option>Materials</option>
          </select>
          <select style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: '#F9FAFB', padding: 8, borderRadius: 6 }}>
            <option>Any Rarity</option>
            <option>Rare+</option>
            <option>Epic+</option>
            <option>Legendary+</option>
          </select>
        </div>

        {/* Listings */}
        <div style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Example Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 40, height: 40, background: 'rgba(168,85,247,0.2)', border: '1px solid #A855F7', borderRadius: 4 }} />
                <div>
                  <div style={{ color: '#A855F7', fontWeight: 600 }}>Void Blade</div>
                  <div style={{ fontSize: 12, color: '#6B7280' }}>Level 10 Weapon</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <span style={{ fontSize: 10, color: '#9CA3AF' }}>Buyout Price</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#F9FAFB', fontFamily: "'JetBrains Mono', monospace" }}>1,200 Dust</span>
                </div>
                <button style={{ background: '#3B82F6', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>Buy</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
