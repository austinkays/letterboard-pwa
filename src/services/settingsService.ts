import type {
  AppearanceMode,
  HoldDurationMs,
  LetterboardSettings,
  RepeatGuardMs,
  SelectionMode,
  ThemePreset,
} from "../models/settings";
import type { KeySize } from "../models/board";

const storageKey = "letterboard.settings.v1";

const themes = new Set<ThemePreset>(["calm", "coastal", "highContrast"]);
const appearances = new Set<AppearanceMode>(["system", "light", "dark"]);
const keySizes = new Set<KeySize>(["comfortable", "large", "extraLarge"]);
const selectionModes = new Set<SelectionMode>(["immediate", "release", "hold"]);
const holdDurations = new Set<HoldDurationMs>([500, 1000, 1500, 2000]);
const repeatGuards = new Set<RepeatGuardMs>([0, 500, 1000, 1500]);

export const defaultSettings: LetterboardSettings = {
  theme: "calm",
  appearance: "system",
  keySize: "comfortable",
  reducedMotion: true,
  masterMute: true,
  speakLetters: false,
  speakWords: false,
  voiceURI: "",
  rate: 0.7,
  volume: 1,
  selectionMode: "immediate",
  holdDurationMs: 1000,
  repeatGuardMs: 0,
  showHoldProgress: false,
};

export function loadSettings(storage: Storage = localStorage): LetterboardSettings {
  const stored = storage.getItem(storageKey);
  if (!stored) {
    return defaultSettings;
  }

  try {
    const parsed = JSON.parse(stored) as Partial<LetterboardSettings>;
    return normalizeSettings(parsed);
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: LetterboardSettings, storage: Storage = localStorage): void {
  storage.setItem(storageKey, JSON.stringify(normalizeSettings(settings)));
}

function normalizeSettings(settings: Partial<LetterboardSettings>): LetterboardSettings {
  return {
    theme: themes.has(settings.theme as ThemePreset) ? (settings.theme as ThemePreset) : defaultSettings.theme,
    appearance: appearances.has(settings.appearance as AppearanceMode)
      ? (settings.appearance as AppearanceMode)
      : defaultSettings.appearance,
    keySize: keySizes.has(settings.keySize as KeySize) ? (settings.keySize as KeySize) : defaultSettings.keySize,
    reducedMotion: typeof settings.reducedMotion === "boolean" ? settings.reducedMotion : defaultSettings.reducedMotion,
    masterMute: typeof settings.masterMute === "boolean" ? settings.masterMute : defaultSettings.masterMute,
    speakLetters: typeof settings.speakLetters === "boolean" ? settings.speakLetters : defaultSettings.speakLetters,
    speakWords: typeof settings.speakWords === "boolean" ? settings.speakWords : defaultSettings.speakWords,
    voiceURI: typeof settings.voiceURI === "string" ? settings.voiceURI : defaultSettings.voiceURI,
    rate: boundedNumber(settings.rate, 0.1, 1.5, defaultSettings.rate),
    volume: boundedNumber(settings.volume, 0, 1, defaultSettings.volume),
    selectionMode: selectionModes.has(settings.selectionMode as SelectionMode)
      ? (settings.selectionMode as SelectionMode)
      : defaultSettings.selectionMode,
    holdDurationMs: holdDurations.has(settings.holdDurationMs as HoldDurationMs)
      ? (settings.holdDurationMs as HoldDurationMs)
      : defaultSettings.holdDurationMs,
    repeatGuardMs: repeatGuards.has(settings.repeatGuardMs as RepeatGuardMs)
      ? (settings.repeatGuardMs as RepeatGuardMs)
      : defaultSettings.repeatGuardMs,
    showHoldProgress:
      typeof settings.showHoldProgress === "boolean" ? settings.showHoldProgress : defaultSettings.showHoldProgress,
  };
}

function boundedNumber(value: unknown, min: number, max: number, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.min(Math.max(value, min), max) : fallback;
}
