import {
  QuickResponsesSchema,
  QuizBankSchema,
  FillBlanksSchema,
  SentenceBuildSchema,
  RecallScenariosSchema,
  FluencyTopicsSchema,
  ListenItemsSchema,
  DictationItemsSchema,
  type QuickResponse,
  type QuizQuestion,
  type FillBlank,
  type RecallScenario,
  type FluencyTopic,
  type ListenItem,
} from './schemas';

// ---------------------------------------------------------------------------
// Quick Response
// ---------------------------------------------------------------------------

const quickRespData: QuickResponse[] = [
  {
    sit: 'أنت في مطعم والنادل يسألك عن طلبك',
    opts: [
      "I'll have the grilled chicken, please. And a glass of water.",
      'I want chicken and water.',
      'Give me the chicken.',
      'Whatever you recommend.',
    ],
    ans: 0,
  },
  {
    sit: 'شخص يتكلم بسرعة وما فهمت عليه',
    opts: [
      'Sorry, could you speak a bit more slowly? I want to make sure I understand.',
      'Can you repeat that?',
      "I didn't hear you.",
      'What did you say?',
    ],
    ans: 0,
  },
  {
    sit: 'تبي تسأل عن الاتجاهات في مدينة جديدة',
    opts: [
      'Excuse me, could you tell me how to get to the nearest metro station?',
      'Where is the metro?',
      'I need to go to the metro.',
      'How do I get there?',
    ],
    ans: 0,
  },
  {
    sit: 'حد يمدح شغلك وتبي ترد بتواضع',
    opts: [
      'Thank you, I really appreciate that. It was a team effort.',
      'Thanks a lot.',
      'Oh, it was nothing.',
      'Yeah, I worked hard.',
    ],
    ans: 0,
  },
  {
    sit: 'تبي ترفض دعوة بأدب',
    opts: [
      "I really appreciate the invitation, but I won't be able to make it this time.",
      "Sorry, I can't come.",
      'No thanks.',
      "I'm busy that day.",
    ],
    ans: 0,
  },
  {
    sit: 'تبي تسأل الدكتور عن الدواء',
    opts: [
      'How often should I take this, and are there any side effects I should know about?',
      'When do I take the medicine?',
      'Is this safe?',
      'What does this do?',
    ],
    ans: 0,
  },
  {
    sit: 'تبي تشتكي على منتج بأدب',
    opts: [
      "I purchased this last week and it's not working properly. Is it possible to get a replacement?",
      "This doesn't work. I want my money back.",
      'I have a problem with this.',
      'This product is broken.',
    ],
    ans: 0,
  },
  {
    sit: 'جارك الجديد يسلّم عليك وتبي تتعرف عليه',
    opts: [
      "Nice to meet you! I'm Omar. Welcome to the neighborhood. Let me know if you need anything.",
      'Hi, I live next door.',
      'Hello.',
      "I'm your neighbor.",
    ],
    ans: 0,
  },
  {
    sit: 'تبي تعبّر عن رأيك بأدب في نقاش',
    opts: [
      "I see it differently. From my perspective, I think there's another way to look at it.",
      'I disagree with that.',
      "That's not right.",
      'I have a different idea.',
    ],
    ans: 0,
  },
  {
    sit: 'شخص يسألك عن شغلك وتبي تشرح ببساطة',
    opts: [
      'I work in project management. Basically, I help teams deliver their work on time.',
      "I'm a manager.",
      'I work at a company.',
      'I do project stuff.',
    ],
    ans: 0,
  },
];

// ---------------------------------------------------------------------------
// Quiz Bank
// ---------------------------------------------------------------------------

