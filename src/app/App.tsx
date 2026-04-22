import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { ErrorBoundary } from './ErrorBoundary';
import { AuthProvider } from '@features/auth';
import { ProgressProvider } from '@features/progress';

export function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ProgressProvider>
          <RouterProvider router={router} />
        </ProgressProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
