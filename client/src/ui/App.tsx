/**
 * @description App.tsx — Root React UI component. Mounts the Babylon.js canvas and
 *              overlays the React HUD. Handles portal detection on load.
 * @author Abyssal Forge
 * @version 1.0.0
 */
import React, { useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { GameEngine } from '../game/GameEngine';
import { DungeonScene } from '../game/scenes/DungeonScene';
import { ArenaScene } from '../game/scenes/ArenaScene';
import { useGameStore } from '../store/gameStore';
import { usePlayerStore } from '../store/playerStore';
import { generateGuestName } from '@shared/types/player.types';
import HUDLayer from './hud/HUDLayer';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const sceneRef = useRef<any>(null); // Dynamic scene ref

  const { isLoading, setLoading, setScene, currentScene } = useGameStore();
  const initPlayer = usePlayerStore((s) => s.init);

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = engineRef.current || new GameEngine(canvasRef.current!);
    engineRef.current = engine;

    const loadScene = async () => {
      setLoading(true);
      
      // 1. Stop existing loop and cleanup
      engine.stopRenderLoop(); 
      if (sceneRef.current) {
        sceneRef.current.dispose();
      }

      try {
        let activeScene: any;
        if (currentScene === 'dungeon') {
          activeScene = new DungeonScene(engine, { tier: 1 });
        } else if (currentScene === 'arena') {
          activeScene = new ArenaScene(engine);
        }

        // 2. Build and start new scene
        sceneRef.current = activeScene;
        await activeScene.build();
        
        engine.startRenderLoop(() => activeScene.update());
      } catch (e) {
        console.error("SCENE LOAD ERROR", e);
      } finally {
        setLoading(false);
      }
    };

    // Initial boot (Auth + Engine)
    const boot = async () => {
      if (!engineRef.current) {
        setLoading(true);
        try {
          const params = new URLSearchParams(window.location.search);
          const username = params.get('username') ?? generateGuestName();
          await initPlayer(username);
        } finally {
          setLoading(false);
        }
      }
      loadScene();
    };

    boot();

    return () => {
      // sceneRef.current?.dispose(); // handled on scene change
    };
  }, [currentScene, initPlayer, setScene, setLoading]);

  return (
    <>
      {/* Babylon.js 3D canvas */}
      <canvas
        id="babylon-canvas"
        ref={canvasRef}
        aria-label="Abyssal Forge game canvas"
      />

      {/* React UI overlay */}
      <div id="ui-root">
        <AnimatePresence>
          {isLoading && (
            <div key="loader" style={{
              position: 'fixed', inset: 0, zIndex: 100,
              background: '#050508', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', color: '#3B82F6',
              fontFamily: "'Outfit', sans-serif"
            }}>
              <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: '0.2em', marginBottom: 20 }}>ABYSSAL FORGE</div>
              <div style={{ width: 200, height: 2, background: 'rgba(59,130,246,0.2)', position: 'relative' }}>
                <div style={{ position: 'absolute', height: '100%', background: '#3B82F6', width: '60%' }} />
              </div>
              <div style={{ marginTop: 20, fontSize: 12, color: '#6B7280', textTransform: 'uppercase' }}>Connecting to the Void...</div>
            </div>
          )}
          <HUDLayer />
        </AnimatePresence>
      </div>
    </>
  );
}
