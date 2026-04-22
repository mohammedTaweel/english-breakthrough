import { lazy } from 'react';

export const AuthScreen = lazy(() =>
  import('@features/auth/AuthScreen').then((m) => ({ default: m.AuthScreen })),
);
export const OnboardingScreen = lazy(() =>
  import('@features/onboarding/OnboardingScreen').then((m) => ({
    default: m.OnboardingScreen,
  })),
);
export const TodayScreen = lazy(() =>
  import('@features/today/TodayScreen').then((m) => ({ default: m.TodayScreen })),
);
export const TrainingScreen = lazy(() =>
  import('@features/training/TrainingScreen').then((m) => ({ default: m.TrainingScreen })),
);
export const PhrasesScreen = lazy(() =>
  import('@features/phrases/PhrasesScreen').then((m) => ({ default: m.PhrasesScreen })),
);
export const ProgressScreen = lazy(() =>
  import('@features/progress/ProgressScreen').then((m) => ({ default: m.ProgressScreen })),
);
