# Stage 15 — 경기 수원시 초등학교 102교 추가

- Plan ID: `suwon-expansion-stage15`
- Source spec: `.omc/specs/deep-interview-suwon-expansion.md` (ambiguity 7%, PASSED)
- Branch: `dev`
- Generated: 2026-09-02 (KST)
- Mode: consensus / RALPLAN-DR (SHORT)
- **Status: PENDING APPROVAL** — Planner/Architect/Critic 합의 완료 (Critic APPROVED, 3라운드).
  실행 착수 전 BLOCKING 결정 3건(중앙기독초 id / mi 실패 처리 방침 / 약칭 13개 id 검토)에
  사용자 답변 필요. 사용자의 명시적 실행 승인 전까지 소스 코드 변경 금지.

---

## Requirements Summary

경기도 수원시 초등학교 **102교**를 급식 사진 서비스에 등록한다. 수원은
`goesw.kr` 단일 도메인 101교(전원 `-e` 접미) + 사립 1교(중앙기독초,
`www.suwoncca.org`)로, 기존 경기 4도시(`goeay.kr` / `goegu.kr` 2갈래 분산)와
인프라가 분리돼 있다.

work-log "전국 확장 Lessons Learned"의 도메인 위험도 표에서 **단일 도메인 =
높음** 등급이므로, 수원 전용 사진 cron(`refresh-photos-suwon`)을 신설하고 기존
경기 cron은 4도시 75교만 담당하도록 필터를 좁힌다.

### 확정된 사용자 결정 (변경 금지)

| # | 결정 |
|---|---|
| 1 | 수원 전용 cron 신설. 기존 경기 cron은 4도시 75교로 축소 |
| 2 | 102교 한꺼번에 등록 (구 단위 분할 안 함) |
| 3 | 시별 파일 분리 + id `suwon_` prefix |
| 4 | 완료 기준 = 등록 + cron 수동 실행 200 + school-status 갱신 |
| 5 | 동일 schedule (KST 13:30/16:00/19:00) + `maxDuration = 800` |
| 6 | 기존 경기 cron에 수원 제외 필터 추가 (region 문자열 구조 유지) |

### 실측 확정 사실 (재조사 불필요)

- 수원 102교: 권선 34 / 영통 30 / 장안 22 / 팔달 16
- `goesw.kr` 101교, 예외 1교 중앙기독초(사립, 영통구)
- `HMPG_ADRES` 빈값 0교, 기존 685교와 id 충돌 0건, 수원 내부 중복 0건
- `kind: 'goeay'` 스크래퍼가 `goesw.kr`에서 그대로 작동 검증 완료
  (`gosaek-e.goesw.kr`, mi=1315, thead 7 / 중식행 td 7 파싱, 3개 주에서 2·3·5장 추출)
  → **`schoolScraper.ts` 코드 변경 불필요**

### 사전 조사에서 새로 발견된 사실 (스펙에 없던 것 — 계획에 반영됨)

| # | 발견 | 근거 | 영향 |
|---|---|---|---|
| F-1 | `build-school-config.mjs`의 `sysIdFromHost()`가 `goeay\|goegu\|sen.es.kr`만 매치. **`goesw.kr` 미지원** | `scripts/build-school-config.mjs:129-134` | 수원 101교 전부 "host 패턴 아님 → scrape 생략" 분기로 빠짐. AC-2가 그대로는 실패 |
| F-2 | `emitSchoolConfig()`가 `scrape: { host, sysId, mi }`만 출력. **`kind` 필드 없음** | `scripts/build-school-config.mjs:339-343` vs `schoolScraper.ts:21` | 스크립트가 `kind` 도입(Stage 14-1) 이전 버전. 출력물을 그대로 붙이면 TS 컴파일 에러 |
| F-3 | `idFromSysId()`에 prefix 옵션 없음 (`-e` / `cho` 접미 제거만) | `scripts/build-school-config.mjs:143-145` | `suwon_` prefix 자동 부여 불가 |
| F-4 | mi 추출이 **완전 sequential** (row 루프마다 `main.do` 1회, timeout 15s) | `scripts/build-school-config.mjs:394-405` | 101교 × 최대 15s = 최악 25분. 동시성/rate limit 없음 |
| F-5 | `extract-seoul-hosts.mjs`는 **`B10` 하드코딩** + `--district`만 인자 | `scripts/extract-seoul-hosts.mjs:46,21-29` | J10/시 단위로 쓰려면 인자화 필요 (AC-1이 이미 지적) |
| F-6 | `index.ts` 병합이 순수 object spread. **중복 id 조용히 덮어씀** — 런타임 가드도 빌드 에러도 없음 | `src/lib/schools/index.ts:86-113` | id 충돌은 build 통과 후 학교 소실로만 드러남. 명시적 검증 스텝 필요 |
| F-7 | **`gyeonggi.ts` 파일 + `gyeonggi/` 디렉터리 공존 가능** — tsc `moduleResolution: "bundler"`로 실증 (exit 0). `./gyeonggi` → `gyeonggi.ts`, `./gyeonggi/suwon` → 디렉터리 파일 | 임시 프로젝트 재현 테스트 | 스펙의 파일 구조가 기술적으로 성립. 단 가독성 리스크 존재 → Option 비교 대상 |
| F-8 | `generate-school-status.mjs`의 `regionOrder`에 **`경기 수원` 없음** | `scripts/generate-school-status.mjs:~205` | 수원이 서울 노원 뒤 맨 끝으로 정렬됨 (`!regionOrder.includes(r)` tail). 기능은 동작하나 문서 가독성 저하 |
| F-9 | `generate-school-status.mjs`는 학교당 **한 달 평일 전부**를 순차 probe | `scripts/generate-school-status.mjs:probeMonth` | 787교로 늘면 실행 시간 대폭 증가. dev 서버 상시 필요 |
| F-10 | `runPhotoCron()` 시그니처는 정확히 `{ schools, label, runPrune }` 3개. chunk 30은 내부 하드코딩 | `src/lib/cron/photoCronImpl.ts:23-41` | 스펙 가정과 일치. 라우트는 필터만 주입하면 됨 |
| F-11 | **`refresh-neis`에 region 필터가 없다** — `listSchools()` 전수를 **단일 `Promise.all`**로 처리(chunk 없음), `maxDuration = 300` | `src/app/api/cron/refresh-neis/route.ts` | 685교 × 2 = 1,370 동시 요청 → 787교면 **1,574 동시**. 스펙이 이 cron을 전혀 언급 안 함. NEIS rate limit / 300s 한도 미검증 |
| F-12 | `pruneOldPhotos()`는 **`ymd < cutoff` 날짜 기준** 삭제 (파일 목록 기준 아님) | `src/lib/photoMirror.ts:282-319` | **신규 수원 미러는 prune에 안전.** 이 우려는 종결됨 |
| F-13 | `idFromSysId()`가 `.replace(/-e$/,'')` **다음에** `.replace(/cho$/,'')`를 연쇄 적용 | `scripts/build-school-config.mjs:143-145` | `<name>cho-e` 형태 sysId는 **두 번 잘림**. 수원은 전원 `-e` 접미라 해당 케이스 유무 확인 필요 |
| F-14 | 중앙기독초는 `sysIdFromHost()` null → `buildOne()`이 id를 **`SCHUL_NM`(한글)** 으로 설정 | `scripts/build-school-config.mjs:275` | id가 `중앙기독초등학교`가 되어 URL 파라미터에 한글. **수동 로마자 id 부여 필수** |

---

### 숫자 규약 (모든 AC가 이 표를 참조한다)

스펙 곳곳에서 102 / 101 / 75 / 685가 혼용된다. 검증 AC가 이 혼동으로 실패하지
않도록 **여기서 한 번 고정**한다.

| 기호 | 값 | 의미 |
|---|---|---|
| `N_수원_등록` | **102** | `SUWON_SCHOOLS` entry 수 = NEIS 수원 초등학교 전체 |
| `N_수원_scrape` | **101** | `scrape` 보유 = `goesw.kr` 학교. 사진 cron이 실제로 도는 수 (`scrapableSchools`) |
| `N_수원_noscrape` | **1** | 중앙기독초 (사립) |
| `N_경기4도시_등록` | **75** | 과천 6 / 의왕 15 / 안양 41 / 군포 13 |
| `N_경기4도시_scrape` | **75** | 실측 2026-09-02 — 4도시 **전원** `scrape` 보유. entry 75 / `scrape:` 75 / `kind: 'goeay'` 75 모두 일치 |
| `N_기존전체` | **685** | 경기 75 + 서울 610 |
| `N_최종전체` | **787** | 685 + 102 |
| `N_경기전체_등록` | **177** | 75 + 102 |

| `N_경기4도시_과천` / `의왕` / `안양` / `군포` | **6 / 15 / 41 / 13** | region별 실측 (AC-15 개별 검증용) |

> 주의 1: `refresh-photos-suwon` 응답의 `schools` 배열 길이는 `N_수원_scrape`
> 이다(102가 아니다). `runPhotoCron()`이 `scrape` 없는 학교를 먼저 걸러내기 때문.
>
> 주의 2: **`N_수원_scrape`의 확정값은 Step 1 이후에 정해진다.** 아래 `M` 정의 참조.

### `M` — 수원 scrape 보유 학교 수 (Step 1 실측 후 확정)

스펙은 101을 전제하나, mi 추출에 실패한 학교는 `scrape`가 붙지 않으므로
**정상 진행 시에도 101이 안 나올 수 있다**. 기대값을 상수로 박으면 게이트가
거짓 실패한다. 따라서 `M`으로 파라미터화한다.

```
M = goesw.kr host 학교(101) 중 mi 추출에 성공한 학교 수
```

- Open Question 2 분기 (a) **이번에 mi 보정** → `M = 101`
- Open Question 2 분기 (b) **후속으로 미룸** → `M = Step 1 실측값` (101 미만 가능)

**어느 분기든 `M > 0`은 hard gate.** `M == 0`이면 R-5(goesw 미매칭)가 발생한
것이며 즉시 중단한다. `M`이 확정되기 전에는 Step 2 이후로 진행하지 않는다.

---

## RALPLAN-DR

### Principles

1. **실측만 신뢰한다.** 스크래퍼 호환성·id 충돌·102교 카운트는 이미 실측 완료.
   나머지(도메인 패턴 매칭, 출력 형식)도 추정 대신 스크립트 실행 결과로 확인한다.
