import { create } from 'zustand';
import type { ManifestObject } from '../types/manifest';
import type { LevelData } from '../types/level';

export type ItemStatus = 'discovered' | 'researched' | 'restored';
export type GamePhase = 'menu' | 'loading' | 'playing' | 'auction' | 'scores' | 'settings';

export interface InventoryItem {
  id: string;
  name: string;
  imageUrl: string;
  roomNumber: 1 | 2 | 3;
  status: ItemStatus;
  baseAppraisalValue: number;
  triviaMultiplier: number;
  restorationMultiplier: number;
  finalAppraisalValue: number;
}

interface GameState {
  // Phase & navigation
  phase: GamePhase;
  currentRoom: 1 | 2 | 3;

  // Level data (new — hydrated from level JSON)
  levelData: LevelData | null;
  levelError: string | null;

  // Session tracking
  timeRemaining: number;
  isTimerRunning: boolean;
  inventory: InventoryItem[];
  discoveredItems: string[];
  currentScore: number;
  totalAppraisalValue: number;
  hintsRemaining: number;

  // Trivia modal
  activeTriviaItemId: string | null;

  // Restoration modal
  activeRestorationItemId: string | null;

  // Actions
  fetchLevelData: (levelId: string) => Promise<void>;
  startNewGame: () => void;
  setPhase: (phase: GamePhase) => void;
  setActiveTriviaItem: (id: string | null) => void;
  setActiveRestorationItem: (id: string | null) => void;
  discoverObject: (objectId: string, data: ManifestObject, room: 1 | 2 | 3) => void;
  completeTrivia: (objectId: string, correct: boolean) => void;
  completeRestoration: (objectId: string, multiplier: number) => void;
  advanceRoom: () => void;
  useHint: () => void;
  tickTimer: () => void;
  endGame: () => void;
  goToAuction: () => void;
}

const computeFinal = (item: InventoryItem): number =>
  item.baseAppraisalValue * item.triviaMultiplier * item.restorationMultiplier;

const recomputeTotal = (inventory: InventoryItem[]): number =>
  inventory.reduce((sum, item) => sum + item.finalAppraisalValue, 0);

const DEFAULT_TIME = 25 * 60; // 25 minutes fallback

export const useGameStore = create<GameState>((set, get) => ({
  phase: 'menu',
  currentRoom: 1,
  levelData: null,
  levelError: null,
  timeRemaining: DEFAULT_TIME,
  isTimerRunning: false,
  inventory: [],
  discoveredItems: [],
  currentScore: 0,
  totalAppraisalValue: 0,
  hintsRemaining: 3,
  activeTriviaItemId: null,
  activeRestorationItemId: null,

  fetchLevelData: async (levelId: string) => {
    set({ phase: 'loading', levelError: null, levelData: null });
    try {
      const res = await fetch(`data/${levelId}.json`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const data: LevelData = await res.json();

      // Validate minimal shape
      if (!data.levelId || !Array.isArray(data.objects) || data.objects.length === 0) {
        throw new Error('Invalid level data: missing levelId or objects');
      }

      set({
        levelData: data,
        levelError: null,
        // Hydrate timer from level data
        timeRemaining: data.timeLimitSeconds ?? DEFAULT_TIME,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load level data';
      set({ phase: 'menu', levelError: msg, levelData: null });
    }
  },

  startNewGame: () => {
    const { levelData } = get();
    set({
      phase: 'playing',
      currentRoom: 1,
      timeRemaining: levelData?.timeLimitSeconds ?? DEFAULT_TIME,
      isTimerRunning: true,
      inventory: [],
      discoveredItems: [],
      currentScore: 0,
      totalAppraisalValue: 0,
      hintsRemaining: 3,
      activeTriviaItemId: null,
      activeRestorationItemId: null,
    });
  },

  setPhase: (phase) => set({ phase }),

  setActiveTriviaItem: (id) => set({ activeTriviaItemId: id }),

  setActiveRestorationItem: (id) => set({ activeRestorationItemId: id }),

  discoverObject: (objectId, data, room) =>
    set((state) => {
      if (state.discoveredItems.includes(objectId)) return state;
      const newItem: InventoryItem = {
        id: objectId,
        name: data.name,
        imageUrl: data.imageUrl,
        roomNumber: room,
        status: 'discovered',
        baseAppraisalValue: data.baseAppraisalValue,
        triviaMultiplier: 1.0,
        restorationMultiplier: 1.0,
        finalAppraisalValue: data.baseAppraisalValue,
      };
      const inventory = [...state.inventory, newItem];
      const discoveredItems = [...state.discoveredItems, objectId];
      const totalAppraisalValue = recomputeTotal(inventory);
      return { inventory, discoveredItems, currentScore: totalAppraisalValue, totalAppraisalValue };
    }),

  completeTrivia: (objectId, correct) =>
    set((state) => {
      const inventory = state.inventory.map((item) => {
        if (item.id !== objectId) return item;
        const triviaMultiplier = correct ? 1.5 : 1.0;
        const updated = { ...item, triviaMultiplier, status: 'researched' as const };
        return { ...updated, finalAppraisalValue: computeFinal(updated) };
      });
      const totalAppraisalValue = recomputeTotal(inventory);
      return { inventory, currentScore: totalAppraisalValue, totalAppraisalValue };
    }),

  completeRestoration: (objectId, multiplier) =>
    set((state) => {
      const inventory = state.inventory.map((item) => {
        if (item.id !== objectId) return item;
        const updated = { ...item, restorationMultiplier: multiplier, status: 'restored' as const };
        return { ...updated, finalAppraisalValue: computeFinal(updated) };
      });
      const totalAppraisalValue = recomputeTotal(inventory);
      return { inventory, currentScore: totalAppraisalValue, totalAppraisalValue };
    }),

  advanceRoom: () =>
    set((state) => {
      if (state.currentRoom >= 3) return { phase: 'auction', isTimerRunning: false };
      return { currentRoom: (state.currentRoom + 1) as 1 | 2 | 3 };
    }),

  useHint: () =>
    set((state) => {
      if (state.hintsRemaining <= 0) return state;
      return { hintsRemaining: state.hintsRemaining - 1 };
    }),

  tickTimer: () =>
    set((state) => {
      if (!state.isTimerRunning || state.timeRemaining <= 0) return state;
      const timeRemaining = state.timeRemaining - 1;
      if (timeRemaining <= 0) return { timeRemaining: 0, isTimerRunning: false, phase: 'auction' };
      return { timeRemaining };
    }),

  goToAuction: () => set({ phase: 'auction', isTimerRunning: false }),

  endGame: () => set({
    phase: 'auction',
    isTimerRunning: false,
    activeTriviaItemId: null,
    activeRestorationItemId: null,
  }),
}));
