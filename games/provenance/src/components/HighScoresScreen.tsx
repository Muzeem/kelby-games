import { useNavigate } from 'react-router-dom';
import { usePersistedStore } from '../store/persistedStore';

export function HighScoresScreen() {
  const navigate = useNavigate();
  const highScores = usePersistedStore((s) => s.highScores);

  return (
    <div className="flex flex-col items-center h-full p-8">
      <h1 className="text-3xl font-['Playfair_Display'] text-[var(--color-primary)] mb-8">High Scores</h1>

      {highScores.length === 0 ? (
        <p className="opacity-40">No scores yet. Play a game first.</p>
      ) : (
        <ol className="w-full max-w-md space-y-2">
          {highScores.map((entry, i) => (
            <li key={i} className="flex items-center justify-between p-3 rounded bg-[var(--color-surface)]">
              <span className="text-sm opacity-50 w-8">#{i + 1}</span>
              <span className="text-sm font-mono uppercase tracking-wider w-12 text-center">{entry.name || '???'}</span>
              <span className="flex-1 text-right font-mono text-[var(--color-primary)]">${entry.score.toLocaleString()}</span>
              <span className="text-xs opacity-40 w-24 text-right">{new Date(entry.date).toLocaleDateString()}</span>
            </li>
          ))}
        </ol>
      )}

      <button onClick={() => navigate('/')} className="menu-btn mt-8">Back</button>
    </div>
  );
}
