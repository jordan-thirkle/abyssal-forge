/**
 * @description Zustand player store — stats, XP, level, currency, class
 * @author Abyssal Forge
 * @version 1.0.0
 */
import { create } from 'zustand';
import type { BaseStats, PlayerProfile, AnyClass } from '@shared/types/player.types';
import { XP } from '@shared/constants/balance';

const BASE_WANDERER_STATS: BaseStats = {
  health: 100,
  maxHealth: 100,
  mana: 80,
  maxMana: 80,
  attack: 15,
  defence: 8,
  speed: 4,
  critChance: 0.05,
  critMultiplier: 2.0,
};

interface PlayerState {
  profile: PlayerProfile | null;
  stats: BaseStats;
  isLevelingUp: boolean;

  // Actions
  init: (username: string, fromPortal?: boolean, portalHp?: number) => void;
  takeDamage: (amount: number) => void;
  heal: (amount: number) => void;
  gainXP: (amount: number) => void;
  gainDust: (amount: number) => void;
  setLevelingUp: (val: boolean) => void;
}

function getLevel(xp: number): number {
  const thresholds = XP.LEVEL_THRESHOLDS;
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (xp >= thresholds[i]) return i + 1;
  }
  return 1;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  profile: null,
  stats: { ...BASE_WANDERER_STATS },
  isLevelingUp: false,

  init(username, fromPortal = false, portalHp) {
    const id = `guest_${Math.random().toString(36).slice(2)}`;
    const profile: PlayerProfile = {
      id,
      username,
      class: 'wanderer' as AnyClass,
      level: 1,
      combatXP: 0,
      craftXP: 0,
      dust: 500,
      shards: 0,
      arenaRating: 1000,
      guildId: null,
      createdAt: new Date().toISOString(),
      isGuest: true,
    };
    const stats = { ...BASE_WANDERER_STATS };
    if (fromPortal && portalHp !== undefined) {
      stats.health = Math.round((portalHp / 100) * stats.maxHealth);
    }
    set({ profile, stats });
  },

  takeDamage(amount) {
    set((s) => ({
      stats: {
        ...s.stats,
        health: Math.max(0, s.stats.health - amount),
      },
    }));
  },

  heal(amount) {
    set((s) => ({
      stats: {
        ...s.stats,
        health: Math.min(s.stats.maxHealth, s.stats.health + amount),
      },
    }));
  },

  gainXP(amount) {
    const { profile, stats } = get();
    if (!profile) return;
    const prevLevel = profile.level;
    const newXP = profile.combatXP + amount;
    const newLevel = getLevel(newXP);
    const didLevelUp = newLevel > prevLevel;

    // Scale stats on level-up
    const updatedStats = didLevelUp
      ? {
          ...stats,
          maxHealth: stats.maxHealth + 10 * (newLevel - prevLevel),
          health: stats.maxHealth + 10 * (newLevel - prevLevel), // full heal on level-up
          attack: stats.attack + 2 * (newLevel - prevLevel),
          defence: stats.defence + 1 * (newLevel - prevLevel),
        }
      : stats;

    set({
      profile: { ...profile, combatXP: newXP, level: newLevel },
      stats: updatedStats,
      isLevelingUp: didLevelUp,
    });
  },

  gainDust(amount) {
    set((s) => ({
      profile: s.profile ? { ...s.profile, dust: s.profile.dust + amount } : null,
    }));
  },

  setLevelingUp(val) {
    set({ isLevelingUp: val });
  },
}));
