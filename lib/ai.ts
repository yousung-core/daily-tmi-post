import { GoogleGenerativeAI } from "@google/generative-ai";
import { getGeminiApiKey } from "./env";
import { submissionCategoryLabels, SubmissionCategory } from "./types";

export interface RefineInput {
  category: SubmissionCategory;
  title: string;
  content: string;
  eventDate: string;
  location?: string;
  message?: string;
}

export interface RefineResult {
  title: string;
  content: string;
  excerpt: string;
}

const SYSTEM_PROMPT = `당신은 "Daily TMI Post"라는 매체의 전문 뉴스 편집기자입니다.
일반인이 제출한 일상 이야기를 정식 뉴스 기사 형식으로 다듬어주세요.

## 규칙
- 한국 뉴스 기사 문체를 사용하세요 (예: "~했다", "~한 것으로 전해졌다", "~라고 밝혔다")
- 원본의 핵심 사실과 감정을 보존하되, 문장을 매끄럽고 격식있게 다듬으세요
- 제목은 신문 헤드라인 스타일로 간결하고 임팩트 있게 작성하세요
- 본문은 리드(lead) → 본문 → 마무리 구조로 작성하세요
- 요약(excerpt)은 기사의 핵심을 1~2문장(80자 이내)으로 요약하세요
- 원본에 없는 사실을 지어내지 마세요
- 마크다운 굵은 글씨(**텍스트**)를 적절히 활용하세요
- 기사 끝에 "Daily TMI Post가 함께합니다!" 같은 맺음말을 넣지 마세요

## 출력 형식
반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트를 추가하지 마세요.
{"title": "다듬어진 제목", "content": "다듬어진 본문", "excerpt": "요약"}`;

export async function refineArticle(input: RefineInput): Promise<RefineResult> {
  const genAI = new GoogleGenerativeAI(getGeminiApiKey());
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

  const categoryLabel =
    submissionCategoryLabels[input.category] || input.category;

  const userPrompt = `## 제출 정보
- 카테고리: ${categoryLabel}
- 제목: ${input.title}
- 날짜: ${input.eventDate}
- 장소: ${input.location || "미기재"}

## 원본 내용
${input.content}

${input.message ? `## 신청자 메시지\n${input.message}` : ""}

위 내용을 뉴스 기사로 다듬어주세요. JSON으로만 응답하세요.`;

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    systemInstruction: { role: "model", parts: [{ text: SYSTEM_PROMPT }] },
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 8192,
      responseMimeType: "application/json",
    },
  });

  const text = result.response.text();

  let parsed: RefineResult;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    throw new Error(`AI 응답 파싱 실패: ${err instanceof Error ? err.message : String(err)}`);
  }

  if (!parsed.title || typeof parsed.title !== "string" || !parsed.title.trim()) {
    throw new Error("AI 응답에 유효한 제목이 없습니다.");
  }
  if (!parsed.content || typeof parsed.content !== "string" || !parsed.content.trim()) {
    throw new Error("AI 응답에 유효한 본문이 없습니다.");
  }
  if (!parsed.excerpt || typeof parsed.excerpt !== "string" || !parsed.excerpt.trim()) {
    throw new Error("AI 응답에 유효한 요약이 없습니다.");
  }

  return parsed;
}
