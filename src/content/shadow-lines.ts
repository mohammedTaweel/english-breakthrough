import { ShadowLinesSchema, type ShadowLines } from './schemas';

const data: ShadowLines = [
  [
    'Good morning. How are you today?',
    'I would like a cup of coffee, please.',
    'Excuse me, where is the nearest pharmacy?',
    'Thank you very much for your help.',
    'Can I have the bill, please?',
    'I need to make an appointment.',
    'Could you speak more slowly, please?',
    "I'm sorry, I didn't understand that.",
    'What time does the store close?',
    'Have a nice day!',
  ],
  [
    "I've been living here for about five years.",
    'Could you recommend a good restaurant nearby?',
    'I need to reschedule my appointment to next week.',
    'The weather has been really nice lately.',
    "I'm looking for something in a medium size.",
    'Let me check my calendar and get back to you.',
    'I appreciate your patience with this.',
    'Would it be possible to get a refund?',
    "I'll send you the details by email.",
    "That's exactly what I was looking for.",
  ],
  [
    "I've been meaning to bring this up for a while now.",
    "Based on what you're saying, I think we should consider another option.",
    "I completely understand your concern, and here's what I suggest.",
    'Would it be possible to explore a different approach to this?',
    "Let me walk you through the details so we're on the same page.",
    "I want to make sure we're aligned before we move forward.",
    'From my experience, this tends to work better in the long run.',
    "I'd appreciate it if you could look into this for me.",
    "Let me summarize what we've discussed so far.",
    'I believe this is the best path forward given the circumstances.',
  ],
];

export const SHADOW_LINES = ShadowLinesSchema.parse(data);
