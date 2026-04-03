# Daily TMI Post - TODO

## 진행 상태 범례

- [ ] 미완료
- [x] 완료

---

## 1. 백엔드 구축 (필수)

| 우선순위 | 상태    |
| -------- | ------- |
| 높음     | ✅ 완료 |

- [x] Supabase 프로젝트 생성
- [x] 테이블 설계 및 생성
  - [x] `submissions` - 기사 신청
  - [x] `articles` - 게시된 기사
  - [x] `admins` - 관리자 계정
  - [x] `rate_limits` - 요청 제한
- [x] 기사 신청 저장 API (Supabase 클라이언트 직접 호출)
- [x] 기사 목록 조회 API (`lib/supabase.ts`)
- [x] 기사 상세 조회 API (`lib/supabase.ts`)
- [x] 조회수 증가 로직 (`increment_view_count` RPC 함수)
- [x] Rate Limiting (`check_rate_limit` RPC 함수 + 인메모리 폴백)

---

## 2. 서비스 홈페이지 완성도 개선

| 우선순위 | 상태    |
| -------- | ------- |
| 높음     | ✅ 완료 |

### 핵심 기능

- [x] 기사 신청 API 엔드포인트 (`/api/submit`) — 이미 구현되어 있음
- [x] 카카오톡 공유 SDK 연동 (SDK 로드 및 초기화)
- [x] 기사 검색 기능
- [x] 인기 기사 정렬 개선 (조회수 + 최신성 반영)

### SEO

- [x] sitemap.xml 생성 (`app/sitemap.ts`)
- [x] robots.txt 설정 (`app/robots.ts`)
- [x] OG 이미지 자동 생성 (사이트 기본 + 기사별 동적 생성)
- [x] 메타데이터 개선 (`metadataBase`, `openGraph`, `twitter`)
- [x] JSON-LD 구조화 데이터 (기사 상세 페이지)

### UI/UX

- [x] 터치 타겟 44px 이상 확보 (공유 버튼, 검색, 페이지네이션 등)
- [x] 키보드 접근성 (`focus-visible` 링 추가)
- [x] `prefers-reduced-motion` 지원
- [x] 헤드라인 가독성 개선 (`line-height: 1.1` → `1.25`)
- [x] 검색 페이지 로딩 스켈레톤 추가
- [x] 카테고리 페이지 사이드바 추가
- [ ] 날짜별 아카이브 (날짜로 기사 탐색)

### 에러 모니터링

- [x] 구조화된 로거 (`lib/logger.ts`) — Vercel 로그 활용
- [x] 글로벌 에러 바운더리 (`app/global-error.tsx`)
- [x] `console.error` → `captureError` 통일

---

## 3. 관리자 기능

| 우선순위 | 상태    |
| -------- | ------- |
| 높음     | ✅ 완료 |

- [x] 관리자 로그인 페이지 (`/admin/login`)
- [x] 관리자 인증 미들웨어
- [x] 관리자 대시보드 (`/admin`)
  - [x] 신청 목록 조회
  - [x] 신청 상세 보기
  - [x] 승인/반려 처리
  - [x] 기사 내용 편집
- [x] 게시된 기사 관리
  - [x] 기사 목록
  - [x] 기사 수정/삭제

---

## 4. 이미지 기능

| 우선순위 | 상태    |
| -------- | ------- |
| 중간     | 진행 전 |

- [ ] 이미지 저장소 설정 (Supabase Storage / Cloudinary)
- [ ] 기사 신청 시 이미지 업로드 UI
- [ ] 이미지 업로드 API
- [ ] 이미지 리사이징/압축 처리
- [ ] 기본 이미지 설정 (이미지 미첨부 시)

---

## 5. 알림 기능

| 우선순위 | 상태    |
| -------- | ------- |
| 중간     | 진행 전 |

