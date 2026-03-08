import Phaser from 'phaser';
import type { RoomManifest, ManifestObject } from '../../types/manifest';
import { bridge } from '../../bridge/canvasEventBridge';

const DISCOVERY_ANIM_DURATION = 800;
const MISS_FEEDBACK_DURATION = 400;
const HIT_TOLERANCE = 10;

interface ObjectSprite extends Phaser.GameObjects.Rectangle {
  objectData: ManifestObject;
  discovered: boolean;
}

export class HiddenObjectScene extends Phaser.Scene {
  private roomManifest!: RoomManifest;
  private objectSprites: ObjectSprite[] = [];
  private sceneScale = 1;
  private offsetX = 0;
  private offsetY = 0;
  private isAcceptingInput = true;

  // Design dimensions for object placement (manifest coords are relative to this)
  private readonly DESIGN_WIDTH = 1024;
  private readonly DESIGN_HEIGHT = 600;

  constructor() {
    super({ key: 'HiddenObjectScene' });
  }

  init(data: { roomManifest: RoomManifest }) {
    this.roomManifest = data.roomManifest;
    this.objectSprites = [];
    this.isAcceptingInput = true;
  }

  preload() {
    // Load room background if it exists, otherwise use a generated texture
    const bgPath = this.roomManifest.backgroundAssetPath;
    this.load.image(`bg-${this.roomManifest.id}`, bgPath);

    // Load object images
    this.roomManifest.objects.forEach((obj) => {
      this.load.image(`obj-${obj.id}`, obj.imageUrl);
    });

    // Handle load errors gracefully — use generated textures as fallback
    this.load.on('loaderror', (file: Phaser.Loader.File) => {
      console.warn(`Asset not found: ${file.key}, using placeholder`);
    });
  }

  create() {
    this.calculateScale();
    this.createBackground();
    this.createHiddenObjects();
    this.setupInput();

    // Recalculate on resize
    this.scale.on('resize', () => {
      this.calculateScale();
      this.repositionAll();
    });
  }

  private calculateScale() {
    const w = this.scale.width;
    const h = this.scale.height;
    this.sceneScale = Math.min(w / this.DESIGN_WIDTH, h / this.DESIGN_HEIGHT);
    this.offsetX = (w - this.DESIGN_WIDTH * this.sceneScale) / 2;
    this.offsetY = (h - this.DESIGN_HEIGHT * this.sceneScale) / 2;
  }

  private toScreenX(designX: number): number {
    return this.offsetX + designX * this.sceneScale;
  }

  private toScreenY(designY: number): number {
    return this.offsetY + designY * this.sceneScale;
  }

  private createBackground() {
    const bgKey = `bg-${this.roomManifest.id}`;
    const w = this.scale.width;
    const h = this.scale.height;

    if (this.textures.exists(bgKey) && this.textures.get(bgKey).key !== '__MISSING') {
      const bg = this.add.image(w / 2, h / 2, bgKey);
      bg.setDisplaySize(this.DESIGN_WIDTH * this.sceneScale, this.DESIGN_HEIGHT * this.sceneScale);
      bg.setName('background');
    } else {
      // Generate a placeholder background with room atmosphere
      this.createPlaceholderBackground();
    }
  }

