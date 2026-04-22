/**
 * Zod schemas and TypeScript types for all Taliq content.
 *
 * This file defines the expected shape of every data structure used
 * in the app.  It does NOT import any data — it is purely declarative.
 */
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Shadowing
// ---------------------------------------------------------------------------

/** A single level of shadow lines — an array of English sentences. */
export const ShadowLevelSchema = z.array(z.string().min(1));

/** All shadow-line levels (level 1 / 2 / 3). */
export const ShadowLinesSchema = z
  .array(ShadowLevelSchema)
  .min(1, 'At least one shadow level required');

export type ShadowLevel = z.infer<typeof ShadowLevelSchema>;
export type ShadowLines = z.infer<typeof ShadowLinesSchema>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

export const StorySchema = z.object({
  /** Arabic title */
  t: z.string().min(1),
  /** 10 English sentences */
  lines: z.array(z.string().min(1)).min(1),
});

export const StoriesSchema = z.array(StorySchema).min(1);

export type Story = z.infer<typeof StorySchema>;

// ---------------------------------------------------------------------------
// Prompts (Think-Aloud topics)
// ---------------------------------------------------------------------------

export const PromptSchema = z.object({
  /** English prompt */
  en: z.string().min(1),
  /** Arabic prompt */
  ar: z.string().min(1),
  /** Sentence starters */
  starters: z.array(z.string().min(1)).min(1),
});

export const PromptsSchema = z.array(PromptSchema).min(1);

export type Prompt = z.infer<typeof PromptSchema>;

// ---------------------------------------------------------------------------
// Phrases & Phrase Categories
// ---------------------------------------------------------------------------

export const PhraseItemSchema = z.object({
  en: z.string().min(1),
  ar: z.string().min(1),
});

export const PhraseCategorySchema = z.object({
  /** Arabic category name */
  cat: z.string().min(1),
  /** Icon (emoji or character) */
  icon: z.string(),
  /** Phrase items in this category */
  items: z.array(PhraseItemSchema).min(1),
});

export const PhrasesSchema = z.array(PhraseCategorySchema).min(1);

export type PhraseItem = z.infer<typeof PhraseItemSchema>;
export type PhraseCategory = z.infer<typeof PhraseCategorySchema>;

// ---------------------------------------------------------------------------
// Phrase Patterns (cross-context reuse)
// ---------------------------------------------------------------------------

export const PhrasePatternSchema = z.object({
  pattern: z.string().min(1),
  usage: z.string().min(1),
  scenarios: z.array(z.string().min(1)).min(1),
});

export const PhrasePatternMapSchema = z.record(z.string(), PhrasePatternSchema);

export type PhrasePattern = z.infer<typeof PhrasePatternSchema>;
export type PhrasePatternMap = z.infer<typeof PhrasePatternMapSchema>;

// ---------------------------------------------------------------------------
// Motivation
// ---------------------------------------------------------------------------

export const MotivationSchema = z.array(z.string().min(1)).min(1);

export type Motivation = z.infer<typeof MotivationSchema>;

// ---------------------------------------------------------------------------
// Conversations (interactive scenarios)
// ---------------------------------------------------------------------------

export const ConversationStepSchema = z.object({
  speaker: z.string().min(1),
  text: z.string().min(1),
  prompt: z.string().min(1),
  opts: z.array(z.string().min(1)).min(2),
  ans: z.number().int().min(0),
});

export const ConversationSchema = z.object({
  title: z.string().min(1),
  icon: z.string(),
  steps: z.array(ConversationStepSchema).min(1),
});

export const ConversationsSchema = z.array(ConversationSchema).min(1);

export type ConversationStep = z.infer<typeof ConversationStepSchema>;
export type Conversation = z.infer<typeof ConversationSchema>;

// ---------------------------------------------------------------------------
// Quick Response
// ---------------------------------------------------------------------------

export const QuickResponseSchema = z.object({
  sit: z.string().min(1),
  opts: z.array(z.string().min(1)).min(2),
  ans: z.number().int().min(0),
});

export const QuickResponsesSchema = z.array(QuickResponseSchema).min(1);

export type QuickResponse = z.infer<typeof QuickResponseSchema>;

// ---------------------------------------------------------------------------
// Quiz Bank
// ---------------------------------------------------------------------------

export const QuizQuestionSchema = z.object({
  q: z.string().min(1),
  opts: z.array(z.string().min(1)).min(2),
  ans: z.number().int().min(0),
});

export const QuizBankSchema = z.array(QuizQuestionSchema).min(1);

export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;

// ---------------------------------------------------------------------------
// CEFR Levels & Level Test
// ---------------------------------------------------------------------------

