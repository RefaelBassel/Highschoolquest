import type { Metadata } from "next";
import { Heebo, Rubik } from "next/font/google";
import "./globals.css";

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["hebrew", "latin"],
  display: "swap",
  weight: ["500", "700", "900"],
});

export const metadata: Metadata = {
  title: "עולים לשחרית — Quest",
  description:
    "קוויסט אינטראקטיבי לתלמידי שחרית: 4 שלבים, 20 משימות, 1200 XP. בונים את תעודת הביטוח, פותרים את ערפל המוסר, יוצאים לתיקון עולם.",
  openGraph: {
    title: "עולים לשחרית — Quest",
    description: "קוויסט אינטראקטיבי לתלמידי שחרית. 4 שלבים, 20 משימות, 1200 XP.",
    locale: "he_IL",
    type: "website",
  },
};

export const viewport = {
  themeColor: "#07060f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`${heebo.variable} ${rubik.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col selection-emerald">{children}</body>
    </html>
  );
}
