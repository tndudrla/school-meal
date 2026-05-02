# Runbook — Stage 14-17 ~ 14-25 용산·종로·중구·성동·광진·동대문·중랑·성북·강북 (Phase D+E, 서울 25구 완료)

> server-pc Cursor Claude Code 가 받아 sequential 실행할 지시서.
> dev-pc 에서 host 추출·충돌 분석 끝낸 상태 (2026-05-03). 본 runbook 은
> **list 그대로 등록만** 시키는 형태 — 새로 host 추출하거나 작명 규칙
> 다시 적용하지 말 것.

## 전제

- 작업 브랜치: `dev`
- 작업 디렉터리: `C:\Users\admin\workspace\school-meal`
- dev 서버: 별도 PowerShell 탭에서 `npm run dev` 떠 있어야 함
- 환경변수: `.env.local` 셋업 완료
- 본 stage 가 끝날 때까지 dev-pc(다른 환경) 은 schools/·docs/ 손대지 않기로 합의

## 작업 단위

서울 9개 자치구 합계 **170교**. 165교 sen-es scraper + 5교 non-sen.es (사립) → scrape 생략.

| Stage | 자치구 | 학교 | scrape 생략 |
|---|---|---|---|
| 14-17 | 용산 | 15 | 0 |
| 14-18 | 종로 | 13 | 0 |
| 14-19 | 중구 | 12 | 1 (리라 `www.lila.es.kr`) |
| 14-20 | 성동 | 21 | 1 (한양 `www.hye.or.kr`) |
| 14-21 | 광진 | 21 | 1 (경복 `www.kbes.kr`) |
| 14-22 | 동대문 | 21 | 0 |
| 14-23 | 중랑 | 24 | 1 (금성 `www.kumsung.net`) |
| 14-24 | 성북 | 29 | 0 |
| 14-25 | 강북 | 14 | 1 (영훈 `www.younghoon.es.kr`) |

9개 stage = 9번의 "파일 작성 → 빌드 → probe → commit → push" 사이클.
**status 갱신은 마지막 stage (14-25) 끝에 단 한 번만** — 685교 (515 + 170) 전부 등록 후.

---

## Step 0 — 시작 전 동기화

```powershell
git pull origin dev
git log -1 --oneline
```

기대: dev-pc 가 최신 push 한 본 runbook commit.

---

## Stage 14-17 — 용산구 15교

### 1-A — `src/lib/schools/seoul/yongsan.ts`

```ts
/**
 * 서울 용산구 15교 — Stage 14-17 (2026-05-03), Phase D 첫 자치구.
 *
 * 모두 sen.es.kr. 신광초 (사립, 서울 prefix 없음) 도 host sen.es.kr.
 * id 충돌 없음.
 */

import type { SchoolConfig } from '../index';

export const YONGSAN_SCHOOLS: Record<string, SchoolConfig> = {
  seoul_keumyang: {
    id: 'seoul_keumyang',
    name: '서울금양초등학교',
    level: 'elementary',
    region: '서울 용산',
    neis: { atptCode: 'B10', schoolCode: '7061059' },
    scrape: { kind: 'sen-es', host: 'keumyang.sen.es.kr' },
  },
  seoul_namjeong: {
    id: 'seoul_namjeong',
    name: '서울남정초등학교',
    level: 'elementary',
    region: '서울 용산',
    neis: { atptCode: 'B10', schoolCode: '7061061' },
    scrape: { kind: 'sen-es', host: 'seoul-nj.sen.es.kr' },
  },
  seoul_bogwang: {
    id: 'seoul_bogwang',
    name: '서울보광초등학교',
    level: 'elementary',
    region: '서울 용산',
    neis: { atptCode: 'B10', schoolCode: '7061066' },
    scrape: { kind: 'sen-es', host: 'bogwang.sen.es.kr' },
  },
  seoul_samkwang: {
    id: 'seoul_samkwang',
    name: '서울삼광초등학교',
    level: 'elementary',
    region: '서울 용산',
    neis: { atptCode: 'B10', schoolCode: '7061068' },
    scrape: { kind: 'sen-es', host: 'seoulsamkwang.sen.es.kr' },
  },
  seoul_seobinggo: {
    id: 'seoul_seobinggo',
    name: '서울서빙고초등학교',
    level: 'elementary',
    region: '서울 용산',
    neis: { atptCode: 'B10', schoolCode: '7061069' },
    scrape: { kind: 'sen-es', host: 'seobinggo.sen.es.kr' },
  },
  seoul_sinyongsan: {
    id: 'seoul_sinyongsan',
    name: '서울신용산초등학교',
    level: 'elementary',
    region: '서울 용산',
    neis: { atptCode: 'B10', schoolCode: '7061073' },
    scrape: { kind: 'sen-es', host: 'sys.sen.es.kr' },
  },
  seoul_yongsan: {
    id: 'seoul_yongsan',
    name: '서울용산초등학교',
    level: 'elementary',
    region: '서울 용산',
    neis: { atptCode: 'B10', schoolCode: '7061074' },
    scrape: { kind: 'sen-es', host: 'yongsan.sen.es.kr' },
  },
  seoul_yongam: {
    id: 'seoul_yongam',
    name: '서울용암초등학교',
    level: 'elementary',
    region: '서울 용산',
    neis: { atptCode: 'B10', schoolCode: '7061075' },
    scrape: { kind: 'sen-es', host: 'yongam.sen.es.kr' },
  },
  seoul_wonhyo: {
    id: 'seoul_wonhyo',
    name: '서울원효초등학교',
    level: 'elementary',
    region: '서울 용산',
    neis: { atptCode: 'B10', schoolCode: '7061076' },
    scrape: { kind: 'sen-es', host: 'wonhyo.sen.es.kr' },
  },
  seoul_itaewon: {
    id: 'seoul_itaewon',
    name: '서울이태원초등학교',
    level: 'elementary',
    region: '서울 용산',
    neis: { atptCode: 'B10', schoolCode: '7061077' },
    scrape: { kind: 'sen-es', host: 'itaewon.sen.es.kr' },
  },
  seoul_cheongpa: {
    id: 'seoul_cheongpa',
    name: '서울청파초등학교',
    level: 'elementary',
    region: '서울 용산',
    neis: { atptCode: 'B10', schoolCode: '7061083' },
    scrape: { kind: 'sen-es', host: 's-cheongpa.sen.es.kr' },
  },
  seoul_hangang: {
    id: 'seoul_hangang',
    name: '서울한강초등학교',
    level: 'elementary',
    region: '서울 용산',
    neis: { atptCode: 'B10', schoolCode: '7061085' },
    scrape: { kind: 'sen-es', host: 'hangang.sen.es.kr' },
  },
  seoul_hannam: {
    id: 'seoul_hannam',
    name: '서울한남초등학교',
    level: 'elementary',
    region: '서울 용산',
    neis: { atptCode: 'B10', schoolCode: '7061086' },
    scrape: { kind: 'sen-es', host: 'hannam.sen.es.kr' },
  },
  seoul_huam: {
    id: 'seoul_huam',
    name: '서울후암초등학교',
    level: 'elementary',
    region: '서울 용산',
    neis: { atptCode: 'B10', schoolCode: '7061089' },
    scrape: { kind: 'sen-es', host: 'huam.sen.es.kr' },
  },
  singwang: {
    id: 'singwang',
    name: '신광초등학교',
    level: 'elementary',
    region: '서울 용산',
    neis: { atptCode: 'B10', schoolCode: '7061092' },
    scrape: { kind: 'sen-es', host: 'skes.sen.es.kr' },
  },
};
```

### 1-B — `src/lib/schools/index.ts` 갱신
- import + spread + 주석 한 줄 추가 (이하 모든 stage 동일 패턴)

### 1-C — 빌드 + dev probe
```powershell
npm run build 2>&1 | Select-Object -Last 20
curl.exe -s "http://localhost:3000/api/meal/photo?schoolId=chonggye&ymd=20260428"
curl.exe -s "http://localhost:3000/api/meal/photo?schoolId=seoul_eunpyeong&ymd=20260428"
curl.exe -s "http://localhost:3000/api/meal/photo?schoolId=seoul_yongsan&ymd=20260428"
curl.exe -s "http://localhost:3000/api/meal/photo?schoolId=seoul_itaewon&ymd=20260428"
curl.exe -s "http://localhost:3000/api/meal/photo?schoolId=seoul_hannam&ymd=20260428"
```

### 1-D — work-log + commit + push
```
## Stage 14-17 — 서울 용산구 15교 (2026-05-03)

Phase D 첫 자치구. 모두 sen.es.kr (신광초 사립 포함). id 충돌 없음.
host 약칭 (seoul-nj→seoul_namjeong, sys→seoul_sinyongsan, s-cheongpa→seoul_cheongpa, skes→singwang).
```

