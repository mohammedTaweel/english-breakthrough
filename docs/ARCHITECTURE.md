# المعمارية — طَلِق v2

> مرجع للمطورين. يوضح القرارات المعمارية ولماذا اتُّخذت.

## القرارات الأساسية

| القرار | السبب |
|--------|-------|
| **TypeScript strict** | Type safety يمنع فئة كاملة من البq. مستحيل نطلق منتج جاد بدونه. |
| **Feature-based folders** | `features/auth/`، `features/today/` — بدل تقسيم بالنوع. كل feature مكتفي. |
| **React Router v6** | routing حقيقي بدل `useState('tab')`. يدعم deep links، بadge button، history. |
| **Firebase (Auth + Firestore)** | backend serverless، يحل مشكلة المزامنة بين الأجهزة، auth آمن بدون كتابة server. |
| **Zod للـ validation** | كل بيانات تدخل التطبيق (env، Firebase، localStorage) تُحقَّق schema. لا ثقة عمياء. |
| **Vitest + Testing Library** | اختبارات من اليوم الأول. بدون اختبارات لا نعرف إذا كسرنا شيء. |
| **ESLint strict + max-warnings 0** | لا warnings في main. إذا ظهر warning، نصلحه فوراً. |
| **Path aliases** (`@features`, `@shared`, `@lib`) | imports واضحة، تنقل الملفات بدون كسر imports. |
| **CSS tokens في `:root`** | مصدر وحيد للحقيقة للألوان والتباعد. لا magic hex codes. |
| **ErrorBoundary top-level** | أي خطأ render ما يكسر التطبيق كله. |

## هيكل المجلدات

```
src/
├── app/              نقطة دخول + routing + providers + error boundary
├── features/         الميزات (كل feature self-contained)
│   └── <feature>/
│       ├── components/
│       ├── hooks/
│       ├── types.ts
│       ├── api.ts    (Firebase queries)
│       └── *.test.ts
├── shared/           UI primitives + hooks + utils مشتركة
├── lib/              تكاملات خارجية (firebase, audio, storage)
├── content/          بيانات تعليمية مُحقَّقة بـ Zod
├── styles/           tokens.css + global.css
├── test/             setup للاختبارات
└── legacy/           الكود القديم — مرجع فقط، لا يُعدَّل
```

## قواعد صارمة

1. **لا inline styles** إلا للقيم الديناميكية. استخدم CSS modules أو tokens.
2. **لا `any`** بدون تعليق يشرح لماذا.
3. **لا `console.log`** في main (warnings + errors فقط).
4. **كل feature جديد له اختبار** — حتى لو اختبار smoke.
5. **لا تعدّل `src/legacy/`** — انقل منه وامسح الملف بعد الانتهاء.
6. **لا تضيف مكتبة بدون سبب** — ما في Tailwind، ما في Redux، ما في styled-components.

## سكربتات التشغيل

```bash
npm run dev           # dev server
npm run typecheck     # tsc --noEmit
npm run lint          # eslint
npm run test          # vitest
npm run verify        # typecheck + lint + test (يركض في CI)
npm run build         # production build
```

## خطة الهجرة من legacy

الترتيب (كل مرحلة ≈ commit واحد):

1. ✅ Foundation (هذا الـ commit) — TS + structure + Firebase + tests + CI
2. **Design system** — Button, Card, Badge كـ TSX مع tests
3. **Content layer** — نقل `data.js` إلى `content/*.ts` مع Zod schemas
4. **Firebase Auth** — استبدال المصادقة المحلية بـ Firebase Auth
5. **User progress** — نقل التخزين من localStorage إلى Firestore
6. **Audio library** — نقل `platform.js` إلى `lib/audio/`
7. **ميزة ميزة** — today → phrases → progress → training → session

## الهدف النهائي

- 0 ملف يتجاوز 300 سطر
- تغطية اختبارات > 70% للمنطق الأساسي
- Lighthouse score > 90 على الجوال
- CEFR-compliant content validation
- تطبيق موبايل (Capacitor) يشتغل بنفس الكود
