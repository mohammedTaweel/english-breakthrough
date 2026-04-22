import { Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ROUTES } from '@shared/types/routes';
import { ProtectedRoute } from '@features/auth';
import { Loading } from '@shared/components/Loading';
import { AppLayout } from './AppLayout';
import {
  AuthScreen,
  OnboardingScreen,
  TodayScreen,
  TrainingScreen,
  PhrasesScreen,
  ProgressScreen,
} from './lazy-screens';

function withSuspense(Component: React.LazyExoticComponent<React.ComponentType>) {
  return (
    <Suspense fallback={<Loading />}>
      <Component />
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    path: ROUTES.root,
    element: <Navigate to={ROUTES.today} replace />,
  },
  {
    path: ROUTES.auth,
    element: withSuspense(AuthScreen),
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: ROUTES.onboarding,
        element: withSuspense(OnboardingScreen),
      },
      {
        element: <AppLayout />,
        children: [
          { path: ROUTES.today, element: withSuspense(TodayScreen) },
          { path: ROUTES.training, element: withSuspense(TrainingScreen) },
          { path: ROUTES.phrases, element: withSuspense(PhrasesScreen) },
          { path: ROUTES.progress, element: withSuspense(ProgressScreen) },
        ],
      },
    ],
  },
  {
    path: '*',
    element: (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <h1>404 — الصفحة غير موجودة</h1>
      </div>
    ),
  },
]);
