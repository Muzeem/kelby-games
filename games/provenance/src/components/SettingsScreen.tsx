import { useNavigate } from 'react-router-dom';
import { usePersistedStore } from '../store/persistedStore';

export function SettingsScreen() {
  const navigate = useNavigate();
  const isMuted = usePersistedStore((s) => s.isMuted);
  const toggleMute = usePersistedStore((s) => s.toggleMute);
  const clearData = usePersistedStore((s) => s.clearData);

  return (
    <div className="flex flex-col items-center h-full p-8 gap-6">
      <h1 className="text-3xl font-['Playfair_Display'] text-[var(--color-primary)]">Settings</h1>

      <div className="w-full max-w-sm space-y-4 mt-8">
        <div className="flex justify-between items-center p-3 rounded bg-[var(--color-surface)]">
          <span>Audio</span>
          <button
            onClick={toggleMute}
            className="px-4 py-1 rounded text-sm bg-white/10 hover:bg-white/20 transition-colors"
            aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
          >
            {isMuted ? '🔇 Muted' : '🔊 On'}
          </button>
        </div>

        <div className="flex justify-between items-center p-3 rounded bg-[var(--color-surface)]">
          <span>Clear All Data</span>
          <button
            onClick={() => { if (confirm('Clear all saved data?')) clearData(); }}
            className="px-4 py-1 rounded text-sm bg-red-900/40 hover:bg-red-900/60 transition-colors text-red-300"
          >
            Clear
          </button>
        </div>
      </div>

      <button onClick={() => navigate('/')} className="menu-btn mt-8">Back</button>
    </div>
  );
}
