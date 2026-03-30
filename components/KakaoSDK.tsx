"use client";

import Script from "next/script";

export default function KakaoSDK() {
  const kakaoJsKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;

  if (!kakaoJsKey) return null;

  return (
    <Script
      src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js"
      integrity="sha384-DKYJZ8NLiK8MN4/C5P2dtSmLQ4KwPaoqAfyA/DfmO1GRzJ0v1KMg/vMGhSANLVR"
      crossOrigin="anonymous"
      strategy="afterInteractive"
      onLoad={() => {
        if (typeof window !== "undefined" && (window as any).Kakao) {
          const Kakao = (window as any).Kakao;
          if (!Kakao.isInitialized()) {
            Kakao.init(kakaoJsKey);
          }
        }
      }}
    />
  );
}
