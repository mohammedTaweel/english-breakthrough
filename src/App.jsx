import React, { useState, useEffect, useCallback } from 'react';

// ==================== DATA ====================

// Shadowing sentences - 3 levels
const shadowingSentences = {
  1: [
    "Let me check that.",
    "I agree with you.",
    "Can you repeat that?",
    "That sounds good.",
    "I have a question.",
    "Let me think about it.",
    "I understand your point.",
    "We need more time.",
    "That makes sense.",
    "I will follow up.",
    "Please go ahead.",
    "I see what you mean.",
    "Let us move on.",
    "Can I add something?",
    "I will take care of it."
  ],
  2: [
    "I would like to share my perspective on this topic.",
    "Could we schedule a follow-up meeting next week?",
    "I think we should consider another approach here.",
    "Let me walk you through the main findings of the report.",
    "I completely agree with what you just mentioned.",
    "We need to align our priorities before moving forward.",
    "Can you give me a quick summary of the discussion?",
    "I suggest we table this and revisit it tomorrow.",
    "That is an excellent point and I want to build on it.",
    "I am not sure I follow — could you elaborate on that?",
    "From my experience, this approach tends to work better.",
    "Let me pull up the data to support my point.",
    "I think we are on the same page regarding the timeline.",
    "Would it be possible to get your input before Friday?",
    "I appreciate your feedback and will incorporate the changes."
  ],
  3: [
    "Based on the quarterly results, I believe we should reallocate our budget to focus on the highest-performing segments.",
    "I understand your concern about the timeline, but I think if we bring in additional resources, we can still meet the deadline.",
    "Before we finalize this decision, I would like to present an alternative approach that might reduce costs significantly.",
    "Looking at the competitive landscape, it is clear that we need to accelerate our digital transformation strategy.",
    "I have been reviewing the feedback from our stakeholders, and there are three key themes I would like to address today.",
    "While I appreciate the urgency, I think we need to conduct a thorough risk assessment before committing to this plan.",
    "The data suggests that our customer retention rate has improved by fifteen percent since we implemented the new program.",
    "I propose we create a cross-functional task force to tackle this challenge and report back with recommendations by month-end.",
    "In my previous role, we faced a similar situation and found that a phased approach yielded the best long-term results.",
    "I want to make sure everyone is aligned on the next steps, so let me summarize what we have agreed upon during this meeting."
  ]
};

// Meeting sentences (25 sentences)
const meetingSentences = [
  { en: "Let's get started.", ar: "لنبدأ." },
  { en: "Can everyone hear me?", ar: "هل الكل يسمعني؟" },
  { en: "I'd like to share my screen.", ar: "أود مشاركة شاشتي." },
  { en: "That's a great point.", ar: "نقطة ممتازة." },
  { en: "I have a different perspective.", ar: "عندي وجهة نظر مختلفة." },
  { en: "Could you elaborate on that?", ar: "ممكن توضّح أكثر؟" },
  { en: "Let me take a note of that.", ar: "خلّني أسجّل هذي النقطة." },
  { en: "I'll send a follow-up email.", ar: "بأرسل إيميل متابعة." },
  { en: "What are the next steps?", ar: "إيش الخطوات الجاية؟" },
  { en: "I agree with the proposal.", ar: "أتفق مع المقترح." },
  { en: "We need to prioritize this.", ar: "لازم نعطي هذا أولوية." },
  { en: "Can we circle back to that?", ar: "نقدر نرجع لهذي النقطة؟" },
  { en: "I'll take the action item.", ar: "أنا بآخذ هذي المهمة." },
  { en: "Let's table this for now.", ar: "خلّنا نأجّل هذا الحين." },
  { en: "Does anyone have concerns?", ar: "أحد عنده ملاحظات؟" },
  { en: "I'd like to propose an alternative.", ar: "أقترح بديل." },
  { en: "That aligns with our strategy.", ar: "هذا يتوافق مع استراتيجيتنا." },
  { en: "We're running low on time.", ar: "الوقت يضيق علينا." },
  { en: "Let me summarize the key takeaways.", ar: "خلّني ألخّص أهم النقاط." },
  { en: "I'll loop in the relevant team.", ar: "بأضيف الفريق المعني." },
  { en: "Can we set a deadline for this?", ar: "نقدر نحدد موعد نهائي؟" },
  { en: "I need more context on this.", ar: "أحتاج تفاصيل أكثر." },
  { en: "Let's align on expectations.", ar: "خلّنا نتفق على التوقعات." },
  { en: "I'll prepare a report by Friday.", ar: "بأجهّز تقرير قبل الجمعة." },
  { en: "Thanks everyone for your time.", ar: "شكراً للجميع على وقتكم." }
];

// Stories (8 stories)
const stories = [
  {
    title: "The New Manager",
    titleAr: "المدير الجديد",
    sentences: [
      "Ahmed joined a multinational company as a team leader.",
      "On his first day, he had to introduce himself in English.",
      "He was nervous but he had practiced his introduction many times.",
      "He stood up and said: Good morning everyone, I am Ahmed.",
      "I have ten years of experience in project management.",
      "I am excited to work with such a talented team.",
      "His colleagues smiled and welcomed him warmly.",
      "After the meeting, his manager said: Great introduction Ahmed.",
      "Ahmed felt proud and more confident about his new role.",
      "He realized that preparation was the key to success."
    ]
  },
  {
    title: "The Client Call",
    titleAr: "مكالمة العميل",
    sentences: [
      "Sara had an important call with an international client.",
      "She prepared her talking points the night before.",
      "When the call started, the client spoke very fast.",
      "Sara politely said: Could you please slow down a bit?",
      "The client apologized and repeated his question clearly.",
      "Sara answered confidently using the phrases she had practiced.",
      "She suggested a new timeline for the project delivery.",
      "The client was impressed with her clear communication.",
      "They agreed on the next steps and scheduled a follow-up.",
      "Sara learned that asking for clarification is a strength, not a weakness."
    ]
  },
  {
    title: "The Presentation",
    titleAr: "العرض التقديمي",
    sentences: [
      "Omar was asked to present the quarterly results to the board.",
      "He spent a week preparing his slides and practicing his speech.",
      "On the day of the presentation, the room was full of executives.",
      "Omar took a deep breath and started: Thank you all for being here.",
      "He walked through each slide with confidence and clarity.",
      "When a board member asked a tough question, Omar stayed calm.",
      "He said: That is an excellent question, let me address it.",
      "He provided data to support his answer and the board was satisfied.",
      "After the presentation, several people came to congratulate him.",
      "Omar realized that thorough preparation eliminates most of the fear."
    ]
  },
  {
    title: "The Conference",
    titleAr: "المؤتمر",
    sentences: [
      "Khalid attended an international conference in Dubai.",
      "He wanted to network but felt shy about speaking English.",
      "During a coffee break, a colleague from London approached him.",
      "She asked: What do you think about the keynote speaker?",
      "Khalid replied: I thought the insights on digital transformation were valuable.",
      "They had a great conversation about industry trends.",
      "She gave him her business card and suggested they collaborate.",
      "Khalid realized that most people appreciate effort over perfection.",
      "He spent the rest of the conference talking to new people.",
      "By the end, he had made five valuable professional connections."
    ]
  },
  {
    title: "The Email",
    titleAr: "الإيميل",
    sentences: [
      "Fatima received an urgent email from her American counterpart.",
      "The email asked for a detailed status update by end of day.",
      "She used to dread writing long emails in English.",
      "But she had been practicing structured writing for weeks.",
      "She started with: Thank you for reaching out regarding the project status.",
      "Then she organized her update into three clear sections.",
      "She included bullet points to make it easy to read.",
      "She ended with: Please let me know if you need any additional information.",
      "Her counterpart replied: This is one of the best updates I have received.",
      "Fatima smiled knowing that practice had paid off."
    ]
  },
  {
    title: "The Job Interview",
    titleAr: "مقابلة العمل",
    sentences: [
      "Nasser applied for a senior position at a global firm.",
      "The interview would be conducted entirely in English.",
      "He practiced common interview questions every morning for two weeks.",
      "On the day of the interview, he arrived early and composed himself.",
      "The interviewer asked: Tell me about a challenge you overcame.",
      "Nasser shared a story about turning around a failing project.",
      "He used clear structure: the situation, his action, and the result.",
      "The interviewer nodded and said: That is very impressive.",
      "Nasser got the job offer the following week.",
      "He proved that consistent practice leads to real opportunities."
    ]
  },
  {
    title: "The Workshop",
    titleAr: "ورشة العمل",
    sentences: [
      "Layla was asked to lead a workshop for international colleagues.",
      "She had never facilitated a session in English before.",
      "She wrote down key phrases she would need during the workshop.",
      "She practiced transitions like: Now let us move to the next topic.",
      "On the day, she started with an icebreaker activity.",
      "The participants were engaged and asked many questions.",
      "Layla handled each question by first repeating it for clarity.",
      "She said: Great question. If I understand correctly, you are asking about...",
      "The workshop received excellent feedback from all participants.",
      "Layla discovered that leading in English was not as scary as she thought."
    ]
  },
  {
    title: "The Negotiation",
    titleAr: "التفاوض",
    sentences: [
      "Tariq had to negotiate a contract with a European supplier.",
      "The negotiation would be a video call with four people on the other side.",
      "He prepared his key arguments and practiced them out loud.",
      "He also prepared phrases for disagreeing politely.",
      "When the call started, the supplier proposed a high price.",
      "Tariq said: I appreciate your offer, however, our budget is limited.",
      "He presented market data to support his counter-offer.",
      "The supplier asked for a compromise, and Tariq was ready.",
      "They reached an agreement that satisfied both parties.",
      "Tariq learned that negotiating in English is about clarity and respect."
    ]
  }
];

