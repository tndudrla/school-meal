# Runbook — Stage 14-8 ~ 14-16 영등포·구로·양천·강서·노원·도봉·마포·서대문·은평 (Phase B+C)

> server-pc Cursor Claude Code 가 받아 sequential 실행할 지시서.
> dev-pc 에서 host 추출·충돌 분석 끝낸 상태 (2026-05-02). 본 runbook 은
> **list 그대로 등록만** 시키는 형태 — 새로 host 추출하거나 작명 규칙
> 다시 적용하지 말 것.

## 전제

- 작업 브랜치: `dev`
- 작업 디렉터리: `C:\Users\admin\workspace\school-meal`
- dev 서버: 별도 PowerShell 탭에서 `npm run dev` 떠 있어야 함
- 환경변수: `.env.local` 셋업 완료
- 본 stage 가 끝날 때까지 dev-pc(다른 환경) 은 schools/·docs/ 손대지 않기로 합의

## 작업 단위

서울 9개 자치구 합계 **251교**. 모두 sen.es.kr 도메인 (예외 2교).
id 충돌 없음 확인 완료.

| Stage | 자치구 | 학교 | 비고 |
|---|---|---|---|
| 14-8 | 영등포 | 23 | 모두 sen.es.kr |
| 14-9 | 구로 | 27 | 1교 (천이초) host 없음 → scrape 생략 |
| 14-10 | 양천 | 30 | 모두 sen.es.kr |
| 14-11 | 강서 | 35 | 모두 sen.es.kr |
| 14-12 | 노원 | 42 | 모두 sen.es.kr |
| 14-13 | 도봉 | 23 | 모두 sen.es.kr |
| 14-14 | 마포 | 22 | 모두 sen.es.kr |
| 14-15 | 서대문 | 19 | 1교 (명지초) host=myongji.net → scrape 생략 |
| 14-16 | 은평 | 30 | 모두 sen.es.kr |

9개 stage = 9번의 "파일 작성 → 빌드 → probe → commit → push" 사이클.
**status 갱신은 마지막 stage (14-16) 끝에 단 한 번만** — 515교 (264 + 251)
전부 등록 후 한꺼번에.

---

## Step 0 — 시작 전 동기화

```powershell
git pull origin dev
git log -1 --oneline
```

기대: dev-pc 가 최신 push 한 commit 보임 (Phase A 완료 b0fadef 이후 본 runbook).

---

## Stage 14-8 — 영등포구 23교

### 1-A — 새 파일 작성: `src/lib/schools/seoul/yeongdeungpo.ts`

```ts
/**
 * 서울 영등포구 23교 — Stage 14-8 (2026-05-02), Phase B 첫 자치구.
 *
 * 모두 sen.es.kr 패턴. id 충돌 없음.
 * id 와 subdomain 다른 케이스 (idaegil, sdr, syw, ydp 등 약칭/접두사).
 */

import type { SchoolConfig } from '../index';

export const YEONGDEUNGPO_SCHOOLS: Record<string, SchoolConfig> = {
  seoul_dangsan: {
    id: 'seoul_dangsan',
    name: '서울당산초등학교',
    level: 'elementary',
    region: '서울 영등포',
    neis: { atptCode: 'B10', schoolCode: '7041113' },
    scrape: { kind: 'sen-es', host: 'dangsan.sen.es.kr' },
  },
  seoul_dangseo: {
    id: 'seoul_dangseo',
    name: '서울당서초등학교',
    level: 'elementary',
    region: '서울 영등포',
    neis: { atptCode: 'B10', schoolCode: '7041114' },
    scrape: { kind: 'sen-es', host: 'dangseo.sen.es.kr' },
  },
  seoul_dangjung: {
    id: 'seoul_dangjung',
    name: '서울당중초등학교',
    level: 'elementary',
    region: '서울 영등포',
    neis: { atptCode: 'B10', schoolCode: '7041115' },
    scrape: { kind: 'sen-es', host: 'dangjung.sen.es.kr' },
  },
  seoul_daegil: {
    id: 'seoul_daegil',
    name: '서울대길초등학교',
    level: 'elementary',
    region: '서울 영등포',
    neis: { atptCode: 'B10', schoolCode: '7041116' },
    scrape: { kind: 'sen-es', host: 'idaegil.sen.es.kr' },
  },
  seoul_daedong: {
    id: 'seoul_daedong',
    name: '서울대동초등학교',
    level: 'elementary',
    region: '서울 영등포',
    neis: { atptCode: 'B10', schoolCode: '7041117' },
    scrape: { kind: 'sen-es', host: 'daedong.sen.es.kr' },
  },
  seoul_daebang: {
    id: 'seoul_daebang',
    name: '서울대방초등학교',
    level: 'elementary',
    region: '서울 영등포',
    neis: { atptCode: 'B10', schoolCode: '7041118' },
    scrape: { kind: 'sen-es', host: 'daebang.sen.es.kr' },
  },
  seoul_daeyoung: {
    id: 'seoul_daeyoung',
    name: '서울대영초등학교',
    level: 'elementary',
    region: '서울 영등포',
    neis: { atptCode: 'B10', schoolCode: '7041119' },
    scrape: { kind: 'sen-es', host: 'daeyoung.sen.es.kr' },
  },
  seoul_dorim: {
    id: 'seoul_dorim',
    name: '서울도림초등학교',
    level: 'elementary',
    region: '서울 영등포',
    neis: { atptCode: 'B10', schoolCode: '7041121' },
    scrape: { kind: 'sen-es', host: 'seouldorim.sen.es.kr' },
  },
  seoul_doshin: {
    id: 'seoul_doshin',
    name: '서울도신초등학교',
    level: 'elementary',
    region: '서울 영등포',
    neis: { atptCode: 'B10', schoolCode: '7041122' },
    scrape: { kind: 'sen-es', host: 'doshin.sen.es.kr' },
  },
  seoul_mullae: {
    id: 'seoul_mullae',
    name: '서울문래초등학교',
    level: 'elementary',
    region: '서울 영등포',
    neis: { atptCode: 'B10', schoolCode: '7041128' },
    scrape: { kind: 'sen-es', host: 'mullae.sen.es.kr' },
  },
  seoul_seonyu: {
    id: 'seoul_seonyu',
    name: '서울선유초등학교',
    level: 'elementary',
    region: '서울 영등포',
    neis: { atptCode: 'B10', schoolCode: '7041133' },
    scrape: { kind: 'sen-es', host: 'seonyu.sen.es.kr' },
  },
  seoul_sindaerim: {
    id: 'seoul_sindaerim',
    name: '서울신대림초등학교',
    level: 'elementary',
    region: '서울 영등포',
    neis: { atptCode: 'B10', schoolCode: '7041137' },
    scrape: { kind: 'sen-es', host: 'sdr.sen.es.kr' },
  },
  seoul_shinyoung: {
    id: 'seoul_shinyoung',
    name: '서울신영초등학교',
    level: 'elementary',
    region: '서울 영등포',
    neis: { atptCode: 'B10', schoolCode: '7041140' },
    scrape: { kind: 'sen-es', host: 'shinyoung.sen.es.kr' },
  },
  seoul_yeouido: {
    id: 'seoul_yeouido',
    name: '서울여의도초등학교',
    level: 'elementary',
    region: '서울 영등포',
    neis: { atptCode: 'B10', schoolCode: '7041143' },
    scrape: { kind: 'sen-es', host: 'yeouido.sen.es.kr' },
  },
  seoul_youngdong: {
    id: 'seoul_youngdong',
    name: '서울영동초등학교',
    level: 'elementary',
    region: '서울 영등포',
    neis: { atptCode: 'B10', schoolCode: '7041145' },
    scrape: { kind: 'sen-es', host: 'youngdong.sen.es.kr' },
  },
  seoul_yeongdeungpo: {
    id: 'seoul_yeongdeungpo',
    name: '서울영등포초등학교',
    level: 'elementary',
    region: '서울 영등포',
    neis: { atptCode: 'B10', schoolCode: '7041146' },
    scrape: { kind: 'sen-es', host: 'ydp.sen.es.kr' },
  },
  seoul_younglim: {
    id: 'seoul_younglim',
    name: '서울영림초등학교',
    level: 'elementary',
    region: '서울 영등포',
    neis: { atptCode: 'B10', schoolCode: '7041147' },
    scrape: { kind: 'sen-es', host: 'younglim.sen.es.kr' },
  },
  seoul_youngmoon: {
    id: 'seoul_youngmoon',
    name: '서울영문초등학교',
    level: 'elementary',
    region: '서울 영등포',
    neis: { atptCode: 'B10', schoolCode: '7041148' },
    scrape: { kind: 'sen-es', host: 'youngmoon.sen.es.kr' },
  },
  seoul_youngsin: {
    id: 'seoul_youngsin',
    name: '서울영신초등학교',
    level: 'elementary',
    region: '서울 영등포',
    neis: { atptCode: 'B10', schoolCode: '7041150' },
    scrape: { kind: 'sen-es', host: 'youngsin.sen.es.kr' },
  },
  seoul_youngwon: {
    id: 'seoul_youngwon',
    name: '서울영원초등학교',
    level: 'elementary',
    region: '서울 영등포',
    neis: { atptCode: 'B10', schoolCode: '7041151' },
    scrape: { kind: 'sen-es', host: 'syw.sen.es.kr' },
  },
  seoul_youngjoong: {
    id: 'seoul_youngjoong',
    name: '서울영중초등학교',
    level: 'elementary',
    region: '서울 영등포',
    neis: { atptCode: 'B10', schoolCode: '7041153' },
    scrape: { kind: 'sen-es', host: 'youngjoong.sen.es.kr' },
  },
  seoul_usin: {
    id: 'seoul_usin',
    name: '서울우신초등학교',
    level: 'elementary',
    region: '서울 영등포',
    neis: { atptCode: 'B10', schoolCode: '7041158' },
    scrape: { kind: 'sen-es', host: 'usin.sen.es.kr' },
  },
  seoul_yunjung: {
    id: 'seoul_yunjung',
    name: '서울윤중초등학교',
    level: 'elementary',
    region: '서울 영등포',
    neis: { atptCode: 'B10', schoolCode: '7041159' },
    scrape: { kind: 'sen-es', host: 'yunjung.sen.es.kr' },
  },
};
```

### 1-B — `src/lib/schools/index.ts` 갱신
- import + spread + 주석 한 줄 추가 (이하 모든 stage 동일 패턴)

### 1-C — 빌드 + dev probe
```powershell
npm run build 2>&1 | Select-Object -Last 20
curl.exe -s "http://localhost:3000/api/meal/photo?schoolId=chonggye&ymd=20260428"
curl.exe -s "http://localhost:3000/api/meal/photo?schoolId=donggwang&ymd=20260428"   # 14-7 회귀
curl.exe -s "http://localhost:3000/api/meal/photo?schoolId=seoul_dangsan&ymd=20260428"
curl.exe -s "http://localhost:3000/api/meal/photo?schoolId=seoul_yeouido&ymd=20260428"
curl.exe -s "http://localhost:3000/api/meal/photo?schoolId=seoul_yeongdeungpo&ymd=20260428"
```

### 1-D — work-log + commit + push
```
## Stage 14-8 — 서울 영등포구 23교 (2026-05-02)

Phase B 첫 자치구. 모두 sen.es.kr, 사립 0교, id 충돌 없음.
host 약칭 다수 (idaegil→seoul_daegil, sdr→seoul_sindaerim, syw→seoul_youngwon, ydp→seoul_yeongdeungpo).
```

```powershell
git add src/lib/schools/seoul/yeongdeungpo.ts src/lib/schools/index.ts docs/work-log.md
git commit -m "feat(seoul): Stage 14-8 — 영등포구 23교"
git push origin dev
```