2. **기존 685교는 무손상.** 경기 75교 / 서울 610교의 **id · region · scrape ·
   entry 개수**가 이번 변경에서 바뀌지 않는다. 허용되는 예외는 정확히 셋:
   (a) 경기 라우트의 필터 술어, (b) 경기 라우트의 `maxDuration` 숫자,
   (c) `gyeonggi.ts` **상단 주석 블록**(디렉터리 공존 방어 주석 — 코드 라인 무변경).
   - 게이트: `git diff src/lib/schools/gyeonggi.ts`가 **주석 라인만** 포함하는지
     확인. 학교 데이터 라인이 한 줄이라도 잡히면 중단
3. **공통 헬퍼 재사용, 로직 복제 금지.** `runPhotoCron()`은 그대로. 새 라우트는
   schools 필터 + label + runPrune만 주입 (Stage 14-31 정착 패턴).
4. **cron 커버리지에 빈틈도 겹침도 없다.** 모든 경기 학교는 정확히 하나의 cron에
   속한다. 필터 분리와 학교 등록의 배포 순서가 이 불변식을 깨지 않게 한다.
5. **maxDuration은 Pro 한도 끝까지 (800).** work-log "안 할 것" 목록의 명시 조항.

### Decision Drivers (top 3)

| # | Driver | 이유 |
|---|---|---|
| D-1 | **`goesw.kr` 단일 도메인 동시 부담** | 101교가 한 인프라 공유. work-log 도메인 위험도 "높음". Stage 14-32의 504 재발 방지가 cron 분리·800의 근거 |
| D-2 | **기존 685교 회귀 제로** | 서비스 운영 중. 경기 필터 변경이 4도시 75교를 누락시키면 즉시 사진 미러 중단 |
| D-3 | **확장 반복 비용** | 수원 다음은 경기 나머지 ~1,200교. 이번에 만드는 파일 구조·id 규칙·스크립트 개선이 다음 시·군에서 그대로 재사용돼야 함 |

### Viable Options

#### 옵션군 A — 파일 구조

**A-1. `gyeonggi/` 디렉터리 신설, `gyeonggi.ts` 파일은 그대로 (스펙 채택안)**

경로: `src/lib/schools/gyeonggi.ts` (기존 75교) + `src/lib/schools/gyeonggi/suwon.ts` (신규)

- Pros
  - 스펙/사용자 결정 3에 정확히 부합. 서울 `seoul/` 디렉터리 패턴과 표면상 일치
  - 기존 `gyeonggi.ts` 무수정 → 회귀 위험 0
  - **기술적으로 성립함이 실증됨** (F-7): tsc bundler 해석에서 파일이 디렉터리보다 우선, `./gyeonggi/suwon`도 정상 해석. exit 0
- Cons
  - **같은 이름의 파일과 디렉터리가 나란히 존재** — 사람에게 혼란스럽고, "경기 학교는 어디 있나"의 답이 두 곳
  - 향후 `gyeonggi/index.ts`를 누가 추가하면 `./gyeonggi` 해석이 뒤집힐 수 있는 잠재 함정 (지금은 없지만 방어 주석 필요)
  - 일부 에디터/툴체인(비-bundler 해석기, 일부 lint 플러그인)에서 경고 가능성

**A-2. `gyeonggi.ts` → `gyeonggi/` 디렉터리로 완전 전환**

경로: `gyeonggi.ts` 삭제 → `gyeonggi/anyang.ts`, `gyeonggi/gwacheon.ts`, `gyeonggi/uiwang.ts`, `gyeonggi/gunpo.ts`, `gyeonggi/suwon.ts`

- Pros
  - 서울 패턴과 **진짜로** 동일. 이름 충돌 없음. 구조적으로 가장 깨끗
  - 경기 1,200교 확장 시 이 구조가 결국 필요해짐 — 지금 하면 나중에 안 해도 됨
- Cons
  - **스펙 Non-Goals 명시 위반** — "기존 `gyeonggi.ts` 75교의 시·군별 파일 분리"는 이번 범위 밖
  - 75교를 4파일로 쪼개는 순수 이동이지만 diff가 커져 리뷰 부담 + 이동 중 누락 리스크
  - `index.ts` import가 1개 → 5개로 증가, `GYEONGGI_SCHOOLS` 심볼 소멸(파급 확인 필요)

**A-3. `src/lib/schools/suwon.ts` — schools/ 직속 평면 배치**

경로: `src/lib/schools/suwon.ts`

- Pros
  - 이름 충돌 원천 차단. 가장 단순
  - 기존 `gyeonggi.ts` 무수정
- Cons
  - **시·도 계층이 사라짐** — 서울은 `seoul/`, 경기는 평면이라 비대칭
  - 경기 시·군이 늘면 `schools/` 루트가 파일 수십 개로 오염
  - 사용자 결정 3("시별 파일 분리")의 의도인 계층 구조와 어긋남

**권장: A-1** (사용자 결정 3 + F-7 실증 + 회귀 0). A-2로 가는 마이그레이션은
경기 나머지 시·군 추가 시점의 후속 Stage로 명시적 기록. A-1 채택 시
`gyeonggi.ts` 상단과 `gyeonggi/suwon.ts` 상단 **양쪽에** "동명 파일/디렉터리
공존은 의도된 것이며 `gyeonggi/index.ts`를 만들면 안 된다"는 방어 주석을 남긴다.

#### 옵션군 B — id 작명

**B-1. `suwon_<host subdomain>` (스펙 채택안)**

예: `gosaek-e.goesw.kr` → `suwon_gosaek`

- Pros
  - 서울 `seoul_` prefix 패턴과 일관. 사용자 결정 3에 부합
  - 시 단위 네임스페이스 → 경기 확장 시 `hwaseong_`, `yongin_` 등으로 자연 확장
  - 미래 충돌 방어 (현재 충돌 0건이지만 1,200교 확장 시 동명 학교 다수 예상)
- Cons
  - 기존 경기 75교는 prefix 없음 → **경기 내부에서 두 규칙 공존** (`chonggye` vs `suwon_gosaek`)
  - URL이 길어짐 (`/?schoolId=suwon_gosaek`)
  - 약칭 host 13개(`dsw`, `swsg`, `swjc`, `hgok`, `omokk`, `cmschool`, `swkumgok`,
    `swgumho`, `swmaehwa`, `swsunil`, `swhwaseo`, `swhwayang`, `eui`)는 발음 기반
    수동 해석 필요 → 사람 판단 개입 지점

**B-2. prefix 없이 `<host subdomain>` (기존 경기 75교와 동일 규칙)**

예: `gosaek`

- Pros
  - 경기 전체가 한 규칙 → 내부 일관성
  - URL 짧음. 기존 경기 학교와 구별 없이 매끄러움
- Cons
  - **사용자 결정 3 위반**
  - 경기 1,200교 확장 시 동명 학교(중앙초, 신흥초 등) 충돌 확률 급상승.
    F-6 때문에 충돌이 **조용히 학교를 삭제**함 — 발견이 어려운 사고 유형
  - 나중에 prefix를 도입하면 URL이 깨져 기존 공유 링크 무효화

**B-3. `gyeonggi_suwon_<sub>` — 시·도 + 시 2단 prefix**

- Pros
  - 전국 확장 시 가장 명확한 네임스페이스
- Cons
  - URL 과도하게 김. 서울이 `seoul_`(시·도 1단)인데 경기만 2단이라 비대칭
  - 실익 없음 — 시 이름은 전국에서 사실상 유일

**권장: B-1**. 약칭 13개는 별도 매핑 표를 계획 실행 중 만들어 코드 주석에 남긴다.

#### 옵션군 C — 학교 원자료 수집 방법 (F-1~F-4 대응)

**C-1. `build-school-config.mjs`를 일반화 (goesw 패턴 + `kind` + `--id-prefix` + 동시성)**

- Pros
  - 다음 경기 시·군에서 그대로 재사용 (D-3에 직접 부합)
  - `kind` 누락(F-2)은 **기존 스크립트의 실제 버그** — 고치면 다른 사용자도 이득
- Cons
  - 공용 스크립트 수정 → 기존 `--names` 경로 회귀 위험 (기존 학교 재생성에 쓰일 수 있음)
  - 작업량 증가

**C-2. `scripts/build-suwon-config.mjs` 전용 스크립트 신규 작성**

- Pros
  - 기존 스크립트 무손상 → 회귀 0
  - goesw 전용 가정을 마음껏 박아도 됨
- Cons
  - 코드 중복. 다음 시·군에서 또 새 스크립트 (D-3 위반)
  - `kind` 버그(F-2)가 원본에 남아 다음 사람이 또 밟음

**권장: C-1**, 단 하위호환 방식으로. 기존 `goeay`/`goegu`/`sen.es.kr` 분기는
그대로 두고 `goesw` 분기를 **추가**만 한다. `kind` 필드는 host 패턴에서 파생해
출력하고, `--id-prefix`는 기본값 빈 문자열이라 미지정 시 기존 동작 유지.
AC-1의 `extract-seoul-hosts.mjs` 일반화도 같은 방침(`--atpt` 추가, 기본 B10 유지).

#### 옵션군 D — cron 구조 (이번 Stage의 핵심 결정)

**D-1. 기존 `refresh-photos-gyeonggi` 통합 유지 + `maxDuration` 800으로 상향**

수원 102교를 기존 경기 cron이 함께 처리. 필터는 `startsWith('경기 ')` 그대로.

- Pros
  - **cron entry 12 유지** — `vercel.json` 무수정, Dashboard 단순
  - **새 파일 0개** — `gyeonggiGroups.ts`, 신규 라우트 모두 불필요. 변경 파일 2개로 축소
  - **177교는 work-log 경기 권장 상한 500의 35%** — 도메인 위험도 표 기준으로
    분할 임계에 한참 못 미친다
  - **Stage 14-33이 800의 안전성을 실증** — 서울 304/306교가 341s/385s로 완주.
    177교는 그 절반 규모라 800 안에서 안전 마진이 크다
  - 배포 원자성 문제(R-2/AC-18)가 대폭 완화 — 필터를 안 건드리므로 학교 등록만
    배포해도 커버리지 구멍이 안 생긴다
