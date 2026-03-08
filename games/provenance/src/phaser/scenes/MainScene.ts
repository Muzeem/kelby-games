import Phaser from 'phaser';
import type { LevelData, GameObject } from '../../types/level';
import { useGameStore } from '../../store/gameStore';
import { usePersistedStore } from '../../store/persistedStore';

const DESIGN_WIDTH = 1024;
const DESIGN_HEIGHT = 600;
const DISCOVERY_GLOW_DURATION = 800;
const MISS_RIPPLE_DURATION = 400;

/**
 * MainScene — the primary gameplay scene.
 *
 * Receives LevelData via scene init data, renders the background,
 * creates interactive hitbox zones for each object, and bridges
 * clicks directly into the Zustand store.
 */
export class MainScene extends Phaser.Scene {
  private levelData!: LevelData;
  private sprites: Map<string, Phaser.GameObjects.Image | Phaser.GameObjects.Zone> = new Map();

  // Audio
  private bgm?: Phaser.Sound.BaseSound;
  private muteUnsub?: () => void;

  // Coordinate mapping
  private sceneScale = 1;
  private offsetX = 0;
  private offsetY = 0;

  constructor() {
    super({ key: 'MainScene' });
  }

  init(data: { levelData: LevelData }) {
    this.levelData = data.levelData;
    this.sprites.clear();
  }

  preload() {
    const bgUrl = this.levelData.backgroundUrl;
    this.load.image('level-bg', bgUrl);

    // Dynamically load object sprites
    for (const obj of this.levelData.objects) {
      if (obj.imageUrl) {
        this.load.image(obj.id, obj.imageUrl);
      }
    }

    // Audio assets
    this.load.audio('bgm', 'assets/audio/bgm.wav');
    this.load.audio('discover', 'assets/audio/discover.wav');
    this.load.audio('success', 'assets/audio/success.wav');

    // Gracefully handle missing assets
    this.load.on('loaderror', (file: Phaser.Loader.File) => {
      console.warn(`[MainScene] Asset not found: ${file.key}, using fallback`);
    });
  }

  create() {
    this.calculateScale();
    this.renderBackground();
    this.createObjectSprites();
    this.setupMissClickFeedback();
    this.setupAudio();

    // Re-layout on resize
    this.scale.on('resize', () => {
      this.calculateScale();
      this.rebuildScene();
    });
  }

  // ── Audio ───────────────────────────────────────────────────

  private setupAudio() {
    const isMuted = usePersistedStore.getState().isMuted;
    this.sound.mute = isMuted;

    // Start BGM loop
    if (this.cache.audio.exists('bgm')) {
      this.bgm = this.sound.add('bgm', { loop: true, volume: 0.3 });
      if (!isMuted) this.bgm.play();
    }

    // Subscribe to mute changes from React
    let prevMuted = isMuted;
    this.muteUnsub = usePersistedStore.subscribe((state) => {
      if (state.isMuted !== prevMuted) {
        prevMuted = state.isMuted;
        this.sound.mute = state.isMuted;
        if (this.bgm) {
          if (state.isMuted && this.bgm.isPlaying) this.bgm.pause();
          else if (!state.isMuted && this.bgm.isPaused) this.bgm.resume();
          else if (!state.isMuted && !this.bgm.isPlaying) this.bgm.play();
        }
      }
    });
  }

  /** Play a one-shot SFX if audio is available and not muted */
  private playSfx(key: string) {
    if (!this.cache.audio.exists(key)) return;
    if (usePersistedStore.getState().isMuted) return;
    this.sound.play(key, { volume: 0.5 });
  }

  shutdown() {
    this.muteUnsub?.();
    this.bgm?.stop();
  }

  destroy() {
    this.muteUnsub?.();
    this.bgm?.stop();
  }

  // ── Coordinate mapping ──────────────────────────────────────

