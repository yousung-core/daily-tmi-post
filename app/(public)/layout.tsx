import { Toaster } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import KakaoSDK from "@/components/KakaoSDK";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="paper-texture min-h-screen flex flex-col">
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
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-ink-800 focus:text-parchment-100 focus:rounded"
      >
        본문으로 건너뛰기
      </a>
      <KakaoSDK />
      <Header />
      <main
        id="main-content"
        className="flex-1 container mx-auto px-4 py-8 max-w-6xl relative z-10"
      >
        {children}
      </main>
      <Footer />
    </div>
  );
}
