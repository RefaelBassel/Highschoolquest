// Single source of truth for all 21 activities of the Shacharit Academy Quest.
// Total XP = 1200. 4 stages.

export type ActivityKind =
  | "narrative-card"
  | "multiple-choice"
  | "drag-drop"
  | "flip-card-deck"
  | "flip-card"
  | "hotspot"
  | "matching"
  | "sort-categories"
  | "open-text"
  | "external-entry";

export interface ActivityBase {
  id: string;
  stage: 1 | 2 | 3 | 4;
  kind: ActivityKind;
  title: string;
  prompt?: string;
  xp: number;
}

export interface NarrativeCardActivity extends ActivityBase {
  kind: "narrative-card";
  badge: string; // e.g. "כיתה י׳"
  headline: string; // big title shown on the card
  tagline: string; // sub-headline
  body: string; // long-form explanation
  emoji: string;
  accent: "emerald" | "amber" | "violet";
}

export interface MultipleChoiceActivity extends ActivityBase {
  kind: "multiple-choice";
  question: string;
  options: { id: string; label: string }[];
  correctId: string;
  explanation: string;
}

export interface DragDropActivity extends ActivityBase {
  kind: "drag-drop";
  question: string;
  targetLabel: string; // e.g. "רוח"
  items: { id: string; label: string; correct: boolean }[];
  decoyHint?: string; // shown if a decoy is dragged
  explanation: string;
}

export interface FlipCardDeckActivity extends ActivityBase {
  kind: "flip-card-deck";
  cards: { id: string; front: string; back: string; emoji: string }[];
}

export interface FlipCardActivity extends ActivityBase {
  kind: "flip-card";
  front: string;
  back: string;
  emoji: string;
}

export interface HotspotActivity extends ActivityBase {
  kind: "hotspot";
  question: string;
  // Coordinates as a percentage (0-100) of the displayed schedule grid (10 cols × 8 rows).
  grid: ScheduleCell[][];
  correctCellIds: string[];
  explanation: string;
}

export interface ScheduleCell {
  id: string;
  label: string;
  type: "lesson" | "break" | "social" | "empty";
}

export interface MatchingActivity extends ActivityBase {
  kind: "matching";
  question: string;
  pairs: { id: string; left: string; right: string }[];
}

export interface SortCategoriesActivity extends ActivityBase {
  kind: "sort-categories";
  question: string;
  categories: { id: string; label: string; description?: string; color: string }[];
  items: { id: string; label: string; categoryId: string }[];
}

export interface OpenTextActivity extends ActivityBase {
  kind: "open-text";
  question: string;
  fields: { id: string; label: string; placeholder?: string; minLength?: number; rows?: number }[];
  helper?: string;
}

export interface ExternalEntryActivity extends ActivityBase {
  kind: "external-entry";
  question: string;
  externalUrl: string;
  externalLabel: string;
  entries: { id: string; label: string }[];
  fields: { id: string; label: string; placeholder?: string; suggestion?: string }[];
}

export type Activity =
  | NarrativeCardActivity
  | MultipleChoiceActivity
  | DragDropActivity
  | FlipCardDeckActivity
  | FlipCardActivity
  | HotspotActivity
  | MatchingActivity
  | SortCategoriesActivity
  | OpenTextActivity
  | ExternalEntryActivity;

export interface Stage {
  number: 1 | 2 | 3 | 4;
  emoji: string;
  title: string;
  subtitle: string;
  description: string;
  accent: "emerald" | "sky" | "violet" | "amber";
  activities: Activity[];
}

