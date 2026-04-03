import type { Metadata } from "next";
import { Lora, Playfair_Display } from "next/font/google";
import "./globals.css";
import { siteUrl } from "@/lib/env";
import { AuthProvider } from "@/lib/auth-context";

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
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
        className={`${lora.variable} ${playfair.variable} min-h-screen flex flex-col`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
