import { describe, expect, it } from 'vitest';
import { SHADOW_LINES } from './shadow-lines';
import { STORIES } from './stories';
import { PROMPTS } from './prompts';
import { PHRASES, PHRASE_PATTERNS } from './phrases';
import { MOTIV } from './motivation';
import { CONVERSATIONS } from './conversations';
import {
  QUICK_RESP,
  QUIZ_BANK,
  FILL_BLANKS,
  SENTENCE_BUILD,
  RECALL_SCENARIOS,
  FLUENCY_TOPICS,
  LISTEN_ITEMS,
  DICTATION_ITEMS,
} from './exercises';
import { DAILY_SCENARIOS } from './daily-scenarios';
import { CEFR_LEVELS, LEVEL_TEST, LEVEL_IDX, TYPE_LABELS, TYPE_ICONS } from './level-test';
import {
  StorySchema,
  PromptSchema,
  QuickResponseSchema,
  DailyScenarioSchema,
} from './schemas';

describe('Content validation', () => {
  it('SHADOW_LINES has 3 levels with 10 sentences each', () => {
    expect(SHADOW_LINES).toHaveLength(3);
    SHADOW_LINES.forEach((level) => {
      expect(level.length).toBeGreaterThanOrEqual(10);
      level.forEach((s) => expect(typeof s).toBe('string'));
    });
  });

  it('STORIES has 8+ stories with 10 lines each', () => {
    expect(STORIES.length).toBeGreaterThanOrEqual(8);
    STORIES.forEach((story) => {
      expect(story.t.length).toBeGreaterThan(0);
      expect(story.lines.length).toBeGreaterThanOrEqual(10);
    });
  });

  it('PROMPTS has 12+ topics with 5 starters each', () => {
    expect(PROMPTS.length).toBeGreaterThanOrEqual(12);
    PROMPTS.forEach((p) => {
      expect(p.starters.length).toBeGreaterThanOrEqual(4);
    });
  });

  it('PHRASES has 7 categories with 5 items each', () => {
    expect(PHRASES.length).toBeGreaterThanOrEqual(7);
    PHRASES.forEach((cat) => {
      expect(cat.items.length).toBeGreaterThanOrEqual(5);
      cat.items.forEach((item) => {
        expect(item.en.length).toBeGreaterThan(0);
        expect(item.ar.length).toBeGreaterThan(0);
      });
    });
  });

  it('PHRASE_PATTERNS has 5 patterns', () => {
    expect(Object.keys(PHRASE_PATTERNS).length).toBeGreaterThanOrEqual(5);
  });

  it('MOTIV has 8+ messages', () => {
    expect(MOTIV.length).toBeGreaterThanOrEqual(8);
  });

  it('CONVERSATIONS has 5 scenarios with 5 steps each', () => {
    expect(CONVERSATIONS.length).toBeGreaterThanOrEqual(5);
    CONVERSATIONS.forEach((c) => {
      expect(c.steps.length).toBeGreaterThanOrEqual(5);
    });
  });

  it('QUICK_RESP has 10 situations', () => {
    expect(QUICK_RESP.length).toBeGreaterThanOrEqual(10);
  });

  it('QUIZ_BANK has 10+ questions', () => {
    expect(QUIZ_BANK.length).toBeGreaterThanOrEqual(10);
  });

  it('DAILY_SCENARIOS has 14+ scenarios with valid structure', () => {
    expect(DAILY_SCENARIOS.length).toBeGreaterThanOrEqual(14);
    DAILY_SCENARIOS.forEach((s) => {
      expect(s.dialogue.length).toBeGreaterThanOrEqual(5);
      expect(s.keyPhrases.length).toBeGreaterThanOrEqual(2);
      expect(s.noticingTips.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('CEFR_LEVELS has 6 levels (A1-C2)', () => {
    expect(CEFR_LEVELS).toHaveLength(6);
    const codes = CEFR_LEVELS.map((l) => l.code);
    expect(codes).toEqual(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
  });

  it('LEVEL_TEST has 50+ questions across all levels', () => {
    expect(LEVEL_TEST.length).toBeGreaterThanOrEqual(50);
    const levels = new Set(LEVEL_TEST.map((q) => q.level));
    expect(levels.size).toBeGreaterThanOrEqual(6);
  });

  it('LEVEL_IDX maps all 6 codes', () => {
    expect(Object.keys(LEVEL_IDX)).toHaveLength(6);
  });

  it('TYPE_LABELS and TYPE_ICONS cover all types', () => {
    const types = new Set(LEVEL_TEST.map((q) => q.type));
    types.forEach((t) => {
      expect(TYPE_LABELS[t]).toBeDefined();
      expect(TYPE_ICONS[t]).toBeDefined();
    });
  });

  it('FILL_BLANKS has 15 items', () => {
    expect(FILL_BLANKS.length).toBeGreaterThanOrEqual(15);
  });

  it('SENTENCE_BUILD has 15 sentences', () => {
    expect(SENTENCE_BUILD.length).toBeGreaterThanOrEqual(15);
  });

  it('RECALL_SCENARIOS has 8 scenarios', () => {
    expect(RECALL_SCENARIOS.length).toBeGreaterThanOrEqual(8);
  });

  it('FLUENCY_TOPICS has 10 topics', () => {
    expect(FLUENCY_TOPICS.length).toBeGreaterThanOrEqual(10);
  });

  it('LISTEN_ITEMS has 10 items', () => {
    expect(LISTEN_ITEMS.length).toBeGreaterThanOrEqual(10);
  });

  it('DICTATION_ITEMS has 12 sentences', () => {
    expect(DICTATION_ITEMS.length).toBeGreaterThanOrEqual(12);
  });
});

describe('Schema rejection', () => {
  it('StorySchema rejects missing title', () => {
    expect(() => StorySchema.parse({ lines: ['a'] })).toThrow();
  });

  it('PromptSchema rejects empty starters', () => {
    expect(() => PromptSchema.parse({ en: 'x', ar: 'y', starters: [] })).toThrow();
  });

  it('QuickResponseSchema rejects negative ans', () => {
    expect(() => QuickResponseSchema.parse({ sit: 'x', opts: ['a', 'b'], ans: -1 })).toThrow();
  });

  it('DailyScenarioSchema rejects missing keyPhrases', () => {
    expect(() =>
      DailyScenarioSchema.parse({
        title: 'x',
        icon: 'y',
        dialogue: [{ speaker: 'a', text: 'b' }],
        keyPhrases: [],
        producePrompt: 'p',
        produceModel: 'm',
        noticingTips: ['t'],
        listenQ: { q: 'q', opts: ['a', 'b'], ans: 0 },
        challenge: 'c',
      }),
    ).toThrow();
  });
});
