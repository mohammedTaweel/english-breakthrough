import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import { useProgress } from '@features/progress';
import { ROUTES } from '@shared/types/routes';

/**
 * Wraps routes that require authentication.
 *
 * 1. Not logged in → /auth
 * 2. Logged in but no startDate (new user) → /onboarding
 * 3. Logged in + startDate → pass through
 */
export function ProtectedRoute() {
  const { user, loading: authLoading } = useAuth();
  const { progress, loading: progressLoading } = useProgress();
  const { pathname } = useLocation();

  if (authLoading || (user && progressLoading)) {
    return (
      <div
        role="status"
        aria-label="جاري التحميل"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            border: '3px solid var(--c-border)',
            borderTopColor: 'var(--c-accent)',
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={ROUTES.auth} replace />;
  }

  // New user without startDate → onboarding (unless already there)
  if (!progress.startDate && pathname !== ROUTES.onboarding) {
    return <Navigate to={ROUTES.onboarding} replace />;
  }

  return <Outlet />;
}
