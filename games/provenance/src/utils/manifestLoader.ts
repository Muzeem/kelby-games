import type { LevelManifest, RoomManifest, ManifestObject, TriviaClaim } from '../types/manifest';

export class ManifestLoadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ManifestLoadError';
  }
}

function validateClaim(claim: unknown, objId: string, index: number): claim is TriviaClaim {
  if (!claim || typeof claim !== 'object') {
    throw new ManifestLoadError(`Object "${objId}": claim[${index}] is not an object`);
  }
  const c = claim as Record<string, unknown>;
  if (typeof c.text !== 'string' || c.text.trim().length === 0) {
    throw new ManifestLoadError(`Object "${objId}": claim[${index}].text must be a non-empty string`);
  }
  if (typeof c.isFalse !== 'boolean') {
    throw new ManifestLoadError(`Object "${objId}": claim[${index}].isFalse must be a boolean`);
  }
  return true;
}

function validateObject(obj: unknown, roomId: string, index: number): obj is ManifestObject {
  if (!obj || typeof obj !== 'object') {
    throw new ManifestLoadError(`Room "${roomId}": object[${index}] is not an object`);
  }
  const o = obj as Record<string, unknown>;
  const id = typeof o.id === 'string' ? o.id : `object[${index}]`;

  if (typeof o.id !== 'string') throw new ManifestLoadError(`Room "${roomId}": ${id} missing "id"`);
  if (typeof o.name !== 'string') throw new ManifestLoadError(`Room "${roomId}": ${id} missing "name"`);
  if (typeof o.imageUrl !== 'string') throw new ManifestLoadError(`Room "${roomId}": ${id} missing "imageUrl"`);
  if (typeof o.x !== 'number') throw new ManifestLoadError(`Room "${roomId}": ${id} missing "x"`);
  if (typeof o.y !== 'number') throw new ManifestLoadError(`Room "${roomId}": ${id} missing "y"`);
  if (typeof o.width !== 'number' || o.width <= 0) throw new ManifestLoadError(`Room "${roomId}": ${id} "width" must be positive`);
  if (typeof o.height !== 'number' || o.height <= 0) throw new ManifestLoadError(`Room "${roomId}": ${id} "height" must be positive`);
  if (typeof o.baseAppraisalValue !== 'number' || o.baseAppraisalValue <= 0) {
    throw new ManifestLoadError(`Room "${roomId}": ${id} "baseAppraisalValue" must be positive`);
  }

  // Trivia validation
  const trivia = o.trivia as Record<string, unknown> | undefined;
  if (!trivia || typeof trivia !== 'object') throw new ManifestLoadError(`Room "${roomId}": ${id} missing "trivia"`);
  if (!Array.isArray(trivia.claims) || trivia.claims.length !== 3) {
    throw new ManifestLoadError(`Room "${roomId}": ${id} trivia must have exactly 3 claims`);
  }
  trivia.claims.forEach((claim: unknown, ci: number) => validateClaim(claim, id, ci));

  // Exactly one false claim
  const falseCount = (trivia.claims as TriviaClaim[]).filter((c) => c.isFalse).length;
  if (falseCount !== 1) {
    throw new ManifestLoadError(`Room "${roomId}": ${id} trivia must have exactly 1 false claim, found ${falseCount}`);
  }

  return true;
}

function validateRoom(room: unknown, index: number): room is RoomManifest {
  if (!room || typeof room !== 'object') {
    throw new ManifestLoadError(`rooms[${index}] is not an object`);
  }
  const r = room as Record<string, unknown>;
  const id = typeof r.id === 'string' ? r.id : `rooms[${index}]`;

  if (typeof r.id !== 'string') throw new ManifestLoadError(`${id} missing "id"`);
  if (typeof r.name !== 'string') throw new ManifestLoadError(`${id} missing "name"`);
  if (typeof r.backgroundAssetPath !== 'string') throw new ManifestLoadError(`${id} missing "backgroundAssetPath"`);
  if (!Array.isArray(r.objects)) throw new ManifestLoadError(`${id} missing "objects" array`);

  r.objects.forEach((obj: unknown, oi: number) => validateObject(obj, id, oi));
  return true;
}

export function validateManifest(data: unknown): data is LevelManifest {
  if (!data || typeof data !== 'object') {
    throw new ManifestLoadError('Manifest root is not an object');
  }
  const d = data as Record<string, unknown>;
  if (!Array.isArray(d.rooms) || d.rooms.length !== 3) {
    throw new ManifestLoadError('Manifest must have exactly 3 rooms');
  }
  d.rooms.forEach((room: unknown, i: number) => validateRoom(room, i));
  return true;
}

export async function loadManifest(url = 'data/level-manifest.json'): Promise<LevelManifest> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new ManifestLoadError(`Failed to fetch manifest: ${response.status} ${response.statusText}`);
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new ManifestLoadError('Manifest is not valid JSON');
  }

  validateManifest(data);
  return data as LevelManifest;
}
