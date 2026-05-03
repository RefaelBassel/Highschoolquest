# מדריך השקה — Shacharit Quest

מדריך צעד-אחר-צעד להעלות את האתר אונליין על **Vercel + Turso + Google Sheets**.
זמן משוער מקצה לקצה: **~30-45 דקות**.

---

## סקירה ארכיטקטורלית

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  תלמיד (40)  │ ──▶ │   Vercel     │ ──▶ │    Turso     │
│  בדפדפן     │     │  Next.js 16  │     │   libSQL     │
└──────────────┘     │  Edge + API  │     └──────────────┘
                     └──────┬───────┘
                            │
                            ▼ (export-on-demand מהאדמין)
                     ┌──────────────┐
                     │ Google Sheets│
                     └──────────────┘
```

- **Turso** מחזיק את כל הסשנים (~40 תלמידים = פחות מ-1MB) — רץ חינם.
- **Vercel** מארח את האתר ומריץ את ה-API (Next.js Route Handlers).
- **Google Sheets API** עם Service Account לייצוא תשובות בלחיצת כפתור.
- **שום Auth ללא תלמידים** — מזהה הסשן נשמר ב-localStorage, חזרה לדפדפן = המשך מהנקודה.
- **/admin** מוגן במפתח (ADMIN_KEY) שאת/ה מגדיר/ה.

---

## שלב 1 · Turso (DB)

### 1.1 פתיחת חשבון
פתחי את https://app.turso.tech/ והירשמי עם GitHub או אימייל.
התוכנית החינמית כוללת 9GB ו-5 DBs — מספיק בקלות.

### 1.2 יצירת מסד נתונים
דרך אתר Turso (אופציה A) או דרך CLI (אופציה B).

**אופציה A — UI (פשוט יותר):**
1. לחצי **Create Database**.
2. שם: `shacharit-quest`.
3. בחרי אזור — `eu-central-1` (פרנקפורט) או `il-tel-aviv` אם מופיע.
4. לחצי Create.
5. במסך ה-DB הזה, לחצי על **Connect** → תקבלי את **Database URL** (`libsql://shacharit-quest-…turso.io`). שמרי בצד.
6. לחצי על **Generate Token** → צור בעל הרשאת **Full Access**, בתוקף שנה. שמרי את ה-token בצד.

**אופציה B — CLI:**
```bash
# התקנה (Windows): https://docs.turso.tech/cli/installation
turso auth login
turso db create shacharit-quest --location fra
turso db show shacharit-quest --url
turso db tokens create shacharit-quest
```

ה-DB נוצר ריק — הסכמה (טבלה `sessions`) נוצרת אוטומטית בקריאה הראשונה ל-API. אין צורך ב-migrations ידניים.

---

## שלב 2 · Google Cloud Console (Sheets API)

מדובר ב-Service Account — לא ב-OAuth — כך שהתלמידים לא רואים את גוגל בכלל.

### 2.1 פרויקט חדש
1. היכנסי ל-https://console.cloud.google.com/.
2. למעלה, לחצי על שם הפרויקט הנוכחי → **New Project**.
3. שם: `Shacharit Quest`. צרי.
4. ודאי שהפרויקט נבחר במעלה הבר.

### 2.2 הפעלת ה-API
1. https://console.cloud.google.com/apis/library/sheets.googleapis.com
2. לחצי **Enable**.

### 2.3 Service Account
1. https://console.cloud.google.com/iam-admin/serviceaccounts
2. **+ Create Service Account**.
3. שם: `quest-exporter`. תיאור: `Pushes session data to Sheets`. **Create and Continue**.
4. דלגי על תפקידי IAM (אין צורך לתת תפקיד ברמת הפרויקט). **Done**.
5. בטבלת ה-SAs, לחצי על המייל של ה-SA שיצרת → טאב **Keys** → **Add Key → Create new key → JSON → Create**.
6. נשמר אצלך JSON. שמרי אותו במקום מאובטח (לא לשתף!). אנחנו צריכים מתוכו את `client_email` ואת `private_key`.

### 2.4 גיליון Google Sheet
1. צרי גיליון חדש: https://sheets.new
2. שם: "תשובות קוויסט שחרית".
3. עתיקי את ה-Spreadsheet ID מה-URL — החלק בין `/d/` ל-`/edit`. נראה משהו כמו `1AbCdEfGhIjKl…`.
4. לחצי **Share** (שיתוף) למעלה מימין.
5. הדביקי את ה-`client_email` של ה-Service Account (מה-JSON, נראה `quest-exporter@…iam.gserviceaccount.com`).
6. תני הרשאת **Editor**. בטלי "Notify people".
7. **Share**.

> ❗ אם תדלגי על שלב 5-7, הייצוא ייכשל עם 403 כי ל-Service Account אין הרשאה לגיליון.

---

## שלב 3 · GitHub (חובה ל-Vercel)

1. צרי repo חדש (פרטי או ציבורי) ב-GitHub.
2. בטרמינל בתיקייה `shacharit-quest`:
   ```bash
   git add .
   git commit -m "Initial commit — Shacharit Quest"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo>.git
   git push -u origin main
   ```

> אם git לא מותקן: התקיני מ-https://git-scm.com/download/win.

---

## שלב 4 · Vercel

### 4.1 הקמת פרויקט
1. https://vercel.com/new → התחברי עם GitHub.
2. **Import** את הריפו שיצרת.
3. Framework Preset יזוהה אוטומטית כ-**Next.js**. אל תשני.
4. **לפני** Deploy — פתחי את **Environment Variables** והדביקי את הבאות (ערכים מ-`.env.example`):

