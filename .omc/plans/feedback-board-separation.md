# Plan: 개발 건의 보드 — /feedback 전용 페이지 분리 + 정돈

**Status: PENDING APPROVAL (합의 완료 — Architect APPROVE + Critic APPROVE, 2 iterations)**
**Source spec:** `.omc/specs/deep-interview-feedback-board.md` (모호도 9.5%, PASSED)
**Date:** 2026-08-03

## RALPLAN-DR Summary

### Principles
1. **완성도 > 기능** — 빈 상태를 만드는 신규 기능 금지. 조작 UI 는 데이터가 있을 때만 나타난다 (조건부 렌더)
2. **익명 모델 보존** — fingerprint cooldown + localStorage 토큰 방식 그대로
3. **메인 경량화** — 메인에는 진입 요소만. 추가되는 fetch 는 CDN 캐시로 흡수
4. **스키마 불변** — `feedback` 테이블·컬럼 변경 없음, 뱃지는 `admin_reply` 존재로 판정
5. **디자인 언어 일관성** — Gaegu, amber/orange 파스텔, 라운드 카드 유지

### Decision Drivers (top 3)
1. 메인 페이지 길이 축소 + **스크롤 트랩 제거** (`max-h-[420px] overflow-y-auto` 내부 스크롤이 모바일 페이지 스크롤을 가로챔 — Architect 발견)
2. 정돈된 UX — 진짜 페이지의 뒤로가기·URL 공유. PWA `display:'standalone'`(`manifest.ts:9`) 에서 오버레이는 안드로이드 백버튼이 앱을 종료시킴
3. 기존 기능 무회귀 — 작성·수정·삭제·추천·cooldown·피처플래그·API 하위 호환

### Viable Options
| Option | Pros | Cons | Verdict |
|---|---|---|---|
| **A. 라우트 페이지 `/feedback` + 프리뷰 분리** | 뒤로가기·URL 공유, 스크롤 트랩 제거, MealView 단순화. `layout.tsx:51` 공통 셸 덕에 페이지 추가 비용 최소 | OG·loading·prefetch 관리 필요 (Step 3 에서 처리) | **채택** |
| B. 풀스크린 오버레이 | 페이지 추가 없음 | URL 없음. **PWA 안드로이드 백버튼이 오버레이가 아니라 앱을 닫음** — 결정적 하자 | 기각 |
| C. 현 보드 그대로 이식 | 최소 작업 | 스크롤 트랩·50건 고정 등 "정돈" 목표 미달 | 기각 |

### Architect Synthesis (반영됨)
"정돈" = 요소 추가가 아니라 **요소 제거 + 조건부 노출**. 게시판 부품(탭·더보기)은 데이터가 그것을 정당화할 때만 나타나고, 글 수 표시처럼 역효과인 요소는 뺀다.

## Requirements Summary
- 메인 하단 인라인 보드(`MealView.tsx:263`) 제거 → **읽기 전용 프리뷰 카드**(추천 상위 2개 + 진입 버튼)로 교체
- 신규 페이지 `/feedback`: 정돈된 전용 보드 — 조건부 정렬 탭, 더보기(페이지네이션), 정돈된 빈 상태
- Non-goals: 댓글, 카테고리, 계정, 상태 라벨 스키마, 참여 유도 장치, 글 수 표시

## Implementation Steps

### Step 1 — API 확장 (하위 호환 + hasMore 계약)
**파일:** `src/app/api/feedback/route.ts:12-24`, `src/lib/feedback.ts:36-51`
- `GET /api/feedback` 쿼리 파라미터: `sort` (`top`|`recent`, 기본 `top`), `limit` (기본 50, 최대 50), `offset` (기본 0)
- **파라미터 검증 (Critic):** 인식 불가 값은 400 이 아니라 **기본값 폴백** — `sort` 미인식 → `top`, `limit`/`offset` 은 `parseInt` 후 NaN·음수 → 기본값, `limit` 은 1~50 clamp. `page.tsx:39` 의 정규식 실패 폴백 관례를 따름 (Supabase 에 오염값이 닿아 500 나는 경로 차단)
- **`listFeedback` 반환 계약 (명문화):** 시그니처를 `listFeedback(opts?: { sort?, limit?, offset? }): Promise<{ rows: FeedbackRow[]; hasMore: boolean }>` 로 변경
  - 내부적으로 `.limit(limit + 1)` 조회 → `hasMore = data.length > limit` → **`rows = data.slice(0, limit)`** (slice 누락 시 offset 이 영구히 1칸씩 어긋남)
  - `top`: 현행 `vote_count desc → created_at desc` 유지, `recent`: `created_at desc`
