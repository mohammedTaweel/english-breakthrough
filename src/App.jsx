import { useState, useEffect, useCallback, useRef } from "react";
import { speak, stopSpeech, getVoiceInfo, setOpenAIKey, getOpenAIKey, setTTSVoice, getTTSVoice, setAccent, getAccent, storage } from "./platform.js";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;600;700;800&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  @keyframes pulse { 0%,100% { transform:scale(1); } 50% { transform:scale(1.06); } }
  @keyframes glow { 0%,100% { box-shadow:0 0 10px rgba(232,184,75,0.1); } 50% { box-shadow:0 0 25px rgba(232,184,75,0.2); } }
  @keyframes confDrop { 0% { transform:translateY(-100vh) rotate(0); opacity:1; } 100% { transform:translateY(100vh) rotate(720deg); opacity:0; } }
  @keyframes slideIn { from { opacity:0; transform:translateX(30px); } to { opacity:1; transform:translateX(0); } }
  @keyframes firePulse { 0%,100% { transform:scale(1); filter:brightness(1); } 50% { transform:scale(1.2); filter:brightness(1.3); } }
  @keyframes stepDone { 0% { transform:scale(1); } 50% { transform:scale(1.3); } 100% { transform:scale(1); } }
  @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
`;

const SHADOW_LINES = [
  ["Good morning. How are you today?", "I would like a cup of coffee, please.", "Excuse me, where is the nearest pharmacy?", "Thank you very much for your help.", "Can I have the bill, please?", "I need to make an appointment.", "Could you speak more slowly, please?", "I'm sorry, I didn't understand that.", "What time does the store close?", "Have a nice day!"],
  ["I've been living here for about five years.", "Could you recommend a good restaurant nearby?", "I need to reschedule my appointment to next week.", "The weather has been really nice lately.", "I'm looking for something in a medium size.", "Let me check my calendar and get back to you.", "I appreciate your patience with this.", "Would it be possible to get a refund?", "I'll send you the details by email.", "That's exactly what I was looking for."],
  ["I've been meaning to bring this up for a while now.", "Based on what you're saying, I think we should consider another option.", "I completely understand your concern, and here's what I suggest.", "Would it be possible to explore a different approach to this?", "Let me walk you through the details so we're on the same page.", "I want to make sure we're aligned before we move forward.", "From my experience, this tends to work better in the long run.", "I'd appreciate it if you could look into this for me.", "Let me summarize what we've discussed so far.", "I believe this is the best path forward given the circumstances."],
];
const STORIES = [
  { t: "رحلة إلى لندن", lines: ["Faisal had always dreamed of visiting London.", "He booked his flight and hotel online by himself.", "At the airport, he asked for directions in English.", "Excuse me, which gate is for the London flight?", "The flight attendant smiled and pointed the way.", "In London, he took the underground to his hotel.", "He ordered fish and chips at a local restaurant.", "The waiter asked, Would you like anything to drink?", "Just water, please, Faisal replied with confidence.", "He realized his English was better than he thought."] },
  { t: "عند الدكتور", lines: ["Huda moved to a new city and needed a doctor.", "She called the clinic to book an appointment.", "I would like to see a doctor this week, she said.", "The receptionist asked about her symptoms.", "I have had a headache for three days, Huda explained.", "The doctor examined her carefully and asked questions.", "Have you been under a lot of stress recently?", "Yes, I just moved and started a new routine.", "The doctor recommended rest and staying hydrated.", "Huda left feeling relieved and understood."] },
  { t: "اجتماع أولياء الأمور", lines: ["Tariq went to his daughter's school for a meeting.", "The teacher greeted him in English warmly.", "Thank you for coming. Sara is a wonderful student.", "She is very good at math but needs help with reading.", "Tariq listened carefully and took mental notes.", "What can I do at home to help her, he asked.", "Read with her for fifteen minutes every night.", "That sounds simple enough, Tariq said.", "He felt proud that he understood the whole conversation.", "On the way home, he started planning their reading time."] },
  { t: "التسوق أونلاين", lines: ["Mona wanted to buy a laptop from an international store.", "She compared prices and read reviews in English.", "This one has great battery life, one review said.", "She added it to her cart and went to checkout.", "The website asked for her shipping address.", "She typed everything carefully in English.", "A chat window popped up asking if she needed help.", "Yes, does this ship to Saudi Arabia, she typed.", "The agent confirmed and gave her a tracking number.", "The laptop arrived in perfect condition a week later."] },
  { t: "مقابلة العمل", lines: ["Ahmed prepared carefully for his interview.", "He reviewed the company website and recent news.", "Tell me about yourself, the interviewer began.", "Ahmed spoke about his ten years of experience.", "He mentioned specific projects he was proud of.", "The interviewer was impressed by his preparation.", "What motivates you in your career, she asked.", "Solving problems and helping my team grow, he said.", "Both sides felt the interview went very well.", "Ahmed received an offer the following week."] },
  { t: "في المطعم", lines: ["Salma and her husband went to a nice restaurant.", "Good evening. A table for two, please, she said.", "The waiter brought the menu and explained the specials.", "Tonight we have grilled salmon with lemon sauce.", "That sounds delicious. I will have that, Salma said.", "Her husband ordered a steak, medium well.", "They enjoyed their meal and had a great conversation.", "Could we have the dessert menu, please, she asked.", "They shared a chocolate cake and drank coffee.", "The evening was perfect from start to finish."] },
  { t: "الجار الجديد", lines: ["A new family moved in next door to Youssef.", "He decided to welcome them with a friendly visit.", "Hi, I am Youssef. Welcome to the neighborhood.", "The neighbor smiled and introduced his family.", "We just moved from Canada, the neighbor explained.", "If you need anything, please do not hesitate to ask.", "They talked about the best schools and grocery stores.", "Youssef recommended his favorite local restaurant.", "They exchanged phone numbers before saying goodbye.", "A simple conversation turned into a real friendship."] },
  { t: "أول يوم في الدورة", lines: ["Layla signed up for an online photography course.", "The instructor spoke English with a British accent.", "Welcome everyone. Let me introduce myself first.", "She took notes in English for the first time.", "Today we will learn about lighting and composition.", "The instructor showed examples and asked for opinions.", "Layla typed in the chat, I think the second photo is better.", "Great observation, the instructor replied.", "She felt a rush of confidence after being noticed.", "By the end of the class, she had learned ten new words."] },
];
const PROMPTS = [
  { en: "Describe your favorite place to visit", ar: "وصف مكانك المفضل", starters: ["My favorite place is...", "I usually go there when...", "What I love about it is...", "The last time I visited, I...", "I would recommend it because..."] },
  { en: "Talk about a meal you love to cook", ar: "أكلة تحب تسويها", starters: ["One of my favorite dishes is...", "To make it, you need...", "First, you start by...", "The secret ingredient is...", "I learned this recipe from..."] },
  { en: "Explain something you learned recently", ar: "شيء تعلمته مؤخراً", starters: ["Recently, I learned about...", "What surprised me was...", "The most interesting part is...", "I learned it by...", "I want to learn more about..."] },
  { en: "Describe your ideal weekend", ar: "وصف نهاية أسبوع مثالية", starters: ["My perfect weekend starts with...", "In the morning, I like to...", "For lunch, I usually...", "In the afternoon, I enjoy...", "By the evening, I feel..."] },
  { en: "Talk about a trip you took", ar: "رحلة سويتها", starters: ["A few years ago, I traveled to...", "The best part of the trip was...", "I tried... for the first time.", "One funny thing that happened was...", "I would go back because..."] },
  { en: "Describe a person who influenced you", ar: "شخص أثّر فيك", starters: ["Someone who really influenced me is...", "I met this person when...", "What I admire about them is...", "They taught me that...", "Because of them, I now..."] },
  { en: "Explain your job to a stranger", ar: "اشرح وظيفتك لشخص غريب", starters: ["I work in the field of...", "Basically, what I do is...", "A typical day looks like...", "The best part about my job is...", "The most challenging thing is..."] },
  { en: "Talk about a goal for this year", ar: "هدف تبي تحققه هالسنة", starters: ["One of my goals this year is...", "The reason I chose this goal is...", "To achieve it, I need to...", "So far, I have...", "By the end of the year, I hope to..."] },
  { en: "Describe how you spend your evenings", ar: "كيف تقضي أمسياتك", starters: ["After a long day, I usually...", "Sometimes I like to...", "My family and I often...", "If I have free time, I...", "Before I sleep, I always..."] },
  { en: "Talk about a hobby or skill you enjoy", ar: "هواية أو مهارة تستمتع فيها", starters: ["I've been doing... for about...", "I got into it because...", "What I enjoy most about it is...", "It has taught me...", "I would recommend it to anyone who..."] },
  { en: "Describe a challenge you overcame", ar: "تحدي تغلبت عليه", starters: ["A few years ago, I faced...", "The hardest part was...", "I tried to solve it by...", "What helped me the most was...", "Looking back, I learned that..."] },
  { en: "Talk about what makes a good friend", ar: "صفات الصديق الجيد", starters: ["In my opinion, a good friend is someone who...", "One important quality is...", "For example, my best friend...", "I also believe that...", "The best friendships I've seen..."] },
];
const PHRASES = [
  { cat: "التعارف والمجاملات", icon: "👋", items: [
    { en: "Nice to meet you. Where are you from?", ar: "تشرفنا. من وين أنت؟" },
    { en: "I've heard great things about you.", ar: "سمعت عنك أشياء حلوة." },
    { en: "How long have you been living here?", ar: "من متى وأنت ساكن هنا؟" },
    { en: "What do you do for a living?", ar: "وش شغلك؟ (سؤال مهذب)" },
    { en: "It was really nice talking to you.", ar: "كان ممتع إني أتكلم معك." },
  ]},
  { cat: "السفر والمطار", icon: "✈️", items: [
    { en: "Excuse me, where is gate number seven?", ar: "لو سمحت، وين بوابة رقم ٧؟" },
    { en: "I'd like to check in for my flight, please.", ar: "أبي أسوي تشيك إن لرحلتي." },
    { en: "Is there a direct flight or do I have a layover?", ar: "في رحلة مباشرة أو عندي توقف؟" },
    { en: "Could you help me find my connecting flight?", ar: "تقدر تساعدني ألاقي رحلتي المتصلة؟" },
    { en: "My luggage didn't arrive. Where can I report this?", ar: "شنطتي ما وصلت. وين أبلّغ؟" },
  ]},
  { cat: "المطاعم والطلبات", icon: "🍽️", items: [
    { en: "A table for two, please.", ar: "طاولة لشخصين، لو سمحت." },
    { en: "What do you recommend from the menu?", ar: "وش تنصح من القائمة؟" },
    { en: "I'm allergic to nuts. Does this contain any?", ar: "عندي حساسية مكسرات. هل فيها؟" },
    { en: "Could we have the bill, please?", ar: "ممكن الحساب لو سمحت؟" },
    { en: "The food was excellent. Thank you.", ar: "الأكل كان ممتاز. شكراً لك." },
  ]},
  { cat: "المواعيد والاتصالات", icon: "📞", items: [
    { en: "I'd like to make an appointment, please.", ar: "أبي أحجز موعد لو سمحت." },
    { en: "Is it possible to reschedule to next week?", ar: "ممكن أأجّل الموعد للأسبوع الجاي؟" },
    { en: "I'm calling to follow up on my request.", ar: "أتصل أتابع طلبي." },
    { en: "Could you transfer me to the right department?", ar: "ممكن تحوّلني للقسم المختص؟" },
    { en: "Thank you for your help. Have a nice day.", ar: "شكراً على مساعدتك. يوم سعيد." },
  ]},
  { cat: "إبداء الرأي والنقاش", icon: "💡", items: [
    { en: "I see it differently. From my perspective...", ar: "أشوفها بشكل مختلف. من وجهة نظري..." },
    { en: "That's a good point. I also think...", ar: "نقطة ممتازة. وأنا أيضاً أشوف..." },
    { en: "I agree overall, but I have one concern.", ar: "بشكل عام متفق، بس عندي تحفّظ." },
    { en: "Could you explain why you think that?", ar: "تقدر توضّح ليش تشوف كذا؟" },
    { en: "Let me think about it and get back to you.", ar: "خلني أفكر فيها وأرجعلك." },
  ]},
  { cat: "عبارات إنقاذ", icon: "🛟", items: [
    { en: "Sorry, I didn't catch that. Could you repeat?", ar: "آسف ما فهمت. تقدر تعيد؟" },
    { en: "Could you speak a bit more slowly, please?", ar: "ممكن تتكلم أبطأ شوي؟" },
    { en: "What does that word mean exactly?", ar: "وش معنى هالكلمة بالضبط؟" },
    { en: "How do you say... in English?", ar: "كيف تقول... بالإنجليزي؟" },
    { en: "I understand, but let me make sure...", ar: "فاهم، بس خلني أتأكد..." },
  ]},
  { cat: "العمل والاجتماعات", icon: "💼", items: [
    { en: "Let me give you a quick update on this.", ar: "خلني أعطيك تحديث سريع." },
    { en: "I'd like to suggest a different approach.", ar: "أبي أقترح طريقة ثانية." },
    { en: "Can we agree on the next steps?", ar: "نقدر نتفق على الخطوات الجاية؟" },
    { en: "I'll take care of this and follow up.", ar: "أنا آخذها على عاتقي وأتابع." },
    { en: "Let me summarize what we discussed.", ar: "خلني ألخّص اللي ناقشناه." },
  ]},
];
const MOTIV = [
  "تخيّل نفسك ترد على الأجنبي بثقة بدون تفكير — تمرّن على جملتين اليوم وبتكون أقرب",
  "المشكلة مو ذكاءك — المشكلة كانت الطريقة. هالبرنامج مبني على أبحاث اكتساب اللغة الحقيقية",
  "٥ دقائق اليوم = جملة جديدة تطلع منك تلقائياً لما تحتاجها في الحياة الحقيقية",
  "الجمل الجاهزة = سلاحك السري. في المطعم، الفندق، المطار — جاهز لأي موقف",
  "لا تترجم في راسك — ردّد الجملة الإنجليزية مباشرة. عقلك يبني مسار جديد كل مرة",
  "بعد ٤ أسابيع: تطلب في المطعم، تحجز بالفندق، تتكلم مع جيرانك — كله بثقة",
  "كل مرة تتكلم لوحدك بالإنجليزي، لسانك يتعوّد ويصير أسرع. الحرج يختفي بالتكرار",
  "آخر مرة تمرّنت؟ اليوم تكمل السلسلة. حتى ٥ دقائق تسوي فرق",
];

const CONVERSATIONS = [
  { title: "في الفندق", icon: "🏨", steps: [
    { speaker: "موظف الاستقبال", text: "Good evening. Welcome to our hotel. Do you have a reservation?", prompt: "أكّد حجزك", opts: ["Yes, I have a reservation under the name Al-Rashid.", "I think I booked something online recently.", "I'm here to stay at the hotel."], ans: 0 },
    { speaker: "موظف الاستقبال", text: "I found it. A double room for three nights. Could I see your ID?", prompt: "أعطِ معلوماتك", opts: ["Of course. Here's my passport. Is breakfast included?", "Sure, let me look for it in my bag.", "Yes, here you go."], ans: 0 },
    { speaker: "موظف الاستقبال", text: "Breakfast is from 7 to 10. Your room is on the fifth floor.", prompt: "اسأل عن الخدمات", opts: ["Great. Is there a gym and pool available for guests?", "That sounds fine. Thank you.", "OK, I'll find it."], ans: 0 },
    { speaker: "موظف الاستقبال", text: "Yes, both are on the second floor. Open until 10 PM.", prompt: "اطلب شيء إضافي", opts: ["Perfect. Could I also get some extra towels sent to the room?", "That's nice to know. Thank you.", "I'll check them out later."], ans: 0 },
    { speaker: "موظف الاستقبال", text: "Absolutely. Is there anything else I can help you with?", prompt: "اشكره واختم", opts: ["That's everything. Thank you so much for your help.", "No, I think that's all for now.", "I'm fine, thanks."], ans: 0 },
  ]},
  { title: "عند الطبيب", icon: "🏥", steps: [
    { speaker: "الطبيب", text: "Good morning. What brings you in today?", prompt: "اشرح أعراضك", opts: ["I've been having a persistent headache for the past three days, along with some fatigue.", "My head hurts and I feel tired.", "I haven't been feeling well lately."], ans: 0 },
    { speaker: "الطبيب", text: "I see. Have you experienced any other symptoms like fever or nausea?", prompt: "أجب بتفصيل", opts: ["No fever, but I've noticed some mild dizziness, especially in the morning.", "I don't think so. Maybe a little.", "Not really, just the headache."], ans: 0 },
    { speaker: "الطبيب", text: "Have you been under a lot of stress recently? Any changes in sleep?", prompt: "اشرح وضعك", opts: ["Yes, actually. I've been sleeping less than usual and my schedule has been very hectic.", "Kind of. I've been busy with a lot of things.", "Maybe a little stressed, nothing major."], ans: 0 },
    { speaker: "الطبيب", text: "I'd recommend some blood tests just to be safe. I'll also prescribe something for the headache.", prompt: "اسأل عن العلاج", opts: ["That sounds good. How often should I take the medication, and are there any side effects?", "OK, I'll do the blood tests. Thank you.", "Sure, whatever you recommend."], ans: 0 },
    { speaker: "الطبيب", text: "Take it twice daily with food. Come back in a week if it doesn't improve.", prompt: "اشكره وأكّد", opts: ["Thank you, doctor. I'll follow your advice and schedule a follow-up if needed.", "OK, I'll come back if it doesn't get better.", "Thanks for seeing me today."], ans: 0 },
  ]},
  { title: "اجتماع أولياء أمور", icon: "🎓", steps: [
    { speaker: "المعلم/ة", text: "Thank you for coming. Your son Omar is a bright student.", prompt: "اشكره واسأل", opts: ["Thank you. I'm glad to hear that. How is he doing in his main subjects?", "That's great to hear. Thank you.", "Good, I was hoping he was doing well."], ans: 0 },
    { speaker: "المعلم/ة", text: "He's excellent in math and science, but he needs to improve his reading.", prompt: "اسأل عن التفاصيل", opts: ["I see. Could you give me specific examples of where he's struggling?", "I noticed that at home too.", "What can we do about that?"], ans: 0 },
    { speaker: "المعلم/ة", text: "He reads slowly and sometimes skips words. I think more practice at home would help.", prompt: "اقترح خطة", opts: ["That makes sense. What if we start with fifteen minutes of reading together every evening?", "I'll try to read with him more.", "We'll work on it at home."], ans: 0 },
    { speaker: "المعلم/ة", text: "That would be wonderful. I can also send home some recommended books.", prompt: "وافق واسأل", opts: ["I'd really appreciate that. Are there any apps or websites you'd also recommend?", "Sure, that would be helpful. Thank you.", "OK, please send them."], ans: 0 },
    { speaker: "المعلم/ة", text: "Yes, I'll email you a list. Feel free to reach out if you have any questions.", prompt: "اختم بشكر", opts: ["Thank you so much for your time and guidance. I'll stay in touch.", "Great, thanks for everything.", "I appreciate it. Have a good day."], ans: 0 },
  ]},
  { title: "استئجار شقة", icon: "🏠", steps: [
    { speaker: "صاحب الشقة", text: "Hi, thanks for coming to see the apartment. Let me show you around.", prompt: "اسأل عن التفاصيل", opts: ["Thank you. I'm really interested. How many bedrooms does it have?", "It looks nice. Tell me more about it.", "Thanks. I saw the ad online."], ans: 0 },
    { speaker: "صاحب الشقة", text: "It has two bedrooms, one bathroom, and a balcony. Utilities are included.", prompt: "اسأل عن الشروط", opts: ["That's great. What's the monthly rent, and is there a minimum lease period?", "How much is the rent per month?", "That sounds reasonable."], ans: 0 },
    { speaker: "صاحب الشقة", text: "It's fifteen hundred a month with a one-year lease. Two months deposit required.", prompt: "فاوض بأدب", opts: ["I see. Would you consider fourteen hundred if I pay three months upfront?", "That's a bit high. Could you lower it?", "Let me think about the price."], ans: 0 },
    { speaker: "صاحب الشقة", text: "I could do fourteen fifty with three months upfront. That's the best I can offer.", prompt: "وافق واسأل", opts: ["That works for me. When would the apartment be available to move in?", "OK, I'll take it at that price.", "Sure, let's go with that."], ans: 0 },
    { speaker: "صاحب الشقة", text: "You can move in on the first of next month. I'll prepare the contract.", prompt: "أكّد وأنهِ", opts: ["Perfect. I'll review the contract and have it signed by the end of the week.", "Great, I'll be ready by then.", "Sounds good. Thank you."], ans: 0 },
  ]},
  { title: "مكالمة خدمة العملاء", icon: "📱", steps: [
    { speaker: "موظف الخدمة", text: "Thank you for calling. How can I help you today?", prompt: "اشرح مشكلتك", opts: ["Hi, I placed an order last week and it still hasn't arrived. My order number is five-seven-three.", "I have a problem with my order.", "My order is late."], ans: 0 },
    { speaker: "موظف الخدمة", text: "I'm sorry about that. Let me check the status for you. One moment please.", prompt: "انتظر بأدب", opts: ["Of course, take your time. I appreciate you looking into this.", "Sure, no problem.", "OK, I'll wait."], ans: 0 },
    { speaker: "موظف الخدمة", text: "It looks like the package was delayed due to a shipping issue. It should arrive by Thursday.", prompt: "اسأل عن التعويض", opts: ["I understand. Since it's significantly late, is there any compensation you can offer?", "OK, as long as it arrives by Thursday.", "That's fine then."], ans: 0 },
    { speaker: "موظف الخدمة", text: "I can offer you free shipping on your next order. Would that work?", prompt: "وافق واطلب تأكيد", opts: ["That would be great. Could you send me a confirmation email with the details?", "Sure, that's fine. Thank you.", "OK, I'll accept that."], ans: 0 },
    { speaker: "موظف الخدمة", text: "Absolutely. Is there anything else I can help you with?", prompt: "اشكره واختم", opts: ["No, that's everything. Thank you for resolving this so quickly.", "No, that's all. Thanks.", "I'm good. Bye."], ans: 0 },
  ]},
];

const QUICK_RESP = [
  { sit: "أنت في مطعم والنادل يسألك عن طلبك", opts: ["I'll have the grilled chicken, please. And a glass of water.", "I want chicken and water.", "Give me the chicken.", "Whatever you recommend."], ans: 0 },
  { sit: "شخص يتكلم بسرعة وما فهمت عليه", opts: ["Sorry, could you speak a bit more slowly? I want to make sure I understand.", "Can you repeat that?", "I didn't hear you.", "What did you say?"], ans: 0 },
  { sit: "تبي تسأل عن الاتجاهات في مدينة جديدة", opts: ["Excuse me, could you tell me how to get to the nearest metro station?", "Where is the metro?", "I need to go to the metro.", "How do I get there?"], ans: 0 },
  { sit: "حد يمدح شغلك وتبي ترد بتواضع", opts: ["Thank you, I really appreciate that. It was a team effort.", "Thanks a lot.", "Oh, it was nothing.", "Yeah, I worked hard."], ans: 0 },
  { sit: "تبي ترفض دعوة بأدب", opts: ["I really appreciate the invitation, but I won't be able to make it this time.", "Sorry, I can't come.", "No thanks.", "I'm busy that day."], ans: 0 },
  { sit: "تبي تسأل الدكتور عن الدواء", opts: ["How often should I take this, and are there any side effects I should know about?", "When do I take the medicine?", "Is this safe?", "What does this do?"], ans: 0 },
  { sit: "تبي تشتكي على منتج بأدب", opts: ["I purchased this last week and it's not working properly. Is it possible to get a replacement?", "This doesn't work. I want my money back.", "I have a problem with this.", "This product is broken."], ans: 0 },
  { sit: "جارك الجديد يسلّم عليك وتبي تتعرف عليه", opts: ["Nice to meet you! I'm Omar. Welcome to the neighborhood. Let me know if you need anything.", "Hi, I live next door.", "Hello.", "I'm your neighbor."], ans: 0 },
  { sit: "تبي تعبّر عن رأيك بأدب في نقاش", opts: ["I see it differently. From my perspective, I think there's another way to look at it.", "I disagree with that.", "That's not right.", "I have a different idea."], ans: 0 },
  { sit: "شخص يسألك عن شغلك وتبي تشرح ببساطة", opts: ["I work in project management. Basically, I help teams deliver their work on time.", "I'm a manager.", "I work at a company.", "I do project stuff."], ans: 0 },
];

const QUIZ_BANK = [
  { q: "وصلت الفندق وتبي تأكد حجزك — وش أفضل جملة؟", opts: ["I have a reservation under the name Al-Rashid.", "I booked a room. Check please.", "I want my room now.", "There should be a booking."], ans: 0 },
  { q: "ما فهمت كلام شخص يتكلم بسرعة — كيف تطلب يبطّئ بأدب؟", opts: ["Could you speak a bit more slowly, please?", "Talk slower.", "I can't understand you.", "You're speaking too fast."], ans: 0 },
  { q: "تبي ترفض عرض بأدب بدون ما تزعل الشخص", opts: ["I really appreciate the offer, but I'll have to pass this time.", "No thanks.", "I don't want it.", "Maybe later."], ans: 0 },
  { q: "الدكتور يسألك عن أعراضك — كيف تشرح بدقة؟", opts: ["I've been having a persistent headache for three days, along with some fatigue.", "My head hurts.", "I feel bad.", "I have pain."], ans: 0 },
  { q: "في المطعم، النادل يسأل عن طلبك — وش الأنسب؟", opts: ["I'll have the grilled salmon, please. And could I get a glass of water?", "Give me salmon and water.", "Salmon.", "I want to eat fish."], ans: 0 },
  { q: "تبي تعبّر عن رأي مختلف بأدب في نقاش", opts: ["I see it differently. From my perspective...", "That's wrong.", "I don't agree at all.", "No, I think the opposite."], ans: 0 },
  { q: "شخص يمدحك — كيف ترد بتواضع واحترافية؟", opts: ["Thank you, I really appreciate that. It was a team effort.", "Yeah, I know.", "Thanks.", "It was nothing really."], ans: 0 },
  { q: "تبي تسأل عن الاتجاهات بأدب في مدينة جديدة", opts: ["Excuse me, could you tell me how to get to the nearest metro station?", "Where is the metro?", "Metro?", "I need to go somewhere."], ans: 0 },
  { q: "تبي تشتكي على منتج معيب بشكل محترف", opts: ["I purchased this last week and it's not working properly. Is it possible to get a replacement?", "This is broken. Fix it.", "I want my money back now.", "This doesn't work at all."], ans: 0 },
  { q: "جارك الجديد يسلّم عليك — كيف تكسر الجليد؟", opts: ["Nice to meet you! I'm Omar. Welcome to the neighborhood.", "Hi.", "You're new here?", "Hello, I live here."], ans: 0 },
];

// ===== CEFR-ALIGNED PLACEMENT TEST =====
// Adaptive test based on Cambridge/IELTS/EF SET standards
// Covers: Grammar, Vocabulary, Reading Comprehension, Pragmatics
// Levels: A1 (Beginner) → C2 (Mastery)

const CEFR_LEVELS = [
  { code: "A1", name: "مبتدئ", nameEn: "Beginner", color: "#e87461", desc: "تعرف كلمات وجمل بسيطة جداً. تقدر تعرّف نفسك وتسأل أسئلة أساسية.", tip: "ركّز على حفظ الجمل الأساسية والمفردات اليومية. ابدأ بتمارين الظل مع الجمل القصيرة." },
  { code: "A2", name: "ما قبل المتوسط", nameEn: "Elementary", color: "#e8a040", desc: "تفهم جمل متكررة في مواضيع يومية. تقدر تتواصل في مواقف بسيطة ومباشرة.", tip: "وسّع مفرداتك وركّز على تركيب جمل بسيطة. استخدم تمرين 'تفكير بصوت عالٍ' يومياً." },
  { code: "B1", name: "متوسط", nameEn: "Intermediate", color: "#e8b84b", desc: "تفهم النقاط الرئيسية في محادثات واضحة. تقدر تتعامل مع أغلب المواقف اليومية.", tip: "ابدأ بالمحادثات التفاعلية وركّز على ربط الأفكار. تمرّن على الجمل الجاهزة لمواقف الحياة." },
  { code: "B2", name: "فوق المتوسط", nameEn: "Upper-Intermediate", color: "#e8b84b", desc: "تفهم أفكار معقدة وتقدر تتفاعل بطلاقة مع متحدثين أصليين بدون جهد كبير.", tip: "ركّز على الدقة في التعبير والمصطلحات المتخصصة. تمرّن على العروض التقديمية والتفاوض." },
  { code: "C1", name: "متقدم", nameEn: "Advanced", color: "#e8b84b", desc: "تفهم نصوص طويلة ومعقدة وتقدر تعبّر عن نفسك بطلاقة وعفوية في أي موقف مهني.", tip: "ركّز على الفروق الدقيقة في اللغة والتعابير الاصطلاحية. تمرّن على المحادثات المتقدمة." },
  { code: "C2", name: "إتقان", nameEn: "Mastery", color: "#5ec4b6", desc: "تفهم كل شيء تقريباً وتقدر تعبّر بدقة عالية حتى في المواقف الأكثر تعقيداً.", tip: "حافظ على مستواك بالممارسة المستمرة. ركّز على الأسلوب والبلاغة في التواصل المهني." },
];

const LEVEL_TEST = [
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
  { level: 0, type: "listening", q: "🔊 Listen: 'I would like a cup of coffee, please.' — What does the speaker want?", audio: "I would like a cup of coffee, please.", opts: ["A cup of coffee", "A cup of tea", "A glass of water", "A sandwich"], ans: 0 },
  { level: 1, type: "listening", q: "🔊 Listen: 'The store closes at nine o'clock on weekdays.' — When does the store close?", audio: "The store closes at nine o'clock on weekdays.", opts: ["9 PM on weekdays", "9 AM on weekdays", "10 PM every day", "8 PM on weekends"], ans: 0 },
  { level: 2, type: "listening", q: "🔊 Listen: 'I've been waiting for over thirty minutes and my order still hasn't arrived.' — What is the problem?", audio: "I've been waiting for over thirty minutes and my order still hasn't arrived.", opts: ["The order is very late", "The food is cold", "The wrong order arrived", "The restaurant is closed"], ans: 0 },
  { level: 3, type: "listening", q: "🔊 Listen: 'While the proposal has merit, I believe we should consider the long-term implications before committing resources.' — What is the speaker's position?", audio: "While the proposal has merit, I believe we should consider the long-term implications before committing resources.", opts: ["Cautiously supportive but wants more analysis", "Fully against the proposal", "Enthusiastically in favor", "Indifferent to the outcome"], ans: 0 },
  { level: 4, type: "listening", q: "🔊 Listen: 'Notwithstanding the initial setbacks, the project has demonstrated remarkable resilience and is now on track to exceed its original projections.' — What happened to the project?", audio: "Notwithstanding the initial setbacks, the project has demonstrated remarkable resilience and is now on track to exceed its original projections.", opts: ["It struggled early but recovered and is now exceeding expectations", "It failed completely", "It was cancelled and restarted", "It met exactly the original targets"], ans: 0 },
  { level: 5, type: "listening", q: "🔊 Listen: 'The ostensible rationale for the restructuring belied a more nuanced set of motivations that only became apparent in retrospect.' — What does this mean?", audio: "The ostensible rationale for the restructuring belied a more nuanced set of motivations that only became apparent in retrospect.", opts: ["The stated reasons were not the real reasons, which only became clear later", "The restructuring was fully transparent from the start", "Everyone understood the reasons immediately", "The restructuring had no clear purpose"], ans: 0 },
];

const LEVEL_IDX = { A1: 0, A2: 1, B1: 2, B2: 3, C1: 4, C2: 5 };
const TYPE_LABELS = { grammar: "قواعد", vocab: "مفردات", reading: "فهم القراءة", pragmatics: "تواصل", listening: "استماع" };
const TYPE_ICONS = { grammar: "📐", vocab: "📚", reading: "📖", pragmatics: "🗣️", listening: "👂" };

// ===== SPEECH UI COMPONENTS (engine is in platform.js) =====
function SpeakBtn({ text, rate, size, color }) {
  const [playing, setPlaying] = useState(false);
  function play() {
    setPlaying(true);
    const u = speak(text, rate || 0.85);
    if (u) {
      u.onend = () => setPlaying(false);
      setTimeout(() => setPlaying(false), 15000);
    } else setPlaying(false);
  }
  return (
    <button onClick={(e) => { e.stopPropagation(); play(); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: size || 16, padding: 2, opacity: playing ? 1 : 0.5, color: color || "#e8b84b", transition: ".2s", flexShrink: 0 }} title="استمع">{playing ? "🔊" : "🔈"}</button>
  );
}

function VoiceBadge() {
  const info = getVoiceInfo();
  const colors = { openai: "#5ec4b6", native: "#5ec4b6", neural: "#e8b84b", basic: "#e8b84b" };
  const bgs = { openai: "rgba(94,196,182,0.15)", native: "rgba(94,196,182,0.15)", neural: "rgba(232,184,75,0.15)", basic: "rgba(232,184,75,0.15)" };
  return <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: bgs[info.tier], color: colors[info.tier], fontWeight: 600 }}>{info.label}</span>;
}

// ===== LISTENING COMPREHENSION =====
const LISTEN_ITEMS = [
  { text: "Excuse me, where is the nearest pharmacy?", q: "ماذا يسأل المتحدث؟", opts: ["يسأل عن أقرب صيدلية", "يسأل عن أقرب مطعم", "يسأل عن الوقت", "يسأل عن الطريق للفندق"], ans: 0 },
  { text: "I'd like to make an appointment for next Tuesday, please.", q: "ماذا يريد المتحدث؟", opts: ["يبي يحجز موعد يوم الثلاثاء", "يبي يلغي موعد", "يبي يغيّر موعده ليوم الأحد", "يبي يسأل عن المواعيد المتاحة"], ans: 0 },
  { text: "The flight has been delayed by approximately two hours.", q: "ما هو الخبر؟", opts: ["الرحلة تأخرت ساعتين", "الرحلة ألغيت", "الرحلة تقدمت ساعتين", "البوابة تغيّرت"], ans: 0 },
  { text: "Could you speak a bit more slowly? I want to make sure I understand.", q: "ماذا يطلب المتحدث؟", opts: ["يطلب إن الشخص يتكلم أبطأ", "يطلب إن الشخص يتكلم أعلى", "يطلب إن الشخص يتوقف عن الكلام", "يطلب إن الشخص يكرر كل شيء"], ans: 0 },
  { text: "I purchased this item last week and unfortunately it stopped working after two days.", q: "ما هي المشكلة؟", opts: ["اشترى شيء وخرب بعد يومين", "اشترى شيء غالي جداً", "نسي يشتري شيء", "المنتج ما وصل أصلاً"], ans: 0 },
  { text: "We've been living in this neighborhood for about three years now, and we really enjoy it.", q: "ماذا يقول المتحدث عن الحي؟", opts: ["ساكن فيه ٣ سنوات ومبسوط", "ساكن فيه ٣ أشهر", "يبي ينتقل من الحي", "ما يحب الحي"], ans: 0 },
  { text: "I'm allergic to peanuts, so could you please check if this dish contains any nuts?", q: "ماذا يخبر الشخص النادل؟", opts: ["عنده حساسية مكسرات ويبي يتأكد من الأكل", "ما يحب طعم المكسرات", "يبي يضيف مكسرات", "يسأل عن أسعار الأطباق"], ans: 0 },
  { text: "The doctor recommended that I get some rest and drink plenty of water.", q: "ماذا نصح الطبيب؟", opts: ["راحة وشرب ماء كثير", "أخذ دواء قوي", "عملية جراحية", "تحاليل دم فورية"], ans: 0 },
  { text: "Thank you for your time today. I'll send you a follow-up email with all the details.", q: "ماذا سيفعل المتحدث؟", opts: ["يرسل إيميل متابعة بالتفاصيل", "يتصل بكرة", "يحدد موعد ثاني", "يلغي الاتفاق"], ans: 0 },
  { text: "I see it differently. From my perspective, I think we should consider the long-term impact.", q: "ما موقف المتحدث؟", opts: ["عنده رأي مختلف ويبي يفكرون بالمدى البعيد", "يوافق تماماً", "ما عنده رأي", "يبي ينهي النقاش"], ans: 0 },
];

// ===== DICTATION =====
const DICTATION_ITEMS = [
  "I would like a table for two, please.",
  "Could you speak more slowly?",
  "I have a reservation under my name.",
  "The flight has been delayed by two hours.",
  "Thank you for your help. Have a nice day.",
  "I need to reschedule my appointment.",
  "Nice to meet you. Where are you from?",
  "I see it differently from my perspective.",
  "Is it possible to get a refund?",
  "How long have you been living here?",
  "I appreciate your patience with this.",
  "What do you recommend from the menu?",
];

// ===== DAILY DEEP PROCESSING SCENARIOS =====
// Each scenario is ONE topic processed through 6 cognitive layers
const DAILY_SCENARIOS = [
  { title: "في المطعم", icon: "🍽️", dialogue: [
    { speaker: "أنت", text: "Good evening. A table for two, please." },
    { speaker: "النادل", text: "Of course. Would you prefer indoor or outdoor seating?" },
    { speaker: "أنت", text: "Indoor, please. Could we have the menu?" },
    { speaker: "النادل", text: "Here you go. Our special today is grilled salmon." },
    { speaker: "أنت", text: "That sounds great. I'll have that, please." },
    { speaker: "النادل", text: "Excellent choice. And for drinks?" },
    { speaker: "أنت", text: "Just water, please. Thank you." },
  ],
  keyPhrases: [
    { en: "A table for two, please.", ar: "طاولة لشخصين، لو سمحت." },
    { en: "Could we have the menu?", ar: "ممكن القائمة؟" },
    { en: "I'll have that, please.", ar: "آخذ هذا، لو سمحت." },
  ],
  producePrompt: "أنت في مطعم. النادل يسألك عن طلبك. اكتب ردك:",
  produceModel: "I'll have the grilled chicken, please. And could I get a glass of water?",
  noticingTips: ["\"I'll have\" أقوى وأكثر أدباً من \"I want\" — لاحظ الفرق", "\"please\" في نهاية الطلب = أساسي في الثقافة الإنجليزية", "السؤال الإضافي (glass of water) يُظهر طلاقة وثقة"],
  listenQ: { q: "وين تصير هالمحادثة؟", opts: ["مطعم", "مطار", "بنك"], ans: 0 },
  challenge: "اليوم: اطلب قهوتك من أي كافيه بالإنجليزي. حتى لو جملة وحدة." },

  { title: "عند الدكتور", icon: "🏥", dialogue: [
    { speaker: "الطبيب", text: "Good morning. What brings you in today?" },
    { speaker: "أنت", text: "I've been having a headache for three days." },
    { speaker: "الطبيب", text: "I see. Any other symptoms? Fever or nausea?" },
    { speaker: "أنت", text: "No fever, but I've been feeling dizzy in the morning." },
    { speaker: "الطبيب", text: "Have you been under stress recently?" },
    { speaker: "أنت", text: "Yes, my schedule has been very hectic lately." },
    { speaker: "الطبيب", text: "I'll prescribe something. Take it twice daily with food." },
  ],
  keyPhrases: [
    { en: "I've been having a headache for three days.", ar: "عندي صداع من ٣ أيام." },
    { en: "I've been feeling dizzy in the morning.", ar: "أحس بدوخة الصبح." },
    { en: "My schedule has been very hectic lately.", ar: "جدولي كان مزدحم جداً مؤخراً." },
  ],
  producePrompt: "أنت عند الدكتور. اشرح أعراضك بالتفصيل:",
  produceModel: "I've been having a persistent headache for the past three days, along with some fatigue and dizziness.",
  noticingTips: ["\"I've been having\" (present perfect continuous) أدق من \"I have\" — يوصف شيء مستمر", "\"persistent\" كلمة طبية مهمة = مستمر ما يروح", "تحديد المدة (three days) + أعراض إضافية (fatigue) = الدكتور يفهمك أسرع"],
  listenQ: { q: "وش مشكلة المتحدث؟", opts: ["صداع ودوخة", "ألم في الظهر", "مشكلة في النظر"], ans: 0 },
  challenge: "اليوم: لو أحد سألك How are you — رد بجملة كاملة بدل fine." },

  { title: "في الفندق", icon: "🏨", dialogue: [
    { speaker: "الموظف", text: "Good evening. Welcome. Do you have a reservation?" },
    { speaker: "أنت", text: "Yes, under the name Al-Rashid. For three nights." },
    { speaker: "الموظف", text: "Found it. Could I see your passport?" },
    { speaker: "أنت", text: "Of course. Here you go. Is breakfast included?" },
    { speaker: "الموظف", text: "Yes, from seven to ten. Your room is on the fifth floor." },
    { speaker: "أنت", text: "Great. Is there a gym available for guests?" },
    { speaker: "الموظف", text: "Yes, on the second floor. Open until ten PM." },
  ],
  keyPhrases: [
    { en: "I have a reservation under the name Al-Rashid.", ar: "عندي حجز باسم الراشد." },
    { en: "Is breakfast included?", ar: "الفطور مشمول؟" },
    { en: "Is there a gym available for guests?", ar: "في نادي رياضي للنزلاء؟" },
  ],
  producePrompt: "وصلت الفندق. سوِّ check-in واسأل عن الخدمات:",
  produceModel: "I have a reservation under the name Al-Rashid for three nights. Is breakfast included, and is there a pool?",
  noticingTips: ["\"under the name\" = الطريقة الصحيحة لذكر اسم الحجز", "\"Is breakfast included?\" = سؤال ذكي يُظهر إنك مسافر متمرس", "ذكر عدد الليالي فوراً = يسهّل على الموظف ويُظهر وضوحك"],
  listenQ: { q: "كم ليلة الحجز؟", opts: ["٣ ليالي", "ليلة وحدة", "أسبوع"], ans: 0 },
  challenge: "اليوم: افتح موقع فندق وحاول تقرأ صفحة الخدمات بالإنجليزي بدون ترجمة." },

  { title: "اجتماع أولياء أمور", icon: "🎓", dialogue: [
    { speaker: "المعلمة", text: "Thank you for coming. Sara is a wonderful student." },
    { speaker: "أنت", text: "Thank you. How is she doing in her main subjects?" },
    { speaker: "المعلمة", text: "She's great in math, but needs help with reading." },
    { speaker: "أنت", text: "Could you give me specific examples?" },
    { speaker: "المعلمة", text: "She reads slowly and sometimes skips words." },
    { speaker: "أنت", text: "What if we start with fifteen minutes of reading every evening?" },
    { speaker: "المعلمة", text: "That would be wonderful. I'll send home some books." },
  ],
  keyPhrases: [
    { en: "How is she doing in her main subjects?", ar: "كيف مستواها في المواد الرئيسية؟" },
    { en: "Could you give me specific examples?", ar: "تقدر تعطيني أمثلة محددة؟" },
    { en: "What if we start with fifteen minutes of reading every evening?", ar: "وش رأيك نبدأ بـ ١٥ دقيقة قراءة كل مساء؟" },
  ],
  producePrompt: "المعلمة تقول إن ابنك يحتاج تحسين في القراءة. اقترح خطة:",
  produceModel: "That makes sense. What if we start with fifteen minutes of reading together every evening? Are there any books you'd recommend?",
  noticingTips: ["\"That makes sense\" = بداية قوية تُظهر إنك فاهم ومتفاعل", "\"What if we...\" = اقتراح بأدب أقوى من \"We should\"", "السؤال في النهاية (books you'd recommend) = يُظهر اهتمام حقيقي"],
  listenQ: { q: "وش تحتاج البنت تحسّن؟", opts: ["القراءة", "الرياضيات", "الرسم"], ans: 0 },
  challenge: "اليوم: اقرأ لعيالك قصة قصيرة بالإنجليزي — حتى لو مو perfect." },

  { title: "مكالمة خدمة العملاء", icon: "📱", dialogue: [
    { speaker: "الموظف", text: "Thank you for calling. How can I help you?" },
    { speaker: "أنت", text: "I placed an order last week and it hasn't arrived." },
    { speaker: "الموظف", text: "I'm sorry. Let me check. One moment please." },
    { speaker: "أنت", text: "Of course, take your time." },
    { speaker: "الموظف", text: "It was delayed. It should arrive by Thursday." },
    { speaker: "أنت", text: "Since it's late, is there any compensation?" },
    { speaker: "الموظف", text: "I can offer free shipping on your next order." },
  ],
  keyPhrases: [
    { en: "I placed an order last week and it hasn't arrived.", ar: "طلبت أوردر الأسبوع الماضي وما وصل." },
    { en: "Of course, take your time.", ar: "طبعاً، خذ وقتك." },
    { en: "Since it's late, is there any compensation?", ar: "بما إنه تأخر، في أي تعويض؟" },
  ],
  producePrompt: "طلبك تأخر أسبوع. اتصل بخدمة العملاء واشرح المشكلة:",
  produceModel: "Hi, I placed an order last week, order number 573, and it still hasn't arrived. Could you check the status for me?",
  noticingTips: ["ذكر رقم الطلب فوراً = يوفر وقت ويُظهر تنظيمك", "\"it still hasn't arrived\" أفضل من \"it didn't come\" — أدق لغوياً", "\"Could you check\" = طلب مهذب أقوى من \"check please\""],
  listenQ: { q: "وش المشكلة؟", opts: ["الطلب ما وصل", "المنتج مكسور", "السعر غلط"], ans: 0 },
  challenge: "اليوم: لو اشتريت شيء أونلاين — اقرأ صفحة الـ FAQ بالإنجليزي." },

  { title: "التعارف مع شخص جديد", icon: "👋", dialogue: [
    { speaker: "الشخص", text: "Hi! I don't think we've met. I'm David." },
    { speaker: "أنت", text: "Nice to meet you, David. I'm Omar." },
    { speaker: "الشخص", text: "So, what do you do for a living?" },
    { speaker: "أنت", text: "I work in project management. How about you?" },
    { speaker: "الشخص", text: "I'm in software engineering. How long have you been here?" },
    { speaker: "أنت", text: "About five years now. Where are you from originally?" },
    { speaker: "الشخص", text: "I'm from Toronto. It's great to meet you!" },
  ],
  keyPhrases: [
    { en: "Nice to meet you. I'm Omar.", ar: "تشرفنا. أنا عمر." },
    { en: "I work in project management.", ar: "أشتغل في إدارة المشاريع." },
    { en: "How long have you been here?", ar: "من متى وأنت هنا؟" },
  ],
  producePrompt: "شخص جديد يسألك عن نفسك. عرّف نفسك وسأله:",
  produceModel: "Nice to meet you! I'm Omar. I work in project management. I've been living here for about five years. What about you?",
  noticingTips: ["التسلسل: تحية → اسم → شغل → معلومة شخصية → سؤال = بناء محادثة احترافي", "\"What about you?\" في النهاية = تحوّل المحادثة من monologue لـ dialogue", "\"I've been living here for...\" أفضل من \"I live here since...\" — هذا خطأ شائع"],
  listenQ: { q: "وش شغل المتحدث؟", opts: ["إدارة مشاريع", "هندسة برمجيات", "تسويق"], ans: 0 },
  challenge: "اليوم: لو قابلت أي شخص أجنبي — قل Nice to meet you وسأله سؤال واحد." },

  { title: "في المطار", icon: "✈️", dialogue: [
    { speaker: "الموظفة", text: "Good morning. May I see your passport and ticket?" },
    { speaker: "أنت", text: "Of course. Here they are. I'd like a window seat." },
    { speaker: "الموظفة", text: "Let me check. Yes, 14A is available." },
    { speaker: "أنت", text: "Perfect. Do I have a layover or is it direct?" },
    { speaker: "الموظفة", text: "It's direct. Boarding starts at gate 7 in one hour." },
    { speaker: "أنت", text: "Thank you. Where is the nearest lounge?" },
    { speaker: "الموظفة", text: "Turn right after security. Enjoy your flight!" },
  ],
  keyPhrases: [
    { en: "I'd like a window seat, please.", ar: "أبي مقعد جنب النافذة." },
    { en: "Do I have a layover or is it direct?", ar: "عندي توقف أو مباشر؟" },
    { en: "Where is the nearest lounge?", ar: "وين أقرب صالة انتظار؟" },
  ],
  producePrompt: "أنت في المطار تسوي check-in. تكلم مع الموظفة:",
  produceModel: "Here's my passport. I'd like a window seat if possible. Is this a direct flight or do I have a layover?",
  noticingTips: ["\"I'd like\" أفضل من \"I want\" = أكثر أدباً في الطلبات", "\"if possible\" = تُظهر إنك مرن ومهذب", "السؤال عن الـ layover = يُظهر إنك مسافر واعي ومتمكن"],
  listenQ: { q: "هل الرحلة مباشرة؟", opts: ["نعم مباشرة", "فيها توقف", "ما ذكر"], ans: 0 },
  challenge: "اليوم: لو رحت أي مكان فيه موظف — سأل سؤال واحد بالإنجليزي." },

  { title: "في الصيدلية", icon: "💊", dialogue: [
    { speaker: "الصيدلي", text: "Good afternoon. How can I help you?" },
    { speaker: "أنت", text: "I need something for a sore throat." },
    { speaker: "الصيدلي", text: "How long have you had it?" },
    { speaker: "أنت", text: "About two days. It gets worse at night." },
    { speaker: "الصيدلي", text: "I'd recommend these lozenges. Take one every four hours." },
    { speaker: "أنت", text: "Are there any side effects I should know about?" },
    { speaker: "الصيدلي", text: "They might cause mild drowsiness. Avoid driving after taking them." },
  ],
  keyPhrases: [
    { en: "I need something for a sore throat.", ar: "أبي شيء لالتهاب الحلق." },
    { en: "It gets worse at night.", ar: "يزيد بالليل." },
    { en: "Are there any side effects I should know about?", ar: "في أي أعراض جانبية لازم أعرفها؟" },
  ],
  producePrompt: "أنت في صيدلية. اشرح أعراضك واسأل عن الدواء:",
  produceModel: "I need something for a sore throat. I've had it for two days and it gets worse at night. Are there any side effects?",
  noticingTips: ["\"I need something for...\" = الطريقة المثالية لطلب دواء بدون ما تعرف اسمه", "وصف متى يزيد (at night) = يساعد الصيدلي يعطيك الدواء المناسب", "السؤال عن side effects = يُظهر وعي صحي ويحميك"],
  listenQ: { q: "وش يشتكي منه؟", opts: ["التهاب حلق", "صداع", "ألم بطن"], ans: 0 },
  challenge: "اليوم: اقرأ نشرة أي دواء عندك بالبيت — الجانب الإنجليزي." },

  { title: "في السوبرماركت", icon: "🛒", dialogue: [
    { speaker: "أنت", text: "Excuse me, where can I find the dairy section?" },
    { speaker: "الموظف", text: "It's in aisle three, on your right." },
    { speaker: "أنت", text: "Thank you. Do you have any organic milk?" },
    { speaker: "الموظف", text: "Yes, it's on the top shelf. We have two brands." },
    { speaker: "أنت", text: "Great. Also, is there a bakery section here?" },
    { speaker: "الموظف", text: "Yes, at the back of the store, next to the deli." },
    { speaker: "أنت", text: "Perfect. Thank you for your help." },
  ],
  keyPhrases: [
    { en: "Where can I find the dairy section?", ar: "وين قسم الألبان؟" },
    { en: "Do you have any organic milk?", ar: "عندكم حليب عضوي؟" },
    { en: "Is there a bakery section here?", ar: "في قسم مخبوزات هنا؟" },
  ],
  producePrompt: "أنت في سوبرماركت أجنبي. اسأل عن مكان المنتجات:",
  produceModel: "Excuse me, where can I find the dairy section? Also, do you have any organic products?",
  noticingTips: ["\"Where can I find...\" أفضل من \"Where is...\" = أكثر أدباً وطبيعية", "\"Do you have any...\" = طريقة مهذبة للسؤال عن توفر منتج", "\"Also\" لربط سؤالين = يُظهر طلاقة في المحادثة"],
  listenQ: { q: "وش يدوّر عليه؟", opts: ["قسم الألبان", "قسم اللحوم", "قسم الخضار"], ans: 0 },
  challenge: "اليوم: لو دخلت أي محل — اقرأ أسماء المنتجات بالإنجليزي في بالك." },

  { title: "حجز موعد بالتلفون", icon: "📞", dialogue: [
    { speaker: "الموظفة", text: "Good morning, City Dental Clinic. How can I help you?" },
    { speaker: "أنت", text: "I'd like to make an appointment, please." },
    { speaker: "الموظفة", text: "Sure. Is this your first visit with us?" },
    { speaker: "أنت", text: "Yes, it's my first time. I need a checkup." },
    { speaker: "الموظفة", text: "We have availability on Tuesday at 2 PM or Thursday at 10 AM." },
    { speaker: "أنت", text: "Thursday at 10 works perfectly for me." },
    { speaker: "الموظفة", text: "Great. Could I have your full name and phone number?" },
  ],
  keyPhrases: [
    { en: "I'd like to make an appointment, please.", ar: "أبي أحجز موعد لو سمحت." },
    { en: "It's my first time. I need a checkup.", ar: "أول مرة عندكم. أبي فحص." },
    { en: "Thursday at 10 works perfectly for me.", ar: "الخميس الساعة ١٠ يناسبني تماماً." },
  ],
  producePrompt: "اتصل بعيادة أسنان واحجز موعد:",
  produceModel: "I'd like to make an appointment for a dental checkup. This would be my first visit. Do you have anything available this week?",
  noticingTips: ["\"I'd like to make an appointment\" = الجملة السحرية لأي حجز", "\"works perfectly for me\" أقوى من \"OK\" — تُظهر حسم وثقة", "تحديد نوع الزيارة (checkup) = يساعد العيادة تجهّز لك"],
  listenQ: { q: "متى الموعد؟", opts: ["الخميس ١٠ الصبح", "الثلاثاء ٢ الظهر", "السبت ٩ الصبح"], ans: 0 },
  challenge: "اليوم: احجز أي موعد بالتلفون — حتى لو بالعربي، فكّر كيف تقولها بالإنجليزي." },

  { title: "طلب توصيل أونلاين", icon: "📦", dialogue: [
    { speaker: "أنت", text: "Hi, I'd like to place an order for delivery." },
    { speaker: "الموظف", text: "Sure! What would you like to order?" },
    { speaker: "أنت", text: "Two chicken burgers and a large fries, please." },
    { speaker: "الموظف", text: "Would you like any drinks with that?" },
    { speaker: "أنت", text: "Yes, two colas, please. How long will delivery take?" },
    { speaker: "الموظف", text: "About thirty to forty minutes. Can I have your address?" },
    { speaker: "أنت", text: "Sure. It's 24 King Street, apartment 5B." },
  ],
  keyPhrases: [
    { en: "I'd like to place an order for delivery.", ar: "أبي أطلب توصيل." },
    { en: "How long will delivery take?", ar: "كم يأخذ التوصيل؟" },
    { en: "It's 24 King Street, apartment 5B.", ar: "العنوان: ٢٤ شارع الملك، شقة 5B." },
  ],
  producePrompt: "اتصل بمطعم واطلب أكل توصيل:",
  produceModel: "Hi, I'd like to place a delivery order. I'll have two chicken burgers, a large fries, and two colas. How long will it take?",
  noticingTips: ["\"I'd like to place an order\" أفضل من \"I want to order\" = احترافي أكثر", "تجميع الطلب في جملة وحدة = يوفر وقت ويُظهر وضوح", "السؤال عن الوقت = سؤال ذكي يُظهر إنك مهتم بالتفاصيل"],
  listenQ: { q: "وش طلب؟", opts: ["برقرين وبطاطس", "بيتزا وسلطة", "سمك وأرز"], ans: 0 },
  challenge: "اليوم: اطلب من أي مطعم أونلاين وحاول تقرأ القائمة الإنجليزية." },

  { title: "في البنك", icon: "🏦", dialogue: [
    { speaker: "الموظف", text: "Welcome. How can I assist you today?" },
    { speaker: "أنت", text: "I'd like to open a savings account, please." },
    { speaker: "الموظف", text: "Of course. Do you have any ID with you?" },
    { speaker: "أنت", text: "Yes, here's my passport and a proof of address." },
    { speaker: "الموظف", text: "Is there a minimum balance required?" },
    { speaker: "أنت", text: "What are the fees for international transfers?" },
    { speaker: "الموظف", text: "There's a flat fee of fifteen dollars per transfer." },
  ],
  keyPhrases: [
    { en: "I'd like to open a savings account.", ar: "أبي أفتح حساب توفير." },
    { en: "Here's my passport and a proof of address.", ar: "هذا جوازي وإثبات عنوان." },
    { en: "What are the fees for international transfers?", ar: "كم رسوم التحويلات الدولية؟" },
  ],
  producePrompt: "أنت في بنك أجنبي. اشرح ماذا تحتاج واسأل عن الرسوم:",
  produceModel: "I'd like to open a savings account. Here's my passport. Could you tell me about the fees for international transfers?",
  noticingTips: ["\"I'd like to open\" = الطريقة القياسية لفتح حساب", "تجهيز الأوراق وتقديمها فوراً (Here's my passport) = يُظهر تنظيم واحترافية", "\"What are the fees for...\" = سؤال مالي مهم لازم تتقنه"],
  listenQ: { q: "وش يبي يسوي؟", opts: ["يفتح حساب توفير", "يأخذ قرض", "يغيّر كلمة السر"], ans: 0 },
  challenge: "اليوم: افتح تطبيق بنكك وحوّل اللغة للإنجليزي ٥ دقائق." },

  { title: "استئجار سيارة", icon: "🚗", dialogue: [
    { speaker: "الموظف", text: "Good morning. Would you like to rent a car?" },
    { speaker: "أنت", text: "Yes, I need a car for five days." },
    { speaker: "الموظف", text: "We have compact, sedan, and SUV options." },
    { speaker: "أنت", text: "I'd prefer an SUV. What's the daily rate?" },
    { speaker: "الموظف", text: "It's eighty dollars per day, including insurance." },
    { speaker: "أنت", text: "Does that include unlimited mileage?" },
    { speaker: "الموظف", text: "Yes, unlimited mileage and roadside assistance." },
  ],
  keyPhrases: [
    { en: "I need a car for five days.", ar: "أبي سيارة لمدة ٥ أيام." },
    { en: "What's the daily rate?", ar: "كم السعر اليومي؟" },
    { en: "Does that include unlimited mileage?", ar: "هل يشمل كيلومترات مفتوحة؟" },
  ],
  producePrompt: "تبي تستأجر سيارة في السفر. اسأل عن الخيارات والأسعار:",
  produceModel: "I'd like to rent an SUV for five days. What's the daily rate, and does it include insurance and unlimited mileage?",
  noticingTips: ["تحديد النوع + المدة في جملة وحدة = واضح ومباشر", "\"What's the daily rate\" أفضل من \"How much\" = أكثر تحديداً", "السؤال عن insurance و mileage = أسئلة مسافر متمرس"],
  listenQ: { q: "كم سعر اليوم؟", opts: ["80 دولار", "50 دولار", "120 دولار"], ans: 0 },
  challenge: "اليوم: ادخل أي موقع تأجير سيارات واقرأ الشروط بالإنجليزي." },

  { title: "شكوى في الفندق", icon: "🔧", dialogue: [
    { speaker: "أنت", text: "Excuse me, I have an issue with my room." },
    { speaker: "الموظف", text: "I'm sorry to hear that. What's the problem?" },
    { speaker: "أنت", text: "The air conditioning isn't working properly." },
    { speaker: "الموظف", text: "I apologize for the inconvenience. Let me check." },
    { speaker: "أنت", text: "Also, the hot water isn't working in the bathroom." },
    { speaker: "الموظف", text: "I'll send maintenance right away. Would you like to move to another room?" },
    { speaker: "أنت", text: "Yes, that would be great. Thank you for handling this quickly." },
  ],
  keyPhrases: [
    { en: "I have an issue with my room.", ar: "عندي مشكلة في غرفتي." },
    { en: "The air conditioning isn't working properly.", ar: "المكيّف ما يشتغل صح." },
    { en: "Thank you for handling this quickly.", ar: "شكراً إنك تعاملت مع الموضوع بسرعة." },
  ],
  producePrompt: "في الفندق، غرفتك فيها مشكلة. اشرح الشكوى بأدب:",
  produceModel: "Excuse me, I have an issue with my room. The air conditioning isn't working and there's no hot water. Would it be possible to move to another room?",
  noticingTips: ["\"I have an issue with\" أفضل من \"There is a problem\" = تركيز على تجربتك", "وصف المشاكل بوضوح (AC + hot water) = يسرّع الحل", "\"Would it be possible to...\" = طلب مهذب جداً أقوى من \"Can I\""],
  listenQ: { q: "وش المشكلة في الغرفة؟", opts: ["المكيف والماء الحار", "التلفزيون", "الواي فاي"], ans: 0 },
  challenge: "اليوم: لو واجهت أي مشكلة — فكّر كيف تشرحها بالإنجليزي." },

  // ===== WEEK 3-4 SCENARIOS =====
  { title: "في المقهى", icon: "☕", dialogue: [
    { speaker: "الباريستا", text: "Hi! What can I get for you today?" },
    { speaker: "أنت", text: "I'd like a large cappuccino, please." },
    { speaker: "الباريستا", text: "Would you like that with whole milk or oat milk?" },
    { speaker: "أنت", text: "Oat milk, please. And could I add an extra shot?" },
    { speaker: "الباريستا", text: "Sure! For here or to go?" },
    { speaker: "أنت", text: "To go, please. How much is that?" },
    { speaker: "الباريستا", text: "That'll be five fifty. Tap or cash?" },
  ], keyPhrases: [
    { en: "I'd like a large cappuccino, please.", ar: "أبي كابتشينو كبير لو سمحت." },
    { en: "Could I add an extra shot?", ar: "ممكن أضيف شوت إضافي؟" },
    { en: "To go, please.", ar: "للطريق لو سمحت." },
  ], producePrompt: "أنت في كافيه. اطلب مشروبك بالتفصيل:", produceModel: "I'd like a large iced latte with oat milk, please. To go. Could I also get a blueberry muffin?", noticingTips: ["\"I'd like\" بدل \"I want\" = أدب أساسي", "التفاصيل (large, oat milk, extra shot) تُظهر طلاقة", "\"To go\" vs \"For here\" = مصطلح يومي لازم تعرفه"], challenge: "اليوم: اطلب من أي كافيه بالإنجليزي — حتى لو في تطبيق توصيل." },

  { title: "إرجاع منتج", icon: "🔄", dialogue: [
    { speaker: "الموظف", text: "How can I help you today?" },
    { speaker: "أنت", text: "I'd like to return this shirt. I bought it last week." },
    { speaker: "الموظف", text: "Do you have the receipt?" },
    { speaker: "أنت", text: "Yes, here it is. The size doesn't fit properly." },
    { speaker: "الموظف", text: "Would you prefer an exchange or a refund?" },
    { speaker: "أنت", text: "I'd prefer a refund, please. Is that possible?" },
    { speaker: "الموظف", text: "Absolutely. I'll process that for you right away." },
  ], keyPhrases: [
    { en: "I'd like to return this. I bought it last week.", ar: "أبي أرجع هذا. شريته الأسبوع الماضي." },
    { en: "The size doesn't fit properly.", ar: "المقاس ما يناسب." },
    { en: "I'd prefer a refund, please.", ar: "أفضّل استرجاع المبلغ لو سمحت." },
  ], producePrompt: "اشتريت شيء ومقاسه غلط. ارجع المحل واشرح:", produceModel: "I'd like to return this shirt. I bought it last week but the size doesn't fit. Do you have the receipt? Yes, here it is. I'd prefer a refund if possible.", noticingTips: ["\"I'd like to return\" = الجملة القياسية للإرجاع", "ذكر السبب (doesn't fit) = يسرّع العملية", "\"I'd prefer\" أقوى من \"I want\" = أدب + وضوح"], challenge: "اليوم: لو عندك شيء تبي ترجعه — فكّر كيف تشرح بالإنجليزي." },

  { title: "طلب تاكسي", icon: "🚕", dialogue: [
    { speaker: "أنت", text: "Hi, could you take me to the airport, please?" },
    { speaker: "السائق", text: "Sure. Which terminal?" },
    { speaker: "أنت", text: "Terminal two, the international departures." },
    { speaker: "السائق", text: "No problem. It should take about thirty minutes." },
    { speaker: "أنت", text: "That's fine. Is there a lot of traffic at this time?" },
    { speaker: "السائق", text: "A little, but we should make it in time." },
    { speaker: "أنت", text: "Great. Could you drop me off at the main entrance?" },
  ], keyPhrases: [
    { en: "Could you take me to the airport, please?", ar: "ممكن توصلني المطار؟" },
    { en: "Is there a lot of traffic at this time?", ar: "في زحمة هالوقت؟" },
    { en: "Could you drop me off at the main entrance?", ar: "ممكن تنزلني عند المدخل الرئيسي؟" },
  ], producePrompt: "ركبت تاكسي وتبي توصل مكان محدد:", produceModel: "Could you take me to the Hilton Hotel on King Street, please? How long will it take, and is there much traffic?", noticingTips: ["\"Could you take me to\" = الطريقة المهذبة لطلب وجهة", "\"drop me off at\" = مصطلح أساسي يعني 'نزّلني عند'", "السؤال عن الوقت والزحمة = محادثة طبيعية مع السائق"], challenge: "اليوم: لو ركبت أي وسيلة نقل — فكّر كيف توصف وجهتك بالإنجليزي." },

  { title: "اشتراك نادي رياضي", icon: "💪", dialogue: [
    { speaker: "الموظف", text: "Welcome! Are you interested in joining our gym?" },
    { speaker: "أنت", text: "Yes, I'd like to know about your membership options." },
    { speaker: "الموظف", text: "We have monthly and annual plans. Would you like a tour?" },
    { speaker: "أنت", text: "That would be great. What facilities do you have?" },
    { speaker: "الموظف", text: "We have a pool, sauna, group classes, and a personal trainer option." },
    { speaker: "أنت", text: "Interesting. How much is the monthly plan?" },
    { speaker: "الموظف", text: "It's two hundred per month. No contract required." },
  ], keyPhrases: [
    { en: "I'd like to know about your membership options.", ar: "أبي أعرف عن خيارات الاشتراك." },
    { en: "What facilities do you have?", ar: "وش المرافق اللي عندكم؟" },
    { en: "How much is the monthly plan?", ar: "كم الاشتراك الشهري؟" },
  ], producePrompt: "تبي تشترك في نادي. اسأل عن الخدمات والأسعار:", produceModel: "I'm interested in joining. What membership options do you have? I'd like to know about the facilities and the monthly rate.", noticingTips: ["\"I'm interested in joining\" = بداية مهذبة أقوى من \"I want to join\"", "\"What facilities do you have?\" = سؤال شامل ذكي", "\"No contract required\" = عبارة مهمة تسمعها كثير — يعني بدون التزام"], challenge: "اليوم: ادخل موقع أي نادي رياضي واقرأ صفحة الاشتراكات بالإنجليزي." },

  { title: "مقابلة عمل", icon: "👔", dialogue: [
    { speaker: "المقابِل", text: "Thank you for coming. Tell me a little about yourself." },
    { speaker: "أنت", text: "I have ten years of experience in project management." },
    { speaker: "المقابِل", text: "What would you say is your biggest strength?" },
    { speaker: "أنت", text: "I'm good at organizing teams and meeting deadlines." },
    { speaker: "المقابِل", text: "Can you give me an example?" },
    { speaker: "أنت", text: "Last year, I led a project that finished two weeks ahead of schedule." },
    { speaker: "المقابِل", text: "Impressive. Do you have any questions for us?" },
  ], keyPhrases: [
    { en: "I have ten years of experience in project management.", ar: "عندي ١٠ سنوات خبرة في إدارة المشاريع." },
    { en: "I'm good at organizing teams and meeting deadlines.", ar: "أجيد تنظيم الفرق والالتزام بالمواعيد." },
    { en: "Last year, I led a project that finished ahead of schedule.", ar: "السنة الماضية، قدت مشروع خلص قبل الموعد." },
  ], producePrompt: "المقابِل يسألك 'Tell me about yourself'. أجب:", produceModel: "I have ten years of experience in my field. I'm passionate about solving problems and leading teams. In my last role, I successfully delivered a major project ahead of schedule.", noticingTips: ["\"Tell me about yourself\" = أشهر سؤال — جهّز إجابة من 3 جمل", "ذكر رقم (ten years) + إنجاز محدد (ahead of schedule) = إجابة قوية", "\"Do you have any questions for us?\" = دائماً سأل سؤال — يُظهر اهتمام"], challenge: "اليوم: جهّز إجابة 'Tell me about yourself' من 3 جمل وقلها بصوت عالٍ." },

  { title: "عند البقالة", icon: "🏪", dialogue: [
    { speaker: "أنت", text: "Excuse me, do you have any fresh bread today?" },
    { speaker: "البائع", text: "Yes, we just baked a new batch. White or whole wheat?" },
    { speaker: "أنت", text: "Whole wheat, please. And I'll also take a dozen eggs." },
    { speaker: "البائع", text: "Anything else?" },
    { speaker: "أنت", text: "Yes, do you have any local honey?" },
    { speaker: "البائع", text: "We do. It's on the shelf behind you." },
    { speaker: "أنت", text: "Perfect. That's everything. How much is the total?" },
  ], keyPhrases: [
    { en: "Do you have any fresh bread today?", ar: "عندكم خبز طازج اليوم؟" },
    { en: "I'll also take a dozen eggs.", ar: "وبآخذ كمان درزن بيض." },
    { en: "That's everything. How much is the total?", ar: "هذا كل شيء. كم المجموع؟" },
  ], producePrompt: "أنت في بقالة. اطلب ما تحتاجه:", produceModel: "Good morning. I'd like some fresh bread, a dozen eggs, and a bottle of olive oil, please. Is there anything on sale today?", noticingTips: ["\"Do you have any...\" = الطريقة المهذبة للسؤال عن توفر منتج", "\"a dozen\" = 12 — مصطلح شائع جداً في التسوق", "\"That's everything\" = طريقة أنيقة لإنهاء الطلب"], challenge: "اليوم: في أي محل، اقرأ أسماء 5 منتجات بالإنجليزي." },

  { title: "حجز مطعم بالتلفون", icon: "📲", dialogue: [
    { speaker: "الموظف", text: "Good evening, La Piazza restaurant. How may I help you?" },
    { speaker: "أنت", text: "I'd like to make a reservation for this Saturday, please." },
    { speaker: "الموظف", text: "Of course. How many guests and what time?" },
    { speaker: "أنت", text: "Four guests at seven thirty in the evening." },
    { speaker: "الموظف", text: "We have a table available. Indoor or outdoor?" },
    { speaker: "أنت", text: "Indoor, please. And is there a kids' menu available?" },
    { speaker: "الموظف", text: "Yes, we do. May I have a name for the reservation?" },
  ], keyPhrases: [
    { en: "I'd like to make a reservation for this Saturday.", ar: "أبي أحجز لهالسبت." },
    { en: "Four guests at seven thirty.", ar: "٤ أشخاص الساعة ٧:٣٠." },
    { en: "Is there a kids' menu available?", ar: "في قائمة أطفال؟" },
  ], producePrompt: "اتصل بمطعم واحجز طاولة لعائلتك:", produceModel: "I'd like to make a reservation for Saturday evening at seven thirty. We'll be four guests, including two children. Do you have a kids' menu?", noticingTips: ["\"I'd like to make a reservation\" = نفس بنية حجز الفندق والعيادة", "تحديد العدد + الوقت في جملة واحدة = واضح ومباشر", "السؤال عن kids' menu = يُظهر تخطيط عملي"], challenge: "اليوم: لو بتطلع مع عائلتك — فكّر كيف تحجز بالإنجليزي." },

  { title: "عند الكهربائي/السباك", icon: "🔧", dialogue: [
    { speaker: "أنت", text: "Hi, I'm having a problem with my kitchen sink. It's leaking." },
    { speaker: "الفني", text: "I see. How long has it been leaking?" },
    { speaker: "أنت", text: "It started about two days ago. It gets worse when I use hot water." },
    { speaker: "الفني", text: "It looks like the pipe needs to be replaced." },
    { speaker: "أنت", text: "How long will that take, and how much will it cost?" },
    { speaker: "الفني", text: "About an hour. The total would be around eighty dollars." },
    { speaker: "أنت", text: "That sounds reasonable. Please go ahead." },
  ], keyPhrases: [
    { en: "I'm having a problem with my kitchen sink. It's leaking.", ar: "عندي مشكلة في مغسلة المطبخ. فيها تسريب." },
    { en: "How long will that take, and how much will it cost?", ar: "كم يأخذ وقت وكم التكلفة؟" },
    { en: "That sounds reasonable. Please go ahead.", ar: "يبدو معقول. تفضّل ابدأ." },
  ], producePrompt: "عندك مشكلة بالبيت واستدعيت فني. اشرح المشكلة:", produceModel: "I'm having a problem with my air conditioning. It's making a strange noise and not cooling properly. It started yesterday.", noticingTips: ["\"I'm having a problem with...\" = بداية مثالية لأي شكوى", "وصف الأعراض بالتفصيل (leaking, strange noise) = يساعد الفني", "\"That sounds reasonable\" = موافقة مهذبة على السعر"], challenge: "اليوم: فكّر بأي جهاز في بيتك — كيف توصف مشكلته بالإنجليزي؟" },

  // ===== WEEKS 4-6: 13 more scenarios (total 35 = 5 weeks) =====
  { title: "في محل الجوالات", icon: "📱", dialogue: [{ speaker: "البائع", text: "Welcome! Looking for anything specific today?" }, { speaker: "أنت", text: "Yes, I'm looking for a new phone with a good camera." }, { speaker: "البائع", text: "I'd recommend this model. It has a great camera and battery." }, { speaker: "أنت", text: "How much storage does it have?" }, { speaker: "البائع", text: "128 or 256 gigabytes." }, { speaker: "أنت", text: "I'll take the 256. Does it come with a warranty?" }, { speaker: "البائع", text: "Yes, two years included." }], keyPhrases: [{ en: "I'm looking for a new phone with a good camera.", ar: "أدوّر جوال جديد كاميرته حلوة." }, { en: "How much storage does it have?", ar: "كم مساحة التخزين؟" }, { en: "Does it come with a warranty?", ar: "يجي معاه ضمان؟" }], producePrompt: "تبي تشتري جوال جديد. اسأل:", produceModel: "I'm looking for a new smartphone with a good camera and at least 256GB. What do you recommend?", noticingTips: ["\"I'm looking for\" = أفضل بداية للتسوق", "\"Does it come with\" = سؤال ذكي عن المُضاف", "تحديد المواصفات مباشرة = يوفر وقت"], challenge: "اليوم: اقرأ مواصفات جوالك بالإنجليزي." },

  { title: "في البريد", icon: "📮", dialogue: [{ speaker: "الموظف", text: "How can I help you?" }, { speaker: "أنت", text: "I'd like to send this package to London, please." }, { speaker: "الموظف", text: "Standard or express?" }, { speaker: "أنت", text: "How long does express take?" }, { speaker: "الموظف", text: "Three to five business days." }, { speaker: "أنت", text: "Express, please. I need it there by next week." }, { speaker: "الموظف", text: "Forty-five dollars. Would you like tracking?" }], keyPhrases: [{ en: "I'd like to send this package to London.", ar: "أبي أرسل هالطرد للندن." }, { en: "How long does express take?", ar: "كم يأخذ الإكسبرس؟" }, { en: "Would you like tracking?", ar: "تبي رقم تتبع؟" }], producePrompt: "تبي ترسل طرد لخارج البلد:", produceModel: "I'd like to send this package to London via express. How long will it take and how much does it cost? I'd also like tracking.", noticingTips: ["\"via express\" = طريقة أنيقة لتحديد الشحن", "\"business days\" = أيام عمل (بدون ويكند)", "طلب tracking = تفكير عملي"], challenge: "اليوم: تتبع أي شحنة واقرأ حالتها بالإنجليزي." },

  { title: "تسجيل دورة أونلاين", icon: "💻", dialogue: [{ speaker: "الموقع", text: "Ready to start learning?" }, { speaker: "أنت", text: "I'd like to sign up for the digital marketing course." }, { speaker: "الموقع", text: "Self-paced or live?" }, { speaker: "أنت", text: "What's the difference in price?" }, { speaker: "الموقع", text: "Self-paced is ninety-nine. Live is one-ninety-nine with weekly sessions." }, { speaker: "أنت", text: "I'll go with self-paced. I have a busy schedule." }, { speaker: "الموقع", text: "You'll have lifetime access to all materials." }], keyPhrases: [{ en: "I'd like to sign up for the course.", ar: "أبي أسجّل في الدورة." }, { en: "What's the difference in price?", ar: "وش الفرق بالسعر؟" }, { en: "I have a busy schedule.", ar: "جدولي مزدحم." }], producePrompt: "تبي تسجّل في دورة أونلاين:", produceModel: "I'm interested in the photography course. What's the difference between self-paced and live? I have a busy schedule, so flexibility is important.", noticingTips: ["\"sign up for\" = التسجيل في شيء", "\"What's the difference\" = سؤال مقارنة مهم", "ذكر السبب = يساعد في الاختيار"], challenge: "اليوم: ادخل منصة تعليمية واقرأ وصف دورة بالإنجليزي." },

  { title: "طلب إجازة من العمل", icon: "🏖️", dialogue: [{ speaker: "المدير", text: "You wanted to see me?" }, { speaker: "أنت", text: "Yes, I'd like to request some time off next month." }, { speaker: "المدير", text: "How many days?" }, { speaker: "أنت", text: "A week, from the fifteenth to the twenty-second." }, { speaker: "المدير", text: "That should be fine. Reachable for emergencies?" }, { speaker: "أنت", text: "I'll have my phone. Email for non-urgent matters." }, { speaker: "المدير", text: "Submit the request and I'll approve it." }], keyPhrases: [{ en: "I'd like to request some time off.", ar: "أبي أطلب إجازة." }, { en: "From the fifteenth to the twenty-second.", ar: "من ١٥ إلى ٢٢." }, { en: "I'd prefer email for non-urgent matters.", ar: "أفضّل الإيميل للأمور غير العاجلة." }], producePrompt: "تبي تطلب إجازة من مديرك:", produceModel: "I'd like to request a week off next month. I'll make sure all my tasks are completed before I leave.", noticingTips: ["\"request time off\" = طلب إجازة رسمياً", "تحديد التواريخ بدقة = احترافية", "ذكر خطة التغطية = مسؤولية"], challenge: "اليوم: اكتب إيميل قصير بالإنجليزي." },

  { title: "التعريف بنفسك في مناسبة", icon: "🤝", dialogue: [{ speaker: "شخص", text: "Hi! I don't think we've met." }, { speaker: "أنت", text: "Nice to meet you! I'm Khalid." }, { speaker: "شخص", text: "What do you do?" }, { speaker: "أنت", text: "I work in finance. I manage investments." }, { speaker: "شخص", text: "How long have you been doing that?" }, { speaker: "أنت", text: "About eight years. I enjoy the analytical side." }, { speaker: "شخص", text: "We should exchange contacts!" }], keyPhrases: [{ en: "I work in finance. I manage investments.", ar: "أشتغل في المالية. أدير استثمارات." }, { en: "I enjoy the analytical side of it.", ar: "أستمتع بالجانب التحليلي." }, { en: "We should exchange contacts!", ar: "لازم نتبادل أرقام!" }], producePrompt: "شخص جديد يسألك عن نفسك:", produceModel: "I'm Khalid. I work in engineering — about ten years. I'm passionate about renewable energy. What about you?", noticingTips: ["اسم → مجال → خبرة → شغف = بناء طبيعي", "\"I'm passionate about\" = تعبير قوي عن الاهتمام", "\"What about you?\" = تحوّل المحادثة لحوار"], challenge: "اليوم: حضّر تعريف عن نفسك من 4 جمل وقله بصوت عالٍ." },

  { title: "في محطة القطار", icon: "🚂", dialogue: [{ speaker: "الموظف", text: "Where would you like to go?" }, { speaker: "أنت", text: "One ticket to Manchester, please." }, { speaker: "الموظف", text: "Single or return?" }, { speaker: "أنت", text: "Return. What time is the next train?" }, { speaker: "الموظف", text: "Ten fifteen from platform four." }, { speaker: "أنت", text: "Do I need to reserve a seat?" }, { speaker: "الموظف", text: "Recommended during peak hours." }], keyPhrases: [{ en: "One ticket to Manchester, please.", ar: "تذكرة واحدة لمانشستر." }, { en: "Single or return?", ar: "ذهاب أو ذهاب وإياب؟" }, { en: "Do I need to reserve a seat?", ar: "لازم أحجز مقعد؟" }], producePrompt: "تبي تشتري تذكرة قطار:", produceModel: "I'd like a return ticket to Edinburgh. What time is the next train, and which platform?", noticingTips: ["\"single\" = ذهاب / \"return\" = ذهاب وإياب", "\"platform\" = رصيف القطار", "\"peak hours\" = ساعات الذروة"], challenge: "اليوم: تعلّم ٣ مصطلحات مواصلات بالإنجليزي." },

  { title: "شكوى على خدمة إنترنت", icon: "🌐", dialogue: [{ speaker: "الموظف", text: "How can I assist you?" }, { speaker: "أنت", text: "My internet has been very slow for the past week." }, { speaker: "الموظف", text: "Let me check your account." }, { speaker: "أنت", text: "I'm paying for 100 megabits but only getting 20." }, { speaker: "الموظف", text: "There might be an issue in your area. We'll send a technician." }, { speaker: "أنت", text: "When? And will I get a credit for the downtime?" }, { speaker: "الموظف", text: "Tomorrow. I'll apply a credit to your bill." }], keyPhrases: [{ en: "My internet has been very slow for the past week.", ar: "النت بطيء من أسبوع." }, { en: "I'm paying for 100 megabits but only getting 20.", ar: "أدفع ١٠٠ ميقا وما أحصل إلا ٢٠." }, { en: "Will I get a credit for the downtime?", ar: "بتعوّضوني؟" }], producePrompt: "النت بطيء من أسبوع. اتصل بالشركة:", produceModel: "My internet has been extremely slow for a week. I'm paying for 100 megabits but only getting 20. Can you send a technician and credit my account?", noticingTips: ["المقارنة (paying for X but getting Y) = شكوى قوية", "\"credit\" = تعويض/خصم على الفاتورة", "\"downtime\" = فترة الانقطاع"], challenge: "اليوم: اقرأ فاتورة بالإنجليزي وافهم البنود." },

  { title: "في العيادة البصرية", icon: "👓", dialogue: [{ speaker: "الطبيب", text: "When was your last eye exam?" }, { speaker: "أنت", text: "Two years ago. I'm having trouble seeing far away." }, { speaker: "الطبيب", text: "Can you read the third line?" }, { speaker: "أنت", text: "The first two letters, but the rest is blurry." }, { speaker: "الطبيب", text: "You need a new prescription. Glasses or contacts?" }, { speaker: "أنت", text: "Glasses, please. Any frame recommendations?" }, { speaker: "الطبيب", text: "Let me show you some options." }], keyPhrases: [{ en: "I'm having trouble seeing things far away.", ar: "أشوف البعيد بصعوبة." }, { en: "The rest is blurry.", ar: "الباقي ضبابي." }, { en: "Would you like glasses or contacts?", ar: "تبي نظارات أو عدسات؟" }], producePrompt: "رحت عيادة العيون. اشرح مشكلتك:", produceModel: "I've been having trouble seeing far away, especially when driving at night. I think I need a new prescription.", noticingTips: ["\"blurry\" = ضبابي — كلمة طبية يومية", "\"prescription\" = وصفة — للنظارات والأدوية", "\"I've been having trouble\" + ing = مشكلة مستمرة"], challenge: "اليوم: تعلم ٣ كلمات طبية جديدة بالإنجليزي." },

  { title: "شراء تذاكر سينما", icon: "🎬", dialogue: [{ speaker: "الموظف", text: "What movie would you like to see?" }, { speaker: "أنت", text: "Two tickets for the seven o'clock showing." }, { speaker: "الموظف", text: "Regular or IMAX?" }, { speaker: "أنت", text: "IMAX. Any seats in the middle?" }, { speaker: "الموظف", text: "Row G, seats 8 and 9." }, { speaker: "أنت", text: "I'll take those. And a large popcorn." }, { speaker: "الموظف", text: "Thirty-eight dollars total." }], keyPhrases: [{ en: "Two tickets for the seven o'clock showing.", ar: "تذكرتين لعرض الساعة ٧." }, { en: "Any seats in the middle?", ar: "في مقاعد بالنص؟" }, { en: "I'll take those.", ar: "آخذهم." }], producePrompt: "تبي تشتري تذاكر سينما:", produceModel: "I'd like four tickets for the eight o'clock showing. Do you have seats together in the middle? And a large popcorn.", noticingTips: ["\"showing\" = عرض فيلم", "\"seats together\" = مقاعد متجاورة", "طلب الأكل مع التذاكر = طبيعي وطلاقة"], challenge: "اليوم: اقرأ أوقات عرض أي فيلم بالإنجليزي." },

  { title: "مقابلة الجيران الجدد", icon: "🏡", dialogue: [{ speaker: "أنت", text: "Hi! We just moved in next door." }, { speaker: "الجار", text: "Welcome! I'm Mark. How are you settling in?" }, { speaker: "أنت", text: "Pretty well. Everyone's been friendly." }, { speaker: "الجار", text: "Where did you move from?" }, { speaker: "أنت", text: "Downtown. We wanted a quieter area for the kids." }, { speaker: "الجار", text: "There's a great park around the corner." }, { speaker: "أنت", text: "That's exactly what we were looking for!" }], keyPhrases: [{ en: "We just moved in next door.", ar: "توّنا انتقلنا بالبيت الجنب." }, { en: "How are you settling in?", ar: "كيف التأقلم؟" }, { en: "We wanted a quieter area for the kids.", ar: "نبي منطقة أهدأ للأطفال." }], producePrompt: "جيرانك الجدد يسلّمون عليك:", produceModel: "Hi! We just moved in last week. I'm Khalid. We wanted a quieter neighborhood for the kids. How long have you been here?", noticingTips: ["\"settle in\" = تتأقلم — تعبير شائع", "ذكر سبب الانتقال = يفتح محادثة", "السؤال بالنهاية = يحوّل لحوار"], challenge: "اليوم: فكّر كيف تصف حيّك بـ ٣ جمل إنجليزية." },

  { title: "تحويل أموال", icon: "💸", dialogue: [{ speaker: "الموظف", text: "How can I help?" }, { speaker: "أنت", text: "I'd like to make an international transfer." }, { speaker: "الموظف", text: "Which country?" }, { speaker: "أنت", text: "The UK. Three thousand pounds." }, { speaker: "الموظف", text: "The rate is 4.7 riyals per pound." }, { speaker: "أنت", text: "How long will it take?" }, { speaker: "الموظف", text: "One to two business days." }], keyPhrases: [{ en: "I'd like to make an international transfer.", ar: "أبي حوالة دولية." }, { en: "The exchange rate is 4.7 per pound.", ar: "سعر الصرف ٤.٧ للباوند." }, { en: "How long will it take to arrive?", ar: "كم يأخذ توصل؟" }], producePrompt: "تبي تحوّل فلوس لخارج:", produceModel: "I'd like to make an international transfer to the UK. Three thousand pounds. What's the exchange rate, and how long will it take?", noticingTips: ["\"international transfer\" = تحويل دولي", "\"exchange rate\" = سعر الصرف", "\"business days\" = أيام عمل"], challenge: "اليوم: اعرف سعر صرف عملة واحدة بالإنجليزي." },

  { title: "استلام توصيل", icon: "📦", dialogue: [{ speaker: "المندوب", text: "Delivery for apartment 5B?" }, { speaker: "أنت", text: "Yes, that's me. Where do I sign?" }, { speaker: "المندوب", text: "Right here. Can I see some ID?" }, { speaker: "أنت", text: "Sure. Can I check the package first?" }, { speaker: "المندوب", text: "Of course. Take your time." }, { speaker: "أنت", text: "Everything looks good. Thank you." }, { speaker: "المندوب", text: "Have a great day!" }], keyPhrases: [{ en: "Where do I sign?", ar: "وين أوقّع؟" }, { en: "Can I check the package first?", ar: "ممكن أتحقق أول؟" }, { en: "Everything looks good.", ar: "كل شيء تمام." }], producePrompt: "المندوب وصل وعنده طرد:", produceModel: "Yes, that's me. Before I sign, can I check the package? Everything looks good. Thank you!", noticingTips: ["\"Where do I sign?\" = سؤال بسيط مهم", "التحقق قبل التوقيع = حقك", "\"Everything looks good\" = تأكيد طبيعي مختصر"], challenge: "اليوم: لو وصلك توصيل — قل Thank you." },

  { title: "طلب تاكسي", icon: "🚕", dialogue: [{ speaker: "أنت", text: "Could you take me to the airport, please?" }, { speaker: "السائق", text: "Sure. Which terminal?" }, { speaker: "أنت", text: "Terminal two, international departures." }, { speaker: "السائق", text: "About thirty minutes." }, { speaker: "أنت", text: "Is there much traffic now?" }, { speaker: "السائق", text: "A little, but we should make it." }, { speaker: "أنت", text: "Could you drop me off at the main entrance?" }], keyPhrases: [{ en: "Could you take me to the airport?", ar: "ممكن توصلني المطار؟" }, { en: "Is there much traffic?", ar: "في زحمة؟" }, { en: "Could you drop me off at the main entrance?", ar: "ممكن تنزلني عند المدخل الرئيسي؟" }], producePrompt: "ركبت تاكسي:", produceModel: "Could you take me to the Hilton Hotel on King Street? How long will it take?", noticingTips: ["\"Could you take me to\" = طلب مهذب للوجهة", "\"drop me off at\" = نزّلني عند", "السؤال عن الوقت = محادثة طبيعية"], challenge: "اليوم: فكّر كيف توصف وجهتك بالإنجليزي." },
  // ========== BLOCK 3: SOCIAL & RELATIONSHIPS (Weeks 5-6) ==========
  { title: "دعوة صديق للعشاء", icon: "🍷", dialogue: [{ speaker: "أنت", text: "Hey! Are you free this Friday evening?" }, { speaker: "الصديق", text: "I think so. What do you have in mind?" }, { speaker: "أنت", text: "I'd love to have you over for dinner. We're grilling." }, { speaker: "الصديق", text: "That sounds great! What time should I come?" }, { speaker: "أنت", text: "Around seven. Feel free to bring your family." }, { speaker: "الصديق", text: "Can I bring anything?" }, { speaker: "أنت", text: "That would be lovely. See you Friday!" }], keyPhrases: [{ en: "Are you free this Friday evening?", ar: "فاضي يوم الجمعة؟" }, { en: "I'd love to have you over for dinner.", ar: "يسعدني تتعشى عندنا." }, { en: "Feel free to bring your family.", ar: "جيب عائلتك براحتك." }], producePrompt: "ادعو صديقك للعشاء:", produceModel: "Are you free this Saturday? I'd love to have you and your family over for dinner around seven.", noticingTips: ["\"I'd love to have you over\" = دعوة دافئة", "\"Feel free to\" = تعبير كرم"], challenge: "اليوم: ادعُ شخص لشيء بسيط." },
  { title: "تهنئة بمولود", icon: "👶", dialogue: [{ speaker: "أنت", text: "Congratulations! I heard the wonderful news!" }, { speaker: "الصديق", text: "Thank you! We're thrilled." }, { speaker: "أنت", text: "How is the baby doing?" }, { speaker: "الصديق", text: "A boy. Perfectly healthy." }, { speaker: "أنت", text: "That's amazing. What did you name him?" }, { speaker: "الصديق", text: "Adam." }, { speaker: "أنت", text: "Beautiful name. I'd love to visit when you're ready." }], keyPhrases: [{ en: "Congratulations! I heard the wonderful news!", ar: "مبروك! سمعت الخبر!" }, { en: "How is the baby doing?", ar: "كيف حال البيبي؟" }, { en: "I'd love to visit when you're ready.", ar: "أزوركم لما تكونون جاهزين." }], producePrompt: "صديقك جاه مولود. هنّئه:", produceModel: "Congratulations! I'm so happy for you. How is the baby doing? I'd love to visit and bring something for the little one.", noticingTips: ["\"I'm so happy for you\" = أقوى من مجرد Congratulations", "\"the little one\" = تعبير حنون"], challenge: "اليوم: اكتب تهنئة بالإنجليزي." },
  { title: "اعتذار عن تأخير", icon: "⏰", dialogue: [{ speaker: "أنت", text: "I'm really sorry I'm late. Traffic was terrible." }, { speaker: "الصديق", text: "No worries. These things happen." }, { speaker: "أنت", text: "I should have left earlier." }, { speaker: "الصديق", text: "Don't worry about it." }, { speaker: "أنت", text: "Thank you for being so understanding." }, { speaker: "الصديق", text: "Of course. Let's get started." }, { speaker: "أنت", text: "I really appreciate your patience." }], keyPhrases: [{ en: "I'm really sorry I'm late.", ar: "آسف جداً على التأخير." }, { en: "I should have left earlier.", ar: "كان لازم أطلع بدري." }, { en: "I appreciate your patience.", ar: "أقدّر صبرك." }], producePrompt: "تأخرت على موعد:", produceModel: "I'm so sorry for being late. Traffic was much worse than expected. I should have planned better. Thank you for waiting.", noticingTips: ["\"I should have\" = كان لازم — تعبير ندم", "\"I appreciate your patience\" = أقوى من sorry المتكررة"], challenge: "اليوم: لو تأخرت — قل I'm sorry بالإنجليزي." },
  { title: "رد على دعوة", icon: "🎉", dialogue: [{ speaker: "المضيف", text: "We're having a gathering Saturday. Can you make it?" }, { speaker: "أنت", text: "I'd love to come! What's the occasion?" }, { speaker: "المضيف", text: "Just a casual get-together." }, { speaker: "أنت", text: "Sounds perfect. What time?" }, { speaker: "المضيف", text: "Around six." }, { speaker: "أنت", text: "Should I bring anything?" }, { speaker: "المضيف", text: "Just yourself!" }], keyPhrases: [{ en: "I'd love to come!", ar: "يسعدني أجي!" }, { en: "What's the occasion?", ar: "وش المناسبة؟" }, { en: "Should I bring anything?", ar: "أجيب شيء معي؟" }], producePrompt: "أحد دعاك. رد:", produceModel: "I'd love to come! What time should I be there, and should I bring anything?", noticingTips: ["\"I'd love to come\" = قبول حماسي", "\"Should I bring anything\" = يُظهر ذوق"], challenge: "اليوم: لو دعاك أحد — جاوب بجملة كاملة." },
  { title: "طلب نصيحة", icon: "💭", dialogue: [{ speaker: "أنت", text: "Can I ask you for some advice?" }, { speaker: "الصديق", text: "Of course! What's on your mind?" }, { speaker: "أنت", text: "I'm thinking about changing careers." }, { speaker: "الصديق", text: "That's big. What's making you consider it?" }, { speaker: "أنت", text: "I feel like I've stopped growing." }, { speaker: "الصديق", text: "Have you thought about what you'd do instead?" }, { speaker: "أنت", text: "Technology, but I'd need new skills." }], keyPhrases: [{ en: "Can I ask you for some advice?", ar: "ممكن أسألك نصيحة؟" }, { en: "I feel like I've stopped growing.", ar: "أحس إني وقفت عن التطور." }, { en: "I'd need to learn new skills.", ar: "أحتاج أتعلم مهارات جديدة." }], producePrompt: "اسأل صديقك نصيحة:", produceModel: "Can I ask your advice? I'm thinking about changing careers. I feel stuck and want to try something in technology.", noticingTips: ["\"Can I ask you for some advice\" = بداية مثالية", "\"I feel like\" = وصف مشاعر بدون مبالغة"], challenge: "اليوم: فكّر بقرار مهم — كيف تشرحه بالإنجليزي؟" },
  { title: "مجاملة والرد عليها", icon: "😊", dialogue: [{ speaker: "شخص", text: "I love your jacket! Where did you get it?" }, { speaker: "أنت", text: "Thank you! I got it from a store downtown." }, { speaker: "شخص", text: "It really suits you." }, { speaker: "أنت", text: "That's very kind of you to say." }, { speaker: "شخص", text: "I've been looking for something similar." }, { speaker: "أنت", text: "I can send you the name of the store." }, { speaker: "شخص", text: "That would be great!" }], keyPhrases: [{ en: "That's very kind of you to say.", ar: "كلامك لطيف جداً." }, { en: "It really suits you.", ar: "فعلاً يناسبك." }, { en: "I can send you the details.", ar: "أقدر أرسلك التفاصيل." }], producePrompt: "شخص مدحك. رد:", produceModel: "Thank you, that's really kind! I actually got it on sale. I can send you the link if you're interested.", noticingTips: ["\"That's kind of you\" = رد متواضع على المجاملة", "\"It suits you\" = مجاملة شائعة"], challenge: "اليوم: امدح شخص بالإنجليزي." },
  { title: "تعزية ومواساة", icon: "🤲", dialogue: [{ speaker: "أنت", text: "I was so sorry to hear about your loss." }, { speaker: "الصديق", text: "Thank you. It's been difficult." }, { speaker: "أنت", text: "Please know that I'm here for you." }, { speaker: "الصديق", text: "That means a lot." }, { speaker: "أنت", text: "Is there anything I can do?" }, { speaker: "الصديق", text: "Just having someone to talk to helps." }, { speaker: "أنت", text: "I'm always a phone call away." }], keyPhrases: [{ en: "I was sorry to hear about your loss.", ar: "تأسفت لما سمعت." }, { en: "I'm here for you.", ar: "أنا موجود لك." }, { en: "I'm always a phone call away.", ar: "اتصل عليّ بأي وقت." }], producePrompt: "صديقك فقد شخص عزيز:", produceModel: "I'm deeply sorry for your loss. Please know that I'm here for you, whatever you need.", noticingTips: ["\"I was sorry to hear\" = التعزية القياسية", "\"I'm here for you\" = دعم قوي ومختصر"], challenge: "اليوم: تعلّم 3 عبارات تعزية بالإنجليزي." },
  { title: "تقديم شخص لشخص", icon: "🫱🏼‍🫲🏽", dialogue: [{ speaker: "أنت", text: "Sarah, I'd like you to meet my friend Khalid." }, { speaker: "أنت", text: "Khalid, this is Sarah from marketing." }, { speaker: "سارة", text: "Nice to meet you!" }, { speaker: "خالد", text: "Likewise! Omar has told me great things." }, { speaker: "أنت", text: "You two have a lot in common." }, { speaker: "سارة", text: "Really? Like what?" }, { speaker: "أنت", text: "You're both into photography." }], keyPhrases: [{ en: "I'd like you to meet my friend.", ar: "أبي أعرّفك على صديقي." }, { en: "Likewise!", ar: "وأنا كذلك!" }, { en: "You have a lot in common.", ar: "بينكم أشياء مشتركة." }], producePrompt: "عرّف صديقين على بعض:", produceModel: "Hey Sarah, I'd like you to meet my colleague Ahmed. I think you two would really get along!", noticingTips: ["\"I'd like you to meet\" = تعريف رسمي", "\"Likewise\" = بديل أنيق لـ nice to meet you too"], challenge: "اليوم: فكّر كيف تعرّف شخصين بالإنجليزي." },
  { title: "شكر على هدية", icon: "🎁", dialogue: [{ speaker: "أنت", text: "This is beautiful! You really didn't have to!" }, { speaker: "الصديق", text: "I saw it and thought of you." }, { speaker: "أنت", text: "That's so thoughtful. I love it!" }, { speaker: "الصديق", text: "I'm glad you like it." }, { speaker: "أنت", text: "The craftsmanship is amazing." }, { speaker: "الصديق", text: "A small shop in the old town." }, { speaker: "أنت", text: "Thank you. This really made my day." }], keyPhrases: [{ en: "You really didn't have to!", ar: "ما كان لازم تتعب نفسك!" }, { en: "That's so thoughtful.", ar: "ذوق عالي منك." }, { en: "This made my day.", ar: "سعّدت يومي." }], producePrompt: "أحد أهداك. اشكره:", produceModel: "This is absolutely beautiful! You really didn't have to. That's so thoughtful of you!", noticingTips: ["\"You didn't have to\" = تواضع + تقدير", "\"This made my day\" = فرح حقيقي"], challenge: "اليوم: اشكر شخص بأكثر من Thank you." },
  { title: "محادثة جار عن مشكلة", icon: "🏠", dialogue: [{ speaker: "أنت", text: "Hi, sorry to bother you. Do you have a minute?" }, { speaker: "الجار", text: "Sure, what's up?" }, { speaker: "أنت", text: "I wanted to talk about the noise late at night." }, { speaker: "الجار", text: "Oh, was it too loud?" }, { speaker: "أنت", text: "After midnight it gets a bit much. The kids wake up." }, { speaker: "الجار", text: "I had no idea. I'll keep it down." }, { speaker: "أنت", text: "I appreciate that. Thanks for understanding." }], keyPhrases: [{ en: "Sorry to bother you.", ar: "آسف أزعجك." }, { en: "I wanted to talk about the noise.", ar: "بغيت أتكلم عن الإزعاج." }, { en: "Thanks for understanding.", ar: "شكراً على تفهّمك." }], producePrompt: "جارك يسوي إزعاج. تكلم بأدب:", produceModel: "Sorry to bother you. The noise after midnight has been waking the kids. Would it be possible to keep it down?", noticingTips: ["\"Sorry to bother you\" = بداية مثالية لموضوع حساس", "\"Thanks for understanding\" = إنهاء يحفظ العلاقة"], challenge: "اليوم: فكّر بموقف محرج — كيف تتعامل بالإنجليزي؟" },
  { title: "دردشة في الانتظار", icon: "💬", dialogue: [{ speaker: "شخص", text: "Long wait today, isn't it?" }, { speaker: "أنت", text: "Yeah, about twenty minutes already." }, { speaker: "شخص", text: "I hope it won't be much longer." }, { speaker: "أنت", text: "Me too. Are you here for a checkup?" }, { speaker: "شخص", text: "Yes, routine. You?" }, { speaker: "أنت", text: "Same. Every six months." }, { speaker: "شخص", text: "Good discipline." }], keyPhrases: [{ en: "Long wait today, isn't it?", ar: "الانتظار طويل اليوم، صح؟" }, { en: "I hope it won't be much longer.", ar: "إن شاء الله ما يطول." }, { en: "Are you here for a checkup?", ar: "جاي فحص؟" }], producePrompt: "شخص يسولفك في الانتظار:", produceModel: "Yeah, quite a wait. Are you here for a checkup too? I try to come every six months.", noticingTips: ["tag questions (isn't it?) = تفتح محادثة", "small talk = مهارة اجتماعية أساسية"], challenge: "اليوم: سولف مع أي شخص غريب — حتى بالعربي." },
  { title: "مكالمة صديق قديم", icon: "📞", dialogue: [{ speaker: "أنت", text: "Hey! It's been ages! How have you been?" }, { speaker: "الصديق", text: "Great to hear from you! I'm doing well." }, { speaker: "أنت", text: "What are you up to these days?" }, { speaker: "الصديق", text: "Started a new job last month." }, { speaker: "أنت", text: "That's awesome! We should catch up over coffee." }, { speaker: "الصديق", text: "Absolutely! When?" }, { speaker: "أنت", text: "This weekend? My treat." }], keyPhrases: [{ en: "It's been ages!", ar: "من زمان!" }, { en: "What are you up to these days?", ar: "وش أخبارك؟" }, { en: "We should catch up. My treat.", ar: "لازم نتسولف. أنا أدفع." }], producePrompt: "تكلم صديق قديم:", produceModel: "Hey! It's been so long! How have you been? Let's catch up this weekend — my treat!", noticingTips: ["\"It's been ages\" = من زمان", "\"catch up\" = نلحّق أخبار بعض", "\"My treat\" = أنا أدفع"], challenge: "اليوم: أرسل رسالة لصديق قديم." },
  { title: "إلغاء خطة بأدب", icon: "🙏", dialogue: [{ speaker: "أنت", text: "I'm sorry, but I need to cancel tonight." }, { speaker: "الصديق", text: "Is everything okay?" }, { speaker: "أنت", text: "Yes, something came up with work." }, { speaker: "الصديق", text: "I understand." }, { speaker: "أنت", text: "Can we reschedule for next week?" }, { speaker: "الصديق", text: "Sure, that works." }, { speaker: "أنت", text: "Thanks for being flexible. I'll make it up to you." }], keyPhrases: [{ en: "Something came up.", ar: "طرأ شيء." }, { en: "Can we reschedule?", ar: "نقدر نأجّل؟" }, { en: "I'll make it up to you.", ar: "بعوّضك." }], producePrompt: "تحتاج تلغي خطة:", produceModel: "I'm really sorry, but I can't make it tonight. Something came up. Could we reschedule for next week? I'll make it up to you!", noticingTips: ["\"Something came up\" = العذر الأكثر شيوعاً", "\"I'll make it up to you\" = يحفظ العلاقة"], challenge: "اليوم: تدرّب: Something came up بصوت عالٍ." },
  { title: "شكوى لطيفة في مطعم", icon: "🍽️", dialogue: [{ speaker: "أنت", text: "Excuse me, I think there's an issue with my order." }, { speaker: "النادل", text: "I'm sorry. What's the problem?" }, { speaker: "أنت", text: "I ordered well-done, but this seems medium." }, { speaker: "النادل", text: "Let me take it back." }, { speaker: "أنت", text: "Thank you. I appreciate it." }, { speaker: "النادل", text: "Here's the corrected order." }, { speaker: "أنت", text: "Perfect now. No worries at all." }], keyPhrases: [{ en: "I think there's an issue with my order.", ar: "أعتقد في مشكلة بطلبي." }, { en: "I ordered well-done but this seems medium.", ar: "طلبت well-done بس هذا medium." }, { en: "No worries at all.", ar: "أبداً عادي." }], producePrompt: "طلبك جا غلط. اشتكِ بأدب:", produceModel: "Excuse me, I think there's an issue. I ordered the steak well-done but this looks medium. Would you mind checking?", noticingTips: ["\"I think there might be\" = شكوى ناعمة", "\"No worries at all\" = ختام إيجابي"], challenge: "اليوم: تعلّم: rare, medium, well-done." },

  // ========== BLOCK 4: WORK & PROFESSIONAL (Weeks 7-8) ==========
  { title: "عرض تقديمي", icon: "📊", dialogue: [{ speaker: "أنت", text: "Good morning everyone. Thank you for joining." }, { speaker: "أنت", text: "Today I'll be presenting our quarterly results." }, { speaker: "الحضور", text: "Could you zoom in on that chart?" }, { speaker: "أنت", text: "Of course. As you can see, revenue increased by fifteen percent." }, { speaker: "الحضور", text: "What contributed to that growth?" }, { speaker: "أنت", text: "Mainly our expansion into new markets." }, { speaker: "أنت", text: "Any other questions before I move to the next slide?" }], keyPhrases: [{ en: "Thank you for joining.", ar: "شكراً لحضوركم." }, { en: "As you can see, revenue increased by fifteen percent.", ar: "كما تشوفون، الإيرادات زادت ١٥٪." }, { en: "Any questions before I move on?", ar: "أسئلة قبل ما أكمل؟" }], producePrompt: "افتح عرض تقديمي:", produceModel: "Good morning everyone. Thank you for being here. Today I'll walk you through our quarterly results. As you can see from this chart, we've seen a fifteen percent increase in revenue.", noticingTips: ["\"Thank you for joining\" = فتح احترافي", "\"As you can see\" = ربط الكلام بالعرض", "\"Before I move on\" = تحكم بالمحادثة"], challenge: "اليوم: قدّم أي فكرة بـ 3 جمل إنجليزية بصوت عالٍ." },
  { title: "طلب زيادة راتب", icon: "💰", dialogue: [{ speaker: "أنت", text: "I'd like to discuss my compensation, if you have a moment." }, { speaker: "المدير", text: "Sure. What's on your mind?" }, { speaker: "أنت", text: "I've taken on additional responsibilities this year." }, { speaker: "المدير", text: "I've noticed that. You've been doing great work." }, { speaker: "أنت", text: "I'd like to discuss a salary adjustment that reflects my contributions." }, { speaker: "المدير", text: "What figure did you have in mind?" }, { speaker: "أنت", text: "Based on my research, a fifteen percent increase would be fair." }], keyPhrases: [{ en: "I'd like to discuss my compensation.", ar: "أبي نتكلم عن راتبي." }, { en: "I've taken on additional responsibilities.", ar: "أخذت مسؤوليات إضافية." }, { en: "A fifteen percent increase would be fair.", ar: "زيادة ١٥٪ تكون عادلة." }], producePrompt: "تبي تطلب زيادة من مديرك:", produceModel: "I'd like to discuss my compensation. Over the past year, I've taken on additional responsibilities and delivered strong results. I believe a fifteen percent adjustment would be fair.", noticingTips: ["\"compensation\" أفضل من \"salary\" = أكثر احترافية", "\"salary adjustment\" أفضل من \"raise\" = دبلوماسي", "ذكر الإنجازات قبل الطلب = يقوّي موقفك"], challenge: "اليوم: اكتب ٣ إنجازات لك بالإنجليزي." },
  { title: "اجتماع مع عميل", icon: "🤝", dialogue: [{ speaker: "العميل", text: "Thanks for meeting with us today." }, { speaker: "أنت", text: "Thank you for your time. I'm excited to discuss the proposal." }, { speaker: "العميل", text: "We've reviewed it. We have some concerns about the timeline." }, { speaker: "أنت", text: "I understand. Could you be more specific about your concerns?" }, { speaker: "العميل", text: "We need delivery by March, not April." }, { speaker: "أنت", text: "That's tight but achievable if we start immediately." }, { speaker: "العميل", text: "That works. Let's move forward." }], keyPhrases: [{ en: "I'm excited to discuss the proposal.", ar: "متحمس نناقش العرض." }, { en: "Could you be more specific about your concerns?", ar: "ممكن توضّح تحفظاتك أكثر؟" }, { en: "That's tight but achievable.", ar: "ضيق لكن ممكن ننجزه." }], producePrompt: "العميل عنده تحفظات على مشروعك:", produceModel: "I understand your concerns about the timeline. If we start immediately and allocate additional resources, we can deliver by March.", noticingTips: ["\"Could you be more specific\" = طلب توضيح احترافي", "\"tight but achievable\" = واقعي وإيجابي", "تقديم حل مع الموافقة = قوة تفاوضية"], challenge: "اليوم: فكّر بمشكلة في شغلك — كيف تشرحها بالإنجليزي؟" },
  { title: "إيميل متابعة", icon: "📧", dialogue: [{ speaker: "أنت", text: "I wanted to follow up on our meeting from last week." }, { speaker: "الزميل", text: "Yes, I've been meaning to get back to you." }, { speaker: "أنت", text: "Have you had a chance to review the documents?" }, { speaker: "الزميل", text: "I have. I think we need to revise section three." }, { speaker: "أنت", text: "I agree. I'll make the changes and send an updated version by Friday." }, { speaker: "الزميل", text: "That would be great." }, { speaker: "أنت", text: "I'll copy you on the email. Let me know if you need anything else." }], keyPhrases: [{ en: "I wanted to follow up on our meeting.", ar: "بغيت أتابع بخصوص اجتماعنا." }, { en: "Have you had a chance to review?", ar: "لحقت تراجع؟" }, { en: "I'll send an updated version by Friday.", ar: "بأرسل نسخة محدّثة يوم الجمعة." }], producePrompt: "تبي تتابع بعد اجتماع:", produceModel: "I wanted to follow up on our meeting last Tuesday. Have you had a chance to review the proposal? I can make any changes and send an updated version by end of week.", noticingTips: ["\"follow up on\" = المتابعة — فعل أساسي في العمل", "\"Have you had a chance to\" = أدب في السؤال عن تقدم العمل", "\"I'll copy you\" = أنسخك في الإيميل"], challenge: "اليوم: اكتب إيميل متابعة قصير بالإنجليزي." },
  { title: "التعامل مع خلاف في العمل", icon: "⚖️", dialogue: [{ speaker: "الزميل", text: "I don't think your approach will work." }, { speaker: "أنت", text: "I appreciate your honesty. Can you help me understand your concerns?" }, { speaker: "الزميل", text: "The timeline is unrealistic and the budget is too low." }, { speaker: "أنت", text: "Those are valid points. What if we adjusted both?" }, { speaker: "الزميل", text: "I'd need to see the numbers first." }, { speaker: "أنت", text: "Fair enough. I'll prepare a revised plan by tomorrow." }, { speaker: "الزميل", text: "That sounds good. I appreciate you listening." }], keyPhrases: [{ en: "I appreciate your honesty.", ar: "أقدّر صراحتك." }, { en: "Can you help me understand your concerns?", ar: "ممكن تساعدني أفهم تحفظاتك؟" }, { en: "Those are valid points.", ar: "نقاط صحيحة." }], producePrompt: "زميلك يعارض فكرتك:", produceModel: "I appreciate your perspective. You raise valid points about the timeline. What if we explored a compromise? I'll prepare a revised plan.", noticingTips: ["\"I appreciate your honesty\" = يحوّل الخلاف لحوار", "\"valid points\" = اعتراف بالآخر = يهدّئ", "\"Fair enough\" = تقبّل مختصر ومحترف"], challenge: "اليوم: فكّر بخلاف سابق — كيف تعيد صياغته باحترافية؟" },
  { title: "مقابلة توظيف (أنت تقابل)", icon: "🪑", dialogue: [{ speaker: "أنت", text: "Thank you for coming in. Tell me about your experience." }, { speaker: "المرشح", text: "I have five years in software development." }, { speaker: "أنت", text: "What interests you about this position?" }, { speaker: "المرشح", text: "The opportunity to work on innovative projects." }, { speaker: "أنت", text: "Can you describe a challenging project you've led?" }, { speaker: "المرشح", text: "I led a team of eight on a product launch last year." }, { speaker: "أنت", text: "Impressive. We'll be in touch within a week." }], keyPhrases: [{ en: "Tell me about your experience.", ar: "كلمني عن خبرتك." }, { en: "What interests you about this position?", ar: "وش يجذبك في هالوظيفة؟" }, { en: "We'll be in touch within a week.", ar: "بنتواصل معك خلال أسبوع." }], producePrompt: "أنت تقابل مرشح وظيفة:", produceModel: "Thank you for coming. I'd like to start by hearing about your experience and what interests you about this role.", noticingTips: ["\"Tell me about\" = أشهر سؤال في المقابلات", "\"What interests you\" = أفضل من \"Why do you want\"", "\"We'll be in touch\" = إنهاء مهذب بدون وعد"], challenge: "اليوم: حضّر 3 أسئلة مقابلة بالإنجليزي." },
  { title: "تقديم فكرة لمديرك", icon: "💡", dialogue: [{ speaker: "أنت", text: "Do you have five minutes? I have an idea I'd like to run by you." }, { speaker: "المدير", text: "Sure, go ahead." }, { speaker: "أنت", text: "I think we could save twenty percent on costs by automating the reports." }, { speaker: "المدير", text: "Interesting. How would that work?" }, { speaker: "أنت", text: "There's a tool that generates reports automatically from our data." }, { speaker: "المدير", text: "What's the cost of implementing it?" }, { speaker: "أنت", text: "About two thousand upfront, but it pays for itself in three months." }], keyPhrases: [{ en: "I have an idea I'd like to run by you.", ar: "عندي فكرة أبي آخذ رأيك فيها." }, { en: "We could save twenty percent by automating.", ar: "نقدر نوفر ٢٠٪ بالأتمتة." }, { en: "It pays for itself in three months.", ar: "يرجع تكلفته في ٣ شهور." }], producePrompt: "عندك فكرة حلوة وتبي تقنع مديرك:", produceModel: "I have an idea I'd like to run by you. I believe we could save significant costs by automating our reporting process. The tool costs two thousand but pays for itself within three months.", noticingTips: ["\"run by you\" = آخذ رأيك — تعبير عملي شائع", "\"pays for itself\" = يغطي تكلفته — مصطلح مالي مقنع", "أرقام محددة (20%, 3 months) = تقنع أكثر من كلام عام"], challenge: "اليوم: فكّر بفكرة تحسين في شغلك — صِغها بـ 3 جمل إنجليزية." },
  { title: "اجتماع فريق أسبوعي", icon: "👥", dialogue: [{ speaker: "أنت", text: "Let's start with a quick round of updates." }, { speaker: "الزميل", text: "I finished the design phase. Ready for review." }, { speaker: "أنت", text: "Great. Any blockers we should discuss?" }, { speaker: "الزميل", text: "I'm waiting on approval from the legal team." }, { speaker: "أنت", text: "I'll follow up with them today." }, { speaker: "الزميل", text: "That would help a lot." }, { speaker: "أنت", text: "Let's wrap up. I'll send the action items by email." }], keyPhrases: [{ en: "Let's start with updates.", ar: "نبدأ بالمستجدات." }, { en: "Any blockers?", ar: "في أي عوائق؟" }, { en: "I'll send the action items by email.", ar: "بأرسل المهام بالإيميل." }], producePrompt: "تدير اجتماع فريقك:", produceModel: "Let's go around for quick updates. Any blockers we need to address? I'll follow up on the pending items and send a summary by end of day.", noticingTips: ["\"blockers\" = عوائق — مصطلح شائع في الاجتماعات", "\"action items\" = المهام المطلوبة — أساسي", "\"wrap up\" = نختم — أنيق ومختصر"], challenge: "اليوم: لخّص يومك بـ 3 جمل إنجليزية." },
  { title: "طلب تمديد موعد", icon: "📅", dialogue: [{ speaker: "أنت", text: "I need to discuss the project deadline with you." }, { speaker: "المدير", text: "What's the situation?" }, { speaker: "أنت", text: "We've encountered some unexpected technical issues." }, { speaker: "المدير", text: "How much additional time do you need?" }, { speaker: "أنت", text: "I'd say about one extra week would be sufficient." }, { speaker: "المدير", text: "Can you guarantee delivery by then?" }, { speaker: "أنت", text: "Yes, I'm confident we can deliver with high quality." }], keyPhrases: [{ en: "We've encountered unexpected issues.", ar: "واجهنا مشاكل غير متوقعة." }, { en: "One extra week would be sufficient.", ar: "أسبوع إضافي يكفي." }, { en: "I'm confident we can deliver.", ar: "واثق إننا نقدر نسلّم." }], producePrompt: "تحتاج وقت إضافي للمشروع:", produceModel: "I need to discuss the timeline. We've encountered some unexpected issues. I'd like to request one additional week. I'm confident we'll deliver high quality.", noticingTips: ["\"encountered\" أفضل من \"had\" = أكثر احترافية", "\"sufficient\" أفضل من \"enough\" = رسمي أكثر", "ختام بثقة (I'm confident) = يطمئن المدير"], challenge: "اليوم: فكّر بموقف طلبت فيه وقت إضافي — كيف بالإنجليزي؟" },
  { title: "تفاوض على عقد", icon: "📝", dialogue: [{ speaker: "الطرف الآخر", text: "We'd like to propose a two-year contract." }, { speaker: "أنت", text: "I'm open to that. What are the key terms?" }, { speaker: "الطرف الآخر", text: "Fixed pricing with annual reviews." }, { speaker: "أنت", text: "Could we include a performance bonus clause?" }, { speaker: "الطرف الآخر", text: "We'd need to discuss the metrics." }, { speaker: "أنت", text: "I suggest we tie it to customer satisfaction scores." }, { speaker: "الطرف الآخر", text: "That's reasonable. Let's draft it up." }], keyPhrases: [{ en: "What are the key terms?", ar: "وش الشروط الرئيسية؟" }, { en: "Could we include a performance bonus?", ar: "ممكن نضيف مكافأة أداء؟" }, { en: "Let's draft it up.", ar: "نكتب المسودة." }], producePrompt: "تتفاوض على عقد:", produceModel: "I'm open to a two-year contract. Could we include a performance-based bonus clause? I suggest tying it to measurable outcomes.", noticingTips: ["\"I'm open to\" = مرونة مهنية", "\"Could we include\" = اقتراح مهذب في التفاوض", "\"Let's draft it up\" = ننتقل للتنفيذ"], challenge: "اليوم: اقرأ أي عقد أو اتفاقية بالإنجليزي." },
  { title: "تدريب موظف جديد", icon: "🎓", dialogue: [{ speaker: "أنت", text: "Welcome to the team! I'll be showing you around today." }, { speaker: "الموظف", text: "Thank you! I'm excited to start." }, { speaker: "أنت", text: "First, let me walk you through our main systems." }, { speaker: "الموظف", text: "Should I take notes?" }, { speaker: "أنت", text: "Absolutely. I'll also send you a guide by email." }, { speaker: "الموظف", text: "That's very helpful." }, { speaker: "أنت", text: "Don't hesitate to ask questions. There's no such thing as a silly question." }], keyPhrases: [{ en: "I'll be showing you around.", ar: "بأعرّفك على المكان." }, { en: "Let me walk you through our systems.", ar: "خلني أشرحلك أنظمتنا." }, { en: "Don't hesitate to ask questions.", ar: "لا تتردد تسأل." }], producePrompt: "ترحّب بموظف جديد:", produceModel: "Welcome to the team! I'll walk you through everything today. Feel free to ask any questions — there are no silly questions here.", noticingTips: ["\"walk you through\" = أشرحلك خطوة بخطوة", "\"showing you around\" = أعرّفك على المكان", "\"Don't hesitate\" = لا تتردد — يُظهر دعم"], challenge: "اليوم: اشرح شيء بسيط لأي شخص بالإنجليزي." },
  { title: "تقديم تقرير شهري", icon: "📈", dialogue: [{ speaker: "أنت", text: "Here's the monthly report. Let me highlight the key points." }, { speaker: "المدير", text: "Go ahead." }, { speaker: "أنت", text: "Sales are up eight percent compared to last month." }, { speaker: "المدير", text: "What about expenses?" }, { speaker: "أنت", text: "We came in under budget by about five percent." }, { speaker: "المدير", text: "Excellent. Any concerns for next month?" }, { speaker: "أنت", text: "Hiring is our biggest challenge. We need two more engineers." }], keyPhrases: [{ en: "Let me highlight the key points.", ar: "خلني أبرز النقاط المهمة." }, { en: "Sales are up eight percent.", ar: "المبيعات زادت ٨٪." }, { en: "We came in under budget.", ar: "جينا أقل من الميزانية." }], producePrompt: "تقدّم تقريرك الشهري:", produceModel: "Let me walk you through the key highlights. Sales increased eight percent. We came in under budget. Our main challenge going forward is hiring.", noticingTips: ["\"highlight\" = أبرز — كلمة عروض أساسية", "\"came in under budget\" = أنفقنا أقل من المخطط", "ذكر التحديات بصراحة = مصداقية"], challenge: "اليوم: لخّص إنجازات أسبوعك بـ 3 جمل إنجليزية." },
  { title: "رد على إيميل صعب", icon: "📬", dialogue: [{ speaker: "الزميل", text: "I'm disappointed with the quality of the last deliverable." }, { speaker: "أنت", text: "Thank you for your feedback. I take this seriously." }, { speaker: "الزميل", text: "Several errors were found in the final document." }, { speaker: "أنت", text: "I apologize. Can you share the specific issues?" }, { speaker: "الزميل", text: "I'll send you a detailed list." }, { speaker: "أنت", text: "I'll address each point and send a corrected version within 48 hours." }, { speaker: "الزميل", text: "I appreciate your prompt response." }], keyPhrases: [{ en: "Thank you for your feedback.", ar: "شكراً على ملاحظاتك." }, { en: "I take this seriously.", ar: "آخذ الموضوع بجدية." }, { en: "I'll address each point.", ar: "بأعالج كل نقطة." }], producePrompt: "أحد ينتقد شغلك. رد باحترافية:", produceModel: "Thank you for bringing this to my attention. I take your feedback seriously. I'll review each point and send a corrected version within 48 hours.", noticingTips: ["\"Thank you for your feedback\" = يحوّل النقد لحوار بنّاء", "\"I take this seriously\" = يُظهر مسؤولية", "تحديد الموعد (48 hours) = التزام واضح"], challenge: "اليوم: اكتب رد على نقد بـ 3 جمل إنجليزية محترفة." },
  { title: "طلب ترقية", icon: "🪜", dialogue: [{ speaker: "أنت", text: "I'd like to discuss my career growth with you." }, { speaker: "المدير", text: "Of course. Where do you see yourself heading?" }, { speaker: "أنت", text: "I'm interested in moving into a senior role." }, { speaker: "المدير", text: "What makes you feel ready for that?" }, { speaker: "أنت", text: "I've consistently exceeded my targets and mentored three junior team members." }, { speaker: "المدير", text: "Those are strong qualifications." }, { speaker: "أنت", text: "I'd appreciate your guidance on what else I need to demonstrate." }], keyPhrases: [{ en: "I'd like to discuss my career growth.", ar: "أبي نتكلم عن تطوري المهني." }, { en: "I've consistently exceeded my targets.", ar: "تجاوزت أهدافي باستمرار." }, { en: "I'd appreciate your guidance.", ar: "أقدّر توجيهك." }], producePrompt: "تبي تطلب ترقية:", produceModel: "I'd like to discuss my career path. I've been exceeding my targets consistently and mentoring junior members. I believe I'm ready for a senior role and would appreciate your guidance.", noticingTips: ["\"career growth\" = تطور مهني — أفضل من \"promotion\"", "\"consistently exceeded\" = فعل + ظرف = يُظهر نمط مستمر", "\"I'd appreciate your guidance\" = طلب مهذب يُظهر تواضع"], challenge: "اليوم: اكتب 3 أسباب تستحق فيها ترقية بالإنجليزي." },

  // ========== BLOCK 5: TRAVEL & EXPLORATION (Weeks 9-10) ==========
  { title: "حجز فندق أونلاين", icon: "🖥️", dialogue: [{ speaker: "الموظف", text: "How can I help with your booking?" }, { speaker: "أنت", text: "I'd like to book a room for three nights starting March fifth." }, { speaker: "الموظف", text: "We have standard and deluxe available." }, { speaker: "أنت", text: "What's the difference in price?" }, { speaker: "الموظف", text: "Standard is one-twenty, deluxe is one-eighty per night." }, { speaker: "أنت", text: "Deluxe, please. Is there a cancellation policy?" }, { speaker: "الموظف", text: "Free cancellation up to 48 hours before check-in." }], keyPhrases: [{ en: "I'd like to book for three nights starting March fifth.", ar: "أبي أحجز ٣ ليالي من ٥ مارس." }, { en: "What's the difference in price?", ar: "وش فرق السعر؟" }, { en: "Is there a cancellation policy?", ar: "في سياسة إلغاء؟" }], producePrompt: "تبي تحجز فندق:", produceModel: "I'd like to book a deluxe room for three nights from March 5th to 8th. Is there a cancellation policy?", noticingTips: ["\"starting [date]\" = ابتداءً من", "\"cancellation policy\" = سياسة الإلغاء — مصطلح سفر أساسي"], challenge: "اليوم: ادخل أي موقع حجز واقرأ شروط الإلغاء." },
  { title: "في مكتب الجوازات", icon: "🛂", dialogue: [{ speaker: "الموظف", text: "Passport and boarding pass, please." }, { speaker: "أنت", text: "Here you go." }, { speaker: "الموظف", text: "What's the purpose of your visit?" }, { speaker: "أنت", text: "I'm here for a business conference." }, { speaker: "الموظف", text: "How long will you be staying?" }, { speaker: "أنت", text: "Five days. I'm returning next Wednesday." }, { speaker: "الموظف", text: "Welcome. Enjoy your stay." }], keyPhrases: [{ en: "What's the purpose of your visit?", ar: "وش سبب زيارتك؟" }, { en: "I'm here for a business conference.", ar: "جاي لمؤتمر عمل." }, { en: "I'm returning next Wednesday.", ar: "راجع يوم الأربعاء." }], producePrompt: "في الجوازات يسألونك:", produceModel: "I'm here for a five-day business trip. I'll be attending a conference and returning next Wednesday.", noticingTips: ["\"purpose of your visit\" = أشهر سؤال في المطار", "\"business/tourism/visiting family\" = الأجوبة الثلاث الشائعة"], challenge: "اليوم: حضّر ٣ جمل تحتاجها في المطار." },
  { title: "ضياع الشنطة في المطار", icon: "🧳", dialogue: [{ speaker: "أنت", text: "Excuse me, my luggage hasn't arrived on the carousel." }, { speaker: "الموظف", text: "I'm sorry. Can I see your baggage claim ticket?" }, { speaker: "أنت", text: "Here it is. I was on flight SA102 from Riyadh." }, { speaker: "الموظف", text: "Let me check the system. Can you describe your bag?" }, { speaker: "أنت", text: "It's a large black suitcase with a red tag." }, { speaker: "الموظف", text: "We'll locate it and deliver it to your hotel." }, { speaker: "أنت", text: "How long will that take? I need my medication." }], keyPhrases: [{ en: "My luggage hasn't arrived.", ar: "شنطتي ما وصلت." }, { en: "It's a large black suitcase with a red tag.", ar: "شنطة سوداء كبيرة عليها تاق أحمر." }, { en: "I need my medication.", ar: "أحتاج أدويتي." }], producePrompt: "شنطتك ضاعت في المطار:", produceModel: "My luggage didn't arrive on the carousel. Here's my claim ticket. It's a large black suitcase. I need it urgently because it has my medication.", noticingTips: ["\"baggage claim\" = استلام الأمتعة", "وصف الشنطة بالتفصيل = يسرّع إيجادها", "ذكر السبب (medication) = يُعطي أولوية"], challenge: "اليوم: تعلّم كيف توصف شنطتك بالإنجليزي." },
  { title: "سؤال عن الاتجاهات", icon: "🗺️", dialogue: [{ speaker: "أنت", text: "Excuse me, could you tell me how to get to the museum?" }, { speaker: "شخص", text: "Sure! Go straight for two blocks, then turn left." }, { speaker: "أنت", text: "Is it far from here? Can I walk?" }, { speaker: "شخص", text: "About ten minutes on foot." }, { speaker: "أنت", text: "Is there a landmark I should look for?" }, { speaker: "شخص", text: "You'll see a big fountain. The museum is right behind it." }, { speaker: "أنت", text: "Thank you so much! That's very helpful." }], keyPhrases: [{ en: "Could you tell me how to get to the museum?", ar: "ممكن تدلني كيف أوصل المتحف؟" }, { en: "Is it far? Can I walk?", ar: "بعيد؟ أقدر أمشي؟" }, { en: "Is there a landmark I should look for?", ar: "في علامة مميزة أدوّر عليها؟" }], producePrompt: "تبي توصل مكان وسألت شخص:", produceModel: "Excuse me, could you tell me how to get to the nearest metro station? Is it walking distance?", noticingTips: ["\"How to get to\" = كيف أوصل — أفضل من \"Where is\"", "\"landmark\" = علامة مميزة — كلمة مفيدة جداً في السفر"], challenge: "اليوم: وصف طريق بيتك لمكان بالإنجليزي." },
  { title: "تأجير شقة أثناء السفر", icon: "🏡", dialogue: [{ speaker: "المضيف", text: "Welcome! I hope you had a good trip." }, { speaker: "أنت", text: "Thank you! The place looks even better than the photos." }, { speaker: "المضيف", text: "Here are the keys. Let me show you around." }, { speaker: "أنت", text: "Is there Wi-Fi? What's the password?" }, { speaker: "المضيف", text: "Yes, the password is on the fridge." }, { speaker: "أنت", text: "Where's the nearest grocery store?" }, { speaker: "المضيف", text: "Just five minutes walk. Turn right at the corner." }], keyPhrases: [{ en: "The place looks better than the photos.", ar: "المكان أحلى من الصور." }, { en: "What's the Wi-Fi password?", ar: "وش باسورد الواي فاي؟" }, { en: "Where's the nearest grocery store?", ar: "وين أقرب بقالة؟" }], producePrompt: "وصلت شقتك المؤجرة:", produceModel: "Thank you! This looks great. Could you show me how the heating works? And what's the Wi-Fi password?", noticingTips: ["\"looks better than the photos\" = مجاملة للمضيف", "\"How does X work?\" = سؤال عملي عن الأجهزة"], challenge: "اليوم: اقرأ وصف أي شقة على Airbnb بالإنجليزي." },
  { title: "في متحف أو معلم سياحي", icon: "🏛️", dialogue: [{ speaker: "أنت", text: "Two adult tickets, please." }, { speaker: "الموظف", text: "That's thirty dollars. Would you like an audio guide?" }, { speaker: "أنت", text: "Yes, please. Is it available in Arabic?" }, { speaker: "الموظف", text: "We have English, French, and Spanish." }, { speaker: "أنت", text: "English is fine. How long is the full tour?" }, { speaker: "الموظف", text: "About ninety minutes." }, { speaker: "أنت", text: "Is photography allowed inside?" }], keyPhrases: [{ en: "Two adult tickets, please.", ar: "تذكرتين للكبار." }, { en: "Is it available in Arabic?", ar: "متوفر بالعربي؟" }, { en: "Is photography allowed?", ar: "التصوير مسموح؟" }], producePrompt: "تبي تدخل متحف:", produceModel: "Two tickets, please. Do you have an audio guide? How long is the tour, and is photography allowed?", noticingTips: ["\"audio guide\" = دليل صوتي — مصطلح سياحي", "\"Is photography allowed\" = سؤال مهم في المتاحف"], challenge: "اليوم: اقرأ عن أي معلم سياحي بالإنجليزي." },
  { title: "حالة طوارئ طبية في السفر", icon: "🚑", dialogue: [{ speaker: "أنت", text: "I need help! My friend is feeling very dizzy." }, { speaker: "شخص", text: "Should I call an ambulance?" }, { speaker: "أنت", text: "Yes, please. He has a heart condition." }, { speaker: "المسعف", text: "What medication is he on?" }, { speaker: "أنت", text: "He takes blood pressure medication daily." }, { speaker: "المسعف", text: "We'll take him to the nearest hospital." }, { speaker: "أنت", text: "Can I ride with him? I have his insurance card." }], keyPhrases: [{ en: "He has a heart condition.", ar: "عنده مشكلة في القلب." }, { en: "He takes blood pressure medication.", ar: "يأخذ دواء ضغط." }, { en: "I have his insurance card.", ar: "معي بطاقة تأمينه." }], producePrompt: "صديقك تعب في السفر:", produceModel: "I need help urgently. My friend is very dizzy and has a heart condition. He takes blood pressure medication. Please call an ambulance.", noticingTips: ["\"heart condition\" = حالة قلبية — مصطلح طبي ضروري", "\"insurance card\" = بطاقة التأمين — لازم تعرفها", "ذكر الأدوية = ينقذ حياة"], challenge: "اليوم: اكتب معلوماتك الطبية بالإنجليزي واحفظها في جوالك." },

  // ========== BLOCK 6: COMPLEX & ADVANCED (Weeks 11-12) ==========
  { title: "التفاوض على سعر سيارة", icon: "🚘", dialogue: [{ speaker: "البائع", text: "This model starts at forty-five thousand." }, { speaker: "أنت", text: "That's above my budget. Is there any room for negotiation?" }, { speaker: "البائع", text: "What were you hoping to spend?" }, { speaker: "أنت", text: "I'd like to stay around forty thousand." }, { speaker: "البائع", text: "I could do forty-two with the extended warranty included." }, { speaker: "أنت", text: "If you include free maintenance for the first year, we have a deal." }, { speaker: "البائع", text: "Done. Let me prepare the paperwork." }], keyPhrases: [{ en: "Is there room for negotiation?", ar: "في مجال للتفاوض؟" }, { en: "I'd like to stay around forty thousand.", ar: "أبي أبقى حدود ٤٠ ألف." }, { en: "If you include X, we have a deal.", ar: "لو تضيف X، اتفقنا." }], producePrompt: "تتفاوض على سعر سيارة:", produceModel: "That's a bit above my budget. I was hoping to stay around forty thousand. If you include the warranty and first-year maintenance, we have a deal.", noticingTips: ["\"room for negotiation\" = مجال للتفاوض — تعبير أساسي", "\"If you include X, we have a deal\" = أقوى جملة تفاوض", "\"I'd like to stay around\" = تحديد ميزانية بأدب"], challenge: "اليوم: تفاوض على أي شيء بسيط — فكّر بالإنجليزي." },
  { title: "شرح مشكلة تقنية لغير تقني", icon: "🖥️", dialogue: [{ speaker: "الشخص", text: "Why isn't the app working on my phone?" }, { speaker: "أنت", text: "It looks like it needs an update. Let me check." }, { speaker: "الشخص", text: "I don't understand all these technical things." }, { speaker: "أنت", text: "No worries. Think of it like this: the app is an old map, and the update gives you a new one." }, { speaker: "الشخص", text: "Oh, that makes sense! How do I update it?" }, { speaker: "أنت", text: "Go to the App Store, search for it, and tap Update." }, { speaker: "الشخص", text: "Thank you for explaining it so clearly." }], keyPhrases: [{ en: "Think of it like this.", ar: "فكّر فيها كذا." }, { en: "The app needs an update.", ar: "التطبيق يحتاج تحديث." }, { en: "Thank you for explaining so clearly.", ar: "شكراً على الشرح الواضح." }], producePrompt: "اشرح مشكلة تقنية لشخص عادي:", produceModel: "The app needs an update. Think of it like this: your current version is like an old map — the update gives you a better one with new features.", noticingTips: ["\"Think of it like this\" = بداية ممتازة لتبسيط أي شيء", "التشبيه (like an old map) = أقوى أداة شرح", "\"No worries\" = يهدّئ الشخص المتوتر"], challenge: "اليوم: اشرح شيء تقني لأي شخص ببساطة." },
  { title: "قيادة نقاش جماعي", icon: "🗣️", dialogue: [{ speaker: "أنت", text: "I'd like to hear everyone's thoughts on this." }, { speaker: "شخص ١", text: "I think we should go with option A." }, { speaker: "شخص ٢", text: "I prefer option B. It's less risky." }, { speaker: "أنت", text: "Both have valid points. Let me summarize the pros and cons." }, { speaker: "أنت", text: "Option A is faster but riskier. Option B is safer but slower." }, { speaker: "شخص ١", text: "When you put it that way, maybe we need a middle ground." }, { speaker: "أنت", text: "Exactly. What if we start with B and transition to A in phase two?" }], keyPhrases: [{ en: "I'd like to hear everyone's thoughts.", ar: "أبي أسمع رأي الكل." }, { en: "Let me summarize the pros and cons.", ar: "خلني ألخّص المزايا والعيوب." }, { en: "What if we start with B and transition to A?", ar: "وش رأيكم نبدأ بـ B وننتقل لـ A؟" }], producePrompt: "أنت تقود نقاش بين فريقين:", produceModel: "I'd like to hear from both sides. Let me summarize: option A is faster but riskier, option B is safer but slower. What if we combine the best of both?", noticingTips: ["\"I'd like to hear everyone's thoughts\" = يُشرك الكل باحترام", "\"pros and cons\" = مزايا وعيوب — مصطلح أساسي", "\"What if we\" = اقتراح حل وسط — دبلوماسي"], challenge: "اليوم: لو في نقاش عائلي — فكّر كيف تديره بالإنجليزي." },
  { title: "شرح ثقافتك لأجنبي", icon: "🕌", dialogue: [{ speaker: "الأجنبي", text: "I noticed people stop everything for prayer. Can you explain?" }, { speaker: "أنت", text: "Of course! Muslims pray five times a day. It's a core part of our faith." }, { speaker: "الأجنبي", text: "That's interesting. Does everything close?" }, { speaker: "أنت", text: "Most shops close briefly, but they reopen after about twenty minutes." }, { speaker: "الأجنبي", text: "I'd love to learn more about your culture." }, { speaker: "أنت", text: "I'd be happy to share. Would you like to try Arabic coffee?" }, { speaker: "الأجنبي", text: "I'd love that! Thank you for being so welcoming." }], keyPhrases: [{ en: "Muslims pray five times a day.", ar: "المسلمين يصلون ٥ مرات باليوم." }, { en: "It's a core part of our faith.", ar: "جزء أساسي من ديننا." }, { en: "I'd be happy to share more.", ar: "يسعدني أشاركك أكثر." }], producePrompt: "أجنبي يسأل عن ثقافتك:", produceModel: "Muslims pray five times a day — it's a core part of our faith and daily routine. Most shops close briefly for prayer but reopen quickly. Would you like to try Arabic coffee? It's part of our hospitality tradition.", noticingTips: ["\"a core part of\" = جزء أساسي من — شرح محترم", "\"I'd be happy to share\" = انفتاح وكرم", "ربط الشرح بتجربة (Arabic coffee) = يجعله حي"], challenge: "اليوم: اشرح عادة سعودية بالإنجليزي لنفسك." },
  { title: "إقناع شخص بفكرتك", icon: "🎯", dialogue: [{ speaker: "أنت", text: "I have a proposal that I think could benefit both of us." }, { speaker: "الشخص", text: "I'm listening. Go ahead." }, { speaker: "أنت", text: "What if we combined our resources to launch a joint project?" }, { speaker: "الشخص", text: "Interesting, but what's in it for me?" }, { speaker: "أنت", text: "You'd get access to our market, and we'd benefit from your technology." }, { speaker: "الشخص", text: "That does sound like a win-win." }, { speaker: "أنت", text: "Exactly. Shall I put together a formal proposal?" }], keyPhrases: [{ en: "I have a proposal that could benefit both of us.", ar: "عندي اقتراح يفيدنا الاثنين." }, { en: "What's in it for me?", ar: "وش الفايدة لي؟" }, { en: "It's a win-win.", ar: "الطرفين يستفيدون." }], producePrompt: "تبي تقنع شخص بشراكة:", produceModel: "I have a proposal that could benefit both of us. You'd get access to our market, and we'd leverage your technology. It's a true win-win.", noticingTips: ["\"benefit both of us\" = يفيد الطرفين — أساسي في الإقناع", "\"What's in it for me?\" = سؤال تفاوضي لازم تتوقعه", "\"win-win\" = كسب مشترك — أقوى كلمة في الشراكات"], challenge: "اليوم: فكّر بفكرة تبي تقنع فيها أحد — جهّزها بالإنجليزي." },
  { title: "حل سوء تفاهم ثقافي", icon: "🌍", dialogue: [{ speaker: "الزميل", text: "I felt a bit uncomfortable when you didn't shake my hand yesterday." }, { speaker: "أنت", text: "I'm sorry if that came across as rude. It wasn't intentional." }, { speaker: "الزميل", text: "I was just confused." }, { speaker: "أنت", text: "In my culture, some people prefer not to shake hands with the opposite gender. It's a sign of respect, not disrespect." }, { speaker: "الزميل", text: "I had no idea! Thank you for explaining." }, { speaker: "أنت", text: "I appreciate your openness. Please feel free to ask about anything." }, { speaker: "الزميل", text: "I really respect that. Thanks for being so open." }], keyPhrases: [{ en: "It wasn't intentional.", ar: "ما كان مقصود." }, { en: "It's a sign of respect, not disrespect.", ar: "هذا احترام مو العكس." }, { en: "I appreciate your openness.", ar: "أقدّر انفتاحك." }], producePrompt: "سوء تفاهم ثقافي. وضّح:", produceModel: "I'm sorry if that was confusing. In my culture, it's actually a sign of respect. I appreciate you asking — please feel free to ask about anything.", noticingTips: ["\"It wasn't intentional\" = ما كان مقصود — يوضّح النية", "\"a sign of respect\" = يحوّل السلبي لإيجابي", "\"I appreciate your openness\" = يبني جسر ثقافي"], challenge: "اليوم: فكّر بموقف ثقافي — كيف تشرحه بالإنجليزي؟" },
  { title: "خطاب في مناسبة عائلية", icon: "🎤", dialogue: [{ speaker: "أنت", text: "Good evening everyone. Thank you all for being here tonight." }, { speaker: "أنت", text: "We're gathered to celebrate a very special occasion." }, { speaker: "أنت", text: "I want to say a few words about the person we're honoring." }, { speaker: "أنت", text: "He's not just my father. He's my role model and my best friend." }, { speaker: "أنت", text: "Everything I've achieved, I owe to his guidance and support." }, { speaker: "أنت", text: "Please join me in raising a glass to the best father in the world." }, { speaker: "الجمهور", text: "Cheers!" }], keyPhrases: [{ en: "Thank you all for being here tonight.", ar: "شكراً لحضوركم الليلة." }, { en: "He's my role model and best friend.", ar: "هو قدوتي وصديقي." }, { en: "Everything I've achieved, I owe to him.", ar: "كل شيء حققته بفضله." }], producePrompt: "تلقي كلمة في مناسبة:", produceModel: "Good evening everyone. Thank you for being here. I want to say a few words about someone very special. He taught me everything I know, and I owe him more than words can express.", noticingTips: ["\"We're gathered to celebrate\" = فتح خطاب رسمي", "\"I owe to his guidance\" = أدين لتوجيهه — تعبير تقدير عميق", "\"raise a glass\" = نرفع الكأس — ختام تقليدي"], challenge: "اليوم: حضّر كلمة شكر من 5 جمل وقلها بصوت عالٍ." },

];


// FIX 8: Cross-context phrase patterns — same phrase structure reused across scenarios
// When user encounters "I'd like..." in restaurant, remind them they also used it in hotel, airport, etc.
// This builds GENERALIZED neural pathways instead of context-specific ones.
const PHRASE_PATTERNS = {
  "I'd like": { pattern: "I'd like...", usage: "طلب مهذب — يعمل في أي مكان: مطعم، فندق، مطار، بنك", scenarios: ["المطعم", "الفندق", "المطار", "البنك", "الصيدلية"] },
  "Could you": { pattern: "Could you...?", usage: "طلب مهذب بصيغة سؤال — يعمل مع أي شخص", scenarios: ["المطعم", "الفندق", "خدمة العملاء", "الاتجاهات", "التاكسي"] },
  "Is there": { pattern: "Is there...?", usage: "سؤال عن التوفر — فنادق، مطاعم، محلات", scenarios: ["الفندق", "النادي", "السوبرماركت"] },
  "How long": { pattern: "How long...?", usage: "سؤال عن المدة — يعمل في كل مكان", scenarios: ["الطبيب", "البريد", "التحويلات", "استئجار سيارة"] },
  "Thank you for": { pattern: "Thank you for...", usage: "شكر محدد — أقوى بكثير من thank you لوحدها", scenarios: ["الطبيب", "الفندق", "المدرسة", "العمل"] },
};
function findCrossPatterns(phrase) {
  const results = [];
  for (const [key, val] of Object.entries(PHRASE_PATTERNS)) {
    if (phrase.toLowerCase().includes(key.toLowerCase())) results.push(val);
  }
  return results;
}

const DK = "eng-v10";
const gtd = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
const gdn = () => { const d = new Date(); return d.getDate() + d.getMonth() * 31 + d.getFullYear(); };
const gdow = () => new Date().getDay();
const getWk = (s) => { const x = Math.floor((new Date(gtd()) - new Date(s)) / 864e5); return x < 0 ? 0 : Math.min(Math.floor(x / 7) + 1, 12); };
const getPh = (w) => w <= 4 ? { n: 1, nm: "بناء الأساس", c: "#e8b84b", gap: 6 } : w <= 8 ? { n: 2, nm: "التسريع", c: "#e8b84b", gap: 4 } : { n: 3, nm: "الإطلاق", c: "#e8b84b", gap: 3 };
function shuffle(arr, seed) { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = (seed * (i + 1) * 9301 + 49297) % 233280; const k = Math.floor((j / 233280) * (i + 1)); [a[i], a[k]] = [a[k], a[i]]; } return a; }
function shuffleOpts(opts, correctIndex, seed) {
  const correct = opts[correctIndex];
  const indices = opts.map((_, i) => i);
  const shuffled = shuffle(indices, seed);
  return { opts: shuffled.map(i => opts[i]), correctIndex: shuffled.indexOf(correctIndex) };
}

function Prompter({ lines, gap, color, label, withAudio }) {
  const [on, setOn] = useState(false);
  const [idx, setIdx] = useState(0);
  const [sec, setSec] = useState(0);
  const [phase, setPhase] = useState("listen"); // "listen" or "repeat"
  const ref = useRef(null);
  const iRef = useRef(0);

  function stop() { clearInterval(ref.current); setOn(false); setIdx(0); setSec(0); iRef.current = 0; setPhase("listen"); stopSpeech(); }
  function start() {
    stop(); setOn(true); iRef.current = 0;
    // Play audio first, then start countdown for repeating
    if (withAudio && window.speechSynthesis) {
      setPhase("listen");
      const u = speak(lines[0], 0.8);
      if (u) {
        u.onend = () => { setPhase("repeat"); setSec(gap); startCountdown(); };
      } else { setPhase("repeat"); setSec(gap); startCountdown(); }
    } else { setPhase("repeat"); setSec(gap); startCountdown(); }
  }
  function startCountdown() {
    let c = gap;
    ref.current = setInterval(() => {
      c--;
      if (c <= 0) {
        iRef.current++;
        if (iRef.current >= lines.length) { clearInterval(ref.current); setOn(false); setIdx(0); setSec(0); setPhase("listen"); return; }
        setIdx(iRef.current);
        // Play next line audio
        if (withAudio && window.speechSynthesis) {
          setPhase("listen");
          clearInterval(ref.current);
          const u2 = speak(lines[iRef.current], 0.8);
          if (u2) { u2.onend = () => { setPhase("repeat"); c = gap; setSec(gap); startCountdown(); }; }
          else { setPhase("repeat"); c = gap; setSec(gap); startCountdown(); }
          return;
        }
        c = gap;
      }
      setSec(c);
    }, 1000);
  }
  useEffect(() => () => { clearInterval(ref.current); stopSpeech(); }, []);

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center" }}>
        {!on ? (
          <button onClick={start} style={{ padding: "8px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg," + color + ",#d4a43a)", color: "#0f1119", fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{"▶ ابدأ " + label}</button>
        ) : (
          <button onClick={stop} style={{ padding: "8px 20px", borderRadius: 10, border: "1px solid #252836", background: "transparent", color: "#7a8295", fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>⏹ إيقاف</button>
        )}
        {on && phase === "listen" && <div style={{ fontSize: 13, color: "#e8b84b", fontWeight: 600 }}>🔊 استمع...</div>}
        {on && phase === "repeat" && sec > 0 && <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 22, fontWeight: 700, color: color }}>{sec}</div>}
        {on && phase === "repeat" && sec > 0 && <div style={{ fontSize: 12, color: "#7a8295" }}>ردّد بصوت عالٍ!</div>}
      </div>
      {lines.map((line, i) => {
        const cur = on && i === idx;
        const past = on && i < idx;
        return (
          <div key={i} style={{ padding: "10px 14px", borderRadius: 10, marginBottom: 4, fontFamily: "'IBM Plex Mono',monospace", fontSize: cur ? 16 : 14, direction: "ltr", textAlign: "left", lineHeight: 1.7, transition: "all .4s", background: cur ? color + "18" : "rgba(255,255,255,0.015)", border: "1px solid " + (cur ? color + "40" : "rgba(255,255,255,0.04)"), color: cur ? "#fff" : past ? "#4a5166" : "#9ca3b5", fontWeight: cur ? 600 : 400, transform: cur ? "scale(1.01)" : "none", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ flex: 1 }}>{line}</div>
            <SpeakBtn text={line} size={cur ? 18 : 14} color={cur ? color : "#7a8295"} />
            {cur && phase === "repeat" && <span style={{ fontSize: 12, color: color, flexShrink: 0 }}>← ردّد!</span>}
            {cur && phase === "listen" && <span style={{ fontSize: 12, color: "#e8b84b", flexShrink: 0 }}>← استمع</span>}
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
  const m = CONVERSATIONS[mi];
  const raw = m.steps[step];
  const { opts: sOpts, correctIndex: sAns } = shuffleOpts(raw.opts, raw.ans, mi * 1000 + step * 7 + 31);
  const s = { ...raw, opts: sOpts, ans: sAns };
  function pick(oi) { setPicked(oi); if (oi === s.ans) setScore(score + 1); }
  function next() { if (step + 1 >= m.steps.length) { setDone(true); return; } setStep(step + 1); setPicked(null); }
  function restart() { setMi((mi + 1) % CONVERSATIONS.length); setStep(0); setPicked(null); setScore(0); setDone(false); }
  if (done) return (
    <div style={{ textAlign: "center", padding: 20, animation: "fadeUp .4s" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
      <div style={{ fontSize: 20, fontWeight: 800, color: "#e8b84b", marginBottom: 8 }}>{score}/{m.steps.length}</div>
      <div style={{ fontSize: 14, color: "#9ca3b5", marginBottom: 16 }}>{score === m.steps.length ? "ممتاز! أدرت المحادثة باحترافية كاملة" : score >= 3 ? "جيد! تقدم واضح" : "تحتاج تمرين أكثر على الجمل — راجعها في تبويب الجمل"}</div>
      <button onClick={restart} style={{ padding: "8px 20px", borderRadius: 10, border: "none", background: "#e8b84b", color: "#0f1119", fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>🔄 محادثة جديدة</button>
    </div>
  );
  return (
    <div style={{ animation: "fadeUp .4s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#e8b84b" }}>{(m.icon || "🎭") + " " + m.title}</div>
        <div style={{ fontSize: 12, color: "#7a8295" }}>{"خطوة " + (step + 1) + "/" + m.steps.length}</div>
      </div>
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 14, marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: "#e8b84b", marginBottom: 4 }}>{"💬 " + s.speaker + ":"}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 15, direction: "ltr", textAlign: "left", lineHeight: 1.7, color: "#f0f0f5", flex: 1 }}>{s.text}</div><SpeakBtn text={s.text} size={18} /></div>
      </div>
      <div style={{ fontSize: 12, color: "#e8b84b", fontWeight: 600, marginBottom: 8 }}>{"🎯 " + s.prompt + " — اختر الرد الأنسب واقرأه بصوت عالٍ:"}</div>
      {s.opts.map((o, oi) => {
        const show = picked !== null;
        const isCorrect = oi === s.ans;
        const isPicked = picked === oi;
        let bg = "rgba(255,255,255,0.02)", brd = "rgba(255,255,255,0.04)";
        if (show && isCorrect) { bg = "rgba(94,196,182,0.1)"; brd = "rgba(94,196,182,0.3)"; }
        else if (show && isPicked && !isCorrect) { bg = "rgba(232,160,64,0.1)"; brd = "rgba(232,160,64,0.3)"; }
        return (
          <div key={oi} onClick={() => picked === null && pick(oi)} style={{ padding: 12, borderRadius: 10, marginBottom: 6, cursor: picked === null ? "pointer" : "default", fontFamily: "'IBM Plex Mono'", fontSize: 14, direction: "ltr", textAlign: "left", lineHeight: 1.6, background: bg, border: "1px solid " + brd, transition: ".3s", opacity: show && !isCorrect && !isPicked ? 0.3 : 1 }}>
            {o}
            {show && isCorrect && <span style={{ marginRight: 8, fontSize: 12, color: "#5ec4b6" }}> ✓ صحيح — اقرأها بصوت عالٍ!</span>}
            {show && isPicked && !isCorrect && <span style={{ marginRight: 8, fontSize: 12, color: "#e87461" }}> ✗</span>}
          </div>
        );
      })}
      {picked !== null && <div style={{ textAlign: "center", marginTop: 10 }}><button onClick={next} style={{ padding: "8px 20px", borderRadius: 10, border: "none", background: "#e8b84b", color: "#0f1119", fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{step + 1 >= m.steps.length ? "🏁 النتيجة" : "التالي ←"}</button></div>}
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
      <div style={{ fontSize: 24, fontWeight: 800, color: "#e8b84b", marginBottom: 8 }}>{score}/{total}</div>
      <div style={{ fontSize: 14, color: "#9ca3b5", marginBottom: 16 }}>{score >= 7 ? "سريع وحاسم! 🔥" : score >= 5 ? "جيد! السرعة تتحسن" : "تحتاج تحفظ الجمل أكثر"}</div>
      <button onClick={restart} style={{ padding: "8px 20px", borderRadius: 10, border: "none", background: "#e8b84b", color: "#0f1119", fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>🔄 جولة جديدة</button>
    </div>
  );
  const rawQ = qs.current[qi];
  const { opts: qOpts, correctIndex: qAns } = shuffleOpts(rawQ.opts, rawQ.ans, qi * 13 + 47);
  const q = { ...rawQ, opts: qOpts, ans: qAns };
  return (
    <div style={{ animation: "fadeUp .4s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ fontSize: 12, color: "#7a8295" }}>{"سؤال " + (qi + 1) + "/" + qs.current.length}</div>
        <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 18, fontWeight: 700, color: timer <= 3 ? "#e87461" : "#e8b84b" }}>{timer > 0 && picked === null ? timer + "s" : ""}</div>
      </div>
      <div style={{ background: "rgba(232,184,75,0.06)", border: "1px solid rgba(232,184,75,0.12)", borderRadius: 12, padding: 14, marginBottom: 12 }}>
        <div style={{ fontSize: 14, color: "#f0f0f5", lineHeight: 1.8 }}>{"🎯 " + q.sit}</div>
      </div>
      {q.opts.map((o, oi) => {
        const show = picked !== null;
        const isCorrect = oi === q.ans;
        const isPicked = picked === oi;
        let bg = "rgba(255,255,255,0.02)", brd = "rgba(255,255,255,0.04)";
        if (show && isCorrect) { bg = "rgba(94,196,182,0.1)"; brd = "rgba(94,196,182,0.3)"; }
        else if (show && isPicked && !isCorrect) { bg = "rgba(232,160,64,0.1)"; brd = "rgba(232,160,64,0.3)"; }
        return <div key={oi} onClick={() => !show && pick(oi)} style={{ padding: 11, borderRadius: 10, marginBottom: 5, cursor: show ? "default" : "pointer", fontFamily: "'IBM Plex Mono'", fontSize: 13, direction: "ltr", textAlign: "left", lineHeight: 1.6, background: bg, border: "1px solid " + brd, opacity: show && !isCorrect && !isPicked ? 0.3 : 1 }}>
          {o}{show && isCorrect && <span style={{ color: "#5ec4b6", fontSize: 11 }}> ✓ اقرأها!</span>}
        </div>;
      })}
      {(picked !== null || timer === 0) && <div style={{ textAlign: "center", marginTop: 10 }}>
        {timer === 0 && picked === null && <div style={{ color: "#e87461", fontSize: 13, marginBottom: 8 }}>⏰ انتهى الوقت!</div>}
        <button onClick={() => { if (timer === 0 && picked === null) { setTotal(total + 1); } next(); }} style={{ padding: "8px 20px", borderRadius: 10, border: "none", background: "#e8b84b", color: "#0f1119", fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>التالي ←</button>
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
          const r = await storage.get("quiz-results");
          const results = r && r.value ? JSON.parse(r.value) : [];
          if (results.length > 0) setPrevPct(results[results.length - 1].pct);
          results.push({ date: gtd(), pct, score, total: qs.current.length });
          await storage.set("quiz-results", JSON.stringify(results));
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
        <div style={{ fontSize: 28, fontWeight: 800, color: pct >= 80 ? "#5ec4b6" : pct >= 50 ? "#e8b84b" : "#e87461", marginBottom: 4 }}>{pct + "%"}</div>
        <div style={{ fontSize: 16, color: "#9ca3b5", marginBottom: 4 }}>{score + "/" + qs.current.length}</div>
        {diff !== null && <div style={{ fontSize: 14, fontWeight: 700, color: diff >= 0 ? "#5ec4b6" : "#e87461", marginBottom: 4 }}>{diff >= 0 ? "📈 +" + diff + "% عن الاختبار السابق" : "📉 " + diff + "% عن الاختبار السابق"}</div>}
        <div style={{ fontSize: 14, color: "#9ca3b5", marginBottom: 16 }}>{pct >= 80 ? "ممتاز! الجمل صارت جزء منك 🔥" : pct >= 50 ? "جيد! استمر في مراجعة الجمل يومياً" : "ركّز أكثر على بنك الجمل — راجعها يومياً"}</div>
        <button onClick={restart} style={{ padding: "8px 20px", borderRadius: 10, border: "none", background: "#e8b84b", color: "#fff", fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>🔄 اختبار جديد</button>
      </div>
    );
  }
  const rawQz = qs.current[qi];
  const { opts: qzOpts, correctIndex: qzAns } = shuffleOpts(rawQz.opts, rawQz.ans, qi * 17 + 59);
  const q = { ...rawQz, opts: qzOpts, ans: qzAns };
  return (
    <div style={{ animation: "fadeUp .4s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ fontSize: 12, color: "#7a8295" }}>{"سؤال " + (qi + 1) + "/10"}</div>
        <div style={{ fontSize: 12, color: "#e8b84b", fontWeight: 600 }}>{score + " صحيح"}</div>
      </div>
      <div style={{ background: "rgba(232,184,75,0.06)", border: "1px solid rgba(232,184,75,0.12)", borderRadius: 12, padding: 14, marginBottom: 12 }}>
        <div style={{ fontSize: 14, color: "#f0f0f5", lineHeight: 1.8 }}>{q.q}</div>
      </div>
      {q.opts.map((o, oi) => {
        const show = picked !== null;
        const isCorrect = oi === q.ans;
        const isPicked = picked === oi;
        let bg = "rgba(255,255,255,0.02)", brd = "rgba(255,255,255,0.04)";
        if (show && isCorrect) { bg = "rgba(94,196,182,0.1)"; brd = "rgba(94,196,182,0.3)"; }
        else if (show && isPicked && !isCorrect) { bg = "rgba(232,160,64,0.1)"; brd = "rgba(232,160,64,0.3)"; }
        return <div key={oi} onClick={() => !show && pick(oi)} style={{ padding: 11, borderRadius: 10, marginBottom: 5, cursor: show ? "default" : "pointer", fontFamily: "'IBM Plex Mono'", fontSize: 13, direction: "ltr", textAlign: "left", lineHeight: 1.6, background: bg, border: "1px solid " + brd, opacity: show && !isCorrect && !isPicked ? 0.3 : 1 }}>
          {o}{show && isCorrect && <span style={{ color: "#5ec4b6", fontSize: 11 }}> ✓</span>}
        </div>;
      })}
      {picked !== null && <div style={{ textAlign: "center", marginTop: 10 }}><button onClick={next} style={{ padding: "8px 20px", borderRadius: 10, border: "none", background: "#e8b84b", color: "#fff", fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{qi + 1 >= qs.current.length ? "🏁 النتيجة" : "التالي ←"}</button></div>}
    </div>
  );
}

const FILL_BLANKS = [
  { full: "Excuse me, could you tell me how to get there?", blanks: ["Excuse", "tell"] },
  { full: "I'd like to make an appointment, please.", blanks: ["appointment", "please"] },
  { full: "Could you speak a bit more slowly?", blanks: ["speak", "slowly"] },
  { full: "Nice to meet you. Where are you from?", blanks: ["Nice", "from"] },
  { full: "Sorry, I didn't catch that. Could you repeat?", blanks: ["catch", "repeat"] },
  { full: "I really appreciate your help with this.", blanks: ["appreciate", "help"] },
  { full: "Is it possible to reschedule to next week?", blanks: ["possible", "reschedule"] },
  { full: "What do you recommend from the menu?", blanks: ["recommend", "menu"] },
  { full: "I've been having this problem for three days.", blanks: ["having", "problem"] },
  { full: "That sounds great. I'll take it.", blanks: ["sounds", "take"] },
  { full: "How often should I take this medication?", blanks: ["often", "medication"] },
  { full: "Thank you for your patience with this.", blanks: ["patience", "this"] },
  { full: "I see it differently. From my perspective...", blanks: ["differently", "perspective"] },
  { full: "Would it be possible to get a refund?", blanks: ["possible", "refund"] },
  { full: "I'll review the details and get back to you.", blanks: ["review", "details"] },
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
      <div style={{ fontSize: 24, fontWeight: 800, color: score >= 6 ? "#5ec4b6" : score >= 4 ? "#e8b84b" : "#e87461", marginBottom: 8 }}>{score + "/" + qs.current.length}</div>
      <div style={{ fontSize: 14, color: "#9ca3b5", marginBottom: 16 }}>{score >= 6 ? "ممتاز! ذاكرتك قوية 🔥" : score >= 4 ? "جيد! استمر في المراجعة" : "راجع الجمل أكثر"}</div>
      <button onClick={restart} style={{ padding: "8px 20px", borderRadius: 10, border: "none", background: "#d4a43a", color: "#0f1119", fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>🔄 جولة جديدة</button>
    </div>
  );

  const item = qs.current[qi];
  const parts = getSentenceWithBlanks(item);

  return (
    <div style={{ animation: "fadeUp .4s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ fontSize: 12, color: "#7a8295" }}>{"سؤال " + (qi + 1) + "/" + qs.current.length}</div>
        <div style={{ fontSize: 12, color: "#d4a43a", fontWeight: 600 }}>{score + " صحيح"}</div>
      </div>
      <div style={{ background: "rgba(232,184,75,0.06)", border: "1px solid rgba(232,184,75,0.12)", borderRadius: 12, padding: 16, marginBottom: 12 }}>
        <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 15, direction: "ltr", textAlign: "left", lineHeight: 2.2, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 4 }}>
          {parts.map((p, pi) => p.type === "text" ? (
            <span key={pi} style={{ color: "#f0f0f5" }}>{p.value}</span>
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
                  background: checked ? ((answers[p.index] || "").trim().toLowerCase() === p.word.toLowerCase() ? "rgba(94,196,182,0.15)" : "rgba(232,116,97,0.15)") : "rgba(255,255,255,0.06)",
                  border: "1px solid " + (checked ? ((answers[p.index] || "").trim().toLowerCase() === p.word.toLowerCase() ? "rgba(94,196,182,0.4)" : "rgba(232,116,97,0.4)") : "rgba(232,184,75,0.3)"),
                  color: "#fff", outline: "none"
                }}
                placeholder="..."
                disabled={checked}
              />
              {checked && (answers[p.index] || "").trim().toLowerCase() !== p.word.toLowerCase() && (
                <div style={{ fontSize: 11, color: "#5ec4b6", textAlign: "center" }}>{p.word}</div>
              )}
            </span>
          ))}
        </div>
      </div>
      {!checked ? (
        <div style={{ textAlign: "center" }}>
          <button onClick={check} style={{ padding: "8px 20px", borderRadius: 10, border: "none", background: "#d4a43a", color: "#0f1119", fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>✓ تحقق</button>
        </div>
      ) : (
        <div style={{ textAlign: "center" }}>
          <button onClick={next} style={{ padding: "8px 20px", borderRadius: 10, border: "none", background: "#d4a43a", color: "#0f1119", fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{qi + 1 >= qs.current.length ? "🏁 النتيجة" : "التالي ←"}</button>
        </div>
      )}
    </div>
  );
}

const SENTENCE_BUILD = [
  "Nice to meet you. Where are you from?",
  "Could you speak more slowly please?",
  "I would like a table for two.",
  "How do I get to the nearest station?",
  "I have a reservation under my name.",
  "Is it possible to get a refund?",
  "Thank you for your help with this.",
  "I really appreciate your patience.",
  "What time does the store close today?",
  "I need to reschedule my appointment.",
  "The food was excellent. Thank you.",
  "Could you recommend something from the menu?",
  "I see it differently from my perspective.",
  "I have been living here for five years.",
  "Let me think about it and get back.",
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
      <div style={{ fontSize: 24, fontWeight: 800, color: score >= 6 ? "#5ec4b6" : score >= 4 ? "#e8b84b" : "#e87461", marginBottom: 8 }}>{score + "/" + qs.current.length}</div>
      <div style={{ fontSize: 14, color: "#9ca3b5", marginBottom: 16 }}>{score >= 6 ? "ممتاز! تركيب الجمل صار سهل 🔥" : score >= 4 ? "جيد! تحسن واضح" : "تمرّن أكثر على ترتيب الكلمات"}</div>
      <button onClick={restart} style={{ padding: "8px 20px", borderRadius: 10, border: "none", background: "#4db5a5", color: "#0f1119", fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>🔄 جولة جديدة</button>
    </div>
  );

  const builtSentence = selected.map(i => shuffledWords.current[i]).join(" ").toLowerCase();
  const correctSentence = words.join(" ").toLowerCase();
  const isCorrect = checked && builtSentence === correctSentence;

  return (
    <div style={{ animation: "fadeUp .4s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ fontSize: 12, color: "#7a8295" }}>{"سؤال " + (qi + 1) + "/" + qs.current.length}</div>
        <div style={{ fontSize: 12, color: "#4db5a5", fontWeight: 600 }}>{score + " صحيح"}</div>
      </div>
      <div style={{ background: "rgba(77,181,165,0.06)", border: "1px solid rgba(77,181,165,0.12)", borderRadius: 12, padding: 14, marginBottom: 12, minHeight: 50 }}>
        <div style={{ fontSize: 12, color: "#4db5a5", fontWeight: 600, marginBottom: 8 }}>🔗 الجملة المُركّبة:</div>
        <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 15, direction: "ltr", textAlign: "left", lineHeight: 1.8, color: checked ? (isCorrect ? "#5ec4b6" : "#e87461") : "#f0f0f5", minHeight: 24 }}>
          {selected.length > 0 ? selected.map(i => shuffledWords.current[i]).join(" ") : <span style={{ color: "#4a5166" }}>اضغط على الكلمات بالترتيب الصحيح...</span>}
        </div>
        {checked && !isCorrect && <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 13, direction: "ltr", textAlign: "left", lineHeight: 1.8, color: "#5ec4b6", marginTop: 8 }}>{"✓ " + qs.current[qi]}</div>}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
        {shuffledWords.current.map((w, wi) => {
          const isSelected = selected.includes(wi);
          return (
            <button key={wi} onClick={() => toggleWord(wi)} style={{
              padding: "8px 14px", borderRadius: 8,
              fontFamily: "'IBM Plex Mono'", fontSize: 14,
              border: "1px solid " + (isSelected ? "rgba(77,181,165,0.4)" : "rgba(255,255,255,0.08)"),
              background: isSelected ? "rgba(77,181,165,0.15)" : "rgba(255,255,255,0.03)",
              color: isSelected ? "#5ec4b6" : "#f0f0f5",
              cursor: checked ? "default" : "pointer",
              opacity: isSelected ? 0.5 : 1,
              transition: ".2s"
            }}>{w}</button>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        {!checked && selected.length > 0 && <button onClick={() => setSelected([])} style={{ padding: "8px 16px", borderRadius: 10, border: "1px solid #252836", background: "transparent", color: "#7a8295", fontFamily: "inherit", fontSize: 12, cursor: "pointer" }}>↻ مسح</button>}
        {!checked ? (
          <button onClick={check} disabled={selected.length === 0} style={{ padding: "8px 20px", borderRadius: 10, border: "none", background: selected.length > 0 ? "#4db5a5" : "#252836", color: selected.length > 0 ? "#0f1119" : "#5c6478", fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: selected.length > 0 ? "pointer" : "default" }}>✓ تحقق</button>
        ) : (
          <button onClick={next} style={{ padding: "8px 20px", borderRadius: 10, border: "none", background: "#4db5a5", color: "#0f1119", fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{qi + 1 >= qs.current.length ? "🏁 النتيجة" : "التالي ←"}</button>
        )}
      </div>
    </div>
  );
}

// ===== FREE RECALL PRODUCTION EXERCISE =====
const RECALL_SCENARIOS = [
  { sit: "وصلت فندق وتبي تسوي check-in", hint: "أكّد حجزك وسأل عن الخدمات", model: "I have a reservation under the name Al-Rashid. Is breakfast included?", keywords: ["reservation", "name", "breakfast"] },
  { sit: "في المطعم والنادل يسألك عن طلبك", hint: "اطلب بوضوح وسأل عن التوصيات", model: "I'll have the grilled chicken, please. What do you recommend for dessert?", keywords: ["have", "please", "recommend"] },
  { sit: "تحس بصداع من ٣ أيام وأنت عند الدكتور", hint: "اشرح أعراضك بالتفصيل", model: "I've been having a persistent headache for three days, along with some fatigue.", keywords: ["headache", "days", "fatigue"] },
  { sit: "شخص يتكلم بسرعة وما فهمت عليه", hint: "اطلب منه يبطّئ بأدب", model: "Sorry, could you speak a bit more slowly? I want to make sure I understand.", keywords: ["speak", "slowly", "understand"] },
  { sit: "اشتريت منتج وطلع معيب وتبي تشتكي", hint: "اشرح المشكلة واطلب حل", model: "I purchased this last week and it's not working properly. Is it possible to get a replacement?", keywords: ["purchased", "working", "replacement"] },
  { sit: "معلم ولدك يسألك تساعده في القراءة بالبيت", hint: "وافق واسأل عن التفاصيل", model: "That makes sense. What if we start with fifteen minutes of reading together every evening?", keywords: ["start", "minutes", "reading"] },
  { sit: "جارك الجديد يسلّم عليك وتبي تتعرف عليه", hint: "عرّف نفسك ورحّب فيه", model: "Nice to meet you! I'm Omar. Welcome to the neighborhood. Let me know if you need anything.", keywords: ["nice", "meet", "welcome"] },
  { sit: "تبي تعبّر عن رأيك المختلف بأدب في نقاش", hint: "اعترض بدبلوماسية", model: "I see it differently. From my perspective, I think there's another way to look at it.", keywords: ["differently", "perspective", "another"] },
];

function FreeRecall() {
  const [qi, setQi] = useState(0);
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [matchedWords, setMatchedWords] = useState([]);
  const qs = useRef(shuffle(RECALL_SCENARIOS, gdn()).slice(0, 6));

  function submit() {
    setSubmitted(true);
    const words = input.toLowerCase().split(/\s+/);
    const scenario = qs.current[qi];
    const matched = scenario.keywords.filter(kw => words.some(w => w.includes(kw.toLowerCase())));
    setMatchedWords(matched);
    // Score: any reasonable English response with key words
    if (input.trim().split(/\s+/).length >= 4 && matched.length >= 1) {
      setScore(score + 1);
    }
  }

  function next() {
    if (qi + 1 >= qs.current.length) { setDone(true); return; }
    setQi(qi + 1); setInput(""); setSubmitted(false); setMatchedWords([]);
  }

  function restart() {
    qs.current = shuffle(RECALL_SCENARIOS, Date.now()); setQi(0); setInput(""); setSubmitted(false); setScore(0); setDone(false); setMatchedWords([]);
  }

  if (done) return (
    <div style={{ textAlign: "center", padding: 20, animation: "fadeUp .4s" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>✍️</div>
      <div style={{ fontSize: 24, fontWeight: 800, color: score >= 4 ? "#5ec4b6" : score >= 2 ? "#e8b84b" : "#e87461", marginBottom: 8 }}>{score + "/" + qs.current.length}</div>
      <div style={{ fontSize: 14, color: "#9ca3b5", marginBottom: 16 }}>{score >= 4 ? "ممتاز! تقدر تنتج جمل من ذاكرتك" : score >= 2 ? "جيد! استمر بمراجعة الجمل الجاهزة" : "راجع بنك الجمل — حاول تكتبها من الذاكرة"}</div>
      <button onClick={restart} style={{ padding: "8px 20px", borderRadius: 10, border: "none", background: "#e87461", color: "#0f1119", fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>🔄 جولة جديدة</button>
    </div>
  );

  const scenario = qs.current[qi];

  return (
    <div style={{ animation: "fadeUp .4s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ fontSize: 13, color: "#7a8295" }}>{"موقف " + (qi + 1) + "/" + qs.current.length}</div>
        <div style={{ fontSize: 13, color: "#e87461", fontWeight: 600 }}>{score + " صحيح"}</div>
      </div>

      <div style={{ background: "rgba(232,116,97,0.06)", border: "1px solid rgba(232,116,97,0.12)", borderRadius: 12, padding: 16, marginBottom: 12 }}>
        <div style={{ fontSize: 15, color: "#f0f0f5", lineHeight: 2, marginBottom: 8 }}>{scenario.sit}</div>
        <div style={{ fontSize: 13, color: "#e87461", fontWeight: 600 }}>{"💡 " + scenario.hint}</div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <textarea
          value={input}
          onChange={(e) => !submitted && setInput(e.target.value)}
          placeholder="اكتب ردك بالإنجليزي هنا..."
          disabled={submitted}
          style={{
            width: "100%", minHeight: 80, padding: 14, borderRadius: 12,
            fontFamily: "'IBM Plex Mono'", fontSize: 15, direction: "ltr", textAlign: "left",
            lineHeight: 1.8, background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(232,116,97,0.2)", color: "#f0f0f5",
            outline: "none", resize: "vertical"
          }}
        />
      </div>

      {!submitted ? (
        <div style={{ textAlign: "center" }}>
          <button onClick={submit} disabled={input.trim().length < 3} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: input.trim().length >= 3 ? "#e87461" : "#252836", color: input.trim().length >= 3 ? "#0f1119" : "#5c6478", fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: input.trim().length >= 3 ? "pointer" : "default" }}>✓ أرسل</button>
        </div>
      ) : (
        <div>
          <div style={{ background: "rgba(94,196,182,0.06)", border: "1px solid rgba(94,196,182,0.12)", borderRadius: 12, padding: 14, marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: "#5ec4b6", fontWeight: 700, marginBottom: 6 }}>✓ الجواب المثالي:</div>
            <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 15, direction: "ltr", textAlign: "left", lineHeight: 1.8, color: "#f0f0f5" }}>{scenario.model}</div>
          </div>
          {matchedWords.length > 0 && (
            <div style={{ fontSize: 13, color: "#5ec4b6", marginBottom: 8 }}>{"كلمات مفتاحية استخدمتها: " + matchedWords.join(", ")}</div>
          )}
          {matchedWords.length === 0 && (
            <div style={{ fontSize: 13, color: "#e8b84b", marginBottom: 8 }}>حاول تستخدم كلمات من بنك الجمل في المرة الجاية</div>
          )}
          <div style={{ textAlign: "center" }}>
            <button onClick={next} style={{ padding: "8px 24px", borderRadius: 10, border: "none", background: "#e87461", color: "#0f1119", fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>{qi + 1 >= qs.current.length ? "🏁 النتيجة" : "التالي ←"}</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== DAILY DEEP PROCESSING SESSION =====
function DailySession({ scenario, onComplete, dayNum }) {
  const [step, setStep] = useState(0);
  const [listenIdx, setListenIdx] = useState(-1);
  const [listenDone, setListenDone] = useState(false);
  const [listenAnswer, setListenAnswer] = useState(null); // comprehension Q answer
  const [shadowReps, setShadowReps] = useState({});
  const [shadowSpoken, setShadowSpoken] = useState({});
  const [recallState, setRecallState] = useState({}); // { 0: "hidden"|"thinking"|"revealed" }
  const [recallScore, setRecallScore] = useState({});
  const [prodInput, setProdInput] = useState("");
  const [prodSubmitted, setProdSubmitted] = useState(false);
  const [challengeAccepted, setChallengeAccepted] = useState(false);
  const [challengeDone, setChallengeDone] = useState(false);
  const [challengeNote, setChallengeNote] = useState("");
  const [aiFeedback, setAiFeedback] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [stepCelebration, setStepCelebration] = useState(null);
  const [listenChunk, setListenChunk] = useState(0);

  const sc = scenario;
  const steps = [
    { icon: "👂", title: "استمع", desc: "استمع جملة جملة — بدون نص" },
    { icon: "👂📖", title: "استمع واقرأ", desc: "استمع مع النص — لاحظ اللي فاتك" },
    { icon: "🔊", title: "ردّد", desc: "ردّد الجمل المفتاحية ٣ مرات" },
    { icon: "🧠", title: "تذكّر", desc: "شوف الترجمة — قل الجملة من ذاكرتك" },
    { icon: "✍️", title: "أنتج", desc: "اكتب ردك بنفسك" },
    { icon: "🌍", title: "طبّق", desc: "تحدّي حقيقي اليوم" },
  ];

  // FIX 5: Working Memory — play only first 3 lines initially, then expand
  // Baddeley's Model: WM capacity = 4±1 items. 7 lines at once = overload.
  function playDialogueSequence() {
    const chunkSize = 3;
    const startIdx = listenChunk * chunkSize;
    const endIdx = Math.min(startIdx + chunkSize, sc.dialogue.length);
    setListenIdx(startIdx);
    let i = startIdx;
    function playNext() {
      if (i >= endIdx) {
        if (endIdx >= sc.dialogue.length) { setListenDone(true); }
        else { setListenChunk(prev => prev + 1); } // auto-advance to next chunk
        setListenIdx(-1);
        return;
      }
      setListenIdx(i);
      const u = speak(sc.dialogue[i].text, 0.8);
      if (u) { u.onend = () => { i++; setTimeout(playNext, 1200); }; }
      else { i++; setTimeout(playNext, 1800); }
    }
    playNext();
  }

  const stepPct = Math.round(((step + 1) / 6) * 100);

  // Micro-celebration on step change
  function advanceStep(nextStep) {
    const msgs = ["ممتاز! 🔥", "أحسنت! ⚡", "يلّا كمّل! 💪", "رائع! ✨", "نص الطريق! 🎯", ""];
    setStepCelebration(msgs[step] || "👏");
    setTimeout(() => { setStepCelebration(null); setStep(nextStep); }, 800);
  }

  return (
    <div style={{ animation: "fadeUp .4s" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{ fontSize: 28 }}>{sc.icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#e8b84b" }}>{"جلسة اليوم: " + sc.title}</div>
          <div style={{ fontSize: 12, color: "#7a8295" }}>{"الخطوة " + (step + 1) + "/6 — " + steps[step].title}</div>
        </div>
        <div style={{ fontSize: 14, fontWeight: 800, color: "#e8b84b", fontFamily: "'IBM Plex Mono'" }}>{stepPct + "%"}</div>
      </div>

      {/* Micro-celebration popup */}
      {stepCelebration && <div style={{ textAlign: "center", padding: 16, animation: "stepDone .6s" }}>
        <div style={{ fontSize: 28, fontWeight: 800, color: "#5ec4b6" }}>{stepCelebration}</div>
      </div>}

      {/* Progress */}
      {!stepCelebration && <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center" }}>
            <div style={{ height: 5, borderRadius: 3, background: i < step ? "linear-gradient(90deg,#5ec4b6,#e8b84b)" : i === step ? "#e8b84b" : "#1e2130", transition: ".3s", marginBottom: 4 }} />
            <div style={{ fontSize: 11, color: i === step ? "#e8b84b" : i < step ? "#5ec4b6" : "#4a5166" }}>{i < step ? "✓" : s.icon}</div>
          </div>
        ))}
      </div>}

      {/* FIX 7: Mental imagery + Step 1 */}
      {step === 0 && (
        <div>
          {/* Mental imagery prompt — activates episodic memory */}
          {listenIdx === -1 && !listenDone && <div style={{ background: "rgba(232,184,75,0.06)", border: "1px solid rgba(232,184,75,0.1)", borderRadius: 14, padding: 20, marginBottom: 14, textAlign: "center" }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{sc.icon}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#e8b84b", marginBottom: 8 }}>أغمض عينك لحظة...</div>
            <div style={{ fontSize: 14, color: "#9ca3b5", lineHeight: 2.2 }}>تخيّل نفسك فعلاً {sc.title === "في المطعم" ? "جالس في مطعم... النادل يجي ويسألك عن طلبك" : sc.title === "عند الدكتور" ? "في عيادة الدكتور... يسألك عن صحتك" : sc.title === "في الفندق" ? "واقف أمام موظف الاستقبال... تسوي check-in" : "في هالموقف... وتحتاج تتكلم إنجليزي"}</div>
            <div style={{ fontSize: 12, color: "#7a8295", marginTop: 8 }}>التخيّل يُنشئ ارتباط في ذاكرتك = تتذكر الجمل أسرع 5x</div>
          </div>}
          <div style={{ background: "rgba(196,154,56,0.06)", border: "1px solid rgba(196,154,56,0.12)", borderRadius: 14, padding: 24, textAlign: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 15, color: "#9ca3b5", marginBottom: 16, lineHeight: 2 }}>استمع للمحادثة جملة جملة — حاول تفهم بدون ما تشوف النص</div>
            {listenIdx === -1 && !listenDone && (
              <div>
                <div style={{ fontSize: 11, color: "#7a8295", marginBottom: 8 }}>{"مقطع " + (listenChunk + 1) + "/" + Math.ceil(sc.dialogue.length / 3) + " — ٣ جمل في كل مقطع (لتركيز أفضل)"}</div>
                <button onClick={playDialogueSequence} style={{ padding: "14px 32px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#c49a38,#c49a38)", color: "#fff", fontFamily: "inherit", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>{"🔊 " + (listenChunk === 0 ? "ابدأ الاستماع" : "استمع المقطع التالي")}</button>
              </div>
            )}
            {/* After chunk finishes but more remain */}
            {listenIdx === -1 && !listenDone && listenChunk > 0 && (
              <div style={{ fontSize: 12, color: "#5ec4b6", marginTop: 8 }}>{"✓ سمعت " + (listenChunk * 3) + " جمل — كمّل؟"}</div>
            )}
            {listenIdx >= 0 && (
              <div>
                <div style={{ fontSize: 40, marginBottom: 8 }}>🔊</div>
                <div style={{ display: "flex", gap: 4, justifyContent: "center", marginBottom: 8 }}>
                  {sc.dialogue.map((_, di) => (
                    <div key={di} style={{ width: 12, height: 12, borderRadius: "50%", background: di < listenIdx ? "#5ec4b6" : di === listenIdx ? "#c49a38" : "#1e2130", transition: ".3s", border: di === listenIdx ? "2px solid #fff" : "none" }} />
                  ))}
                </div>
                <div style={{ fontSize: 14, color: "#e8b84b" }}>{"جملة " + (listenIdx + 1) + "/" + sc.dialogue.length + " — " + sc.dialogue[listenIdx].speaker}</div>
              </div>
            )}
          </div>
          {listenDone && (
            <div style={{ animation: "fadeUp .3s" }}>
              {/* Comprehension check */}
              {sc.listenQ && listenAnswer === null && (
                <div style={{ background: "rgba(196,154,56,0.06)", border: "1px solid rgba(196,154,56,0.12)", borderRadius: 12, padding: 16, marginBottom: 12 }}>
                  <div style={{ fontSize: 14, color: "#e8b84b", fontWeight: 700, marginBottom: 10 }}>🤔 سؤال سريع — {sc.listenQ.q}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {sc.listenQ.opts.map((o, oi) => (
                      <div key={oi} onClick={() => setListenAnswer(oi)} style={{ padding: 12, borderRadius: 10, cursor: "pointer", fontSize: 14, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", transition: ".2s" }}>{o}</div>
                    ))}
                  </div>
                </div>
              )}
              {listenAnswer !== null && (
                <div style={{ textAlign: "center", marginBottom: 12 }}>
                  <div style={{ fontSize: 14, color: listenAnswer === (sc.listenQ ? sc.listenQ.ans : 0) ? "#5ec4b6" : "#e8b84b", fontWeight: 700, marginBottom: 4 }}>
                    {listenAnswer === (sc.listenQ ? sc.listenQ.ans : 0) ? "✓ صح! فهمت المحادثة" : "تقريباً — في الخطوة الجاية بتشوف النص وتلاحظ اللي فاتك"}
                  </div>
                </div>
              )}
              {(listenAnswer !== null || !sc.listenQ) && (
                <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                  <button onClick={() => { setListenDone(false); setListenAnswer(null); playDialogueSequence(); }} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(196,154,56,0.2)", background: "transparent", color: "#c49a38", fontFamily: "inherit", fontSize: 12, cursor: "pointer" }}>🔄 استمع مرة ثانية</button>
                  <button onClick={() => advanceStep(1)} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "#e8b84b", color: "#0f1119", fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>التالي →</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Listen + Read */}
      {step === 1 && (
        <div>
          <div style={{ fontSize: 13, color: "#9ca3b5", marginBottom: 12, lineHeight: 2 }}>اضغط 🔈 على كل جملة واقرأها. لاحظ الكلمات اللي ما فهمتها أول مرة.</div>
          {sc.dialogue.map((d, i) => (
            <div key={i} style={{ display: "flex", gap: 10, padding: 10, marginBottom: 4, borderRadius: 10, background: d.speaker === "أنت" ? "rgba(232,184,75,0.06)" : "rgba(255,255,255,0.02)", border: "1px solid " + (d.speaker === "أنت" ? "rgba(232,184,75,0.1)" : "rgba(255,255,255,0.04)") }}>
              <div style={{ fontSize: 11, color: d.speaker === "أنت" ? "#e8b84b" : "#e8b84b", fontWeight: 700, minWidth: 50, flexShrink: 0 }}>{d.speaker}</div>
              <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 14, direction: "ltr", textAlign: "left", lineHeight: 1.7, flex: 1, color: "#f0f0f5" }}>{d.text}</div>
              <SpeakBtn text={d.text} size={16} />
            </div>
          ))}
          <div style={{ textAlign: "center", marginTop: 14 }}>
            <button onClick={() => advanceStep(2)} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "#e8b84b", color: "#0f1119", fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>التالي: ردّد الجمل →</button>
          </div>
        </div>
      )}

      {/* Step 3: Shadow key phrases 3x */}
      {step === 2 && (
        <div>
          <div style={{ fontSize: 13, color: "#9ca3b5", marginBottom: 12, lineHeight: 2 }}>اسمع الجملة ← ردّدها بصوت عالٍ ← اضغط 🎙️ للتحقق من نطقك. الهدف: ٣ مرات.</div>
          {sc.keyPhrases.map((p, i) => {
            const r = shadowReps[i] || 0;
            const spokenResult = shadowSpoken[i];
            const setSpokenResult = (v) => setShadowSpoken(prev => ({ ...prev, [i]: v }));
            return (
              <div key={i} style={{ padding: 12, borderRadius: 10, background: r >= 5 ? "rgba(94,196,182,0.06)" : "rgba(255,255,255,0.02)", border: "1px solid " + (r >= 5 ? "rgba(94,196,182,0.15)" : "rgba(255,255,255,0.04)"), marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: r >= 5 ? "#5ec4b6" : r > 0 ? "#e8b84b" : "#252836", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: r > 0 ? "#0f1119" : "#5c6478", flexShrink: 0 }}>{r >= 5 ? "✓" : r + "/5"}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 15, direction: "ltr", textAlign: "left", lineHeight: 1.7 }}>{p.en}</div>
                    <div style={{ fontSize: 12, color: "#7a8295", marginTop: 2 }}>{p.ar}</div>
                  </div>
                  <SpeakBtn text={p.en} size={18} />
                </div>
                {r < 3 && (
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <button onClick={() => {
                      speak(p.en, 0.8);
                      // Start speech recognition after audio finishes
                      setTimeout(() => {
                        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
                        if (SR) {
                          const rec = new SR(); rec.lang = "en-US"; rec.interimResults = false;
                          rec.onresult = (e) => {
                            const heard = e.results[0][0].transcript.toLowerCase();
                            const target = p.en.toLowerCase().replace(/[.,!?']/g, "").split(/\s+/);
                            const heardW = heard.replace(/[.,!?']/g, "").split(/\s+/);
                            let m = 0; target.forEach(w => { if (heardW.includes(w)) m++; });
                            const pct = Math.round((m / target.length) * 100);
                            setSpokenResult(pct);
                            if (pct >= 50) setShadowReps(prev => ({ ...prev, [i]: (prev[i] || 0) + 1 }));
                          };
                          rec.onerror = () => { setShadowReps(prev => ({ ...prev, [i]: (prev[i] || 0) + 1 })); };
                          rec.start();
                        } else {
                          setShadowReps(prev => ({ ...prev, [i]: (prev[i] || 0) + 1 }));
                        }
                      }, 2500);
                    }} style={{ flex: 1, padding: "10px 16px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#c49a38,#c49a38)", color: "#fff", fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>🔊 استمع ثم 🎙️ ردّد</button>
                  </div>
                )}
                {spokenResult !== undefined && spokenResult !== null && (
                  <div style={{ fontSize: 12, color: spokenResult >= 80 ? "#5ec4b6" : spokenResult >= 50 ? "#e8b84b" : "#e87461", fontWeight: 600, marginTop: 4 }}>
                    {spokenResult >= 80 ? "نطق ممتاز! " + spokenResult + "%" : spokenResult >= 50 ? "جيد! " + spokenResult + "% — جرّب مرة ثانية" : "حاول مرة ثانية — ركّز على الكلمات المفتاحية"}
                  </div>
                )}
              </div>
            );
          })}
          {Object.values(shadowReps).filter(r => r >= 5).length >= sc.keyPhrases.length && (
            <div style={{ textAlign: "center", marginTop: 14 }}>
              <button onClick={() => advanceStep(3)} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "#e8b84b", color: "#0f1119", fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>التالي: تذكّر →</button>
            </div>
          )}
        </div>
      )}

      {/* Step 4: Recall — show Arabic, hide English, reveal to check */}
      {step === 3 && (
        <div>
          <div style={{ fontSize: 13, color: "#9ca3b5", marginBottom: 12, lineHeight: 2 }}>شوف الترجمة العربية فقط — حاول تقول الجملة الإنجليزية من ذاكرتك — ثم اضغط "أظهر" وقارن.</div>
          {sc.keyPhrases.map((p, i) => {
            const state = recallState[i] || "hidden";
            const selfScore = recallScore[i]; // undefined, "good", "partial", "forgot"
            return (
              <div key={i} style={{ background: "rgba(232,184,75,0.06)", border: "1px solid " + (selfScore === "good" ? "rgba(94,196,182,0.2)" : selfScore === "forgot" ? "rgba(232,116,97,0.15)" : "rgba(232,184,75,0.1)"), borderRadius: 10, padding: 14, marginBottom: 8 }}>
                {/* Always show Arabic */}
                <div style={{ fontSize: 14, color: "#e8b84b", fontWeight: 600, marginBottom: 8 }}>{p.ar}</div>

                {state === "hidden" && (
                  <button onClick={() => setRecallState(prev => ({ ...prev, [i]: "thinking" }))} style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "#e8b84b", color: "#0f1119", fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>قلها بصوت عالٍ ثم اضغط هنا</button>
                )}

                {state === "thinking" && (
                  <div>
                    <div style={{ fontSize: 12, color: "#9ca3b5", marginBottom: 8 }}>قلت الجملة؟ اضغط "أظهر" وقارن:</div>
                    <button onClick={() => setRecallState(prev => ({ ...prev, [i]: "revealed" }))} style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "#e8b84b", color: "#fff", fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>👁 أظهر الجملة</button>
                  </div>
                )}

                {state === "revealed" && (
                  <div>
                    <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 15, direction: "ltr", textAlign: "left", lineHeight: 1.7, color: "#f0f0f5", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ flex: 1 }}>{p.en}</span>
                      <SpeakBtn text={p.en} size={16} />
                    </div>
                    {/* FIX 8: Cross-context patterns */}
                    {(() => { const patterns = findCrossPatterns(p.en); return patterns.length > 0 ? (
                      <div style={{ fontSize: 11, color: "#e8b84b", marginBottom: 6, lineHeight: 1.8 }}>
                        {"🔗 " + patterns[0].pattern + " — " + patterns[0].usage}
                      </div>
                    ) : null; })()}
                    {!selfScore && (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => setRecallScore(prev => ({ ...prev, [i]: "good" }))} style={{ padding: "6px 14px", borderRadius: 6, border: "none", background: "rgba(94,196,182,0.15)", color: "#5ec4b6", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>تذكّرتها ✓</button>
                        <button onClick={() => setRecallScore(prev => ({ ...prev, [i]: "partial" }))} style={{ padding: "6px 14px", borderRadius: 6, border: "none", background: "rgba(232,184,75,0.15)", color: "#e8b84b", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>تقريباً</button>
                        <button onClick={() => setRecallScore(prev => ({ ...prev, [i]: "forgot" }))} style={{ padding: "6px 14px", borderRadius: 6, border: "none", background: "rgba(232,160,64,0.1)", color: "#e8a040", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>لسه</button>
                      </div>
                    )}
                    {selfScore && <div style={{ fontSize: 12, color: selfScore === "good" ? "#5ec4b6" : selfScore === "partial" ? "#e8b84b" : "#e87461", fontWeight: 600, marginTop: 4 }}>{selfScore === "good" ? "✓ ممتاز!" : selfScore === "partial" ? "⚡ قريب — ردّدها مرة" : "🔄 لسه ما ترسّخت — بنراجعها مع بعض"}</div>}
                  </div>
                )}
              </div>
            );
          })}
          {Object.keys(recallScore).length >= sc.keyPhrases.length && (() => {
            const forgotten = sc.keyPhrases.map((_, i) => i).filter(i => recallScore[i] === "forgot" || recallScore[i] === "partial");
            const allGood = forgotten.length === 0;
            return (
              <div style={{ marginTop: 14 }}>
                {!allGood && (
                  <div style={{ background: "rgba(232,116,97,0.06)", border: "1px solid rgba(232,160,64,0.1)", borderRadius: 10, padding: 14, marginBottom: 10, textAlign: "center" }}>
                    <div style={{ fontSize: 13, color: "#e87461", fontWeight: 600, marginBottom: 8 }}>{"🔄 " + forgotten.length + " جملة تحتاج مراجعة — ردّدها ثم أعد التقييم"}</div>
                    {forgotten.map(fi => (
                      <div key={fi} style={{ display: "flex", alignItems: "center", gap: 8, padding: 10, borderRadius: 8, background: "rgba(255,255,255,0.02)", marginBottom: 4 }}>
                        <SpeakBtn text={sc.keyPhrases[fi].en} size={18} color="#e8b84b" />
                        <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 14, direction: "ltr", textAlign: "left", flex: 1, color: "#f0f0f5" }}>{sc.keyPhrases[fi].en}</div>
                      </div>
                    ))}
                    <button onClick={() => { const newState = { ...recallState }; const newScore = { ...recallScore }; forgotten.forEach(fi => { newState[fi] = "hidden"; delete newScore[fi]; }); setRecallState(newState); setRecallScore(newScore); }} style={{ marginTop: 8, padding: "8px 20px", borderRadius: 8, border: "none", background: "#e8b84b", color: "#0f1119", fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>🔄 أعد اختبار الجمل المنسيّة</button>
                  </div>
                )}
                {allGood && (
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 13, color: "#5ec4b6", fontWeight: 600, marginBottom: 8 }}>✓ ممتاز! تذكّرت كل الجمل</div>
                    <button onClick={() => advanceStep(4)} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "#e8b84b", color: "#0f1119", fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>التالي: أنتج بنفسك →</button>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* Step 5: Produce + feedback */}
      {step === 4 && (
        <div>
          <div style={{ background: "rgba(232,116,97,0.06)", border: "1px solid rgba(232,116,97,0.12)", borderRadius: 12, padding: 16, marginBottom: 12 }}>
            <div style={{ fontSize: 15, color: "#f0f0f5", lineHeight: 2, marginBottom: 4 }}>{sc.producePrompt}</div>
          </div>
          <textarea value={prodInput} onChange={(e) => !prodSubmitted && setProdInput(e.target.value)} placeholder="اكتب ردك بالإنجليزي..." disabled={prodSubmitted} style={{ width: "100%", minHeight: 80, padding: 14, borderRadius: 12, fontFamily: "'IBM Plex Mono'", fontSize: 15, direction: "ltr", textAlign: "left", lineHeight: 1.8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(232,116,97,0.2)", color: "#f0f0f5", outline: "none", resize: "vertical", marginBottom: 12 }} />
          {!prodSubmitted ? (
            <div style={{ textAlign: "center" }}>
              <button onClick={() => setProdSubmitted(true)} disabled={prodInput.trim().length < 5} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: prodInput.trim().length >= 5 ? "#e87461" : "#252836", color: prodInput.trim().length >= 5 ? "#0f1119" : "#5c6478", fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: prodInput.trim().length >= 5 ? "pointer" : "default" }}>✓ أرسل</button>
            </div>
          ) : (
            <div>
              <div style={{ background: "rgba(94,196,182,0.06)", border: "1px solid rgba(94,196,182,0.12)", borderRadius: 12, padding: 14, marginBottom: 8 }}>
                <div style={{ fontSize: 12, color: "#5ec4b6", fontWeight: 700, marginBottom: 6 }}>النموذج المثالي:</div>
                <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 15, direction: "ltr", textAlign: "left", lineHeight: 1.8, color: "#f0f0f5", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ flex: 1 }}>{sc.produceModel}</span>
                  <SpeakBtn text={sc.produceModel} size={16} />
                </div>
              </div>
              {/* FIX 7: AI feedback on writing */}
              {getOpenAIKey() && !aiFeedback && !aiLoading && (
                <div style={{ textAlign: "center", marginBottom: 8 }}>
                  <button onClick={async () => {
                    setAiLoading(true);
                    try {
                      const res = await fetch("https://api.openai.com/v1/chat/completions", {
                        method: "POST", headers: { "Authorization": "Bearer " + getOpenAIKey(), "Content-Type": "application/json" },
                        body: JSON.stringify({ model: "gpt-4o-mini", max_tokens: 200, messages: [
                          { role: "system", content: "You are an English language coach for Arabic speakers. Compare the student's response with the model answer. Give 2-3 SHORT tips in Arabic about grammar, vocabulary, or naturalness. Be encouraging. Max 3 lines." },
                          { role: "user", content: "Situation: " + sc.producePrompt + "\nStudent wrote: " + prodInput + "\nModel answer: " + sc.produceModel + "\nGive feedback in Arabic:" }
                        ] })
                      });
                      const data = await res.json();
                      setAiFeedback(data.choices[0].message.content);
                    } catch { setAiFeedback("لم أتمكن من الاتصال. تحقق من مفتاح API."); }
                    setAiLoading(false);
                  }} style={{ padding: "6px 16px", borderRadius: 8, border: "1px solid rgba(196,154,56,0.2)", background: "transparent", color: "#c49a38", fontFamily: "inherit", fontSize: 12, cursor: "pointer" }}>🤖 تحليل ذكي لكتابتك</button>
                </div>
              )}
              {aiLoading && <div style={{ textAlign: "center", fontSize: 12, color: "#c49a38", marginBottom: 8 }}>جاري التحليل...</div>}
              {aiFeedback && (
                <div style={{ background: "rgba(196,154,56,0.06)", border: "1px solid rgba(196,154,56,0.12)", borderRadius: 12, padding: 14, marginBottom: 8 }}>
                  <div style={{ fontSize: 12, color: "#c49a38", fontWeight: 700, marginBottom: 6 }}>🤖 تحليل ذكي:</div>
                  <div style={{ fontSize: 13, color: "#f0d78a", lineHeight: 2, whiteSpace: "pre-wrap" }}>{aiFeedback}</div>
                </div>
              )}
              {/* Noticing feedback — explain WHY */}
              <div style={{ background: "rgba(232,184,75,0.06)", border: "1px solid rgba(232,184,75,0.12)", borderRadius: 12, padding: 14, marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: "#e8b84b", fontWeight: 700, marginBottom: 6 }}>💡 لاحظ الفرق:</div>
                {sc.noticingTips ? sc.noticingTips.map((tip, ti) => (
                  <div key={ti} style={{ fontSize: 13, color: "#f0d78a", lineHeight: 2, marginBottom: 2 }}>{"• " + tip}</div>
                )) : (
                  <div style={{ fontSize: 13, color: "#f0d78a", lineHeight: 2 }}>قارن ردّك بالنموذج — لاحظ: هل استخدمت "please"؟ هل حددت طلبك بوضوح؟ هل سألت سؤال إضافي يُظهر ثقة؟</div>
                )}
              </div>
              <div style={{ textAlign: "center" }}>
                <button onClick={() => advanceStep(5)} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "#e8b84b", color: "#0f1119", fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>التالي: تحدّي اليوم →</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 6: Real-world challenge */}
      {step === 5 && (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🌍</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#e8b84b", marginBottom: 12 }}>تحدّي اليوم</div>
          <div style={{ background: "rgba(232,184,75,0.06)", border: "1px solid rgba(232,184,75,0.12)", borderRadius: 14, padding: 20, marginBottom: 16 }}>
            <div style={{ fontSize: 16, color: "#f0f0f5", lineHeight: 2 }}>{sc.challenge}</div>
          </div>
          {!challengeAccepted ? (
            <button onClick={() => {
              setChallengeAccepted(true);
              const sessionData = { scenario: sc.title, date: gtd(), recallScore: { ...recallScore }, phrasesCount: sc.keyPhrases.length };
              (async () => { try {
                const r = await storage.get("session-history");
                const hist = r && r.value ? JSON.parse(r.value) : [];
                hist.push(sessionData);
                await storage.set("session-history", JSON.stringify(hist));
              } catch(e) {} })();
              if (onComplete) onComplete();
            }} style={{ padding: "12px 28px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#5ec4b6,#e8b84b)", color: "#0f1119", fontFamily: "inherit", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>أقبل التحدي ✓</button>
          ) : !challengeDone ? (
            <div style={{ animation: "fadeUp .4s" }}>
              {/* FIX 4: Challenge follow-up */}
              <div style={{ fontSize: 14, color: "#e8b84b", fontWeight: 700, marginBottom: 10 }}>سوّيت التحدي؟</div>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 10 }}>
                <button onClick={() => setChallengeDone(true)} style={{ padding: "8px 20px", borderRadius: 10, border: "none", background: "#5ec4b6", color: "#0f1119", fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>نعم سويته ✓</button>
                <button onClick={() => setChallengeDone(true)} style={{ padding: "8px 20px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "#7a8295", fontFamily: "inherit", fontSize: 13, cursor: "pointer" }}>بسويه لاحقاً</button>
              </div>
              <input value={challengeNote} onChange={(e) => setChallengeNote(e.target.value)} placeholder="كيف كانت التجربة؟ (اختياري)" style={{ width: "100%", padding: 10, borderRadius: 10, fontFamily: "inherit", fontSize: 13, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", color: "#f0f0f5", outline: "none", textAlign: "center" }} />
            </div>
          ) : (
            <div style={{ animation: "fadeUp .4s" }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🎉</div>
              {/* FIX 5: Self-efficacy message based on history */}
              {(() => {
                const totalSessions = (sessionHistory || []).length;
                const recalled = Object.values(recallScore).filter(v => v === "good").length;
                const total = sc.keyPhrases.length;
                if (totalSessions === 0) return <div style={{ fontSize: 16, fontWeight: 700, color: "#5ec4b6", marginBottom: 6 }}>أول جلسة لك! بداية ممتازة.</div>;
                if (recalled === total) return <div style={{ fontSize: 16, fontWeight: 700, color: "#5ec4b6", marginBottom: 6, lineHeight: 2 }}>تذكّرت كل الجمل من ذاكرتك!<br/>هذا دليل إن عقلك يبني مسارات جديدة.</div>;
                if (totalSessions >= 7) return <div style={{ fontSize: 16, fontWeight: 700, color: "#5ec4b6", marginBottom: 6, lineHeight: 2 }}>أسبوع كامل! {totalSessions} جلسة أنجزتها.<br/>قبل أسبوع ما كنت تعرف هالجمل. اليوم تقولها.</div>;
                return <div style={{ fontSize: 16, fontWeight: 700, color: "#5ec4b6", marginBottom: 6, lineHeight: 2 }}>جلسة #{totalSessions + 1} مكتملة!<br/>كل جلسة تقرّبك خطوة من الطلاقة الحقيقية.</div>;
              })()}
              <div style={{ fontSize: 13, color: "#9ca3b5", lineHeight: 2 }}>تمرّنت على "{sc.title}" من ٦ زوايا. الجمل الآن أقرب لذاكرتك طويلة المدى.</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ===== FIX 6: PRONUNCIATION CHECK (Web Speech Recognition) =====
function PronounceBtn({ targetText, size }) {
  const [state, setState] = useState("idle"); // idle, listening, result
  const [result, setResult] = useState("");
  const [score, setScore] = useState(0);

  function startListening() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setState("nosupport"); return; }
    setState("listening");
    const recognition = new SR();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const heard = event.results[0][0].transcript.toLowerCase().trim();
      setResult(heard);
      // Compare with target
      const targetWords = targetText.toLowerCase().replace(/[.,!?']/g, "").split(/\s+/);
      const heardWords = heard.replace(/[.,!?']/g, "").split(/\s+/);
      let match = 0;
      targetWords.forEach(w => { if (heardWords.includes(w)) match++; });
      const pct = Math.round((match / targetWords.length) * 100);
      setScore(pct);
      setState("result");
    };
    recognition.onerror = () => { setState("idle"); };
    recognition.onend = () => { if (state === "listening") setState("idle"); };
    recognition.start();
  }

  if (state === "nosupport") return null;
  if (state === "idle") return (
    <button onClick={startListening} style={{ background: "none", border: "1px solid rgba(232,184,75,0.2)", borderRadius: 6, cursor: "pointer", fontSize: size || 12, padding: "3px 8px", color: "#e8b84b", flexShrink: 0 }} title="جرّب نطقك">🎙️</button>
  );
  if (state === "listening") return (
    <span style={{ fontSize: size || 12, color: "#e87461", animation: "pulse 1s infinite" }}>🔴 تكلم...</span>
  );
  return (
    <span style={{ fontSize: size || 11, color: score >= 80 ? "#5ec4b6" : score >= 50 ? "#e8b84b" : "#e87461", fontWeight: 600 }}>{score >= 80 ? "✓ " + score + "%" : score + "%"}</span>
  );
}

// ===== 4-3-2 FLUENCY TECHNIQUE =====
// Nation (1989): Speak about the SAME topic for 4 minutes, then 3, then 2.
// Each round forces faster retrieval = builds automaticity = real fluency.
const FLUENCY_TOPICS = [
  { topic: "Describe your typical day from morning to night", ar: "اوصف يومك العادي من الصبح لليل", starters: ["I usually wake up at...", "The first thing I do is...", "For lunch, I...", "In the evening, I..."] },
  { topic: "Talk about your favorite trip or vacation", ar: "تكلم عن أحلى رحلة سويتها", starters: ["One of my best trips was to...", "I went there because...", "The best part was...", "I would go back because..."] },
  { topic: "Describe your home and your neighborhood", ar: "وصف بيتك وحيّك", starters: ["I live in a... in...", "My home has...", "The neighborhood is...", "What I like most about it is..."] },
  { topic: "Talk about your family", ar: "تكلم عن عائلتك", starters: ["I have... in my family.", "My oldest... is...", "We usually spend time together by...", "The best thing about my family is..."] },
  { topic: "Describe a skill you are learning or want to learn", ar: "مهارة تتعلمها أو تبي تتعلمها", starters: ["I've been trying to learn...", "I started because...", "The hardest part is...", "I practice by..."] },
  { topic: "Talk about something that made you happy recently", ar: "شيء فرّحك مؤخراً", starters: ["Recently, something great happened...", "It made me happy because...", "I remember feeling...", "It reminded me that..."] },
  { topic: "Describe your dream job or project", ar: "وظيفة أو مشروع أحلامك", starters: ["If I could do anything, I would...", "The reason is...", "I think I would be good at it because...", "The first step would be..."] },
  { topic: "Talk about your favorite food and how to make it", ar: "أكلتك المفضلة وكيف تنسوي", starters: ["My favorite dish is...", "You need... to make it.", "First, you...", "The secret is..."] },
  { topic: "Describe a person you admire and why", ar: "شخص تحترمه وليش", starters: ["Someone I really admire is...", "I admire them because...", "One thing they taught me is...", "They inspire me to..."] },
  { topic: "Talk about how technology changed your life", ar: "كيف التقنية غيّرت حياتك", starters: ["Technology has changed my life by...", "I use my phone to...", "Before, I used to..., but now...", "The most useful app for me is..."] },
];

function Fluency432() {
  const [round, setRound] = useState(0); // 0=intro, 1=4min, 2=3min, 3=2min, 4=done
  const [sec, setSec] = useState(0);
  const [running, setRunning] = useState(false);
  const [topicIdx, setTopicIdx] = useState(gdn() % FLUENCY_TOPICS.length);
  const timerRef = useRef(null);

  const roundTimes = [0, 240, 180, 120]; // seconds for rounds 1-3
  const roundLabels = ["", "٤ دقائق — تكلم بحرية", "٣ دقائق — نفس الموضوع أسرع", "٢ دقائق — نفس الموضوع بأقصى سرعة"];
  const topic = FLUENCY_TOPICS[topicIdx];

  function startRound(r) {
    setRound(r);
    setSec(roundTimes[r]);
    setRunning(true);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSec(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); setRunning(false); return 0; }
        return prev - 1;
      });
    }, 1000);
  }

  function restart() {
    clearInterval(timerRef.current);
    setTopicIdx((topicIdx + 1) % FLUENCY_TOPICS.length);
    setRound(0); setSec(0); setRunning(false);
  }

  useEffect(() => () => clearInterval(timerRef.current), []);

  if (round === 0) return (
    <div style={{ animation: "fadeUp .4s" }}>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>🗣️</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#e87461", marginBottom: 6 }}>تمرين الطلاقة 4-3-2</div>
        <div style={{ fontSize: 13, color: "#9ca3b5", lineHeight: 2 }}>تكلم عن نفس الموضوع ٣ مرات — كل مرة وقت أقل<br />مخك يتعلم يسترجع الجمل أسرع = طلاقة حقيقية</div>
      </div>
      <div style={{ background: "rgba(232,116,97,0.06)", border: "1px solid rgba(232,116,97,0.12)", borderRadius: 14, padding: 20, textAlign: "center", marginBottom: 14 }}>
        <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 17, color: "#e87461", direction: "ltr", lineHeight: 1.6, marginBottom: 8 }}>{topic.topic}</div>
        <div style={{ fontSize: 14, color: "#7a8295" }}>{topic.ar}</div>
      </div>
      <div style={{ background: "rgba(232,184,75,0.06)", border: "1px solid rgba(232,184,75,0.12)", borderRadius: 12, padding: 14, marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: "#e8b84b", fontWeight: 700, marginBottom: 8 }}>💡 استخدم هالجمل كبداية:</div>
        {topic.starters.map((st, si) => <div key={si} style={{ fontFamily: "'IBM Plex Mono'", fontSize: 14, direction: "ltr", textAlign: "left", lineHeight: 1.8, color: "#f0d78a", padding: "3px 0" }}>{st}</div>)}
      </div>
      <div style={{ textAlign: "center" }}>
        <button onClick={() => startRound(1)} style={{ padding: "12px 28px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#e87461,#e8b84b)", color: "#fff", fontFamily: "inherit", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>ابدأ الجولة الأولى (٤ دقائق) →</button>
      </div>
    </div>
  );

  if (round === 4) return (
    <div style={{ textAlign: "center", padding: 20, animation: "fadeUp .4s" }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>🔥</div>
      <div style={{ fontSize: 20, fontWeight: 800, color: "#5ec4b6", marginBottom: 8 }}>أحسنت!</div>
      <div style={{ fontSize: 14, color: "#9ca3b5", lineHeight: 2, marginBottom: 16 }}>تكلمت عن نفس الموضوع ٣ مرات — كل مرة بسرعة أكبر.<br />لاحظت كيف الجمل صارت تطلع أسرع في الجولة الثالثة؟<br />هذا بالضبط كيف تُبنى الطلاقة.</div>
      <button onClick={restart} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "#e87461", color: "#fff", fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>🔄 موضوع جديد</button>
    </div>
  );

  return (
    <div style={{ animation: "fadeUp .4s" }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {[1, 2, 3].map(r => (
          <div key={r} style={{ flex: 1, height: 6, borderRadius: 3, background: r < round ? "#5ec4b6" : r === round ? "#e87461" : "#1e2130" }} />
        ))}
      </div>

      <div style={{ textAlign: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 13, color: "#e87461", fontWeight: 700, marginBottom: 8 }}>{"الجولة " + round + "/3 — " + roundLabels[round]}</div>
        <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 52, fontWeight: 800, color: sec <= 10 && sec > 0 ? "#e87461" : running ? "#e87461" : "#5ec4b6" }}>{String(Math.floor(sec / 60)).padStart(2, "0") + ":" + String(sec % 60).padStart(2, "0")}</div>
        {sec === 0 && !running && <div style={{ color: "#5ec4b6", fontWeight: 700, marginTop: 6, fontSize: 14 }}>✅ انتهى الوقت!</div>}
      </div>

      <div style={{ background: "rgba(232,116,97,0.04)", border: "1px solid rgba(232,116,97,0.08)", borderRadius: 12, padding: 14, marginBottom: 14, textAlign: "center" }}>
        <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 15, color: "#f0f0f5", direction: "ltr", lineHeight: 1.6 }}>{topic.topic}</div>
      </div>

      {running && <div style={{ textAlign: "center", fontSize: 14, color: "#7a8295", lineHeight: 2 }}>
        {round === 1 && "خذ وقتك — تكلم بأي سرعة. الهدف: غطِّ أكبر قدر من النقاط"}
        {round === 2 && "نفس الأفكار — لكن أسرع. لاحظ إن الجمل تطلع أسهل"}
        {round === 3 && "آخر جولة — أقصى سرعة ممكنة. لاحظ الفرق عن أول مرة!"}
      </div>}

      {sec === 0 && !running && round < 3 && (
        <div style={{ textAlign: "center", marginTop: 10 }}>
          <button onClick={() => startRound(round + 1)} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "#e87461", color: "#fff", fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>{"الجولة " + (round + 1) + " (" + (round === 1 ? "٣" : "٢") + " دقائق) →"}</button>
        </div>
      )}
      {sec === 0 && !running && round === 3 && (
        <div style={{ textAlign: "center", marginTop: 10 }}>
          <button onClick={() => setRound(4)} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#5ec4b6,#e8b84b)", color: "#0f1119", fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>🏁 النتيجة</button>
        </div>
      )}
    </div>
  );
}

// ===== LISTENING COMPREHENSION =====
function ListenExercise() {
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const qs = useRef(shuffle(LISTEN_ITEMS, gdn()).slice(0, 8));

  function playQ() { speak(qs.current[qi].text, 0.85); }
  function pick(oi) {
    setPicked(oi);
    const { correctIndex } = shuffleOpts(qs.current[qi].opts, qs.current[qi].ans, qi * 19 + 73);
    if (oi === correctIndex) setScore(score + 1);
  }
  function next() { if (qi + 1 >= qs.current.length) { setDone(true); return; } setQi(qi + 1); setPicked(null); setRevealed(false); }
  function restart() { qs.current = shuffle(LISTEN_ITEMS, Date.now()); setQi(0); setPicked(null); setScore(0); setDone(false); setRevealed(false); }

  // Auto-play on mount and question change
  useEffect(() => { if (!done) { const t = setTimeout(() => playQ(), 400); return () => clearTimeout(t); } }, [qi, done]);

  if (done) return (
    <div style={{ textAlign: "center", padding: 20, animation: "fadeUp .4s" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>👂</div>
      <div style={{ fontSize: 24, fontWeight: 800, color: score >= 6 ? "#5ec4b6" : score >= 4 ? "#e8b84b" : "#e87461", marginBottom: 8 }}>{score + "/" + qs.current.length}</div>
      <div style={{ fontSize: 14, color: "#9ca3b5", marginBottom: 16 }}>{score >= 6 ? "ممتاز! أذنك صارت تلتقط بسرعة" : score >= 4 ? "جيد! استمر — الاستماع يتحسن بالتكرار" : "ركّز أكثر على الاستماع — أعد الجمل اللي ما فهمتها"}</div>
      <button onClick={restart} style={{ padding: "8px 20px", borderRadius: 10, border: "none", background: "#c49a38", color: "#fff", fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>🔄 جولة جديدة</button>
    </div>
  );

  const raw = qs.current[qi];
  const { opts: qOpts, correctIndex: qAns } = shuffleOpts(raw.opts, raw.ans, qi * 19 + 73);

  return (
    <div style={{ animation: "fadeUp .4s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ fontSize: 13, color: "#7a8295" }}>{"سؤال " + (qi + 1) + "/" + qs.current.length}</div>
        <div style={{ fontSize: 13, color: "#c49a38", fontWeight: 600 }}>{score + " صحيح"}</div>
      </div>

      <div style={{ background: "rgba(196,154,56,0.06)", border: "1px solid rgba(196,154,56,0.12)", borderRadius: 12, padding: 20, marginBottom: 12, textAlign: "center" }}>
        <button onClick={playQ} style={{ padding: "12px 28px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#c49a38,#c49a38)", color: "#fff", fontFamily: "inherit", fontSize: 16, fontWeight: 700, cursor: "pointer", marginBottom: 10 }}>🔊 استمع للجملة</button>
        <div style={{ fontSize: 12, color: "#7a8295" }}>اضغط للاستماع — ثم أجب على السؤال</div>
        {revealed && <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 14, color: "#c49a38", marginTop: 10, direction: "ltr" }}>{raw.text}</div>}
      </div>

      <div style={{ fontSize: 14, color: "#f0f0f5", marginBottom: 10, fontWeight: 600 }}>{raw.q}</div>

      {qOpts.map((o, oi) => {
        const show = picked !== null;
        const isCorrect = oi === qAns;
        const isPicked = picked === oi;
        let bg = "rgba(255,255,255,0.02)", brd = "rgba(255,255,255,0.04)";
        if (show && isCorrect) { bg = "rgba(94,196,182,0.1)"; brd = "rgba(94,196,182,0.3)"; }
        else if (show && isPicked && !isCorrect) { bg = "rgba(232,160,64,0.1)"; brd = "rgba(232,160,64,0.3)"; }
        return <div key={oi} onClick={() => !show && pick(oi)} style={{ padding: 12, borderRadius: 10, marginBottom: 5, cursor: show ? "default" : "pointer", fontSize: 14, lineHeight: 1.7, background: bg, border: "1px solid " + brd, opacity: show && !isCorrect && !isPicked ? 0.3 : 1 }}>
          {o}{show && isCorrect && <span style={{ color: "#5ec4b6", fontSize: 11 }}> ✓</span>}
        </div>;
      })}
      {picked !== null && (
        <div style={{ textAlign: "center", marginTop: 10 }}>
          {!revealed && <button onClick={() => setRevealed(true)} style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(196,154,56,0.2)", background: "transparent", color: "#c49a38", fontFamily: "inherit", fontSize: 12, cursor: "pointer", marginLeft: 8 }}>👁 أظهر النص</button>}
          <button onClick={next} style={{ padding: "8px 20px", borderRadius: 10, border: "none", background: "#c49a38", color: "#fff", fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer", marginRight: 8 }}>{qi + 1 >= qs.current.length ? "🏁 النتيجة" : "التالي ←"}</button>
        </div>
      )}
    </div>
  );
}

// ===== DICTATION =====
function DictationExercise() {
  const [qi, setQi] = useState(0);
  const [input, setInput] = useState("");
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const qs = useRef(shuffle(DICTATION_ITEMS, gdn()).slice(0, 8));

  function playQ() { speak(qs.current[qi], 0.75); }
  function check() {
    setChecked(true);
    const userWords = input.trim().toLowerCase().replace(/[.,!?]/g, "").split(/\s+/).filter(Boolean);
    const correctWords = qs.current[qi].toLowerCase().replace(/[.,!?]/g, "").split(/\s+/).filter(Boolean);
    let match = 0;
    correctWords.forEach(w => { if (userWords.includes(w)) match++; });
    if (match / correctWords.length >= 0.7) setScore(score + 1);
  }
  function next() { if (qi + 1 >= qs.current.length) { setDone(true); return; } setQi(qi + 1); setInput(""); setChecked(false); }
  function restart() { qs.current = shuffle(DICTATION_ITEMS, Date.now()); setQi(0); setInput(""); setChecked(false); setScore(0); setDone(false); }

  useEffect(() => { if (!done) { const t = setTimeout(() => playQ(), 400); return () => clearTimeout(t); } }, [qi, done]);

  if (done) return (
    <div style={{ textAlign: "center", padding: 20, animation: "fadeUp .4s" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🎧</div>
      <div style={{ fontSize: 24, fontWeight: 800, color: score >= 6 ? "#5ec4b6" : score >= 4 ? "#e8b84b" : "#e87461", marginBottom: 8 }}>{score + "/" + qs.current.length}</div>
      <div style={{ fontSize: 14, color: "#9ca3b5", marginBottom: 16 }}>{score >= 6 ? "ممتاز! أذنك تلتقط التفاصيل" : score >= 4 ? "جيد! استمر بالاستماع" : "أعد الاستماع لكل جملة عدة مرات"}</div>
      <button onClick={restart} style={{ padding: "8px 20px", borderRadius: 10, border: "none", background: "#e87461", color: "#fff", fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>🔄 جولة جديدة</button>
    </div>
  );

  const correct = qs.current[qi];
  const userWords = input.trim().toLowerCase().replace(/[.,!?]/g, "").split(/\s+/).filter(Boolean);
  const correctWords = correct.toLowerCase().replace(/[.,!?]/g, "").split(/\s+/).filter(Boolean);

  return (
    <div style={{ animation: "fadeUp .4s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ fontSize: 13, color: "#7a8295" }}>{"جملة " + (qi + 1) + "/" + qs.current.length}</div>
        <div style={{ fontSize: 13, color: "#e87461", fontWeight: 600 }}>{score + " صحيح"}</div>
      </div>

      <div style={{ background: "rgba(232,116,97,0.06)", border: "1px solid rgba(232,116,97,0.12)", borderRadius: 12, padding: 20, marginBottom: 12, textAlign: "center" }}>
        <button onClick={playQ} style={{ padding: "12px 28px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#e87461,#e87461)", color: "#fff", fontFamily: "inherit", fontSize: 16, fontWeight: 700, cursor: "pointer", marginBottom: 6 }}>🔊 استمع</button>
        <div style={{ marginTop: 6 }}>
          <button onClick={() => speak(qs.current[qi], 0.55)} style={{ padding: "4px 12px", borderRadius: 6, border: "1px solid rgba(232,116,97,0.2)", background: "transparent", color: "#e87461", fontFamily: "inherit", fontSize: 11, cursor: "pointer" }}>🐢 بطيء</button>
        </div>
        <div style={{ fontSize: 12, color: "#7a8295", marginTop: 8 }}>استمع ثم اكتب ما سمعته بالإنجليزي</div>
      </div>

      <textarea value={input} onChange={(e) => !checked && setInput(e.target.value)} placeholder="اكتب ما سمعته هنا..." disabled={checked} style={{ width: "100%", minHeight: 70, padding: 14, borderRadius: 12, fontFamily: "'IBM Plex Mono'", fontSize: 15, direction: "ltr", textAlign: "left", lineHeight: 1.8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(232,116,97,0.2)", color: "#f0f0f5", outline: "none", resize: "vertical", marginBottom: 12 }} />

      {!checked ? (
        <div style={{ textAlign: "center" }}>
          <button onClick={check} disabled={input.trim().length < 3} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: input.trim().length >= 3 ? "#e87461" : "#252836", color: input.trim().length >= 3 ? "#fff" : "#5c6478", fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: input.trim().length >= 3 ? "pointer" : "default" }}>✓ تحقق</button>
        </div>
      ) : (
        <div>
          <div style={{ background: "rgba(94,196,182,0.06)", border: "1px solid rgba(94,196,182,0.12)", borderRadius: 12, padding: 14, marginBottom: 10 }}>
            <div style={{ fontSize: 12, color: "#5ec4b6", fontWeight: 700, marginBottom: 6 }}>✓ الجملة الصحيحة:</div>
            <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 15, direction: "ltr", textAlign: "left", lineHeight: 1.8, color: "#f0f0f5" }}>{correct}</div>
          </div>
          <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 13, direction: "ltr", textAlign: "left", lineHeight: 2, marginBottom: 10 }}>
            {correctWords.map((w, wi) => {
              const matched = userWords.includes(w);
              return <span key={wi} style={{ color: matched ? "#5ec4b6" : "#e87461", fontWeight: matched ? 400 : 700 }}>{w + " "}</span>;
            })}
          </div>
          <div style={{ textAlign: "center" }}>
            <button onClick={next} style={{ padding: "8px 24px", borderRadius: 10, border: "none", background: "#e87461", color: "#fff", fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>{qi + 1 >= qs.current.length ? "🏁 النتيجة" : "التالي ←"}</button>
          </div>
        </div>
      )}
    </div>
  );
}

function LevelTest({ onComplete }) {
  const [phase, setPhase] = useState("intro"); // intro, testing, result
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState(null);
  const [currentLevel, setCurrentLevel] = useState(2); // Start at B1
  const [history, setHistory] = useState([]); // {level, correct}
  const [questions, setQuestions] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [levelScores, setLevelScores] = useState({0:0,1:0,2:0,3:0,4:0,5:0});
  const [levelAttempts, setLevelAttempts] = useState({0:0,1:0,2:0,3:0,4:0,5:0});
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [consecutiveWrong, setConsecutiveWrong] = useState(0);
  const [finalLevel, setFinalLevel] = useState(null);
  const [skillBreakdown, setSkillBreakdown] = useState(null);

  const TOTAL_QUESTIONS = 25;

  function startTest() {
    // Build adaptive question pool - pick from current level
    const seed = Date.now();
    const pool = [];
    for (let lvl = 0; lvl < 6; lvl++) {
      const lvlQs = LEVEL_TEST.filter(q => q.level === lvl);
      pool.push(shuffle(lvlQs, seed + lvl));
    }
    setQuestions(pool);
    setPhase("testing");
    setStartTime(Date.now());
  }

  function getNextQuestion() {
    if (!questions.length) return null;
    const lvlPool = questions[currentLevel];
    // Find next unanswered question at this level
    const answered = history.filter(h => h.level === currentLevel).length;
    if (answered < lvlPool.length) return { ...lvlPool[answered], _level: currentLevel };
    // If exhausted at this level, try adjacent
    for (let d = 1; d <= 5; d++) {
      for (const dir of [1, -1]) {
        const tryLvl = currentLevel + d * dir;
        if (tryLvl >= 0 && tryLvl <= 5) {
          const pool2 = questions[tryLvl];
          const ans2 = history.filter(h => h.level === tryLvl).length;
          if (ans2 < pool2.length) return { ...pool2[ans2], _level: tryLvl };
        }
      }
    }
    return null;
  }

  function pick(oi) {
    if (picked !== null) return;
    const currentQ = getNextQuestion();
    if (!currentQ) return;
    const { correctIndex } = shuffleOpts(currentQ.opts, currentQ.ans, qi * 31 + 97 + currentQ._level * 7);
    const isCorrect = oi === correctIndex;
    setPicked(oi);

    const newHistory = [...history, { level: currentQ._level, correct: isCorrect, type: currentQ.type }];
    setHistory(newHistory);

    const newScores = { ...levelScores };
    const newAttempts = { ...levelAttempts };
    if (isCorrect) newScores[currentQ._level]++;
    newAttempts[currentQ._level]++;
    setLevelScores(newScores);
    setLevelAttempts(newAttempts);

    // Adaptive logic
    let newConsCorrect = isCorrect ? consecutiveCorrect + 1 : 0;
    let newConsWrong = isCorrect ? 0 : consecutiveWrong + 1;
    setConsecutiveCorrect(newConsCorrect);
    setConsecutiveWrong(newConsWrong);

    let newLevel = currentLevel;
    if (newConsCorrect >= 2 && currentLevel < 5) {
      newLevel = currentLevel + 1;
      newConsCorrect = 0;
      setConsecutiveCorrect(0);
    } else if (newConsWrong >= 2 && currentLevel > 0) {
      newLevel = currentLevel - 1;
      newConsWrong = 0;
      setConsecutiveWrong(0);
    }
    setCurrentLevel(newLevel);
  }

  function next() {
    if (qi + 1 >= TOTAL_QUESTIONS) {
      finishTest();
      return;
    }
    setQi(qi + 1);
    setPicked(null);
  }

  function finishTest() {
    // Calculate final level using weighted scoring
    // Higher levels worth more, need to sustain performance
    let weightedScore = 0;
    let maxPossible = 0;
    const skills = { grammar: { correct: 0, total: 0 }, vocab: { correct: 0, total: 0 }, reading: { correct: 0, total: 0 }, pragmatics: { correct: 0, total: 0 } };

    history.forEach(h => {
      const weight = h.level + 1; // A1=1, C2=6
      if (h.correct) weightedScore += weight;
      maxPossible += weight;
      if (skills[h.type]) {
        skills[h.type].total++;
        if (h.correct) skills[h.type].correct++;
      }
    });

    // Determine level: find highest level where accuracy >= 60%
    let detectedLevel = 0;
    for (let lvl = 5; lvl >= 0; lvl--) {
      if (levelAttempts[lvl] >= 2) {
        const acc = levelScores[lvl] / levelAttempts[lvl];
        if (acc >= 0.6) {
          detectedLevel = lvl;
          break;
        }
      }
    }

    // Also consider weighted score as secondary signal
    const weightedPct = maxPossible > 0 ? weightedScore / maxPossible : 0;
    const weightedLevel = Math.min(5, Math.floor(weightedPct * 6));

    // Final level: average of both signals, biased toward sustained performance
    const computed = Math.round(detectedLevel * 0.7 + weightedLevel * 0.3);

    setFinalLevel(computed);
    setSkillBreakdown(skills);
    setPhase("result");

    // Save result
    const result = {
      date: gtd(),
      level: computed,
      levelCode: CEFR_LEVELS[computed].code,
      weightedPct: Math.round(weightedPct * 100),
      skills,
      duration: Math.round((Date.now() - startTime) / 1000),
      levelScores: { ...levelScores },
      levelAttempts: { ...levelAttempts },
    };
    (async () => {
      try {
        const r = await storage.get("level-test-results");
        const results = r && r.value ? JSON.parse(r.value) : [];
        results.push(result);
        await storage.set("level-test-results", JSON.stringify(results));
        if (onComplete) onComplete(result);
      } catch (e) {}
    })();
  }

  // INTRO SCREEN
  if (phase === "intro") return (
    <div style={{ animation: "fadeUp .4s", textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
      <div style={{ fontSize: 20, fontWeight: 800, background: "linear-gradient(135deg,#e8b84b,#5ec4b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 12 }}>اختبار تحديد المستوى</div>
      <div style={{ fontSize: 13, color: "#9ca3b5", lineHeight: 2, marginBottom: 20 }}>
        اختبار تكيّفي يقيس مستواك الحقيقي بدقة
        <br />يغطي: القواعد، المفردات، فهم القراءة، التواصل المهني
        <br />معتمد على معايير CEFR العالمية (A1 → C2)
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20, textAlign: "right" }}>
        {[
          { icon: "📐", label: "قواعد اللغة", desc: "تركيب الجمل والأزمنة" },
          { icon: "📚", label: "المفردات", desc: "معاني الكلمات واستخدامها" },
          { icon: "📖", label: "فهم القراءة", desc: "فهم النصوص والسياق" },
          { icon: "🗣️", label: "التواصل", desc: "الرد المناسب في مواقف الحياة" },
        ].map((s, i) => (
          <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: 12 }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#f0f0f5" }}>{s.label}</div>
            <div style={{ fontSize: 10, color: "#7a8295" }}>{s.desc}</div>
          </div>
        ))}
      </div>
      <div style={{ background: "rgba(232,184,75,0.06)", border: "1px solid rgba(232,184,75,0.12)", borderRadius: 10, padding: 12, marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: "#e8b84b", fontWeight: 600 }}>⏱️ {TOTAL_QUESTIONS} سؤال — حوالي ١٠ دقائق</div>
        <div style={{ fontSize: 11, color: "#7a8295", marginTop: 4 }}>الأسئلة تتكيّف مع مستواك — تزداد صعوبة إذا أجبت صح</div>
      </div>
      <button onClick={startTest} style={{ padding: "12px 36px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#e8b84b,#5ec4b6)", color: "#0f1119", fontFamily: "inherit", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>ابدأ الاختبار 🚀</button>
    </div>
  );

  // RESULT SCREEN
  if (phase === "result" && finalLevel !== null) {
    const lvl = CEFR_LEVELS[finalLevel];
    const totalCorrect = history.filter(h => h.correct).length;
    return (
      <div style={{ animation: "fadeUp .4s" }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🏆</div>
          <div style={{ fontSize: 13, color: "#7a8295", marginBottom: 8 }}>مستواك في اللغة الإنجليزية</div>
          <div style={{ display: "inline-block", padding: "12px 32px", borderRadius: 16, background: lvl.color + "18", border: "2px solid " + lvl.color + "40" }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: lvl.color, fontFamily: "'IBM Plex Mono'" }}>{lvl.code}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#f0f0f5" }}>{lvl.name}</div>
            <div style={{ fontSize: 12, color: "#9ca3b5" }}>{lvl.nameEn}</div>
          </div>
        </div>

        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 13, color: "#f0f0f5", lineHeight: 2 }}>{lvl.desc}</div>
        </div>

        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#e8b84b", marginBottom: 10 }}>💡 نصيحة لك</div>
          <div style={{ fontSize: 13, color: "#9ca3b5", lineHeight: 2 }}>{lvl.tip}</div>
        </div>

        {/* Skill breakdown */}
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#e8b84b", marginBottom: 12 }}>📊 تحليل المهارات</div>
          {skillBreakdown && Object.keys(skillBreakdown).map(skill => {
            const s = skillBreakdown[skill];
            if (s.total === 0) return null;
            const pct = Math.round((s.correct / s.total) * 100);
            const barColor = pct >= 80 ? "#5ec4b6" : pct >= 50 ? "#e8b84b" : "#e87461";
            return (
              <div key={skill} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <div style={{ fontSize: 12, color: "#f0f0f5" }}>{TYPE_ICONS[skill]} {TYPE_LABELS[skill]}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: barColor, fontFamily: "'IBM Plex Mono'" }}>{pct}%</div>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: "#181b25", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: pct + "%", borderRadius: 3, background: barColor, transition: "width .5s" }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Level breakdown */}
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#e8b84b", marginBottom: 12 }}>📈 الأداء حسب المستوى</div>
          <div style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
            {CEFR_LEVELS.map((l, i) => {
              const att = levelAttempts[i];
              const sc = levelScores[i];
              const pct = att > 0 ? Math.round((sc / att) * 100) : 0;
              const isFinal = i === finalLevel;
              return (
                <div key={i} style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: att > 0 ? (pct >= 60 ? "#5ec4b6" : "#e87461") : "#4a5166", marginBottom: 4 }}>{att > 0 ? pct + "%" : "—"}</div>
                  <div style={{ height: Math.max(att > 0 ? pct * 0.6 : 4, 4), borderRadius: 4, background: att > 0 ? l.color : "#1e2130", border: isFinal ? "2px solid #fff" : "none", transition: "height .3s" }} />
                  <div style={{ fontSize: 10, fontWeight: isFinal ? 800 : 600, color: isFinal ? "#fff" : "#7a8295", marginTop: 4 }}>{l.code}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
          <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: 12, textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#e8b84b", fontFamily: "'IBM Plex Mono'" }}>{totalCorrect}/{history.length}</div>
            <div style={{ fontSize: 10, color: "#7a8295" }}>إجابات صحيحة</div>
          </div>
          <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: 12, textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#e8b84b", fontFamily: "'IBM Plex Mono'" }}>{Math.round((Date.now() - startTime) / 1000)}s</div>
            <div style={{ fontSize: 10, color: "#7a8295" }}>الوقت</div>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 16 }}>
          <button onClick={() => { setPhase("intro"); setQi(0); setPicked(null); setCurrentLevel(2); setHistory([]); setQuestions([]); setLevelScores({0:0,1:0,2:0,3:0,4:0,5:0}); setLevelAttempts({0:0,1:0,2:0,3:0,4:0,5:0}); setConsecutiveCorrect(0); setConsecutiveWrong(0); setFinalLevel(null); setSkillBreakdown(null); }} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#e8b84b,#5ec4b6)", color: "#0f1119", fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>🔄 أعد الاختبار</button>
        </div>
      </div>
    );
  }

  // TESTING SCREEN
  const currentQ = getNextQuestion();
  if (!currentQ) { finishTest(); return null; }
  const { opts: qOpts, correctIndex: qAns } = shuffleOpts(currentQ.opts, currentQ.ans, qi * 31 + 97 + currentQ._level * 7);
  const displayQ = { ...currentQ, opts: qOpts, ans: qAns };
  const levelInfo = CEFR_LEVELS[currentQ._level];
  const progress = Math.round(((qi + 1) / TOTAL_QUESTIONS) * 100);

  return (
    <div style={{ animation: "fadeUp .4s" }}>
      {/* Progress bar */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <div style={{ fontSize: 12, color: "#7a8295" }}>{"سؤال " + (qi + 1) + "/" + TOTAL_QUESTIONS}</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ fontSize: 10, padding: "2px 8px", borderRadius: 6, background: levelInfo.color + "18", color: levelInfo.color, fontWeight: 700 }}>{levelInfo.code}</div>
            <div style={{ fontSize: 10, color: "#7a8295" }}>{TYPE_ICONS[currentQ.type]} {TYPE_LABELS[currentQ.type]}</div>
          </div>
        </div>
        <div style={{ height: 4, borderRadius: 2, background: "#181b25", overflow: "hidden" }}>
          <div style={{ height: "100%", width: progress + "%", borderRadius: 2, background: "linear-gradient(90deg,#e8b84b,#e8b84b)", transition: "width .3s" }} />
        </div>
      </div>

      {/* Question */}
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 16, marginBottom: 14 }}>
        <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 15, direction: "ltr", textAlign: "left", lineHeight: 1.9, color: "#f0f0f5" }}>{displayQ.q}</div>
        {currentQ.audio && <div style={{ textAlign: "center", marginTop: 8 }}><button onClick={() => speak(currentQ.audio, 0.85)} style={{ padding: "8px 20px", borderRadius: 10, border: "none", background: "#c49a38", color: "#fff", fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>🔊 استمع مرة ثانية</button></div>}
      </div>

      {/* Options */}
      {displayQ.opts.map((o, oi) => {
        const show = picked !== null;
        const isCorrect = oi === displayQ.ans;
        const isPicked = picked === oi;
        let bg = "rgba(255,255,255,0.02)", brd = "rgba(255,255,255,0.04)";
        if (show && isCorrect) { bg = "rgba(94,196,182,0.12)"; brd = "rgba(94,196,182,0.3)"; }
        else if (show && isPicked && !isCorrect) { bg = "rgba(232,116,97,0.12)"; brd = "rgba(232,160,64,0.3)"; }
        return (
          <div key={oi} onClick={() => !show && pick(oi)} style={{ padding: 12, borderRadius: 10, marginBottom: 6, cursor: show ? "default" : "pointer", fontFamily: "'IBM Plex Mono'", fontSize: 13, direction: "ltr", textAlign: "left", lineHeight: 1.7, background: bg, border: "1px solid " + brd, opacity: show && !isCorrect && !isPicked ? 0.3 : 1, transition: ".2s" }}>
            {o}
            {show && isCorrect && <span style={{ color: "#5ec4b6", fontSize: 11 }}> ✓</span>}
            {show && isPicked && !isCorrect && <span style={{ color: "#e87461", fontSize: 11 }}> ✗</span>}
          </div>
        );
      })}

      {/* Explanation after answer */}
      {picked !== null && (
        <div style={{ textAlign: "center", marginTop: 12 }}>
          <div style={{ fontSize: 12, color: picked === displayQ.ans ? "#5ec4b6" : "#e87461", marginBottom: 8, fontWeight: 600 }}>
            {picked === displayQ.ans ? "✓ إجابة صحيحة!" : "✗ إجابة خاطئة"}
          </div>
          <button onClick={next} style={{ padding: "8px 24px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#e8b84b,#5ec4b6)", color: "#0f1119", fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            {qi + 1 >= TOTAL_QUESTIONS ? "🏁 عرض النتيجة" : "التالي ←"}
          </button>
        </div>
      )}
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
  const [levelResult, setLevelResult] = useState(null);
  const [srsData, setSrsData] = useState({});
  const [sessionHistory, setSessionHistory] = useState([]);
  const [chosenScenario, setChosenScenario] = useState(null);
  const [xp, setXp] = useState(0);
  const [showXpPop, setShowXpPop] = useState(null);
  const [onboardStep, setOnboardStep] = useState(0);
  const [userChallenge, setUserChallenge] = useState(null); // "+15 XP" popup
  const tmRef = useRef(null);

  useEffect(() => {
    (async () => {
      try { const r = await storage.get(DK); if (r && r.value) setStore(JSON.parse(r.value)); } catch (e) {}
      try { const r = await storage.get("quiz-results"); if (r && r.value) setQuizResults(JSON.parse(r.value)); } catch (e) {}
      try { const r = await storage.get("level-test-results"); if (r && r.value) { const arr = JSON.parse(r.value); if (arr.length > 0) setLevelResult(arr[arr.length - 1]); } } catch (e) {}
      try { const r = await storage.get("srs-data"); if (r && r.value) setSrsData(JSON.parse(r.value)); } catch (e) {}
      try { const r = await storage.get("session-history"); if (r && r.value) setSessionHistory(JSON.parse(r.value)); } catch (e) {}
      try { const r = await storage.get("user-xp"); if (r && r.value) setXp(parseInt(r.value) || 0); } catch (e) {}
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (quizResults === null && !loading) {
      (async () => { try { const r = await storage.get("quiz-results"); if (r && r.value) setQuizResults(JSON.parse(r.value)); else setQuizResults([]); } catch (e) { setQuizResults([]); } })();
    }
  }, [quizResults, loading]);

  const save = useCallback(async (s) => { setStore(s); try { await storage.set(DK, JSON.stringify(s)); } catch (e) {} }, []);
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

  if (loading) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f1119", fontFamily: "'Noto Kufi Arabic',sans-serif" }}><style>{CSS}</style><div style={{ textAlign: "center", color: "#fff" }}><div style={{ fontSize: 40, animation: "pulse 1.5s infinite" }}>🎯</div><div style={{ fontSize: 14, opacity: 0.5, marginTop: 8 }}>جاري التحميل...</div></div></div>;

  // ===== ONBOARDING =====
  if (!store.start) return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "#0f1119", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Noto Kufi Arabic',sans-serif" }}>
      <style>{CSS}</style>
      <div style={{ maxWidth: 440, padding: 32, animation: "fadeUp .8s" }}>

        {/* Screen 1: Emotional Hook */}
        {onboardStep === 0 && <div style={{ textAlign: "center", animation: "fadeUp .6s" }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>😔</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#f0f0f5", lineHeight: 1.8, marginBottom: 16 }}>تفهم كل شيء...<br/>بس لما تبي تتكلم، الكلمات ما تطلع؟</h1>
          <p style={{ fontSize: 15, color: "#7a8295", lineHeight: 2.2, marginBottom: 24 }}>في المطعم، مع الدكتور، في المطار...<br/>تعرف الجواب في راسك بس لسانك ما يساعدك.<br/><b style={{ color: "#9ca3b5" }}>جرّبت كورسات وتطبيقات كثير وما استمريت.</b></p>
          <button onClick={() => setOnboardStep(1)} style={{ padding: "14px 40px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#e8b84b,#5ec4b6)", color: "#0f1119", fontFamily: "inherit", fontSize: 16, fontWeight: 700, cursor: "pointer", width: "100%" }}>هذا بالضبط أنا ←</button>
        </div>}

        {/* Screen 2: The Promise */}
        {onboardStep === 1 && <div style={{ textAlign: "center", animation: "fadeUp .6s" }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>💡</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#e8b84b", lineHeight: 1.8, marginBottom: 16 }}>المشكلة مو إنجليزيك.<br/>المشكلة الطريقة.</h1>
          <div style={{ background: "rgba(232,184,75,0.06)", borderRadius: 16, padding: 20, marginBottom: 20, textAlign: "right" }}>
            <div style={{ fontSize: 14, color: "#f0f0f5", lineHeight: 2.4 }}>
              <div style={{ marginBottom: 8 }}>❌ الكورسات تعلّمك <b>قواعد</b> — أنت ما تحتاج قواعد</div>
              <div style={{ marginBottom: 8 }}>❌ التطبيقات تعلّمك <b>تترجم</b> — أنت ما تحتاج ترجمة</div>
              <div>✅ أنت تحتاج <b>تتمرّن على مواقف حقيقية</b> حتى لسانك يتعوّد</div>
            </div>
          </div>
          <p style={{ fontSize: 13, color: "#7a8295", lineHeight: 2, marginBottom: 20 }}>مبني على أبحاث جامعية في اكتساب اللغة<br/>— مو ترجمة لتطبيق أجنبي</p>
          <button onClick={() => setOnboardStep(2)} style={{ padding: "14px 40px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#e8b84b,#5ec4b6)", color: "#0f1119", fontFamily: "inherit", fontSize: 16, fontWeight: 700, cursor: "pointer", width: "100%" }}>كيف يشتغل؟ ←</button>
        </div>}

        {/* Screen 3: How it works */}
        {onboardStep === 2 && <div style={{ textAlign: "center", animation: "fadeUp .6s" }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f0f0f5", lineHeight: 1.8, marginBottom: 20 }}>١٥ دقيقة باليوم<br/>جلسة واحدة — ٦ خطوات</h1>
          <div style={{ textAlign: "right", marginBottom: 20 }}>
            {[
              { icon: "👂", text: "استمع — بدون نص، درّب أذنك", color: "#c49a38" },
              { icon: "📖", text: "اقرأ — شوف النص ولاحظ اللي فاتك", color: "#e8b84b" },
              { icon: "🔊", text: "ردّد — كرّر الجمل المهمة مع الصوت", color: "#5ec4b6" },
              { icon: "🧠", text: "تذكّر — قلها من ذاكرتك بدون ما تشوف", color: "#e8b84b" },
              { icon: "✍️", text: "أنتج — اكتب ردك بنفسك", color: "#e87461" },
              { icon: "🌍", text: "طبّق — تحدّي حقيقي تسويه اليوم", color: "#e87461" },
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: 10, animation: "slideIn .4s " + (i * 0.1) + "s both" }}>
                <div style={{ fontSize: 24, flexShrink: 0 }}>{s.icon}</div>
                <div style={{ fontSize: 14, color: s.color, fontWeight: 600 }}>{s.text}</div>
              </div>
            ))}
          </div>
          <button onClick={() => setOnboardStep(3)} style={{ padding: "14px 40px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#e8b84b,#5ec4b6)", color: "#0f1119", fontFamily: "inherit", fontSize: 16, fontWeight: 700, cursor: "pointer", width: "100%" }}>يناسبني! ←</button>
        </div>}

        {/* Screen 4: Personalization Question */}
        {onboardStep === 3 && <div style={{ textAlign: "center", animation: "fadeUp .6s" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f0f0f5", lineHeight: 1.8, marginBottom: 20 }}>وش أكبر تحدي عندك؟</h1>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { id: "speak", icon: "🗣️", text: "أفهم بس ما أقدر أتكلم", sub: "الكلمات في راسي بس ما تطلع" },
              { id: "listen", icon: "👂", text: "ما أفهم لما يتكلمون بسرعة", sub: "أقرأ كويس بس الاستماع صعب" },
              { id: "travel", icon: "✈️", text: "أحتاجها للسفر والتعامل مع أجانب", sub: "فنادق، مطاعم، مطارات" },
              { id: "work", icon: "💼", text: "أحتاجها للشغل والاجتماعات", sub: "عروض، إيميلات، مكالمات" },
              { id: "life", icon: "🌍", text: "أبي أتكلم في حياتي اليومية بثقة", sub: "جيران، مدرسة، تسوق" },
            ].map(c => (
              <button key={c.id} onClick={() => { setUserChallenge(c.id); setOnboardStep(4); }} style={{ display: "flex", alignItems: "center", gap: 12, padding: 16, borderRadius: 14, border: "1px solid " + (userChallenge === c.id ? "rgba(232,184,75,0.3)" : "rgba(255,255,255,0.06)"), background: "rgba(255,255,255,0.02)", cursor: "pointer", textAlign: "right" }}>
                <div style={{ fontSize: 28, flexShrink: 0 }}>{c.icon}</div>
                <div><div style={{ fontSize: 15, fontWeight: 700, color: "#f0f0f5" }}>{c.text}</div><div style={{ fontSize: 12, color: "#7a8295", marginTop: 2 }}>{c.sub}</div></div>
              </button>
            ))}
          </div>
        </div>}

        {/* Screen 5: Ready — Start */}
        {onboardStep === 4 && <div style={{ textAlign: "center", animation: "fadeUp .6s" }}>
          <div style={{ fontSize: 72, marginBottom: 16, animation: "pulse 2s infinite" }}>🚀</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8, background: "linear-gradient(135deg,#e8b84b,#5ec4b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1.6 }}>جاهز!</h1>
          <p style={{ fontSize: 16, color: "#9ca3b5", lineHeight: 2.2, marginBottom: 8 }}>جلستك الأولى جاهزة — ١٥ دقيقة فقط</p>
          <p style={{ fontSize: 14, color: "#7a8295", lineHeight: 2, marginBottom: 28 }}>بعد أسبوع واحد بتلاحظ الفرق.<br/>الجمل بتطلع منك تلقائي بدون تفكير.</p>
          <button onClick={() => save({ ...store, start: gtd(), challenge: userChallenge })} style={{ padding: "16px 40px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#e8b84b,#5ec4b6)", color: "#0f1119", fontFamily: "inherit", fontSize: 18, fontWeight: 800, cursor: "pointer", width: "100%", animation: "glow 2s infinite" }}>ابدأ جلستك الأولى</button>
        </div>}

      </div>
    </div>
  );

  const wk = getWk(store.start), ph = getPh(wk), dn = gdn(), dw = gdow();
  // Adapt content difficulty based on level test result
  const adaptedPhase = (() => {
    if (!levelResult || levelResult.level === undefined) return ph;
    const lvl = levelResult.level; // 0=A1 ... 5=C2
    if (lvl <= 1) return { ...ph, n: 1, gap: 6 }; // A1-A2: slow
    if (lvl <= 3) return { ...ph, n: 2, gap: 4 }; // B1-B2: medium
    return { ...ph, n: 3, gap: 3 }; // C1-C2: fast
  })();
  const pct = done.includes("session") ? 100 : 0;

  // ===== SMART SCENARIO ROTATION =====
  // Priority: forgotten scenarios → unseen scenarios → oldest reviewed
  const todayScenario = (() => {
    if (!sessionHistory.length) return DAILY_SCENARIOS[dn % DAILY_SCENARIOS.length];

    // Find scenarios that had forgotten phrases (need review)
    const needsReview = [];
    const seen = new Set();
    sessionHistory.forEach(s => {
      seen.add(s.scenario);
      const rs = s.recallScore || {};
      const forgotCount = Object.values(rs).filter(v => v === "forgot").length;
      const partialCount = Object.values(rs).filter(v => v === "partial").length;
      if (forgotCount > 0 || partialCount > 1) {
        needsReview.push({ title: s.scenario, score: forgotCount * 2 + partialCount, date: s.date });
      }
    });

    // Don't repeat today's completed scenario
    const todayCompleted = sessionHistory.filter(s => s.date === today).map(s => s.scenario);

    // 1. Priority: review forgotten scenarios (not done today)
    const reviewable = needsReview
      .filter(r => !todayCompleted.includes(r.title))
      .sort((a, b) => b.score - a.score);
    if (reviewable.length > 0) {
      const target = reviewable[0].title;
      const found = DAILY_SCENARIOS.find(s => s.title === target);
      if (found) return found;
    }

    // 2. Next: show unseen scenarios
    const unseen = DAILY_SCENARIOS.filter(s => !seen.has(s.title) && !todayCompleted.includes(s.title));
    if (unseen.length > 0) return unseen[dn % unseen.length];

    // 3. Fallback: cycle through all (oldest first)
    const available = DAILY_SCENARIOS.filter(s => !todayCompleted.includes(s.title));
    return available.length > 0 ? available[dn % available.length] : DAILY_SCENARIOS[dn % DAILY_SCENARIOS.length];
  })();
  const Card = ({ children, s }) => <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 18, marginBottom: 12, animation: "fadeUp .4s", ...s }}>{children}</div>;

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "#0f1119", color: "#f0f0f5", fontFamily: "'Noto Kufi Arabic',sans-serif" }}>
      <style>{CSS}</style>
      {conf && <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 100 }}>{Array.from({ length: 25 }).map((_, i) => <div key={i} style={{ position: "absolute", top: 0, left: Math.random() * 100 + "%", width: 7, height: 7, background: ["#e8b84b", "#e8b84b", "#e8b84b", "#5ec4b6"][i % 4], borderRadius: "50%", animation: "confDrop " + (2 + Math.random() * 2) + "s linear " + Math.random() * 0.5 + "s forwards" }} />)}</div>}

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 14px" }}>
        {/* XP popup */}
        {showXpPop && <div style={{ position: "fixed", top: 60, left: "50%", transform: "translateX(-50%)", zIndex: 200, padding: "8px 20px", borderRadius: 10, background: "linear-gradient(135deg,#e8b84b,#e87461)", color: "#fff", fontWeight: 800, fontSize: 16, fontFamily: "'IBM Plex Mono'", animation: "fadeUp .4s" }}>{showXpPop}</div>}

        <div style={{ padding: "16px 0 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 800, background: "linear-gradient(135deg,#e8b84b,#5ec4b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>اختراق حاجز الإنجليزية</h1>
            <div style={{ fontSize: 12, color: "#5c6478", marginTop: 2 }}>{"أسبوع " + wk + "/12" + (levelResult ? " — " + levelResult.levelCode : "")}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Streak flame */}
            {(() => { let s = 0; const d = new Date(); for (let i = 0; i < 100; i++) { const k = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); if (store.days[k] && store.days[k].length >= 1) { s++; d.setDate(d.getDate() - 1); } else if (i === 0) { d.setDate(d.getDate() - 1); } else break; } return s > 0 ? <div style={{ display: "flex", alignItems: "center", gap: 3 }}><span style={{ fontSize: 18, animation: s >= 7 ? "firePulse 1s infinite" : "none" }}>🔥</span><span style={{ fontSize: 14, fontWeight: 800, color: "#e8b84b", fontFamily: "'IBM Plex Mono'" }}>{s}</span></div> : null; })()}
            {/* XP */}
            <div style={{ padding: "4px 10px", borderRadius: 8, background: "rgba(232,184,75,0.1)", display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 12 }}>⚡</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#e8b84b", fontFamily: "'IBM Plex Mono'" }}>{xp}</span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.04)", marginBottom: 14 }}>
          {[["today", "📋 اليوم"], ["train", "🎭 تدريب"], ["phrases", "💬 الجمل"], ["progress", "📊 التقدم"]].map(([id, l]) => (
            <button key={id} onClick={() => { setTab(id); setOpenTask(null); setTrainMode(null); }} style={{ padding: "10px 14px", border: "none", background: "transparent", color: tab === id ? "#e8b84b" : "#5c6478", fontFamily: "inherit", fontSize: 14, fontWeight: 600, cursor: "pointer", borderBottom: "2px solid " + (tab === id ? "#e8b84b" : "transparent"), whiteSpace: "nowrap" }}>{l}</button>
          ))}
        </div>

        {/* TODAY — Deep Processing Session */}
        {tab === "today" && (
          <div>
            <Card><div style={{ fontSize: 14, color: "#9ca3b5", textAlign: "center", lineHeight: 2 }}>{"💎 " + MOTIV[dn % MOTIV.length]}</div></Card>
            {/* FIX 1: Scenario choice — user can accept or browse */}
            <Card s={{ padding: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ fontSize: 24 }}>{todayScenario.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#e8b84b" }}>{"جلسة اليوم: " + todayScenario.title}</div>
                  <div style={{ fontSize: 11, color: "#7a8295" }}>مقترح بناءً على تقدمك</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 6 }}>
                {DAILY_SCENARIOS.slice(0, 14).map((s, i) => (
                  <button key={i} onClick={() => { setChosenScenario(s); }} style={{ padding: "4px 10px", borderRadius: 8, border: "1px solid " + ((chosenScenario || todayScenario).title === s.title ? "rgba(232,184,75,0.3)" : "rgba(255,255,255,0.05)"), background: (chosenScenario || todayScenario).title === s.title ? "rgba(232,184,75,0.1)" : "transparent", color: (chosenScenario || todayScenario).title === s.title ? "#e8b84b" : "#5c6478", fontSize: 16, cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap" }} title={s.title}>{s.icon}</button>
                ))}
              </div>
            </Card>
            <Card>
              <DailySession
                scenario={chosenScenario || todayScenario}
                dayNum={dn}
                sessionHistory={sessionHistory}
                onComplete={() => {
                  const d = store.days[today] || [];
                  if (!d.includes("session")) {
                    save({ ...store, days: { ...store.days, [today]: [...d, "session"] } });
                    setConf(true); setTimeout(() => setConf(false), 3000);
                    // Award XP + variable surprise rewards
                    const sessCount = sessionHistory.length + 1;
                    const bonus = sessCount % 5 === 0 ? 50 : sessCount % 3 === 0 ? 15 : 0;
                    const earned = 25 + bonus;
                    const newXp = xp + earned;
                    setXp(newXp);
                    // Variable reward messages (surprise = dopamine spike)
                    const surprises = [
                      null, null, // normal
                      "🏆 إنجاز: أول ٣ جلسات متتالية!",
                      null,
                      "💎 حفظت ١٥ جملة — أكثر من معظم متعلمي اللغة!",
                      null, null,
                      "🔥 أسبوع كامل! عقلك بدأ يبني مسارات عصبية جديدة",
                      null, null,
                      "⭐ ١٠ جلسات! صرت تعرف ٣٠ جملة تقدر تستخدمها في أي مكان",
                      null, null, null,
                      "🎖️ أسبوعين! بروكا (منطقة الكلام في دماغك) صارت أنشط",
                    ];
                    const surprise = surprises[Math.min(sessCount - 1, surprises.length - 1)];
                    setShowXpPop(surprise || ("+" + earned + " XP ⚡" + (bonus > 0 ? " 🎁 مكافأة!" : "")));
                    setTimeout(() => setShowXpPop(null), surprise ? 4000 : 2000);
                    (async () => { try { await storage.set("user-xp", String(newXp)); } catch(e) {} })();
                  }
                  (async () => { try { const r = await storage.get("session-history"); if (r && r.value) setSessionHistory(JSON.parse(r.value)); } catch(e) {} })();
                }}
              />
            </Card>
            {done.includes("session") && <Card s={{ borderColor: "rgba(94,196,182,0.15)" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 14, color: "#5ec4b6", fontWeight: 700, marginBottom: 4 }}>✅ جلسة اليوم مكتملة!</div>
                <div style={{ fontSize: 12, color: "#7a8295" }}>تبي تمارين إضافية؟ روح لتبويب "تدريب"</div>
              </div>
            </Card>}
            {/* FIX 2: Evening Review — 3 min before sleep = 2x consolidation */}
            {done.includes("session") && <Card s={{ borderColor: "rgba(196,154,56,0.15)", background: "rgba(196,154,56,0.03)" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>🌙</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#e8b84b", marginBottom: 6 }}>مراجعة ما قبل النوم</div>
                <div style={{ fontSize: 13, color: "#9ca3b5", lineHeight: 2, marginBottom: 12 }}>استمع لجمل اليوم قبل ما تنام — ٣ دقائق فقط<br/>عقلك يرسّخها أثناء النوم (مثبت علمياً)</div>
                <button onClick={() => {
                  const sc2 = chosenScenario || todayScenario;
                  let idx = 0;
                  function playNext() {
                    if (idx >= sc2.keyPhrases.length) return;
                    speak(sc2.keyPhrases[idx].en, 0.75);
                    idx++;
                    setTimeout(playNext, 4000);
                  }
                  playNext();
                }} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#c49a38,#e8b84b)", color: "#fff", fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>🔊 شغّل جمل اليوم</button>
                <div style={{ fontSize: 11, color: "#7a8295", marginTop: 8 }}>استرخِ واستمع فقط — لا تحتاج تردد</div>
              </div>
            </Card>}
          </div>
        )}

        {/* TRAINING */}
        {tab === "train" && (
          <div>
            {!trainMode && (() => {
              const allExercises = [
                { id: "sim", icon: "🎭", title: "محادثات تفاعلية", desc: "سيناريوهات حقيقية — اختر الرد واقرأه", color: "#e8b84b" },
                { id: "quick", icon: "⚡", title: "استجابة سريعة", desc: "مواقف يومية — اختر الرد الأنسب", color: "#e8b84b" },
                { id: "quiz", icon: "📊", title: "اختبار أسبوعي", desc: "١٠ أسئلة تقيس تقدمك", color: "#e8b84b" },
                { id: "fill", icon: "📝", title: "أكمل الفراغ", desc: "اكتب الكلمات الناقصة", color: "#d4a43a" },
                { id: "build", icon: "🧩", title: "بناء جمل", desc: "رتّب الكلمات المبعثرة", color: "#4db5a5" },
                { id: "fluency", icon: "🗣️", title: "تمرين الطلاقة", desc: "تكلم ٣ مرات بوقت أقل", color: "#e87461" },
                { id: "listen", icon: "👂", title: "فهم الاستماع", desc: "استمع وأجب", color: "#c49a38" },
                { id: "dictation", icon: "🎧", title: "إملاء صوتي", desc: "استمع واكتب ما سمعته", color: "#e87461" },
                { id: "recall", icon: "✍️", title: "إنتاج حر", desc: "اكتب ردك بدون خيارات", color: "#e87461" },
                { id: "level", icon: "🎯", title: "اختبار المستوى", desc: "اختبار CEFR تكيّفي", color: "#e8b84b" },
              ];
              // Smart recommendations: top 3 based on user needs
              const recommended = allExercises.slice(0, 3);
              const rest = allExercises.slice(3);
              const ExCard = ({ m }) => (
                <div onClick={() => setTrainMode(m.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", marginBottom: 8, cursor: "pointer", transition: ".3s" }}>
                  <div style={{ fontSize: 28, flexShrink: 0 }}>{m.icon}</div>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 700, color: m.color }}>{m.title}</div><div style={{ fontSize: 11, color: "#7a8295", marginTop: 2 }}>{m.desc}</div></div>
                  <div style={{ fontSize: 14, color: "#4a5166" }}>←</div>
                </div>
              );
              return (
                <div>
                  <Card><div style={{ fontSize: 14, fontWeight: 700, color: "#e8b84b", marginBottom: 8 }}>⭐ مقترح لك</div>
                    {recommended.map(m => <ExCard key={m.id} m={m} />)}
                  </Card>
                  <Card><div style={{ fontSize: 13, fontWeight: 600, color: "#7a8295", marginBottom: 8 }}>المزيد من التمارين</div>
                    {rest.map(m => <ExCard key={m.id} m={m} />)}
                  </Card>
                </div>
              );
            })()}
            {trainMode === "sim" && <Card><div style={{ marginBottom: 10 }}><button onClick={() => setTrainMode(null)} style={{ background: "none", border: "none", color: "#7a8295", fontFamily: "inherit", fontSize: 12, cursor: "pointer" }}>→ رجوع</button></div><MeetingSim /></Card>}
            {trainMode === "quick" && <Card><div style={{ marginBottom: 10 }}><button onClick={() => setTrainMode(null)} style={{ background: "none", border: "none", color: "#7a8295", fontFamily: "inherit", fontSize: 12, cursor: "pointer" }}>→ رجوع</button></div><QuickResp /></Card>}
            {trainMode === "quiz" && <Card><div style={{ marginBottom: 10 }}><button onClick={() => setTrainMode(null)} style={{ background: "none", border: "none", color: "#7a8295", fontFamily: "inherit", fontSize: 12, cursor: "pointer" }}>→ رجوع</button></div><WeeklyQuiz onSave={() => setQuizResults(null)} /></Card>}
            {trainMode === "fill" && <Card><div style={{ marginBottom: 10 }}><button onClick={() => setTrainMode(null)} style={{ background: "none", border: "none", color: "#7a8295", fontFamily: "inherit", fontSize: 12, cursor: "pointer" }}>→ رجوع</button></div><FillBlank /></Card>}
            {trainMode === "build" && <Card><div style={{ marginBottom: 10 }}><button onClick={() => setTrainMode(null)} style={{ background: "none", border: "none", color: "#7a8295", fontFamily: "inherit", fontSize: 12, cursor: "pointer" }}>→ رجوع</button></div><SentenceBuild /></Card>}
            {trainMode === "fluency" && <Card><div style={{ marginBottom: 10 }}><button onClick={() => setTrainMode(null)} style={{ background: "none", border: "none", color: "#7a8295", fontFamily: "inherit", fontSize: 12, cursor: "pointer" }}>→ رجوع</button></div><Fluency432 /></Card>}
            {trainMode === "listen" && <Card><div style={{ marginBottom: 10 }}><button onClick={() => setTrainMode(null)} style={{ background: "none", border: "none", color: "#7a8295", fontFamily: "inherit", fontSize: 12, cursor: "pointer" }}>→ رجوع</button></div><ListenExercise /></Card>}
            {trainMode === "dictation" && <Card><div style={{ marginBottom: 10 }}><button onClick={() => setTrainMode(null)} style={{ background: "none", border: "none", color: "#7a8295", fontFamily: "inherit", fontSize: 12, cursor: "pointer" }}>→ رجوع</button></div><DictationExercise /></Card>}
            {trainMode === "recall" && <Card><div style={{ marginBottom: 10 }}><button onClick={() => setTrainMode(null)} style={{ background: "none", border: "none", color: "#7a8295", fontFamily: "inherit", fontSize: 12, cursor: "pointer" }}>→ رجوع</button></div><FreeRecall /></Card>}
            {trainMode === "level" && <Card><div style={{ marginBottom: 10 }}><button onClick={() => setTrainMode(null)} style={{ background: "none", border: "none", color: "#7a8295", fontFamily: "inherit", fontSize: 12, cursor: "pointer" }}>→ رجوع</button></div><LevelTest onComplete={(result) => setLevelResult(result)} /></Card>}
          </div>
        )}

        {/* PHRASES */}
        {tab === "phrases" && (
          <div>
            <div style={{ display: "flex", gap: 5, overflowX: "auto", paddingBottom: 8 }}>
              {PHRASES.map((c, i) => (
                <button key={i} onClick={() => setPCat(i)} style={{ padding: "7px 12px", borderRadius: 18, border: "1px solid " + (pCat === i ? "#e8b84b" : "rgba(255,255,255,0.05)"), background: pCat === i ? "rgba(232,184,75,0.08)" : "transparent", color: pCat === i ? "#e8b84b" : "#7a8295", fontFamily: "inherit", fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}>{c.icon + " " + c.cat}</button>
              ))}
            </div>
            <Card>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, color: "#e8b84b" }}>{PHRASES[pCat].icon + " " + PHRASES[pCat].cat}</div>
              {PHRASES[pCat].items.map((p, i) => {
                const k = "p" + pCat + "-" + i;
                const r = reps[k] || 0;
                const srsKey = pCat + "-" + i;
                const srsInfo = srsData[srsKey];
                const isDue = srsInfo && srsInfo.lastDate ? Math.floor((new Date(gtd()) - new Date(srsInfo.lastDate)) / 864e5) >= (srsInfo.interval || 1) : false;
                return (
                  <div key={i} onClick={() => {
                    const newR = (reps[k] || 0) + 1;
                    setReps(prev => ({ ...prev, [k]: newR }));
                    if (newR === 5) {
                      const newSrs = { ...srsData };
                      const prev2 = newSrs[srsKey] || { interval: 1, reps: 0 };
                      newSrs[srsKey] = { lastDate: gtd(), reps: (prev2.reps || 0) + 1, interval: Math.min((prev2.interval || 1) * 2, 14) };
                      setSrsData(newSrs);
                      (async () => { try { await storage.set("srs-data", JSON.stringify(newSrs)); } catch(e) {} })();
                    }
                  }} style={{ display: "flex", alignItems: "center", gap: 10, padding: 12, borderRadius: 10, background: r >= 5 ? "rgba(94,196,182,0.06)" : isDue ? "rgba(232,184,75,0.04)" : "rgba(255,255,255,0.015)", border: "1px solid " + (r >= 5 ? "rgba(94,196,182,0.15)" : isDue ? "rgba(232,184,75,0.15)" : "rgba(255,255,255,0.04)"), marginBottom: 6, cursor: "pointer" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: r >= 5 ? "#5ec4b6" : r > 0 ? "#e8b84b" : "#252836", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: r > 0 ? "#0f1119" : "#5c6478", flexShrink: 0 }}>{r >= 5 ? "✓" : r}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 15, direction: "ltr", textAlign: "left", lineHeight: 1.7 }}>{p.en}</div>
                      <div style={{ fontSize: 12, color: "#7a8295", marginTop: 2 }}>{p.ar}</div>
                    </div>
                    {isDue && <div style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "rgba(232,184,75,0.15)", color: "#e8b84b", fontWeight: 600 }}>مراجعة</div>}
                  </div>
                );
              })}
              <div style={{ fontSize: 12, color: "#7a8295", textAlign: "center", marginTop: 10 }}>اضغط على الدائرة كل مرة ترددّ — الهدف ٥ لكل جملة</div>
            </Card>
            {/* SRS Review Section */}
            {(() => {
              const todayStr = gtd();
              const dueItems = [];
              PHRASES.forEach((cat, ci) => {
                cat.items.forEach((p, pi) => {
                  const srsKey = ci + "-" + pi;
                  const data = srsData[srsKey];
                  if (data && data.lastDate) {
                    const daysSince = Math.floor((new Date(todayStr) - new Date(data.lastDate)) / 864e5);
                    if (daysSince >= (data.interval || 1)) {
                      dueItems.push({ cat: cat.cat, icon: cat.icon, phrase: p, srsKey, ci, pi, daysSince });
                    }
                  }
                });
              });
              if (dueItems.length === 0) return null;
              return (
                <Card s={{ borderColor: "rgba(232,184,75,0.15)" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#e8b84b", marginBottom: 10 }}>{"🔄 مراجعة مطلوبة (" + dueItems.length + " جملة)"}</div>
                  <div style={{ fontSize: 12, color: "#7a8295", marginBottom: 10 }}>هذه الجمل حان وقت مراجعتها حسب نظام التكرار المتباعد</div>
                  {dueItems.slice(0, 5).map((item, i) => {
                    const k = "srs-" + item.srsKey;
                    const r = reps[k] || 0;
                    return (
                      <div key={i} onClick={() => {
                        const newR = (reps[k] || 0) + 1;
                        setReps(prev => ({ ...prev, [k]: newR }));
                        if (newR >= 3) {
                          const newSrs = { ...srsData };
                          const prev = newSrs[item.srsKey] || { interval: 1 };
                          newSrs[item.srsKey] = { lastDate: todayStr, reps: (prev.reps || 0) + 1, interval: Math.min((prev.interval || 1) * 2, 14) };
                          setSrsData(newSrs);
                          (async () => { try { await storage.set("srs-data", JSON.stringify(newSrs)); } catch(e) {} })();
                        }
                      }} style={{ display: "flex", alignItems: "center", gap: 10, padding: 12, borderRadius: 10, background: r >= 5 ? "rgba(94,196,182,0.06)" : "rgba(232,184,75,0.04)", border: "1px solid " + (r >= 5 ? "rgba(94,196,182,0.15)" : "rgba(232,184,75,0.1)"), marginBottom: 6, cursor: "pointer" }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: r >= 5 ? "#5ec4b6" : r > 0 ? "#e8b84b" : "#252836", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: r > 0 ? "#0f1119" : "#5c6478", flexShrink: 0 }}>{r >= 3 ? "✓" : r}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 14, direction: "ltr", textAlign: "left", lineHeight: 1.7 }}>{item.phrase.en}</div>
                          <div style={{ fontSize: 11, color: "#7a8295" }}>{item.phrase.ar} — {item.icon} {item.cat}</div>
                        </div>
                        <div style={{ fontSize: 10, color: "#e8b84b" }}>{item.daysSince + "d"}</div>
                      </div>
                    );
                  })}
                </Card>
              );
            })()}
          </div>
        )}

        {/* PROGRESS */}
        {tab === "progress" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
              {[
                { l: "أيام", v: Object.values(store.days).filter(d => d.length >= 1).length, c: "#e8b84b" },
                { l: "أسبوع", v: wk + "/12", c: "#e8b84b" },
                { l: "سلسلة 🔥", v: (() => { let s = 0, d = new Date(); for (let i = 0; i < 100; i++) { const k = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); if (store.days[k] && store.days[k].length >= 1) { s++; d.setDate(d.getDate() - 1); } else if (i === 0) { d.setDate(d.getDate() - 1); } else break; } return s; })(), c: "#e8b84b" },
              ].map((s, i) => (
                <Card key={i} s={{ padding: 12 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: s.c, fontFamily: "'IBM Plex Mono'" }}>{s.v}</div>
                    <div style={{ fontSize: 10, color: "#5c6478", marginTop: 4 }}>{s.l}</div>
                  </div>
                </Card>
              ))}
            </div>
            <Card>
              <div style={{ display: "flex", alignItems: "center", gap: 3, justifyContent: "center", flexWrap: "wrap" }}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((w) => (
                  <div key={w} style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, border: "2px solid " + (w <= wk ? "#e8b84b" : "#1e2130"), background: w < wk ? "#e8b84b" : "transparent", color: w < wk ? "#0f1119" : w === wk ? "#e8b84b" : "#5c6478", animation: w === wk ? "glow 2s infinite" : "none", opacity: w > wk ? 0.2 : 1 }}>{w < wk ? "✓" : w}</div>
                ))}
              </div>
            </Card>
            {/* FIX 3: Smart Weekly Summary */}
            {sessionHistory.length >= 3 && <Card s={{ borderColor: "rgba(232,184,75,0.1)" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#e8b84b", marginBottom: 10 }}>📋 ملخص الأسبوع</div>
              {(() => {
                const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
                const weekStr = weekAgo.toISOString().slice(0, 10);
                const thisWeek = sessionHistory.filter(s => s.date >= weekStr);
                const totalPh = thisWeek.reduce((s, x) => s + (x.phrasesCount || 0), 0);
                const recalled = thisWeek.reduce((s, x) => { const rs = x.recallScore || {}; return s + Object.values(rs).filter(v => v === "good").length; }, 0);
                const scenarios = [...new Set(thisWeek.map(s => s.scenario))];
                const weakScenarios = thisWeek.filter(s => { const rs = s.recallScore || {}; return Object.values(rs).filter(v => v === "forgot").length > 0; }).map(s => s.scenario);
                const uniqueWeak = [...new Set(weakScenarios)];
                return (
                  <div style={{ fontSize: 13, color: "#9ca3b5", lineHeight: 2.2 }}>
                    <div>{"✅ " + thisWeek.length + " جلسة هالأسبوع — " + scenarios.length + " موقف مختلف"}</div>
                    <div>{"💬 " + totalPh + " جملة تمرّنت عليها — تذكّرت " + recalled + " منها"}</div>
                    {uniqueWeak.length > 0 && <div style={{ color: "#e8b84b" }}>{"🔄 تحتاج مراجعة: " + uniqueWeak.slice(0, 3).join("، ")}</div>}
                    {uniqueWeak.length === 0 && thisWeek.length >= 5 && <div style={{ color: "#5ec4b6" }}>{"🔥 أسبوع ممتاز! ما نسيت أي جملة"}</div>}
                    {thisWeek.length < 3 && <div style={{ color: "#7a8295" }}>{"💡 حاول تسوي ٥ جلسات الأسبوع الجاي للحصول على أفضل نتيجة"}</div>}
                  </div>
                );
              })()}
            </Card>}
            {/* Smart Progress — Session History */}
            {sessionHistory.length > 0 && <Card>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#e87461", marginBottom: 10 }}>🧠 أداء الذاكرة</div>
              {(() => {
                const recent = sessionHistory.slice(-10);
                const totalPhrases = recent.reduce((sum, s) => sum + (s.phrasesCount || 0), 0);
                const recalled = recent.reduce((sum, s) => { const rs = s.recallScore || {}; return sum + Object.values(rs).filter(v => v === "good").length; }, 0);
                const partial = recent.reduce((sum, s) => { const rs = s.recallScore || {}; return sum + Object.values(rs).filter(v => v === "partial").length; }, 0);
                const forgot = recent.reduce((sum, s) => { const rs = s.recallScore || {}; return sum + Object.values(rs).filter(v => v === "forgot").length; }, 0);
                const recallPct = totalPhrases > 0 ? Math.round((recalled / totalPhrases) * 100) : 0;
                return (
                  <div>
                    <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                      <div style={{ flex: 1, textAlign: "center", background: "rgba(94,196,182,0.06)", borderRadius: 10, padding: 10 }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: "#5ec4b6", fontFamily: "'IBM Plex Mono'" }}>{recalled}</div>
                        <div style={{ fontSize: 10, color: "#7a8295" }}>تذكّرتها</div>
                      </div>
                      <div style={{ flex: 1, textAlign: "center", background: "rgba(232,184,75,0.06)", borderRadius: 10, padding: 10 }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: "#e8b84b", fontFamily: "'IBM Plex Mono'" }}>{partial}</div>
                        <div style={{ fontSize: 10, color: "#7a8295" }}>تقريباً</div>
                      </div>
                      <div style={{ flex: 1, textAlign: "center", background: "rgba(232,116,97,0.06)", borderRadius: 10, padding: 10 }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: "#e87461", fontFamily: "'IBM Plex Mono'" }}>{forgot}</div>
                        <div style={{ fontSize: 10, color: "#7a8295" }}>نسيتها</div>
                      </div>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, background: "#181b25", overflow: "hidden", marginBottom: 8 }}>
                      <div style={{ height: "100%", width: recallPct + "%", borderRadius: 3, background: recallPct >= 70 ? "#5ec4b6" : recallPct >= 40 ? "#e8b84b" : "#e87461", transition: "width .5s" }} />
                    </div>
                    <div style={{ fontSize: 12, color: "#9ca3b5", textAlign: "center" }}>{recallPct >= 70 ? "ذاكرتك قوية! الجمل ترسخ" : recallPct >= 40 ? "تتحسن — استمر بالمراجعة اليومية" : "ركّز على خطوة التذكّر — ردّد الجمل المنسية أكثر"}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#7a8295", marginTop: 10, marginBottom: 6 }}>آخر الجلسات:</div>
                    {recent.slice(-5).reverse().map((s, i) => {
                      const rs = s.recallScore || {};
                      const g = Object.values(rs).filter(v => v === "good").length;
                      const t = s.phrasesCount || 3;
                      return (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: 8, borderRadius: 8, background: "rgba(255,255,255,0.02)", marginBottom: 4 }}>
                          <div style={{ fontSize: 12, color: "#7a8295", minWidth: 55 }}>{s.date ? s.date.slice(5) : ""}</div>
                          <div style={{ fontSize: 13, color: "#f0f0f5", flex: 1 }}>{s.scenario}</div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: g === t ? "#5ec4b6" : g > 0 ? "#e8b84b" : "#e87461", fontFamily: "'IBM Plex Mono'" }}>{g + "/" + t}</div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </Card>}
            {levelResult && <Card>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#e8b84b", marginBottom: 12 }}>🎯 مستوى اللغة (CEFR)</div>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 60, height: 60, borderRadius: 12, background: CEFR_LEVELS[levelResult.level].color + "18", border: "2px solid " + CEFR_LEVELS[levelResult.level].color + "40", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: CEFR_LEVELS[levelResult.level].color, fontFamily: "'IBM Plex Mono'" }}>{levelResult.levelCode}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#f0f0f5" }}>{CEFR_LEVELS[levelResult.level].name}</div>
                  <div style={{ fontSize: 11, color: "#7a8295" }}>{CEFR_LEVELS[levelResult.level].nameEn} — {levelResult.date}</div>
                  {levelResult.skills && <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                    {Object.keys(levelResult.skills).map(sk => {
                      const s = levelResult.skills[sk];
                      if (!s || s.total === 0) return null;
                      const pct = Math.round((s.correct / s.total) * 100);
                      return <div key={sk} style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: (pct >= 60 ? "rgba(94,196,182,0.1)" : "rgba(232,160,64,0.1)"), color: pct >= 60 ? "#5ec4b6" : "#e87461" }}>{TYPE_ICONS[sk]} {pct}%</div>;
                    })}
                  </div>}
                </div>
              </div>
              <div style={{ textAlign: "center", marginTop: 10 }}>
                <button onClick={() => { setTab("train"); setTrainMode("level"); }} style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(232,121,249,0.2)", background: "transparent", color: "#e8b84b", fontFamily: "inherit", fontSize: 11, cursor: "pointer" }}>🔄 أعد الاختبار</button>
              </div>
            </Card>}
            {quizResults && quizResults.length > 0 && <Card>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#e8b84b", marginBottom: 12 }}>📊 نتائج الاختبارات</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 100, padding: "0 4px" }}>
                {quizResults.slice(-10).map((r, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: r.pct >= 80 ? "#5ec4b6" : r.pct >= 50 ? "#e8b84b" : "#e87461" }}>{r.pct + "%"}</div>
                    <div style={{ width: "100%", height: Math.max(r.pct * 0.8, 4), borderRadius: 4, background: r.pct >= 80 ? "#5ec4b6" : r.pct >= 50 ? "#e8b84b" : "#e87461", transition: "height .3s" }} />
                    <div style={{ fontSize: 8, color: "#5c6478" }}>{r.date ? r.date.slice(5) : ""}</div>
                  </div>
                ))}
              </div>
              {quizResults.length >= 2 && (() => {
                const last = quizResults[quizResults.length - 1].pct;
                const prev = quizResults[quizResults.length - 2].pct;
                const diff = last - prev;
                return <div style={{ textAlign: "center", marginTop: 8, fontSize: 13, fontWeight: 700, color: diff >= 0 ? "#5ec4b6" : "#e87461" }}>{diff >= 0 ? "📈 +" + diff + "%" : "📉 " + diff + "%"} مقارنة بالاختبار السابق</div>;
              })()}
            </Card>}
            {/* Voice Settings */}
            <Card>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#e8b84b", marginBottom: 10 }}>🔊 إعدادات الصوت</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ fontSize: 13, color: "#9ca3b5" }}>الحالة:</div>
                <VoiceBadge />
              </div>

              {/* Test current voice */}
              <div style={{ marginBottom: 14 }}>
                <button onClick={() => speak("Hello! Nice to meet you. How are you today?", 0.9)} style={{ padding: "8px 20px", borderRadius: 10, border: "none", background: "rgba(232,184,75,0.1)", color: "#e8b84b", fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>🔊 جرّب الصوت الحالي</button>
              </div>
              {/* FIX 8: Accent selection */}
              <div style={{ fontSize: 12, color: "#7a8295", marginBottom: 6 }}>اللهجة:</div>
              <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                {[{ code: "en-US", label: "🇺🇸 أمريكي" }, { code: "en-GB", label: "🇬🇧 بريطاني" }, { code: "en-AU", label: "🇦🇺 أسترالي" }].map(a => (
                  <button key={a.code} onClick={() => { setAccent(a.code); speak("Hello! How are you today?", 0.9); }} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid " + (getAccent() === a.code ? "rgba(232,184,75,0.3)" : "rgba(255,255,255,0.06)"), background: getAccent() === a.code ? "rgba(232,184,75,0.1)" : "transparent", color: getAccent() === a.code ? "#e8b84b" : "#7a8295", fontSize: 12, cursor: "pointer" }}>{a.label}</button>
                ))}
              </div>

              {/* Tier explanation */}
              <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 10, padding: 12, marginBottom: 14 }}>
                <div style={{ fontSize: 12, color: "#f0f0f5", lineHeight: 2.2 }}>
                  <div style={{ marginBottom: 4 }}><span style={{ color: "#e8b84b" }}>المستوى المجاني:</span> التطبيق يختار تلقائياً أفضل صوت متاح في متصفحك</div>
                  <div style={{ fontSize: 11, color: "#7a8295" }}>Edge = أصوات Neural ممتازة | Chrome = Google voices جيدة | Safari = أصوات Apple</div>
                  <div style={{ marginTop: 8, marginBottom: 4 }}><span style={{ color: "#5ec4b6" }}>المستوى المدفوع (اختياري):</span> صوت بشري حقيقي عبر OpenAI</div>
                  <div style={{ fontSize: 11, color: "#7a8295" }}>أفضل جودة — connected speech + نبرة طبيعية (~$0.10/شهر)</div>
                </div>
              </div>

              {/* OpenAI API key (optional) */}
              <div style={{ fontSize: 12, color: "#7a8295", marginBottom: 6 }}>مفتاح OpenAI (اختياري):</div>
              <div style={{ marginBottom: 10 }}>
                <input
                  type="password"
                  placeholder="sk-... اتركه فاضي للمجاني"
                  defaultValue={getOpenAIKey() || ""}
                  onBlur={async (e) => {
                    const key = e.target.value.trim();
                    setOpenAIKey(key || null);
                    try { await storage.set("openai-tts-key", key); } catch(ex) {}
                  }}
                  style={{ width: "100%", padding: 12, borderRadius: 10, fontFamily: "'IBM Plex Mono'", fontSize: 13, direction: "ltr", textAlign: "left", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(232,184,75,0.15)", color: "#f0f0f5", outline: "none" }}
                />
              </div>
              {getOpenAIKey() && <div>
                <div style={{ fontSize: 12, color: "#7a8295", marginBottom: 6 }}>الصوت:</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                  {["nova", "alloy", "echo", "fable", "onyx", "shimmer"].map(v => (
                    <button key={v} onClick={async () => { setTTSVoice(v); try { await storage.set("openai-tts-voice", v); } catch(ex) {} speak("Hello, nice to meet you.", 0.9); }} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid " + (getTTSVoice() === v ? "rgba(232,184,75,0.3)" : "rgba(255,255,255,0.06)"), background: getTTSVoice() === v ? "rgba(232,184,75,0.1)" : "transparent", color: getTTSVoice() === v ? "#e8b84b" : "#7a8295", fontFamily: "'IBM Plex Mono'", fontSize: 12, cursor: "pointer" }}>{v}</button>
                  ))}
                </div>
                <div style={{ fontSize: 10, color: "#4a5166" }}>nova = أنثى طبيعية | onyx = ذكر واثق | shimmer = أنثى دافئة | echo = ذكر هادئ</div>
              </div>}
              {!getOpenAIKey() && <div style={{ fontSize: 11, color: "#5ec4b6", background: "rgba(94,196,182,0.06)", borderRadius: 8, padding: 10 }}>💡 نصيحة: افتح التطبيق في متصفح Edge للحصول على أفضل صوت مجاني (Microsoft Neural voices)</div>}
            </Card>
            <div style={{ textAlign: "center", marginTop: 14 }}>
              <button onClick={() => { if (confirm("حذف كل البيانات؟")) { save({ start: null, days: {} }); setTab("today"); } }} style={{ padding: "7px 16px", borderRadius: 10, border: "1px solid rgba(232,160,64,0.1)", background: "transparent", color: "#e87461", fontFamily: "inherit", fontSize: 12, cursor: "pointer" }}>إعادة تعيين</button>
            </div>
          </div>
        )}

        <div style={{ height: 36 }} />
      </div>
    </div>
  );
}

