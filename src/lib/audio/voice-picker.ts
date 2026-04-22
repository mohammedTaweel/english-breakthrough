/**
 * Smart voice picker for browser SpeechSynthesis.
 *
 * Selects the best available English voice based on a priority list.
 * Neural/Online voices sound better and are preferred.
 */

import type { Accent } from './types';

type VoiceTest = (v: SpeechSynthesisVoice) => boolean;

export function pickBestVoice(accent: Accent): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;

  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const langPrefix = accent.slice(0, 5);

  const priority: VoiceTest[] = [
    (v) =>
      v.lang.startsWith(langPrefix) &&
      /Online|Natural|Google|Enhanced/i.test(v.name),
    (v) => v.lang.startsWith(langPrefix),
    (v) => /Online \(Natural\)/i.test(v.name) && v.lang.startsWith('en'),
    (v) => /Microsoft.*Online/i.test(v.name) && v.lang.startsWith('en'),
    (v) => v.name === 'Google US English',
    (v) => v.name === 'Google UK English',
    (v) => v.name === 'Samantha' && v.lang.startsWith('en'),
    (v) => v.name === 'Karen' && v.lang.startsWith('en'),
    (v) => v.name === 'Daniel' && v.lang.startsWith('en'),
    (v) => /Enhanced|Premium/i.test(v.name) && v.lang.startsWith('en'),
    (v) => v.lang.startsWith('en-US') && !v.localService,
    (v) => v.lang.startsWith('en-US'),
    (v) => v.lang.startsWith('en-GB'),
    (v) => v.lang.startsWith('en'),
  ];

  for (const test of priority) {
    const found = voices.find(test);
    if (found) return found;
  }

  return voices[0] ?? null;
}

export function isNeuralVoice(name: string): boolean {
  return /Natural|Online|Enhanced|Google/i.test(name);
}
