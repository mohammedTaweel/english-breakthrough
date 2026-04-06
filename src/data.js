// ===== CONTENT DATA =====
// All learning content extracted from App.jsx

export const SHADOW_LINES = [
  ["Good morning. How are you today?", "I would like a cup of coffee, please.", "Excuse me, where is the nearest pharmacy?", "Thank you very much for your help.", "Can I have the bill, please?", "I need to make an appointment.", "Could you speak more slowly, please?", "I'm sorry, I didn't understand that.", "What time does the store close?", "Have a nice day!"],
  ["I've been living here for about five years.", "Could you recommend a good restaurant nearby?", "I need to reschedule my appointment to next week.", "The weather has been really nice lately.", "I'm looking for something in a medium size.", "Let me check my calendar and get back to you.", "I appreciate your patience with this.", "Would it be possible to get a refund?", "I'll send you the details by email.", "That's exactly what I was looking for."],
  ["I've been meaning to bring this up for a while now.", "Based on what you're saying, I think we should consider another option.", "I completely understand your concern, and here's what I suggest.", "Would it be possible to explore a different approach to this?", "Let me walk you through the details so we're on the same page.", "I want to make sure we're aligned before we move forward.", "From my experience, this tends to work better in the long run.", "I'd appreciate it if you could look into this for me.", "Let me summarize what we've discussed so far.", "I believe this is the best path forward given the circumstances."],
];
export const STORIES = [
  { t: "رحلة إلى لندن", lines: ["Faisal had always dreamed of visiting London.", "He booked his flight and hotel online by himself.", "At the airport, he asked for directions in English.", "Excuse me, which gate is for the London flight?", "The flight attendant smiled and pointed the way.", "In London, he took the underground to his hotel.", "He ordered fish and chips at a local restaurant.", "The waiter asked, Would you like anything to drink?", "Just water, please, Faisal replied with confidence.", "He realized his English was better than he thought."] },
  { t: "عند الدكتور", lines: ["Huda moved to a new city and needed a doctor.", "She called the clinic to book an appointment.", "I would like to see a doctor this week, she said.", "The receptionist asked about her symptoms.", "I have had a headache for three days, Huda explained.", "The doctor examined her carefully and asked questions.", "Have you been under a lot of stress recently?", "Yes, I just moved and started a new routine.", "The doctor recommended rest and staying hydrated.", "Huda left feeling relieved and understood."] },
  { t: "اجتماع أولياء الأمور", lines: ["Tariq went to his daughter's school for a meeting.", "The teacher greeted him in English warmly.", "Thank you for coming. Sara is a wonderful student.", "She is very good at math but needs help with reading.", "Tariq listened carefully and took mental notes.", "What can I do at home to help her, he asked.", "Read with her for fifteen minutes every night.", "That sounds simple enough, Tariq said.", "He felt proud that he understood the whole conversation.", "On the way home, he started planning their reading time."] },
  { t: "التسوق أونلاين", lines: ["Mona wanted to buy a laptop from an international store.", "She compared prices and read reviews in English.", "This one has great battery life, one review said.", "She added it to her cart and went to checkout.", "The website asked for her shipping address.", "She typed everything carefully in English.", "A chat window popped up asking if she needed help.", "Yes, does this ship to Saudi Arabia, she typed.", "The agent confirmed and gave her a tracking number.", "The laptop arrived in perfect condition a week later."] },
  { t: "مقابلة العمل", lines: ["Ahmed prepared carefully for his interview.", "He reviewed the company website and recent news.", "Tell me about yourself, the interviewer began.", "Ahmed spoke about his ten years of experience.", "He mentioned specific projects he was proud of.", "The interviewer was impressed by his preparation.", "What motivates you in your career, she asked.", "Solving problems and helping my team grow, he said.", "Both sides felt the interview went very well.", "Ahmed received an offer the following week."] },
  { t: "في المطعم", lines: ["Salma and her husband went to a nice restaurant.", "Good evening. A table for two, please, she said.", "The waiter brought the menu and explained the specials.", "Tonight we have grilled salmon with lemon sauce.", "That sounds delicious. I will have that, Salma said.", "Her husband ordered a steak, medium well.", "They enjoyed their meal and had a great conversation.", "Could we have the dessert menu, please, she asked.", "They shared a chocolate cake and drank coffee.", "The evening was perfect from start to finish."] },
  { t: "الجار الجديد", lines: ["A new family moved in next door to Youssef.", "He decided to welcome them with a friendly visit.", "Hi, I am Youssef. Welcome to the neighborhood.", "The neighbor smiled and introduced his family.", "We just moved from Canada, the neighbor explained.", "If you need anything, please do not hesitate to ask.", "They talked about the best schools and grocery stores.", "Youssef recommended his favorite local restaurant.", "They exchanged phone numbers before saying goodbye.", "A simple conversation turned into a real friendship."] },
  { t: "أول يوم في الدورة", lines: ["Layla signed up for an online photography course.", "The instructor spoke English with a British accent.", "Welcome everyone. Let me introduce myself first.", "She took notes in English for the first time.", "Today we will learn about lighting and composition.", "The instructor showed examples and asked for opinions.", "Layla typed in the chat, I think the second photo is better.", "Great observation, the instructor replied.", "She felt a rush of confidence after being noticed.", "By the end of the class, she had learned ten new words."] },
];
export const PROMPTS = [
  { en: "Describe your favorite place to visit", ar: "وصف مكانك المفضل", starters: ["My favorite place is...", "I usually go there when...", "What I love about it is...", "The last time I visited, I...", "I would recommend it because..."] },
  { en: "Talk about a meal you love to cook", ar: "أكلة تحب تسويها", starters: ["One of my favorite dishes is...", "To make it, you need...", "First, you start by...", "The secret ingredient is...", "I learned this recipe from..."] },
  { en: "Explain something you learned recently", ar: "شيء تعلمته مؤخراً", starters: ["Recently, I learned about...", "What surprised me was...", "The most interesting part is...", "I learned it by...", "I want to learn more about..."] },
  { en: "Describe your ideal weekend", ar: "وصف نهاية أسبوع مثالية", starters: ["My perfect weekend starts with...", "In the morning, I like to...", "For lunch, I usually...", "In the afternoon, I enjoy...", "By the evening, I feel..."] },
  { en: "Talk about a trip you took", ar: "رحلة سويتها", starters: ["A few years ago, I traveled to...", "The best part of the trip was...", "I tried... for the first time.", "One funny thing that happened was...", "I would go back because..."] },
  { en: "Describe a person who influenced you", ar: "شخص أثّر فيك", starters: ["Someone who really influenced me is...", "I met this person when...", "What I admire about them is...", "They taught me that...", "Because of them, I now..."] },
  { en: "Explain your job to a stranger", ar: "اشرح وظيفتك لشخص غريب", starters: ["I work in the field of...", "Basically, what I do is...", "A typical day looks like...", "The best part about my job is...", "The most challenging thing is..."] },
  { en: "Talk about a goal for this year", ar: "هدف تبي تأكّده هالسنة", starters: ["One of my goals this year is...", "The reason I chose this goal is...", "To achieve it, I need to...", "So far, I have...", "By the end of the year, I hope to..."] },
  { en: "Describe how you spend your evenings", ar: "كيف تقضي أمسياتك", starters: ["After a long day, I usually...", "Sometimes I like to...", "My family and I often...", "If I have free time, I...", "Before I sleep, I always..."] },
  { en: "Talk about a hobby or skill you enjoy", ar: "هواية أو مهارة تستمتع فيها", starters: ["I've been doing... for about...", "I got into it because...", "What I enjoy most about it is...", "It has taught me...", "I would recommend it to anyone who..."] },
  { en: "Describe a challenge you overcame", ar: "تحدي تغلبت عليه", starters: ["A few years ago, I faced...", "The hardest part was...", "I tried to solve it by...", "What helped me the most was...", "Looking back, I learned that..."] },
  { en: "Talk about what makes a good friend", ar: "صفات الصديق الجيد", starters: ["In my opinion, a good friend is someone who...", "One important quality is...", "For example, my best friend...", "I also believe that...", "The best friendships I've seen..."] },
];
export const PHRASES = [
  { cat: "التعارف والمجاملات", icon: "٦", items: [
    { en: "Nice to meet you. Where are you from?", ar: "تشرفنا. من وين أنت؟" },
    { en: "I've heard great things about you.", ar: "سمعت عنك أشياء حلوة." },
    { en: "How long have you been living here?", ar: "من متى وأنت ساكن هنا؟" },
    { en: "What do you do for a living?", ar: "وش شغلك؟ (سؤال مهذب)" },
    { en: "It was really nice talking to you.", ar: "كان ممتع إني أتكلم معك." },
  ]},
  { cat: "السفر والمطار", icon: "٧", items: [
    { en: "Excuse me, where is gate number seven?", ar: "لو سمحت، وين بوابة رقم ٧؟" },
    { en: "I'd like to check in for my flight, please.", ar: "أبي أسوي تشيك إن لرحلتي." },
    { en: "Is there a direct flight or do I have a layover?", ar: "في رحلة مباشرة أو عندي توقف؟" },
    { en: "Could you help me find my connecting flight?", ar: "تقدر تساعدني ألاقي رحلتي المتصلة؟" },
    { en: "My luggage didn't arrive. Where can I report this?", ar: "شنطتي ما وصلت. وين أبلّغ؟" },
  ]},
  { cat: "المطاعم والطلبات", icon: "١", items: [
    { en: "A table for two, please.", ar: "طاولة لشخصين، لو سمحت." },
    { en: "What do you recommend from the menu?", ar: "وش تنصح من القائمة؟" },
    { en: "I'm allergic to nuts. Does this contain any?", ar: "عندي حساسية مكسرات. هل فيها؟" },
    { en: "Could we have the bill, please?", ar: "ممكن الحساب لو سمحت؟" },
    { en: "The food was excellent. Thank you.", ar: "الأكل كان ممتاز. شكراً لك." },
  ]},
  { cat: "المواعيد والاتصالات", icon: "١٠", items: [
    { en: "I'd like to make an appointment, please.", ar: "أبي أحجز موعد لو سمحت." },
    { en: "Is it possible to reschedule to next week?", ar: "ممكن أأجّل الموعد للأسبوع الجاي؟" },
    { en: "I'm calling to follow up on my request.", ar: "أتصل أتابع طلبي." },
    { en: "Could you transfer me to the right department?", ar: "ممكن تحوّلني للقسم المختص؟" },
    { en: "Thank you for your help. Have a nice day.", ar: "شكراً على مساعدتك. يوم سعيد." },
  ]},
  { cat: "إبداء الرأي والنقاش", icon: "٢٥", items: [
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
export const MOTIV = [
  "تخيّل نفسك ترد على الأجنبي بثقة بدون تفكير — تمرّن على جملتين اليوم وبتكون أقرب",
  "المشكلة مو ذكاءك — المشكلة كانت الطريقة. هالبرنامج مبني على أبحاث اكتساب اللغة الحقيقية",
  "٥ دقائق اليوم = جملة جديدة تطلع منك تلقائياً لما تحتاجها في الحياة الحقيقية",
  "الجمل الجاهزة = سلاحك السري. في المطعم، الفندق، المطار — جاهز لأي موقف",
  "لا تترجم في راسك — ردّد الجملة الإنجليزية مباشرة. عقلك يبني مسار جديد كل مرة",
  "بعد ٤ أسابيع: تطلب في المطعم، تحجز بالفندق، تتكلم مع جيرانك — كله بثقة",
  "كل مرة تتكلم لوحدك بالإنجليزي، لسانك يتعوّد ويصير أسرع. الحرج يختفي بالتكرار",
  "آخر مرة تمرّنت؟ اليوم تكمل السلسلة. حتى ٥ دقائق تسوي فرق",
];

export const CONVERSATIONS = [
  { title: "في الفندق", icon: "٣", steps: [
    { speaker: "موظف الاستقبال", text: "Good evening. Welcome to our hotel. Do you have a reservation?", prompt: "أكّد حجزك", opts: ["Yes, I have a reservation under the name Al-Rashid.", "I think I booked something online recently.", "I'm here to stay at the hotel."], ans: 0 },
    { speaker: "موظف الاستقبال", text: "I found it. A double room for three nights. Could I see your ID?", prompt: "أعطِ معلوماتك", opts: ["Of course. Here's my passport. Is breakfast included?", "Sure, let me look for it in my bag.", "Yes, here you go."], ans: 0 },
    { speaker: "موظف الاستقبال", text: "Breakfast is from 7 to 10. Your room is on the fifth floor.", prompt: "اسأل عن الخدمات", opts: ["Great. Is there a gym and pool available for guests?", "That sounds fine. Thank you.", "OK, I'll find it."], ans: 0 },
    { speaker: "موظف الاستقبال", text: "Yes, both are on the second floor. Open until 10 PM.", prompt: "اطلب شيء إضافي", opts: ["Perfect. Could I also get some extra towels sent to the room?", "That's nice to know. Thank you.", "I'll check them out later."], ans: 0 },
    { speaker: "موظف الاستقبال", text: "Absolutely. Is there anything else I can help you with?", prompt: "اشكره واختم", opts: ["That's everything. Thank you so much for your help.", "No, I think that's all for now.", "I'm fine, thanks."], ans: 0 },
  ]},
  { title: "عند الطبيب", icon: "٢", steps: [
    { speaker: "الطبيب", text: "Good morning. What brings you in today?", prompt: "اشرح أعراضك", opts: ["I've been having a persistent headache for the past three days, along with some fatigue.", "My head hurts and I feel tired.", "I haven't been feeling well lately."], ans: 0 },
    { speaker: "الطبيب", text: "I see. Have you experienced any other symptoms like fever or nausea?", prompt: "أجب بتفصيل", opts: ["No fever, but I've noticed some mild dizziness, especially in the morning.", "I don't think so. Maybe a little.", "Not really, just the headache."], ans: 0 },
    { speaker: "الطبيب", text: "Have you been under a lot of stress recently? Any changes in sleep?", prompt: "اشرح وضعك", opts: ["Yes, actually. I've been sleeping less than usual and my schedule has been very hectic.", "Kind of. I've been busy with a lot of things.", "Maybe a little stressed, nothing major."], ans: 0 },
    { speaker: "الطبيب", text: "I'd recommend some blood tests just to be safe. I'll also prescribe something for the headache.", prompt: "اسأل عن العلاج", opts: ["That sounds good. How often should I take the medication, and are there any side effects?", "OK, I'll do the blood tests. Thank you.", "Sure, whatever you recommend."], ans: 0 },
    { speaker: "الطبيب", text: "Take it twice daily with food. Come back in a week if it doesn't improve.", prompt: "اشكره وأكّد", opts: ["Thank you, doctor. I'll follow your advice and schedule a follow-up if needed.", "OK, I'll come back if it doesn't get better.", "Thanks for seeing me today."], ans: 0 },
  ]},
  { title: "اجتماع أولياء أمور", icon: "٤", steps: [
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
  { title: "مكالمة خدمة العملاء", icon: "٥", steps: [
    { speaker: "موظف الخدمة", text: "Thank you for calling. How can I help you today?", prompt: "اشرح مشكلتك", opts: ["Hi, I placed an order last week and it still hasn't arrived. My order number is five-seven-three.", "I have a problem with my order.", "My order is late."], ans: 0 },
    { speaker: "موظف الخدمة", text: "I'm sorry about that. Let me check the status for you. One moment please.", prompt: "انتظر بأدب", opts: ["Of course, take your time. I appreciate you looking into this.", "Sure, no problem.", "OK, I'll wait."], ans: 0 },
    { speaker: "موظف الخدمة", text: "It looks like the package was delayed due to a shipping issue. It should arrive by Thursday.", prompt: "اسأل عن التعويض", opts: ["I understand. Since it's significantly late, is there any compensation you can offer?", "OK, as long as it arrives by Thursday.", "That's fine then."], ans: 0 },
    { speaker: "موظف الخدمة", text: "I can offer you free shipping on your next order. Would that work?", prompt: "وافق واطلب تأكيد", opts: ["That would be great. Could you send me a confirmation email with the details?", "Sure, that's fine. Thank you.", "OK, I'll accept that."], ans: 0 },
    { speaker: "موظف الخدمة", text: "Absolutely. Is there anything else I can help you with?", prompt: "اشكره واختم", opts: ["No, that's everything. Thank you for resolving this so quickly.", "No, that's all. Thanks.", "I'm good. Bye."], ans: 0 },
  ]},
];

export const QUICK_RESP = [
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

export const QUIZ_BANK = [
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

export const CEFR_LEVELS = [
  { code: "A1", name: "مبتدئ", nameEn: "Beginner", color: "var(--c-error)", desc: "تعرف كلمات وجمل بسيطة جداً. تقدر تعرّف نفسك وتسأل أسئلة أساسية.", tip: "ركّز على حفظ الجمل الأساسية والمفردات اليومية. ابدأ بتمارين الظل مع الجمل القصيرة." },
  { code: "A2", name: "ما قبل المتوسط", nameEn: "Elementary", color: "var(--c-warn)", desc: "تفهم جمل متكررة في مواضيع يومية. تقدر تتواصل في مواقف بسيطة ومباشرة.", tip: "وسّع مفرداتك وركّز على تركيب جمل بسيطة. استخدم تمرين 'تفكير بصوت عالٍ' يومياً." },
  { code: "B1", name: "متوسط", nameEn: "Intermediate", color: "var(--c-accent)", desc: "تفهم النقاط الرئيسية في محادثات واضحة. تقدر تتعامل مع أغلب المواقف اليومية.", tip: "ابدأ بالمحادثات التفاعلية وركّز على ربط الأفكار. تمرّن على الجمل الجاهزة لمواقف الحياة." },
  { code: "B2", name: "فوق المتوسط", nameEn: "Upper-Intermediate", color: "var(--c-accent)", desc: "تفهم أفكار معقدة وتقدر تتفاعل بطلاقة مع متحدثين أصليين بدون جهد كبير.", tip: "ركّز على الدقة في التعبير والمصطلحات المتخصصة. تمرّن على العروض التقديمية والتفاوض." },
  { code: "C1", name: "متقدم", nameEn: "Advanced", color: "var(--c-accent)", desc: "تفهم نصوص طويلة ومعقدة وتقدر تعبّر عن نفسك بطلاقة وعفوية في أي موقف مهني.", tip: "ركّز على الفروق الدقيقة في اللغة والتعابير الاصطلاحية. تمرّن على المحادثات المتقدمة." },
  { code: "C2", name: "إتقان", nameEn: "Mastery", color: "var(--c-success)", desc: "تفهم كل شيء تقريباً وتقدر تعبّر بدقة عالية حتى في المواقف الأكثر تعقيداً.", tip: "حافظ على مستواك بالممارسة المستمرة. ركّز على الأسلوب والبلاغة في التواصل المهني." },
];

export const LEVEL_TEST = [
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

export const LEVEL_IDX = { A1: 0, A2: 1, B1: 2, B2: 3, C1: 4, C2: 5 };
export const TYPE_LABELS = { grammar: "قواعد", vocab: "مفردات", reading: "فهم القراءة", pragmatics: "تواصل", listening: "استماع" };
export const TYPE_ICONS = { grammar: "⌘", vocab: "V", reading: "R", pragmatics: "P", listening: "L" };

export const LISTEN_ITEMS = [
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
export const DICTATION_ITEMS = [
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

export const DAILY_SCENARIOS = [
  { title: "في المطعم", icon: "١", dialogue: [
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

  { title: "عند الدكتور", icon: "٢", dialogue: [
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

  { title: "في الفندق", icon: "٣", dialogue: [
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

  { title: "اجتماع أولياء أمور", icon: "٤", dialogue: [
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

  { title: "مكالمة خدمة العملاء", icon: "٥", dialogue: [
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

  { title: "التعارف مع شخص جديد", icon: "٦", dialogue: [
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

  { title: "في المطار", icon: "٧", dialogue: [
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

  { title: "في الصيدلية", icon: "٨", dialogue: [
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

  { title: "في السوبرماركت", icon: "٩", dialogue: [
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

  { title: "حجز موعد بالتلفون", icon: "١٠", dialogue: [
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

  { title: "طلب توصيل أونلاين", icon: "١١", dialogue: [
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

  { title: "في البنك", icon: "١٢", dialogue: [
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

  { title: "استئجار سيارة", icon: "١٣", dialogue: [
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

  { title: "شكوى في الفندق", icon: "١٤", dialogue: [
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

  { title: "اشتراك نادي رياضي", icon: "", dialogue: [
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

  { title: "مقابلة عمل", icon: "١٦", dialogue: [
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

  { title: "عند الكهربائي/السباك", icon: "١٤", dialogue: [
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
  { title: "في محل الجوالات", icon: "٥", dialogue: [{ speaker: "البائع", text: "Welcome! Looking for anything specific today?" }, { speaker: "أنت", text: "Yes, I'm looking for a new phone with a good camera." }, { speaker: "البائع", text: "I'd recommend this model. It has a great camera and battery." }, { speaker: "أنت", text: "How much storage does it have?" }, { speaker: "البائع", text: "128 or 256 gigabytes." }, { speaker: "أنت", text: "I'll take the 256. Does it come with a warranty?" }, { speaker: "البائع", text: "Yes, two years included." }], keyPhrases: [{ en: "I'm looking for a new phone with a good camera.", ar: "أدوّر جوال جديد كاميرته حلوة." }, { en: "How much storage does it have?", ar: "كم مساحة التخزين؟" }, { en: "Does it come with a warranty?", ar: "يجي معاه ضمان؟" }], producePrompt: "تبي تشتري جوال جديد. اسأل:", produceModel: "I'm looking for a new smartphone with a good camera and at least 256GB. What do you recommend?", noticingTips: ["\"I'm looking for\" = أفضل بداية للتسوق", "\"Does it come with\" = سؤال ذكي عن المُضاف", "تحديد المواصفات مباشرة = يوفر وقت"], challenge: "اليوم: اقرأ مواصفات جوالك بالإنجليزي." },

  { title: "في البريد", icon: "📮", dialogue: [{ speaker: "الموظف", text: "How can I help you?" }, { speaker: "أنت", text: "I'd like to send this package to London, please." }, { speaker: "الموظف", text: "Standard or express?" }, { speaker: "أنت", text: "How long does express take?" }, { speaker: "الموظف", text: "Three to five business days." }, { speaker: "أنت", text: "Express, please. I need it there by next week." }, { speaker: "الموظف", text: "Forty-five dollars. Would you like tracking?" }], keyPhrases: [{ en: "I'd like to send this package to London.", ar: "أبي أرسل هالطرد للندن." }, { en: "How long does express take?", ar: "كم يأخذ الإكسبرس؟" }, { en: "Would you like tracking?", ar: "تبي رقم تتبع؟" }], producePrompt: "تبي ترسل طرد لخارج البلد:", produceModel: "I'd like to send this package to London via express. How long will it take and how much does it cost? I'd also like tracking.", noticingTips: ["\"via express\" = طريقة أنيقة لتحديد الشحن", "\"business days\" = أيام عمل (بدون ويكند)", "طلب tracking = تفكير عملي"], challenge: "اليوم: تتبع أي شحنة واقرأ حالتها بالإنجليزي." },

  { title: "تسجيل دورة أونلاين", icon: "💻", dialogue: [{ speaker: "الموقع", text: "Ready to start learning?" }, { speaker: "أنت", text: "I'd like to sign up for the digital marketing course." }, { speaker: "الموقع", text: "Self-paced or live?" }, { speaker: "أنت", text: "What's the difference in price?" }, { speaker: "الموقع", text: "Self-paced is ninety-nine. Live is one-ninety-nine with weekly sessions." }, { speaker: "أنت", text: "I'll go with self-paced. I have a busy schedule." }, { speaker: "الموقع", text: "You'll have lifetime access to all materials." }], keyPhrases: [{ en: "I'd like to sign up for the course.", ar: "أبي أسجّل في الدورة." }, { en: "What's the difference in price?", ar: "وش الفرق بالسعر؟" }, { en: "I have a busy schedule.", ar: "جدولي مزدحم." }], producePrompt: "تبي تسجّل في دورة أونلاين:", produceModel: "I'm interested in the photography course. What's the difference between self-paced and live? I have a busy schedule, so flexibility is important.", noticingTips: ["\"sign up for\" = التسجيل في شيء", "\"What's the difference\" = سؤال مقارنة مهم", "ذكر السبب = يساعد في الاختيار"], challenge: "اليوم: ادخل منصة تعليمية واقرأ وصف دورة بالإنجليزي." },

  { title: "طلب إجازة من العمل", icon: "🏖️", dialogue: [{ speaker: "المدير", text: "You wanted to see me?" }, { speaker: "أنت", text: "Yes, I'd like to request some time off next month." }, { speaker: "المدير", text: "How many days?" }, { speaker: "أنت", text: "A week, from the fifteenth to the twenty-second." }, { speaker: "المدير", text: "That should be fine. Reachable for emergencies?" }, { speaker: "أنت", text: "I'll have my phone. Email for non-urgent matters." }, { speaker: "المدير", text: "Submit the request and I'll approve it." }], keyPhrases: [{ en: "I'd like to request some time off.", ar: "أبي أطلب إجازة." }, { en: "From the fifteenth to the twenty-second.", ar: "من ١٥ إلى ٢٢." }, { en: "I'd prefer email for non-urgent matters.", ar: "أفضّل الإيميل للأمور غير العاجلة." }], producePrompt: "تبي تطلب إجازة من مديرك:", produceModel: "I'd like to request a week off next month. I'll make sure all my tasks are completed before I leave.", noticingTips: ["\"request time off\" = طلب إجازة رسمياً", "تحديد التواريخ بدقة = احترافية", "ذكر خطة التغطية = مسؤولية"], challenge: "اليوم: اكتب إيميل قصير بالإنجليزي." },

  { title: "التعريف بنفسك في مناسبة", icon: "١٥", dialogue: [{ speaker: "شخص", text: "Hi! I don't think we've met." }, { speaker: "أنت", text: "Nice to meet you! I'm Khalid." }, { speaker: "شخص", text: "What do you do?" }, { speaker: "أنت", text: "I work in finance. I manage investments." }, { speaker: "شخص", text: "How long have you been doing that?" }, { speaker: "أنت", text: "About eight years. I enjoy the analytical side." }, { speaker: "شخص", text: "We should exchange contacts!" }], keyPhrases: [{ en: "I work in finance. I manage investments.", ar: "أشتغل في المالية. أدير استثمارات." }, { en: "I enjoy the analytical side of it.", ar: "أستمتع بالجانب التحليلي." }, { en: "We should exchange contacts!", ar: "لازم نتبادل أرقام!" }], producePrompt: "شخص جديد يسألك عن نفسك:", produceModel: "I'm Khalid. I work in engineering — about ten years. I'm passionate about renewable energy. What about you?", noticingTips: ["اسم → مجال → خبرة → شغف = بناء طبيعي", "\"I'm passionate about\" = تعبير قوي عن الاهتمام", "\"What about you?\" = تحوّل المحادثة لحوار"], challenge: "اليوم: حضّر تعريف عن نفسك من 4 جمل وقله بصوت عالٍ." },

  { title: "في محطة القطار", icon: "🚂", dialogue: [{ speaker: "الموظف", text: "Where would you like to go?" }, { speaker: "أنت", text: "One ticket to Manchester, please." }, { speaker: "الموظف", text: "Single or return?" }, { speaker: "أنت", text: "Return. What time is the next train?" }, { speaker: "الموظف", text: "Ten fifteen from platform four." }, { speaker: "أنت", text: "Do I need to reserve a seat?" }, { speaker: "الموظف", text: "Recommended during peak hours." }], keyPhrases: [{ en: "One ticket to Manchester, please.", ar: "تذكرة واحدة لمانشستر." }, { en: "Single or return?", ar: "ذهاب أو ذهاب وإياب؟" }, { en: "Do I need to reserve a seat?", ar: "لازم أحجز مقعد؟" }], producePrompt: "تبي تشتري تذكرة قطار:", produceModel: "I'd like a return ticket to Edinburgh. What time is the next train, and which platform?", noticingTips: ["\"single\" = ذهاب / \"return\" = ذهاب وإياب", "\"platform\" = رصيف القطار", "\"peak hours\" = ساعات الذروة"], challenge: "اليوم: تعلّم ٣ مصطلحات مواصلات بالإنجليزي." },

  { title: "شكوى على خدمة إنترنت", icon: "٢٦", dialogue: [{ speaker: "الموظف", text: "How can I assist you?" }, { speaker: "أنت", text: "My internet has been very slow for the past week." }, { speaker: "الموظف", text: "Let me check your account." }, { speaker: "أنت", text: "I'm paying for 100 megabits but only getting 20." }, { speaker: "الموظف", text: "There might be an issue in your area. We'll send a technician." }, { speaker: "أنت", text: "When? And will I get a credit for the downtime?" }, { speaker: "الموظف", text: "Tomorrow. I'll apply a credit to your bill." }], keyPhrases: [{ en: "My internet has been very slow for the past week.", ar: "النت بطيء من أسبوع." }, { en: "I'm paying for 100 megabits but only getting 20.", ar: "أدفع ١٠٠ ميقا وما أحصل إلا ٢٠." }, { en: "Will I get a credit for the downtime?", ar: "بتعوّضوني؟" }], producePrompt: "النت بطيء من أسبوع. اتصل بالشركة:", produceModel: "My internet has been extremely slow for a week. I'm paying for 100 megabits but only getting 20. Can you send a technician and credit my account?", noticingTips: ["المقارنة (paying for X but getting Y) = شكوى قوية", "\"credit\" = تعويض/خصم على الفاتورة", "\"downtime\" = فترة الانقطاع"], challenge: "اليوم: اقرأ فاتورة بالإنجليزي وافهم البنود." },

  { title: "في العيادة البصرية", icon: "👓", dialogue: [{ speaker: "الطبيب", text: "When was your last eye exam?" }, { speaker: "أنت", text: "Two years ago. I'm having trouble seeing far away." }, { speaker: "الطبيب", text: "Can you read the third line?" }, { speaker: "أنت", text: "The first two letters, but the rest is blurry." }, { speaker: "الطبيب", text: "You need a new prescription. Glasses or contacts?" }, { speaker: "أنت", text: "Glasses, please. Any frame recommendations?" }, { speaker: "الطبيب", text: "Let me show you some options." }], keyPhrases: [{ en: "I'm having trouble seeing things far away.", ar: "أشوف البعيد بصعوبة." }, { en: "The rest is blurry.", ar: "الباقي ضبابي." }, { en: "Would you like glasses or contacts?", ar: "تبي نظارات أو عدسات؟" }], producePrompt: "رحت عيادة العيون. اشرح مشكلتك:", produceModel: "I've been having trouble seeing far away, especially when driving at night. I think I need a new prescription.", noticingTips: ["\"blurry\" = ضبابي — كلمة طبية يومية", "\"prescription\" = وصفة — للنظارات والأدوية", "\"I've been having trouble\" + ing = مشكلة مستمرة"], challenge: "اليوم: تعلم ٣ كلمات طبية جديدة بالإنجليزي." },

  { title: "شراء تذاكر سينما", icon: "🎬", dialogue: [{ speaker: "الموظف", text: "What movie would you like to see?" }, { speaker: "أنت", text: "Two tickets for the seven o'clock showing." }, { speaker: "الموظف", text: "Regular or IMAX?" }, { speaker: "أنت", text: "IMAX. Any seats in the middle?" }, { speaker: "الموظف", text: "Row G, seats 8 and 9." }, { speaker: "أنت", text: "I'll take those. And a large popcorn." }, { speaker: "الموظف", text: "Thirty-eight dollars total." }], keyPhrases: [{ en: "Two tickets for the seven o'clock showing.", ar: "تذكرتين لعرض الساعة ٧." }, { en: "Any seats in the middle?", ar: "في مقاعد بالنص؟" }, { en: "I'll take those.", ar: "آخذهم." }], producePrompt: "تبي تشتري تذاكر سينما:", produceModel: "I'd like four tickets for the eight o'clock showing. Do you have seats together in the middle? And a large popcorn.", noticingTips: ["\"showing\" = عرض فيلم", "\"seats together\" = مقاعد متجاورة", "طلب الأكل مع التذاكر = طبيعي وطلاقة"], challenge: "اليوم: اقرأ أوقات عرض أي فيلم بالإنجليزي." },

  { title: "مقابلة الجيران الجدد", icon: "🏡", dialogue: [{ speaker: "أنت", text: "Hi! We just moved in next door." }, { speaker: "الجار", text: "Welcome! I'm Mark. How are you settling in?" }, { speaker: "أنت", text: "Pretty well. Everyone's been friendly." }, { speaker: "الجار", text: "Where did you move from?" }, { speaker: "أنت", text: "Downtown. We wanted a quieter area for the kids." }, { speaker: "الجار", text: "There's a great park around the corner." }, { speaker: "أنت", text: "That's exactly what we were looking for!" }], keyPhrases: [{ en: "We just moved in next door.", ar: "توّنا انتقلنا بالبيت الجنب." }, { en: "How are you settling in?", ar: "كيف التأقلم؟" }, { en: "We wanted a quieter area for the kids.", ar: "نبي منطقة أهدأ للأطفال." }], producePrompt: "جيرانك الجدد يسلّمون عليك:", produceModel: "Hi! We just moved in last week. I'm Khalid. We wanted a quieter neighborhood for the kids. How long have you been here?", noticingTips: ["\"settle in\" = تتأقلم — تعبير شائع", "ذكر سبب الانتقال = يفتح محادثة", "السؤال بالنهاية = يحوّل لحوار"], challenge: "اليوم: فكّر كيف تصف حيّك بـ ٣ جمل إنجليزية." },

  { title: "تحويل أموال", icon: "💸", dialogue: [{ speaker: "الموظف", text: "How can I help?" }, { speaker: "أنت", text: "I'd like to make an international transfer." }, { speaker: "الموظف", text: "Which country?" }, { speaker: "أنت", text: "The UK. Three thousand pounds." }, { speaker: "الموظف", text: "The rate is 4.7 riyals per pound." }, { speaker: "أنت", text: "How long will it take?" }, { speaker: "الموظف", text: "One to two business days." }], keyPhrases: [{ en: "I'd like to make an international transfer.", ar: "أبي حوالة دولية." }, { en: "The exchange rate is 4.7 per pound.", ar: "سعر الصرف ٤.٧ للباوند." }, { en: "How long will it take to arrive?", ar: "كم يأخذ توصل؟" }], producePrompt: "تبي تحوّل فلوس لخارج:", produceModel: "I'd like to make an international transfer to the UK. Three thousand pounds. What's the exchange rate, and how long will it take?", noticingTips: ["\"international transfer\" = تحويل دولي", "\"exchange rate\" = سعر الصرف", "\"business days\" = أيام عمل"], challenge: "اليوم: اعرف سعر صرف عملة واحدة بالإنجليزي." },

  { title: "استلام توصيل", icon: "١١", dialogue: [{ speaker: "المندوب", text: "Delivery for apartment 5B?" }, { speaker: "أنت", text: "Yes, that's me. Where do I sign?" }, { speaker: "المندوب", text: "Right here. Can I see some ID?" }, { speaker: "أنت", text: "Sure. Can I check the package first?" }, { speaker: "المندوب", text: "Of course. Take your time." }, { speaker: "أنت", text: "Everything looks good. Thank you." }, { speaker: "المندوب", text: "Have a great day!" }], keyPhrases: [{ en: "Where do I sign?", ar: "وين أوقّع؟" }, { en: "Can I check the package first?", ar: "ممكن أتأكّد أول؟" }, { en: "Everything looks good.", ar: "كل شيء تمام." }], producePrompt: "المندوب وصل وعنده طرد:", produceModel: "Yes, that's me. Before I sign, can I check the package? Everything looks good. Thank you!", noticingTips: ["\"Where do I sign?\" = سؤال بسيط مهم", "التأكّد قبل التوقيع = حقك", "\"Everything looks good\" = تأكيد طبيعي مختصر"], challenge: "اليوم: لو وصلك توصيل — قل Thank you." },

  { title: "طلب تاكسي", icon: "🚕", dialogue: [{ speaker: "أنت", text: "Could you take me to the airport, please?" }, { speaker: "السائق", text: "Sure. Which terminal?" }, { speaker: "أنت", text: "Terminal two, international departures." }, { speaker: "السائق", text: "About thirty minutes." }, { speaker: "أنت", text: "Is there much traffic now?" }, { speaker: "السائق", text: "A little, but we should make it." }, { speaker: "أنت", text: "Could you drop me off at the main entrance?" }], keyPhrases: [{ en: "Could you take me to the airport?", ar: "ممكن توصلني المطار؟" }, { en: "Is there much traffic?", ar: "في زحمة؟" }, { en: "Could you drop me off at the main entrance?", ar: "ممكن تنزلني عند المدخل الرئيسي؟" }], producePrompt: "ركبت تاكسي:", produceModel: "Could you take me to the Hilton Hotel on King Street? How long will it take?", noticingTips: ["\"Could you take me to\" = طلب مهذب للوجهة", "\"drop me off at\" = نزّلني عند", "السؤال عن الوقت = محادثة طبيعية"], challenge: "اليوم: فكّر كيف توصف وجهتك بالإنجليزي." },
  // ========== BLOCK 3: SOCIAL & RELATIONSHIPS (Weeks 5-6) ==========
  { title: "دعوة صديق للعشاء", icon: "🍷", dialogue: [{ speaker: "أنت", text: "Hey! Are you free this Friday evening?" }, { speaker: "الصديق", text: "I think so. What do you have in mind?" }, { speaker: "أنت", text: "I'd love to have you over for dinner. We're grilling." }, { speaker: "الصديق", text: "That sounds great! What time should I come?" }, { speaker: "أنت", text: "Around seven. Feel free to bring your family." }, { speaker: "الصديق", text: "Can I bring anything?" }, { speaker: "أنت", text: "That would be lovely. See you Friday!" }], keyPhrases: [{ en: "Are you free this Friday evening?", ar: "فاضي يوم الجمعة؟" }, { en: "I'd love to have you over for dinner.", ar: "يسعدني تتعشى عندنا." }, { en: "Feel free to bring your family.", ar: "جيب عائلتك براحتك." }], producePrompt: "ادعو صديقك للعشاء:", produceModel: "Are you free this Saturday? I'd love to have you and your family over for dinner around seven.", noticingTips: ["\"I'd love to have you over\" = دعوة دافئة", "\"Feel free to\" = تعبير كرم"], challenge: "اليوم: ادعُ شخص لشيء بسيط." },
  { title: "تهنئة بمولود", icon: "👶", dialogue: [{ speaker: "أنت", text: "Congratulations! I heard the wonderful news!" }, { speaker: "الصديق", text: "Thank you! We're thrilled." }, { speaker: "أنت", text: "How is the baby doing?" }, { speaker: "الصديق", text: "A boy. Perfectly healthy." }, { speaker: "أنت", text: "That's amazing. What did you name him?" }, { speaker: "الصديق", text: "Adam." }, { speaker: "أنت", text: "Beautiful name. I'd love to visit when you're ready." }], keyPhrases: [{ en: "Congratulations! I heard the wonderful news!", ar: "مبروك! سمعت الخبر!" }, { en: "How is the baby doing?", ar: "كيف حال البيبي؟" }, { en: "I'd love to visit when you're ready.", ar: "أزوركم لما تكونون جاهزين." }], producePrompt: "صديقك جاه مولود. هنّئه:", produceModel: "Congratulations! I'm so happy for you. How is the baby doing? I'd love to visit and bring something for the little one.", noticingTips: ["\"I'm so happy for you\" = أقوى من مجرد Congratulations", "\"the little one\" = تعبير حنون"], challenge: "اليوم: اكتب تهنئة بالإنجليزي." },
  { title: "اعتذار عن تأخير", icon: "⏰", dialogue: [{ speaker: "أنت", text: "I'm really sorry I'm late. Traffic was terrible." }, { speaker: "الصديق", text: "No worries. These things happen." }, { speaker: "أنت", text: "I should have left earlier." }, { speaker: "الصديق", text: "Don't worry about it." }, { speaker: "أنت", text: "Thank you for being so understanding." }, { speaker: "الصديق", text: "Of course. Let's get started." }, { speaker: "أنت", text: "I really appreciate your patience." }], keyPhrases: [{ en: "I'm really sorry I'm late.", ar: "آسف جداً على التأخير." }, { en: "I should have left earlier.", ar: "كان لازم أطلع بدري." }, { en: "I appreciate your patience.", ar: "أقدّر صبرك." }], producePrompt: "تأخرت على موعد:", produceModel: "I'm so sorry for being late. Traffic was much worse than expected. I should have planned better. Thank you for waiting.", noticingTips: ["\"I should have\" = كان لازم — تعبير ندم", "\"I appreciate your patience\" = أقوى من sorry المتكررة"], challenge: "اليوم: لو تأخرت — قل I'm sorry بالإنجليزي." },
  { title: "رد على دعوة", icon: "٢٧", dialogue: [{ speaker: "المضيف", text: "We're having a gathering Saturday. Can you make it?" }, { speaker: "أنت", text: "I'd love to come! What's the occasion?" }, { speaker: "المضيف", text: "Just a casual get-together." }, { speaker: "أنت", text: "Sounds perfect. What time?" }, { speaker: "المضيف", text: "Around six." }, { speaker: "أنت", text: "Should I bring anything?" }, { speaker: "المضيف", text: "Just yourself!" }], keyPhrases: [{ en: "I'd love to come!", ar: "يسعدني أجي!" }, { en: "What's the occasion?", ar: "وش المناسبة؟" }, { en: "Should I bring anything?", ar: "أجيب شيء معي؟" }], producePrompt: "أحد دعاك. رد:", produceModel: "I'd love to come! What time should I be there, and should I bring anything?", noticingTips: ["\"I'd love to come\" = قبول حماسي", "\"Should I bring anything\" = يُظهر ذوق"], challenge: "اليوم: لو دعاك أحد — جاوب بجملة كاملة." },
  { title: "طلب نصيحة", icon: "💭", dialogue: [{ speaker: "أنت", text: "Can I ask you for some advice?" }, { speaker: "الصديق", text: "Of course! What's on your mind?" }, { speaker: "أنت", text: "I'm thinking about changing careers." }, { speaker: "الصديق", text: "That's big. What's making you consider it?" }, { speaker: "أنت", text: "I feel like I've stopped growing." }, { speaker: "الصديق", text: "Have you thought about what you'd do instead?" }, { speaker: "أنت", text: "Technology, but I'd need new skills." }], keyPhrases: [{ en: "Can I ask you for some advice?", ar: "ممكن أسألك نصيحة؟" }, { en: "I feel like I've stopped growing.", ar: "أحس إني وقفت عن التطور." }, { en: "I'd need to learn new skills.", ar: "أحتاج أتعلم مهارات جديدة." }], producePrompt: "اسأل صديقك نصيحة:", produceModel: "Can I ask your advice? I'm thinking about changing careers. I feel stuck and want to try something in technology.", noticingTips: ["\"Can I ask you for some advice\" = بداية مثالية", "\"I feel like\" = وصف مشاعر بدون مبالغة"], challenge: "اليوم: فكّر بقرار مهم — كيف تشرحه بالإنجليزي؟" },
  { title: "مجاملة والرد عليها", icon: "😊", dialogue: [{ speaker: "شخص", text: "I love your jacket! Where did you get it?" }, { speaker: "أنت", text: "Thank you! I got it from a store downtown." }, { speaker: "شخص", text: "It really suits you." }, { speaker: "أنت", text: "That's very kind of you to say." }, { speaker: "شخص", text: "I've been looking for something similar." }, { speaker: "أنت", text: "I can send you the name of the store." }, { speaker: "شخص", text: "That would be great!" }], keyPhrases: [{ en: "That's very kind of you to say.", ar: "كلامك لطيف جداً." }, { en: "It really suits you.", ar: "فعلاً يناسبك." }, { en: "I can send you the details.", ar: "أقدر أرسلك التفاصيل." }], producePrompt: "شخص مدحك. رد:", produceModel: "Thank you, that's really kind! I actually got it on sale. I can send you the link if you're interested.", noticingTips: ["\"That's kind of you\" = رد متواضع على المجاملة", "\"It suits you\" = مجاملة شائعة"], challenge: "اليوم: امدح شخص بالإنجليزي." },
  { title: "تعزية ومواساة", icon: "🤲", dialogue: [{ speaker: "أنت", text: "I was so sorry to hear about your loss." }, { speaker: "الصديق", text: "Thank you. It's been difficult." }, { speaker: "أنت", text: "Please know that I'm here for you." }, { speaker: "الصديق", text: "That means a lot." }, { speaker: "أنت", text: "Is there anything I can do?" }, { speaker: "الصديق", text: "Just having someone to talk to helps." }, { speaker: "أنت", text: "I'm always a phone call away." }], keyPhrases: [{ en: "I was sorry to hear about your loss.", ar: "تأسفت لما سمعت." }, { en: "I'm here for you.", ar: "أنا موجود لك." }, { en: "I'm always a phone call away.", ar: "اتصل عليّ بأي وقت." }], producePrompt: "صديقك فقد شخص عزيز:", produceModel: "I'm deeply sorry for your loss. Please know that I'm here for you, whatever you need.", noticingTips: ["\"I was sorry to hear\" = التعزية القياسية", "\"I'm here for you\" = دعم قوي ومختصر"], challenge: "اليوم: تعلّم 3 عبارات تعزية بالإنجليزي." },
  { title: "تقديم شخص لشخص", icon: "🫱🏼‍🫲🏽", dialogue: [{ speaker: "أنت", text: "Sarah, I'd like you to meet my friend Khalid." }, { speaker: "أنت", text: "Khalid, this is Sarah from marketing." }, { speaker: "سارة", text: "Nice to meet you!" }, { speaker: "خالد", text: "Likewise! Omar has told me great things." }, { speaker: "أنت", text: "You two have a lot in common." }, { speaker: "سارة", text: "Really? Like what?" }, { speaker: "أنت", text: "You're both into photography." }], keyPhrases: [{ en: "I'd like you to meet my friend.", ar: "أبي أعرّفك على صديقي." }, { en: "Likewise!", ar: "وأنا كذلك!" }, { en: "You have a lot in common.", ar: "بينكم أشياء مشتركة." }], producePrompt: "عرّف صديقين على بعض:", produceModel: "Hey Sarah, I'd like you to meet my colleague Ahmed. I think you two would really get along!", noticingTips: ["\"I'd like you to meet\" = تعريف رسمي", "\"Likewise\" = بديل أنيق لـ nice to meet you too"], challenge: "اليوم: فكّر كيف تعرّف شخصين بالإنجليزي." },
  { title: "شكر على هدية", icon: "🎁", dialogue: [{ speaker: "أنت", text: "This is beautiful! You really didn't have to!" }, { speaker: "الصديق", text: "I saw it and thought of you." }, { speaker: "أنت", text: "That's so thoughtful. I love it!" }, { speaker: "الصديق", text: "I'm glad you like it." }, { speaker: "أنت", text: "The craftsmanship is amazing." }, { speaker: "الصديق", text: "A small shop in the old town." }, { speaker: "أنت", text: "Thank you. This really made my day." }], keyPhrases: [{ en: "You really didn't have to!", ar: "ما كان لازم تتعب نفسك!" }, { en: "That's so thoughtful.", ar: "ذوق عالي منك." }, { en: "This made my day.", ar: "سعّدت يومي." }], producePrompt: "أحد أهداك. اشكره:", produceModel: "This is absolutely beautiful! You really didn't have to. That's so thoughtful of you!", noticingTips: ["\"You didn't have to\" = تواضع + تقدير", "\"This made my day\" = فرح حقيقي"], challenge: "اليوم: اشكر شخص بأكثر من Thank you." },
  { title: "محادثة جار عن مشكلة", icon: "🏠", dialogue: [{ speaker: "أنت", text: "Hi, sorry to bother you. Do you have a minute?" }, { speaker: "الجار", text: "Sure, what's up?" }, { speaker: "أنت", text: "I wanted to talk about the noise late at night." }, { speaker: "الجار", text: "Oh, was it too loud?" }, { speaker: "أنت", text: "After midnight it gets a bit much. The kids wake up." }, { speaker: "الجار", text: "I had no idea. I'll keep it down." }, { speaker: "أنت", text: "I appreciate that. Thanks for understanding." }], keyPhrases: [{ en: "Sorry to bother you.", ar: "آسف أزعجك." }, { en: "I wanted to talk about the noise.", ar: "بغيت أتكلم عن الإزعاج." }, { en: "Thanks for understanding.", ar: "شكراً على تفهّمك." }], producePrompt: "جارك يسوي إزعاج. تكلم بأدب:", produceModel: "Sorry to bother you. The noise after midnight has been waking the kids. Would it be possible to keep it down?", noticingTips: ["\"Sorry to bother you\" = بداية مثالية لموضوع حساس", "\"Thanks for understanding\" = إنهاء يحفظ العلاقة"], challenge: "اليوم: فكّر بموقف محرج — كيف تتعامل بالإنجليزي؟" },
  { title: "دردشة في الانتظار", icon: "٢٣", dialogue: [{ speaker: "شخص", text: "Long wait today, isn't it?" }, { speaker: "أنت", text: "Yeah, about twenty minutes already." }, { speaker: "شخص", text: "I hope it won't be much longer." }, { speaker: "أنت", text: "Me too. Are you here for a checkup?" }, { speaker: "شخص", text: "Yes, routine. You?" }, { speaker: "أنت", text: "Same. Every six months." }, { speaker: "شخص", text: "Good discipline." }], keyPhrases: [{ en: "Long wait today, isn't it?", ar: "الانتظار طويل اليوم، صح؟" }, { en: "I hope it won't be much longer.", ar: "إن شاء الله ما يطول." }, { en: "Are you here for a checkup?", ar: "جاي فحص؟" }], producePrompt: "شخص يسولفك في الانتظار:", produceModel: "Yeah, quite a wait. Are you here for a checkup too? I try to come every six months.", noticingTips: ["tag questions (isn't it?) = تفتح محادثة", "small talk = مهارة اجتماعية أساسية"], challenge: "اليوم: سولف مع أي شخص غريب — حتى بالعربي." },
  { title: "مكالمة صديق قديم", icon: "١٠", dialogue: [{ speaker: "أنت", text: "Hey! It's been ages! How have you been?" }, { speaker: "الصديق", text: "Great to hear from you! I'm doing well." }, { speaker: "أنت", text: "What are you up to these days?" }, { speaker: "الصديق", text: "Started a new job last month." }, { speaker: "أنت", text: "That's awesome! We should catch up over coffee." }, { speaker: "الصديق", text: "Absolutely! When?" }, { speaker: "أنت", text: "This weekend? My treat." }], keyPhrases: [{ en: "It's been ages!", ar: "من زمان!" }, { en: "What are you up to these days?", ar: "وش أخبارك؟" }, { en: "We should catch up. My treat.", ar: "لازم نتسولف. أنا أدفع." }], producePrompt: "تكلم صديق قديم:", produceModel: "Hey! It's been so long! How have you been? Let's catch up this weekend — my treat!", noticingTips: ["\"It's been ages\" = من زمان", "\"catch up\" = نلحّق أخبار بعض", "\"My treat\" = أنا أدفع"], challenge: "اليوم: أرسل رسالة لصديق قديم." },
  { title: "إلغاء خطة بأدب", icon: "🙏", dialogue: [{ speaker: "أنت", text: "I'm sorry, but I need to cancel tonight." }, { speaker: "الصديق", text: "Is everything okay?" }, { speaker: "أنت", text: "Yes, something came up with work." }, { speaker: "الصديق", text: "I understand." }, { speaker: "أنت", text: "Can we reschedule for next week?" }, { speaker: "الصديق", text: "Sure, that works." }, { speaker: "أنت", text: "Thanks for being flexible. I'll make it up to you." }], keyPhrases: [{ en: "Something came up.", ar: "طرأ شيء." }, { en: "Can we reschedule?", ar: "نقدر نأجّل؟" }, { en: "I'll make it up to you.", ar: "بعوّضك." }], producePrompt: "تحتاج تلغي خطة:", produceModel: "I'm really sorry, but I can't make it tonight. Something came up. Could we reschedule for next week? I'll make it up to you!", noticingTips: ["\"Something came up\" = العذر الأكثر شيوعاً", "\"I'll make it up to you\" = يحفظ العلاقة"], challenge: "اليوم: تدرّب: Something came up بصوت عالٍ." },
  { title: "شكوى لطيفة في مطعم", icon: "١", dialogue: [{ speaker: "أنت", text: "Excuse me, I think there's an issue with my order." }, { speaker: "النادل", text: "I'm sorry. What's the problem?" }, { speaker: "أنت", text: "I ordered well-done, but this seems medium." }, { speaker: "النادل", text: "Let me take it back." }, { speaker: "أنت", text: "Thank you. I appreciate it." }, { speaker: "النادل", text: "Here's the corrected order." }, { speaker: "أنت", text: "Perfect now. No worries at all." }], keyPhrases: [{ en: "I think there's an issue with my order.", ar: "أعتقد في مشكلة بطلبي." }, { en: "I ordered well-done but this seems medium.", ar: "طلبت well-done بس هذا medium." }, { en: "No worries at all.", ar: "أبداً عادي." }], producePrompt: "طلبك جا غلط. اشتكِ بأدب:", produceModel: "Excuse me, I think there's an issue. I ordered the steak well-done but this looks medium. Would you mind checking?", noticingTips: ["\"I think there might be\" = شكوى ناعمة", "\"No worries at all\" = ختام إيجابي"], challenge: "اليوم: تعلّم: rare, medium, well-done." },

  // ========== BLOCK 4: WORK & PROFESSIONAL (Weeks 7-8) ==========
  { title: "عرض تقديمي", icon: "٢٤", dialogue: [{ speaker: "أنت", text: "Good morning everyone. Thank you for joining." }, { speaker: "أنت", text: "Today I'll be presenting our quarterly results." }, { speaker: "الحضور", text: "Could you zoom in on that chart?" }, { speaker: "أنت", text: "Of course. As you can see, revenue increased by fifteen percent." }, { speaker: "الحضور", text: "What contributed to that growth?" }, { speaker: "أنت", text: "Mainly our expansion into new markets." }, { speaker: "أنت", text: "Any other questions before I move to the next slide?" }], keyPhrases: [{ en: "Thank you for joining.", ar: "شكراً لحضوركم." }, { en: "As you can see, revenue increased by fifteen percent.", ar: "كما تشوفون، الإيرادات زادت ١٥٪." }, { en: "Any questions before I move on?", ar: "أسئلة قبل ما أكمل؟" }], producePrompt: "افتح عرض تقديمي:", produceModel: "Good morning everyone. Thank you for being here. Today I'll walk you through our quarterly results. As you can see from this chart, we've seen a fifteen percent increase in revenue.", noticingTips: ["\"Thank you for joining\" = فتح احترافي", "\"As you can see\" = ربط الكلام بالعرض", "\"Before I move on\" = تحكم بالمحادثة"], challenge: "اليوم: قدّم أي فكرة بـ 3 جمل إنجليزية بصوت عالٍ." },
  { title: "طلب زيادة راتب", icon: "💰", dialogue: [{ speaker: "أنت", text: "I'd like to discuss my compensation, if you have a moment." }, { speaker: "المدير", text: "Sure. What's on your mind?" }, { speaker: "أنت", text: "I've taken on additional responsibilities this year." }, { speaker: "المدير", text: "I've noticed that. You've been doing great work." }, { speaker: "أنت", text: "I'd like to discuss a salary adjustment that reflects my contributions." }, { speaker: "المدير", text: "What figure did you have in mind?" }, { speaker: "أنت", text: "Based on my research, a fifteen percent increase would be fair." }], keyPhrases: [{ en: "I'd like to discuss my compensation.", ar: "أبي نتكلم عن راتبي." }, { en: "I've taken on additional responsibilities.", ar: "أخذت مسؤوليات إضافية." }, { en: "A fifteen percent increase would be fair.", ar: "زيادة ١٥٪ تكون عادلة." }], producePrompt: "تبي تطلب زيادة من مديرك:", produceModel: "I'd like to discuss my compensation. Over the past year, I've taken on additional responsibilities and delivered strong results. I believe a fifteen percent adjustment would be fair.", noticingTips: ["\"compensation\" أفضل من \"salary\" = أكثر احترافية", "\"salary adjustment\" أفضل من \"raise\" = دبلوماسي", "ذكر الإنجازات قبل الطلب = يقوّي موقفك"], challenge: "اليوم: اكتب ٣ إنجازات لك بالإنجليزي." },
  { title: "اجتماع مع عميل", icon: "١٥", dialogue: [{ speaker: "العميل", text: "Thanks for meeting with us today." }, { speaker: "أنت", text: "Thank you for your time. I'm excited to discuss the proposal." }, { speaker: "العميل", text: "We've reviewed it. We have some concerns about the timeline." }, { speaker: "أنت", text: "I understand. Could you be more specific about your concerns?" }, { speaker: "العميل", text: "We need delivery by March, not April." }, { speaker: "أنت", text: "That's tight but achievable if we start immediately." }, { speaker: "العميل", text: "That works. Let's move forward." }], keyPhrases: [{ en: "I'm excited to discuss the proposal.", ar: "متحمس نناقش العرض." }, { en: "Could you be more specific about your concerns?", ar: "ممكن توضّح تحفظاتك أكثر؟" }, { en: "That's tight but achievable.", ar: "ضيق لكن ممكن ننجزه." }], producePrompt: "العميل عنده تحفظات على مشروعك:", produceModel: "I understand your concerns about the timeline. If we start immediately and allocate additional resources, we can deliver by March.", noticingTips: ["\"Could you be more specific\" = طلب توضيح احترافي", "\"tight but achievable\" = واقعي وإيجابي", "تقديم حل مع الموافقة = قوة تفاوضية"], challenge: "اليوم: فكّر بمشكلة في شغلك — كيف تشرحها بالإنجليزي؟" },
  { title: "إيميل متابعة", icon: "📧", dialogue: [{ speaker: "أنت", text: "I wanted to follow up on our meeting from last week." }, { speaker: "الزميل", text: "Yes, I've been meaning to get back to you." }, { speaker: "أنت", text: "Have you had a chance to review the documents?" }, { speaker: "الزميل", text: "I have. I think we need to revise section three." }, { speaker: "أنت", text: "I agree. I'll make the changes and send an updated version by Friday." }, { speaker: "الزميل", text: "That would be great." }, { speaker: "أنت", text: "I'll copy you on the email. Let me know if you need anything else." }], keyPhrases: [{ en: "I wanted to follow up on our meeting.", ar: "بغيت أتابع بخصوص اجتماعنا." }, { en: "Have you had a chance to review?", ar: "لحقت تراجع؟" }, { en: "I'll send an updated version by Friday.", ar: "بأرسل نسخة محدّثة يوم الجمعة." }], producePrompt: "تبي تتابع بعد اجتماع:", produceModel: "I wanted to follow up on our meeting last Tuesday. Have you had a chance to review the proposal? I can make any changes and send an updated version by end of week.", noticingTips: ["\"follow up on\" = المتابعة — فعل أساسي في العمل", "\"Have you had a chance to\" = أدب في السؤال عن تقدم العمل", "\"I'll copy you\" = أنسخك في الإيميل"], challenge: "اليوم: اكتب إيميل متابعة قصير بالإنجليزي." },
  { title: "التعامل مع خلاف في العمل", icon: "⚖️", dialogue: [{ speaker: "الزميل", text: "I don't think your approach will work." }, { speaker: "أنت", text: "I appreciate your honesty. Can you help me understand your concerns?" }, { speaker: "الزميل", text: "The timeline is unrealistic and the budget is too low." }, { speaker: "أنت", text: "Those are valid points. What if we adjusted both?" }, { speaker: "الزميل", text: "I'd need to see the numbers first." }, { speaker: "أنت", text: "Fair enough. I'll prepare a revised plan by tomorrow." }, { speaker: "الزميل", text: "That sounds good. I appreciate you listening." }], keyPhrases: [{ en: "I appreciate your honesty.", ar: "أقدّر صراحتك." }, { en: "Can you help me understand your concerns?", ar: "ممكن تساعدني أفهم تحفظاتك؟" }, { en: "Those are valid points.", ar: "نقاط صحيحة." }], producePrompt: "زميلك يعارض فكرتك:", produceModel: "I appreciate your perspective. You raise valid points about the timeline. What if we explored a compromise? I'll prepare a revised plan.", noticingTips: ["\"I appreciate your honesty\" = يحوّل الخلاف لحوار", "\"valid points\" = اعتراف بالآخر = يهدّئ", "\"Fair enough\" = تقبّل مختصر ومحترف"], challenge: "اليوم: فكّر بخلاف سابق — كيف تعيد صياغته باحترافية؟" },
  { title: "مقابلة توظيف (أنت تقابل)", icon: "١٨", dialogue: [{ speaker: "أنت", text: "Thank you for coming in. Tell me about your experience." }, { speaker: "المرشح", text: "I have five years in software development." }, { speaker: "أنت", text: "What interests you about this position?" }, { speaker: "المرشح", text: "The opportunity to work on innovative projects." }, { speaker: "أنت", text: "Can you describe a challenging project you've led?" }, { speaker: "المرشح", text: "I led a team of eight on a product launch last year." }, { speaker: "أنت", text: "Impressive. We'll be in touch within a week." }], keyPhrases: [{ en: "Tell me about your experience.", ar: "كلمني عن خبرتك." }, { en: "What interests you about this position?", ar: "وش يجذبك في هالوظيفة؟" }, { en: "We'll be in touch within a week.", ar: "بنتواصل معك خلال أسبوع." }], producePrompt: "أنت تقابل مرشح وظيفة:", produceModel: "Thank you for coming. I'd like to start by hearing about your experience and what interests you about this role.", noticingTips: ["\"Tell me about\" = أشهر سؤال في المقابلات", "\"What interests you\" = أفضل من \"Why do you want\"", "\"We'll be in touch\" = إنهاء مهذب بدون وعد"], challenge: "اليوم: حضّر 3 أسئلة مقابلة بالإنجليزي." },
  { title: "تقديم فكرة لمديرك", icon: "٢٥", dialogue: [{ speaker: "أنت", text: "Do you have five minutes? I have an idea I'd like to run by you." }, { speaker: "المدير", text: "Sure, go ahead." }, { speaker: "أنت", text: "I think we could save twenty percent on costs by automating the reports." }, { speaker: "المدير", text: "Interesting. How would that work?" }, { speaker: "أنت", text: "There's a tool that generates reports automatically from our data." }, { speaker: "المدير", text: "What's the cost of implementing it?" }, { speaker: "أنت", text: "About two thousand upfront, but it pays for itself in three months." }], keyPhrases: [{ en: "I have an idea I'd like to run by you.", ar: "عندي فكرة أبي آخذ رأيك فيها." }, { en: "We could save twenty percent by automating.", ar: "نقدر نوفر ٢٠٪ بالأتمتة." }, { en: "It pays for itself in three months.", ar: "يرجع تكلفته في ٣ شهور." }], producePrompt: "عندك فكرة حلوة وتبي تقنع مديرك:", produceModel: "I have an idea I'd like to run by you. I believe we could save significant costs by automating our reporting process. The tool costs two thousand but pays for itself within three months.", noticingTips: ["\"run by you\" = آخذ رأيك — تعبير عملي شائع", "\"pays for itself\" = يغطي تكلفته — مصطلح مالي مقنع", "أرقام محددة (20%, 3 months) = تقنع أكثر من كلام عام"], challenge: "اليوم: فكّر بفكرة تحسين في شغلك — صِغها بـ 3 جمل إنجليزية." },
  { title: "اجتماع فريق أسبوعي", icon: "👥", dialogue: [{ speaker: "أنت", text: "Let's start with a quick round of updates." }, { speaker: "الزميل", text: "I finished the design phase. Ready for review." }, { speaker: "أنت", text: "Great. Any blockers we should discuss?" }, { speaker: "الزميل", text: "I'm waiting on approval from the legal team." }, { speaker: "أنت", text: "I'll follow up with them today." }, { speaker: "الزميل", text: "That would help a lot." }, { speaker: "أنت", text: "Let's wrap up. I'll send the action items by email." }], keyPhrases: [{ en: "Let's start with updates.", ar: "نبدأ بالمستجدات." }, { en: "Any blockers?", ar: "في أي عوائق؟" }, { en: "I'll send the action items by email.", ar: "بأرسل المهام بالإيميل." }], producePrompt: "تدير اجتماع فريقك:", produceModel: "Let's go around for quick updates. Any blockers we need to address? I'll follow up on the pending items and send a summary by end of day.", noticingTips: ["\"blockers\" = عوائق — مصطلح شائع في الاجتماعات", "\"action items\" = المهام المطلوبة — أساسي", "\"wrap up\" = نختم — أنيق ومختصر"], challenge: "اليوم: لخّص يومك بـ 3 جمل إنجليزية." },
  { title: "طلب تمديد موعد", icon: "📅", dialogue: [{ speaker: "أنت", text: "I need to discuss the project deadline with you." }, { speaker: "المدير", text: "What's the situation?" }, { speaker: "أنت", text: "We've encountered some unexpected technical issues." }, { speaker: "المدير", text: "How much additional time do you need?" }, { speaker: "أنت", text: "I'd say about one extra week would be sufficient." }, { speaker: "المدير", text: "Can you guarantee delivery by then?" }, { speaker: "أنت", text: "Yes, I'm confident we can deliver with high quality." }], keyPhrases: [{ en: "We've encountered unexpected issues.", ar: "واجهنا مشاكل غير متوقعة." }, { en: "One extra week would be sufficient.", ar: "أسبوع إضافي يكفي." }, { en: "I'm confident we can deliver.", ar: "واثق إننا نقدر نسلّم." }], producePrompt: "تحتاج وقت إضافي للمشروع:", produceModel: "I need to discuss the timeline. We've encountered some unexpected issues. I'd like to request one additional week. I'm confident we'll deliver high quality.", noticingTips: ["\"encountered\" أفضل من \"had\" = أكثر احترافية", "\"sufficient\" أفضل من \"enough\" = رسمي أكثر", "ختام بثقة (I'm confident) = يطمئن المدير"], challenge: "اليوم: فكّر بموقف طلبت فيه وقت إضافي — كيف بالإنجليزي؟" },
  { title: "تفاوض على عقد", icon: "٢٨", dialogue: [{ speaker: "الطرف الآخر", text: "We'd like to propose a two-year contract." }, { speaker: "أنت", text: "I'm open to that. What are the key terms?" }, { speaker: "الطرف الآخر", text: "Fixed pricing with annual reviews." }, { speaker: "أنت", text: "Could we include a performance bonus clause?" }, { speaker: "الطرف الآخر", text: "We'd need to discuss the metrics." }, { speaker: "أنت", text: "I suggest we tie it to customer satisfaction scores." }, { speaker: "الطرف الآخر", text: "That's reasonable. Let's draft it up." }], keyPhrases: [{ en: "What are the key terms?", ar: "وش الشروط الرئيسية؟" }, { en: "Could we include a performance bonus?", ar: "ممكن نضيف مكافأة أداء؟" }, { en: "Let's draft it up.", ar: "نكتب المسودة." }], producePrompt: "تتفاوض على عقد:", produceModel: "I'm open to a two-year contract. Could we include a performance-based bonus clause? I suggest tying it to measurable outcomes.", noticingTips: ["\"I'm open to\" = مرونة مهنية", "\"Could we include\" = اقتراح مهذب في التفاوض", "\"Let's draft it up\" = ننتقل للتنفيذ"], challenge: "اليوم: اقرأ أي عقد أو اتفاقية بالإنجليزي." },
  { title: "تدريب موظف جديد", icon: "٤", dialogue: [{ speaker: "أنت", text: "Welcome to the team! I'll be showing you around today." }, { speaker: "الموظف", text: "Thank you! I'm excited to start." }, { speaker: "أنت", text: "First, let me walk you through our main systems." }, { speaker: "الموظف", text: "Should I take notes?" }, { speaker: "أنت", text: "Absolutely. I'll also send you a guide by email." }, { speaker: "الموظف", text: "That's very helpful." }, { speaker: "أنت", text: "Don't hesitate to ask questions. There's no such thing as a silly question." }], keyPhrases: [{ en: "I'll be showing you around.", ar: "بأعرّفك على المكان." }, { en: "Let me walk you through our systems.", ar: "خلني أشرحلك أنظمتنا." }, { en: "Don't hesitate to ask questions.", ar: "لا تتردد تسأل." }], producePrompt: "ترحّب بموظف جديد:", produceModel: "Welcome to the team! I'll walk you through everything today. Feel free to ask any questions — there are no silly questions here.", noticingTips: ["\"walk you through\" = أشرحلك خطوة بخطوة", "\"showing you around\" = أعرّفك على المكان", "\"Don't hesitate\" = لا تتردد — يُظهر دعم"], challenge: "اليوم: اشرح شيء بسيط لأي شخص بالإنجليزي." },
  { title: "تقديم تقرير شهري", icon: "٢٩", dialogue: [{ speaker: "أنت", text: "Here's the monthly report. Let me highlight the key points." }, { speaker: "المدير", text: "Go ahead." }, { speaker: "أنت", text: "Sales are up eight percent compared to last month." }, { speaker: "المدير", text: "What about expenses?" }, { speaker: "أنت", text: "We came in under budget by about five percent." }, { speaker: "المدير", text: "Excellent. Any concerns for next month?" }, { speaker: "أنت", text: "Hiring is our biggest challenge. We need two more engineers." }], keyPhrases: [{ en: "Let me highlight the key points.", ar: "خلني أبرز النقاط المهمة." }, { en: "Sales are up eight percent.", ar: "المبيعات زادت ٨٪." }, { en: "We came in under budget.", ar: "جينا أقل من الميزانية." }], producePrompt: "تقدّم تقريرك الشهري:", produceModel: "Let me walk you through the key highlights. Sales increased eight percent. We came in under budget. Our main challenge going forward is hiring.", noticingTips: ["\"highlight\" = أبرز — كلمة عروض أساسية", "\"came in under budget\" = أنفقنا أقل من المخطط", "ذكر التحديات بصراحة = مصداقية"], challenge: "اليوم: لخّص إنجازات أسبوعك بـ 3 جمل إنجليزية." },
  { title: "رد على إيميل صعب", icon: "📬", dialogue: [{ speaker: "الزميل", text: "I'm disappointed with the quality of the last deliverable." }, { speaker: "أنت", text: "Thank you for your feedback. I take this seriously." }, { speaker: "الزميل", text: "Several errors were found in the final document." }, { speaker: "أنت", text: "I apologize. Can you share the specific issues?" }, { speaker: "الزميل", text: "I'll send you a detailed list." }, { speaker: "أنت", text: "I'll address each point and send a corrected version within 48 hours." }, { speaker: "الزميل", text: "I appreciate your prompt response." }], keyPhrases: [{ en: "Thank you for your feedback.", ar: "شكراً على ملاحظاتك." }, { en: "I take this seriously.", ar: "آخذ الموضوع بجدية." }, { en: "I'll address each point.", ar: "بأعالج كل نقطة." }], producePrompt: "أحد ينتقد شغلك. رد باحترافية:", produceModel: "Thank you for bringing this to my attention. I take your feedback seriously. I'll review each point and send a corrected version within 48 hours.", noticingTips: ["\"Thank you for your feedback\" = يحوّل النقد لحوار بنّاء", "\"I take this seriously\" = يُظهر مسؤولية", "تحديد الموعد (48 hours) = التزام واضح"], challenge: "اليوم: اكتب رد على نقد بـ 3 جمل إنجليزية محترفة." },
  { title: "طلب ترقية", icon: "١٩", dialogue: [{ speaker: "أنت", text: "I'd like to discuss my career growth with you." }, { speaker: "المدير", text: "Of course. Where do you see yourself heading?" }, { speaker: "أنت", text: "I'm interested in moving into a senior role." }, { speaker: "المدير", text: "What makes you feel ready for that?" }, { speaker: "أنت", text: "I've consistently exceeded my targets and mentored three junior team members." }, { speaker: "المدير", text: "Those are strong qualifications." }, { speaker: "أنت", text: "I'd appreciate your guidance on what else I need to demonstrate." }], keyPhrases: [{ en: "I'd like to discuss my career growth.", ar: "أبي نتكلم عن تطوري المهني." }, { en: "I've consistently exceeded my targets.", ar: "تجاوزت أهدافي باستمرار." }, { en: "I'd appreciate your guidance.", ar: "أقدّر توجيهك." }], producePrompt: "تبي تطلب ترقية:", produceModel: "I'd like to discuss my career path. I've been exceeding my targets consistently and mentoring junior members. I believe I'm ready for a senior role and would appreciate your guidance.", noticingTips: ["\"career growth\" = تطور مهني — أفضل من \"promotion\"", "\"consistently exceeded\" = فعل + ظرف = يُظهر نمط مستمر", "\"I'd appreciate your guidance\" = طلب مهذب يُظهر تواضع"], challenge: "اليوم: اكتب 3 أسباب تستحق فيها ترقية بالإنجليزي." },

  // ========== BLOCK 5: TRAVEL & EتمكّنLORATION (Weeks 9-10) ==========
  { title: "حجز فندق أونلاين", icon: "🖥️", dialogue: [{ speaker: "الموظف", text: "How can I help with your booking?" }, { speaker: "أنت", text: "I'd like to book a room for three nights starting March fifth." }, { speaker: "الموظف", text: "We have standard and deluxe available." }, { speaker: "أنت", text: "What's the difference in price?" }, { speaker: "الموظف", text: "Standard is one-twenty, deluxe is one-eighty per night." }, { speaker: "أنت", text: "Deluxe, please. Is there a cancellation policy?" }, { speaker: "الموظف", text: "Free cancellation up to 48 hours before check-in." }], keyPhrases: [{ en: "I'd like to book for three nights starting March fifth.", ar: "أبي أحجز ٣ ليالي من ٥ مارس." }, { en: "What's the difference in price?", ar: "وش فرق السعر؟" }, { en: "Is there a cancellation policy?", ar: "في سياسة إلغاء؟" }], producePrompt: "تبي تحجز فندق:", produceModel: "I'd like to book a deluxe room for three nights from March 5th to 8th. Is there a cancellation policy?", noticingTips: ["\"starting [date]\" = ابتداءً من", "\"cancellation policy\" = سياسة الإلغاء — مصطلح سفر أساسي"], challenge: "اليوم: ادخل أي موقع حجز واقرأ شروط الإلغاء." },
  { title: "في مكتب الجوازات", icon: "🛂", dialogue: [{ speaker: "الموظف", text: "Passport and boarding pass, please." }, { speaker: "أنت", text: "Here you go." }, { speaker: "الموظف", text: "What's the purpose of your visit?" }, { speaker: "أنت", text: "I'm here for a business conference." }, { speaker: "الموظف", text: "How long will you be staying?" }, { speaker: "أنت", text: "Five days. I'm returning next Wednesday." }, { speaker: "الموظف", text: "Welcome. Enjoy your stay." }], keyPhrases: [{ en: "What's the purpose of your visit?", ar: "وش سبب زيارتك؟" }, { en: "I'm here for a business conference.", ar: "جاي لمؤتمر عمل." }, { en: "I'm returning next Wednesday.", ar: "راجع يوم الأربعاء." }], producePrompt: "في الجوازات يسألونك:", produceModel: "I'm here for a five-day business trip. I'll be attending a conference and returning next Wednesday.", noticingTips: ["\"purpose of your visit\" = أشهر سؤال في المطار", "\"business/tourism/visiting family\" = الأجوبة الثلاث الشائعة"], challenge: "اليوم: حضّر ٣ جمل تحتاجها في المطار." },
  { title: "ضياع الشنطة في المطار", icon: "🧳", dialogue: [{ speaker: "أنت", text: "Excuse me, my luggage hasn't arrived on the carousel." }, { speaker: "الموظف", text: "I'm sorry. Can I see your baggage claim ticket?" }, { speaker: "أنت", text: "Here it is. I was on flight SA102 from Riyadh." }, { speaker: "الموظف", text: "Let me check the system. Can you describe your bag?" }, { speaker: "أنت", text: "It's a large black suitcase with a red tag." }, { speaker: "الموظف", text: "We'll locate it and deliver it to your hotel." }, { speaker: "أنت", text: "How long will that take? I need my medication." }], keyPhrases: [{ en: "My luggage hasn't arrived.", ar: "شنطتي ما وصلت." }, { en: "It's a large black suitcase with a red tag.", ar: "شنطة سوداء كبيرة عليها تاق أحمر." }, { en: "I need my medication.", ar: "أحتاج أدويتي." }], producePrompt: "شنطتك ضاعت في المطار:", produceModel: "My luggage didn't arrive on the carousel. Here's my claim ticket. It's a large black suitcase. I need it urgently because it has my medication.", noticingTips: ["\"baggage claim\" = استلام الأمتعة", "وصف الشنطة بالتفصيل = يسرّع إيجادها", "ذكر السبب (medication) = يُعطي أولوية"], challenge: "اليوم: تعلّم كيف توصف شنطتك بالإنجليزي." },
  { title: "سؤال عن الاتجاهات", icon: "٢٠", dialogue: [{ speaker: "أنت", text: "Excuse me, could you tell me how to get to the museum?" }, { speaker: "شخص", text: "Sure! Go straight for two blocks, then turn left." }, { speaker: "أنت", text: "Is it far from here? Can I walk?" }, { speaker: "شخص", text: "About ten minutes on foot." }, { speaker: "أنت", text: "Is there a landmark I should look for?" }, { speaker: "شخص", text: "You'll see a big fountain. The museum is right behind it." }, { speaker: "أنت", text: "Thank you so much! That's very helpful." }], keyPhrases: [{ en: "Could you tell me how to get to the museum?", ar: "ممكن تدلني كيف أوصل المتحف؟" }, { en: "Is it far? Can I walk?", ar: "بعيد؟ أقدر أمشي؟" }, { en: "Is there a landmark I should look for?", ar: "في علامة مميزة أدوّر عليها؟" }], producePrompt: "تبي توصل مكان وسألت شخص:", produceModel: "Excuse me, could you tell me how to get to the nearest metro station? Is it walking distance?", noticingTips: ["\"How to get to\" = كيف أوصل — أفضل من \"Where is\"", "\"landmark\" = علامة مميزة — كلمة مفيدة جداً في السفر"], challenge: "اليوم: وصف طريق بيتك لمكان بالإنجليزي." },
  { title: "تأجير شقة أثناء السفر", icon: "🏡", dialogue: [{ speaker: "المضيف", text: "Welcome! I hope you had a good trip." }, { speaker: "أنت", text: "Thank you! The place looks even better than the photos." }, { speaker: "المضيف", text: "Here are the keys. Let me show you around." }, { speaker: "أنت", text: "Is there Wi-Fi? What's the password?" }, { speaker: "المضيف", text: "Yes, the password is on the fridge." }, { speaker: "أنت", text: "Where's the nearest grocery store?" }, { speaker: "المضيف", text: "Just five minutes walk. Turn right at the corner." }], keyPhrases: [{ en: "The place looks better than the photos.", ar: "المكان أحلى من الصور." }, { en: "What's the Wi-Fi password?", ar: "وش باسورد الواي فاي؟" }, { en: "Where's the nearest grocery store?", ar: "وين أقرب بقالة؟" }], producePrompt: "وصلت شقتك المؤجرة:", produceModel: "Thank you! This looks great. Could you show me how the heating works? And what's the Wi-Fi password?", noticingTips: ["\"looks better than the photos\" = مجاملة للمضيف", "\"How does X work?\" = سؤال عملي عن الأجهزة"], challenge: "اليوم: اقرأ وصف أي شقة على Airbnb بالإنجليزي." },
  { title: "في متحف أو معلم سياحي", icon: "🏛️", dialogue: [{ speaker: "أنت", text: "Two adult tickets, please." }, { speaker: "الموظف", text: "That's thirty dollars. Would you like an audio guide?" }, { speaker: "أنت", text: "Yes, please. Is it available in Arabic?" }, { speaker: "الموظف", text: "We have English, French, and Spanish." }, { speaker: "أنت", text: "English is fine. How long is the full tour?" }, { speaker: "الموظف", text: "About ninety minutes." }, { speaker: "أنت", text: "Is photography allowed inside?" }], keyPhrases: [{ en: "Two adult tickets, please.", ar: "تذكرتين للكبار." }, { en: "Is it available in Arabic?", ar: "متوفر بالعربي؟" }, { en: "Is photography allowed?", ar: "التصوير مسموح؟" }], producePrompt: "تبي تدخل متحف:", produceModel: "Two tickets, please. Do you have an audio guide? How long is the tour, and is photography allowed?", noticingTips: ["\"audio guide\" = دليل صوتي — مصطلح سياحي", "\"Is photography allowed\" = سؤال مهم في المتاحف"], challenge: "اليوم: اقرأ عن أي معلم سياحي بالإنجليزي." },
  { title: "حالة طوارئ طبية في السفر", icon: "🚑", dialogue: [{ speaker: "أنت", text: "I need help! My friend is feeling very dizzy." }, { speaker: "شخص", text: "Should I call an ambulance?" }, { speaker: "أنت", text: "Yes, please. He has a heart condition." }, { speaker: "المسعف", text: "What medication is he on?" }, { speaker: "أنت", text: "He takes blood pressure medication daily." }, { speaker: "المسعف", text: "We'll take him to the nearest hospital." }, { speaker: "أنت", text: "Can I ride with him? I have his insurance card." }], keyPhrases: [{ en: "He has a heart condition.", ar: "عنده مشكلة في القلب." }, { en: "He takes blood pressure medication.", ar: "يأخذ دواء ضغط." }, { en: "I have his insurance card.", ar: "معي بطاقة تأمينه." }], producePrompt: "صديقك تعب في السفر:", produceModel: "I need help urgently. My friend is very dizzy and has a heart condition. He takes blood pressure medication. Please call an ambulance.", noticingTips: ["\"heart condition\" = حالة قلبية — مصطلح طبي ضروري", "\"insurance card\" = بطاقة التأمين — لازم تعرفها", "ذكر الأدوية = ينقذ حياة"], challenge: "اليوم: اكتب معلوماتك الطبية بالإنجليزي واحفظها في جوالك." },

  // ========== BLOCK 6: COMPLEX & ADVANCED (Weeks 11-12) ==========
  { title: "التفاوض على سعر سيارة", icon: "🚘", dialogue: [{ speaker: "البائع", text: "This model starts at forty-five thousand." }, { speaker: "أنت", text: "That's above my budget. Is there any room for negotiation?" }, { speaker: "البائع", text: "What were you hoping to spend?" }, { speaker: "أنت", text: "I'd like to stay around forty thousand." }, { speaker: "البائع", text: "I could do forty-two with the extended warranty included." }, { speaker: "أنت", text: "If you include free maintenance for the first year, we have a deal." }, { speaker: "البائع", text: "Done. Let me prepare the paperwork." }], keyPhrases: [{ en: "Is there room for negotiation?", ar: "في مجال للتفاوض؟" }, { en: "I'd like to stay around forty thousand.", ar: "أبي أبقى حدود ٤٠ ألف." }, { en: "If you include X, we have a deal.", ar: "لو تضيف X، اتفقنا." }], producePrompt: "تتفاوض على سعر سيارة:", produceModel: "That's a bit above my budget. I was hoping to stay around forty thousand. If you include the warranty and first-year maintenance, we have a deal.", noticingTips: ["\"room for negotiation\" = مجال للتفاوض — تعبير أساسي", "\"If you include X, we have a deal\" = أقوى جملة تفاوض", "\"I'd like to stay around\" = تحديد ميزانية بأدب"], challenge: "اليوم: تفاوض على أي شيء بسيط — فكّر بالإنجليزي." },
  { title: "شرح مشكلة تقنية لغير تقني", icon: "🖥️", dialogue: [{ speaker: "الشخص", text: "Why isn't the app working on my phone?" }, { speaker: "أنت", text: "It looks like it needs an update. Let me check." }, { speaker: "الشخص", text: "I don't understand all these technical things." }, { speaker: "أنت", text: "No worries. Think of it like this: the app is an old map, and the update gives you a new one." }, { speaker: "الشخص", text: "Oh, that makes sense! How do I update it?" }, { speaker: "أنت", text: "Go to the App Store, search for it, and tap Update." }, { speaker: "الشخص", text: "Thank you for explaining it so clearly." }], keyPhrases: [{ en: "Think of it like this.", ar: "فكّر فيها كذا." }, { en: "The app needs an update.", ar: "التطبيق يحتاج تحديث." }, { en: "Thank you for explaining so clearly.", ar: "شكراً على الشرح الواضح." }], producePrompt: "اشرح مشكلة تقنية لشخص عادي:", produceModel: "The app needs an update. Think of it like this: your current version is like an old map — the update gives you a better one with new features.", noticingTips: ["\"Think of it like this\" = بداية ممتازة لتبسيط أي شيء", "التشبيه (like an old map) = أقوى أداة شرح", "\"No worries\" = يهدّئ الشخص المتوتر"], challenge: "اليوم: اشرح شيء تقني لأي شخص ببساطة." },
  { title: "قيادة نقاش جماعي", icon: "P", dialogue: [{ speaker: "أنت", text: "I'd like to hear everyone's thoughts on this." }, { speaker: "شخص ١", text: "I think we should go with option A." }, { speaker: "شخص ٢", text: "I prefer option B. It's less risky." }, { speaker: "أنت", text: "Both have valid points. Let me summarize the pros and cons." }, { speaker: "أنت", text: "Option A is faster but riskier. Option B is safer but slower." }, { speaker: "شخص ١", text: "When you put it that way, maybe we need a middle ground." }, { speaker: "أنت", text: "Exactly. What if we start with B and transition to A in phase two?" }], keyPhrases: [{ en: "I'd like to hear everyone's thoughts.", ar: "أبي أسمع رأي الكل." }, { en: "Let me summarize the pros and cons.", ar: "خلني ألخّص المزايا والعيوب." }, { en: "What if we start with B and transition to A?", ar: "وش رأيكم نبدأ بـ B وننتقل لـ A؟" }], producePrompt: "أنت تقود نقاش بين فريقين:", produceModel: "I'd like to hear from both sides. Let me summarize: option A is faster but riskier, option B is safer but slower. What if we combine the best of both?", noticingTips: ["\"I'd like to hear everyone's thoughts\" = يُشرك الكل باحترام", "\"pros and cons\" = مزايا وعيوب — مصطلح أساسي", "\"What if we\" = اقتراح حل وسط — دبلوماسي"], challenge: "اليوم: لو في نقاش عائلي — فكّر كيف تديره بالإنجليزي." },
  { title: "شرح ثقافتك لأجنبي", icon: "🕌", dialogue: [{ speaker: "الأجنبي", text: "I noticed people stop everything for prayer. Can you explain?" }, { speaker: "أنت", text: "Of course! Muslims pray five times a day. It's a core part of our faith." }, { speaker: "الأجنبي", text: "That's interesting. Does everything close?" }, { speaker: "أنت", text: "Most shops close briefly, but they reopen after about twenty minutes." }, { speaker: "الأجنبي", text: "I'd love to learn more about your culture." }, { speaker: "أنت", text: "I'd be happy to share. Would you like to try Arabic coffee?" }, { speaker: "الأجنبي", text: "I'd love that! Thank you for being so welcoming." }], keyPhrases: [{ en: "Muslims pray five times a day.", ar: "المسلمين يصلون ٥ مرات باليوم." }, { en: "It's a core part of our faith.", ar: "جزء أساسي من ديننا." }, { en: "I'd be happy to share more.", ar: "يسعدني أشاركك أكثر." }], producePrompt: "أجنبي يسأل عن ثقافتك:", produceModel: "Muslims pray five times a day — it's a core part of our faith and daily routine. Most shops close briefly for prayer but reopen quickly. Would you like to try Arabic coffee? It's part of our hospitality tradition.", noticingTips: ["\"a core part of\" = جزء أساسي من — شرح محترم", "\"I'd be happy to share\" = انفتاح وكرم", "ربط الشرح بتجربة (Arabic coffee) = يجعله حي"], challenge: "اليوم: اشرح عادة سعودية بالإنجليزي لنفسك." },
  { title: "إقناع شخص بفكرتك", icon: "", dialogue: [{ speaker: "أنت", text: "I have a proposal that I think could benefit both of us." }, { speaker: "الشخص", text: "I'm listening. Go ahead." }, { speaker: "أنت", text: "What if we combined our resources to launch a joint project?" }, { speaker: "الشخص", text: "Interesting, but what's in it for me?" }, { speaker: "أنت", text: "You'd get access to our market, and we'd benefit from your technology." }, { speaker: "الشخص", text: "That does sound like a win-win." }, { speaker: "أنت", text: "Exactly. Shall I put together a formal proposal?" }], keyPhrases: [{ en: "I have a proposal that could benefit both of us.", ar: "عندي اقتراح يفيدنا الاثنين." }, { en: "What's in it for me?", ar: "وش الفايدة لي؟" }, { en: "It's a win-win.", ar: "الطرفين يستفيدون." }], producePrompt: "تبي تقنع شخص بشراكة:", produceModel: "I have a proposal that could benefit both of us. You'd get access to our market, and we'd leverage your technology. It's a true win-win.", noticingTips: ["\"benefit both of us\" = يفيد الطرفين — أساسي في الإقناع", "\"What's in it for me?\" = سؤال تفاوضي لازم تتوقعه", "\"win-win\" = كسب مشترك — أقوى كلمة في الشراكات"], challenge: "اليوم: فكّر بفكرة تبي تقنع فيها أحد — جهّزها بالإنجليزي." },
  { title: "حل سوء تفاهم ثقافي", icon: "٣١", dialogue: [{ speaker: "الزميل", text: "I felt a bit uncomfortable when you didn't shake my hand yesterday." }, { speaker: "أنت", text: "I'm sorry if that came across as rude. It wasn't intentional." }, { speaker: "الزميل", text: "I was just confused." }, { speaker: "أنت", text: "In my culture, some people prefer not to shake hands with the opposite gender. It's a sign of respect, not disrespect." }, { speaker: "الزميل", text: "I had no idea! Thank you for explaining." }, { speaker: "أنت", text: "I appreciate your openness. Please feel free to ask about anything." }, { speaker: "الزميل", text: "I really respect that. Thanks for being so open." }], keyPhrases: [{ en: "It wasn't intentional.", ar: "ما كان مقصود." }, { en: "It's a sign of respect, not disrespect.", ar: "هذا احترام مو العكس." }, { en: "I appreciate your openness.", ar: "أقدّر انفتاحك." }], producePrompt: "سوء تفاهم ثقافي. وضّح:", produceModel: "I'm sorry if that was confusing. In my culture, it's actually a sign of respect. I appreciate you asking — please feel free to ask about anything.", noticingTips: ["\"It wasn't intentional\" = ما كان مقصود — يوضّح النية", "\"a sign of respect\" = يحوّل السلبي لإيجابي", "\"I appreciate your openness\" = يبني جسر ثقافي"], challenge: "اليوم: فكّر بموقف ثقافي — كيف تشرحه بالإنجليزي؟" },
  { title: "خطاب في مناسبة عائلية", icon: "١٧", dialogue: [{ speaker: "أنت", text: "Good evening everyone. Thank you all for being here tonight." }, { speaker: "أنت", text: "We're gathered to celebrate a very special occasion." }, { speaker: "أنت", text: "I want to say a few words about the person we're honoring." }, { speaker: "أنت", text: "He's not just my father. He's my role model and my best friend." }, { speaker: "أنت", text: "Everything I've achieved, I owe to his guidance and support." }, { speaker: "أنت", text: "Please join me in raising a glass to the best father in the world." }, { speaker: "الجمهور", text: "Cheers!" }], keyPhrases: [{ en: "Thank you all for being here tonight.", ar: "شكراً لحضوركم الليلة." }, { en: "He's my role model and best friend.", ar: "هو قدوتي وصديقي." }, { en: "Everything I've achieved, I owe to him.", ar: "كل شيء حققته بفضله." }], producePrompt: "تلقي كلمة في مناسبة:", produceModel: "Good evening everyone. Thank you for being here. I want to say a few words about someone very special. He taught me everything I know, and I owe him more than words can express.", noticingTips: ["\"We're gathered to celebrate\" = فتح خطاب رسمي", "\"I owe to his guidance\" = أدين لتوجيهه — تعبير تقدير عميق", "\"raise a glass\" = نرفع الكأس — ختام تقليدي"], challenge: "اليوم: حضّر كلمة شكر من 5 جمل وقلها بصوت عالٍ." },

];


// FIX 8: Cross-context phrase patterns — same phrase structure reused across scenarios
// When user encounters "I'd like..." in restaurant, remind them they also used it in hotel, airport, etc.
// This builds GENERALIZED neural pathways instead of context-specific ones.

export const PHRASE_PATTERNS = {
  "I'd like": { pattern: "I'd like...", usage: "طلب مهذب — يعمل في أي مكان: مطعم، فندق، مطار، بنك", scenarios: ["المطعم", "الفندق", "المطار", "البنك", "الصيدلية"] },
  "Could you": { pattern: "Could you...?", usage: "طلب مهذب بصيغة سؤال — يعمل مع أي شخص", scenarios: ["المطعم", "الفندق", "خدمة العملاء", "الاتجاهات", "التاكسي"] },
  "Is there": { pattern: "Is there...?", usage: "سؤال عن التوفر — فنادق، مطاعم، محلات", scenarios: ["الفندق", "النادي", "السوبرماركت"] },
  "How long": { pattern: "How long...?", usage: "سؤال عن المدة — يعمل في كل مكان", scenarios: ["الطبيب", "البريد", "التحويلات", "استئجار سيارة"] },
  "Thank you for": { pattern: "Thank you for...", usage: "شكر محدد — أقوى بكثير من thank you لوحدها", scenarios: ["الطبيب", "الفندق", "المدرسة", "العمل"] },
};

export const FILL_BLANKS = [
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


export const SENTENCE_BUILD = [
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


export const RECALL_SCENARIOS = [
  { sit: "وصلت فندق وتبي تسوي check-in", hint: "أكّد حجزك وسأل عن الخدمات", model: "I have a reservation under the name Al-Rashid. Is breakfast included?", keywords: ["reservation", "name", "breakfast"] },
  { sit: "في المطعم والنادل يسألك عن طلبك", hint: "اطلب بوضوح وسأل عن التوصيات", model: "I'll have the grilled chicken, please. What do you recommend for dessert?", keywords: ["have", "please", "recommend"] },
  { sit: "تحس بصداع من ٣ أيام وأنت عند الدكتور", hint: "اشرح أعراضك بالتفصيل", model: "I've been having a persistent headache for three days, along with some fatigue.", keywords: ["headache", "days", "fatigue"] },
  { sit: "شخص يتكلم بسرعة وما فهمت عليه", hint: "اطلب منه يبطّئ بأدب", model: "Sorry, could you speak a bit more slowly? I want to make sure I understand.", keywords: ["speak", "slowly", "understand"] },
  { sit: "اشتريت منتج وطلع معيب وتبي تشتكي", hint: "اشرح المشكلة واطلب حل", model: "I purchased this last week and it's not working properly. Is it possible to get a replacement?", keywords: ["purchased", "working", "replacement"] },
  { sit: "معلم ولدك يسألك تساعده في القراءة بالبيت", hint: "وافق واسأل عن التفاصيل", model: "That makes sense. What if we start with fifteen minutes of reading together every evening?", keywords: ["start", "minutes", "reading"] },
  { sit: "جارك الجديد يسلّم عليك وتبي تتعرف عليه", hint: "عرّف نفسك ورحّب فيه", model: "Nice to meet you! I'm Omar. Welcome to the neighborhood. Let me know if you need anything.", keywords: ["nice", "meet", "welcome"] },
  { sit: "تبي تعبّر عن رأيك المختلف بأدب في نقاش", hint: "اعترض بدبلوماسية", model: "I see it differently. From my perspective, I think there's another way to look at it.", keywords: ["differently", "perspective", "another"] },
];


export const FLUENCY_TOPICS = [
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

