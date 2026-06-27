import { useState, useCallback } from "react";
import { useGame } from "./hooks/useGame";
import { TitleScreen } from "./components/TitleScreen";
import { GameBoard } from "./components/GameBoard";
import { Hud } from "./components/Hud";
import { BottomPanel } from "./components/BottomPanel";
import { GameResultDialog } from "./components/GameResultDialog";
import { HelpDialog } from "./components/HelpDialog";
import type { Direction, Difficulty } from "./game/types";
import styles from "./App.module.css";

export default function App() {
  const { state, startGame, startAt, swipe, restart } = useGame();
  const [showHelp, setShowHelp] = useState(false);

  const handleSwipe = useCallback(
    (direction: Direction) => {
      swipe(direction);
    },
    [swipe]
  );

  const handleStart = useCallback(
    (d: Difficulty) => {
      startGame(d);
    },
    [startGame]
  );

  if (state.status === "title") {
    return (
      <TitleScreen
        bestScore={state.bestScore}
        onStart={handleStart}
      />
    );
  }

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
        onRestart={restart}
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
