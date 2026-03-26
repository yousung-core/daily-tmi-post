import type { Metadata } from "next";
import { Lora, Playfair_Display } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "Daily TMI Post - 당신의 특별한 순간을 뉴스로",
  description: "결혼, 승진, 합격, 생일, 수상 등 자랑하고 싶은 모든 순간을 특별한 뉴스 기사로 만들어드립니다.",
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
      <body className={`${lora.variable} ${playfair.variable} paper-texture min-h-screen flex flex-col`}>
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl relative z-10">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
