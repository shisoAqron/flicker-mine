import type { Cell, ItemType } from "./types";
import type { DifficultyConfig } from "./constants";
import { validateSafeConnectivity } from "./connectivity";

function createEmptyBoard(size: number): Cell[][] {
  const board: Cell[][] = [];
  for (let y = 0; y < size; y++) {
    const row: Cell[] = [];
    for (let x = 0; x < size; x++) {
      row.push({
        x,
        y,
        isMine: false,
        isRevealed: false,
        isExposedMine: false,
        isExplosionMark: false,
        adjacentMines: 0,
        item: null,
      });
    }
    board.push(row);
  }
  return board;
}

function getSafeZone(
  startX: number,
  startY: number,
  boardSize: number
): Set<string> {
  const safe = new Set<string>();
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const nx = startX + dx;
      const ny = startY + dy;
      if (nx >= 0 && nx < boardSize && ny >= 0 && ny < boardSize) {
        safe.add(`${nx},${ny}`);
      }
    }
  }
  return safe;
}

function placeMines(
  board: Cell[][],
  startX: number,
  startY: number,
  boardSize: number,
  mineCount: number
): void {
  const safeZone = getSafeZone(startX, startY, boardSize);
  const candidates: [number, number][] = [];
  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
      if (!safeZone.has(`${x},${y}`)) {
        candidates.push([x, y]);
      }
    }
  }

  // Fisher-Yates shuffle subset
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  for (let i = 0; i < mineCount; i++) {
    const [x, y] = candidates[i];
    board[y][x].isMine = true;
  }
}

function calculateAdjacentMines(board: Cell[][], boardSize: number): void {
  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
      if (board[y][x].isMine) continue;
      let count = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < boardSize && ny >= 0 && ny < boardSize) {
            if (board[ny][nx].isMine) count++;
          }
        }
      }
      board[y][x].adjacentMines = count;
    }
  }
}

function placeItems(
  board: Cell[][],
  boardSize: number,
  startX: number,
  startY: number,
  config: DifficultyConfig
): void {
  const safeZone = getSafeZone(startX, startY, boardSize);
  const candidates: [number, number][] = [];
  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
      const cell = board[y][x];
      if (!cell.isMine && !safeZone.has(`${x},${y}`)) {
        candidates.push([x, y]);
      }
    }
  }

  // shuffle
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  const items: ItemType[] = [
    ...Array<ItemType>(config.splitItemCount).fill("split"),
    ...Array<ItemType>(config.blastItemCount).fill("blast"),
    ...Array<ItemType>(config.shieldItemCount).fill("shield"),
  ];

  for (let i = 0; i < items.length && i < candidates.length; i++) {
    const [x, y] = candidates[i];
    board[y][x].item = items[i];
  }
}

export function generateBoard(
  startX: number,
  startY: number,
  config: DifficultyConfig
): Cell[][] {
  const { boardSize, mineCount } = config;
  const maxAttempts = 200;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const board = createEmptyBoard(boardSize);
    placeMines(board, startX, startY, boardSize, mineCount);
    calculateAdjacentMines(board, boardSize);

    if (!validateSafeConnectivity(board, startX, startY, boardSize)) {
      continue;
    }

    placeItems(board, boardSize, startX, startY, config);
    return board;
  }

  // fallback: return last generated board even if connectivity failed
  const board = createEmptyBoard(boardSize);
  placeMines(board, startX, startY, boardSize, mineCount);
  calculateAdjacentMines(board, boardSize);
  placeItems(board, boardSize, startX, startY, config);
  return board;
}