- Cons
  - **폭발 반경 공유** — `goesw.kr`이 미검증 인프라인데 문제가 생기면 경기 4도시
    75교까지 같은 함수에서 말려든다. 한 학교의 hang이 전체 wall time을 밀어올린다
  - 관측 혼재 — `[cron-photos-gyeonggi]` 로그에 두 도메인 통계가 섞여
    `goesw.kr` 고유 거동을 분리 측정할 수 없다
  - 수원이 문제를 일으켜도 경기 4도시를 함께 롤백해야 한다

**D-2. 수원 전용 cron 신설 + 기존 경기는 4도시로 축소 (채택안)**

- Pros
  - **격리 관측** — `[cron-photos-suwon]` 로그로 `goesw.kr` 고유 wall time·성공률을
    독립 측정. 미검증 인프라에 대한 첫 실사용 데이터를 오염 없이 얻는다
  - **폭발 반경 격리** — 수원이 실패해도 경기 4도시는 무영향. 롤백 단위가 분리됨
  - `gyeonggiGroups.ts`가 R-1 발생 시 수원 재분할의 확장점을 미리 제공
- Cons
  - 파일 3개 신규 + cron entry 3개 증가
  - **배포 원자성 요구 발생** — 필터와 학교 등록이 분리돼 AC-18이 필요해짐
  - 같은 시각 4-way 동시 invocation (R-14)

**D-3. 경기 전체 그룹 체계(`gyeonggiGroups.ts` 4분할) 선행 도입**

- Pros: 1,300교 확장의 최종 구조를 지금 확보
- Cons: **스펙 Non-Goals 명시 위반.** 177교 시점에 4분할은 과잉 — batch 수가
  그룹당 2 이하로 쪼개져 함수 호출 오버헤드만 늘어난다

**채택: D-2 — 사용자 결정 1에 의한 것이다.**
기술적으로는 D-1도 800 조건에서 안전하다(위 Pros 참조). D-2를 고르는 근거는
wall time이 아니라 **미검증 인프라의 격리 관측 + 폭발 반경 분리**다.

---

## Acceptance Criteria

스펙 AC-1~AC-13 계승 + 발견사항 반영 신규 AC-14~AC-17. 각 항목은 검증 명령/관찰
가능한 결과를 명시한다.

### 수집·등록

- **AC-1** `scripts/extract-seoul-hosts.mjs`에 `--atpt` 인자를 추가한다(기본값
  `B10` 유지 = 기존 호출 무영향). `--atpt J10 --district 수원시`로 실행 시
  stdout에 `<학교명>\t<host>\t<schoolCode>` **102줄**이 나온다.
  - 검증: 출력 줄 수 == 102. `goesw.kr` 포함 줄 == 101. 나머지 1줄이 `suwoncca.org`
  - 검증: `--district 서초구`(atpt 미지정) 실행 시 기존과 동일하게 서초 24교 출력

- **AC-2** `scripts/build-school-config.mjs`를 확장한다:
  - `sysIdFromHost()`에 `goesw.kr` 패턴 추가 (F-1)
  - `emitSchoolConfig()`가 `kind` 필드를 출력 (F-2) — host 패턴에서 파생
    (`goeay|goegu|goesw` → `'goeay'`, `sen.es.kr` → `'sen-es'`)
  - `--id-prefix <s>` 인자 추가, 기본값 `''` (F-3)
  - mi 추출에 동시성 상한 5 + 학교 간 최소 간격 도입 (F-4) — `photoMirror.ts`의
    `CONCURRENCY = 5`와 동일한 보수적 값
  - 검증: `--atpt J10 --city 수원시 --id-prefix suwon_` 실행 결과 stdout에
    SchoolConfig 블록 102개. 그중 `scrape:` 있는 블록에 **모두 `kind: 'goeay'` 포함**
  - 검증: 실행 wall time이 15분 이내 (동시성 5 기준 101교). 총 소요 시간 기록
  - 검증(회귀): `--names` 모드를 기존 학교 3개(청계초 등, goeay/goegu/sen-es 각 1)로
    실행해 이전 출력과 **동일**. `--id-prefix` 미지정 시 기존 id 규칙 유지

- **AC-2b (신규, 필수 산출물)** **mi 추출 실패 학교 목록**을 파일로 남긴다.
  스크립트는 실패를 stderr `[warn] <학교명> — mi 추출 실패 (<사유>)`로만 흘리므로
  캡처하지 않으면 사라진다.
  - 산출물: `docs/suwon-mi-failures.md` (또는 work-log Stage 15 내 표) —
    학교명 / host / sysId / 실패 사유 컬럼
  - 실행: `... --city 수원시 --id-prefix suwon_ > raw.txt 2> warn.txt` 로 stderr 분리
  - **`M`을 여기서 확정한다**: `M = 101 - (mi 실패 학교 수)`
  - 이 목록 없이는 `M` 검증도, Open Question 2 분기 (b)의 후속 보정 작업도
    불가능하다. AC-3 / AC-11 / V-1 / V-3의 기대값이 전부 `M`에 의존한다

- **AC-2c (신규, F-13 대응)** `idFromSysId()`의 `-e` → `cho` 연쇄 strip이 수원
  sysId를 이중 절단하지 않는지 확인한다.
  - 산출물: Step 1 raw 출력에서 `grep -E "sysId: '[a-z0-9-]*cho-e'"`로 해당
    학교를 추출한 목록. **0건이면 그 사실을 기록**하고 통과
  - 0건이 아니면: 해당 학교 각각에 대해 `sysId` → 최종 `id` 변환 결과를
    **학교명과 나란히 표로** `suwon.ts` 주석에 기입한다. 이중 절단된 id
    (예: `hancho-e` → `han`)는 수동 교정 후 교정 사유를 같은 표에 남긴다
  - (초기 계획의 "수동 검토했음이 주석으로 기록됨" 가지는 삭제 — 실행자가
    자기에게 발급하는 통과증이라 게이트로 기능하지 않는다)

- **AC-3** `src/lib/schools/gyeonggi/suwon.ts` 신규. `SUWON_SCHOOLS: Record<string, SchoolConfig>`
  export. 102 entry.
  - 검증: `grep -cE "^  suwon_[a-z0-9_]+: \{" src/lib/schools/gyeonggi/suwon.ts` == 102
  - 검증: `grep -c "region: '경기 수원'" src/lib/schools/gyeonggi/suwon.ts` == 102
  - **검증 (R-5 전용 게이트, 최우선)** — scrape 라인에 앵커한 **단일 명령**:
    ```
    grep -cE "^    scrape: \{ kind: 'goeay', host: '[a-z0-9-]+\.goesw\.kr'" $S   # == M
    ```
    `emitSchoolConfig()`(`build-school-config.mjs:340-342`)가 scrape를 **한 줄로**
    출력하므로 host와 `kind`를 이 한 줄로 동시에 검증할 수 있다. `M == 0`이면 즉시 중단
  - **`grep -c "goesw.kr"`처럼 파일 전체를 세는 방식은 쓰지 말 것.** AC-3 자신이
    파일 상단에 `goesw.kr`을 언급하는 방어 주석을 요구하므로 주석 줄이 함께
    잡힌다. 실측 재현: 헤더 주석 1줄 + entry 1개 파일에서
    `goesw.kr` = **2** vs `kind: 'goeay'` = **1**로 어긋난다. 두 카운트의 등식을
    게이트로 걸면 **정상 파일에서 확정적으로 hard stop**이 난다 (확률이 아니라 확정)
  - 검증: 파일 상단 주석에 A-1 방어 주석(“`gyeonggi/index.ts` 금지”) 포함
  - 검증: 약칭 host 13개의 학교명↔id 매핑 근거가 주석에 기록됨

- **AC-4** `src/lib/schools/index.ts`에 `import { SUWON_SCHOOLS } from './gyeonggi/suwon';`
  추가 + spread에 `...SUWON_SCHOOLS,` 추가 + 파일 구조 주석에 수원 항목 추가.
  - 검증: `listSchools().length` == **787** (685 + 102)
  - 검증: `Object.keys(SCHOOLS).filter(k => k.startsWith('suwon_')).length` == 102

- **AC-5** 중앙기독초등학교는 `scrape` 필드 없이 등록. 생략 이유를 코드 주석에
  기록 (사립 `www.suwoncca.org` — goeay/sen-es/sajip-bbs 어느 스크래퍼에도
  해당 없음. 서울 명지초·구로 천이초와 동일 처리).
  - 검증: 해당 entry에 `scrape` 키 부재 + 바로 위 줄에 사유 주석
  - **검증(F-14 필수)**: id가 **로마자**여야 한다. 스크립트는 `sysId`가 null이면
    id를 `SCHUL_NM`(한글 `중앙기독초등학교`)으로 설정하므로 그대로 두면 URL
    파라미터에 한글이 박힌다. `grep -cE "^  suwon_[a-z0-9_]+: \{" suwon.ts` == 102
    (= 전체 entry 수)로 102개 전부가 ASCII id임을 확인. 한글 id 0건
    (`grep -P`는 이 환경에서 미지원 — locale 문제로 exit 2. `-E`만 사용할 것)
  - id는 배포 후 공유 링크에 영구 고착되므로 커밋 전 확정 (Open Questions 참조)

- **AC-14 (신규, F-6 대응)** 등록 후 id 충돌이 0건임을 **명시적으로 확인**한다.
  object spread는 중복 id를 조용히 덮어쓰므로 카운트 검증이 유일한 탐지 수단.
  - 검증: 각 schools 파일의 entry 총합 == `listSchools().length` == 787.
    두 값이 다르면 충돌 발생 → 어느 학교가 삼켜졌는지 추적
  - 카운트 명령 (전 파일 합산):
    ```
    grep -rhcE "^  [A-Za-z0-9_-]+: \{" src/lib/schools --include=*.ts \
      --exclude=index.ts | awk '{s+=$1} END {print s}'      # == 787
    ```
    **`bc`는 이 환경에 없다** (`which bc` → not found). `awk` 합산을 쓸 것.
    현재 리포에서 이 명령은 **685**를 반환함을 실측 확인했다 (수원 추가 후 787)
    id 문자셋에 **하이픈을 반드시 포함**한다 — `build-school-config.mjs:275-280`이
    충돌 회피로 `id-2` 형태를 생성하므로 `[a-z0-9_]+`만 쓰면 그 entry를 놓친다

### cron 그룹 분할