---

## Stage 14-9 — 구로구 27교

### 2-A — 새 파일 작성: `src/lib/schools/seoul/guro.ts`

**중요**: `seoul_cheoni` (서울천이초) 는 NEIS HMPG_ADRES 빈값 → `scrape` 생략 (NEIS 메뉴만 노출).

```ts
/**
 * 서울 구로구 27교 — Stage 14-9 (2026-05-02), Phase B 두 번째 자치구.
 *
 * 26교 sen.es.kr + 1교 (천이초) HMPG_ADRES 빈값 → scrape 생략 (NEIS 메뉴만).
 * id 충돌 없음.
 */

import type { SchoolConfig } from '../index';

export const GURO_SCHOOLS: Record<string, SchoolConfig> = {
  seoul_kaemyong: {
    id: 'seoul_kaemyong',
    name: '서울개명초등학교',
    level: 'elementary',
    region: '서울 구로',
    neis: { atptCode: 'B10', schoolCode: '7041101' },
    scrape: { kind: 'sen-es', host: 'kaemyong.sen.es.kr' },
  },
  seoul_gaebong: {
    id: 'seoul_gaebong',
    name: '서울개봉초등학교',
    level: 'elementary',
    region: '서울 구로',
    neis: { atptCode: 'B10', schoolCode: '7041102' },
    scrape: { kind: 'sen-es', host: 'gaebong.sen.es.kr' },
  },
  seoul_gaewoong: {
    id: 'seoul_gaewoong',
    name: '서울개웅초등학교',
    level: 'elementary',
    region: '서울 구로',
    neis: { atptCode: 'B10', schoolCode: '7041103' },
    scrape: { kind: 'sen-es', host: 'gaewoong.sen.es.kr' },
  },
  seoul_kohsan: {
    id: 'seoul_kohsan',
    name: '서울고산초등학교',
    level: 'elementary',
    region: '서울 구로',
    neis: { atptCode: 'B10', schoolCode: '7041104' },
    scrape: { kind: 'sen-es', host: 'kohsan.sen.es.kr' },
  },
  seoul_gowon: {
    id: 'seoul_gowon',
    name: '서울고원초등학교',
    level: 'elementary',
    region: '서울 구로',
    neis: { atptCode: 'B10', schoolCode: '7041105' },
    scrape: { kind: 'sen-es', host: 'gowon.sen.es.kr' },
  },
  seoul_gocheok: {
    id: 'seoul_gocheok',
    name: '서울고척초등학교',
    level: 'elementary',
    region: '서울 구로',
    neis: { atptCode: 'B10', schoolCode: '7041106' },
    scrape: { kind: 'sen-es', host: 'gocheok.sen.es.kr' },
  },
  seoul_guronam: {
    id: 'seoul_guronam',
    name: '서울구로남초등학교',
    level: 'elementary',
    region: '서울 구로',
    neis: { atptCode: 'B10', schoolCode: '7041107' },
    scrape: { kind: 'sen-es', host: 'guronam.sen.es.kr' },
  },
  seoul_guro: {
    id: 'seoul_guro',
    name: '서울구로초등학교',
    level: 'elementary',
    region: '서울 구로',
    neis: { atptCode: 'B10', schoolCode: '7041108' },
    scrape: { kind: 'sen-es', host: 'guro.sen.es.kr' },
  },
  seoul_guil: {
    id: 'seoul_guil',
    name: '서울구일초등학교',
    level: 'elementary',
    region: '서울 구로',
    neis: { atptCode: 'B10', schoolCode: '7041109' },
    scrape: { kind: 'sen-es', host: 'guil.sen.es.kr' },
  },
  seoul_dukeui: {
    id: 'seoul_dukeui',
    name: '서울덕의초등학교',
    level: 'elementary',
    region: '서울 구로',
    neis: { atptCode: 'B10', schoolCode: '7041120' },
    scrape: { kind: 'sen-es', host: 'dukeui.sen.es.kr' },
  },
  seoul_dongguro: {
    id: 'seoul_dongguro',
    name: '서울동구로초등학교',
    level: 'elementary',
    region: '서울 구로',
    neis: { atptCode: 'B10', schoolCode: '7041124' },
    scrape: { kind: 'sen-es', host: 'dongguro.sen.es.kr' },
  },
  seoul_maebong: {
    id: 'seoul_maebong',
    name: '서울매봉초등학교',
    level: 'elementary',
    region: '서울 구로',
    neis: { atptCode: 'B10', schoolCode: '7041126' },
    scrape: { kind: 'sen-es', host: 'maebong.sen.es.kr' },
  },
  seoul_mirae: {
    id: 'seoul_mirae',
    name: '서울미래초등학교',
    level: 'elementary',
    region: '서울 구로',
    neis: { atptCode: 'B10', schoolCode: '7041131' },
    scrape: { kind: 'sen-es', host: 'mirae.sen.es.kr' },
  },
  seoul_segok: {
    id: 'seoul_segok',
    name: '서울세곡초등학교',
    level: 'elementary',
    region: '서울 구로',
    neis: { atptCode: 'B10', schoolCode: '7041134' },
    scrape: { kind: 'sen-es', host: 'segok.sen.es.kr' },
  },
  seoul_singuro: {
    id: 'seoul_singuro',
    name: '서울신구로초등학교',
    level: 'elementary',
    region: '서울 구로',
    neis: { atptCode: 'B10', schoolCode: '7041136' },
    scrape: { kind: 'sen-es', host: 'singuro.sen.es.kr' },
  },
  seoul_sindorim: {
    id: 'seoul_sindorim',
    name: '서울신도림초등학교',
    level: 'elementary',
    region: '서울 구로',
    neis: { atptCode: 'B10', schoolCode: '7041138' },
    scrape: { kind: 'sen-es', host: 'sindorim.sen.es.kr' },
  },
  seoul_sinmirim: {
    id: 'seoul_sinmirim',
    name: '서울신미림초등학교',
    level: 'elementary',
    region: '서울 구로',
    neis: { atptCode: 'B10', schoolCode: '7041139' },
    scrape: { kind: 'sen-es', host: 'sinmirim.sen.es.kr' },
  },
  seoul_youngseo: {
    id: 'seoul_youngseo',
    name: '서울영서초등학교',
    level: 'elementary',
    region: '서울 구로',
    neis: { atptCode: 'B10', schoolCode: '7041149' },
    scrape: { kind: 'sen-es', host: 'youngseo.sen.es.kr' },
  },
  seoul_youngil: {
    id: 'seoul_youngil',
    name: '서울영일초등학교',
    level: 'elementary',
    region: '서울 구로',
    neis: { atptCode: 'B10', schoolCode: '7041152' },
    scrape: { kind: 'sen-es', host: 'syoungil.sen.es.kr' },
  },
  seoul_oryunam: {
    id: 'seoul_oryunam',
    name: '서울오류남초등학교',
    level: 'elementary',
    region: '서울 구로',
    neis: { atptCode: 'B10', schoolCode: '7041154' },
    scrape: { kind: 'sen-es', host: 'oryunam.sen.es.kr' },
  },
  seoul_oryu: {
    id: 'seoul_oryu',
    name: '서울오류초등학교',
    level: 'elementary',
    region: '서울 구로',
    neis: { atptCode: 'B10', schoolCode: '7041155' },
    scrape: { kind: 'sen-es', host: 'oryu.sen.es.kr' },
  },
  seoul_ojung: {
    id: 'seoul_ojung',
    name: '서울오정초등학교',
    level: 'elementary',
    region: '서울 구로',
    neis: { atptCode: 'B10', schoolCode: '7041156' },
    scrape: { kind: 'sen-es', host: 'ojung.sen.es.kr' },
  },
  seoul_onsu: {
    id: 'seoul_onsu',
    name: '서울온수초등학교',
    level: 'elementary',
    region: '서울 구로',
    neis: { atptCode: 'B10', schoolCode: '7041157' },
    scrape: { kind: 'sen-es', host: 'onsu.sen.es.kr' },
  },
  seoul_cheonwang: {
    id: 'seoul_cheonwang',
    name: '서울천왕초등학교',
    level: 'elementary',
    region: '서울 구로',
    neis: { atptCode: 'B10', schoolCode: '7041209' },
    scrape: { kind: 'sen-es', host: 'cheonwang.sen.es.kr' },
  },
  seoul_cheoni: {
    id: 'seoul_cheoni',
    name: '서울천이초등학교',
    level: 'elementary',
    region: '서울 구로',
    neis: { atptCode: 'B10', schoolCode: '7041254' },
    // scrape 생략 — NEIS HMPG_ADRES 빈값. 메뉴만 노출, 사진 미지원.
  },
  seoul_skyforest: {
    id: 'seoul_skyforest',
    name: '서울하늘숲초등학교',
    level: 'elementary',
    region: '서울 구로',
    neis: { atptCode: 'B10', schoolCode: '7041266' },
    scrape: { kind: 'sen-es', host: 'skyf.sen.es.kr' },
  },
  seoul_hangdong: {
    id: 'seoul_hangdong',
    name: '서울항동초등학교',
    level: 'elementary',
    region: '서울 구로',
    neis: { atptCode: 'B10', schoolCode: '7041267' },
    scrape: { kind: 'sen-es', host: 'hangdong.sen.es.kr' },
  },
};
```

### 2-B/2-C/2-D — 동일 패턴
- index.ts 갱신
- 빌드 + probe (chonggye + 회귀 한 개 + 신규 3개. 신규는 `seoul_guro`, `seoul_yeouido`(영등포 회귀), `seoul_gocheok`)
- work-log + commit + push

work-log 본문:
```
## Stage 14-9 — 서울 구로구 27교 (2026-05-02)

Phase B 두 번째 자치구. 26교 sen.es.kr + 1교 (천이초) HMPG_ADRES 빈값으로
scrape 생략 (NEIS 메뉴만 노출, 사진 미지원). id 충돌 없음.
```

---

## Stage 14-10 — 양천구 30교

### 3-A — `src/lib/schools/seoul/yangcheon.ts`

