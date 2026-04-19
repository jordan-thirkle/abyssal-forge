/**
 * @description ParticleSystem — reusable hit burst, death explosion, and impact VFX.
 * @author Abyssal Forge
 * @version 1.0.0
 */
import { Scene, ParticleSystem, Vector3, Color3, MeshBuilder } from '@babylonjs/core';
import { RARITY_COLORS } from '@shared/constants/balance';
import type { ItemRarity } from '@shared/types/item.types';

export class AbyssalParticleSystem {
  private scene: Scene;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  /** Burst of particles at a world position (hit effect) */
  hitBurst(position: Vector3, color: Color3 = new Color3(1, 0.3, 0.1), count = 12): void {
    const dummy = MeshBuilder.CreateBox('_ps_dummy', { size: 0.01 }, this.scene);
    dummy.position = position.clone();
    dummy.isVisible = false;

    const ps = new ParticleSystem('hitBurst', count, this.scene);
    ps.emitter = dummy;
    ps.minEmitBox = new Vector3(-0.1, 0, -0.1);
    ps.maxEmitBox = new Vector3(0.1, 0.1, 0.1);
    ps.color1 = color.toColor4(1);
    ps.color2 = color.scale(0.5).toColor4(0.8);
    ps.colorDead = Color3.Black().toColor4(0);
    ps.minSize = 0.05;
    ps.maxSize = 0.2;
    ps.minLifeTime = 0.15;
    ps.maxLifeTime = 0.4;
    ps.emitRate = count / 0.05;
    ps.minEmitPower = 2;
    ps.maxEmitPower = 6;
    ps.gravity = new Vector3(0, -12, 0);
    ps.targetStopDuration = 0.05;
    ps.disposeOnStop = true;
    ps.onStoppedObservable.addOnce(() => dummy.dispose());
    ps.start();
  }

  /** Large explosion on enemy death */
  deathExplosion(position: Vector3): void {
    this.hitBurst(position, new Color3(0.6, 0.1, 0.9), 30);
    setTimeout(() => this.hitBurst(position.add(new Vector3(0, 0.5, 0)), new Color3(1, 0.5, 0.1), 20), 80);
  }

  /** Loot pickup sparkle burst */
  pickupBurst(position: Vector3, rarity: ItemRarity): void {
    const color = Color3.FromHexString(RARITY_COLORS[rarity]);
    this.hitBurst(position, color, rarity === 'legendary' || rarity === 'abyssal' ? 40 : 20);
  }
}