const stage1: Stage = {
  number: 1,
  emoji: "📖",
  title: "הסיפור הגדול",
  subtitle: "The Narrative",
  description: "המסלול שלכם בשלוש השנים הקרובות — מהכלים אל היסודות, אל המוסר, אל תיקון עולם.",
  accent: "emerald",
  activities: [
    {
      id: "s1-card-y",
      stage: 1,
      kind: "narrative-card",
      title: "כיתה י׳ — תעודת הביטוח",
      xp: 100,
      badge: "כיתה י׳",
      headline: "מהכלים אל היסודות",
      tagline: "השנה שבה בונים את ה-30% — מקדמה משמעותית להמשך",
      body: 'אתם כבר לא מתרגשים מטכנולוגיה — היא כלי. השנה תבנו את "תעודת הביטוח" שלכם: 30% מהציון בכל מקצוע, מבוסס הערכה פנימית. במקביל, טבילת אש ראשונה: בגרויות חיצוניות במתמטיקה (3 יח״ל) והיסטוריה למסלול הגמיש. הנושא הערכי: אחריות קהילתית — מי האנשים סביבכם, ומה האחריות שלכם כלפיהם.',
      emoji: "🛡️",
      accent: "emerald",
    },
    {
      id: "s1-card-ya",
      stage: 1,
      kind: "narrative-card",
      title: 'כיתה י״א — המוסר שבתוך החומר',
      xp: 100,
      badge: 'כיתה י״א',
      headline: "ערפל מוסרי",
      tagline: 'האזורים האפורים — לא דרישה התנהגותית, חלק מהחומר עצמו',
      body: "העלילה מסתבכת. בתוך עומס הבגרויות החיצוניות, אתם צוללים לדילמות שאין להן תשובה אחת נכונה. המוסר הופך לנושא המחקר שלכם: איך מנהיגים מקבלים החלטות בערפל. הידע הופך לעמדה. התובנות מהספרים הופכות לעמוד שדרה מוסרי שמנווט אתכם בחוסר ודאות.",
      emoji: "🌫️",
      accent: "amber",
    },
    {
      id: "s1-card-yb",
      stage: 1,
      kind: "narrative-card",
      title: 'כיתה י״ב — מחקר שהופך לתיקון',
      xp: 100,
      badge: 'כיתה י״ב',
      headline: "תיקון עולם",
      tagline: "שנת הסינתזה — מפסיקים ללמוד עליו, מתחילים לפעול בתוכו",
      body: 'המחקר יוצא מהדפים והופך לפרויקטים עם תוצרים פרקטיים. אתם לוקחים את הקהילה מי׳, את הדילמות מי״א, ומתרגמים לתיקון עולם מוחשי. אתם מסיימים את שחרית כבוגרים שיודעים להפוך מחקר לשינוי, ומחשבה למציאות בשטח.',
      emoji: "🌍",
      accent: "violet",
    },
  ],
};

