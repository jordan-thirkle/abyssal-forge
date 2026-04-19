/**
 * @description Manages ability execution and cooldowns.
 * @author Abyssal Forge
 * @version 1.0.0
 */
import { usePlayerStore } from '../../store/playerStore';
import { AudioSystem } from './AudioSystem';

export interface Ability {
  id: string;
  name: string;
  manaCost: number;
  cooldown: number;
  range: number;
  damageMultiplier: number;
}

export class AbilitySystem {
  private static cooldowns: Map<string, number> = new Map();

  static castAbility(ability: Ability, casterPos: any, enemies: any[]) {
    const { stats, profile, takeDamage, gainXP } = usePlayerStore.getState();
    const now = Date.now();
    
    // Check mana
    if (stats.mana < ability.manaCost) {
      console.log("Not enough mana!");
      return;
    }

    // Check cooldown
    const lastCast = this.cooldowns.get(ability.id) || 0;
    if (now - lastCast < ability.cooldown) {
      console.log("Ability on cooldown!");
      return;
    }

    // Cast Success
    console.log(`Casting ${ability.name}`);
    this.cooldowns.set(ability.id, now);
    AudioSystem.playSwing(); // Reuse swing sound for now

    // Dispatch damage to enemies in range
    enemies.forEach(enemy => {
      const dist = enemy.position.subtract(casterPos).length();
      if (dist <= ability.range && !enemy.isDead) {
        const damage = Math.round(stats.attack * ability.damageMultiplier);
        enemy.takeDamage(damage);
        AudioSystem.playHit();
      }
    });
  }
}
