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

  const setScene = useGameStore((s) => s.setScene);
  const initPlayer = usePlayerStore((s) => s.init);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Parse portal params from URL
    const params = new URLSearchParams(window.location.search);
    const fromPortal = params.get('portal') === 'true';
    const refDomain = params.get('ref') ?? undefined;
    const portalUsername = params.get('username') ?? undefined;
    const portalHp = params.get('hp') ? parseInt(params.get('hp')!, 10) : undefined;

    // Initialize player — use portal username if available, else generate guest name
    const username = portalUsername ?? generateGuestName();
    initPlayer(username, fromPortal, portalHp);

    // Boot Babylon
    const engine = new GameEngine(canvasRef.current);
    engineRef.current = engine;

    const dungeonScene = new DungeonScene(engine, { fromPortal, refDomain });
    sceneRef.current = dungeonScene;
    dungeonScene.build();

    engine.startRenderLoop(() => dungeonScene.update());
    setScene('dungeon');

    return () => {
      dungeonScene.dispose();
      engine.dispose();
    };
  }, [initPlayer, setScene]);

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
          <HUDLayer />
        </AnimatePresence>
      </div>
    </>
  );
}
