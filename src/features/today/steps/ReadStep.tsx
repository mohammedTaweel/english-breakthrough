import { useCallback } from 'react';
import { Button } from '@shared/components';
import { useSpeak } from '@shared/hooks';
import type { DailyScenario } from '@/content/schemas';
import styles from './steps.module.css';

type Props = {
  scenario: DailyScenario;
  onNext: () => void;
};

export function ReadStep({ scenario, onNext }: Props) {
  const { playing, play } = useSpeak();

  const handleSpeak = useCallback(
    (text: string) => {
      play(text, 0.85);
    },
    [play],
  );

  return (
    <div className={styles.stepContainer} role="region" aria-label="خطوة الاستماع والقراءة">
      <div className={styles.stepHeader}>
        <span className={styles.stepIcon} aria-hidden="true">
          📖
        </span>
        <h2 className={styles.stepTitle}>استمع واقرأ</h2>
        <span className={styles.stepDuration}>دقيقتين</span>
      </div>

      <p className={styles.stepInstruction}>
        اقرأ المحادثة واستمع لكل جملة. لاحظ كيف تُنطق.
      </p>

      <div className={styles.chatContainer} role="log" aria-label="المحادثة">
        {scenario.dialogue.map((line, i) => {
          const isUser = line.speaker === 'أنت';
          return (
            <div
              key={i}
              className={`${styles.chatBubble} ${isUser ? styles.chatUser : styles.chatOther}`}
            >
              <span className={styles.chatSpeaker}>{line.speaker}</span>
              <p className={styles.chatText}>{line.text}</p>
              <button
                className={styles.speakBtn}
                onClick={() => handleSpeak(line.text)}
                disabled={playing}
                aria-label={`استمع: ${line.text}`}
                type="button"
              >
                🔊
              </button>
            </div>
          );
        })}
      </div>

      <Button onClick={onNext} variant="success" fullWidth>
        التالي ←
      </Button>
    </div>
  );
}
