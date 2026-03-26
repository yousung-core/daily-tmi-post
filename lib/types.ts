export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: Category;
  author: string;
  imageUrl?: string;
  publishedAt: string;
  featured?: boolean;
}

export type Category =
  | "ministry"      // 마법부 소식
  | "quidditch"     // 퀴디치
  | "hogwarts"      // 호그와트
  | "dark-arts"     // 어둠의 마법
  | "creatures"     // 마법 생물
  | "opinion";      // 오피니언

export const categoryLabels: Record<Category, string> = {
  ministry: "마법부 소식",
  quidditch: "퀴디치",
  hogwarts: "호그와트",
  "dark-arts": "어둠의 마법",
  creatures: "마법 생물",
  opinion: "오피니언",
};

export const categoryLabelsEn: Record<Category, string> = {
  ministry: "Ministry of Magic",
  quidditch: "Quidditch",
  hogwarts: "Hogwarts",
  "dark-arts": "Dark Arts",
  creatures: "Magical Creatures",
  opinion: "Opinion",
};

// ==========================================
// 기사 신청 서비스 관련 타입
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

export interface Submission {
  id: string;
  name: string;              // 신청자 이름
  email: string;             // 연락처
  category: SubmissionCategory;
  templateId: string;
  protagonistName: string;   // 주인공 이름
  formData: Record<string, string>; // 템플릿 필드 값
  imageUrl?: string;
  status: "pending" | "approved" | "rejected";
  adminNote?: string;
  createdAt: string;
  publishedAt?: string;
}

export interface PublishedArticle {
  id: string;
  submissionId: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  category: SubmissionCategory;
  protagonistName: string;
  imageUrl?: string;
  viewCount: number;
  createdAt: string;
}
