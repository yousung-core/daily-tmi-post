"use client";

import { captureError } from "@/lib/logger";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureError("global-error", error, { digest: error.digest });
  }, [error]);

  return (
    <html lang="ko">
      <body
        style={{
          fontFamily: "serif",
          backgroundColor: "#f5f0e8",
          color: "#2c2416",
        }}
      >
        <div
          style={{
            maxWidth: "672px",
            margin: "0 auto",
            textAlign: "center",
            padding: "64px 16px",
          }}
        >
          <div style={{ fontSize: "72px", marginBottom: "24px" }}>!</div>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: "bold",
              marginBottom: "16px",
            }}
          >
            앗! 페이지를 불러올 수 없습니다!
          </h1>
          <p style={{ color: "#8b7355", marginBottom: "8px" }}>
            페이지를 불러오는 중 오류가 발생했습니다.
          </p>
          <p
            style={{
              color: "#8b7355",
              fontSize: "14px",
              marginBottom: "32px",
            }}
          >
            {error.message || "알 수 없는 오류가 발생했습니다."}
          </p>
          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={reset}
              style={{
                padding: "12px 24px",
                backgroundColor: "#c9a84c",
                color: "#f5f0e8",
                border: "none",
                fontWeight: "bold",
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              다시 시도
            </button>
            <a
              href="/"
              style={{
                padding: "12px 24px",
                backgroundColor: "transparent",
                color: "#2c2416",
                border: "2px solid #2c2416",
                fontWeight: "bold",
                fontSize: "16px",
                cursor: "pointer",
                textDecoration: "none",
              }}
            >
              홈으로 돌아가기
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