- **AC-6** `src/lib/cron/gyeonggiGroups.ts` 신규 (`seoulDistricts.ts` 패턴).
  `isSuwon(region)` / `isGyeonggiRest(region)` export.
  - `isSuwon`: `region === '경기 수원'`
  - `isGyeonggiRest`: **반드시 여집합으로 구현하고, `isSuwon`을 호출한다** —
    `region.startsWith('경기 ') && !isSuwon(region)`.
    문자열 비교(`region !== '경기 수원'`)를 인라인하지 말 것 — 나중에 `isSuwon`이
    확장되면(예: 수원을 구 단위로 쪼갤 때) 인라인 사본이 따라가지 않아 두 술어가
    겹치거나 벌어진다. 단일 진실 원천을 `isSuwon` 하나로 유지한다
  - **allowlist 구현 금지.** 과천/의왕/안양/군포를 나열하는 방식으로 쓰면 다음
    경기 시·군이 추가될 때 **어느 cron에도 안 속해** 조용히 사진 갱신이 멈춘다.
    `seoulDistricts.ts`가 allowlist인 것은 서울 25구가 닫힌 집합이기 때문이며,
    경기는 열린 집합이라 정반대 선택이 맞다. 이 차이를 주석에 명시한다
  - 회귀 방지 주석 포함: "두 술어의 합집합이 `경기 ` 전체와 일치, 교집합은 공집합.
    새 경기 시·군 추가 시 자동으로 `isGyeonggiRest`에 포함됨"
  - 검증: `listSchools().filter(isSuwon).length` == 102
  - 검증: `listSchools().filter(isGyeonggiRest).length` == 75
  - 검증: 102 + 75 == `listSchools().filter(s => s.region.startsWith('경기 ')).length` == 177
  - 검증: `listSchools().filter(s => isSuwon(s.region) && isGyeonggiRest(s.region)).length` == 0

- **AC-7** `src/app/api/cron/refresh-photos-suwon/route.ts` 신규.
  `maxDuration = 800`, `label: 'suwon'`, `runPrune: false`,
  `CRON_SECRET` Bearer 인증은 기존 라우트와 동일 형태.
  필터는 `listSchools().filter((s) => isSuwon(s.region))`.
  - 검증: `refresh-photos-seoul-1/route.ts`와 구조 대조 — 인증 블록 동일, `runPhotoCron` 3인자 주입만 다름

- **AC-8** `src/app/api/cron/refresh-photos-gyeonggi/route.ts` 수정:
  필터를 `s.region.startsWith('경기 ')` → `isGyeonggiRest(s.region)`,
  `maxDuration` 300 → **800**. 주석에 Stage 15 정정 사유 기록.
  - 검증: 두 cron이 같은 학교를 중복 처리하지 않음 (AC-6 교집합 0 검증으로 담보)
  - 검증: 경기 4도시 75교가 여전히 이 cron에 남아 있음

- **AC-9** `vercel.json`에 `refresh-photos-suwon` schedule 3개 추가:
  `30 4 * * *`, `0 7 * * *`, `0 10 * * *` (KST 13:30 / 16:00 / 19:00).
  - **AC-9a (정적, 자동 검증)**: `node -e "console.log(require('./vercel.json').crons.length)"` == **15**.
    추가로 `refresh-photos-suwon` path를 가진 entry가 정확히 3건이고
    schedule이 `30 4 * * *` / `0 7 * * *` / `0 10 * * *`인지 확인
  - **AC-9b (런타임, 육안)**: 배포 후 Vercel Dashboard → Cron Jobs 목록에
    `refresh-photos-suwon` 3건 표시 (stale 시
    `git commit --allow-empty -m "chore: vercel cron sync"` 재배포).
    **JSON 파싱 통과 ≠ 등록 성공** — Dashboard 확인이 유일한 증거

- **AC-18 (신규, 배포 원자성 — 최우선)** Step 3(학교 등록)과 Step 4(cron 분할)는
  **한 커밋 / 한 배포**로 반영한다. 중간 배포 금지.
  - 근거: 학교만 먼저 배포되면 기존 경기 cron의 `startsWith('경기 ')`가 수원
    101교를 흡수해 **177교를 300s 안에** 처리하려다 504 (R-2/H1).
    `vercel.json`만 먼저 배포되면 존재하지 않는 라우트로 하루 3회 404가 **조용히**
    발생한다 (Vercel은 cron 404를 기본 알림하지 않음)
  - 검증: 해당 커밋의 `git show --stat`에 6개 필수 파일이 모두 포함 —
    `gyeonggi/suwon.ts`, `schools/index.ts`, `gyeonggiGroups.ts`,
    `refresh-photos-suwon/route.ts`, `refresh-photos-gyeonggi/route.ts`, `vercel.json`
    (+ `gyeonggi.ts` 주석, AC-17 고아 검출기는 동반 가능)
  - **부수 이득**: 원자 커밋이면 `git revert` 한 번으로 원자적 롤백이 된다.
    Step 5의 롤백 경로가 이에 의존한다

### 검증·운영

- **AC-10** `npm run build` 통과 (경고 무관, 에러 0).

- **AC-11** 배포 후 Vercel Dashboard에서 `refresh-photos-suwon` 수동 Run →
  **HTTP 200**.

  **응답 JSON에서 얻을 수 있는 것** (`photoCronImpl.ts:148-156` 반환 형태 =
  `{triggeredAt, label, ymd, mirrorEnabled, elapsedMs, schools, prune}`):
  - `elapsedMs` (예상 ~120s, 800s 한도 대비 마진)
  - `schools` 배열 길이 == **`M`** (scrape 없는 학교는 `runPhotoCron`이 사전 제외)
  - `prune.enabled` == false

  **Runtime Logs에서 확인해야 하는 것** — `mirror_buckets`는 응답에 없고
  `console.log('[cron-photos-suwon]', ...)` 전용이다:
  - Vercel Dashboard → Logs에서 `[cron-photos-suwon]` 라인을 찾아
    `mirror_buckets.uploaded_some` / `errored` / `total_photos_count` 기록

  - **완료 판정 (2단계)** — `runPhotoCron`은 학교별 예외를 `photosError`로
    삼키므로(`photoCronImpl.ts:71-73`) **101교 전부가 실패해도 200을 반환**한다.
    200은 "함수가 안 죽었다"는 뜻이지 "사진이 보인다"가 아니다.

    **(1) 하한 게이트 (hard fail)**: `uploaded_some > 0`.
    0이면 R-5 또는 전면 실패다. 근거가 명확한 유일한 절대 기준

    **(2) 품질 지표 (대조군 비교)**: 같은 실행 회차의
    `refresh-photos-gyeonggi`(또는 `seoul-1`)의 `uploaded_some / schools` 비율을
    **대조군**으로 삼아 수원 비율과 비교한다.
    **수원 비율 < 대조군 비율 × 0.5** 이면 AC-11 미통과로 보고 원인 조사

    대조군을 쓰는 이유: 같은 날 같은 시각에 도는 다른 region이라 **영양교사
    업로드 시기 편차가 상쇄된다.** 절대 임계는 이 편차를 구별하지 못한다

    > **`docs/school-status.md`의 95.5%(654/685)를 임계로 쓰지 말 것.** 그 수치는
    > **한 달 누적** 기준("4월 평일 중 하루라도 사진 있으면 ✅")이고
    > `uploaded_some`은 **당일 1회 실행** 결과라 분모가 다르다. 특정 하루에
    > 업로드가 늦으면 단일 실행 값은 자연히 낮게 나온다.
    > (초기 계획의 `ceil(M * 0.5)`는 근거가 없었고, 95.5%의 절반이라
    > **101교 중 50교가 실패해도 통과**시켜 "부분적 대량 실패"를 놓쳤다)
  - 검증: 504 미발생. 발생 시 → Risks R-1 대응 절차

- **AC-15 (신규)** `refresh-photos-gyeonggi`도 수동 Run → **200**.
  필터 축소가 기존 경기 학교를 누락시키지 않았음을 증명한다.
  - 검증: 응답 `schools` 배열 길이 == **75** (하드코딩. `N_경기4도시_scrape` 실측 확정값)
  - 검증: `schools` 배열에 `suwon_` 접두 id가 **0건** (중복 처리 없음)
  - **검증 (region별 개별 — 필수)**: `schools`의 id를 `SCHOOLS`에 매핑해 region별
    카운트가 **과천 6 / 의왕 15 / 안양 41 / 군포 13**과 일치.
    총합 75만 보면 "안양 1교 누락 + 군포 1교 중복" 같은 **상쇄 오류를 놓친다**
  - **정적 게이트 (배포 전 선행)**: `listSchools().filter(s => isGyeonggiRest(s.region)).length === 75`.
    런타임 검증 전에 이걸로 먼저 걸러낸다

- **AC-19 (신규, F-11 대응)** `refresh-neis`가 787교로 늘어난 뒤에도 완주하는지
  확인한다. 이 cron은 **region 필터가 없어** 수원 102교를 자동으로 흡수하며,
  chunk 없이 단일 `Promise.all`로 787 × 2 = **1,574 동시 요청**을 낸다.
  `maxDuration = 300`이고 685교 시점 실측이 50~100s였다.
  - 검증: 배포 후 `refresh-neis` 수동 Run → **200**
  - **관측 위치**: `schools_total` / `ok_today` / `ok_tomorrow` / `errored`는
    **Runtime Logs의 `[cron-neis]` 라인**에서 확인한다. 응답 JSON에는
    `triggeredAt` / `ymd` / `tomorrowYmd` / `elapsedMs` / `schools`(학교별 배열)만 있다
  - 검증: `[cron-neis].schools_total` == 787
  - **임계 및 대응** (R-12):
    - `errored` <= 기준선 + 10 → 정상. 수치만 work-log에 기록
    - `errored` > 기준선 + 10, 또는 `elapsedMs` > 240,000 (300s 한도의 80%)
      → **후속 Stage를 즉시 등록**하고 work-log에 위험으로 명시.
        라우트 주석이 이미 예고한 chunk 도입 (`refresh-neis/route.ts:14-16`)
    - `elapsedMs`가 300s 한도 초과로 504 → **AC-19 미통과**. 이번 배포의
      롤백 대상은 아니나(사진 cron과 독립) 즉시 chunk 도입 착수

- **AC-12** `scripts/generate-school-status.mjs`로 `docs/school-status.md` 갱신.
  - 선행: `regionOrder` 배열에 `'경기 수원'` 추가 (F-8) — 경기 4도시 뒤, 서울 앞
  - 검증: 생성된 md의 요약 "등록: **787교**"
  - 검증: `경기 수원` 섹션이 경기 그룹 안에 위치 (문서 끝이 아님)
  - 검증: 중앙기독초가 "scrape 미지원 ➖" 표에 등장

