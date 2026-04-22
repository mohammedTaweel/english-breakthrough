import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ROUTES } from '@shared/types/routes';
import { PlaceholderScreen } from '@shared/components/PlaceholderScreen';
import { AuthScreen, ProtectedRoute } from '@features/auth';
import { AppLayout } from './AppLayout';
import { PhrasesScreen } from '@features/phrases/PhrasesScreen';

export const router = createBrowserRouter([
  {
    path: ROUTES.root,
    element: <Navigate to={ROUTES.today} replace />,
  },
  {
    path: ROUTES.auth,
    element: <AuthScreen />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: ROUTES.onboarding,
        element: <PlaceholderScreen title="Onboarding" feature="onboarding" />,
      },
      {
        element: <AppLayout />,
        children: [
          {
            path: ROUTES.today,
            element: <PlaceholderScreen title="اليوم" feature="today" />,
          },
          {
            path: ROUTES.training,
            element: <PlaceholderScreen title="تدريب" feature="training" />,
          },
          {
            path: ROUTES.phrases,
            element: <PhrasesScreen />,
          },
          {
            path: ROUTES.progress,
            element: <PlaceholderScreen title="التقدم" feature="progress" />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <PlaceholderScreen title="404" feature="not-found" />,
  },
]);
