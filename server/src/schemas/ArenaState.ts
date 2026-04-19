/**
 * @description Colyseus state for Arena PvP
 * @author Abyssal Forge
 * @version 1.0.0
 */
import { Schema, type, MapSchema } from '@colyseus/schema';

export class ArenaPlayer extends Schema {
  @type("string") id: string = "";
  @type("string") username: string = "";
  @type("number") x: number = 0;
  @type("number") y: number = 0;
  @type("number") z: number = 0;
  @type("number") rotation: number = 0;
  @type("number") health: number = 100;
  @type("number") maxHealth: number = 100;
  @type("boolean") isReady: boolean = false;
  @type("number") wagerAmount: number = 0;
  @type("boolean") wagerLocked: boolean = false;
}

export class ArenaState extends Schema {
  @type({ map: ArenaPlayer }) players = new MapSchema<ArenaPlayer>();
  @type("string") status: "waiting" | "wagering" | "countdown" | "dueling" | "finished" = "waiting";
  @type("number") timer: number = 0;
  @type("string") winnerId: string = "";
}