```ts
/**
 * 서울 양천구 30교 — Stage 14-10 (2026-05-02), Phase B 세 번째 자치구.
 *
 * 모두 sen.es.kr 패턴. id 충돌 없음.
 * host 약칭 (smd, sj, se, swc 등 다수).
 */

import type { SchoolConfig } from '../index';

export const YANGCHEON_SCHOOLS: Record<string, SchoolConfig> = {
  seoul_galsan: {
    id: 'seoul_galsan',
    name: '서울갈산초등학교',
    level: 'elementary',
    region: '서울 양천',
    neis: { atptCode: 'B10', schoolCode: '7081420' },
    scrape: { kind: 'sen-es', host: 'galsan.sen.es.kr' },
  },
  seoul_gangseo: {
    id: 'seoul_gangseo',
    name: '서울강서초등학교',
    level: 'elementary',
    region: '서울 양천',
    neis: { atptCode: 'B10', schoolCode: '7081421' },
    scrape: { kind: 'sen-es', host: 'gangseo.sen.es.kr' },
  },
  seoul_kangsin: {
    id: 'seoul_kangsin',
    name: '서울강신초등학교',
    level: 'elementary',
    region: '서울 양천',
    neis: { atptCode: 'B10', schoolCode: '7081422' },
    scrape: { kind: 'sen-es', host: 'kangsin.sen.es.kr' },
  },
  seoul_gangwol: {
    id: 'seoul_gangwol',
    name: '서울강월초등학교',
    level: 'elementary',
    region: '서울 양천',
    neis: { atptCode: 'B10', schoolCode: '7081423' },
    scrape: { kind: 'sen-es', host: 'gangwol.sen.es.kr' },
  },
  seoul_kyongin: {
    id: 'seoul_kyongin',
    name: '서울경인초등학교',
    level: 'elementary',
    region: '서울 양천',
    neis: { atptCode: 'B10', schoolCode: '7081425' },
    scrape: { kind: 'sen-es', host: 'kyongin.sen.es.kr' },
  },
  seoul_gyenam: {
    id: 'seoul_gyenam',
    name: '서울계남초등학교',
    level: 'elementary',
    region: '서울 양천',
    neis: { atptCode: 'B10', schoolCode: '7081426' },
    scrape: { kind: 'sen-es', host: 'gyenam.sen.es.kr' },
  },
  seoul_nammyeong: {
    id: 'seoul_nammyeong',
    name: '서울남명초등학교',
    level: 'elementary',
    region: '서울 양천',
    neis: { atptCode: 'B10', schoolCode: '7081429' },
    scrape: { kind: 'sen-es', host: 'nammyeong.sen.es.kr' },
  },
  seoul_mokdong: {
    id: 'seoul_mokdong',
    name: '서울목동초등학교',
    level: 'elementary',
    region: '서울 양천',
    neis: { atptCode: 'B10', schoolCode: '7081438' },
    scrape: { kind: 'sen-es', host: 'smd.sen.es.kr' },
  },
  seoul_mogun: {
    id: 'seoul_mogun',
    name: '서울목운초등학교',
    level: 'elementary',
    region: '서울 양천',
    neis: { atptCode: 'B10', schoolCode: '7081439' },
    scrape: { kind: 'sen-es', host: 'mogun.sen.es.kr' },
  },
  seoul_mokwon: {
    id: 'seoul_mokwon',
    name: '서울목원초등학교',
    level: 'elementary',
    region: '서울 양천',
    neis: { atptCode: 'B10', schoolCode: '7081440' },
    scrape: { kind: 'sen-es', host: 'mokwon.sen.es.kr' },
  },
  seoul_seojeong: {
    id: 'seoul_seojeong',
    name: '서울서정초등학교',
    level: 'elementary',
    region: '서울 양천',
    neis: { atptCode: 'B10', schoolCode: '7081445' },
    scrape: { kind: 'sen-es', host: 'sj.sen.es.kr' },
  },
  seoul_singang: {
    id: 'seoul_singang',
    name: '서울신강초등학교',
    level: 'elementary',
    region: '서울 양천',
    neis: { atptCode: 'B10', schoolCode: '7081449' },
    scrape: { kind: 'sen-es', host: 'singang.sen.es.kr' },
  },
  seoul_singi: {
    id: 'seoul_singi',
    name: '서울신기초등학교',
    level: 'elementary',
    region: '서울 양천',
    neis: { atptCode: 'B10', schoolCode: '7081451' },
    scrape: { kind: 'sen-es', host: 'singi.sen.es.kr' },
  },
  seoul_sinnam: {
    id: 'seoul_sinnam',
    name: '서울신남초등학교',
    level: 'elementary',
    region: '서울 양천',
    neis: { atptCode: 'B10', schoolCode: '7081452' },
    scrape: { kind: 'sen-es', host: 'sinnam.sen.es.kr' },
  },
  seoul_sinmoc: {
    id: 'seoul_sinmoc',
    name: '서울신목초등학교',
    level: 'elementary',
    region: '서울 양천',
    neis: { atptCode: 'B10', schoolCode: '7081453' },
    scrape: { kind: 'sen-es', host: 'sinmoc.sen.es.kr' },
  },
  seoul_sinseo: {
    id: 'seoul_sinseo',
    name: '서울신서초등학교',
    level: 'elementary',
    region: '서울 양천',
    neis: { atptCode: 'B10', schoolCode: '7081454' },
    scrape: { kind: 'sen-es', host: 'sinseo.sen.es.kr' },
  },
  seoul_shinwon: {
    id: 'seoul_shinwon',
    name: '서울신원초등학교',
    level: 'elementary',
    region: '서울 양천',
    neis: { atptCode: 'B10', schoolCode: '7081455' },
    scrape: { kind: 'sen-es', host: 'shinwon.sen.es.kr' },
  },
  seoul_sineun: {
    id: 'seoul_sineun',
    name: '서울신은초등학교',
    level: 'elementary',
    region: '서울 양천',
    neis: { atptCode: 'B10', schoolCode: '7081482' },
    scrape: { kind: 'sen-es', host: 'se.sen.es.kr' },
  },
  seoul_yanggang: {
    id: 'seoul_yanggang',
    name: '서울양강초등학교',
    level: 'elementary',
    region: '서울 양천',
    neis: { atptCode: 'B10', schoolCode: '7081458' },
    scrape: { kind: 'sen-es', host: 'yanggang.sen.es.kr' },
  },
  seoul_yangdong: {
    id: 'seoul_yangdong',
    name: '서울양동초등학교',
    level: 'elementary',
    region: '서울 양천',
    neis: { atptCode: 'B10', schoolCode: '7081459' },
    scrape: { kind: 'sen-es', host: 'yangdong.sen.es.kr' },
  },
  seoul_yangmyung: {
    id: 'seoul_yangmyung',
    name: '서울양명초등학교',
    level: 'elementary',
    region: '서울 양천',
    neis: { atptCode: 'B10', schoolCode: '7081460' },
    scrape: { kind: 'sen-es', host: 'yangmyung.sen.es.kr' },
  },
  seoul_yangmok: {
    id: 'seoul_yangmok',
    name: '서울양목초등학교',
    level: 'elementary',
    region: '서울 양천',
    neis: { atptCode: 'B10', schoolCode: '7081461' },
    scrape: { kind: 'sen-es', host: 'yangmok.sen.es.kr' },
  },
  seoul_yangwon: {
    id: 'seoul_yangwon',
    name: '서울양원초등학교',
    level: 'elementary',
    region: '서울 양천',
    neis: { atptCode: 'B10', schoolCode: '7081462' },
    scrape: { kind: 'sen-es', host: 'yangwon.sen.es.kr' },
  },
  seoul_yanghwa: {
    id: 'seoul_yanghwa',
    name: '서울양화초등학교',
    level: 'elementary',
    region: '서울 양천',
    neis: { atptCode: 'B10', schoolCode: '7081464' },
    scrape: { kind: 'sen-es', host: 'yanghwa.sen.es.kr' },
  },
  seoul_youngdo: {
    id: 'seoul_youngdo',
    name: '서울영도초등학교',
    level: 'elementary',
    region: '서울 양천',
    neis: { atptCode: 'B10', schoolCode: '7081469' },
    scrape: { kind: 'sen-es', host: 'youngdo.sen.es.kr' },
  },
  seoul_wolchon: {
    id: 'seoul_wolchon',
    name: '서울월촌초등학교',
    level: 'elementary',
    region: '서울 양천',
    neis: { atptCode: 'B10', schoolCode: '7081472' },
    scrape: { kind: 'sen-es', host: 'swc.sen.es.kr' },
  },
  seoul_eunjung: {
    id: 'seoul_eunjung',
    name: '서울은정초등학교',
    level: 'elementary',
    region: '서울 양천',
    neis: { atptCode: 'B10', schoolCode: '7081473' },
    scrape: { kind: 'sen-es', host: 'eunjung.sen.es.kr' },
  },
  seoul_jangsoo: {
    id: 'seoul_jangsoo',
    name: '서울장수초등학교',
    level: 'elementary',
    region: '서울 양천',
    neis: { atptCode: 'B10', schoolCode: '7081474' },
    scrape: { kind: 'sen-es', host: 'jangsoo.sen.es.kr' },
  },
  seoul_jeongmok: {
    id: 'seoul_jeongmok',
    name: '서울정목초등학교',
    level: 'elementary',
    region: '서울 양천',
    neis: { atptCode: 'B10', schoolCode: '7081476' },
    scrape: { kind: 'sen-es', host: 'jeongmok.sen.es.kr' },
  },
  seoul_jihyang: {
    id: 'seoul_jihyang',
    name: '서울지향초등학교',
    level: 'elementary',
    region: '서울 양천',
    neis: { atptCode: 'B10', schoolCode: '7081477' },
    scrape: { kind: 'sen-es', host: 'jihyang.sen.es.kr' },
  },
};
```

### 3-B/3-C/3-D — 동일 패턴
- probe 신규: `seoul_mokdong`, `seoul_yangcheon` (사실 이건 강서구 학교 — 아래 14-11 에서 등록), `seoul_galsan`, `seoul_jangsoo`
- commit: `feat(seoul): Stage 14-10 — 양천구 30교`

---

## Stage 14-11 — 강서구 35교

### 4-A — `src/lib/schools/seoul/gangseo.ts`

