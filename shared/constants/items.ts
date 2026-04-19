/**
 * @description Item templates and equipment definitions.
 * @author Abyssal Forge
 * @version 1.0.0
 */

export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'abyssal';
export type ItemSlot = 'weapon' | 'offhand' | 'helmet' | 'chest' | 'gloves' | 'boots' | 'ring1' | 'ring2' | 'amulet' | 'none';

export interface ItemTemplate {
  id: string;
  name: string;
  type: 'equipment' | 'material' | 'consumable';
  slot: ItemSlot;
  baseRarity: ItemRarity;
  requiredLevel: number;
  baseStats: {
    attack?: number;
    defence?: number;
    health?: number;
    mana?: number;
    speed?: number;
  };
}

export const ITEM_TEMPLATES: Record<string, ItemTemplate> = {
  // WEAPONS
  'wpn_rusted_sword': {
    id: 'wpn_rusted_sword',
    name: 'Rusted Sword',
    type: 'equipment',
    slot: 'weapon',
    baseRarity: 'common',
    requiredLevel: 1,
    baseStats: { attack: 3 }
  },
  'wpn_void_blade': {
    id: 'wpn_void_blade',
    name: 'Void Blade',
    type: 'equipment',
    slot: 'weapon',
    baseRarity: 'epic',
    requiredLevel: 10,
    baseStats: { attack: 18, speed: 1.5 }
  },
  
  // ARMOR
  'arm_leather_tunic': {
    id: 'arm_leather_tunic',
    name: 'Leather Tunic',
    type: 'equipment',
    slot: 'chest',
    baseRarity: 'common',
    requiredLevel: 1,
    baseStats: { defence: 2, health: 10 }
  },
  'arm_abyssal_plate': {
    id: 'arm_abyssal_plate',
    name: 'Abyssal Plate',
    type: 'equipment',
    slot: 'chest',
    baseRarity: 'legendary',
    requiredLevel: 20,
    baseStats: { defence: 25, health: 100 }
  },

  // MATERIALS
  'mat_iron_ore': {
    id: 'mat_iron_ore',
    name: 'Iron Ore',
    type: 'material',
    slot: 'none',
    baseRarity: 'common',
    requiredLevel: 1,
    baseStats: {}
  },
  'mat_void_crystal': {
    id: 'mat_void_crystal',
    name: 'Void Crystal',
    type: 'material',
    slot: 'none',
    baseRarity: 'rare',
    requiredLevel: 5,
    baseStats: {}
  }
};
