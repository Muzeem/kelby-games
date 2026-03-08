import { useEffect, useRef, useState, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { playSfx } from '../utils/sfx';
import type { TriviaItem } from '../types/level';

interface ShuffledClaim extends TriviaItem {
  originalIndex: number;
}

export function TriviaModal() {
  const activeTriviaItemId = useGameStore((s) => s.activeTriviaItemId);
  const inventory = useGameStore((s) => s.inventory);
  const levelData = useGameStore((s) => s.levelData);
  const completeTrivia = useGameStore((s) => s.completeTrivia);
  const setActiveTriviaItem = useGameStore((s) => s.setActiveTriviaItem);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Find the inventory item and its trivia from levelData
  const inventoryItem = activeTriviaItemId
    ? inventory.find((i) => i.id === activeTriviaItemId)
    : null;

  const gameObject = activeTriviaItemId && levelData
    ? levelData.objects.find((o) => o.id === activeTriviaItemId)
    : null;

  // Shuffle trivia claims once per modal open
  const shuffledClaims = useMemo<ShuffledClaim[]>(() => {
    if (!gameObject) return [];
    const indexed = gameObject.trivia.map((t, i) => ({ ...t, originalIndex: i }));
    for (let i = indexed.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indexed[i], indexed[j]] = [indexed[j], indexed[i]];
    }
    return indexed;
  }, [gameObject]);

  // Reset state when modal opens/closes
  useEffect(() => {
    setSelectedIndex(null);
    setRevealed(false);
  }, [activeTriviaItemId]);

  // Focus trap + Escape to close
  useEffect(() => {
    if (!activeTriviaItemId) return;
    modalRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveTriviaItem(null);
        return;
      }
      // Trap focus within modal
      if (e.key === 'Tab') {
        const modal = modalRef.current;
        if (!modal) return;
        const focusable = modal.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [tabindex]:not([tabindex="-1"])',
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
  }, [activeTriviaItemId, setActiveTriviaItem]);

  // Don't render if no active item
  if (!activeTriviaItemId || !inventoryItem || !gameObject) return null;

  const handleSelect = (index: number) => {
    if (revealed) return;
    setSelectedIndex(index);
    setRevealed(true);

    const claim = shuffledClaims[index];
    // Player should pick the false one (isTrue === false)
    const success = !claim.isTrue;
    completeTrivia(activeTriviaItemId, success);

    if (success) playSfx('success');

    // Auto-close after 1.5 seconds
    setTimeout(() => {
      setActiveTriviaItem(null);
    }, 1500);
  };

  const getClaimStyle = (claim: ShuffledClaim, index: number) => {
    if (!revealed) {
      return 'bg-white/5 hover:bg-white/10 border-white/10 cursor-pointer';
    }
    const isLie = !claim.isTrue;
    if (index === selectedIndex) {
      return isLie
        ? 'bg-green-900/30 border-green-500/50'
        : 'bg-red-900/30 border-red-500/50';
    }
    if (isLie) {
      return 'bg-green-900/20 border-green-500/30';
    }
    return 'bg-white/3 border-white/5 opacity-50';
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/70" role="dialog" aria-modal="true" aria-label="Historical Research">
      <div
        ref={modalRef}
        tabIndex={-1}
        className="bg-[var(--color-surface)] rounded-lg max-w-lg w-full mx-4 border border-white/10 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs tracking-wider uppercase opacity-40 mb-1">Historical Research</p>
              <h2 className="text-lg font-['Playfair_Display'] text-[var(--color-primary)]">{inventoryItem.name}</h2>
            </div>
            <button
              onClick={() => setActiveTriviaItem(null)}
              className="text-xs opacity-40 hover:opacity-80 p-1"
              aria-label="Close research modal"
            >
              ✕
            </button>
          </div>
          <p className="text-xs opacity-40 mt-2">
            Identify the false claim to boost the appraisal value.
            <span className="ml-2 font-mono">Base: ${inventoryItem.baseAppraisalValue.toLocaleString()}</span>
          </p>
        </div>

        {/* Claims */}
        <div className="p-4 space-y-2">
          {shuffledClaims.map((claim, i) => (
            <button
              key={claim.originalIndex}
              onClick={() => handleSelect(i)}
              disabled={revealed}
              className={`w-full text-left p-3 rounded border transition-colors text-sm leading-relaxed ${getClaimStyle(claim, i)}`}
              aria-label={`Claim ${i + 1}: ${claim.statement}`}
            >
              <span className="text-[10px] opacity-30 mr-2">{i + 1}.</span>
              {claim.statement}
              {revealed && !claim.isTrue && (
                <span className="block text-[10px] text-green-400 mt-1">← This is the lie</span>
              )}
            </button>
          ))}
        </div>

        {/* Result */}
        {revealed && selectedIndex !== null && (
          <div className="p-4 border-t border-white/10">
            {!shuffledClaims[selectedIndex].isTrue ? (
              <div className="text-center">
                <p className="text-green-400 text-sm font-medium">Correct! You spotted the lie.</p>
                <p className="text-xs opacity-40 mt-1">Multiplier: 1.5× — Value: ${Math.round(inventoryItem.baseAppraisalValue * 1.5).toLocaleString()}</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-red-400 text-sm font-medium">That was actually true.</p>
                <p className="text-xs opacity-40 mt-1">Multiplier: 1.0× — Value: ${inventoryItem.baseAppraisalValue.toLocaleString()}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
