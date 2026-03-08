import { useEffect, useRef, useState, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';

const SCRUBS_REQUIRED = 35;
const FAST_THRESHOLD = 15;   // ≤15s → 2.0x
const SLOW_THRESHOLD = 30;   // ≥30s → 1.0x
const AUTO_CLOSE_MS = 2000;

export function RestorationModal() {
  const activeRestorationItemId = useGameStore((s) => s.activeRestorationItemId);
  const inventory = useGameStore((s) => s.inventory);
  const isTimerRunning = useGameStore((s) => s.isTimerRunning);
  const completeRestoration = useGameStore((s) => s.completeRestoration);
  const setActiveRestorationItem = useGameStore((s) => s.setActiveRestorationItem);

  const [scrubCount, setScrubCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [multiplier, setMultiplier] = useState(1.0);
  const [isDragging, setIsDragging] = useState(false);
  const startTimeRef = useRef(0);
  const modalRef = useRef<HTMLDivElement>(null);
  const completedRef = useRef(false);

  const item = activeRestorationItemId
    ? inventory.find((i) => i.id === activeRestorationItemId)
    : null;

  // Reset state when modal opens
  useEffect(() => {
    setScrubCount(0);
    setIsComplete(false);
    setMultiplier(1.0);
    setIsDragging(false);
    completedRef.current = false;
    if (activeRestorationItemId) {
      startTimeRef.current = Date.now();
    }
  }, [activeRestorationItemId]);

  // Focus + Escape + focus trap
  useEffect(() => {
    if (!activeRestorationItemId) return;
    modalRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveRestorationItem(null);
        return;
      }
      if (e.key === 'Tab') {
        const modal = modalRef.current;
        if (!modal) return;
        const focusable = modal.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [role="button"], [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeRestorationItemId, setActiveRestorationItem]);

  const calculateMultiplier = useCallback((elapsedSeconds: number): number => {
    if (elapsedSeconds <= FAST_THRESHOLD) return 2.0;
    if (elapsedSeconds >= SLOW_THRESHOLD) return 1.0;
    // Linear interpolation: 2.0 → 1.0 over 15s–30s
    return 2.0 - ((elapsedSeconds - FAST_THRESHOLD) / (SLOW_THRESHOLD - FAST_THRESHOLD));
  }, []);

  const finishRestoration = useCallback((mult: number) => {
    if (completedRef.current || !activeRestorationItemId) return;
    completedRef.current = true;
    const rounded = Math.round(mult * 100) / 100;
    setMultiplier(rounded);
    setIsComplete(true);
    completeRestoration(activeRestorationItemId, rounded);

    // Auto-close after delay
    setTimeout(() => setActiveRestorationItem(null), AUTO_CLOSE_MS);
  }, [activeRestorationItemId, completeRestoration, setActiveRestorationItem]);

  // Auto-complete if session timer expires while restoring
  useEffect(() => {
    if (!isTimerRunning && activeRestorationItemId && !completedRef.current) {
      // Proportional multiplier based on progress
      const progress = scrubCount / SCRUBS_REQUIRED;
      const proportional = 1.0 + progress; // 1.0 at 0%, up to 2.0 at 100%
      finishRestoration(Math.min(proportional, 2.0));
    }
  }, [isTimerRunning, activeRestorationItemId, scrubCount, finishRestoration]);

  const handleScrub = useCallback(() => {
    if (completedRef.current) return;
    setScrubCount((prev) => {
      const next = prev + 1;
      if (next >= SCRUBS_REQUIRED) {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        finishRestoration(calculateMultiplier(elapsed));
      }
      return next;
    });
  }, [calculateMultiplier, finishRestoration]);

  // Pointer move scrubbing (while button held)
  const handlePointerMove = useCallback(() => {
    if (isDragging && !completedRef.current) {
      handleScrub();
    }
  }, [isDragging, handleScrub]);

  if (!activeRestorationItemId || !item) return null;

  const progress = Math.min(scrubCount / SCRUBS_REQUIRED, 1);
  const progressPercent = Math.round(progress * 100);

  // CSS filter: starts fully dirty, cleans as progress increases
  const dirtyAmount = 1 - progress;
  const filterStyle = {
    filter: `sepia(${dirtyAmount * 0.8}) grayscale(${dirtyAmount * 0.6}) blur(${dirtyAmount * 2}px) brightness(${0.6 + progress * 0.4})`,
    transition: 'filter 0.15s ease-out',
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/70" role="dialog" aria-modal="true" aria-label="Item Restoration">
      <div
        ref={modalRef}
        tabIndex={-1}
        className="bg-[var(--color-surface)] rounded-lg max-w-md w-full mx-4 border border-white/10"
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs tracking-wider uppercase opacity-40 mb-1">Restoration</p>
              <h2 className="text-lg font-['Playfair_Display'] text-[var(--color-primary)]">{item.name}</h2>
            </div>
            <button
              onClick={() => setActiveRestorationItem(null)}
              className="text-xs opacity-40 hover:opacity-80 p-1"
              aria-label="Close restoration"
            >
              ✕
            </button>
          </div>
          <p className="text-xs opacity-40 mt-2">
            Scrub the item to restore it. Faster = higher multiplier.
            <span className="ml-2 font-mono">Value: ${item.finalAppraisalValue.toLocaleString()}</span>
          </p>
        </div>

        {/* Restoration area */}
        <div className="p-6">
          {!isComplete ? (
            <div className="flex flex-col items-center gap-4">
              {/* Scrub target — the "dirty" item */}
              <div
                className="relative w-40 h-40 rounded-lg bg-[#2a2a4e] border-2 border-white/10 overflow-hidden select-none cursor-grab active:cursor-grabbing"
                style={filterStyle}
                onPointerDown={() => { setIsDragging(true); handleScrub(); }}
                onPointerUp={() => setIsDragging(false)}
                onPointerLeave={() => setIsDragging(false)}
                onPointerMove={handlePointerMove}
                onClick={handleScrub}
                role="button"
                aria-label={`Scrub to restore. Progress: ${progressPercent}%`}
              >
                {/* Item visual — emoji placeholder since we don't have real images */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl">{progress < 0.5 ? '🏺' : '✨'}</span>
                  <span className="text-[10px] text-white/40 mt-2">{item.name}</span>
                </div>
                {/* Dirt overlay that fades */}
                <div
                  className="absolute inset-0 bg-gradient-to-br from-amber-900/60 to-stone-800/60 pointer-events-none"
                  style={{ opacity: dirtyAmount * 0.7, transition: 'opacity 0.15s' }}
                />
              </div>

              <p className="text-[10px] opacity-30">Click or drag across the item to clean it</p>

              {/* Progress bar */}
              <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-100"
                  style={{
                    width: `${progressPercent}%`,
                    background: progress < 0.5
                      ? 'linear-gradient(90deg, #92400e, #c9a227)'
                      : 'linear-gradient(90deg, #c9a227, #4ade80)',
                  }}
                  role="progressbar"
                  aria-valuenow={progressPercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
              <p className="text-xs opacity-40">{progressPercent}% restored</p>
            </div>
          ) : (
            <div className="text-center space-y-3 animate-[fadeIn_0.3s_ease-out]">
              <p className="text-4xl">✨</p>
              <p className="text-green-400 font-medium text-lg">Restoration Complete</p>
              <p className="text-sm opacity-60 font-mono">
                Multiplier: {multiplier.toFixed(2)}×
              </p>
              <p className="text-xs opacity-30">
                Final Value: ${Math.round(item.baseAppraisalValue * item.triviaMultiplier * multiplier).toLocaleString()}
              </p>
              <div className="w-12 h-px bg-[var(--color-primary)] mx-auto opacity-40" />
              <p className="text-[10px] opacity-20">Closing automatically…</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
