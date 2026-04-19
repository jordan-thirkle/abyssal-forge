/**
 * @description Enemy definitions — stats, attack patterns, AI parameters
 * @author Abyssal Forge
 * @version 1.0.0
 */
import type { AttackDefinition } from '../types/combat.types';

export interface EnemyDefinition {
  id: string;
  name: string;
  tier: number;
  maxHealth: number;
  attack: number;
  defence: number;
  speed: number;             // units per second
  aggroRange: number;        // units
  attackRange: number;       // units
  minRange?: number;         // minimum range (kiting enemies)
  xpReward: number;
  dustReward: [number, number]; // [min, max]
  attacks: AttackDefinition[];
  glowColor: string;         // Emissive hex for readability
}

export const HOLLOW_GRUNT: EnemyDefinition = {
  id: 'hollow_grunt',
  name: 'Hollow Grunt',
  tier: 1,
  maxHealth: 80,
  attack: 12,
  defence: 5,
  speed: 3,
  aggroRange: 8,
  attackRange: 1.5,
  xpReward: 25,
  dustReward: [2, 8],
  glowColor: '#22c55e',  // green — undead
  attacks: [
    {
      id: 'grunt_swing',
      name: 'Swing',
      damageMultiplier: 1.0,
      damageType: 'physical',
      cooldown: 1200,
      range: 1.5,
      animationName: 'attack_swing',
      particleEffect: 'hit_physical',
    },
    {
      id: 'grunt_lunge',
      name: 'Lunge',
      damageMultiplier: 1.2,
      damageType: 'physical',
      cooldown: 3000,
      range: 3,
      animationName: 'attack_lunge',
      particleEffect: 'hit_physical_heavy',
    },
  ],
};

export const BONE_ARCHER: EnemyDefinition = {
  id: 'bone_archer',
  name: 'Bone Archer',
  tier: 1,
  maxHealth: 55,
  attack: 10,
  defence: 2,
  speed: 2.5,
  aggroRange: 12,
  attackRange: 10,
  minRange: 4,             // kites backward if player gets closer
  xpReward: 35,
  dustReward: [3, 10],
  glowColor: '#eab308',   // yellow — ranged undead
  attacks: [
    {
      id: 'archer_arrow',
      name: 'Arrow',
      damageMultiplier: 0.8,
      damageType: 'physical',
      cooldown: 1500,
      range: 10,
      animationName: 'attack_shoot',
      particleEffect: 'projectile_arrow',
    },
  ],
};

export const CRYPT_WARDEN: EnemyDefinition = {
  id: 'crypt_warden',
  name: 'Crypt Warden',
  tier: 2,
  maxHealth: 150,
  attack: 18,
  defence: 10,
  speed: 2.2,
  aggroRange: 10,
  attackRange: 2,
  xpReward: 60,
  dustReward: [10, 25],
  glowColor: '#3b82f6',  // blue — elite
  attacks: [
    {
      id: 'warden_cleave',
      name: 'Cleave',
      damageMultiplier: 1.5,
      damageType: 'physical',
      cooldown: 2500,
      range: 2.5,
      animationName: 'attack_cleave',
      particleEffect: 'hit_physical_heavy',
    },
  ],
};

export const ABYSSAL_BOSS: EnemyDefinition = {
  id: 'abyssal_boss',
  name: 'The Abyssal Behemoth',
  tier: 5,
  maxHealth: 800,
  attack: 35,
  defence: 20,
  speed: 1.8,
  aggroRange: 15,
  attackRange: 3,
  xpReward: 500,
  dustReward: [100, 300],
  glowColor: '#ef4444',  // red — boss
  attacks: [
    {
      id: 'boss_slam',
      name: 'Ground Slam',
      damageMultiplier: 2.0,
      damageType: 'physical',
      cooldown: 4000,
      range: 4,
      animationName: 'attack_slam',
      particleEffect: 'hit_physical_boss',
    },
    {
      id: 'boss_void',
      name: 'Void Eruption',
      damageMultiplier: 1.0,
      damageType: 'magical',
      cooldown: 8000,
      range: 8,
      animationName: 'attack_cast',
      particleEffect: 'hit_void',
    },
  ],
};

export const ALL_ENEMIES: Record<string, EnemyDefinition> = {
  hollow_grunt: HOLLOW_GRUNT,
  bone_archer: BONE_ARCHER,
  crypt_warden: CRYPT_WARDEN,
  abyssal_boss: ABYSSAL_BOSS,
};
