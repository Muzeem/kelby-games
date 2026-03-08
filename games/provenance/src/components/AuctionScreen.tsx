import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { usePersistedStore, qualifiesForHighScore } from '../store/persistedStore';

const REVEAL_DELAY_MS = 500;

export function AuctionScreen() {
  const navigate = useNavigate();
  const inventory = useGameStore((s) => s.inventory);
  const currentScore = useGameStore((s) => s.currentScore);
  const totalAppraisalValue = useGameStore((s) => s.totalAppraisalValue);
  const startNewGame = useGameStore((s) => s.startNewGame);
  const fetchLevelData = useGameStore((s) => s.fetchLevelData);
  const setPhase = useGameStore((s) => s.setPhase);
  const saveHighScore = usePersistedStore((s) => s.saveHighScore);

  const [revealedCount, setRevealedCount] = useState(0);
  const [runningTotal, setRunningTotal] = useState(0);
  const [showTotal, setShowTotal] = useState(false);
  const [initials, setInitials] = useState('');
  const [scoreSaved, setScoreSaved] = useState(false);
  const revealStarted = useRef(false);

  const finalScore = currentScore || totalAppraisalValue;
  const isHighScore = qualifiesForHighScore(finalScore);

  // Sequential reveal animation
  useEffect(() => {
    if (revealStarted.current) return;
    revealStarted.current = true;

    if (inventory.length === 0) {
      setShowTotal(true);
      return;
    }
  }, [inventory]);

  useEffect(() => {
    if (inventory.length === 0) return;
    if (revealedCount < inventory.length) {
      const timer = setTimeout(() => {
        setRunningTotal((prev) => prev + inventory[revealedCount].finalAppraisalValue);
        setRevealedCount((prev) => prev + 1);
      }, REVEAL_DELAY_MS);
      return () => clearTimeout(timer);
    } else if (!showTotal) {
      const timer = setTimeout(() => setShowTotal(true), 600);
      return () => clearTimeout(timer);
    }
  }, [revealedCount, inventory, showTotal]);

  const handleSaveScore = () => {
    if (scoreSaved || !initials.trim()) return;
    saveHighScore(initials.trim(), finalScore);
    setScoreSaved(true);
  };

  const handlePlayAgain = async () => {
    await fetchLevelData('level_1');
    startNewGame();
    navigate('/play');
  };

  return (
    <div className="flex flex-col items-center h-full overflow-y-auto">
      {/* Header */}
      <div className="text-center py-8 px-4">
        <p className="text-xs tracking-[0.3em] uppercase opacity-40 mb-2">Final Appraisal</p>
        <h1 className="text-4xl md:text-5xl font-['Playfair_Display'] font-bold text-[var(--color-primary)]">
          The Grand Auction
        </h1>
        {showTotal && isHighScore && finalScore > 0 && !scoreSaved && (
          <p className="text-sm text-amber-400 mt-2 animate-pulse">★ New High Score ★</p>
        )}
      </div>

      {/* Itemized receipt */}
      <div className="w-full max-w-2xl px-4 mb-6">
        {/* Table header */}
        <div className="flex items-center px-3 py-2 text-[10px] uppercase tracking-wider opacity-30 border-b border-white/10">
          <span className="flex-1">Item</span>
          <span className="w-16 text-right">Base</span>
          <span className="w-16 text-right">Trivia</span>
          <span className="w-16 text-right">Restore</span>
          <span className="w-20 text-right">Final</span>
        </div>

        {/* Items */}
        <div className="space-y-0.5">
          {inventory.map((item, i) => {
            const isRevealed = i < revealedCount;
            const isJustRevealed = i === revealedCount - 1;

            return (
              <div
                key={item.id}
                className={`flex items-center px-3 py-2.5 rounded transition-all duration-500 ${
                  isRevealed
                    ? isJustRevealed
                      ? 'opacity-100 bg-[var(--color-primary)]/5 translate-y-0'
                      : 'opacity-100 bg-[var(--color-surface)] translate-y-0'
                    : 'opacity-0 translate-y-3'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    item.status === 'restored' ? 'bg-green-900/40 text-green-300' :
                    item.status === 'researched' ? 'bg-blue-900/40 text-blue-300' :
                    'bg-white/10 text-white/50'
                  }`}>{item.status}</span>
                </div>
                <span className="w-16 text-right text-xs font-mono opacity-50">
                  ${item.baseAppraisalValue.toLocaleString()}
                </span>
                <span className={`w-16 text-right text-xs font-mono ${item.triviaMultiplier > 1 ? 'text-green-400' : 'opacity-40'}`}>
                  ×{item.triviaMultiplier.toFixed(1)}
                </span>
                <span className={`w-16 text-right text-xs font-mono ${item.restorationMultiplier > 1 ? 'text-blue-400' : 'opacity-40'}`}>
                  ×{item.restorationMultiplier.toFixed(1)}
                </span>
                <span className={`w-20 text-right text-sm font-mono transition-colors duration-300 ${
                  isJustRevealed ? 'text-[var(--color-primary)]' : 'text-[var(--color-primary)]/70'
                }`}>
                  ${item.finalAppraisalValue.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>

        {inventory.length === 0 && (
          <p className="text-sm opacity-30 text-center py-8">No items were discovered this session.</p>
        )}
      </div>

      {/* Grand total */}
      <div className={`border-t border-white/10 w-full max-w-2xl px-4 py-6 text-center transition-all duration-500 ${showTotal ? 'opacity-100' : 'opacity-60'}`}>
        <p className="text-xs opacity-40 uppercase tracking-wider mb-1">Grand Total</p>
        <p className={`font-['Playfair_Display'] font-bold text-[var(--color-primary)] transition-all duration-500 ${showTotal ? 'text-4xl' : 'text-2xl'}`}>
          ${(showTotal ? finalScore : runningTotal).toLocaleString()}
        </p>
      </div>

      {/* High score entry */}
      {showTotal && isHighScore && finalScore > 0 && (
        <div className={`w-full max-w-sm px-4 mb-6 transition-all duration-500 ${scoreSaved ? 'opacity-60' : 'opacity-100'}`}>
          {!scoreSaved ? (
            <div className="bg-[var(--color-surface)] rounded-lg p-4 border border-[var(--color-primary)]/20">
              <p className="text-xs text-center opacity-40 mb-3">Enter your initials for the leaderboard</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={3}
                  value={initials}
                  onChange={(e) => setInitials(e.target.value.replace(/[^a-zA-Z]/g, ''))}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSaveScore(); }}
                  placeholder="AAA"
                  className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-center text-lg font-mono uppercase tracking-[0.5em] text-[var(--color-primary)] placeholder:opacity-20 focus:outline-none focus:border-[var(--color-primary)]/50"
                  autoFocus
                  aria-label="Enter 3-letter initials"
                />
                <button
                  onClick={handleSaveScore}
                  disabled={!initials.trim()}
                  className="menu-btn-primary px-6 disabled:opacity-30"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <p className="text-center text-sm text-green-400">Score saved as {initials.slice(0, 3).toUpperCase()}</p>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className={`flex gap-3 pb-8 transition-all duration-500 ${showTotal ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <button onClick={handlePlayAgain} className="menu-btn-primary">
          Play Again
        </button>
        <button onClick={() => navigate('/scores')} className="menu-btn">
          High Scores
        </button>
        <button onClick={() => { setPhase('menu'); navigate('/'); }} className="menu-btn">
          Main Menu
        </button>
      </div>
    </div>
  );
}
