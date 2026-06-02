export interface Board {
  name: string;
  rows: readonly (readonly string[])[];
}

export type KeySize = "comfortable" | "large" | "extraLarge";
