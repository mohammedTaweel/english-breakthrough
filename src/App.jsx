import { useState, useEffect, useCallback, useRef } from "react";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;600;700;800&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  @keyframes pulse { 0%,100% { transform:scale(1); } 50% { transform:scale(1.06); } }
  @keyframes glow { 0%,100% { box-shadow:0 0 10px rgba(34,211,238,0.1); } 50% { box-shadow:0 0 25px rgba(34,211,238,0.2); } }
  @keyframes confDrop { 0% { transform:translateY(-100vh) rotate(0); opacity:1; } 100% { transform:translateY(100vh) rotate(720deg); opacity:0; } }
`;

const SHADOW_LINES = [
  ["Good morning everyone.", "Thank you for joining us today.", "Let me start with a quick update.", "I have a question about the timeline.", "Can we move to the next topic?", "I agree with that point.", "That sounds like a good plan.", "We need more time to review this.", "Let me check and get back to you.", "Let's schedule a follow-up meeting."],
  ["I will send the report by Friday.", "Could you repeat that please?", "The deadline is next Monday.", "I have a suggestion to make.", "We are on track to finish on time.", "I need your approval on this.", "Please let me know if you have questions.", "I will follow up with an email.", "Thank you for your time today.", "Let me share my thoughts on this."],
  ["Before we dive in, let me provide some context.", "We have seen significant improvement this quarter.", "The main challenge is resource allocation.", "I recommend a phased approach to this project.", "Based on the data, we should move forward.", "Let me summarize the action items.", "I want to make sure we are on the same page.", "Let us align on priorities for next quarter.", "Are there any concerns before we proceed?", "I believe this approach will deliver the best results."],
];
const STORIES = [
  { t: "اجتماع الاثنين", lines: ["Sarah walked into the conference room at nine.", "The team was already seated around the table.", "Good morning everyone, she said confidently.", "Today we need to discuss quarterly targets.", "The sales team exceeded expectations this month.", "However, challenges remain in the European market.", "I propose we allocate more resources to Berlin.", "After discussion, the team reached a consensus.", "Sarah closed by thanking everyone.", "The next meeting was set for Thursday."] },
  { t: "مقابلة العمل", lines: ["Ahmed prepared carefully for his interview.", "He reviewed the company products and news.", "Tell me about yourself, the interviewer began.", "Ahmed spoke about five years of experience.", "He mentioned specific successful projects.", "The interviewer was impressed by his preparation.", "What motivates you in your career, she asked.", "Building teams that deliver results, he said.", "Both sides felt the interview went well.", "Ahmed received an offer the following week."] },
  { t: "إطلاق المنتج", lines: ["The company worked toward this day for months.", "The new product was finally ready for launch.", "The CEO took the stage before hundreds of people.", "Welcome. Today marks an important milestone.", "We spent two years developing something innovative.", "Let me walk you through the key features.", "First, it is designed to be incredibly simple.", "Second, it integrates with existing tools.", "The audience responded with enthusiasm.", "By the end of the day, a thousand orders came in."] },
  { t: "العرض التقديمي", lines: ["Khalid prepared his presentation the night before.", "He practiced in front of the mirror three times.", "Good afternoon. Thank you for being here.", "Today I will cover three main topics.", "Let me start with our current market position.", "As you can see from the graph, sales are rising.", "Now let me address the challenges we face.", "The competition is getting stronger every quarter.", "However, I believe our strategy is solid.", "Any questions before I move to the next slide?"] },
  { t: "التفاوض مع العميل", lines: ["The client requested a meeting to discuss pricing.", "Omar arrived early and reviewed his numbers.", "Thank you for meeting with us on short notice.", "We really value the partnership between our companies.", "Let me walk you through the updated proposal.", "We have reduced costs by fifteen percent.", "In return, we ask for a longer contract term.", "The client asked several thoughtful questions.", "After an hour, both sides reached an agreement.", "Omar sent the signed contract that afternoon."] },
  { t: "أول يوم في الشركة", lines: ["It was Nora's first day at the new company.", "She arrived thirty minutes before the start time.", "The manager greeted her with a warm welcome.", "Let me introduce you to the rest of the team.", "Everyone was friendly and offered to help.", "Here is your desk and your login details.", "Take your time getting settled in today.", "Nora spent the morning reading company policies.", "By lunch, she already felt part of the team.", "She left the office feeling confident about her decision."] },
  { t: "حل مشكلة تقنية", lines: ["The system went down on a busy Monday morning.", "The IT team immediately started investigating.", "We need to identify the root cause quickly.", "After thirty minutes, they found the issue.", "A recent update had caused a conflict in the server.", "The team lead called an emergency meeting.", "Here is what happened and here is our fix.", "We will roll back the update and test again.", "By noon, the system was fully operational.", "The team documented the incident to prevent it in the future."] },
];
const PROMPTS = [
  { en: "Describe your morning routine", ar: "وصف روتينك الصباحي", starters: ["First, I usually...", "Then I...", "After that, I...", "Before leaving, I...", "By the time I get to work, I..."] },
  { en: "Talk about a decision you made this week", ar: "تكلم عن قرار اتخذته", starters: ["This week, I had to decide...", "The main options were...", "I chose to... because...", "Looking back, I think...", "What I learned from this is..."] },
  { en: "Explain your job to someone new", ar: "اشرح وظيفتك لشخص جديد", starters: ["I work as a... at...", "My main responsibility is...", "On a typical day, I...", "The most challenging part is...", "What I enjoy most is..."] },
  { en: "Describe a challenge at work", ar: "وصف تحدي في العمل", starters: ["Recently, we faced a problem with...", "The main issue was...", "We tried to solve it by...", "What helped the most was...", "In the end, we managed to..."] },
  { en: "Summarize a recent meeting", ar: "لخّص اجتماع حضرته", starters: ["Last week, we had a meeting about...", "The main topic was...", "Someone suggested that...", "We agreed to...", "The next step is..."] },
  { en: "Talk about what makes a good leader", ar: "صفات القائد الجيد", starters: ["In my opinion, a good leader...", "One important quality is...", "For example, my manager...", "I also believe that...", "The best leaders I've seen..."] },
  { en: "Describe your weekend plans", ar: "خططك لنهاية الأسبوع", starters: ["This weekend, I'm planning to...", "On Saturday morning, I...", "In the afternoon, I usually...", "If the weather is good, I...", "On Sunday, I like to..."] },
  { en: "Explain a project you work on", ar: "مشروع تشتغل عليه", starters: ["Currently, I'm working on...", "The goal of this project is...", "My role in the project is...", "The biggest challenge so far is...", "We expect to finish by..."] },
  { en: "Talk about a goal for this year", ar: "هدف تبي تحققه", starters: ["One of my goals this year is...", "The reason I chose this goal is...", "To achieve it, I need to...", "So far, I have...", "By the end of the year, I hope to..."] },
  { en: "Describe a typical workday", ar: "يوم عمل عادي", starters: ["I usually start my day at...", "The first thing I do is...", "Around midday, I...", "In the afternoon, I focus on...", "I usually finish work by..."] },
];
const PHRASES = [
  { cat: "فتح الاجتماع", icon: "🚀", items: ["Let's get started. Thank you all for joining.", "The purpose of today's meeting is to...", "Let's go through the agenda quickly.", "I'd like us to focus on three key points.", "Before we begin, any updates?"] },
  { cat: "طلب التوضيح", icon: "🔍", items: ["Could you elaborate on that?", "Let me make sure I understand correctly...", "Can you give me a specific example?", "I'm not sure I follow. Could you rephrase?", "Just to clarify, are you saying that...?"] },
  { cat: "إبداء الرأي", icon: "💡", items: ["I'd like to add something here.", "That's a valid point. I also think...", "I see it differently. From my perspective...", "I agree overall, but I have a concern.", "Let me push back on that slightly."] },
  { cat: "القرارات", icon: "✅", items: ["Let's move forward with this approach.", "Can we agree on the next steps?", "I'll take the action item on this.", "Let's take this offline.", "Who's responsible for the follow-up?"] },
  { cat: "عبارات إنقاذ", icon: "🛟", items: ["Sorry, I missed that. Could you repeat?", "Bear with me for a moment...", "That's interesting. Let me think about it.", "Can we come back to that in a moment?", "I'd like to park that idea for later."] },
];
const MOTIV = ["كل يوم تمارس فيه، عقلك يبني مسارات جديدة", "أنت ما فشلت — جربت الطريقة الغلط", "٣٥ دقيقة يومياً = معجزات في ٩٠ يوماً", "الجمل الجاهزة سلاحك السري", "لا تترجم — فكّر بالإنجليزي", "بعد ١٢ أسبوع ستدير اجتماعاتك بثقة", "كل مرة تتكلم لوحدك، لسانك يتحرر"];

const MEETINGS = [
  { title: "مراجعة المشروع", steps: [
    { speaker: "المدير", text: "Good morning team. Let's review the project status.", prompt: "افتح بتحديث سريع", opts: ["Let me give you a quick update on where we stand.", "I don't know what happened.", "Can we talk later?"], ans: 0 },
    { speaker: "زميلك", text: "We are behind schedule by two weeks. The client is asking for an update.", prompt: "اطلب توضيح", opts: ["Could you elaborate on what caused the delay?", "That's not my problem.", "Let's cancel the project."], ans: 0 },
    { speaker: "زميلك", text: "The development team needed more time for testing.", prompt: "اقترح حل", opts: ["I recommend we take a phased approach to get back on track.", "Just skip the testing.", "I have no idea what to do."], ans: 0 },
    { speaker: "المدير", text: "That sounds reasonable. What about the budget impact?", prompt: "أجب بثقة", opts: ["Based on my analysis, the additional cost is minimal.", "I didn't think about that.", "Money is not important."], ans: 0 },
    { speaker: "المدير", text: "Good. Let's wrap up. Any final thoughts?", prompt: "اختم الاجتماع", opts: ["Let me summarize: we'll take a phased approach and I'll send the updated timeline by Friday.", "No, nothing.", "I'm hungry, let's go."], ans: 0 },
  ]},
  { title: "مناقشة الميزانية", steps: [
    { speaker: "المدير", text: "We need to discuss the Q3 budget allocation.", prompt: "ابدأ بنقطة", opts: ["I'd like us to focus on three key areas today.", "I don't care about budgets.", "Whatever you decide is fine."], ans: 0 },
    { speaker: "زميلك", text: "I think we should increase marketing spend by 20 percent.", prompt: "وافق جزئياً", opts: ["I agree with the direction, but I have a concern about the timing.", "No way, that's too much.", "Sure, whatever."], ans: 0 },
    { speaker: "زميلك", text: "Why do you have concerns about timing?", prompt: "وضّح موقفك", opts: ["From my experience, launching in Q3 gives us better results than Q4.", "I just don't like it.", "I was just saying that."], ans: 0 },
    { speaker: "المدير", text: "Interesting point. Can we find a middle ground?", prompt: "اقترح حل وسط", opts: ["What if we start with a 10 percent increase and review after one month?", "No middle ground.", "You decide."], ans: 0 },
    { speaker: "المدير", text: "Good idea. Let's move forward with that.", prompt: "حدد الخطوات", opts: ["I'll take the action item on preparing the revised budget by Monday.", "OK bye.", "Someone else can do it."], ans: 0 },
  ]},
  { title: "تقييم الأداء", steps: [
    { speaker: "المدير", text: "Let's discuss the team performance this quarter.", prompt: "قدّم النتائج", opts: ["I'd like to walk you through the key metrics and highlights.", "The team is bad.", "I didn't prepare anything."], ans: 0 },
    { speaker: "المدير", text: "What about the drop in customer satisfaction scores?", prompt: "اعترف واقترح", opts: ["That's a valid concern. We've identified the root cause and have a plan.", "It's not our fault.", "I didn't notice that."], ans: 0 },
    { speaker: "زميلك", text: "I think we need more training for the support team.", prompt: "ادعم الفكرة وأضف", opts: ["I agree, and I'd also suggest we implement a weekly quality review.", "Training is a waste of time.", "Maybe, I'm not sure."], ans: 0 },
    { speaker: "المدير", text: "Who will lead this initiative?", prompt: "تحمّل المسؤولية", opts: ["I'll take the lead on this. Let me prepare a detailed plan.", "Not me.", "Ask someone else."], ans: 0 },
    { speaker: "المدير", text: "Great. Anything else before we close?", prompt: "اختم باحترافية", opts: ["I'll send the action items and timeline to everyone by end of day.", "Nope.", "Can I go now?"], ans: 0 },
  ]},
  { title: "التخطيط الاستراتيجي", steps: [
    { speaker: "المدير", text: "We need to set our priorities for next quarter.", prompt: "ابدأ بنقاطك", opts: ["I'd like to propose three key focus areas based on our data.", "I don't have any ideas.", "Just do what we did last time."], ans: 0 },
    { speaker: "زميلك", text: "I think we should invest more in customer retention.", prompt: "وافق وأضف", opts: ["That's a great point. I'd also add that we should improve onboarding.", "I disagree completely.", "Whatever you think."], ans: 0 },
    { speaker: "المدير", text: "How do we measure success for these initiatives?", prompt: "اقترح مقاييس", opts: ["I suggest we track three KPIs: retention rate, NPS score, and time to value.", "I don't know how to measure that.", "Numbers don't matter."], ans: 0 },
    { speaker: "زميلك", text: "That seems like a lot to take on. Can we prioritize?", prompt: "رتّب الأولويات", opts: ["You're right. Let's start with retention as our top priority and phase in the rest.", "We can do everything at once.", "Fine, forget all of it."], ans: 0 },
    { speaker: "المدير", text: "Sounds good. Let's finalize the plan.", prompt: "لخّص وحدد الخطوات", opts: ["To summarize: retention first, then onboarding. I'll share a detailed timeline by Wednesday.", "OK.", "Someone else can write it up."], ans: 0 },
  ]},
  { title: "حل خلاف بين فريقين", steps: [
    { speaker: "المدير", text: "There seems to be a disagreement between the two teams.", prompt: "اعترف بالمشكلة", opts: ["You're right. Let me provide some context on where the disconnect happened.", "There's no problem.", "It's their fault, not ours."], ans: 0 },
    { speaker: "زميلك", text: "We feel that the requirements keep changing without notice.", prompt: "تفهّم واعتذر", opts: ["I understand the frustration. We should have communicated the changes earlier.", "That's not true.", "Deal with it."], ans: 0 },
    { speaker: "المدير", text: "How can we prevent this from happening again?", prompt: "اقترح عملية", opts: ["I propose we set up a weekly sync meeting and a shared change log.", "I have no idea.", "Just be more careful."], ans: 0 },
    { speaker: "زميلك", text: "That could work. Who will own the change log?", prompt: "تطوّع", opts: ["I'll take ownership of the change log and make sure it's updated weekly.", "Not my responsibility.", "Someone else should do it."], ans: 0 },
    { speaker: "المدير", text: "Excellent. I'm glad we resolved this constructively.", prompt: "اختم بإيجابية", opts: ["Thank you everyone. Better communication will make us a stronger team.", "Finally this is over.", "Whatever."], ans: 0 },
  ]},
];

const QUICK_RESP = [
  { sit: "زميلك اقترح فكرة جديدة وتبي توافق وتضيف عليها", opts: ["That's a valid point. I also think we should consider the timeline.", "I don't care.", "Whatever you say.", "Can we talk later?"], ans: 0 },
  { sit: "ما فهمت اللي قاله المدير وتبي يعيد", opts: ["Sorry, I missed that. Could you repeat?", "What?", "I wasn't listening.", "Nevermind."], ans: 0 },
  { sit: "تبي تأجل موضوع فرعي والتركيز على الأهم", opts: ["Let's take this offline and follow up separately.", "Stop talking about this.", "This is boring.", "I don't want to discuss this."], ans: 0 },
  { sit: "تبي تنهي الاجتماع بتلخيص", opts: ["Let me quickly summarize what we agreed on.", "OK we're done.", "Finally it's over.", "Bye everyone."], ans: 0 },
  { sit: "تبي تعترض بأدب على اقتراح", opts: ["I see it differently. From my perspective...", "That's wrong.", "No way.", "Are you serious?"], ans: 0 },
  { sit: "تبي تتحمل مسؤولية مهمة", opts: ["I'll take the action item on this.", "Someone else should do it.", "I'm too busy.", "Not my job."], ans: 0 },
  { sit: "تبي تطلب مثال لتفهم أكثر", opts: ["Can you give me a specific example?", "I don't get it.", "This makes no sense.", "Explain better."], ans: 0 },
  { sit: "تحتاج وقت تفكير ولا تبي ترد بسرعة", opts: ["That's an interesting point. Let me think about it.", "Uhh... I don't know.", "Give me a minute.", "I have no opinion."], ans: 0 },
  { sit: "تبي تبدأ الاجتماع بشكل احترافي", opts: ["Let's get started. Thank you all for joining.", "OK let's go.", "Yalla.", "Are we starting or what?"], ans: 0 },
  { sit: "تبي تسأل مين المسؤول عن المتابعة", opts: ["Who's responsible for the follow-up on this?", "Who does what?", "Someone figure this out.", "I don't know who should do it."], ans: 0 },
];

const QUIZ_BANK = [
  { q: "زميلك يقول: 'We need to delay the launch.' — ماهو أفضل رد إذا تبي توافق جزئياً؟", opts: ["I agree with the direction, but I have a concern about the timeline.", "OK.", "That's a terrible idea.", "I don't care."], ans: 0 },
  { q: "المدير يسأل: 'Any updates?' — ماهو أفضل رد؟", opts: ["Let me give you a quick update on where we stand.", "Nothing new.", "Nope.", "I forgot."], ans: 0 },
  { q: "أي جملة تستخدمها لتأجيل موضوع فرعي؟", opts: ["Let's take this offline and follow up separately.", "Stop talking.", "This is not important.", "Forget it."], ans: 0 },
  { q: "كيف تطلب من شخص يعيد كلامه بأدب؟", opts: ["Sorry, I missed that. Could you repeat?", "What did you say?", "Talk louder.", "I wasn't paying attention."], ans: 0 },
  { q: "كيف تختم اجتماع باحترافية؟", opts: ["Let me summarize what we agreed on.", "OK bye.", "Meeting over.", "Finally done."], ans: 0 },
  { q: "كيف تقترح فكرة بديلة بأدب؟", opts: ["What if we considered a different approach?", "Your idea is bad.", "No.", "I have a better idea and yours is wrong."], ans: 0 },
  { q: "تبي تتحمل مهمة — ماذا تقول؟", opts: ["I'll take the action item on this.", "Someone else do it.", "Not my job.", "I'm busy."], ans: 0 },
  { q: "كيف تكسب وقت للتفكير في الاجتماع؟", opts: ["That's an interesting point. Let me think about it.", "Uhhh...", "Wait.", "I need time."], ans: 0 },
  { q: "كيف تبدأ اجتماع رسمي؟", opts: ["Let's get started. Thank you all for joining.", "Yalla.", "OK people.", "Start."], ans: 0 },
  { q: "كيف تطلب مثال توضيحي؟", opts: ["Can you give me a specific example?", "What?", "I don't get it.", "Say it again."], ans: 0 },
];

const DK = "eng-v10";
const gtd = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
const gdn = () => { const d = new Date(); return d.getDate() + d.getMonth() * 31 + d.getFullYear(); };
const gdow = () => new Date().getDay();
const getWk = (s) => { const x = Math.floor((new Date(gtd()) - new Date(s)) / 864e5); return x < 0 ? 0 : Math.min(Math.floor(x / 7) + 1, 12); };
const getPh = (w) => w <= 4 ? { n: 1, nm: "بناء الأساس", c: "#22d3ee", gap: 6 } : w <= 8 ? { n: 2, nm: "التسريع", c: "#a78bfa", gap: 4 } : { n: 3, nm: "الإطلاق", c: "#f59e0b", gap: 3 };
function shuffle(arr, seed) { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = (seed * (i + 1) * 9301 + 49297) % 233280; const k = Math.floor((j / 233280) * (i + 1)); [a[i], a[k]] = [a[k], a[i]]; } return a; }
function shuffleOpts(opts, correctIndex, seed) {
  const correct = opts[correctIndex];
  const indices = opts.map((_, i) => i);
  const shuffled = shuffle(indices, seed);
  return { opts: shuffled.map(i => opts[i]), correctIndex: shuffled.indexOf(correctIndex) };
}

function Prompter({ lines, gap, color, label }) {
  const [on, setOn] = useState(false);
  const [idx, setIdx] = useState(0);
  const [sec, setSec] = useState(0);
  const ref = useRef(null);
  const iRef = useRef(0);

  function stop() { clearInterval(ref.current); setOn(false); setIdx(0); setSec(0); iRef.current = 0; }
  function start() {
    stop(); setOn(true); setSec(gap); iRef.current = 0; let c = gap;
    ref.current = setInterval(() => {
      c--;
      if (c <= 0) {
        iRef.current++;
        if (iRef.current >= lines.length) { clearInterval(ref.current); setOn(false); setIdx(0); setSec(0); return; }
        setIdx(iRef.current);
        c = gap;
      }
      setSec(c);
    }, 1000);
  }
  useEffect(() => () => clearInterval(ref.current), []);

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center" }}>
        {!on ? (
          <button onClick={start} style={{ padding: "8px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg," + color + ",#06b6d4)", color: "#060a14", fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{"▶ ابدأ " + label}</button>
        ) : (
          <button onClick={stop} style={{ padding: "8px 20px", borderRadius: 10, border: "1px solid #1e293b", background: "transparent", color: "#64748b", fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>⏹ إيقاف</button>
        )}
        {on && sec > 0 && <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 22, fontWeight: 700, color: color }}>{sec}</div>}
        {on && sec > 0 && <div style={{ fontSize: 12, color: "#5a6a80" }}>ردّد بصوت عالٍ!</div>}
      </div>
      {lines.map((line, i) => {
        const cur = on && i === idx;
        const past = on && i < idx;
        return (
          <div key={i} style={{ padding: "10px 14px", borderRadius: 10, marginBottom: 4, fontFamily: "'IBM Plex Mono',monospace", fontSize: cur ? 16 : 14, direction: "ltr", textAlign: "left", lineHeight: 1.7, transition: "all .4s", background: cur ? color + "18" : "rgba(255,255,255,0.015)", border: "1px solid " + (cur ? color + "40" : "rgba(255,255,255,0.04)"), color: cur ? "#fff" : past ? "#3a4a5c" : "#94a3b8", fontWeight: cur ? 600 : 400, transform: cur ? "scale(1.01)" : "none" }}>
            {line}
            {cur && <span style={{ marginRight: 8, fontSize: 12, color: color }}> ← اقرأ!</span>}
          </div>
        );
      })}
    </div>
  );
}

function MeetingSim() {
  const [mi, setMi] = useState(0);
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const m = MEETINGS[mi];
  const raw = m.steps[step];
  const { opts: sOpts, correctIndex: sAns } = shuffleOpts(raw.opts, raw.ans, mi * 1000 + step * 7 + 31);
  const s = { ...raw, opts: sOpts, ans: sAns };
  function pick(oi) { setPicked(oi); if (oi === s.ans) setScore(score + 1); }
  function next() { if (step + 1 >= m.steps.length) { setDone(true); return; } setStep(step + 1); setPicked(null); }
  function restart() { setMi((mi + 1) % MEETINGS.length); setStep(0); setPicked(null); setScore(0); setDone(false); }
  if (done) return (
    <div style={{ textAlign: "center", padding: 20, animation: "fadeUp .4s" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
      <div style={{ fontSize: 20, fontWeight: 800, color: "#22d3ee", marginBottom: 8 }}>{score}/{m.steps.length}</div>
      <div style={{ fontSize: 14, color: "#8892a4", marginBottom: 16 }}>{score === m.steps.length ? "ممتاز! أدرت الاجتماع باحترافية كاملة" : score >= 3 ? "جيد! تقدم واضح" : "تحتاج تمرين أكثر على الجمل الجاهزة"}</div>
      <button onClick={restart} style={{ padding: "8px 20px", borderRadius: 10, border: "none", background: "#22d3ee", color: "#060a14", fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>🔄 اجتماع جديد</button>
    </div>
  );
  return (
    <div style={{ animation: "fadeUp .4s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#22d3ee" }}>{"🎭 " + m.title}</div>
        <div style={{ fontSize: 12, color: "#5a6a80" }}>{"خطوة " + (step + 1) + "/" + m.steps.length}</div>
      </div>
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 14, marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: "#f59e0b", marginBottom: 4 }}>{"💬 " + s.speaker + ":"}</div>
        <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 15, direction: "ltr", textAlign: "left", lineHeight: 1.7, color: "#e0e7f1" }}>{s.text}</div>
      </div>
      <div style={{ fontSize: 12, color: "#a78bfa", fontWeight: 600, marginBottom: 8 }}>{"🎯 " + s.prompt + " — اختر الرد الأنسب واقرأه بصوت عالٍ:"}</div>
      {s.opts.map((o, oi) => {
        const show = picked !== null;
        const isCorrect = oi === s.ans;
        const isPicked = picked === oi;
        let bg = "rgba(255,255,255,0.02)", brd = "rgba(255,255,255,0.04)";
        if (show && isCorrect) { bg = "rgba(52,211,153,0.1)"; brd = "rgba(52,211,153,0.3)"; }
        else if (show && isPicked && !isCorrect) { bg = "rgba(239,68,68,0.1)"; brd = "rgba(239,68,68,0.3)"; }
        return (
          <div key={oi} onClick={() => picked === null && pick(oi)} style={{ padding: 12, borderRadius: 10, marginBottom: 6, cursor: picked === null ? "pointer" : "default", fontFamily: "'IBM Plex Mono'", fontSize: 14, direction: "ltr", textAlign: "left", lineHeight: 1.6, background: bg, border: "1px solid " + brd, transition: ".3s", opacity: show && !isCorrect && !isPicked ? 0.3 : 1 }}>
            {o}
            {show && isCorrect && <span style={{ marginRight: 8, fontSize: 12, color: "#34d399" }}> ✓ صحيح — اقرأها بصوت عالٍ!</span>}
            {show && isPicked && !isCorrect && <span style={{ marginRight: 8, fontSize: 12, color: "#ef4444" }}> ✗</span>}
          </div>
        );
      })}
      {picked !== null && <div style={{ textAlign: "center", marginTop: 10 }}><button onClick={next} style={{ padding: "8px 20px", borderRadius: 10, border: "none", background: "#22d3ee", color: "#060a14", fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{step + 1 >= m.steps.length ? "🏁 النتيجة" : "التالي ←"}</button></div>}
    </div>
  );
}

function QuickResp() {
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(10);
  const [total, setTotal] = useState(0);
  const [done, setDone] = useState(false);
  const tRef = useRef(null);
  const qs = useRef(shuffle(QUICK_RESP, gdn()).slice(0, 8));
  function startTimer() { setTimer(10); clearInterval(tRef.current); tRef.current = setInterval(() => setTimer(p => { if (p <= 1) { clearInterval(tRef.current); return 0; } return p - 1; }), 1000); }
  function pick(oi) { clearInterval(tRef.current); setPicked(oi); const { correctIndex } = shuffleOpts(qs.current[qi].opts, qs.current[qi].ans, qi * 13 + 47); if (oi === correctIndex) setScore(score + 1); setTotal(total + 1); }
  function next() { if (qi + 1 >= qs.current.length) { setDone(true); return; } setQi(qi + 1); setPicked(null); startTimer(); }
  function restart() { qs.current = shuffle(QUICK_RESP, Date.now()); setQi(0); setPicked(null); setScore(0); setTotal(0); setDone(false); startTimer(); }
  useEffect(() => { startTimer(); return () => clearInterval(tRef.current); }, []);
  if (done) return (
    <div style={{ textAlign: "center", padding: 20, animation: "fadeUp .4s" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>⚡</div>
      <div style={{ fontSize: 24, fontWeight: 800, color: "#f59e0b", marginBottom: 8 }}>{score}/{total}</div>
      <div style={{ fontSize: 14, color: "#8892a4", marginBottom: 16 }}>{score >= 7 ? "سريع وحاسم! 🔥" : score >= 5 ? "جيد! السرعة تتحسن" : "تحتاج تحفظ الجمل أكثر"}</div>
      <button onClick={restart} style={{ padding: "8px 20px", borderRadius: 10, border: "none", background: "#f59e0b", color: "#060a14", fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>🔄 جولة جديدة</button>
    </div>
  );
  const rawQ = qs.current[qi];
  const { opts: qOpts, correctIndex: qAns } = shuffleOpts(rawQ.opts, rawQ.ans, qi * 13 + 47);
  const q = { ...rawQ, opts: qOpts, ans: qAns };
  return (
    <div style={{ animation: "fadeUp .4s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ fontSize: 12, color: "#5a6a80" }}>{"سؤال " + (qi + 1) + "/" + qs.current.length}</div>
        <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 18, fontWeight: 700, color: timer <= 3 ? "#ef4444" : "#f59e0b" }}>{timer > 0 && picked === null ? timer + "s" : ""}</div>
      </div>
      <div style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.12)", borderRadius: 12, padding: 14, marginBottom: 12 }}>
        <div style={{ fontSize: 14, color: "#e0e7f1", lineHeight: 1.8 }}>{"🎯 " + q.sit}</div>
      </div>
      {q.opts.map((o, oi) => {
        const show = picked !== null;
        const isCorrect = oi === q.ans;
        const isPicked = picked === oi;
        let bg = "rgba(255,255,255,0.02)", brd = "rgba(255,255,255,0.04)";
        if (show && isCorrect) { bg = "rgba(52,211,153,0.1)"; brd = "rgba(52,211,153,0.3)"; }
        else if (show && isPicked && !isCorrect) { bg = "rgba(239,68,68,0.1)"; brd = "rgba(239,68,68,0.3)"; }
        return <div key={oi} onClick={() => !show && pick(oi)} style={{ padding: 11, borderRadius: 10, marginBottom: 5, cursor: show ? "default" : "pointer", fontFamily: "'IBM Plex Mono'", fontSize: 13, direction: "ltr", textAlign: "left", lineHeight: 1.6, background: bg, border: "1px solid " + brd, opacity: show && !isCorrect && !isPicked ? 0.3 : 1 }}>
          {o}{show && isCorrect && <span style={{ color: "#34d399", fontSize: 11 }}> ✓ اقرأها!</span>}
        </div>;
      })}
      {(picked !== null || timer === 0) && <div style={{ textAlign: "center", marginTop: 10 }}>
        {timer === 0 && picked === null && <div style={{ color: "#ef4444", fontSize: 13, marginBottom: 8 }}>⏰ انتهى الوقت!</div>}
        <button onClick={() => { if (timer === 0 && picked === null) { setTotal(total + 1); } next(); }} style={{ padding: "8px 20px", borderRadius: 10, border: "none", background: "#f59e0b", color: "#060a14", fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>التالي ←</button>
      </div>}
    </div>
  );
}

function WeeklyQuiz({ onSave }) {
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [prevPct, setPrevPct] = useState(null);
  const qs = useRef(shuffle(QUIZ_BANK, gdn()).slice(0, 10));
  const saved = useRef(false);
  function pick(oi) { setPicked(oi); const { correctIndex } = shuffleOpts(qs.current[qi].opts, qs.current[qi].ans, qi * 17 + 59); if (oi === correctIndex) setScore(score + 1); }
  function next() { if (qi + 1 >= qs.current.length) { setDone(true); return; } setQi(qi + 1); setPicked(null); }
  function restart() { qs.current = shuffle(QUIZ_BANK, Date.now()); setQi(0); setPicked(null); setScore(0); setDone(false); saved.current = false; setPrevPct(null); }
  useEffect(() => {
    if (done && !saved.current) {
      saved.current = true;
      const pct = Math.round((score / qs.current.length) * 100);
      (async () => {
        try {
          const r = await window.storage.get("quiz-results");
          const results = r && r.value ? JSON.parse(r.value) : [];
          if (results.length > 0) setPrevPct(results[results.length - 1].pct);
          results.push({ date: gtd(), pct, score, total: qs.current.length });
          await window.storage.set("quiz-results", JSON.stringify(results));
          if (onSave) onSave();
        } catch (e) {}
      })();
    }
  }, [done, score, onSave]);
  if (done) {
    const pct = Math.round((score / qs.current.length) * 100);
    const diff = prevPct !== null ? pct - prevPct : null;
    return (
      <div style={{ textAlign: "center", padding: 20, animation: "fadeUp .4s" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: pct >= 80 ? "#34d399" : pct >= 50 ? "#f59e0b" : "#ef4444", marginBottom: 4 }}>{pct + "%"}</div>
        <div style={{ fontSize: 16, color: "#8892a4", marginBottom: 4 }}>{score + "/" + qs.current.length}</div>
        {diff !== null && <div style={{ fontSize: 14, fontWeight: 700, color: diff >= 0 ? "#34d399" : "#ef4444", marginBottom: 4 }}>{diff >= 0 ? "📈 +" + diff + "% عن الاختبار السابق" : "📉 " + diff + "% عن الاختبار السابق"}</div>}
        <div style={{ fontSize: 14, color: "#8892a4", marginBottom: 16 }}>{pct >= 80 ? "ممتاز! الجمل صارت جزء منك 🔥" : pct >= 50 ? "جيد! استمر في مراجعة الجمل يومياً" : "ركّز أكثر على بنك الجمل — راجعها يومياً"}</div>
        <button onClick={restart} style={{ padding: "8px 20px", borderRadius: 10, border: "none", background: "#a78bfa", color: "#fff", fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>🔄 اختبار جديد</button>
      </div>
    );
  }
  const rawQz = qs.current[qi];
  const { opts: qzOpts, correctIndex: qzAns } = shuffleOpts(rawQz.opts, rawQz.ans, qi * 17 + 59);
  const q = { ...rawQz, opts: qzOpts, ans: qzAns };
  return (
    <div style={{ animation: "fadeUp .4s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ fontSize: 12, color: "#5a6a80" }}>{"سؤال " + (qi + 1) + "/10"}</div>
        <div style={{ fontSize: 12, color: "#a78bfa", fontWeight: 600 }}>{score + " صحيح"}</div>
      </div>
      <div style={{ background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.12)", borderRadius: 12, padding: 14, marginBottom: 12 }}>
        <div style={{ fontSize: 14, color: "#e0e7f1", lineHeight: 1.8 }}>{q.q}</div>
      </div>
      {q.opts.map((o, oi) => {
        const show = picked !== null;
        const isCorrect = oi === q.ans;
        const isPicked = picked === oi;
        let bg = "rgba(255,255,255,0.02)", brd = "rgba(255,255,255,0.04)";
        if (show && isCorrect) { bg = "rgba(52,211,153,0.1)"; brd = "rgba(52,211,153,0.3)"; }
        else if (show && isPicked && !isCorrect) { bg = "rgba(239,68,68,0.1)"; brd = "rgba(239,68,68,0.3)"; }
        return <div key={oi} onClick={() => !show && pick(oi)} style={{ padding: 11, borderRadius: 10, marginBottom: 5, cursor: show ? "default" : "pointer", fontFamily: "'IBM Plex Mono'", fontSize: 13, direction: "ltr", textAlign: "left", lineHeight: 1.6, background: bg, border: "1px solid " + brd, opacity: show && !isCorrect && !isPicked ? 0.3 : 1 }}>
          {o}{show && isCorrect && <span style={{ color: "#34d399", fontSize: 11 }}> ✓</span>}
        </div>;
      })}
      {picked !== null && <div style={{ textAlign: "center", marginTop: 10 }}><button onClick={next} style={{ padding: "8px 20px", borderRadius: 10, border: "none", background: "#a78bfa", color: "#fff", fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{qi + 1 >= qs.current.length ? "🏁 النتيجة" : "التالي ←"}</button></div>}
    </div>
  );
}

const FILL_BLANKS = [
  { full: "Let me give you a quick update on where we stand.", blanks: ["quick", "update"] },
  { full: "Could you elaborate on that?", blanks: ["elaborate"] },
  { full: "I'd like to add something here.", blanks: ["add", "something"] },
  { full: "Let's move forward with this approach.", blanks: ["move", "forward"] },
  { full: "Sorry, I missed that. Could you repeat?", blanks: ["missed", "repeat"] },
  { full: "I agree with the direction, but I have a concern.", blanks: ["agree", "concern"] },
  { full: "Let me summarize what we agreed on.", blanks: ["summarize", "agreed"] },
  { full: "I'll take the action item on this.", blanks: ["action", "item"] },
  { full: "That's an interesting point. Let me think about it.", blanks: ["interesting", "think"] },
  { full: "Can you give me a specific example?", blanks: ["specific", "example"] },
  { full: "From my experience, this approach works better.", blanks: ["experience", "approach"] },
  { full: "Let's take this offline and follow up separately.", blanks: ["offline", "separately"] },
  { full: "I recommend we take a phased approach.", blanks: ["recommend", "phased"] },
  { full: "Who's responsible for the follow-up on this?", blanks: ["responsible", "follow-up"] },
  { full: "What if we considered a different approach?", blanks: ["considered", "different"] },
];

function FillBlank() {
  const [qi, setQi] = useState(0);
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const qs = useRef(shuffle(FILL_BLANKS, gdn()).slice(0, 8));

  function getSentenceWithBlanks(item) {
    let sentence = item.full;
    const parts = [];
    let remaining = sentence;
    item.blanks.forEach((blank, bi) => {
      const idx = remaining.toLowerCase().indexOf(blank.toLowerCase());
      if (idx >= 0) {
        parts.push({ type: "text", value: remaining.slice(0, idx) });
        parts.push({ type: "blank", index: bi, word: blank });
        remaining = remaining.slice(idx + blank.length);
      }
    });
    if (remaining) parts.push({ type: "text", value: remaining });
    return parts;
  }

  function check() {
    setChecked(true);
    const item = qs.current[qi];
    let correct = 0;
    item.blanks.forEach((blank, bi) => {
      if ((answers[bi] || "").trim().toLowerCase() === blank.toLowerCase()) correct++;
    });
    if (correct === item.blanks.length) setScore(score + 1);
  }

  function next() {
    if (qi + 1 >= qs.current.length) { setDone(true); return; }
    setQi(qi + 1); setAnswers({}); setChecked(false);
  }

  function restart() { qs.current = shuffle(FILL_BLANKS, Date.now()); setQi(0); setAnswers({}); setChecked(false); setScore(0); setDone(false); }

  if (done) return (
    <div style={{ textAlign: "center", padding: 20, animation: "fadeUp .4s" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>📝</div>
      <div style={{ fontSize: 24, fontWeight: 800, color: score >= 6 ? "#34d399" : score >= 4 ? "#f59e0b" : "#ef4444", marginBottom: 8 }}>{score + "/" + qs.current.length}</div>
      <div style={{ fontSize: 14, color: "#8892a4", marginBottom: 16 }}>{score >= 6 ? "ممتاز! ذاكرتك قوية 🔥" : score >= 4 ? "جيد! استمر في المراجعة" : "راجع الجمل أكثر"}</div>
      <button onClick={restart} style={{ padding: "8px 20px", borderRadius: 10, border: "none", background: "#06b6d4", color: "#060a14", fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>🔄 جولة جديدة</button>
    </div>
  );

  const item = qs.current[qi];
  const parts = getSentenceWithBlanks(item);

  return (
    <div style={{ animation: "fadeUp .4s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ fontSize: 12, color: "#5a6a80" }}>{"سؤال " + (qi + 1) + "/" + qs.current.length}</div>
        <div style={{ fontSize: 12, color: "#06b6d4", fontWeight: 600 }}>{score + " صحيح"}</div>
      </div>
      <div style={{ background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.12)", borderRadius: 12, padding: 16, marginBottom: 12 }}>
        <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 15, direction: "ltr", textAlign: "left", lineHeight: 2.2, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 4 }}>
          {parts.map((p, pi) => p.type === "text" ? (
            <span key={pi} style={{ color: "#e0e7f1" }}>{p.value}</span>
          ) : (
            <span key={pi} style={{ display: "inline-block" }}>
              <input
                type="text"
                value={answers[p.index] || ""}
                onChange={(e) => !checked && setAnswers({ ...answers, [p.index]: e.target.value })}
                style={{
                  width: Math.max(p.word.length * 11, 60),
                  padding: "4px 8px", borderRadius: 6, fontSize: 14,
                  fontFamily: "'IBM Plex Mono'", textAlign: "center",
                  background: checked ? ((answers[p.index] || "").trim().toLowerCase() === p.word.toLowerCase() ? "rgba(52,211,153,0.15)" : "rgba(239,68,68,0.15)") : "rgba(255,255,255,0.06)",
                  border: "1px solid " + (checked ? ((answers[p.index] || "").trim().toLowerCase() === p.word.toLowerCase() ? "rgba(52,211,153,0.4)" : "rgba(239,68,68,0.4)") : "rgba(6,182,212,0.3)"),
                  color: "#fff", outline: "none"
                }}
                placeholder="..."
                disabled={checked}
              />
              {checked && (answers[p.index] || "").trim().toLowerCase() !== p.word.toLowerCase() && (
                <div style={{ fontSize: 11, color: "#34d399", textAlign: "center" }}>{p.word}</div>
              )}
            </span>
          ))}
        </div>
      </div>
      {!checked ? (
        <div style={{ textAlign: "center" }}>
          <button onClick={check} style={{ padding: "8px 20px", borderRadius: 10, border: "none", background: "#06b6d4", color: "#060a14", fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>✓ تحقق</button>
        </div>
      ) : (
        <div style={{ textAlign: "center" }}>
          <button onClick={next} style={{ padding: "8px 20px", borderRadius: 10, border: "none", background: "#06b6d4", color: "#060a14", fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{qi + 1 >= qs.current.length ? "🏁 النتيجة" : "التالي ←"}</button>
        </div>
      )}
    </div>
  );
}

const SENTENCE_BUILD = [
  "Let me give you a quick update.",
  "Could you elaborate on that point?",
  "I agree with the overall direction.",
  "Let's move forward with this approach.",
  "I'll take the action item on this.",
  "Can we come back to that later?",
  "Let me summarize what we agreed on.",
  "I'd like to suggest a different approach.",
  "Who is responsible for the follow-up?",
  "That's a valid point to consider.",
  "Sorry I missed that. Could you repeat?",
  "Let's take this offline and discuss separately.",
  "I recommend we take a phased approach.",
  "Based on the data we should move forward.",
  "I want to make sure we are aligned.",
];

function SentenceBuild() {
  const [qi, setQi] = useState(0);
  const [selected, setSelected] = useState([]);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const qs = useRef(shuffle(SENTENCE_BUILD, gdn()).slice(0, 8));

  function getWords(sentence) {
    return sentence.replace(/[.,!?]/g, "").split(" ").filter(Boolean);
  }

  const words = getWords(qs.current[qi]);
  const shuffledWords = useRef(shuffle(words, qi * 31 + 11));

  useEffect(() => {
    shuffledWords.current = shuffle(getWords(qs.current[qi]), qi * 31 + 11);
  }, [qi]);

  function toggleWord(wi) {
    if (checked) return;
    if (selected.includes(wi)) {
      setSelected(selected.filter(i => i !== wi));
    } else {
      setSelected([...selected, wi]);
    }
  }

  function check() {
    setChecked(true);
    const builtSentence = selected.map(i => shuffledWords.current[i]).join(" ").toLowerCase();
    const correctSentence = words.join(" ").toLowerCase();
    if (builtSentence === correctSentence) setScore(score + 1);
  }

  function next() {
    if (qi + 1 >= qs.current.length) { setDone(true); return; }
    setQi(qi + 1); setSelected([]); setChecked(false);
  }

  function restart() {
    qs.current = shuffle(SENTENCE_BUILD, Date.now());
    setQi(0); setSelected([]); setChecked(false); setScore(0); setDone(false);
  }

  if (done) return (
    <div style={{ textAlign: "center", padding: 20, animation: "fadeUp .4s" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🧩</div>
      <div style={{ fontSize: 24, fontWeight: 800, color: score >= 6 ? "#34d399" : score >= 4 ? "#f59e0b" : "#ef4444", marginBottom: 8 }}>{score + "/" + qs.current.length}</div>
      <div style={{ fontSize: 14, color: "#8892a4", marginBottom: 16 }}>{score >= 6 ? "ممتاز! تركيب الجمل صار سهل 🔥" : score >= 4 ? "جيد! تحسن واضح" : "تمرّن أكثر على ترتيب الكلمات"}</div>
      <button onClick={restart} style={{ padding: "8px 20px", borderRadius: 10, border: "none", background: "#10b981", color: "#060a14", fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>🔄 جولة جديدة</button>
    </div>
  );

  const builtSentence = selected.map(i => shuffledWords.current[i]).join(" ").toLowerCase();
  const correctSentence = words.join(" ").toLowerCase();
  const isCorrect = checked && builtSentence === correctSentence;

  return (
    <div style={{ animation: "fadeUp .4s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ fontSize: 12, color: "#5a6a80" }}>{"سؤال " + (qi + 1) + "/" + qs.current.length}</div>
        <div style={{ fontSize: 12, color: "#10b981", fontWeight: 600 }}>{score + " صحيح"}</div>
      </div>
      <div style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.12)", borderRadius: 12, padding: 14, marginBottom: 12, minHeight: 50 }}>
        <div style={{ fontSize: 12, color: "#10b981", fontWeight: 600, marginBottom: 8 }}>🔗 الجملة المُركّبة:</div>
        <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 15, direction: "ltr", textAlign: "left", lineHeight: 1.8, color: checked ? (isCorrect ? "#34d399" : "#ef4444") : "#e0e7f1", minHeight: 24 }}>
          {selected.length > 0 ? selected.map(i => shuffledWords.current[i]).join(" ") : <span style={{ color: "#3a4a5c" }}>اضغط على الكلمات بالترتيب الصحيح...</span>}
        </div>
        {checked && !isCorrect && <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 13, direction: "ltr", textAlign: "left", lineHeight: 1.8, color: "#34d399", marginTop: 8 }}>{"✓ " + qs.current[qi]}</div>}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
        {shuffledWords.current.map((w, wi) => {
          const isSelected = selected.includes(wi);
          return (
            <button key={wi} onClick={() => toggleWord(wi)} style={{
              padding: "8px 14px", borderRadius: 8,
              fontFamily: "'IBM Plex Mono'", fontSize: 14,
              border: "1px solid " + (isSelected ? "rgba(16,185,129,0.4)" : "rgba(255,255,255,0.08)"),
              background: isSelected ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.03)",
              color: isSelected ? "#34d399" : "#e0e7f1",
              cursor: checked ? "default" : "pointer",
              opacity: isSelected ? 0.5 : 1,
              transition: ".2s"
            }}>{w}</button>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        {!checked && selected.length > 0 && <button onClick={() => setSelected([])} style={{ padding: "8px 16px", borderRadius: 10, border: "1px solid #1e293b", background: "transparent", color: "#64748b", fontFamily: "inherit", fontSize: 12, cursor: "pointer" }}>↻ مسح</button>}
        {!checked ? (
          <button onClick={check} disabled={selected.length === 0} style={{ padding: "8px 20px", borderRadius: 10, border: "none", background: selected.length > 0 ? "#10b981" : "#1e293b", color: selected.length > 0 ? "#060a14" : "#4a5568", fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: selected.length > 0 ? "pointer" : "default" }}>✓ تحقق</button>
        ) : (
          <button onClick={next} style={{ padding: "8px 20px", borderRadius: 10, border: "none", background: "#10b981", color: "#060a14", fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{qi + 1 >= qs.current.length ? "🏁 النتيجة" : "التالي ←"}</button>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [store, setStore] = useState({ start: null, days: {} });
  const [tab, setTab] = useState("today");
  const [loading, setLoading] = useState(true);
  const [openTask, setOpenTask] = useState(null);
  const [tmOn, setTmOn] = useState(false);
  const [tmSec, setTmSec] = useState(0);
  const [tmMax, setTmMax] = useState(0);
  const [conf, setConf] = useState(false);
  const [pCat, setPCat] = useState(0);
  const [reps, setReps] = useState({});
  const [trainMode, setTrainMode] = useState(null);
  const [quizResults, setQuizResults] = useState(null);
  const tmRef = useRef(null);

  useEffect(() => {
    (async () => {
      try { const r = await window.storage.get(DK); if (r && r.value) setStore(JSON.parse(r.value)); } catch (e) {}
      try { const r = await window.storage.get("quiz-results"); if (r && r.value) setQuizResults(JSON.parse(r.value)); } catch (e) {}
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (quizResults === null && !loading) {
      (async () => { try { const r = await window.storage.get("quiz-results"); if (r && r.value) setQuizResults(JSON.parse(r.value)); else setQuizResults([]); } catch (e) { setQuizResults([]); } })();
    }
  }, [quizResults, loading]);

  const save = useCallback(async (s) => { setStore(s); try { await window.storage.set(DK, JSON.stringify(s)); } catch (e) {} }, []);
  const today = gtd();
  const done = store.days[today] || [];
  const toggle = useCallback((id) => {
    const d = store.days[today] || [];
    const nd = d.includes(id) ? d.filter(x => x !== id) : [...d, id];
    save({ ...store, days: { ...store.days, [today]: nd } });
    if (!d.includes(id) && nd.length >= 5) { setConf(true); setTimeout(() => setConf(false), 3000); }
  }, [store, save, today]);
  const startTm = useCallback((m) => {
    if (tmRef.current) clearInterval(tmRef.current);
    setTmMax(m * 60); setTmSec(0); setTmOn(true);
    tmRef.current = setInterval(() => { setTmSec(p => { if (p + 1 >= m * 60) { clearInterval(tmRef.current); setTmOn(false); return m * 60; } return p + 1; }); }, 1000);
  }, []);

  if (loading) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#060a14", fontFamily: "'Noto Kufi Arabic',sans-serif" }}><style>{CSS}</style><div style={{ textAlign: "center", color: "#fff" }}><div style={{ fontSize: 40, animation: "pulse 1.5s infinite" }}>🎯</div><div style={{ fontSize: 14, opacity: 0.5, marginTop: 8 }}>جاري التحميل...</div></div></div>;

  if (!store.start) return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "#060a14", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Noto Kufi Arabic',sans-serif" }}>
      <style>{CSS}</style>
      <div style={{ textAlign: "center", padding: 32, animation: "fadeUp 1s" }}>
        <div style={{ fontSize: 56, marginBottom: 16, animation: "pulse 2s infinite" }}>🎯</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, background: "linear-gradient(135deg,#22d3ee,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1.5 }}>اختراق حاجز الإنجليزية</h1>
        <p style={{ fontSize: 14, color: "#5a6a80", marginBottom: 32, lineHeight: 1.8 }}>١٢ أسبوعاً — ٣٥ دقيقة يومياً — كل شيء هنا</p>
        <button onClick={() => save({ ...store, start: gtd() })} style={{ padding: "13px 40px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#22d3ee,#06b6d4)", color: "#060a14", fontFamily: "inherit", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>ابدأ رحلتك 🚀</button>
      </div>
    </div>
  );

  const wk = getWk(store.start), ph = getPh(wk), dn = gdn(), dw = gdow();
  const pct = Math.round((done.length / 5) * 100);
  const tp = PROMPTS[dn % PROMPTS.length];
  const shadow = SHADOW_LINES[ph.n - 1];
  const story = STORIES[dn % STORIES.length];
  const story2 = STORIES[(dn + 2) % STORIES.length];
  const pc = PHRASES[dn % PHRASES.length];
  const spLbl = ph.n === 1 ? "بطيء 🐢" : ph.n === 2 ? "متوسط 🚶" : "طبيعي 🏃";
  const tasks = [
    { id: "shadow", ic: "🎧", nm: "تقنية الظل", dur: 15 },
    { id: "think", ic: "🗣️", nm: "تفكير بصوت عالٍ", dur: 10 },
    { id: "passive", ic: "📻", nm: "قراءة قصة", dur: 15 },
    { id: "phrases", ic: "💬", nm: "مراجعة ٥ جمل", dur: 10 },
    { id: "watch", ic: "🎬", nm: "قصة اليوم", dur: 15 },
  ];
  const Card = ({ children, s }) => <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: 18, marginBottom: 12, animation: "fadeUp .4s", ...s }}>{children}</div>;

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "#060a14", color: "#e0e7f1", fontFamily: "'Noto Kufi Arabic',sans-serif" }}>
      <style>{CSS}</style>
      {conf && <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 100 }}>{Array.from({ length: 25 }).map((_, i) => <div key={i} style={{ position: "absolute", top: 0, left: Math.random() * 100 + "%", width: 7, height: 7, background: ["#22d3ee", "#a78bfa", "#f59e0b", "#34d399"][i % 4], borderRadius: "50%", animation: "confDrop " + (2 + Math.random() * 2) + "s linear " + Math.random() * 0.5 + "s forwards" }} />)}</div>}

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 14px" }}>
        <div style={{ padding: "16px 0 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 800, background: "linear-gradient(135deg,#22d3ee,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>اختراق حاجز الإنجليزية</h1>
            <div style={{ fontSize: 11, color: "#4a5568", marginTop: 2 }}>{"أسبوع " + wk + "/12 — " + ph.nm + " — " + spLbl}</div>
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: ph.c, fontFamily: "'IBM Plex Mono'" }}>{pct + "%"}</div>
        </div>

        <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.04)", marginBottom: 14 }}>
          {[["today", "📋 اليوم"], ["train", "🎭 تدريب"], ["phrases", "💬 الجمل"], ["progress", "📊 التقدم"]].map(([id, l]) => (
            <button key={id} onClick={() => { setTab(id); setOpenTask(null); setTrainMode(null); }} style={{ padding: "10px 14px", border: "none", background: "transparent", color: tab === id ? "#22d3ee" : "#4a5568", fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer", borderBottom: "2px solid " + (tab === id ? "#22d3ee" : "transparent"), whiteSpace: "nowrap" }}>{l}</button>
          ))}
        </div>

        {/* TODAY */}
        {tab === "today" && (
          <div>
            <Card><div style={{ fontSize: 13, color: "#8892a4", textAlign: "center", lineHeight: 1.8 }}>{"💎 " + MOTIV[dn % MOTIV.length]}</div></Card>
            {tmOn && <Card s={{ borderColor: "rgba(34,211,238,0.12)" }}><div style={{ textAlign: "center" }}><div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 44, fontWeight: 700, color: tmSec >= tmMax ? "#34d399" : "#22d3ee" }}>{String(Math.floor((tmMax - tmSec) / 60)).padStart(2, "0") + ":" + String((tmMax - tmSec) % 60).padStart(2, "0")}</div>{tmSec >= tmMax && <div style={{ color: "#34d399", fontWeight: 700, marginTop: 6 }}>✅ أحسنت!</div>}<button onClick={() => { clearInterval(tmRef.current); setTmOn(false); }} style={{ marginTop: 8, padding: "6px 16px", borderRadius: 8, border: "1px solid #1e293b", background: "transparent", color: "#64748b", fontFamily: "inherit", fontSize: 12, cursor: "pointer" }}>إيقاف</button></div></Card>}
            <Card>
              <div style={{ fontSize: 11, color: "#4a5568", fontWeight: 600, marginBottom: 8 }}>{"📋 أنشطة اليوم — " + pct + "%"}</div>
              <div style={{ height: 4, borderRadius: 2, background: "#111827", marginBottom: 12, overflow: "hidden" }}><div style={{ height: "100%", width: pct + "%", borderRadius: 2, background: pct === 100 ? "linear-gradient(90deg,#34d399,#22d3ee)" : "#22d3ee", transition: "width .5s" }} /></div>
              {tasks.map((t) => {
                const isDone = done.includes(t.id), isOpen = openTask === t.id;
                return (
                  <div key={t.id}>
                    <div onClick={() => setOpenTask(isOpen ? null : t.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, borderRadius: 12, cursor: "pointer", border: "1px solid " + (isOpen ? "rgba(34,211,238,0.15)" : "transparent"), background: isOpen ? "rgba(34,211,238,0.04)" : "transparent", opacity: isDone ? 0.4 : 1 }}>
                      <div onClick={(e) => { e.stopPropagation(); toggle(t.id); }} style={{ width: 26, height: 26, borderRadius: "50%", border: "2px solid " + (isDone ? "#22d3ee" : "#2a3448"), background: isDone ? "#22d3ee" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#060a14", flexShrink: 0, cursor: "pointer" }}>{isDone ? "✓" : ""}</div>
                      <span style={{ fontSize: 20, flexShrink: 0 }}>{t.ic}</span>
                      <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 600 }}>{t.nm}</div><div style={{ fontSize: 11, color: "#3a4a5c" }}>{t.dur + " د"}</div></div>
                      <span style={{ fontSize: 16, color: "#3a4a5c", transform: isOpen ? "rotate(180deg)" : "", transition: ".3s", display: "inline-block" }}>▾</span>
                    </div>
                    {isOpen && (
                      <div style={{ padding: "10px 12px 16px", animation: "fadeUp .3s" }}>
                        {t.id === "shadow" && <div><p style={{ fontSize: 12, color: "#8892a4", lineHeight: 1.9, marginBottom: 12 }}>{"🎧 اضغط ▶ — اقرأ كل جملة بصوت عالٍ قبل ما ينتهي العدّاد!"}</p><Prompter lines={shadow} gap={ph.gap} color={ph.c} label="التمرين" />{!tmOn && <div style={{ textAlign: "center", marginTop: 10 }}><button onClick={() => startTm(15)} style={{ padding: "7px 16px", borderRadius: 10, border: "none", background: "#22d3ee", color: "#060a14", fontFamily: "inherit", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>⏱️ مؤقت ١٥ دقيقة</button></div>}</div>}
                        {t.id === "think" && <div><p style={{ fontSize: 12, color: "#8892a4", lineHeight: 1.9, marginBottom: 12 }}>{"🗣️ اقرأ الموضوع ثم تكلم عنه بصوت عالٍ بالإنجليزي. استخدم جمل البداية!"}</p><div style={{ background: "rgba(34,211,238,0.04)", border: "1px solid rgba(34,211,238,0.08)", borderRadius: 14, padding: 20, textAlign: "center" }}><div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 17, color: "#22d3ee", direction: "ltr", lineHeight: 1.6, marginBottom: 8 }}>{tp.en}</div><div style={{ fontSize: 13, color: "#5a6a80" }}>{tp.ar}</div></div>{tp.starters && <div style={{ marginTop: 12, background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.12)", borderRadius: 12, padding: 14 }}><div style={{ fontSize: 12, color: "#a78bfa", fontWeight: 700, marginBottom: 8 }}>💡 ابدأ بهذه الجمل:</div>{tp.starters.map((st, si) => <div key={si} style={{ fontFamily: "'IBM Plex Mono'", fontSize: 14, direction: "ltr", textAlign: "left", lineHeight: 1.8, color: "#c4b5fd", padding: "4px 0" }}>{st}</div>)}</div>}{!tmOn && <div style={{ textAlign: "center", marginTop: 10 }}><button onClick={() => startTm(10)} style={{ padding: "7px 16px", borderRadius: 10, border: "none", background: "#22d3ee", color: "#060a14", fontFamily: "inherit", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>⏱️ مؤقت ١٠ دقائق</button></div>}</div>}
                        {t.id === "passive" && <div><p style={{ fontSize: 12, color: "#8892a4", lineHeight: 1.9, marginBottom: 12 }}>{"📻 اقرأ القصة بصمت مع الجمل وهي تتحرك. لا تترجم — فقط تابع."}</p><div style={{ fontSize: 14, fontWeight: 700, color: "#34d399", marginBottom: 8 }}>{"📖 " + story.t}</div><Prompter lines={story.lines} gap={ph.gap + 2} color="#34d399" label="القراءة" /></div>}
                        {t.id === "phrases" && <div><p style={{ fontSize: 12, color: "#8892a4", lineHeight: 1.9, marginBottom: 12 }}>{"💬 اضغط على الدائرة كل مرة ترددّ الجملة. الهدف ٥."}</p><div style={{ fontSize: 13, fontWeight: 700, color: "#22d3ee", marginBottom: 8 }}>{pc.icon + " " + pc.cat}</div>{pc.items.map((p, i) => { const k = dn + "-" + i; const r = reps[k] || 0; return (<div key={i} onClick={() => setReps(prev => ({ ...prev, [k]: (prev[k] || 0) + 1 }))} style={{ display: "flex", alignItems: "center", gap: 10, padding: 10, borderRadius: 10, background: r >= 5 ? "rgba(52,211,153,0.06)" : "rgba(255,255,255,0.015)", border: "1px solid " + (r >= 5 ? "rgba(52,211,153,0.15)" : "rgba(255,255,255,0.04)"), marginBottom: 5, cursor: "pointer" }}><div style={{ width: 26, height: 26, borderRadius: "50%", background: r >= 5 ? "#34d399" : r > 0 ? "#22d3ee" : "#1e293b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: r > 0 ? "#060a14" : "#4a5568", flexShrink: 0 }}>{r >= 5 ? "✓" : r}</div><div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 14, direction: "ltr", textAlign: "left", lineHeight: 1.6, flex: 1 }}>{p}</div></div>); })}</div>}
                        {t.id === "watch" && <div><p style={{ fontSize: 12, color: "#8892a4", lineHeight: 1.9, marginBottom: 12 }}>{"🎬 قصة قصيرة. اضغط ▶ وتابع الجمل. استمتع!"}</p><div style={{ fontSize: 14, fontWeight: 700, color: "#a78bfa", marginBottom: 8 }}>{"📖 " + story2.t}</div><Prompter lines={story2.lines} gap={ph.gap + 2} color="#a78bfa" label="القصة" /></div>}
                      </div>
                    )}
                  </div>
                );
              })}
            </Card>
            {(dw === 1 || dw === 4) && <Card s={{ borderColor: "rgba(167,139,250,0.1)" }}><div style={{ fontSize: 12, color: "#8892a4", lineHeight: 1.8 }}>🎤 <b>جلسة محادثة ٢٥ دقيقة</b> — افتح Cambly أو italki على جوالك</div></Card>}
          </div>
        )}

        {/* TRAINING */}
        {tab === "train" && (
          <div>
            {!trainMode && (
              <div>
                <Card><div style={{ fontSize: 13, color: "#8892a4", textAlign: "center", lineHeight: 1.8 }}>🎭 تدريبات تفاعلية تجهّزك للاجتماعات الحقيقية</div></Card>
                {[
                  { id: "sim", icon: "🎭", title: "محاكاة اجتماع", desc: "سيناريو اجتماع كامل — اختر الرد المناسب واقرأه بصوت عالٍ", color: "#22d3ee" },
                  { id: "quick", icon: "⚡", title: "استجابة سريعة", desc: "مواقف سريعة — اختر الجملة الصح قبل ما ينتهي الوقت", color: "#f59e0b" },
                  { id: "quiz", icon: "📊", title: "اختبار أسبوعي", desc: "١٠ أسئلة تقيس تقدمك في حفظ الجمل واستخدامها", color: "#a78bfa" },
                  { id: "fill", icon: "📝", title: "أكمل الفراغ", desc: "اكتب الكلمات الناقصة في الجمل — يختبر حفظك الحقيقي", color: "#06b6d4" },
                  { id: "build", icon: "🧩", title: "بناء جمل", desc: "رتّب الكلمات المبعثرة لتكوين جمل صحيحة — يعالج مشكلة تركيب الجمل", color: "#10b981" },
                ].map((m) => (
                  <div key={m.id} onClick={() => setTrainMode(m.id)} style={{ display: "flex", alignItems: "center", gap: 14, padding: 16, borderRadius: 14, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)", marginBottom: 10, cursor: "pointer", transition: ".3s" }}>
                    <div style={{ fontSize: 32, flexShrink: 0 }}>{m.icon}</div>
                    <div><div style={{ fontSize: 15, fontWeight: 700, color: m.color }}>{m.title}</div><div style={{ fontSize: 12, color: "#5a6a80", marginTop: 2 }}>{m.desc}</div></div>
                  </div>
                ))}
              </div>
            )}
            {trainMode === "sim" && <Card><div style={{ marginBottom: 10 }}><button onClick={() => setTrainMode(null)} style={{ background: "none", border: "none", color: "#5a6a80", fontFamily: "inherit", fontSize: 12, cursor: "pointer" }}>→ رجوع</button></div><MeetingSim /></Card>}
            {trainMode === "quick" && <Card><div style={{ marginBottom: 10 }}><button onClick={() => setTrainMode(null)} style={{ background: "none", border: "none", color: "#5a6a80", fontFamily: "inherit", fontSize: 12, cursor: "pointer" }}>→ رجوع</button></div><QuickResp /></Card>}
            {trainMode === "quiz" && <Card><div style={{ marginBottom: 10 }}><button onClick={() => setTrainMode(null)} style={{ background: "none", border: "none", color: "#5a6a80", fontFamily: "inherit", fontSize: 12, cursor: "pointer" }}>→ رجوع</button></div><WeeklyQuiz onSave={() => setQuizResults(null)} /></Card>}
            {trainMode === "fill" && <Card><div style={{ marginBottom: 10 }}><button onClick={() => setTrainMode(null)} style={{ background: "none", border: "none", color: "#5a6a80", fontFamily: "inherit", fontSize: 12, cursor: "pointer" }}>→ رجوع</button></div><FillBlank /></Card>}
            {trainMode === "build" && <Card><div style={{ marginBottom: 10 }}><button onClick={() => setTrainMode(null)} style={{ background: "none", border: "none", color: "#5a6a80", fontFamily: "inherit", fontSize: 12, cursor: "pointer" }}>→ رجوع</button></div><SentenceBuild /></Card>}
          </div>
        )}

        {/* PHRASES */}
        {tab === "phrases" && (
          <div>
            <div style={{ display: "flex", gap: 5, overflowX: "auto", paddingBottom: 8 }}>
              {PHRASES.map((c, i) => (
                <button key={i} onClick={() => setPCat(i)} style={{ padding: "7px 12px", borderRadius: 18, border: "1px solid " + (pCat === i ? "#22d3ee" : "rgba(255,255,255,0.05)"), background: pCat === i ? "rgba(34,211,238,0.08)" : "transparent", color: pCat === i ? "#22d3ee" : "#6b7a8d", fontFamily: "inherit", fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}>{c.icon + " " + c.cat}</button>
              ))}
            </div>
            <Card>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, color: "#22d3ee" }}>{PHRASES[pCat].icon + " " + PHRASES[pCat].cat}</div>
              {PHRASES[pCat].items.map((p, i) => {
                const k = "p" + pCat + "-" + i;
                const r = reps[k] || 0;
                return (
                  <div key={i} onClick={() => setReps(prev => ({ ...prev, [k]: (prev[k] || 0) + 1 }))} style={{ display: "flex", alignItems: "center", gap: 10, padding: 12, borderRadius: 10, background: r >= 5 ? "rgba(52,211,153,0.06)" : "rgba(255,255,255,0.015)", border: "1px solid " + (r >= 5 ? "rgba(52,211,153,0.15)" : "rgba(255,255,255,0.04)"), marginBottom: 6, cursor: "pointer" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: r >= 5 ? "#34d399" : r > 0 ? "#22d3ee" : "#1e293b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: r > 0 ? "#060a14" : "#4a5568", flexShrink: 0 }}>{r >= 5 ? "✓" : r}</div>
                    <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 15, direction: "ltr", textAlign: "left", lineHeight: 1.7, flex: 1 }}>{p}</div>
                  </div>
                );
              })}
              <div style={{ fontSize: 11, color: "#5a6a80", textAlign: "center", marginTop: 10 }}>اضغط على الدائرة كل مرة ترددّ — الهدف ٥ لكل جملة</div>
            </Card>
          </div>
        )}

        {/* PROGRESS */}
        {tab === "progress" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
              {[
                { l: "أيام", v: Object.values(store.days).filter(d => d.length >= 3).length, c: "#22d3ee" },
                { l: "أسبوع", v: wk + "/12", c: "#a78bfa" },
                { l: "سلسلة 🔥", v: (() => { let s = 0, d = new Date(); for (let i = 0; i < 100; i++) { const k = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); if (store.days[k] && store.days[k].length >= 3) { s++; d.setDate(d.getDate() - 1); } else if (i === 0) { d.setDate(d.getDate() - 1); } else break; } return s; })(), c: "#f59e0b" },
              ].map((s, i) => (
                <Card key={i} s={{ padding: 12 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: s.c, fontFamily: "'IBM Plex Mono'" }}>{s.v}</div>
                    <div style={{ fontSize: 10, color: "#4a5568", marginTop: 4 }}>{s.l}</div>
                  </div>
                </Card>
              ))}
            </div>
            <Card>
              <div style={{ display: "flex", alignItems: "center", gap: 3, justifyContent: "center", flexWrap: "wrap" }}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((w) => (
                  <div key={w} style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, border: "2px solid " + (w <= wk ? "#22d3ee" : "#1a2236"), background: w < wk ? "#22d3ee" : "transparent", color: w < wk ? "#060a14" : w === wk ? "#22d3ee" : "#4a5568", animation: w === wk ? "glow 2s infinite" : "none", opacity: w > wk ? 0.2 : 1 }}>{w < wk ? "✓" : w}</div>
                ))}
              </div>
            </Card>
            {quizResults && quizResults.length > 0 && <Card>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#a78bfa", marginBottom: 12 }}>📊 نتائج الاختبارات</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 100, padding: "0 4px" }}>
                {quizResults.slice(-10).map((r, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: r.pct >= 80 ? "#34d399" : r.pct >= 50 ? "#f59e0b" : "#ef4444" }}>{r.pct + "%"}</div>
                    <div style={{ width: "100%", height: Math.max(r.pct * 0.8, 4), borderRadius: 4, background: r.pct >= 80 ? "#34d399" : r.pct >= 50 ? "#f59e0b" : "#ef4444", transition: "height .3s" }} />
                    <div style={{ fontSize: 8, color: "#4a5568" }}>{r.date ? r.date.slice(5) : ""}</div>
                  </div>
                ))}
              </div>
              {quizResults.length >= 2 && (() => {
                const last = quizResults[quizResults.length - 1].pct;
                const prev = quizResults[quizResults.length - 2].pct;
                const diff = last - prev;
                return <div style={{ textAlign: "center", marginTop: 8, fontSize: 13, fontWeight: 700, color: diff >= 0 ? "#34d399" : "#ef4444" }}>{diff >= 0 ? "📈 +" + diff + "%" : "📉 " + diff + "%"} مقارنة بالاختبار السابق</div>;
              })()}
            </Card>}
            <div style={{ textAlign: "center", marginTop: 14 }}>
              <button onClick={() => { if (confirm("حذف كل البيانات؟")) { save({ start: null, days: {} }); setTab("today"); } }} style={{ padding: "7px 16px", borderRadius: 10, border: "1px solid rgba(239,68,68,0.1)", background: "transparent", color: "#ef4444", fontFamily: "inherit", fontSize: 12, cursor: "pointer" }}>إعادة تعيين</button>
            </div>
          </div>
        )}

        <div style={{ height: 36 }} />
      </div>
    </div>
  );
}
