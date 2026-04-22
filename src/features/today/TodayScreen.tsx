import { useState, useMemo, useCallback } from 'react';
import { Card, Button } from '@shared/components';
import { useProgress } from '@features/progress';
import { dayNumber } from '@shared/utils';
import { DAILY_SCENARIOS, MOTIV } from '@/content';
import type { DailyScenario } from '@/content/schemas';
import { DailySession } from './DailySession';
import styles from './TodayScreen.module.css';

const XP_REWARD = 25;

/**
 * Pick the best scenario based on session history.
 * Priority:
 *  1. Scenarios with forgotten phrases (recallScores has "forgot")
 *  2. Unseen scenarios (not in sessionHistory)
 *  3. Oldest reviewed scenario
 */
function pickBestScenario(
  scenarios: DailyScenario[],
  history: { scenario: string; recallScores: Record<string, string>; completedAt: string }[],
): number {
  // Priority 1: scenarios with forgotten phrases
  const forgotSet = new Set<string>();
  for (const record of history) {
    for (const score of Object.values(record.recallScores)) {
      if (score === 'forgot') {
        forgotSet.add(record.scenario);
      }
    }
  }
  const forgotIdx = scenarios.findIndex((s) => forgotSet.has(s.title));
  if (forgotIdx !== -1) return forgotIdx;

  // Priority 2: unseen scenarios
  const seenTitles = new Set(history.map((h) => h.scenario));
  const unseenIdx = scenarios.findIndex((s) => !seenTitles.has(s.title));
  if (unseenIdx !== -1) return unseenIdx;

  // Priority 3: oldest reviewed
  const titleToLastDate = new Map<string, string>();
  for (const record of history) {
    const existing = titleToLastDate.get(record.scenario);
    if (!existing || record.completedAt > existing) {
      titleToLastDate.set(record.scenario, record.completedAt);
    }
  }
  let oldestIdx = 0;
  let oldestDate = '';
  for (let i = 0; i < scenarios.length; i++) {
    const lastDate = titleToLastDate.get(scenarios[i].title) ?? '';
    if (oldestDate === '' || lastDate < oldestDate) {
      oldestDate = lastDate;
      oldestIdx = i;
    }
  }
  return oldestIdx;
}

export function TodayScreen() {
  const { progress } = useProgress();
  const [completed, setCompleted] = useState(false);

  const motivIdx = dayNumber() % MOTIV.length;
  const quote = MOTIV[motivIdx];

  const bestIdx = useMemo(
    () => pickBestScenario(DAILY_SCENARIOS, progress.sessionHistory),
    [progress.sessionHistory],
  );

  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const activeIdx = selectedIdx ?? bestIdx;
  const scenario = DAILY_SCENARIOS[activeIdx];

  const handlePillClick = useCallback((idx: number) => {
    setSelectedIdx(idx);
    setCompleted(false);
  }, []);

  const handleComplete = useCallback(() => {
    setCompleted(true);
  }, []);

  return (
    <div className={styles.todayContainer}>
      {/* Motivational quote */}
      <Card variant="accent" padding="md">
        <p className={styles.motiv} role="status" aria-label="اقتباس تحفيزي">
          {quote}
        </p>
      </Card>

      {/* Scenario info */}
      <div className={styles.scenarioHeader}>
        <span className={styles.scenarioIcon} aria-hidden="true">
          {scenario.icon}
        </span>
        <div>
          <h1 className={styles.scenarioTitle}>{scenario.title}</h1>
          <p className={styles.scenarioDesc}>
            {scenario.dialogue.length} جمل &middot;{' '}
            {scenario.keyPhrases.length} عبارات رئيسية
          </p>
        </div>
      </div>

      {/* Scenario picker pills */}
      <div
        className={styles.pillScroll}
        role="tablist"
        aria-label="اختر السيناريو"
      >
        {DAILY_SCENARIOS.map((s, i) => {
          const isSeen = progress.sessionHistory.some(
            (h) => h.scenario === s.title,
          );
          return (
            <button
              key={i}
              role="tab"
              aria-selected={i === activeIdx}
              className={`${styles.pill} ${i === activeIdx ? styles.pillActive : ''} ${isSeen ? styles.pillSeen : ''}`}
              onClick={() => handlePillClick(i)}
              type="button"
            >
              <span className={styles.pillIcon} aria-hidden="true">
                {s.icon}
              </span>
              <span className={styles.pillTitle}>{s.title}</span>
            </button>
          );
        })}
      </div>

      {/* Session or completion */}
      {completed ? (
        <Card variant="success" padding="lg">
          <div className={styles.successCard} role="alert">
            <span className={styles.successEmoji} aria-hidden="true">
              🎉
            </span>
            <h2 className={styles.successTitle}>أحسنت!</h2>
            <p className={styles.successText}>
              أكملت جلسة اليوم وحصلت على +{XP_REWARD} XP
            </p>
            <Button
              variant="secondary"
              onClick={() => {
                setCompleted(false);
              }}
            >
              أعد الجلسة
            </Button>
          </div>
        </Card>
      ) : (
        <DailySession
          key={activeIdx}
          scenario={scenario}
          onComplete={handleComplete}
        />
      )}
    </div>
  );
}
