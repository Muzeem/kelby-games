import { useGameStore, type InventoryItem } from '../store/gameStore';

export function InventoryPanel() {
  const inventory = useGameStore((s) => s.inventory);
  const totalAppraisalValue = useGameStore((s) => s.totalAppraisalValue);
  const setActiveTriviaItem = useGameStore((s) => s.setActiveTriviaItem);
  const setActiveRestorationItem = useGameStore((s) => s.setActiveRestorationItem);

  const handleClick = (item: InventoryItem) => {
    if (item.status === 'discovered') {
      setActiveTriviaItem(item.id);
    } else if (item.status === 'researched') {
      setActiveRestorationItem(item.id);
    }
  };

  return (
    <>
      {/* Desktop — pinned right */}
      <aside className="w-64 bg-[var(--color-surface)] border-l border-white/10 shrink-0 hidden md:flex md:flex-col">
        <div className="p-3 border-b border-white/10">
          <h2 className="text-xs font-semibold tracking-wider uppercase text-[var(--color-primary)]">Inventory</h2>
          <p className="text-[10px] opacity-30 mt-1">{inventory.length} item{inventory.length !== 1 ? 's' : ''} found</p>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {inventory.length === 0 ? (
            <p className="text-xs opacity-20 text-center mt-8 px-4 leading-relaxed">
              Click on hidden objects in the scene to discover them.
            </p>
          ) : (
            <ul className="flex flex-col gap-1.5" role="list" aria-label="Discovered items" aria-live="polite">
              {inventory.map((item) => (
                <InventoryRow key={item.id} item={item} onClick={() => handleClick(item)} />
              ))}
            </ul>
          )}
        </div>
      </aside>

      {/* Mobile — pinned bottom */}
      <div className="md:hidden shrink-0 bg-[var(--color-surface)] border-t border-white/10 p-2">
        <div className="flex items-center justify-between px-2">
          <span className="text-xs text-[var(--color-primary)]">
            {inventory.length} item{inventory.length !== 1 ? 's' : ''}
          </span>
          <span className="text-xs font-mono text-[var(--color-primary)]">
            ${totalAppraisalValue.toLocaleString()}
          </span>
        </div>
      </div>
    </>
  );
}

function InventoryRow({ item, onClick }: { item: InventoryItem; onClick: () => void }) {
  const isComplete = item.status === 'restored';
  const needsResearch = item.status === 'discovered';
  const needsRestoration = item.status === 'researched';

  return (
    <li
      onClick={isComplete ? undefined : onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' && !isComplete) onClick(); }}
      className={`p-2.5 rounded transition-colors ${
        isComplete
          ? 'bg-green-900/10 opacity-60'
          : needsResearch
            ? 'bg-amber-900/15 hover:bg-amber-900/25 cursor-pointer border border-[var(--color-primary)]/20'
            : needsRestoration
              ? 'bg-blue-900/15 hover:bg-blue-900/25 cursor-pointer border border-blue-400/20'
              : 'bg-white/5 hover:bg-white/10 cursor-pointer'
      }`}
      role="button"
      tabIndex={0}
      aria-label={`${item.name} - ${item.status}. ${
        needsResearch ? 'Click to research' :
        needsRestoration ? 'Click to restore' :
        'Fully restored'
      }`}
    >
      <div className="flex justify-between items-start">
        <span className="text-xs font-medium leading-tight">{item.name}</span>
        <span className="text-[10px] font-mono text-[var(--color-primary)]">
          ${item.finalAppraisalValue.toLocaleString()}
        </span>
      </div>
      <div className="flex items-center gap-2 mt-1">
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
          isComplete ? 'bg-green-900/40 text-green-300' :
          needsRestoration ? 'bg-blue-900/40 text-blue-300' :
          'bg-amber-900/40 text-amber-300'
        }`}>{item.status}</span>
        <span className="text-[10px] opacity-20">Room {item.roomNumber}</span>
        {needsResearch && <span className="text-[10px] text-[var(--color-primary)] ml-auto animate-pulse">Research →</span>}
        {needsRestoration && <span className="text-[10px] text-blue-300 ml-auto animate-pulse">Restore ✨</span>}
        {isComplete && <span className="text-[10px] text-green-400 ml-auto">✓ Done</span>}
      </div>
    </li>
  );
}
