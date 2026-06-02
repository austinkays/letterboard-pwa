import type { KeySize } from "../models/board";
import { KeyButton } from "./KeyButton";

interface ControlsRowProps {
  keySize: KeySize;
  onSpace(): void;
  onDelete(): void;
  onClear(): void;
  onSpeak(): void;
}

export function ControlsRow({ keySize, onSpace, onDelete, onClear, onSpeak }: ControlsRowProps) {
  return (
    <section className="controls-row" aria-label="Letterboard controls">
      <KeyButton label="Space" keySize={keySize} onSelect={onSpace} className="control-key wide-key" />
      <KeyButton label="Delete" keySize={keySize} onSelect={onDelete} className="control-key" />
      <KeyButton label="Clear" keySize={keySize} onSelect={onClear} className="control-key danger-key" />
      <KeyButton label="Speak" keySize={keySize} onSelect={onSpeak} className="control-key speak-key" />
    </section>
  );
}
