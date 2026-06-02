import type { KeySize } from "../models/board";
import type { MotorAccessSettings } from "../models/settings";
import { KeyButton } from "./KeyButton";

interface ControlsRowProps {
  keySize: KeySize;
  motorSettings?: MotorAccessSettings;
  onSpace(): void;
  onDelete(): void;
  onClear(): void;
  onSpeak(): void;
}

export function ControlsRow({ keySize, motorSettings, onSpace, onDelete, onClear, onSpeak }: ControlsRowProps) {
  return (
    <section className="controls-row" aria-label="Letterboard controls">
      <KeyButton
        label="Space"
        keySize={keySize}
        motorSettings={motorSettings}
        onSelect={onSpace}
        className="control-key wide-key"
      />
      <KeyButton label="Delete" keySize={keySize} motorSettings={motorSettings} onSelect={onDelete} className="control-key" />
      <KeyButton label="Clear" keySize={keySize} onSelect={onClear} className="control-key danger-key" />
      <KeyButton label="Speak" keySize={keySize} motorSettings={motorSettings} onSelect={onSpeak} className="control-key speak-key" />
    </section>
  );
}
