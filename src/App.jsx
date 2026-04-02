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
  { code: "A1", name: "مبتدئ", nameEn: "Beginner", color: "#ef4444", desc: "تعرف كلمات وجمل بسيطة جداً. تقدر تعرّف نفسك وتسأل أسئلة أساسية.", tip: "ركّز على حفظ الجمل الأساسية والمفردات اليومية. ابدأ بتمارين الظل مع الجمل القصيرة." },
  { code: "A2", name: "ما قبل المتوسط", nameEn: "Elementary", color: "#f97316", desc: "تفهم جمل متكررة في مواضيع يومية. تقدر تتواصل في مواقف بسيطة ومباشرة.", tip: "وسّع مفرداتك وركّز على تركيب جمل بسيطة. استخدم تمرين 'تفكير بصوت عالٍ' يومياً." },
  { code: "B1", name: "متوسط", nameEn: "Intermediate", color: "#f59e0b", desc: "تفهم النقاط الرئيسية في محادثات واضحة. تقدر تتعامل مع أغلب المواقف اليومية.", tip: "ابدأ بالمحادثات التفاعلية وركّز على ربط الأفكار. تمرّن على الجمل الجاهزة لمواقف الحياة." },
  { code: "B2", name: "فوق المتوسط", nameEn: "Upper-Intermediate", color: "#22d3ee", desc: "تفهم أفكار معقدة وتقدر تتفاعل بطلاقة مع متحدثين أصليين بدون جهد كبير.", tip: "ركّز على الدقة في التعبير والمصطلحات المتخصصة. تمرّن على العروض التقديمية والتفاوض." },
  { code: "C1", name: "متقدم", nameEn: "Advanced", color: "#a78bfa", desc: "تفهم نصوص طويلة ومعقدة وتقدر تعبّر عن نفسك بطلاقة وعفوية في أي موقف مهني.", tip: "ركّز على الفروق الدقيقة في اللغة والتعابير الاصطلاحية. تمرّن على المحادثات المتقدمة." },
  { code: "C2", name: "إتقان", nameEn: "Mastery", color: "#34d399", desc: "تفهم كل شيء تقريباً وتقدر تعبّر بدقة عالية حتى في المواقف الأكثر تعقيداً.", tip: "حافظ على مستواك بالممارسة المستمرة. ركّز على الأسلوب والبلاغة في التواصل المهني." },
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
];

const LEVEL_IDX = { A1: 0, A2: 1, B1: 2, B2: 3, C1: 4, C2: 5 };
const TYPE_LABELS = { grammar: "قواعد", vocab: "مفردات", reading: "فهم القراءة", pragmatics: "تواصل" };
const TYPE_ICONS = { grammar: "📐", vocab: "📚", reading: "📖", pragmatics: "🗣️" };

// ===== SPEECH UTILITY =====
function speak(text, rate = 0.85) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = rate;
  u.pitch = 1;
  // Try to find a good English voice
  const voices = window.speechSynthesis.getVoices();
  const enVoice = voices.find(v => v.lang.startsWith("en") && v.name.includes("Google")) || voices.find(v => v.lang.startsWith("en-US")) || voices.find(v => v.lang.startsWith("en"));
  if (enVoice) u.voice = enVoice;
  window.speechSynthesis.speak(u);
  return u;
}

function SpeakBtn({ text, rate, size, color }) {
  const [playing, setPlaying] = useState(false);
  function play() {
    setPlaying(true);
    const u = speak(text, rate || 0.85);
    if (u) u.onend = () => setPlaying(false);
    else setPlaying(false);
  }
  return (
    <button onClick={(e) => { e.stopPropagation(); play(); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: size || 16, padding: 2, opacity: playing ? 1 : 0.5, color: color || "#22d3ee", transition: ".2s", flexShrink: 0 }} title="استمع">{playing ? "🔊" : "🔈"}</button>
  );
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
  challenge: "اليوم: لو واجهت أي مشكلة — فكّر كيف تشرحها بالإنجليزي." },
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

