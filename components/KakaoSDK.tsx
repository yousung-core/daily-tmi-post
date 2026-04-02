"use client";

import Script from "next/script";
import { kakaoJsKey } from "@/lib/env";

export default function KakaoSDK() {
  if (!kakaoJsKey) return null;

  return (
    <Script
      src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js"
      integrity="sha384-DKYJZ8NLiK8MN4/C5P2dtSmLQ4KwPaoqAfyA/DfmO1GRzJ0v1KMg/vMGhSANLVR"
      crossOrigin="anonymous"
      strategy="afterInteractive"
      onLoad={() => {
        if (typeof window !== "undefined" && window.Kakao) {
          const Kakao = window.Kakao;
          if (!Kakao.isInitialized()) {
            Kakao.init(kakaoJsKey);
          }
        }
      }}
    />
  );
}
