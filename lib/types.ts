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
  updatedAt: string;
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
  updated_at: string;
}

// ==========================================
// 소셜 로그인 / 댓글 / 리액션 타입
// ==========================================

export type ReactionType = "like" | "funny" | "sad" | "cheer" | "surprise";

export const reactionLabels: Record<ReactionType, string> = {
  like: "좋아요",
  funny: "웃겨요",
  sad: "슬퍼요",
  cheer: "응원해요",
  surprise: "놀라워요",
};

export const reactionEmojis: Record<ReactionType, string> = {
  like: "\uD83D\uDC4D",
  funny: "\uD83D\uDE02",
  sad: "\uD83D\uDE22",
  cheer: "\uD83D\uDCAA",
  surprise: "\uD83D\uDE2E",
};

// 프론트엔드용 (camelCase)
export interface UserProfile {
  id: string;
  nickname: string;
  avatarUrl?: string;
  provider: string;
  isBanned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  articleId: string;
  userId: string;
  parentId?: string;
  content: string;
  isDeleted: boolean;
  isHidden: boolean;
  hiddenReason?: string;
  createdAt: string;
  updatedAt: string;
  userProfile?: UserProfile;
  likeCount: number;
  isLikedByMe: boolean;
  replies?: Comment[];
}

export interface ArticleReaction {
  reactionType: ReactionType;
  count: number;
}

export interface ArticleReactionState {
  reactions: ArticleReaction[];
  myReaction?: ReactionType;
}

// DB 테이블 타입 (snake_case)
export interface UserProfileRow {
  id: string;
  nickname: string;
  avatar_url: string | null;
  provider: string;
  is_banned: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommentRow {
  id: string;
  article_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  is_deleted: boolean;
  is_hidden: boolean;
  hidden_reason: string | null;
  created_at: string;
  updated_at: string;
  user_profiles?: UserProfileRow;
}

export interface CommentLikeRow {
  id: string;
  comment_id: string;
  user_id: string;
  created_at: string;
}

export interface ArticleReactionRow {
  id: string;
  article_id: string;
  user_id: string;
  reaction_type: string;
  created_at: string;
}

// DB 테이블 타입 (snake_case)
export interface CommentReportRow {
  id: string;
  comment_id: string;
  user_id: string;
  reason: string;
  status: "pending" | "resolved" | "dismissed";
  created_at: string;
}

// 관리자용 AI 숨김 댓글 뷰 (camelCase)
export interface HiddenComment {
  commentId: string;
  commentContent: string;
  commentCreatedAt: string;
  hiddenReason: string;
  authorId: string;
  authorNickname: string;
  authorAvatarUrl?: string;
  authorIsBanned: boolean;
  articleId: string;
  articleTitle: string;
}

// 관리자용 신고 댓글 뷰 (camelCase)
export interface ReportedComment {
  reportId: string;
  reportReason: string;
  reportStatus: "pending" | "resolved" | "dismissed";
  reportedAt: string;
  reporterNickname: string;
  commentId: string;
  commentContent: string;
  commentCreatedAt: string;
  commentIsDeleted: boolean;
  authorId: string;
  authorNickname: string;
  authorAvatarUrl?: string;
  authorIsBanned: boolean;
  articleId: string;
  articleTitle: string;
}
