# هيكل المشروع

```
src/
├── app/                    نقطة دخول التطبيق، routing الرئيسي، providers
├── features/               الميزات مقسّمة حسب المجال (feature-based)
│   ├── auth/               تسجيل الدخول والحسابات
│   ├── onboarding/         شاشة الترحيب (5 خطوات)
│   ├── today/              تبويب اليوم
│   ├── training/           تبويب التدريب (10 تمارين)
│   ├── phrases/            تبويب الجمل (بنك الجمل + SRS)
│   ├── progress/           تبويب التقدم (إحصائيات + charts)
│   └── session/            الجلسة اليومية (6 خطوات)
│
├── shared/                 عناصر مشتركة بين الميزات
│   ├── components/         UI primitives (Button, Card, etc.)
│   ├── hooks/              custom hooks قابلة لإعادة الاستخدام
│   ├── types/              TypeScript types مشتركة
│   └── utils/              دوال مساعدة
│
├── lib/                    تكاملات مع خدمات خارجية
│   ├── firebase/           Firebase SDK wrappers (auth, firestore)
│   ├── audio/              TTS + Speech Recognition
│   └── storage/            طبقة تجريد للتخزين (offline + sync)
│
├── content/                المحتوى التعليمي (مُصنَّف ومُحقَّق typed)
├── styles/                 CSS tokens + global styles
├── test/                   إعدادات الاختبارات
│
└── legacy/                 الكود القديم — مرجع فقط، لا يُعدَّل
```

## قواعد التنظيم

1. **كل feature مكتفي ذاتياً** — مكوناته، hooks، types، tests كلها داخل مجلده
2. **shared/** — فقط للكود المستخدم في أكثر من feature
3. **lib/** — أي تكامل مع خدمة خارجية (Firebase, OpenAI, Capacitor)
4. **content/** — البيانات التعليمية مع schemas محققة بـ Zod
5. **legacy/** — للقراءة فقط، ننقل منه الميزات تدريجياً