  private calculateScale() {
    const w = this.scale.width;
    const h = this.scale.height;
    this.sceneScale = Math.min(w / DESIGN_WIDTH, h / DESIGN_HEIGHT);
    this.offsetX = (w - DESIGN_WIDTH * this.sceneScale) / 2;
    this.offsetY = (h - DESIGN_HEIGHT * this.sceneScale) / 2;
  }

  private toScreenX(designX: number): number {
    return this.offsetX + designX * this.sceneScale;
  }

  private toScreenY(designY: number): number {
    return this.offsetY + designY * this.sceneScale;
  }

  // ── Background ──────────────────────────────────────────────

  private renderBackground() {
    const w = this.scale.width;
    const h = this.scale.height;
    const bgW = DESIGN_WIDTH * this.sceneScale;
    const bgH = DESIGN_HEIGHT * this.sceneScale;

    if (this.textures.exists('level-bg') && this.textures.get('level-bg').key !== '__MISSING') {
      const bg = this.add.image(w / 2, h / 2, 'level-bg');
      bg.setDisplaySize(bgW, bgH);
      bg.setName('background');
    } else {
      this.renderPlaceholderBackground(bgW, bgH);
    }
  }

  private renderPlaceholderBackground(bgW: number, bgH: number) {
    const w = this.scale.width;
    const h = this.scale.height;

    const bg = this.add.rectangle(w / 2, h / 2, bgW, bgH, 0x1a1a2e);
    bg.setStrokeStyle(1, 0xc9a227, 0.3);
    bg.setName('background');

    // Room title
    this.add.text(w / 2, this.offsetY + 30 * this.sceneScale, this.levelData.name, {
      fontFamily: 'Playfair Display, serif',
      fontSize: `${Math.floor(24 * this.sceneScale)}px`,
      color: '#c9a227',
      align: 'center',
    }).setOrigin(0.5, 0.5).setAlpha(0.4);

    // Subtle grid
    const gfx = this.add.graphics();
    gfx.lineStyle(1, 0xffffff, 0.03);
    const step = 60 * this.sceneScale;
    for (let x = this.offsetX; x < this.offsetX + bgW; x += step) {
      gfx.lineBetween(x, this.offsetY, x, this.offsetY + bgH);
    }
    for (let y = this.offsetY; y < this.offsetY + bgH; y += step) {
      gfx.lineBetween(this.offsetX, y, this.offsetX + bgW, y);
    }
  }

  // ── Object sprites / hitboxes ────────────────────────────────

  private createObjectSprites() {
    for (const obj of this.levelData.objects) {
      const { x, y, width, height } = obj.hitbox;
      const sx = this.toScreenX(x + width / 2);
      const sy = this.toScreenY(y + height / 2);
      const sw = width * this.sceneScale;
      const sh = height * this.sceneScale;

      const hasTexture = obj.imageUrl &&
        this.textures.exists(obj.id) &&
        this.textures.get(obj.id).key !== '__MISSING';

      if (hasTexture) {
        // Real sprite
        const sprite = this.add.image(sx, sy, obj.id);
        sprite.setOrigin(0.5, 0.5);

        // Scale to fit within the hitbox while preserving aspect ratio
        const texW = sprite.width;
        const texH = sprite.height;
        const fitScale = Math.min(sw / texW, sh / texH);
        sprite.setScale(fitScale);

        sprite.setInteractive({ useHandCursor: true });
        sprite.setName(`sprite-${obj.id}`);
        sprite.on('pointerdown', () => this.handleObjectClick(obj, sprite));
        this.sprites.set(obj.id, sprite);
      } else {
        // Fallback: invisible zone with placeholder visuals
        const zone = this.add.zone(sx, sy, sw, sh).setInteractive({ useHandCursor: true });
        zone.setName(`zone-${obj.id}`);

        const outline = this.add.graphics();
        outline.lineStyle(1, 0xc9a227, 0.15);
        outline.strokeRect(sx - sw / 2, sy - sh / 2, sw, sh);

        this.add.text(sx, sy, '?', {
          fontSize: `${Math.floor(Math.min(sw, sh) * 0.5)}px`,
          color: '#c9a227',
          align: 'center',
        }).setOrigin(0.5, 0.5).setAlpha(0.3).setName(`label-${obj.id}`);

        zone.on('pointerdown', () => this.handleObjectClick(obj, zone));
        this.sprites.set(obj.id, zone);
      }
    }
  }