- **AC-13** `docs/work-log.md`에 Stage 15 추가. 최소 포함:
  - `goesw.kr` = 세 번째 경기 도메인 발견
  - `kind: 'goeay'` 파서 호환 실측 결과 (gosaek-e, mi=1315)
  - 수원 전용 cron 분리 근거 (단일 도메인 = 위험도 "높음")
  - 기존 경기 cron `maxDuration` 300 → 800 정정 (Stage 14-33 서울 조치에서 경기 누락분)
  - 중앙기독초 scrape 생략
  - **F-1/F-2 스크립트 버그** (goesw 미지원 + `kind` 누락) 및 수정 내용
  - 도메인 위험도 표에 `경기 수원 / goesw.kr / 높음` 행 추가

- **AC-16 (신규)** `AGENTS.md` 갱신 — 신규 3건 + **기존 문서 오류 교정 3건**:

  신규:
  - line ~33 "학교 추가 후 반드시 cron 수동 실행" 목록에
    `수원시 학교 추가 → /api/cron/refresh-photos-suwon` 추가
  - line ~72 "사진 cron schedule" 목록에 `refresh-photos-suwon — 수원 (102교)`
    추가 + 기존 `refresh-photos-gyeonggi — 경기 4도시 (75교)` 문구 유지 확인

  **기존 문서 오류 교정** (서울이 Stage 14-33에서 800으로 바뀐 뒤 갱신 안 된 것):
  - **(a) line 66** `세 사진 cron 모두 KST 13:30...` → **`네 사진 cron`**
  - **(b) line 68** `세 함수가 같은 시각 parallel invocation` → **`네 함수`**.
    같은 절에 **"경기 그룹(수원 / 나머지)은 `src/lib/cron/gyeonggiGroups.ts`에서
    관리한다"** 문장을 신설한다 (서울의 `seoulDistricts.ts` 안내와 대칭)
  - **(c) line 76** `세 사진 cron 모두 maxDuration 300` → 실제와 일치하게 교정.
    **현재 문서가 틀렸다** — 서울 2개는 Stage 14-33에서 이미 800이고, 이번에
    경기·수원도 800이 되므로 **네 cron 모두 800**이 된다
  - 검증: `grep -n "세 사진 cron\|세 함수\|maxDuration 300" AGENTS.md` → **0건.
    예외 없음.**
    초기 계획은 "단 `refresh-neis`의 300 언급은 별개"라는 단서를 달았으나
    **그런 언급은 AGENTS.md에 존재하지 않는다** (실측: `maxDuration` 언급은
    19행 "Pro 800s 한도"와 76행 "세 사진 cron 300" 2건뿐). 존재하지 않는 예외는
    게이트에 구멍만 낸다 — AC-2c에서 escape hatch를 삭제한 것과 같은 원리

- **AC-17 (신규, 실행 가능한 게이트)** **cron 고아 학교 검출기**를 만든다.
  - 동작: `scrape` 보유 학교 전체를 순회하며 4개 술어
    (`isSeoulGroup1`, `isSeoulGroup2`, `isSuwon`, `isGyeonggiRest`) 중
    **어디에도 걸리지 않는 학교**의 id·name·region을 출력한다

  **실행 방식 — 반드시 (a) 또는 (b) 중 하나. 임의 선택 금지.**

  이 술어들과 `listSchools()`는 전부 TypeScript + `@/` alias다. 반면 이 리포의
  `scripts/` 4개는 모두 `.mjs`이고 **TS를 직접 import한 전례가 0건**이다
  (`generate-school-status.mjs`조차 dev 서버 HTTP probe로 우회한다).

  - **(a) 권장 — 임시 dev route**: `src/app/api/dev/cron-coverage/route.ts`를
    만들어 실제 모듈에서 `listSchools`와 4개 술어를 import하고, `npm run dev`
    상태에서 `curl localhost:3000/api/dev/cron-coverage`로 조회.
    `generate-school-status.mjs`가 쓰는 것과 같은 우회 패턴이라 리포 관례에 맞다.
    **검증 후 이 route는 삭제**하거나, 남긴다면 그 사실을 work-log에 기록한다
  - **(b) 대안 — `.ts` + `npx tsx`**: `scripts/check-cron-coverage.ts`로 만들고
    `npx tsx`로 실행. `@/` alias가 안 잡히면 상대 경로 import로 대체.
    devDependency 추가가 필요할 수 있다

  - **강제 제약: 술어를 스크립트 안에 재구현하지 말 것.**
    반드시 `@/lib/cron/seoulDistricts`와 `@/lib/cron/gyeonggiGroups`에서
    **실제 함수를 import**한다. 문자열 비교로 사본을 만들면 검사 대상이
    실제 술어가 아니라 사본이 되어 **이 게이트의 목적이 정면으로 파괴된다.**
    게다가 그 실패는 조용하다 — 사본은 0건을 출력하고 통과시킨다.
    (초기 계획의 "또는 동등한 일회성 스크립트"라는 문구가 이 모호성을
    승인하고 있었으므로 삭제했다)
  - **게이트: 출력 0건.** 1건이라도 나오면 그 학교는 어느 cron도 돌지 않아
    사진이 영원히 갱신되지 않는다
  - 부가 출력: 술어별 학교 수 (seoul-1 / seoul-2 / suwon / gyeonggi-rest) +
    합계 == 전체 `scrape` 보유 학교 수
  - **주석이 아니라 스크립트인 이유**: `seoulDistricts.ts:14-16`이 이미
    "두 list의 합이 자치구 갯수와 일치해야 함"이라는 주석으로 같은 사고를
    막으려 했다. 주석은 읽는 사람에게만 작동한다. 부산·인천이 추가돼도
    이 스크립트는 그대로 작동한다
  - work-log Stage 15에 실행법과 "새 region 추가 시 반드시 실행" 규칙 기록

---

## Implementation Steps

> 배포 순서가 커버리지 불변식을 깨지 않도록 **Step 4를 한 커밋/한 배포로** 묶는
> 것이 핵심이다 (Risks R-2 참조).

### Step 0 — 런타임 기준선 측정 (선행, 코드 변경 없음)

> 정적 카운트 기준선은 **이미 측정 완료**다 (`N_경기4도시_scrape = 75`, 숫자 규약
> 표). 초기 계획은 "기존 75교 중 일부가 이미 scrape 생략 상태"라고 적었으나
> **이는 틀렸다** — `generate-school-status.mjs`의 `VERIFIED_REASONS`를 scrape
> 생략 목록으로 오해한 것이다. 그 테이블은 **문서 생성용 사유 표시**이며
> `scrape` 필드 유무와 무관하다. 실제로 `kwanyang`은 `gyeonggi.ts:195`에
> `scrape`를 정상 보유하고 있고, 4도시 75교는 **전원** 보유 상태다.

남는 건 런타임 기준선뿐. 배포 전 1회씩 수동 Run 하여 기록한다:

- `refresh-photos-gyeonggi`
  - (응답) `schools` 길이, `elapsedMs` — AC-15 비교용
  - **(로그 `[cron-photos-gyeonggi]`) `uploaded_some` / `mirror_buckets` 전체**
    — **AC-11의 대조군 기준선.** 이게 없으면 수원 성공률이 높은지 낮은지
    판단할 기준 자체가 없다
- `refresh-neis` → Runtime Logs `[cron-neis]`의 `elapsedMs` / `errored` (AC-19 비교용)

완료 기준: 두 cron의 변경 전 수치가 기록됨. 특히
`refresh-photos-gyeonggi`의 `uploaded_some / schools` **비율**을 명시적으로 계산해 둘 것.

### Step 1 — 수집 스크립트 일반화 + 수원 원자료 확보 (AC-1, AC-2)

파일:
- `scripts/extract-seoul-hosts.mjs` (수정) — `--atpt` 인자 추가, 기본 `B10`
- `scripts/build-school-config.mjs` (수정) — `goesw` 패턴 / `kind` 출력 /
  `--id-prefix` / mi 추출 동시성 5

실행 (stderr를 반드시 분리 — mi 실패 목록이 거기 있다).
**중간 산출물은 리포 루트가 아니라 스크래치 디렉터리에 쓴다** — 사용자 규칙이
"작업 폴더에 untracked 파일 방치 금지"이므로 리포 루트를 오염시키지 않는다:

```
OUT=/tmp/suwon        # 또는 세션 스크래치패드 경로
mkdir -p $OUT

NEIS_API_KEY=... node scripts/extract-seoul-hosts.mjs --atpt J10 --district 수원시 \
  > $OUT/suwon-hosts.tsv

NEIS_API_KEY=... node scripts/build-school-config.mjs \
  --atpt J10 --city 수원시 --id-prefix suwon_ \
  > $OUT/suwon-raw.txt 2> $OUT/suwon-warn.txt
```

산출물:
- `$OUT/suwon-hosts.tsv`, `$OUT/suwon-raw.txt`, `$OUT/suwon-warn.txt` —
  **임시. 커밋 대상 아님** (스크래치 경로라 `.gitignore` 불필요)
- `docs/suwon-mi-failures.md` — **커밋 대상.** `suwon-warn.txt`를 정리한 것 (AC-2b).
  후속 mi 보정 작업의 입력이므로 리포에 남아야 한다. Step 6 문서 커밋에 포함
  (AC-18의 원자 커밋 6파일에는 **미포함** — 배포 동작과 무관한 문서)
- **`M` 확정값** — 이후 모든 게이트의 기준. `M = 101 - (mi 실패 수)`

완료 기준: AC-1 / AC-2 / AC-2b / AC-2c 검증 통과. 특히 `--names` 회귀 검증과
**`M > 0`**. `M == 0`이면 R-5이므로 여기서 중단.

### Step 2 — `suwon.ts` 작성 + id 확정 (AC-3, AC-5, AC-14)

> **선행 조건: Open Questions 1·2·3(BLOCKING) 답이 나와 있어야 한다.**
> 중앙기독초 id, mi 실패 처리 분기, 약칭 13개 id — 셋 다 커밋 후에는 공유
> 링크 고착으로 되돌리기 비싸다.

파일:
- `src/lib/schools/gyeonggi/suwon.ts` (신규)
- `src/lib/schools/gyeonggi.ts` (주석 1블록만 추가 — 디렉터리 공존 방어 주석)