const quizBankData: QuizQuestion[] = [
  {
    q: 'وصلت الفندق وتبي تأكد حجزك — وش أفضل جملة؟',
    opts: [
      'I have a reservation under the name Al-Rashid.',
      'I booked a room. Check please.',
      'I want my room now.',
      'There should be a booking.',
    ],
    ans: 0,
  },
  {
    q: 'ما فهمت كلام شخص يتكلم بسرعة — كيف تطلب يبطّئ بأدب؟',
    opts: [
      'Could you speak a bit more slowly, please?',
      'Talk slower.',
      "I can't understand you.",
      "You're speaking too fast.",
    ],
    ans: 0,
  },
  {
    q: 'تبي ترفض عرض بأدب بدون ما تزعل الشخص',
    opts: [
      "I really appreciate the offer, but I'll have to pass this time.",
      'No thanks.',
      "I don't want it.",
      'Maybe later.',
    ],
    ans: 0,
  },
  {
    q: 'الدكتور يسألك عن أعراضك — كيف تشرح بدقة؟',
    opts: [
      "I've been having a persistent headache for three days, along with some fatigue.",
      'My head hurts.',
      'I feel bad.',
      'I have pain.',
    ],
    ans: 0,
  },
  {
    q: 'في المطعم، النادل يسأل عن طلبك — وش الأنسب؟',
    opts: [
      "I'll have the grilled salmon, please. And could I get a glass of water?",
      'Give me salmon and water.',
      'Salmon.',
      'I want to eat fish.',
    ],
    ans: 0,
  },
  {
    q: 'تبي تعبّر عن رأي مختلف بأدب في نقاش',
    opts: [
      'I see it differently. From my perspective...',
      "That's wrong.",
      "I don't agree at all.",
      'No, I think the opposite.',
    ],
    ans: 0,
  },
  {
    q: 'شخص يمدحك — كيف ترد بتواضع واحترافية؟',
    opts: [
      'Thank you, I really appreciate that. It was a team effort.',
      'Yeah, I know.',
      'Thanks.',
      'It was nothing really.',
    ],
    ans: 0,
  },
  {
    q: 'تبي تسأل عن الاتجاهات بأدب في مدينة جديدة',
    opts: [
      'Excuse me, could you tell me how to get to the nearest metro station?',
      'Where is the metro?',
      'Metro?',
      'I need to go somewhere.',
    ],
    ans: 0,
  },
  {
    q: 'تبي تشتكي على منتج معيب بشكل محترف',
    opts: [
      "I purchased this last week and it's not working properly. Is it possible to get a replacement?",
      'This is broken. Fix it.',
      'I want my money back now.',
      "This doesn't work at all.",
    ],
    ans: 0,
  },
  {
    q: 'جارك الجديد يسلّم عليك — كيف تكسر الجليد؟',
    opts: [
      "Nice to meet you! I'm Omar. Welcome to the neighborhood.",
      'Hi.',
      "You're new here?",
      'Hello, I live here.',
    ],
    ans: 0,
  },
];

// ---------------------------------------------------------------------------
// Fill in the Blanks
// ---------------------------------------------------------------------------

const fillBlanksData: FillBlank[] = [
  { full: 'Excuse me, could you tell me how to get there?', blanks: ['Excuse', 'tell'] },
  { full: "I'd like to make an appointment, please.", blanks: ['appointment', 'please'] },
  { full: 'Could you speak a bit more slowly?', blanks: ['speak', 'slowly'] },
  { full: 'Nice to meet you. Where are you from?', blanks: ['Nice', 'from'] },
  {
    full: "Sorry, I didn't catch that. Could you repeat?",
    blanks: ['catch', 'repeat'],
  },
  { full: 'I really appreciate your help with this.', blanks: ['appreciate', 'help'] },
  {
    full: 'Is it possible to reschedule to next week?',
    blanks: ['possible', 'reschedule'],
  },
  { full: 'What do you recommend from the menu?', blanks: ['recommend', 'menu'] },
  {
    full: "I've been having this problem for three days.",
    blanks: ['having', 'problem'],
  },
  { full: "That sounds great. I'll take it.", blanks: ['sounds', 'take'] },
  {
    full: 'How often should I take this medication?',
    blanks: ['often', 'medication'],
  },
  { full: 'Thank you for your patience with this.', blanks: ['patience', 'this'] },
  {
    full: 'I see it differently. From my perspective...',
    blanks: ['differently', 'perspective'],
  },
  { full: 'Would it be possible to get a refund?', blanks: ['possible', 'refund'] },
  {
    full: "I'll review the details and get back to you.",
    blanks: ['review', 'details'],
  },
];

