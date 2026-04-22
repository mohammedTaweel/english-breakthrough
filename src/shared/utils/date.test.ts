import { describe, expect, it } from 'vitest';
import { today, weekNumber, phase, streak } from './date';

describe('today', () => {
  it('returns YYYY-MM-DD format', () => {
    expect(today()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('weekNumber', () => {
  it('returns 1 for same day', () => {
    expect(weekNumber(today())).toBe(1);
  });

  it('returns 2 after 7 days', () => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    const start = d.toISOString().split('T')[0];
    expect(weekNumber(start)).toBe(2);
  });

  it('caps at 12', () => {
    expect(weekNumber('2020-01-01')).toBe(12);
  });

  it('returns 0 for future date', () => {
    const future = new Date();
    future.setDate(future.getDate() + 10);
    expect(weekNumber(future.toISOString().split('T')[0])).toBe(0);
  });
});

describe('phase', () => {
  it('returns phase 1 for weeks 1-4', () => {
    expect(phase(1).number).toBe(1);
    expect(phase(4).number).toBe(1);
  });

  it('returns phase 2 for weeks 5-8', () => {
    expect(phase(5).number).toBe(2);
    expect(phase(8).number).toBe(2);
  });

  it('returns phase 3 for weeks 9-12', () => {
    expect(phase(9).number).toBe(3);
    expect(phase(12).number).toBe(3);
  });
});

describe('streak', () => {
  it('returns 0 for empty days', () => {
    expect(streak({})).toBe(0);
  });

  it('counts consecutive days', () => {
    const days: Record<string, string[]> = {};
    const d = new Date();
    for (let i = 0; i < 5; i++) {
      const key =
        d.getFullYear() +
        '-' +
        String(d.getMonth() + 1).padStart(2, '0') +
        '-' +
        String(d.getDate()).padStart(2, '0');
      days[key] = ['session'];
      d.setDate(d.getDate() - 1);
    }
    expect(streak(days)).toBe(5);
  });

  it('allows skipping today but counting yesterday', () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const key =
      d.getFullYear() +
      '-' +
      String(d.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(d.getDate()).padStart(2, '0');
    expect(streak({ [key]: ['session'] })).toBe(1);
  });
});