작업:
1. Step 1 출력을 `SUWON_SCHOOLS` 레코드로 정리.
   **정렬 규칙 (V-5가 의존하므로 명시)**: 구 순서는 **권선 → 영통 → 장안 → 팔달**
   (스펙의 학교 수 기재 순서), 구 내부는 학교명 가나다순. 각 구의 **첫 entry**가
   V-5 육안 확인 표본이 되므로 정렬이 정해져 있어야 표본이 실행자 임의 선택에
   좌우되지 않는다
2. 약칭 host 13개(`dsw`, `swsg`, `swjc`, `hgok`, `omokk`, `cmschool`, `swkumgok`,
   `swgumho`, `swmaehwa`, `swsunil`, `swhwaseo`, `swhwayang`, `eui`)의 id를
   학교명 발음 기반으로 확정하고 매핑 근거를 주석에 기록
3. 중앙기독초 entry는 `scrape` 없이 + 사유 주석 (AC-5)
4. id 충돌 카운트 검증 (AC-14)

완료 기준: AC-3, AC-5, AC-14 검증 통과.

### Step 3 — 레지스트리 병합 + 빌드 (AC-4, AC-10)

파일:
- `src/lib/schools/index.ts` (수정) — import + spread + 구조 주석

완료 기준: `npm run build` 통과 + `listSchools().length == 787`.

> 이 시점에서 배포하면 안 된다. 수원 102교가 등록됐지만 경기 cron 필터가 아직
> `startsWith('경기 ')`라 수원까지 빨아들여 177교를 300s 안에 처리하려다 504
> 위험. Step 4와 함께 배포한다.

### Step 4 — cron 분할 (AC-6, AC-7, AC-8, AC-9, AC-18) — **원자적 커밋**

파일:
- `src/lib/cron/gyeonggiGroups.ts` (신규)
- `src/app/api/cron/refresh-photos-suwon/route.ts` (신규)
- `src/app/api/cron/refresh-photos-gyeonggi/route.ts` (수정 — 필터 + maxDuration)
- `vercel.json` (수정 — cron entry 3개 추가)
- **AC-17 고아 검출기** — 방식 (a) `src/app/api/dev/cron-coverage/route.ts` (임시,
  검증 후 삭제) 또는 방식 (b) `scripts/check-cron-coverage.ts` (`npx tsx`).
  **실제 술어를 import할 것 — 재구현 금지**

완료 기준: AC-6 ~ AC-9b + AC-17 검증 통과 + `npm run build` 통과.
특히 **AC-17 스크립트 출력 0건**과 AC-15의 정적 게이트
(`isGyeonggiRest` == 75, region별 6/15/41/13).
Step 3과 Step 4를 **같은 커밋 / 같은 배포**에 포함시킨다 (AC-18).

### Step 5 — 배포 + cron 수동 실행 (AC-11, AC-15)

1. `dev` 브랜치 배포
2. Vercel Dashboard → Cron Jobs에 `refresh-photos-suwon` 3건 표시 확인
   (미표시 시 빈 커밋으로 재배포)
3. `refresh-photos-suwon` 수동 Run → 200, `elapsedMs` / 미러 성공 수 기록 (AC-11)
4. `refresh-photos-gyeonggi` 수동 Run → 200, 4도시 유지 확인 (AC-15)
5. `refresh-neis` 수동 Run → 200, `schools_total == 787` / `errored` 확인 (AC-19)

완료 기준: 세 cron 모두 200 + AC-11의 `uploaded_some` 임계 통과.

#### 롤백 경로 (즉시 복구 수단)

AC-18이 6파일 **원자 커밋**을 강제했으므로 되돌리기도 원자적이다. 이것이
AC-18의 부수 이득이며, R-1 완화가 "schedule 시차 / 4구 분할"이라는 추가 개발만
남지 않도록 하는 안전망이다.

```
git revert <stage15-commit>     # 6파일 동시 원복 → 배포
```

원복 시 상태: 수원 102교가 레지스트리에서 사라지고, 경기 cron 필터가
`startsWith('경기 ')`로, `maxDuration`이 300으로 되돌아간다. 4도시 75교는
변경 전과 완전히 동일하게 동작한다. `vercel.json`의 수원 entry 3개도 함께
사라지므로 404 cron이 남지 않는다.

**롤백 판단 기준:**
- `refresh-photos-suwon` 504가 재시도에도 재현 → 먼저 R-1의 schedule 시차를
  시도하고, 그래도 실패하면 롤백
- `refresh-photos-gyeonggi`가 200이 아니거나 `schools` != 75 → **즉시 롤백**
  (기존 서비스 회귀가 신규 기능보다 우선)
- 수원 사진이 안 나오지만 기존 685교가 정상 → 롤백하지 않고 원인 조사
  (R-5 / mi 문제. 서비스 손상 없음)

### Step 6 — 문서 갱신 (AC-12, AC-13, AC-16, AC-17)

파일:
- `scripts/generate-school-status.mjs` (수정 — `regionOrder`에 `'경기 수원'`)
- `docs/school-status.md` (자동 생성)
- `docs/work-log.md` (Stage 15 추가)
- `AGENTS.md` (cron 표 2곳 + maxDuration 표기 정정)

실행:
```
npm run dev          # 별도 터미널
node scripts/generate-school-status.mjs --ymd=<기준일>
```

완료 기준: AC-12, AC-13, AC-16, AC-17 검증 통과.

---

## Risks and Mitigations

| # | Risk | 심각도 | 근거 | Mitigation |
|---|---|---|---|---|
| **R-1** | `refresh-photos-suwon` 504 — `goesw.kr` 단일 도메인 동시 부담이 예상(120s)보다 크게 나옴 | 중 | Stage 14-32에서 서울이 정확히 이 실패를 겪음. 101교/chunk 30 = 4 batch로 서울(11 batch)보다 작지만, 도메인 부담은 학교 수가 아니라 동시 connection 수(30)에 좌우 | `maxDuration = 800` 선제 적용(사용자 결정 5). 그래도 504면 → ① schedule을 서울/경기와 5분 시차, ② 수원을 4개 구 그룹으로 분할(`gyeonggiGroups.ts`가 이미 그 확장점). **chunk 축소는 금지** (Stage 14-28 교훈) |
| **R-2** | **배포 순서 사고** — Step 3만 배포되면 경기 cron이 177교를 300s에 처리하려다 504 + 수원 미러 실패. 반대로 Step 4만 먼저 배포되면 `isSuwon`이 0교를 잡아 빈 cron | 높 | 필터와 학교 등록이 서로 다른 파일에 있어 분리 배포가 물리적으로 가능 | Step 3 + Step 4를 **한 커밋, 한 배포**로 묶는다. Step 3 완료 시점에 배포 금지 주석을 계획에 명시(위 Step 3 경고) |
| **R-3** | **id 충돌이 조용히 학교를 삭제** — object spread가 중복 id를 덮어씀. 빌드 에러도 런타임 에러도 없음 | 중 | F-6 실측. 스펙은 "충돌 0건"이라 하나 prefix 표기 실수 한 번이면 발생 | AC-14를 필수 게이트로. `grep` 카운트 합계 == `listSchools().length` 검증. 불일치 시 진행 중단 |
| **R-4** | **`kind` 필드 누락** — 스크립트 출력을 그대로 붙이면 TS union 불만족 | 중 | F-2 실측. 스펙이 전혀 언급 안 함 | AC-2에서 스크립트 자체를 고침. 추가 방어로 AC-3의 scrape 라인 앵커 게이트(아래 R-5)가 `kind`까지 함께 검증 |
| **R-5** | **`goesw.kr` 미매칭으로 101교 전원 scrape 누락** — 조용히 "메뉴만" 상태로 등록됨. 빌드는 통과하고 cron도 200을 반환(처리할 학교가 없을 뿐) | 높 | F-1 실측. 이 실패는 **성공처럼 보인다** — AC-10, AC-11이 모두 통과해도 사진이 하나도 안 나옴 | **전용 게이트** (AC-3): scrape 라인 앵커 `grep -cE "^    scrape: \{ kind: 'goeay', host: '[a-z0-9-]+\.goesw\.kr'"` 가 **`> 0`**. host와 `kind`를 한 줄에서 동시 검증하므로 등식이 불필요하고 주석 오탐도 없다. AC-11의 `uploaded_some > 0`이 2차 방어(런타임에서 0이면 즉시 발각) |
| **R-6** | 파일/디렉터리 동명 공존이 향후 툴체인에서 문제 | 낮 | F-7에서 tsc bundler는 exit 0 실증. 다만 Turbopack 런타임과 미래 도구는 별건 | AC-10의 `npm run build`(Turbopack)가 실질 검증. 양쪽 파일 상단 방어 주석 + work-log 기록. 문제 발생 시 옵션 A-2 또는 A-3으로 즉시 전환 가능(파일 이동 + import 1줄) |
| **R-7** | mi 추출 wall time — 101교 sequential 최악 25분, 학교 서버에 대한 예의 문제도 있음 | 낮 | F-4 실측 | AC-2에서 동시성 5 도입. `photoMirror.ts`의 `CONCURRENCY = 5`와 동일한 보수값 유지 |
| **R-8** | `generate-school-status.mjs` 실행 시간 폭증 (787교 × 한 달 평일 순차 probe) | 낮 | F-9 | **타임박스 30분.** 30분 초과 시 중단하고 `--ymd`를 **최근 1주**로 좁혀 재실행(조기 히트 유도). 그래도 초과하면 AC-12를 "수원 섹션만 갱신"으로 축소하고 전체 재생성은 후속 Stage로 등록. 병렬화는 이번 범위 밖(학교 서버 부담 증가) |
| **R-9** | 약칭 host 13개의 id 오작명 — 학교명과 무관한 id가 URL에 영구 고착 | **중** (낮→중 승격) | 스펙 Constraints에 명시된 수동 판단 지점. **배포 후 공유 링크 고착은 1건(R-13)이나 13건이나 같은 성격이며 건수는 13배다** — 초기 배분이 뒤집혀 있었다 | Step 2에서 13개를 학교명과 나란히 표로 정리해 **커밋 전 사람이 1회 육안 대조** (Open Question 4, BLOCKING). 매핑 근거를 주석에 남겨 사후 추적 가능 |
| **R-10** | Vercel Dashboard cron 목록 stale — `vercel.json` 반영 안 됨 | 낮 | work-log 체크리스트에 기존 사례 기록 | 빈 커밋 재배포 (`git commit --allow-empty -m "chore: vercel cron sync"`) |
| **R-11** | **`isGyeonggiRest`를 allowlist로 구현** → 다음 경기 시·군이 어느 cron에도 안 속해 조용히 사진 갱신 정지 | 높 | `seoulDistricts.ts`가 allowlist라 그 패턴을 그대로 베끼기 쉬움. 경기는 열린 집합이라 정반대가 맞음 | AC-6에서 **여집합 구현을 강제**. 주석이 아니라 코드로 보장. `seoulDistricts.ts`와 다른 이유를 파일 주석에 명시 |
| **R-12** | **`refresh-neis` 동시 요청 1,574개** — region 필터가 없어 수원이 자동 편입. chunk 없는 단일 `Promise.all`, `maxDuration = 300` | 중 | F-11 실측. 스펙이 이 cron을 전혀 언급 안 함 | AC-19의 **수치 임계 + 대응 경로**: `errored` <= 기준선+10 → 기록만 / 초과 또는 `elapsedMs` > 240,000 → chunk 도입 후속 Stage 즉시 등록 / 504 → AC-19 미통과 판정 후 chunk 착수. **롤백은 불필요** — 이 cron은 사진 cron과 독립이고, 되돌리려면 수원 학교 등록 자체를 물려야 해서 비례하지 않는다. 메뉴는 앱 진입 시 on-demand로도 조회되므로 워밍 실패가 즉시 장애는 아니다 |
| **R-13** | **중앙기독초 id가 한글로 등록** — `sysId` null 시 스크립트가 `SCHUL_NM`을 id로 씀. URL에 한글이 박히고 배포 후 변경 시 링크가 깨진다. **증상은 404가 아니다** — `getSchool()`이 미등록 id를 `DEFAULT_SCHOOL_ID = 'chonggye'`로 폴백하므로(`schools/index.ts:112,121-124`) **엉뚱한 학교(경기 과천 청계초)의 급식이 조용히 표시된다.** 사용자는 잘못된 정보를 보고도 오류임을 알 수 없어 명시적 파손보다 나쁘다 | 중 | F-14 실측 + `getSchool()` 폴백 동작 확인 | AC-5의 ASCII id 검증. 커밋 전 id 확정 필수 (Open Question 1, BLOCKING) |
| **R-14** | **동일 시각 4-way cron 동시 실행** — suwon / seoul-1 / seoul-2 / gyeonggi가 모두 `maxDuration 800` | 낮 | 도메인은 서로 달라 학교 서버 부담 합산은 없음(스펙 확인). 다만 Vercel 함수 동시 실행 4개 × 최악 800s = 비용 상승 | 도메인 분리로 기능 위험은 없음. 비용은 R-1 발생 시 schedule 시차와 함께 재검토 |
| ~~R-15~~ | ~~`N_경기4도시_scrape` 기준선 미측정~~ | — | **철회.** 전제가 틀렸다 — `VERIFIED_REASONS`를 scrape 생략 목록으로 오해한 것. 실측 결과 4도시 75교 전원 `scrape` 보유 (`kwanyang` 포함, `gyeonggi.ts:195`) | 불필요. `N_경기4도시_scrape = 75` 확정 |

