import { createContext } from 'react';
import type { AuthUser } from '@lib/firebase';

export type AuthState = {
  user: AuthUser | null;
  loading: boolean;
};

export const AuthContext = createContext<AuthState | null>(null);
