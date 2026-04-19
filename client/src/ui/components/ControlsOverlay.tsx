/**
 * @description ControlsOverlay — simple guide for new players.
 * @author Abyssal Forge
 * @version 1.0.0
 */
import React from 'react';
import { motion } from 'framer-motion';

export default function ControlsOverlay({ onClose }: { onClose: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        position: 'absolute', bottom: 100, left: '50%', transform: 'translateX(-50%)',
        width: 600, padding: '24px 40px', background: 'rgba(10,10,15,0.9)',
        border: '1px solid rgba(59,130,246,0.3)', borderRadius: 12,
        color: '#fff', display: 'flex', justifyContent: 'space-between',
        pointerEvents: 'auto', backdropFilter: 'blur(10px)', zIndex: 200
      }}
    >
      <div style={{ flex: 1 }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: 14, color: '#3B82F6', textTransform: 'uppercase', letterSpacing: 1 }}>Movement</h3>
        <div style={{ fontSize: 18, fontWeight: 600 }}>WASD <span style={{ color: '#6B7280', fontSize: 14 }}>or Arrows</span></div>
      </div>
      
      <div style={{ flex: 1, borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: 24 }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: 14, color: '#3B82F6', textTransform: 'uppercase', letterSpacing: 1 }}>Combat</h3>
        <div style={{ fontSize: 18, fontWeight: 600 }}>Left Click <span style={{ color: '#6B7280', fontSize: 14 }}>Attack</span></div>
        <div style={{ fontSize: 18, fontWeight: 600 }}>Q, E, R <span style={{ color: '#6B7280', fontSize: 14 }}>Abilities</span></div>
      </div>

      <div style={{ flex: 1, borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: 24 }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: 14, color: '#3B82F6', textTransform: 'uppercase', letterSpacing: 1 }}>Menu</h3>
        <div style={{ fontSize: 18, fontWeight: 600 }}>I <span style={{ color: '#6B7280', fontSize: 14 }}>Inventory</span></div>
        <div style={{ fontSize: 18, fontWeight: 600 }}>ESC <span style={{ color: '#6B7280', fontSize: 14 }}>Close</span></div>
      </div>

      <button 
        onClick={onClose}
        style={{
          position: 'absolute', top: -10, right: -10, width: 24, height: 24,
          borderRadius: '50%', background: '#3B82F6', border: 'none', color: '#fff',
          cursor: 'pointer', fontWeight: 'bold'
        }}
      >
        ×
      </button>
    </motion.div>
  );
}
