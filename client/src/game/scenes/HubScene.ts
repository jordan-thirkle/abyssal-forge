/**
 * @description Hub Scene — Safe zone for players to prepare, forge, and choose game modes.
 * @author Abyssal Forge
 * @version 1.0.0
 */
import {
  Scene, Vector3, MeshBuilder, StandardMaterial, Color3, PointLight, HemisphericLight
} from '@babylonjs/core';
import { GameEngine } from '../GameEngine';
import { Player } from '../entities/Player';
import { useGameStore } from '../../store/gameStore';

export class HubScene {
  private engine: GameEngine;
  private scene!: Scene;
  private player!: Player;
  private lastTick = performance.now();
  private dungeonPortal!: any;
  private arenaPortal!: any;

  constructor(engine: GameEngine) {
    this.engine = engine;
  }

  async build(): Promise<void> {
    this.scene = this.engine.createScene();
    
    // 1. Hub Environment
    const floor = MeshBuilder.CreateDisc('hub_floor', { radius: 15 }, this.scene);
    floor.rotation.x = Math.PI / 2;
    const floorMat = new StandardMaterial('hubFloorMat', this.scene);
    floorMat.diffuseColor = new Color3(0.15, 0.15, 0.2);
    floor.material = floorMat;
    floor.checkCollisions = true;

    // Ambient light for Hub (brighter than dungeon)
    const ambient = new HemisphericLight('hubAmbient', new Vector3(0, 1, 0), this.scene);
    ambient.intensity = 0.5;
    ambient.diffuse = new Color3(0.7, 0.7, 0.8);

    // 2. Portals
    this.buildPortals();

    // 3. Player
    this.player = new Player(this.scene, new Vector3(0, 0.5, 0));
    this.engine.attachCameraToPipeline(this.player.camera);
  }

  private buildPortals() {
    // Dungeon Portal (Blue)
    this.dungeonPortal = MeshBuilder.CreateTorus('dungeon_portal', { diameter: 4, thickness: 0.5 }, this.scene);
    this.dungeonPortal.position.set(-8, 2, 8);
    const dMat = new StandardMaterial('dMat', this.scene);
    dMat.emissiveColor = new Color3(0.2, 0.5, 1.0);
    this.dungeonPortal.material = dMat;

    const dLight = new PointLight('dLight', this.dungeonPortal.position, this.scene);
    dLight.diffuse = new Color3(0.2, 0.5, 1.0);
    dLight.intensity = 2;

    // Arena Portal (Red)
    this.arenaPortal = MeshBuilder.CreateTorus('arena_portal', { diameter: 4, thickness: 0.5 }, this.scene);
    this.arenaPortal.position.set(8, 2, 8);
    const aMat = new StandardMaterial('aMat', this.scene);
    aMat.emissiveColor = new Color3(1.0, 0.2, 0.2);
    this.arenaPortal.material = aMat;

    const aLight = new PointLight('aLight', this.arenaPortal.position, this.scene);
    aLight.diffuse = new Color3(1.0, 0.2, 0.2);
    aLight.intensity = 2;
  }

  update(): void {
    const now = performance.now();
    const delta = now - this.lastTick;
    this.lastTick = now;

    this.player.update(delta);

    // Check portal proximity
    if (Vector3.Distance(this.player.position, this.dungeonPortal.position) < 3) {
      useGameStore.getState().setScene('dungeon');
    } else if (Vector3.Distance(this.player.position, this.arenaPortal.position) < 3) {
      useGameStore.getState().setScene('arena');
    }

    // Spin portals
    this.dungeonPortal.rotation.y += 0.01;
    this.arenaPortal.rotation.y += 0.01;
  }

  dispose(): void {
    this.player.dispose();
  }
}
