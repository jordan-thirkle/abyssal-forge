/**
 * @description Shared combat types — DamageInstance, StatusEffect, CombatEvent, AttackDefinition
 * @author Abyssal Forge
 * @version 1.0.0
 */

export type DamageType = 'physical' | 'magical' | 'void' | 'fire' | 'frost' | 'true';

export type StatusEffect =
  | 'burning'     // fire DoT
  | 'bleeding'    // physical DoT
  | 'stunned'     // cannot act
  | 'slowed'      // reduced speed
  | 'cursed'      // increased damage taken
  | 'shielded'    // damage absorption
  | 'empowered';  // increased damage dealt

export interface DamageInstance {
  amount: number;
  type: DamageType;
  isCrit: boolean;
  sourceId: string;
  targetId: string;
  timestamp: number;
}

export interface StatusEffectInstance {
  effect: StatusEffect;
  duration: number;         // ms
  value: number;            // DoT damage, slow %, etc.
  sourceId: string;
  appliedAt: number;
}

export interface CombatEvent {
  type: 'damage' | 'heal' | 'status_applied' | 'status_expired' | 'death' | 'kill';
  data: DamageInstance | StatusEffectInstance | { entityId: string };
  timestamp: number;
}

export interface AttackDefinition {
  id: string;
  name: string;
  damageMultiplier: number; // multiplied against player attack stat
  damageType: DamageType;
  cooldown: number;         // ms
  range: number;            // Babylon.js units
  aoeRadius?: number;
  statusEffect?: {
    effect: StatusEffect;
    chance: number;         // 0.0 – 1.0
    duration: number;
    value: number;
  };
  animationName: string;
  particleEffect: string;
}