const stage2: Stage = {
  number: 2,
  emoji: "🧪",
  title: "מעבדת הלו״ז והערכים",
  subtitle: "The Lab",
  description: "שש פעילויות מהירות וקצביות לזיהוי מבנה השבוע, החשיבה החינוכית והערכית של שחרית.",
  accent: "sky",
  activities: [
    {
      id: "s2-time-jump",
      stage: 2,
      kind: "multiple-choice",
      title: "הקפיצה בזמן",
      xp: 50,
      question: "כמה שעות נוספו ליום הארוך ביותר שלכם במעבר מחטיבה (ט׳) לתיכון (י׳)?",
      options: [
        { id: "a", label: "כשעה — קצב דומה" },
        { id: "b", label: "2-3 שעות — יום משמעותית ארוך יותר" },
        { id: "c", label: "אין שינוי בכלל" },
      ],
      correctId: "b",
      explanation: 'בתיכון יום הלימודים מתארך ב-2-3 שעות לפחות, ובמיוחד כשנכנסות מגמות חוץ עד 19:00-20:00.',
    },
    {
      id: "s2-ruach-split",
      stage: 2,
      kind: "drag-drop",
      title: "הפיצול הגדול",
      xp: 50,
      question: 'גררו לתיבת "רוח" את כל המקצועות שמתפצלים אליה משיעורי ה״רוח״ של החטיבה.',
      targetLabel: "רוח",
      items: [
        { id: "tanach", label: 'תנ״ך', correct: true },
        { id: "history", label: "היסטוריה", correct: true },
        { id: "machshevet", label: "מחשבת", correct: true },
        { id: "tushba", label: 'תושב״ע', correct: true },
        { id: "math", label: "מתמטיקה", correct: false },
        { id: "english", label: "אנגלית", correct: false },
        { id: "bio", label: "ביולוגיה", correct: false },
      ],
      explanation: 'בתיכון, "רוח" של החטיבה מתפצלת לארבעה מקצועות נפרדים: תנ״ך, היסטוריה, מחשבת ותושב״ע.',
    },
    {
      id: "s2-survival",
      stage: 2,
      kind: "flip-card",
      title: "אסטרטגיית הישרדות",
      xp: 50,
      front: "איך שורדים את העומס?",
      back: 'הטיפ של מחזור א׳: "הלו״ז ארוך והעבודה בבית גדלה משמעותית. אל תדחו משימות — תעבדו עקב לצד אגודל." עבודה רציפה וקטנה עדיפה על מרתון של הרגע האחרון.',
      emoji: "🏃",
    },
    {
      id: "s2-teacher-relations",
      stage: 2,
      kind: "multiple-choice",
      title: "יחסי מורה-תלמיד",
      xp: 50,
      question: "מה ההיגד הנכון לגבי רמת האחריות והעצמאות המצופה ממך בתיכון?",
      options: [
        { id: "a", label: "המורים פוקחים יותר ומוודאים שהכל נעשה" },
        { id: "b", label: "ההנהלה פתוחה יותר, היחס בוגר — אבל זה דורש ניהול עצמי ואחריות אישית גבוהים" },
        { id: "c", label: "הכל נשאר כמו בחטיבה, רק עם יותר חומר" },
        { id: "d", label: "אין עוד מבחנים, רק עבודות בבית" },
      ],
      correctId: "b",
      explanation: "טיפ ממחזור א׳: בתיכון היחס בוגר יותר, אבל זה דורש ממך הרבה יותר ניהול עצמי ואחריות אישית.",
    },
    {
      id: "s2-breath",
      stage: 2,
      kind: "hotspot",
      title: "הפסקות ונשימה",
      xp: 50,
      question: 'לחצו על המשבצות שמייצגות זמן "נשימה" — הפסקות או פעילות חברתית/בית מדרש חברתי.',
      // 5 days x 8 periods. We use a meaningful subset.
      grid: buildScheduleGrid(),
      correctCellIds: ["d1-p3", "d2-p3", "d3-p3", "d4-p3", "d5-p3", "d2-p7", "d4-p7"],
      explanation: 'הפסקות אמצע יום ושעות בית מדרש חברתי הן הזמנים שבהם המוח נח, וזה קריטי לעמידה בעומס.',
    },
    {
      id: "s2-volunteering",
      stage: 2,
      kind: "matching",
      title: "מעורבות חברתית",
      xp: 50,
      question: "התאימו בין מספר השעות לסוג ההתנדבות — קבוצתית או אישית.",
      pairs: [
        { id: "p1", left: "60 שעות בכיתה י׳", right: "התנדבות אישית" },
        { id: "p2", left: "30 שעות בכיתה י״א", right: "התנדבות קבוצתית" },
        { id: "p3", left: "30 שעות בכיתה י״ב", right: "פרויקט תיקון עולם" },
      ],
    },
  ],
};

function buildScheduleGrid(): ScheduleCell[][] {
  const days = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳"];
  const periods = [
    { i: 1, label: "8:00", type: "lesson" as const },
    { i: 2, label: "9:00", type: "lesson" as const },
    { i: 3, label: "הפסקה", type: "break" as const },
    { i: 4, label: "10:30", type: "lesson" as const },
    { i: 5, label: "11:30", type: "lesson" as const },
    { i: 6, label: "12:30", type: "lesson" as const },
    { i: 7, label: "בית מדרש", type: "social" as const },
    { i: 8, label: "14:00", type: "lesson" as const },
  ];
  return periods.map((p) =>
    days.map((_, dIdx) => {
      const dayNum = dIdx + 1;
      const id = `d${dayNum}-p${p.i}`;
      let type: ScheduleCell["type"] = p.type;
      // Only days 2 and 4 have בית מדרש in period 7; others are regular lessons
      if (p.i === 7 && dayNum !== 2 && dayNum !== 4) type = "lesson";
      return {
        id,
        label: type === "break" ? "הפסקה" : type === "social" ? 'בית מדרש' : `${days[dIdx]} · ${p.label}`,
        type,
      };
    })
  );
}

