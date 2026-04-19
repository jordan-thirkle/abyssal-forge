/**
 * @description Zustand inventory store — items, equipment slots, currency
 * @author Abyssal Forge
 * @version 1.0.0
 */
import { create } from 'zustand';
import type { Item, ItemSlot } from '@shared/types/item.types';

interface InventoryState {
  items: Item[];
  equipped: Partial<Record<ItemSlot, Item>>;
  addItem: (item: Item) => void;
  removeItem: (itemId: string) => void;
  equipItem: (item: Item) => void;
  unequipSlot: (slot: ItemSlot) => void;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  items: [],
  equipped: {},

  addItem(item) {
    set((s) => ({ items: [...s.items, item] }));
  },

  removeItem(itemId) {
    set((s) => ({ items: s.items.filter((i) => i.id !== itemId) }));
  },

  equipItem(item) {
    const { equipped, items } = get();
    // Move currently equipped item back to bag
    const currentlyEquipped = equipped[item.slot];
    const newItems = currentlyEquipped
      ? [...items.filter((i) => i.id !== item.id), currentlyEquipped]
      : items.filter((i) => i.id !== item.id);

    set({
      items: newItems,
      equipped: { ...equipped, [item.slot]: item },
    });
  },

  unequipSlot(slot) {
    const { equipped, items } = get();
    const item = equipped[slot];
    if (!item) return;
    const newEquipped = { ...equipped };
    delete newEquipped[slot];
    set({ equipped: newEquipped, items: [...items, item] });
  },
}));
