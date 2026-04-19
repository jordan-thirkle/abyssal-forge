/**
 * @description LootSystem — roll loot on enemy death, spawn glowing orb entity,
 *              auto-pickup when player walks over, rarity particles.
 * @author Abyssal Forge
 * @version 1.0.0
 */
import {
  Scene, MeshBuilder, StandardMaterial, Color3, Vector3,
  PointLight, Mesh, ParticleSystem,
} from '@babylonjs/core';
import { LOOT, RARITY_COLORS } from '@shared/constants/balance';
import type { ItemRarity, Item } from '@shared/types/item.types';
import { useInventoryStore } from '../../store/inventoryStore';

interface LootOrb {
  mesh: Mesh;
  light: PointLight;
  item: Item;
  born: number;
}

export class LootSystem {
  private scene: Scene;
  private orbs: LootOrb[] = [];

  constructor(scene: Scene) {
    this.scene = scene;
  }

  /** Roll a rarity with a significant luck boost for chests */
  static rollChestRarity(): ItemRarity {
    const roll = Math.random();
    // Shifted weights: Common 10%, Rare 30%, Epic 30%, Legendary 20%, Abyssal 10%
    if (roll < 0.1) return 'common';
    if (roll < 0.4) return 'rare';
    if (roll < 0.7) return 'epic';
    if (roll < 0.9) return 'legendary';
    return 'abyssal';
  }

  /** Roll a rarity using weighted table */
  static rollRarity(): ItemRarity {
    const roll = Math.random();
    let cumulative = 0;
    for (const [rarity, weight] of Object.entries(LOOT.RARITY_WEIGHTS)) {
      cumulative += weight;
      if (roll < cumulative) return rarity as ItemRarity;
    }
    return 'common';
  }

  /** Check if a drop occurs at all */
  static rollDrop(tier = 1): boolean {
    return Math.random() < LOOT.BASE_DROP_CHANCE + LOOT.DROP_CHANCE_PER_TIER * (tier - 1);
  }

  /** Spawn a glowing loot orb in the world */
  spawnOrb(position: Vector3, item: Item): void {
    const color = Color3.FromHexString(RARITY_COLORS[item.rarity]);

    const orb = MeshBuilder.CreateSphere(`loot_${item.id}`, { diameter: 0.5, segments: 8 }, this.scene);
    orb.position = position.clone();
    orb.position.y = 0.35;

    const mat = new StandardMaterial(`lootMat_${item.id}`, this.scene);
    mat.diffuseColor = color;
    mat.emissiveColor = color.scale(0.6);
    mat.alpha = 0.9;
    orb.material = mat;
    orb.isPickable = false;

    const light = new PointLight(`lootLight_${item.id}`, orb.position.clone(), this.scene);
    light.diffuse = color;
    light.intensity = item.rarity === 'abyssal' ? 2 : item.rarity === 'legendary' ? 1.5 : 0.8;
    light.range = item.rarity === 'common' ? 1 : 3;

    // Particles for rare+
    if (item.rarity !== 'common') {
      this.spawnOrbParticles(orb, color, item.rarity);
    }

    this.orbs.push({ mesh: orb, light, item, born: performance.now() });
  }

  private spawnOrbParticles(orb: Mesh, color: Color3, rarity: ItemRarity): void {
    const ps = new ParticleSystem(`lootPS_${orb.name}`, rarity === 'abyssal' ? 32 : rarity === 'legendary' ? 24 : rarity === 'epic' ? 16 : 8, this.scene);
    ps.emitter = orb;
    ps.minEmitBox = new Vector3(-0.1, -0.1, -0.1);
    ps.maxEmitBox = new Vector3(0.1, 0.1, 0.1);
    ps.color1 = new Color3(color.r, color.g, color.b).toColor4(1);
    ps.color2 = new Color3(color.r * 0.5, color.g * 0.5, color.b * 0.5).toColor4(0.5);
    ps.colorDead = new Color3(0, 0, 0).toColor4(0);
    ps.minSize = 0.05;
    ps.maxSize = rarity === 'abyssal' ? 0.2 : 0.12;
    ps.minLifeTime = 0.5;
    ps.maxLifeTime = 1.2;
    ps.emitRate = rarity === 'abyssal' ? 40 : 20;
    ps.minEmitPower = 0.2;
    ps.maxEmitPower = 0.8;
    ps.updateSpeed = 0.02;
    ps.start();
  }

  /** Call every frame — handles bobbing and auto-pickup */
  update(playerPos: Vector3): void {
    const now = performance.now();
    const toRemove: LootOrb[] = [];

    for (const orb of this.orbs) {
      // Bob animation
      const age = (now - orb.born) / 1000;
      orb.mesh.position.y = 0.35 + Math.sin(age * Math.PI * (2 / LOOT.ORB_BOB_PERIOD_S)) * LOOT.ORB_BOB_AMPLITUDE;

      // Auto-pickup check
      const dist = Vector3.Distance(
        new Vector3(playerPos.x, orb.mesh.position.y, playerPos.z),
        orb.mesh.position
      );
      if (dist <= LOOT.PICKUP_DISTANCE_UNITS) {
        this.pickup(orb);
        toRemove.push(orb);
      }
    }

    this.orbs = this.orbs.filter(o => !toRemove.includes(o));
  }

  private pickup(orb: LootOrb): void {
    useInventoryStore.getState().addItem(orb.item);
    orb.light.dispose();
    orb.mesh.dispose(false, true);
  }

  dispose(): void {
    this.orbs.forEach(o => { o.light.dispose(); o.mesh.dispose(false, true); });
    this.orbs = [];
  }
}
