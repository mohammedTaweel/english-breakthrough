/**
 * User progress data models.
 *
 * These mirror what gets stored in Firestore under:
 *   users/{uid}/progress/{document}
 *
 * Every field is explicitly typed — no `any`, no loose objects.
 */

export type RecallScore = 'remembered' | 'partial' | 'forgot';

export type SessionRecord = {
  date: string;
  scenario: string;
  phrasesCount: number;
  recallScores: Record<string, RecallScore>;
  completedAt: string;
};

export type QuizResult = {
  date: string;
  pct: number;
  score: number;
  total: number;
};

export type LevelTestResult = {
  date: string;
  level: number;
  levelCode: string;
  weightedPct: number;
  skills: Record<string, { correct: number; total: number }>;
  duration: number;
};

export type SrsEntry = {
  lastDate: string;
  reps: number;
  interval: number;
};

export type CheckpointType = 'session' | 'quiz' | 'level';

export type Checkpoint = {
  type: CheckpointType;
  date: string;
  data: Record<string, unknown>;
};

/**
 * Root document: users/{uid}/progress/current
 *
 * Single document holding the user's complete progress state.
 * Firestore reads are billed per document, so one document = one read
 * instead of 10 reads for 10 sub-collections.
 */
export type UserProgress = {
  startDate: string | null;
  days: Record<string, string[]>;
  xp: number;
  phraseReps: Record<string, number>;
  srsData: Record<string, SrsEntry>;
  sessionHistory: SessionRecord[];
  quizResults: QuizResult[];
  levelTestResults: LevelTestResult[];
  checkpoints: Partial<Record<CheckpointType, Checkpoint>>;
  updatedAt: string;
};

export const EMPTY_PROGRESS: UserProgress = {
  startDate: null,
  days: {},
  xp: 0,
  phraseReps: {},
  srsData: {},
  sessionHistory: [],
  quizResults: [],
  levelTestResults: [],
  checkpoints: {},
  updatedAt: new Date().toISOString(),
};
