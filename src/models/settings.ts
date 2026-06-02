import type { KeySize } from "./board";

export type ThemePreset = "calm" | "coastal" | "highContrast";
export type AppearanceMode = "system" | "light" | "dark";
export type SelectionMode = "immediate" | "release" | "hold";
export type HoldDurationMs = 500 | 1000 | 1500 | 2000;
export type RepeatGuardMs = 0 | 500 | 1000 | 1500;

export interface LetterboardSettings {
  theme: ThemePreset;
  appearance: AppearanceMode;
  keySize: KeySize;
  reducedMotion: boolean;
  masterMute: boolean;
  speakLetters: boolean;
  speakWords: boolean;
  voiceURI: string;
  rate: number;
  volume: number;
  selectionMode: SelectionMode;
  holdDurationMs: HoldDurationMs;
  repeatGuardMs: RepeatGuardMs;
  showHoldProgress: boolean;
}

export type MotorAccessSettings = Pick<
  LetterboardSettings,
  "selectionMode" | "holdDurationMs" | "showHoldProgress"
>;
