import { useContext } from 'react';
import { ProgressContext } from './progress-context-value';

export function useProgress() {
  return useContext(ProgressContext);
}
