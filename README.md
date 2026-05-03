# 🍱 오늘의 급식

학교 급식 메뉴와 사진을 모바일에서 예쁘게 보고, 카카오톡으로 공유했을 때
사진 카드가 그대로 박히는 Next.js 앱.

> **북극성**: 전국 초·중·고 학교의 급식을 한 곳에서 보고 공유. 단일 학교
> 가정·하드코딩·학교 서버 의존은 점진적으로 제거. 자세한 진척은
> [`docs/work-log.md`](docs/work-log.md).

> **운영 방향성**: 비영리. 영양교사 선생님들에 대한 감사로 시작한 프로젝트.
> 광고·결제·유료 학교 등록 모두 안 함.

## 데이터 소스 / 흐름

- **메뉴**: NEIS Open API (`mealServiceDietInfo`), 1시간 fetch 캐시 + Vercel CDN
- **사진**: 학교 홈페이지 → cron 으로 Supabase Storage 에 미러 (sharp 1280px /
  JPEG q=80 리사이즈, 5MB → ~150KB). 슬라이딩 윈도우 7일.
  앱은 미러 우선 + 학교 직접 폴백, OG 는 미러 only (학교 폴백 없음)
- **OG 이미지**: 사진 있는 날은 미러 URL 로 307 redirect (사진 풀카드),
  사진 없는 날은 메뉴 텍스트 카드 ImageResponse 폴백
- **익명 피드백**: 개발 단계 한정 인앱 건의/추천 보드 (Supabase + RLS)

## 등록 학교

현재 76개교 (경기 안양·과천·의왕·군포). `src/lib/schools.ts` 의 `SCHOOLS` 에
한 항목 등록으로 추가. 다른 파일은 건드리지 않는다.

**학교 추가 후 반드시 cron 수동 실행** (Vercel Dashboard → Cron Jobs →
region 에 맞는 라우트 Run): 서울 학교 → `refresh-photos-seoul`, 경기 학교 →
`refresh-photos-gyeonggi`. 새 학교 미러 즉시 채우기 위함.

## 기술 스택

- Next.js 16 (App Router, Turbopack, `runtime = 'nodejs'`)
- TypeScript, Tailwind CSS v4 (`@import "tailwindcss"`)
- Supabase (Storage 미러 + meal_photos / feedback 테이블)
- Vercel Pro (함수 maxDuration 800s 한도)
- Vercel Web Analytics

## 개발

```bash
npm install
npm run dev
```

http://localhost:3000

## 환경 변수 (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co     # 미러 활성화 시 필수
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...     # 미러 활성화 시 필수 (읽기)
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...              # 미러 활성화 시 필수 (쓰기)
NEIS_API_KEY=                                        # 선택 (등록 시 일 100만건)
CRON_SECRET=                                         # Vercel Cron 보호
```

`SUPABASE_SERVICE_ROLE_KEY` 가 없으면 미러 단계가 자동 스킵돼 학교 직접 호출만
동작 (피처 플래그).

## 주요 경로

| 경로 | 설명 |
|---|---|
| `/` | 대표 URL (홈 학교 자동 적용, OG 는 일반 카드) |
| `/?schoolId=chonggye&ymd=20260422` | 학교/날짜 박힌 URL (OG 풍성 카드) |
| `/api/meal?schoolId=chonggye&ymd=20260422` | NEIS 메뉴 프록시 |
| `/api/meal/photo?schoolId=chonggye&ymd=20260422` | 미러 우선 + 학교 폴백 사진 URL |
| `/api/og?schoolId=chonggye&ymd=20260422` | OG 이미지 (사진 있으면 307 redirect) |
| `/api/week?schoolId=chonggye&ymd=20260422` | 주간 식단표 PNG (가정통신문용) |
| `/api/feedback` | GET 목록 / POST 익명 등록 |
| `/api/feedback/[id]/vote` | POST 추천 (fingerprint 중복 방지) |
| `/api/cron/refresh-neis` | 모든 학교 NEIS 메뉴 워밍 (`CRON_SECRET` 보호) |
| `/api/cron/refresh-photos-seoul` | 서울 학교 사진 미러 + sliding window prune (`CRON_SECRET` 보호) |
| `/api/cron/refresh-photos-gyeonggi` | 경기 학교 사진 미러 (`CRON_SECRET` 보호) |

## Vercel Cron

`vercel.json` 에 region 별 분리 예약 (Stage 14-31):

| 라우트 | KST | UTC | 목적 |
|---|---|---|---|
| `refresh-neis` | 08:00 | 23:00 (전일) | 아침 NEIS 메뉴 확정 시점 |
| `refresh-neis` | 14:30 | 05:30 | 점심 시점 메뉴 변경 흡수 |
| `refresh-neis` | 17:00 | 08:00 | 하교 시점 메뉴 신선화 |
| `refresh-photos-seoul` | 13:30 | 04:30 | 서울: 영양교사 1차 업로드 + 점심 트래픽 직전 |
| `refresh-photos-seoul` | 16:00 | 07:00 | 서울: 메인 업로드 시간대 통과 후 보충 |
| `refresh-photos-seoul` | 19:00 | 10:00 | 서울: 늦은 업로드 흡수 + 저녁 트래픽 직전 |
| `refresh-photos-gyeonggi` | 13:30 | 04:30 | 경기: 같은 schedule (parallel invocation) |
| `refresh-photos-gyeonggi` | 16:00 | 07:00 | 경기 |
| `refresh-photos-gyeonggi` | 19:00 | 10:00 | 경기 |

## PWA

- `manifest.webmanifest`, `icon`, `apple-icon` 자동 생성
- Android: `beforeinstallprompt` 캐치 → 인앱 설치 배너
- iOS: 단계별 모달 안내 (Safari → 공유 → 홈 화면 추가)
- 카카오톡 인앱 브라우저는 PWA 미지원이라 안내 차단

## 문서

- [`docs/work-log.md`](docs/work-log.md) — Stage 별 작업 이력·의사결정 기록 (Stage 13-4 까지)
- [`docs/backlog.md`](docs/backlog.md) — 미실행 후보 / 트래픽 폭증 대비 / 6000교 비용
- [`AGENTS.md`](AGENTS.md) — 프로젝트 컨벤션 (코드 변경 전 한 번 읽을 것)
