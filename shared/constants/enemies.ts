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

export const ALL_ENEMIES: Record<string, EnemyDefinition> = {
  hollow_grunt: HOLLOW_GRUNT,
  bone_archer: BONE_ARCHER,
};
