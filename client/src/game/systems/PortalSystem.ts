/**
 * @description PortalSystem — Vibe Jam 2026 portal webring.
 *              Spawns exit portal in world. Detects ?portal=true entry and spawns return portal.
 * @author Abyssal Forge
 * @version 1.0.0
 */
import {
  Scene, MeshBuilder, StandardMaterial, Color3, Vector3,
  PointLight, Mesh, ParticleSystem, Animation,
} from '@babylonjs/core';
import type { PlayerProfile } from '@shared/types/player.types';

const PORTAL_URL = 'https://vibej.am/portal/2026';
const GAME_DOMAIN = 'abyssal-forge.vercel.app';
const EXIT_POSITION = new Vector3(-20, 0.5, 0);

export class PortalSystem {
  private scene: Scene;
  private exitPortal: Mesh | null = null;
  private entryPortal: Mesh | null = null;
  private refDomain: string | undefined;

  constructor(scene: Scene, refDomain?: string) {
    this.scene = scene;
    this.refDomain = refDomain;
  }

  build(fromPortal: boolean): void {
    this.buildExitPortal();
    if (fromPortal && this.refDomain) {
      this.buildEntryPortal();
    }
  }

  private buildExitPortal(): void {
    const portal = this.makePortalMesh('exit_portal', EXIT_POSITION, new Color3(0.4, 0.1, 0.9));
    this.exitPortal = portal;
    this.addPortalLabel(portal, 'VIBE JAM PORTAL');
  }

  private buildEntryPortal(): void {
    const entryPos = new Vector3(0, 0.5, -5);
    const portal = this.makePortalMesh('entry_portal', entryPos, new Color3(0.1, 0.7, 0.9));
    this.entryPortal = portal;
    this.addPortalLabel(portal, 'RETURN PORTAL');
  }

  private makePortalMesh(name: string, position: Vector3, color: Color3): Mesh {
    const ring = MeshBuilder.CreateTorus(name, { diameter: 3, thickness: 0.3, tessellation: 24 }, this.scene);
    ring.position = position;
    ring.rotation.x = Math.PI / 2;

    const mat = new StandardMaterial(`${name}_mat`, this.scene);
    mat.diffuseColor = color;
    mat.emissiveColor = color.scale(0.8);
    ring.material = mat;

    const light = new PointLight(`${name}_light`, position, this.scene);
    light.diffuse = color;
    light.intensity = 1.5;
    light.range = 8;

    // Inner glow disk
    const disk = MeshBuilder.CreateDisc(`${name}_disk`, { radius: 1.35, tessellation: 32 }, this.scene);
    disk.position = position.clone();
    disk.rotation.x = Math.PI / 2;
    const diskMat = new StandardMaterial(`${name}_disk_mat`, this.scene);
    diskMat.diffuseColor = color.scale(0.3);
    diskMat.emissiveColor = color.scale(0.4);
    diskMat.alpha = 0.6;
    disk.material = diskMat;

    // Spin animation
    const anim = new Animation(`${name}_spin`, 'rotation.y', 60, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE);
    anim.setKeys([{ frame: 0, value: 0 }, { frame: 120, value: Math.PI * 2 }]);
    ring.animations = [anim];
    this.scene.beginAnimation(ring, 0, 120, true);

    // Particles
    const ps = new ParticleSystem(`${name}_ps`, 40, this.scene);
    ps.emitter = ring;
    ps.color1 = color.toColor4(1);
    ps.color2 = color.scale(0.5).toColor4(0.5);
    ps.colorDead = Color3.Black().toColor4(0);
    ps.minSize = 0.05;
    ps.maxSize = 0.2;
    ps.minLifeTime = 0.5;
    ps.maxLifeTime = 1.5;
    ps.emitRate = 30;
    ps.minEmitPower = 0.5;
    ps.maxEmitPower = 2;
    ps.start();

    return ring;
  }

  private addPortalLabel(portal: Mesh, text: string): void {
    // Label via a thin plane with dynamic texture would be ideal,
    // but for Phase 1 we note it in console and rely on UI overlay
    console.info(`[PortalSystem] ${text} at`, portal.position);
  }

  /** Call every frame to check if player walked into a portal */
  update(playerPos: Vector3, profile: PlayerProfile): void {
    if (this.exitPortal) {
      const dist = Vector3.Distance(playerPos, EXIT_POSITION);
      if (dist < 2) {
        this.teleportToJam(profile);
      }
    }

    if (this.entryPortal && this.refDomain) {
      const entryPos = new Vector3(0, 0.5, -5);
      const dist = Vector3.Distance(playerPos, entryPos);
      if (dist < 2) {
        this.returnToRef(profile);
      }
    }
  }

  private teleportToJam(profile: PlayerProfile): void {
    const params = new URLSearchParams({
      username: profile.username,
      color: 'purple',
      speed: '4',
      ref: GAME_DOMAIN,
      hp: '100',
    });
    window.location.href = `${PORTAL_URL}?${params.toString()}`;
  }

  private returnToRef(profile: PlayerProfile): void {
    if (!this.refDomain) return;
    const params = new URLSearchParams({
      username: profile.username,
      color: 'purple',
      speed: '4',
      ref: GAME_DOMAIN,
      portal: 'true',
    });
    window.location.href = `https://${this.refDomain}?${params.toString()}`;
  }

  dispose(): void {
    this.exitPortal?.dispose(false, true);
    this.entryPortal?.dispose(false, true);
  }
}
