import { useState, useCallback } from 'react';
import { Button } from '@shared/components';
import type { DailyScenario } from '@/content/schemas';
import type { RecallScore } from '@features/progress';
import styles from './steps.module.css';

type Props = {
  scenario: DailyScenario;
  onNext: (scores: Record<string, RecallScore>) => void;
};

const SCORE_OPTIONS: { label: string; value: RecallScore; emoji: string }[] = [
  { label: 'تذكرتها', value: 'remembered', emoji: '✅' },
  { label: 'تقريباً', value: 'partial', emoji: '🟡' },
  { label: 'ما تذكرتها', value: 'forgot', emoji: '❌' },
];

export function RecallStep({ scenario, onNext }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [scores, setScores] = useState<Record<string, RecallScore>>({});

  const phrases = scenario.keyPhrases;
  const phrase = phrases[currentIdx];
  const isLast = currentIdx >= phrases.length - 1;
  const allDone = Object.keys(scores).length >= phrases.length;

  const handleReveal = useCallback(() => {
    setRevealed(true);
  }, []);

  const handleScore = useCallback(
    (score: RecallScore) => {
      const key = phrase.en;
      const next = { ...scores, [key]: score };
      setScores(next);

      if (isLast) {
        // All phrases scored, will show summary
        return;
      }
      setCurrentIdx((prev) => prev + 1);
      setRevealed(false);
    },
    [phrase, scores, isLast],
  );

  const handleNext = useCallback(() => {
    onNext(scores);
  }, [onNext, scores]);

  if (allDone) {
    const remembered = Object.values(scores).filter((s) => s === 'remembered').length;
    const partial = Object.values(scores).filter((s) => s === 'partial').length;
    const forgot = Object.values(scores).filter((s) => s === 'forgot').length;

    return (
      <div className={styles.stepContainer} role="region" aria-label="نتيجة التذكر">
        <div className={styles.stepHeader}>
          <span className={styles.stepIcon} aria-hidden="true">
            🧠
          </span>
          <h2 className={styles.stepTitle}>نتيجة التذكر</h2>
        </div>

        <div className={styles.recallSummary}>
          <div className={styles.recallStat}>
            <span className={styles.recallStatEmoji}>✅</span>
            <span>{remembered} تذكرتها</span>
          </div>
          <div className={styles.recallStat}>
            <span className={styles.recallStatEmoji}>🟡</span>
            <span>{partial} تقريباً</span>
          </div>
          <div className={styles.recallStat}>
            <span className={styles.recallStatEmoji}>❌</span>
            <span>{forgot} ما تذكرتها</span>
          </div>
        </div>

        <Button onClick={handleNext} variant="success" fullWidth>
          التالي ←
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.stepContainer} role="region" aria-label="خطوة التذكر">
      <div className={styles.stepHeader}>
        <span className={styles.stepIcon} aria-hidden="true">
          🧠
        </span>
        <h2 className={styles.stepTitle}>تذكّر</h2>
        <span className={styles.stepDuration}>٣ دقائق</span>
      </div>

      <p className={styles.stepInstruction}>
        شوف الترجمة العربية، حاول تتذكر الجملة الإنجليزية، ثم اكشف.
      </p>

      <div className={styles.flashCard}>
        <p className={styles.flashLabel}>
          {currentIdx + 1} / {phrases.length}
        </p>
        <p className={styles.flashAr}>{phrase.ar}</p>

        {!revealed ? (
          <Button onClick={handleReveal} variant="secondary" fullWidth>
            اكشف الجواب
          </Button>
        ) : (
          <>
            <p className={styles.flashEn}>{phrase.en}</p>
            <div className={styles.scoreButtons}>
              {SCORE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  className={styles.scoreBtn}
                  onClick={() => handleScore(opt.value)}
                  aria-label={opt.label}
                  type="button"
                >
                  <span aria-hidden="true">{opt.emoji}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
