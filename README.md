# Daily TMI Post

당신의 특별한 순간을 뉴스 기사로 만들어드리는 서비스입니다.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase 프로젝트

### Setup

1. 저장소 클론:
   ```bash
   git clone https://github.com/<your-org>/daily-tmi-post.git
   cd daily-tmi-post
   ```

2. 의존성 설치:
   ```bash
   npm install
   ```

3. 환경 변수 설정:
   ```bash
   cp .env.example .env.local
   ```
   `.env.local`을 열어 Supabase 자격 증명을 입력합니다.

4. 데이터베이스 설정:
   `supabase/migrations/` 폴더의 SQL 파일을 순서대로 Supabase SQL Editor에서 실행합니다.

5. 개발 서버 시작:
   ```bash
   npm run dev
   ```

## Project Structure

```
app/                  # Next.js App Router 페이지
  api/submit/         # 기사 신청 API 엔드포인트
  news/[slug]/        # 기사 상세 페이지
  search/             # 검색 페이지
  articles/[category]/ # 카테고리별 목록
components/           # React 컴포넌트
lib/                  # 공유 유틸리티
  env.ts              # 환경 변수 검증
  supabase.ts         # Supabase 클라이언트 및 데이터 접근
  logger.ts           # 구조화된 에러 로거
  rate-limit.ts       # Rate Limiting (Supabase + 인메모리 fallback)
  types.ts            # TypeScript 타입 정의
  validation.ts       # 폼 유효성 검사
types/                # 글로벌 타입 선언
supabase/migrations/  # 데이터베이스 마이그레이션 파일
```

## Environment Variables

| 변수 | 필수 | 설명 |
|------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase 익명 키 |
| `SUPABASE_SERVICE_ROLE_KEY` | 관리자 기능 | Supabase 서비스 역할 키 |
| `NEXT_PUBLIC_SITE_URL` | 프로덕션 | 프로덕션 도메인 URL |
| `NEXT_PUBLIC_KAKAO_JS_KEY` | 선택 | 카카오 JavaScript SDK 키 |

## Scripts

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 시작 |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 프로덕션 서버 시작 |
| `npm run lint` | ESLint 실행 |

## Deployment

Vercel 배포:

1. GitHub 저장소를 Vercel에 연결
2. Vercel 대시보드에서 환경 변수 설정
3. 배포
