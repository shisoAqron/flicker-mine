export type Direction = "up" | "down" | "left" | "right";

export type GameStatus =
  | "title"
  | "waiting-start"
  | "playing"
  | "clear"
  | "gameover";

export type ItemType = "split" | "blast" | "shield";

export type Difficulty = "easy" | "normal" | "hard";

export type Cell = {
  x: number;
  y: number;
  isMine: boolean;
  isRevealed: boolean;
  isExposedMine: boolean;
  isExplosionMark: boolean;
  adjacentMines: number;
  item: ItemType | null;
};

export type Pickaxe = {
  id: string;
  x: number;
  y: number;
  hasShield: boolean;
};

export type GameState = {
  board: Cell[][];
  pickaxes: Pickaxe[];
  status: GameStatus;
  score: number;
  bestScore: number;
  openedSafeCells: number;
  totalSafeCells: number;
  mineCount: number;
  message: string;
  difficulty: Difficulty;
};

export type GameAction =
  | { type: "START_GAME"; difficulty: Difficulty }
  | { type: "START_AT"; x: number; y: number }
  | { type: "SWIPE"; direction: Direction }
  | { type: "RESTART" };
