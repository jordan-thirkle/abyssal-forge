/**
 * @description All combat, loot, XP, and economy tuning constants. Never hardcode these values in game logic.
 * @author Abyssal Forge
 * @version 1.0.0
 */
import type { ItemRarity } from '../types/item.types';

export const COMBAT = {
  BASE_ATTACK_SPEED_MS: 800,
  DODGE_INVINCIBILITY_MS: 300,
  DODGE_COOLDOWN_MS: 1200,
  DODGE_MANA_COST: 10,
  KNOCKBACK_FORCE: 8,
  CRIT_DAMAGE_MULTIPLIER: 2.0,
  STATUS_TICK_INTERVAL_MS: 500,
  COMBO_WINDOW_MS: 400,           // Time to continue light attack chain
  COMBO_RESET_MS: 600,            // Time after which combo resets
  HEAVY_WINDUP_MS: 200,           // Heavy attack wind-up duration
  HEAVY_COOLDOWN_MS: 1500,
  HIT_STOP_DURATION_MS: 80,       // Freeze duration on heavy hit
  SCREEN_SHAKE_INTENSITY: 0.08,   // Units
  SCREEN_SHAKE_DURATION_MS: 120,
  LIGHT_COMBO_MULTIPLIERS: [1.0, 1.1, 1.3] as const,  // Hit 1, 2, 3
  HEAVY_DAMAGE_MULTIPLIER: 1.8,
} as const;

export const LOOT = {
  RARITY_WEIGHTS: {
    common:    0.60,
    rare:      0.25,
    epic:      0.10,
    legendary: 0.04,
    abyssal:   0.01,
  } as Record<ItemRarity, number>,
  BASE_DROP_CHANCE: 0.40,         // 40% chance enemy drops anything
  DROP_CHANCE_PER_TIER: 0.05,     // +5% per dungeon tier
  BOSS_RARITY_MULTIPLIER: 3.0,
  MIN_ENEMIES_PER_FLOOR: 12,
  MAX_ENEMIES_PER_FLOOR: 24,
  PICKUP_DISTANCE_UNITS: 1.5,
  PICKUP_CHECK_INTERVAL_MS: 100,
  ORB_BOB_AMPLITUDE: 0.1,
  ORB_BOB_PERIOD_S: 2,
} as const;

export const XP = {
  LEVEL_THRESHOLDS: [
    0, 100, 250, 500, 900, 1400, 2100, 3000, 4200, 5800,     // 1–10
    7700, 10000, 12800, 16100, 20000, 24600, 29900, 36100, 43300, 51600,  // 11–20
  ],
  GRUNT_XP: 25,
  ARCHER_XP: 35,
  WARDEN_XP: 80,
  BOSS_XP: 500,
  FLOOR_CLEAR_XP: 150,
} as const;

export const ECONOMY = {
  AUCTION_LISTING_FEE_PERCENT: 0.01,   // 1% listing fee
  AUCTION_SALE_FEE_PERCENT: 0.05,      // 5% sale fee
  WAGER_MIN_DUST: 100,
  PVP_WIN_SHARDS: 50,
  PVP_LOSS_SHARDS: 0,
  BOSS_KILL_SHARDS: 10,
  STARTING_DUST: 500,
} as const;

export const RARITY_COLORS: Record<ItemRarity, string> = {
  common:    '#9CA3AF',
  rare:      '#3B82F6',
  epic:      '#A855F7',
  legendary: '#F59E0B',
  abyssal:   '#EF4444',
} as const;

export const DUNGEON_TIERS = {
  1: { name: 'Cursed Catacombs',     minLevel: 1,  maxLevel: 10 },
  2: { name: 'Blighted Warrens',     minLevel: 11, maxLevel: 20 },
  3: { name: 'Ossuary of the Damned',minLevel: 21, maxLevel: 30 },
  4: { name: 'Void Rifts',           minLevel: 31, maxLevel: 40 },
  5: { name: 'Abyssal Core',         minLevel: 41, maxLevel: 50 },
} as const;
