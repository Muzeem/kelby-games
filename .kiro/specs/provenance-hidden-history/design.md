# Technical Design Document

## Introduction

This document defines the component architecture, state management strategy, data schemas, and Canvas-React communication layer for "Provenance: The Hidden History" based on the 17 approved requirements.

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| UI Framework | React 18 + TypeScript | Component rendering, modals, menus, inventory |
| Styling | Tailwind CSS 3 | Utility-first responsive styling |
| Game Renderer | Phaser 3 (CE) | Canvas-based scene rendering, object detection, animations |
| State Management | Zustand | Lightweight global store shared across React and Canvas bridge |
| Build Tool | Vite | Fast HMR, optimized production builds, PWA plugin |
| PWA | vite-plugin-pwa (Workbox) | Service worker generation, manifest, offline caching |
| Routing | React Router v6 (hash) | Main menu, game, auction, settings screens |

## Component Architecture

```
<App>
├── <MainMenu />                    // Req 14 - New Game, High Scores, Settings, Portal link
├── <GameScreen>                    // Req 1 - Active session container
│   ├── <HUD>                       // Req 6 - Session timer, room indicator, hint button
│   │   ├── <SessionTimer />        // Req 6 - MM:SS countdown, warning/pulse states
│   │   ├── <RoomIndicator />       // Req 1 - "Room 1/3" display
│   │   └── <HintButton />          // Req 7 - Hint activation with remaining count
│   ├── <PhaserContainer />         // Req 1,2 - Mounts Phaser game instance in a div
│   ├── <InventoryPanel>            // Req 8 - Side panel listing discovered items
│   │   └── <InventoryItem />       // Req 8 - Individual item with status badge
│   ├── <TriviaModal />             // Req 3 - Focus-trapped modal with 3 claims
│   └── <RestorationModal />        // Req 4 - Cleaning mini-game overlay
├── <AuctionScreen />               // Req 5 - Score summary with animated reveals
├── <HighScoresScreen />            // Req 9 - Top 10 leaderboard
├── <SettingsScreen />              // Req 14 - Audio toggle, clear data
└── <ErrorBoundary />               // Req 1,17 - Asset/manifest load failures
```

## State Management (Zustand)

### Store: `useGameStore`

```typescript
interface GameState {
  // Session
  phase: 'menu' | 'playing' | 'auction' | 'scores' | 'settings';
  currentRoom: 1 | 2 | 3;
  timeRemaining: number;           // seconds
  isTimerRunning: boolean;

  // Inventory (Req 8)
  inventory: InventoryItem[];
  totalAppraisalValue: number;

  // Hints (Req 7)
  hintsRemaining: number;

  // Audio (Req 13)
  isMuted: boolean;

  // Actions
  startNewGame: () => void;
  discoverObject: (objectId: string, data: ManifestObject) => void;
  completeTrivia: (objectId: string, correct: boolean) => void;
  completeRestoration: (objectId: string, multiplier: number) => void;
  advanceRoom: () => void;
  useHint: () => void;
  tickTimer: () => void;
  goToAuction: () => void;
}

interface InventoryItem {
  id: string;
  name: string;
  imageUrl: string;
  roomNumber: 1 | 2 | 3;
  status: 'discovered' | 'researched' | 'restored';
  baseAppraisalValue: number;
  triviaMultiplier: number;        // default 1.0
  restorationMultiplier: number;   // default 1.0
  finalAppraisalValue: number;     // computed
}
```

### Store: `usePersistedStore`

```typescript
interface PersistedState {
  highScores: HighScoreEntry[];    // top 10
  isMuted: boolean;
  addScore: (score: number) => void;
  clearData: () => void;
}

interface HighScoreEntry {
  score: number;
  date: string;                    // ISO 8601
}
```

Zustand's `persist` middleware writes `usePersistedStore` to LocalStorage (Req 9). `useGameStore` is ephemeral per session.

## Canvas_Event_Bridge (Req 2.9, 2.10, 8.6, 8.7)

The bridge is a thin event emitter that decouples Phaser from React:

