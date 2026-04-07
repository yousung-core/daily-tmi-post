import type { SubmissionCategory } from "./types";

// ==========================================
// 공통 상수 정의
// ==========================================

/** 유효한 카테고리 목록 */
export const VALID_CATEGORIES: SubmissionCategory[] = [
  "finance", "life", "culture", "fitness", "people", "travel", "tech", "food",
];

/** 댓글 본문 최대 길이 */
export const COMMENT_MAX_LENGTH = 500;

/** 댓글 신고 사유 최대 길이 */
export const REPORT_MAX_LENGTH = 200;

/** 기본 페이지 크기 */
export const DEFAULT_PAGE_SIZE = 20;

/** 검색 결과 페이지 크기 */
export const SEARCH_PAGE_SIZE = 12;
