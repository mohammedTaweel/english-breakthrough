import { describe, expect, it } from 'vitest';
import { shuffle, shuffleOptions } from './shuffle';

describe('shuffle', () => {
  it('returns same length', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(shuffle(arr, 42)).toHaveLength(5);
  });

  it('contains all elements', () => {
    const arr = [1, 2, 3, 4, 5];
    const result = shuffle(arr, 42);
    expect(result.sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it('is deterministic — same seed same result', () => {
    const arr = ['a', 'b', 'c', 'd'];
    const r1 = shuffle(arr, 99);
    const r2 = shuffle(arr, 99);
    expect(r1).toEqual(r2);
  });

  it('different seeds produce different results', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8];
    const r1 = shuffle(arr, 1);
    const r2 = shuffle(arr, 2);
    expect(r1).not.toEqual(r2);
  });

  it('does not mutate original', () => {
    const arr = [1, 2, 3];
    shuffle(arr, 5);
    expect(arr).toEqual([1, 2, 3]);
  });
});

describe('shuffleOptions', () => {
  it('preserves correct answer tracking', () => {
    const opts = ['correct', 'wrong1', 'wrong2'];
    const { opts: shuffled, correctIndex } = shuffleOptions(opts, 0, 42);
    expect(shuffled[correctIndex]).toBe('correct');
  });

  it('returns all options', () => {
    const opts = ['a', 'b', 'c', 'd'];
    const { opts: shuffled } = shuffleOptions(opts, 0, 99);
    expect(shuffled.sort()).toEqual(['a', 'b', 'c', 'd']);
  });

  it('deterministic for same seed', () => {
    const opts = ['a', 'b', 'c'];
    const r1 = shuffleOptions(opts, 0, 77);
    const r2 = shuffleOptions(opts, 0, 77);
    expect(r1.opts).toEqual(r2.opts);
    expect(r1.correctIndex).toBe(r2.correctIndex);
  });
});