| Name | Value |
|---|---|
| `TURSO_DATABASE_URL` | `libsql://…turso.io` (משלב 1.2) |
| `TURSO_AUTH_TOKEN` | ה-token משלב 1.2 |
| `GOOGLE_SHEETS_CLIENT_EMAIL` | `client_email` מה-JSON (שלב 2.3) |
| `GOOGLE_SHEETS_PRIVATE_KEY` | `private_key` מה-JSON — **כולל** `-----BEGIN PRIVATE KEY-----`/`-----END PRIVATE KEY-----` ועם `\n` בין השורות |
| `GOOGLE_SHEETS_SPREADSHEET_ID` | מ-URL הגיליון (שלב 2.4) |
| `ADMIN_KEY` | מחרוזת רנדומלית ארוכה. צרי עם:<br>`node -e "console.log(require('crypto').randomBytes(24).toString('base64url'))"` |

5. לחצי **Deploy**. מינוט וחצי.

### 4.2 דומיין
ב-**Settings → Domains** של הפרויקט תוכלי:
- להישאר עם `your-project.vercel.app` (חינם, עובד מצוין).
- לחבר דומיין משלכם — Vercel יסביר איך לכוון את ה-DNS.

---

## שלב 5 · בדיקת קצה לקצה

1. פתחי את ה-URL מ-Vercel.
2. הזיני שם, בחרי כיתה, **התחילו את הקוויסט**.
3. עברי דרך כל 4 השלבים — הוודאי שהמעבר ל-Level Up עובד.
4. פתחי את https://your-project.vercel.app/admin
5. הזיני את ה-`ADMIN_KEY` שלכם.
6. את/ה אמורה לראות את הסשן שלך.
7. לחצי **ייצוא ל-Google Sheets**.
8. פתחי את הגיליון בלשונית חדשה — אמור להופיע גיליון בשם `Quest_2026-MM-DD` עם כותרת מורגשת ותשובה אחת בשורה.

> 🔄 ניתן ללחוץ ייצוא שוב ושוב — אותו יום = דריסה של אותה לשונית, יום אחר = לשונית חדשה.

---

## תפעול שוטף

### חלוקת לינק לתלמידים
- שלחו את ה-URL הראשי בקבוצת הוואטסאפ של הכיתה.
- ההתקדמות נשמרת אוטומטית — תלמיד שסגר וחזר באותו דפדפן ימשיך מהנקודה.

### כששפשטוף ראשון של 40 תלמידים — מה לעשות?
1. אדמין → ייצוא ל-Sheets.
2. בגיליון תראי שורה לכל תלמיד עם כל התשובות שלו, מסודרות לפי שלב ומשימה.
3. אופציה: צרי תרשימים/Pivot מהגיליון — Google Sheets עושה את זה בקלות.

### מחיקת סשן יחיד
ב-/admin → לכל שורה יש כפתור "מחק". מתאים לבדיקות שלכם או למחיקת כפילויות.

### עדכון תוכן השאלות
התוכן יושב במקום אחד: `src/lib/questData.ts`. עורכים, commit, push — Vercel מפיץ אוטומטית בתוך דקה. ההתקדמות הקיימת לא נמחקת.

---

## פתרון בעיות

| תסמין | פתרון |
|---|---|
| ייצוא נכשל עם `403` או `The caller does not have permission` | שכחת לשתף את הגיליון עם המייל של ה-Service Account. שלב 2.4 הוראות 5-7. |
| ייצוא נכשל עם `error:invalid_grant` | זמן השרת לא מסונכרן או ה-private key לא הודבק נכון. בדקי שיש `\n` במקום שורות חדשות אמיתיות ב-`GOOGLE_SHEETS_PRIVATE_KEY`. |
| `/api/session` מחזיר 500 | בדקי בלוגי Vercel (`Deployments → … → Functions`) שה-`TURSO_DATABASE_URL` ו-`TURSO_AUTH_TOKEN` מוגדרים. |
| התלמיד לא רואה את ההתקדמות הישנה | זה נורמלי במכשיר אחר/דפדפן אחר. ההתקדמות שמורה ב-localStorage + DB אבל קשורה למזהה שב-localStorage. אפשר לתת לתלמיד את "קוד הסשן" שמופיע בתחתית כל מסך — בעתיד נוכל להוסיף מסך "המשך עם קוד". |
| כותרת RTL לא נראית טוב | בדקי שה-`<html dir="rtl" lang="he">` מופיע ב-`src/app/layout.tsx`. הוא שם. |

---

## פיתוח מקומי

```bash
cp .env.example .env.local
# ערכי .env.local — תוכלי להשתמש ב-DB מקומי:
#   TURSO_DATABASE_URL=file:./local.db
#   TURSO_AUTH_TOKEN=
# (לא תוכלי לבדוק ייצוא Sheets ללא service account אמיתי)
npm install
npm run dev
# → http://localhost:3000
```

עורכים תוכן? `src/lib/questData.ts` הוא ה-single source of truth.
מחזיקים מבנה? `src/components/activities/*.tsx`.
משנים עיצוב? `src/app/globals.css` + `src/components/Landing.tsx`.

---

## מה אני (Claude) לא יכול לעשות בשבילך

צריך/ה להחליף ידנית רק את הדברים האלה:

1. **חשבון Turso** (חינם) — דורש אימייל/GitHub שלכם.
2. **חשבון Google Cloud** — דורש כניסה עם חשבון גוגל אישי.
3. **חשבון GitHub** — אם אין.
4. **חשבון Vercel** (חינם) — מתחבר עם GitHub.
5. **מפתח האדמין** — את/ה בוחר/ת. זה הסיסמה שלך ל-/admin.

כל השאר עובד בלחיצת כפתור — יש לי את הקוד, ה-build עובר, ה-API נבדקו מקצה לקצה.

בהצלחה! 🚀
