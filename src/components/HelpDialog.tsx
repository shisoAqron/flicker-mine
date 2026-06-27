import styles from "./HelpDialog.module.css";

type HelpDialogProps = {
  onClose: () => void;
};

export function HelpDialog({ onClose }: HelpDialogProps) {
  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.dialog}>
        <h2 className={styles.title}>❓ ヘルプ</h2>
        <div className={styles.content}>
          <section className={styles.section}>
            <h3>🎯 目的</h3>
            <p>地雷以外のすべてのマスを開けたらクリア！</p>
          </section>
          <section className={styles.section}>
            <h3>🕹️ 操作方法</h3>
            <ul>
              <li>最初に開始マスをタップして選ぶ</li>
              <li>盤面を上下左右にフリック（スワイプ）</li>
              <li>PCは矢印キーまたはWASDキーでも操作可能</li>
            </ul>
          </section>
          <section className={styles.section}>
            <h3>⛏️ つるはしの動き</h3>
            <ul>
              <li>開封済みの空白マスは通過する</li>
              <li>初めて掘る数字マス → 開いて手前で止まる</li>
              <li>既に開いた数字マス → 乗って止まる</li>
              <li>地雷を掘る → そのつるはしが消滅</li>
              <li>露出地雷にぶつかる → 消滅＋周囲8マス開放</li>
            </ul>
          </section>
          <section className={styles.section}>
            <h3>📦 アイテム</h3>
            <ul>
              <li>✨ 分裂: つるはしを1本増やす（最大3本）</li>
              <li>🧨 爆発: 周囲8マスを開放（地雷は露出）</li>
              <li>🛡️ シールド: 次の地雷衝突を1回防ぐ</li>
            </ul>
          </section>
          <section className={styles.section}>
            <h3>💀 ゲームオーバー</h3>
            <p>すべてのつるはしが消滅したらゲームオーバー</p>
          </section>
        </div>
        <button className={styles.closeBtn} onClick={onClose}>
          閉じる
        </button>
      </div>
    </div>
  );
}
