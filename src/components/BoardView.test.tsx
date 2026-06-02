import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BoardView } from "./BoardView";
import { board } from "../data/boardConfig";

describe("BoardView", () => {
  it("renders board rows exactly as configured", () => {
    render(<BoardView board={board} onLetter={vi.fn()} keySize="comfortable" />);

    const rows = screen.getAllByRole("row", { name: /letter row/i });
    expect(rows).toHaveLength(board.rows.length);

    rows.forEach((row, rowIndex) => {
      const buttons = within(row).getAllByRole("button");
      expect(buttons.map((button) => button.textContent)).toEqual(board.rows[rowIndex]);
    });
  });

  it("selects letters through ordinary button activation", async () => {
    const onLetter = vi.fn();

    render(<BoardView board={board} onLetter={onLetter} keySize="comfortable" />);
    fireEvent.click(screen.getByRole("button", { name: "A" }));
    fireEvent.click(screen.getByRole("button", { name: "B" }));

    expect(onLetter).toHaveBeenCalledWith("A");
    expect(onLetter).toHaveBeenCalledWith("B");
  });
});
