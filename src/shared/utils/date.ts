/**
 * Date utilities — pure functions, fully testable.
 * Replaces the cryptic legacy helpers: gtd(), gdn(), gdow(), getWk(), getPh().
 */

export function today(): string {
  const d = new Date();
  return (
    d.getFullYear() +
    '-' +
    String(d.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(d.getDate()).padStart(2, '0')
  );
}

export function dayNumber(): number {
  const d = new Date();
  return d.getDate() + d.getMonth() * 31 + d.getFullYear();
}

export function dayOfWeek(): number {
  return new Date().getDay();
}

export function weekNumber(startDate: string): number {
  const start = new Date(startDate);
  const now = new Date(today());
  const days = Math.floor((now.getTime() - start.getTime()) / 86_400_000);
  if (days < 0) return 0;
  return Math.min(Math.floor(days / 7) + 1, 12);
}

export type Phase = {
  number: 1 | 2 | 3;
  name: string;
  color: string;
};

export function phase(week: number): Phase {
  if (week <= 4) return { number: 1, name: 'بناء الأساس', color: 'var(--c-accent)' };
  if (week <= 8) return { number: 2, name: 'التسريع', color: 'var(--c-accent)' };
  return { number: 3, name: 'الإطلاق', color: 'var(--c-accent)' };
}

export function streak(days: Record<string, string[]>): number {
  let count = 0;
  const d = new Date();
  for (let i = 0; i < 100; i++) {
    const key =
      d.getFullYear() +
      '-' +
      String(d.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(d.getDate()).padStart(2, '0');
    if (days[key] && days[key].length >= 1) {
      count++;
      d.setDate(d.getDate() - 1);
    } else if (i === 0) {
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return count;
}
