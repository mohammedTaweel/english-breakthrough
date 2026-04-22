import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ROUTES } from '@shared/types/routes';
import { PlaceholderScreen } from '@shared/components/PlaceholderScreen';

/**
 * App routing.
 * Placeholders stand in until each feature is migrated from legacy.
 */
export const router = createBrowserRouter([
  {
    path: ROUTES.root,
    element: <Navigate to={ROUTES.today} replace />,
  },
  {
    path: ROUTES.auth,
    element: <PlaceholderScreen title="Auth" feature="auth" />,
  },
  {
    path: ROUTES.onboarding,
    element: <PlaceholderScreen title="Onboarding" feature="onboarding" />,
  },
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
    element: <PlaceholderScreen title="الجمل" feature="phrases" />,
  },
  {
    path: ROUTES.progress,
    element: <PlaceholderScreen title="التقدم" feature="progress" />,
  },
  {
    path: '*',
    element: <PlaceholderScreen title="404" feature="not-found" />,
  },
]);
