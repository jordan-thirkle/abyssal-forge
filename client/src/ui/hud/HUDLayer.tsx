/**
 * @description HUDLayer — top-level HUD container, renders all HUD elements over canvas.
 * @author Abyssal Forge
 * @version 1.0.0
 */
import React from 'react';
import HealthBar from './HealthBar';
import XPBar from './XPBar';
import AbilityBar from './AbilityBar';
import LevelUpOverlay from '../components/LevelUpOverlay';
import { usePlayerStore } from '../../store/playerStore';

export default function HUDLayer() {
  const isLevelingUp = usePlayerStore(s => s.isLevelingUp);
  return (
    <div className="pointer-events-none w-full h-full">
      {/* Bottom-left: health + XP */}
      <div className="absolute bottom-6 left-6 flex flex-col gap-2 w-64">
        <HealthBar />
        <XPBar />
      </div>
      {/* Bottom-center: ability bar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <AbilityBar />
      </div>
      {/* Level-up overlay */}
      {isLevelingUp && <LevelUpOverlay />}
    </div>
  );
}
