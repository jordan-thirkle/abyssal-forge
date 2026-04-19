/**
 * @description CryptWarden — Elite melee enemy.
 * @author Abyssal Forge
 * @version 1.0.0
 */
import { Scene, MeshBuilder, Mesh, Vector3, Color3 } from '@babylonjs/core';
import { Enemy } from '../Enemy';
import { CRYPT_WARDEN } from '@shared/constants/enemies';

export class CryptWarden extends Enemy {
  public onAttackHit?: (damage: number, position: Vector3) => void;

  constructor(scene: Scene, position: Vector3) {
    super(scene, CRYPT_WARDEN, position);
  }

  protected buildMesh(position: Vector3): Mesh {
    const root = new Mesh('crypt_warden_root', this.scene);
    root.position = position;

    const mat = this.createBaseMaterial(new Color3(0.2, 0.4, 0.8));

    const body = MeshBuilder.CreateBox('warden_body', { width: 1.2, height: 2.2, depth: 1.2 }, this.scene);
    body.material = mat;
    body.position.y = 1.1;
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
    const cleave = this.def.attacks.find(a => a.id === 'warden_cleave');
    if (cleave && now - this.lastAttackTime > cleave.cooldown) {
      this.lastAttackTime = now;
      this.performAttack('warden_cleave', playerPos);
    }
  }
}
