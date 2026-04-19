/**
 * @description Colyseus state schemas for the Dungeon room.
 * @author Abyssal Forge
 * @version 1.0.0
 */
import { Schema, type, MapSchema } from '@colyseus/schema';
import type { NetworkPlayer, NetworkEnemy, NetworkPosition, NetworkLoot } from '../../../shared/types/dungeon.types';

export class PositionSchema extends Schema implements NetworkPosition {
  @type('number') x: number = 0;
  @type('number') y: number = 0;
  @type('number') z: number = 0;
}

export class PlayerSchema extends Schema implements NetworkPlayer {
  @type('string') id: string = '';
  @type('string') username: string = '';
  @type('string') class: string = 'wanderer';
  @type('number') level: number = 1;
  @type('number') health: number = 100;
  @type('number') maxHealth: number = 100;
  @type(PositionSchema) position: PositionSchema = new PositionSchema();
  @type('number') rotation: number = 0;
  @type('boolean') isAttacking: boolean = false;
  @type('boolean') isDodging: boolean = false;
}

export class EnemySchema extends Schema implements NetworkEnemy {
  @type('string') id: string = '';
  @type('string') typeId: string = '';
  @type('number') health: number = 100;
  @type('number') maxHealth: number = 100;
  @type(PositionSchema) position: PositionSchema = new PositionSchema();
  @type('number') rotation: number = 0;
  @type('string') state: 'idle' | 'chase' | 'attack' | 'dead' = 'idle';
  @type('string') targetId: string | null = null;
}

export class LootSchema extends Schema implements NetworkLoot {
  @type('string') id: string = '';
  @type('string') templateId: string = '';
  @type('string') rarity: string = 'common';
  @type(PositionSchema) position: PositionSchema = new PositionSchema();
}

export class DungeonState extends Schema {
  @type({ map: PlayerSchema }) players = new MapSchema<PlayerSchema>();
  @type({ map: EnemySchema }) enemies = new MapSchema<EnemySchema>();
  @type({ map: LootSchema }) loot = new MapSchema<LootSchema>();
  @type('number') floor: number = 1;
  @type('number') tier: number = 1;
}
