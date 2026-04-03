import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";


export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f5f0e8",
          border: "8px solid #2c2416",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "40px",
          }}
        >
          <div
            style={{
              fontSize: "28px",
              color: "#8b7355",
              letterSpacing: "4px",
              marginBottom: "16px",
            }}
          >
            DAILY TMI POST
          </div>
          <div
            style={{
              width: "600px",
              height: "4px",
              backgroundColor: "#2c2416",
              marginBottom: "8px",
            }}
          />
          <div
            style={{
              width: "600px",
              height: "2px",
              backgroundColor: "#2c2416",
              marginBottom: "32px",
            }}
          />
          <div
            style={{
              fontSize: "48px",
              fontWeight: "bold",
              color: "#2c2416",
              textAlign: "center",
              marginBottom: "24px",
            }}
          >
            당신의 특별한 순간을 뉴스로
          </div>
          <div
            style={{
              fontSize: "20px",
              color: "#8b7355",
              fontStyle: "italic",
            }}
          >
            일상의 소소한 이야기가 특별한 뉴스가 됩니다
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
