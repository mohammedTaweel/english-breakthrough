import { PromptsSchema, type Prompt } from './schemas';

const data: Prompt[] = [
  {
    en: 'Describe your favorite place to visit',
    ar: 'وصف مكانك المفضل',
    starters: [
      'My favorite place is...',
      'I usually go there when...',
      'What I love about it is...',
      'The last time I visited, I...',
      'I would recommend it because...',
    ],
  },
  {
    en: 'Talk about a meal you love to cook',
    ar: 'أكلة تحب تسويها',
    starters: [
      'One of my favorite dishes is...',
      'To make it, you need...',
      'First, you start by...',
      'The secret ingredient is...',
      'I learned this recipe from...',
    ],
  },
  {
    en: 'Explain something you learned recently',
    ar: 'شيء تعلمته مؤخراً',
    starters: [
      'Recently, I learned about...',
      'What surprised me was...',
      'The most interesting part is...',
      'I learned it by...',
      'I want to learn more about...',
    ],
  },
  {
    en: 'Describe your ideal weekend',
    ar: 'وصف نهاية أسبوع مثالية',
    starters: [
      'My perfect weekend starts with...',
      'In the morning, I like to...',
      'For lunch, I usually...',
      'In the afternoon, I enjoy...',
      'By the evening, I feel...',
    ],
  },
  {
    en: 'Talk about a trip you took',
    ar: 'رحلة سويتها',
    starters: [
      'A few years ago, I traveled to...',
      'The best part of the trip was...',
      'I tried... for the first time.',
      'One funny thing that happened was...',
      'I would go back because...',
    ],
  },
  {
    en: 'Describe a person who influenced you',
    ar: 'شخص أثّر فيك',
    starters: [
      'Someone who really influenced me is...',
      'I met this person when...',
      'What I admire about them is...',
      'They taught me that...',
      'Because of them, I now...',
    ],
  },
  {
    en: 'Explain your job to a stranger',
    ar: 'اشرح وظيفتك لشخص غريب',
    starters: [
      'I work in the field of...',
      'Basically, what I do is...',
      'A typical day looks like...',
      'The best part about my job is...',
      'The most challenging thing is...',
    ],
  },
  {
    en: 'Talk about a goal for this year',
    ar: 'هدف تبي تأكّده هالسنة',
    starters: [
      'One of my goals this year is...',
      'The reason I chose this goal is...',
      'To achieve it, I need to...',
      'So far, I have...',
      'By the end of the year, I hope to...',
    ],
  },
  {
    en: 'Describe how you spend your evenings',
    ar: 'كيف تقضي أمسياتك',
    starters: [
      'After a long day, I usually...',
      'Sometimes I like to...',
      'My family and I often...',
      'If I have free time, I...',
      'Before I sleep, I always...',
    ],
  },
  {
    en: 'Talk about a hobby or skill you enjoy',
    ar: 'هواية أو مهارة تستمتع فيها',
    starters: [
      "I've been doing... for about...",
      'I got into it because...',
      'What I enjoy most about it is...',
      'It has taught me...',
      'I would recommend it to anyone who...',
    ],
  },
  {
    en: 'Describe a challenge you overcame',
    ar: 'تحدي تغلبت عليه',
    starters: [
      'A few years ago, I faced...',
      'The hardest part was...',
      'I tried to solve it by...',
      'What helped me the most was...',
      'Looking back, I learned that...',
    ],
  },
  {
    en: 'Talk about what makes a good friend',
    ar: 'صفات الصديق الجيد',
    starters: [
      'In my opinion, a good friend is someone who...',
      'One important quality is...',
      'For example, my best friend...',
      'I also believe that...',
      "The best friendships I've seen...",
    ],
  },
];

export const PROMPTS = PromptsSchema.parse(data);