  // ── Click handling (Phaser → Zustand) ───────────────────────

  private handleObjectClick(obj: GameObject, target: Phaser.GameObjects.Image | Phaser.GameObjects.Zone) {
    const store = useGameStore.getState();

    // Already discovered? Ignore.
    if (store.discoveredItems.includes(obj.id)) return;

    // Call the store action directly — this is the magic bridge.
    store.discoverObject(
      obj.id,
      {
        id: obj.id,
        name: obj.name,
        imageUrl: obj.imageUrl ?? '',
        x: obj.hitbox.x,
        y: obj.hitbox.y,
        width: obj.hitbox.width,
        height: obj.hitbox.height,
        baseAppraisalValue: obj.baseValue,
        trivia: {
          claims: obj.trivia.map((t) => ({
            text: t.statement,
            isFalse: !t.isTrue,
          })) as [
            { text: string; isFalse: boolean },
            { text: string; isFalse: boolean },
            { text: string; isFalse: boolean },
          ],
        },
      },
      1, // Room 1 for single-level data
    );

    // Visual feedback
    this.showDiscoveryFeedback(obj, target);

    // Audio feedback
    this.playSfx('discover');
  }

  // ── Visual feedback ─────────────────────────────────────────

  private showDiscoveryFeedback(obj: GameObject, target: Phaser.GameObjects.Image | Phaser.GameObjects.Zone) {
    const sx = target.x;
    const sy = target.y;
    const isSprite = target instanceof Phaser.GameObjects.Image;

    // Disable further clicks
    target.disableInteractive();

    if (isSprite) {
      // Pop-scale tween on the real sprite
      const origScale = target.scale;
      this.tweens.add({
        targets: target,
        scale: origScale * 1.12,
        duration: 150,
        ease: 'Back.easeOut',
        yoyo: true,
      });

      // Gold glow ring expanding outward
      const radius = Math.max(target.displayWidth, target.displayHeight) * 0.5;
      const glow = this.add.circle(sx, sy, radius * 0.3, 0xc9a227, 0.7);
      this.tweens.add({
        targets: glow,
        radius: radius * 1.5,
        alpha: 0,
        duration: DISCOVERY_GLOW_DURATION,
        ease: 'Cubic.easeOut',
        onComplete: () => glow.destroy(),
      });

      // Brief golden tint on the sprite
      target.setTint(0xffe066);
      this.time.delayedCall(400, () => target.clearTint());
    } else {
      // Fallback zone feedback (same as before)
      const sw = (target as Phaser.GameObjects.Zone).width;
      const sh = (target as Phaser.GameObjects.Zone).height;

      const gfx = this.add.graphics();
      gfx.lineStyle(2, 0xc9a227, 1);
      gfx.strokeRect(sx - sw / 2, sy - sh / 2, sw, sh);

      const glow = this.add.circle(sx, sy, 5, 0xc9a227, 0.6);
      this.tweens.add({
        targets: glow,
        radius: Math.max(sw, sh) * 1.2,
        alpha: 0,
        duration: DISCOVERY_GLOW_DURATION,
        ease: 'Cubic.easeOut',
        onComplete: () => glow.destroy(),
      });

      // Fade the "?" label
      const label = this.children.getByName(`label-${obj.id}`);
      if (label) {
        this.tweens.add({
          targets: label,
          alpha: 0,
          duration: 300,
          onComplete: () => label.destroy(),
        });
      }
    }

    // Show item name above the target
    const topY = isSprite
      ? sy - (target as Phaser.GameObjects.Image).displayHeight * 0.5
      : sy - (target as Phaser.GameObjects.Zone).height * 0.5;

    const nameText = this.add.text(sx, topY - 12, obj.name, {
      fontFamily: 'Inter, sans-serif',
      fontSize: `${Math.floor(12 * this.sceneScale)}px`,
      color: '#c9a227',
      backgroundColor: '#1a1a2ecc',
      padding: { x: 6, y: 3 },
      align: 'center',
    }).setOrigin(0.5, 1).setAlpha(0);

    this.tweens.add({
      targets: nameText,
      alpha: 1,
      y: nameText.y - 8,
      duration: 400,
      delay: 100,
    });

    // Checkmark
    const checkX = isSprite
      ? sx + (target as Phaser.GameObjects.Image).displayWidth * 0.5
      : sx + (target as Phaser.GameObjects.Zone).width * 0.5;

    const check = this.add.text(checkX, topY, '✓', {
      fontSize: `${Math.floor(16 * this.sceneScale)}px`,
      color: '#4ade80',
    }).setOrigin(0.5, 0.5).setAlpha(0);

    this.tweens.add({
      targets: check,
      alpha: 1,
      scale: 1.3,
      duration: 300,
      delay: 200,
    });
  }

