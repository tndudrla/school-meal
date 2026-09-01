# Deep Interview Spec: 경기 수원시 102교 추가 (Stage 15)

## Metadata
- Interview ID: `di-suwon-20260902`
- Rounds: 2 (+ Round 0 토폴로지 게이트)
- Final Ambiguity Score: **7%**
- Type: brownfield
- Generated: 2026-09-02 (KST)
- Threshold: 0.2
- Threshold Source: default
- Initial Context Summarized: no
- Status: **PASSED**

## Clarity Breakdown

| Dimension | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| Goal Clarity | 0.95 | 0.35 | 0.33 |
| Constraint Clarity | 0.92 | 0.25 | 0.23 |
| Success Criteria | 0.90 | 0.25 | 0.23 |
| Context Clarity | 0.95 | 0.15 | 0.14 |
| **Total Clarity** | | | **0.93** |
| **Ambiguity** | | | **0.07** |

## Topology

| Component | Status | Description | Coverage |
|-----------|--------|-------------|----------|
| 수집·등록 | active | 수원 4구 102교 NEIS 추출 + host/mi 확보 + schools 파일 등록 | AC-1 ~ AC-5 |
| cron 그룹 분할 | active | `refresh-photos-suwon` 신설, 기존 경기 cron에 수원 제외 필터 | AC-6 ~ AC-9 |
| 파일 구조 재편 | active | `src/lib/schools/gyeonggi/suwon.ts` 신규, `suwon_` prefix | AC-3, AC-4 |
| 검증·운영 | active | cron 수동 실행 200, school-status 갱신, work-log Stage 기록 | AC-10 ~ AC-13 |

보류 컴포넌트 없음.

## Goal

경기도 수원시 초등학교 **102교**를 급식 사진 서비스에 등록한다. 수원은
`goesw.kr` 단일 도메인 101교로 기존 경기 4도시(`goeay.kr` / `goegu.kr`)와
인프라가 분리돼 있으므로, **수원 전용 사진 cron을 신설**하고 기존 경기 cron은
4도시 75교만 담당하도록 필터를 좁힌다. 파일은 서울 패턴을 따라 시별로 분리하고
id는 `suwon_` prefix를 붙인다.

## 사전 실측으로 확정된 사실 (추정 아님)

NEIS Open API (`ATPT_OFCDC_SC_CODE=J10`, `SCHUL_KND_SC_NM=초등학교`) 조회 결과:

| 항목 | 값 |
|---|---|
| 경기 J10 초등학교 전체 | 1,387교 |
| 수원시 초등학교 | **102교** |
| 권선구 | 34교 |
| 영통구 | 30교 |
| 장안구 | 22교 |
| 팔달구 | 16교 |
| `goesw.kr` 도메인 | 101교 (전원 `-e` 접미) |
| 예외 | 1교 — 중앙기독초등학교(사립, `www.suwoncca.org`, 영통구) |
| HMPG_ADRES 빈값 | 0교 |
| 기존 685교와 id 충돌 | 0건 (prefix 유무 무관) |
| 수원 내부 id 중복 | 0건 |

**스크래퍼 호환성 실측** — `gosaek-e.goesw.kr` (고색초) 대상 검증 완료:

- `main.do`에서 식단 링크 추출 성공: `/gosaek-e/ad/fm/foodmenu/selectFoodMenuView.do?mi=1315`
- 기존 `kind: 'goeay'` 폼 POST(`mi` + `sysId` + `schDt`)가 그대로 200 응답
- `parseWeekPhotos()` 파서가 thead 날짜 7개 / 중식행 td 7개를 정상 파싱
- 3개 주 샘플에서 사진 2·3·5장 추출 성공

→ **`schoolScraper.ts` 코드 변경 불필요.** `kind: 'goeay'` 재사용, host만 다름.

## Constraints

- **`goesw.kr`는 수원 단일 인프라** — work-log 도메인 위험도 표의 `sen.es.kr`과
  같은 "높음" 등급. 기존 경기의 도메인 분산 이점이 수원에는 없다.
