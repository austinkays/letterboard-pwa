import { describe, expect, it, vi } from "vitest";
import { csvForSession, plainTextForSession } from "./exportService";
import type { SpellingSession } from "../models/session";

describe("exportService", () => {
  const session: SpellingSession = {
    id: "session-1",
    startTime: "2026-06-01T15:00:00.000Z",
    selections: [
      { char: "H", timestamp: "2026-06-01T15:00:01.000Z" },
      { char: ",", timestamp: "2026-06-01T15:00:02.000Z" },
      { char: "<delete>", timestamp: "2026-06-01T15:00:03.000Z" },
    ],
    finalText: "H",
  };

  it("exports readable plain text with final text and selections", () => {
    expect(plainTextForSession(session)).toContain("Final text:\nH");
    expect(plainTextForSession(session)).toContain("2026-06-01T15:00:03.000Z\t<delete>");
  });

  it("escapes CSV selection values", () => {
    expect(csvForSession(session).split("\n")).toEqual([
      "timestamp,char",
      "2026-06-01T15:00:01.000Z,H",
      "2026-06-01T15:00:02.000Z,\",\"",
      "2026-06-01T15:00:03.000Z,<delete>",
    ]);
  });
});
