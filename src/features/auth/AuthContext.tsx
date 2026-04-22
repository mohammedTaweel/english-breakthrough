import { useEffect, useState, type ReactNode } from 'react';
import { onAuthChange } from '@lib/firebase';
import { AuthContext, type AuthState } from './auth-context-value';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, loading: true });

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setState({ user, loading: false });
    });
    return unsubscribe;
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}
