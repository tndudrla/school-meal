# 🍱 청계초등학교 급식 벤치마크

청계초등학교 급식 메뉴와 사진을 모바일에서 예쁘게 보여주는 Next.js 앱.

## 데이터 소스

- **메뉴**: NEIS Open API (`mealServiceDietInfo`)
- **사진**: 청계초 홈페이지 (`chonggye-e.goeay.kr`) 주간 식단 페이지 스크래핑

## 기술 스택

- Next.js 16 (App Router, Turbopack)
- TypeScript, Tailwind CSS v4
- Supabase (Phase 2에서 사용)
- Vercel (배포)

## 개발

```bash
npm install
npm run dev
```

http://localhost:3000 접속.

## 환경 변수 (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
NEIS_API_KEY=              # 선택 (하루 1000회까진 무키도 OK)
CRON_SECRET=               # Vercel Cron 보호용 (선택)
```

## 주요 경로

| 경로 | 설명 |
|---|---|
| `/` | 메인 페이지 (주 네비게이션 + 급식 카드) |
| `/api/meal?atpt=J10&school=7569109&ymd=20260413` | NEIS 메뉴 프록시 |
| `/api/meal/photo?ymd=20260413` | 학교 홈페이지 사진 URL 추출 |
| `/api/cron/refresh` | 캐시 예열 (Vercel Cron용, `CRON_SECRET`로 보호) |

## Vercel Cron 설정

`vercel.json` 에 하루 2회 예약:
- UTC 23:00 (KST 08:00) — NEIS 메뉴 확정 시점
- UTC 06:00 (KST 15:00) — 학교 홈페이지 사진 업로드 시점

Vercel 대시보드 → Settings → Environment Variables 에
`CRON_SECRET` 을 랜덤 문자열로 설정해두면 외부 호출을 막을 수 있음.

## 로드맵

- [x] Phase 1: 청계초 주간 메뉴 표시
- [x] Phase 2 (크롤러 버전): 학교 홈페이지 사진 연동
- [ ] Phase 3: 다른 학교 검색/추가 (경기도교육청 goeay.kr 템플릿 공유)
