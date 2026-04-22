import { describe, expect, it } from 'vitest';
import { compareTranscript, isRecognitionSupported } from './recognition';

describe('compareTranscript', () => {
  it('returns 100% for exact match', () => {
    const r = compareTranscript('Good morning how are you', 'Good morning how are you');
    expect(r.matchPercent).toBe(100);
    expect(r.missedWords).toEqual([]);
  });

  it('is case insensitive', () => {
    const r = compareTranscript('GOOD MORNING', 'good morning');
    expect(r.matchPercent).toBe(100);
  });

  it('ignores punctuation', () => {
    const r = compareTranscript("Good morning, how are you?", "Good morning how are you");
    expect(r.matchPercent).toBe(100);
  });

  it('calculates partial match', () => {
    const r = compareTranscript('good morning', 'good morning how are you');
    expect(r.matchPercent).toBe(40);
    expect(r.matchedWords).toEqual(['good', 'morning']);
    expect(r.missedWords).toEqual(['how', 'are', 'you']);
  });

  it('returns 0% for no match', () => {
    const r = compareTranscript('hello world', 'good morning');
    expect(r.matchPercent).toBe(0);
    expect(r.missedWords).toEqual(['good', 'morning']);
  });

  it('handles empty strings', () => {
    expect(compareTranscript('', 'hello').matchPercent).toBe(0);
    expect(compareTranscript('hello', '').matchPercent).toBe(0);
  });

  it('stores the raw transcript', () => {
    const r = compareTranscript('Hello World', 'hello world');
    expect(r.transcript).toBe('Hello World');
  });
});

describe('isRecognitionSupported', () => {
  it('returns false in jsdom (no SpeechRecognition)', () => {
    expect(isRecognitionSupported()).toBe(false);
  });
});
