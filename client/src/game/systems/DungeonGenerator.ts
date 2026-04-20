/**
 * @description Procedural dungeon floor generator using Babylon.js primitives only.
 *              Generates rooms, corridors, walls, torches — zero external assets.
 * @author Abyssal Forge
 * @version 1.0.0
 */
import {
  Scene, MeshBuilder, StandardMaterial, Color3, Vector3,
  PointLight, Mesh, DynamicTexture,
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
  chestSpawns: Vector3[];
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
    const chestSpawns = this.placeChestSpawns(rooms);
    return { rooms, spawnPoint, bossRoom, enemySpawns, chestSpawns, exitPosition };
  }

  private placeChestSpawns(rooms: Room[]): Vector3[] {
    const spawns: Vector3[] = [];
    // Place 1-2 chests in every 2 rooms
    for (let i = 1; i < rooms.length; i++) {
      if (i % 2 === 0 || Math.random() > 0.7) {
        const r = rooms[i];
        spawns.push(new Vector3(
          r.x + (Math.random() - 0.5) * (r.w - 4),
          0,
          r.z + (Math.random() - 0.5) * (r.h - 4)
        ));
      }
    }
    return spawns;
  }

  private generateRooms(): Room[] {
    const rooms: Room[] = [];
    const count = 6 + this.tier * 2;
    let curX = 0, curZ = 0;
    for (let i = 0; i < count; i++) {
      const w = 15 + Math.floor(Math.random() * 15);
      const h = 15 + Math.floor(Math.random() * 15);
      rooms.push({ x: curX, z: curZ, w, h });
      
      // Random walk for next room
      const dir = Math.random() > 0.5 ? 'X' : 'Z';
      if (dir === 'X') {
        curX += w + 8 + Math.floor(Math.random() * 10);
        curZ += (Math.random() - 0.5) * 10;
      } else {
        curZ += h + 8 + Math.floor(Math.random() * 10);
        curX += (Math.random() - 0.5) * 10;
      }
    }
    return rooms;
  }

  private buildGeometry(rooms: Room[]): void {
    const floorMat = new StandardMaterial('floorMat', this.scene);
    floorMat.diffuseColor = new Color3(0.12, 0.11, 0.14);
    floorMat.specularColor = new Color3(0.1, 0.1, 0.1);
    floorMat.bumpTexture = this.createNoiseTexture(0.2); // Subtle noise for "stone" look

    const wallMat = new StandardMaterial('wallMat', this.scene);
    wallMat.diffuseColor = new Color3(0.08, 0.07, 0.1);
    wallMat.specularColor = Color3.Black();

    for (let i = 0; i < rooms.length; i++) {
      const r = rooms[i];
      // AAA: Floor with border
      const floor = MeshBuilder.CreateGround(`floor_${i}`, { width: r.w, height: r.h }, this.scene);
      floor.position.set(r.x, 0, r.z);
      floor.material = floorMat;
      floor.checkCollisions = true;
      this.meshes.push(floor);

      // AAA: Pillars in corners for depth
      this.spawnPillar(new Vector3(r.x - r.w/2 + 1, 0, r.z - r.h/2 + 1));
      this.spawnPillar(new Vector3(r.x + r.w/2 - 1, 0, r.z - r.h/2 + 1));
      this.spawnPillar(new Vector3(r.x - r.w/2 + 1, 0, r.z + r.h/2 - 1));
      this.spawnPillar(new Vector3(r.x + r.w/2 - 1, 0, r.z + r.h/2 - 1));

      // AAA: Rubble/Debris
      for (let j = 0; j < 5; j++) {
        this.spawnRubble(new Vector3(
          r.x + (Math.random() - 0.5) * r.w * 0.7,
          0.1,
          r.z + (Math.random() - 0.5) * r.h * 0.7
        ));
      }

      // Walls
      const wallH = 6;
      const prevRoom = i > 0 ? rooms[i-1] : null;
      const nextRoom = i < rooms.length - 1 ? rooms[i+1] : null;
      this.buildWalls(r, wallH, wallMat, i, prevRoom, nextRoom);

      // Corridors to next room
      if (i < rooms.length - 1) {
        this.buildCorridor(r, rooms[i+1], floorMat, wallMat);
      }

      // Torches
      if (i % 2 === 0) {
        this.spawnTorch(new Vector3(r.x - r.w/2 + 0.6, 2.5, r.z));
      }
    }
  }

  private buildWalls(r: Room, h: number, mat: StandardMaterial, id: number, prevRoom: Room | null, nextRoom: Room | null): void {
    const doorSize = 7;
    
    // Determine which sides need doorways based on connections
    let doorN = false, doorS = false, doorE = false, doorW = false;

    const checkConnection = (conn: Room | null) => {
      if (!conn) return;
      const dx = conn.x - r.x;
      const dz = conn.z - r.z;
      if (Math.abs(dx) > Math.abs(dz)) {
        if (dx > 0) doorE = true;
        else doorW = true;
      } else {
        if (dz > 0) doorS = true;
        else doorN = true;
      }
    };

    checkConnection(prevRoom);
    checkConnection(nextRoom);

    const configs = [
      // North
      { center: new Vector3(r.x, h/2, r.z - r.h/2), w: r.w, d: 0.8, isHorizontal: true, hasDoor: doorN },
      // South
      { center: new Vector3(r.x, h/2, r.z + r.h/2), w: r.w, d: 0.8, isHorizontal: true, hasDoor: doorS },
      // West
      { center: new Vector3(r.x - r.w/2, h/2, r.z), w: 0.8, d: r.h, isHorizontal: false, hasDoor: doorW },
      // East
      { center: new Vector3(r.x + r.w/2, h/2, r.z), w: 0.8, d: r.h, isHorizontal: false, hasDoor: doorE },
    ];

    configs.forEach((cfg, ci) => {
      if (cfg.hasDoor) {
        // Build 2 segments with a gap
        if (cfg.isHorizontal) {
          const segW = (cfg.w - doorSize) / 2;
          const left = MeshBuilder.CreateBox(`w_${id}_${ci}_l`, { width: segW, height: h, depth: cfg.d }, this.scene);
          left.position.set(cfg.center.x - segW/2 - doorSize/2, h/2, cfg.center.z);
          left.material = mat;
          left.checkCollisions = true;
          
          const right = MeshBuilder.CreateBox(`w_${id}_${ci}_r`, { width: segW, height: h, depth: cfg.d }, this.scene);
          right.position.set(cfg.center.x + segW/2 + doorSize/2, h/2, cfg.center.z);
          right.material = mat;
          right.checkCollisions = true;
          this.meshes.push(left, right);
        } else {
          const segD = (cfg.d - doorSize) / 2;
          const top = MeshBuilder.CreateBox(`w_${id}_${ci}_t`, { width: cfg.w, height: h, depth: segD }, this.scene);
          top.position.set(cfg.center.x, h/2, cfg.center.z - segD/2 - doorSize/2);
          top.material = mat;
          top.checkCollisions = true;

          const bot = MeshBuilder.CreateBox(`w_${id}_${ci}_b`, { width: cfg.w, height: h, depth: segD }, this.scene);
          bot.position.set(cfg.center.x, h/2, cfg.center.z + segD/2 + doorSize/2);
          bot.material = mat;
          bot.checkCollisions = true;
          this.meshes.push(top, bot);
        }
      } else {
        // Build a solid wall
        const solid = MeshBuilder.CreateBox(`w_${id}_${ci}_solid`, { width: cfg.w, height: h, depth: cfg.d }, this.scene);
        solid.position = cfg.center;
        solid.material = mat;
        solid.checkCollisions = true;
        this.meshes.push(solid);
      }
    });
  }

  private buildCorridor(r1: Room, r2: Room, fMat: StandardMaterial, wMat: StandardMaterial): void {
    const dx = r2.x - r1.x;
    const dz = r2.z - r1.z;
    const dist = Math.sqrt(dx*dx + dz*dz);
    const angle = Math.atan2(dx, dz);

    const corridor = MeshBuilder.CreateBox('corridor', { width: 6, height: 0.1, depth: dist }, this.scene);
    corridor.position.set(r1.x + dx/2, 0.05, r1.z + dz/2);
    corridor.rotation.y = angle;
    corridor.material = fMat;
    this.meshes.push(corridor);

    // Corridor Walls
    const wallH = 6;
    const leftWall = MeshBuilder.CreateBox('c_wall_l', { width: 0.8, height: wallH, depth: dist }, this.scene);
    leftWall.parent = corridor;
    leftWall.position.set(-3.4, wallH/2, 0);
    leftWall.material = wMat;
    leftWall.checkCollisions = true;

    const rightWall = MeshBuilder.CreateBox('c_wall_r', { width: 0.8, height: wallH, depth: dist }, this.scene);
    rightWall.parent = corridor;
    rightWall.position.set(3.4, wallH/2, 0);
    rightWall.material = wMat;
    rightWall.checkCollisions = true;
    
    this.meshes.push(leftWall, rightWall);
  }

  private spawnPillar(pos: Vector3): void {
    const pillar = MeshBuilder.CreateBox('pillar', { width: 1.2, height: 6, depth: 1.2 }, this.scene);
    pillar.position = pos;
    pillar.position.y = 3;
    const pMat = new StandardMaterial('pMat', this.scene);
    pMat.diffuseColor = new Color3(0.1, 0.09, 0.12);
    pillar.material = pMat;
    pillar.checkCollisions = true;
    this.meshes.push(pillar);
  }

  private spawnRubble(pos: Vector3): void {
    const size = 0.2 + Math.random() * 0.4;
    const rubble = MeshBuilder.CreateBox('rubble', { size }, this.scene);
    rubble.position = pos;
    rubble.rotation.set(Math.random(), Math.random(), Math.random());
    const rMat = new StandardMaterial('rMat', this.scene);
    rMat.diffuseColor = new Color3(0.05, 0.05, 0.06);
    rubble.material = rMat;
    this.meshes.push(rubble);
  }

  private createNoiseTexture(alpha: number): any {
    // Basic dynamic texture with noise for "rough stone" look
    const tex = new DynamicTexture('stone_noise', 256, this.scene);
    const ctx = tex.getContext();
    for(let i=0; i<1000; i++) {
      const x = Math.random()*256;
      const y = Math.random()*256;
      ctx.fillStyle = `rgba(255,255,255,${alpha * Math.random()})`;
      ctx.fillRect(x,y,2,2);
    }
    tex.update();
    return tex;
  }

  private spawnTorch(pos: Vector3): void {
    const torch = MeshBuilder.CreateCylinder('torch', { diameter: 0.2, height: 1.2 }, this.scene);
    torch.position = pos;
    const torchMat = new StandardMaterial('torchMat', this.scene);
    torchMat.diffuseColor = new Color3(0.3, 0.2, 0.1);
    torch.material = torchMat;
    this.meshes.push(torch);

    const light = new PointLight(`torchLight_${Math.random()}`, pos.add(new Vector3(0, 0.8, 0)), this.scene);
    light.diffuse = new Color3(1, 0.45, 0.1);
    light.intensity = 3;
    light.range = 15;

    let t = Math.random() * 10;
    this.scene.onBeforeRenderObservable.add(() => {
      t += 0.1;
      light.intensity = 2 + Math.sin(t) * 0.5 + Math.random() * 0.2;
    });
  }

  private placeEnemySpawns(rooms: Room[]): Vector3[] {
    const spawns: Vector3[] = [];
    for (let i = 1; i < rooms.length; i++) {
      const r = rooms[i];
      const count = 4 + this.tier * 2;
      for (let j = 0; j < count; j++) {
        spawns.push(new Vector3(
          r.x + (Math.random() - 0.5) * (r.w - 6),
          0.5,
          r.z + (Math.random() - 0.5) * (r.h - 6)
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
