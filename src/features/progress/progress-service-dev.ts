/**
 * Dev-mode progress service — uses localStorage instead of Firestore.
 * Same API as progress-service.ts so the rest of the app doesn't know the difference.
 */

import {
  EMPTY_PROGRESS,
  type UserProgress,
  type SessionRecord,
  type QuizResult,
  type LevelTestResult,
  type Checkpoint,
  type CheckpointType,
} from './types';

const STORAGE_KEY = 'taliq-dev-progress';

function now() {
  return new Date().toISOString();
}

function readFromStorage(): UserProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UserProgress) : { ...EMPTY_PROGRESS };
  } catch {
    return { ...EMPTY_PROGRESS };
  }
}

function writeToStorage(progress: UserProgress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...progress, updatedAt: now() }));
}

type Unsubscribe = () => void;

// Simple polling for dev — checks every 2s
const listeners = new Set<(p: UserProgress) => void>();
let polling = false;

function startPolling() {
  if (polling) return;
  polling = true;
  const interval = setInterval(() => {
    if (listeners.size === 0) {
      clearInterval(interval);
      polling = false;
      return;
    }
    const data = readFromStorage();
    listeners.forEach((cb) => cb(data));
  }, 2000);
}

export async function loadProgress(_uid: string): Promise<UserProgress> {
  return readFromStorage();
}

export async function saveProgress(_uid: string, progress: UserProgress): Promise<void> {
  writeToStorage(progress);
}

export function onProgressChange(
  _uid: string,
  callback: (progress: UserProgress) => void,
): Unsubscribe {
  // Fire immediately with current data
  callback(readFromStorage());
  listeners.add(callback);
  startPolling();
  return () => {
    listeners.delete(callback);
  };
}

export async function addSessionRecord(_uid: string, record: SessionRecord): Promise<void> {
  const progress = readFromStorage();
  progress.sessionHistory.push(record);
  const dayKey = record.date;
  if (!progress.days[dayKey]) progress.days[dayKey] = [];
  if (!progress.days[dayKey].includes('session')) progress.days[dayKey].push('session');
  writeToStorage(progress);
  listeners.forEach((cb) => cb(readFromStorage()));
}

export async function addQuizResult(_uid: string, result: QuizResult): Promise<void> {
  const progress = readFromStorage();
  progress.quizResults.push(result);
  writeToStorage(progress);
  listeners.forEach((cb) => cb(readFromStorage()));
}

export async function addLevelTestResult(_uid: string, result: LevelTestResult): Promise<void> {
  const progress = readFromStorage();
  progress.levelTestResults.push(result);
  writeToStorage(progress);
  listeners.forEach((cb) => cb(readFromStorage()));
}

export async function addXp(_uid: string, amount: number): Promise<number> {
  const progress = readFromStorage();
  progress.xp += amount;
  writeToStorage(progress);
  listeners.forEach((cb) => cb(readFromStorage()));
  return progress.xp;
}

export async function updatePhraseReps(_uid: string, key: string, count: number): Promise<void> {
  const progress = readFromStorage();
  progress.phraseReps[key] = count;
  writeToStorage(progress);
  listeners.forEach((cb) => cb(readFromStorage()));
}

export async function updateSrsEntry(
  _uid: string,
  key: string,
  entry: { lastDate: string; reps: number; interval: number },
): Promise<void> {
  const progress = readFromStorage();
  progress.srsData[key] = entry;
  writeToStorage(progress);
  listeners.forEach((cb) => cb(readFromStorage()));
}

export async function saveCheckpoint(_uid: string, checkpoint: Checkpoint): Promise<void> {
  const progress = readFromStorage();
  progress.checkpoints[checkpoint.type] = checkpoint;
  writeToStorage(progress);
}

export async function clearCheckpoint(_uid: string, type: CheckpointType): Promise<void> {
  const progress = readFromStorage();
  delete progress.checkpoints[type];
  writeToStorage(progress);
}

export async function setStartDate(_uid: string, date: string): Promise<void> {
  const progress = readFromStorage();
  if (!progress.startDate) {
    progress.startDate = date;
    writeToStorage(progress);
    listeners.forEach((cb) => cb(readFromStorage()));
  }
}
