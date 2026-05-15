# 🚗 Führerschein — رخصة القيادة

تطبيق شامل لتعلم واجتياز امتحان رخصة القيادة الألمانية، مصمم للناطقين بالعربية.

**Comprehensive German driving license exam preparation app for Arabic speakers.**

---

## ✨ الميزات | Features

- **المفردات** — 115+ كلمة وعبارة مع نطق صوتي وبطاقات تعليمية
- **علامات المرور** — 50 علامة مرورية مع شرح تفصيلي
- **أسئلة النظري** — 25+ سؤال مع وضع اختبار وتتبع الدرجات
- **ملاحظاتي** — إضافة وتعديل وحذف ملاحظات شخصية
- دعم **اللغتين العربية والألمانية**
- وضع **مظلم/مضيء**
- تصميم **متجاوب** للجوال والكمبيوتر
- نظام **مفضلة** وتتبع التقدم

---

## 🚀 التثبيت | Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## 🗂️ هيكل المشروع | Project Structure

```
src/
├── app/
│   ├── page.tsx              # Dashboard / Home
│   ├── vocabulary/page.tsx   # Vocabulary section
│   ├── signs/page.tsx        # Traffic signs
│   ├── theory/page.tsx       # Theory exam questions
│   ├── notes/page.tsx        # Personal notes
│   └── api/                  # API routes
├── components/
│   ├── layout/Navbar.tsx
│   ├── providers/ThemeProvider.tsx
│   └── ui/                   # Reusable UI components
├── data/                     # TXT data files
│   ├── vocabulary.txt
│   ├── traffic-signs.txt
│   ├── theory-questions.txt
│   └── personal-notes.txt
├── lib/
│   ├── parsers.ts            # TXT file parsers
│   └── utils.ts
├── store/appStore.ts         # Zustand state management
└── types/index.ts            # TypeScript types
```

## 📝 إضافة محتوى | Adding Content

### المفردات (vocabulary.txt)
```
vocab-XXX|GERMAN|ARABIC|GERMAN_EXAMPLE|ARABIC_EXAMPLE|CATEGORY
```
Categories: `car-interior`, `driving-actions`, `traffic-instructions`, `parking`, `emergency`, `examiner-phrases`

### علامات المرور (traffic-signs.txt)
```
sign-XXX|GERMAN_NAME|ARABIC_NAME|DESCRIPTION|ARABIC_DESC|RULES|ARABIC_RULES|EXAMPLES|ARABIC_EXAMPLES|CATEGORY
```
Separate multiple rules/examples with `;`

### أسئلة النظري (theory-questions.txt)
```
q-XXX|QUESTION|GERMAN_QUESTION|ANSWERS|CORRECT_INDEX|EXPLANATION|GERMAN_EXPLANATION|CATEGORY|DIFFICULTY
```
Separate answers with `;`. `CORRECT_INDEX` is 0-based.

## 🛠️ التقنيات | Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Zustand** (state management)
- **Framer Motion** (animations)
- **next-themes** (dark mode)
- **Lucide React** (icons)
- **Web Speech API** (pronunciation)
