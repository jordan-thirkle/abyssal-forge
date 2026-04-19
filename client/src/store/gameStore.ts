/**
 * @description Zustand game store — scene state, loading status, session flags
 * @author Abyssal Forge
 * @version 1.0.0
 */
import { create } from 'zustand';

type SceneKey = 'dungeon' | 'arena' | 'hub';
export type GameScreen = 'none' | 'inventory' | 'forge' | 'auction' | 'skills';

interface GameState {
  currentScene: SceneKey;
  isLoading: boolean;
  isPaused: boolean;
  isMenuOpen: boolean;
  activeScreen: GameScreen;
  setScene: (scene: SceneKey) => void;
  setLoading: (loading: boolean) => void;
  setPaused: (paused: boolean) => void;
  setMenuOpen: (val: boolean) => void;
  setActiveScreen: (screen: GameScreen) => void;
}

export const useGameStore = create<GameState>((set) => ({
  currentScene: 'dungeon',
  isLoading: false,
  isPaused: false,
  isMenuOpen: false,
  activeScreen: 'none',
  setScene: (scene) => set({ currentScene: scene }),
  setLoading: (isLoading) => set({ isLoading }),
  setPaused: (isPaused) => set({ isPaused }),
  setMenuOpen: (val) => set({ isMenuOpen: val }),
  setActiveScreen: (screen) => set({ activeScreen: screen, isMenuOpen: screen !== 'none' }),
}));
