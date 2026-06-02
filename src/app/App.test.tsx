import { act } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";

describe("App", () => {
  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  it("spells text and logs selections for letters, space, delete, and speak", async () => {
    const saveSession = vi.fn().mockResolvedValue(undefined);
    const speak = vi.fn();

    render(<App services={{ sessionStore: { save: saveSession, list: vi.fn().mockResolvedValue([]) }, speech: { speak, getVoices: () => [] } }} />);

    fireEvent.click(screen.getByRole("button", { name: "H" }));
    fireEvent.click(screen.getByRole("button", { name: "I" }));
    fireEvent.click(screen.getByRole("button", { name: "Space" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    fireEvent.click(screen.getByRole("button", { name: "Speak" }));

    expect(screen.getByLabelText("Current message")).toHaveTextContent("HI");
    expect(speak).not.toHaveBeenCalled();

    await waitFor(() => expect(saveSession).toHaveBeenCalled());
    const savedSession = saveSession.mock.calls.at(-1)?.[0];
    expect(savedSession.selections.map((selection: { char: string }) => selection.char)).toEqual([
      "H",
      "I",
      " ",
      "<delete>",
      "<speak>",
    ]);
    expect(savedSession.finalText).toBe("HI");
  });

  it("requires confirmation before clearing text", async () => {
    const saveSession = vi.fn().mockResolvedValue(undefined);

    render(<App services={{ sessionStore: { save: saveSession, list: vi.fn().mockResolvedValue([]) }, speech: { speak: vi.fn(), getVoices: () => [] } }} />);

    fireEvent.click(screen.getByRole("button", { name: "A" }));
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));

    expect(screen.getByLabelText("Current message")).toHaveTextContent("A");
    fireEvent.click(screen.getByRole("button", { name: "Confirm clear" }));

    expect(screen.getByLabelText("Current message")).toHaveTextContent("No message yet");
    await waitFor(() => expect(saveSession).toHaveBeenCalledTimes(2));
  });

  it("applies, persists, tests, and resets settings from the panel", async () => {
    const speak = vi.fn();

    render(<App services={{ sessionStore: { save: vi.fn().mockResolvedValue(undefined), list: vi.fn().mockResolvedValue([]) }, speech: { speak, getVoices: () => [] } }} />);

    fireEvent.click(screen.getByRole("button", { name: "High Contrast theme" }));
    fireEvent.click(screen.getByRole("button", { name: "Large key size" }));
    fireEvent.click(screen.getByRole("switch", { name: "Master Mute" }));
    fireEvent.click(screen.getByRole("button", { name: "Test voice" }));

    expect(screen.getByRole("main")).toHaveAttribute("data-theme", "highContrast");
    expect(screen.getByRole("button", { name: "A" })).toHaveAttribute("data-key-size", "large");
    expect(speak).toHaveBeenCalledWith("Voice test", expect.objectContaining({ masterMute: false, keySize: "large" }));
    expect(JSON.parse(localStorage.getItem("letterboard.settings.v1") ?? "{}")).toMatchObject({
      theme: "highContrast",
      keySize: "large",
      masterMute: false,
      selectionMode: "immediate",
      holdDurationMs: 1000,
      repeatGuardMs: 0,
      showHoldProgress: false,
    });

    fireEvent.click(screen.getByRole("button", { name: "Reset settings" }));

    expect(screen.getByRole("main")).toHaveAttribute("data-theme", "calm");
    expect(screen.getByRole("button", { name: "A" })).toHaveAttribute("data-key-size", "comfortable");
    expect(screen.getByRole("switch", { name: "Master Mute" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("button", { name: "Immediate selection mode" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("switch", { name: "Show Timer Ring" })).toHaveAttribute("aria-checked", "false");
  });

  it("selects on release mode pointer release and uses the release target", async () => {
    render(<App services={{ sessionStore: { save: vi.fn().mockResolvedValue(undefined), list: vi.fn().mockResolvedValue([]) }, speech: { speak: vi.fn(), getVoices: () => [] } }} />);

    fireEvent.click(screen.getByRole("button", { name: "Release to Select selection mode" }));
    fireEvent.pointerDown(screen.getByRole("button", { name: "A" }), { pointerId: 1 });

    expect(screen.getByLabelText("Current message")).toHaveTextContent("No message yet");

    fireEvent.pointerUp(screen.getByRole("button", { name: "B" }), { pointerId: 1 });

    expect(screen.getByLabelText("Current message")).toHaveTextContent("B");

    fireEvent.keyDown(screen.getByRole("button", { name: "C" }), { key: "Enter" });

    expect(screen.getByLabelText("Current message")).toHaveTextContent("BC");
  });

  it("selects in hold mode only after the configured hold duration", async () => {
    vi.useFakeTimers();
    render(<App services={{ sessionStore: { save: vi.fn().mockResolvedValue(undefined), list: vi.fn().mockResolvedValue([]) }, speech: { speak: vi.fn(), getVoices: () => [] } }} />);

    fireEvent.click(screen.getByRole("button", { name: "Hold to Select (Experimental) selection mode" }));
    fireEvent.click(screen.getByRole("button", { name: "0.5s hold time" }));
    fireEvent.pointerEnter(screen.getByRole("button", { name: "A" }), { pointerId: 1 });

    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(screen.getByLabelText("Current message")).toHaveTextContent("No message yet");
    expect(screen.getByRole("button", { name: "A" })).toHaveAttribute("data-hold-active", "true");

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.getByLabelText("Current message")).toHaveTextContent("A");
  });

  it("ignore repeat blocks rapid same-key repeats while allowing different keys", () => {
    render(<App services={{ sessionStore: { save: vi.fn().mockResolvedValue(undefined), list: vi.fn().mockResolvedValue([]) }, speech: { speak: vi.fn(), getVoices: () => [] } }} />);

    fireEvent.click(screen.getByRole("button", { name: "1.0s ignore repeat" }));
    fireEvent.click(screen.getByRole("button", { name: "A" }));
    fireEvent.click(screen.getByRole("button", { name: "A" }));
    fireEvent.click(screen.getByRole("button", { name: "B" }));

    expect(screen.getByLabelText("Current message")).toHaveTextContent("AB");
  });
});
