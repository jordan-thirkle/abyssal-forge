/**
 * @description XPSystem — award XP, detect level-ups, trigger level-up overlay.
 * @author Abyssal Forge
 * @version 1.0.0
 */
import { XP } from '@shared/constants/balance';
import { usePlayerStore } from '../../store/playerStore';

export class XPSystem {
  gainXP(amount: number): boolean {
    const before = usePlayerStore.getState().profile?.level ?? 1;
    usePlayerStore.getState().gainXP(amount);
    const after = usePlayerStore.getState().profile?.level ?? 1;
    return after > before;
  }

  static getXPForNext(currentXP: number): { current: number; required: number; level: number } {
    const thresholds = XP.LEVEL_THRESHOLDS;
    for (let i = 0; i < thresholds.length - 1; i++) {
      if (currentXP < thresholds[i + 1]) {
        return { current: currentXP - thresholds[i], required: thresholds[i + 1] - thresholds[i], level: i + 1 };
      }
    }
    return { current: 0, required: 1, level: thresholds.length };
  }
}
