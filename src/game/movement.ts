import type { Cell, Pickaxe, Direction } from "./types";
import {
  SCORE_SAFE_CELL,
  SCORE_NUMBER_CELL,
  SCORE_ITEM,
  SCORE_EXPOSED_MINE,
} from "./constants";

export type MoveResult = {
  board: Cell[][];
  pickaxes: Pickaxe[];
  scoreGain: number;
  newlyOpenedCount: number;
};

function cloneBoard(board: Cell[][]): Cell[][] {
  return board.map((row) => row.map((cell) => ({ ...cell })));
}

function getNextPos(
  x: number,
  y: number,
  direction: Direction
): [number, number] {
  switch (direction) {
    case "up":
      return [x, y - 1];
    case "down":
      return [x, y + 1];
    case "left":
      return [x - 1, y];
    case "right":
      return [x + 1, y];
  }
}

function isInside(x: number, y: number, size: number): boolean {
  return x >= 0 && x < size && y >= 0 && y < size;
}

type MoveSingleResult = {
  alive: boolean;
  px: number;
  py: number;
  scoreGain: number;
  newlyOpened: number;
};

/**
 * 爆発アイテム発動: 取得したつるはしの周囲8マスを処理する
 */
function applyBlastItem(
  board: Cell[][],
  px: number,
  py: number,
  boardSize: number
): { scoreGain: number; newlyOpened: number } {
  let scoreGain = 0;
  let newlyOpened = 0;

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = px + dx;
      const ny = py + dy;
      if (!isInside(nx, ny, boardSize)) continue;
      const target = board[ny][nx];
      if (target.isRevealed || target.isExposedMine || target.isExplosionMark)
        continue;

      if (target.isMine) {
        // 地雷は露出させる
        target.isExposedMine = true;
        scoreGain += SCORE_EXPOSED_MINE;
      } else {
        // 安全マスは開く
        target.isRevealed = true;
        newlyOpened++;
        scoreGain +=
          target.adjacentMines > 0 ? SCORE_NUMBER_CELL : SCORE_SAFE_CELL;
        // アイテムもここでは取得しない（つるはしが通らないので）
      }
    }
  }
  return { scoreGain, newlyOpened };
}

/**
 * 露出地雷爆発: ぶつかったつるはしが消滅し、周囲8マスを開放する
 */
function triggerExposedMine(
  board: Cell[][],
  mineX: number,
  mineY: number,
  boardSize: number
): { scoreGain: number; newlyOpened: number } {
  board[mineY][mineX].isExposedMine = false;
  board[mineY][mineX].isExplosionMark = true;

  let scoreGain = 0;
  let newlyOpened = 0;

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = mineX + dx;
      const ny = mineY + dy;
      if (!isInside(nx, ny, boardSize)) continue;
      const target = board[ny][nx];
      if (target.isRevealed || target.isExposedMine || target.isExplosionMark)
        continue;

      if (target.isMine) {
        target.isExposedMine = true;
        scoreGain += SCORE_EXPOSED_MINE;
      } else {
        target.isRevealed = true;
        newlyOpened++;
        scoreGain +=
          target.adjacentMines > 0 ? SCORE_NUMBER_CELL : SCORE_SAFE_CELL;
      }
    }
  }
  return { scoreGain, newlyOpened };
}

/**
 * 単一つるはしの移動処理
 */
