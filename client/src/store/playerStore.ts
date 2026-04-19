/**
 * @description Zustand player store — stats, XP, level, currency, class (Supabase persistent)
 * @author Abyssal Forge
 * @version 1.1.0
 */
import { create } from 'zustand';
import type { BaseStats, PlayerProfile, AnyClass } from '@shared/types/player.types';
import { XP } from '@shared/constants/balance';
import { supabase } from '../lib/supabase';
import { useInventoryStore } from './inventoryStore';

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
  init: (username?: string, fromPortal?: boolean, portalHp?: number) => Promise<void>;
  takeDamage: (amount: number) => void;
  heal: (amount: number) => void;
  gainXP: (amount: number) => void;
  gainDust: (amount: number) => void;
  setLevelingUp: (val: boolean) => void;
  saveProfile: () => Promise<void>;
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

  async init(username = `VoidWalker#${Math.floor(Math.random() * 9000) + 1000}`, fromPortal = false, portalHp) {
    if (get().profile) return; // already initialized

    try {
      // 1. Sign in anonymously
      if (!supabase) throw new Error("Supabase client not initialized");
      
      const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
      if (authError) throw authError;

      const userId = authData.user?.id;
      if (!userId) throw new Error("No user ID returned from anonymous auth");

      // 2. Try to fetch existing profile
      const { data: existingProfile, error: fetchError } = await supabase
        .from('player_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      let profile: PlayerProfile;

      if (existingProfile) {
        // Load existing
        profile = {
          id: existingProfile.id,
          username: existingProfile.username,
          class: existingProfile.class as AnyClass,
          level: existingProfile.level,
          combatXP: existingProfile.combat_xp,
          craftXP: existingProfile.craft_xp,
          dust: existingProfile.dust,
          shards: existingProfile.shards,
          arenaRating: existingProfile.arena_rating,
          guildId: existingProfile.guild_id,
          createdAt: existingProfile.created_at,
          isGuest: true,
        };
      } else {
        // Create new
        profile = {
          id: userId,
          username,
          class: 'wanderer',
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

        const { error: insertError } = await supabase
          .from('player_profiles')
          .insert({
            id: profile.id,
            username: profile.username,
            class: profile.class,
            level: profile.level,
            combat_xp: profile.combatXP,
            craft_xp: profile.craftXP,
            dust: profile.dust,
            shards: profile.shards,
            arena_rating: profile.arenaRating,
          });

        if (insertError) {
          console.error("Failed to insert profile, continuing with local state", insertError);
        }
      }

      // Calculate stats based on level
      const stats = { ...BASE_WANDERER_STATS };
      stats.maxHealth += 10 * (profile.level - 1);
      stats.health = stats.maxHealth;
      stats.attack += 2 * (profile.level - 1);
      stats.defence += 1 * (profile.level - 1);

      if (fromPortal && portalHp !== undefined) {
        stats.health = Math.round((portalHp / 100) * stats.maxHealth);
      }

      set({ profile, stats });
      
      // Initialize inventory from Supabase
      useInventoryStore.getState().initInventory();

    } catch (e) {
      console.error("Supabase init failed, falling back to local-only guest session", e);
      // Fallback local session if Supabase is down/unconfigured
      const id = `guest_${Math.random().toString(36).slice(2)}`;
      const profile: PlayerProfile = {
        id, username, class: 'wanderer', level: 1, combatXP: 0, craftXP: 0,
        dust: 500, shards: 0, arenaRating: 1000, guildId: null,
        createdAt: new Date().toISOString(), isGuest: true,
      };
      const stats = { ...BASE_WANDERER_STATS };
      if (fromPortal && portalHp !== undefined) {
        stats.health = Math.round((portalHp / 100) * stats.maxHealth);
      }
      set({ profile, stats });
    }
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
    
    // Save to DB asynchronously
    get().saveProfile();
  },

  gainDust(amount) {
    const { profile } = get();
    if (!profile) return;
    set({
      profile: { ...profile, dust: profile.dust + amount }
    });
    get().saveProfile();
  },

  setLevelingUp(val) {
    set({ isLevelingUp: val });
  },

  async saveProfile() {
    const { profile } = get();
    if (!profile || profile.id.startsWith('guest_')) return;

    await supabase
      .from('player_profiles')
      .update({
        level: profile.level,
        combat_xp: profile.combatXP,
        craft_xp: profile.craftXP,
        dust: profile.dust,
        shards: profile.shards,
        arena_rating: profile.arenaRating,
        last_seen_at: new Date().toISOString()
      })
      .eq('id', profile.id);
  }
}));
