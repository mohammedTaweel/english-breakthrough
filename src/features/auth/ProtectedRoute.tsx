import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './useAuth';
import { ROUTES } from '@shared/types/routes';

/**
 * Wraps routes that require authentication.
 * Shows a loading spinner while Firebase resolves the auth state,
 * then either renders the child route or redirects to /auth.
 */
export function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
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

  return <Outlet />;
}
