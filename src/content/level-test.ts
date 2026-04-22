import {
  CEFRLevelsSchema,
  LevelTestSchema,
  LevelIdxSchema,
  TypeLabelsSchema,
  TypeIconsSchema,
  type CEFRLevel,
  type LevelTestQuestion,
  type LevelIdx,
  type TypeLabels,
  type TypeIcons,
} from './schemas';

const cefrData: CEFRLevel[] = [
  { code: "A1", name: "مبتدئ", nameEn: "Beginner", color: "var(--c-error)", desc: "تعرف كلمات وجمل بسيطة جداً. تقدر تعرّف نفسك وتسأل أسئلة أساسية.", tip: "ركّز على حفظ الجمل الأساسية والمفردات اليومية. ابدأ بتمارين الظل مع الجمل القصيرة." },
  { code: "A2", name: "ما قبل المتوسط", nameEn: "Elementary", color: "var(--c-warn)", desc: "تفهم جمل متكررة في مواضيع يومية. تقدر تتواصل في مواقف بسيطة ومباشرة.", tip: "وسّع مفرداتك وركّز على تركيب جمل بسيطة. استخدم تمرين 'تفكير بصوت عالٍ' يومياً." },
  { code: "B1", name: "متوسط", nameEn: "Intermediate", color: "var(--c-accent)", desc: "تفهم النقاط الرئيسية في محادثات واضحة. تقدر تتعامل مع أغلب المواقف اليومية.", tip: "ابدأ بالمحادثات التفاعلية وركّز على ربط الأفكار. تمرّن على الجمل الجاهزة لمواقف الحياة." },
  { code: "B2", name: "فوق المتوسط", nameEn: "Upper-Intermediate", color: "var(--c-accent)", desc: "تفهم أفكار معقدة وتقدر تتفاعل بطلاقة مع متحدثين أصليين بدون جهد كبير.", tip: "ركّز على الدقة في التعبير والمصطلحات المتخصصة. تمرّن على العروض التقديمية والتفاوض." },
  { code: "C1", name: "متقدم", nameEn: "Advanced", color: "var(--c-accent)", desc: "تفهم نصوص طويلة ومعقدة وتقدر تعبّر عن نفسك بطلاقة وعفوية في أي موقف مهني.", tip: "ركّز على الفروق الدقيقة في اللغة والتعابير الاصطلاحية. تمرّن على المحادثات المتقدمة." },
  { code: "C2", name: "إتقان", nameEn: "Mastery", color: "var(--c-success)", desc: "تفهم كل شيء تقريباً وتقدر تعبّر بدقة عالية حتى في المواقف الأكثر تعقيداً.", tip: "حافظ على مستواك بالممارسة المستمرة. ركّز على الأسلوب والبلاغة في التواصل المهني." },
];

