import type { SpellingSession } from "../models/session";
import type { ExportFormat } from "../services/exportService";

interface SessionHistoryProps {
  currentSession: SpellingSession;
  sessions: SpellingSession[];
  onExport(session: SpellingSession, format: ExportFormat): void;
}

export function SessionHistory({ currentSession, sessions, onExport }: SessionHistoryProps) {
  const visibleSessions = sessions.filter((session) => session.selections.length > 0).slice(0, 8);

  return (
    <details className="panel history-panel">
      <summary>Session Log</summary>
      <div className="export-actions" aria-label="Export current session">
        <button type="button" onClick={() => onExport(currentSession, "txt")}>
          Export TXT
        </button>
        <button type="button" onClick={() => onExport(currentSession, "csv")}>
          Export CSV
        </button>
      </div>

      <ol className="session-list" aria-label="Saved sessions">
        {visibleSessions.map((session) => (
          <li key={session.id}>
            <span>{new Date(session.startTime).toLocaleString()}</span>
            <span>{session.finalText || "No final text"}</span>
            <div>
              <button type="button" onClick={() => onExport(session, "txt")}>
                TXT
              </button>
              <button type="button" onClick={() => onExport(session, "csv")}>
                CSV
              </button>
            </div>
          </li>
        ))}
      </ol>
    </details>
  );
}