// Meeting scenarios (5 scenarios)
const meetingScenarios = [
  {
    title: "Disagreeing Politely",
    titleAr: "الاعتراض بأدب",
    situation: "Your colleague suggests launching the product next month, but you think it needs more testing.",
    questions: [
      {
        prompt: "How do you politely disagree?",
        correct: "I see your point, but I think we need more testing before launch.",
        wrong: [
          "No, that is a bad idea.",
          "I do not care what you think.",
          "Maybe we should ask someone else."
        ]
      },
      {
        prompt: "How do you suggest an alternative?",
        correct: "What if we push the launch by two weeks to ensure quality?",
        wrong: [
          "Just delay it forever.",
          "I have no suggestions.",
          "Someone else should decide."
        ]
      }
    ]
  },
  {
    title: "Asking for Clarification",
    titleAr: "طلب التوضيح",
    situation: "During a meeting, your manager explains a new process but you did not understand part of it.",
    questions: [
      {
        prompt: "How do you ask for clarification?",
        correct: "Could you please explain the third step in more detail?",
        wrong: [
          "I was not listening.",
          "This is too complicated for me.",
          "Just send me an email."
        ]
      },
      {
        prompt: "How do you confirm your understanding?",
        correct: "So if I understand correctly, we need to submit the report before the review?",
        wrong: [
          "I guess I understand.",
          "Whatever you say.",
          "I will figure it out later."
        ]
      }
    ]
  },
  {
    title: "Presenting Results",
    titleAr: "عرض النتائج",
    situation: "You need to present last quarter's results to senior management.",
    questions: [
      {
        prompt: "How do you start your presentation?",
        correct: "Good morning everyone. Today I will walk you through our Q3 performance.",
        wrong: [
          "So, here are some numbers.",
          "I am not sure where to start.",
          "Can someone else present this?"
        ]
      },
      {
        prompt: "How do you handle a difficult question?",
        correct: "That is a great question. Let me check the data and get back to you today.",
        wrong: [
          "I do not know.",
          "That is not my responsibility.",
          "Can we skip that question?"
        ]
      }
    ]
  },
  {
    title: "Joining a New Team",
    titleAr: "الانضمام لفريق جديد",
    situation: "You just joined a new project team and this is your first meeting with them.",
    questions: [
      {
        prompt: "How do you introduce yourself?",
        correct: "Hi everyone, I am excited to join this team. I bring ten years of experience in operations.",
        wrong: [
          "Hello, I am new here.",
          "I do not know why I was assigned here.",
          "Just tell me what to do."
        ]
      },
      {
        prompt: "How do you ask about the project status?",
        correct: "Could someone give me a quick overview of where the project stands currently?",
        wrong: [
          "What is going on?",
          "I have no idea about this project.",
          "Send me all the documents."
        ]
      }
    ]
  },
  {
    title: "Giving Feedback",
    titleAr: "تقديم ملاحظات",
    situation: "Your team member delivered a report but it needs significant improvements.",
    questions: [
      {
        prompt: "How do you start giving constructive feedback?",
        correct: "Thank you for the effort. I have a few suggestions that could make the report even stronger.",
        wrong: [
          "This report is bad.",
          "You need to redo everything.",
          "I expected much better work."
        ]
      },
      {
        prompt: "How do you suggest specific improvements?",
        correct: "I think adding more data visualization would help the reader understand the trends better.",
        wrong: [
          "Just make it better.",
          "Figure it out yourself.",
          "I do not have time to explain."
        ]
      }
    ]
  }
];

// Think Aloud topics with sentence starters
const thinkAloudTopics = [
  {
    topic: "Describe your morning routine",
    topicAr: "وصف روتينك الصباحي",
    starters: ["First, I usually...", "Then I...", "After that, I...", "Before leaving, I always...", "Finally, I..."]
  },
  {
    topic: "Talk about your favorite meal",
    topicAr: "تحدث عن وجبتك المفضلة",
    starters: ["My favorite meal is...", "I like it because...", "It is made with...", "I usually eat it when...", "The best place to have it is..."]
  },
  {
    topic: "Describe your workspace",
    topicAr: "وصف مكان عملك",
    starters: ["My workspace is...", "On my desk, I have...", "I like it because...", "One thing I would change is...", "The best part about it is..."]
  },
  {
    topic: "Talk about a recent meeting",
    topicAr: "تحدث عن اجتماع أخير",
    starters: ["Recently, I had a meeting about...", "The main topic was...", "I contributed by saying...", "We decided to...", "The outcome was..."]
  },
  {
    topic: "Describe your weekend plans",
    topicAr: "وصف خططك لنهاية الأسبوع",
    starters: ["This weekend, I plan to...", "In the morning, I will...", "After lunch, I might...", "In the evening, I want to...", "If the weather is good, I will..."]
  },
  {
    topic: "Talk about a skill you want to learn",
    topicAr: "تحدث عن مهارة تريد تعلمها",
    starters: ["I have always wanted to learn...", "The reason I want to learn it is...", "I think the first step is...", "The biggest challenge would be...", "Once I learn it, I will be able to..."]
  },
  {
    topic: "Describe your ideal vacation",
    topicAr: "وصف إجازتك المثالية",
    starters: ["My ideal vacation would be...", "I would travel to...", "During the trip, I would...", "The best part would be...", "I would come back feeling..."]
  },
  {
    topic: "Talk about a project at work",
    topicAr: "تحدث عن مشروع في العمل",
    starters: ["I am currently working on...", "The goal of this project is...", "My role involves...", "The biggest challenge so far is...", "I expect we will finish by..."]
  },
  {
    topic: "Describe your commute to work",
    topicAr: "وصف طريقك للعمل",
    starters: ["Every day, I leave home at...", "I usually take...", "The commute takes about...", "During the commute, I...", "One thing I wish was different is..."]
  },
  {
    topic: "Talk about a book or article you read",
    topicAr: "تحدث عن كتاب أو مقال قرأته",
    starters: ["Recently, I read...", "It was about...", "The main idea was...", "I found it interesting because...", "I would recommend it to..."]
  },
  {
    topic: "Describe what you do after work",
    topicAr: "وصف ما تفعله بعد العمل",
    starters: ["After work, I usually...", "Sometimes I...", "My favorite activity is...", "I try to spend time...", "Before bed, I always..."]
  },
  {
    topic: "Talk about a challenge you overcame",
    topicAr: "تحدث عن تحدي تغلبت عليه",
    starters: ["One of the biggest challenges I faced was...", "It happened when...", "I dealt with it by...", "The hardest part was...", "In the end, I learned that..."]
  }
];