// ---------------------------------------------------------------------------
// Sentence Build
// ---------------------------------------------------------------------------

const sentenceBuildData: string[] = [
  'Nice to meet you. Where are you from?',
  'Could you speak more slowly please?',
  'I would like a table for two.',
  'How do I get to the nearest station?',
  'I have a reservation under my name.',
  'Is it possible to get a refund?',
  'Thank you for your help with this.',
  'I really appreciate your patience.',
  'What time does the store close today?',
  'I need to reschedule my appointment.',
  'The food was excellent. Thank you.',
  'Could you recommend something from the menu?',
  'I see it differently from my perspective.',
  'I have been living here for five years.',
  'Let me think about it and get back.',
];

// ---------------------------------------------------------------------------
// Recall Scenarios
// ---------------------------------------------------------------------------

const recallScenariosData: RecallScenario[] = [
  {
    sit: 'وصلت فندق وتبي تسوي check-in',
    hint: 'أكّد حجزك وسأل عن الخدمات',
    model: 'I have a reservation under the name Al-Rashid. Is breakfast included?',
    keywords: ['reservation', 'name', 'breakfast'],
  },
  {
    sit: 'في المطعم والنادل يسألك عن طلبك',
    hint: 'اطلب بوضوح وسأل عن التوصيات',
    model:
      "I'll have the grilled chicken, please. What do you recommend for dessert?",
    keywords: ['have', 'please', 'recommend'],
  },
  {
    sit: 'تحس بصداع من ٣ أيام وأنت عند الدكتور',
    hint: 'اشرح أعراضك بالتفصيل',
    model:
      "I've been having a persistent headache for three days, along with some fatigue.",
    keywords: ['headache', 'days', 'fatigue'],
  },
  {
    sit: 'شخص يتكلم بسرعة وما فهمت عليه',
    hint: 'اطلب منه يبطّئ بأدب',
    model:
      'Sorry, could you speak a bit more slowly? I want to make sure I understand.',
    keywords: ['speak', 'slowly', 'understand'],
  },
  {
    sit: 'اشتريت منتج وطلع معيب وتبي تشتكي',
    hint: 'اشرح المشكلة واطلب حل',
    model:
      "I purchased this last week and it's not working properly. Is it possible to get a replacement?",
    keywords: ['purchased', 'working', 'replacement'],
  },
  {
    sit: 'معلم ولدك يسألك تساعده في القراءة بالبيت',
    hint: 'وافق واسأل عن التفاصيل',
    model:
      'That makes sense. What if we start with fifteen minutes of reading together every evening?',
    keywords: ['start', 'minutes', 'reading'],
  },
  {
    sit: 'جارك الجديد يسلّم عليك وتبي تتعرف عليه',
    hint: 'عرّف نفسك ورحّب فيه',
    model:
      "Nice to meet you! I'm Omar. Welcome to the neighborhood. Let me know if you need anything.",
    keywords: ['nice', 'meet', 'welcome'],
  },
  {
    sit: 'تبي تعبّر عن رأيك المختلف بأدب في نقاش',
    hint: 'اعترض بدبلوماسية',
    model:
      "I see it differently. From my perspective, I think there's another way to look at it.",
    keywords: ['differently', 'perspective', 'another'],
  },
];

// ---------------------------------------------------------------------------
// Fluency Topics
// ---------------------------------------------------------------------------

