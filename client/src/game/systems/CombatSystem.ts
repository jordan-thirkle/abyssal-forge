/**
 * @description CombatSystem — hit detection via raycasting, damage formula,
 *              floating hit numbers, screen shake, hit-stop on heavy attacks.
 * @author Abyssal Forge
 * @version 1.0.0
 */
import { Scene, Vector3, Mesh, Matrix } from '@babylonjs/core';
import { AdvancedDynamicTexture, TextBlock } from '@babylonjs/gui';
import { COMBAT, RARITY_COLORS } from '@shared/constants/balance';
import type { BaseStats } from '@shared/types/player.types';
import type { Enemy } from '../entities/Enemy';
import type { GameEngine } from '../GameEngine';

export interface HitResult {
  enemyId: string;
  damage: number;
  isCrit: boolean;
  position: Vector3;
}

export class CombatSystem {
  private scene: Scene;
  private engine: GameEngine;
  private gui: AdvancedDynamicTexture;

  constructor(scene: Scene, engine: GameEngine) {
    this.scene = scene;
    this.engine = engine;
    this.gui = AdvancedDynamicTexture.CreateFullscreenUI('combatUI', true, scene);
  }

  /**
   * Perform a melee attack sweep and return hits on enemies.
   */
  meleeAttack(
    attackerPos: Vector3,
    attackerForward: Vector3,
    attackerStats: BaseStats,
    enemies: Enemy[],
    damageMultiplier: number,
    range: number,
    isHeavy = false,
  ): HitResult[] {
    const hits: HitResult[] = [];
    const arcAngleDeg = isHeavy ? 160 : 90;
    const arcRad = (arcAngleDeg / 2) * (Math.PI / 180);

    for (const enemy of enemies) {
      if (enemy.isDead) continue;
      const toEnemy = enemy.position.subtract(attackerPos);
      toEnemy.y = 0;
      const dist = toEnemy.length();
      if (dist > range) continue;

      const angle = Math.acos(
        Math.min(1, Math.max(-1, Vector3.Dot(attackerForward.normalize(), toEnemy.normalize())))
      );
      if (angle > arcRad) continue;

      const result = this.calcDamage(attackerStats, enemy, damageMultiplier);
      const actualDmg = enemy.takeDamage(result.rawDamage);
      const hit: HitResult = { enemyId: enemy.id, damage: actualDmg, isCrit: result.isCrit, position: enemy.position.clone() };
      hits.push(hit);

      this.spawnHitNumber(enemy.position, actualDmg, result.isCrit);

      if (isHeavy) {
        this.engine.shakeCamera(COMBAT.SCREEN_SHAKE_INTENSITY, COMBAT.SCREEN_SHAKE_DURATION_MS);
      } else if (result.isCrit) {
        this.engine.shakeCamera(COMBAT.SCREEN_SHAKE_INTENSITY * 0.5, 80);
      }
    }

    return hits;
  }

  private calcDamage(stats: BaseStats, _enemy: Enemy, multiplier: number) {
    const raw = stats.attack * multiplier;
    const isCrit = Math.random() < stats.critChance;
    const rawDamage = Math.round(isCrit ? raw * stats.critMultiplier : raw);
    return { rawDamage, isCrit };
  }

  /** Spawn a floating damage number in screen space */
  spawnHitNumber(worldPos: Vector3, amount: number, isCrit: boolean, isDot = false): void {
    const label = new TextBlock(`hit_${Date.now()}`, `${isCrit ? '⚡ ' : ''}${amount}`);
    label.color = isCrit ? RARITY_COLORS.legendary : isDot ? RARITY_COLORS.abyssal : '#FFFFFF';
    label.fontSize = isCrit ? 28 : 20;
    label.fontFamily = 'JetBrains Mono, monospace';
    label.fontWeight = 'bold';
    label.shadowBlur = 6;
    label.shadowColor = 'rgba(0,0,0,0.8)';

    this.gui.addControl(label);

    const engine = this.engine.engine;
    const screenPos = Vector3.Project(
      worldPos.add(new Vector3(0, 1.5, 0)),
      Matrix.Identity(),
      this.scene.getTransformMatrix(),
      this.scene.activeCamera!.viewport.toGlobal(
        engine.getRenderWidth(),
        engine.getRenderHeight(),
      )
    );
    label.left = `${screenPos.x - this.engine.engine.getRenderWidth() / 2}px`;
    label.top = `${screenPos.y - this.engine.engine.getRenderHeight() / 2}px`;

    // Animate upward then fade
    const startY = screenPos.y - this.engine.engine.getRenderHeight() / 2;
    const startTime = performance.now();
    const duration = isCrit ? 1200 : 900;
    const pop = () => {
      const t = (performance.now() - startTime) / duration;
      if (t >= 1) { this.gui.removeControl(label); return; }
      const scale = t < 0.1 ? 1 + t * 2 : 1.2 - t * 0.2;
      label.scaleX = scale;
      label.scaleY = scale;
      label.top = `${startY - t * 60}px`;
      label.alpha = t > 0.6 ? 1 - ((t - 0.6) / 0.4) : 1;
      requestAnimationFrame(pop);
    };
    requestAnimationFrame(pop);
  }

  dispose(): void {
    this.gui.dispose();
  }
}