// Quick response scenarios
const quickResponses = [
  {
    situation: "Someone says: How was your weekend?",
    correct: "It was great, thanks for asking. I spent time with my family.",
    wrong: ["I do not understand.", "Please repeat.", "I am fine."]
  },
  {
    situation: "Someone says: Can you join the meeting at 3?",
    correct: "Sure, I will be there. Should I prepare anything?",
    wrong: ["What meeting?", "I am busy forever.", "Send me calendar."]
  },
  {
    situation: "Someone says: Great job on the presentation!",
    correct: "Thank you! I appreciate the feedback. The team worked hard on it.",
    wrong: ["OK.", "I know.", "It was nothing special."]
  },
  {
    situation: "Someone says: We need to push the deadline.",
    correct: "I understand. What is the new timeline you are considering?",
    wrong: ["No way.", "That is your problem.", "I do not care."]
  },
  {
    situation: "Someone says: Could you send me the report?",
    correct: "Of course. I will send it to you by end of day.",
    wrong: ["Which report?", "I am too busy.", "Find it yourself."]
  }
];


// ==================== UTILITY FUNCTIONS ====================

// Shuffle options and return {opts, correctIndex}
function shuffleOpts(correct, wrong, seed) {
  const allOpts = [correct, ...wrong];
  // Seeded pseudo-random shuffle (Fisher-Yates)
  let s = seed || Date.now();
  const rand = () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
  for (let i = allOpts.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [allOpts[i], allOpts[j]] = [allOpts[j], allOpts[i]];
  }
  return { opts: allOpts, correctIndex: allOpts.indexOf(correct) };
}

// Get current week (1-12) based on start date
function getCurrentWeek(startDate) {
  const now = new Date();
  const start = new Date(startDate);
  const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  return Math.min(12, Math.max(1, Math.floor(diff / 7) + 1));
}

// Get current phase (1-3) based on week
function getPhase(week) {
  if (week <= 4) return 1;
  if (week <= 8) return 2;
  return 3;
}

// Get today's day number
function getDayOfProgram(startDate) {
  const now = new Date();
  const start = new Date(startDate);
  return Math.max(1, Math.floor((now - start) / (1000 * 60 * 60 * 24)) + 1);
}

// Storage helpers
const storage = {
  async get(key) {
    try {
      if (window.storage) return await window.storage.get(key);
    } catch {}
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch {}
    return null;
  },
  async set(key, value) {
    try {
      if (window.storage) return await window.storage.set(key, value);
    } catch {}
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }
};

// ==================== STYLES ====================
const COLORS = {
  bg: '#0f1117',
  card: '#1a1d27',
  cardHover: '#22263a',
  primary: '#6c5ce7',
  primaryLight: '#a29bfe',
  secondary: '#00cec9',
  accent: '#fd79a8',
  success: '#00b894',
  warning: '#fdcb6e',
  danger: '#e17055',
  text: '#dfe6e9',
  textMuted: '#636e72',
  border: '#2d3436',
};

const baseStyles = {
  app: {
    fontFamily: "'Noto Kufi Arabic', 'IBM Plex Mono', sans-serif",
    background: COLORS.bg,
    color: COLORS.text,
    minHeight: '100vh',
    direction: 'rtl',
    maxWidth: 480,
    margin: '0 auto',
    padding: '0 12px',
  },
  header: {
    textAlign: 'center',
    padding: '16px 0 8px',
    borderBottom: `1px solid ${COLORS.border}`,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: COLORS.primary,
    margin: 0,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    margin: '4px 0 0',
  },
  tabs: {
    display: 'flex',
    gap: 4,
    marginBottom: 16,
    background: COLORS.card,
    borderRadius: 12,
    padding: 4,
  },
  tab: (active) => ({
    flex: 1,
    padding: '10px 4px',
    border: 'none',
    borderRadius: 10,
    background: active ? COLORS.primary : 'transparent',
    color: active ? '#fff' : COLORS.textMuted,
    fontSize: 13,
    fontWeight: active ? 700 : 400,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.2s',
  }),
  card: {
    background: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 8,
    color: COLORS.text,
  },
  btn: (color = COLORS.primary) => ({
    padding: '10px 20px',
    border: 'none',
    borderRadius: 10,
    background: color,
    color: '#fff',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.2s',
    width: '100%',
    marginTop: 8,
  }),
  btnSmall: (color = COLORS.primary) => ({
    padding: '6px 14px',
    border: 'none',
    borderRadius: 8,
    background: color,
    color: '#fff',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  }),
  enText: {
    fontFamily: "'IBM Plex Mono', monospace",
    direction: 'ltr',
    textAlign: 'left',
    fontSize: 16,
    lineHeight: 1.8,
    color: COLORS.text,
  },
  tag: (color) => ({
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: 20,
    background: color + '22',
    color: color,
    fontSize: 11,
    fontWeight: 600,
    marginLeft: 8,
  }),
  optionBtn: (selected, isCorrect, showResult) => {
    let bg = COLORS.card;
    let border = COLORS.border;
    if (showResult && selected) {
      bg = isCorrect ? COLORS.success + '33' : COLORS.danger + '33';
      border = isCorrect ? COLORS.success : COLORS.danger;
    } else if (showResult && isCorrect) {
      bg = COLORS.success + '22';
      border = COLORS.success;
    } else if (selected) {
      bg = COLORS.primary + '33';
      border = COLORS.primary;
    }
    return {
      display: 'block',
      width: '100%',
      padding: '12px 16px',
      marginBottom: 8,
      border: `2px solid ${border}`,
      borderRadius: 10,
      background: bg,
      color: COLORS.text,
      fontSize: 14,
      fontFamily: "'IBM Plex Mono', monospace",
      direction: 'ltr',
      textAlign: 'left',
      cursor: showResult ? 'default' : 'pointer',
      transition: 'all 0.2s',
    };
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    border: `2px solid ${COLORS.border}`,
    borderRadius: 10,
    background: COLORS.bg,
    color: COLORS.text,
    fontSize: 14,
    fontFamily: "'IBM Plex Mono', monospace",
    direction: 'ltr',
    textAlign: 'left',
    boxSizing: 'border-box',
  },
  progressBar: (pct, color = COLORS.primary) => ({
    height: 6,
    borderRadius: 3,
    background: COLORS.border,
    marginTop: 8,
    position: 'relative',
    overflow: 'hidden',
    '::after': { width: `${pct}%`, background: color },
  }),
};


