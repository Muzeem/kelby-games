import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { useGameStore } from '../store/gameStore';
import { createGameConfig } from '../phaser/gameConfig';
import { MainScene } from '../phaser/scenes/MainScene';
import { bridge } from '../bridge/canvasEventBridge';

export function PhaserContainer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<MainScene | null>(null);
  const levelData = useGameStore((s) => s.levelData);
  const isTimerRunning = useGameStore((s) => s.isTimerRunning);

  // ── Boot Phaser & launch MainScene when levelData is available ──
  useEffect(() => {
    if (!containerRef.current || !levelData) return;

    const config = createGameConfig(containerRef.current);
    const game = new Phaser.Game(config);
    gameRef.current = game;

    // Wait for Phaser to be ready, then start MainScene with level data
    game.events.once('ready', () => {
      const scene = new MainScene();
      game.scene.add('MainScene', scene, true, { levelData });
      sceneRef.current = scene;
    });

    // CRITICAL: destroy on unmount / hot-reload to prevent duplicates
    return () => {
      game.destroy(true);
      gameRef.current = null;
      sceneRef.current = null;
    };
  }, [levelData]);

  // ── Stop input when timer expires ──
  useEffect(() => {
    if (!isTimerRunning && sceneRef.current) {
      sceneRef.current.stopInput();
    }
  }, [isTimerRunning]);

  // ── Handle hint requests from HUD ──
  useEffect(() => {
    const unsub = bridge.on('hintRequested', () => {
      sceneRef.current?.highlightHint();
    });
    return unsub;
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ minHeight: '300px' }}
    />
  );
}
