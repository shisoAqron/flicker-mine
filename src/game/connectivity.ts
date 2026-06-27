import type { Cell } from "./types";

/**
 * BFS で startX, startY から4方向連結できる安全マスを列挙し、
 * 全安全マス数と一致するか確認する。
 */
export function validateSafeConnectivity(
  board: Cell[][],
  startX: number,
  startY: number,
  boardSize: number
): boolean {
  const totalSafe = countTotalSafeCells(board, boardSize);

  const visited = Array.from({ length: boardSize }, () =>
    new Array<boolean>(boardSize).fill(false)
  );

  const queue: [number, number][] = [[startX, startY]];
  visited[startY][startX] = true;
  let reachable = 1;

  const dirs = [
    [0, -1],
    [0, 1],
    [-1, 0],
    [1, 0],
  ];

  while (queue.length > 0) {
    const [cx, cy] = queue.shift()!;
    for (const [dx, dy] of dirs) {
      const nx = cx + dx;
      const ny = cy + dy;
      if (nx < 0 || nx >= boardSize || ny < 0 || ny >= boardSize) continue;
      if (visited[ny][nx]) continue;
      const cell = board[ny][nx];
      if (cell.isMine) continue;
      visited[ny][nx] = true;
      reachable++;
      queue.push([nx, ny]);
    }
  }

  return reachable === totalSafe;
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