- **기존 경기 4도시는 건드리지 않는다.** `gyeonggi.ts` 75교의 id(prefix 없음),
  region 문자열, scrape 설정 모두 그대로.
- **`runPhotoCron()` 헬퍼 재사용.** 새 region마다 로직 복사 금지 (Stage 14-31
  정착 패턴). 신규 라우트는 schools 필터 + label + runPrune만 주입.
- **`maxDuration = 800`** — work-log "안 할 것" 목록의 "보수적 300/600으로 시작"
  금지 조항. Pro 한도 끝까지.
- **chunk 30 유지** — `photoCronImpl.ts` 기본값. 축소는 batch 수만 늘려 역효과
  (Stage 14-28 교훈).
- **prune은 `refresh-photos-seoul-1`에만 남긴다.** 수원 cron은 `runPrune: false`.
- **중앙기독초는 `scrape` 생략.** 서울 명지초(`myongji.net`), 구로 천이초와 같은
  처리. 메뉴는 보이고 사진만 안 보이는 상태로 등록.
- **id 작명은 host subdomain 기반 + `suwon_` prefix.** `gosaek-e.goesw.kr` →
  `suwon_gosaek`. 약칭 host 13개(`dsw`, `swsg`, `swjc`, `hgok`, `omokk`,
  `cmschool`, `swkumgok`, `swgumho`, `swmaehwa`, `swsunil`, `swhwaseo`,
  `swhwayang`, `eui`)는 서울 확장 방식대로 학교명 발음 기반으로 해석한다.
- **작업 브랜치는 `dev`.** main 머지는 별도 판단.

## Non-Goals

- 경기 전체 1,300교 그룹 체계(`gyeonggiGroups.ts` 4분할) 선행 도입 — 수원 이후
  다른 시·군 추가 시점으로 미룬다.
- 기존 `gyeonggi.ts` 75교의 시·군별 파일 분리 — 수원만 새 구조로 가고 기존은 유지.
- 사진 안 잡히는 학교의 mi 보정 및 VERIFIED_REASONS 등재 — 후속 TODO.
- 수원 중·고등학교 — 이번 범위는 초등학교만.

## Acceptance Criteria

### 수집·등록

- [ ] **AC-1** NEIS J10에서 수원시 초등학교 102교의 `SCHUL_NM` / `SD_SCHUL_CODE` /
      `HMPG_ADRES`를 추출한다. `scripts/extract-seoul-hosts.mjs`는 B10 고정이므로
      J10 + 시 단위 필터를 받도록 일반화하거나 수원 전용 추출 스크립트를 만든다.
- [ ] **AC-2** 101교의 `mi`(식단 메뉴 ID)를 각 학교 `main.do`에서 정규식으로
      추출한다. `scripts/build-school-config.mjs`의 `--city 수원시` 모드가 이미
      J10 기본이므로 그대로 활용 가능한지 먼저 확인한다.
- [ ] **AC-3** `src/lib/schools/gyeonggi/suwon.ts` 신규 파일에 `SUWON_SCHOOLS`
      레코드를 작성한다. region은 `경기 수원`, id는 `suwon_<host subdomain>`.
- [ ] **AC-4** `src/lib/schools/index.ts`에 `SUWON_SCHOOLS` import + 병합 + 파일
      구조 주석 갱신.
- [ ] **AC-5** 중앙기독초등학교는 `scrape` 필드 없이 등록하고, 생략 이유를 코드
      주석에 남긴다.

### cron 그룹 분할

- [ ] **AC-6** `src/lib/cron/gyeonggiGroups.ts` 신규 — `seoulDistricts.ts` 패턴.
      `isSuwon(region)` / `isGyeonggiRest(region)` 헬퍼와 "두 함수의 합이 경기
      전체와 일치해야 한다"는 회귀 방지 주석을 포함한다.
