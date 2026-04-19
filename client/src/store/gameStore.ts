/**
 * @description Zustand game store — scene state, loading status, session flags
 * @author Abyssal Forge
 * @version 1.0.0
 */
import { create } from 'zustand';

type SceneKey = 'dungeon' | 'arena' | 'hub';

interface GameState {
  currentScene: SceneKey;
  isLoading: boolean;
  isPaused: boolean;
  setScene: (scene: SceneKey) => void;
  setLoading: (loading: boolean) => void;
  setPaused: (paused: boolean) => void;
}

export const useGameStore = create<GameState>((set) => ({
  currentScene: 'dungeon',
  isLoading: false,
  isPaused: false,
  setScene: (scene) => set({ currentScene: scene }),
  setLoading: (isLoading) => set({ isLoading }),
  setPaused: (isPaused) => set({ isPaused }),
}));
