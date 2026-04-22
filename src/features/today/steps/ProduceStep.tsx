import { useState, useCallback } from 'react';
import { Button } from '@shared/components';
import { shuffleOptions, dayNumber } from '@shared/utils';
import type { DailyScenario } from '@/content/schemas';
import styles from './steps.module.css';

type Props = {
  scenario: DailyScenario;
  onNext: () => void;
};

/**
 * Build 3 produce options: the model answer plus 2 weaker alternatives.
 * The weaker alternatives are shortened/simplified versions of the model.
 */
function buildProduceOptions(model: string): string[] {
  const words = model.split(' ');
  const half = Math.ceil(words.length / 2);
  const weak1 = words.slice(0, half).join(' ') + '...';
  const quarter = Math.ceil(words.length / 3);
  const weak2 = words.slice(0, quarter).join(' ') + '...';
  return [model, weak1, weak2];
}

export function ProduceStep({ scenario, onNext }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [showTips, setShowTips] = useState(false);

  const rawOpts = buildProduceOptions(scenario.produceModel);
  const { opts, correctIndex } = shuffleOptions(rawOpts, 0, dayNumber());

  const handleSelect = useCallback(
    (idx: number) => {
      setSelected(idx);
      setShowTips(true);
    },
    [],
  );

  return (
    <div className={styles.stepContainer} role="region" aria-label="خطوة الإنتاج">
      <div className={styles.stepHeader}>
        <span className={styles.stepIcon} aria-hidden="true">
          ✍️
        </span>
        <h2 className={styles.stepTitle}>أنتج</h2>
        <span className={styles.stepDuration}>دقيقتين</span>
      </div>

      <p className={styles.stepInstruction}>{scenario.producePrompt}</p>

      <div className={styles.optionsGrid} role="radiogroup" aria-label="اختر الرد الأنسب">
        {opts.map((opt, i) => {
          let extraClass = '';
          if (selected !== null) {
            if (i === correctIndex) {
              extraClass = styles.optCorrect;
            } else if (i === selected && i !== correctIndex) {
              extraClass = styles.optWrong;
            }
          }
          return (
            <button
              key={i}
              className={`${styles.produceOpt} ${extraClass}`}
              onClick={() => handleSelect(i)}
              disabled={selected !== null}
              aria-label={opt}
              type="button"
            >
              {opt}
            </button>
          );
        })}
      </div>

      {showTips && (
        <div className={styles.tipsBlock}>
          <h3 className={styles.tipsTitle}>لاحظ:</h3>
          <ul className={styles.tipsList}>
            {scenario.noticingTips.map((tip, i) => (
              <li key={i} className={styles.tipItem}>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {selected !== null && (
        <Button onClick={onNext} variant="success" fullWidth>
          التالي ←
        </Button>
      )}
    </div>
  );
}
