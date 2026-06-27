import { useEffect, useRef } from "react";
import type { Direction } from "../game/types";
import { SWIPE_THRESHOLD } from "../game/constants";

type UseSwipeOptions = {
  onSwipe: (direction: Direction) => void;
  elementRef: React.RefObject<HTMLElement | null>;
  disabled?: boolean;
};

export function useSwipe({ onSwipe, elementRef, disabled }: UseSwipeOptions) {
  const startPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (disabled) return;
      const touch = e.touches[0];
      startPos.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (disabled || !startPos.current) return;
      const touch = e.changedTouches[0];
      handleEnd(touch.clientX, touch.clientY);
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (disabled) return;
      startPos.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (disabled || !startPos.current) return;
      handleEnd(e.clientX, e.clientY);
    };

    const handleEnd = (endX: number, endY: number) => {
      if (!startPos.current) return;
      const dx = endX - startPos.current.x;
      const dy = endY - startPos.current.y;
      startPos.current = null;

      if (Math.abs(dx) < SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD) {
        return;
      }

      let direction: Direction;
      if (Math.abs(dx) > Math.abs(dy)) {
        direction = dx > 0 ? "right" : "left";
      } else {
        direction = dy > 0 ? "down" : "up";
      }
      onSwipe(direction);
    };

    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchend", handleTouchEnd);
    el.addEventListener("pointerdown", handlePointerDown);
    el.addEventListener("pointerup", handlePointerUp);

    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchend", handleTouchEnd);
      el.removeEventListener("pointerdown", handlePointerDown);
      el.removeEventListener("pointerup", handlePointerUp);
    };
  }, [onSwipe, elementRef, disabled]);

  // キーボード操作
  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      let direction: Direction | null = null;
      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          direction = "up";
          break;
        case "ArrowDown":
        case "s":
        case "S":
          direction = "down";
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          direction = "left";
          break;
        case "ArrowRight":
        case "d":
        case "D":
          direction = "right";
          break;
      }
      if (direction) {
        e.preventDefault();
        onSwipe(direction);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onSwipe, disabled]);
}
