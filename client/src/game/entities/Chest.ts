/**
 * @description Chest entity — procedural mesh for loot rewards.
 * @author Abyssal Forge
 * @version 1.0.0
 */
import {
  Scene, MeshBuilder, StandardMaterial, Color3, Vector3,
  Mesh, TransformNode,
} from '@babylonjs/core';
import { AudioSystem } from '../systems/AudioSystem';

export class Chest {
  public mesh: TransformNode;
  private scene: Scene;
  private lid: Mesh;
  private isOpen = false;
  public id: string;

  constructor(scene: Scene, position: Vector3) {
    this.scene = scene;
    this.id = `chest_${Math.random().toString(36).slice(2, 7)}`;
    this.mesh = new TransformNode(`${this.id}_root`, scene);
    this.mesh.position = position;

    // Base box
    const base = MeshBuilder.CreateBox(`${this.id}_base`, { width: 1.5, height: 0.8, depth: 1 }, scene);
    base.parent = this.mesh;
    base.position.y = 0.4;
    const woodMat = new StandardMaterial('woodMat', scene);
    woodMat.diffuseColor = new Color3(0.3, 0.2, 0.1);
    base.material = woodMat;
    base.checkCollisions = true;

    // Lid
    this.lid = MeshBuilder.CreateBox(`${this.id}_lid`, { width: 1.5, height: 0.3, depth: 1 }, scene);
    this.lid.parent = this.mesh;
    this.lid.position.y = 0.95;
    this.lid.setPivotPoint(new Vector3(0, -0.15, -0.5));
    this.lid.material = woodMat;

    // Ornate bands
    const bandMat = new StandardMaterial('bandMat', scene);
    bandMat.diffuseColor = new Color3(0.5, 0.4, 0.2);
    bandMat.emissiveColor = new Color3(0.1, 0.1, 0.05);

    const bandL = MeshBuilder.CreateBox('bandL', { width: 0.1, height: 1.2, depth: 1.1 }, scene);
    bandL.parent = this.mesh;
    bandL.position.set(-0.4, 0.6, 0);
    bandL.material = bandMat;

    const bandR = MeshBuilder.CreateBox('bandR', { width: 0.1, height: 1.2, depth: 1.1 }, scene);
    bandR.parent = this.mesh;
    bandR.position.set(0.4, 0.6, 0);
    bandR.material = bandMat;
  }

  public open(): boolean {
    if (this.isOpen) return false;
    this.isOpen = true;
    
    // Animation: Rotate lid
    let frame = 0;
    const animateLid = () => {
      frame++;
      this.lid.rotation.x = -Math.PI / 3 * (frame / 20);
      if (frame < 20) requestAnimationFrame(animateLid);
    };
    requestAnimationFrame(animateLid);
    
    AudioSystem.playUIClick(); // Placeholder for chest sound
    return true;
  }

  get isOpened(): boolean { return this.isOpen; }
  get position(): Vector3 { return this.mesh.position; }

  dispose(): void {
    this.mesh.dispose();
  }
}