  private createPlaceholderBackground() {
    const w = this.scale.width;
    const h = this.scale.height;
    const bgW = this.DESIGN_WIDTH * this.sceneScale;
    const bgH = this.DESIGN_HEIGHT * this.sceneScale;

    // Dark room rectangle
    const bg = this.add.rectangle(w / 2, h / 2, bgW, bgH, 0x1a1a2e);
    bg.setStrokeStyle(1, 0xc9a227, 0.3);
    bg.setName('background');

    // Room name label
    this.add.text(w / 2, this.offsetY + 30 * this.sceneScale, this.roomManifest.name, {
      fontFamily: 'Playfair Display, serif',
      fontSize: `${Math.floor(24 * this.sceneScale)}px`,
      color: '#c9a227',
      align: 'center',
    }).setOrigin(0.5, 0.5).setAlpha(0.4);

    // Subtle grid pattern to suggest a room
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0xffffff, 0.03);
    const step = 60 * this.sceneScale;
    for (let x = this.offsetX; x < this.offsetX + bgW; x += step) {
      graphics.lineBetween(x, this.offsetY, x, this.offsetY + bgH);
    }
    for (let y = this.offsetY; y < this.offsetY + bgH; y += step) {
      graphics.lineBetween(this.offsetX, y, this.offsetX + bgW, y);
    }
  }

  private createHiddenObjects() {
    this.roomManifest.objects.forEach((objData) => {
      const sx = this.toScreenX(objData.x);
      const sy = this.toScreenY(objData.y);
      const sw = objData.width * this.sceneScale;
      const sh = objData.height * this.sceneScale;

      // Check if object texture loaded
      const texKey = `obj-${objData.id}`;
      let sprite: ObjectSprite;

      if (this.textures.exists(texKey) && this.textures.get(texKey).key !== '__MISSING') {
        // Use loaded image
        const img = this.add.image(sx, sy, texKey) as unknown as ObjectSprite;
        img.setDisplaySize(sw, sh);
        sprite = img;
      } else {
        // Placeholder: subtle outlined rectangle with icon
        const rect = this.add.rectangle(sx, sy, sw, sh, 0x2a2a4e, 0.6) as ObjectSprite;
        rect.setStrokeStyle(1, 0xc9a227, 0.15);
        sprite = rect;

        // Small label
        this.add.text(sx, sy, '?', {
          fontSize: `${Math.floor(Math.min(sw, sh) * 0.5)}px`,
          color: '#c9a227',
          align: 'center',
        }).setOrigin(0.5, 0.5).setAlpha(0.3).setName(`label-${objData.id}`);
      }

      sprite.objectData = objData;
      sprite.discovered = false;
      sprite.setInteractive({
        hitArea: new Phaser.Geom.Rectangle(-HIT_TOLERANCE, -HIT_TOLERANCE, sw + HIT_TOLERANCE * 2, sh + HIT_TOLERANCE * 2),
        hitAreaCallback: Phaser.Geom.Rectangle.Contains,
        useHandCursor: true,
      });
      sprite.setName(`obj-${objData.id}`);

      this.objectSprites.push(sprite);
    });
  }

  private setupInput() {
    // Object click/tap
    this.objectSprites.forEach((sprite) => {
      sprite.on('pointerdown', () => {
        if (!this.isAcceptingInput || sprite.discovered) return;
        this.handleObjectDiscovery(sprite);
      });
    });

    // Miss click on background
    this.input.on('pointerdown', (_pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]) => {
      if (!this.isAcceptingInput) return;
      // Only trigger miss if no object was clicked
      const hitObject = currentlyOver.some((go) =>
        this.objectSprites.includes(go as ObjectSprite) && !(go as ObjectSprite).discovered
      );
      if (!hitObject) {
        this.showMissFeedback(_pointer.x, _pointer.y);
        bridge.emit('missClick', { x: _pointer.x, y: _pointer.y });
      }
    });
  }

  private handleObjectDiscovery(sprite: ObjectSprite) {
    sprite.discovered = true;
    sprite.disableInteractive();

    // Discovery animation — glow + scale pulse
    this.playDiscoveryAnimation(sprite);

    // Emit bridge event
    bridge.emit('objectDiscovered', {
      objectId: sprite.objectData.id,
      manifestData: sprite.objectData,
    });

    // Check if all objects in room are discovered
    const allFound = this.objectSprites.every((s) => s.discovered);
    if (allFound) {
      this.time.delayedCall(1000, () => {
        bridge.emit('roomCleared', { roomNumber: 0 }); // room number handled by React
      });
    }
  }

  private playDiscoveryAnimation(sprite: ObjectSprite) {
    const sx = sprite.x;
    const sy = sprite.y;

    // Golden glow circle expanding outward
    const glow = this.add.circle(sx, sy, 5, 0xc9a227, 0.6);
    this.tweens.add({
      targets: glow,
      radius: Math.max(sprite.displayWidth, sprite.displayHeight) * 1.2,
      alpha: 0,
      duration: DISCOVERY_ANIM_DURATION,
      ease: 'Cubic.easeOut',
      onComplete: () => glow.destroy(),
    });

    // Sprite pulse
    this.tweens.add({
      targets: sprite,
      scaleX: sprite.scaleX * 1.15,
      scaleY: sprite.scaleY * 1.15,
      duration: 150,
      yoyo: true,
      ease: 'Back.easeOut',
    });

    // Mark as found — change appearance
    this.tweens.add({
      targets: sprite,
      alpha: 0.5,
      duration: 400,
      delay: 300,
    });

    // Remove the "?" label if it exists
    const label = this.children.getByName(`label-${sprite.objectData.id}`);
    if (label) {
      this.tweens.add({
        targets: label,
        alpha: 0,
        duration: 300,
        onComplete: () => label.destroy(),
      });
    }

    // Show item name
    const nameText = this.add.text(sx, sy - sprite.displayHeight / 2 - 12, sprite.objectData.name, {
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
      delay: 200,
    });

    // Checkmark
    const check = this.add.text(sx + sprite.displayWidth / 2, sy - sprite.displayHeight / 2, '✓', {
      fontSize: `${Math.floor(16 * this.sceneScale)}px`,
      color: '#4ade80',
    }).setOrigin(0.5, 0.5).setAlpha(0);

    this.tweens.add({
      targets: check,
      alpha: 1,
      scale: 1.3,
      duration: 300,
      delay: 400,
      yoyo: false,
    });
  }

  private showMissFeedback(x: number, y: number) {
    const ripple = this.add.circle(x, y, 3, 0xff4444, 0.4);
    this.tweens.add({
      targets: ripple,
      radius: 20,
      alpha: 0,
      duration: MISS_FEEDBACK_DURATION,
      ease: 'Cubic.easeOut',
      onComplete: () => ripple.destroy(),
    });
  }

  /** Called externally to highlight a random undiscovered object (hint system) */
  highlightHint() {
    const undiscovered = this.objectSprites.filter((s) => !s.discovered);
    if (undiscovered.length === 0) return;

    const target = Phaser.Utils.Array.GetRandom(undiscovered);
    const hintGlow = this.add.circle(target.x, target.y, Math.max(target.displayWidth, target.displayHeight) * 0.8, 0xc9a227, 0);

    // Pulse in
    this.tweens.add({
      targets: hintGlow,
      alpha: 0.35,
      duration: 500,
      yoyo: true,
      repeat: 2,
      onComplete: () => hintGlow.destroy(),
    });

    bridge.emit('hintHighlight', { objectId: target.objectData.id });
  }

  /** Stop accepting input (timer expired) */
  stopInput() {
    this.isAcceptingInput = false;
  }

  private repositionAll() {
    // Recalculate and reposition everything on resize
    this.children.removeAll(true);
    this.objectSprites = [];
    this.createBackground();
    this.createHiddenObjects();
    this.setupInput();
  }
}
