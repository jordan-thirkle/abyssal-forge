/**
 * @description Remote player proxy — mirrors network state from Colyseus.
 * @author Abyssal Forge
 * @version 1.0.0
 */
import {
  Scene, MeshBuilder, StandardMaterial, Color3, Vector3,
  Mesh, TransformNode,
} from '@babylonjs/core';

export class RemotePlayer {
  public mesh: Mesh;
  private scene: Scene;
  public id: string;

  constructor(scene: Scene, id: string, initialPos: Vector3) {
    this.scene = scene;
    this.id = id;

    // Visual: Teal capsule for remote players
    this.mesh = MeshBuilder.CreateCapsule(`remote_${id}`, { height: 1.8, radius: 0.4 }, scene);
    this.mesh.position = initialPos;
    
    const mat = new StandardMaterial(`remoteMat_${id}`, scene);
    mat.diffuseColor = new Color3(0.2, 0.6, 0.8);
    this.mesh.material = mat;
  }

  public updateFromNetwork(x: number, y: number, z: number, rotation: number): void {
    // Smooth interpolation (Lerp)
    const targetPos = new Vector3(x, y, z);
    this.mesh.position = Vector3.Lerp(this.mesh.position, targetPos, 0.2);
    
    // Smooth rotation
    const targetRot = rotation;
    this.mesh.rotation.y = targetRot; // Simplified, ideally use Lerp for rotation too
  }

  public dispose(): void {
    this.mesh.dispose();
  }
}
