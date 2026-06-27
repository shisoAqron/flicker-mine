import type { GameStatus } from "../game/types";
import styles from "./GameResultDialog.module.css";

type GameResultDialogProps = {
  status: GameStatus;
  score: number;
  bestScore: number;
  pickaxeCount: number;
  onRestart: () => void;
};

export function GameResultDialog({
  status,
  score,
  bestScore,
  pickaxeCount,
  onRestart,
}: GameResultDialogProps) {
  if (status !== "clear" && status !== "gameover") return null;

  const isClear = status === "clear";

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.dialog}>
        <div className={`${styles.icon} ${isClear ? styles.clearIcon : styles.gameoverIcon}`}>
          {isClear ? "🏆" : "💀"}
        </div>
        <h2 className={`${styles.title} ${isClear ? styles.clearTitle : styles.gameoverTitle}`}>
          {isClear ? "クリア！" : "ゲームオーバー"}
        </h2>
        {isClear && (
          <p className={styles.sub}>地雷以外の全マスを開放しました！</p>
        )}
        {!isClear && (
          <p className={styles.sub}>つるはしが全滅しました…</p>
        )}
        <div className={styles.stats}>
          <div className={styles.statRow}>
            <span>スコア</span>
            <span className={styles.scoreVal}>{score.toLocaleString()}</span>
          </div>
          <div className={styles.statRow}>
            <span>ベストスコア</span>
            <span className={styles.bestVal}>{bestScore.toLocaleString()}</span>
          </div>
          {isClear && (
            <div className={styles.statRow}>
              <span>残りつるはし</span>
              <span>{"⛏️".repeat(pickaxeCount)}</span>
            </div>
          )}
        </div>
        {score >= bestScore && score > 0 && (
          <div className={styles.newRecord}>🌟 NEW RECORD!</div>
        )}
        <button className={styles.restartBtn} onClick={onRestart}>
          🔄 もう一度プレイ
        </button>
      </div>
    </div>
  );
}