```powershell
git add src/lib/schools/seoul/yongsan.ts src/lib/schools/index.ts docs/work-log.md
git commit -m "feat(seoul): Stage 14-17 — 용산구 15교"
git push origin dev
```

---

## Stage 14-18 — 종로구 13교

### 2-A — `src/lib/schools/seoul/jongno.ts`

```ts
/**
 * 서울 종로구 13교 — Stage 14-18 (2026-05-03), Phase D 두 번째 자치구.
 *
 * 모두 sen.es.kr. 사립 다수 (상명대부속·서울대부설·운현) 도 host sen.es.kr.
 */

import type { SchoolConfig } from '../index';

export const JONGNO_SCHOOLS: Record<string, SchoolConfig> = {
  sangmyung_es: {
    id: 'sangmyung_es',
    name: '상명대학교사범대학부속초등학교',
    level: 'elementary',
    region: '서울 종로',
    neis: { atptCode: 'B10', schoolCode: '7061056' },
    scrape: { kind: 'sen-es', host: 'sangmyung-ae.sen.es.kr' },
  },
  seoul_kyodong: {
    id: 'seoul_kyodong',
    name: '서울교동초등학교',
    level: 'elementary',
    region: '서울 종로',
    neis: { atptCode: 'B10', schoolCode: '7061058' },
    scrape: { kind: 'sen-es', host: 'kyodong.sen.es.kr' },
  },
  snu_es: {
    id: 'snu_es',
    name: '서울대학교사범대학부설초등학교',
    level: 'elementary',
    region: '서울 종로',
    neis: { atptCode: 'B10', schoolCode: '7061128' },
    scrape: { kind: 'sen-es', host: 'snu.sen.es.kr' },
  },
  seoul_dongnimmun: {
    id: 'seoul_dongnimmun',
    name: '서울독립문초등학교',
    level: 'elementary',
    region: '서울 종로',
    neis: { atptCode: 'B10', schoolCode: '7061063' },
    scrape: { kind: 'sen-es', host: 'dnm.sen.es.kr' },
  },
  seoul_maedong_jr: {
    id: 'seoul_maedong_jr',
    name: '서울매동초등학교',
    level: 'elementary',
    region: '서울 종로',
    neis: { atptCode: 'B10', schoolCode: '7061064' },
    scrape: { kind: 'sen-es', host: 'maedong.sen.es.kr' },
  },
  seoul_myungshin: {
    id: 'seoul_myungshin',
    name: '서울명신초등학교',
    level: 'elementary',
    region: '서울 종로',
    neis: { atptCode: 'B10', schoolCode: '7061065' },
    scrape: { kind: 'sen-es', host: 'myungshin.sen.es.kr' },
  },
  seoul_segumjung: {
    id: 'seoul_segumjung',
    name: '서울세검정초등학교',
    level: 'elementary',
    region: '서울 종로',
    neis: { atptCode: 'B10', schoolCode: '7061070' },
    scrape: { kind: 'sen-es', host: 'segumjung.sen.es.kr' },
  },
  seoul_jaedong: {
    id: 'seoul_jaedong',
    name: '서울재동초등학교',
    level: 'elementary',
    region: '서울 종로',
    neis: { atptCode: 'B10', schoolCode: '7061079' },
    scrape: { kind: 'sen-es', host: 'jaedong.sen.es.kr' },
  },
  seoul_changshin: {
    id: 'seoul_changshin',
    name: '서울창신초등학교',
    level: 'elementary',
    region: '서울 종로',
    neis: { atptCode: 'B10', schoolCode: '7061080' },
    scrape: { kind: 'sen-es', host: 'chang-shin.sen.es.kr' },
  },
  seoul_chungwoon: {
    id: 'seoul_chungwoon',
    name: '서울청운초등학교',
    level: 'elementary',
    region: '서울 종로',
    neis: { atptCode: 'B10', schoolCode: '7061082' },
    scrape: { kind: 'sen-es', host: 'chungwoon.sen.es.kr' },
  },
  seoul_hyehwa: {
    id: 'seoul_hyehwa',
    name: '서울혜화초등학교',
    level: 'elementary',
    region: '서울 종로',
    neis: { atptCode: 'B10', schoolCode: '7061087' },
    scrape: { kind: 'sen-es', host: 'hyehwa.sen.es.kr' },
  },
  seoul_hyoje: {
    id: 'seoul_hyoje',
    name: '서울효제초등학교',
    level: 'elementary',
    region: '서울 종로',
    neis: { atptCode: 'B10', schoolCode: '7061088' },
    scrape: { kind: 'sen-es', host: 'hyoje.sen.es.kr' },
  },
  unhyun: {
    id: 'unhyun',
    name: '운현초등학교',
    level: 'elementary',
    region: '서울 종로',
    neis: { atptCode: 'B10', schoolCode: '7061093' },
    scrape: { kind: 'sen-es', host: 'unhyun.sen.es.kr' },
  },
};
```

### 2-B/2-C/2-D — 동일 패턴
- probe: `seoul_yongsan` (회귀), `snu_es`, `seoul_kyodong`, `seoul_changshin`
- commit: `feat(seoul): Stage 14-18 — 종로구 13교`

work-log:
```
## Stage 14-18 — 서울 종로구 13교 (2026-05-03)

Phase D 두 번째 자치구. 모두 sen.es.kr. 사립 비율 높음 (상명대부속·서울대부설·운현·명신).
서울 prefix 없는 사립 1교 (운현). 매동초는 다른 자치구 매동과 구분 위해 `seoul_maedong_jr`.
```

---

## Stage 14-19 — 중구 12교

### 3-A — `src/lib/schools/seoul/jung.ts`

**중요**: 리라초 host = `www.lila.es.kr` → `scrape` 생략.

```ts
/**
 * 서울 중구 12교 — Stage 14-19 (2026-05-03), Phase D 세 번째 자치구.
 *
 * 11교 sen.es.kr + 1교 (리라초) host www.lila.es.kr → scrape 생략.
 * 동산초·숭의초 등 사립도 host sen.es.kr 라 등록 가능.
 */

import type { SchoolConfig } from '../index';

export const JUNG_SCHOOLS: Record<string, SchoolConfig> = {
  dongsan_jg: {
    id: 'dongsan_jg',
    name: '동산초등학교',
    level: 'elementary',
    region: '서울 중구',
    neis: { atptCode: 'B10', schoolCode: '7061054' },
    scrape: { kind: 'sen-es', host: 'seoul-dongsan.sen.es.kr' },
  },
  lila: {
    id: 'lila',
    name: '리라초등학교',
    level: 'elementary',
    region: '서울 중구',
    neis: { atptCode: 'B10', schoolCode: '7061055' },
    // scrape 생략 — host = www.lila.es.kr (사립). NEIS 메뉴만, 사진 미지원.
  },
  seoul_gwanghee: {
    id: 'seoul_gwanghee',
    name: '서울광희초등학교',
    level: 'elementary',
    region: '서울 중구',
    neis: { atptCode: 'B10', schoolCode: '7061057' },
    scrape: { kind: 'sen-es', host: 'gwanghee.sen.es.kr' },
  },
  seoul_namsan: {
    id: 'seoul_namsan',
    name: '서울남산초등학교',
    level: 'elementary',
    region: '서울 중구',
    neis: { atptCode: 'B10', schoolCode: '7061060' },
    scrape: { kind: 'sen-es', host: 'namsan.sen.es.kr' },
  },
  seoul_deoksoo: {
    id: 'seoul_deoksoo',
    name: '서울덕수초등학교',
    level: 'elementary',
    region: '서울 중구',
    neis: { atptCode: 'B10', schoolCode: '7061062' },
    scrape: { kind: 'sen-es', host: 'deoksoo.sen.es.kr' },
  },
  seoul_bongrae: {
    id: 'seoul_bongrae',
    name: '서울봉래초등학교',
    level: 'elementary',
    region: '서울 중구',
    neis: { atptCode: 'B10', schoolCode: '7061067' },
    scrape: { kind: 'sen-es', host: 'seoul-bongrae.sen.es.kr' },
  },
  seoul_sindang: {
    id: 'seoul_sindang',
    name: '서울신당초등학교',
    level: 'elementary',
    region: '서울 중구',
    neis: { atptCode: 'B10', schoolCode: '7061072' },
    scrape: { kind: 'sen-es', host: 'shindang.sen.es.kr' },
  },
  seoul_jangchung: {
    id: 'seoul_jangchung',
    name: '서울장충초등학교',
    level: 'elementary',
    region: '서울 중구',
    neis: { atptCode: 'B10', schoolCode: '7061078' },
    scrape: { kind: 'sen-es', host: 'jangchung.sen.es.kr' },
  },
  seoul_cheonggu: {
    id: 'seoul_cheonggu',
    name: '서울청구초등학교',
    level: 'elementary',
    region: '서울 중구',
    neis: { atptCode: 'B10', schoolCode: '7061081' },
    scrape: { kind: 'sen-es', host: 'cheonggu.sen.es.kr' },
  },
  seoul_chungmu: {
    id: 'seoul_chungmu',
    name: '서울충무초등학교',
    level: 'elementary',
    region: '서울 중구',
    neis: { atptCode: 'B10', schoolCode: '7061084' },
    scrape: { kind: 'sen-es', host: 'seoulchungmu.sen.es.kr' },
  },
  seoul_heungin: {
    id: 'seoul_heungin',
    name: '서울흥인초등학교',
    level: 'elementary',
    region: '서울 중구',
    neis: { atptCode: 'B10', schoolCode: '7061090' },
    scrape: { kind: 'sen-es', host: 'heungin.sen.es.kr' },
  },
  soongeui: {
    id: 'soongeui',
    name: '숭의초등학교',
    level: 'elementary',
    region: '서울 중구',
    neis: { atptCode: 'B10', schoolCode: '7061091' },
    scrape: { kind: 'sen-es', host: 'soongeui.sen.es.kr' },
  },
};
```

