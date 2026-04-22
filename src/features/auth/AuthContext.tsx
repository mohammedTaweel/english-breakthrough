import { useEffect, useState, type ReactNode } from 'react';
import { onAuthChange, isDevMode, type AuthUser } from '@lib/firebase';
import { AuthContext, type AuthState } from './auth-context-value';

const DEV_USER: AuthUser = {
  uid: 'dev-user-001',
  email: 'dev@taliq.app',
  displayName: 'مطوّر',
  photoURL: null,
  provider: 'dev',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() =>
    isDevMode()
      ? { user: DEV_USER, loading: false }
      : { user: null, loading: true },
  );

  useEffect(() => {
    if (isDevMode()) return;
    const unsubscribe = onAuthChange((user) => {
      setState({ user, loading: false });
    });
    return unsubscribe;
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}