function Prompter({ lines, gap, color, label, withAudio }) {
  const [on, setOn] = useState(false);
  const [idx, setIdx] = useState(0);
  const [sec, setSec] = useState(0);
  const [phase, setPhase] = useState("listen"); // "listen" or "repeat"
  const ref = useRef(null);
  const iRef = useRef(0);

  function stop() { clearInterval(ref.current); setOn(false); setIdx(0); setSec(0); iRef.current = 0; setPhase("listen"); window.speechSynthesis && window.speechSynthesis.cancel(); }
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
  useEffect(() => () => { clearInterval(ref.current); window.speechSynthesis && window.speechSynthesis.cancel(); }, []);

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center" }}>
        {!on ? (
          <button onClick={start} style={{ padding: "8px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg," + color + ",#06b6d4)", color: "#060a14", fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{"▶ ابدأ " + label}</button>
        ) : (
          <button onClick={stop} style={{ padding: "8px 20px", borderRadius: 10, border: "1px solid #1e293b", background: "transparent", color: "#64748b", fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>⏹ إيقاف</button>
        )}
        {on && phase === "listen" && <div style={{ fontSize: 13, color: "#f59e0b", fontWeight: 600 }}>🔊 استمع...</div>}
        {on && phase === "repeat" && sec > 0 && <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 22, fontWeight: 700, color: color }}>{sec}</div>}
        {on && phase === "repeat" && sec > 0 && <div style={{ fontSize: 12, color: "#5a6a80" }}>ردّد بصوت عالٍ!</div>}
      </div>
      {lines.map((line, i) => {
        const cur = on && i === idx;
        const past = on && i < idx;
        return (
          <div key={i} style={{ padding: "10px 14px", borderRadius: 10, marginBottom: 4, fontFamily: "'IBM Plex Mono',monospace", fontSize: cur ? 16 : 14, direction: "ltr", textAlign: "left", lineHeight: 1.7, transition: "all .4s", background: cur ? color + "18" : "rgba(255,255,255,0.015)", border: "1px solid " + (cur ? color + "40" : "rgba(255,255,255,0.04)"), color: cur ? "#fff" : past ? "#3a4a5c" : "#94a3b8", fontWeight: cur ? 600 : 400, transform: cur ? "scale(1.01)" : "none", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ flex: 1 }}>{line}</div>
            <SpeakBtn text={line} size={cur ? 18 : 14} color={cur ? color : "#5a6a80"} />
            {cur && phase === "repeat" && <span style={{ fontSize: 12, color: color, flexShrink: 0 }}>← ردّد!</span>}
            {cur && phase === "listen" && <span style={{ fontSize: 12, color: "#f59e0b", flexShrink: 0 }}>← استمع</span>}
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
      <div style={{ fontSize: 20, fontWeight: 800, color: "#22d3ee", marginBottom: 8 }}>{score}/{m.steps.length}</div>
      <div style={{ fontSize: 14, color: "#8892a4", marginBottom: 16 }}>{score === m.steps.length ? "ممتاز! أدرت المحادثة باحترافية كاملة" : score >= 3 ? "جيد! تقدم واضح" : "تحتاج تمرين أكثر على الجمل — راجعها في تبويب الجمل"}</div>
      <button onClick={restart} style={{ padding: "8px 20px", borderRadius: 10, border: "none", background: "#22d3ee", color: "#060a14", fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>🔄 محادثة جديدة</button>
    </div>
  );
  return (
    <div style={{ animation: "fadeUp .4s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#22d3ee" }}>{(m.icon || "🎭") + " " + m.title}</div>
        <div style={{ fontSize: 12, color: "#5a6a80" }}>{"خطوة " + (step + 1) + "/" + m.steps.length}</div>
      </div>
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 14, marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: "#f59e0b", marginBottom: 4 }}>{"💬 " + s.speaker + ":"}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 15, direction: "ltr", textAlign: "left", lineHeight: 1.7, color: "#e0e7f1", flex: 1 }}>{s.text}</div><SpeakBtn text={s.text} size={18} /></div>
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
      <div style={{ fontSize: 24, fontWeight: 800, color: score >= 4 ? "#34d399" : score >= 2 ? "#f59e0b" : "#ef4444", marginBottom: 8 }}>{score + "/" + qs.current.length}</div>
      <div style={{ fontSize: 14, color: "#8892a4", marginBottom: 16 }}>{score >= 4 ? "ممتاز! تقدر تنتج جمل من ذاكرتك" : score >= 2 ? "جيد! استمر بمراجعة الجمل الجاهزة" : "راجع بنك الجمل — حاول تكتبها من الذاكرة"}</div>
      <button onClick={restart} style={{ padding: "8px 20px", borderRadius: 10, border: "none", background: "#f472b6", color: "#060a14", fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>🔄 جولة جديدة</button>
    </div>
  );

  const scenario = qs.current[qi];

  return (
    <div style={{ animation: "fadeUp .4s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ fontSize: 13, color: "#5a6a80" }}>{"موقف " + (qi + 1) + "/" + qs.current.length}</div>
        <div style={{ fontSize: 13, color: "#f472b6", fontWeight: 600 }}>{score + " صحيح"}</div>
      </div>

      <div style={{ background: "rgba(244,114,182,0.06)", border: "1px solid rgba(244,114,182,0.12)", borderRadius: 12, padding: 16, marginBottom: 12 }}>
        <div style={{ fontSize: 15, color: "#e0e7f1", lineHeight: 2, marginBottom: 8 }}>{scenario.sit}</div>
        <div style={{ fontSize: 13, color: "#f472b6", fontWeight: 600 }}>{"💡 " + scenario.hint}</div>
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
            border: "1px solid rgba(244,114,182,0.2)", color: "#e0e7f1",
            outline: "none", resize: "vertical"
          }}
        />
      </div>

      {!submitted ? (
        <div style={{ textAlign: "center" }}>
          <button onClick={submit} disabled={input.trim().length < 3} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: input.trim().length >= 3 ? "#f472b6" : "#1e293b", color: input.trim().length >= 3 ? "#060a14" : "#4a5568", fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: input.trim().length >= 3 ? "pointer" : "default" }}>✓ أرسل</button>
        </div>
      ) : (
        <div>
          <div style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.12)", borderRadius: 12, padding: 14, marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: "#34d399", fontWeight: 700, marginBottom: 6 }}>✓ الجواب المثالي:</div>
            <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 15, direction: "ltr", textAlign: "left", lineHeight: 1.8, color: "#e0e7f1" }}>{scenario.model}</div>
          </div>
          {matchedWords.length > 0 && (
            <div style={{ fontSize: 13, color: "#34d399", marginBottom: 8 }}>{"كلمات مفتاحية استخدمتها: " + matchedWords.join(", ")}</div>
          )}
          {matchedWords.length === 0 && (
            <div style={{ fontSize: 13, color: "#f59e0b", marginBottom: 8 }}>حاول تستخدم كلمات من بنك الجمل في المرة الجاية</div>
          )}
          <div style={{ textAlign: "center" }}>
            <button onClick={next} style={{ padding: "8px 24px", borderRadius: 10, border: "none", background: "#f472b6", color: "#060a14", fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>{qi + 1 >= qs.current.length ? "🏁 النتيجة" : "التالي ←"}</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== DAILY DEEP PROCESSING SESSION =====
function DailySession({ scenario, onComplete, dayNum }) {
  const [step, setStep] = useState(0);
  const [listenIdx, setListenIdx] = useState(-1); // -1 = not started, 0+ = playing line i
  const [listenDone, setListenDone] = useState(false);
  const [shadowReps, setShadowReps] = useState({});
  const [recallState, setRecallState] = useState({}); // { 0: "hidden"|"thinking"|"revealed" }
  const [recallScore, setRecallScore] = useState({});
  const [prodInput, setProdInput] = useState("");
  const [prodSubmitted, setProdSubmitted] = useState(false);
  const [challengeAccepted, setChallengeAccepted] = useState(false);

  const sc = scenario;
  const steps = [
    { icon: "👂", title: "استمع", desc: "استمع جملة جملة — بدون نص" },
    { icon: "👂📖", title: "استمع واقرأ", desc: "استمع مع النص — لاحظ اللي فاتك" },
    { icon: "🔊", title: "ردّد", desc: "ردّد الجمل المفتاحية ٣ مرات" },
    { icon: "🧠", title: "تذكّر", desc: "شوف الترجمة — قل الجملة من ذاكرتك" },
    { icon: "✍️", title: "أنتج", desc: "اكتب ردك بنفسك" },
    { icon: "🌍", title: "طبّق", desc: "تحدّي حقيقي اليوم" },
  ];

  // Step 1: Play dialogue line by line with pauses
  function playDialogueSequence() {
    setListenIdx(0);
    let i = 0;
    function playNext() {
      if (i >= sc.dialogue.length) { setListenDone(true); setListenIdx(-1); return; }
      setListenIdx(i);
      const u = speak(sc.dialogue[i].text, 0.8);
      if (u) { u.onend = () => { i++; setTimeout(playNext, 800); }; }
      else { i++; setTimeout(playNext, 1500); }
    }
    playNext();
  }

  const stepPct = Math.round(((step + 1) / 6) * 100);

  return (
    <div style={{ animation: "fadeUp .4s" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{ fontSize: 28 }}>{sc.icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#22d3ee" }}>{"جلسة اليوم: " + sc.title}</div>
          <div style={{ fontSize: 12, color: "#5a6a80" }}>{"الخطوة " + (step + 1) + "/6 — " + steps[step].title}</div>
        </div>
        <div style={{ fontSize: 14, fontWeight: 800, color: "#22d3ee", fontFamily: "'IBM Plex Mono'" }}>{stepPct + "%"}</div>
      </div>

      {/* Progress */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center" }}>
            <div style={{ height: 4, borderRadius: 2, background: i <= step ? "#22d3ee" : "#1a2236", transition: ".3s", marginBottom: 4 }} />
            <div style={{ fontSize: 10, color: i === step ? "#22d3ee" : i < step ? "#34d399" : "#3a4a5c" }}>{s.icon}</div>
          </div>
        ))}
      </div>

      {/* Step 1: Listen only — sentence by sentence, no text */}
      {step === 0 && (
        <div>
          <div style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.12)", borderRadius: 14, padding: 24, textAlign: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 15, color: "#8892a4", marginBottom: 16, lineHeight: 2 }}>استمع للمحادثة جملة جملة — حاول تفهم بدون ما تشوف النص</div>
            {listenIdx === -1 && !listenDone && (
              <button onClick={playDialogueSequence} style={{ padding: "14px 32px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#8b5cf6,#6366f1)", color: "#fff", fontFamily: "inherit", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>🔊 ابدأ الاستماع</button>
            )}
            {listenIdx >= 0 && (
              <div>
                <div style={{ fontSize: 40, marginBottom: 8 }}>🔊</div>
                <div style={{ display: "flex", gap: 4, justifyContent: "center", marginBottom: 8 }}>
                  {sc.dialogue.map((_, di) => (
                    <div key={di} style={{ width: 12, height: 12, borderRadius: "50%", background: di < listenIdx ? "#34d399" : di === listenIdx ? "#8b5cf6" : "#1a2236", transition: ".3s", border: di === listenIdx ? "2px solid #fff" : "none" }} />
                  ))}
                </div>
                <div style={{ fontSize: 14, color: "#a78bfa" }}>{"جملة " + (listenIdx + 1) + "/" + sc.dialogue.length + " — " + sc.dialogue[listenIdx].speaker}</div>
              </div>
            )}
          </div>
          {listenDone && <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 14, color: "#34d399", marginBottom: 6 }}>كم جملة فهمت؟</div>
            <div style={{ fontSize: 13, color: "#8892a4", marginBottom: 12 }}>في الخطوة الجاية بتشوف النص وتلاحظ اللي فاتك</div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 10 }}>
              <button onClick={playDialogueSequence} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(139,92,246,0.2)", background: "transparent", color: "#8b5cf6", fontFamily: "inherit", fontSize: 12, cursor: "pointer" }}>🔄 استمع مرة ثانية</button>
              <button onClick={() => setStep(1)} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "#22d3ee", color: "#060a14", fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>التالي →</button>
            </div>
          </div>}
        </div>
      )}

      {/* Step 2: Listen + Read */}
      {step === 1 && (
        <div>
          <div style={{ fontSize: 13, color: "#8892a4", marginBottom: 12, lineHeight: 2 }}>اضغط 🔈 على كل جملة واقرأها. لاحظ الكلمات اللي ما فهمتها أول مرة.</div>
          {sc.dialogue.map((d, i) => (
            <div key={i} style={{ display: "flex", gap: 10, padding: 10, marginBottom: 4, borderRadius: 10, background: d.speaker === "أنت" ? "rgba(34,211,238,0.06)" : "rgba(255,255,255,0.02)", border: "1px solid " + (d.speaker === "أنت" ? "rgba(34,211,238,0.1)" : "rgba(255,255,255,0.04)") }}>
              <div style={{ fontSize: 11, color: d.speaker === "أنت" ? "#22d3ee" : "#f59e0b", fontWeight: 700, minWidth: 50, flexShrink: 0 }}>{d.speaker}</div>
              <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 14, direction: "ltr", textAlign: "left", lineHeight: 1.7, flex: 1, color: "#e0e7f1" }}>{d.text}</div>
              <SpeakBtn text={d.text} size={16} />
            </div>
          ))}
          <div style={{ textAlign: "center", marginTop: 14 }}>
            <button onClick={() => setStep(2)} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "#22d3ee", color: "#060a14", fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>التالي: ردّد الجمل →</button>
          </div>
        </div>
      )}

      {/* Step 3: Shadow key phrases 3x */}
      {step === 2 && (
        <div>
          <div style={{ fontSize: 13, color: "#8892a4", marginBottom: 12, lineHeight: 2 }}>اضغط 🔈 استمع — ثم اضغط الدائرة كل مرة ترددّ. الهدف: ٣.</div>
          {sc.keyPhrases.map((p, i) => {
            const r = shadowReps[i] || 0;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: 12, borderRadius: 10, background: r >= 3 ? "rgba(52,211,153,0.06)" : "rgba(255,255,255,0.02)", border: "1px solid " + (r >= 3 ? "rgba(52,211,153,0.15)" : "rgba(255,255,255,0.04)"), marginBottom: 6 }}>
                <div onClick={() => setShadowReps(prev => ({ ...prev, [i]: (prev[i] || 0) + 1 }))} style={{ width: 30, height: 30, borderRadius: "50%", background: r >= 3 ? "#34d399" : r > 0 ? "#22d3ee" : "#1e293b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: r > 0 ? "#060a14" : "#4a5568", cursor: "pointer", flexShrink: 0 }}>{r >= 3 ? "✓" : r}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 15, direction: "ltr", textAlign: "left", lineHeight: 1.7 }}>{p.en}</div>
                  <div style={{ fontSize: 12, color: "#5a6a80", marginTop: 2 }}>{p.ar}</div>
                </div>
                <SpeakBtn text={p.en} size={18} />
              </div>
            );
          })}
          {Object.values(shadowReps).filter(r => r >= 3).length >= sc.keyPhrases.length && (
            <div style={{ textAlign: "center", marginTop: 14 }}>
              <button onClick={() => setStep(3)} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "#22d3ee", color: "#060a14", fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>التالي: تذكّر →</button>
            </div>
          )}
        </div>
      )}

      {/* Step 4: Recall — show Arabic, hide English, reveal to check */}
      {step === 3 && (
        <div>
          <div style={{ fontSize: 13, color: "#8892a4", marginBottom: 12, lineHeight: 2 }}>شوف الترجمة العربية فقط — حاول تقول الجملة الإنجليزية من ذاكرتك — ثم اضغط "أظهر" وقارن.</div>
          {sc.keyPhrases.map((p, i) => {
            const state = recallState[i] || "hidden";
            const selfScore = recallScore[i]; // undefined, "good", "partial", "forgot"
            return (
              <div key={i} style={{ background: "rgba(245,158,11,0.06)", border: "1px solid " + (selfScore === "good" ? "rgba(52,211,153,0.2)" : selfScore === "forgot" ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.1)"), borderRadius: 10, padding: 14, marginBottom: 8 }}>
                {/* Always show Arabic */}
                <div style={{ fontSize: 14, color: "#f59e0b", fontWeight: 600, marginBottom: 8 }}>{p.ar}</div>

                {state === "hidden" && (
                  <button onClick={() => setRecallState(prev => ({ ...prev, [i]: "thinking" }))} style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "#f59e0b", color: "#060a14", fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>قلها بصوت عالٍ ثم اضغط هنا</button>
                )}

                {state === "thinking" && (
                  <div>
                    <div style={{ fontSize: 12, color: "#8892a4", marginBottom: 8 }}>قلت الجملة؟ اضغط "أظهر" وقارن:</div>
                    <button onClick={() => setRecallState(prev => ({ ...prev, [i]: "revealed" }))} style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "#a78bfa", color: "#fff", fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>👁 أظهر الجملة</button>
                  </div>
                )}

                {state === "revealed" && (
                  <div>
                    <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 15, direction: "ltr", textAlign: "left", lineHeight: 1.7, color: "#e0e7f1", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ flex: 1 }}>{p.en}</span>
                      <SpeakBtn text={p.en} size={16} />
                    </div>
                    {!selfScore && (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => setRecallScore(prev => ({ ...prev, [i]: "good" }))} style={{ padding: "6px 14px", borderRadius: 6, border: "none", background: "rgba(52,211,153,0.15)", color: "#34d399", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>تذكّرتها ✓</button>
                        <button onClick={() => setRecallScore(prev => ({ ...prev, [i]: "partial" }))} style={{ padding: "6px 14px", borderRadius: 6, border: "none", background: "rgba(245,158,11,0.15)", color: "#f59e0b", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>تقريباً</button>
                        <button onClick={() => setRecallScore(prev => ({ ...prev, [i]: "forgot" }))} style={{ padding: "6px 14px", borderRadius: 6, border: "none", background: "rgba(239,68,68,0.1)", color: "#ef4444", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>نسيتها</button>
                      </div>
                    )}
                    {selfScore && <div style={{ fontSize: 12, color: selfScore === "good" ? "#34d399" : selfScore === "partial" ? "#f59e0b" : "#ef4444", fontWeight: 600, marginTop: 4 }}>{selfScore === "good" ? "✓ ممتاز!" : selfScore === "partial" ? "⚡ قريب — ردّدها مرة" : "🔄 راجعها — ردّدها ٣ مرات"}</div>}
                  </div>
                )}
              </div>
            );
          })}
          {Object.keys(recallScore).length >= sc.keyPhrases.length && (
            <div style={{ textAlign: "center", marginTop: 14 }}>
              <button onClick={() => setStep(4)} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "#22d3ee", color: "#060a14", fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>التالي: أنتج بنفسك →</button>
            </div>
          )}
        </div>
      )}

      {/* Step 5: Produce + feedback */}
      {step === 4 && (
        <div>
          <div style={{ background: "rgba(244,114,182,0.06)", border: "1px solid rgba(244,114,182,0.12)", borderRadius: 12, padding: 16, marginBottom: 12 }}>
            <div style={{ fontSize: 15, color: "#e0e7f1", lineHeight: 2, marginBottom: 4 }}>{sc.producePrompt}</div>
          </div>
          <textarea value={prodInput} onChange={(e) => !prodSubmitted && setProdInput(e.target.value)} placeholder="اكتب ردك بالإنجليزي..." disabled={prodSubmitted} style={{ width: "100%", minHeight: 80, padding: 14, borderRadius: 12, fontFamily: "'IBM Plex Mono'", fontSize: 15, direction: "ltr", textAlign: "left", lineHeight: 1.8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(244,114,182,0.2)", color: "#e0e7f1", outline: "none", resize: "vertical", marginBottom: 12 }} />
          {!prodSubmitted ? (
            <div style={{ textAlign: "center" }}>
              <button onClick={() => setProdSubmitted(true)} disabled={prodInput.trim().length < 5} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: prodInput.trim().length >= 5 ? "#f472b6" : "#1e293b", color: prodInput.trim().length >= 5 ? "#060a14" : "#4a5568", fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: prodInput.trim().length >= 5 ? "pointer" : "default" }}>✓ أرسل</button>
            </div>
          ) : (
            <div>
              <div style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.12)", borderRadius: 12, padding: 14, marginBottom: 8 }}>
                <div style={{ fontSize: 12, color: "#34d399", fontWeight: 700, marginBottom: 6 }}>النموذج المثالي:</div>
                <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 15, direction: "ltr", textAlign: "left", lineHeight: 1.8, color: "#e0e7f1", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ flex: 1 }}>{sc.produceModel}</span>
                  <SpeakBtn text={sc.produceModel} size={16} />
                </div>
              </div>
              {/* Noticing feedback — explain WHY */}
              <div style={{ background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.12)", borderRadius: 12, padding: 14, marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: "#a78bfa", fontWeight: 700, marginBottom: 6 }}>💡 لاحظ الفرق:</div>
                {sc.noticingTips ? sc.noticingTips.map((tip, ti) => (
                  <div key={ti} style={{ fontSize: 13, color: "#c4b5fd", lineHeight: 2, marginBottom: 2 }}>{"• " + tip}</div>
                )) : (
                  <div style={{ fontSize: 13, color: "#c4b5fd", lineHeight: 2 }}>قارن ردّك بالنموذج — لاحظ: هل استخدمت "please"؟ هل حددت طلبك بوضوح؟ هل سألت سؤال إضافي يُظهر ثقة؟</div>
                )}
              </div>
              <div style={{ textAlign: "center" }}>
                <button onClick={() => setStep(5)} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "#22d3ee", color: "#060a14", fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>التالي: تحدّي اليوم →</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 6: Real-world challenge */}
      {step === 5 && (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🌍</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#f59e0b", marginBottom: 12 }}>تحدّي اليوم</div>
          <div style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.12)", borderRadius: 14, padding: 20, marginBottom: 16 }}>
            <div style={{ fontSize: 16, color: "#e0e7f1", lineHeight: 2 }}>{sc.challenge}</div>
          </div>
          {!challengeAccepted ? (
            <button onClick={() => { setChallengeAccepted(true); if (onComplete) onComplete(); }} style={{ padding: "12px 28px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#34d399,#22d3ee)", color: "#060a14", fontFamily: "inherit", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>أقبل التحدي ✓</button>
          ) : (
            <div style={{ animation: "fadeUp .4s" }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🎉</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#34d399", marginBottom: 6 }}>أحسنت! أنهيت جلسة اليوم</div>
              <div style={{ fontSize: 13, color: "#8892a4", lineHeight: 2 }}>تمرّنت على "{sc.title}" من ٦ زوايا مختلفة. كل جلسة تبني طبقة جديدة في ذاكرتك.</div>
            </div>
          )}
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
      <div style={{ fontSize: 24, fontWeight: 800, color: score >= 6 ? "#34d399" : score >= 4 ? "#f59e0b" : "#ef4444", marginBottom: 8 }}>{score + "/" + qs.current.length}</div>
      <div style={{ fontSize: 14, color: "#8892a4", marginBottom: 16 }}>{score >= 6 ? "ممتاز! أذنك صارت تلتقط بسرعة" : score >= 4 ? "جيد! استمر — الاستماع يتحسن بالتكرار" : "ركّز أكثر على الاستماع — أعد الجمل اللي ما فهمتها"}</div>
      <button onClick={restart} style={{ padding: "8px 20px", borderRadius: 10, border: "none", background: "#8b5cf6", color: "#fff", fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>🔄 جولة جديدة</button>
    </div>
  );

  const raw = qs.current[qi];
  const { opts: qOpts, correctIndex: qAns } = shuffleOpts(raw.opts, raw.ans, qi * 19 + 73);

  return (
    <div style={{ animation: "fadeUp .4s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ fontSize: 13, color: "#5a6a80" }}>{"سؤال " + (qi + 1) + "/" + qs.current.length}</div>
        <div style={{ fontSize: 13, color: "#8b5cf6", fontWeight: 600 }}>{score + " صحيح"}</div>
      </div>

      <div style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.12)", borderRadius: 12, padding: 20, marginBottom: 12, textAlign: "center" }}>
        <button onClick={playQ} style={{ padding: "12px 28px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#8b5cf6,#6366f1)", color: "#fff", fontFamily: "inherit", fontSize: 16, fontWeight: 700, cursor: "pointer", marginBottom: 10 }}>🔊 استمع للجملة</button>
        <div style={{ fontSize: 12, color: "#5a6a80" }}>اضغط للاستماع — ثم أجب على السؤال</div>
        {revealed && <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 14, color: "#8b5cf6", marginTop: 10, direction: "ltr" }}>{raw.text}</div>}
      </div>

      <div style={{ fontSize: 14, color: "#e0e7f1", marginBottom: 10, fontWeight: 600 }}>{raw.q}</div>

      {qOpts.map((o, oi) => {
        const show = picked !== null;
        const isCorrect = oi === qAns;
        const isPicked = picked === oi;
        let bg = "rgba(255,255,255,0.02)", brd = "rgba(255,255,255,0.04)";
        if (show && isCorrect) { bg = "rgba(52,211,153,0.1)"; brd = "rgba(52,211,153,0.3)"; }
        else if (show && isPicked && !isCorrect) { bg = "rgba(239,68,68,0.1)"; brd = "rgba(239,68,68,0.3)"; }
        return <div key={oi} onClick={() => !show && pick(oi)} style={{ padding: 12, borderRadius: 10, marginBottom: 5, cursor: show ? "default" : "pointer", fontSize: 14, lineHeight: 1.7, background: bg, border: "1px solid " + brd, opacity: show && !isCorrect && !isPicked ? 0.3 : 1 }}>
          {o}{show && isCorrect && <span style={{ color: "#34d399", fontSize: 11 }}> ✓</span>}
        </div>;
      })}
      {picked !== null && (
        <div style={{ textAlign: "center", marginTop: 10 }}>
          {!revealed && <button onClick={() => setRevealed(true)} style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(139,92,246,0.2)", background: "transparent", color: "#8b5cf6", fontFamily: "inherit", fontSize: 12, cursor: "pointer", marginLeft: 8 }}>👁 أظهر النص</button>}
          <button onClick={next} style={{ padding: "8px 20px", borderRadius: 10, border: "none", background: "#8b5cf6", color: "#fff", fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer", marginRight: 8 }}>{qi + 1 >= qs.current.length ? "🏁 النتيجة" : "التالي ←"}</button>
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
      <div style={{ fontSize: 24, fontWeight: 800, color: score >= 6 ? "#34d399" : score >= 4 ? "#f59e0b" : "#ef4444", marginBottom: 8 }}>{score + "/" + qs.current.length}</div>
      <div style={{ fontSize: 14, color: "#8892a4", marginBottom: 16 }}>{score >= 6 ? "ممتاز! أذنك تلتقط التفاصيل" : score >= 4 ? "جيد! استمر بالاستماع" : "أعد الاستماع لكل جملة عدة مرات"}</div>
      <button onClick={restart} style={{ padding: "8px 20px", borderRadius: 10, border: "none", background: "#ec4899", color: "#fff", fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>🔄 جولة جديدة</button>
    </div>
  );

  const correct = qs.current[qi];
  const userWords = input.trim().toLowerCase().replace(/[.,!?]/g, "").split(/\s+/).filter(Boolean);
  const correctWords = correct.toLowerCase().replace(/[.,!?]/g, "").split(/\s+/).filter(Boolean);

  return (
    <div style={{ animation: "fadeUp .4s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ fontSize: 13, color: "#5a6a80" }}>{"جملة " + (qi + 1) + "/" + qs.current.length}</div>
        <div style={{ fontSize: 13, color: "#ec4899", fontWeight: 600 }}>{score + " صحيح"}</div>
      </div>

      <div style={{ background: "rgba(236,72,153,0.06)", border: "1px solid rgba(236,72,153,0.12)", borderRadius: 12, padding: 20, marginBottom: 12, textAlign: "center" }}>
        <button onClick={playQ} style={{ padding: "12px 28px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#ec4899,#f472b6)", color: "#fff", fontFamily: "inherit", fontSize: 16, fontWeight: 700, cursor: "pointer", marginBottom: 6 }}>🔊 استمع</button>
        <div style={{ marginTop: 6 }}>
          <button onClick={() => speak(qs.current[qi], 0.55)} style={{ padding: "4px 12px", borderRadius: 6, border: "1px solid rgba(236,72,153,0.2)", background: "transparent", color: "#ec4899", fontFamily: "inherit", fontSize: 11, cursor: "pointer" }}>🐢 بطيء</button>
        </div>
        <div style={{ fontSize: 12, color: "#5a6a80", marginTop: 8 }}>استمع ثم اكتب ما سمعته بالإنجليزي</div>
      </div>

      <textarea value={input} onChange={(e) => !checked && setInput(e.target.value)} placeholder="اكتب ما سمعته هنا..." disabled={checked} style={{ width: "100%", minHeight: 70, padding: 14, borderRadius: 12, fontFamily: "'IBM Plex Mono'", fontSize: 15, direction: "ltr", textAlign: "left", lineHeight: 1.8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(236,72,153,0.2)", color: "#e0e7f1", outline: "none", resize: "vertical", marginBottom: 12 }} />

      {!checked ? (
        <div style={{ textAlign: "center" }}>
          <button onClick={check} disabled={input.trim().length < 3} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: input.trim().length >= 3 ? "#ec4899" : "#1e293b", color: input.trim().length >= 3 ? "#fff" : "#4a5568", fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: input.trim().length >= 3 ? "pointer" : "default" }}>✓ تحقق</button>
        </div>
      ) : (
        <div>
          <div style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.12)", borderRadius: 12, padding: 14, marginBottom: 10 }}>
            <div style={{ fontSize: 12, color: "#34d399", fontWeight: 700, marginBottom: 6 }}>✓ الجملة الصحيحة:</div>
            <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 15, direction: "ltr", textAlign: "left", lineHeight: 1.8, color: "#e0e7f1" }}>{correct}</div>
          </div>
          <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 13, direction: "ltr", textAlign: "left", lineHeight: 2, marginBottom: 10 }}>
            {correctWords.map((w, wi) => {
              const matched = userWords.includes(w);
              return <span key={wi} style={{ color: matched ? "#34d399" : "#ef4444", fontWeight: matched ? 400 : 700 }}>{w + " "}</span>;
            })}
          </div>
          <div style={{ textAlign: "center" }}>
            <button onClick={next} style={{ padding: "8px 24px", borderRadius: 10, border: "none", background: "#ec4899", color: "#fff", fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>{qi + 1 >= qs.current.length ? "🏁 النتيجة" : "التالي ←"}</button>
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
        const r = await window.storage.get("level-test-results");
        const results = r && r.value ? JSON.parse(r.value) : [];
        results.push(result);
        await window.storage.set("level-test-results", JSON.stringify(results));
        if (onComplete) onComplete(result);
      } catch (e) {}
    })();
  }

  // INTRO SCREEN
  if (phase === "intro") return (
    <div style={{ animation: "fadeUp .4s", textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
      <div style={{ fontSize: 20, fontWeight: 800, background: "linear-gradient(135deg,#22d3ee,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 12 }}>اختبار تحديد المستوى</div>
      <div style={{ fontSize: 13, color: "#8892a4", lineHeight: 2, marginBottom: 20 }}>
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
          <div key={i} style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 10, padding: 12 }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#e0e7f1" }}>{s.label}</div>
            <div style={{ fontSize: 10, color: "#5a6a80" }}>{s.desc}</div>
          </div>
        ))}
      </div>
      <div style={{ background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.12)", borderRadius: 10, padding: 12, marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: "#a78bfa", fontWeight: 600 }}>⏱️ {TOTAL_QUESTIONS} سؤال — حوالي ١٠ دقائق</div>
        <div style={{ fontSize: 11, color: "#5a6a80", marginTop: 4 }}>الأسئلة تتكيّف مع مستواك — تزداد صعوبة إذا أجبت صح</div>
      </div>
      <button onClick={startTest} style={{ padding: "12px 36px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#22d3ee,#a78bfa)", color: "#060a14", fontFamily: "inherit", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>ابدأ الاختبار 🚀</button>
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
          <div style={{ fontSize: 13, color: "#5a6a80", marginBottom: 8 }}>مستواك في اللغة الإنجليزية</div>
          <div style={{ display: "inline-block", padding: "12px 32px", borderRadius: 16, background: lvl.color + "18", border: "2px solid " + lvl.color + "40" }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: lvl.color, fontFamily: "'IBM Plex Mono'" }}>{lvl.code}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#e0e7f1" }}>{lvl.name}</div>
            <div style={{ fontSize: 12, color: "#8892a4" }}>{lvl.nameEn}</div>
          </div>
        </div>

        <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 13, color: "#e0e7f1", lineHeight: 2 }}>{lvl.desc}</div>
        </div>

        <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#22d3ee", marginBottom: 10 }}>💡 نصيحة لك</div>
          <div style={{ fontSize: 13, color: "#8892a4", lineHeight: 2 }}>{lvl.tip}</div>
        </div>

        {/* Skill breakdown */}
        <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#a78bfa", marginBottom: 12 }}>📊 تحليل المهارات</div>
          {skillBreakdown && Object.keys(skillBreakdown).map(skill => {
            const s = skillBreakdown[skill];
            if (s.total === 0) return null;
            const pct = Math.round((s.correct / s.total) * 100);
            const barColor = pct >= 80 ? "#34d399" : pct >= 50 ? "#f59e0b" : "#ef4444";
            return (
              <div key={skill} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <div style={{ fontSize: 12, color: "#e0e7f1" }}>{TYPE_ICONS[skill]} {TYPE_LABELS[skill]}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: barColor, fontFamily: "'IBM Plex Mono'" }}>{pct}%</div>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: "#111827", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: pct + "%", borderRadius: 3, background: barColor, transition: "width .5s" }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Level breakdown */}
        <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#f59e0b", marginBottom: 12 }}>📈 الأداء حسب المستوى</div>
          <div style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
            {CEFR_LEVELS.map((l, i) => {
              const att = levelAttempts[i];
              const sc = levelScores[i];
              const pct = att > 0 ? Math.round((sc / att) * 100) : 0;
              const isFinal = i === finalLevel;
              return (
                <div key={i} style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: att > 0 ? (pct >= 60 ? "#34d399" : "#ef4444") : "#3a4a5c", marginBottom: 4 }}>{att > 0 ? pct + "%" : "—"}</div>
                  <div style={{ height: Math.max(att > 0 ? pct * 0.6 : 4, 4), borderRadius: 4, background: att > 0 ? l.color : "#1a2236", border: isFinal ? "2px solid #fff" : "none", transition: "height .3s" }} />
                  <div style={{ fontSize: 10, fontWeight: isFinal ? 800 : 600, color: isFinal ? "#fff" : "#5a6a80", marginTop: 4 }}>{l.code}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
          <div style={{ flex: 1, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 10, padding: 12, textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#22d3ee", fontFamily: "'IBM Plex Mono'" }}>{totalCorrect}/{history.length}</div>
            <div style={{ fontSize: 10, color: "#5a6a80" }}>إجابات صحيحة</div>
          </div>
          <div style={{ flex: 1, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 10, padding: 12, textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#a78bfa", fontFamily: "'IBM Plex Mono'" }}>{Math.round((Date.now() - startTime) / 1000)}s</div>
            <div style={{ fontSize: 10, color: "#5a6a80" }}>الوقت</div>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 16 }}>
          <button onClick={() => { setPhase("intro"); setQi(0); setPicked(null); setCurrentLevel(2); setHistory([]); setQuestions([]); setLevelScores({0:0,1:0,2:0,3:0,4:0,5:0}); setLevelAttempts({0:0,1:0,2:0,3:0,4:0,5:0}); setConsecutiveCorrect(0); setConsecutiveWrong(0); setFinalLevel(null); setSkillBreakdown(null); }} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#22d3ee,#a78bfa)", color: "#060a14", fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>🔄 أعد الاختبار</button>
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
          <div style={{ fontSize: 12, color: "#5a6a80" }}>{"سؤال " + (qi + 1) + "/" + TOTAL_QUESTIONS}</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ fontSize: 10, padding: "2px 8px", borderRadius: 6, background: levelInfo.color + "18", color: levelInfo.color, fontWeight: 700 }}>{levelInfo.code}</div>
            <div style={{ fontSize: 10, color: "#5a6a80" }}>{TYPE_ICONS[currentQ.type]} {TYPE_LABELS[currentQ.type]}</div>
          </div>
        </div>
        <div style={{ height: 4, borderRadius: 2, background: "#111827", overflow: "hidden" }}>
          <div style={{ height: "100%", width: progress + "%", borderRadius: 2, background: "linear-gradient(90deg,#22d3ee,#a78bfa)", transition: "width .3s" }} />
        </div>
      </div>

      {/* Question */}
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 16, marginBottom: 14 }}>
        <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 15, direction: "ltr", textAlign: "left", lineHeight: 1.9, color: "#e0e7f1" }}>{displayQ.q}</div>
      </div>

      {/* Options */}
      {displayQ.opts.map((o, oi) => {
        const show = picked !== null;
        const isCorrect = oi === displayQ.ans;
        const isPicked = picked === oi;
        let bg = "rgba(255,255,255,0.02)", brd = "rgba(255,255,255,0.04)";
        if (show && isCorrect) { bg = "rgba(52,211,153,0.12)"; brd = "rgba(52,211,153,0.3)"; }
        else if (show && isPicked && !isCorrect) { bg = "rgba(239,68,68,0.12)"; brd = "rgba(239,68,68,0.3)"; }
        return (
          <div key={oi} onClick={() => !show && pick(oi)} style={{ padding: 12, borderRadius: 10, marginBottom: 6, cursor: show ? "default" : "pointer", fontFamily: "'IBM Plex Mono'", fontSize: 13, direction: "ltr", textAlign: "left", lineHeight: 1.7, background: bg, border: "1px solid " + brd, opacity: show && !isCorrect && !isPicked ? 0.3 : 1, transition: ".2s" }}>
            {o}
            {show && isCorrect && <span style={{ color: "#34d399", fontSize: 11 }}> ✓</span>}
            {show && isPicked && !isCorrect && <span style={{ color: "#ef4444", fontSize: 11 }}> ✗</span>}
          </div>
        );
      })}

      {/* Explanation after answer */}
      {picked !== null && (
        <div style={{ textAlign: "center", marginTop: 12 }}>
          <div style={{ fontSize: 12, color: picked === displayQ.ans ? "#34d399" : "#ef4444", marginBottom: 8, fontWeight: 600 }}>
            {picked === displayQ.ans ? "✓ إجابة صحيحة!" : "✗ إجابة خاطئة"}
          </div>
          <button onClick={next} style={{ padding: "8px 24px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#22d3ee,#a78bfa)", color: "#060a14", fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
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
  const [srsData, setSrsData] = useState({}); // { "cat-idx": { lastDate, reps, interval } }
  const tmRef = useRef(null);

  useEffect(() => {
    (async () => {
      try { const r = await window.storage.get(DK); if (r && r.value) setStore(JSON.parse(r.value)); } catch (e) {}
      try { const r = await window.storage.get("quiz-results"); if (r && r.value) setQuizResults(JSON.parse(r.value)); } catch (e) {}
      try { const r = await window.storage.get("level-test-results"); if (r && r.value) { const arr = JSON.parse(r.value); if (arr.length > 0) setLevelResult(arr[arr.length - 1]); } } catch (e) {}
      try { const r = await window.storage.get("srs-data"); if (r && r.value) setSrsData(JSON.parse(r.value)); } catch (e) {}
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
        <p style={{ fontSize: 15, color: "#5a6a80", marginBottom: 32, lineHeight: 1.9 }}>تكلّم إنجليزي بثقة — في السفر، الشغل، والحياة اليومية</p>
        <button onClick={() => save({ ...store, start: gtd() })} style={{ padding: "13px 40px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#22d3ee,#06b6d4)", color: "#060a14", fontFamily: "inherit", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>ابدأ رحلتك 🚀</button>
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
  const todayScenario = DAILY_SCENARIOS[dn % DAILY_SCENARIOS.length];
  const Card = ({ children, s }) => <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: 18, marginBottom: 12, animation: "fadeUp .4s", ...s }}>{children}</div>;

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "#060a14", color: "#e0e7f1", fontFamily: "'Noto Kufi Arabic',sans-serif" }}>
      <style>{CSS}</style>
      {conf && <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 100 }}>{Array.from({ length: 25 }).map((_, i) => <div key={i} style={{ position: "absolute", top: 0, left: Math.random() * 100 + "%", width: 7, height: 7, background: ["#22d3ee", "#a78bfa", "#f59e0b", "#34d399"][i % 4], borderRadius: "50%", animation: "confDrop " + (2 + Math.random() * 2) + "s linear " + Math.random() * 0.5 + "s forwards" }} />)}</div>}

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 14px" }}>
        <div style={{ padding: "16px 0 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 800, background: "linear-gradient(135deg,#22d3ee,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>اختراق حاجز الإنجليزية</h1>
            <div style={{ fontSize: 12, color: "#4a5568", marginTop: 2 }}>{"أسبوع " + wk + "/12 — " + ph.nm + (levelResult ? " — " + levelResult.levelCode : "")}</div>
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: adaptedPhase.c, fontFamily: "'IBM Plex Mono'" }}>{pct + "%"}</div>
        </div>

        <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.04)", marginBottom: 14 }}>
          {[["today", "📋 اليوم"], ["train", "🎭 تدريب"], ["phrases", "💬 الجمل"], ["progress", "📊 التقدم"]].map(([id, l]) => (
            <button key={id} onClick={() => { setTab(id); setOpenTask(null); setTrainMode(null); }} style={{ padding: "10px 14px", border: "none", background: "transparent", color: tab === id ? "#22d3ee" : "#4a5568", fontFamily: "inherit", fontSize: 14, fontWeight: 600, cursor: "pointer", borderBottom: "2px solid " + (tab === id ? "#22d3ee" : "transparent"), whiteSpace: "nowrap" }}>{l}</button>
          ))}
        </div>

        {/* TODAY — Deep Processing Session */}
        {tab === "today" && (
          <div>
            <Card><div style={{ fontSize: 14, color: "#8892a4", textAlign: "center", lineHeight: 2 }}>{"💎 " + MOTIV[dn % MOTIV.length]}</div></Card>
            <Card>
              <DailySession
                scenario={DAILY_SCENARIOS[dn % DAILY_SCENARIOS.length]}
                dayNum={dn}
                onComplete={() => {
                  const d = store.days[today] || [];
                  if (!d.includes("session")) {
                    save({ ...store, days: { ...store.days, [today]: [...d, "session"] } });
                    setConf(true); setTimeout(() => setConf(false), 3000);
                  }
                }}
              />
            </Card>
            {done.includes("session") && <Card s={{ borderColor: "rgba(52,211,153,0.15)" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 14, color: "#34d399", fontWeight: 700, marginBottom: 4 }}>✅ جلسة اليوم مكتملة!</div>
                <div style={{ fontSize: 12, color: "#5a6a80" }}>تبي تمارين إضافية؟ روح لتبويب "تدريب"</div>
              </div>
            </Card>}
          </div>
        )}

        {/* TRAINING */}
        {tab === "train" && (
          <div>
            {!trainMode && (
              <div>
                <Card><div style={{ fontSize: 14, color: "#8892a4", textAlign: "center", lineHeight: 1.9 }}>🎭 تدريبات تفاعلية تجهّزك لمواقف الحياة الحقيقية</div></Card>
                {[
                  { id: "sim", icon: "🎭", title: "محادثات تفاعلية", desc: "سيناريوهات حقيقية: فندق، طبيب، مطعم، مدرسة — اختر الرد واقرأه", color: "#22d3ee" },
                  { id: "quick", icon: "⚡", title: "استجابة سريعة", desc: "مواقف يومية سريعة — اختر الرد الأنسب", color: "#f59e0b" },
                  { id: "quiz", icon: "📊", title: "اختبار أسبوعي", desc: "١٠ أسئلة تقيس تقدمك في حفظ الجمل واستخدامها", color: "#a78bfa" },
                  { id: "fill", icon: "📝", title: "أكمل الفراغ", desc: "اكتب الكلمات الناقصة في الجمل — يختبر حفظك الحقيقي", color: "#06b6d4" },
                  { id: "build", icon: "🧩", title: "بناء جمل", desc: "رتّب الكلمات المبعثرة لتكوين جمل صحيحة — يعالج مشكلة تركيب الجمل", color: "#10b981" },
                  { id: "listen", icon: "👂", title: "فهم الاستماع", desc: "استمع لجملة وأجب — يدرّب أذنك على فهم الإنجليزي المنطوق", color: "#8b5cf6" },
                  { id: "dictation", icon: "🎧", title: "إملاء صوتي", desc: "استمع واكتب ما سمعته — يربط الأذن باليد والذاكرة", color: "#ec4899" },
                  { id: "recall", icon: "✍️", title: "إنتاج حر", desc: "اكتب ردك بنفسك بدون خيارات — يختبر قدرتك الحقيقية على الإنتاج", color: "#f472b6" },
                  { id: "level", icon: "🎯", title: "اختبار تحديد المستوى", desc: "اختبار تكيّفي CEFR يقيس مستواك الحقيقي — قواعد ومفردات وقراءة وتواصل مهني", color: "#e879f9" },
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
            {trainMode === "listen" && <Card><div style={{ marginBottom: 10 }}><button onClick={() => setTrainMode(null)} style={{ background: "none", border: "none", color: "#5a6a80", fontFamily: "inherit", fontSize: 12, cursor: "pointer" }}>→ رجوع</button></div><ListenExercise /></Card>}
            {trainMode === "dictation" && <Card><div style={{ marginBottom: 10 }}><button onClick={() => setTrainMode(null)} style={{ background: "none", border: "none", color: "#5a6a80", fontFamily: "inherit", fontSize: 12, cursor: "pointer" }}>→ رجوع</button></div><DictationExercise /></Card>}
            {trainMode === "recall" && <Card><div style={{ marginBottom: 10 }}><button onClick={() => setTrainMode(null)} style={{ background: "none", border: "none", color: "#5a6a80", fontFamily: "inherit", fontSize: 12, cursor: "pointer" }}>→ رجوع</button></div><FreeRecall /></Card>}
            {trainMode === "level" && <Card><div style={{ marginBottom: 10 }}><button onClick={() => setTrainMode(null)} style={{ background: "none", border: "none", color: "#5a6a80", fontFamily: "inherit", fontSize: 12, cursor: "pointer" }}>→ رجوع</button></div><LevelTest onComplete={(result) => setLevelResult(result)} /></Card>}
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
                      (async () => { try { await window.storage.set("srs-data", JSON.stringify(newSrs)); } catch(e) {} })();
                    }
                  }} style={{ display: "flex", alignItems: "center", gap: 10, padding: 12, borderRadius: 10, background: r >= 5 ? "rgba(52,211,153,0.06)" : isDue ? "rgba(245,158,11,0.04)" : "rgba(255,255,255,0.015)", border: "1px solid " + (r >= 5 ? "rgba(52,211,153,0.15)" : isDue ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.04)"), marginBottom: 6, cursor: "pointer" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: r >= 5 ? "#34d399" : r > 0 ? "#22d3ee" : "#1e293b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: r > 0 ? "#060a14" : "#4a5568", flexShrink: 0 }}>{r >= 5 ? "✓" : r}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 15, direction: "ltr", textAlign: "left", lineHeight: 1.7 }}>{p.en}</div>
                      <div style={{ fontSize: 12, color: "#5a6a80", marginTop: 2 }}>{p.ar}</div>
                    </div>
                    {isDue && <div style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "rgba(245,158,11,0.15)", color: "#f59e0b", fontWeight: 600 }}>مراجعة</div>}
                  </div>
                );
              })}
              <div style={{ fontSize: 12, color: "#5a6a80", textAlign: "center", marginTop: 10 }}>اضغط على الدائرة كل مرة ترددّ — الهدف ٥ لكل جملة</div>
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
                <Card s={{ borderColor: "rgba(245,158,11,0.15)" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#f59e0b", marginBottom: 10 }}>{"🔄 مراجعة مطلوبة (" + dueItems.length + " جملة)"}</div>
                  <div style={{ fontSize: 12, color: "#5a6a80", marginBottom: 10 }}>هذه الجمل حان وقت مراجعتها حسب نظام التكرار المتباعد</div>
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
                          (async () => { try { await window.storage.set("srs-data", JSON.stringify(newSrs)); } catch(e) {} })();
                        }
                      }} style={{ display: "flex", alignItems: "center", gap: 10, padding: 12, borderRadius: 10, background: r >= 3 ? "rgba(52,211,153,0.06)" : "rgba(245,158,11,0.04)", border: "1px solid " + (r >= 3 ? "rgba(52,211,153,0.15)" : "rgba(245,158,11,0.1)"), marginBottom: 6, cursor: "pointer" }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: r >= 3 ? "#34d399" : r > 0 ? "#f59e0b" : "#1e293b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: r > 0 ? "#060a14" : "#4a5568", flexShrink: 0 }}>{r >= 3 ? "✓" : r}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 14, direction: "ltr", textAlign: "left", lineHeight: 1.7 }}>{item.phrase.en}</div>
                          <div style={{ fontSize: 11, color: "#5a6a80" }}>{item.phrase.ar} — {item.icon} {item.cat}</div>
                        </div>
                        <div style={{ fontSize: 10, color: "#f59e0b" }}>{item.daysSince + "d"}</div>
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
                { l: "أيام", v: Object.values(store.days).filter(d => d.length >= 1).length, c: "#22d3ee" },
                { l: "أسبوع", v: wk + "/12", c: "#a78bfa" },
                { l: "سلسلة 🔥", v: (() => { let s = 0, d = new Date(); for (let i = 0; i < 100; i++) { const k = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); if (store.days[k] && store.days[k].length >= 1) { s++; d.setDate(d.getDate() - 1); } else if (i === 0) { d.setDate(d.getDate() - 1); } else break; } return s; })(), c: "#f59e0b" },
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
            {levelResult && <Card>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#e879f9", marginBottom: 12 }}>🎯 مستوى اللغة (CEFR)</div>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 60, height: 60, borderRadius: 12, background: CEFR_LEVELS[levelResult.level].color + "18", border: "2px solid " + CEFR_LEVELS[levelResult.level].color + "40", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: CEFR_LEVELS[levelResult.level].color, fontFamily: "'IBM Plex Mono'" }}>{levelResult.levelCode}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#e0e7f1" }}>{CEFR_LEVELS[levelResult.level].name}</div>
                  <div style={{ fontSize: 11, color: "#5a6a80" }}>{CEFR_LEVELS[levelResult.level].nameEn} — {levelResult.date}</div>
                  {levelResult.skills && <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                    {Object.keys(levelResult.skills).map(sk => {
                      const s = levelResult.skills[sk];
                      if (!s || s.total === 0) return null;
                      const pct = Math.round((s.correct / s.total) * 100);
                      return <div key={sk} style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: (pct >= 60 ? "rgba(52,211,153,0.1)" : "rgba(239,68,68,0.1)"), color: pct >= 60 ? "#34d399" : "#ef4444" }}>{TYPE_ICONS[sk]} {pct}%</div>;
                    })}
                  </div>}
                </div>
              </div>
              <div style={{ textAlign: "center", marginTop: 10 }}>
                <button onClick={() => { setTab("train"); setTrainMode("level"); }} style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(232,121,249,0.2)", background: "transparent", color: "#e879f9", fontFamily: "inherit", fontSize: 11, cursor: "pointer" }}>🔄 أعد الاختبار</button>
              </div>
            </Card>}
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
