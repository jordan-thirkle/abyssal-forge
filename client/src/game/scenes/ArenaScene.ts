/**
 * @description Arena Scene — Dedicated 1v1 PvP environment.
 * @author Abyssal Forge
 * @version 1.0.0
 */
import {
  Scene, Vector3, MeshBuilder, StandardMaterial, Color3, PointLight
} from '@babylonjs/core';
import { GameEngine } from '../GameEngine';
import { Player } from '../entities/Player';
import { RemotePlayer } from '../entities/RemotePlayer';
import { ColyseusClient } from '../network/ColyseusClient';
import { usePlayerStore } from '../../store/playerStore';

export class ArenaScene {
  private engine: GameEngine;
  private scene!: Scene;
  private player!: Player;
  private opponent: RemotePlayer | null = null;
  private network: ColyseusClient;
  private lastTick = performance.now();

  constructor(engine: GameEngine) {
    this.engine = engine;
    this.network = new ColyseusClient();
  }

  async build(): Promise<void> {
    this.scene = this.engine.createScene();
    
    // 1. Arena Geometry
    const floor = MeshBuilder.CreateDisc('arena_floor', { radius: 20 }, this.scene);
    floor.rotation.x = Math.PI / 2;
    const floorMat = new StandardMaterial('arenaFloorMat', this.scene);
    floorMat.diffuseColor = new Color3(0.1, 0.1, 0.15);
    floor.material = floorMat;
    floor.checkCollisions = true;

    // 2. Pillars/Boundary
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const pillar = MeshBuilder.CreateCylinder(`p_${i}`, { height: 10, diameter: 2 }, this.scene);
      pillar.position.set(Math.cos(angle) * 20, 5, Math.sin(angle) * 20);
      const pMat = new StandardMaterial('pMat', this.scene);
      pMat.diffuseColor = new Color3(0.05, 0.05, 0.05);
      pillar.material = pMat;
    }

    // 3. Player
    this.player = new Player(this.scene, new Vector3(0, 0.5, -10));
    this.engine.attachCameraToPipeline(this.player.camera);

    // 4. Join Network
    const profile = usePlayerStore.getState().profile;
    if (profile) {
      await this.network.joinArena(profile.id, profile.username);
      this.setupNetworkSync();
    }
  }

  private setupNetworkSync(): void {
    if (!this.network.room) return;

    this.network.room.state.players.onAdd((player, sessionId) => {
      if (sessionId !== this.network.room?.sessionId) {
        this.opponent = new RemotePlayer(this.scene, sessionId, new Vector3(player.x, player.y, player.z));
        
        player.onChange(() => {
          this.opponent?.updateFromNetwork(player.x, player.y, player.z, player.rotation);
        });
      }
    });

    this.network.room.state.players.onRemove((player, sessionId) => {
      if (sessionId === this.opponent?.id) {
        this.opponent?.dispose();
        this.opponent = null;
      }
    });
  }

  update(): void {
    const now = performance.now();
    const delta = now - this.lastTick;
    this.lastTick = now;

    this.player.update(delta);

    if (this.network.room) {
      this.network.sendInput('move', {
        x: this.player.position.x,
        y: this.player.position.y,
        z: this.player.position.z,
        ry: this.player.mesh.rotation.y
      });
    }
  }

  dispose(): void {
    this.player.dispose();
    this.opponent?.dispose();
    this.network.room?.leave();
  }
}
