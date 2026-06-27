import type { GameStatus } from "../game/types";
import styles from "./BottomPanel.module.css";

type BottomPanelProps = {
  status: GameStatus;
  message: string;
  onRestart: () => void;
  onHelp: () => void;
};

export function BottomPanel({
  status,
  message,
  onRestart,
  onHelp,
}: BottomPanelProps) {
  return (
    <footer className={styles.panel}>
      <div className={styles.message}>{message}</div>
      <div className={styles.hint}>
        <span>上下左右にフリックしてつるはしを動かそう</span>
      </div>
      <div className={styles.actionGroup}>
        <button className={styles.restartBtn} onClick={onRestart}>
          🔄 タイトルへ
        </button>
        <button className={styles.helpBtn} onClick={onHelp}>
          ❓ ヘルプ
        </button>
      </div>
      {status === "waiting-start" && (
        <div className={styles.startHint}>
          盤面のマスをタップして開始地点を選んでください
        </div>
      )}
    </footer>
  );
}
