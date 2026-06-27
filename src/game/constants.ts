import type { Difficulty } from "./types";

export type DifficultyConfig = {
  boardSize: number;
  mineCount: number;
  splitItemCount: number;
  blastItemCount: number;
  shieldItemCount: number;
  maxPickaxes: number;
};

export const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
  easy: {
    boardSize: 8,
    mineCount: 9,
    splitItemCount: 2,
    blastItemCount: 2,
    shieldItemCount: 2,
    maxPickaxes: 3,
  },
  normal: {
    boardSize: 10,
    mineCount: 15,
    splitItemCount: 2,
    blastItemCount: 1,
    shieldItemCount: 1,
    maxPickaxes: 3,
  },
  hard: {
    boardSize: 12,
    mineCount: 28,
    splitItemCount: 1,
    blastItemCount: 1,
    shieldItemCount: 0,
    maxPickaxes: 3,
  },
};

export const SWIPE_THRESHOLD = 30;

export const SCORE_SAFE_CELL = 10;
export const SCORE_NUMBER_CELL = 10;
export const SCORE_ITEM = 50;
export const SCORE_EXPOSED_MINE = 30;
export const SCORE_CLEAR_BONUS = 1000;
export const SCORE_PICKAXE_BONUS = 500;

export const BEST_SCORE_KEY = "flicker-mine-best-score";
