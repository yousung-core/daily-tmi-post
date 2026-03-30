import { ImageResponse } from "next/og";
import { supabase, toArticle } from "@/lib/supabase";
import { submissionCategoryLabels, submissionCategoryIcons } from "@/lib/types";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .single();

  const article = data ? toArticle(data) : null;
  const title = article?.title ?? "기사를 찾을 수 없습니다";
  const category = article?.category ?? "life";
  const excerpt = article?.excerpt ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#f5f0e8",
          border: "8px solid #2c2416",
          padding: "48px",
        }}
      >
        {/* 상단 헤더 */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              fontSize: "22px",
              color: "#8b7355",
              letterSpacing: "3px",
            }}
          >
            DAILY TMI POST
          </div>
          <div
            style={{
              fontSize: "20px",
              color: "#8b4513",
              padding: "4px 16px",
              border: "2px solid #8b4513",
            }}
          >
            {submissionCategoryIcons[category]}{" "}
            {submissionCategoryLabels[category]}
          </div>
        </div>

        {/* 구분선 */}
        <div
          style={{
            width: "100%",
            height: "4px",
            backgroundColor: "#2c2416",
            marginBottom: "6px",
          }}
        />
        <div
          style={{
            width: "100%",
            height: "2px",
            backgroundColor: "#2c2416",
            marginBottom: "40px",
          }}
        />

        {/* 기사 제목 */}
        <div
          style={{
            fontSize: title.length > 30 ? "42px" : "52px",
            fontWeight: "bold",
            color: "#2c2416",
            lineHeight: 1.3,
            marginBottom: "24px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxHeight: title.length > 30 ? "112px" : "136px",
          }}
        >
          {title}
        </div>

        {/* 발췌문 */}
        <div
          style={{
            fontSize: "24px",
            color: "#8b7355",
            fontStyle: "italic",
            lineHeight: 1.4,
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxHeight: "68px",
          }}
        >
          {excerpt}
        </div>
      </div>
    ),
    { ...size }
  );
}
