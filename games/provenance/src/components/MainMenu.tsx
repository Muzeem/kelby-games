import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { usePersistedStore } from '../store/persistedStore';

export function MainMenu() {
  const navigate = useNavigate();
  const fetchLevelData = useGameStore((s) => s.fetchLevelData);
  const startNewGame = useGameStore((s) => s.startNewGame);
  const levelError = useGameStore((s) => s.levelError);
  const highScores = usePersistedStore((s) => s.highScores);
  const topScore = highScores.length > 0 ? highScores[0].score : 0;
  const [isLoading, setIsLoading] = useState(false);

  const handleNewGame = async () => {
    setIsLoading(true);
    await fetchLevelData('level_1');
    // Check if fetch succeeded (levelData will be set, phase will be 'loading')
    const { levelData, levelError: err } = useGameStore.getState();
    if (levelData && !err) {
      startNewGame();
      navigate('/play');
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-8 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, #c9a227 0%, transparent 50%), radial-gradient(circle at 80% 20%, #c9a227 0%, transparent 40%)',
        }}
      />

      {/* Logo area */}
      <div className="relative z-10 text-center mb-4">
        <p className="text-xs tracking-[0.3em] uppercase opacity-40 mb-2">Kelby Games presents</p>
        <h1 className="text-5xl md:text-7xl font-['Playfair_Display'] font-bold text-[var(--color-primary)] leading-none">
          Provenance
        </h1>
        <div className="w-24 h-px bg-[var(--color-primary)] mx-auto my-3 opacity-40" />
        <p className="text-base md:text-lg opacity-60 font-light tracking-widest uppercase">
          The Hidden History
        </p>
      </div>

      {/* Tagline */}
      <p className="text-sm opacity-40 max-w-md text-center leading-relaxed relative z-10">
        Discover forgotten antiques. Research their secrets. Restore their glory. Auction for the highest score.
      </p>

      {topScore > 0 && (
        <p className="text-xs opacity-30 relative z-10 font-mono">Best: ${topScore.toLocaleString()}</p>
      )}

      {/* Menu buttons */}
      <nav className="flex flex-col gap-3 mt-6 w-72 relative z-10" aria-label="Main menu">
        <button onClick={handleNewGame} disabled={isLoading} className="menu-btn-primary disabled:opacity-50">
          {isLoading ? 'Loading…' : 'New Game'}
        </button>
        {levelError && (
          <p className="text-xs text-red-400 text-center" role="alert">{levelError}</p>
        )}
        <button onClick={() => navigate('/scores')} className="menu-btn">
          High Scores
        </button>
        <button onClick={() => navigate('/settings')} className="menu-btn">
          Settings
        </button>
      </nav>

      {/* Portal link */}
      <a
        href="https://kelby.in"
        target="_blank"
        rel="noopener noreferrer"
        className="relative z-10 mt-8 text-xs opacity-30 hover:opacity-60 transition-opacity"
      >
        kelby.in ↗
      </a>
    </div>
  );
}