- 라우트 응답: `{ items: rows, hasMore, enabled: true }` — 무파라미터 GET 은 현행과 동일한 items (기본값 동일) + 추가 필드 `hasMore` 뿐이라 하위 호환. **비활성 분기(`route.ts:13-18`)도 `{ items: [], hasMore: false, enabled: false }` 로 통일** (계약 완결성 — 프리뷰가 `hasMore` 를 읽어도 `undefined` 없음)
- **캐시 분기 (Architect #8):** **GET 에 한해** `limit <= 2 && offset === 0 && sort === 'top'` (프리뷰 요청) 이면 `Cache-Control: s-maxage=60, stale-while-revalidate=300`, 그 외 GET 은 현행 `no-store` 유지 (`route.ts:22`). POST/PATCH/DELETE 응답 헤더는 불변. 작성 직후 보드 즉시 반영 필요성과 메인 fetch CDN 흡수를 양립 — AGENTS.md "NEIS 호출은 캐시로 흡수" 컨벤션과 동일 사고
- **인덱스 (확정 사실, Critic #3):** `stage12_feedback.sql` 확인 완료 — `feedback_vote_count_desc (vote_count desc, created_at desc) where hidden = false` 가 `top` 을 완벽 커버. **`recent` 전용 인덱스는 부재하나 현 규모(수십 건)에서 seq scan 비용 무시 가능 — 이번 단계에서 인덱스 추가 안 함.** 글 1000건 초과 시 `create index feedback_created_at_desc on feedback (created_at desc) where hidden = false` 를 Follow-ups 로 이관 (실행자 추가 조사 불필요)

### Step 2 — FeedbackBoard 를 전용 보드로 정돈 (조건부 강등 적용)
**파일:** `src/components/FeedbackBoard.tsx` (개편)
- **정렬 탭 (조건부):** **첫 로드 결과** 기준 `items.length >= 10` 일 때만 렌더. limit 20 이므로 총 글 수 ≥ 10 이면 첫 렌더부터 탭이 보이고, 10 미만이면 더보기도 존재하지 않아 **탭이 나중에 튀어나오는 레이아웃 점프 경로가 구조적으로 없음** (Critic ambiguity 해소 — 판정 기준 A, 전체 count 쿼리 불필요). 탭 전환 시 `sort` 재조회 + offset 리셋
- **더보기:** `hasMore` true 일 때만 버튼 렌더. `offset += limit` append (limit 20), append 시 id 기준 dedupe 1줄
- **글 수 표시: 도입하지 않음** (v1 에서 제거 — "의견 3개"는 활기 없음을 광고하는 역효과, Architect #5)
- **답변완료 뱃지: 보드에서는 도입하지 않음** — `admin_reply` 블록(`FeedbackBoard.tsx:434-450`)이 이미 답변을 크게 표시해 뱃지는 중복 신호. 뱃지는 프리뷰 전용 (Step 4)
- 빈 상태: 기존 한 줄(`FeedbackBoard.tsx:345-348`) → 이모지 + 안내 카드로 정돈
- `max-h-[420px] overflow-y-auto`(line 350) 제거 — 페이지 스크롤 사용, 모바일 스크롤 트랩 해소
- 유지: 입력 폼·cooldown·낙관적 추천·수정/삭제, localStorage 3키 이름 불변 (`votedFeedbackIds`, `lastFeedbackPostAt`, `feedbackEditTokens`)
- `enabled:false` null 렌더(line 287)는 유지 — Step 3 서버 분기로 사실상 죽은 경로지만 무해한 이중 방어로 존치 (실행자는 추가 작업 불필요, Critic minor #2)
- 참고: 탭 전환 중 늦게 도착한 응답이 화면을 덮는 레이스는 기존 `refresh()`(line 120-129)에도 있던 특성 — 이번 범위에서 신규 회귀 아님, 수정하지 않음

### Step 3 — `/feedback` 페이지 신설 + OG 명시
**파일 (신규):** `src/app/feedback/page.tsx`, `src/app/feedback/loading.tsx` / **수정:** `src/app/layout.tsx:14-24`
- **OG (Architect #1 Blocker):** `layout.tsx` metadata 에는 `openGraph` 키가 없어 "상속" 전제가 성립 안 함. 조치: `layout.tsx` 에 사이트 기본 `openGraph` 블록 신설 (`page.tsx:22-36` 의 무인자 분기와 동일 값 — 오늘의 급식 / 학교 급식 메뉴와 사진을 한눈에 / `/api/og`). 학교별 OG 는 page 세그먼트 `generateMetadata` 가 layout 을 덮으므로 기존 동작 유지 — 검증 단계에서 확인
- **렌더링 모드 (Critic #1 — 명시적 선택):** `feedback/page.tsx` 상단에 `export const dynamic = 'force-dynamic'` 선언. 근거: `process.env` 접근은 Request-time API 가 아니라서 (Next 16 `04-glossary.md:183-188`) 선언 없이는 **정적 프리렌더**되어 피처 플래그 분기가 빌드 시점에 고정됨. 명시 선언으로 플래그의 런타임(배포별 env) 반영을 보장하고, 아래 `loading.tsx` 의 존재 근거도 이 선언으로 성립
- `feedback/page.tsx` (서버 컴포넌트): metadata 에 `title: '개발 건의 — 오늘의 급식'` + **`openGraph` 블록 명시** (Critic #2 — layout 상속에 기대면 og:title 이 layout 기본값 '오늘의 급식'으로 덮임, `generate-metadata.md:1390-1416` inheriting 예제와 동일 구조): `openGraph: { title: '개발 건의', description: '학교 급식 앱에 바라는 점을 남겨주세요', images: [{ url: '/api/og' }], type: 'website', locale: 'ko_KR' }`. 본문: 상단 "← 메인으로" 링크 + `<FeedbackBoard />`
- **피처 플래그 (Architect #4):** 서버에서 `isFeedbackEnabled()`(`feedback.ts:31`, 순수 env 체크) 직접 분기 — `if (!isFeedbackEnabled()) return <안내카드 "지금은 의견 접수를 쉬고 있어요" />`. 클라이언트 null 렌더 감지 방식은 구현 불가라 폐기
- **`loading.tsx` (Architect #6):** `force-dynamic` 라우트는 prefetch 가 스킵되므로 링크 클릭 후 무반응 구간 방지용. `FeedbackBoard.tsx:336-344` 스켈레톤 재활용. (prefetch/loading 체감은 프로덕션 전용 — `prefetching.md:57`, dev 검증 시 혼동 주의)
- **`next/link` 최초 도입 (Architect #7):** 코드베이스에 사용처 0건 (기존 링크 전부 `<a href>`, `MealView.tsx:267,274`). AC "클라이언트 라우팅 이동" 충족에는 full reload 를 피하는 `next/link` 가 필수라 예외 도입 — 실행자는 기존 `<a>` 패턴과 다름을 인지할 것

### Step 4 — 메인 프리뷰 카드
**파일 (신규):** `src/components/FeedbackPreview.tsx` / **수정:** `src/components/MealView.tsx:10,263`
- mount 시 `GET /api/feedback?sort=top&limit=2` 1회 (Step 1 캐시 분기로 CDN 흡수)
- 읽기 전용: 상위 2개 본문 1줄 truncate + 추천수 + (있으면) 답변완료 뱃지. 프리뷰는 답변 본문이 안 보이므로 뱃지가 유일한 신호로 정당 (Architect #11 — 상위 2개에 답변 없으면 뱃지 미노출은 수용)
- 하단 "의견 보러가기 · 남기기 →" → `next/link` 로 `/feedback`
- **`enabled` 3-state (Architect #3):** 초기값 `null`(미확정) — 미확정/false/fetch 실패 시 **아무것도 렌더하지 않음**, 성공 응답의 `enabled:true` 에서만 카드 표시. 플래그 꺼진 배포에서 깜빡임(레이아웃 시프트) 방지. catch 에서도 명시적으로 비표시 확정
- 글 0개(enabled true): "첫 의견을 남겨주세요!" 한 줄 + 진입 버튼만
- `MealView.tsx` 의 `FeedbackBoard` import(line 10)/렌더(line 263) → `FeedbackPreview` 교체

### Step 5 — 문서화
**파일:** `docs/work-log.md`
- 새 Stage 항목: 결정 배경 (메인 경량화 + 완성도 + 스크롤 트랩), 채택/기각 옵션, 조건부 강등 원칙, OG layout 기본값 신설

## Risks and Mitigations
| Risk | Mitigation |
|---|---|
| 기존 API 호출부 회귀 | 무파라미터 GET 은 현행과 동일 items + 추가 필드뿐. `listFeedback` 시그니처 변경은 호출처가 `route.ts` GET 하나뿐임을 확인 후 진행 |
| localStorage 키/토큰 흐름 파손 | 키 이름·저장 구조 변경 금지. 수정/삭제/추천 로직은 UI 이동만 |
| 메인 초기 로드 fetch 1회 추가 | 프리뷰 요청 `s-maxage=60` CDN 캐시 + 실패 시 비표시 — 메인 경험 영향 없음 |
| `/feedback` OG 카드 깨짐 (Stage 1 사고 유형) | layout 기본 `openGraph` 신설로 해소. 검증 단계에서 학교별 OG 오버라이드 회귀 확인 필수 |
| 플래그 꺼진 배포에서 빈 페이지/깜빡임 | 페이지는 서버 분기 안내 카드, 프리뷰는 3-state 로 첫 페인트부터 비표시 |
| offset 페이지네이션 — `vote_count` 정렬 특성상 추천 유입 시 순서가 바뀌어 **항목 누락** 가능 (중복은 dedupe 로 방지, 누락은 못 막음) | 수십 건 규모에서 실해악 미미 — 수용. 정확한 서술로 기록 (Architect #9) |
| `force-dynamic` 선언으로 인한 prefetch 스킵 → 전환 무반응 | `loading.tsx` 스켈레톤으로 즉시 피드백 |

## Acceptance Criteria
- [ ] `/feedback` 진입 시 전용 보드 페이지, 브라우저 뒤로가기로 메인 복귀
- [ ] 메인 하단: 프리뷰(상위 최대 2개, 읽기 전용) + 진입 버튼만 — 전체 보드·입력 폼 소멸
- [ ] 프리뷰 버튼 → `/feedback` 클라이언트 라우팅 (full reload 없음)
- [ ] 정렬 탭: 항목 10개 미만이면 미노출, 이상이면 추천순↔최신순 전환 동작
- [ ] 더보기: `hasMore` true 일 때만 노출, 20개 단위 append, 중복 항목 없음
- [ ] 프리뷰: `admin_reply` 있는 항목에 답변완료 뱃지
- [ ] 글 0개: 정돈된 빈 상태 카드 (보드) / 한 줄 + 버튼 (프리뷰)
- [ ] 작성·수정·삭제·추천·30초 cooldown 기존과 동일 (localStorage 3키 불변)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` 미설정: 프리뷰 완전 비표시(깜빡임 없음), `/feedback` 은 서버 렌더 안내 카드 (`force-dynamic` 이므로 env 변경이 재배포 없이도 다음 요청부터 반영)
- [ ] 무파라미터 `GET /api/feedback` 하위 호환 (items 동일, hasMore 추가만)
- [ ] `/feedback` 의 `og:title` 이 정확히 `개발 건의` 로 표시 (layout 기본값 '오늘의 급식' 아님) + og:image 존재, 기존 학교별 OG 회귀 없음
- [ ] 보드 스크롤: 내부 스크롤 영역 없음 (페이지 스크롤만)

## Verification Steps
1. `npm run build` 통과 (타입·라우트 생성 확인)
2. `npm run dev` 수동 검증: 프리뷰 → /feedback → 뒤로가기, 정렬 탭(더미 데이터 10개 이상에서), 더보기, 작성→수정→삭제→추천 풀 사이클
3. `SUPABASE_SERVICE_ROLE_KEY` 제거 후 재기동 → 프리뷰 완전 비표시(네트워크 탭에서 깜빡임 확인), `/feedback` 안내 카드
4. `curl "localhost:3000/api/feedback"` vs `curl "localhost:3000/api/feedback?sort=top&limit=2&offset=0"` — 하위 호환 + 캐시 헤더 분기. 로컬에서는 **헤더 문자열 존재 확인까지만** 가능 (`s-maxage` 실동작은 CDN 영역). `?sort=garbage&limit=abc&offset=-1` 폴백(200, top 기본) 확인
5. OG 검증: `curl -s localhost:3000/feedback | grep 'og:title'` → `content="개발 건의"` 기대 문자열 확인 + 메인 `/?ymd=...&schoolId=...` 학교별 OG 회귀 확인
6. 모바일 뷰포트에서 /feedback 레이아웃·탭 터치·스크롤(트랩 없음) 확인

## ADR
- **Decision:** 인라인 보드를 라우트 페이지 `/feedback` 로 분리하고, 메인에는 읽기 전용 프리뷰만 남긴다. 보드 개선은 "요소 추가"가 아니라 "조건부 노출 + 제거" 원칙으로 정돈한다.
- **Drivers:** 메인 길이·스크롤 트랩 / PWA 뒤로가기·URL 공유 / 무회귀
- **Alternatives considered:** 풀스크린 오버레이 (PWA 백버튼이 앱을 종료 — 기각), 현 보드 그대로 이식 (정돈 목표 미달 — 기각), 풀 게시판화 (스펙 단계에서 기각 — 빈 기능이 완성도 훼손)
- **Why chosen:** `layout.tsx:51` 공통 셸로 페이지 추가 비용이 최소이고, 라우트 분리만이 스크롤 트랩 제거와 메인 경량화를 동시에 달성
- **Consequences:** 앱이 멀티 라우트가 됨 — OG 기본값(layout)·loading.tsx·prefetch 를 이번에 정비하므로 이후 라우트 추가 비용 하락. `next/link` 패턴 최초 도입
- **스펙 AC 의도적 변경 1건:** 스펙의 "전용 보드에 답변완료 뱃지" → 보드에서는 기각, 프리뷰 전용으로 이동. 근거: 보드에는 `admin_reply` 블록(`FeedbackBoard.tsx:434-450`)이 이미 답변을 크게 표시해 뱃지가 중복 신호 (Architect synthesis, 사용자 목표 "완성도"에 부합)
- **수용된 트레이드오프:** 프리뷰 캐시 60s 동안 방금 쓴 내 글이 메인 프리뷰에 안 보일 수 있음 — 의도된 수용 (보드 본체에는 즉시 반영되므로 작성 맥락에서 혼란 없음)
- **Follow-ups:** 글이 늘어 정렬 탭·더보기가 실사용되기 시작하면 total count 표시 재검토. 프리뷰 캐시 60s 가 체감되면 revalidate 조정. 글 1000건 초과 시 `recent` 정렬용 인덱스 추가 (`create index feedback_created_at_desc on feedback (created_at desc) where hidden = false`)

## Changelog
- **v2 (Architect 반영):** OG layout 신설 (#1), hasMore 반환 계약 명문화 (#2), 프리뷰 enabled 3-state (#3), 페이지 서버 분기 (#4), 정렬 탭 조건부·글수 제거·뱃지 프리뷰 전용 (#5), loading.tsx 추가 (#6), next/link 도입 명시 (#7), 프리뷰 캐시 분기 (#8), offset 위험 서술 정정 (#9), 인덱스 확인 추가 (#10), 프리뷰 뱃지 조건 인지 (#11)
- **v3 (Critic 반영):** `force-dynamic` 명시적 선택 — env≠동적렌더링 사실 정정 (#1), `/feedback` openGraph 명시 + og:title AC 구체화 (#2), 인덱스 확정 사실화 + Follow-ups 이관 (#3). 권장사항: 정렬 탭 기준 확정(첫 로드, 점프 경로 없음 논증), sort/limit/offset 폴백 규칙, 비활성 응답 hasMore 포함, no-store GET 한정, 스펙 AC 뱃지 변경 ADR 기록, 60s 캐시 트레이드오프 수용 기록, manifest.ts:9 정정, 레이스 컨디션 범위 외 명시
