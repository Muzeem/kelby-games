import type { ManifestObject } from '../types/manifest';

export type BridgeEvents = {
  objectDiscovered: { objectId: string; manifestData: ManifestObject };
  roomCleared: { roomNumber: number };
  hintRequested: Record<string, never>;
  hintHighlight: { objectId: string };
  missClick: { x: number; y: number };
};

type Listener<T> = (data: T) => void;

class CanvasEventBridge {
  private listeners = new Map<string, Set<Listener<unknown>>>();

  on<K extends keyof BridgeEvents>(event: K, cb: Listener<BridgeEvents[K]>): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    const set = this.listeners.get(event)!;
    set.add(cb as Listener<unknown>);
    return () => set.delete(cb as Listener<unknown>);
  }

  emit<K extends keyof BridgeEvents>(event: K, data: BridgeEvents[K]): void {
    this.listeners.get(event)?.forEach((cb) => cb(data));
  }

  off<K extends keyof BridgeEvents>(event: K, cb: Listener<BridgeEvents[K]>): void {
    this.listeners.get(event)?.delete(cb as Listener<unknown>);
  }
}

export const bridge = new CanvasEventBridge();