// ==================== COMPONENTS ====================

// Progress Bar component
function ProgressBar({ pct, color = COLORS.primary }) {
  return (
    <div style={{ height: 6, borderRadius: 3, background: COLORS.border, marginTop: 8, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${Math.min(100, pct)}%`, background: color, borderRadius: 3, transition: 'width 0.5s' }} />
    </div>
  );
}

// Counter component for repetition tracking
function RepCounter({ count, onIncrement, label = "مرات التكرار" }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
      <span style={{ fontSize: 13, color: COLORS.textMuted }}>{label}:</span>
      <button onClick={onIncrement} style={{ ...baseStyles.btnSmall(COLORS.secondary), minWidth: 36 }}>+1</button>
      <span style={{ fontSize: 18, fontWeight: 700, color: COLORS.secondary }}>{count}</span>
    </div>
  );
}

// Simple bar chart for progress
function BarChart({ data, labels }) {
  const max = Math.max(...data, 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120, marginTop: 12 }}>
      {data.map((val, i) => (
        <div key={i} style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.secondary, marginBottom: 4 }}>{val}%</div>
          <div style={{
            height: `${(val / max) * 80}px`,
            background: `linear-gradient(180deg, ${COLORS.primary}, ${COLORS.secondary})`,
            borderRadius: '6px 6px 0 0',
            minHeight: 4,
            transition: 'height 0.5s',
          }} />
          <div style={{ fontSize: 10, color: COLORS.textMuted, marginTop: 4 }}>{labels[i]}</div>
        </div>
      ))}
    </div>
  );
}

// ==================== ACTIVITY COMPONENTS ====================

// 1. Shadowing Activity
function ShadowingActivity({ phase }) {
  const [idx, setIdx] = useState(0);
  const [reps, setReps] = useState(0);
  const sentences = shadowingSentences[phase] || shadowingSentences[1];

  return (
    <div style={baseStyles.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={baseStyles.cardTitle}>🎧 تقنية الظل (Shadowing)</h3>
        <span style={baseStyles.tag(COLORS.primary)}>المستوى {phase}</span>
      </div>
      <p style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 12 }}>
        اقرأ الجملة بصوت عالٍ وكرّرها عدة مرات
      </p>
      <div style={{
        ...baseStyles.enText,
        background: COLORS.bg,
        padding: 16,
        borderRadius: 10,
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 12,
        border: `1px solid ${COLORS.border}`,
      }}>
        {sentences[idx]}
      </div>
      <RepCounter count={reps} onIncrement={() => setReps(r => r + 1)} />
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button
          onClick={() => { setIdx(i => Math.max(0, i - 1)); setReps(0); }}
          style={{ ...baseStyles.btnSmall(COLORS.border), flex: 1, color: COLORS.text }}
          disabled={idx === 0}
        >
          ← السابقة
        </button>
        <span style={{ fontSize: 12, color: COLORS.textMuted, alignSelf: 'center' }}>
          {idx + 1} / {sentences.length}
        </span>
        <button
          onClick={() => { setIdx(i => Math.min(sentences.length - 1, i + 1)); setReps(0); }}
          style={{ ...baseStyles.btnSmall(COLORS.primary), flex: 1 }}
          disabled={idx === sentences.length - 1}
        >
          التالية →
        </button>
      </div>
    </div>
  );
}

// 2. Think Aloud Activity
function ThinkAloudActivity({ day }) {
  const topicData = thinkAloudTopics[day % thinkAloudTopics.length];
  const [timer, setTimer] = useState(120);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running || timer <= 0) return;
    const t = setTimeout(() => setTimer(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [running, timer]);

  return (
    <div style={baseStyles.card}>
      <h3 style={baseStyles.cardTitle}>🗣️ تفكير بصوت عالٍ</h3>
      <p style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 8 }}>
        تحدث عن الموضوع لمدة دقيقتين بالإنجليزي
      </p>
      <div style={{
        background: COLORS.bg,
        padding: 14,
        borderRadius: 10,
        marginBottom: 12,
        border: `1px solid ${COLORS.border}`,
      }}>
        <div style={{ ...baseStyles.enText, fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
          {topicData.topic}
        </div>
        <div style={{ fontSize: 13, color: COLORS.textMuted }}>{topicData.topicAr}</div>
      </div>
      {/* Sentence Starters */}
      <div style={{
        background: COLORS.primary + '15',
        padding: 12,
        borderRadius: 10,
        marginBottom: 12,
        border: `1px solid ${COLORS.primary}33`,
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.primaryLight, marginBottom: 8 }}>
          💡 جمل بداية تساعدك:
        </div>
        {topicData.starters.map((s, i) => (
          <div key={i} style={{
            ...baseStyles.enText,
            fontSize: 13,
            padding: '4px 0',
            color: COLORS.primaryLight,
            borderBottom: i < topicData.starters.length - 1 ? `1px solid ${COLORS.primary}22` : 'none',
          }}>
            {s}
          </div>
        ))}
      </div>
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <span style={{
          fontSize: 28,
          fontWeight: 700,
          color: timer < 30 ? COLORS.danger : COLORS.secondary,
          fontFamily: "'IBM Plex Mono', monospace",
        }}>
          {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}
        </span>
      </div>
      <button
        onClick={() => setRunning(r => !r)}
        style={baseStyles.btn(running ? COLORS.danger : COLORS.success)}
      >
        {running ? '⏸ إيقاف' : '▶ ابدأ التحدث'}
      </button>
    </div>
  );
}

// 3. Story Reading Activity
function StoryActivity({ day }) {
  const story = stories[day % stories.length];
  const [sentIdx, setSentIdx] = useState(0);
  const [reps, setReps] = useState(0);

  return (
    <div style={baseStyles.card}>
      <h3 style={baseStyles.cardTitle}>📖 قراءة قصة: {story.titleAr}</h3>
      <p style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 12 }}>
        اقرأ كل جملة بصوت عالٍ وكرّرها
      </p>
      <div style={{
        ...baseStyles.enText,
        background: COLORS.bg,
        padding: 16,
        borderRadius: 10,
        fontSize: 17,
        textAlign: 'center',
        marginBottom: 8,
        border: `1px solid ${COLORS.border}`,
        minHeight: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {story.sentences[sentIdx]}
      </div>
      <RepCounter count={reps} onIncrement={() => setReps(r => r + 1)} />
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button
          onClick={() => { setSentIdx(i => Math.max(0, i - 1)); setReps(0); }}
          style={{ ...baseStyles.btnSmall(COLORS.border), flex: 1, color: COLORS.text }}
          disabled={sentIdx === 0}
        >
          ← السابقة
        </button>
        <span style={{ fontSize: 12, color: COLORS.textMuted, alignSelf: 'center' }}>
          {sentIdx + 1} / {story.sentences.length}
        </span>
        <button
          onClick={() => { setSentIdx(i => Math.min(story.sentences.length - 1, i + 1)); setReps(0); }}
          style={{ ...baseStyles.btnSmall(COLORS.primary), flex: 1 }}
          disabled={sentIdx === story.sentences.length - 1}
        >
          التالية →
        </button>
      </div>
    </div>
  );
}

// 4. Meeting Sentences Review
function MeetingSentencesActivity() {
  const [idx, setIdx] = useState(0);
  const [reps, setReps] = useState({});
  const sent = meetingSentences[idx];

  return (
    <div style={baseStyles.card}>
      <h3 style={baseStyles.cardTitle}>💬 جمل الاجتماعات</h3>
      <p style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 12 }}>
        كرّر كل جملة ٣ مرات على الأقل
      </p>
      <div style={{
        background: COLORS.bg,
        padding: 16,
        borderRadius: 10,
        marginBottom: 8,
        border: `1px solid ${COLORS.border}`,
        textAlign: 'center',
      }}>
        <div style={{ ...baseStyles.enText, fontSize: 18, textAlign: 'center', marginBottom: 8 }}>
          {sent.en}
        </div>
        <div style={{ fontSize: 14, color: COLORS.textMuted }}>{sent.ar}</div>
      </div>
      <RepCounter
        count={reps[idx] || 0}
        onIncrement={() => setReps(r => ({ ...r, [idx]: (r[idx] || 0) + 1 }))}
      />
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button
          onClick={() => setIdx(i => Math.max(0, i - 1))}
          style={{ ...baseStyles.btnSmall(COLORS.border), flex: 1, color: COLORS.text }}
          disabled={idx === 0}
        >
          ← السابقة
        </button>
        <span style={{ fontSize: 12, color: COLORS.textMuted, alignSelf: 'center' }}>
          {idx + 1} / {meetingSentences.length}
        </span>
        <button
          onClick={() => setIdx(i => Math.min(meetingSentences.length - 1, i + 1))}
          style={{ ...baseStyles.btnSmall(COLORS.primary), flex: 1 }}
          disabled={idx === meetingSentences.length - 1}
        >
          التالية →
        </button>
      </div>
    </div>
  );
}

// 5. Story of the Day (different from main story)
function StoryOfDayActivity({ day }) {
  const storyIdx = (day + Math.floor(stories.length / 2)) % stories.length;
  const story = stories[storyIdx];
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={baseStyles.card}>
      <h3 style={baseStyles.cardTitle}>📚 قصة اليوم: {story.titleAr}</h3>
      <div style={{
        ...baseStyles.enText,
        background: COLORS.bg,
        padding: 14,
        borderRadius: 10,
        border: `1px solid ${COLORS.border}`,
        lineHeight: 2,
      }}>
        {expanded
          ? story.sentences.join(' ')
          : story.sentences.slice(0, 3).join(' ') + '...'
        }
      </div>
      <button
        onClick={() => setExpanded(e => !e)}
        style={{ ...baseStyles.btnSmall(COLORS.primary), marginTop: 8 }}
      >
        {expanded ? 'إخفاء' : 'اقرأ المزيد'}
      </button>
    </div>
  );
}


// ==================== TRAINING COMPONENTS ====================

// Meeting Simulation
function MeetingSimulation({ seed }) {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const scenario = meetingScenarios[scenarioIdx];
  const q = scenario.questions[qIdx];
  const shuffled = React.useMemo(
    () => shuffleOpts(q.correct, q.wrong, seed + scenarioIdx * 100 + qIdx),
    [scenarioIdx, qIdx, seed, q.correct]
  );

  const handleSelect = (i) => {
    if (showResult) return;
    setSelected(i);
    setShowResult(true);
    if (i === shuffled.correctIndex) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (qIdx < scenario.questions.length - 1) {
      setQIdx(q => q + 1);
    } else if (scenarioIdx < meetingScenarios.length - 1) {
      setScenarioIdx(s => s + 1);
      setQIdx(0);
    }
    setSelected(null);
    setShowResult(false);
  };

  return (
    <div style={baseStyles.card}>
      <h3 style={baseStyles.cardTitle}>🎭 محاكاة اجتماع: {scenario.titleAr}</h3>
      <div style={{
        background: COLORS.bg,
        padding: 12,
        borderRadius: 10,
        marginBottom: 12,
        border: `1px solid ${COLORS.border}`,
      }}>
        <div style={{ ...baseStyles.enText, fontSize: 13, marginBottom: 8 }}>{scenario.situation}</div>
        <div style={{ ...baseStyles.enText, fontSize: 14, fontWeight: 700 }}>{q.prompt}</div>
      </div>
      {shuffled.opts.map((opt, i) => (
        <button
          key={i}
          onClick={() => handleSelect(i)}
          style={baseStyles.optionBtn(selected === i, i === shuffled.correctIndex, showResult)}
        >
          {opt}
        </button>
      ))}
      {showResult && (
        <button onClick={handleNext} style={baseStyles.btn(COLORS.primary)}>
          التالي ←
        </button>
      )}
      <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 8, textAlign: 'center' }}>
        النتيجة: {score} | السيناريو {scenarioIdx + 1}/{meetingScenarios.length} | السؤال {qIdx + 1}/{scenario.questions.length}
      </div>
    </div>
  );
}

// Quick Response Exercise
function QuickResponseExercise({ seed }) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const q = quickResponses[idx];
  const shuffled = React.useMemo(
    () => shuffleOpts(q.correct, q.wrong, seed + idx * 77),
    [idx, seed, q.correct]
  );

  const handleSelect = (i) => {
    if (showResult) return;
    setSelected(i);
    setShowResult(true);
    if (i === shuffled.correctIndex) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (idx < quickResponses.length - 1) setIdx(i => i + 1);
    setSelected(null);
    setShowResult(false);
  };

  return (
    <div style={baseStyles.card}>
      <h3 style={baseStyles.cardTitle}>⚡ استجابة سريعة</h3>
      <div style={{
        ...baseStyles.enText,
        background: COLORS.bg,
        padding: 12,
        borderRadius: 10,
        marginBottom: 12,
        fontSize: 14,
        fontWeight: 600,
        border: `1px solid ${COLORS.border}`,
      }}>
        {q.situation}
      </div>
      {shuffled.opts.map((opt, i) => (
        <button
          key={i}
          onClick={() => handleSelect(i)}
          style={baseStyles.optionBtn(selected === i, i === shuffled.correctIndex, showResult)}
        >
          {opt}
        </button>
      ))}
      {showResult && idx < quickResponses.length - 1 && (
        <button onClick={handleNext} style={baseStyles.btn(COLORS.primary)}>التالي ←</button>
      )}
      <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 8, textAlign: 'center' }}>
        النتيجة: {score}/{idx + (showResult ? 1 : 0)} | السؤال {idx + 1}/{quickResponses.length}
      </div>
    </div>
  );
}

// Fill in the Blank Exercise
function FillBlankExercise() {
  const blanks = React.useMemo(() => {
    return meetingSentences.slice(0, 10).map(s => {
      const words = s.en.split(' ');
      const blankIdx = Math.min(Math.floor(words.length / 2), words.length - 1);
      const answer = words[blankIdx].replace(/[.,!?]/g, '');
      const punct = words[blankIdx].replace(answer, '');
      words[blankIdx] = '______' + punct;
      return { sentence: words.join(' '), answer: answer.toLowerCase(), full: s.en, ar: s.ar };
    });
  }, []);

  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const current = blanks[idx];
  const isCorrect = input.trim().toLowerCase() === current.answer;

  const handleCheck = () => {
    setShowResult(true);
    if (isCorrect) setScore(s => s + 1);
  };

  const handleNext = () => {
    setIdx(i => i + 1);
    setInput('');
    setShowResult(false);
  };

  if (idx >= blanks.length) {
    return (
      <div style={baseStyles.card}>
        <h3 style={baseStyles.cardTitle}>📝 أكمل الفراغ</h3>
        <div style={{ textAlign: 'center', padding: 20 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.success }}>
            أحسنت! النتيجة: {score}/{blanks.length}
          </div>
          <button onClick={() => { setIdx(0); setScore(0); setShowResult(false); }} style={baseStyles.btn(COLORS.primary)}>
            أعد المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={baseStyles.card}>
      <h3 style={baseStyles.cardTitle}>📝 أكمل الفراغ</h3>
      <p style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 12 }}>
        اكتب الكلمة الناقصة في الفراغ
      </p>
      <div style={{
        ...baseStyles.enText,
        background: COLORS.bg,
        padding: 14,
        borderRadius: 10,
        marginBottom: 12,
        fontSize: 15,
        border: `1px solid ${COLORS.border}`,
      }}>
        {current.sentence}
      </div>
      <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 8 }}>{current.ar}</div>
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && !showResult && handleCheck()}
        placeholder="اكتب الكلمة الناقصة..."
        style={baseStyles.input}
        disabled={showResult}
        dir="ltr"
      />
      {showResult && (
        <div style={{
          padding: 10,
          borderRadius: 8,
          marginTop: 8,
          background: isCorrect ? COLORS.success + '22' : COLORS.danger + '22',
          color: isCorrect ? COLORS.success : COLORS.danger,
          fontSize: 13,
          fontWeight: 600,
        }}>
          {isCorrect ? '✓ صحيح!' : `✗ الإجابة الصحيحة: ${current.answer}`}
          <div style={{ ...baseStyles.enText, fontSize: 12, color: COLORS.textMuted, marginTop: 4 }}>
            {current.full}
          </div>
        </div>
      )}
      {!showResult ? (
        <button onClick={handleCheck} style={baseStyles.btn(COLORS.primary)} disabled={!input.trim()}>
          تحقق ←
        </button>
      ) : idx < blanks.length - 1 ? (
        <button onClick={handleNext} style={baseStyles.btn(COLORS.primary)}>التالي ←</button>
      ) : (
        <button onClick={handleNext} style={baseStyles.btn(COLORS.success)}>عرض النتيجة</button>
      )}
      <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 8, textAlign: 'center' }}>
        {idx + 1}/{blanks.length} | النتيجة: {score}
      </div>
    </div>
  );
}

// Sentence Building Exercise
function SentenceBuildExercise() {
  const buildSentences = React.useMemo(() => {
    return meetingSentences.slice(5, 15).map(s => ({
      en: s.en,
      ar: s.ar,
      words: s.en.replace(/[.,!?']/g, '').split(' '),
    }));
  }, []);

  const [idx, setIdx] = useState(0);
  const [placed, setPlaced] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const current = buildSentences[idx];
  const shuffledWords = React.useMemo(() => {
    const w = [...current.words];
    for (let i = w.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [w[i], w[j]] = [w[j], w[i]];
    }
    return w;
  }, [idx]);

  const available = shuffledWords.filter((_, i) => !placed.includes(i));

  const handleWordClick = (wordIdx) => {
    if (showResult) return;
    setPlaced(p => [...p, wordIdx]);
  };

  const handleRemoveWord = (placedIdx) => {
    if (showResult) return;
    setPlaced(p => p.filter((_, i) => i !== placedIdx));
  };

  const handleCheck = () => {
    const builtSentence = placed.map(i => shuffledWords[i]).join(' ').toLowerCase();
    const correctSentence = current.words.join(' ').toLowerCase();
    setShowResult(true);
    if (builtSentence === correctSentence) setScore(s => s + 1);
  };

  const handleNext = () => {
    setIdx(i => i + 1);
    setPlaced([]);
    setShowResult(false);
  };

  const builtStr = placed.map(i => shuffledWords[i]).join(' ').toLowerCase();
  const correctStr = current.words.join(' ').toLowerCase();
  const isCorrect = builtStr === correctStr;

  if (idx >= buildSentences.length) {
    return (
      <div style={baseStyles.card}>
        <h3 style={baseStyles.cardTitle}>🧩 بناء جمل</h3>
        <div style={{ textAlign: 'center', padding: 20 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.success }}>
            أحسنت! النتيجة: {score}/{buildSentences.length}
          </div>
          <button onClick={() => { setIdx(0); setScore(0); setPlaced([]); setShowResult(false); }} style={baseStyles.btn(COLORS.primary)}>
            أعد المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={baseStyles.card}>
      <h3 style={baseStyles.cardTitle}>🧩 بناء جمل</h3>
      <p style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 8 }}>
        رتّب الكلمات لتكوين الجملة الصحيحة
      </p>
      <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 12 }}>{current.ar}</div>
      {/* Built sentence area */}
      <div style={{
        background: COLORS.bg,
        padding: 12,
        borderRadius: 10,
        minHeight: 48,
        marginBottom: 12,
        border: `2px dashed ${showResult ? (isCorrect ? COLORS.success : COLORS.danger) : COLORS.border}`,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 6,
        direction: 'ltr',
      }}>
        {placed.length === 0 && (
          <span style={{ color: COLORS.textMuted, fontSize: 13 }}>اضغط على الكلمات بالترتيب...</span>
        )}
        {placed.map((wordIdx, i) => (
          <button
            key={i}
            onClick={() => handleRemoveWord(i)}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              border: `1px solid ${COLORS.primary}`,
              background: COLORS.primary + '33',
              color: COLORS.text,
              fontSize: 14,
              fontFamily: "'IBM Plex Mono', monospace",
              cursor: showResult ? 'default' : 'pointer',
            }}
          >
            {shuffledWords[wordIdx]}
          </button>
        ))}
      </div>
      {/* Available words */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12, direction: 'ltr' }}>
        {shuffledWords.map((word, i) => {
          const isPlaced = placed.includes(i);
          return (
            <button
              key={i}
              onClick={() => !isPlaced && handleWordClick(i)}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                border: `1px solid ${COLORS.border}`,
                background: isPlaced ? COLORS.border + '44' : COLORS.card,
                color: isPlaced ? COLORS.textMuted : COLORS.text,
                fontSize: 14,
                fontFamily: "'IBM Plex Mono', monospace",
                cursor: isPlaced || showResult ? 'default' : 'pointer',
                opacity: isPlaced ? 0.4 : 1,
                transition: 'all 0.2s',
              }}
            >
              {word}
            </button>
          );
        })}
      </div>
      {showResult && (
        <div style={{
          padding: 10,
          borderRadius: 8,
          background: isCorrect ? COLORS.success + '22' : COLORS.danger + '22',
          color: isCorrect ? COLORS.success : COLORS.danger,
          fontSize: 13,
          fontWeight: 600,
          marginBottom: 8,
        }}>
          {isCorrect ? '✓ ممتاز!' : `✗ الترتيب الصحيح: ${current.en}`}
        </div>
      )}
      {!showResult ? (
        <button
          onClick={handleCheck}
          style={baseStyles.btn(COLORS.primary)}
          disabled={placed.length !== shuffledWords.length}
        >
          تحقق ←
        </button>
      ) : idx < buildSentences.length - 1 ? (
        <button onClick={handleNext} style={baseStyles.btn(COLORS.primary)}>التالي ←</button>
      ) : (
        <button onClick={handleNext} style={baseStyles.btn(COLORS.success)}>عرض النتيجة</button>
      )}
      <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 8, textAlign: 'center' }}>
        {idx + 1}/{buildSentences.length} | النتيجة: {score}
      </div>
    </div>
  );
}

// Weekly Test
function WeeklyTest({ week, onComplete }) {
  const questions = React.useMemo(() => {
    const qs = [];
    // Mix questions from meeting scenarios and quick responses
    meetingScenarios.slice(0, 3).forEach((sc, si) => {
      sc.questions.forEach((q, qi) => {
        qs.push({
          prompt: q.prompt,
          context: sc.situation,
          correct: q.correct,
          wrong: q.wrong,
          seed: week * 1000 + si * 10 + qi,
        });
      });
    });
    return qs.slice(0, 8);
  }, [week]);

  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = questions[idx];
  const shuffled = React.useMemo(
    () => q ? shuffleOpts(q.correct, q.wrong, q.seed) : null,
    [idx, q]
  );

  const handleSelect = (i) => {
    if (showResult) return;
    setSelected(i);
    setShowResult(true);
    if (i === shuffled.correctIndex) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (idx < questions.length - 1) {
      setIdx(i => i + 1);
      setSelected(null);
      setShowResult(false);
    } else {
      const pct = Math.round((score / questions.length) * 100);
      onComplete(pct);
      setDone(true);
    }
  };

  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div style={baseStyles.card}>
        <h3 style={baseStyles.cardTitle}>📊 نتيجة الاختبار الأسبوعي</h3>
        <div style={{ textAlign: 'center', padding: 20 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>{pct >= 80 ? '🌟' : pct >= 50 ? '👍' : '💪'}</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: pct >= 80 ? COLORS.success : pct >= 50 ? COLORS.warning : COLORS.danger }}>
            {pct}%
          </div>
          <div style={{ fontSize: 14, color: COLORS.textMuted, marginTop: 8 }}>
            {score} من {questions.length} إجابات صحيحة
          </div>
        </div>
      </div>
    );
  }

  if (!q) return null;

  return (
    <div style={baseStyles.card}>
      <h3 style={baseStyles.cardTitle}>📝 الاختبار الأسبوعي — الأسبوع {week}</h3>
      <div style={{
        ...baseStyles.enText,
        background: COLORS.bg,
        padding: 12,
        borderRadius: 10,
        marginBottom: 8,
        fontSize: 12,
        border: `1px solid ${COLORS.border}`,
      }}>
        {q.context}
      </div>
      <div style={{ ...baseStyles.enText, fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
        {q.prompt}
      </div>
      {shuffled.opts.map((opt, i) => (
        <button
          key={i}
          onClick={() => handleSelect(i)}
          style={baseStyles.optionBtn(selected === i, i === shuffled.correctIndex, showResult)}
        >
          {opt}
        </button>
      ))}
      {showResult && (
        <button onClick={handleNext} style={baseStyles.btn(COLORS.primary)}>
          {idx < questions.length - 1 ? 'التالي ←' : 'عرض النتيجة'}
        </button>
      )}
      <ProgressBar pct={((idx + (showResult ? 1 : 0)) / questions.length) * 100} />
    </div>
  );
}


// ==================== MAIN APP ====================

export default function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [appData, setAppData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trainingMode, setTrainingMode] = useState(null);

  const tabs = [
    { label: 'اليوم', icon: '📅' },
    { label: 'تدريب', icon: '🏋️' },
    { label: 'الجمل', icon: '💬' },
    { label: 'التقدم', icon: '📊' },
  ];

  // Load data on mount
  useEffect(() => {
    (async () => {
      let data = await storage.get('appData');
      if (!data) {
        data = {
          startDate: new Date().toISOString().split('T')[0],
          completedDays: [],
          testResults: [],
          sentenceReps: {},
        };
        await storage.set('appData', data);
      }
      setAppData(data);
      setLoading(false);
    })();
  }, []);

  const saveData = async (newData) => {
    setAppData(newData);
    await storage.set('appData', newData);
  };

  if (loading) {
    return (
      <div style={{ ...baseStyles.app, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 24, color: COLORS.primary }}>جاري التحميل...</div>
      </div>
    );
  }

  const day = getDayOfProgram(appData.startDate);
  const week = getCurrentWeek(appData.startDate);
  const phase = getPhase(week);
  const seed = day * 31337;

  const handleTestComplete = async (pct) => {
    const newResults = [...(appData.testResults || []), { week, score: pct, date: new Date().toISOString() }];
    await saveData({ ...appData, testResults: newResults });
  };

  const markDayComplete = async () => {
    const today = new Date().toISOString().split('T')[0];
    if (!appData.completedDays.includes(today)) {
      await saveData({ ...appData, completedDays: [...appData.completedDays, today] });
    }
  };

  // ============ TAB: TODAY ============
  const renderToday = () => (
    <div>
      <div style={{ ...baseStyles.card, background: `linear-gradient(135deg, ${COLORS.primary}22, ${COLORS.secondary}22)`, border: `1px solid ${COLORS.primary}33` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 14, color: COLORS.textMuted }}>اليوم {day} — الأسبوع {week}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.primary }}>المرحلة {phase}</div>
          </div>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: `conic-gradient(${COLORS.primary} ${(day / 84) * 360}deg, ${COLORS.border} 0deg)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%', background: COLORS.card,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: COLORS.primary,
            }}>
              {Math.round((day / 84) * 100)}%
            </div>
          </div>
        </div>
        <ProgressBar pct={(day / 84) * 100} color={COLORS.primary} />
      </div>

      <ShadowingActivity phase={phase} />
      <ThinkAloudActivity day={day} />
      <StoryActivity day={day} />
      <MeetingSentencesActivity />
      <StoryOfDayActivity day={day} />

      <button onClick={markDayComplete} style={baseStyles.btn(COLORS.success)}>
        ✓ أنهيت تدريب اليوم
      </button>
    </div>
  );

  // ============ TAB: TRAINING ============
  const renderTraining = () => {
    if (trainingMode === 'meeting') return (
      <div>
        <button onClick={() => setTrainingMode(null)} style={{ ...baseStyles.btnSmall(COLORS.border), color: COLORS.text, marginBottom: 12 }}>
          ← رجوع
        </button>
        <MeetingSimulation seed={seed} />
      </div>
    );
    if (trainingMode === 'quick') return (
      <div>
        <button onClick={() => setTrainingMode(null)} style={{ ...baseStyles.btnSmall(COLORS.border), color: COLORS.text, marginBottom: 12 }}>
          ← رجوع
        </button>
        <QuickResponseExercise seed={seed} />
      </div>
    );
    if (trainingMode === 'fill') return (
      <div>
        <button onClick={() => setTrainingMode(null)} style={{ ...baseStyles.btnSmall(COLORS.border), color: COLORS.text, marginBottom: 12 }}>
          ← رجوع
        </button>
        <FillBlankExercise />
      </div>
    );
    if (trainingMode === 'build') return (
      <div>
        <button onClick={() => setTrainingMode(null)} style={{ ...baseStyles.btnSmall(COLORS.border), color: COLORS.text, marginBottom: 12 }}>
          ← رجوع
        </button>
        <SentenceBuildExercise />
      </div>
    );
    if (trainingMode === 'test') return (
      <div>
        <button onClick={() => setTrainingMode(null)} style={{ ...baseStyles.btnSmall(COLORS.border), color: COLORS.text, marginBottom: 12 }}>
          ← رجوع
        </button>
        <WeeklyTest week={week} onComplete={handleTestComplete} />
      </div>
    );

    const exercises = [
      { key: 'meeting', icon: '🎭', title: 'محاكاة اجتماع', desc: 'تدرب على مواقف الاجتماعات', color: COLORS.primary },
      { key: 'quick', icon: '⚡', title: 'استجابة سريعة', desc: 'رد بسرعة على المواقف اليومية', color: COLORS.secondary },
      { key: 'fill', icon: '📝', title: 'أكمل الفراغ', desc: 'اكتب الكلمات الناقصة من الجمل', color: COLORS.accent },
      { key: 'build', icon: '🧩', title: 'بناء جمل', desc: 'رتّب الكلمات لتكوين جمل صحيحة', color: COLORS.warning },
      { key: 'test', icon: '📊', title: 'الاختبار الأسبوعي', desc: `اختبار الأسبوع ${week}`, color: COLORS.success },
    ];

    return (
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>🏋️ التدريب</h2>
        {exercises.map(ex => (
          <button
            key={ex.key}
            onClick={() => setTrainingMode(ex.key)}
            style={{
              ...baseStyles.card,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              cursor: 'pointer',
              border: `1px solid ${ex.color}33`,
              width: '100%',
              textAlign: 'right',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ fontSize: 32 }}>{ex.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: ex.color }}>{ex.title}</div>
              <div style={{ fontSize: 12, color: COLORS.textMuted }}>{ex.desc}</div>
            </div>
            <div style={{ fontSize: 18, color: COLORS.textMuted }}>←</div>
          </button>
        ))}
      </div>
    );
  };

  // ============ TAB: SENTENCES ============
  const renderSentences = () => (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>💬 جمل الاجتماعات</h2>
      {meetingSentences.map((s, i) => (
        <div key={i} style={{
          ...baseStyles.card,
          padding: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%', background: COLORS.primary + '33',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: COLORS.primary, flexShrink: 0,
          }}>
            {i + 1}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ ...baseStyles.enText, fontSize: 13, lineHeight: 1.4 }}>{s.en}</div>
            <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>{s.ar}</div>
          </div>
        </div>
      ))}
    </div>
  );

  // ============ TAB: PROGRESS ============
  const renderProgress = () => {
    const completedCount = appData.completedDays?.length || 0;
    const totalDays = 84;
    const streakPct = Math.round((completedCount / totalDays) * 100);
    const testResults = appData.testResults || [];
    const lastResult = testResults.length > 0 ? testResults[testResults.length - 1] : null;
    const prevResult = testResults.length > 1 ? testResults[testResults.length - 2] : null;
    const improvement = lastResult && prevResult ? lastResult.score - prevResult.score : null;

    return (
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>📊 التقدم</h2>

        {/* Overview */}
        <div style={baseStyles.card}>
          <h3 style={baseStyles.cardTitle}>نظرة عامة</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ textAlign: 'center', padding: 12, background: COLORS.bg, borderRadius: 10 }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.primary }}>{day}</div>
              <div style={{ fontSize: 11, color: COLORS.textMuted }}>يوم في البرنامج</div>
            </div>
            <div style={{ textAlign: 'center', padding: 12, background: COLORS.bg, borderRadius: 10 }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.secondary }}>{completedCount}</div>
              <div style={{ fontSize: 11, color: COLORS.textMuted }}>يوم مكتمل</div>
            </div>
            <div style={{ textAlign: 'center', padding: 12, background: COLORS.bg, borderRadius: 10 }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.warning }}>{week}</div>
              <div style={{ fontSize: 11, color: COLORS.textMuted }}>الأسبوع الحالي</div>
            </div>
            <div style={{ textAlign: 'center', padding: 12, background: COLORS.bg, borderRadius: 10 }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.accent }}>{phase}</div>
              <div style={{ fontSize: 11, color: COLORS.textMuted }}>المرحلة</div>
            </div>
          </div>
          <ProgressBar pct={streakPct} />
          <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 4, textAlign: 'center' }}>
            {streakPct}% من البرنامج
          </div>
        </div>

        {/* Test Results */}
        <div style={baseStyles.card}>
          <h3 style={baseStyles.cardTitle}>📝 نتائج الاختبارات</h3>
          {testResults.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 20, color: COLORS.textMuted, fontSize: 13 }}>
              لم تُجرِ أي اختبار بعد. اذهب لتبويب التدريب وابدأ الاختبار الأسبوعي!
            </div>
          ) : (
            <>
              {/* Improvement badge */}
              {improvement !== null && (
                <div style={{
                  padding: 10,
                  borderRadius: 10,
                  marginBottom: 12,
                  background: improvement >= 0 ? COLORS.success + '22' : COLORS.danger + '22',
                  textAlign: 'center',
                }}>
                  <span style={{ fontSize: 20 }}>{improvement >= 0 ? '📈' : '📉'}</span>
                  <span style={{
                    fontSize: 16, fontWeight: 700, marginRight: 8,
                    color: improvement >= 0 ? COLORS.success : COLORS.danger,
                  }}>
                    {improvement >= 0 ? '+' : ''}{improvement}%
                  </span>
                  <span style={{ fontSize: 12, color: COLORS.textMuted }}>مقارنة بالاختبار السابق</span>
                </div>
              )}
              {/* Bar chart */}
              <BarChart
                data={testResults.map(r => r.score)}
                labels={testResults.map(r => `أ${r.week}`)}
              />
              {/* Results list */}
              <div style={{ marginTop: 12 }}>
                {testResults.map((r, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: i < testResults.length - 1 ? `1px solid ${COLORS.border}` : 'none',
                  }}>
                    <span style={{ fontSize: 13, color: COLORS.textMuted }}>الأسبوع {r.week}</span>
                    <span style={{
                      fontSize: 15, fontWeight: 700,
                      color: r.score >= 80 ? COLORS.success : r.score >= 50 ? COLORS.warning : COLORS.danger,
                    }}>
                      {r.score}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={baseStyles.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&family=Noto+Kufi+Arabic:wght@400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { margin: 0; background: ${COLORS.bg}; }
        button:active { transform: scale(0.97); }
        input:focus { outline: none; border-color: ${COLORS.primary} !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: ${COLORS.border}; border-radius: 2px; }
      `}</style>

      {/* Header */}
      <div style={baseStyles.header}>
        <h1 style={baseStyles.title}>🚀 اختراق حاجز الإنجليزية</h1>
        <p style={baseStyles.subtitle}>برنامج ١٢ أسبوع — ٣٥ دقيقة يومياً</p>
      </div>

      {/* Tabs */}
      <div style={baseStyles.tabs}>
        {tabs.map((t, i) => (
          <button
            key={i}
            onClick={() => { setActiveTab(i); setTrainingMode(null); }}
            style={baseStyles.tab(activeTab === i)}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 0 && renderToday()}
      {activeTab === 1 && renderTraining()}
      {activeTab === 2 && renderSentences()}
      {activeTab === 3 && renderProgress()}

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '20px 0 40px', fontSize: 11, color: COLORS.textMuted }}>
        💪 الاستمرارية هي السر — لا تتوقف!
      </div>
    </div>
  );
}
