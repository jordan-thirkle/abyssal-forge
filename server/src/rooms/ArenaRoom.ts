/**
 * @description Colyseus room for Arena PvP (Authoritative)
 * @author Abyssal Forge
 * @version 1.0.0
 */
import { Room, Client } from 'colyseus';
import { ArenaState, ArenaPlayer } from '../schemas/ArenaState';

export class ArenaRoom extends Room<ArenaState> {
  maxClients = 2;

  onCreate(options: any) {
    this.setState(new ArenaState());

    this.onMessage("move", (client, data) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        player.x = data.x;
        player.y = data.y;
        player.z = data.z;
        player.rotation = data.ry;
      }
    });

    this.onMessage("set_wager", (client, amount: number) => {
      if (this.state.status !== "wagering") return;
      const player = this.state.players.get(client.sessionId);
      if (player && !player.wagerLocked) {
        player.wagerAmount = amount;
      }
    });

    this.onMessage("lock_wager", (client) => {
      if (this.state.status !== "wagering") return;
      const player = this.state.players.get(client.sessionId);
      if (player) {
        player.wagerLocked = true;
        this.checkAllLocked();
      }
    });

    this.onMessage("attack", (client, targetId: string) => {
      if (this.state.status !== "dueling") return;
      const attacker = this.state.players.get(client.sessionId);
      const target = this.state.players.get(targetId);
      
      if (attacker && target && target.health > 0) {
        // Simple authoritative hit logic (could add distance check)
        const damage = 10; // Placeholder for stat-based damage
        target.health = Math.max(0, target.health - damage);
        
        if (target.health === 0) {
          this.endDuel(client.sessionId);
        }
      }
    });
  }

  onJoin(client: Client, options: any) {
    const player = new ArenaPlayer();
    player.id = client.sessionId;
    player.username = options.username || "Gladiator";
    this.state.players.set(client.sessionId, player);

    if (this.state.players.size === 2) {
      this.state.status = "wagering";
    }
  }

  private checkAllLocked() {
    let allLocked = true;
    this.state.players.forEach(p => { if (!p.wagerLocked) allLocked = false; });
    
    if (allLocked) {
      this.startCountdown();
    }
  }

  private startCountdown() {
    this.state.status = "countdown";
    this.state.timer = 3;
    const interval = this.clock.setInterval(() => {
      this.state.timer--;
      if (this.state.timer <= 0) {
        interval.clear();
        this.state.status = "dueling";
      }
    }, 1000);
  }

  private endDuel(winnerId: string) {
    this.state.status = "finished";
    this.state.winnerId = winnerId;
    // Logic for transferring wagers would go here (requires Supabase integration)
  }

  onLeave(client: Client, consented: boolean) {
    this.state.players.delete(client.sessionId);
    if (this.state.status !== "finished") {
      this.state.status = "waiting";
    }
  }
}
