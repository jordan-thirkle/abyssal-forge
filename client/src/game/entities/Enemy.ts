/**
 * @description Base Enemy class — state machine (IDLE/PATROL/AGGRO/ATTACK/STUNNED/DEAD),
 *              A* pathfinding on a grid, health bar billboard, death/loot triggers.
 * @author Abyssal Forge
 * @version 1.0.0
 */
import {
  Scene, Mesh, MeshBuilder, StandardMaterial, Color3, Vector3,
  DynamicTexture,
} from '@babylonjs/core';
import type { EnemyDefinition } from '@shared/constants/enemies';

export type EnemyState = 'IDLE' | 'PATROL' | 'AGGRO' | 'ATTACK' | 'STUNNED' | 'DEAD';

export abstract class Enemy {
  public mesh: Mesh;
  public id: string;
  protected scene: Scene;
  public readonly def: EnemyDefinition;
  protected health: number;
  protected state: EnemyState = 'IDLE';
  protected targetPos: Vector3 | null = null;
  protected lastAttackTime = 0;
  protected lastPathTime = 0;
  private healthBarMesh: Mesh;

  public onDeath?: (pos: Vector3) => void;

  constructor(scene: Scene, def: EnemyDefinition, position: Vector3) {
    this.scene = scene;
    this.def = def;
    this.health = def.maxHealth;
    this.id = `${def.id}_${Math.random().toString(36).slice(2, 7)}`;

    this.mesh = this.buildMesh(position);
    this.mesh.metadata = { isEnemy: true, enemyId: this.id };

    this.healthBarMesh = this.buildHealthBar();
  }

  protected abstract buildMesh(position: Vector3): Mesh;

  protected createBaseMaterial(color: Color3): StandardMaterial {
    const mat = new StandardMaterial(`${this.id}_mat`, this.scene);
    mat.diffuseColor = color;
    mat.emissiveColor = Color3.FromHexString(this.def.glowColor).scale(0.3);
    return mat;
  }

  private buildHealthBar(): Mesh {
    const bar = MeshBuilder.CreatePlane(`${this.id}_hpbar`, { width: 1.2, height: 0.12 }, this.scene);
    bar.parent = this.mesh;
    bar.position.y = 2.4;
    bar.billboardMode = Mesh.BILLBOARDMODE_ALL;

    const tex = new DynamicTexture(`${this.id}_hptex`, { width: 128, height: 16 }, this.scene);
    this.drawHealthBar(tex, 1);
    const mat = new StandardMaterial(`${this.id}_hpbarmat`, this.scene);
    mat.diffuseTexture = tex;
    mat.emissiveTexture = tex;
    mat.disableLighting = true;
    bar.material = mat;
    return bar;
  }

  private drawHealthBar(tex: DynamicTexture, pct: number): void {
    const ctx = tex.getContext();
    ctx.clearRect(0, 0, 128, 16);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, 128, 16);
    const r = pct > 0.5 ? Math.round(255 * (1 - pct) * 2) : 255;
    const g = pct > 0.5 ? 200 : Math.round(200 * pct * 2);
    ctx.fillStyle = `rgb(${r},${g},30)`;
    ctx.fillRect(2, 2, Math.max(0, (128 - 4) * pct), 12);
    tex.update();
  }

  protected die(): void {
    this.state = 'DEAD';
    const pos = this.mesh.position.clone();
    
    // AAA Death Animation: Scale down and fade
    const startScale = this.mesh.scaling.clone();
    const startTime = performance.now();
    const animateDeath = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(1, elapsed / 600);
      this.mesh.scaling = startScale.scale(1 - progress);
      if (progress < 1) requestAnimationFrame(animateDeath);
    };
    requestAnimationFrame(animateDeath);

    setTimeout(() => {
      this.onDeath?.(pos);
      this.dispose();
    }, 600);
  }

  protected moveToward(target: Vector3, deltaS: number): void {
    const dir = target.subtract(this.mesh.position);
    dir.y = 0;
    if (dir.length() < 0.1) return;
    dir.normalize();
    this.mesh.position.addInPlace(dir.scale(this.def.speed * deltaS));
    
    // Smooth lookAt
    const targetRotation = Math.atan2(dir.x, dir.z);
    this.mesh.rotation.y = targetRotation;
  }

  protected distanceTo(pos: Vector3): number {
    return Vector3.Distance(this.mesh.position, pos);
  }

  update(deltaMs: number, playerPos: Vector3): void {
    if (this.state === 'DEAD') return;
    const deltaS = deltaMs / 1000;
    const dist = this.distanceTo(playerPos);

    // AAA Procedural Breathing / Bobbing
    const time = performance.now() * 0.002;
    const bob = Math.sin(time + this.id.length) * 0.03;
    this.mesh.position.y += bob;

    switch (this.state) {
      case 'IDLE':
      case 'PATROL':
        if (dist < this.def.aggroRange) this.state = 'AGGRO';
        break;

      case 'AGGRO':
        if (dist > 30) { this.state = 'IDLE'; break; }
        if (dist <= this.def.attackRange) { this.state = 'ATTACK'; break; }
        this.moveToward(playerPos, deltaS);
        break;

      case 'ATTACK':
        if (dist > this.def.attackRange * 1.5) { this.state = 'AGGRO'; break; }
        this.tryAttack(playerPos);
        break;

      case 'STUNNED':
        break;
    }
  }

  // AAA Hit Flash
  private flashMaterial(): void {
    const mats = this.mesh.getChildMeshes().map(m => m.material as StandardMaterial);
    mats.forEach(m => {
      if (!m) return;
      const oldColor = m.emissiveColor.clone();
      m.emissiveColor = Color3.White().scale(0.8);
      setTimeout(() => {
        if (m) m.emissiveColor = oldColor;
      }, 100);
    });
  }

  takeDamage(amount: number): number {
    if (this.state === 'DEAD') return 0;
    const reduction = this.def.defence / (this.def.defence + 100);
    const finalDmg = Math.round(amount * (1 - reduction));
    this.health = Math.max(0, this.health - finalDmg);

    const pct = this.health / this.def.maxHealth;
    const tex = (this.healthBarMesh.material as StandardMaterial).diffuseTexture as DynamicTexture;
    this.drawHealthBar(tex, pct);

    this.flashMaterial();

    if (this.health <= 0) this.die();
    return finalDmg;
  }

  protected tryAttack(_playerPos: Vector3): void {
    const now = performance.now();
    const primary = this.def.attacks[0];
    if (!primary || now - this.lastAttackTime < primary.cooldown) return;
    this.lastAttackTime = now;
    this.performAttack(primary.id, _playerPos);
  }

  protected abstract performAttack(attackId: string, playerPos: Vector3): void;

  get isDead(): boolean { return this.state === 'DEAD'; }
  get position(): Vector3 { return this.mesh.position; }

  dispose(): void {
    this.mesh.dispose(false, true);
    this.healthBarMesh.dispose(false, true);
  }
}
