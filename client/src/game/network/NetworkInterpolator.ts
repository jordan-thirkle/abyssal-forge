/**
 * @description Smooths remote entity movement.
 * @author Abyssal Forge
 * @version 1.0.0
 */
import { Vector3, Quaternion, Mesh } from '@babylonjs/core';

export class NetworkInterpolator {
  static interpolatePosition(mesh: Mesh, targetX: number, targetY: number, targetZ: number, deltaTime: number, speed: number = 10) {
    const targetPos = new Vector3(targetX, targetY, targetZ);
    mesh.position = Vector3.Lerp(mesh.position, targetPos, speed * (deltaTime / 1000));
  }

  static interpolateRotation(mesh: Mesh, targetRotation: number, deltaTime: number, speed: number = 10) {
    const currentQuat = mesh.rotationQuaternion || Quaternion.FromEulerAngles(0, mesh.rotation.y, 0);
    const targetQuat = Quaternion.FromEulerAngles(0, targetRotation, 0);
    mesh.rotationQuaternion = Quaternion.Slerp(currentQuat, targetQuat, speed * (deltaTime / 1000));
  }
}
