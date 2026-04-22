import { useState } from 'react';
import { QUIZ_BANK } from '@/content';
import { shuffle, shuffleOptions, dayNumber } from '@shared/utils';
import { useAuth } from '@features/auth';
import { addQuizResult } from '@features/progress';
import { today } from '@shared/utils';
import { Button } from '@shared/components';
import styles from '../TrainingScreen.module.css';

export function WeeklyQuizExercise() {
  const { user } = useAuth();
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [qs, setQs] = useState(() => shuffle(QUIZ_BANK, dayNumber()).slice(0, 10));

  const rawQ = qs[qi];
  const { opts, correctIndex } = shuffleOptions(rawQ.opts, rawQ.ans, qi * 17 + 59);

  function pick(oi: number) {
    setPicked(oi);
    if (oi === correctIndex) setScore((s) => s + 1);
  }

  function next() {
    if (qi + 1 >= qs.length) {
      setDone(true);
      const pct = Math.round(((score + (picked === correctIndex ? 0 : 0)) / qs.length) * 100);
      if (user) {
        addQuizResult(user.uid, { date: today(), pct, score, total: qs.length });
      }
      return;
    }
    setQi(qi + 1);
    setPicked(null);
  }

  if (done) {
    const pct = Math.round((score / qs.length) * 100);
    return (
      <div className={styles.resultCenter}>
        <div className={styles.resultScore} style={{ color: pct >= 80 ? 'var(--c-success)' : pct >= 50 ? 'var(--c-accent)' : 'var(--c-error)' }}>
          {pct}%
        </div>
        <div style={{ fontSize: 'var(--fs-md)', color: 'var(--c-text-secondary)' }}>{score}/{qs.length}</div>
        <p className={styles.resultMsg}>
          {pct >= 80 ? 'إنجاز مميز! الجمل ثابتة' : pct >= 50 ? 'جيد! استمر بالمراجعة' : 'ركّز على بنك الجمل'}
        </p>
        <Button onClick={() => { setQs(shuffle(QUIZ_BANK, Date.now())); setQi(0); setPicked(null); setScore(0); setDone(false); }}>
          اختبار جديد
        </Button>
      </div>
    );
  }

  const show = picked !== null;

  return (
    <div>
      <div className={styles.progressRow}>
        <span>سؤال {qi + 1}/10</span>
        <span style={{ color: 'var(--c-accent)', fontWeight: 600 }}>{score} صحيح</span>
      </div>

      <div className={styles.questionBox}>
        <div className={styles.questionText}>{rawQ.q}</div>
      </div>

      {opts.map((o, oi) => {
        const isCorrect = oi === correctIndex;
        const isPicked = picked === oi;
        let cls = styles.optionItem;
        if (show && isCorrect) cls += ` ${styles.optionCorrect}`;
        else if (show && isPicked) cls += ` ${styles.optionWrong}`;
        if (show && !isCorrect && !isPicked) cls += ` ${styles.optionDim}`;
        if (show) cls += ` ${styles.optionDisabled}`;

        return (
          <div key={oi} className={cls} onClick={() => !show && pick(oi)} role="button" tabIndex={0}
            onKeyDown={(e) => { if (!show && (e.key === 'Enter' || e.key === ' ')) pick(oi); }}>
            {o}
            {show && isCorrect && <span style={{ color: 'var(--c-success)', fontSize: 'var(--fs-xs)' }}> ✓</span>}
          </div>
        );
      })}

      {show && (
        <div className={styles.center}>
          <Button size="sm" onClick={next}>
            {qi + 1 >= qs.length ? 'النتيجة' : 'التالي'}
          </Button>
        </div>
      )}
    </div>
  );
}
