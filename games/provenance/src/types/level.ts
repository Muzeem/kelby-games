/** Raw JSON shape for level data files (e.g. level_1.json) */

export interface LevelData {
  levelId: string;
  name: string;
  timeLimitSeconds: number;
  backgroundUrl: string;
  objects: GameObject[];
}

export interface GameObject {
  id: string;
  name: string;
  imageUrl?: string;
  baseValue: number;
  hitbox: Hitbox;
  trivia: TriviaItem[];
}

export interface Hitbox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TriviaItem {
  statement: string;
  isTrue: boolean;
}
