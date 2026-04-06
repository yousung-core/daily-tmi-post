// ==========================================
// 욕설 필터 (서버 사이드)
// ==========================================

const BANNED_WORDS = [
  "시발", "씨발", "시bal", "ㅅㅂ", "ㅆㅂ",
  "병신", "ㅂㅅ", "멍청",
  "지랄", "ㅈㄹ",
  "개새끼", "개세끼", "개색",
  "미친놈", "미친년",
  "꺼져", "닥쳐",
  "fuck", "shit", "damn", "ass",
];

function normalize(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[\u200B-\u200F\uFEFF\u00AD\u2060\u034F]/g, "") // zero-width 문자 제거
    .replace(/\s+/g, "")
    .replace(/[^a-zA-Z0-9가-힣ㄱ-ㅎㅏ-ㅣ]/g, "") // 언더스코어 등 특수문자 제거
    .toLowerCase();
}

export function containsProfanity(text: string): boolean {
  const normalized = normalize(text);
  return BANNED_WORDS.some((word) => normalized.includes(normalize(word)));
}

export function validateComment(content: string): {
  valid: boolean;
  error?: string;
} {
  const trimmed = content.trim();

  if (!trimmed) {
    return { valid: false, error: "댓글 내용을 입력해주세요." };
  }
  if (trimmed.length > 500) {
    return { valid: false, error: "댓글은 500자 이내로 작성해주세요." };
  }
  if (containsProfanity(trimmed)) {
    return { valid: false, error: "부적절한 표현이 포함되어 있습니다." };
  }

  return { valid: true };
}
