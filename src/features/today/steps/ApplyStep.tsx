import { Button } from '@shared/components';
import type { DailyScenario } from '@/content/schemas';
import styles from './steps.module.css';

type Props = {
  scenario: DailyScenario;
  onComplete: () => void;
};

export function ApplyStep({ scenario, onComplete }: Props) {
  const firstPhrase = scenario.keyPhrases[0];

  return (
    <div className={styles.stepContainer} role="region" aria-label="خطوة التطبيق">
      <div className={styles.stepHeader}>
        <span className={styles.stepIcon} aria-hidden="true">
          🚀
        </span>
        <h2 className={styles.stepTitle}>طبّق</h2>
        <span className={styles.stepDuration}>دقيقة</span>
      </div>

      <p className={styles.stepInstruction}>التحدي اليومي:</p>

      <div className={styles.challengeCard}>
        <p className={styles.challengeText}>{scenario.challenge}</p>
      </div>

      <div className={styles.todayPhrase}>
        <p className={styles.todayPhraseLabel}>العبارة اللي تعلمتها اليوم:</p>
        <p className={styles.todayPhraseEn}>{firstPhrase.en}</p>
        <p className={styles.todayPhraseAr}>{firstPhrase.ar}</p>
      </div>

      <Button onClick={onComplete} variant="success" fullWidth size="lg">
        سويته ✓
      </Button>
    </div>
  );
}
