export interface SelectionLog {
  char: string;
  timestamp: string;
}

export interface SpellingSession {
  id: string;
  startTime: string;
  selections: SelectionLog[];
  finalText: string;
}

export function createSession(now: () => Date = () => new Date()): SpellingSession {
  return {
    id: crypto.randomUUID(),
    startTime: now().toISOString(),
    selections: [],
    finalText: "",
  };
}
