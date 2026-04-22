import { useState, useRef, useEffect } from 'react';
import { QUICK_RESP } from '@/content';
import { shuffle, shuffleOptions } from '@shared/utils';
import { dayNumber } from '@shared/utils';
import { Button } from '@shared/components';
import styles from '../TrainingScreen.module.css';

export function QuickResponseExercise() {
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [timer, setTimer] = useState(10);
  const [done, setDone] = useState(false);
  const [qs, setQs] = useState(() => shuffle(QUICK_RESP, dayNumber()).slice(0, 8));
  const [timerRunning, setTimerRunning] = useState(true);
  const tRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer effect — runs when timerRunning changes or qi changes
  useEffect(() => {
    if (!timerRunning) return;
    tRef.current = setInterval(() => {
      setTimer((p) => {
        if (p <= 1) {
          if (tRef.current) clearInterval(tRef.current);
          return 0;
        }
        return p - 1;
      });
    }, 1000);
    return () => { if (tRef.current) clearInterval(tRef.current); };
  }, [timerRunning, qi]);

  const rawQ = qs[qi];
  const { opts, correctIndex } = shuffleOptions(rawQ.opts, rawQ.ans, qi * 13 + 47);

  function pick(oi: number) {
    if (tRef.current) clearInterval(tRef.current);
    setTimerRunning(false);
    setPicked(oi);
    if (oi === correctIndex) setScore((s) => s + 1);
    setTotal((t) => t + 1);
  }

  function next() {
    if (qi + 1 >= qs.length) { setDone(true); return; }
    setQi(qi + 1);
    setPicked(null);
    setTimer(10);
    setTimerRunning(true);
  }

  if (done) {
    return (
      <div className={styles.resultCenter}>
        <div className={styles.resultScore} style={{ color: score >= 6 ? 'var(--c-success)' : score >= 4 ? 'var(--c-accent)' : 'var(--c-error)' }}>
          {score}/{total}
        </div>
        <p className={styles.resultMsg}>
          {score >= 7 ? 'ردود فعلك سريعة!' : score >= 5 ? 'جيد! السرعة تتحسن' : 'راجع الجمل الجاهزة وحاول مرة ثانية'}
        </p>
        <Button onClick={() => { setQs(shuffle(QUICK_RESP, Date.now())); setQi(0); setPicked(null); setScore(0); setTotal(0); setDone(false); setTimer(10); setTimerRunning(true); }}>
          محاولة جديدة
        </Button>
      </div>
    );
  }

  const show = picked !== null;

  return (
    <div>
      <div className={styles.progressRow}>
        <span>سؤال {qi + 1}/{qs.length}</span>
        {timer > 0 && picked === null && (
          <span style={{ fontFamily: 'var(--ff-mono)', fontWeight: 700, color: timer <= 3 ? 'var(--c-error)' : 'var(--c-accent)' }}>
            {timer}s
          </span>
        )}
      </div>

      <div className={styles.questionBox}>
        <div className={styles.questionText}>{rawQ.sit}</div>
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
            {show && isCorrect && <span style={{ color: 'var(--c-success)', fontSize: 'var(--fs-xs)', marginInlineStart: 'var(--sp-2)' }}> ✓</span>}
          </div>
        );
      })}

      {(picked !== null || timer === 0) && (
        <div className={styles.center}>
          {timer === 0 && picked === null && (
            <p style={{ color: 'var(--c-error)', fontSize: 'var(--fs-sm)', marginBottom: 'var(--sp-2)' }}>انتهى الوقت!</p>
          )}
          <Button size="sm" onClick={() => { if (timer === 0 && picked === null) setTotal((t) => t + 1); next(); }}>
            التالي
          </Button>
        </div>
      )}
    </div>
  );
}
