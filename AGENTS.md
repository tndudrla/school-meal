<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

## 프로젝트 컨벤션

이 프로젝트에 코드를 추가·수정할 때 따라야 할 규칙. 이력·결정 배경은
`docs/work-log.md` 에 Stage 별로 누적돼 있다 — 큰 변경 전에 한 번 훑을 것.

### 스택

- Next.js 16 (App Router, Turbopack, `runtime = 'nodejs'`)
- TypeScript, Tailwind CSS v4 (`@import "tailwindcss"`)
- Supabase (Storage 미러 + meal_photos 테이블)
- Vercel (Pro 플랜 — 함수 maxDuration 800s 한도. 2026-04-26 Hobby 60s 에서 업그레이드)

### 학교 추가는 한 곳만 건드린다

새 학교는 `src/lib/schools.ts` 의 `SCHOOLS` 객체에 한 항목 등록으로 끝나야 한다.
`schoolScraper.ts` 같은 모듈에 학교별 상수를 박지 말 것. NEIS 만 지원하는
학교(다른 시도 도메인) 는 `scrape` 를 생략하면 메뉴는 보이고 사진은 안 보인다.

**학교 추가 후 반드시 cron 수동 실행** (Vercel Dashboard → Project →
Settings → Cron Jobs → 추가한 학교의 region 에 맞는 사진 cron 의 `Run` 버튼):
- 서울 학교 추가 → `/api/cron/refresh-photos-seoul`
- 경기 학교 추가 → `/api/cron/refresh-photos-gyeonggi`

새 학교의 미러를 즉시 채워, 사용자가 진입했을 때 학교 홈페이지 직접 호출이
일어나지 않게 함. NEIS 메뉴만 신선화하면 되는 경우는 `/api/cron/refresh-neis`
Run.

규칙 깜빡하면 cron 다음 회차(최대 5시간) 까지 그 학교만 학교 사이트에 직접
요청 가는 구간이 생긴다. 트래픽 폭증 시 학교 IP 차단 트리거.

> Stage 14-31 (2026-05-03) 부터 사진 cron 이 region 별로 추가 분리됐다 —
> NEIS 워밍은 `refresh-neis` 단일 (KST 08·14:30·17), 사진+미러는
> `refresh-photos-seoul` + `refresh-photos-gyeonggi` (둘 다 KST 13:30·16·19).
> 새 시·도 (예: 부산) 추가 시 동일 패턴으로 `refresh-photos-busan` 추가 +
> `vercel.json` schedule entry. prune (sliding window) 은 서울 cron 안에서만
> 수행 — 전 region 공통 작업.

### 사진은 미러 우선, 학교 직접은 폴백

- 앱(`/api/meal/photo`): 미러 hit → `source:'mirror'`, miss → 학교 직접 → null
- OG(`/api/og`): 미러 있으면 즉시 그 URL 로 **307 redirect** (사진 풀카드).
  미러 없으면 메뉴 텍스트 카드 ImageResponse. 학교 직접 폴백은 **없음**
  (Stage 1 카톡 OG 깨짐 사고의 근본 처방 — 학교 서버 응답 속도가 SPOF 였음).

### NEIS 호출은 캐시로 흡수

`fetch(neis, { next: { revalidate: 3600 } })` 가 박혀 있어 같은 (학교, ymd) 는
1시간 동안 캐시값. 응답에 `Cache-Control: s-maxage=3600` 도 같이 보냄.
`refresh-neis` cron 이 하루 3회(KST 08:00·14:30·17:00) 워밍하므로 NEIS 실호출은
학교·날짜당 하루 2~4회 수준.

### 사진 cron schedule (region 별 분리)

`refresh-photos-seoul` / `refresh-photos-gyeonggi` 둘 다 KST 13:30 / 16:00 / 19:00.
영양교사 점심 후 1차 업로드 (13:30) → 메인 업로드 후 (16:00) → 늦은 업로드
보충 + 저녁 트래픽 직전 (19:00). 사용자 진입 시점 (점심·저녁) 직전마다 미러
hit 률 최대화. 서울/경기 두 함수가 같은 시각에 parallel invocation.

### 미러 파이프라인의 운영 제약

- Vercel Pro 800s 함수 한도 — `refresh-photos-seoul` maxDuration 600 (chunk 30
  sequential, 약 280~315s 예상), `refresh-photos-gyeonggi` maxDuration 300 (75교
  로 약 30~50s 예상)
- 공통 핵심 로직 = `src/lib/cron/photoCronImpl.ts` 의 `runPhotoCron()`. 두
  라우트는 region filter 만 다름. 새 시·도 추가 시 라우트 한 줄.
- sharp 로 1280px / JPEG q=80 으로 리사이즈 (5MB → ~150KB, 97% 절감)
- 슬라이딩 윈도우 7일 — `refresh-photos-seoul` cron 마다 prune (`runPrune: true`).
  경기 cron 은 위임 (`runPrune: false`).
- `SUPABASE_SERVICE_ROLE_KEY` 가 없으면 모든 미러 함수가 no-op (피처 플래그)
- 학교당 동시 다운로드 5장 (`photoMirror.ts:CONCURRENCY`) + 다운로드 timeout 15초.
  Pro 한도 여유와 별개로 학교 서버 부담 완화 차원에서 유지.

### 의사결정은 work-log 에 남긴다

큰 변경(아키텍처, 운영 사고, 디자인 결정) 은 `docs/work-log.md` 에 새 Stage
항목으로 누적. 6개월 후 "왜 이렇게 했지" 추적이 가능하게. 코드만 고치고 끝내지
말 것.
