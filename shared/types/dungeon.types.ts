/**
 * @description Dungeon networking and state schemas
 * @author Abyssal Forge
 * @version 1.0.0
 */

export interface NetworkPosition {
  x: number;
  y: number;
  z: number;
}

export interface NetworkPlayer {
  id: string;
  username: string;
  class: string;
  level: number;
  health: number;
  maxHealth: number;
  position: NetworkPosition;
  rotation: number;
  isAttacking: boolean;
  isDodging: boolean;
}

export interface NetworkEnemy {
  id: string;
  typeId: string;
  health: number;
  maxHealth: number;
  position: NetworkPosition;
  rotation: number;
  state: 'idle' | 'chase' | 'attack' | 'dead';
  targetId: string | null;
}

export interface NetworkLoot {
  id: string;
  templateId: string;
  rarity: string;
  position: NetworkPosition;
}

export interface ClientInput {
  type: 'move' | 'attack' | 'dodge' | 'interact';
  payload: any;
}
