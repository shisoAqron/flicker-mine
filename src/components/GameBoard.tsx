import { useRef, useCallback } from "react";
import type { Cell, Pickaxe, GameStatus } from "../game/types";
import { DIFFICULTY_CONFIG } from "../game/constants";
import type { Difficulty, Direction } from "../game/types";
import { CellComponent } from "./Cell";
import { useSwipe } from "../hooks/useSwipe";
import styles from "./GameBoard.module.css";

type GameBoardProps = {
  board: Cell[][];
  pickaxes: Pickaxe[];
  status: GameStatus;
  difficulty: Difficulty;
  onSelectStart: (x: number, y: number) => void;
  onSwipe: (direction: Direction) => void;
};

export function GameBoard({
  board,
  pickaxes,
  status,
  difficulty,
  onSelectStart,
  onSwipe,
}: GameBoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const config = DIFFICULTY_CONFIG[difficulty];
  const boardSize = config.boardSize;

  const handleSwipe = useCallback(
    (dir: Direction) => {
      if (status === "playing") {
        onSwipe(dir);
      }
    },
    [status, onSwipe]
  );

  useSwipe({
    onSwipe: handleSwipe,
    elementRef: boardRef,
    disabled: status !== "playing",
  });

  if (board.length === 0) {
    // 未生成時：開始マス選択用のクリッカブルなグリッドを表示
    return (
      <div
        ref={boardRef}
        className={styles.board}
        style={{
          gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
          gridTemplateRows: `repeat(${boardSize}, 1fr)`,
        }}
      >
        {Array.from({ length: boardSize }).flatMap((_, y) =>
          Array.from({ length: boardSize }).map((_, x) => (
            <div
              key={`${x}-${y}`}
              className={`${styles.emptyCell} ${styles.selectableCell}`}
              onClick={() => onSelectStart(x, y)}
              role="button"
              aria-label={`マス(${x},${y})を開始地点に選択`}
            />
          ))
        )}
      </div>
    );
  }

  return (
    <div
      ref={boardRef}
      className={styles.board}
      style={{
        gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
        gridTemplateRows: `repeat(${boardSize}, 1fr)`,
      }}
    >
      {board.flatMap((row) =>
        row.map((cell) => (
          <CellComponent
            key={`${cell.x}-${cell.y}`}
            cell={cell}
            pickaxes={pickaxes}
            status={status}
            onSelect={status === "waiting-start" ? onSelectStart : undefined}
          />
        ))
      )}
    </div>
  );
}
