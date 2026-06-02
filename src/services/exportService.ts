import type { SpellingSession } from "../models/session";

export type ExportFormat = "txt" | "csv";

export function plainTextForSession(session: SpellingSession): string {
  return [
    "Letterboard Session",
    `Start time: ${session.startTime}`,
    "",
    "Final text:",
    session.finalText,
    "",
    "Selections:",
    ...session.selections.map((selection) => `${selection.timestamp}\t${selection.char}`),
  ].join("\n");
}

export function csvForSession(session: SpellingSession): string {
  return ["timestamp,char", ...session.selections.map((selection) => `${selection.timestamp},${escapeCSV(selection.char)}`)].join(
    "\n",
  );
}

export async function exportSession(session: SpellingSession, format: ExportFormat): Promise<void> {
  const filename = `Letterboard-${session.startTime.slice(0, 10)}-${session.id}.${format}`;
  const mimeType = format === "csv" ? "text/csv;charset=utf-8" : "text/plain;charset=utf-8";
  const content = format === "csv" ? csvForSession(session) : plainTextForSession(session);
  const blob = new Blob([content], { type: mimeType });
  const file = new File([blob], filename, { type: mimeType });

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: "Letterboard session" });
      return;
    } catch {
      downloadBlob(blob, filename);
      return;
    }
  }

  if (navigator.share) {
    try {
      await navigator.share({ text: content, title: "Letterboard session" });
      return;
    } catch {
      downloadBlob(blob, filename);
      return;
    }
  }

  downloadBlob(blob, filename);
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function escapeCSV(value: string): string {
  return /[",\n\r]/.test(value) ? `"${value.replaceAll("\"", "\"\"")}"` : value;
}
