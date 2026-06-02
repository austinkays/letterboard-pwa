import type { HoldDurationMs, LetterboardSettings, RepeatGuardMs, SelectionMode } from "../models/settings";

interface SettingsPanelProps {
  settings: LetterboardSettings;
  voices: SpeechSynthesisVoice[];
  onSettingsChange(settings: LetterboardSettings): void;
  onResetSettings(): void;
  onTestVoice(): void;
}

type SettingChoice<Value extends string | number> = {
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

const selectionModeChoices: SettingChoice<SelectionMode>[] = [
  { value: "immediate", label: "Immediate", ariaLabel: "Immediate selection mode" },
  { value: "release", label: "Release to Select", ariaLabel: "Release to Select selection mode" },
  { value: "hold", label: "Hold to Select", ariaLabel: "Hold to Select (Experimental) selection mode" },
];

const holdDurationChoices: SettingChoice<HoldDurationMs>[] = [
  { value: 500, label: "0.5s", ariaLabel: "0.5s hold time" },
  { value: 1000, label: "1.0s", ariaLabel: "1.0s hold time" },
  { value: 1500, label: "1.5s", ariaLabel: "1.5s hold time" },
  { value: 2000, label: "2.0s", ariaLabel: "2.0s hold time" },
];

const repeatGuardChoices: SettingChoice<RepeatGuardMs>[] = [
  { value: 0, label: "Off", ariaLabel: "Off ignore repeat" },
  { value: 500, label: "0.5s", ariaLabel: "0.5s ignore repeat" },
  { value: 1000, label: "1.0s", ariaLabel: "1.0s ignore repeat" },
  { value: 1500, label: "1.5s", ariaLabel: "1.5s ignore repeat" },
];

export function SettingsPanel({ settings, voices, onSettingsChange, onResetSettings, onTestVoice }: SettingsPanelProps) {
  const update = <Key extends keyof LetterboardSettings>(key: Key, value: LetterboardSettings[Key]) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const updateSelectionMode = (selectionMode: SelectionMode) => {
    onSettingsChange({
      ...settings,
      selectionMode,
      showHoldProgress: selectionMode === "hold",
    });
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

        <fieldset className="setting-group setting-group-wide">
          <legend>Motor Access</legend>
          <div className="motor-access-grid">
            <div className="setting-stack">
              <span className="setting-label">Selection Mode</span>
              <div className="segmented-control segmented-control-wide">
                {selectionModeChoices.map((choice) => (
                  <button
                    type="button"
                    className="setting-option"
                    aria-label={choice.ariaLabel}
                    aria-pressed={settings.selectionMode === choice.value}
                    data-selected={settings.selectionMode === choice.value}
                    onClick={() => updateSelectionMode(choice.value)}
                    key={choice.value}
                  >
                    {choice.label}
                    {choice.value === "hold" ? <span className="option-note">Experimental</span> : null}
                  </button>
                ))}
              </div>
            </div>

            <div className="setting-stack">
              <span className="setting-label">Hold Time</span>
              <div className="segmented-control segmented-control-four">
                {holdDurationChoices.map((choice) => (
                  <button
                    type="button"
                    className="setting-option"
                    aria-label={choice.ariaLabel}
                    aria-pressed={settings.holdDurationMs === choice.value}
                    data-selected={settings.holdDurationMs === choice.value}
                    disabled={settings.selectionMode !== "hold"}
                    onClick={() => update("holdDurationMs", choice.value)}
                    key={choice.value}
                  >
                    {choice.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="setting-stack">
              <span className="setting-label">Ignore Repeat</span>
              <div className="segmented-control segmented-control-four">
                {repeatGuardChoices.map((choice) => (
                  <button
                    type="button"
                    className="setting-option"
                    aria-label={choice.ariaLabel}
                    aria-pressed={settings.repeatGuardMs === choice.value}
                    data-selected={settings.repeatGuardMs === choice.value}
                    onClick={() => update("repeatGuardMs", choice.value)}
                    key={choice.value}
                  >
                    {choice.label}
                  </button>
                ))}
              </div>
            </div>

            <ToggleButton
              label="Show Timer Ring"
              checked={settings.showHoldProgress}
              disabled={settings.selectionMode !== "hold"}
              onToggle={() => update("showHoldProgress", !settings.showHoldProgress)}
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
  disabled?: boolean;
  onToggle(): void;
}

function ToggleButton({ label, checked, disabled = false, onToggle }: ToggleButtonProps) {
  return (
    <button
      type="button"
      className="toggle-button"
      role="switch"
      aria-label={label}
      aria-checked={checked}
      disabled={disabled}
      onClick={onToggle}
    >
      <span>{label}</span>
      <span className="toggle-state" aria-hidden="true">
        {checked ? "On" : "Off"}
      </span>
    </button>
  );
}
