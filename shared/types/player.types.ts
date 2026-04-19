/**
 * @description Shared player types — PlayerProfile, BaseStats, EquippedItems, SkillNode
 * @author Abyssal Forge
 * @version 1.0.0
 */

export type PlayerClass = 'wraithblade' | 'ironbound' | 'voidcaller' | 'ashensage';
export type Wanderer = 'wanderer';
export type AnyClass = PlayerClass | Wanderer;

export type SkillTree = 'primary' | 'secondary' | 'tertiary';

export interface BaseStats {
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  attack: number;
  defence: number;
  speed: number;
  critChance: number;       // 0.0 – 1.0
  critMultiplier: number;   // 1.0 = no bonus, 2.0 = double damage
}

export interface PlayerProfile {
  id: string;               // Supabase UUID or guest ID
  username: string;
  class: AnyClass;
  level: number;            // 1–100
  combatXP: number;
  craftXP: number;
  dust: number;             // Common currency
  shards: number;           // Rare PvP currency
  arenaRating: number;      // ELO-style, starts 1000
  guildId: string | null;
  createdAt: string;
  isGuest: boolean;
}

export interface EquippedItems {
  weapon: string | null;    // item UUID
  offhand: string | null;
  helmet: string | null;
  chest: string | null;
  gloves: string | null;
  boots: string | null;
  ring1: string | null;
  ring2: string | null;
  amulet: string | null;
}

export interface SkillEffect {
  type: 'stat_bonus' | 'new_ability' | 'passive_proc' | 'modify_ability';
  target: string;
  value: number;
  condition?: string;
}

export interface SkillNode {
  id: string;
  name: string;
  description: string;
  tree: SkillTree;
  tier: number;             // 1–5
  unlocked: boolean;
  prerequisites: string[];  // skill node IDs
  effect: SkillEffect;
}

/** Generate a random guest username like VoidWalker#4821 */
export function generateGuestName(): string {
  const prefixes = [
    'VoidWalker', 'AbyssHunter', 'CryptStalker', 'ShadowForge',
    'BoneReaper', 'DarkBlade', 'SoulBinder', 'GraveWarden',
    'NightFang', 'AshBorn', 'RuneBreaker', 'DuskHunter',
  ];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}#${suffix}`;
}
