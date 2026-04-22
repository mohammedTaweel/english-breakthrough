import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@features/auth';
import { setStartDate } from '@features/progress';
import { today } from '@shared/utils';
import { Button } from '@shared/components';
import { ROUTES } from '@shared/types/routes';
import styles from './OnboardingScreen.module.css';

const TOTAL_STEPS = 5;

const GOALS = [
  { icon: '💼', text: 'أقود فريقي بالإنجليزية بثقة' },
  { icon: '🌍', text: 'أتواصل مع زملاء وعملاء عالميين' },
  { icon: '✈️', text: 'أسافر وأتكلم بدون حرج' },
  { icon: '📈', text: 'أطوّر مساري المهني' },
] as const;

const SESSION_STEPS = [
  { num: '١', label: 'استمع — تدريب الأذن' },
  { num: '٢', label: 'استمع واقرأ — ربط الصوت بالنص' },
  { num: '٣', label: 'ردّد — بناء ذاكرة عضلية' },
  { num: '٤', label: 'تذكّر — استرجاع من الذاكرة' },
  { num: '٥', label: 'أنتج — اختر الرد الأفضل' },
  { num: '٦', label: 'طبّق — تحدي في الحياة الحقيقية' },
] as const;

const TESTIMONIALS = [
  { text: 'بعد أسبوعين صرت أفهم الاجتماعات أكثر بكثير', name: 'خالد، مدير مشاريع' },
  { text: 'أول مرة أحس إن طريقة التعلم مختلفة فعلاً', name: 'سارة، محللة بيانات' },
  { text: 'الـ Shadowing غيّر كل شي — صرت أفكر بالإنجليزي', name: 'فهد، مهندس' },
] as const;

export function OnboardingScreen() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<number | null>(null);

  async function handleCommit() {
    if (user) {
      await setStartDate(user.uid, today());
    }
    navigate(ROUTES.today, { replace: true });
  }

  return (
    <div dir="rtl" className={styles.wrapper}>
      <div className={styles.card}>
        {/* Step dots */}
        <div className={styles.dots}>
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div key={i} className={`${styles.dot} ${i <= step ? styles.dotActive : ''}`} />
          ))}
        </div>

        {/* Step 0: Problem */}
        {step === 0 && (
          <>
            <div className={styles.icon}>🧠</div>
            <h1 className={styles.title}>تعرف كلمات كثيرة... لكن ما تقدر تتكلم؟</h1>
            <p className={styles.desc}>
              تقرأ إيميلات بالإنجليزي وتفهمها. بس لما أحد يكلمك وجهاً لوجه —{' '}
              <span className={styles.highlight}>تتجمد.</span>
              <br />
              ١٧ سنة محاولات بالطرق التقليدية — المشكلة مش أنت. المشكلة الطريقة.
            </p>
            <Button fullWidth onClick={() => setStep(1)}>هذا أنا بالضبط!</Button>
          </>
        )}

        {/* Step 1: Solution */}
        {step === 1 && (
          <>
            <div className={styles.icon}>⚡</div>
            <h1 className={styles.title}>الفرق بين الحفظ والاكتساب</h1>
            <p className={styles.desc}>
              <span className={styles.highlight}>الحفظ:</span> تحفظ قواعد → تنساها → تحبط
              <br />
              <span className={styles.highlight}>الاكتساب:</span> تكرار في سياق حقيقي → مسارات
              عصبية جديدة → طلاقة تلقائية
              <br /><br />
              طَلِق يستخدم الاكتساب — نفس الطريقة اللي تعلمت فيها العربي.
            </p>
            <div className={styles.btnRow}>
              <Button variant="ghost" onClick={() => setStep(0)}>السابق</Button>
              <Button onClick={() => setStep(2)}>كيف يشتغل؟</Button>
            </div>
          </>
        )}

        {/* Step 2: Method */}
        {step === 2 && (
          <>
            <div className={styles.icon}>⏱️</div>
            <h1 className={styles.title}>١٥ دقيقة يومياً — ٦ خطوات</h1>
            <p className={styles.desc}>كل يوم تتدرب على سيناريو واقعي من ٦ زوايا:</p>
            <div className={styles.stepsGrid}>
              {SESSION_STEPS.map((s) => (
                <div key={s.num} className={styles.stepRow}>
                  <span className={styles.stepNum}>{s.num}</span>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
            <div className={styles.btnRow}>
              <Button variant="ghost" onClick={() => setStep(1)}>السابق</Button>
              <Button onClick={() => setStep(3)}>أقدر ألتزم!</Button>
            </div>
          </>
        )}

        {/* Step 3: Goal */}
        {step === 3 && (
          <>
            <div className={styles.icon}>🎯</div>
            <h1 className={styles.title}>وش هدفك الأساسي؟</h1>
            <div className={styles.goalGrid}>
              {GOALS.map((g, i) => (
                <button
                  key={i}
                  className={`${styles.goalBtn} ${goal === i ? styles.goalBtnActive : ''}`}
                  onClick={() => setGoal(i)}
                >
                  <span className={styles.goalIcon}>{g.icon}</span>
                  <span>{g.text}</span>
                </button>
              ))}
            </div>
            <div className={styles.btnRow}>
              <Button variant="ghost" onClick={() => setStep(2)}>السابق</Button>
              <Button onClick={() => setStep(4)} disabled={goal === null}>التالي</Button>
            </div>
          </>
        )}

        {/* Step 4: Social proof + commit */}
        {step === 4 && (
          <>
            <div className={styles.icon}>🚀</div>
            <h1 className={styles.title}>أنت مش لوحدك</h1>
            <div className={styles.social}>230+ شخص يتدرب الآن</div>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className={styles.quote}>
                "{t.text}"
                <div className={styles.quoteName}>— {t.name}</div>
              </div>
            ))}
            <p className={styles.desc}>
              أتعهد إني أعطي <span className={styles.highlight}>١٥ دقيقة يومياً</span> لمدة ١٢
              أسبوع
            </p>
            <div className={styles.btnRow}>
              <Button variant="ghost" onClick={() => setStep(3)}>السابق</Button>
              <Button onClick={handleCommit}>ابدأ رحلتك الآن</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