function movePickaxe(
  board: Cell[][],
  pickaxe: Pickaxe,
  direction: Direction,
  boardSize: number,
  allPickaxes: Pickaxe[],
  maxPickaxes: number,
  occupiedPositions: Set<string>
): MoveSingleResult {
  let px = pickaxe.x;
  let py = pickaxe.y;
  let alive = true;
  let scoreGain = 0;
  let newlyOpened = 0;

  while (true) {
    const [nx, ny] = getNextPos(px, py, direction);

    if (!isInside(nx, ny, boardSize)) {
      // 盤面外 → 現在位置で停止
      break;
    }

    const cell = board[ny][nx];

    // --- 露出地雷 ---
    if (cell.isExposedMine) {
      const { scoreGain: sg, newlyOpened: no } = triggerExposedMine(
        board,
        nx,
        ny,
        boardSize
      );
      scoreGain += sg;
      newlyOpened += no;
      if (pickaxe.hasShield) {
        pickaxe.hasShield = false;
        px = nx;
        py = ny;
      } else {
        alive = false;
      }
      break;
    }

    // --- 開封済み ---
    if (cell.isRevealed || cell.isExplosionMark) {
      if (cell.adjacentMines > 0 && !cell.isExplosionMark) {
        // 既存の数字マス
        if (!occupiedPositions.has(`${nx},${ny}`)) {
          // 誰もいない → 乗って停止
          px = nx;
          py = ny;
          break;
        }
        // 既に別のつるはしがいる → 手前（現在位置 px,py）で停止
        // ※通過させると地雷に突っ込む危険があるため
        break;
      }
      // 空白マス(または爆発跡) → 通過
      px = nx;
      py = ny;
      continue;
    }

    // --- 未開封マス ---
    if (cell.isMine) {
      // 地雷を掘った
      if (pickaxe.hasShield) {
        pickaxe.hasShield = false;
        cell.isExplosionMark = true;
        cell.isMine = false;
        px = nx;
        py = ny;
        break;
      }
      cell.isExplosionMark = true;
      alive = false;
      break;
    }

    // 安全マスを掘る
    cell.isRevealed = true;
    newlyOpened++;
    scoreGain +=
      cell.adjacentMines > 0 ? SCORE_NUMBER_CELL : SCORE_SAFE_CELL;

    // アイテム処理
    if (cell.item !== null) {
      const item = cell.item;
      cell.item = null;
      scoreGain += SCORE_ITEM;
      px = nx;
      py = ny;

      if (item === "split") {
        // 分裂: 現在地点に新つるはしを追加（最大上限チェック）
        if (allPickaxes.length < maxPickaxes) {
          allPickaxes.push({
            id: `pickaxe-${Date.now()}-${Math.random()}`,
            x: px,
            y: py,
            hasShield: false,
          });
        }
        continue;
      } else if (item === "blast") {
        const { scoreGain: sg, newlyOpened: no } = applyBlastItem(
          board,
          px,
          py,
          boardSize
        );
        scoreGain += sg;
        newlyOpened += no;
        continue;
      } else if (item === "shield") {
        pickaxe.hasShield = true;
        continue;
      }
    }

    if (cell.adjacentMines === 0) {
      // 空白マス → 乗ってさらに進む
      px = nx;
      py = ny;
      continue;
    }

    // 初発見の数字マス → 開くが乗らない。手前の px,py に残る
    break;
  }

  return { alive, px, py, scoreGain, newlyOpened };
}

/**
 * すべてのつるはしを同じ方向に移動させる
 */
export function moveAllPickaxes(
  board: Cell[][],
  pickaxes: Pickaxe[],
  direction: Direction,
  boardSize: number,
  maxPickaxes: number
): MoveResult {
  const newBoard = cloneBoard(board);
  // pickaxes をコピー（分裂で増えることがあるが、今ターン生まれた分は動かさない）
  const newPickaxes: Pickaxe[] = pickaxes.map((p) => ({ ...p }));
  // 今ターン処理するつるはしの数を最初に確定する（分裂で増えた分は次ターンから動く）
  let processCount = newPickaxes.length;
  // 処理済みのつるはしが停止した位置（重複回避用）
  const occupiedPositions = new Set<string>();
  let totalScore = 0;
  let totalOpened = 0;

  for (let i = 0; i < processCount; i++) {
    const pickaxe = newPickaxes[i];
    const result = movePickaxe(
      newBoard,
      pickaxe,
      direction,
      boardSize,
      newPickaxes,
      maxPickaxes,
      occupiedPositions
    );
    totalScore += result.scoreGain;
    totalOpened += result.newlyOpened;
    if (result.alive) {
      pickaxe.x = result.px;
      pickaxe.y = result.py;
      occupiedPositions.add(`${result.px},${result.py}`);
    } else {
      newPickaxes.splice(i, 1);
      i--;
      processCount--; // 削除した分だけ処理数を減らす
    }
  }

  return {
    board: newBoard,
    pickaxes: newPickaxes,
    scoreGain: totalScore,
    newlyOpenedCount: totalOpened,
  };
}
