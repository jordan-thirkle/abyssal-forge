/**
 * @description HUDLayer — top-level HUD container with inline styles as baseline,
 *              Tailwind classes as progressive enhancement.
 * @author Abyssal Forge
 * @version 1.0.0
 */
import React from 'react';
import { AnimatePresence } from 'framer-motion';
import HealthBar from './HealthBar';
import XPBar from './XPBar';
import AbilityBar from './AbilityBar';
import LevelUpOverlay from '../components/LevelUpOverlay';
import PlayerNameplate from './PlayerNameplate';
import { usePlayerStore } from '../../store/playerStore';
import { useGameStore } from '../../store/gameStore';
import { AudioSystem } from '../../game/systems/AudioSystem';
import Inventory from '../screens/Inventory';
import Forge from '../screens/Forge';
import AuctionHouse from '../screens/AuctionHouse';
import ArenaOverlay from '../screens/ArenaOverlay';
import ControlsOverlay from '../components/ControlsOverlay';

export default function HUDLayer() {
  const isLevelingUp = usePlayerStore(s => s.isLevelingUp);
  const activeScreen = useGameStore(s => s.activeScreen);
  const setActiveScreen = useGameStore(s => s.setActiveScreen);
  const [showControls, setShowControls] = React.useState(true);

  // Close screen on ESC
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveScreen('none');
      if (e.key === 'i' || e.key === 'I') {
        AudioSystem.playUIClick();
        setActiveScreen(activeScreen === 'inventory' ? 'none' : 'inventory');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    
    // Start ambient track on first interaction
    const handleFirstClick = () => {
      AudioSystem.resume();
      AudioSystem.playAmbientTrack();
      window.removeEventListener('click', handleFirstClick);
    };
    window.addEventListener('click', handleFirstClick);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('click', handleFirstClick);
    };
  }, [activeScreen, setActiveScreen]);

  const handleScreenToggle = (screen: any) => {
    AudioSystem.playUIClick();
    setActiveScreen(activeScreen === screen ? 'none' : screen);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', fontFamily: "'Outfit', sans-serif" }}>

      {/* Screen Backdrop if something is open */}
      <AnimatePresence>
        {activeScreen !== 'none' && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', pointerEvents: 'auto', backdropFilter: 'blur(8px)' }} onClick={() => setActiveScreen('none')} />
        )}
      </AnimatePresence>

      {/* Active Screen Overlay */}
      {activeScreen === 'inventory' && <Inventory />}
      {activeScreen === 'forge' && <Forge />}
      {activeScreen === 'auction' && <AuctionHouse />}
      {activeScreen === 'arena' && <ArenaOverlay />}

      {/* Top-left: player nameplate */}
      <div style={{ position: 'absolute', top: 20, left: 20, pointerEvents: 'auto' }}>
        <PlayerNameplate />
      </div>

      {/* Top-right: HUD Controls */}
      <div style={{ position: 'absolute', top: 20, right: 20, pointerEvents: 'auto', display: 'flex', gap: 12 }}>
        <button onClick={() => handleScreenToggle('inventory')} style={{ background: 'rgba(20,20,25,0.9)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '10px 20px', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}>Bag (I)</button>
        <button onClick={() => handleScreenToggle('forge')} style={{ background: 'rgba(20,20,25,0.9)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '10px 20px', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}>Forge</button>
        <button onClick={() => handleScreenToggle('auction')} style={{ background: 'rgba(20,20,25,0.9)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '10px 20px', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}>Auction</button>
        <button onClick={() => handleScreenToggle('arena')} style={{ background: 'linear-gradient(180deg, #b32d2d 0%, #7a1a1a 100%)', border: '1px solid #ff4444', color: '#fff', padding: '10px 20px', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}>Arena</button>
      </div>

      {/* Bottom-left: HP + XP stacked */}
      <div style={{ position: 'absolute', bottom: 24, left: 24, display: 'flex', flexDirection: 'column', gap: 8, width: 260 }}>
        <HealthBar />
        <XPBar />
      </div>

      {/* Bottom-center: ability bar */}
      <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)' }}>
        <AbilityBar />
      </div>

      {/* Level-up overlay */}
      {/* Controls / Tutorial Overlay */}
      <AnimatePresence>
        {showControls && <ControlsOverlay onClose={() => setShowControls(false)} />}
      </AnimatePresence>

      {/* Help Button */}
      <button 
        onClick={() => setShowControls(true)}
        style={{ 
          position: 'absolute', bottom: 24, right: 24, pointerEvents: 'auto',
          width: 32, height: 32, borderRadius: '50%', background: 'rgba(59,130,246,0.3)',
          border: '1px solid rgba(59,130,246,0.5)', color: '#fff', cursor: 'pointer'
        }}
      >
        ?
      </button>
    </div>
  );
}
