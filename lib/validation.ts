import { SubmissionCategory } from "./types";
import { getSupabaseUrl } from "./env";

// UUID 형식 검증
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUUID(value: string): boolean {
  return UUID_RE.test(value);
}

const VALID_CATEGORIES: SubmissionCategory[] = [
  "finance", "life", "culture", "fitness", "people", "travel", "tech", "food",
];

const MAX_TITLE_LENGTH = 50;
const MAX_CONTENT_LENGTH = 1000;
const MAX_EMAIL_LENGTH = 255;
const MAX_FIELD_LENGTH = 255;
const MAX_MESSAGE_LENGTH = 1000;

interface SubmissionInput {
  email: string;
  category: string;
  title: string;
  eventDate: string;
  location?: string;
  content: string;
  message?: string;
  imageUrl?: string;
}

type ValidationResult =
  | { valid: true; data: SubmissionInput & { category: SubmissionCategory } }
  | { valid: false; errors: Record<string, string> };

export function validateSubmission(data: unknown): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data || typeof data !== "object") {
    return { valid: false, errors: { _form: "잘못된 요청입니다." } };
  }

  const input = data as Record<string, unknown>;

  // email
  const email = typeof input.email === "string" ? input.email.trim() : "";
  if (!email) {
    errors.email = "이메일은 필수 항목입니다.";
  } else if (email.length > MAX_EMAIL_LENGTH) {
    errors.email = `이메일은 ${MAX_EMAIL_LENGTH}자 이내로 입력해주세요.`;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "올바른 이메일 형식이 아닙니다.";
  }

  // category
  const category = typeof input.category === "string" ? input.category : "";
  if (!category) {
    errors.category = "카테고리는 필수 항목입니다.";
  } else if (!VALID_CATEGORIES.includes(category as SubmissionCategory)) {
    errors.category = "유효하지 않은 카테고리입니다.";
  }

  // title
  const title = typeof input.title === "string" ? input.title.trim() : "";
  if (!title) {
    errors.title = "제목은 필수 항목입니다.";
  } else if (title.length > MAX_TITLE_LENGTH) {
    errors.title = `제목은 ${MAX_TITLE_LENGTH}자 이내로 입력해주세요.`;
  }

  // eventDate
  const eventDate = typeof input.eventDate === "string" ? input.eventDate.trim() : "";
  if (!eventDate) {
    errors.eventDate = "날짜는 필수 항목입니다.";
  } else if (isNaN(Date.parse(eventDate))) {
    errors.eventDate = "유효하지 않은 날짜 형식입니다.";
  }

  // content
  const content = typeof input.content === "string" ? input.content.trim() : "";
  if (!content) {
    errors.content = "내용은 필수 항목입니다.";
  } else if (content.length > MAX_CONTENT_LENGTH) {
    errors.content = `내용은 ${MAX_CONTENT_LENGTH}자 이내로 입력해주세요.`;
  }

  // location (optional)
  const location = typeof input.location === "string" ? input.location.trim() : "";
  if (location && location.length > MAX_FIELD_LENGTH) {
    errors.location = `장소는 ${MAX_FIELD_LENGTH}자 이내로 입력해주세요.`;
  }

  // message (optional)
  const message = typeof input.message === "string" ? input.message.trim() : "";
  if (message && message.length > MAX_MESSAGE_LENGTH) {
    errors.message = `메시지는 ${MAX_MESSAGE_LENGTH}자 이내로 입력해주세요.`;
  }

  // imageUrl (optional) — Supabase Storage URL만 허용
  const imageUrl = typeof input.imageUrl === "string" ? input.imageUrl.trim() : "";
  if (imageUrl) {
    const supabaseStoragePrefix = `${getSupabaseUrl()}/storage/v1/object/public/article-images/`;
    if (!imageUrl.startsWith(supabaseStoragePrefix)) {
      errors.imageUrl = "유효하지 않은 이미지 URL입니다.";
    }
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: {
      email,
      category: category as SubmissionCategory,
      title,
      eventDate,
      location: location || undefined,
      content,
      message: message || undefined,
      imageUrl: imageUrl || undefined,
    },
  };
}
