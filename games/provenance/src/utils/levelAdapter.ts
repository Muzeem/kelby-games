import type { LevelData } from '../types/level';
import type { LevelManifest, RoomManifest, ManifestObject } from '../types/manifest';

/**
 * Converts a single-room LevelData (new format) into the internal
 * LevelManifest (3-room format) used by the Phaser scene and UI.
 *
 * The new level JSON represents one room. We place it as Room 1
 * and create empty placeholder rooms for 2 and 3 so the existing
 * 3-room pipeline doesn't break.
 */
export function levelDataToManifest(level: LevelData): LevelManifest {
  const objects: ManifestObject[] = level.objects.map((obj) => ({
    id: obj.id,
    name: obj.name,
    imageUrl: '', // No per-object image in new format; Phaser uses placeholder
    x: obj.hitbox.x,
    y: obj.hitbox.y,
    width: obj.hitbox.width,
    height: obj.hitbox.height,
    hitArea: { ...obj.hitbox },
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
  }));

  const room1: RoomManifest = {
    id: level.levelId,
    name: level.name,
    backgroundAssetPath: level.backgroundUrl,
    objects,
  };

  const emptyRoom = (id: string, name: string): RoomManifest => ({
    id,
    name,
    backgroundAssetPath: '',
    objects: [],
  });

  return {
    rooms: [
      room1,
      emptyRoom(`${level.levelId}_r2`, 'Room 2 — Coming Soon'),
      emptyRoom(`${level.levelId}_r3`, 'Room 3 — Coming Soon'),
    ],
  };
}
