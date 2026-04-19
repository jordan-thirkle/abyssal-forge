/**
 * @description XPBar — shows XP progress to next level with purple fill animation.
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
    <div className="glass rounded-xl px-3 py-2 select-none">
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">XP</span>
        <div className="flex-1 h-2 rounded-full bg-abyss-700 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-accent-purple"
            animate={{ width: `${pct * 100}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
        <span className="text-xs font-mono text-accent-purple w-20 text-right">{current}/{required}</span>
      </div>
    </div>
  );
}
