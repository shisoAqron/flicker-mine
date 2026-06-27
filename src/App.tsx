import { useState, useCallback } from "react";
import { useGame } from "./hooks/useGame";
import { GameBoard } from "./components/GameBoard";
import { Hud } from "./components/Hud";
import { BottomPanel } from "./components/BottomPanel";
import { GameResultDialog } from "./components/GameResultDialog";
import { HelpDialog } from "./components/HelpDialog";
import type { Direction, Difficulty } from "./game/types";
import styles from "./App.module.css";

export default function App() {
  const { state, startAt, swipe, restart, setDifficulty } = useGame();
  const [showHelp, setShowHelp] = useState(false);

  const handleSwipe = useCallback(
    (direction: Direction) => {
      swipe(direction);
    },
    [swipe]
  );

  const handleSetDifficulty = useCallback(
    (d: Difficulty) => {
      setDifficulty(d);
    },
    [setDifficulty]
  );

  return (
    <div className={styles.app}>
      <Hud state={state} />
      <main className={styles.main}>
        <GameBoard
          board={state.board}
          pickaxes={state.pickaxes}
          status={state.status}
          difficulty={state.difficulty}
          onSelectStart={startAt}
          onSwipe={handleSwipe}
        />
      </main>
      <BottomPanel
        status={state.status}
        message={state.message}
        difficulty={state.difficulty}
        onRestart={restart}
        onSetDifficulty={handleSetDifficulty}
        onHelp={() => setShowHelp(true)}
      />
      <GameResultDialog
        status={state.status}
        score={state.score}
        bestScore={state.bestScore}
        pickaxeCount={state.pickaxes.length}
        onRestart={restart}
      />
      {showHelp && <HelpDialog onClose={() => setShowHelp(false)} />}
    </div>
  );
}