### 3-B/3-C/3-D — 동일 패턴
- probe: `seoul_kyodong` (회귀), `seoul_namsan`, `seoul_deoksoo`, `seoul_namsa`(동작 회귀)
- commit: `feat(seoul): Stage 14-19 — 중구 12교`

work-log:
```
## Stage 14-19 — 서울 중구 12교 (2026-05-03)

Phase D 세 번째 자치구. 11교 sen.es.kr + 1교 (리라초) host=lila.es.kr → scrape 생략.
동산초·숭의초 사립이지만 host sen.es.kr 라 등록.
```

---

## Stage 14-20 — 성동구 21교

### 4-A — `src/lib/schools/seoul/seongdong.ts`

**중요**: 한양초 host = `www.hye.or.kr` → `scrape` 생략.

```ts
/**
 * 서울 성동구 21교 — Stage 14-20 (2026-05-03), Phase D 네 번째 자치구.
 *
 * 20교 sen.es.kr + 1교 (한양초 사립) host hye.or.kr → scrape 생략.
 * id 충돌 회피 위해 동음 학교에 `_sd` suffix (kyongil_sd, dongmyung_sd).
 */

import type { SchoolConfig } from '../index';

export const SEONGDONG_SCHOOLS: Record<string, SchoolConfig> = {
  seoul_kyungdong: {
    id: 'seoul_kyungdong',
    name: '서울경동초등학교',
    level: 'elementary',
    region: '서울 성동',
    neis: { atptCode: 'B10', schoolCode: '7134078' },
    scrape: { kind: 'sen-es', host: 'kyungdong.sen.es.kr' },
  },
  seoul_kyeongsu: {
    id: 'seoul_kyeongsu',
    name: '서울경수초등학교',
    level: 'elementary',
    region: '서울 성동',
    neis: { atptCode: 'B10', schoolCode: '7134079' },
    scrape: { kind: 'sen-es', host: 'ks.sen.es.kr' },
  },
  seoul_kyongil_sd: {
    id: 'seoul_kyongil_sd',
    name: '서울경일초등학교',
    level: 'elementary',
    region: '서울 성동',
    neis: { atptCode: 'B10', schoolCode: '7134080' },
    scrape: { kind: 'sen-es', host: 'kyongil.sen.es.kr' },
  },
  seoul_geumbuk: {
    id: 'seoul_geumbuk',
    name: '서울금북초등학교',
    level: 'elementary',
    region: '서울 성동',
    neis: { atptCode: 'B10', schoolCode: '7134086' },
    scrape: { kind: 'sen-es', host: 'gb.sen.es.kr' },
  },
  seoul_geumok: {
    id: 'seoul_geumok',
    name: '서울금옥초등학교',
    level: 'elementary',
    region: '서울 성동',
    neis: { atptCode: 'B10', schoolCode: '7134087' },
    scrape: { kind: 'sen-es', host: 'geumok.sen.es.kr' },
  },
  seoul_geumho: {
    id: 'seoul_geumho',
    name: '서울금호초등학교',
    level: 'elementary',
    region: '서울 성동',
    neis: { atptCode: 'B10', schoolCode: '7134088' },
    scrape: { kind: 'sen-es', host: 'geumho.sen.es.kr' },
  },
  seoul_dongmyung_sd: {
    id: 'seoul_dongmyung_sd',
    name: '서울동명초등학교',
    level: 'elementary',
    region: '서울 성동',
    neis: { atptCode: 'B10', schoolCode: '7134089' },
    scrape: { kind: 'sen-es', host: 'dgmg.sen.es.kr' },
  },
  seoul_dongho: {
    id: 'seoul_dongho',
    name: '서울동호초등학교',
    level: 'elementary',
    region: '서울 성동',
    neis: { atptCode: 'B10', schoolCode: '7134092' },
    scrape: { kind: 'sen-es', host: 'dongho.sen.es.kr' },
  },
  seoul_majang: {
    id: 'seoul_majang',
    name: '서울마장초등학교',
    level: 'elementary',
    region: '서울 성동',
    neis: { atptCode: 'B10', schoolCode: '7134093' },
    scrape: { kind: 'sen-es', host: 'majang.sen.es.kr' },
  },
  seoul_muhag: {
    id: 'seoul_muhag',
    name: '서울무학초등학교',
    level: 'elementary',
    region: '서울 성동',
    neis: { atptCode: 'B10', schoolCode: '7134094' },
    scrape: { kind: 'sen-es', host: 'muhag.sen.es.kr' },
  },
  seoul_sageun: {
    id: 'seoul_sageun',
    name: '서울사근초등학교',
    level: 'elementary',
    region: '서울 성동',
    neis: { atptCode: 'B10', schoolCode: '7134095' },
    scrape: { kind: 'sen-es', host: 'sageun.sen.es.kr' },
  },
  seoul_sungsu: {
    id: 'seoul_sungsu',
    name: '서울성수초등학교',
    level: 'elementary',
    region: '서울 성동',
    neis: { atptCode: 'B10', schoolCode: '7134096' },
    scrape: { kind: 'sen-es', host: 'sungsu.sen.es.kr' },
  },
  seoul_songwon: {
    id: 'seoul_songwon',
    name: '서울송원초등학교',
    level: 'elementary',
    region: '서울 성동',
    neis: { atptCode: 'B10', schoolCode: '7134098' },
    scrape: { kind: 'sen-es', host: 'ssw.sen.es.kr' },
  },
  seoul_soongshin: {
    id: 'seoul_soongshin',
    name: '서울숭신초등학교',
    level: 'elementary',
    region: '서울 성동',
    neis: { atptCode: 'B10', schoolCode: '7134150' },
    scrape: { kind: 'sen-es', host: 'soongshin.sen.es.kr' },
  },
  seoul_oksu: {
    id: 'seoul_oksu',
    name: '서울옥수초등학교',
    level: 'elementary',
    region: '서울 성동',
    neis: { atptCode: 'B10', schoolCode: '7134103' },
    scrape: { kind: 'sen-es', host: 'oksu.sen.es.kr' },
  },
  seoul_okjeong: {
    id: 'seoul_okjeong',
    name: '서울옥정초등학교',
    level: 'elementary',
    region: '서울 성동',
    neis: { atptCode: 'B10', schoolCode: '7134104' },
    scrape: { kind: 'sen-es', host: 'okjeong.sen.es.kr' },
  },
  seoul_yongdab: {
    id: 'seoul_yongdab',
    name: '서울용답초등학교',
    level: 'elementary',
    region: '서울 성동',
    neis: { atptCode: 'B10', schoolCode: '7134106' },
    scrape: { kind: 'sen-es', host: 'yd.sen.es.kr' },
  },
  seoul_eungbong: {
    id: 'seoul_eungbong',
    name: '서울응봉초등학교',
    level: 'elementary',
    region: '서울 성동',
    neis: { atptCode: 'B10', schoolCode: '7134108' },
    scrape: { kind: 'sen-es', host: 'eb.sen.es.kr' },
  },
  seoul_haengdang: {
    id: 'seoul_haengdang',
    name: '서울행당초등학교',
    level: 'elementary',
    region: '서울 성동',
    neis: { atptCode: 'B10', schoolCode: '7134113' },
    scrape: { kind: 'sen-es', host: 'hd.sen.es.kr' },
  },
  seoul_haenghyun: {
    id: 'seoul_haenghyun',
    name: '서울행현초등학교',
    level: 'elementary',
    region: '서울 성동',
    neis: { atptCode: 'B10', schoolCode: '7134114' },
    scrape: { kind: 'sen-es', host: 'haenghyun.sen.es.kr' },
  },
  hanyang_es: {
    id: 'hanyang_es',
    name: '한양초등학교',
    level: 'elementary',
    region: '서울 성동',
    neis: { atptCode: 'B10', schoolCode: '7134118' },
    // scrape 생략 — host = www.hye.or.kr (사립). NEIS 메뉴만.
  },
};
```

