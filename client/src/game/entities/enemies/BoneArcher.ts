/**
 * @description BoneArcher — ranged skeleton enemy. Kites backward when player gets too close.
 *              Fires projectile mesh that travels toward player.
 * @author Abyssal Forge
 * @version 1.0.0
 */
import { Scene, MeshBuilder, Mesh, Vector3, Color3, StandardMaterial } from '@babylonjs/core';
import { Enemy } from '../Enemy';
import { BONE_ARCHER } from '@shared/constants/enemies';

export class BoneArcher extends Enemy {
  public onAttackHit?: (damage: number, position: Vector3) => void;
  private projectiles: { mesh: Mesh; dir: Vector3; speed: number; born: number }[] = [];

  constructor(scene: Scene, position: Vector3) {
    super(scene, BONE_ARCHER, position);
  }

  protected buildMesh(position: Vector3): Mesh {
    const root = new Mesh('bone_archer_root', this.scene);
    root.position = position;

    const mat = this.createBaseMaterial(new Color3(0.75, 0.7, 0.5));

    const body = MeshBuilder.CreateCylinder('archer_body', { diameter: 0.4, height: 1.5, tessellation: 8 }, this.scene);
    body.material = mat;
    body.position.y = 0.75;
    body.parent = root;
    body.isPickable = false;

    const head = MeshBuilder.CreateSphere('archer_head', { diameter: 0.38, segments: 6 }, this.scene);
    head.material = mat;
    head.position.y = 1.7;
    head.parent = root;
    head.isPickable = false;

    // Bow shape
    const bowMat = new StandardMaterial('bowMat', this.scene);
    bowMat.diffuseColor = new Color3(0.4, 0.3, 0.15);
    const bow = MeshBuilder.CreateBox('archer_bow', { width: 0.08, height: 0.9, depth: 0.08 }, this.scene);
    bow.material = bowMat;
    bow.position.set(0.35, 1.1, 0);
    bow.parent = root;
    bow.isPickable = false;

    root.isPickable = true;
    root.metadata = { isEnemy: true, enemyId: this.id };
    return root;
  }

  override update(deltaMs: number, playerPos: Vector3): void {
    super.update(deltaMs, playerPos);
    this.tickProjectiles(deltaMs, playerPos);

    // Kite: back away if player within minRange
    const minRange = this.def.minRange ?? 4;
    if (this.distanceTo(playerPos) < minRange && this.state !== 'DEAD') {
      const awayDir = this.mesh.position.subtract(playerPos).normalize();
      awayDir.y = 0;
      this.mesh.position.addInPlace(awayDir.scale(this.def.speed * (deltaMs / 1000)));
    }
  }

  protected performAttack(_attackId: string, playerPos: Vector3): void {
    this.fireProjectile(playerPos);
  }

  private fireProjectile(targetPos: Vector3): void {
    const projMat = new StandardMaterial('arrow_mat', this.scene);
    projMat.diffuseColor = new Color3(0.8, 0.7, 0.3);
    projMat.emissiveColor = new Color3(0.4, 0.35, 0.1);

    const arrow = MeshBuilder.CreateCylinder('arrow', { diameter: 0.06, height: 0.7, tessellation: 6 }, this.scene);
    arrow.material = projMat;
    arrow.position = this.mesh.position.clone().add(new Vector3(0, 1.2, 0));

    const dir = targetPos.add(new Vector3(0, 0.8, 0)).subtract(arrow.position).normalize();
    arrow.rotation = new Vector3(Math.PI / 2, 0, 0);
    arrow.lookAt(arrow.position.add(dir));

    this.projectiles.push({ mesh: arrow, dir, speed: 12, born: performance.now() });
  }

  private tickProjectiles(deltaMs: number, playerPos: Vector3): void {
    const deltaS = deltaMs / 1000;
    const maxAge = 2500;
    const hitRadius = 1.0;

    this.projectiles = this.projectiles.filter(p => {
      const age = performance.now() - p.born;
      if (age > maxAge) { p.mesh.dispose(); return false; }

      p.mesh.position.addInPlace(p.dir.scale(p.speed * deltaS));

      if (Vector3.Distance(p.mesh.position, playerPos) < hitRadius) {
        const dmg = this.def.attack * 0.8;
        this.onAttackHit?.(dmg, p.mesh.position.clone());
        p.mesh.dispose();
        return false;
      }
      return true;
    });
  }

  override dispose(): void {
    this.projectiles.forEach(p => p.mesh.dispose());
    this.projectiles = [];
    super.dispose();
  }
}
