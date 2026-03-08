import { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { PhaserContainer } from './PhaserContainer';
import { InventoryPanel } from './InventoryPanel';
import { TriviaModal } from './TriviaModal';
import { RestorationModal } from './RestorationModal';
import { loadManifest, ManifestLoadError } from '../utils/manifestLoader';
import { bridge } from '../bridge/canvasEventBridge';
import type { LevelManifest } from '../types/manifest';
import { levelDataToManifest } from '../utils/levelAdapter';

export function GameScreen() {
  const navigate = useNavigate();
  const phase = useGameStore((s) => s.phase);
  const currentRoom = useGameStore((s) => s.currentRoom);
  const timeRemaining = useGameStore((s) => s.timeRemaining);
  const hintsRemaining = useGameStore((s) => s.hintsRemaining);
  const totalAppraisalValue = useGameStore((s) => s.totalAppraisalValue);
  const levelData = useGameStore((s) => s.levelData);
  const tickTimer = useGameStore((s) => s.tickTimer);
  const setPhase = useGameStore((s) => s.setPhase);
  const useHint = useGameStore((s) => s.useHint);
  const endGame = useGameStore((s) => s.endGame);

  const [manifest, setManifest] = useState<LevelManifest | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [roomTransition, setRoomTransition] = useState<number | null>(null);
  const prevRoomRef = useRef(currentRoom);

  // Convert store levelData to internal manifest format, or fall back to legacy loader
  const levelManifestFromStore = useMemo(
    () => (levelData ? levelDataToManifest(levelData) : null),
    [levelData],
  );

  useEffect(() => {
    if (levelManifestFromStore) {
      setManifest(levelManifestFromStore);
      return;
    }
    // Fallback: load legacy 3-room manifest
    loadManifest()
      .then(setManifest)
      .catch((err) => {
        const msg = err instanceof ManifestLoadError ? err.message : 'Failed to load game data';
        setLoadError(msg);
      });
  }, [levelManifestFromStore]);

  useEffect(() => {
    if (phase === 'auction') navigate('/auction');
    if (phase === 'menu') navigate('/');
  }, [phase, navigate]);

  // Room transition overlay
  useEffect(() => {
    if (currentRoom !== prevRoomRef.current && manifest) {
      setRoomTransition(currentRoom);
      const timer = setTimeout(() => setRoomTransition(null), 2500);
      prevRoomRef.current = currentRoom;
      return () => clearTimeout(timer);
    }
  }, [currentRoom, manifest]);

  useEffect(() => {
    if (phase !== 'playing') return;
    const interval = setInterval(tickTimer, 1000);
    return () => clearInterval(interval);
  }, [phase, tickTimer]);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const timerDisplay = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isWarning = timeRemaining <= 60;
  const isUrgent = timeRemaining <= 10;
  const currentRoomManifest = manifest ? manifest.rooms[currentRoom - 1] : null;

  const handleQuit = () => { setPhase('menu'); navigate('/'); };

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center" role="alert">
        <p className="text-lg text-red-400">Failed to load game data</p>
        <p className="text-sm opacity-50 max-w-md">{loadError}</p>
        <div className="flex gap-3 mt-4">
          <button onClick={() => { setLoadError(null); loadManifest().then(setManifest).catch(() => setLoadError('Retry failed')); }} className="menu-btn">Retry</button>
          <button onClick={() => { setPhase('menu'); navigate('/'); }} className="menu-btn">Main Menu</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* HUD */}
      <header className="flex items-center justify-between px-4 py-2 bg-[var(--color-surface)] border-b border-white/10 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => setShowQuitConfirm(true)} className="text-xs opacity-40 hover:opacity-80 transition-opacity" aria-label="Return to main menu">← Menu</button>
          <div className="h-4 w-px bg-white/10" />
          <span className="text-sm font-medium text-[var(--color-primary)]">Room {currentRoom}<span className="opacity-40 font-normal">/3</span></span>
          {currentRoomManifest && <span className="text-xs opacity-30 hidden sm:inline">{currentRoomManifest.name}</span>}
        </div>
        <div className={`font-mono text-lg font-bold tracking-wider ${isUrgent ? 'text-red-400 animate-pulse' : isWarning ? 'text-amber-400' : 'text-[var(--color-primary)]'}`} role="timer" aria-label={`${minutes} minutes ${seconds} seconds remaining`}>
          {timerDisplay}
        </div>
        <div className="flex items-center gap-4">
          <button className="text-xs px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-20" disabled={hintsRemaining <= 0} onClick={() => { useHint(); bridge.emit('hintRequested', {}); }} aria-label={`Use hint. ${hintsRemaining} hints remaining`}>
            💡 {hintsRemaining}
          </button>
          <button className="text-[10px] px-2 py-1 rounded bg-red-900/30 hover:bg-red-900/50 text-red-300 transition-colors opacity-50 hover:opacity-100" onClick={() => endGame()} aria-label="End game and go to auction (debug)">
            🏁 End
          </button>
          <div className="text-sm">
            <span className="opacity-50">$</span>
            <span className="text-[var(--color-primary)] font-mono">{totalAppraisalValue.toLocaleString()}</span>
          </div>
        </div>
      </header>

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden relative">
        <div className="flex-1 relative bg-[#0d0d1a]">
          <PhaserContainer />
        </div>

        {/* Inventory — desktop + mobile */}
        <InventoryPanel />
      </div>

      {/* Modals */}
      <TriviaModal />
      <RestorationModal />

      {/* Room transition overlay */}
      {roomTransition && manifest && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 animate-[fadeIn_0.3s_ease-out]">
          <div className="text-center animate-[fadeIn_0.5s_ease-out]">
            <p className="text-xs tracking-[0.3em] uppercase opacity-40 mb-2">Entering</p>
            <h2 className="text-3xl md:text-4xl font-['Playfair_Display'] font-bold text-[var(--color-primary)]">
              Room {roomTransition}
            </h2>
            <p className="text-sm opacity-50 mt-2">{manifest.rooms[roomTransition - 1].name}</p>
            <p className="text-xs opacity-30 mt-1">{manifest.rooms[roomTransition - 1].objects.length} objects to find</p>
            <div className="w-12 h-px bg-[var(--color-primary)] mx-auto mt-4 opacity-40" />
          </div>
        </div>
      )}

      {showQuitConfirm && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60" role="dialog" aria-modal="true">
          <div className="bg-[var(--color-surface)] rounded-lg p-6 max-w-sm mx-4 border border-white/10">
            <p className="text-sm mb-4">Abandon this session? Your progress will be lost.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowQuitConfirm(false)} className="px-4 py-2 text-sm rounded bg-white/5 hover:bg-white/10 transition-colors">Continue Playing</button>
              <button onClick={handleQuit} className="px-4 py-2 text-sm rounded bg-red-900/40 hover:bg-red-900/60 text-red-300 transition-colors">Quit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