```ts
/**
 * 서울 강서구 35교 — Stage 14-11 (2026-05-02), Phase B 네 번째 자치구.
 *
 * 34교 sen.es.kr + 유석초 (서울 prefix 없음, 사립 추정) — host 가 sen.es.kr 라
 * sen-es scraper 그대로 동작. id 충돌 없음.
 */

import type { SchoolConfig } from '../index';

export const GANGSEO_SCHOOLS: Record<string, SchoolConfig> = {
  seoul_gagok: {
    id: 'seoul_gagok',
    name: '서울가곡초등학교',
    level: 'elementary',
    region: '서울 강서',
    neis: { atptCode: 'B10', schoolCode: '7081418' },
    scrape: { kind: 'sen-es', host: 'gagok.sen.es.kr' },
  },
  seoul_kayang: {
    id: 'seoul_kayang',
    name: '서울가양초등학교',
    level: 'elementary',
    region: '서울 강서',
    neis: { atptCode: 'B10', schoolCode: '7081419' },
    scrape: { kind: 'sen-es', host: 'kayang.sen.es.kr' },
  },
  seoul_gaehwa: {
    id: 'seoul_gaehwa',
    name: '서울개화초등학교',
    level: 'elementary',
    region: '서울 강서',
    neis: { atptCode: 'B10', schoolCode: '7081424' },
    scrape: { kind: 'sen-es', host: 'gaehwa.sen.es.kr' },
  },
  seoul_kongjin: {
    id: 'seoul_kongjin',
    name: '서울공진초등학교',
    level: 'elementary',
    region: '서울 강서',
    neis: { atptCode: 'B10', schoolCode: '7081427' },
    scrape: { kind: 'sen-es', host: 'kongjin.sen.es.kr' },
  },
  seoul_konghang: {
    id: 'seoul_konghang',
    name: '서울공항초등학교',
    level: 'elementary',
    region: '서울 강서',
    neis: { atptCode: 'B10', schoolCode: '7081428' },
    scrape: { kind: 'sen-es', host: 'konghang.sen.es.kr' },
  },
  seoul_naebalsan: {
    id: 'seoul_naebalsan',
    name: '서울내발산초등학교',
    level: 'elementary',
    region: '서울 강서',
    neis: { atptCode: 'B10', schoolCode: '7081430' },
    scrape: { kind: 'sen-es', host: 'nbs.sen.es.kr' },
  },
  seoul_deungma: {
    id: 'seoul_deungma',
    name: '서울등마초등학교',
    level: 'elementary',
    region: '서울 강서',
    neis: { atptCode: 'B10', schoolCode: '7081431' },
    scrape: { kind: 'sen-es', host: 'dma.sen.es.kr' },
  },
  seoul_dungmyong: {
    id: 'seoul_dungmyong',
    name: '서울등명초등학교',
    level: 'elementary',
    region: '서울 강서',
    neis: { atptCode: 'B10', schoolCode: '7081432' },
    scrape: { kind: 'sen-es', host: 'dungmyong.sen.es.kr' },
  },
  seoul_deungseo: {
    id: 'seoul_deungseo',
    name: '서울등서초등학교',
    level: 'elementary',
    region: '서울 강서',
    neis: { atptCode: 'B10', schoolCode: '7081433' },
    scrape: { kind: 'sen-es', host: 'deungseo.sen.es.kr' },
  },
  seoul_dungyang: {
    id: 'seoul_dungyang',
    name: '서울등양초등학교',
    level: 'elementary',
    region: '서울 강서',
    neis: { atptCode: 'B10', schoolCode: '7081434' },
    scrape: { kind: 'sen-es', host: 'dungyang.sen.es.kr' },
  },
  seoul_deungwon: {
    id: 'seoul_deungwon',
    name: '서울등원초등학교',
    level: 'elementary',
    region: '서울 강서',
    neis: { atptCode: 'B10', schoolCode: '7081435' },
    scrape: { kind: 'sen-es', host: 'deungwon.sen.es.kr' },
  },
  seoul_deungchon: {
    id: 'seoul_deungchon',
    name: '서울등촌초등학교',
    level: 'elementary',
    region: '서울 강서',
    neis: { atptCode: 'B10', schoolCode: '7081436' },
    scrape: { kind: 'sen-es', host: 'deungchon.sen.es.kr' },
  },
  seoul_deunghyun: {
    id: 'seoul_deunghyun',
    name: '서울등현초등학교',
    level: 'elementary',
    region: '서울 강서',
    neis: { atptCode: 'B10', schoolCode: '7081437' },
    scrape: { kind: 'sen-es', host: 'deunghyun.sen.es.kr' },
  },
  seoul_balsan: {
    id: 'seoul_balsan',
    name: '서울발산초등학교',
    level: 'elementary',
    region: '서울 강서',
    neis: { atptCode: 'B10', schoolCode: '7081441' },
    scrape: { kind: 'sen-es', host: 'balsan.sen.es.kr' },
  },
  seoul_banghwa: {
    id: 'seoul_banghwa',
    name: '서울방화초등학교',
    level: 'elementary',
    region: '서울 강서',
    neis: { atptCode: 'B10', schoolCode: '7081442' },
    scrape: { kind: 'sen-es', host: 'banghwa.sen.es.kr' },
  },
  seoul_baekseok: {
    id: 'seoul_baekseok',
    name: '서울백석초등학교',
    level: 'elementary',
    region: '서울 강서',
    neis: { atptCode: 'B10', schoolCode: '7081443' },
    scrape: { kind: 'sen-es', host: 'bsbs.sen.es.kr' },
  },
  seoul_samjeong: {
    id: 'seoul_samjeong',
    name: '서울삼정초등학교',
    level: 'elementary',
    region: '서울 강서',
    neis: { atptCode: 'B10', schoolCode: '7081444' },
    scrape: { kind: 'sen-es', host: 'esamjeong.sen.es.kr' },
  },
  seoul_songjeong: {
    id: 'seoul_songjeong',
    name: '서울송정초등학교',
    level: 'elementary',
    region: '서울 강서',
    neis: { atptCode: 'B10', schoolCode: '7081446' },
    scrape: { kind: 'sen-es', host: 'sjes.sen.es.kr' },
  },
  seoul_songhwa: {
    id: 'seoul_songhwa',
    name: '서울송화초등학교',
    level: 'elementary',
    region: '서울 강서',
    neis: { atptCode: 'B10', schoolCode: '7081447' },
    scrape: { kind: 'sen-es', host: 'songhwa.sen.es.kr' },
  },
  seoul_sumyeong: {
    id: 'seoul_sumyeong',
    name: '서울수명초등학교',
    level: 'elementary',
    region: '서울 강서',
    neis: { atptCode: 'B10', schoolCode: '7081448' },
    scrape: { kind: 'sen-es', host: 'sumyeong.sen.es.kr' },
  },
  seoul_singok: {
    id: 'seoul_singok',
    name: '서울신곡초등학교',
    level: 'elementary',
    region: '서울 강서',
    neis: { atptCode: 'B10', schoolCode: '7081450' },
    scrape: { kind: 'sen-es', host: 'sg.sen.es.kr' },
  },
  seoul_sinwol: {
    id: 'seoul_sinwol',
    name: '서울신월초등학교',
    level: 'elementary',
    region: '서울 강서',
    neis: { atptCode: 'B10', schoolCode: '7081456' },
    scrape: { kind: 'sen-es', host: 'ssinwol.sen.es.kr' },
  },
  seoul_sinjeong: {
    id: 'seoul_sinjeong',
    name: '서울신정초등학교',
    level: 'elementary',
    region: '서울 강서',
    neis: { atptCode: 'B10', schoolCode: '7081457' },
    scrape: { kind: 'sen-es', host: 'sinjeong.sen.es.kr' },
  },
  seoul_yangcheon: {
    id: 'seoul_yangcheon',
    name: '서울양천초등학교',
    level: 'elementary',
    region: '서울 강서',
    neis: { atptCode: 'B10', schoolCode: '7081463' },
    scrape: { kind: 'sen-es', host: 'yangcheun.sen.es.kr' },
  },
  seoul_yeomkyoung: {
    id: 'seoul_yeomkyoung',
    name: '서울염경초등학교',
    level: 'elementary',
    region: '서울 강서',
    neis: { atptCode: 'B10', schoolCode: '7081466' },
    scrape: { kind: 'sen-es', host: 'yeomkyoung.sen.es.kr' },
  },
  seoul_yeomdong: {
    id: 'seoul_yeomdong',
    name: '서울염동초등학교',
    level: 'elementary',
    region: '서울 강서',
    neis: { atptCode: 'B10', schoolCode: '7081467' },
    scrape: { kind: 'sen-es', host: 'yeomdong.sen.es.kr' },
  },
  seoul_yeomchang: {
    id: 'seoul_yeomchang',
    name: '서울염창초등학교',
    level: 'elementary',
    region: '서울 강서',
    neis: { atptCode: 'B10', schoolCode: '7081468' },
    scrape: { kind: 'sen-es', host: 'yeomchang.sen.es.kr' },
  },
  seoul_ujang: {
    id: 'seoul_ujang',
    name: '서울우장초등학교',
    level: 'elementary',
    region: '서울 강서',
    neis: { atptCode: 'B10', schoolCode: '7081470' },
    scrape: { kind: 'sen-es', host: 'ujang.sen.es.kr' },
  },
  seoul_woljung: {
    id: 'seoul_woljung',
    name: '서울월정초등학교',
    level: 'elementary',
    region: '서울 강서',
    neis: { atptCode: 'B10', schoolCode: '7081471' },
    scrape: { kind: 'sen-es', host: 'woljung.sen.es.kr' },
  },
  seoul_jeonggok: {
    id: 'seoul_jeonggok',
    name: '서울정곡초등학교',
    level: 'elementary',
    region: '서울 강서',
    neis: { atptCode: 'B10', schoolCode: '7081475' },
    scrape: { kind: 'sen-es', host: 'jk.sen.es.kr' },
  },
  seoul_chihyeon: {
    id: 'seoul_chihyeon',
    name: '서울치현초등학교',
    level: 'elementary',
    region: '서울 강서',
    neis: { atptCode: 'B10', schoolCode: '7081478' },
    scrape: { kind: 'sen-es', host: 'chihyeon.sen.es.kr' },
  },
  seoul_topsan: {
    id: 'seoul_topsan',
    name: '서울탑산초등학교',
    level: 'elementary',
    region: '서울 강서',
    neis: { atptCode: 'B10', schoolCode: '7081479' },
    scrape: { kind: 'sen-es', host: 'top.sen.es.kr' },
  },
  seoul_hwagok: {
    id: 'seoul_hwagok',
    name: '서울화곡초등학교',
    level: 'elementary',
    region: '서울 강서',
    neis: { atptCode: 'B10', schoolCode: '7081480' },
    scrape: { kind: 'sen-es', host: 'hwagok.sen.es.kr' },
  },
  seoul_hwail: {
    id: 'seoul_hwail',
    name: '서울화일초등학교',
    level: 'elementary',
    region: '서울 강서',
    neis: { atptCode: 'B10', schoolCode: '7081481' },
    scrape: { kind: 'sen-es', host: 'hwail.sen.es.kr' },
  },
  yooseok: {
    id: 'yooseok',
    name: '유석초등학교',
    level: 'elementary',
    region: '서울 강서',
    neis: { atptCode: 'B10', schoolCode: '7081483' },
    scrape: { kind: 'sen-es', host: 'yooseok.sen.es.kr' },
  },
};
```

### 4-B/4-C/4-D — 동일 패턴
- probe 신규: `seoul_konghang`, `seoul_balsan`, `seoul_hwagok`
- commit: `feat(seoul): Stage 14-11 — 강서구 35교`

---

## Stage 14-12 — 노원구 42교

### 5-A — `src/lib/schools/seoul/nowon.ts`

서울 prefix 없는 사립 5교 (상명·청원·태강삼육·화랑·서울중계 등) 모두 host=sen.es.kr 라 등록.

