export interface LevelManifest {
  rooms: [RoomManifest, RoomManifest, RoomManifest];
}

export interface RoomManifest {
  id: string;
  name: string;
  backgroundAssetPath: string;
  objects: ManifestObject[];
}

export interface ManifestObject {
  id: string;
  name: string;
  imageUrl: string;
  x: number;
  y: number;
  width: number;
  height: number;
  hitArea?: { x: number; y: number; width: number; height: number };
  baseAppraisalValue: number;
  trivia: TriviaData;
}

export interface TriviaData {
  claims: [TriviaClaim, TriviaClaim, TriviaClaim];
}

export interface TriviaClaim {
  text: string;
  isFalse: boolean;
}