```typescript
// src/bridge/canvasEventBridge.ts
type BridgeEvents = {
  objectDiscovered: { objectId: string; manifestData: ManifestObject };
  roomCleared: { roomNumber: number };
  hintRequested: {};
  missClick: { x: number; y: number };
};

class CanvasEventBridge {
  private listeners = new Map<string, Set<Function>>();

  on<K extends keyof BridgeEvents>(event: K, cb: (data: BridgeEvents[K]) => void): () => void;
  emit<K extends keyof BridgeEvents>(event: K, data: BridgeEvents[K]): void;
  off<K extends keyof BridgeEvents>(event: K, cb: Function): void;
}

export const bridge = new CanvasEventBridge();
```

**Data flow:**
1. Phaser `Object_Detector` detects click → calls `bridge.emit('objectDiscovered', { objectId, manifestData })`
2. React `<PhaserContainer>` subscribes on mount: `bridge.on('objectDiscovered', ...)` → calls `useGameStore.getState().discoverObject()`
3. `<InventoryPanel>` re-renders via Zustand selector — no full page re-render (Req 8.6)

## Level_Manifest Data Schema (Req 17)

```typescript
// src/types/manifest.ts

interface LevelManifest {
  rooms: [RoomManifest, RoomManifest, RoomManifest]; // exactly 3
}

interface RoomManifest {
  id: string;
  name: string;
  backgroundAssetPath: string;
  objects: ManifestObject[];       // 10-15 items
}

interface ManifestObject {
  id: string;
  name: string;
  imageUrl: string;
  x: number;                       // px from left (scene coords)
  y: number;                       // px from top (scene coords)
  width: number;                   // bounding box width
  height: number;                  // bounding box height
  hitArea?: { x: number; y: number; width: number; height: number }; // optional custom hit area
  baseAppraisalValue: number;
  trivia: TriviaData;
}

interface TriviaData {
  claims: [TriviaClaim, TriviaClaim, TriviaClaim]; // exactly 3
}

interface TriviaClaim {
  text: string;
  isFalse: boolean;                // exactly one must be true
}
```

Manifest files live at `public/data/level-manifest.json` and are fetched at runtime. Phaser and TriviaModal both consume this data — zero hardcoded game content.

## Phaser Integration Strategy

Phaser runs inside a single `<div ref={gameContainerRef}>` managed by `<PhaserContainer>`. The React component:

1. Creates the Phaser.Game instance on mount with the container div
2. Passes the `bridge` instance and current `RoomManifest` to the Phaser scene via `scene.data`
3. Destroys the Phaser instance on unmount

Phaser scenes:
- `HiddenObjectScene` — loads background, places interactive sprites from manifest, handles click detection, emits bridge events
- Scene transitions between rooms are handled by destroying and re-creating the scene with the next RoomManifest

## PWA Architecture (Req 10, 11)

- `vite-plugin-pwa` generates the service worker and manifest at build time
- Workbox `CacheFirst` strategy for all static assets
- Manifest includes all MS Store required fields: icons (44, 50, 150, 192, 512), screenshots, categories, display: standalone
- Scope locked to `/games/provenance/`

## Folder Structure

```
games/provenance/
├── public/
│   ├── data/
│   │   └── level-manifest.json
│   ├── assets/
│   │   ├── rooms/          // scene backgrounds
│   │   ├── objects/         // object sprites
│   │   └── audio/           // sfx + ambient
│   └── icons/               // PWA icons (44,50,150,192,512)
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── bridge/
│   │   └── canvasEventBridge.ts
│   ├── components/
│   │   ├── MainMenu.tsx
│   │   ├── GameScreen.tsx
│   │   ├── HUD.tsx
│   │   ├── PhaserContainer.tsx
│   │   ├── InventoryPanel.tsx
│   │   ├── TriviaModal.tsx
│   │   ├── RestorationModal.tsx
│   │   ├── AuctionScreen.tsx
│   │   ├── HighScoresScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   └── ErrorBoundary.tsx
│   ├── phaser/
│   │   ├── gameConfig.ts
│   │   └── scenes/
│   │       └── HiddenObjectScene.ts
│   ├── store/
│   │   ├── gameStore.ts
│   │   └── persistedStore.ts
│   ├── types/
│   │   └── manifest.ts
│   └── utils/
│       └── audio.ts
├── index.html
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
└── package.json
```