- [ ] **AC-7** `src/app/api/cron/refresh-photos-suwon/route.ts` 신규.
      `maxDuration = 800`, `runPrune: false`, `label: 'suwon'`,
      `CRON_SECRET` 인증은 기존 라우트와 동일.
- [ ] **AC-8** 기존 `refresh-photos-gyeonggi` 라우트의 필터를 수원 제외로 좁히고
      `maxDuration`을 300에서 800으로 올린다. 두 cron이 같은 학교를 중복 처리하지
      않는다.
- [ ] **AC-9** `vercel.json`에 `refresh-photos-suwon` schedule 3개 추가
      (`30 4 * * *`, `0 7 * * *`, `0 10 * * *` — KST 13:30 / 16:00 / 19:00).
      총 cron entry 12 → 15.

### 검증·운영

- [ ] **AC-10** `npm run build` 통과.
- [ ] **AC-11** 배포 후 Vercel Dashboard에서 `refresh-photos-suwon`을 수동 Run 하여
      **200 응답**을 확인한다. wall time과 사진 미러 성공 수를 기록한다.
      (AGENTS.md의 "학교 추가 후 반드시 cron 수동 실행" 규칙)
- [ ] **AC-12** `scripts/generate-school-status.mjs`로 `docs/school-status.md`를
      갱신한다. 수원 102교의 사진 가능/불가 학교가 집계에 반영된다.
- [ ] **AC-13** `docs/work-log.md`에 Stage 15 항목을 추가한다. 최소 포함 내용:
      `goesw.kr` 세 번째 경기 도메인 발견, 기존 파서 호환 실측 결과, 수원 전용
      cron 분리 근거(단일 도메인 위험도), 기존 경기 cron `maxDuration` 300 → 800
      정정, 중앙기독초 scrape 생략.

## Assumptions Exposed & Resolved

| Assumption | Challenge | Resolution |
|------------|-----------|------------|
| 수원도 기존 경기와 같은 `goeay.kr`/`goegu.kr` 도메인일 것 | NEIS 실조회 | **틀림.** `goesw.kr` 세 번째 도메인. 101/102교 단일 인프라 |
| 새 도메인이면 스크래퍼 코드 추가가 필요할 것 | 실제 POST 요청으로 파싱 검증 | **불필요.** `kind: 'goeay'` 파서가 그대로 동작. host만 다름 |
| 수원 추가는 경기 cron에 얹으면 된다 | 도메인 단일성 = work-log "높음" 위험군 | **분리.** 수원 전용 cron 신설, 기존 경기는 4도시로 축소 |
| id 충돌 회피 로직이 복잡할 것 | 685교 전수 대조 | **충돌 0건.** 다만 미래 방어를 위해 `suwon_` prefix 채택 |
| 경기 cron `maxDuration 300`은 현재 적정값 | 서울은 Stage 14-33에서 800으로 올렸는데 경기만 누락 | **정정 대상.** 이번에 800으로 함께 올림 |
| 동시 trigger 부담 합산을 피하려면 시차가 필요할 것 | `goesw.kr`는 기존 세 cron과 도메인이 다름 | **시차 불필요.** 도메인이 달라 부담 합산 없음. 동일 schedule 유지 |

## Technical Context

**재사용하는 것 (변경 없음)**
- `src/lib/cron/photoCronImpl.ts` — `runPhotoCron()` 그대로
- `src/lib/schoolScraper.ts` — `kind: 'goeay'` 파서, union 타입 변경 불필요
- `src/lib/schools/gyeonggi.ts` — 기존 75교 무수정

**신규 생성**
- `src/lib/schools/gyeonggi/suwon.ts`
- `src/lib/cron/gyeonggiGroups.ts`
- `src/app/api/cron/refresh-photos-suwon/route.ts`

**수정**
- `src/lib/schools/index.ts` — import + 병합 + 주석
- `src/app/api/cron/refresh-photos-gyeonggi/route.ts` — 필터 축소, maxDuration 800
- `vercel.json` — cron entry 3개 추가
- `AGENTS.md` — "학교 추가 후 cron 수동 실행" 표에 수원 항목 추가
- `docs/work-log.md` — Stage 15
- `docs/school-status.md` — 자동 생성

