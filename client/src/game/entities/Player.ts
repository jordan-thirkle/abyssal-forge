/**
 * @description Local player entity — movement, camera, light/heavy attack combo, dodge roll.
 *              All visuals are Babylon.js primitives. No external assets.
 * @author Abyssal Forge
 * @version 1.0.0
 */
import {
  Scene, MeshBuilder, StandardMaterial, Color3, Vector3,
  ArcRotateCamera, Mesh, KeyboardEventTypes,
  PointerEventTypes, PointLight,
} from '@babylonjs/core';
import { COMBAT } from '@shared/constants/balance';
import type { BaseStats } from '@shared/types/player.types';
import { usePlayerStore } from '../../store/playerStore';

type ComboState = 0 | 1 | 2 | 3;

export interface PlayerInput {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  lightAttack: boolean;
  heavyAttack: boolean;
  dodge: boolean;
}

export class Player {
  public mesh: Mesh;
  private scene: Scene;
  public camera: ArcRotateCamera;
  private stats: BaseStats;

  private input: PlayerInput = { forward: false, backward: false, left: false, right: false, lightAttack: false, heavyAttack: false, dodge: false };

  // Combat state
  private comboStep: ComboState = 0;
  private lastLightAttackTime = 0;
  private heavyCooldownUntil = 0;
  private dodgeCooldownUntil = 0;
  private isDodging = false;
  private isInvincible = false;

  // Callbacks
  public onLightAttack?: (step: number) => void;
  public onHeavyAttack?: () => void;
  public onDodge?: (dir: Vector3) => void;

  constructor(scene: Scene, spawnPos: Vector3) {
    this.scene = scene;
    this.stats = usePlayerStore.getState().stats;

    // Build player mesh from primitives
    this.mesh = this.buildMesh(spawnPos);

    // Camera
    this.camera = new ArcRotateCamera('playerCam', -Math.PI / 2, Math.PI / 3.5, 14, this.mesh.position, scene);
    this.camera.lowerRadiusLimit = 6;
    this.camera.upperRadiusLimit = 20;
    this.camera.lowerBetaLimit = 0.3;
    this.camera.upperBetaLimit = Math.PI / 2.2;
    this.camera.attachControl(scene.getEngine().getRenderingCanvas()!, false);

    this.mesh.ellipsoid = new Vector3(0.5, 1, 0.5);
    this.mesh.checkCollisions = true;

    // Player glow light so surroundings are always illuminated
    const playerLight = new PointLight('playerLight', new Vector3(0, 1.5, 0), scene);
    playerLight.parent = this.mesh;
    playerLight.diffuse = new Color3(0.6, 0.3, 1.0);
    playerLight.intensity = 1.5;
    playerLight.range = 12;

    this.registerInputs();
  }

  private buildMesh(pos: Vector3): Mesh {
    const root = new Mesh('player', this.scene);
    root.position = pos;

    const mat = new StandardMaterial('playerMat', this.scene);
    mat.diffuseColor = new Color3(0.45, 0.2, 0.65);
    mat.emissiveColor = new Color3(0.1, 0.0, 0.2);

    const body = MeshBuilder.CreateCapsule('playerBody', { radius: 0.4, height: 1.8 }, this.scene);
    body.material = mat;
    body.position.y = 0.9;
    body.parent = root;
    body.isPickable = false;

    const head = MeshBuilder.CreateSphere('playerHead', { diameter: 0.55 }, this.scene);
    head.material = mat;
    head.position.y = 2.1;
    head.parent = root;
    head.isPickable = false;

    return root;
  }

  private registerInputs(): void {
    const scene = this.scene;

    scene.onKeyboardObservable.add((kbInfo) => {
      const pressed = kbInfo.type === KeyboardEventTypes.KEYDOWN;
      switch (kbInfo.event.code) {
        case 'KeyW': case 'ArrowUp':    this.input.forward  = pressed; break;
        case 'KeyS': case 'ArrowDown':  this.input.backward = pressed; break;
        case 'KeyA': case 'ArrowLeft':  this.input.left     = pressed; break;
        case 'KeyD': case 'ArrowRight': this.input.right    = pressed; break;
        case 'ShiftLeft': case 'Space':
          if (pressed) this.tryDodge();
          break;
      }
    });

    scene.onPointerObservable.add((pInfo) => {
      if (pInfo.type === PointerEventTypes.POINTERDOWN) {
        if (pInfo.event.button === 0) this.tryLightAttack();
        if (pInfo.event.button === 2) this.tryHeavyAttack();
      }
    });
  }

  private tryLightAttack(): void {
    const now = performance.now();
    const timeSinceLast = now - this.lastLightAttackTime;

    if (timeSinceLast > COMBAT.COMBO_RESET_MS) this.comboStep = 0;
    if (timeSinceLast < COMBAT.BASE_ATTACK_SPEED_MS) return;

    this.lastLightAttackTime = now;
    const step = this.comboStep;
    this.comboStep = ((this.comboStep + 1) % 3) as ComboState;

    this.onLightAttack?.(step);
  }

  private tryHeavyAttack(): void {
    const now = performance.now();
    if (now < this.heavyCooldownUntil) return;
    this.heavyCooldownUntil = now + COMBAT.HEAVY_COOLDOWN_MS;
    setTimeout(() => this.onHeavyAttack?.(), COMBAT.HEAVY_WINDUP_MS);
  }

  private tryDodge(): void {
    const now = performance.now();
    if (now < this.dodgeCooldownUntil) return;
    if (this.stats.mana < COMBAT.DODGE_MANA_COST) return;

    this.dodgeCooldownUntil = now + COMBAT.DODGE_COOLDOWN_MS;
    this.isDodging = true;
    this.isInvincible = true;

    const dir = this.getMoveDirection();
    this.onDodge?.(dir.length() > 0 ? dir : this.mesh.forward);

    setTimeout(() => { this.isInvincible = false; }, COMBAT.DODGE_INVINCIBILITY_MS);
    setTimeout(() => { this.isDodging = false; }, COMBAT.DODGE_INVINCIBILITY_MS + 100);
  }

  private getMoveDirection(): Vector3 {
    const forward = this.camera.getForwardRay().direction;
    const right = Vector3.Cross(forward, Vector3.Up()).normalize();
    const dir = Vector3.Zero();
    if (this.input.forward)  dir.addInPlace(new Vector3(forward.x, 0, forward.z).normalize());
    if (this.input.backward) dir.subtractInPlace(new Vector3(forward.x, 0, forward.z).normalize());
    if (this.input.left)     dir.subtractInPlace(right);
    if (this.input.right)    dir.addInPlace(right);
    return dir.length() > 0 ? dir.normalize() : Vector3.Zero();
  }

  update(deltaMs: number): void {
    this.stats = usePlayerStore.getState().stats;
    const deltaS = deltaMs / 1000;

    const dir = this.getMoveDirection();
    if (dir.length() > 0) {
      const speed = this.isDodging ? this.stats.speed * 2.5 : this.stats.speed;
      this.mesh.moveWithCollisions(dir.scale(speed * deltaS));
      this.mesh.lookAt(this.mesh.position.add(new Vector3(dir.x, 0, dir.z)));
    }

    // Pin camera target to player
    this.camera.target = Vector3.Lerp(this.camera.target, this.mesh.position.add(new Vector3(0, 1, 0)), 0.15);
  }

  get isCurrentlyInvincible(): boolean { return this.isInvincible; }
  get position(): Vector3 { return this.mesh.position; }

  dispose(): void {
    this.camera.detachControl();
    this.camera.dispose();
    this.mesh.dispose();
  }
}
