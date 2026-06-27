import type { Cell, Pickaxe, GameStatus } from "../game/types";
import styles from "./Cell.module.css";

type CellProps = {
  cell: Cell;
  pickaxes: Pickaxe[];
  status: GameStatus;
  onSelect?: (x: number, y: number) => void;
};

const NUMBER_COLORS = [
  "",
  "#4fc3f7", // 1 - 水色
  "#81c784", // 2 - 緑
  "#e57373", // 3 - 赤
  "#7986cb", // 4 - 紫
  "#ff8a65", // 5 - オレンジ
  "#4dd0e1", // 6 - シアン
  "#f06292", // 7 - ピンク
  "#90a4ae", // 8 - グレー
];

export function CellComponent({ cell, pickaxes, status, onSelect }: CellProps) {
  const hasPickaxe = pickaxes.some((p) => p.x === cell.x && p.y === cell.y);
  const pickaxeWithShield = pickaxes.find(
    (p) => p.x === cell.x && p.y === cell.y && p.hasShield
  );

  const handleClick = () => {
    if (status === "waiting-start" && onSelect) {
      onSelect(cell.x, cell.y);
    }
  };

  let cellClass = styles.cell;
  let content: string | null = null;
  let numberColor: string | undefined;

  if (cell.isExplosionMark) {
    cellClass += ` ${styles.explosionMark}`;
    content = "💥";
  } else if (cell.isExposedMine) {
    cellClass += ` ${styles.exposedMine}`;
    content = "💣";
  } else if (!cell.isRevealed) {
    cellClass += ` ${styles.unrevealed}`;
    if (status === "waiting-start") {
      cellClass += ` ${styles.selectable}`;
    }
    content = null;
  } else if (cell.item !== null) {
    cellClass += ` ${styles.revealed}`;
    if (cell.item === "split") content = "✨";
    else if (cell.item === "blast") content = "🧨";
    else if (cell.item === "shield") content = "🛡️";
  } else if (cell.adjacentMines > 0) {
    cellClass += ` ${styles.revealed} ${styles.number}`;
    content = String(cell.adjacentMines);
    numberColor = NUMBER_COLORS[cell.adjacentMines];
  } else {
    cellClass += ` ${styles.revealed} ${styles.empty}`;
    content = null;
  }

  return (
    <div
      className={cellClass}
      onClick={handleClick}
      role={status === "waiting-start" ? "button" : undefined}
      aria-label={status === "waiting-start" ? `マス(${cell.x},${cell.y})を開始地点に選択` : undefined}
    >
      {content && (
        <span
          className={styles.cellContent}
          style={numberColor ? { color: numberColor } : undefined}
        >
          {content}
        </span>
      )}
      {hasPickaxe && (
        <span className={styles.pickaxe}>
          {pickaxeWithShield ? "🛡️⛏️" : "⛏️"}
        </span>
      )}
    </div>
  );
}