### 4-B/4-C/4-D — 동일 패턴
- probe: `seoul_namsan` (회귀), `seoul_geumho`, `seoul_oksu`, `seoul_seongsu`(잘못 — `seoul_sungsu` 임)
- 정확한 probe: `seoul_namsan`, `seoul_geumho`, `seoul_oksu`, `seoul_sungsu`
- commit: `feat(seoul): Stage 14-20 — 성동구 21교`

work-log:
```
## Stage 14-20 — 서울 성동구 21교 (2026-05-03)

Phase D 네 번째 자치구. 20교 sen.es.kr + 1교 (한양초) host hye.or.kr → scrape 생략.
id 충돌 회피 — 경일초·동명초는 동음 학교 있어 `_sd` suffix.
```

---

## Stage 14-21 — 광진구 21교

### 5-A — `src/lib/schools/seoul/gwangjin.ts`

**중요**: 경복초 host = `www.kbes.kr` → `scrape` 생략.

```ts
/**
 * 서울 광진구 21교 — Stage 14-21 (2026-05-03), Phase D 마지막 자치구.
 *
 * 20교 sen.es.kr + 1교 (경복초 사립) host kbes.kr → scrape 생략.
 * 성동초·세종초 등 사립도 host sen.es.kr 라 등록.
 */

import type { SchoolConfig } from '../index';

export const GWANGJIN_SCHOOLS: Record<string, SchoolConfig> = {
  gyeongbok_es: {
    id: 'gyeongbok_es',
    name: '경복초등학교',
    level: 'elementary',
    region: '서울 광진',
    neis: { atptCode: 'B10', schoolCode: '7134077' },
    // scrape 생략 — host = www.kbes.kr (사립). NEIS 메뉴만.
  },
  seoul_gwangnam: {
    id: 'seoul_gwangnam',
    name: '서울광남초등학교',
    level: 'elementary',
    region: '서울 광진',
    neis: { atptCode: 'B10', schoolCode: '7134081' },
    scrape: { kind: 'sen-es', host: 'gwangnam.sen.es.kr' },
  },
  seoul_kwangjang: {
    id: 'seoul_kwangjang',
    name: '서울광장초등학교',
    level: 'elementary',
    region: '서울 광진',
    neis: { atptCode: 'B10', schoolCode: '7134082' },
    scrape: { kind: 'sen-es', host: 'kwangjang.sen.es.kr' },
  },
  seoul_gwangjin: {
    id: 'seoul_gwangjin',
    name: '서울광진초등학교',
    level: 'elementary',
    region: '서울 광진',
    neis: { atptCode: 'B10', schoolCode: '7134083' },
    scrape: { kind: 'sen-es', host: 'gwangjin.sen.es.kr' },
  },
  seoul_gunam: {
    id: 'seoul_gunam',
    name: '서울구남초등학교',
    level: 'elementary',
    region: '서울 광진',
    neis: { atptCode: 'B10', schoolCode: '7134084' },
    scrape: { kind: 'sen-es', host: 'gunam.sen.es.kr' },
  },
  seoul_guui: {
    id: 'seoul_guui',
    name: '서울구의초등학교',
    level: 'elementary',
    region: '서울 광진',
    neis: { atptCode: 'B10', schoolCode: '7134085' },
    scrape: { kind: 'sen-es', host: 'guui.sen.es.kr' },
  },
  seoul_dongeui: {
    id: 'seoul_dongeui',
    name: '서울동의초등학교',
    level: 'elementary',
    region: '서울 광진',
    neis: { atptCode: 'B10', schoolCode: '7134090' },
    scrape: { kind: 'sen-es', host: 'dongeui.sen.es.kr' },
  },
  seoul_dongja: {
    id: 'seoul_dongja',
    name: '서울동자초등학교',
    level: 'elementary',
    region: '서울 광진',
    neis: { atptCode: 'B10', schoolCode: '7134091' },
    scrape: { kind: 'sen-es', host: 'dongja.sen.es.kr' },
  },
  seoul_seongja: {
    id: 'seoul_seongja',
    name: '서울성자초등학교',
    level: 'elementary',
    region: '서울 광진',
    neis: { atptCode: 'B10', schoolCode: '7134097' },
    scrape: { kind: 'sen-es', host: 'seongja.sen.es.kr' },
  },
  seoul_sinyang: {
    id: 'seoul_sinyang',
    name: '서울신양초등학교',
    level: 'elementary',
    region: '서울 광진',
    neis: { atptCode: 'B10', schoolCode: '7134099' },
    scrape: { kind: 'sen-es', host: 'sinyang.sen.es.kr' },
  },
  seoul_sinja: {
    id: 'seoul_sinja',
    name: '서울신자초등학교',
    level: 'elementary',
    region: '서울 광진',
    neis: { atptCode: 'B10', schoolCode: '7134100' },
    scrape: { kind: 'sen-es', host: 'sinja.sen.es.kr' },
  },
  seoul_yangnam: {
    id: 'seoul_yangnam',
    name: '서울양남초등학교',
    level: 'elementary',
    region: '서울 광진',
    neis: { atptCode: 'B10', schoolCode: '7134101' },
    scrape: { kind: 'sen-es', host: 's-yangnam.sen.es.kr' },
  },
  seoul_yangjin: {
    id: 'seoul_yangjin',
    name: '서울양진초등학교',
    level: 'elementary',
    region: '서울 광진',
    neis: { atptCode: 'B10', schoolCode: '7134102' },
    scrape: { kind: 'sen-es', host: 'yjs.sen.es.kr' },
  },
  seoul_yonggok: {
    id: 'seoul_yonggok',
    name: '서울용곡초등학교',
    level: 'elementary',
    region: '서울 광진',
    neis: { atptCode: 'B10', schoolCode: '7134105' },
    scrape: { kind: 'sen-es', host: 'yonggok.sen.es.kr' },
  },
  seoul_yongma: {
    id: 'seoul_yongma',
    name: '서울용마초등학교',
    level: 'elementary',
    region: '서울 광진',
    neis: { atptCode: 'B10', schoolCode: '7134107' },
    scrape: { kind: 'sen-es', host: 'ymc.sen.es.kr' },
  },
  seoul_jayang: {
    id: 'seoul_jayang',
    name: '서울자양초등학교',
    level: 'elementary',
    region: '서울 광진',
    neis: { atptCode: 'B10', schoolCode: '7134109' },
    scrape: { kind: 'sen-es', host: 'jayang.sen.es.kr' },
  },
  seoul_jangan: {
    id: 'seoul_jangan',
    name: '서울장안초등학교',
    level: 'elementary',
    region: '서울 광진',
    neis: { atptCode: 'B10', schoolCode: '7134110' },
    scrape: { kind: 'sen-es', host: 'jangan.sen.es.kr' },
  },
  seoul_junggwang: {
    id: 'seoul_junggwang',
    name: '서울중광초등학교',
    level: 'elementary',
    region: '서울 광진',
    neis: { atptCode: 'B10', schoolCode: '7134111' },
    scrape: { kind: 'sen-es', host: 'jkschool.sen.es.kr' },
  },
  seoul_jungma: {
    id: 'seoul_jungma',
    name: '서울중마초등학교',
    level: 'elementary',
    region: '서울 광진',
    neis: { atptCode: 'B10', schoolCode: '7134112' },
    scrape: { kind: 'sen-es', host: 'jungma.sen.es.kr' },
  },
  seoul_seongdong: {
    id: 'seoul_seongdong',
    name: '성동초등학교',
    level: 'elementary',
    region: '서울 광진',
    neis: { atptCode: 'B10', schoolCode: '7134116' },
    scrape: { kind: 'sen-es', host: 'sungdong.sen.es.kr' },
  },
  seoul_sejong: {
    id: 'seoul_sejong',
    name: '세종초등학교',
    level: 'elementary',
    region: '서울 광진',
    neis: { atptCode: 'B10', schoolCode: '7134117' },
    scrape: { kind: 'sen-es', host: 'sejong.sen.es.kr' },
  },
};
```

### 5-B/5-C/5-D — 동일 패턴
- probe: `seoul_kyungdong` (회귀), `seoul_gwangjin`, `seoul_jayang`, `seoul_kwangjang`
- commit: `feat(seoul): Stage 14-21 — 광진구 21교`

work-log:
```
## Stage 14-21 — 서울 광진구 21교 (2026-05-03)

Phase D 마지막 자치구. 20교 sen.es.kr + 1교 (경복초) host kbes.kr → scrape 생략.
성동초·세종초 사립이지만 host sen.es.kr 라 등록.
```

---

