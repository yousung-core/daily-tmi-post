// ==========================================
// Daily TMI Post - 타입 정의
// ==========================================

export type SubmissionCategory =
  | "finance"   // 재테크/경제
  | "life"      // 라이프
  | "culture"   // 취미/문화
  | "fitness"   // 운동/건강
  | "people"    // 관계/피플
  | "travel"    // 여행
  | "tech"      // 테크/공부
  | "food";     // 맛집/음식

export const submissionCategoryLabels: Record<SubmissionCategory, string> = {
  finance: "재테크",
  life: "라이프",
  culture: "취미/문화",
  fitness: "운동/건강",
  people: "관계/피플",
  travel: "여행",
  tech: "테크/공부",
  food: "맛집/음식",
};

export const submissionCategoryIcons: Record<SubmissionCategory, string> = {
  finance: "💰",
  life: "📢",
  culture: "🎨",
  fitness: "🏃",
  people: "💕",
  travel: "✈️",
  tech: "💻",
  food: "🍽️",
};

export interface TemplateField {
  name: string;
  label: string;
  type: "text" | "date" | "datetime-local" | "textarea" | "select";
  placeholder?: string;
  required?: boolean;
  options?: string[]; // for select type
}

export interface Template {
  id: string;
  name: string;
  category: SubmissionCategory;
  description: string;
  fields: TemplateField[];
  titleTemplate: string;      // 제목 템플릿 (예: "[name] 씨, 합격의 영광!")
  contentTemplate: string;    // 본문 템플릿
}

// 프론트엔드용 타입 (camelCase)
export interface Submission {
  id: string;
  email: string;
  category: SubmissionCategory;
  title: string;
  eventDate: string;
  location?: string;
  content: string;
  message?: string;
  imageUrl?: string;
  status: "pending" | "approved" | "rejected";
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
}

// DB 테이블 타입 (snake_case) - Supabase 연동용
export interface SubmissionRow {
  id: string;
  email: string;
  category: string;
  title: string;
  event_date: string;
  location: string | null;
  content: string;
  message: string | null;
  image_url: string | null;
  status: string;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
}

// 프론트엔드용 타입 (camelCase)
export interface PublishedArticle {
  id: string;
  submissionId: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  category: SubmissionCategory;
  imageUrl?: string;
  viewCount: number;
  publishedAt: string;
  createdAt: string;
}

// DB 테이블 타입 (snake_case) - Supabase 연동용
export interface ArticleRow {
  id: string;
  submission_id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string | null;
  category: string;
  image_url: string | null;
  view_count: number;
  published_at: string;
  created_at: string;
}
