/**
 * @description Zustand inventory store — items, equipment slots, currency (Supabase Persistent)
 * @author Abyssal Forge
 * @version 1.1.0
 */
import { create } from 'zustand';
import type { Item, ItemSlot } from '@shared/types/item.types';
import { supabase } from '../lib/supabase';
import { usePlayerStore } from './playerStore';

interface InventoryState {
  items: Item[];
  equipped: Partial<Record<ItemSlot, Item>>;
  
  // Actions
  initInventory: () => Promise<void>;
  addItem: (item: Item) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  equipItem: (item: Item) => Promise<void>;
  unequipSlot: (slot: ItemSlot) => Promise<void>;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  items: [],
  equipped: {},

  async initInventory() {
    const profile = usePlayerStore.getState().profile;
    if (!profile || profile.id.startsWith('guest_')) return;

    try {
      // Fetch all items owned by player
      const { data: dbItems, error: itemsError } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('owner_id', profile.id);

      if (itemsError) throw itemsError;

      // Fetch equipment slots
      const { data: dbEquipped, error: equipError } = await supabase
        .from('player_equipment')
        .select('*')
        .eq('player_id', profile.id)
        .single();

      if (equipError && equipError.code !== 'PGRST116') {
        throw equipError; // PGRST116 is "no rows", which is fine for new players
      }

      const allItems: Item[] = (dbItems || []).map(row => ({
        id: row.id,
        templateId: row.template_id,
        name: row.name,
        type: row.item_type as any,
        slot: row.slot as ItemSlot,
        rarity: row.rarity as any,
        level: row.required_level,
        stats: row.stats || [],
        passiveTrait: row.passive_trait,
        uniqueAbility: row.unique_ability,
        runeSlots: row.rune_slots,
        socketedRunes: row.socketed_runes || [],
        isTradeable: row.is_tradeable,
        ownerId: row.owner_id,
        acquiredAt: row.acquired_at
      }));

      // Separate into equipped vs bag
      const equipped: Partial<Record<ItemSlot, Item>> = {};
      const items: Item[] = [];

      // Create a set of equipped item IDs for fast lookup
      const equippedIds = new Set<string>();
      if (dbEquipped) {
        Object.keys(dbEquipped).forEach(key => {
          if (key !== 'player_id' && dbEquipped[key]) {
            equippedIds.add(dbEquipped[key]);
            // Match db key to ItemSlot
            let slotKey = key as ItemSlot;
            if (key === 'ring1' || key === 'ring2') slotKey = 'ring' as ItemSlot; // Simplified mapping
            const item = allItems.find(i => i.id === dbEquipped[key]);
            if (item) equipped[slotKey] = item;
          }
        });
      }

      allItems.forEach(item => {
        if (!equippedIds.has(item.id)) {
          items.push(item);
        }
      });

      set({ items, equipped });

    } catch (e) {
      console.error("Failed to init inventory from Supabase:", e);
    }
  },

  async addItem(item) {
    const profile = usePlayerStore.getState().profile;
    set((s) => ({ items: [...s.items, item] }));

    if (profile && !profile.id.startsWith('guest_')) {
      await supabase.from('inventory_items').insert({
        id: item.id,
        owner_id: profile.id,
        template_id: item.templateId,
        name: item.name,
        item_type: item.type,
        slot: item.slot,
        rarity: item.rarity,
        required_level: item.level,
        stats: item.stats,
        passive_trait: item.passiveTrait,
        unique_ability: item.uniqueAbility,
        rune_slots: item.runeSlots,
        socketed_runes: item.socketedRunes,
        is_tradeable: item.isTradeable,
        acquired_at: item.acquiredAt
      });
    }
  },

  async removeItem(itemId) {
    set((s) => ({ items: s.items.filter((i) => i.id !== itemId) }));
    await supabase.from('inventory_items').delete().eq('id', itemId);
  },

  async equipItem(item) {
    const profile = usePlayerStore.getState().profile;
    const { equipped, items } = get();
    
    const currentlyEquipped = equipped[item.slot];
    const newItems = currentlyEquipped
      ? [...items.filter((i) => i.id !== item.id), currentlyEquipped]
      : items.filter((i) => i.id !== item.id);

    const newEquipped = { ...equipped, [item.slot]: item };
    set({ items: newItems, equipped: newEquipped });

    if (profile && !profile.id.startsWith('guest_')) {
      // Upsert player_equipment
      await supabase.from('player_equipment').upsert({
        player_id: profile.id,
        [item.slot === 'ring' ? 'ring1' : item.slot]: item.id
      });
    }
  },

  async unequipSlot(slot) {
    const profile = usePlayerStore.getState().profile;
    const { equipped, items } = get();
    const item = equipped[slot];
    if (!item) return;
    
    const newEquipped = { ...equipped };
    delete newEquipped[slot];
    set({ equipped: newEquipped, items: [...items, item] });

    if (profile && !profile.id.startsWith('guest_')) {
      await supabase.from('player_equipment').update({
        [slot === 'ring' ? 'ring1' : slot]: null
      }).eq('player_id', profile.id);
    }
  },
}));
