import type { GameState } from "../game/types";
import styles from "./Hud.module.css";

type HudProps = {
  state: GameState;
};

export function Hud({ state }: HudProps) {
  return (
    <header className={styles.hud}>
      <div className={styles.title}>⛏️ フリックマイン</div>
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.label}>スコア</span>
          <span className={styles.value}>{state.score.toLocaleString()}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.label}>ベスト</span>
          <span className={styles.value}>{state.bestScore.toLocaleString()}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.label}>⛏️</span>
          <span className={styles.value}>
            {"⛏️".repeat(state.pickaxes.length) || "—"}
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.label}>💣</span>
          <span className={styles.value}>{state.mineCount}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.label}>開放</span>
          <span className={styles.value}>
            {state.totalSafeCells > 0
              ? `${state.openedSafeCells}/${state.totalSafeCells}`
              : "—"}
          </span>
        </div>
      </div>
    </header>
  );
}
