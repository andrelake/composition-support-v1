import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { KeyConfig, HarmonyResult, Note, Tonality } from '@cs/music-engine';
import { calculateHarmony, getRandomKey } from '@cs/music-engine';

interface AppState {
  // State
  currentKey: KeyConfig;
  harmonyResult: HarmonyResult;
  isSpinning: boolean;
  targetKey: KeyConfig | null;

  // Actions
  setKey: (root: Note, tonality: Tonality) => void;
  spin: () => void;
  setSpinning: (state: boolean) => void;
  clearTarget: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentKey: { root: 'C', tonality: 'Major' },
      harmonyResult: calculateHarmony('C', 'Major'),
      isSpinning: false,
      targetKey: null,

      setKey: (root, tonality) => {
        set({
          currentKey: { root, tonality },
          harmonyResult: calculateHarmony(root, tonality),
        });
      },

      setSpinning: (state) => set({ isSpinning: state }),

      spin: () => {
        set({ isSpinning: true, targetKey: getRandomKey() });
      },

      clearTarget: () => set({ targetKey: null }),
    }),
    {
      name: 'composition-support-storage',
      partialize: (state) => ({ currentKey: state.currentKey }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const { currentKey } = state;
        if (currentKey) {
          state.harmonyResult = calculateHarmony(currentKey.root, currentKey.tonality);
        }
      },
    }
  )
);