const stage3: Stage = {
  number: 3,
  emoji: "🔑",
  title: "פיצוח הבגרויות",
  subtitle: "The Core",
  description: 'השלב האינטראקטיבי ביותר — מילון מושגים, מיון מסלולי הבגרות, וחקר חוברות הלימוד.',
  accent: "violet",
  activities: [
    {
      id: "s3-glossary",
      stage: 3,
      kind: "flip-card-deck",
      title: "מילון המושגים",
      prompt: "הפכו את כל הכרטיסים כדי לפענח את שפת הבגרות.",
      xp: 50,
      cards: [
        {
          id: "g-30",
          front: "30%",
          back: 'הערכה חלופית — לא "כרטיס כניסה" אלא חלק בלתי נפרד מהציון הסופי. מבוצע ברוב המקצועות בכיתה י׳ דרך פרויקטים, עבודות או בחינות פנימיות.',
          emoji: "📊",
        },
        {
          id: "g-magen",
          front: "ציון הגשה (מגן)",
          back: 'ציון בית-ספרי המהווה ~50% מהציון הסופי. נקבע ע״י המורה על סמך מבחנים, עבודות והשתתפות לאורך השנה. נועד לשקף את העבודה השוטפת ולהגן עליכם במקרה של כישלון בבחינה.',
          emoji: "🛡️",
        },
        {
          id: "g-yhl",
          front: 'יח״ל',
          back: 'יחידות לימוד — המדד הכמותי של מקצועות הלימוד. לתעודת בגרות נדרשות לפחות 21 יח״ל. שיטת ה״לגו״: צוברים יחידות עד שיש מספיק חלקים נדרשים.',
          emoji: "🧱",
        },
        {
          id: "g-flexible",
          front: "בגרות גמישה",
          back: "מודל היבחנות במקצועות הומניסטיקה (היסטוריה, ספרות וכו׳): 35% משימות מבוקרות, 30% הערכה פנימית, 35% בחינה חיצונית.",
          emoji: "🌊",
        },
        {
          id: "g-general",
          front: "השכלה כללית",
          back: 'יחידות חובה (כמו "בית מדרש חברתי" שממשיך עד י״ב) שיש לסיים כדי להיות זכאים לתעודה. ללא קשר לגוף-נפש שמסתיים בי״ב.',
          emoji: "📚",
        },
        {
          id: "g-controlled",
          front: "משימות מבוקרות",
          back: "מטלות ממוחשבות המבוצעות בכיתה תחת השגחת המורה ונבדקות ע״י משרד החינוך. מהוות חלק מרכזי בציון הבגרות הגמישה — צבירת נקודות לאורך השנה במקום מבחן יחיד.",
          emoji: "💻",
        },
      ],
    },
    {
      id: "s3-sort-tracks",
      stage: 3,
      kind: "sort-categories",
      title: "מיון מקצועות לפי מסלול",
      xp: 50,
      question: "גררו כל מקצוע לקטגוריית ההיבחנות שלו.",
      categories: [
        { id: "pbl", label: "שותפי פיתוח (PBL)", description: "פרויקטלי", color: "violet" },
        { id: "flexible", label: "בגרות גמישה", description: "35/30/35", color: "sky" },
        { id: "regular", label: "היבחנות רגילה", description: "מבחן חיצוני", color: "emerald" },
      ],
      items: [
        { id: "i1", label: "היסטוריה (אתי)", categoryId: "pbl" },
        { id: "i2", label: 'תנ״ך', categoryId: "pbl" },
        { id: "i3", label: "מחשבת", categoryId: "pbl" },
        { id: "i4", label: "ביולוגיה", categoryId: "pbl" },
        { id: "i5", label: "היסטוריה (גידי)", categoryId: "flexible" },
        { id: "i6", label: 'תושב״ע', categoryId: "flexible" },
        { id: "i7", label: "מתמטיקה", categoryId: "regular" },
        { id: "i8", label: "אנגלית", categoryId: "regular" },
        { id: "i9", label: "לשון", categoryId: "regular" },
        { id: "i10", label: "אזרחות", categoryId: "regular" },
      ],
    },
    {
      id: "s3-math-level",
      stage: 3,
      kind: "multiple-choice",
      title: "מתמטיקה — מתי מתחילים לצבור?",
      xp: 50,
      question: 'באיזו רמת יח״ל מתחילים לצבור ציונים לבגרות כבר בכיתה י׳?',
      options: [
        { id: "a", label: 'ב-3 יח״ל בלבד' },
        { id: "b", label: 'בכל הרמות — אבל ב-3 יח״ל הצבירה מתחילה כבר בי׳' },
        { id: "c", label: 'רק ב-5 יח״ל' },
      ],
      correctId: "b",
      explanation: 'במתמטיקה כל הרמות נלמדות, אבל ב-3 יח״ל מתחילים לצבור ציונים לבגרות כבר בכיתה י׳. זה ממקם את ההצלחה המוקדמת.',
    },
    {
      id: "s3-tanach-projects",
      stage: 3,
      kind: "matching",
      title: 'פרויקטים ב-5 יח״ל תנ״ך',
      xp: 50,
      question: "התאימו כל פרויקט לכיתה שבה הוא מתבצע.",
      pairs: [
        { id: "p1", left: "פרויקט אחריות קהילתית", right: "כיתה י׳" },
        { id: "p2", left: 'בגרות חיצונית בנביא (ספר מלכים)', right: 'כיתה י״א' },
        { id: "p3", left: "פרויקט גיוס כספים", right: 'כיתה י״ב' },
      ],
    },
    {
      id: "s3-machshevet-structure",
      stage: 3,
      kind: "sort-categories",
      title: 'מבנה 5 יח״ל מחשבת ישראל',
      xp: 50,
      question: 'מיינו את היחידות לפי המבנה הנכון של 5 יח״ל מחשבת.',
      categories: [
        { id: "emuna", label: "אמונה בשעת משבר", description: "1 יח׳ חובה — PBL", color: "amber" },
        { id: "literature", label: "ספרות (גלישת רוח)", description: "1 יח׳ דיגיטלית", color: "sky" },
        { id: "hagbar", label: "הגבר מחשבת", description: '3 יח׳ פנימי-פרויקטלי', color: "violet" },
      ],
      items: [
        { id: "m1", label: "אמונה בשעת משבר (חובה)", categoryId: "emuna" },
        { id: "m2", label: 'ספרות — תוכנית "גלישת רוח" דיגיטלית', categoryId: "literature" },
        { id: "m3", label: "אחריות קהילתית", categoryId: "hagbar" },
        { id: "m4", label: "מוסר ותיקון עולם", categoryId: "hagbar" },
        { id: "m5", label: "פרויקט גן החיות", categoryId: "hagbar" },
      ],
    },
    {
      id: "s3-special-projects",
      stage: 3,
      kind: "matching",
      title: "פרויקטים ייחודיים",
      xp: 50,
      question: "התאימו כל פרויקט למקצוע ולמשמעות שלו.",
      pairs: [
        { id: "p1", left: "פרויקט גן החיות", right: 'מחשבת — מסחריות גני חיות (כיתה י״א, מוסר)' },
        { id: "p2", left: 'פרויקט "חמ״ד ועד"', right: 'היסטוריה — הנצחת עדויות ניצולי שואה (כיתה י״א)' },
        { id: "p3", left: "פרויקט תוכחה אקטואלית", right: 'תנ״ך — תוכחה ל-2026 על פי ישעיהו (כיתה י׳)' },
      ],
    },
    {
      id: "s3-halacha-booklet",
      stage: 3,
      kind: "open-text",
      title: 'חקר חוברת הלכה',
      xp: 50,
      question: 'דפדפו בחוברת ההלכה (הנמצאת בכיתה). מצאו 3 שאלות שעניינו אתכם וכתבו אותן.',
      helper: 'אין תשובה נכונה — אנחנו רוצים לדעת מה תפס אתכם.',
      fields: [
        { id: "q1", label: "שאלה 1", placeholder: "השאלה הראשונה שמצאת...", minLength: 8 },
        { id: "q2", label: "שאלה 2", placeholder: "השאלה השנייה...", minLength: 8 },
        { id: "q3", label: "שאלה 3", placeholder: "השאלה השלישית...", minLength: 8 },
      ],
    },
    {
      id: "s3-machshevet-booklet",
      stage: 3,
      kind: "open-text",
      title: "חקר חוברת מחשבת",
      xp: 50,
      question: "דפדפו בחוברת המחשבת — מה תפס לכם את העין כמעניין או שונה?",
      helper: 'תיאור פתוח — שורה-שתיים זה מספיק.',
      fields: [
        { id: "impression", label: "מה בלט?", placeholder: "הרושם העיקרי שלי הוא...", rows: 3, minLength: 12 },
      ],
    },
  ],
};

