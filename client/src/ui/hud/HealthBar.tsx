/**
 * @description HealthBar — real-time health display with animated fill and glassmorphism.
 * @author Abyssal Forge
 * @version 1.0.0
 */
import React from 'react';
import { motion } from 'framer-motion';
import { usePlayerStore } from '../../store/playerStore';

export default function HealthBar() {
  const health = usePlayerStore(s => s.stats.health);
  const maxHealth = usePlayerStore(s => s.stats.maxHealth);
  const username = usePlayerStore(s => s.profile?.username ?? '');
  const level = usePlayerStore(s => s.profile?.level ?? 1);
  const pct = Math.max(0, health / maxHealth);
  const hue = Math.round(pct * 120); // green → red

  return (
    <div className="glass rounded-xl p-3 select-none">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-400 font-mono tracking-wide truncate max-w-[120px]">{username}</span>
        <span className="text-xs font-mono text-accent-purple">Lv.{level}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">HP</span>
        <div className="flex-1 h-3 rounded-full bg-abyss-700 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: `hsl(${hue}, 80%, 45%)` }}
            animate={{ width: `${pct * 100}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
        <span className="text-xs font-mono text-gray-300 w-16 text-right">{health}/{maxHealth}</span>
      </div>
    </div>
  );
}