## Stage 14-22 — 동대문구 21교

### 6-A — `src/lib/schools/seoul/dongdaemun.ts`

```ts
/**
 * 서울 동대문구 21교 — Stage 14-22 (2026-05-03), Phase E 첫 자치구.
 *
 * 모두 sen.es.kr (사립 경희·은석 포함). id 충돌 없음.
 * 삼육초 → seoul36.sen.es.kr (특이 host).
 */

import type { SchoolConfig } from '../index';

export const DONGDAEMUN_SCHOOLS: Record<string, SchoolConfig> = {
  kyunghee_es: {
    id: 'kyunghee_es',
    name: '경희초등학교',
    level: 'elementary',
    region: '서울 동대문',
    neis: { atptCode: 'B10', schoolCode: '7021079' },
    scrape: { kind: 'sen-es', host: 'kyunghee.sen.es.kr' },
  },
  seoul_kunja: {
    id: 'seoul_kunja',
    name: '서울군자초등학교',
    level: 'elementary',
    region: '서울 동대문',
    neis: { atptCode: 'B10', schoolCode: '7021082' },
    scrape: { kind: 'sen-es', host: 'kunja.sen.es.kr' },
  },
  seoul_dapsimni: {
    id: 'seoul_dapsimni',
    name: '서울답십리초등학교',
    level: 'elementary',
    region: '서울 동대문',
    neis: { atptCode: 'B10', schoolCode: '7021083' },
    scrape: { kind: 'sen-es', host: 'dapsimni.sen.es.kr' },
  },
  seoul_dongdab: {
    id: 'seoul_dongdab',
    name: '서울동답초등학교',
    level: 'elementary',
    region: '서울 동대문',
    neis: { atptCode: 'B10', schoolCode: '7021084' },
    scrape: { kind: 'sen-es', host: 'dongdab.sen.es.kr' },
  },
  seoul_baebong: {
    id: 'seoul_baebong',
    name: '서울배봉초등학교',
    level: 'elementary',
    region: '서울 동대문',
    neis: { atptCode: 'B10', schoolCode: '7021095' },
    scrape: { kind: 'sen-es', host: 'baebong.sen.es.kr' },
  },
  seoul_seoul36: {
    id: 'seoul_seoul36',
    name: '서울삼육초등학교',
    level: 'elementary',
    region: '서울 동대문',
    neis: { atptCode: 'B10', schoolCode: '7021168' },
    scrape: { kind: 'sen-es', host: 'seoul36.sen.es.kr' },
  },
  seoul_shindap: {
    id: 'seoul_shindap',
    name: '서울신답초등학교',
    level: 'elementary',
    region: '서울 동대문',
    neis: { atptCode: 'B10', schoolCode: '7021099' },
    scrape: { kind: 'sen-es', host: 'shindap.sen.es.kr' },
  },
  seoul_anpyeong: {
    id: 'seoul_anpyeong',
    name: '서울안평초등학교',
    level: 'elementary',
    region: '서울 동대문',
    neis: { atptCode: 'B10', schoolCode: '7021102' },
    scrape: { kind: 'sen-es', host: 'anpyeong.sen.es.kr' },
  },
  seoul_yongdu: {
    id: 'seoul_yongdu',
    name: '서울용두초등학교',
    level: 'elementary',
    region: '서울 동대문',
    neis: { atptCode: 'B10', schoolCode: '7021103' },
    scrape: { kind: 'sen-es', host: 'yongdu.sen.es.kr' },
  },
  seoul_imun: {
    id: 'seoul_imun',
    name: '서울이문초등학교',
    level: 'elementary',
    region: '서울 동대문',
    neis: { atptCode: 'B10', schoolCode: '7021105' },
    scrape: { kind: 'sen-es', host: 'imun.sen.es.kr' },
  },
  seoul_jangpyung: {
    id: 'seoul_jangpyung',
    name: '서울장평초등학교',
    level: 'elementary',
    region: '서울 동대문',
    neis: { atptCode: 'B10', schoolCode: '7021106' },
    scrape: { kind: 'sen-es', host: 'jang-pyung.sen.es.kr' },
  },
  seoul_jeongok: {
    id: 'seoul_jeongok',
    name: '서울전곡초등학교',
    level: 'elementary',
    region: '서울 동대문',
    neis: { atptCode: 'B10', schoolCode: '7021107' },
    scrape: { kind: 'sen-es', host: 'jeongok.sen.es.kr' },
  },
  seoul_jeonnong: {
    id: 'seoul_jeonnong',
    name: '서울전농초등학교',
    level: 'elementary',
    region: '서울 동대문',
    neis: { atptCode: 'B10', schoolCode: '7021108' },
    scrape: { kind: 'sen-es', host: 'jeonnong.sen.es.kr' },
  },
  seoul_jeondong: {
    id: 'seoul_jeondong',
    name: '서울전동초등학교',
    level: 'elementary',
    region: '서울 동대문',
    neis: { atptCode: 'B10', schoolCode: '7021109' },
    scrape: { kind: 'sen-es', host: 'jeondong.sen.es.kr' },
  },
  seoul_jongam: {
    id: 'seoul_jongam',
    name: '서울종암초등학교',
    level: 'elementary',
    region: '서울 동대문',
    neis: { atptCode: 'B10', schoolCode: '7021110' },
    scrape: { kind: 'sen-es', host: 'jongam.sen.es.kr' },
  },
  seoul_chongryang: {
    id: 'seoul_chongryang',
    name: '서울청량초등학교',
    level: 'elementary',
    region: '서울 동대문',
    neis: { atptCode: 'B10', schoolCode: '7021116' },
    scrape: { kind: 'sen-es', host: 'chongryang.sen.es.kr' },
  },
  seoul_hongneung: {
    id: 'seoul_hongneung',
    name: '서울홍릉초등학교',
    level: 'elementary',
    region: '서울 동대문',
    neis: { atptCode: 'B10', schoolCode: '7021117' },
    scrape: { kind: 'sen-es', host: 'hongneung.sen.es.kr' },
  },
  seoul_hongpa: {
    id: 'seoul_hongpa',
    name: '서울홍파초등학교',
    level: 'elementary',
    region: '서울 동대문',
    neis: { atptCode: 'B10', schoolCode: '7021118' },
    scrape: { kind: 'sen-es', host: 'hongpa.sen.es.kr' },
  },
  seoul_hwykyung: {
    id: 'seoul_hwykyung',
    name: '서울휘경초등학교',
    level: 'elementary',
    region: '서울 동대문',
    neis: { atptCode: 'B10', schoolCode: '7021119' },
    scrape: { kind: 'sen-es', host: 'hwykyung.sen.es.kr' },
  },
  seoul_hwibong: {
    id: 'seoul_hwibong',
    name: '서울휘봉초등학교',
    level: 'elementary',
    region: '서울 동대문',
    neis: { atptCode: 'B10', schoolCode: '7021120' },
    scrape: { kind: 'sen-es', host: 'hwibong.sen.es.kr' },
  },
  eunseok: {
    id: 'eunseok',
    name: '은석초등학교',
    level: 'elementary',
    region: '서울 동대문',
    neis: { atptCode: 'B10', schoolCode: '7021121' },
    scrape: { kind: 'sen-es', host: 'eunseok.sen.es.kr' },
  },
};
```

### 6-B/6-C/6-D — 동일 패턴
- probe: `seoul_gwangnam` (회귀), `seoul_imun`, `seoul_jeonnong`, `kyunghee_es`
- commit: `feat(seoul): Stage 14-22 — 동대문구 21교`

work-log:
```
## Stage 14-22 — 서울 동대문구 21교 (2026-05-03)

Phase E 첫 자치구. 모두 sen.es.kr (경희·은석 사립 포함). 삼육초 host seoul36.sen.es.kr.
```

---

## Stage 14-23 — 중랑구 24교

### 7-A — `src/lib/schools/seoul/jungnang.ts`

**중요**: 금성초 host = `www.kumsung.net` → `scrape` 생략.

