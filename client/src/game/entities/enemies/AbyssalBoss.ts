/**
 * @description Abyssal Boss — End of floor boss with heavy AoE.
 * @author Abyssal Forge
 * @version 1.0.0
 */
import { Scene, MeshBuilder, Mesh, Vector3, Color3 } from '@babylonjs/core';
import { Enemy } from '../Enemy';
import { ABYSSAL_BOSS } from '@shared/constants/enemies';

export class AbyssalBoss extends Enemy {
  public onAttackHit?: (damage: number, position: Vector3) => void;

  constructor(scene: Scene, position: Vector3) {
    super(scene, ABYSSAL_BOSS, position);
  }

  protected buildMesh(position: Vector3): Mesh {
    const root = new Mesh('abyssal_boss_root', this.scene);
    root.position = position;

    const mat = this.createBaseMaterial(new Color3(0.8, 0.1, 0.1));

    const body = MeshBuilder.CreateTorusKnot('boss_body', { radius: 2, tube: 0.8, radialSegments: 64, tubularSegments: 32 }, this.scene);
    body.material = mat;
    body.position.y = 3;
    body.parent = root;

    root.checkCollisions = false;
    root.isPickable = true;
    root.metadata = { isEnemy: true, enemyId: this.id };
    return root;
  }

  protected performAttack(attackId: string, playerPos: Vector3): void {
    const attack = this.def.attacks.find(a => a.id === attackId) ?? this.def.attacks[0];
    if (!attack) return;
    this.onAttackHit?.(this.def.attack * attack.damageMultiplier, playerPos);
  }

  override tryAttack(playerPos: Vector3): void {
    const now = performance.now();
    
    const voidErupt = this.def.attacks.find(a => a.id === 'boss_void');
    if (voidErupt && now - this.lastAttackTime > voidErupt.cooldown && Math.random() < 0.4) {
      this.lastAttackTime = now;
      this.performAttack('boss_void', playerPos);
      return;
    }

    const slam = this.def.attacks.find(a => a.id === 'boss_slam');
    if (slam && now - this.lastAttackTime > slam.cooldown) {
      this.lastAttackTime = now;
      this.performAttack('boss_slam', playerPos);
    }
  }
}
