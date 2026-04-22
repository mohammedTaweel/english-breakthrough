/**
 * Progress service — reads and writes user progress to Firestore.
 *
 * Data lives at: users/{uid}/progress/current
 *
 * Design decision: one document per user instead of sub-collections.
 * Firestore charges per read, and we always need the full progress
 * state on load. One document = one read = lower cost + simpler code.
 *
 * The document is ~5-20KB for an active user — well within
 * Firestore's 1MB document limit.
 */

import { doc, getDoc, setDoc, onSnapshot, type Unsubscribe } from 'firebase/firestore';
import { getFirebaseDb } from '@lib/firebase';
import {
  EMPTY_PROGRESS,
  type UserProgress,
  type SessionRecord,
  type QuizResult,
  type LevelTestResult,
  type Checkpoint,
  type CheckpointType,
} from './types';

function progressRef(uid: string) {
  return doc(getFirebaseDb(), 'users', uid, 'progress', 'current');
}

function now() {
  return new Date().toISOString();
}

export async function loadProgress(uid: string): Promise<UserProgress> {
  const snap = await getDoc(progressRef(uid));
  if (!snap.exists()) {
    return { ...EMPTY_PROGRESS };
  }
  return snap.data() as UserProgress;
}

export async function saveProgress(uid: string, progress: UserProgress): Promise<void> {
  await setDoc(progressRef(uid), { ...progress, updatedAt: now() });
}

export function onProgressChange(
  uid: string,
  callback: (progress: UserProgress) => void,
): Unsubscribe {
  return onSnapshot(progressRef(uid), (snap) => {
    callback(snap.exists() ? (snap.data() as UserProgress) : { ...EMPTY_PROGRESS });
  });
}

// --- Atomic update helpers ---

export async function addSessionRecord(uid: string, record: SessionRecord): Promise<void> {
  const progress = await loadProgress(uid);
  progress.sessionHistory.push(record);
  const dayKey = record.date;
  if (!progress.days[dayKey]) progress.days[dayKey] = [];
  if (!progress.days[dayKey].includes('session')) {
    progress.days[dayKey].push('session');
  }
  await saveProgress(uid, progress);
}

export async function addQuizResult(uid: string, result: QuizResult): Promise<void> {
  const progress = await loadProgress(uid);
  progress.quizResults.push(result);
  await saveProgress(uid, progress);
}

export async function addLevelTestResult(uid: string, result: LevelTestResult): Promise<void> {
  const progress = await loadProgress(uid);
  progress.levelTestResults.push(result);
  await saveProgress(uid, progress);
}

export async function addXp(uid: string, amount: number): Promise<number> {
  const progress = await loadProgress(uid);
  progress.xp += amount;
  await saveProgress(uid, progress);
  return progress.xp;
}

export async function updatePhraseReps(
  uid: string,
  key: string,
  count: number,
): Promise<void> {
  const progress = await loadProgress(uid);
  progress.phraseReps[key] = count;
  await saveProgress(uid, progress);
}

export async function updateSrsEntry(
  uid: string,
  key: string,
  entry: { lastDate: string; reps: number; interval: number },
): Promise<void> {
  const progress = await loadProgress(uid);
  progress.srsData[key] = entry;
  await saveProgress(uid, progress);
}

export async function saveCheckpoint(
  uid: string,
  checkpoint: Checkpoint,
): Promise<void> {
  const progress = await loadProgress(uid);
  progress.checkpoints[checkpoint.type] = checkpoint;
  await saveProgress(uid, progress);
}

export async function clearCheckpoint(uid: string, type: CheckpointType): Promise<void> {
  const progress = await loadProgress(uid);
  delete progress.checkpoints[type];
  await saveProgress(uid, progress);
}

export async function setStartDate(uid: string, date: string): Promise<void> {
  const progress = await loadProgress(uid);
  if (!progress.startDate) {
    progress.startDate = date;
    await saveProgress(uid, progress);
  }
}