```ts
/**
 * 서울 중랑구 24교 — Stage 14-23 (2026-05-03), Phase E 두 번째 자치구.
 *
 * 23교 sen.es.kr + 1교 (금성초 사립) host kumsung.net → scrape 생략.
 */

import type { SchoolConfig } from '../index';

export const JUNGNANG_SCHOOLS: Record<string, SchoolConfig> = {
  kumsung_es: {
    id: 'kumsung_es',
    name: '금성초등학교',
    level: 'elementary',
    region: '서울 중랑',
    neis: { atptCode: 'B10', schoolCode: '7021080' },
    // scrape 생략 — host = www.kumsung.net (사립). NEIS 메뉴만.
  },
  seoul_dongwon: {
    id: 'seoul_dongwon',
    name: '서울동원초등학교',
    level: 'elementary',
    region: '서울 중랑',
    neis: { atptCode: 'B10', schoolCode: '7021085' },
    scrape: { kind: 'sen-es', host: 'dongwon.sen.es.kr' },
  },
  seoul_mangwoo: {
    id: 'seoul_mangwoo',
    name: '서울망우초등학교',
    level: 'elementary',
    region: '서울 중랑',
    neis: { atptCode: 'B10', schoolCode: '7021086' },
    scrape: { kind: 'sen-es', host: 'mangwoo.sen.es.kr' },
  },
  seoul_myunnam: {
    id: 'seoul_myunnam',
    name: '서울면남초등학교',
    level: 'elementary',
    region: '서울 중랑',
    neis: { atptCode: 'B10', schoolCode: '7021087' },
    scrape: { kind: 'sen-es', host: 'myunnam.sen.es.kr' },
  },
  seoul_myeondong: {
    id: 'seoul_myeondong',
    name: '서울면동초등학교',
    level: 'elementary',
    region: '서울 중랑',
    neis: { atptCode: 'B10', schoolCode: '7021088' },
    scrape: { kind: 'sen-es', host: 'myeondong.sen.es.kr' },
  },
  seoul_myeonmok: {
    id: 'seoul_myeonmok',
    name: '서울면목초등학교',
    level: 'elementary',
    region: '서울 중랑',
    neis: { atptCode: 'B10', schoolCode: '7021089' },
    scrape: { kind: 'sen-es', host: 'myeonmok.sen.es.kr' },
  },
  seoul_myeonbuk: {
    id: 'seoul_myeonbuk',
    name: '서울면북초등학교',
    level: 'elementary',
    region: '서울 중랑',
    neis: { atptCode: 'B10', schoolCode: '7021090' },
    scrape: { kind: 'sen-es', host: 'myeonbuk.sen.es.kr' },
  },
  seoul_myeonil: {
    id: 'seoul_myeonil',
    name: '서울면일초등학교',
    level: 'elementary',
    region: '서울 중랑',
    neis: { atptCode: 'B10', schoolCode: '7021091' },
    scrape: { kind: 'sen-es', host: 'myeonil.sen.es.kr' },
  },
  seoul_myunjoong: {
    id: 'seoul_myunjoong',
    name: '서울면중초등학교',
    level: 'elementary',
    region: '서울 중랑',
    neis: { atptCode: 'B10', schoolCode: '7021092' },
    scrape: { kind: 'sen-es', host: 'myunjoong.sen.es.kr' },
  },
  seoul_mookdong: {
    id: 'seoul_mookdong',
    name: '서울묵동초등학교',
    level: 'elementary',
    region: '서울 중랑',
    neis: { atptCode: 'B10', schoolCode: '7021093' },
    scrape: { kind: 'sen-es', host: 'mookdong.sen.es.kr' },
  },
  seoul_mookhyun: {
    id: 'seoul_mookhyun',
    name: '서울묵현초등학교',
    level: 'elementary',
    region: '서울 중랑',
    neis: { atptCode: 'B10', schoolCode: '7021094' },
    scrape: { kind: 'sen-es', host: 'mh.sen.es.kr' },
  },
  seoul_bonghwa: {
    id: 'seoul_bonghwa',
    name: '서울봉화초등학교',
    level: 'elementary',
    region: '서울 중랑',
    neis: { atptCode: 'B10', schoolCode: '7021096' },
    scrape: { kind: 'sen-es', host: 'bonghwa.sen.es.kr' },
  },
  seoul_sangbong: {
    id: 'seoul_sangbong',
    name: '서울상봉초등학교',
    level: 'elementary',
    region: '서울 중랑',
    neis: { atptCode: 'B10', schoolCode: '7021097' },
    scrape: { kind: 'sen-es', host: 'sang-bong.sen.es.kr' },
  },
  seoul_saesol: {
    id: 'seoul_saesol',
    name: '서울새솔초등학교',
    level: 'elementary',
    region: '서울 중랑',
    neis: { atptCode: 'B10', schoolCode: '7021181' },
    scrape: { kind: 'sen-es', host: 'saesol.sen.es.kr' },
  },
  seoul_sinnae: {
    id: 'seoul_sinnae',
    name: '서울신내초등학교',
    level: 'elementary',
    region: '서울 중랑',
    neis: { atptCode: 'B10', schoolCode: '7021098' },
    scrape: { kind: 'sen-es', host: 'sinne.sen.es.kr' },
  },
  seoul_sinmook: {
    id: 'seoul_sinmook',
    name: '서울신묵초등학교',
    level: 'elementary',
    region: '서울 중랑',
    neis: { atptCode: 'B10', schoolCode: '7021100' },
    scrape: { kind: 'sen-es', host: 'sinmook.sen.es.kr' },
  },
  seoul_shinhyun: {
    id: 'seoul_shinhyun',
    name: '서울신현초등학교',
    level: 'elementary',
    region: '서울 중랑',
    neis: { atptCode: 'B10', schoolCode: '7021101' },
    scrape: { kind: 'sen-es', host: 'shinhyun.sen.es.kr' },
  },
  seoul_yangwonsoop: {
    id: 'seoul_yangwonsoop',
    name: '서울양원숲초등학교',
    level: 'elementary',
    region: '서울 중랑',
    neis: { atptCode: 'B10', schoolCode: '7021205' },
    scrape: { kind: 'sen-es', host: 'yangwonsoop.sen.es.kr' },
  },
  seoul_wonmuk: {
    id: 'seoul_wonmuk',
    name: '서울원묵초등학교',
    level: 'elementary',
    region: '서울 중랑',
    neis: { atptCode: 'B10', schoolCode: '7021104' },
    scrape: { kind: 'sen-es', host: 'wonmuk.sen.es.kr' },
  },
  seoul_jungkok: {
    id: 'seoul_jungkok',
    name: '서울중곡초등학교',
    level: 'elementary',
    region: '서울 중랑',
    neis: { atptCode: 'B10', schoolCode: '7021111' },
    scrape: { kind: 'sen-es', host: 'cg.sen.es.kr' },
  },
  seoul_jungnang: {
    id: 'seoul_jungnang',
    name: '서울중랑초등학교',
    level: 'elementary',
    region: '서울 중랑',
    neis: { atptCode: 'B10', schoolCode: '7021112' },
    scrape: { kind: 'sen-es', host: 'jungnang.sen.es.kr' },
  },
  seoul_joongmok: {
    id: 'seoul_joongmok',
    name: '서울중목초등학교',
    level: 'elementary',
    region: '서울 중랑',
    neis: { atptCode: 'B10', schoolCode: '7021113' },
    scrape: { kind: 'sen-es', host: 'joongmok.sen.es.kr' },
  },
  seoul_junghwa: {
    id: 'seoul_junghwa',
    name: '서울중화초등학교',
    level: 'elementary',
    region: '서울 중랑',
    neis: { atptCode: 'B10', schoolCode: '7021114' },
    scrape: { kind: 'sen-es', host: 'junghwa.sen.es.kr' },
  },
  seoul_jungheung: {
    id: 'seoul_jungheung',
    name: '서울중흥초등학교',
    level: 'elementary',
    region: '서울 중랑',
    neis: { atptCode: 'B10', schoolCode: '7021115' },
    scrape: { kind: 'sen-es', host: 'jung-heung.sen.es.kr' },
  },
};
```

### 7-B/7-C/7-D — 동일 패턴
- probe: `seoul_kunja` (회귀), `seoul_myeonmok`, `seoul_jungnang`, `seoul_yangwonsoop`
- commit: `feat(seoul): Stage 14-23 — 중랑구 24교`

work-log:
```
## Stage 14-23 — 서울 중랑구 24교 (2026-05-03)

Phase E 두 번째 자치구. 23교 sen.es.kr + 1교 (금성초) host kumsung.net → scrape 생략.
```

---

## Stage 14-24 — 성북구 29교

### 8-A — `src/lib/schools/seoul/seongbuk.ts`

