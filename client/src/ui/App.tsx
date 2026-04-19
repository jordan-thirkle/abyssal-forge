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
import { useGameStore } from '../store/gameStore';
import { usePlayerStore } from '../store/playerStore';
import { generateGuestName } from '@shared/types/player.types';
import HUDLayer from './hud/HUDLayer';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const sceneRef = useRef<DungeonScene | null>(null);

  const { isLoading, setLoading, setScene } = useGameStore();
  const initPlayer = usePlayerStore((s) => s.init);

  useEffect(() => {
    if (!canvasRef.current) return;

    const boot = async () => {
      setLoading(true);
      try {
        // Parse portal params from URL
        const params = new URLSearchParams(window.location.search);
        const fromPortal = params.get('portal') === 'true';
        const refDomain = params.get('ref') ?? undefined;
        const portalUsername = params.get('username') ?? undefined;
        const portalHp = params.get('hp') ? parseInt(params.get('hp')!, 10) : undefined;

        const username = portalUsername ?? generateGuestName();
        
        // Attempt Supabase init, but don't block forever
        try {
          await initPlayer(username, fromPortal, portalHp);
        } catch (e) {
          console.error("Supabase init failed, continuing in guest mode", e);
        }

        const engine = new GameEngine(canvasRef.current!);
        engineRef.current = engine;

        const dungeonScene = new DungeonScene(engine, { fromPortal, refDomain });
        sceneRef.current = dungeonScene;
        
        // Build the scene
        await dungeonScene.build();

        engine.startRenderLoop(() => dungeonScene.update());
        setScene('dungeon');
      } catch (e) {
        console.error("FATAL GAME BOOT ERROR", e);
      } finally {
        setLoading(false);
      }
    };

    boot();

    return () => {
      sceneRef.current?.dispose();
      engineRef.current?.dispose();
    };
  }, [initPlayer, setScene, setLoading]);

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
