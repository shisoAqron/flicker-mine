import type { Difficulty, GameStatus } from "../game/types";
import styles from "./BottomPanel.module.css";

type BottomPanelProps = {
  status: GameStatus;
  message: string;
  difficulty: Difficulty;
  onRestart: () => void;
  onSetDifficulty: (d: Difficulty) => void;
  onHelp: () => void;
};

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "かんたん",
  normal: "ふつう",
  hard: "むずかしい",
};

export function BottomPanel({
  status,
  message,
  difficulty,
  onRestart,
  onSetDifficulty,
  onHelp,
}: BottomPanelProps) {
  return (
    <footer className={styles.panel}>
      <div className={styles.message}>{message}</div>
      <div className={styles.hint}>
        <span>上下左右にフリックしてつるはしを動かそう</span>
      </div>
      <div className={styles.controls}>
        <div className={styles.difficultyGroup}>
          {(["easy", "normal", "hard"] as Difficulty[]).map((d) => (
            <button
              key={d}
              className={`${styles.diffBtn} ${difficulty === d ? styles.active : ""}`}
              onClick={() => onSetDifficulty(d)}
            >
              {DIFFICULTY_LABELS[d]}
            </button>
          ))}
        </div>
        <div className={styles.actionGroup}>
          <button className={styles.restartBtn} onClick={onRestart}>
            🔄 リスタート
          </button>
          <button className={styles.helpBtn} onClick={onHelp}>
            ❓ ヘルプ
          </button>
        </div>
      </div>
      {status === "waiting-start" && (
        <div className={styles.startHint}>
          盤面のマスをタップして開始地点を選んでください
        </div>
      )}
    </footer>
  );
}