```ts
/**
 * 서울 성북구 29교 — Stage 14-24 (2026-05-03), Phase E 세 번째 자치구.
 *
 * 모두 sen.es.kr (사립 광운·대광·매원·성신·우촌 포함). id 충돌 없음.
 * 동신/월곡/장월은 동음 학교 있어 `_sb` suffix.
 */

import type { SchoolConfig } from '../index';

export const SEONGBUK_SCHOOLS: Record<string, SchoolConfig> = {
  kwangwoon_es: {
    id: 'kwangwoon_es',
    name: '광운초등학교',
    level: 'elementary',
    region: '서울 성북',
    neis: { atptCode: 'B10', schoolCode: '7121335' },
    scrape: { kind: 'sen-es', host: 'kwangwoon.sen.es.kr' },
  },
  daegwang_es: {
    id: 'daegwang_es',
    name: '대광초등학교',
    level: 'elementary',
    region: '서울 성북',
    neis: { atptCode: 'B10', schoolCode: '7121336' },
    scrape: { kind: 'sen-es', host: 'daegwang.sen.es.kr' },
  },
  maewon_es: {
    id: 'maewon_es',
    name: '매원초등학교',
    level: 'elementary',
    region: '서울 성북',
    neis: { atptCode: 'B10', schoolCode: '7121337' },
    scrape: { kind: 'sen-es', host: 'maewon.sen.es.kr' },
  },
  seoul_gaewoon: {
    id: 'seoul_gaewoon',
    name: '서울개운초등학교',
    level: 'elementary',
    region: '서울 성북',
    neis: { atptCode: 'B10', schoolCode: '7121298' },
    scrape: { kind: 'sen-es', host: 'gaewoon.sen.es.kr' },
  },
  seoul_gilwon: {
    id: 'seoul_gilwon',
    name: '서울길원초등학교',
    level: 'elementary',
    region: '서울 성북',
    neis: { atptCode: 'B10', schoolCode: '7121299' },
    scrape: { kind: 'sen-es', host: 'gilwon.sen.es.kr' },
  },
  seoul_gireum: {
    id: 'seoul_gireum',
    name: '서울길음초등학교',
    level: 'elementary',
    region: '서울 성북',
    neis: { atptCode: 'B10', schoolCode: '7121300' },
    scrape: { kind: 'sen-es', host: 'gireum.sen.es.kr' },
  },
  seoul_donam: {
    id: 'seoul_donam',
    name: '서울돈암초등학교',
    level: 'elementary',
    region: '서울 성북',
    neis: { atptCode: 'B10', schoolCode: '7121301' },
    scrape: { kind: 'sen-es', host: 'donam.sen.es.kr' },
  },
  seoul_dongsin_sb: {
    id: 'seoul_dongsin_sb',
    name: '서울동신초등학교',
    level: 'elementary',
    region: '서울 성북',
    neis: { atptCode: 'B10', schoolCode: '7121302' },
    scrape: { kind: 'sen-es', host: 'dongsin.sen.es.kr' },
  },
  seoul_mia: {
    id: 'seoul_mia',
    name: '서울미아초등학교',
    level: 'elementary',
    region: '서울 성북',
    neis: { atptCode: 'B10', schoolCode: '7121303' },
    scrape: { kind: 'sen-es', host: 'mia.sen.es.kr' },
  },
  seoul_samsun: {
    id: 'seoul_samsun',
    name: '서울삼선초등학교',
    level: 'elementary',
    region: '서울 성북',
    neis: { atptCode: 'B10', schoolCode: '7121307' },
    scrape: { kind: 'sen-es', host: 'samsun.sen.es.kr' },
  },
  seoul_sukgye: {
    id: 'seoul_sukgye',
    name: '서울석계초등학교',
    level: 'elementary',
    region: '서울 성북',
    neis: { atptCode: 'B10', schoolCode: '7121309' },
    scrape: { kind: 'sen-es', host: 'sukgye.sen.es.kr' },
  },
  seoul_seokgwan: {
    id: 'seoul_seokgwan',
    name: '서울석관초등학교',
    level: 'elementary',
    region: '서울 성북',
    neis: { atptCode: 'B10', schoolCode: '7121310' },
    scrape: { kind: 'sen-es', host: 'seokgwan.sen.es.kr' },
  },
  seoul_sungbuk: {
    id: 'seoul_sungbuk',
    name: '서울성북초등학교',
    level: 'elementary',
    region: '서울 성북',
    neis: { atptCode: 'B10', schoolCode: '7121311' },
    scrape: { kind: 'sen-es', host: 'sungbuk.sen.es.kr' },
  },
  seoul_soonggok: {
    id: 'seoul_soonggok',
    name: '서울숭곡초등학교',
    level: 'elementary',
    region: '서울 성북',
    neis: { atptCode: 'B10', schoolCode: '7121316' },
    scrape: { kind: 'sen-es', host: 'soonggok.sen.es.kr' },
  },
  seoul_soongduck: {
    id: 'seoul_soongduck',
    name: '서울숭덕초등학교',
    level: 'elementary',
    region: '서울 성북',
    neis: { atptCode: 'B10', schoolCode: '7121317' },
    scrape: { kind: 'sen-es', host: 'soongduck.sen.es.kr' },
  },
  seoul_sungrye: {
    id: 'seoul_sungrye',
    name: '서울숭례초등학교',
    level: 'elementary',
    region: '서울 성북',
    neis: { atptCode: 'B10', schoolCode: '7121318' },
    scrape: { kind: 'sen-es', host: 'sungrye.sen.es.kr' },
  },
  seoul_soongin: {
    id: 'seoul_soongin',
    name: '서울숭인초등학교',
    level: 'elementary',
    region: '서울 성북',
    neis: { atptCode: 'B10', schoolCode: '7121319' },
    scrape: { kind: 'sen-es', host: 'soongin.sen.es.kr' },
  },
  seoul_anam: {
    id: 'seoul_anam',
    name: '서울안암초등학교',
    level: 'elementary',
    region: '서울 성북',
    neis: { atptCode: 'B10', schoolCode: '7121320' },
    scrape: { kind: 'sen-es', host: 'anam.sen.es.kr' },
  },
  seoul_wolgok_sb: {
    id: 'seoul_wolgok_sb',
    name: '서울월곡초등학교',
    level: 'elementary',
    region: '서울 성북',
    neis: { atptCode: 'B10', schoolCode: '7121323' },
    scrape: { kind: 'sen-es', host: 'swg.sen.es.kr' },
  },
  seoul_ilshin: {
    id: 'seoul_ilshin',
    name: '서울일신초등학교',
    level: 'elementary',
    region: '서울 성북',
    neis: { atptCode: 'B10', schoolCode: '7121326' },
    scrape: { kind: 'sen-es', host: 'ilshin.sen.es.kr' },
  },
  seoul_janggok: {
    id: 'seoul_janggok',
    name: '서울장곡초등학교',
    level: 'elementary',
    region: '서울 성북',
    neis: { atptCode: 'B10', schoolCode: '7121327' },
    scrape: { kind: 'sen-es', host: 'janggok.sen.es.kr' },
  },
  seoul_jangwol_sb: {
    id: 'seoul_jangwol_sb',
    name: '서울장월초등학교',
    level: 'elementary',
    region: '서울 성북',
    neis: { atptCode: 'B10', schoolCode: '7121328' },
    scrape: { kind: 'sen-es', host: 'jangwol.sen.es.kr' },
  },
  seoul_jangwi: {
    id: 'seoul_jangwi',
    name: '서울장위초등학교',
    level: 'elementary',
    region: '서울 성북',
    neis: { atptCode: 'B10', schoolCode: '7121329' },
    scrape: { kind: 'sen-es', host: 'jangwicho.sen.es.kr' },
  },
  seoul_jeongdeok: {
    id: 'seoul_jeongdeok',
    name: '서울정덕초등학교',
    level: 'elementary',
    region: '서울 성북',
    neis: { atptCode: 'B10', schoolCode: '7121330' },
    scrape: { kind: 'sen-es', host: 'jeongdeok.sen.es.kr' },
  },
  seoul_jeongneung: {
    id: 'seoul_jeongneung',
    name: '서울정릉초등학교',
    level: 'elementary',
    region: '서울 성북',
    neis: { atptCode: 'B10', schoolCode: '7121331' },
    scrape: { kind: 'sen-es', host: 'jeongneung.sen.es.kr' },
  },
  seoul_jungsu: {
    id: 'seoul_jungsu',
    name: '서울정수초등학교',
    level: 'elementary',
    region: '서울 성북',
    neis: { atptCode: 'B10', schoolCode: '7121332' },
    scrape: { kind: 'sen-es', host: 'jungsu.sen.es.kr' },
  },
  seoul_cheongdeok: {
    id: 'seoul_cheongdeok',
    name: '서울청덕초등학교',
    level: 'elementary',
    region: '서울 성북',
    neis: { atptCode: 'B10', schoolCode: '7121333' },
    scrape: { kind: 'sen-es', host: 'cheongdeok.sen.es.kr' },
  },
  sungshin_es: {
    id: 'sungshin_es',
    name: '성신초등학교',
    level: 'elementary',
    region: '서울 성북',
    neis: { atptCode: 'B10', schoolCode: '7121338' },
    scrape: { kind: 'sen-es', host: 'sungshin.sen.es.kr' },
  },
  uchon_es: {
    id: 'uchon_es',
    name: '우촌초등학교',
    level: 'elementary',
    region: '서울 성북',
    neis: { atptCode: 'B10', schoolCode: '7121340' },
    scrape: { kind: 'sen-es', host: 'uchon.sen.es.kr' },
  },
};
```

