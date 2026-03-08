import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface HighScoreEntry {
  name: string;
  score: number;
  date: string;
}

interface PersistedState {
  highScores: HighScoreEntry[];
  isMuted: boolean;
  saveHighScore: (name: string, score: number) => void;
  addScore: (score: number) => void;
  toggleMute: () => void;
  clearData: () => void;
}

const MAX_SCORES = 10;

export const usePersistedStore = create<PersistedState>()(
  persist(
    (set) => ({
      highScores: [],
      isMuted: false,

      saveHighScore: (name, score) =>
        set((state) => {
          const entry: HighScoreEntry = {
            name: name.slice(0, 3).toUpperCase() || '???',
            score,
            date: new Date().toISOString(),
          };
          const highScores = [...state.highScores, entry]
            .sort((a, b) => b.score - a.score)
            .slice(0, MAX_SCORES);
          return { highScores };
        }),

      // Legacy compat — saves without a name
      addScore: (score) =>
        set((state) => {
          const entry: HighScoreEntry = {
            name: '???',
            score,
            date: new Date().toISOString(),
          };
          const highScores = [...state.highScores, entry]
            .sort((a, b) => b.score - a.score)
            .slice(0, MAX_SCORES);
          return { highScores };
        }),

      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

      clearData: () => set({ highScores: [], isMuted: false }),
    }),
    { name: 'provenance_highscores' },
  ),
);

/** Check if a score qualifies for the top 10 */
export function qualifiesForHighScore(score: number): boolean {
  const { highScores } = usePersistedStore.getState();
  if (score <= 0) return false;
  if (highScores.length < MAX_SCORES) return true;
  return score > highScores[highScores.length - 1].score;
}