- [ ] 이메일 발송 서비스 설정 (Resend / SendGrid / Nodemailer)
- [ ] 이메일 템플릿 작성
  - [ ] 신청 접수 확인 이메일
  - [ ] 승인 완료 이메일
  - [ ] 반려 안내 이메일
- [ ] 이메일 발송 API

---

## 6. 소셜 로그인 + 댓글/리액션

| 우선순위 | 상태                                     |
| -------- | ---------------------------------------- |
| 중간     | ✅ 완료 (코드 구현 완료, 외부 설정 필요) |

### 소셜 로그인 (Supabase Auth)

- [x] Google OAuth 설정 (코드 구현 완료)
- [x] Kakao OAuth 설정 (코드 구현 완료)
- [x] Naver OAuth 설정 (코드 구현 완료, custom OIDC)
- [x] 로그인/로그아웃 UI (헤더에 로그인 버튼)
- [x] 로그인 상태 관리 (Context/Provider)

### 댓글

- [x] `comments` 테이블 설계 (대댓글: `parent_id` 자기참조)
- [x] 댓글 CRUD API
- [x] 댓글 목록 UI (기사 하단)
- [x] 대댓글 UI (1단계)
- [x] 댓글 수정/삭제 (본인만)
- [x] 욕설 필터링 (금칙어 서버 검증)
- [x] Rate Limiting (댓글 등록 제한)

### 이모티콘 리액션 (기사)

- [x] `article_reactions` 테이블 설계
- [x] 리액션 토글 API
- [x] 리액션 UI (기사 하단, 좋아요/웃겨요/슬퍼요/응원해요/놀라워요)

### 댓글 좋아요

- [x] `comment_likes` 테이블 설계
- [x] 좋아요 토글 API
- [x] 좋아요 UI

### 관리

- [x] 댓글 신고 기능
- [ ] 관리자 댓글 삭제/사용자 차단 (Phase 3 관리자 기능과 연계)

> 비로그인 사용자는 기사 읽기 + 댓글 보기만 가능
> 로그인 사용자만 댓글, 대댓글, 리액션, 좋아요 가능

---

## 7. 추가 기능

| 우선순위 | 상태    |
| -------- | ------- |
| 낮음     | 진행 전 |

### SNS/공유

- [ ] 카카오톡 공유 (SDK 키 설정 필요)
- [x] 트위터 공유
- [x] 페이스북 공유
- [x] Instagram 공유 (링크 복사 + Instagram 열기)
- [x] LinkedIn 공유
- [x] 링크 복사

### 광고

- [ ] Google AdSense 가입/승인
- [ ] 광고 컴포넌트 개발
- [ ] 광고 배치

---

## 8. 코드 품질 및 인프라

| 우선순위 | 상태    |
| -------- | ------- |
| 높음     | ✅ 완료 |

- [x] 환경 변수 중앙 검증 (`lib/env.ts`)
- [x] Full-Text Search 마이그레이션 (`supabase/migrations/001_full_text_search.sql`)
- [x] Supabase 마이그레이션 체계 구축 (`supabase/migrations/`)
- [x] Kakao SDK 타입 선언 (`types/kakao.d.ts`)
- [x] Rate Limiting fallback 개선 (store 크기 증가 + 정리 로직)
- [x] CI/CD 파이프라인 (`.github/workflows/ci.yml`)
- [x] `.env.example` 작성
- [x] README 작성

---

## 9. 배포

| 우선순위 | 상태    |
| -------- | ------- |
| 중간     | 진행 전 |