const levelTestData: LevelTestQuestion[] = [
  // ===== A1 - GRAMMAR =====
  { level: 0, type: "grammar", q: "She ___ a teacher.", opts: ["is", "are", "am", "be"], ans: 0 },
  { level: 0, type: "grammar", q: "I ___ from Saudi Arabia.", opts: ["am", "is", "are", "be"], ans: 0 },
  { level: 0, type: "grammar", q: "___ you like coffee?", opts: ["Do", "Does", "Is", "Are"], ans: 0 },
  { level: 0, type: "grammar", q: "There ___ three books on the table.", opts: ["are", "is", "has", "have"], ans: 0 },
  { level: 0, type: "vocab", q: "The opposite of 'hot' is ___.", opts: ["cold", "warm", "cool", "big"], ans: 0 },
  { level: 0, type: "vocab", q: "You eat breakfast in the ___.", opts: ["morning", "night", "evening", "afternoon"], ans: 0 },

  // ===== A2 - GRAMMAR & VOCAB =====
  { level: 1, type: "grammar", q: "She ___ to work every day.", opts: ["goes", "go", "going", "gone"], ans: 0 },
  { level: 1, type: "grammar", q: "I ___ my homework last night.", opts: ["did", "do", "done", "does"], ans: 0 },
  { level: 1, type: "grammar", q: "He is ___ than his brother.", opts: ["taller", "more tall", "tallest", "most tall"], ans: 0 },
  { level: 1, type: "vocab", q: "To 'postpone' a meeting means to ___.", opts: ["delay it", "cancel it", "start it", "end it"], ans: 0 },
  { level: 1, type: "vocab", q: "A 'colleague' is someone who ___.", opts: ["works with you", "lives near you", "teaches you", "manages you"], ans: 0 },
  { level: 1, type: "pragmatics", q: "Someone says 'How are you?' — What is the best response?", opts: ["I'm fine, thank you. And you?", "Yes.", "What?", "My name is Ahmed."], ans: 0 },

  // ===== B1 - GRAMMAR, VOCAB, READING =====
  { level: 2, type: "grammar", q: "If it rains tomorrow, I ___ stay home.", opts: ["will", "would", "am", "had"], ans: 0 },
  { level: 2, type: "grammar", q: "The report ___ by the team yesterday.", opts: ["was completed", "completed", "is completed", "has completed"], ans: 0 },
  { level: 2, type: "grammar", q: "She has been working here ___ five years.", opts: ["for", "since", "from", "during"], ans: 0 },
  { level: 2, type: "grammar", q: "I wish I ___ more time to finish the project.", opts: ["had", "have", "has", "having"], ans: 0 },
  { level: 2, type: "vocab", q: "'We need to streamline the process' means we need to ___.", opts: ["make it more efficient", "stop it", "restart it", "complicate it"], ans: 0 },
  { level: 2, type: "vocab", q: "A 'deadline' is ___.", opts: ["the last date to finish something", "a type of meeting", "a company policy", "a work schedule"], ans: 0 },
  { level: 2, type: "reading", q: "Read: 'The meeting was rescheduled due to unforeseen circumstances. All attendees will be notified of the new date.' — Why was the meeting moved?", opts: ["Unexpected events happened", "No one wanted to attend", "The room was too small", "It was a holiday"], ans: 0 },
  { level: 2, type: "pragmatics", q: "Your manager asks for your opinion in a meeting. What do you say?", opts: ["From my perspective, I think we should consider...", "I don't know.", "Whatever you decide.", "Ask someone else."], ans: 0 },

  // ===== B2 - GRAMMAR, VOCAB, READING, PRAGMATICS =====
  { level: 3, type: "grammar", q: "Had I known about the issue earlier, I ___ it differently.", opts: ["would have handled", "will handle", "handle", "am handling"], ans: 0 },
  { level: 3, type: "grammar", q: "The project, ___ was started last year, is almost complete.", opts: ["which", "what", "who", "where"], ans: 0 },
  { level: 3, type: "grammar", q: "Not only ___ the presentation well, but he also answered every question.", opts: ["did he deliver", "he delivered", "he did deliver", "delivered he"], ans: 0 },
  { level: 3, type: "grammar", q: "By the time the client arrives, we ___ the proposal.", opts: ["will have finished", "finished", "are finishing", "finish"], ans: 0 },
  { level: 3, type: "vocab", q: "'The CEO alluded to potential layoffs during the earnings call.' — 'Alluded to' means ___.", opts: ["indirectly mentioned", "directly announced", "denied", "celebrated"], ans: 0 },
  { level: 3, type: "vocab", q: "'We need to mitigate the risks associated with this investment.' — 'Mitigate' means ___.", opts: ["reduce or lessen", "increase", "ignore", "calculate"], ans: 0 },
  { level: 3, type: "reading", q: "Read: 'While the quarterly results exceeded expectations, the board remains cautious about Q4 projections given the volatile market conditions and rising inflation rates.' — What is the board's attitude?", opts: ["Careful despite good results", "Very optimistic", "Completely negative", "Indifferent"], ans: 0 },
  { level: 3, type: "reading", q: "Read: 'The merger, though initially met with skepticism from stakeholders, has proven to be a strategic masterstroke that significantly enhanced market share.' — The merger was ___.", opts: ["Doubted at first but successful", "Always popular", "A complete failure", "Never completed"], ans: 0 },
  { level: 3, type: "pragmatics", q: "A colleague presents an idea you disagree with. What is the most professional response?", opts: ["I see your point, but have we considered the potential risks?", "That's completely wrong.", "Sure, whatever.", "I disagree. Next topic."], ans: 0 },
  { level: 3, type: "pragmatics", q: "You need to deliver bad news to your team about a delayed project. How do you start?", opts: ["I want to be transparent with you about a challenge we're facing.", "This is all your fault.", "Bad news, everyone.", "I don't want to talk about it."], ans: 0 },

  // ===== C1 - GRAMMAR, VOCAB, READING, PRAGMATICS =====
  { level: 4, type: "grammar", q: "Seldom ___ such a comprehensive analysis of market trends.", opts: ["have I seen", "I have seen", "I saw", "did I saw"], ans: 0 },
  { level: 4, type: "grammar", q: "___ the circumstances, I believe we should proceed with caution.", opts: ["Given", "Giving", "Gave", "Being given"], ans: 0 },
  { level: 4, type: "grammar", q: "The report is believed ___ several inaccuracies.", opts: ["to contain", "containing", "to containing", "that contains"], ans: 0 },
  { level: 4, type: "grammar", q: "Were the board ___ the full extent of the losses, they would have acted sooner.", opts: ["to realize", "realizing", "realized", "realizes"], ans: 0 },
  { level: 4, type: "vocab", q: "'The new policy has far-reaching ramifications for the industry.' — 'Ramifications' means ___.", opts: ["complex consequences", "simple benefits", "minor changes", "no effects"], ans: 0 },
  { level: 4, type: "vocab", q: "'Her cogent argument persuaded the entire board.' — 'Cogent' means ___.", opts: ["clear and convincing", "long and boring", "emotional and dramatic", "confusing"], ans: 0 },
  { level: 4, type: "vocab", q: "'The company's fiscal prudence during the downturn proved prescient.' — 'Prescient' means ___.", opts: ["showing foresight about the future", "showing ignorance", "being wasteful", "being careless"], ans: 0 },
  { level: 4, type: "reading", q: "Read: 'The ostensible rationale for the restructuring was cost reduction; however, insiders suggest it was primarily aimed at consolidating the CEO's authority over previously autonomous divisions.' — The real reason for restructuring was likely ___.", opts: ["To give the CEO more control", "To save money", "To hire more people", "To expand divisions"], ans: 0 },
  { level: 4, type: "reading", q: "Read: 'Notwithstanding the apparent consensus, several board members harbored reservations that, while unexpressed publicly, influenced subsequent voting patterns.' — What happened?", opts: ["Some members secretly disagreed despite appearing to agree", "Everyone fully agreed", "The vote was cancelled", "Members expressed their concerns openly"], ans: 0 },
  { level: 4, type: "pragmatics", q: "You need to push back on an unrealistic deadline from a senior executive. What do you say?", opts: ["I appreciate the urgency. To ensure quality, could we explore a phased delivery approach?", "That's impossible and you know it.", "Fine, but don't blame me if it fails.", "I'll try my best."], ans: 0 },

  // ===== C2 - GRAMMAR, VOCAB, READING, PRAGMATICS =====
  { level: 5, type: "grammar", q: "Little ___ that the decision would have such profound implications.", opts: ["did they realize", "they realized", "they did realize", "realized they"], ans: 0 },
  { level: 5, type: "grammar", q: "So pervasive ___ that virtually no sector of the economy remained unaffected.", opts: ["was the impact", "the impact was", "the impact", "were the impact"], ans: 0 },
  { level: 5, type: "grammar", q: "___ it not for the intervention of the regulatory body, the merger would have proceeded unchallenged.", opts: ["Were", "Was", "Had", "If"], ans: 0 },
  { level: 5, type: "vocab", q: "'The interlocutor's obfuscation of the salient points rendered the negotiation futile.' — This sentence means the speaker ___.", opts: ["deliberately made key points unclear, making talks useless", "clearly explained everything", "successfully negotiated", "ended the meeting early"], ans: 0 },
  { level: 5, type: "vocab", q: "'Her perspicacious analysis of the geopolitical landscape proved invaluable.' — 'Perspicacious' means ___.", opts: ["showing keen mental perception and understanding", "superficial and brief", "emotional and biased", "lengthy and detailed"], ans: 0 },
  { level: 5, type: "reading", q: "Read: 'The paradox inherent in the company's strategy—pursuing aggressive expansion while simultaneously advocating for fiscal austerity—was not lost on analysts, who questioned whether such cognitive dissonance could yield sustainable growth.' — The analysts think the strategy is ___.", opts: ["Contradictory and potentially unsustainable", "Brilliant and innovative", "Simple and clear", "Risky but likely to succeed"], ans: 0 },
  { level: 5, type: "reading", q: "Read: 'The CEO's resignation, ostensibly precipitated by health concerns, coincided suspiciously with the emergence of an accounting scandal, leading commentators to infer a causal nexus between the two events.' — Commentators believe ___.", opts: ["The resignation was actually caused by the scandal, not health", "Health was the real reason", "There was no scandal", "The CEO was forced out by the board"], ans: 0 },
  { level: 5, type: "pragmatics", q: "You discover a critical flaw in a strategy that your CEO personally championed in front of the board. How do you address it?", opts: ["I've been reviewing the implementation details and identified an area where we might want to stress-test our assumptions before proceeding further.", "Your strategy is flawed.", "I think there's a problem but it's probably fine.", "I'll just fix it quietly and not say anything."], ans: 0 },

  // ===== LISTENING QUESTIONS (FIX 2) — audio-based, one per level =====
  { level: 0, type: "listening", q: "♪ Listen: 'I would like a cup of coffee, please.' — What does the speaker want?", audio: "I would like a cup of coffee, please.", opts: ["A cup of coffee", "A cup of tea", "A glass of water", "A sandwich"], ans: 0 },
  { level: 1, type: "listening", q: "♪ Listen: 'The store closes at nine o'clock on weekdays.' — When does the store close?", audio: "The store closes at nine o'clock on weekdays.", opts: ["9 PM on weekdays", "9 AM on weekdays", "10 PM every day", "8 PM on weekends"], ans: 0 },
  { level: 2, type: "listening", q: "♪ Listen: 'I've been waiting for over thirty minutes and my order still hasn't arrived.' — What is the problem?", audio: "I've been waiting for over thirty minutes and my order still hasn't arrived.", opts: ["The order is very late", "The food is cold", "The wrong order arrived", "The restaurant is closed"], ans: 0 },
  { level: 3, type: "listening", q: "♪ Listen: 'While the proposal has merit, I believe we should consider the long-term implications before committing resources.' — What is the speaker's position?", audio: "While the proposal has merit, I believe we should consider the long-term implications before committing resources.", opts: ["Cautiously supportive but wants more analysis", "Fully against the proposal", "Enthusiastically in favor", "Indifferent to the outcome"], ans: 0 },
  { level: 4, type: "listening", q: "♪ Listen: 'Notwithstanding the initial setbacks, the project has demonstrated remarkable resilience and is now on track to exceed its original projections.' — What happened to the project?", audio: "Notwithstanding the initial setbacks, the project has demonstrated remarkable resilience and is now on track to exceed its original projections.", opts: ["It struggled early but recovered and is now exceeding expectations", "It failed completely", "It was cancelled and restarted", "It met exactly the original targets"], ans: 0 },
  { level: 5, type: "listening", q: "♪ Listen: 'The ostensible rationale for the restructuring belied a more nuanced set of motivations that only became apparent in retrospect.' — What does this mean?", audio: "The ostensible rationale for the restructuring belied a more nuanced set of motivations that only became apparent in retrospect.", opts: ["The stated reasons were not the real reasons, which only became clear later", "The restructuring was fully transparent from the start", "Everyone understood the reasons immediately", "The restructuring had no clear purpose"], ans: 0 },
];

const levelIdxData: LevelIdx = { A1: 0, A2: 1, B1: 2, B2: 3, C1: 4, C2: 5 };

const typeLabelsData: TypeLabels = { grammar: "قواعد", vocab: "مفردات", reading: "فهم القراءة", pragmatics: "تواصل", listening: "استماع" };

const typeIconsData: TypeIcons = { grammar: "⌘", vocab: "V", reading: "R", pragmatics: "P", listening: "L" };

export const CEFR_LEVELS = CEFRLevelsSchema.parse(cefrData);
export const LEVEL_TEST = LevelTestSchema.parse(levelTestData);
export const LEVEL_IDX = LevelIdxSchema.parse(levelIdxData);
export const TYPE_LABELS = TypeLabelsSchema.parse(typeLabelsData);
export const TYPE_ICONS = TypeIconsSchema.parse(typeIconsData);
