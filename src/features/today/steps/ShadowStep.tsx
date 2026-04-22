import { useState, useCallback } from 'react';
import { Button } from '@shared/components';
import { useSpeak } from '@shared/hooks';
import type { DailyScenario } from '@/content/schemas';
import styles from './steps.module.css';

type Props = {
  scenario: DailyScenario;
  onNext: () => void;
};

const REP_GOAL = 3;

export function ShadowStep({ scenario, onNext }: Props) {
  const { playing, play } = useSpeak();
  const [reps, setReps] = useState<Record<number, number>>({});

  const handleSpeak = useCallback(
    (text: string) => {
      play(text, 0.8);
    },
    [play],
  );

  const handleRep = useCallback((index: number) => {
    setReps((prev) => ({
      ...prev,
      [index]: (prev[index] ?? 0) + 1,
    }));
  }, []);

  const phrases = scenario.keyPhrases;
  const allDone = phrases.every((_, i) => (reps[i] ?? 0) >= REP_GOAL);

  return (
    <div className={styles.stepContainer} role="region" aria-label="خطوة الترديد">
      <div className={styles.stepHeader}>
        <span className={styles.stepIcon} aria-hidden="true">
          🗣️
        </span>
        <h2 className={styles.stepTitle}>ردّد</h2>
        <span className={styles.stepDuration}>٤ دقائق</span>
      </div>

      <p className={styles.stepInstruction}>
        استمع لكل عبارة ثم رددها بصوت عالٍ. الهدف: {REP_GOAL} مرات لكل عبارة.
      </p>

      <div className={styles.phraseList}>
        {phrases.map((phrase, i) => {
          const count = reps[i] ?? 0;
          const done = count >= REP_GOAL;
          return (
            <div
              key={i}
              className={`${styles.phraseCard} ${done ? styles.phraseDone : ''}`}
              role="group"
              aria-label={`عبارة ${i + 1}`}
            >
              <div className={styles.phraseTexts}>
                <p className={styles.phraseEn}>{phrase.en}</p>
                <p className={styles.phraseAr}>{phrase.ar}</p>
              </div>
              <div className={styles.phraseActions}>
                <button
                  className={styles.speakBtn}
                  onClick={() => handleSpeak(phrase.en)}
                  disabled={playing}
                  aria-label={`استمع: ${phrase.en}`}
                  type="button"
                >
                  🔊
                </button>
                <button
                  className={styles.repBtn}
                  onClick={() => handleRep(i)}
                  disabled={done}
                  aria-label={`رددت: ${count} من ${REP_GOAL}`}
                  type="button"
                >
                  <span className={styles.repCount}>{count}/{REP_GOAL}</span>
                  {done ? '✅' : '🔄'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <Button onClick={onNext} variant={allDone ? 'success' : 'primary'} fullWidth>
        {allDone ? 'التالي ←' : 'تخطي ← (ما كملت)'}
      </Button>
    </div>
  );
}
