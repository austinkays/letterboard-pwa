import type { LetterboardSettings } from "../models/settings";

export interface SpeechController {
  getVoices(): SpeechSynthesisVoice[];
  speak(text: string, settings: LetterboardSettings): void;
}

export const speechService: SpeechController = {
  getVoices() {
    if (!("speechSynthesis" in window)) {
      return [];
    }

    return window.speechSynthesis
      .getVoices()
      .slice()
      .sort((left, right) => `${left.lang} ${left.name}`.localeCompare(`${right.lang} ${right.name}`));
  },

  speak(text, settings) {
    if (!("speechSynthesis" in window)) {
      return;
    }

    if (settings.masterMute || text.trim().length === 0) {
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = Math.min(Math.max(settings.rate, 0.1), 1.5);
    utterance.volume = Math.min(Math.max(settings.volume, 0), 1);

    if (settings.voiceURI) {
      const voice = this.getVoices().find((candidate) => candidate.voiceURI === settings.voiceURI);
      if (voice) {
        utterance.voice = voice;
      }
    }

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  },
};
