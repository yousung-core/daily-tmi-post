import type { Metadata } from "next";
import { Lora, Playfair_Display } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import KakaoSDK from "@/components/KakaoSDK";

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title: {
    default: "Daily TMI Post - 당신의 특별한 순간을 뉴스로",
    template: "%s | Daily TMI Post",
  },
  description:
    "[속보] 김철수 씨, 오늘 점심 제육볶음 선택 - 이런 기사, 만들어드립니다.",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "Daily TMI Post",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=MedievalSharp&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${lora.variable} ${playfair.variable} paper-texture min-h-screen flex flex-col`}
      >
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              fontFamily: "var(--font-lora), serif",
              background: "#f5f0e8",
              border: "2px solid #d4c5a9",
              color: "#2c2416",
            },
          }}
        />
        <KakaoSDK />
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl relative z-10">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
