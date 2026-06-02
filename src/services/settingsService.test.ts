import { afterEach, describe, expect, it } from "vitest";
import { defaultSettings, loadSettings, saveSettings } from "./settingsService";

describe("settingsService", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("defaults to reduced motion and master mute", () => {
    expect(loadSettings()).toMatchObject({
      reducedMotion: true,
      masterMute: true,
      keySize: "comfortable",
    });
  });

  it("persists lightweight settings in localStorage", () => {
    saveSettings({
      ...defaultSettings,
      theme: "highContrast",
      masterMute: false,
      rate: 0.8,
    });

    expect(loadSettings()).toMatchObject({
      theme: "highContrast",
      masterMute: false,
      rate: 0.8,
    });
  });
});
