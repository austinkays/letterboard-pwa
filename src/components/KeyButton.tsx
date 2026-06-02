import { useEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, PointerEvent as ReactPointerEvent } from "react";
import type { KeySize } from "../models/board";
import type { MotorAccessSettings } from "../models/settings";

interface KeyButtonProps {
  label: string;
  keySize: KeySize;
  onSelect(): void;
  className?: string;
  motorSettings?: MotorAccessSettings;
}

const immediateMotorSettings: MotorAccessSettings = {
  selectionMode: "immediate",
  holdDurationMs: 1000,
  showHoldProgress: false,
};

const releaseSelections = new WeakMap<HTMLButtonElement, () => void>();
let releasePointerId: number | null = null;
let releaseCleanup: (() => void) | undefined;

function clearReleasePointer() {
  releasePointerId = null;
  releaseCleanup?.();
  releaseCleanup = undefined;
}

function armReleasePointer(pointerId: number) {
  clearReleasePointer();
  releasePointerId = pointerId;

  const completeRelease = (event: PointerEvent) => {
    if (releasePointerId !== event.pointerId) {
      return;
    }

    const releaseTarget = findReleaseTarget(event);
    const select = releaseTarget ? releaseSelections.get(releaseTarget) : undefined;
    clearReleasePointer();
    select?.();
  };

  const cancelRelease = () => clearReleasePointer();

  window.addEventListener("pointerup", completeRelease);
  window.addEventListener("pointercancel", cancelRelease);
  releaseCleanup = () => {
    window.removeEventListener("pointerup", completeRelease);
    window.removeEventListener("pointercancel", cancelRelease);
  };
}

function findReleaseTarget(event: PointerEvent): HTMLButtonElement | null {
  const coordinateTarget = document.elementFromPoint?.(event.clientX, event.clientY);
  const fallbackTarget = event.target instanceof Element ? event.target : null;
  const target = coordinateTarget ?? fallbackTarget;
  return target?.closest<HTMLButtonElement>("[data-motor-key='true']") ?? null;
}

export function KeyButton({ label, keySize, onSelect, className = "", motorSettings = immediateMotorSettings }: KeyButtonProps) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const latestOnSelectRef = useRef(onSelect);
  const holdTimerRef = useRef<number | undefined>(undefined);
  const selectedDuringContactRef = useRef(false);
  const [holdActive, setHoldActive] = useState(false);

  useEffect(() => {
    latestOnSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) {
      return undefined;
    }

    releaseSelections.set(button, () => latestOnSelectRef.current());
    return () => {
      releaseSelections.delete(button);
    };
  }, []);

  useEffect(() => {
    if (motorSettings.selectionMode !== "hold") {
      clearHold();
    }

    return clearHold;
  }, [motorSettings.selectionMode, motorSettings.holdDurationMs]);

  const clearHold = () => {
    if (holdTimerRef.current !== undefined) {
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = undefined;
    }

    setHoldActive(false);
  };

  const selectNow = () => {
    latestOnSelectRef.current();
  };

  const startHold = () => {
    if (motorSettings.selectionMode !== "hold" || selectedDuringContactRef.current || holdTimerRef.current !== undefined) {
      return;
    }

    setHoldActive(true);
    holdTimerRef.current = window.setTimeout(() => {
      holdTimerRef.current = undefined;
      selectedDuringContactRef.current = true;
      setHoldActive(false);
      selectNow();
    }, motorSettings.holdDurationMs);
  };

  const endContact = () => {
    selectedDuringContactRef.current = false;
    clearHold();
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (motorSettings.selectionMode === "release") {
      armReleasePointer(event.nativeEvent.pointerId);
      return;
    }

    if (motorSettings.selectionMode === "hold") {
      startHold();
    }
  };

  const handlePointerEnter = () => {
    if (motorSettings.selectionMode === "hold") {
      startHold();
    }
  };

  const handlePointerLeave = () => {
    if (motorSettings.selectionMode === "hold") {
      endContact();
    }
  };

  const handlePointerUp = () => {
    if (motorSettings.selectionMode === "hold") {
      endContact();
    }
  };

  const handlePointerCancel = () => {
    if (motorSettings.selectionMode === "hold") {
      endContact();
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (motorSettings.selectionMode === "immediate" || (event.key !== "Enter" && event.key !== " ")) {
      return;
    }

    event.preventDefault();
    selectNow();
  };

  const style = {
    "--hold-duration": `${motorSettings.holdDurationMs}ms`,
  } as CSSProperties;

  return (
    <button
      ref={buttonRef}
      type="button"
      className={`key-button ${className}`.trim()}
      data-key-size={keySize}
      data-motor-key="true"
      data-selection-mode={motorSettings.selectionMode}
      data-hold-active={holdActive}
      data-show-hold-progress={motorSettings.showHoldProgress}
      aria-label={label}
      style={style}
      onClick={motorSettings.selectionMode === "immediate" ? onSelect : undefined}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
      {label}
    </button>
  );
}