export const CEFRLevelSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  nameEn: z.string().min(1),
  color: z.string().min(1),
  desc: z.string().min(1),
  tip: z.string().min(1),
});

export const CEFRLevelsSchema = z.array(CEFRLevelSchema).min(1);

export type CEFRLevel = z.infer<typeof CEFRLevelSchema>;

export const LevelTestQuestionSchema = z.object({
  level: z.number().int().min(0),
  type: z.string().min(1),
  q: z.string().min(1),
  opts: z.array(z.string().min(1)).min(2),
  ans: z.number().int().min(0),
  audio: z.string().optional(),
});

export const LevelTestSchema = z.array(LevelTestQuestionSchema).min(1);

export type LevelTestQuestion = z.infer<typeof LevelTestQuestionSchema>;

/** Map from CEFR code to numeric index */
export const LevelIdxSchema = z.record(z.string(), z.number().int().min(0));

export type LevelIdx = z.infer<typeof LevelIdxSchema>;

/** Map from question type to Arabic label */
export const TypeLabelsSchema = z.record(z.string(), z.string());

export type TypeLabels = z.infer<typeof TypeLabelsSchema>;

/** Map from question type to icon character */
export const TypeIconsSchema = z.record(z.string(), z.string());

export type TypeIcons = z.infer<typeof TypeIconsSchema>;

// ---------------------------------------------------------------------------
// Listen Items
// ---------------------------------------------------------------------------

export const ListenItemSchema = z.object({
  text: z.string().min(1),
  q: z.string().min(1),
  opts: z.array(z.string().min(1)).min(2),
  ans: z.number().int().min(0),
});

export const ListenItemsSchema = z.array(ListenItemSchema).min(1);

export type ListenItem = z.infer<typeof ListenItemSchema>;

// ---------------------------------------------------------------------------
// Dictation Items
// ---------------------------------------------------------------------------

export const DictationItemsSchema = z.array(z.string().min(1)).min(1);

export type DictationItems = z.infer<typeof DictationItemsSchema>;

// ---------------------------------------------------------------------------
// Daily Scenarios (deep processing)
// ---------------------------------------------------------------------------

export const DialogueLineSchema = z.object({
  speaker: z.string().min(1),
  text: z.string().min(1),
});

export const ListenQSchema = z.object({
  q: z.string().min(1),
  opts: z.array(z.string().min(1)).min(2),
  ans: z.number().int().min(0),
});

export const DailyScenarioSchema = z.object({
  title: z.string().min(1),
  icon: z.string(),
  dialogue: z.array(DialogueLineSchema).min(1),
  keyPhrases: z.array(PhraseItemSchema).min(1),
  producePrompt: z.string().min(1),
  produceModel: z.string().min(1),
  noticingTips: z.array(z.string().min(1)).min(1),
  listenQ: ListenQSchema.optional(),
  challenge: z.string().min(1),
});

export const DailyScenariosSchema = z.array(DailyScenarioSchema).min(1);

export type DialogueLine = z.infer<typeof DialogueLineSchema>;
export type ListenQ = z.infer<typeof ListenQSchema>;
export type DailyScenario = z.infer<typeof DailyScenarioSchema>;

// ---------------------------------------------------------------------------
// Fill-in-the-Blank
// ---------------------------------------------------------------------------

export const FillBlankSchema = z.object({
  /** Complete sentence */
  full: z.string().min(1),
  /** Words to blank out */
  blanks: z.array(z.string().min(1)).min(1),
});

export const FillBlanksSchema = z.array(FillBlankSchema).min(1);

export type FillBlank = z.infer<typeof FillBlankSchema>;

// ---------------------------------------------------------------------------
// Sentence Build
// ---------------------------------------------------------------------------

export const SentenceBuildSchema = z.array(z.string().min(1)).min(1);

export type SentenceBuild = z.infer<typeof SentenceBuildSchema>;

// ---------------------------------------------------------------------------
// Recall Scenarios
// ---------------------------------------------------------------------------

export const RecallScenarioSchema = z.object({
  sit: z.string().min(1),
  hint: z.string().min(1),
  model: z.string().min(1),
  keywords: z.array(z.string().min(1)).min(1),
});

export const RecallScenariosSchema = z.array(RecallScenarioSchema).min(1);

export type RecallScenario = z.infer<typeof RecallScenarioSchema>;

// ---------------------------------------------------------------------------
// Fluency Topics
// ---------------------------------------------------------------------------

export const FluencyTopicSchema = z.object({
  topic: z.string().min(1),
  ar: z.string().min(1),
  starters: z.array(z.string().min(1)).min(1),
});

export const FluencyTopicsSchema = z.array(FluencyTopicSchema).min(1);

export type FluencyTopic = z.infer<typeof FluencyTopicSchema>;
