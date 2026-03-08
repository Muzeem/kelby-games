# Implementation Tasks

## Task 1: Project Initialization
- [x] Scaffold React + TypeScript project with Vite inside `games/provenance/`
- [x] Install dependencies: react, react-dom, react-router-dom, zustand, phaser, tailwindcss, @tailwindcss/vite, vite-plugin-pwa
- [x] Configure Tailwind CSS with `@tailwindcss/vite` plugin
- [x] Configure Vite with base path `/games/provenance/`
- [x] Create folder structure: `src/components/`, `src/store/`, `src/bridge/`, `src/phaser/`, `src/types/`, `src/utils/`, `public/data/`, `public/assets/`, `public/icons/`
- [x] Verify dev server starts and renders a basic React component

## Task 2: PWA Shell Configuration
- [x] Create `manifest.json` with MS Store required fields (name, short_name, display: standalone, icons, categories, screenshots placeholder)
- [x] Configure `vite-plugin-pwa` in `vite.config.ts` with Workbox CacheFirst strategy
- [x] Add PWA icon placeholders (44, 50, 150, 192, 512 px)
- [x] Verify manifest passes basic PWA validation structure

## Task 3: Static UI Shell & Routing
- [x] Set up React Router with hash routing (MainMenu, GameScreen, AuctionScreen, HighScoresScreen, SettingsScreen)
- [x] Build `<MainMenu>` with "New Game", "High Scores", "Settings", and Kelby portal link
- [x] Build placeholder `<GameScreen>` with HUD area, canvas container div, and inventory panel area
- [x] Build `<ErrorBoundary>` wrapper component
- [x] Apply Tailwind styling with dark theme consistent with Kelby portfolio aesthetic

## Task 4: Zustand Stores
- [x] Implement `useGameStore` with session state, inventory actions, timer, hints
- [x] Implement `usePersistedStore` with LocalStorage persistence middleware for high scores and mute preference
- [x] Define TypeScript interfaces for `InventoryItem`, `HighScoreEntry`

## Task 5: Level Manifest Types & Loader
- [x] Define TypeScript interfaces: `LevelManifest`, `RoomManifest`, `ManifestObject`, `TriviaData`, `TriviaClaim`
- [x] Create manifest loader utility that fetches and validates `level-manifest.json`
- [x] Create a sample `level-manifest.json` with 3 rooms, 3 placeholder objects each (for dev/testing)
- [x] Add error handling for malformed/missing manifest

## Task 6: Canvas Event Bridge
- [x] Implement `CanvasEventBridge` class with typed `on`, `emit`, `off` methods
- [x] Export singleton `bridge` instance
- [x] Wire bridge subscription in `<PhaserContainer>` to call `useGameStore.discoverObject()`

## Task 7: Phaser Integration & Hidden Object Scene
- [x] Create `gameConfig.ts` with Phaser configuration (transparent canvas, parent div)
- [x] Create `HiddenObjectScene` that loads room background and places interactive sprites from manifest
- [x] Implement `Object_Detector` click/tap handling with 10px tolerance
- [x] Emit `objectDiscovered` and `missClick` events through bridge
- [x] Add discovery animation (glow/highlight lasting 1s)

## Task 8: Inventory Panel UI
- [x] Build `<InventoryPanel>` component subscribing to `useGameStore.inventory`
- [x] Display items with status badges (Discovered / Researched / Restored)
- [x] Show running total appraisal value
- [x] Add click handlers to open Trivia or Restoration based on item status

## Task 9: Trivia Modal
- [x] Build `<TriviaModal>` with focus trap, Escape to close, ARIA labels
- [x] Display object name, image, and 3 shuffled claims from manifest data
- [x] Handle correct/incorrect selection, apply Trivia_Multiplier (1.5x / 1.0x)
- [x] Update store and close modal on completion

## Task 10: Restoration Mini-Game
- [x] Build `<RestorationModal>` with click/swipe progress bar (0-100%)
- [x] Calculate Restoration_Multiplier based on completion speed vs 15s target
- [x] Handle timer expiry during restoration (auto-complete with proportional multiplier)
- [x] Update store with Final_Appraisal_Value

## Task 11: Session Timer & Room Transitions
- [x] Implement `<SessionTimer>` with 25-minute countdown, MM:SS display
- [x] Add warning color at 60s, pulse animation at 10s
- [x] Implement room transition logic: advance to next room when all objects found
- [x] Trigger auction when Room 3 cleared or timer hits zero

## Task 12: Auction Screen
- [x] Build `<AuctionScreen>` listing all items across 3 rooms
- [x] Show per-item breakdown: name, base value, trivia multiplier, restoration multiplier, final value
- [x] Animate sequential item reveals (500ms each)
- [x] Compute and display total score, save high score if new record
- [x] New Game / Main Menu buttons

## Task 13: Hint System
- [x] Implement hint logic in store (3 hints per session)
- [x] Build `<HintButton>` with remaining count and ARIA label
- [x] Communicate hint request to Phaser via bridge to highlight random undiscovered object for 3s

## Task 14: Audio System
- [ ] Create audio utility for ambient music loop (30% volume) and SFX (discovery, trivia success, restoration complete)
- [ ] Implement mute toggle persisted via `usePersistedStore`
- [ ] Mute on tab visibility change

## Task 15: High Scores & Settings Screens
- [ ] Build `<HighScoresScreen>` displaying top 10 from persisted store
- [ ] Build `<SettingsScreen>` with mute toggle and clear data button
- [ ] Handle LocalStorage unavailable gracefully

## Task 16: Responsive Layout & Accessibility
- [ ] Ensure all components scale from 320px to 2560px viewport
- [ ] Mobile layout: larger touch targets (44x44px min), stacked inventory
- [ ] Keyboard navigation for menus, modals, auction (Tab, Enter, Space, Escape)
- [ ] ARIA live region for object discovery announcements
- [ ] Color contrast ratio 4.5:1 minimum on all text

## Task 17: Performance Optimization & Final PWA Polish
- [ ] Lazy-load room assets not needed for initial render
- [ ] Verify FCP < 2s on throttled 4G
- [ ] Verify bundle size < 5MB for first room
- [ ] Add frame rate monitoring with visual effects reduction fallback
- [ ] Final manifest validation against MS Store PWA Builder requirements
- [ ] Add screenshots to manifest for Store listing
