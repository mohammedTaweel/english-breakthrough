import { useState, useCallback } from 'react';
import { Button } from '@shared/components';
import { useSpeak } from '@shared/hooks';
import { shuffleOptions, dayNumber } from '@shared/utils';
import type { DailyScenario } from '@/content/schemas';
import styles from './steps.module.css';

type Props = {
  scenario: DailyScenario;
  onNext: () => void;
};

export function ListenStep({ scenario, onNext }: Props) {
  const { playing, play } = useSpeak();
  const [currentLine, setCurrentLine] = useState(0);
  const [phase, setPhase] = useState<'listen' | 'question' | 'answered'>('listen');
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);

  const dialogue = scenario.dialogue;
  const totalLines = dialogue.length;

  const playLine = useCallback(
    (index: number) => {
      if (index >= totalLines) {
        setPhase(scenario.listenQ ? 'question' : 'answered');
        return;
      }
      setCurrentLine(index);
      const handle = { onend: null as (() => void) | null };
      Object.assign(handle, play(dialogue[index].text, 0.85));
    },
    [dialogue, totalLines, play, scenario.listenQ],
  );

  const handleStartListening = useCallback(() => {
    playLine(0);
  }, [playLine]);

  const handlePlayNext = useCallback(() => {
    playLine(currentLine + 1);
  }, [playLine, currentLine]);

  const listenQ = scenario.listenQ;
  const shuffled = listenQ
    ? shuffleOptions(listenQ.opts, listenQ.ans, dayNumber())
    : null;

  const handleAnswer = useCallback(
    (idx: number) => {
      setSelectedOpt(idx);
      setPhase('answered');
    },
    [],
  );

  return (
    <div className={styles.stepContainer} role="region" aria-label="خطوة الاستماع">
      <div className={styles.stepHeader}>
        <span className={styles.stepIcon} aria-hidden="true">
          🎧
        </span>
        <h2 className={styles.stepTitle}>استمع</h2>
        <span className={styles.stepDuration}>دقيقتين</span>
      </div>

      <p className={styles.stepInstruction}>
        استمع للمحادثة بدون قراءة. ركّز على الفهم العام.
      </p>

      {/* Progress dots */}
      <div className={styles.progressDots} role="group" aria-label="تقدم الاستماع">
        {dialogue.map((_, i) => (
          <span
            key={i}
            className={`${styles.dot} ${i < currentLine ? styles.dotDone : ''} ${i === currentLine && phase === 'listen' ? styles.dotActive : ''}`}
            aria-label={`جملة ${i + 1} من ${totalLines}`}
          />
        ))}
      </div>

      {phase === 'listen' && currentLine === 0 && !playing && (
        <Button onClick={handleStartListening} fullWidth aria-label="ابدأ الاستماع">
          ابدأ الاستماع
        </Button>
      )}

      {phase === 'listen' && (currentLine > 0 || playing) && (
        <div className={styles.listenControls}>
          <p className={styles.speakerLabel}>
            {playing ? `${dialogue[currentLine].speaker} يتكلم...` : 'اضغط التالي'}
          </p>
          <Button
            onClick={handlePlayNext}
            disabled={playing}
            fullWidth
            aria-label="الجملة التالية"
          >
            {currentLine + 1 < totalLines ? `التالي (${currentLine + 1}/${totalLines})` : 'انتهى'}
          </Button>
        </div>
      )}

      {phase === 'question' && listenQ && shuffled && (
        <div className={styles.questionBlock}>
          <p className={styles.questionText}>{listenQ.q}</p>
          <div className={styles.optionsGrid}>
            {shuffled.opts.map((opt, i) => (
              <Button
                key={i}
                variant="secondary"
                fullWidth
                onClick={() => handleAnswer(i)}
                aria-label={opt}
              >
                {opt}
              </Button>
            ))}
          </div>
        </div>
      )}

      {phase === 'answered' && (
        <div className={styles.resultBlock}>
          {listenQ && shuffled && selectedOpt !== null && (
            <p
              className={
                selectedOpt === shuffled.correctIndex
                  ? styles.correctMsg
                  : styles.wrongMsg
              }
            >
              {selectedOpt === shuffled.correctIndex ? 'صحيح!' : `الإجابة: ${listenQ.opts[listenQ.ans]}`}
            </p>
          )}
          <Button onClick={onNext} variant="success" fullWidth>
            التالي ←
          </Button>
        </div>
      )}
    </div>
  );
}
