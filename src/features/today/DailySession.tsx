import { useState, useCallback } from 'react';
import { Card } from '@shared/components';
import { useAuth } from '@features/auth';
import { addSessionRecord, addXp, type RecallScore } from '@features/progress';
import { today } from '@shared/utils';
import type { DailyScenario } from '@/content/schemas';
import {
  ListenStep,
  ReadStep,
  ShadowStep,
  RecallStep,
  ProduceStep,
  ApplyStep,
} from './steps';
import styles from './DailySession.module.css';

type Props = {
  scenario: DailyScenario;
  onComplete: () => void;
};

const STEPS = [
  { key: 'listen', label: 'استمع' },
  { key: 'read', label: 'اقرأ' },
  { key: 'shadow', label: 'ردّد' },
  { key: 'recall', label: 'تذكّر' },
  { key: 'produce', label: 'أنتج' },
  { key: 'apply', label: 'طبّق' },
] as const;

const XP_REWARD = 25;

export function DailySession({ scenario, onComplete }: Props) {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [recallScores, setRecallScores] = useState<Record<string, RecallScore>>({});

  const goNext = useCallback(() => {
    setActiveStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  }, []);

  const handleRecallDone = useCallback(
    (scores: Record<string, RecallScore>) => {
      setRecallScores(scores);
      goNext();
    },
    [goNext],
  );

  const handleComplete = useCallback(async () => {
    if (!user) return;

    await addSessionRecord(user.uid, {
      date: today(),
      scenario: scenario.title,
      phrasesCount: scenario.keyPhrases.length,
      recallScores,
      completedAt: new Date().toISOString(),
    });

    await addXp(user.uid, XP_REWARD);
    onComplete();
  }, [user, scenario, recallScores, onComplete]);

  return (
    <div className={styles.sessionContainer}>
      {/* Step indicator */}
      <nav className={styles.stepNav} aria-label="خطوات الجلسة">
        {STEPS.map((step, i) => (
          <div
            key={step.key}
            className={`${styles.stepDot} ${i < activeStep ? styles.stepDone : ''} ${i === activeStep ? styles.stepActive : ''}`}
            aria-current={i === activeStep ? 'step' : undefined}
            aria-label={`${step.label} — ${i < activeStep ? 'مكتمل' : i === activeStep ? 'حالي' : 'قادم'}`}
          >
            <span className={styles.stepDotNum}>{i + 1}</span>
            <span className={styles.stepDotLabel}>{step.label}</span>
          </div>
        ))}
      </nav>

      {/* Active step content */}
      <Card padding="lg">
        {activeStep === 0 && (
          <ListenStep scenario={scenario} onNext={goNext} />
        )}
        {activeStep === 1 && (
          <ReadStep scenario={scenario} onNext={goNext} />
        )}
        {activeStep === 2 && (
          <ShadowStep scenario={scenario} onNext={goNext} />
        )}
        {activeStep === 3 && (
          <RecallStep scenario={scenario} onNext={handleRecallDone} />
        )}
        {activeStep === 4 && (
          <ProduceStep scenario={scenario} onNext={goNext} />
        )}
        {activeStep === 5 && (
          <ApplyStep scenario={scenario} onComplete={handleComplete} />
        )}
      </Card>
    </div>
  );
}
