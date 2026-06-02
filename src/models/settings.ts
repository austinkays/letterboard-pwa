import type { KeySize } from "./board";

export type ThemePreset = "calm" | "coastal" | "highContrast";
export type AppearanceMode = "system" | "light" | "dark";

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
}
