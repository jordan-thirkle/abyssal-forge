/**
 * @description LevelUpOverlay — full-screen framer-motion overlay on level up.
 * @author Abyssal Forge
 * @version 1.0.0
 */
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePlayerStore } from '../../store/playerStore';

export default function LevelUpOverlay() {
  const level = usePlayerStore(s => s.profile?.level ?? 1);
  const setLevelingUp = usePlayerStore(s => s.setLevelingUp);

  useEffect(() => {
    const t = setTimeout(() => setLevelingUp(false), 2800);
    return () => clearTimeout(t);
  }, [setLevelingUp]);

  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-center pointer-events-none z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div
        className="relative flex flex-col items-center gap-4"
        initial={{ scale: 0.5, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      >
        <motion.p
          className="text-accent-purple text-sm font-mono tracking-[0.4em] uppercase"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        >
          Level Up
        </motion.p>
        <motion.h1
          className="text-8xl font-bold glow-purple"
          style={{ color: '#A855F7', fontFamily: 'Inter, sans-serif' }}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 0.6, repeat: 2 }}
        >
          {level}
        </motion.h1>
        <p className="text-gray-400 text-sm">Your power grows stronger</p>
      </motion.div>
    </motion.div>
  );
}
