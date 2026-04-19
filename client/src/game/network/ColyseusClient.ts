/**
 * @description Colyseus client manager.
 * @author Abyssal Forge
 * @version 1.0.0
 */
import * as Colyseus from 'colyseus.js';

export class ColyseusClient {
  private client: Colyseus.Client;
  public room: Colyseus.Room | null = null;

  constructor() {
    const url = import.meta.env.VITE_COLYSEUS_URL || 'ws://localhost:2567';
    this.client = new Colyseus.Client(url);
  }

  public async joinDungeon(tier: number, playerId: string): Promise<Colyseus.Room> {
    if (this.room) {
      await this.room.leave();
    }
    try {
      this.room = await this.client.joinOrCreate('dungeon_room', { tier, playerId });
      return this.room;
    } catch (e) {
      console.error("COLYSEUS JOIN ERROR", e);
      throw e;
    }
  }

  public sendInput(type: string, data: any) {
    if (this.room) {
      this.room.send(type, data);
    }
  }

  public getRoom(): Colyseus.Room | null {
    return this.room;
  }
}
