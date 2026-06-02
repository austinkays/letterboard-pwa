import type { LetterboardSettings } from "../models/settings";

interface SettingsPanelProps {
  settings: LetterboardSettings;
  voices: SpeechSynthesisVoice[];
  onSettingsChange(settings: LetterboardSettings): void;
  onResetSettings(): void;
  onTestVoice(): void;
}

type SettingChoice<Value extends string> = {
  value: Value;
  label: string;
  ariaLabel: string;
};

const themeChoices: SettingChoice<LetterboardSettings["theme"]>[] = [
  { value: "calm", label: "Calm", ariaLabel: "Calm theme" },
  { value: "coastal", label: "Coastal", ariaLabel: "Coastal theme" },
  { value: "highContrast", label: "High Contrast", ariaLabel: "High Contrast theme" },
];

const appearanceChoices: SettingChoice<LetterboardSettings["appearance"]>[] = [
  { value: "system", label: "System", ariaLabel: "System appearance" },
  { value: "light", label: "Light", ariaLabel: "Light appearance" },
  { value: "dark", label: "Dark", ariaLabel: "Dark appearance" },
];

const keySizeChoices: SettingChoice<LetterboardSettings["keySize"]>[] = [
  { value: "comfortable", label: "Comfortable", ariaLabel: "Comfortable key size" },
  { value: "large", label: "Large", ariaLabel: "Large key size" },
  { value: "extraLarge", label: "Extra Large", ariaLabel: "Extra Large key size" },
];

export function SettingsPanel({ settings, voices, onSettingsChange, onResetSettings, onTestVoice }: SettingsPanelProps) {
  const update = <Key extends keyof LetterboardSettings>(key: Key, value: LetterboardSettings[Key]) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <section className="panel settings-panel" aria-labelledby="settings-title">
      <div className="settings-heading">
        <h2 id="settings-title">Settings</h2>
        <div className="settings-actions">
          <button type="button" className="secondary-action" onClick={onTestVoice}>
            Test voice
          </button>
          <button type="button" className="secondary-action" onClick={onResetSettings}>
            Reset settings
          </button>
        </div>
      </div>

      <div className="settings-grid">
        <fieldset className="setting-group">
          <legend>Theme</legend>
          <div className="segmented-control">
            {themeChoices.map((choice) => (
              <button
                type="button"
                className="setting-option"
                aria-label={choice.ariaLabel}
                aria-pressed={settings.theme === choice.value}
                data-selected={settings.theme === choice.value}
                onClick={() => update("theme", choice.value)}
                key={choice.value}
              >
                {choice.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="setting-group">
          <legend>Appearance</legend>
          <div className="segmented-control">
            {appearanceChoices.map((choice) => (
              <button
                type="button"
                className="setting-option"
                aria-label={choice.ariaLabel}
                aria-pressed={settings.appearance === choice.value}
                data-selected={settings.appearance === choice.value}
                onClick={() => update("appearance", choice.value)}
                key={choice.value}
              >
                {choice.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="setting-group">
          <legend>Key Size</legend>
          <div className="segmented-control">
            {keySizeChoices.map((choice) => (
              <button
                type="button"
                className="setting-option"
                aria-label={choice.ariaLabel}
                aria-pressed={settings.keySize === choice.value}
                data-selected={settings.keySize === choice.value}
                onClick={() => update("keySize", choice.value)}
                key={choice.value}
              >
                {choice.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="setting-group">
          <legend>Speech</legend>
          <div className="toggle-grid">
            <ToggleButton label="Master Mute" checked={settings.masterMute} onToggle={() => update("masterMute", !settings.masterMute)} />
            <ToggleButton
              label="Speak Each Letter"
              checked={settings.speakLetters}
              onToggle={() => update("speakLetters", !settings.speakLetters)}
            />
            <ToggleButton
              label="Speak Completed Word"
              checked={settings.speakWords}
              onToggle={() => update("speakWords", !settings.speakWords)}
            />
            <ToggleButton
              label="Reduced Motion"
              checked={settings.reducedMotion}
              onToggle={() => update("reducedMotion", !settings.reducedMotion)}
            />
          </div>
        </fieldset>

        <label className="setting-field">
          Voice
          <select value={settings.voiceURI} onChange={(event) => update("voiceURI", event.target.value)}>
            <option value="">System Default</option>
            {voices.map((voice) => (
              <option value={voice.voiceURI} key={voice.voiceURI}>
                {voice.name} ({voice.lang})
              </option>
            ))}
          </select>
        </label>

        <label className="setting-field">
          <span>Rate {settings.rate.toFixed(1)}</span>
          <input
            type="range"
            min="0.1"
            max="1.5"
            step="0.1"
            value={settings.rate}
            onChange={(event) => update("rate", Number(event.target.value))}
          />
        </label>

        <label className="setting-field">
          <span>Volume {Math.round(settings.volume * 100)}%</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={settings.volume}
            onChange={(event) => update("volume", Number(event.target.value))}
          />
        </label>
      </div>
    </section>
  );
}

interface ToggleButtonProps {
  label: string;
  checked: boolean;
  onToggle(): void;
}

function ToggleButton({ label, checked, onToggle }: ToggleButtonProps) {
  return (
    <button type="button" className="toggle-button" role="switch" aria-label={label} aria-checked={checked} onClick={onToggle}>
      <span>{label}</span>
      <span className="toggle-state" aria-hidden="true">
        {checked ? "On" : "Off"}
      </span>
    </button>
  );
}
