import { describe, expect, it } from 'vitest';
import { isNeuralVoice } from './voice-picker';

describe('isNeuralVoice', () => {
  it('detects Google voices', () => {
    expect(isNeuralVoice('Google US English')).toBe(true);
  });

  it('detects Online Natural voices', () => {
    expect(isNeuralVoice('Microsoft Aria Online (Natural)')).toBe(true);
  });

  it('detects Enhanced voices', () => {
    expect(isNeuralVoice('Samantha (Enhanced)')).toBe(true);
  });

  it('rejects basic voices', () => {
    expect(isNeuralVoice('Alex')).toBe(false);
    expect(isNeuralVoice('Default Voice')).toBe(false);
  });
});
