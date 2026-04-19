/**
 * @description Server-side authoritative loot drops.
 * @author Abyssal Forge
 * @version 1.0.0
 */
import { DungeonState } from '../schemas/DungeonState';

export class ServerLoot {
  static rollDrop(state: DungeonState, enemyId: string) {
    // Determine drops based on enemy type and tier
    // Spawn LootSchema in state
  }
}
