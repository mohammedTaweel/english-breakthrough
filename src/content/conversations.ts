import { ConversationsSchema, type Conversation } from './schemas';

const data: Conversation[] = [
  {
    title: 'في الفندق',
    icon: '٣',
    steps: [
      {
        speaker: 'موظف الاستقبال',
        text: 'Good evening. Welcome to our hotel. Do you have a reservation?',
        prompt: 'أكّد حجزك',
        opts: [
          'Yes, I have a reservation under the name Al-Rashid.',
          'I think I booked something online recently.',
          "I'm here to stay at the hotel.",
        ],
        ans: 0,
      },
      {
        speaker: 'موظف الاستقبال',
        text: 'I found it. A double room for three nights. Could I see your ID?',
        prompt: 'أعطِ معلوماتك',
        opts: [
          "Of course. Here's my passport. Is breakfast included?",
          'Sure, let me look for it in my bag.',
          'Yes, here you go.',
        ],
        ans: 0,
      },
      {
        speaker: 'موظف الاستقبال',
        text: 'Breakfast is from 7 to 10. Your room is on the fifth floor.',
        prompt: 'اسأل عن الخدمات',
        opts: [
          'Great. Is there a gym and pool available for guests?',
          'That sounds fine. Thank you.',
          "OK, I'll find it.",
        ],
        ans: 0,
      },
      {
        speaker: 'موظف الاستقبال',
        text: 'Yes, both are on the second floor. Open until 10 PM.',
        prompt: 'اطلب شيء إضافي',
        opts: [
          'Perfect. Could I also get some extra towels sent to the room?',
          "That's nice to know. Thank you.",
          "I'll check them out later.",
        ],
        ans: 0,
      },
      {
        speaker: 'موظف الاستقبال',
        text: 'Absolutely. Is there anything else I can help you with?',
        prompt: 'اشكره واختم',
        opts: [
          "That's everything. Thank you so much for your help.",
          "No, I think that's all for now.",
          "I'm fine, thanks.",
        ],
        ans: 0,
      },
    ],
  },
  {
    title: 'عند الطبيب',
    icon: '٢',
    steps: [
      {
        speaker: 'الطبيب',
        text: 'Good morning. What brings you in today?',
        prompt: 'اشرح أعراضك',
        opts: [
          "I've been having a persistent headache for the past three days, along with some fatigue.",
          'My head hurts and I feel tired.',
          "I haven't been feeling well lately.",
        ],
        ans: 0,
      },
      {
        speaker: 'الطبيب',
        text: 'I see. Have you experienced any other symptoms like fever or nausea?',
        prompt: 'أجب بتفصيل',
        opts: [
          "No fever, but I've noticed some mild dizziness, especially in the morning.",
          "I don't think so. Maybe a little.",
          'Not really, just the headache.',
        ],
        ans: 0,
      },
      {
        speaker: 'الطبيب',
        text: 'Have you been under a lot of stress recently? Any changes in sleep?',
        prompt: 'اشرح وضعك',
        opts: [
          "Yes, actually. I've been sleeping less than usual and my schedule has been very hectic.",
          "Kind of. I've been busy with a lot of things.",
          'Maybe a little stressed, nothing major.',
        ],
        ans: 0,
      },
      {
        speaker: 'الطبيب',
        text: "I'd recommend some blood tests just to be safe. I'll also prescribe something for the headache.",
        prompt: 'اسأل عن العلاج',
        opts: [
          'That sounds good. How often should I take the medication, and are there any side effects?',
          "OK, I'll do the blood tests. Thank you.",
          'Sure, whatever you recommend.',
        ],
        ans: 0,
      },
      {
        speaker: 'الطبيب',
        text: "Take it twice daily with food. Come back in a week if it doesn't improve.",
        prompt: 'اشكره وأكّد',
        opts: [
          "Thank you, doctor. I'll follow your advice and schedule a follow-up if needed.",
          "OK, I'll come back if it doesn't get better.",
          'Thanks for seeing me today.',
        ],
        ans: 0,
      },
    ],
  },
  {
    title: 'اجتماع أولياء أمور',
    icon: '٤',
    steps: [
      {
        speaker: 'المعلم/ة',
        text: 'Thank you for coming. Your son Omar is a bright student.',
        prompt: 'اشكره واسأل',
        opts: [
          "Thank you. I'm glad to hear that. How is he doing in his main subjects?",
          "That's great to hear. Thank you.",
          'Good, I was hoping he was doing well.',
        ],
        ans: 0,
      },
      {
        speaker: 'المعلم/ة',
        text: "He's excellent in math and science, but he needs to improve his reading.",
        prompt: 'اسأل عن التفاصيل',
        opts: [
          "I see. Could you give me specific examples of where he's struggling?",
          'I noticed that at home too.',
          'What can we do about that?',
        ],
        ans: 0,
      },
      {
        speaker: 'المعلم/ة',
        text: 'He reads slowly and sometimes skips words. I think more practice at home would help.',
        prompt: 'اقترح خطة',
        opts: [
          'That makes sense. What if we start with fifteen minutes of reading together every evening?',
          "I'll try to read with him more.",
          "We'll work on it at home.",
        ],
        ans: 0,
      },
      {
        speaker: 'المعلم/ة',
        text: 'That would be wonderful. I can also send home some recommended books.',
        prompt: 'وافق واسأل',
        opts: [
          "I'd really appreciate that. Are there any apps or websites you'd also recommend?",
          'Sure, that would be helpful. Thank you.',
          'OK, please send them.',
        ],
        ans: 0,
      },
      {
        speaker: 'المعلم/ة',
        text: 'Yes, I\'ll email you a list. Feel free to reach out if you have any questions.',
        prompt: 'اختم بشكر',
        opts: [
          "Thank you so much for your time and guidance. I'll stay in touch.",
          'Great, thanks for everything.',
          'I appreciate it. Have a good day.',
        ],
        ans: 0,
      },
    ],
  },
  {
    title: 'استئجار شقة',
    icon: '🏠',
    steps: [
      {
        speaker: 'صاحب الشقة',
        text: 'Hi, thanks for coming to see the apartment. Let me show you around.',
        prompt: 'اسأل عن التفاصيل',
        opts: [
          "Thank you. I'm really interested. How many bedrooms does it have?",
          'It looks nice. Tell me more about it.',
          'Thanks. I saw the ad online.',
        ],
        ans: 0,
      },
      {
        speaker: 'صاحب الشقة',
        text: 'It has two bedrooms, one bathroom, and a balcony. Utilities are included.',
        prompt: 'اسأل عن الشروط',
        opts: [
          "That's great. What's the monthly rent, and is there a minimum lease period?",
          'How much is the rent per month?',
          'That sounds reasonable.',
        ],
        ans: 0,
      },
      {
        speaker: 'صاحب الشقة',
        text: "It's fifteen hundred a month with a one-year lease. Two months deposit required.",
        prompt: 'فاوض بأدب',
        opts: [
          'I see. Would you consider fourteen hundred if I pay three months upfront?',
          "That's a bit high. Could you lower it?",
          'Let me think about the price.',
        ],
        ans: 0,
      },
      {
        speaker: 'صاحب الشقة',
        text: "I could do fourteen fifty with three months upfront. That's the best I can offer.",
        prompt: 'وافق واسأل',
        opts: [
          'That works for me. When would the apartment be available to move in?',
          "OK, I'll take it at that price.",
          "Sure, let's go with that.",
        ],
        ans: 0,
      },
      {
        speaker: 'صاحب الشقة',
        text: "You can move in on the first of next month. I'll prepare the contract.",
        prompt: 'أكّد وأنهِ',
        opts: [
          "Perfect. I'll review the contract and have it signed by the end of the week.",
          "Great, I'll be ready by then.",
          'Sounds good. Thank you.',
        ],
        ans: 0,
      },
    ],
  },
  {
    title: 'مكالمة خدمة العملاء',
    icon: '٥',
    steps: [
      {
        speaker: 'موظف الخدمة',
        text: 'Thank you for calling. How can I help you today?',
        prompt: 'اشرح مشكلتك',
        opts: [
          "Hi, I placed an order last week and it still hasn't arrived. My order number is five-seven-three.",
          'I have a problem with my order.',
          'My order is late.',
        ],
        ans: 0,
      },
      {
        speaker: 'موظف الخدمة',
        text: "I'm sorry about that. Let me check the status for you. One moment please.",
        prompt: 'انتظر بأدب',
        opts: [
          'Of course, take your time. I appreciate you looking into this.',
          'Sure, no problem.',
          "OK, I'll wait.",
        ],
        ans: 0,
      },
      {
        speaker: 'موظف الخدمة',
        text: 'It looks like the package was delayed due to a shipping issue. It should arrive by Thursday.',
        prompt: 'اسأل عن التعويض',
        opts: [
          "I understand. Since it's significantly late, is there any compensation you can offer?",
          'OK, as long as it arrives by Thursday.',
          "That's fine then.",
        ],
        ans: 0,
      },
      {
        speaker: 'موظف الخدمة',
        text: 'I can offer you free shipping on your next order. Would that work?',
        prompt: 'وافق واطلب تأكيد',
        opts: [
          'That would be great. Could you send me a confirmation email with the details?',
          'Sure, that\'s fine. Thank you.',
          "OK, I'll accept that.",
        ],
        ans: 0,
      },
      {
        speaker: 'موظف الخدمة',
        text: 'Absolutely. Is there anything else I can help you with?',
        prompt: 'اشكره واختم',
        opts: [
          "No, that's everything. Thank you for resolving this so quickly.",
          "No, that's all. Thanks.",
          "I'm good. Bye.",
        ],
        ans: 0,
      },
    ],
  },
];

export const CONVERSATIONS = ConversationsSchema.parse(data);