```ts
/**
 * 서울 노원구 42교 — Stage 14-12 (2026-05-02), Phase B 다섯 번째 자치구.
 *
 * 모두 sen.es.kr. 서울 prefix 없는 사립 4교 (상명·청원·태강삼육·화랑) 도 host
 * 가 sen.es.kr 이라 sen-es scraper 동작. id 충돌 없음 (chonggye 와 한자 동일하나
 * 노원구는 `seoul_chonggye_nw`, 의왕은 `chonggye`).
 */

import type { SchoolConfig } from '../index';

export const NOWON_SCHOOLS: Record<string, SchoolConfig> = {
  smcho: {
    id: 'smcho',
    name: '상명초등학교',
    level: 'elementary',
    region: '서울 노원',
    neis: { atptCode: 'B10', schoolCode: '7051110' },
    scrape: { kind: 'sen-es', host: 'smcho.sen.es.kr' },
  },
  seoul_kyesang: {
    id: 'seoul_kyesang',
    name: '서울계상초등학교',
    level: 'elementary',
    region: '서울 노원',
    neis: { atptCode: 'B10', schoolCode: '7051112' },
    scrape: { kind: 'sen-es', host: 'kyesang.sen.es.kr' },
  },
  seoul_gongrung: {
    id: 'seoul_gongrung',
    name: '서울공릉초등학교',
    level: 'elementary',
    region: '서울 노원',
    neis: { atptCode: 'B10', schoolCode: '7051113' },
    scrape: { kind: 'sen-es', host: 'gongrung.sen.es.kr' },
  },
  seoul_gongyeon: {
    id: 'seoul_gongyeon',
    name: '서울공연초등학교',
    level: 'elementary',
    region: '서울 노원',
    neis: { atptCode: 'B10', schoolCode: '7051114' },
    scrape: { kind: 'sen-es', host: 'gongyeon.sen.es.kr' },
  },
  seoul_nowon: {
    id: 'seoul_nowon',
    name: '서울노원초등학교',
    level: 'elementary',
    region: '서울 노원',
    neis: { atptCode: 'B10', schoolCode: '7051115' },
    scrape: { kind: 'sen-es', host: 'nowon.sen.es.kr' },
  },
  seoul_noil: {
    id: 'seoul_noil',
    name: '서울노일초등학교',
    level: 'elementary',
    region: '서울 노원',
    neis: { atptCode: 'B10', schoolCode: '7051116' },
    scrape: { kind: 'sen-es', host: 'noil.sen.es.kr' },
  },
  seoul_nokcheon: {
    id: 'seoul_nokcheon',
    name: '서울녹천초등학교',
    level: 'elementary',
    region: '서울 노원',
    neis: { atptCode: 'B10', schoolCode: '7051117' },
    scrape: { kind: 'sen-es', host: 'nokcheon.sen.es.kr' },
  },
  seoul_danghyeon: {
    id: 'seoul_danghyeon',
    name: '서울당현초등학교',
    level: 'elementary',
    region: '서울 노원',
    neis: { atptCode: 'B10', schoolCode: '7051119' },
    scrape: { kind: 'sen-es', host: 'danghyeon.sen.es.kr' },
  },
  seoul_deokam: {
    id: 'seoul_deokam',
    name: '서울덕암초등학교',
    level: 'elementary',
    region: '서울 노원',
    neis: { atptCode: 'B10', schoolCode: '7051120' },
    scrape: { kind: 'sen-es', host: 'deokam.sen.es.kr' },
  },
  seoul_dongil: {
    id: 'seoul_dongil',
    name: '서울동일초등학교',
    level: 'elementary',
    region: '서울 노원',
    neis: { atptCode: 'B10', schoolCode: '7051122' },
    scrape: { kind: 'sen-es', host: 'dongil.sen.es.kr' },
  },
  seoul_bulam: {
    id: 'seoul_bulam',
    name: '서울불암초등학교',
    level: 'elementary',
    region: '서울 노원',
    neis: { atptCode: 'B10', schoolCode: '7051125' },
    scrape: { kind: 'sen-es', host: 'bulam.sen.es.kr' },
  },
  seoul_sanggyeong: {
    id: 'seoul_sanggyeong',
    name: '서울상경초등학교',
    level: 'elementary',
    region: '서울 노원',
    neis: { atptCode: 'B10', schoolCode: '7051126' },
    scrape: { kind: 'sen-es', host: 'sanggyeong.sen.es.kr' },
  },
  seoul_sanggye: {
    id: 'seoul_sanggye',
    name: '서울상계초등학교',
    level: 'elementary',
    region: '서울 노원',
    neis: { atptCode: 'B10', schoolCode: '7051127' },
    scrape: { kind: 'sen-es', host: 'sanggye.sen.es.kr' },
  },
  seoul_sanggok: {
    id: 'seoul_sanggok',
    name: '서울상곡초등학교',
    level: 'elementary',
    region: '서울 노원',
    neis: { atptCode: 'B10', schoolCode: '7051128' },
    scrape: { kind: 'sen-es', host: 'sanggok.sen.es.kr' },
  },
  seoul_sangsoo: {
    id: 'seoul_sangsoo',
    name: '서울상수초등학교',
    level: 'elementary',
    region: '서울 노원',
    neis: { atptCode: 'B10', schoolCode: '7051129' },
    scrape: { kind: 'sen-es', host: 'sangsoo.sen.es.kr' },
  },
  seoul_sangwon: {
    id: 'seoul_sangwon',
    name: '서울상원초등학교',
    level: 'elementary',
    region: '서울 노원',
    neis: { atptCode: 'B10', schoolCode: '7051130' },
    scrape: { kind: 'sen-es', host: 'sangwon.sen.es.kr' },
  },
  seoul_sangwol: {
    id: 'seoul_sangwol',
    name: '서울상월초등학교',
    level: 'elementary',
    region: '서울 노원',
    neis: { atptCode: 'B10', schoolCode: '7051131' },
    scrape: { kind: 'sen-es', host: 'sw.sen.es.kr' },
  },
  seoul_sangcheon: {
    id: 'seoul_sangcheon',
    name: '서울상천초등학교',
    level: 'elementary',
    region: '서울 노원',
    neis: { atptCode: 'B10', schoolCode: '7051132' },
    scrape: { kind: 'sen-es', host: 'sangcheon.sen.es.kr' },
  },
  seoul_sungok: {
    id: 'seoul_sungok',
    name: '서울선곡초등학교',
    level: 'elementary',
    region: '서울 노원',
    neis: { atptCode: 'B10', schoolCode: '7051133' },
    scrape: { kind: 'sen-es', host: 'sungok.sen.es.kr' },
  },
  seoul_surak: {
    id: 'seoul_surak',
    name: '서울수락초등학교',
    level: 'elementary',
    region: '서울 노원',
    neis: { atptCode: 'B10', schoolCode: '7051134' },
    scrape: { kind: 'sen-es', host: 'surak.sen.es.kr' },
  },
  seoul_suam: {
    id: 'seoul_suam',
    name: '서울수암초등학교',
    level: 'elementary',
    region: '서울 노원',
    neis: { atptCode: 'B10', schoolCode: '7051135' },
    scrape: { kind: 'sen-es', host: 'suam.sen.es.kr' },
  },
  seoul_singye: {
    id: 'seoul_singye',
    name: '서울신계초등학교',
    level: 'elementary',
    region: '서울 노원',
    neis: { atptCode: 'B10', schoolCode: '7051137' },
    scrape: { kind: 'sen-es', host: 'singye.sen.es.kr' },
  },
  seoul_sinsanggye: {
    id: 'seoul_sinsanggye',
    name: '서울신상계초등학교',
    level: 'elementary',
    region: '서울 노원',
    neis: { atptCode: 'B10', schoolCode: '7051139' },
    scrape: { kind: 'sen-es', host: 'sinsanggye.sen.es.kr' },
  },
  seoul_yeonji: {
    id: 'seoul_yeonji',
    name: '서울연지초등학교',
    level: 'elementary',
    region: '서울 노원',
    neis: { atptCode: 'B10', schoolCode: '7051144' },
    scrape: { kind: 'sen-es', host: 'seoulyeonji.sen.es.kr' },
  },
  seoul_yeonchon: {
    id: 'seoul_yeonchon',
    name: '서울연촌초등학교',
    level: 'elementary',
    region: '서울 노원',
    neis: { atptCode: 'B10', schoolCode: '7051145' },
    scrape: { kind: 'sen-es', host: 'yeonchon.sen.es.kr' },
  },
  seoul_ongok: {
    id: 'seoul_ongok',
    name: '서울온곡초등학교',
    level: 'elementary',
    region: '서울 노원',
    neis: { atptCode: 'B10', schoolCode: '7051147' },
    scrape: { kind: 'sen-es', host: 'ongok.sen.es.kr' },
  },
  seoul_yongdong_nw: {
    id: 'seoul_yongdong_nw',
    name: '서울용동초등학교',
    level: 'elementary',
    region: '서울 노원',
    neis: { atptCode: 'B10', schoolCode: '7051148' },
    scrape: { kind: 'sen-es', host: 'yongdong.sen.es.kr' },
  },
  seoul_yongwon: {
    id: 'seoul_yongwon',
    name: '서울용원초등학교',
    level: 'elementary',
    region: '서울 노원',
    neis: { atptCode: 'B10', schoolCode: '7051149' },
    scrape: { kind: 'sen-es', host: 'yong1.sen.es.kr' },
  },
  seoul_wonkwang: {
    id: 'seoul_wonkwang',
    name: '서울원광초등학교',
    level: 'elementary',
    region: '서울 노원',
    neis: { atptCode: 'B10', schoolCode: '7051150' },
    scrape: { kind: 'sen-es', host: 'wonkwang.sen.es.kr' },
  },
  seoul_wolgye: {
    id: 'seoul_wolgye',
    name: '서울월계초등학교',
    level: 'elementary',
    region: '서울 노원',
    neis: { atptCode: 'B10', schoolCode: '7051151' },
    scrape: { kind: 'sen-es', host: 'wolgye.sen.es.kr' },
  },
  seoul_eulji: {
    id: 'seoul_eulji',
    name: '서울을지초등학교',
    level: 'elementary',
    region: '서울 노원',
    neis: { atptCode: 'B10', schoolCode: '7051153' },
    scrape: { kind: 'sen-es', host: 'eulji.sen.es.kr' },
  },
  seoul_junggye: {
    id: 'seoul_junggye',
    name: '서울중계초등학교',
    level: 'elementary',
    region: '서울 노원',
    neis: { atptCode: 'B10', schoolCode: '7051155' },
    scrape: { kind: 'sen-es', host: 'jg.sen.es.kr' },
  },
  seoul_jungwon: {
    id: 'seoul_jungwon',
    name: '서울중원초등학교',
    level: 'elementary',
    region: '서울 노원',
    neis: { atptCode: 'B10', schoolCode: '7051156' },
    scrape: { kind: 'sen-es', host: 'jungwon.sen.es.kr' },
  },
  seoul_jungpyong: {
    id: 'seoul_jungpyong',
    name: '서울중평초등학교',
    level: 'elementary',
    region: '서울 노원',
    neis: { atptCode: 'B10', schoolCode: '7051157' },
    scrape: { kind: 'sen-es', host: 'jungpyong.sen.es.kr' },
  },
  seoul_joonghyun: {
    id: 'seoul_joonghyun',
    name: '서울중현초등학교',
    level: 'elementary',
    region: '서울 노원',
    neis: { atptCode: 'B10', schoolCode: '7051158' },
    scrape: { kind: 'sen-es', host: 'joonghyun.sen.es.kr' },
  },
  seoul_chonggye_nw: {
    id: 'seoul_chonggye_nw',
    name: '서울청계초등학교',
    level: 'elementary',
    region: '서울 노원',
    neis: { atptCode: 'B10', schoolCode: '7051165' },
    scrape: { kind: 'sen-es', host: 'scg.sen.es.kr' },
  },
  seoul_taerang: {
    id: 'seoul_taerang',
    name: '서울태랑초등학교',
    level: 'elementary',
    region: '서울 노원',
    neis: { atptCode: 'B10', schoolCode: '7051167' },
    scrape: { kind: 'sen-es', host: 'taerang.sen.es.kr' },
  },
  seoul_taereung: {
    id: 'seoul_taereung',
    name: '서울태릉초등학교',
    level: 'elementary',
    region: '서울 노원',
    neis: { atptCode: 'B10', schoolCode: '7051168' },
    scrape: { kind: 'sen-es', host: 'taereung.sen.es.kr' },
  },
  seoul_hancheon: {
    id: 'seoul_hancheon',
    name: '서울한천초등학교',
    level: 'elementary',
    region: '서울 노원',
    neis: { atptCode: 'B10', schoolCode: '7051169' },
    scrape: { kind: 'sen-es', host: 'hancheon.sen.es.kr' },
  },
  cheongwon: {
    id: 'cheongwon',
    name: '청원초등학교',
    level: 'elementary',
    region: '서울 노원',
    neis: { atptCode: 'B10', schoolCode: '7051170' },
    scrape: { kind: 'sen-es', host: 'cheongwon.sen.es.kr' },
  },
  taegang: {
    id: 'taegang',
    name: '태강삼육초등학교',
    level: 'elementary',
    region: '서울 노원',
    neis: { atptCode: 'B10', schoolCode: '7051171' },
    scrape: { kind: 'sen-es', host: 'taegang.sen.es.kr' },
  },
  hwarang: {
    id: 'hwarang',
    name: '화랑초등학교',
    level: 'elementary',
    region: '서울 노원',
    neis: { atptCode: 'B10', schoolCode: '7051173' },
    scrape: { kind: 'sen-es', host: 'hwarang-s.sen.es.kr' },
  },
};
```

### 5-B/5-C/5-D — 동일 패턴
- probe 신규: `seoul_nowon`, `seoul_chonggye_nw`, `cheongwon`
- commit: `feat(seoul): Stage 14-12 — 노원구 42교`

---

## Stage 14-13 — 도봉구 23교

### 6-A — `src/lib/schools/seoul/dobong.ts`

