import { useState } from 'react';
import { FILL_BLANKS } from '@/content';
import { shuffle, dayNumber } from '@shared/utils';
import { Button } from '@shared/components';
import styles from '../TrainingScreen.module.css';

export function FillBlankExercise() {
  const [qi, setQi] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [qs, setQs] = useState(() => shuffle(FILL_BLANKS, dayNumber()).slice(0, 8));

  function check() {
    setChecked(true);
    const item = qs[qi];
    let correct = 0;
    item.blanks.forEach((blank, bi) => {
      if ((answers[bi] ?? '').trim().toLowerCase() === blank.toLowerCase()) correct++;
    });
    if (correct === item.blanks.length) setScore((s) => s + 1);
  }

  function next() {
    if (qi + 1 >= qs.length) { setDone(true); return; }
    setQi(qi + 1); setAnswers({}); setChecked(false);
  }

  if (done) {
    return (
      <div className={styles.resultCenter}>
        <div className={styles.resultScore} style={{ color: score >= 6 ? 'var(--c-success)' : score >= 4 ? 'var(--c-accent)' : 'var(--c-error)' }}>
          {score}/{qs.length}
        </div>
        <p className={styles.resultMsg}>
          {score >= 6 ? 'ذاكرتك قوية!' : score >= 4 ? 'جيد! استمر بالمراجعة' : 'راجع الجمل أكثر'}
        </p>
        <Button onClick={() => { setQs(shuffle(FILL_BLANKS, Date.now())); setQi(0); setAnswers({}); setChecked(false); setScore(0); setDone(false); }}>
          محاولة جديدة
        </Button>
      </div>
    );
  }

  const item = qs[qi];

  // Build sentence parts with blanks
  const parts: { type: 'text' | 'blank'; value: string; index: number }[] = [];
  let remaining = item.full;
  item.blanks.forEach((blank, bi) => {
    const idx = remaining.toLowerCase().indexOf(blank.toLowerCase());
    if (idx >= 0) {
      if (idx > 0) parts.push({ type: 'text', value: remaining.slice(0, idx), index: -1 });
      parts.push({ type: 'blank', value: blank, index: bi });
      remaining = remaining.slice(idx + blank.length);
    }
  });
  if (remaining) parts.push({ type: 'text', value: remaining, index: -1 });

  return (
    <div>
      <div className={styles.progressRow}>
        <span>سؤال {qi + 1}/{qs.length}</span>
        <span style={{ color: 'var(--c-accent)', fontWeight: 600 }}>{score} صحيح</span>
      </div>

      <div className={styles.questionBox}>
        <div style={{ fontFamily: 'var(--ff-mono)', fontSize: 'var(--fs-base)', direction: 'ltr', textAlign: 'left', lineHeight: 2.2, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--sp-1)' }}>
          {parts.map((p, pi) =>
            p.type === 'text' ? (
              <span key={pi}>{p.value}</span>
            ) : (
              <span key={pi} style={{ display: 'inline-block' }}>
                <input
                  type="text"
                  value={answers[p.index] ?? ''}
                  onChange={(e) => !checked && setAnswers({ ...answers, [p.index]: e.target.value })}
                  disabled={checked}
                  placeholder="..."
                  style={{
                    width: Math.max(p.value.length * 11, 60),
                    padding: '4px 8px',
                    borderRadius: 'var(--r-sm)',
                    fontSize: 'var(--fs-sm)',
                    fontFamily: 'var(--ff-mono)',
                    textAlign: 'center',
                    background: checked
                      ? (answers[p.index] ?? '').trim().toLowerCase() === p.value.toLowerCase()
                        ? 'var(--c-success-light)'
                        : 'var(--c-error-light)'
                      : 'var(--c-surface-sunken)',
                    border: `1px solid ${checked
                      ? (answers[p.index] ?? '').trim().toLowerCase() === p.value.toLowerCase()
                        ? 'var(--c-success)'
                        : 'var(--c-error)'
                      : 'var(--c-border)'}`,
                    color: 'var(--c-text)',
                    outline: 'none',
                  }}
                />
                {checked && (answers[p.index] ?? '').trim().toLowerCase() !== p.value.toLowerCase() && (
                  <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--c-success)', textAlign: 'center' }}>{p.value}</div>
                )}
              </span>
            ),
          )}
        </div>
      </div>

      <div className={styles.center}>
        {!checked ? (
          <Button size="sm" onClick={check}>تأكّد</Button>
        ) : (
          <Button size="sm" onClick={next}>
            {qi + 1 >= qs.length ? 'النتيجة' : 'التالي'}
          </Button>
        )}
      </div>
    </div>
  );
}
