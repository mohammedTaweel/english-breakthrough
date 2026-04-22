import { useState, useCallback } from 'react';
import { PHRASES } from '@/content';
import { useProgress } from '@features/progress';
import { updatePhraseReps, updateSrsEntry } from '@features/progress';
import { useAuth } from '@features/auth';
import { useSpeak } from '@shared/hooks';
import { today } from '@shared/utils';
import styles from './PhrasesScreen.module.css';

export function PhrasesScreen() {
  const { user } = useAuth();
  const { progress } = useProgress();
  const { playing, play } = useSpeak();
  const [catIdx, setCatIdx] = useState(0);

  const reps = progress.phraseReps;
  const category = PHRASES[catIdx];

  const totalPhrases = PHRASES.reduce((sum, c) => sum + c.items.length, 0);
  const mastered = Object.values(reps).filter((r) => r >= 5).length;

  const handleTap = useCallback(
    async (phraseKey: string) => {
      if (!user) return;
      const current = reps[phraseKey] ?? 0;
      const next = current + 1;
      await updatePhraseReps(user.uid, phraseKey, next);

      if (next >= 5) {
        const existing = progress.srsData[phraseKey];
        const prevInterval = existing?.interval ?? 1;
        const prevReps = existing?.reps ?? 0;
        await updateSrsEntry(user.uid, phraseKey, {
          lastDate: today(),
          reps: prevReps + 1,
          interval: Math.min(prevInterval * 2, 14),
        });
      }
    },
    [user, reps, progress.srsData],
  );

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>الجمل الجاهزة</h1>
        <p className={styles.subtitle}>
          35 جملة أساسية — اضغط على كل جملة كل مرة ترددها
        </p>
      </div>

      <div className={styles.progressBar}>
        <div className={styles.progressLabel}>
          <span>أتقنت {mastered} من {totalPhrases}</span>
          <span>{Math.round((mastered / totalPhrases) * 100)}%</span>
        </div>
        <div
          style={{
            height: 6,
            borderRadius: 'var(--r-full)',
            background: 'var(--c-surface-sunken)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${(mastered / totalPhrases) * 100}%`,
              background: 'var(--c-success)',
              borderRadius: 'var(--r-full)',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      <div className={styles.pills} role="tablist" aria-label="فئات الجمل">
        {PHRASES.map((c, i) => (
          <button
            key={c.cat}
            className={`${styles.pill} ${catIdx === i ? styles.pillActive : ''}`}
            onClick={() => setCatIdx(i)}
            role="tab"
            aria-selected={catIdx === i}
          >
            {c.cat}
          </button>
        ))}
      </div>

      <div role="tabpanel" aria-label={category.cat}>
        {category.items.map((item, i) => {
          const key = `p${catIdx}-${i}`;
          const rep = reps[key] ?? 0;
          const done = rep >= 5;
          return (
            <div
              key={key}
              className={`${styles.phraseItem} ${done ? styles.phraseItemDone : ''}`}
              onClick={() => handleTap(key)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleTap(key);
              }}
            >
              <div
                className={`${styles.repCircle} ${done ? styles.repCircleDone : rep > 0 ? styles.repCircleActive : ''}`}
              >
                {done ? '✓' : rep}
              </div>
              <div className={styles.phraseContent}>
                <div className={styles.phraseEn}>{item.en}</div>
                <div className={styles.phraseAr}>{item.ar}</div>
              </div>
              <button
                className={`${styles.speakBtn} ${playing ? styles.speakBtnPlaying : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  play(item.en);
                }}
                aria-label={`استمع: ${item.en}`}
              >
                ♪
              </button>
            </div>
          );
        })}
      </div>

      <p className={styles.hint}>اضغط على الدائرة كل مرة ترددّ — الهدف ٥ لكل جملة</p>
    </div>
  );
}
