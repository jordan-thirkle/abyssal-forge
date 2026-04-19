/**
 * @description Colyseus room for Dungeon gameplay
 * @author Abyssal Forge
 * @version 1.0.0
 */
import { Room, Client } from 'colyseus';
import { DungeonState, PlayerSchema } from '../schemas/DungeonState';

export class DungeonRoom extends Room<DungeonState> {
  maxClients = 4;
  
  onCreate(options: any) {
    this.setState(new DungeonState());
    
    this.onMessage('move', (client, data) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        player.position.x = data.x;
        player.position.y = data.y;
        player.position.z = data.z;
        if (data.rotation !== undefined) player.rotation = data.rotation;
      }
    });

    this.onMessage('attack', (client) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        player.isAttacking = true;
        // Reset attack flag after a short delay (or let client/server combat system handle it)
        this.clock.setTimeout(() => { player.isAttacking = false; }, 300);
      }
    });

    this.onMessage('dodge', (client) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        player.isDodging = true;
        this.clock.setTimeout(() => { player.isDodging = false; }, 500);
      }
    });
  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, "joined!");
    const player = new PlayerSchema();
    player.id = client.sessionId;
    player.username = options.username || `Guest_${client.sessionId.substring(0, 4)}`;
    this.state.players.set(client.sessionId, player);
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
    this.state.players.delete(client.sessionId);
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }
}
