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
  
  private keyDownHandler?: (e: KeyboardEvent) => void;
  private keyUpHandler?: (e: KeyboardEvent) => void;

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

    // Materials
    const armorMat = new StandardMaterial('armorMat', this.scene);
    armorMat.diffuseColor = new Color3(0.1, 0.1, 0.15);
    armorMat.specularColor = new Color3(0.5, 0.5, 0.6);
    armorMat.specularPower = 32;

    const trimMat = new StandardMaterial('trimMat', this.scene);
    trimMat.diffuseColor = new Color3(0.6, 0.5, 0.2);
    trimMat.specularColor = new Color3(0.8, 0.7, 0.3);

    const glowMat = new StandardMaterial('glowMat', this.scene);
    glowMat.emissiveColor = new Color3(0.6, 0.2, 1.0);
    glowMat.diffuseColor = new Color3(0.3, 0.1, 0.5);

    // Torso (Armor)
    const body = MeshBuilder.CreateCylinder('p_body', { diameterTop: 0.8, diameterBottom: 0.6, height: 1.2, tessellation: 8 }, this.scene);
    body.material = armorMat;
    body.position.y = 1.0;
    body.parent = root;

    // Head
    const head = MeshBuilder.CreateSphere('p_head', { diameter: 0.5 }, this.scene);
    head.material = armorMat;
    head.position.y = 1.8;
    head.parent = root;

    // Visor (Glowing)
    const visor = MeshBuilder.CreateBox('p_visor', { width: 0.4, height: 0.15, depth: 0.1 }, this.scene);
    visor.material = glowMat;
    visor.position.set(0, 1.85, 0.22);
    visor.parent = root;

    // Shoulders
    const shoulderL = MeshBuilder.CreateSphere('p_sl', { diameter: 0.4, segments: 4 }, this.scene);
    shoulderL.material = trimMat;
    shoulderL.position.set(-0.45, 1.4, 0);
    shoulderL.scaling.y = 0.5;
    shoulderL.parent = root;

    const shoulderR = shoulderL.clone('p_sr');
    shoulderR.position.set(0.45, 1.4, 0);
    shoulderR.parent = root;

    // Void Blade (Back/Side)
    const blade = MeshBuilder.CreateBox('p_blade', { width: 0.1, height: 1.2, depth: 0.25 }, this.scene);
    const bladeMat = new StandardMaterial('bladeMat', this.scene);
    bladeMat.diffuseColor = new Color3(0.1, 0.05, 0.2);
    bladeMat.emissiveColor = new Color3(0.2, 0.0, 0.4);
    blade.material = bladeMat;
    blade.position.set(0.3, 1.0, -0.3);
    blade.rotation.x = Math.PI / 4;
    blade.rotation.z = Math.PI / 8;
    blade.parent = root;

    // Base collider wrapper
    const collider = MeshBuilder.CreateCapsule('p_col', { radius: 0.4, height: 2 }, this.scene);
    collider.position.y = 1;
    collider.isVisible = false;
    collider.parent = root;

    return root;
  }

  private registerInputs(): void {
    const scene = this.scene;

    // Use global window events so UI focus doesn't break movement
    const handleKey = (e: KeyboardEvent, pressed: boolean) => {
      // Don't capture inputs if user is typing in an input field (like the wager box)
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.code) {
        case 'KeyW': case 'ArrowUp':    this.input.forward  = pressed; break;
        case 'KeyS': case 'ArrowDown':  this.input.backward = pressed; break;
        case 'KeyA': case 'ArrowLeft':  this.input.left     = pressed; break;
        case 'KeyD': case 'ArrowRight': this.input.right    = pressed; break;
        case 'ShiftLeft': case 'Space':
          if (pressed) this.tryDodge();
          break;
      }
    };

    this.keyDownHandler = (e: KeyboardEvent) => handleKey(e, true);
    this.keyUpHandler = (e: KeyboardEvent) => handleKey(e, false);

    window.addEventListener('keydown', this.keyDownHandler);
    window.addEventListener('keyup', this.keyUpHandler);

    // Keep pointer events on the canvas
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
    if (this.keyDownHandler) window.removeEventListener('keydown', this.keyDownHandler);
    if (this.keyUpHandler) window.removeEventListener('keyup', this.keyUpHandler);
    this.camera.detachControl();
    this.camera.dispose();
    this.mesh.dispose();
  }
}
