import { useState } from 'react';
import { QuickResponseExercise, WeeklyQuizExercise, FillBlankExercise } from './exercises';
import { Card } from '@shared/components';
import styles from './TrainingScreen.module.css';

type ExerciseId = 'quick' | 'quiz' | 'fill' | null;

type ExerciseMeta = {
  id: ExerciseId & string;
  title: string;
  desc: string;
  accent: string;
  tag: string;
};

const EXERCISES: ExerciseMeta[] = [
  { id: 'quick', title: 'استجابة سريعة', desc: 'مواقف يومية — اختر الرد الأنسب', accent: '#3b82f6', tag: 'محادثة' },
  { id: 'quiz', title: 'تقييم أسبوعي', desc: '١٠ أسئلة تقيس تقدمك', accent: '#8b5cf6', tag: 'تقييم' },
  { id: 'fill', title: 'أكمل الفراغ', desc: 'اكتب الكلمات الناقصة', accent: '#f59e0b', tag: 'كتابة' },
];

const EXERCISE_COMPONENTS: Record<string, React.FC> = {
  quick: QuickResponseExercise,
  quiz: WeeklyQuizExercise,
  fill: FillBlankExercise,
};

export function TrainingScreen() {
  const [active, setActive] = useState<ExerciseId>(null);

  if (active) {
    const Component = EXERCISE_COMPONENTS[active];
    return (
      <div>
        <button className={styles.backBtn} onClick={() => setActive(null)}>
          ← رجوع
        </button>
        <Card>
          <Component />
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>تدريب</h1>
        <p className={styles.subtitle}>تمارين إضافية لتعزيز مهاراتك</p>
      </div>

      <p className={styles.sectionLabel}>اختر تمرين</p>

      <div className={styles.grid}>
        {EXERCISES.map((ex) => (
          <div
            key={ex.id}
            className={styles.exerciseCard}
            onClick={() => setActive(ex.id as ExerciseId)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActive(ex.id as ExerciseId); }}
          >
            <div className={styles.exerciseAccent} style={{ background: ex.accent }} />
            <div className={styles.exerciseBody}>
              <div>
                <div className={styles.exerciseName}>{ex.title}</div>
                <div className={styles.exerciseDesc}>{ex.desc}</div>
              </div>
              <span
                className={styles.exerciseTag}
                style={{ background: `${ex.accent}15`, color: ex.accent }}
              >
                {ex.tag}
              </span>
            </div>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--c-text-tertiary)', textAlign: 'center' }}>
        تمارين إضافية (بناء جمل، طلاقة، استماع، ...) قادمة قريباً
      </p>
    </div>
  );
}
