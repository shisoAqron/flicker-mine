import type { Cell } from "./types";

export function countOpenedSafeCells(board: Cell[][], boardSize: number): number {
  let count = 0;
  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
      const cell = board[y][x];
      if (!cell.isMine && cell.isRevealed) count++;
    }
  }
  return count;
}

export function countTotalSafeCells(board: Cell[][], boardSize: number): number {
  let count = 0;
  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
      if (!board[y][x].isMine) count++;
    }
  }
  return count;
}
