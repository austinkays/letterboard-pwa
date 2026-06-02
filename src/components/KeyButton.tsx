import type { KeySize } from "../models/board";

interface KeyButtonProps {
  label: string;
  keySize: KeySize;
  onSelect(): void;
  className?: string;
}

export function KeyButton({ label, keySize, onSelect, className = "" }: KeyButtonProps) {
  return (
    <button
      type="button"
      className={`key-button ${className}`.trim()}
      data-key-size={keySize}
      aria-label={label}
      onClick={onSelect}
    >
      {label}
    </button>
  );
}