---

## Verification Steps

### V-1. 정적 검증 (배포 전)

> `grep -P`는 이 환경에서 **미지원**이다 (locale 문제로 exit 2). 아래는 전부 `-E`.

```
S=src/lib/schools/gyeonggi/suwon.ts

npm run build                                   # AC-10
grep -cE "^  suwon_[a-z0-9_]+: \{" $S           # == 102  (AC-3 entry 수 + AC-5 ASCII id)
grep -c  "region: '경기 수원'" $S                # == 102  (AC-3)

# R-5 전용 게이트 — scrape 라인 앵커. host + kind 동시 검증, 주석 오탐 없음
grep -cE "^    scrape: \{ kind: 'goeay', host: '[a-z0-9-]+\.goesw\.kr'" $S   # == M

# 전 파일 entry 합계 — 하이픈 포함 필수(id-2 형태), bc 없으므로 awk 합산
grep -rhcE "^  [A-Za-z0-9_-]+: \{" src/lib/schools --include=*.ts --exclude=index.ts \
  | awk '{s+=$1} END {print s}'                 # == 787  (AC-14, 현재 685)

# AGENTS.md 기존 오류 교정 확인 (AC-16) — 예외 없이 0건
grep -n "세 사진 cron\|세 함수\|maxDuration 300" AGENTS.md    # == 0건
```

**게이트 판정:**
- `grep -cE "^  suwon_..."` != 102 → 한글 id 잔존(R-13) 또는 entry 누락. 중단
- scrape 앵커 카운트 == **0** → **R-5 발생** (goesw 미매칭으로 전원 scrape 누락).
  즉시 중단
- scrape 앵커 카운트가 `0 < M < 101` → mi 추출 실패분. AC-2b 목록과 대조해
  `M = 101 - 실패 수`가 맞는지 확인 후 진행 (Open Question 2 분기 (b))
- scrape 앵커 카운트 == 101 → Open Question 2 분기 (a). 이상적

### V-2. 레지스트리 카운트 검증 (AC-4, AC-6, AC-14)

`npm run dev` 상태에서 일회성 노드 스크립트 또는 임시 route로 다음을 확인:

| 식 | 기대값 |
|---|---|
| `listSchools().length` | 787 |
| `Object.keys(SCHOOLS).filter(k => k.startsWith('suwon_')).length` | 102 |
| `listSchools().filter(s => isSuwon(s.region)).length` | 102 |
| `listSchools().filter(s => isGyeonggiRest(s.region)).length` | **75** (AC-15 정적 게이트) |
| `listSchools().filter(s => s.region.startsWith('경기 ')).length` | 177 |
| `isSuwon ∧ isGyeonggiRest` 교집합 | 0 |
| `isGyeonggiRest` 결과의 region별 카운트 | 과천 6 / 의왕 15 / 안양 41 / 군포 13 |
| 전 schools 파일 entry 총합 | 787 (불일치 = id 충돌, R-3) |
| **cron 고아 학교** (`scrape` 보유 중 4개 술어 어디에도 미해당) | **0건** (AC-17 검출기 — 실제 술어 import 필수) |

### V-3. cron 실동작 검증 (AC-11, AC-15)

배포 후 Vercel Dashboard → Settings → Cron Jobs:

> **관측 위치 주의.** 응답 JSON에 있는 것은 `triggeredAt` / `label` / `ymd` /
> `mirrorEnabled` / `elapsedMs` / `schools` / `prune` **뿐**이다
> (`photoCronImpl.ts:148-156`). `mirror_buckets` · `total_photos_count` ·
> `schools_total` · `errored`는 **Runtime Logs**의 `[cron-photos-*]` /
> `[cron-neis]` 라인에서만 볼 수 있다.

1. `refresh-photos-suwon` **Run** → 200
   - (응답) `schools` 배열 길이 == **`M`** (**0이면 R-5 — 즉시 중단**)
   - (응답) `elapsedMs` 기록 (800,000ms 대비 마진 산출)
   - (응답) `prune.enabled` == false
   - (로그 `[cron-photos-suwon]`) `uploaded_some` **> 0** ← **하한 게이트.
     0이면 R-5 또는 전면 실패, 즉시 중단** (200은 성공 증거가 아니다)
   - (로그) `errored` / `total_photos_count` 기록
2. `refresh-photos-gyeonggi` **Run** → 200
   - (응답) `schools` 길이 == **75**
   - (응답) `schools` 안에 `suwon_` 접두 id **0건**
   - region별 카운트 == 과천 6 / 의왕 15 / 안양 41 / 군포 13 (상쇄 오류 검출)
   - (로그) `uploaded_some` — **AC-11의 대조군.** 같은 회차라 업로드 시기 편차 상쇄
2-b. **대조 판정 (AC-11 품질 지표)**:
   `수원 uploaded_some / M` 을 `경기 uploaded_some / 75` 와 비교.
   수원 비율이 대조군의 **절반 미만**이면 AC-11 미통과 → 원인 조사
3. `refresh-neis` **Run** → 200 (AC-19)
   - (로그 `[cron-neis]`) `schools_total` == 787, `errored` / `elapsedMs`를
     Step 0 기준선과 대조. 임계 초과 시 AC-19의 대응 경로
4. `refresh-photos-seoul-1` / `seoul-2`는 이번 변경 무관 — 회귀 없음 확인만

### V-4. 문서 검증 (AC-12, AC-13, AC-16)

```
node scripts/generate-school-status.mjs --ymd=<기준일>
grep "등록: \*\*787교\*\*" docs/school-status.md
grep -n "경기 수원" docs/school-status.md      # 경기 그룹 내 위치 확인 (문서 끝 아님)
grep -n "refresh-photos-suwon" AGENTS.md        # 2곳 (cron 실행 규칙 + schedule 목록)
grep -n "Stage 15" docs/work-log.md
```

### V-5. 사용자 확인 (최종)

앱에서 육안 확인. **표본을 실행자가 임의 선정하면 통과가 보장된 학교만 고르는
편향이 생기므로, 아래 목록을 하드코딩한다.**

**필수 표본 (고정)**

| id | 학교 | 구 | 기대 결과 |
|---|---|---|---|
| `suwon_gosaek` | 고색초 | 권선 | 메뉴 + 사진 (스펙에서 실측 검증된 학교 — 여기서 실패하면 파이프라인 자체 문제) |
| 권선구 첫 entry | — | 권선 | 메뉴 + 사진 |
| 영통구 첫 entry | — | 영통 | 메뉴 + 사진 |
| 장안구 첫 entry | — | 장안 | 메뉴 + 사진 |
| 팔달구 첫 entry | — | 팔달 | 메뉴 + 사진 |
| 중앙기독초 | 중앙기독초 | 영통 | **메뉴만, 사진 없음이 정상** (AC-5) |

"첫 entry"는 `suwon.ts`의 **Step 2 정렬 규칙**(구 순서 권선→영통→장안→팔달,
구 내부 학교명 가나다순)에서 해당 구가 처음 나오는 학교로 고정한다.
실행자 선택 여지를 없애기 위한 것이므로 정렬 규칙과 함께 읽을 것.
확정된 id를 Step 2 완료 시 이 표에 채워 넣는다.

**추가 필수: mi 추출 실패 학교 전원** (AC-2b 목록)

