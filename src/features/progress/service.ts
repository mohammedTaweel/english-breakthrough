/**
 * Service selector — picks the right progress backend.
 * Dev mode: localStorage. Production: Firestore.
 */

import { isDevMode } from '@lib/firebase';
import * as firestoreService from './progress-service';
import * as devService from './progress-service-dev';

const svc = isDevMode() ? devService : firestoreService;

export const loadProgress = svc.loadProgress;
export const saveProgress = svc.saveProgress;
export const onProgressChange = svc.onProgressChange;
export const addSessionRecord = svc.addSessionRecord;
export const addQuizResult = svc.addQuizResult;
export const addLevelTestResult = svc.addLevelTestResult;
export const addXp = svc.addXp;
export const updatePhraseReps = svc.updatePhraseReps;
export const updateSrsEntry = svc.updateSrsEntry;
export const saveCheckpoint = svc.saveCheckpoint;
export const clearCheckpoint = svc.clearCheckpoint;
export const setStartDate = svc.setStartDate;
