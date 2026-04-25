# 🍱 학교 급식 벤치마크

학교 급식 메뉴와 사진을 모바일에서 예쁘게 보고, 카카오톡으로 공유했을 때
사진 카드가 그대로 박히는 Next.js 앱.

> **북극성**: 전국 초·중·고 학교의 급식을 한 곳에서 보고 공유. 단일 학교
> 가정·하드코딩·학교 서버 의존은 점진적으로 제거. 자세한 진척은
> [`docs/work-log.md`](docs/work-log.md).

## 데이터 소스 / 흐름

- **메뉴**: NEIS Open API (`mealServiceDietInfo`), 1시간 fetch 캐시 + Vercel CDN
- **사진**: 학교 홈페이지 → cron 으로 Supabase Storage 에 미러 (sharp 리사이즈,
  슬라이딩 윈도우 7일). 앱·OG 는 미러 우선, 미러 미스 시 학교 직접 폴백
- **OG 이미지**: 사진 있는 날은 미러 URL 로 307 redirect (사진 풀카드),
  사진 없는 날은 메뉴 텍스트 카드 ImageResponse 폴백

## 등록 학교

현재 `src/lib/schools.ts` 의 `SCHOOLS` 객체에 1개 등록 (청계초등학교).
새 학교 추가는 같은 객체에 한 항목 등록만 하면 끝 — 다른 파일을 건드리지 않는다.

## 기술 스택

- Next.js 16 (App Router, Turbopack)
- TypeScript, Tailwind CSS v4
- Supabase (Storage 미러 + Postgres)
- Vercel (Hobby — 함수 maxDuration 60s)

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
NEIS_API_KEY=                                        # 선택 (하루 1000회까진 무키 OK)
CRON_SECRET=                                         # Vercel Cron 보호
```

`SUPABASE_SERVICE_ROLE_KEY` 가 없으면 미러 단계가 자동 스킵돼 학교 직접 호출만
동작 (피처 플래그).

## 주요 경로

| 경로 | 설명 |
|---|---|
| `/?schoolId=chonggye&ymd=20260422` | 메인 페이지 (주 네비게이션 + 급식 카드) |
| `/api/meal?schoolId=chonggye&ymd=20260422` | NEIS 메뉴 프록시 (레거시 `?atpt=&school=` 호환) |
| `/api/meal/photo?schoolId=chonggye&ymd=20260422` | 미러 우선 + 학교 직접 폴백 사진 URL |
| `/api/og?schoolId=chonggye&ymd=20260422` | OG 이미지 (사진 있으면 307 redirect) |
| `/api/cron/refresh` | 모든 학교 NEIS 워밍 + 미러 + prune (`CRON_SECRET` 보호) |

## Vercel Cron

`vercel.json` 에 하루 2회 예약:
- UTC 23:00 (KST 08:00) — NEIS 메뉴 확정 시점
- UTC 06:00 (KST 15:00) — 학교 홈페이지 사진 업로드 시점

## 문서

- [`docs/work-log.md`](docs/work-log.md) — Stage 별 작업 이력·의사결정 기록
- [`AGENTS.md`](AGENTS.md) — 프로젝트 컨벤션 (코드 변경 전 한 번 읽을 것)
