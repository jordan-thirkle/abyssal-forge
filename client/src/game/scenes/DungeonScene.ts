import { Vector3 } from '@babylonjs/core';
import { GameEngine } from '../GameEngine';
import { DungeonGenerator } from '../systems/DungeonGenerator';
import { Player } from '../entities/Player';
import { HollowGrunt } from '../entities/enemies/HollowGrunt';
import { BoneArcher } from '../entities/enemies/BoneArcher';
import { CombatSystem } from '../systems/CombatSystem';
import { LootSystem } from '../systems/LootSystem';
import { XPSystem } from '../systems/XPSystem';
import { AbyssalParticleSystem } from '../systems/ParticleSystem';
import { PortalSystem } from '../systems/PortalSystem';
import { usePlayerStore } from '../../store/playerStore';
import { LOOT } from '@shared/constants/balance';
import type { Enemy } from '../entities/Enemy';
import type { Item } from '@shared/types/item.types';
import { ColyseusClient } from '../network/ColyseusClient';
import { AudioSystem } from '../systems/AudioSystem';

interface DungeonSceneOptions {
  tier?: number;
  fromPortal?: boolean;
  refDomain?: string;
}

export class DungeonScene {
  private engine: GameEngine;
  private options: DungeonSceneOptions;
  private generator!: DungeonGenerator;
  private player!: Player;
  private enemies: Enemy[] = [];
  private combat!: CombatSystem;
  private loot!: LootSystem;
  private xp!: XPSystem;
  private particles!: AbyssalParticleSystem;
  private portal!: PortalSystem;
  private lastTick = performance.now();
  private network: ColyseusClient;

  constructor(engine: GameEngine, options: DungeonSceneOptions = {}) {
    this.engine = engine;
    this.options = options;
    this.network = new ColyseusClient();
  }

  async build(): Promise<void> {
    const scene = this.engine.createScene();
    const tier = this.options.tier ?? 1;

    // 1. Generate dungeon
    this.generator = new DungeonGenerator(scene, tier);
    const layout = this.generator.generate();

    // 2. Systems
    this.combat = new CombatSystem(scene, this.engine);
    this.loot = new LootSystem(scene);
    this.xp = new XPSystem();
    this.particles = new AbyssalParticleSystem(scene);
    this.portal = new PortalSystem(scene, this.options.refDomain);
    this.portal.build(this.options.fromPortal ?? false);

    // 3. Player
    this.player = new Player(scene, layout.spawnPoint);

    // 4. Network Setup (Phase 2/3 Authorization Scaffold)
    const profile = usePlayerStore.getState().profile;
    if (profile) {
      try {
        await this.network.joinDungeon(tier, profile.id);
        console.log("Connected to dungeon room:", this.network.room?.id);
      } catch (e) {
        console.warn("Failed to join multiplayer room, playing in offline mode", e);
      }
    }

    this.player.onLightAttack = (step) => {
      AudioSystem.playSwing();
      const multiplier = [1.0, 1.1, 1.3][step] ?? 1.0;
      const stats = usePlayerStore.getState().stats;
      const hits = this.combat.meleeAttack(
        this.player.position, this.player.mesh.forward,
        stats, this.enemies, multiplier, 2.5, false
      );
      hits.forEach(h => {
        AudioSystem.playHit();
        this.particles.hitBurst(h.position);
        this.checkEnemyDeath(h.enemyId);
      });
      
      // Sync attack to server
      this.network.sendInput('attack', { type: 'light', step });
    };

    this.player.onHeavyAttack = () => {
      AudioSystem.playSwing();
      const stats = usePlayerStore.getState().stats;
      const hits = this.combat.meleeAttack(
        this.player.position, this.player.mesh.forward,
        stats, this.enemies, 1.8, 3.5, true
      );
      hits.forEach(h => {
        AudioSystem.playHit();
        this.particles.hitBurst(h.position, undefined, 20);
        this.checkEnemyDeath(h.enemyId);
      });
      
      this.network.sendInput('attack', { type: 'heavy' });
    };

    // 4. Spawn enemies
    layout.enemySpawns.forEach((pos, i) => {
      const useArcher = i % 3 === 2;
      const enemy = useArcher
        ? new BoneArcher(scene, pos)
        : new HollowGrunt(scene, pos);

      enemy.onDeath = (deathPos) => {
        this.particles.deathExplosion(deathPos);
        const leveled = this.xp.gainXP(enemy.def.xpReward);
        if (leveled) usePlayerStore.getState().setLevelingUp(true);
        this.tryDropLoot(deathPos, tier);
        this.enemies = this.enemies.filter(e => e.id !== enemy.id);
      };

      (enemy as HollowGrunt | BoneArcher).onAttackHit = (dmg, _pos) => {
        if (!this.player.isCurrentlyInvincible) {
          usePlayerStore.getState().takeDamage(Math.round(dmg));
          this.engine.shakeCamera(0.05, 80);
        }
      };

      this.enemies.push(enemy);
    });
  }

  private checkEnemyDeath(enemyId: string): void {
    const enemy = this.enemies.find(e => e.id === enemyId);
    if (enemy?.isDead) {
      this.enemies = this.enemies.filter(e => e.id !== enemyId);
    }
  }

  private tryDropLoot(pos: Vector3, tier: number): void {
    if (!LootSystem.rollDrop(tier)) return;
    const rarity = LootSystem.rollRarity();
    const item: Item = {
      id: `item_${Math.random().toString(36).slice(2)}`,
      templateId: 'basic_sword',
      name: `${rarity.charAt(0).toUpperCase() + rarity.slice(1)} Blade`,
      type: 'sword',
      slot: 'weapon',
      rarity,
      level: 1,
      stats: [{ stat: 'attack', value: 5 + Math.floor(Math.random() * 10), isPercentage: false }],
      runeSlots: rarity === 'epic' || rarity === 'legendary' || rarity === 'abyssal' ? 1 : 0,
      socketedRunes: [],
      isTradeable: rarity !== 'abyssal',
      ownerId: usePlayerStore.getState().profile?.id ?? 'guest',
      acquiredAt: new Date().toISOString(),
    };
    this.loot.spawnOrb(pos, item);
    this.particles.pickupBurst(pos, rarity);
  }

  update(): void {
    const now = performance.now();
    const delta = now - this.lastTick;
    this.lastTick = now;

    const profile = usePlayerStore.getState().profile;
    if (!profile) return;

    this.player.update(delta);

    // Sync position to server periodically or on change
    if (this.network.room) {
      this.network.sendInput('move', { 
        x: this.player.position.x, 
        y: this.player.position.y, 
        z: this.player.position.z,
        ry: this.player.mesh.rotation.y
      });
    }

    for (const enemy of this.enemies) {
      enemy.update(delta, this.player.position);
    }

    this.loot.update(this.player.position);
    this.portal.update(this.player.position, profile);
  }

  dispose(): void {
    this.player.dispose();
    this.enemies.forEach(e => e.dispose());
    this.combat.dispose();
    this.loot.dispose();
    this.portal.dispose();
    this.generator.dispose();
  }
}
