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
  DefaultRenderingPipeline,
} from '@babylonjs/core';
import '@babylonjs/loaders';
import { AudioSystem } from './systems/AudioSystem';

export type SceneKey = 'dungeon' | 'arena' | 'hub';

export class GameEngine {
  public engine: Engine;
  public scene!: Scene;
  public pipeline!: DefaultRenderingPipeline;
  private shakeTimeoutId: number | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      antialias: true,
    });

    // Initialize AudioSystem (requires user interaction later to resume)
    AudioSystem.init();

    // Prevent context menu on right-click (used for heavy attack)
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    // Resize handler
    window.addEventListener('resize', () => this.engine.resize());
  }

  /** Create a base scene with dark ambient and fog */
  createScene(): Scene {
    this.scene = new Scene(this.engine);
    this.scene.clearColor = new Color4(0.01, 0.01, 0.015, 1);
    
    // AAA Fog & Atmosphere
    this.scene.fogMode = Scene.FOGMODE_EXP2;
    this.scene.fogDensity = 0.025; // Decreased from 0.045
    const bgColor = Color3.FromHexString('#050508');
    this.scene.fogColor = bgColor;
    this.scene.ambientColor = bgColor.scale(0.2);

    // Dungeon ambient — dark but cinematic
    const ambient = new HemisphericLight('ambient', new Vector3(0, 1, 0), this.scene);
    ambient.intensity = 0.35; // Increased from 0.15
    ambient.diffuse = new Color3(0.5, 0.4, 0.7);
    ambient.groundColor = new Color3(0.1, 0.08, 0.15);

    // AAA Post-Processing Pipeline - Initialize with empty camera list to avoid crash
    this.pipeline = new DefaultRenderingPipeline(
      "aaa_pipeline", 
      true, 
      this.scene, 
      []
    );
    
    // Configure default settings
    this.pipeline.bloomEnabled = true;
    this.pipeline.bloomThreshold = 0.6;
    this.pipeline.bloomWeight = 0.4;
    this.pipeline.bloomKernel = 64;

    this.pipeline.imageProcessingEnabled = true;
    this.pipeline.imageProcessing.vignetteEnabled = true;
    this.pipeline.imageProcessing.vignetteWeight = 3;
    this.pipeline.imageProcessing.vignetteStretch = 0.5;
    this.pipeline.imageProcessing.vignetteColor = new Color4(0, 0, 0, 0);

    this.pipeline.chromaticAberrationEnabled = true;
    this.pipeline.chromaticAberration.aberrationAmount = 2.5;
    this.pipeline.chromaticAberration.radialIntensity = 0.2;

    return this.scene;
  }

  /** Attach a camera to the post-processing pipeline */
  attachCameraToPipeline(camera: any): void {
    if (this.pipeline && camera) {
      this.pipeline.addCamera(camera);
    }
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
