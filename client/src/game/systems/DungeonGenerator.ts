/**
 * @description Procedural dungeon floor generator using Babylon.js primitives only.
 *              Generates rooms, corridors, walls, torches — zero external assets.
 * @author Abyssal Forge
 * @version 1.0.0
 */
import {
  Scene, MeshBuilder, StandardMaterial, Color3, Vector3,
  PointLight, Mesh,
} from '@babylonjs/core';

export interface Room {
  x: number;
  z: number;
  w: number;
  h: number;
}

export interface DungeonLayout {
  rooms: Room[];
  spawnPoint: Vector3;
  bossRoom: Room;
  enemySpawns: Vector3[];
  exitPosition: Vector3;
}

export class DungeonGenerator {
  private scene: Scene;
  private meshes: Mesh[] = [];
  private tier: number;

  constructor(scene: Scene, tier = 1) {
    this.scene = scene;
    this.tier = tier;
  }

  generate(): DungeonLayout {
    const rooms = this.generateRooms();
    this.buildGeometry(rooms);
    const spawnPoint = new Vector3(rooms[0].x, 0.5, rooms[0].z);
    const bossRoom = rooms[rooms.length - 1];
    const exitPosition = new Vector3(bossRoom.x, 0.5, bossRoom.z + bossRoom.h / 2 - 2);
    const enemySpawns = this.placeEnemySpawns(rooms);
    return { rooms, spawnPoint, bossRoom, enemySpawns, exitPosition };
  }

  private generateRooms(): Room[] {
    const rooms: Room[] = [];
    const count = 4 + this.tier;
    let curX = 0, curZ = 0;
    for (let i = 0; i < count; i++) {
      const w = 12 + Math.floor(Math.random() * 10);
      const h = 12 + Math.floor(Math.random() * 10);
      rooms.push({ x: curX, z: curZ, w, h });
      curX += w + 4 + Math.floor(Math.random() * 6);
      curZ += (Math.random() - 0.5) * 8;
    }
    return rooms;
  }

  private buildGeometry(rooms: Room[]): void {
    const floorMat = new StandardMaterial('floorMat', this.scene);
    floorMat.diffuseColor = new Color3(0.15, 0.14, 0.18);
    floorMat.specularColor = new Color3(0.05, 0.05, 0.05);

    const wallMat = new StandardMaterial('wallMat', this.scene);
    wallMat.diffuseColor = new Color3(0.12, 0.11, 0.15);
    wallMat.specularColor = Color3.Black();

    for (let i = 0; i < rooms.length; i++) {
      const r = rooms[i];
      // Floor tile
      const floor = MeshBuilder.CreateGround(`floor_${i}`, { width: r.w, height: r.h, subdivisions: 2 }, this.scene);
      floor.position.set(r.x, 0, r.z);
      floor.material = floorMat;
      floor.checkCollisions = true;
      this.meshes.push(floor);

      // Walls (4 sides)
      const wallH = 4;
      const walls = [
        { pos: new Vector3(r.x, wallH / 2, r.z - r.h / 2), w: r.w, d: 0.5 },
        { pos: new Vector3(r.x, wallH / 2, r.z + r.h / 2), w: r.w, d: 0.5 },
        { pos: new Vector3(r.x - r.w / 2, wallH / 2, r.z), w: 0.5, d: r.h },
        { pos: new Vector3(r.x + r.w / 2, wallH / 2, r.z), w: 0.5, d: r.h },
      ];
      walls.forEach((wDef, wi) => {
        const wall = MeshBuilder.CreateBox(`wall_${i}_${wi}`, { width: wDef.w, height: wallH, depth: wDef.d }, this.scene);
        wall.position = wDef.pos;
        wall.material = wallMat;
        wall.checkCollisions = true;
        this.meshes.push(wall);
      });

      // Torch every 2 rooms
      if (i % 2 === 0) this.spawnTorch(new Vector3(r.x - r.w / 2 + 1, 1.5, r.z));
    }
  }

  private spawnTorch(pos: Vector3): void {
    const torch = MeshBuilder.CreateCylinder('torch', { diameter: 0.15, height: 0.8 }, this.scene);
    torch.position = pos;
    const torchMat = new StandardMaterial('torchMat', this.scene);
    torchMat.diffuseColor = new Color3(0.4, 0.25, 0.1);
    torch.material = torchMat;
    this.meshes.push(torch);

    const light = new PointLight(`torchLight_${pos.x}`, pos.add(new Vector3(0, 0.5, 0)), this.scene);
    light.diffuse = new Color3(1, 0.55, 0.1);
    light.intensity = 2.5;
    light.range = 14;

    // Flicker via simple sine animation
    let t = Math.random() * Math.PI * 2;
    this.scene.onBeforeRenderObservable.add(() => {
      t += 0.08;
      light.intensity = 1.0 + Math.sin(t) * 0.25 + Math.sin(t * 2.3) * 0.1;
    });
  }

  private placeEnemySpawns(rooms: Room[]): Vector3[] {
    const spawns: Vector3[] = [];
    // Skip first (spawn) and last (boss) rooms
    for (let i = 1; i < rooms.length - 1; i++) {
      const r = rooms[i];
      const count = 3 + this.tier;
      for (let j = 0; j < count; j++) {
        spawns.push(new Vector3(
          r.x + (Math.random() - 0.5) * (r.w - 4),
          0.5,
          r.z + (Math.random() - 0.5) * (r.h - 4)
        ));
      }
    }
    return spawns;
  }

  dispose(): void {
    this.meshes.forEach(m => m.dispose());
    this.meshes = [];
  }
}
