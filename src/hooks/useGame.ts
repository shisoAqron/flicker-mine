import { useReducer, useCallback } from "react";
import type { GameState, GameAction, Direction, Difficulty } from "../game/types";
import { DIFFICULTY_CONFIG } from "../game/constants";
import { generateBoard } from "../game/boardGenerator";
import { moveAllPickaxes } from "../game/movement";
import { countOpenedSafeCells, countTotalSafeCells } from "../game/scoring";
import {
  SCORE_CLEAR_BONUS,
  SCORE_PICKAXE_BONUS,
} from "../game/constants";
import { loadBestScore, saveBestScore } from "../game/storage";

function createInitialState(difficulty: Difficulty): GameState {
  const config = DIFFICULTY_CONFIG[difficulty];
  return {
    board: [],
    pickaxes: [],
    status: "waiting-start",
    score: 0,
    bestScore: loadBestScore(),
    openedSafeCells: 0,
    totalSafeCells: 0,
    mineCount: config.mineCount,
    message: "開始マスを選んでください",
    difficulty,
  };
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "SET_DIFFICULTY": {
      return createInitialState(action.difficulty);
    }

    case "RESTART": {
      return createInitialState(state.difficulty);
    }

    case "START_AT": {
      const { x, y } = action;
      const config = DIFFICULTY_CONFIG[state.difficulty];
      const board = generateBoard(x, y, config);

      // 開始マスを開封
      board[y][x].isRevealed = true;

      const totalSafe = countTotalSafeCells(board, config.boardSize);
      const openedSafe = countOpenedSafeCells(board, config.boardSize);

      return {
        ...state,
        board,
        pickaxes: [{ id: "pickaxe-0", x, y, hasShield: false }],
        status: "playing",
        openedSafeCells: openedSafe,
        totalSafeCells: totalSafe,
        message: "フリックでつるはしを動かそう",
      };
    }

    case "SWIPE": {
      if (state.status !== "playing") return state;

      const config = DIFFICULTY_CONFIG[state.difficulty];
      const result = moveAllPickaxes(
        state.board,
        state.pickaxes,
        action.direction,
        config.boardSize,
        config.maxPickaxes
      );

      const newScore = state.score + result.scoreGain;
      const openedSafe = countOpenedSafeCells(result.board, config.boardSize);

      // ゲームオーバー判定
      if (result.pickaxes.length === 0) {
        const best = Math.max(state.bestScore, newScore);
        saveBestScore(best);
        return {
          ...state,
          board: result.board,
          pickaxes: [],
          status: "gameover",
          score: newScore,
          bestScore: best,
          openedSafeCells: openedSafe,
          message: "ゲームオーバー！つるはしが全滅しました",
        };
      }

      // クリア判定
      if (openedSafe >= state.totalSafeCells) {
        const clearBonus =
          SCORE_CLEAR_BONUS +
          SCORE_PICKAXE_BONUS * result.pickaxes.length;
        const finalScore = newScore + clearBonus;
        const best = Math.max(state.bestScore, finalScore);
        saveBestScore(best);
        return {
          ...state,
          board: result.board,
          pickaxes: result.pickaxes,
          status: "clear",
          score: finalScore,
          bestScore: best,
          openedSafeCells: openedSafe,
          message: `クリア！ボーナス +${clearBonus}`,
        };
      }

      return {
        ...state,
        board: result.board,
        pickaxes: result.pickaxes,
        score: newScore,
        openedSafeCells: openedSafe,
        message: getDirectionMessage(action.direction),
      };
    }

    default:
      return state;
  }
}

function getDirectionMessage(direction: Direction): string {
  switch (direction) {
    case "up":
      return "↑ 上へ移動";
    case "down":
      return "↓ 下へ移動";
    case "left":
      return "← 左へ移動";
    case "right":
      return "→ 右へ移動";
  }
}

export function useGame() {
  const [state, dispatch] = useReducer(
    gameReducer,
    "normal" as Difficulty,
    createInitialState
  );

  const startAt = useCallback((x: number, y: number) => {
    dispatch({ type: "START_AT", x, y });
  }, []);

  const swipe = useCallback((direction: Direction) => {
    dispatch({ type: "SWIPE", direction });
  }, []);

  const restart = useCallback(() => {
    dispatch({ type: "RESTART" });
  }, []);

  const setDifficulty = useCallback((difficulty: Difficulty) => {
    dispatch({ type: "SET_DIFFICULTY", difficulty });
  }, []);

  return { state, startAt, swipe, restart, setDifficulty };
}
