/**
 * @description Babylon.js engine lifecycle, input manager, camera, and screen shake.
 *              This is the core engine wrapper. Scenes are registered and activated through it.
 * @author Abyssal Forge
 * @version 1.0.0
 */
import {
  Engine,
  Scene,
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  Color3,
  Color4,
} from '@babylonjs/core';
import '@babylonjs/loaders';


export type SceneKey = 'dungeon' | 'arena' | 'hub';

export class GameEngine {
  public engine: Engine;
  public scene!: Scene;
  private shakeTimeoutId: number | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      antialias: true,
    });

    // Prevent context menu on right-click (used for heavy attack)
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    // Resize handler
    window.addEventListener('resize', () => this.engine.resize());
  }

  /** Create a base scene with dark ambient and fog */
  createScene(): Scene {
    this.scene = new Scene(this.engine);
    this.scene.clearColor = new Color4(0.051, 0.051, 0.059, 1);
    this.scene.fogMode = Scene.FOGMODE_EXP2;
    this.scene.fogDensity = 0.035;
    const bgColor = Color3.FromHexString('#0D0D0F');
    this.scene.fogColor = bgColor;
    this.scene.ambientColor = bgColor.scale(0.05);

    // Minimal ambient light — everything else is local (torches, glows)
    const ambient = new HemisphericLight('ambient', new Vector3(0, 1, 0), this.scene);
    ambient.intensity = 0.05;

    return this.scene;
  }

  /** Start the Babylon.js render loop */
  startRenderLoop(onFrame?: () => void): void {
    this.engine.runRenderLoop(() => {
      onFrame?.();
      this.scene?.render();
    });
  }

  /** Stop the render loop and dispose the scene cleanly */
  stopRenderLoop(): void {
    this.engine.stopRenderLoop();
    this.scene?.dispose();
  }

  /**
   * Shake the active camera.
   * @param intensity - displacement in Babylon.js units (default 0.08)
   * @param durationMs - shake duration in milliseconds (default 120)
   */
  shakeCamera(intensity = 0.08, durationMs = 120): void {
    const camera = this.scene?.activeCamera as ArcRotateCamera | null;
    if (!camera) return;

    const originalTarget = camera.target.clone();
    const startTime = performance.now();

    const shake = () => {
      const elapsed = performance.now() - startTime;
      if (elapsed >= durationMs) {
        camera.target = originalTarget;
        return;
      }
      camera.target = originalTarget.add(
        new Vector3(
          (Math.random() - 0.5) * intensity,
          (Math.random() - 0.5) * intensity,
          0
        )
      );
      requestAnimationFrame(shake);
    };

    requestAnimationFrame(shake);
  }

  /** Clean up all engine resources */
  dispose(): void {
    if (this.shakeTimeoutId) clearTimeout(this.shakeTimeoutId);
    this.stopRenderLoop();
    this.engine.dispose();
    window.removeEventListener('resize', () => this.engine.resize());
  }
}
