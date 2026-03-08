import { usePersistedStore } from '../store/persistedStore';

const audioCache = new Map<string, HTMLAudioElement>();

/** Play a one-shot sound effect from public/assets/audio/ */
export function playSfx(name: string, volume = 0.5) {
  if (usePersistedStore.getState().isMuted) return;

  let audio = audioCache.get(name);
  if (!audio) {
    audio = new Audio(`assets/audio/${name}.wav`);
    audioCache.set(name, audio);
  }
  audio.volume = volume;
  audio.currentTime = 0;
  audio.play().catch(() => {
    // Silently ignore — browser may block autoplay
  });
}