const fluencyTopicsData: FluencyTopic[] = [
  {
    topic: 'Describe your typical day from morning to night',
    ar: 'اوصف يومك العادي من الصبح لليل',
    starters: [
      'I usually wake up at...',
      'The first thing I do is...',
      'For lunch, I...',
      'In the evening, I...',
    ],
  },
  {
    topic: 'Talk about your favorite trip or vacation',
    ar: 'تكلم عن أحلى رحلة سويتها',
    starters: [
      'One of my best trips was to...',
      'I went there because...',
      'The best part was...',
      'I would go back because...',
    ],
  },
  {
    topic: 'Describe your home and your neighborhood',
    ar: 'وصف بيتك وحيّك',
    starters: [
      'I live in a... in...',
      'My home has...',
      'The neighborhood is...',
      'What I like most about it is...',
    ],
  },
  {
    topic: 'Talk about your family',
    ar: 'تكلم عن عائلتك',
    starters: [
      'I have... in my family.',
      'My oldest... is...',
      'We usually spend time together by...',
      'The best thing about my family is...',
    ],
  },
  {
    topic: 'Describe a skill you are learning or want to learn',
    ar: 'مهارة تتعلمها أو تبي تتعلمها',
    starters: [
      "I've been trying to learn...",
      'I started because...',
      'The hardest part is...',
      'I practice by...',
    ],
  },
  {
    topic: 'Talk about something that made you happy recently',
    ar: 'شيء فرّحك مؤخراً',
    starters: [
      'Recently, something great happened...',
      'It made me happy because...',
      'I remember feeling...',
      'It reminded me that...',
    ],
  },
  {
    topic: 'Describe your dream job or project',
    ar: 'وظيفة أو مشروع أحلامك',
    starters: [
      'If I could do anything, I would...',
      'The reason is...',
      'I think I would be good at it because...',
      'The first step would be...',
    ],
  },
  {
    topic: 'Talk about your favorite food and how to make it',
    ar: 'أكلتك المفضلة وكيف تنسوي',
    starters: [
      'My favorite dish is...',
      'You need... to make it.',
      'First, you...',
      'The secret is...',
    ],
  },
  {
    topic: 'Describe a person you admire and why',
    ar: 'شخص تحترمه وليش',
    starters: [
      'Someone I really admire is...',
      'I admire them because...',
      'One thing they taught me is...',
      'They inspire me to...',
    ],
  },
  {
    topic: 'Talk about how technology changed your life',
    ar: 'كيف التقنية غيّرت حياتك',
    starters: [
      'Technology has changed my life by...',
      'I use my phone to...',
      'Before, I used to..., but now...',
      'The most useful app for me is...',
    ],
  },
];

// ---------------------------------------------------------------------------
// Listen Items
// ---------------------------------------------------------------------------