  // ── Miss click feedback ─────────────────────────────────────

  private setupMissClickFeedback() {
    this.input.on('pointerdown', (_pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]) => {
      // Only show miss if no interactive object was hit
      const hitObject = currentlyOver.some((go) => {
        const name = go.name ?? '';
        const id = name.replace('sprite-', '').replace('zone-', '');
        const target = this.sprites.get(id);
        return target && target.input?.enabled;
      });
      if (!hitObject) {
        const ripple = this.add.circle(_pointer.x, _pointer.y, 3, 0xff4444, 0.4);
        this.tweens.add({
          targets: ripple,
          radius: 20,
          alpha: 0,
          duration: MISS_RIPPLE_DURATION,
          ease: 'Cubic.easeOut',
          onComplete: () => ripple.destroy(),
        });
      }
    });
  }

  // ── Hint support ────────────────────────────────────────────

  highlightHint() {
    const store = useGameStore.getState();
    const undiscovered = this.levelData.objects.filter(
      (obj) => !store.discoveredItems.includes(obj.id),
    );
    if (undiscovered.length === 0) return;

    const target = Phaser.Utils.Array.GetRandom(undiscovered);
    const sprite = this.sprites.get(target.id);
    if (!sprite) return;

    if (sprite instanceof Phaser.GameObjects.Image) {
      // Pulse the sprite's tint
      const origTint = sprite.tintTopLeft;
      sprite.setTint(0xc9a227);
      this.tweens.add({
        targets: sprite,
        alpha: 0.5,
        duration: 400,
        yoyo: true,
        repeat: 2,
        onComplete: () => {
          sprite.setAlpha(1);
          if (origTint === 0xffffff) sprite.clearTint();
          else sprite.setTint(origTint);
        },
      });
    } else {
      const hintGlow = this.add.circle(
        sprite.x, sprite.y,
        Math.max(sprite.width, sprite.height) * 0.8,
        0xc9a227, 0,
      );
      this.tweens.add({
        targets: hintGlow,
        alpha: 0.35,
        duration: 500,
        yoyo: true,
        repeat: 2,
        onComplete: () => hintGlow.destroy(),
      });
    }
  }

  stopInput() {
    this.sprites.forEach((target) => target.disableInteractive());
  }

  // ── Resize handling ─────────────────────────────────────────

  private rebuildScene() {
    this.children.removeAll(true);
    this.sprites.clear();
    this.renderBackground();
    this.createObjectSprites();
    this.setupMissClickFeedback();

    // Re-disable sprites for already-discovered items
    const { discoveredItems } = useGameStore.getState();
    for (const id of discoveredItems) {
      const target = this.sprites.get(id);
      if (target) target.disableInteractive();
    }
  }
}
