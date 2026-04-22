import { describe, expect, it } from 'vitest';
import { EMPTY_PROGRESS } from './types';

describe('EMPTY_PROGRESS', () => {
  it('has null startDate', () => {
    expect(EMPTY_PROGRESS.startDate).toBeNull();
  });

  it('has zero xp', () => {
    expect(EMPTY_PROGRESS.xp).toBe(0);
  });

  it('has empty arrays', () => {
    expect(EMPTY_PROGRESS.sessionHistory).toEqual([]);
    expect(EMPTY_PROGRESS.quizResults).toEqual([]);
    expect(EMPTY_PROGRESS.levelTestResults).toEqual([]);
  });

  it('has empty objects', () => {
    expect(EMPTY_PROGRESS.days).toEqual({});
    expect(EMPTY_PROGRESS.phraseReps).toEqual({});
    expect(EMPTY_PROGRESS.srsData).toEqual({});
    expect(EMPTY_PROGRESS.checkpoints).toEqual({});
  });
});
