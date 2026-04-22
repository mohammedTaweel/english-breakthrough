import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { ErrorBoundary } from './ErrorBoundary';
import { AuthProvider } from '@features/auth';

export function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ErrorBoundary>
  );
}
