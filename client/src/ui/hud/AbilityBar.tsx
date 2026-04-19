/**
 * @description AbilityBar — shows Q/E/R/F ability slots with keybind labels.
 * @author Abyssal Forge
 * @version 1.0.0
 */
import React from 'react';

const SLOTS = [
  { key: 'Q', label: 'Shadow Step', color: '#A855F7' },
  { key: 'E', label: 'Reaping Slash', color: '#A855F7' },
  { key: 'R', label: 'Ultimate', color: '#EF4444' },
  { key: 'F', label: 'Consumable', color: '#F59E0B' },
];

export default function AbilityBar() {
  return (
    <div className="flex gap-2 select-none">
      {SLOTS.map(slot => (
        <div key={slot.key} className="glass rounded-lg w-14 h-14 flex flex-col items-center justify-center gap-0.5 relative">
          <span className="text-lg" style={{ color: slot.color }}>✦</span>
          <span
            className="absolute -top-1.5 -left-1.5 text-[10px] font-mono font-bold px-1 rounded"
            style={{ background: slot.color, color: '#0D0D0F' }}
          >
            {slot.key}
          </span>
          <span className="text-[9px] text-gray-500 text-center leading-tight px-1">{slot.label}</span>
        </div>
      ))}
    </div>
  );
}