const listenItemsData: ListenItem[] = [
  {
    text: 'Excuse me, where is the nearest pharmacy?',
    q: 'ماذا يسأل المتحدث؟',
    opts: [
      'يسأل عن أقرب صيدلية',
      'يسأل عن أقرب مطعم',
      'يسأل عن الوقت',
      'يسأل عن الطريق للفندق',
    ],
    ans: 0,
  },
  {
    text: "I'd like to make an appointment for next Tuesday, please.",
    q: 'ماذا يريد المتحدث؟',
    opts: [
      'يبي يحجز موعد يوم الثلاثاء',
      'يبي يلغي موعد',
      'يبي يغيّر موعده ليوم الأحد',
      'يبي يسأل عن المواعيد المتاحة',
    ],
    ans: 0,
  },
  {
    text: 'The flight has been delayed by approximately two hours.',
    q: 'ما هو الخبر؟',
    opts: ['الرحلة تأخرت ساعتين', 'الرحلة ألغيت', 'الرحلة تقدمت ساعتين', 'البوابة تغيّرت'],
    ans: 0,
  },
  {
    text: 'Could you speak a bit more slowly? I want to make sure I understand.',
    q: 'ماذا يطلب المتحدث؟',
    opts: [
      'يطلب إن الشخص يتكلم أبطأ',
      'يطلب إن الشخص يتكلم أعلى',
      'يطلب إن الشخص يتوقف عن الكلام',
      'يطلب إن الشخص يكرر كل شيء',
    ],
    ans: 0,
  },
  {
    text: 'I purchased this item last week and unfortunately it stopped working after two days.',
    q: 'ما هي المشكلة؟',
    opts: [
      'اشترى شيء وخرب بعد يومين',
      'اشترى شيء غالي جداً',
      'نسي يشتري شيء',
      'المنتج ما وصل أصلاً',
    ],
    ans: 0,
  },
  {
    text: "We've been living in this neighborhood for about three years now, and we really enjoy it.",
    q: 'ماذا يقول المتحدث عن الحي؟',
    opts: [
      'ساكن فيه ٣ سنوات ومبسوط',
      'ساكن فيه ٣ أشهر',
      'يبي ينتقل من الحي',
      'ما يحب الحي',
    ],
    ans: 0,
  },
  {
    text: "I'm allergic to peanuts, so could you please check if this dish contains any nuts?",
    q: 'ماذا يخبر الشخص النادل؟',
    opts: [
      'عنده حساسية مكسرات ويبي يتأكد من الأكل',
      'ما يحب طعم المكسرات',
      'يبي يضيف مكسرات',
      'يسأل عن أسعار الأطباق',
    ],
    ans: 0,
  },
  {
    text: 'The doctor recommended that I get some rest and drink plenty of water.',
    q: 'ماذا نصح الطبيب؟',
    opts: ['راحة وشرب ماء كثير', 'أخذ دواء قوي', 'عملية جراحية', 'تحاليل دم فورية'],
    ans: 0,
  },
  {
    text: "Thank you for your time today. I'll send you a follow-up email with all the details.",
    q: 'ماذا سيفعل المتحدث؟',
    opts: [
      'يرسل إيميل متابعة بالتفاصيل',
      'يتصل بكرة',
      'يحدد موعد ثاني',
      'يلغي الاتفاق',
    ],
    ans: 0,
  },
  {
    text: 'I see it differently. From my perspective, I think we should consider the long-term impact.',
    q: 'ما موقف المتحدث؟',
    opts: [
      'عنده رأي مختلف ويبي يفكرون بالمدى البعيد',
      'يوافق تماماً',
      'ما عنده رأي',
      'يبي ينهي النقاش',
    ],
    ans: 0,
  },
];

// ---------------------------------------------------------------------------
// Dictation Items
// ---------------------------------------------------------------------------

const dictationItemsData: string[] = [
  'I would like a table for two, please.',
  'Could you speak more slowly?',
  'I have a reservation under my name.',
  'The flight has been delayed by two hours.',
  'Thank you for your help. Have a nice day.',
  'I need to reschedule my appointment.',
  'Nice to meet you. Where are you from?',
  'I see it differently from my perspective.',
  'Is it possible to get a refund?',
  'How long have you been living here?',
  'I appreciate your patience with this.',
  'What do you recommend from the menu?',
];

// ---------------------------------------------------------------------------
// Validated exports
// ---------------------------------------------------------------------------

export const QUICK_RESP = QuickResponsesSchema.parse(quickRespData);
export const QUIZ_BANK = QuizBankSchema.parse(quizBankData);
export const FILL_BLANKS = FillBlanksSchema.parse(fillBlanksData);
export const SENTENCE_BUILD = SentenceBuildSchema.parse(sentenceBuildData);
export const RECALL_SCENARIOS = RecallScenariosSchema.parse(recallScenariosData);
export const FLUENCY_TOPICS = FluencyTopicsSchema.parse(fluencyTopicsData);
export const LISTEN_ITEMS = ListenItemsSchema.parse(listenItemsData);
export const DICTATION_ITEMS = DictationItemsSchema.parse(dictationItemsData);