- [ ] Vercel 프로젝트 생성
- [x] 환경 변수 설정 (`.env.local` 생성 완료)
  - [x] `NEXT_PUBLIC_SUPABASE_URL`
  - [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [x] `SUPABASE_SERVICE_ROLE_KEY` (관리자 기능용, 설정 완료)
  - [ ] `NEXT_PUBLIC_KAKAO_JS_KEY` (카카오 공유 활성화 시 필요)
  - [ ] `NEXT_PUBLIC_SITE_URL` (프로덕션 도메인)
- [ ] 도메인 구매 및 연결
- [ ] SSL 인증서 확인

---

## 추천 진행 순서

```
Phase 1: MVP (최소 기능) ✅ 완료
─────────────────────────
1. Supabase 설정 + 테이블 설계
2. 기사 신청 → DB 저장 연동
3. 기사 목록/상세 → DB 조회 연동

Phase 2: 서비스 홈페이지 완성도 ✅ 완료
─────────────────────────
4. 기사 신청 API 엔드포인트
5. 카카오톡 공유 연동
6. 검색 기능
7. SEO (sitemap, robots.txt, OG 이미지, JSON-LD)
8. Rate Limiting (Supabase 기반)
9. 에러 모니터링 (구조화된 로거)
10. UI/UX 접근성 개선

Phase 3: 관리 기능 ✅ 완료
─────────────────────────
11. 관리자 로그인
12. 관리자 대시보드
13. 승인/반려 기능

Phase 4: 소셜 로그인 + 댓글/리액션 ✅ 완료
─────────────────────────
14. 소셜 로그인 (Google, Kakao, Naver)
15. 댓글 + 대댓글
16. 이모티콘 리액션 + 좋아요
17. 욕설 필터링 + 신고 기능

Phase 5: 부가 기능 + 배포 ← 현재
─────────────────────────
18. 이미지 업로드
19. 이메일 알림
20. 광고 연동
21. Vercel 배포 + 도메인

※ 코드 품질/인프라 (Phase 2 이후 완료)
─────────────────────────
- 환경 변수 검증, FTS, CI/CD, 마이그레이션, README, 타입 선언
```

---

## 활성화 필요 작업 (외부 설정)

코드 구현은 완료되었으나, 아래 외부 설정을 완료해야 해당 기능이 동작합니다.

### 관리자 기능 (Phase 3)

- [x] `.env.local`에 `SUPABASE_SERVICE_ROLE_KEY` 추가
- [x] Supabase SQL Editor에서 `002_admin_rls_and_updates.sql` 실행
- [x] Supabase Dashboard > Authentication > Users에서 관리자 계정 생성
- [x] `admins` 테이블에 관리자 이메일 INSERT

### 소셜 로그인 (Phase 4)

- [ ] Phase 4에 해당하는 커밋 내용을 자세히 검토하여 잘못 개발된 부분이나, 다양한 시각(UI/UX, 동시성, 보안, 최적화 등)에서의 문제점은 없는지 파악 후, 문제 발생 시 기능 수정 필요
- [ ] Supabase SQL Editor에서 `003_social_auth_and_interactions.sql` 실행
- [ ] **Google OAuth**: Google Cloud Console에서 OAuth 2.0 Client ID 발급 → Supabase Dashboard > Authentication > Providers > Google에 입력
- [ ] **Kakao OAuth**: Kakao Developers에서 앱 생성 + REST API 키 발급 → Supabase > Providers > Kakao에 입력
- [ ] **Naver OAuth**: Naver Developers에서 앱 생성 + Client ID/Secret 발급 → Supabase > Providers > Custom OIDC (naver)로 설정
- [ ] Supabase > Authentication > URL Configuration에서 Site URL과 Redirect URL(`{사이트URL}/api/auth/callback`) 추가

### 배포 시 (Phase 5)

- [ ] Vercel 환경 변수에 `SUPABASE_SERVICE_ROLE_KEY` 추가
- [ ] Vercel 환경 변수에 `NEXT_PUBLIC_SITE_URL` 추가 (프로덕션 도메인)
- [ ] 각 OAuth 프로바이더의 Redirect URI를 프로덕션 도메인으로 업데이트

---

## 참고 자료

- [Supabase 문서](https://supabase.com/docs)
- [Next.js 문서](https://nextjs.org/docs)
- [Vercel 배포 가이드](https://vercel.com/docs)
- [Resend 이메일 서비스](https://resend.com/docs)

---

_마지막 업데이트: 2026-04-04_