### 8-B/8-C/8-D — 동일 패턴
- probe: `seoul_dongwon` (회귀), `seoul_jeongneung`, `seoul_anam`, `kwangwoon_es`
- commit: `feat(seoul): Stage 14-24 — 성북구 29교`

work-log:
```
## Stage 14-24 — 서울 성북구 29교 (2026-05-03)

Phase E 세 번째 자치구. 모두 sen.es.kr (사립 광운·대광·매원·성신·우촌 5교 포함).
동신/월곡/장월은 동음 학교 있어 `_sb` suffix.
```

---

## Stage 14-25 — 강북구 14교 (서울 25구 완료)

### 9-A — `src/lib/schools/seoul/gangbuk.ts`

**중요**: 영훈초 host = `www.younghoon.es.kr` → `scrape` 생략.

```ts
/**
 * 서울 강북구 14교 — Stage 14-25 (2026-05-03), Phase E 마지막 자치구.
 *
 * 13교 sen.es.kr + 1교 (영훈초 사립) host younghoon.es.kr → scrape 생략.
 *
 * 본 stage 완료 = 서울 25개 자치구 전체 등록 완료.
 */

import type { SchoolConfig } from '../index';

export const GANGBUK_SCHOOLS: Record<string, SchoolConfig> = {
  seoul_miyang: {
    id: 'seoul_miyang',
    name: '서울미양초등학교',
    level: 'elementary',
    region: '서울 강북',
    neis: { atptCode: 'B10', schoolCode: '7121304' },
    scrape: { kind: 'sen-es', host: 'mi-yang.sen.es.kr' },
  },
  seoul_beondong: {
    id: 'seoul_beondong',
    name: '서울번동초등학교',
    level: 'elementary',
    region: '서울 강북',
    neis: { atptCode: 'B10', schoolCode: '7121305' },
    scrape: { kind: 'sen-es', host: 'beondong.sen.es.kr' },
  },
  seoul_samgaksan: {
    id: 'seoul_samgaksan',
    name: '서울삼각산초등학교',
    level: 'elementary',
    region: '서울 강북',
    neis: { atptCode: 'B10', schoolCode: '7121306' },
    scrape: { kind: 'sen-es', host: 'samgaksan.sen.es.kr' },
  },
  seoul_samyang: {
    id: 'seoul_samyang',
    name: '서울삼양초등학교',
    level: 'elementary',
    region: '서울 강북',
    neis: { atptCode: 'B10', schoolCode: '7121308' },
    scrape: { kind: 'sen-es', host: 'samyang.sen.es.kr' },
  },
  seoul_songjoong: {
    id: 'seoul_songjoong',
    name: '서울송중초등학교',
    level: 'elementary',
    region: '서울 강북',
    neis: { atptCode: 'B10', schoolCode: '7121312' },
    scrape: { kind: 'sen-es', host: 'songjoong.sen.es.kr' },
  },
  seoul_songcheon: {
    id: 'seoul_songcheon',
    name: '서울송천초등학교',
    level: 'elementary',
    region: '서울 강북',
    neis: { atptCode: 'B10', schoolCode: '7121313' },
    scrape: { kind: 'sen-es', host: 'song-cheon.sen.es.kr' },
  },
  seoul_soosong: {
    id: 'seoul_soosong',
    name: '서울수송초등학교',
    level: 'elementary',
    region: '서울 강북',
    neis: { atptCode: 'B10', schoolCode: '7121314' },
    scrape: { kind: 'sen-es', host: 'soosong.sen.es.kr' },
  },
  seoul_suyu: {
    id: 'seoul_suyu',
    name: '서울수유초등학교',
    level: 'elementary',
    region: '서울 강북',
    neis: { atptCode: 'B10', schoolCode: '7121315' },
    scrape: { kind: 'sen-es', host: 'suyu.sen.es.kr' },
  },
  seoul_ohhyun: {
    id: 'seoul_ohhyun',
    name: '서울오현초등학교',
    level: 'elementary',
    region: '서울 강북',
    neis: { atptCode: 'B10', schoolCode: '7121321' },
    scrape: { kind: 'sen-es', host: 'ohhyun.sen.es.kr' },
  },
  seoul_wooi: {
    id: 'seoul_wooi',
    name: '서울우이초등학교',
    level: 'elementary',
    region: '서울 강북',
    neis: { atptCode: 'B10', schoolCode: '7121322' },
    scrape: { kind: 'sen-es', host: 'wooi.sen.es.kr' },
  },
  seoul_youhyeon: {
    id: 'seoul_youhyeon',
    name: '서울유현초등학교',
    level: 'elementary',
    region: '서울 강북',
    neis: { atptCode: 'B10', schoolCode: '7121324' },
    scrape: { kind: 'sen-es', host: 'youhyeon.sen.es.kr' },
  },
  seoul_insu: {
    id: 'seoul_insu',
    name: '서울인수초등학교',
    level: 'elementary',
    region: '서울 강북',
    neis: { atptCode: 'B10', schoolCode: '7121325' },
    scrape: { kind: 'sen-es', host: 'insu.sen.es.kr' },
  },
  seoul_hwagye: {
    id: 'seoul_hwagye',
    name: '서울화계초등학교',
    level: 'elementary',
    region: '서울 강북',
    neis: { atptCode: 'B10', schoolCode: '7121334' },
    scrape: { kind: 'sen-es', host: 'hwagye.sen.es.kr' },
  },
  younghoon_es: {
    id: 'younghoon_es',
    name: '영훈초등학교',
    level: 'elementary',
    region: '서울 강북',
    neis: { atptCode: 'B10', schoolCode: '7121339' },
    // scrape 생략 — host = www.younghoon.es.kr (사립). NEIS 메뉴만.
  },
};
```

### 9-B/9-C — 빌드 + dev probe

```powershell
npm run build 2>&1 | Select-Object -Last 20
curl.exe -s "http://localhost:3000/api/meal/photo?schoolId=seoul_gaewoon&ymd=20260428"
curl.exe -s "http://localhost:3000/api/meal/photo?schoolId=seoul_samyang&ymd=20260428"
curl.exe -s "http://localhost:3000/api/meal/photo?schoolId=seoul_suyu&ymd=20260428"
curl.exe -s "http://localhost:3000/api/meal/photo?schoolId=seoul_insu&ymd=20260428"
```

probe 정상이면 status 재생성 (서울 25구 전체 + 경기 4도시 = 685교):

```powershell
node scripts/generate-school-status.mjs --ymd 20260428 > docs/school-status.md
```

685교 × probeMonth — **40~60분** 소요 추정. 끝나면 헤더 검증:
- 등록 **685교**
- 전체 자치구 (경기 4 + 서울 25)
- 사진 가능 ~95% 추정

### 9-D — work-log Phase D+E 완료 항목 + commit + push

work-log:
```
## Stage 14-25 — 서울 강북구 14교 (2026-05-03, 서울 25구 완료)

Phase E 마지막 자치구. 13교 sen.es.kr + 1교 (영훈초) host younghoon.es.kr → scrape 생략.

## Phase D+E 완료 + 서울 25구 전체 완료 (2026-05-03)

Phase D: 용산·종로·중구·성동·광진 5구 82교
Phase E: 동대문·중랑·성북·강북 4구 88교
Phase D+E 합계: 9구 170교

서울 25구 전체 등록 완료. 누적 685교 (경기 4도시 75 + 서울 25구 610).
사진 가능 비율 ~95% 추정.

다음 = main 머지 검토 (사용자 정책상 서울 다 끝난 뒤).
```

```powershell
git add src/lib/schools/seoul/gangbuk.ts src/lib/schools/index.ts docs/work-log.md docs/school-status.md
git commit -m "feat(seoul): Stage 14-25 — 강북구 14교 (서울 25구 완료)"
git push origin dev
```

---

## Step 4 — 사용자에게 종합 보고

9구 + status 끝난 뒤:

1. ✅ Stage 14-17~14-25 (용산·종로·중구·성동·광진·동대문·중랑·성북·강북) — Phase D+E 완료
2. **서울 25구 전체 등록 완료** + 경기 4도시 = 누적 685교
3. 사진 가능 비율 (status 결과)
4. 자치구별 ⬜ 학교 list (사용자 후속 일괄 확인)
5. ➖ 학교 list (scrape 의도적 생략 — 사립 도메인 7교)
6. push 완료, commit hash 9개

---

## 절대 하지 말 것

- 9구 host 새로 추출 (이미 dev-pc 에서 끝)
- id 작명 규칙 재해석 (본 runbook 그대로)
- 5교 (리라/한양/경복/금성/영훈) scrape 추가 (의도적 생략)
- main 브랜치로 머지
- 14-N 사이에 status 갱신 (마지막 14-25 끝에만 한 번)
- non-sen.es 도메인을 새로 발견 시 본 stage 안에서 처리 — 즉시 멈추고 보고
