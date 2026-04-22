import { createContext } from 'react';
import { EMPTY_PROGRESS, type UserProgress } from './types';

export type ProgressContextValue = {
  progress: UserProgress;
  loading: boolean;
};

export const ProgressContext = createContext<ProgressContextValue>({
  progress: EMPTY_PROGRESS,
  loading: true,
});
