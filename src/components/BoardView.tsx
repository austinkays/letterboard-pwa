import type { Board, KeySize } from "../models/board";
import { KeyButton } from "./KeyButton";

interface BoardViewProps {
  board: Board;
  keySize: KeySize;
  onLetter(letter: string): void;
}

export function BoardView({ board, keySize, onLetter }: BoardViewProps) {
  return (
    <section className="board-section" aria-labelledby="board-title">
      <h2 id="board-title">{board.name}</h2>
      <div className="board-grid" role="grid" aria-label={board.name}>
        {board.rows.map((row, rowIndex) => (
          <div
            className="letter-row"
            role="row"
            aria-label={`Letter row ${rowIndex + 1}`}
            style={{ "--row-length": row.length } as React.CSSProperties}
            key={`${rowIndex}-${row.join("")}`}
          >
            {row.map((letter) => (
              <KeyButton key={letter} label={letter} keySize={keySize} onSelect={() => onLetter(letter)} />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