**wall time 추정**
101교 ÷ chunk 30 = 4 batch. 경기 기존 실측이 75교 30~50초였으나 그때는 도메인
2갈래 분산 상태였다. `goesw.kr` 단일이면 서울 패턴에 가까워 batch당 30초까지
늘 수 있어 최대 ~120초 예상. `maxDuration 800` 이면 마진 충분.

## Ontology (Key Entities)

| Entity | Type | Fields | Relationships |
|--------|------|--------|---------------|
| SchoolConfig | core domain | id, name, level, region, neis, scrape | SUWON_SCHOOLS가 다수 보유 |
| GoeayScrapeTarget | core domain | kind, host, sysId, mi | SchoolConfig.scrape의 union 멤버 |
| CronGroup | supporting | region 필터 술어 | listSchools() 결과를 분할 |
| PhotoCronRoute | supporting | maxDuration, label, runPrune, schools | runPhotoCron()에 위임 |
| goesw.kr | external system | 수원 101교 공유 인프라 | 동시 부담의 단위 |

## Ontology Convergence

| Round | Entity Count | New | Changed | Stable | Stability Ratio |
|-------|-------------|-----|---------|--------|----------------|
| 0 | 4 (토폴로지 컴포넌트) | 4 | - | - | N/A |
| 1 | 5 | 2 | 0 | 3 | 60% |
| 2 | 5 | 0 | 0 | 5 | 100% |

2라운드에서 엔티티가 완전 수렴했다. 도메인 모델이 안정적이다.

## 권장 실행 순서

1. 추출 스크립트 J10/수원 대응 → 102교 원자료 확보 (AC-1, AC-2)
2. id 작명 확정 + 충돌 재검사 → `suwon.ts` 작성 (AC-3, AC-5)
3. `index.ts` 병합 → `npm run build` (AC-4, AC-10)
4. `gyeonggiGroups.ts` + 수원 라우트 + 경기 라우트 수정 + `vercel.json` (AC-6 ~ AC-9)
5. 배포 → cron 수동 Run 200 확인 (AC-11)
6. school-status 갱신 + work-log Stage 15 + AGENTS.md (AC-12, AC-13)

server-pc runbook 방식이 필요할 정도의 분량인지는 실행 시점에 판단한다. 102교는
서울 Phase B+C(251교)보다 작아 단일 세션 처리도 가능하다.

## Interview Transcript

<details>
<summary>Q&A (Round 0 + 2 rounds)</summary>

### Round 0 — 토폴로지 확인
**Q:** 최상위 컴포넌트 4개(수집·등록 / cron 분할 / 파일 구조 / 검증·운영)가 맞는가?
**A:** 4개 다 맞음

### Round 1
**Q1:** cron 구조 — 수원 전용 분리 / 단일 유지 / 경기 전체 그룹 체계?
**A1:** 수원 전용 cron 분리

**Q2:** 등록 범위 — 102교 한꺼번에 / 구 단위 4단계 / 1구 검증 후?
**A2:** 102교 한꺼번에

**Q3:** id·파일 — 시별 파일 + `suwon_` prefix / prefix 없음 / gyeonggi.ts append?
**A3:** 시별 파일 분리 + `suwon_` prefix

**모호도:** 26% (Goal 0.85, Constraints 0.75, Criteria 0.45, Context 0.90)

### Round 2
**Q4:** 완료 기준?
**A4:** 등록 + cron 200 + status 갱신

**Q5:** schedule / maxDuration?
**A5:** 동일 schedule + maxDuration 800

**Q6:** region 필터 분리 방식?
**A6:** 기존 cron에 수원 제외 필터 추가

**모호도:** 7% (Goal 0.95, Constraints 0.92, Criteria 0.90, Context 0.95)

</details>
