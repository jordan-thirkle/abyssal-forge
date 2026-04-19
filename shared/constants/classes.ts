/**
 * @description Class definitions and base stats.
 * @author Abyssal Forge
 * @version 1.0.0
 */
import type { AnyClass, BaseStats } from '../types/player.types';

export interface ClassDefinition {
  id: AnyClass;
  name: string;
  description: string;
  baseStats: BaseStats;
  themeColor: string; // Tailwind class or hex
}

export const CLASSES: Record<AnyClass, ClassDefinition> = {
  wanderer: {
    id: 'wanderer',
    name: 'Wanderer',
    description: 'A well-rounded survivor with no specialized training.',
    themeColor: '#9CA3AF', // Gray
    baseStats: {
      health: 100, maxHealth: 100,
      mana: 80, maxMana: 80,
      attack: 15, defence: 8, speed: 4,
      critChance: 0.05, critMultiplier: 2.0
    }
  },
  wraithblade: {
    id: 'wraithblade',
    name: 'Wraithblade',
    description: 'A swift assassin striking from the shadows.',
    themeColor: '#A855F7', // Purple
    baseStats: {
      health: 80, maxHealth: 80,
      mana: 100, maxMana: 100,
      attack: 22, defence: 5, speed: 5.5,
      critChance: 0.15, critMultiplier: 2.5
    }
  },
  ironbound: {
    id: 'ironbound',
    name: 'Ironbound',
    description: 'A heavily armored juggernaut built to endure.',
    themeColor: '#F59E0B', // Gold/Amber
    baseStats: {
      health: 150, maxHealth: 150,
      mana: 40, maxMana: 40,
      attack: 12, defence: 15, speed: 3.2,
      critChance: 0.03, critMultiplier: 1.5
    }
  },
  voidcaller: {
    id: 'voidcaller',
    name: 'Voidcaller',
    description: 'A spellcaster wielding destructive abyssal magic.',
    themeColor: '#3B82F6', // Blue
    baseStats: {
      health: 70, maxHealth: 70,
      mana: 150, maxMana: 150,
      attack: 25, defence: 4, speed: 4.5,
      critChance: 0.10, critMultiplier: 2.0
    }
  },
  ashensage: {
    id: 'ashensage',
    name: 'Ashensage',
    description: 'A master of flame and area denial.',
    themeColor: '#EF4444', // Red
    baseStats: {
      health: 90, maxHealth: 90,
      mana: 120, maxMana: 120,
      attack: 18, defence: 6, speed: 4.0,
      critChance: 0.08, critMultiplier: 2.2
    }
  }
};
