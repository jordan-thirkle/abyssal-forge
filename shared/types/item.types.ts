/**
 * @description Shared item types — Item, ItemTemplate, LootDrop, rarity definitions
 * @author Abyssal Forge
 * @version 1.0.0
 */
import type { BaseStats } from './player.types';

export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'abyssal';

export type ItemSlot =
  | 'weapon' | 'offhand' | 'helmet' | 'chest'
  | 'gloves' | 'boots' | 'ring' | 'amulet'
  | 'material' | 'rune' | 'consumable';

export type ItemType =
  | 'sword' | 'axe' | 'staff' | 'shield'
  | 'armour' | 'jewellery' | 'material' | 'rune';

export interface ItemStat {
  stat: keyof BaseStats;
  value: number;
  isPercentage: boolean;
}

export interface Item {
  id: string;               // UUID, generated on drop
  templateId: string;       // References item template in constants
  name: string;
  type: ItemType;
  slot: ItemSlot;
  rarity: ItemRarity;
  level: number;            // Required player level to equip
  stats: ItemStat[];
  passiveTrait?: string;    // Epic+ only
  uniqueAbility?: string;   // Legendary only
  runeSlots: number;        // 0–3
  socketedRunes: string[];  // rune item IDs
  isTradeable: boolean;     // Abyssal = false
  ownerId: string;
  acquiredAt: string;
}

export interface ItemTemplate {
  templateId: string;
  name: string;
  type: ItemType;
  slot: ItemSlot;
  baseDamage?: [number, number];
  baseStats: Partial<Record<keyof BaseStats, [number, number]>>;
  allowedRarities: ItemRarity[];
  dropSources: string[];
  loreText: string;
}

export interface LootDrop {
  item: Item;
  worldPosition: { x: number; y: number; z: number };
  glowColor: string;        // hex, driven by rarity
}
