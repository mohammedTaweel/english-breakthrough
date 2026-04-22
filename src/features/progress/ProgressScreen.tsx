import { useAuth } from '@features/auth';
import { useProgress } from './useProgress';
import { signOut } from '@lib/firebase';
import { today, weekNumber, phase, streak } from '@shared/utils';
import { CEFR_LEVELS } from '@/content';
import styles from './ProgressScreen.module.css';

function barColor(pct: number): string {
  if (pct >= 80) return 'var(--c-success)';
  if (pct >= 50) return 'var(--c-accent)';
  return 'var(--c-error)';
}

export function ProgressScreen() {
  const { user } = useAuth();
  const { progress } = useProgress();

  const startDate = progress.startDate ?? today();
  const wk = weekNumber(startDate);
  const ph = phase(wk);
  const streakDays = streak(progress.days);
  const trainingDays = Object.keys(progress.days).length;

  const sessions = progress.sessionHistory;
  const quizzes = progress.quizResults;
  const lastLevel = progress.levelTestResults.length > 0
    ? progress.levelTestResults[progress.levelTestResults.length - 1]
    : null;

  // Memory stats from recent sessions
  const recentSessions = sessions.slice(-10);
  let remembered = 0;
  let partial = 0;
  let forgot = 0;
  for (const s of recentSessions) {
    for (const score of Object.values(s.recallScores)) {
      if (score === 'remembered') remembered++;
      else if (score === 'partial') partial++;
      else forgot++;
    }
  }
  const memoryTotal = remembered + partial + forgot;
  const memoryPct = memoryTotal > 0 ? Math.round((remembered / memoryTotal) * 100) : 0;

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>التقدم</h1>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{trainingDays}</div>
          <div className={styles.statLabel}>يوم تدريب</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{wk}/12</div>
          <div className={styles.statLabel}>الأسبوع</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{streakDays}</div>
          <div className={styles.statLabel}>سلسلة</div>
        </div>
      </div>

      {/* Week progress */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>الأسابيع — المرحلة {ph.number}: {ph.name}</h2>
        <div className={styles.weekGrid}>
          {Array.from({ length: 12 }, (_, i) => {
            const weekNum = i + 1;
            const done = weekNum < wk;
            const current = weekNum === wk;
            return (
              <div key={i} className={styles.weekCell}>
                <div className={`${styles.weekDot} ${done ? styles.weekDotDone : current ? styles.weekDotCurrent : ''}`}>
                  {done ? '✓' : weekNum}
                </div>
                <span className={styles.weekLabel}>{weekNum}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Memory donut */}
      {memoryTotal > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>أداء الذاكرة</h2>
          <div className={styles.donutWrap}>
            <svg width="100" height="100" viewBox="0 0 36 36" aria-label={`نسبة التذكر ${memoryPct}%`}>
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--c-surface-sunken)" strokeWidth="3" />
              {memoryTotal > 0 && (
                <>
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--c-success)" strokeWidth="3"
                    strokeDasharray={`${(remembered / memoryTotal) * 100} ${100 - (remembered / memoryTotal) * 100}`}
                    strokeDashoffset="25" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--c-warn)" strokeWidth="3"
                    strokeDasharray={`${(partial / memoryTotal) * 100} ${100 - (partial / memoryTotal) * 100}`}
                    strokeDashoffset={`${25 - (remembered / memoryTotal) * 100}`} />
                </>
              )}
              <text x="18" y="18" textAnchor="middle" dominantBaseline="central"
                fill="var(--c-text)" fontSize="7" fontWeight="800" fontFamily="var(--ff-mono)">
                {memoryPct}%
              </text>
            </svg>
            <div className={styles.legend}>
              <div className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: 'var(--c-success)' }} />
                محفوظة ({remembered})
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: 'var(--c-warn)' }} />
                جزئية ({partial})
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: 'var(--c-error)' }} />
                منسية ({forgot})
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quiz results */}
      {quizzes.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>نتائج الاختبارات</h2>
          {quizzes.slice(-6).map((q, i) => (
            <div key={i} className={styles.barRow}>
              <span className={styles.barLabel}>{q.date.slice(5)}</span>
              <div className={styles.barTrack}>
                <div className={styles.barFill} style={{ width: `${q.pct}%`, background: barColor(q.pct) }}>
                  {q.pct}%
                </div>
              </div>
            </div>
          ))}
          {quizzes.length >= 2 && (() => {
            const last = quizzes[quizzes.length - 1].pct;
            const prev = quizzes[quizzes.length - 2].pct;
            const diff = last - prev;
            if (diff === 0) return null;
            return (
              <p style={{ fontSize: 'var(--fs-sm)', fontWeight: 700, color: diff > 0 ? 'var(--c-success)' : 'var(--c-error)', textAlign: 'center', marginTop: 'var(--sp-2)' }}>
                {diff > 0 ? `+${diff}%` : `${diff}%`} عن الاختبار السابق
              </p>
            );
          })()}
        </div>
      )}

      {/* CEFR Level */}
      {lastLevel && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>مستوى التمكّن</h2>
          <div style={{ textAlign: 'center', marginBottom: 'var(--sp-4)' }}>
            <span className={styles.levelBadge} style={{
              background: `${CEFR_LEVELS[lastLevel.level].color}18`,
              color: CEFR_LEVELS[lastLevel.level].color,
            }}>
              {lastLevel.levelCode}
            </span>
            <div style={{ fontSize: 'var(--fs-md)', fontWeight: 700, marginTop: 'var(--sp-2)' }}>
              {CEFR_LEVELS[lastLevel.level].name}
            </div>
          </div>

          {/* Skills breakdown */}
          {Object.entries(lastLevel.skills).map(([skill, data]) => {
            if (data.total === 0) return null;
            const pct = Math.round((data.correct / data.total) * 100);
            return (
              <div key={skill} className={styles.skillRow}>
                <div className={styles.skillLabel}>
                  <span className={styles.skillName}>{skill}</span>
                  <span className={styles.skillPct} style={{ color: barColor(pct) }}>{pct}%</span>
                </div>
                <div className={styles.skillBar}>
                  <div className={styles.skillFill} style={{ width: `${pct}%`, background: barColor(pct) }} />
                </div>
              </div>
            );
          })}

          <p className={styles.levelDesc}>{CEFR_LEVELS[lastLevel.level].tip}</p>
        </div>
      )}

      {/* XP */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>نقاط التمكّن</h2>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 'var(--fs-2xl)', fontWeight: 800, color: 'var(--c-accent)', fontFamily: 'var(--ff-mono)' }}>
            {progress.xp}
          </div>
          <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--c-text-secondary)' }}>نقطة</div>
        </div>
      </div>

      {/* User info + signout */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>الملف الشخصي</h2>
        <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--c-text-secondary)' }}>
          {user?.displayName && <div style={{ fontWeight: 700, color: 'var(--c-text)', marginBottom: 'var(--sp-1)' }}>{user.displayName}</div>}
          {user?.email && <div>{user.email}</div>}
          {progress.startDate && <div style={{ marginTop: 'var(--sp-2)' }}>بدأ البرنامج: {progress.startDate}</div>}
        </div>
        <button className={styles.signOutBtn} onClick={() => signOut()}>
          تسجيل خروج
        </button>
      </div>
    </div>
  );
}
