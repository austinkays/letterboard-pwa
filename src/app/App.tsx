import { useEffect, useMemo, useRef, useState } from "react";
import { BoardView } from "../components/BoardView";
import { ControlsRow } from "../components/ControlsRow";
import { SessionHistory } from "../components/SessionHistory";
import { SettingsPanel } from "../components/SettingsPanel";
import { TextDisplay } from "../components/TextDisplay";
import { board } from "../data/boardConfig";
import { createSession, type SpellingSession } from "../models/session";
import type { LetterboardSettings } from "../models/settings";
import { exportSession, type ExportFormat } from "../services/exportService";
import { requestScreenWakeLock } from "../services/pwaService";
import { defaultSettings, saveSettings, loadSettings } from "../services/settingsService";
import { sessionStore, type SessionStore } from "../services/sessionStore";
import { speechService, type SpeechController } from "../services/speechService";

interface AppServices {
  sessionStore: SessionStore;
  speech: SpeechController;
}

interface AppProps {
  services?: AppServices;
}

export function App({ services }: AppProps) {
  const activeServices = useMemo(
    () => services ?? { sessionStore, speech: speechService },
    [services],
  );
  const [text, setText] = useState("");
  const [settings, setSettings] = useState<LetterboardSettings>(() => loadSettings());
  const [session, setSession] = useState<SpellingSession>(() => createSession());
  const [sessions, setSessions] = useState<SpellingSession[]>([]);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(() => activeServices.speech.getVoices());
  const [confirmingClear, setConfirmingClear] = useState(false);
  const lastMotorSelectionRef = useRef<{ keyId: string; timestamp: number } | null>(null);

  const motorSettings = useMemo(
    () => ({
      selectionMode: settings.selectionMode,
      holdDurationMs: settings.holdDurationMs,
      showHoldProgress: settings.showHoldProgress,
    }),
    [settings.holdDurationMs, settings.selectionMode, settings.showHoldProgress],
  );

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    void activeServices.sessionStore.list().then(setSessions).catch(() => undefined);
  }, [activeServices.sessionStore]);

  useEffect(() => {
    let releaseWakeLock: (() => Promise<void>) | undefined;
    void requestScreenWakeLock().then((release) => {
      releaseWakeLock = release;
    });

    return () => {
      void releaseWakeLock?.();
    };
  }, []);

  useEffect(() => {
    if (!("speechSynthesis" in window)) {
      return;
    }

    const refreshVoices = () => setVoices(activeServices.speech.getVoices());
    refreshVoices();
    window.speechSynthesis.addEventListener("voiceschanged", refreshVoices);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", refreshVoices);
  }, [activeServices.speech]);

  const record = (char: string, nextText: string) => {
    const nextSession = {
      ...session,
      selections: [...session.selections, { char, timestamp: new Date().toISOString() }],
      finalText: nextText,
    };

    setSession(nextSession);
    void activeServices.sessionStore
      .save(nextSession)
      .then(() => {
        setSessions((current) => [nextSession, ...current.filter((saved) => saved.id !== nextSession.id)]);
      })
      .catch(() => undefined);
  };

  const speak = (spokenText: string) => {
    if (!settings.masterMute && spokenText.trim().length > 0) {
      activeServices.speech.speak(spokenText, settings);
    }
  };

  const handleLetter = (letter: string) => {
    const nextText = `${text}${letter}`;
    setText(nextText);
    record(letter, nextText);

    if (settings.speakLetters) {
      speak(letter);
    }
  };

  const handleSpace = () => {
    const word = text.trimEnd().split(/\s+/).filter(Boolean).at(-1) ?? "";
    const nextText = `${text} `;
    setText(nextText);
    record(" ", nextText);

    if (settings.speakWords && word.length > 0) {
      speak(word);
    }
  };

  const handleDelete = () => {
    const nextText = text.slice(0, -1);
    setText(nextText);
    record("<delete>", nextText);
  };

  const handleConfirmClear = () => {
    setText("");
    setConfirmingClear(false);
    record("<clear>", "");
  };

  const handleSpeak = () => {
    record("<speak>", text);
    speak(text);
  };

  const runWithRepeatGuard = (keyId: string, action: () => void) => {
    const now = Date.now();
    const lastSelection = lastMotorSelectionRef.current;

    if (
      settings.repeatGuardMs > 0 &&
      lastSelection?.keyId === keyId &&
      now - lastSelection.timestamp < settings.repeatGuardMs
    ) {
      return;
    }

    lastMotorSelectionRef.current = { keyId, timestamp: now };
    action();
  };

  const handleMotorLetter = (letter: string) => {
    runWithRepeatGuard(`letter:${letter}`, () => handleLetter(letter));
  };

  const handleMotorSpace = () => {
    runWithRepeatGuard("control:space", handleSpace);
  };

  const handleMotorDelete = () => {
    runWithRepeatGuard("control:delete", handleDelete);
  };

  const handleMotorSpeak = () => {
    runWithRepeatGuard("control:speak", handleSpeak);
  };

  const handleTestVoice = () => {
    speak("Voice test");
  };

  const handleResetSettings = () => {
    setSettings(defaultSettings);
  };

  const handleExport = (targetSession: SpellingSession, format: ExportFormat) => {
    void exportSession(targetSession, format);
  };

  return (
    <main
      className="letterboard-app"
      data-theme={settings.theme}
      data-appearance={settings.appearance}
      data-reduced-motion={settings.reducedMotion}
    >
      <div className="app-shell">
        <header className="app-header">
          <img src="icons/icon.svg" alt="" aria-hidden="true" />
          <h1>Letterboard</h1>
        </header>

        <TextDisplay text={text} />

        <BoardView board={board} keySize={settings.keySize} motorSettings={motorSettings} onLetter={handleMotorLetter} />

        <ControlsRow
          keySize={settings.keySize}
          motorSettings={motorSettings}
          onSpace={handleMotorSpace}
          onDelete={handleMotorDelete}
          onClear={() => setConfirmingClear(true)}
          onSpeak={handleMotorSpeak}
        />

        <div className="utility-panels">
          <SettingsPanel
            settings={settings}
            voices={voices}
            onSettingsChange={setSettings}
            onResetSettings={handleResetSettings}
            onTestVoice={handleTestVoice}
          />
          <SessionHistory currentSession={session} sessions={sessions} onExport={handleExport} />
        </div>
      </div>

      {confirmingClear ? (
        <div className="clear-dialog-backdrop" role="presentation">
          <div className="clear-dialog" role="dialog" aria-modal="true" aria-labelledby="clear-dialog-title">
            <h2 id="clear-dialog-title">Clear current message?</h2>
            <div className="dialog-actions">
              <button type="button" onClick={() => setConfirmingClear(false)}>
                Cancel
              </button>
              <button type="button" className="danger-action" onClick={handleConfirmClear}>
                Confirm clear
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