```ts
/**
 * 서울 도봉구 23교 — Stage 14-13 (2026-05-02), Phase B 여섯 번째 자치구.
 *
 * 모두 sen.es.kr. 서울 prefix 없는 사립 2교 (동북·한신) 도 host sen.es.kr.
 */

import type { SchoolConfig } from '../index';

export const DOBONG_SCHOOLS: Record<string, SchoolConfig> = {
  dongbuk: {
    id: 'dongbuk',
    name: '동북초등학교',
    level: 'elementary',
    region: '서울 도봉',
    neis: { atptCode: 'B10', schoolCode: '7051109' },
    scrape: { kind: 'sen-es', host: 'dongbuk.sen.es.kr' },
  },
  seoul_gain: {
    id: 'seoul_gain',
    name: '서울가인초등학교',
    level: 'elementary',
    region: '서울 도봉',
    neis: { atptCode: 'B10', schoolCode: '7051111' },
    scrape: { kind: 'sen-es', host: 'seoulgain.sen.es.kr' },
  },
  seoul_nuwon: {
    id: 'seoul_nuwon',
    name: '서울누원초등학교',
    level: 'elementary',
    region: '서울 도봉',
    neis: { atptCode: 'B10', schoolCode: '7051118' },
    scrape: { kind: 'sen-es', host: 'nuwon.sen.es.kr' },
  },
  seoul_dobong: {
    id: 'seoul_dobong',
    name: '서울도봉초등학교',
    level: 'elementary',
    region: '서울 도봉',
    neis: { atptCode: 'B10', schoolCode: '7051121' },
    scrape: { kind: 'sen-es', host: 'dobong.sen.es.kr' },
  },
  seoul_banghak: {
    id: 'seoul_banghak',
    name: '서울방학초등학교',
    level: 'elementary',
    region: '서울 도봉',
    neis: { atptCode: 'B10', schoolCode: '7051123' },
    scrape: { kind: 'sen-es', host: 'banghakcho.sen.es.kr' },
  },
  seoul_baegun: {
    id: 'seoul_baegun',
    name: '서울백운초등학교',
    level: 'elementary',
    region: '서울 도봉',
    neis: { atptCode: 'B10', schoolCode: '7051124' },
    scrape: { kind: 'sen-es', host: 's-baegun.sen.es.kr' },
  },
  seoul_sungmi: {
    id: 'seoul_sungmi',
    name: '서울숭미초등학교',
    level: 'elementary',
    region: '서울 도봉',
    neis: { atptCode: 'B10', schoolCode: '7051136' },
    scrape: { kind: 'sen-es', host: 'sungmi.sen.es.kr' },
  },
  seoul_sinbanghak: {
    id: 'seoul_sinbanghak',
    name: '서울신방학초등학교',
    level: 'elementary',
    region: '서울 도봉',
    neis: { atptCode: 'B10', schoolCode: '7051138' },
    scrape: { kind: 'sen-es', host: 'sbh.sen.es.kr' },
  },
  seoul_shinchang: {
    id: 'seoul_shinchang',
    name: '서울신창초등학교',
    level: 'elementary',
    region: '서울 도봉',
    neis: { atptCode: 'B10', schoolCode: '7051140' },
    scrape: { kind: 'sen-es', host: 'shinchang.sen.es.kr' },
  },
  seoul_sinhak: {
    id: 'seoul_sinhak',
    name: '서울신학초등학교',
    level: 'elementary',
    region: '서울 도봉',
    neis: { atptCode: 'B10', schoolCode: '7051141' },
    scrape: { kind: 'sen-es', host: 'seoulsinhak.sen.es.kr' },
  },
  seoul_sinhwa: {
    id: 'seoul_sinhwa',
    name: '서울신화초등학교',
    level: 'elementary',
    region: '서울 도봉',
    neis: { atptCode: 'B10', schoolCode: '7051142' },
    scrape: { kind: 'sen-es', host: 'sinhwa.sen.es.kr' },
  },
  seoul_ssangmun: {
    id: 'seoul_ssangmun',
    name: '서울쌍문초등학교',
    level: 'elementary',
    region: '서울 도봉',
    neis: { atptCode: 'B10', schoolCode: '7051143' },
    scrape: { kind: 'sen-es', host: 'ssangmun.sen.es.kr' },
  },
  seoul_obong: {
    id: 'seoul_obong',
    name: '서울오봉초등학교',
    level: 'elementary',
    region: '서울 도봉',
    neis: { atptCode: 'B10', schoolCode: '7051146' },
    scrape: { kind: 'sen-es', host: 'obong.sen.es.kr' },
  },
  seoul_wolcheon: {
    id: 'seoul_wolcheon',
    name: '서울월천초등학교',
    level: 'elementary',
    region: '서울 도봉',
    neis: { atptCode: 'B10', schoolCode: '7051152' },
    scrape: { kind: 'sen-es', host: 'wol.sen.es.kr' },
  },
  seoul_jawoon: {
    id: 'seoul_jawoon',
    name: '서울자운초등학교',
    level: 'elementary',
    region: '서울 도봉',
    neis: { atptCode: 'B10', schoolCode: '7051154' },
    scrape: { kind: 'sen-es', host: 'jawoon.sen.es.kr' },
  },
  seoul_changkyung: {
    id: 'seoul_changkyung',
    name: '서울창경초등학교',
    level: 'elementary',
    region: '서울 도봉',
    neis: { atptCode: 'B10', schoolCode: '7051159' },
    scrape: { kind: 'sen-es', host: 'changkyung.sen.es.kr' },
  },
  seoul_changdo: {
    id: 'seoul_changdo',
    name: '서울창도초등학교',
    level: 'elementary',
    region: '서울 도봉',
    neis: { atptCode: 'B10', schoolCode: '7051160' },
    scrape: { kind: 'sen-es', host: 'changdo.sen.es.kr' },
  },
  seoul_changdong: {
    id: 'seoul_changdong',
    name: '서울창동초등학교',
    level: 'elementary',
    region: '서울 도봉',
    neis: { atptCode: 'B10', schoolCode: '7051161' },
    scrape: { kind: 'sen-es', host: 'changdong-s.sen.es.kr' },
  },
  seoul_changlim: {
    id: 'seoul_changlim',
    name: '서울창림초등학교',
    level: 'elementary',
    region: '서울 도봉',
    neis: { atptCode: 'B10', schoolCode: '7051162' },
    scrape: { kind: 'sen-es', host: 'changlim.sen.es.kr' },
  },
  seoul_changwon: {
    id: 'seoul_changwon',
    name: '서울창원초등학교',
    level: 'elementary',
    region: '서울 도봉',
    neis: { atptCode: 'B10', schoolCode: '7051163' },
    scrape: { kind: 'sen-es', host: 'changwon.sen.es.kr' },
  },
  seoul_changil: {
    id: 'seoul_changil',
    name: '서울창일초등학교',
    level: 'elementary',
    region: '서울 도봉',
    neis: { atptCode: 'B10', schoolCode: '7051164' },
    scrape: { kind: 'sen-es', host: 'changil.sen.es.kr' },
  },
  seoul_chodang: {
    id: 'seoul_chodang',
    name: '서울초당초등학교',
    level: 'elementary',
    region: '서울 도봉',
    neis: { atptCode: 'B10', schoolCode: '7051166' },
    scrape: { kind: 'sen-es', host: 'chodang.sen.es.kr' },
  },
  hansin: {
    id: 'hansin',
    name: '한신초등학교',
    level: 'elementary',
    region: '서울 도봉',
    neis: { atptCode: 'B10', schoolCode: '7051172' },
    scrape: { kind: 'sen-es', host: 'ihansin.sen.es.kr' },
  },
};
```

### 6-B/6-C/6-D — 동일 패턴
- probe 신규: `seoul_dobong`, `seoul_changdong`, `seoul_ssangmun`
- commit: `feat(seoul): Stage 14-13 — 도봉구 23교`

---

## Stage 14-14 — 마포구 22교

### 7-A — `src/lib/schools/seoul/mapo.ts`

```ts
/**
 * 서울 마포구 22교 — Stage 14-14 (2026-05-02), Phase C 첫 자치구.
 *
 * 모두 sen.es.kr. 홍익대 부속 1교 (서울 prefix 없는 사립) 도 host sen.es.kr.
 */

import type { SchoolConfig } from '../index';

export const MAPO_SCHOOLS: Record<string, SchoolConfig> = {
  seoul_kongduck: {
    id: 'seoul_kongduck',
    name: '서울공덕초등학교',
    level: 'elementary',
    region: '서울 마포',
    neis: { atptCode: 'B10', schoolCode: '7031114' },
    scrape: { kind: 'sen-es', host: 'kongduck.sen.es.kr' },
  },
  seoul_donggyo: {
    id: 'seoul_donggyo',
    name: '서울동교초등학교',
    level: 'elementary',
    region: '서울 마포',
    neis: { atptCode: 'B10', schoolCode: '7031122' },
    scrape: { kind: 'sen-es', host: 'donggyo.sen.es.kr' },
  },
  seoul_mapo: {
    id: 'seoul_mapo',
    name: '서울마포초등학교',
    level: 'elementary',
    region: '서울 마포',
    neis: { atptCode: 'B10', schoolCode: '7031123' },
    scrape: { kind: 'sen-es', host: 'mapo.sen.es.kr' },
  },
  seoul_mangwon: {
    id: 'seoul_mangwon',
    name: '서울망원초등학교',
    level: 'elementary',
    region: '서울 마포',
    neis: { atptCode: 'B10', schoolCode: '7031124' },
    scrape: { kind: 'sen-es', host: 'mangwon.sen.es.kr' },
  },
  seoul_sangam: {
    id: 'seoul_sangam',
    name: '서울상암초등학교',
    level: 'elementary',
    region: '서울 마포',
    neis: { atptCode: 'B10', schoolCode: '7031131' },
    scrape: { kind: 'sen-es', host: 'sangam.sen.es.kr' },
  },
  seoul_sangji: {
    id: 'seoul_sangji',
    name: '서울상지초등학교',
    level: 'elementary',
    region: '서울 마포',
    neis: { atptCode: 'B10', schoolCode: '7031132' },
    scrape: { kind: 'sen-es', host: 'seoulsangji.sen.es.kr' },
  },
  seoul_seogang: {
    id: 'seoul_seogang',
    name: '서울서강초등학교',
    level: 'elementary',
    region: '서울 마포',
    neis: { atptCode: 'B10', schoolCode: '7031133' },
    scrape: { kind: 'sen-es', host: 'seogang.sen.es.kr' },
  },
  seoul_seokyo: {
    id: 'seoul_seokyo',
    name: '서울서교초등학교',
    level: 'elementary',
    region: '서울 마포',
    neis: { atptCode: 'B10', schoolCode: '7031134' },
    scrape: { kind: 'sen-es', host: 'seokyo.sen.es.kr' },
  },
  seoul_sangsan_mp: {
    id: 'seoul_sangsan_mp',
    name: '서울성산초등학교',
    level: 'elementary',
    region: '서울 마포',
    neis: { atptCode: 'B10', schoolCode: '7031136' },
    scrape: { kind: 'sen-es', host: 'ssc.sen.es.kr' },
  },
  seoul_seongseo: {
    id: 'seoul_seongseo',
    name: '서울성서초등학교',
    level: 'elementary',
    region: '서울 마포',
    neis: { atptCode: 'B10', schoolCode: '7031137' },
    scrape: { kind: 'sen-es', host: 'sseo.sen.es.kr' },
  },
  seoul_sungwon: {
    id: 'seoul_sungwon',
    name: '서울성원초등학교',
    level: 'elementary',
    region: '서울 마포',
    neis: { atptCode: 'B10', schoolCode: '7031138' },
    scrape: { kind: 'sen-es', host: 'sungwon.sen.es.kr' },
  },
  seoul_soeui: {
    id: 'seoul_soeui',
    name: '서울소의초등학교',
    level: 'elementary',
    region: '서울 마포',
    neis: { atptCode: 'B10', schoolCode: '7031139' },
    scrape: { kind: 'sen-es', host: 'soeui.sen.es.kr' },
  },
  seoul_sinbuk: {
    id: 'seoul_sinbuk',
    name: '서울신북초등학교',
    level: 'elementary',
    region: '서울 마포',
    neis: { atptCode: 'B10', schoolCode: '7031142' },
    scrape: { kind: 'sen-es', host: 'sinbuk.sen.es.kr' },
  },
  seoul_sinseok: {
    id: 'seoul_sinseok',
    name: '서울신석초등학교',
    level: 'elementary',
    region: '서울 마포',
    neis: { atptCode: 'B10', schoolCode: '7031144' },
    scrape: { kind: 'sen-es', host: 'sinseok.sen.es.kr' },
  },
  seoul_ahyun: {
    id: 'seoul_ahyun',
    name: '서울아현초등학교',
    level: 'elementary',
    region: '서울 마포',
    neis: { atptCode: 'B10', schoolCode: '7031145' },
    scrape: { kind: 'sen-es', host: 'ahyun.sen.es.kr' },
  },
  seoul_yeomri: {
    id: 'seoul_yeomri',
    name: '서울염리초등학교',
    level: 'elementary',
    region: '서울 마포',
    neis: { atptCode: 'B10', schoolCode: '7031154' },
    scrape: { kind: 'sen-es', host: 'yeomri.sen.es.kr' },
  },
  seoul_yonggang: {
    id: 'seoul_yonggang',
    name: '서울용강초등학교',
    level: 'elementary',
    region: '서울 마포',
    neis: { atptCode: 'B10', schoolCode: '7031155' },
    scrape: { kind: 'sen-es', host: 'yonggang.sen.es.kr' },
  },
  seoul_jungdong: {
    id: 'seoul_jungdong',
    name: '서울중동초등학교',
    level: 'elementary',
    region: '서울 마포',
    neis: { atptCode: 'B10', schoolCode: '7031161' },
    scrape: { kind: 'sen-es', host: 'jungdong.sen.es.kr' },
  },
  seoul_changchon: {
    id: 'seoul_changchon',
    name: '서울창천초등학교',
    level: 'elementary',
    region: '서울 마포',
    neis: { atptCode: 'B10', schoolCode: '7031165' },
    scrape: { kind: 'sen-es', host: 'changchon.sen.es.kr' },
  },
  seoul_haneul: {
    id: 'seoul_haneul',
    name: '서울하늘초등학교',
    level: 'elementary',
    region: '서울 마포',
    neis: { atptCode: 'B10', schoolCode: '7031231' },
    scrape: { kind: 'sen-es', host: 'sky.sen.es.kr' },
  },
  seoul_hanseo: {
    id: 'seoul_hanseo',
    name: '서울한서초등학교',
    level: 'elementary',
    region: '서울 마포',
    neis: { atptCode: 'B10', schoolCode: '7031166' },
    scrape: { kind: 'sen-es', host: 'hanseo.sen.es.kr' },
  },
  seoul_hongik: {
    id: 'seoul_hongik',
    name: '홍익대학교사범대학부속초등학교',
    level: 'elementary',
    region: '서울 마포',
    neis: { atptCode: 'B10', schoolCode: '7031177' },
    scrape: { kind: 'sen-es', host: 'hongik.sen.es.kr' },
  },
};
```

