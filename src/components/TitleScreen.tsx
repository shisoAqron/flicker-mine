import { useState } from "react";
import type { Difficulty } from "../game/types";
import { DIFFICULTY_CONFIG } from "../game/constants";
import styles from "./TitleScreen.module.css";

type TitleScreenProps = {
  bestScore: number;
  onStart: (difficulty: Difficulty) => void;
};

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "かんたん",
  normal: "ふつう",
  hard: "むずかしい",
};

const DIFFICULTY_DESC: Record<Difficulty, string> = {
  easy: "8×8 / 地雷9",
  normal: "10×10 / 地雷15",
  hard: "12×12 / 地雷28",
};

const DIFFICULTY_ITEMS: Record<Difficulty, string> = {
  easy: "✨×2 / 🧨×2",
  normal: "✨×2 / 🧨×1",
  hard: "✨×1 / 🧨×1",
};

export function TitleScreen({ bestScore, onStart }: TitleScreenProps) {
  const [selected, setSelected] = useState<Difficulty>("normal");
  const config = DIFFICULTY_CONFIG[selected];

  return (
    <div className={styles.screen}>
      <div className={styles.inner}>
        <div className={styles.titleBlock}>
          <div className={styles.icon}>⛏️</div>
          <h1 className={styles.title}>フリックマイン</h1>
          <p className={styles.subtitle}>つるはしをフリックして地雷を避けろ！</p>
        </div>

        {bestScore > 0 && (
          <div className={styles.bestScore}>
            🏆 ベストスコア: <span>{bestScore.toLocaleString()}</span>
          </div>
        )}

        <div className={styles.difficultySection}>
          <p className={styles.sectionLabel}>難易度を選んでください</p>
          <div className={styles.difficultyList}>
            {(["easy", "normal", "hard"] as Difficulty[]).map((d) => (
              <button
                key={d}
                className={`${styles.diffBtn} ${selected === d ? styles.active : ""}`}
                onClick={() => setSelected(d)}
              >
                <span className={styles.diffName}>{DIFFICULTY_LABELS[d]}</span>
                <span className={styles.diffDetail}>{DIFFICULTY_DESC[d]}</span>
                <span className={styles.diffItems}>{DIFFICULTY_ITEMS[d]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.selectedInfo}>
          <span>{config.boardSize}×{config.boardSize}盤面</span>
          <span>地雷 {config.mineCount} 個</span>
          <span>つるはし 最大{config.maxPickaxes}本</span>
        </div>

        <button
          className={styles.startBtn}
          onClick={() => onStart(selected)}
        >
          ゲームスタート
        </button>

        <div className={styles.howto}>
          <p>📖 遊び方</p>
          <ul>
            <li>開始マスをタップして⛏️を置く</li>
            <li>上下左右にフリックして掘り進む</li>
            <li>地雷以外の全マスを開けたらクリア！</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
