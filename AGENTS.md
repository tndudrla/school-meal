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
- Vercel (Hobby 플랜 — 함수 maxDuration 60s 한도)

### 학교 추가는 한 곳만 건드린다

새 학교는 `src/lib/schools.ts` 의 `SCHOOLS` 객체에 한 항목 등록으로 끝나야 한다.
`schoolScraper.ts` 같은 모듈에 학교별 상수를 박지 말 것. NEIS 만 지원하는
학교(다른 시도 도메인) 는 `scrape` 를 생략하면 메뉴는 보이고 사진은 안 보인다.

**학교 추가 후 반드시 cron 수동 실행** (Vercel Dashboard → Project →
Settings → Cron Jobs → `/api/cron/refresh` 의 `Run` 버튼). 새 학교의 미러를
즉시 채워, 사용자가 진입했을 때 학교 홈페이지 직접 호출이 일어나지 않게 함.
규칙 깜빡하면 cron 다음 회차(최대 8시간) 까지 그 학교만 학교 사이트에 직접
요청 가는 구간이 생긴다. 트래픽 폭증 시 학교 IP 차단 트리거.

### 사진은 미러 우선, 학교 직접은 폴백

- 앱(`/api/meal/photo`): 미러 hit → `source:'mirror'`, miss → 학교 직접 → null
- OG(`/api/og`): 미러 있으면 즉시 그 URL 로 **307 redirect** (사진 풀카드).
  미러 없으면 메뉴 텍스트 카드 ImageResponse. 학교 직접 폴백은 **없음**
  (Stage 1 카톡 OG 깨짐 사고의 근본 처방 — 학교 서버 응답 속도가 SPOF 였음).

### NEIS 호출은 캐시로 흡수

`fetch(neis, { next: { revalidate: 3600 } })` 가 박혀 있어 같은 (학교, ymd) 는
1시간 동안 캐시값. 응답에 `Cache-Control: s-maxage=3600` 도 같이 보냄. cron 이
하루 3회(KST 08:00·14:30·17:00) 워밍하므로 NEIS 실호출은 학교·날짜당 하루 2~4회
수준. 14:30 은 영양교사 사진 업로드 골든타임(점심 후 1~2시) 직후 미러용.

### 미러 파이프라인의 운영 제약

- Vercel Hobby 60s 함수 한도 안에 끝나야 함 → 다운로드는 `Promise.all` 병렬
- sharp 로 1280px / JPEG q=80 으로 리사이즈 (5MB → ~150KB, 97% 절감)
- 슬라이딩 윈도우 7일 — 이전 사진은 cron 마다 prune
- `SUPABASE_SERVICE_ROLE_KEY` 가 없으면 모든 미러 함수가 no-op (피처 플래그)

### 의사결정은 work-log 에 남긴다

큰 변경(아키텍처, 운영 사고, 디자인 결정) 은 `docs/work-log.md` 에 새 Stage
항목으로 누적. 6개월 후 "왜 이렇게 했지" 추적이 가능하게. 코드만 고치고 끝내지
말 것.