### 7-B/7-C/7-D — 동일 패턴
- probe: `seoul_mapo`, `seoul_sangam`, `seoul_hongik`
- commit: `feat(seoul): Stage 14-14 — 마포구 22교`

---

## Stage 14-15 — 서대문구 19교

### 8-A — `src/lib/schools/seoul/seodaemun.ts`

**중요**: `myongji` (명지초등학교) host = `www.myongji.net` (sen.es.kr 아님) → `scrape` 생략.

```ts
/**
 * 서울 서대문구 19교 — Stage 14-15 (2026-05-02), Phase C 두 번째 자치구.
 *
 * 18교 sen.es.kr + 1교 (명지초) host www.myongji.net → scrape 생략.
 * 사립 다수 (경기·이화·추계 등 host 가 sen.es.kr 라 그대로 등록).
 */

import type { SchoolConfig } from '../index';

export const SEODAEMUN_SCHOOLS: Record<string, SchoolConfig> = {
  kyonggi_es: {
    id: 'kyonggi_es',
    name: '경기초등학교',
    level: 'elementary',
    region: '서울 서대문',
    neis: { atptCode: 'B10', schoolCode: '7031110' },
    scrape: { kind: 'sen-es', host: 'kyonggi.sen.es.kr' },
  },
  myongji: {
    id: 'myongji',
    name: '명지초등학교',
    level: 'elementary',
    region: '서울 서대문',
    neis: { atptCode: 'B10', schoolCode: '7031111' },
    // scrape 생략 — host = www.myongji.net (사립). NEIS 메뉴만, 사진 미지원.
  },
  seoul_gajaeul: {
    id: 'seoul_gajaeul',
    name: '서울가재울초등학교',
    level: 'elementary',
    region: '서울 서대문',
    neis: { atptCode: 'B10', schoolCode: '7031278' },
    scrape: { kind: 'sen-es', host: 'gajaeul.sen.es.kr' },
  },
  seoul_goeun: {
    id: 'seoul_goeun',
    name: '서울고은초등학교',
    level: 'elementary',
    region: '서울 서대문',
    neis: { atptCode: 'B10', schoolCode: '7031113' },
    scrape: { kind: 'sen-es', host: 'goeun.sen.es.kr' },
  },
  seoul_geumhwa: {
    id: 'seoul_geumhwa',
    name: '서울금화초등학교',
    level: 'elementary',
    region: '서울 서대문',
    neis: { atptCode: 'B10', schoolCode: '7031117' },
    scrape: { kind: 'sen-es', host: 'geumhwa.sen.es.kr' },
  },
  seoul_daesin: {
    id: 'seoul_daesin',
    name: '서울대신초등학교',
    level: 'elementary',
    region: '서울 서대문',
    neis: { atptCode: 'B10', schoolCode: '7031119' },
    scrape: { kind: 'sen-es', host: 'sds.sen.es.kr' },
  },
  seoul_midong: {
    id: 'seoul_midong',
    name: '서울미동초등학교',
    level: 'elementary',
    region: '서울 서대문',
    neis: { atptCode: 'B10', schoolCode: '7031125' },
    scrape: { kind: 'sen-es', host: 'midong.sen.es.kr' },
  },
  seoul_bukgajwa: {
    id: 'seoul_bukgajwa',
    name: '서울북가좌초등학교',
    level: 'elementary',
    region: '서울 서대문',
    neis: { atptCode: 'B10', schoolCode: '7031126' },
    scrape: { kind: 'sen-es', host: 'bukgajwa.sen.es.kr' },
  },
  seoul_buksung: {
    id: 'seoul_buksung',
    name: '서울북성초등학교',
    level: 'elementary',
    region: '서울 서대문',
    neis: { atptCode: 'B10', schoolCode: '7031127' },
    scrape: { kind: 'sen-es', host: 'seoulbuksung.sen.es.kr' },
  },
  seoul_ansan: {
    id: 'seoul_ansan',
    name: '서울안산초등학교',
    level: 'elementary',
    region: '서울 서대문',
    neis: { atptCode: 'B10', schoolCode: '7031146' },
    scrape: { kind: 'sen-es', host: 'ansan.sen.es.kr' },
  },
  seoul_yeonga: {
    id: 'seoul_yeonga',
    name: '서울연가초등학교',
    level: 'elementary',
    region: '서울 서대문',
    neis: { atptCode: 'B10', schoolCode: '7031148' },
    scrape: { kind: 'sen-es', host: 'yeonga.sen.es.kr' },
  },
  seoul_yeonhui: {
    id: 'seoul_yeonhui',
    name: '서울연희초등학교',
    level: 'elementary',
    region: '서울 서대문',
    neis: { atptCode: 'B10', schoolCode: '7031153' },
    scrape: { kind: 'sen-es', host: 'yeonhui.sen.es.kr' },
  },
  seoul_inwang: {
    id: 'seoul_inwang',
    name: '서울인왕초등학교',
    level: 'elementary',
    region: '서울 서대문',
    neis: { atptCode: 'B10', schoolCode: '7031160' },
    scrape: { kind: 'sen-es', host: 'inwang.sen.es.kr' },
  },
  seoul_changseo: {
    id: 'seoul_changseo',
    name: '서울창서초등학교',
    level: 'elementary',
    region: '서울 서대문',
    neis: { atptCode: 'B10', schoolCode: '7031164' },
    scrape: { kind: 'sen-es', host: 'scs.sen.es.kr' },
  },
  seoul_hongyeon: {
    id: 'seoul_hongyeon',
    name: '서울홍연초등학교',
    level: 'elementary',
    region: '서울 서대문',
    neis: { atptCode: 'B10', schoolCode: '7031167' },
    scrape: { kind: 'sen-es', host: 'hyc.sen.es.kr' },
  },
  seoul_hongeun: {
    id: 'seoul_hongeun',
    name: '서울홍은초등학교',
    level: 'elementary',
    region: '서울 서대문',
    neis: { atptCode: 'B10', schoolCode: '7031168' },
    scrape: { kind: 'sen-es', host: 'hongeun.sen.es.kr' },
  },
  seoul_hongje: {
    id: 'seoul_hongje',
    name: '서울홍제초등학교',
    level: 'elementary',
    region: '서울 서대문',
    neis: { atptCode: 'B10', schoolCode: '7031169' },
    scrape: { kind: 'sen-es', host: 'hongje.sen.es.kr' },
  },
  ewha_es: {
    id: 'ewha_es',
    name: '이화여자대학교사범대학부속초등학교',
    level: 'elementary',
    region: '서울 서대문',
    neis: { atptCode: 'B10', schoolCode: '7031174' },
    scrape: { kind: 'sen-es', host: 'ewha.sen.es.kr' },
  },
  chugye: {
    id: 'chugye',
    name: '추계초등학교',
    level: 'elementary',
    region: '서울 서대문',
    neis: { atptCode: 'B10', schoolCode: '7031175' },
    scrape: { kind: 'sen-es', host: 'chugye.sen.es.kr' },
  },
};
```

### 8-B/8-C/8-D — 동일 패턴
- probe: `seoul_yeonhui`, `kyonggi_es`, `ewha_es`
- commit: `feat(seoul): Stage 14-15 — 서대문구 19교`

---

## Stage 14-16 — 은평구 30교

### 9-A — `src/lib/schools/seoul/eunpyeong.ts`

