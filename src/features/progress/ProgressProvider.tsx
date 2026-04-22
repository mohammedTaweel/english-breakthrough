import { useMemo, useSyncExternalStore, type ReactNode } from 'react';
import { useAuth } from '@features/auth';
import { onProgressChange } from './service';
import { ProgressContext, type ProgressContextValue } from './progress-context-value';
import { EMPTY_PROGRESS, type UserProgress } from './types';

/**
 * Per-uid store — subscribes to Firestore and caches the latest snapshot.
 * useSyncExternalStore is the React 18 primitive for external stores and
 * avoids the setState-in-effect warning entirely.
 */
type Store = {
  subscribe: (cb: () => void) => () => void;
  getSnapshot: () => { progress: UserProgress; loading: boolean };
};

const emptyStore: Store = {
  subscribe: () => () => {},
  getSnapshot: () => ({ progress: EMPTY_PROGRESS, loading: false }),
};

const storeCache = new Map<string, Store>();

function createStore(uid: string): Store {
  let state: { progress: UserProgress; loading: boolean } = {
    progress: EMPTY_PROGRESS,
    loading: true,
  };
  const listeners = new Set<() => void>();
  let unsubscribeFirestore: (() => void) | null = null;

  function ensureSubscribed() {
    if (unsubscribeFirestore) return;
    unsubscribeFirestore = onProgressChange(uid, (progress) => {
      state = { progress, loading: false };
      listeners.forEach((l) => l());
    });
  }

  return {
    subscribe(cb) {
      ensureSubscribed();
      listeners.add(cb);
      return () => {
        listeners.delete(cb);
        if (listeners.size === 0 && unsubscribeFirestore) {
          unsubscribeFirestore();
          unsubscribeFirestore = null;
        }
      };
    },
    getSnapshot: () => state,
  };
}

function getStore(uid: string | null): Store {
  if (!uid) return emptyStore;
  let store = storeCache.get(uid);
  if (!store) {
    store = createStore(uid);
    storeCache.set(uid, store);
  }
  return store;
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const uid = user?.uid ?? null;
  const store = useMemo(() => getStore(uid), [uid]);
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot);

  const value = useMemo<ProgressContextValue>(
    () => ({ progress: snapshot.progress, loading: snapshot.loading }),
    [snapshot],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}
