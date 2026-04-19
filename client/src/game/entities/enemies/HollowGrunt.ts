/**
 * @description HollowGrunt — melee skeleton enemy. Swing + Lunge attacks.
 *              Built from Babylon.js primitives with green undead glow.
 * @author Abyssal Forge
 * @version 1.0.0
 */
import { Scene, MeshBuilder, Mesh, Vector3, Color3 } from '@babylonjs/core';
import { Enemy } from '../Enemy';
import { HOLLOW_GRUNT } from '@shared/constants/enemies';

export class HollowGrunt extends Enemy {
  public onAttackHit?: (damage: number, position: Vector3) => void;

  constructor(scene: Scene, position: Vector3) {
    super(scene, HOLLOW_GRUNT, position);
  }

  protected buildMesh(position: Vector3): Mesh {
    const root = new Mesh('hollow_grunt_root', this.scene);
    root.position = position;

    const mat = this.createBaseMaterial(new Color3(0.55, 0.65, 0.5));

    // Body
    const body = MeshBuilder.CreateCylinder('grunt_body', { diameter: 0.55, height: 1.4, tessellation: 8 }, this.scene);
    body.material = mat;
    body.position.y = 0.7;
    body.parent = root;
    body.isPickable = false;

    // Head
    const head = MeshBuilder.CreateSphere('grunt_head', { diameter: 0.45, segments: 6 }, this.scene);
    head.material = mat;
    head.position.y = 1.65;
    head.parent = root;
    head.isPickable = false;

    // Arms
    const armMat = this.createBaseMaterial(new Color3(0.45, 0.55, 0.4));
    [-0.4, 0.4].forEach((x, i) => {
      const arm = MeshBuilder.CreateBox(`grunt_arm_${i}`, { width: 0.15, height: 0.8, depth: 0.15 }, this.scene);
      arm.material = armMat;
      arm.position.set(x, 0.9, 0);
      arm.parent = root;
      arm.isPickable = false;
    });

    root.checkCollisions = false;
    root.isPickable = true;
    root.metadata = { isEnemy: true, enemyId: this.id };
    return root;
  }

  protected performAttack(attackId: string, playerPos: Vector3): void {
    const attack = this.def.attacks.find(a => a.id === attackId) ?? this.def.attacks[0];
    if (!attack) return;
    const rawDamage = this.def.attack * attack.damageMultiplier;
    this.onAttackHit?.(rawDamage, playerPos);
  }

  override tryAttack(playerPos: Vector3): void {
    const now = performance.now();
    // Try lunge if cooldown allows (secondary attack)
    const lunge = this.def.attacks.find(a => a.id === 'grunt_lunge');
    if (lunge && now - this.lastAttackTime > lunge.cooldown && Math.random() < 0.3) {
      this.lastAttackTime = now;
      this.performAttack('grunt_lunge', playerPos);
      return;
    }
    // Default swing
    const swing = this.def.attacks.find(a => a.id === 'grunt_swing');
    if (swing && now - this.lastAttackTime > swing.cooldown) {
      this.lastAttackTime = now;
      this.performAttack('grunt_swing', playerPos);
    }
  }
}