```ts
/**
 * 서울 은평구 30교 — Stage 14-16 (2026-05-02), Phase C 마지막 자치구.
 *
 * 모두 sen.es.kr. 사립 3교 (선일·예일·충암) 도 host sen.es.kr.
 * Phase B+C 완료 = 9구 251교.
 */

import type { SchoolConfig } from '../index';

export const EUNPYEONG_SCHOOLS: Record<string, SchoolConfig> = {
  seoul_galhyun: {
    id: 'seoul_galhyun',
    name: '서울갈현초등학교',
    level: 'elementary',
    region: '서울 은평',
    neis: { atptCode: 'B10', schoolCode: '7031112' },
    scrape: { kind: 'sen-es', host: 'galhyun.sen.es.kr' },
  },
  seoul_gusan: {
    id: 'seoul_gusan',
    name: '서울구산초등학교',
    level: 'elementary',
    region: '서울 은평',
    neis: { atptCode: 'B10', schoolCode: '7031115' },
    scrape: { kind: 'sen-es', host: 'gusan.sen.es.kr' },
  },
  seoul_guhyun: {
    id: 'seoul_guhyun',
    name: '서울구현초등학교',
    level: 'elementary',
    region: '서울 은평',
    neis: { atptCode: 'B10', schoolCode: '7031116' },
    scrape: { kind: 'sen-es', host: 'guhyun.sen.es.kr' },
  },
  seoul_nokbun: {
    id: 'seoul_nokbun',
    name: '서울녹번초등학교',
    level: 'elementary',
    region: '서울 은평',
    neis: { atptCode: 'B10', schoolCode: '7031118' },
    scrape: { kind: 'sen-es', host: 'nokbun.sen.es.kr' },
  },
  seoul_daeeun: {
    id: 'seoul_daeeun',
    name: '서울대은초등학교',
    level: 'elementary',
    region: '서울 은평',
    neis: { atptCode: 'B10', schoolCode: '7031120' },
    scrape: { kind: 'sen-es', host: 'daeeun.sen.es.kr' },
  },
  seoul_daejo: {
    id: 'seoul_daejo',
    name: '서울대조초등학교',
    level: 'elementary',
    region: '서울 은평',
    neis: { atptCode: 'B10', schoolCode: '7031121' },
    scrape: { kind: 'sen-es', host: 'daejo.sen.es.kr' },
  },
  seoul_bukhansan: {
    id: 'seoul_bukhansan',
    name: '서울북한산초등학교',
    level: 'elementary',
    region: '서울 은평',
    neis: { atptCode: 'B10', schoolCode: '7031128' },
    scrape: { kind: 'sen-es', host: 'bukhansan.sen.es.kr' },
  },
  seoul_bulgwang: {
    id: 'seoul_bulgwang',
    name: '서울불광초등학교',
    level: 'elementary',
    region: '서울 은평',
    neis: { atptCode: 'B10', schoolCode: '7031129' },
    scrape: { kind: 'sen-es', host: 'bulgwang.sen.es.kr' },
  },
  seoul_sangsin: {
    id: 'seoul_sangsin',
    name: '서울상신초등학교',
    level: 'elementary',
    region: '서울 은평',
    neis: { atptCode: 'B10', schoolCode: '7031130' },
    scrape: { kind: 'sen-es', host: 'sangsin.sen.es.kr' },
  },
  seoul_seosin: {
    id: 'seoul_seosin',
    name: '서울서신초등학교',
    level: 'elementary',
    region: '서울 은평',
    neis: { atptCode: 'B10', schoolCode: '7031135' },
    scrape: { kind: 'sen-es', host: 'susin.sen.es.kr' },
  },
  seoul_suri: {
    id: 'seoul_suri',
    name: '서울수리초등학교',
    level: 'elementary',
    region: '서울 은평',
    neis: { atptCode: 'B10', schoolCode: '7031230' },
    scrape: { kind: 'sen-es', host: 'suri.sen.es.kr' },
  },
  seoul_susaek: {
    id: 'seoul_susaek',
    name: '서울수색초등학교',
    level: 'elementary',
    region: '서울 은평',
    neis: { atptCode: 'B10', schoolCode: '7031140' },
    scrape: { kind: 'sen-es', host: 'susaek.sen.es.kr' },
  },
  seoul_sindo: {
    id: 'seoul_sindo',
    name: '서울신도초등학교',
    level: 'elementary',
    region: '서울 은평',
    neis: { atptCode: 'B10', schoolCode: '7031141' },
    scrape: { kind: 'sen-es', host: 'sindo.sen.es.kr' },
  },
  seoul_sinsa: {
    id: 'seoul_sinsa',
    name: '서울신사초등학교',
    level: 'elementary',
    region: '서울 은평',
    neis: { atptCode: 'B10', schoolCode: '7031143' },
    scrape: { kind: 'sen-es', host: 'shinsa.sen.es.kr' },
  },
  seoul_eoul: {
    id: 'seoul_eoul',
    name: '서울어울초등학교',
    level: 'elementary',
    region: '서울 은평',
    neis: { atptCode: 'B10', schoolCode: '7031285' },
    scrape: { kind: 'sen-es', host: 'urwool.sen.es.kr' },
  },
  seoul_yeokchon: {
    id: 'seoul_yeokchon',
    name: '서울역촌초등학교',
    level: 'elementary',
    region: '서울 은평',
    neis: { atptCode: 'B10', schoolCode: '7031147' },
    scrape: { kind: 'sen-es', host: 'yeokchon.sen.es.kr' },
  },
  seoul_yeonkwang: {
    id: 'seoul_yeonkwang',
    name: '서울연광초등학교',
    level: 'elementary',
    region: '서울 은평',
    neis: { atptCode: 'B10', schoolCode: '7031149' },
    scrape: { kind: 'sen-es', host: 'yeonkwang.sen.es.kr' },
  },
  seoul_yeonsin: {
    id: 'seoul_yeonsin',
    name: '서울연신초등학교',
    level: 'elementary',
    region: '서울 은평',
    neis: { atptCode: 'B10', schoolCode: '7031150' },
    scrape: { kind: 'sen-es', host: 'yeonsin.sen.es.kr' },
  },
  seoul_yeoneun: {
    id: 'seoul_yeoneun',
    name: '서울연은초등학교',
    level: 'elementary',
    region: '서울 은평',
    neis: { atptCode: 'B10', schoolCode: '7031151' },
    scrape: { kind: 'sen-es', host: 'yeoneun.sen.es.kr' },
  },
  seoul_yeoncheon: {
    id: 'seoul_yeoncheon',
    name: '서울연천초등학교',
    level: 'elementary',
    region: '서울 은평',
    neis: { atptCode: 'B10', schoolCode: '7031152' },
    scrape: { kind: 'sen-es', host: 'yc1985.sen.es.kr' },
  },
  seoul_eunmyeong: {
    id: 'seoul_eunmyeong',
    name: '서울은명초등학교',
    level: 'elementary',
    region: '서울 은평',
    neis: { atptCode: 'B10', schoolCode: '7031156' },
    scrape: { kind: 'sen-es', host: 'em.sen.es.kr' },
  },
  seoul_eunbit: {
    id: 'seoul_eunbit',
    name: '서울은빛초등학교',
    level: 'elementary',
    region: '서울 은평',
    neis: { atptCode: 'B10', schoolCode: '7031232' },
    scrape: { kind: 'sen-es', host: 'ev.sen.es.kr' },
  },
  seoul_eunjin: {
    id: 'seoul_eunjin',
    name: '서울은진초등학교',
    level: 'elementary',
    region: '서울 은평',
    neis: { atptCode: 'B10', schoolCode: '7031157' },
    scrape: { kind: 'sen-es', host: 'eunjin.sen.es.kr' },
  },
  seoul_eunpyeong: {
    id: 'seoul_eunpyeong',
    name: '서울은평초등학교',
    level: 'elementary',
    region: '서울 은평',
    neis: { atptCode: 'B10', schoolCode: '7031158' },
    scrape: { kind: 'sen-es', host: 'eunpyeong.sen.es.kr' },
  },
  seoul_eungam: {
    id: 'seoul_eungam',
    name: '서울응암초등학교',
    level: 'elementary',
    region: '서울 은평',
    neis: { atptCode: 'B10', schoolCode: '7031159' },
    scrape: { kind: 'sen-es', host: 'eungam.sen.es.kr' },
  },
  seoul_jeungsan: {
    id: 'seoul_jeungsan',
    name: '서울증산초등학교',
    level: 'elementary',
    region: '서울 은평',
    neis: { atptCode: 'B10', schoolCode: '7031162' },
    scrape: { kind: 'sen-es', host: 'jeungsancho.sen.es.kr' },
  },
  seoul_jingwan: {
    id: 'seoul_jingwan',
    name: '서울진관초등학교',
    level: 'elementary',
    region: '서울 은평',
    neis: { atptCode: 'B10', schoolCode: '7031163' },
    scrape: { kind: 'sen-es', host: 'jingwan.sen.es.kr' },
  },
  sunil: {
    id: 'sunil',
    name: '선일초등학교',
    level: 'elementary',
    region: '서울 은평',
    neis: { atptCode: 'B10', schoolCode: '7031170' },
    scrape: { kind: 'sen-es', host: 'sunil.sen.es.kr' },
  },
  yale: {
    id: 'yale',
    name: '예일초등학교',
    level: 'elementary',
    region: '서울 은평',
    neis: { atptCode: 'B10', schoolCode: '7031172' },
    scrape: { kind: 'sen-es', host: 'yale.sen.es.kr' },
  },
  choongam: {
    id: 'choongam',
    name: '충암초등학교',
    level: 'elementary',
    region: '서울 은평',
    neis: { atptCode: 'B10', schoolCode: '7031176' },
    scrape: { kind: 'sen-es', host: 'choongam.sen.es.kr' },
  },
};
```

### 9-B/9-C/9-D — 동일 패턴 + status 갱신

```powershell
npm run build 2>&1 | Select-Object -Last 20
curl.exe -s "http://localhost:3000/api/meal/photo?schoolId=seoul_jingwan&ymd=20260428"
curl.exe -s "http://localhost:3000/api/meal/photo?schoolId=seoul_eunpyeong&ymd=20260428"
curl.exe -s "http://localhost:3000/api/meal/photo?schoolId=choongam&ymd=20260428"
```

probe 정상이면 status 재생성:

```powershell
node scripts/generate-school-status.mjs --ymd 20260428 > docs/school-status.md
```

515교 × probeMonth — **30~50분** 소요. 끝나면 헤더 검증:
- 등록 **515교** (264 + 251)
- 자치구 9개 새로 추가
- ⬜ 학교 list (사용자 후속 확인 대상)

work-log Phase B+C 완료 항목:
```
## Stage 14-16 — 서울 은평구 30교 (2026-05-02)

Phase C 마지막 자치구. 모두 sen.es.kr (사립 포함).

## Phase B+C 완료 (2026-05-02)

서울 9개 자치구 추가 = 25개 자치구 중 15 / 25.
누적 515교 (Phase A 264 + Phase B+C 251).
다음 = Phase D+E (강북·도심권 10구) 약 600~800교.
```

```powershell
git add src/lib/schools/seoul/eunpyeong.ts src/lib/schools/index.ts docs/work-log.md docs/school-status.md
git commit -m "feat(seoul): Stage 14-16 — 은평구 30교 (Phase B+C 완료)"
git push origin dev
```

---

## Step 4 — 사용자에게 종합 보고

9구 다 끝난 뒤:

1. ✅ Stage 14-8~14-16 (영등포·구로·양천·강서·노원·도봉·마포·서대문·은평) — Phase B+C 완료
2. 등록 누적: 264 + 251 = **515교**
3. 사진 가능 비율 (status 결과)
4. 자치구별 ⬜ 학교 list — 후속 사용자 확인 task (서울 다 끝나고 한 번에)
5. 회귀 변동 사항
6. push 완료, commit hash 9개

---

## 절대 하지 말 것

- 9구 host 새로 추출 (이미 dev-pc 에서 끝)
- id 작명 규칙 재해석 (본 runbook 그대로)
- 14-9 천이초·14-15 명지초의 scrape 추가 (의도적 생략)
- main 브랜치로 머지
- 14-N 사이에 status 갱신 (마지막 14-16 끝에만 한 번)
- non-sen.es 도메인 발견 시 본 stage 안에서 처리 — 즉시 멈추고 보고
