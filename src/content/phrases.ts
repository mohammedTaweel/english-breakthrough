import {
  PhrasesSchema,
  PhrasePatternMapSchema,
  type PhraseCategory,
  type PhrasePatternMap,
} from './schemas';

const phrasesData: PhraseCategory[] = [
  {
    cat: 'التعارف والمجاملات',
    icon: '٦',
    items: [
      { en: 'Nice to meet you. Where are you from?', ar: 'تشرفنا. من وين أنت؟' },
      { en: "I've heard great things about you.", ar: 'سمعت عنك أشياء حلوة.' },
      { en: 'How long have you been living here?', ar: 'من متى وأنت ساكن هنا؟' },
      { en: 'What do you do for a living?', ar: 'وش شغلك؟ (سؤال مهذب)' },
      { en: 'It was really nice talking to you.', ar: 'كان ممتع إني أتكلم معك.' },
    ],
  },
  {
    cat: 'السفر والمطار',
    icon: '٧',
    items: [
      { en: 'Excuse me, where is gate number seven?', ar: 'لو سمحت، وين بوابة رقم ٧؟' },
      { en: "I'd like to check in for my flight, please.", ar: 'أبي أسوي تشيك إن لرحلتي.' },
      {
        en: 'Is there a direct flight or do I have a layover?',
        ar: 'في رحلة مباشرة أو عندي توقف؟',
      },
      {
        en: 'Could you help me find my connecting flight?',
        ar: 'تقدر تساعدني ألاقي رحلتي المتصلة؟',
      },
      {
        en: "My luggage didn't arrive. Where can I report this?",
        ar: 'شنطتي ما وصلت. وين أبلّغ؟',
      },
    ],
  },
  {
    cat: 'المطاعم والطلبات',
    icon: '١',
    items: [
      { en: 'A table for two, please.', ar: 'طاولة لشخصين، لو سمحت.' },
      { en: 'What do you recommend from the menu?', ar: 'وش تنصح من القائمة؟' },
      {
        en: "I'm allergic to nuts. Does this contain any?",
        ar: 'عندي حساسية مكسرات. هل فيها؟',
      },
      { en: 'Could we have the bill, please?', ar: 'ممكن الحساب لو سمحت؟' },
      { en: 'The food was excellent. Thank you.', ar: 'الأكل كان ممتاز. شكراً لك.' },
    ],
  },
  {
    cat: 'المواعيد والاتصالات',
    icon: '١٠',
    items: [
      { en: "I'd like to make an appointment, please.", ar: 'أبي أحجز موعد لو سمحت.' },
      {
        en: 'Is it possible to reschedule to next week?',
        ar: 'ممكن أأجّل الموعد للأسبوع الجاي؟',
      },
      { en: "I'm calling to follow up on my request.", ar: 'أتصل أتابع طلبي.' },
      {
        en: 'Could you transfer me to the right department?',
        ar: 'ممكن تحوّلني للقسم المختص؟',
      },
      { en: 'Thank you for your help. Have a nice day.', ar: 'شكراً على مساعدتك. يوم سعيد.' },
    ],
  },
  {
    cat: 'إبداء الرأي والنقاش',
    icon: '٢٥',
    items: [
      {
        en: 'I see it differently. From my perspective...',
        ar: 'أشوفها بشكل مختلف. من وجهة نظري...',
      },
      { en: "That's a good point. I also think...", ar: 'نقطة ممتازة. وأنا أيضاً أشوف...' },
      {
        en: 'I agree overall, but I have one concern.',
        ar: 'بشكل عام متفق، بس عندي تحفّظ.',
      },
      { en: 'Could you explain why you think that?', ar: 'تقدر توضّح ليش تشوف كذا؟' },
      { en: 'Let me think about it and get back to you.', ar: 'خلني أفكر فيها وأرجعلك.' },
    ],
  },
  {
    cat: 'عبارات إنقاذ',
    icon: '🛟',
    items: [
      {
        en: "Sorry, I didn't catch that. Could you repeat?",
        ar: 'آسف ما فهمت. تقدر تعيد؟',
      },
      { en: 'Could you speak a bit more slowly, please?', ar: 'ممكن تتكلم أبطأ شوي؟' },
      { en: 'What does that word mean exactly?', ar: 'وش معنى هالكلمة بالضبط؟' },
      { en: 'How do you say... in English?', ar: 'كيف تقول... بالإنجليزي؟' },
      { en: 'I understand, but let me make sure...', ar: 'فاهم، بس خلني أتأكد...' },
    ],
  },
  {
    cat: 'العمل والاجتماعات',
    icon: '💼',
    items: [
      { en: 'Let me give you a quick update on this.', ar: 'خلني أعطيك تحديث سريع.' },
      { en: "I'd like to suggest a different approach.", ar: 'أبي أقترح طريقة ثانية.' },
      { en: 'Can we agree on the next steps?', ar: 'نقدر نتفق على الخطوات الجاية؟' },
      { en: "I'll take care of this and follow up.", ar: 'أنا آخذها على عاتقي وأتابع.' },
      { en: 'Let me summarize what we discussed.', ar: 'خلني ألخّص اللي ناقشناه.' },
    ],
  },
];

const patternsData: PhrasePatternMap = {
  "I'd like": {
    pattern: "I'd like...",
    usage: 'طلب مهذب — يعمل في أي مكان: مطعم، فندق، مطار، بنك',
    scenarios: ['المطعم', 'الفندق', 'المطار', 'البنك', 'الصيدلية'],
  },
  'Could you': {
    pattern: 'Could you...?',
    usage: 'طلب مهذب بصيغة سؤال — يعمل مع أي شخص',
    scenarios: ['المطعم', 'الفندق', 'خدمة العملاء', 'الاتجاهات', 'التاكسي'],
  },
  'Is there': {
    pattern: 'Is there...?',
    usage: 'سؤال عن التوفر — فنادق، مطاعم، محلات',
    scenarios: ['الفندق', 'النادي', 'السوبرماركت'],
  },
  'How long': {
    pattern: 'How long...?',
    usage: 'سؤال عن المدة — يعمل في كل مكان',
    scenarios: ['الطبيب', 'البريد', 'التحويلات', 'استئجار سيارة'],
  },
  'Thank you for': {
    pattern: 'Thank you for...',
    usage: 'شكر محدد — أقوى بكثير من thank you لوحدها',
    scenarios: ['الطبيب', 'الفندق', 'المدرسة', 'العمل'],
  },
};

export const PHRASES = PhrasesSchema.parse(phrasesData);
export const PHRASE_PATTERNS = PhrasePatternMapSchema.parse(patternsData);