const stage4: Stage = {
  number: 4,
  emoji: "🔭",
  title: "חשיפה למגמות",
  subtitle: "Electives",
  description: "שלב הבחירה האישית — בין מסלול ערכי לאקדמי, ובין מגמות שחרית למגמות חוץ.",
  accent: "amber",
  activities: [
    {
      id: "s4-values-track",
      stage: 4,
      kind: "multiple-choice",
      title: "זיקה לערכים",
      xp: 50,
      question: "איזו מגמה מתכתבת באופן הישיר ביותר עם נושאי הליבה של שחרית (אחריות ומוסר)?",
      options: [
        { id: "a", label: "ביולוגיה" },
        { id: "b", label: "פיזיקה" },
        { id: "c", label: "מדעי המחשב" },
      ],
      correctId: "a",
      explanation: "ביולוגיה — נושאי אתיקה רפואית, סביבה ואחריות לחיים — הכי קרובה לליבת המוסר והאחריות של שחרית.",
    },
    {
      id: "s4-academic-track",
      stage: 4,
      kind: "multiple-choice",
      title: "זיקה לאקדמיה",
      xp: 50,
      question: "מהי המגמה היחידה שכוללת בתוכה קורס אקדמי רשמי באוניברסיטה?",
      options: [
        { id: "a", label: "מדעי המחשב" },
        { id: "b", label: "מדעי החברה" },
        { id: "c", label: "ביולוגיה" },
      ],
      correctId: "a",
      explanation: "מדעי המחשב משלבת קורס אקדמי רשמי באוניברסיטה — הזדמנות לטעימה אמיתית מלימודים גבוהים.",
    },
    {
      id: "s4-megama-1",
      stage: 4,
      kind: "external-entry",
      title: "מגמת חוץ #1 — חקר נתונים",
      xp: 50,
      question: 'היכנסו לקטלוג מגמות החוץ ובחרו מגמה אחת. מלאו את הנתונים הבאים:',
      externalUrl: "https://www.megamot.online/",
      externalLabel: "לקטלוג מגמות החוץ",
      entries: [{ id: "name", label: "שם המגמה" }],
      fields: [
        { id: "name", label: "שם המגמה", placeholder: "למשל: סייבר / מוזיקה / רובוטיקה" },
        { id: "cost", label: "עלות שנתית (ש״ח)", placeholder: "350", suggestion: "דמי רישום שנתיים = 350 ש״ח" },
        { id: "hours", label: "שעות הלימוד", placeholder: "16:00-19:00 בימי ג׳", suggestion: "מגמות חוץ לרוב עד 19:00/20:00" },
        { id: "location", label: "מיקום", placeholder: "מוזיאון ישראל / הספרייה הלאומית..." },
      ],
    },
    {
      id: "s4-megama-2",
      stage: 4,
      kind: "external-entry",
      title: "מגמת חוץ #2 — להשוואה",
      xp: 50,
      question: 'בחרו מגמת חוץ נוספת מהקטלוג ומלאו את הפרטים. שווה לבדוק שתיים — לראות הבדלים בעלות ובמיקום.',
      externalUrl: "https://www.megamot.online/",
      externalLabel: "לקטלוג מגמות החוץ",
      entries: [{ id: "name", label: "שם המגמה" }],
      fields: [
        { id: "name", label: "שם המגמה", placeholder: "למשל: דיפלומטיה / משפטים / אמהרית" },
        { id: "cost", label: "עלות שנתית (ש״ח)", placeholder: "350" },
        { id: "hours", label: "שעות הלימוד", placeholder: "17:00-20:00..." },
        { id: "location", label: "מיקום", placeholder: "בית הספר / מוסד חיצוני" },
      ],
    },
  ],
};

export const STAGES: Stage[] = [stage1, stage2, stage3, stage4];

export const TOTAL_XP = STAGES.reduce(
  (sum, s) => sum + s.activities.reduce((sum2, a) => sum2 + a.xp, 0),
  0,
);

export const TOTAL_ACTIVITIES = STAGES.reduce((sum, s) => sum + s.activities.length, 0);

export function findActivity(id: string): Activity | undefined {
  for (const stage of STAGES) {
    const a = stage.activities.find((a) => a.id === id);
    if (a) return a;
  }
  return undefined;
}

export const CLASSES = [
  { id: "ט", label: "כיתה ט׳" },
  { id: "י", label: "כיתה י׳" },
  { id: "יא", label: 'כיתה י״א' },
  { id: "יב", label: 'כיתה י״ב' },
];
