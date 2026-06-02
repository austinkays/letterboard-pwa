import type { LetterboardSettings } from "../models/settings";

interface SettingsPanelProps {
  settings: LetterboardSettings;
  voices: SpeechSynthesisVoice[];
  onSettingsChange(settings: LetterboardSettings): void;
}

export function SettingsPanel({ settings, voices, onSettingsChange }: SettingsPanelProps) {
  const update = <Key extends keyof LetterboardSettings>(key: Key, value: LetterboardSettings[Key]) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <details className="panel settings-panel">
      <summary>Settings</summary>
      <div className="settings-grid">
        <label>
          Theme
          <select value={settings.theme} onChange={(event) => update("theme", event.target.value as LetterboardSettings["theme"])}>
            <option value="calm">Calm</option>
            <option value="coastal">Coastal</option>
            <option value="highContrast">High Contrast</option>
          </select>
        </label>

        <label>
          Appearance
          <select
            value={settings.appearance}
            onChange={(event) => update("appearance", event.target.value as LetterboardSettings["appearance"])}
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>

        <label>
          Key Size
          <select value={settings.keySize} onChange={(event) => update("keySize", event.target.value as LetterboardSettings["keySize"])}>
            <option value="comfortable">Comfortable</option>
            <option value="large">Large</option>
            <option value="extraLarge">Extra Large</option>
          </select>
        </label>

        <label>
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

        <label>
          Rate
          <input
            type="range"
            min="0.1"
            max="1.5"
            step="0.1"
            value={settings.rate}
            onChange={(event) => update("rate", Number(event.target.value))}
          />
        </label>

        <label>
          Volume
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={settings.volume}
            onChange={(event) => update("volume", Number(event.target.value))}
          />
        </label>

        <label className="check-row">
          <input type="checkbox" checked={settings.reducedMotion} onChange={(event) => update("reducedMotion", event.target.checked)} />
          Reduced Motion
        </label>

        <label className="check-row">
          <input type="checkbox" checked={settings.masterMute} onChange={(event) => update("masterMute", event.target.checked)} />
          Master Mute
        </label>

        <label className="check-row">
          <input type="checkbox" checked={settings.speakLetters} onChange={(event) => update("speakLetters", event.target.checked)} />
          Speak Each Letter
        </label>

        <label className="check-row">
          <input type="checkbox" checked={settings.speakWords} onChange={(event) => update("speakWords", event.target.checked)} />
          Speak Completed Word
        </label>
      </div>
    </details>
  );
}
