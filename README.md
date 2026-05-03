# 🌅 Shacharit Quest — עולים לשחרית

קוויסט אינטראקטיבי לתלמידים שעולים לישיבת שחרית — 4 שלבים, 21 משימות, 1200 XP.
מבוסס על המפרט הפדגוגי של בית הספר.

## ערימת טכנולוגיות

- **Next.js 16** (App Router, React 19, Turbopack) — UI + API
- **Tailwind CSS v4** — עיצוב Dark Glassmorphism
- **Framer Motion** — מעברי שלבים, swipe cards, flip cards, level-up
- **@hello-pangea/dnd** — מיון ב-Drag & Drop
- **Turso (libSQL)** — נתוני סשנים, התקדמות, תשובות
- **Google Sheets API** — ייצוא תשובות לפי דרישה (Service Account, ללא OAuth)

## הרצה מקומית

```bash
cp .env.example .env.local
# לבדיקה מקומית מהירה תוכלי להגדיר:
#   TURSO_DATABASE_URL=file:./local.db
#   TURSO_AUTH_TOKEN=
#   ADMIN_KEY=test-1234
npm install
npm run dev
```

פתחי את http://localhost:3000

## העלאה לאוויר

ראו [DEPLOY.md](./DEPLOY.md) — מדריך צעד-אחר-צעד ל-Turso + Vercel + Google Sheets.

## מבנה הקוד

```
src/
├── app/
│   ├── layout.tsx         (RTL, Heebo + Rubik, dark theme)
│   ├── page.tsx           (Quest entry point)
│   ├── globals.css        (theme tokens, glass utils, glow)
│   ├── admin/             (לוח מורה — מוגן ב-ADMIN_KEY)
│   └── api/
│       ├── session/       (POST/GET/PATCH לסשן תלמיד)
│       └── admin/
│           ├── sessions/  (GET/DELETE)
│           └── export/    (POST → Google Sheets)
├── components/
│   ├── Landing.tsx        (מסך פתיחה)
│   ├── QuestApp.tsx       (router בין השלבים)
│   ├── ProgressBar.tsx    (XP + שלבים)
│   ├── LevelUp.tsx        (אנימציית סיום שלב)
│   ├── Summary.tsx        (מסך 1200 XP בסוף)
│   ├── stages/            (Stage1 / StageGeneric)
│   └── activities/        (FlipCard, MultipleChoice, DragDrop, …)
└── lib/
    ├── questData.ts       ⭐ Single source of truth — כל 21 השאלות
    ├── quest-context.tsx  (state + autosave)
    ├── db.ts              (Turso client + schema)
    ├── sheets.ts          (Google Sheets export logic)
    └── admin-auth.ts      (constant-time key check)
```

## עריכת תוכן

כל המשימות, שאלות, תשובות נכונות וערכי XP יושבים בקובץ אחד:
**[`src/lib/questData.ts`](./src/lib/questData.ts)**.
ערכי, commit & push, Vercel מפיץ אוטומטית בתוך דקה. סשנים קיימים לא נמחקים.

## גישה לאדמין

`/admin` עם `ADMIN_KEY` שהוגדר ב-Vercel.
שם תוכלי:
- לראות את כל הסשנים (סה״כ, באמצע, סיימו)
- לראות סטטיסטיקות (ממוצע XP, ממוצע השלמה)
- לייצא הכל ל-Google Sheets בלחיצה
- למחוק סשנים בודדים

## רישיון

פנימי. נבנה עבור ישיבת שחרית.