`M < 101`인 경우, 실패 학교 **전원**을 별도 목록으로 확인한다. 이들은
"사진 없음"이 기대 결과이며, 그 사실을 `docs/suwon-mi-failures.md`에 확정
기록한다. 통과가 보장된 표본만 보고 넘어가면 이 학교들의 상태가 영원히
미확인으로 남는다.

---

## ADR — Stage 15 아키텍처 결정 기록

### Decision

수원 102교를 `src/lib/schools/gyeonggi/suwon.ts`에 `suwon_` prefix id로 등록하고,
전용 cron `refresh-photos-suwon`(`maxDuration = 800`, `runPrune: false`)을 신설한다.
기존 경기 cron은 `gyeonggiGroups.ts`의 `isGyeonggiRest` 술어로 4도시 75교만
담당하도록 좁히고 `maxDuration`을 800으로 정정한다. `schoolScraper.ts`는
변경하지 않는다 — `goesw.kr`은 `kind: 'goeay'` 파서로 그대로 동작함이 실측됐다.

### Drivers

- D-1 `goesw.kr` 단일 도메인 동시 부담 (work-log 위험도 "높음")
- D-2 기존 685교 회귀 제로
- D-3 경기 나머지 ~1,200교 확장의 반복 비용

### Alternatives considered

- **파일 구조**: A-2(`gyeonggi.ts` 전면 디렉터리 전환) — 구조적으로 더 깨끗하나
  스펙 Non-Goals 위반 + 75교 이동 diff 리스크. A-3(`schools/suwon.ts` 평면) —
  이름 충돌은 없으나 시·도 계층이 깨져 서울과 비대칭.
- **id 작명**: B-2(prefix 없음) — 경기 내부 일관성은 좋으나 사용자 결정 위반 +
  1,200교 확장 시 충돌이 조용히 학교를 삭제(F-6). B-3(2단 prefix) — 실익 없이 김.
- **수집 스크립트**: C-2(수원 전용 신규 스크립트) — 회귀 0이지만 코드 중복 +
  `kind` 누락 버그가 원본에 잔존.
- **cron 구조** (옵션군 D): D-1(통합 cron 유지 + `maxDuration` 800) — **기술적으로
  안전한 대안이었다.** 177교는 work-log 경기 권장 상한 500의 35%이고, Stage 14-33이
  304/306교를 800에서 341s/385s로 완주시켜 실증했다. cron entry 12 유지 + 신규 파일
  0개 + 배포 원자성 요구 소멸이라는 실질 이점이 있었다. 기각 사유는 wall time이
  아니라 폭발 반경 공유와 관측 혼재다. D-3(경기 4분할 선행) — 스펙 Non-Goals이며
  177교 시점에는 그룹당 batch 2 이하로 과분할.

### Why chosen

A-1은 사용자 결정 3에 부합하고 F-7에서 기술적 성립이 실증됐으며 기존 파일을
건드리지 않아 D-2를 만족한다. B-1은 서울 `seoul_` 패턴과 일관되고 D-3의 확장
네임스페이스를 제공한다. C-1은 `kind` 누락이라는 **실제 버그**를 고쳐 다음
시·군 작업자가 같은 함정을 밟지 않게 한다(D-3 driver).

**전용 cron(D-2)을 고른 이유는 wall time이 아니다.** 101교 규모에서는 통합
cron도 `maxDuration 800` 안에서 안전하다 — 177교는 work-log 경기 권장 상한
500의 35%이고, Stage 14-33이 그 두 배 규모를 800에서 완주시켰다. 분리의 근거는
두 가지다: (1) `goesw.kr`은 **미검증 인프라**라 첫 실사용 wall time·성공률을
오염 없이 격리 관측해야 하고, (2) 문제 발생 시 경기 4도시 75교를 말려들게
하지 않아야 한다. `gyeonggiGroups.ts`는 수원이 더 쪼개져야 할 때(R-1)의
확장점을 미리 확보한다.

> **주의: 101교 자체가 분리 임계값이라는 뜻이 아니다.** 분리 임계값은 여전히
> work-log 도메인 위험도 표의 기준(도메인 분산 ≤500 / 단일 도메인 ≤300)이며,
> **다음 시·군은 통합이 기본값**이다. 수원은 "새 도메인의 첫 진입"이라는
> 일회성 사유로 분리한 것이다.

### Consequences

- **긍정**: 경기 확장의 재사용 가능한 뼈대(시별 파일 + 시 prefix + region 술어
  모듈 + 일반화된 수집 스크립트)가 갖춰진다. 수원 504 시 그룹 분할이 한 파일
  수정으로 가능하다.
- **부정**: `gyeonggi.ts` 파일과 `gyeonggi/` 디렉터리가 동명으로 공존해 가독성이
  떨어진다(방어 주석으로 완화). 경기 내부에 prefix 있는 id와 없는 id가 섞인다.
  `build-school-config.mjs` 공용 수정이 기존 `--names` 경로에 회귀를 낼 수 있어
  검증이 필요하다.
- **중립**: cron entry가 12 → 15로 늘어 Vercel Dashboard가 다소 붐빈다.

### Follow-ups

0. **격리 단위는 행정구역이 아니라 도메인이다** (최우선 원칙).
   수원을 분리했다고 해서 다음 시·군마다 전용 cron을 만들면 안 된다. 경기
   나머지 시·군은 `goeay.kr` / `goegu.kr`을 **공유**하므로 시별로 쪼개면
   **같은 도메인에 여러 cron이 동시에 chunk 30씩 때린다** — 이것이 정확히
   Stage 14-32에서 서울 두 cron이 `sen.es.kr`에 60 동시 connection을 걸어
   504를 낸 실패 모드다. 새 cron을 만드는 기준은 **새 도메인이 등장할 때**이며,
   같은 도메인 안에서의 분할은 학교 수가 work-log 임계를 넘을 때만이다.
1. **경기 `gyeonggi.ts` → `gyeonggi/` 전면 전환** (옵션 A-2) — 경기 다음 시·군
   추가 시점. 동명 공존 해소.
1-b. **수원 cron을 경기 통합으로 재흡수 검토** — `goesw.kr` 거동이 몇 주간
   안정적으로 관측되면 격리 목적이 소멸한다. 그 시점에 D-1로 되돌려 cron
   entry와 함수 수를 줄이는 것이 합리적일 수 있다.
2. **기존 경기 75교에 `gyeonggi_`/시별 prefix 부여 검토** — URL 파괴를 동반하므로
   신중. 리다이렉트 전략 필요.
3. **수원 사진 미검출 학교의 mi 보정 + `VERIFIED_REASONS` 등재** — 스펙 Non-Goals
   에서 명시적으로 후속 TODO로 미룸.
4. **경기 전체 그룹 체계(`gyeonggiGroups.ts` 4분할)** — 1,300교 시점.
5. **`generate-school-status.mjs` probe 병렬화 또는 캐시** — 787교에서 이미
   느리고 1,300교에서는 실용성 한계(F-9).
6. **수원 중·고등학교** — 이번 범위는 초등학교만.

---

## Open Questions

`.omc/plans/open-questions.md`에 함께 기록됨.

### `[BLOCKING]` — 착수 전 사용자 결정 필수

1. **`[BLOCKING]` 중앙기독초 id 확정** — `suwon_jungangchristian` / `suwon_cca` /
   그 외? 스크립트가 `sysId` null 시 한글 `SCHUL_NM`을 id로 쓴다. 배포 후
   공유 링크에 고착돼 변경 비용이 크다. (R-13, AC-5)

2. **`[BLOCKING]` mi 추출 실패 학교 처리** — 예상 5~15교.
   - (a) **이번 Stage에서 보정** → `M = 101`
   - (b) **후속 TODO로 이월** (스펙 Non-Goals 따름) → `M = Step 1 실측값`

   **이 결정이 AC-3 / AC-11 / V-1 / V-3의 기대값을 전부 좌우한다.** 101을
   상수로 박아두면 (b) 분기에서 게이트가 거짓 실패한다. 어느 쪽이든
   AC-2b의 실패 학교 목록 산출은 필수다. `M > 0`은 분기 무관 hard gate.

3. **`[BLOCKING]` 약칭 host 13개 id 확정** — `dsw`, `swsg`, `swjc`, `hgok`,
   `omokk`, `cmschool`, `swkumgok`, `swgumho`, `swmaehwa`, `swsunil`,
   `swhwaseo`, `swhwayang`, `eui`. 학교명 발음 기반 수동 해석이며
   `swkumgok`/`swgumho`처럼 로마자화 규칙이 갈리는 것이 있다. 커밋 전 학교명과
   나란히 놓고 **1회 육안 대조** 필요. (R-9 — 심각도 중으로 승격.
   배포 후 링크 고착은 1건이나 13건이나 성격이 같고 건수는 13배다)

### `[NON-BLOCKING]` — 실행 중 판단 가능

4. **`[NON-BLOCKING]` `refresh-neis` chunk 도입 여부** — 787교 × 2 = 1,574 동시
   요청을 단일 `Promise.all`로 낸다(`maxDuration = 300`). AC-19의 수치 임계
   (`errored` > 기준선+10 또는 `elapsedMs` > 240,000)에 걸리면 후속 Stage 등록.
   이번 범위는 관측 + 임계 판정까지.

5. **`[NON-BLOCKING]` `gyeonggi.ts` → `gyeonggi/` 전면 전환 시점** — 이번엔
   동명 공존(A-1). 경기 나머지 시·군 추가 시 정리 필요. (ADR Follow-up 1)

> `경기 수원`의 `regionOrder` 위치는 **AC-12에서 이미 "경기 4도시 뒤, 서울 앞"으로
> 확정**했다. 초기 계획이 같은 항목을 Open Question으로도 중복 제기했으므로
> 여기서는 삭제한다 (non-blocking이며 AC-12의 결정을 채택).

**조사 후 해소된 것 (참고):**

- ~~prune이 신규 수원 미러를 지울 위험~~ → **해소.** `pruneOldPhotos()`는
  `ymd < cutoff` 날짜 기준이라 신규 미러는 안전 (F-12)
- ~~`gyeonggi.ts` + `gyeonggi/` 공존이 컴파일되는가~~ → **해소.** tsc bundler
  실증 exit 0 (F-7)
- ~~`refresh-neis`에 region 필터가 있는가~~ → **해소.** 필터 없음, 전수 순회 (F-11)
