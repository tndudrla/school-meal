# Runbook — Stage 14-5/14-6/14-7 송파·강동·금천 (Phase A 마무리)

> 수집서버PC Cursor Claude Code 가 받아 sequential 실행할 지시서.
> 노트북에서 host 추출·충돌 분석 끝낸 상태 (2026-05-02). 본 runbook 은
> **list 그대로 등록만** 시키는 형태 — 새로 host 추출하거나 작명 규칙
> 다시 적용하지 말 것.

## 전제

- 작업 브랜치: `dev`
- 작업 디렉터리: `C:\Users\admin\workspace\school-meal`
- dev 서버: 별도 PowerShell 탭에서 `npm run dev` 떠 있어야 함
- 환경변수: `.env.local` 셋업 완료
- 본 stage 가 끝날 때까지 노트북(다른 환경) 은 schools/·docs/work-log.md·docs/school-status.md 손대지 않기로 합의 (단 docs/school-status.md 는 노트북에서 14-4 사용자 확인 사유 추가분 commit 후 동기화 — `git pull origin dev` 먼저 한 번 해야)

## 작업 단위

서울 송파구 41교 + 강동구 29교 + 금천구 18교 = **합계 88교**.
모두 sen.es.kr, 사립 0교, id 충돌 없음 확인 완료.

3개 stage = 3번의 "파일 작성 → 빌드 → probe → commit → push" 사이클.
**status 갱신은 마지막 stage (14-7) 끝에 단 한 번만** — 88교 전부 등록 후 한꺼번에.

---

## Step 0 — 시작 전 동기화

```powershell
git pull origin dev
git log -1 --oneline
```

기대: 노트북이 14-4 사용자 확인 사유 추가 commit 한 게 있을 수 있음 (commit 메시지에 `verified reasons` 등). 그게 없으면 (= 노트북이 아직 push 안 함) 그냥 진행.

---

## Stage 14-5 — 송파구 41교

### Step 1-A — 새 파일 작성: `src/lib/schools/seoul/songpa.ts`

```ts
/**
 * 서울 송파구 41교 — Stage 14-5 (2026-05-02), Phase A 네 번째 자치구.
 *
 * 모두 sen.es.kr 패턴. 사립 0교. id 충돌 없음.
 * id 와 subdomain 다른 케이스 다수 (s-namcheon, smacheon, s-mh, sbangsan,
 * seoulbeodle, sree, ssj, sh, stosung 등 — `s-` 또는 `s` prefix strip).
 */

import type { SchoolConfig } from '../index';

export const SONGPA_SCHOOLS: Record<string, SchoolConfig> = {
  seoul_gadong: {
    id: 'seoul_gadong',
    name: '서울가동초등학교',
    level: 'elementary',
    region: '서울 송파',
    neis: { atptCode: 'B10', schoolCode: '7130101' },
    scrape: { kind: 'sen-es', host: 'gadong.sen.es.kr' },
  },
  seoul_garak: {
    id: 'seoul_garak',
    name: '서울가락초등학교',
    level: 'elementary',
    region: '서울 송파',
    neis: { atptCode: 'B10', schoolCode: '7130102' },
    scrape: { kind: 'sen-es', host: 'garak.sen.es.kr' },
  },
  seoul_gawon: {
    id: 'seoul_gawon',
    name: '서울가원초등학교',
    level: 'elementary',
    region: '서울 송파',
    neis: { atptCode: 'B10', schoolCode: '7130103' },
    scrape: { kind: 'sen-es', host: 'gawon.sen.es.kr' },
  },
  seoul_gaju: {
    id: 'seoul_gaju',
    name: '서울가주초등학교',
    level: 'elementary',
    region: '서울 송파',
    neis: { atptCode: 'B10', schoolCode: '7130104' },
    scrape: { kind: 'sen-es', host: 'gaju.sen.es.kr' },
  },
  seoul_gaerong: {
    id: 'seoul_gaerong',
    name: '서울개롱초등학교',
    level: 'elementary',
    region: '서울 송파',
    neis: { atptCode: 'B10', schoolCode: '7130109' },
    scrape: { kind: 'sen-es', host: 'gaerong.sen.es.kr' },
  },
  seoul_geoyeo: {
    id: 'seoul_geoyeo',
    name: '서울거여초등학교',
    level: 'elementary',
    region: '서울 송파',
    neis: { atptCode: 'B10', schoolCode: '7130110' },
    scrape: { kind: 'sen-es', host: 'geo-yeo.sen.es.kr' },
  },
  seoul_geowon: {
    id: 'seoul_geowon',
    name: '서울거원초등학교',
    level: 'elementary',
    region: '서울 송파',
    neis: { atptCode: 'B10', schoolCode: '7130111' },
    scrape: { kind: 'sen-es', host: 'guhwon.sen.es.kr' },
  },
  seoul_namcheon: {
    id: 'seoul_namcheon',
    name: '서울남천초등학교',
    level: 'elementary',
    region: '서울 송파',
    neis: { atptCode: 'B10', schoolCode: '7130116' },
    scrape: { kind: 'sen-es', host: 's-namcheon.sen.es.kr' },
  },
  seoul_macheon: {
    id: 'seoul_macheon',
    name: '서울마천초등학교',
    level: 'elementary',
    region: '서울 송파',
    neis: { atptCode: 'B10', schoolCode: '7130119' },
    scrape: { kind: 'sen-es', host: 'smacheon.sen.es.kr' },
  },
  seoul_moondeok: {
    id: 'seoul_moondeok',
    name: '서울문덕초등학교',
    level: 'elementary',
    region: '서울 송파',
    neis: { atptCode: 'B10', schoolCode: '7130124' },
    scrape: { kind: 'sen-es', host: 'moondeok.sen.es.kr' },
  },
  seoul_moonjung: {
    id: 'seoul_moonjung',
    name: '서울문정초등학교',
    level: 'elementary',
    region: '서울 송파',
    neis: { atptCode: 'B10', schoolCode: '7130125' },
    scrape: { kind: 'sen-es', host: 'moonjung.sen.es.kr' },
  },
  seoul_moonhyeon: {
    id: 'seoul_moonhyeon',
    name: '서울문현초등학교',
    level: 'elementary',
    region: '서울 송파',
    neis: { atptCode: 'B10', schoolCode: '7130126' },
    scrape: { kind: 'sen-es', host: 's-mh.sen.es.kr' },
  },
  seoul_bangsan: {
    id: 'seoul_bangsan',
    name: '서울방산초등학교',
    level: 'elementary',
    region: '서울 송파',
    neis: { atptCode: 'B10', schoolCode: '7130127' },
    scrape: { kind: 'sen-es', host: 'sbangsan.sen.es.kr' },
  },
  seoul_bangi: {
    id: 'seoul_bangi',
    name: '서울방이초등학교',
    level: 'elementary',
    region: '서울 송파',
    neis: { atptCode: 'B10', schoolCode: '7130128' },
    scrape: { kind: 'sen-es', host: 'bangi.sen.es.kr' },
  },
  seoul_beodle: {
    id: 'seoul_beodle',
    name: '서울버들초등학교',
    level: 'elementary',
    region: '서울 송파',
    neis: { atptCode: 'B10', schoolCode: '7130129' },
    scrape: { kind: 'sen-es', host: 'seoulbeodle.sen.es.kr' },
  },
  seoul_samjeon: {
    id: 'seoul_samjeon',
    name: '서울삼전초등학교',
    level: 'elementary',
    region: '서울 송파',
    neis: { atptCode: 'B10', schoolCode: '7130130' },
    scrape: { kind: 'sen-es', host: 'samjeon.sen.es.kr' },
  },
  seoul_seokchon: {
    id: 'seoul_seokchon',
    name: '서울석촌초등학교',
    level: 'elementary',
    region: '서울 송파',
    neis: { atptCode: 'B10', schoolCode: '7130132' },
    scrape: { kind: 'sen-es', host: 'seokchon.sen.es.kr' },
  },
  seoul_seryun: {
    id: 'seoul_seryun',
    name: '서울세륜초등학교',
    level: 'elementary',
    region: '서울 송파',
    neis: { atptCode: 'B10', schoolCode: '7130137' },
    scrape: { kind: 'sen-es', host: 'seryun.sen.es.kr' },
  },
  seoul_songrye: {
    id: 'seoul_songrye',
    name: '서울송례초등학교',
    level: 'elementary',
    region: '서울 송파',
    neis: { atptCode: 'B10', schoolCode: '7130138' },
    scrape: { kind: 'sen-es', host: 'sree.sen.es.kr' },
  },
  seoul_songjeon: {
    id: 'seoul_songjeon',
    name: '서울송전초등학교',
    level: 'elementary',
    region: '서울 송파',
    neis: { atptCode: 'B10', schoolCode: '7130139' },
    scrape: { kind: 'sen-es', host: 'ssj.sen.es.kr' },
  },
  seoul_songpa: {
    id: 'seoul_songpa',
    name: '서울송파초등학교',
    level: 'elementary',
    region: '서울 송파',
    neis: { atptCode: 'B10', schoolCode: '7130140' },
    scrape: { kind: 'sen-es', host: 'songpa.sen.es.kr' },
  },
  seoul_singa: {
    id: 'seoul_singa',
    name: '서울신가초등학교',
    level: 'elementary',
    region: '서울 송파',
    neis: { atptCode: 'B10', schoolCode: '7130141' },
    scrape: { kind: 'sen-es', host: 'singa.sen.es.kr' },
  },
  seoul_sincheon: {
    id: 'seoul_sincheon',
    name: '서울신천초등학교',
    level: 'elementary',
    region: '서울 송파',
    neis: { atptCode: 'B10', schoolCode: '7130144' },
    scrape: { kind: 'sen-es', host: 'sh.sen.es.kr' },
  },
  seoul_aju: {
    id: 'seoul_aju',
    name: '서울아주초등학교',
    level: 'elementary',
    region: '서울 송파',
    neis: { atptCode: 'B10', schoolCode: '7130145' },
    scrape: { kind: 'sen-es', host: 'aju.sen.es.kr' },
  },
  seoul_youngpung: {
    id: 'seoul_youngpung',
    name: '서울영풍초등학교',
    level: 'elementary',
    region: '서울 송파',
    neis: { atptCode: 'B10', schoolCode: '7130146' },
    scrape: { kind: 'sen-es', host: 'youngpung.sen.es.kr' },
  },
  seoul_ogum: {
    id: 'seoul_ogum',
    name: '서울오금초등학교',
    level: 'elementary',
    region: '서울 송파',
    neis: { atptCode: 'B10', schoolCode: '7130147' },
    scrape: { kind: 'sen-es', host: 'ogum.sen.es.kr' },
  },
  seoul_oryun: {
    id: 'seoul_oryun',
    name: '서울오륜초등학교',
    level: 'elementary',
    region: '서울 송파',
    neis: { atptCode: 'B10', schoolCode: '7130148' },
    scrape: { kind: 'sen-es', host: 'oryun.sen.es.kr' },
  },
  seoul_westar: {
    id: 'seoul_westar',
    name: '서울위례별초등학교',
    level: 'elementary',
    region: '서울 송파',
    neis: { atptCode: 'B10', schoolCode: '7130245' },
    scrape: { kind: 'sen-es', host: 'westar.sen.es.kr' },
  },
  seoul_wiryesol: {
    id: 'seoul_wiryesol',
    name: '서울위례솔초등학교',
    level: 'elementary',
    region: '서울 송파',
    neis: { atptCode: 'B10', schoolCode: '7130270' },
    scrape: { kind: 'sen-es', host: 'wiryesol.sen.es.kr' },
  },
  seoul_jamdong: {
    id: 'seoul_jamdong',
    name: '서울잠동초등학교',
    level: 'elementary',
    region: '서울 송파',
    neis: { atptCode: 'B10', schoolCode: '7130150' },
    scrape: { kind: 'sen-es', host: 'jamdong.sen.es.kr' },
  },
  seoul_jamshin: {
    id: 'seoul_jamshin',
    name: '서울잠신초등학교',
    level: 'elementary',
    region: '서울 송파',
    neis: { atptCode: 'B10', schoolCode: '7130151' },
    scrape: { kind: 'sen-es', host: 'jamshin.sen.es.kr' },
  },
  seoul_jamsil: {
    id: 'seoul_jamsil',
    name: '서울잠실초등학교',
    level: 'elementary',
    region: '서울 송파',
    neis: { atptCode: 'B10', schoolCode: '7130152' },
    scrape: { kind: 'sen-es', host: 'jamsil.sen.es.kr' },
  },
  seoul_jamil: {
    id: 'seoul_jamil',
    name: '서울잠일초등학교',
    level: 'elementary',
    region: '서울 송파',
    neis: { atptCode: 'B10', schoolCode: '7130153' },
    scrape: { kind: 'sen-es', host: 'jamil.sen.es.kr' },
  },
  seoul_jamjeon: {
    id: 'seoul_jamjeon',
    name: '서울잠전초등학교',
    level: 'elementary',
    region: '서울 송파',
    neis: { atptCode: 'B10', schoolCode: '7130154' },
    scrape: { kind: 'sen-es', host: 'jamjeon.sen.es.kr' },
  },
  seoul_jamhyun: {
    id: 'seoul_jamhyun',
    name: '서울잠현초등학교',
    level: 'elementary',
    region: '서울 송파',
    neis: { atptCode: 'B10', schoolCode: '7130155' },
    scrape: { kind: 'sen-es', host: 'jamhyun.sen.es.kr' },
  },
  seoul_joongdae: {
    id: 'seoul_joongdae',
    name: '서울중대초등학교',
    level: 'elementary',
    region: '서울 송파',
    neis: { atptCode: 'B10', schoolCode: '7130156' },
    scrape: { kind: 'sen-es', host: 'joongdae.sen.es.kr' },
  },
  seoul_tosung: {
    id: 'seoul_tosung',
    name: '서울토성초등학교',
    level: 'elementary',
    region: '서울 송파',
    neis: { atptCode: 'B10', schoolCode: '7130160' },
    scrape: { kind: 'sen-es', host: 'stosung.sen.es.kr' },
  },
  seoul_pyunghwa: {
    id: 'seoul_pyunghwa',
    name: '서울평화초등학교',
    level: 'elementary',
    region: '서울 송파',
    neis: { atptCode: 'B10', schoolCode: '7130161' },
    scrape: { kind: 'sen-es', host: 'pyunghwa.sen.es.kr' },
  },
  seoul_poongnap: {
    id: 'seoul_poongnap',
    name: '서울풍납초등학교',
    level: 'elementary',
    region: '서울 송파',
    neis: { atptCode: 'B10', schoolCode: '7130162' },
    scrape: { kind: 'sen-es', host: 'poongnap.sen.es.kr' },
  },
  seoul_poongsung: {
    id: 'seoul_poongsung',
    name: '서울풍성초등학교',
    level: 'elementary',
    region: '서울 송파',
    neis: { atptCode: 'B10', schoolCode: '7130163' },
    scrape: { kind: 'sen-es', host: 'poongsung.sen.es.kr' },
  },
  seoul_haenuri: {
    id: 'seoul_haenuri',
    name: '서울해누리초등학교',
    level: 'elementary',
    region: '서울 송파',
    neis: { atptCode: 'B10', schoolCode: '7130255' },
    scrape: { kind: 'sen-es', host: 'haenuri.sen.es.kr' },
  },
};
```

### Step 1-B — `src/lib/schools/index.ts` 갱신

- import 블록에 `import { SONGPA_SCHOOLS } from './seoul/songpa';` 추가
- SCHOOLS 객체에 `...SONGPA_SCHOOLS,` 추가
- 디렉터리 구조 주석에 `seoul/songpa.ts — 서울 송파구 41교 (Stage 14-5)` 한 줄 추가

### Step 1-C — 빌드 + dev probe

```powershell
npm run build 2>&1 | Select-Object -Last 20
```

`✓ Compiled successfully` 확인 후:

```powershell
curl.exe -s "http://localhost:3000/api/meal/photo?schoolId=chonggye&ymd=20260428"
curl.exe -s "http://localhost:3000/api/meal/photo?schoolId=seoul_gaepo&ymd=20260428"   # 14-4 회귀
curl.exe -s "http://localhost:3000/api/meal/photo?schoolId=seoul_jamsil&ymd=20260428"  # 신규 송파
curl.exe -s "http://localhost:3000/api/meal/photo?schoolId=seoul_songpa&ymd=20260428"  # 신규 송파
curl.exe -s "http://localhost:3000/api/meal/photo?schoolId=seoul_garak&ymd=20260428"   # 신규 송파
```

각 JSON 응답 정상이면 다음 step. 5xx 또는 HTML 에러 시 즉시 멈추고 보고.

### Step 1-D — work-log + commit + push

`docs/work-log.md` 마지막 항목 다음에 추가:

```
## Stage 14-5 — 서울 송파구 41교 (2026-05-02)

Phase A 네 번째 자치구. 모두 sen.es.kr, 사립 0교, id 충돌 없음.
host subdomain 의 `s-` / `s` prefix strip 케이스 다수 (s-namcheon→seoul_namcheon,
smacheon→seoul_macheon, s-mh→seoul_moonhyeon, sbangsan→seoul_bangsan,
seoulbeodle→seoul_beodle, sree→seoul_songrye, ssj→seoul_songjeon,
sh→seoul_sincheon, stosung→seoul_tosung).

수집서버PC Claude Code 가 통합 runbook (docs/runbook-stage14-phaseA-rest.md)
받아 sequential 실행 첫 stage.
```

```powershell
git add src/lib/schools/seoul/songpa.ts src/lib/schools/index.ts docs/work-log.md
git commit -m "feat(seoul): Stage 14-5 — 송파구 41교"
git push origin dev
```

---

## Stage 14-6 — 강동구 29교

### Step 2-A — 새 파일 작성: `src/lib/schools/seoul/gangdong.ts`

```ts
/**
 * 서울 강동구 29교 — Stage 14-6 (2026-05-02), Phase A 다섯 번째 자치구.
 *
 * 모두 sen.es.kr 패턴. 사립 0교. id 충돌 없음.
 * id 와 subdomain 다른 케이스 다수 (gme, gbe, scd 등 약칭).
 */

import type { SchoolConfig } from '../index';

export const GANGDONG_SCHOOLS: Record<string, SchoolConfig> = {
  seoul_gangdeok: {
    id: 'seoul_gangdeok',
    name: '서울강덕초등학교',
    level: 'elementary',
    region: '서울 강동',
    neis: { atptCode: 'B10', schoolCode: '7130105' },
    scrape: { kind: 'sen-es', host: 'gangdeok.sen.es.kr' },
  },
  seoul_gangdong: {
    id: 'seoul_gangdong',
    name: '서울강동초등학교',
    level: 'elementary',
    region: '서울 강동',
    neis: { atptCode: 'B10', schoolCode: '7130106' },
    scrape: { kind: 'sen-es', host: 'gangdong.sen.es.kr' },
  },
  seoul_gangmyeong: {
    id: 'seoul_gangmyeong',
    name: '서울강명초등학교',
    level: 'elementary',
    region: '서울 강동',
    neis: { atptCode: 'B10', schoolCode: '7130107' },
    scrape: { kind: 'sen-es', host: 'gme.sen.es.kr' },
  },
  seoul_gangbit: {
    id: 'seoul_gangbit',
    name: '서울강빛초등학교',
    level: 'elementary',
    region: '서울 강동',
    neis: { atptCode: 'B10', schoolCode: '7130266' },
    scrape: { kind: 'sen-es', host: 'gbe.sen.es.kr' },
  },
  seoul_gangsol: {
    id: 'seoul_gangsol',
    name: '서울강솔초등학교',
    level: 'elementary',
    region: '서울 강동',
    neis: { atptCode: 'B10', schoolCode: '7130251' },
    scrape: { kind: 'sen-es', host: 'gangsol.sen.es.kr' },
  },
  seoul_gangil: {
    id: 'seoul_gangil',
    name: '서울강일초등학교',
    level: 'elementary',
    region: '서울 강동',
    neis: { atptCode: 'B10', schoolCode: '7130108' },
    scrape: { kind: 'sen-es', host: 'gangil.sen.es.kr' },
  },
  seoul_goduk: {
    id: 'seoul_goduk',
    name: '서울고덕초등학교',
    level: 'elementary',
    region: '서울 강동',
    neis: { atptCode: 'B10', schoolCode: '7130112' },
    scrape: { kind: 'sen-es', host: 'goduk.sen.es.kr' },
  },
  seoul_gomyung: {
    id: 'seoul_gomyung',
    name: '서울고명초등학교',
    level: 'elementary',
    region: '서울 강동',
    neis: { atptCode: 'B10', schoolCode: '7130113' },
    scrape: { kind: 'sen-es', host: 'gomyung.sen.es.kr' },
  },
  seoul_goil: {
    id: 'seoul_goil',
    name: '서울고일초등학교',
    level: 'elementary',
    region: '서울 강동',
    neis: { atptCode: 'B10', schoolCode: '7130114' },
    scrape: { kind: 'sen-es', host: 'goil.sen.es.kr' },
  },
  seoul_gohyeon: {
    id: 'seoul_gohyeon',
    name: '서울고현초등학교',
    level: 'elementary',
    region: '서울 강동',
    neis: { atptCode: 'B10', schoolCode: '7130264' },
    scrape: { kind: 'sen-es', host: 'gohyeon.sen.es.kr' },
  },
  seoul_gildong: {
    id: 'seoul_gildong',
    name: '서울길동초등학교',
    level: 'elementary',
    region: '서울 강동',
    neis: { atptCode: 'B10', schoolCode: '7130115' },
    scrape: { kind: 'sen-es', host: 'gildong.sen.es.kr' },
  },
  seoul_daemyeong: {
    id: 'seoul_daemyeong',
    name: '서울대명초등학교',
    level: 'elementary',
    region: '서울 강동',
    neis: { atptCode: 'B10', schoolCode: '7130117' },
    scrape: { kind: 'sen-es', host: 'daemyeong.sen.es.kr' },
  },
  seoul_doonchon: {
    id: 'seoul_doonchon',
    name: '서울둔촌초등학교',
    level: 'elementary',
    region: '서울 강동',
    neis: { atptCode: 'B10', schoolCode: '7130118' },
    scrape: { kind: 'sen-es', host: 'doonchon.sen.es.kr' },
  },
  seoul_myungduk: {
    id: 'seoul_myungduk',
    name: '서울명덕초등학교',
    level: 'elementary',
    region: '서울 강동',
    neis: { atptCode: 'B10', schoolCode: '7130120' },
    scrape: { kind: 'sen-es', host: 'myungduk.sen.es.kr' },
  },
  seoul_myongwon: {
    id: 'seoul_myongwon',
    name: '서울명원초등학교',
    level: 'elementary',
    region: '서울 강동',
    neis: { atptCode: 'B10', schoolCode: '7130121' },
    scrape: { kind: 'sen-es', host: 'myongwon.sen.es.kr' },
  },
  seoul_myeongil: {
    id: 'seoul_myeongil',
    name: '서울명일초등학교',
    level: 'elementary',
    region: '서울 강동',
    neis: { atptCode: 'B10', schoolCode: '7130122' },
    scrape: { kind: 'sen-es', host: 'myeongil.sen.es.kr' },
  },
  seoul_myogok: {
    id: 'seoul_myogok',
    name: '서울묘곡초등학교',
    level: 'elementary',
    region: '서울 강동',
    neis: { atptCode: 'B10', schoolCode: '7130123' },
    scrape: { kind: 'sen-es', host: 'myogok.sen.es.kr' },
  },
  seoul_sangil: {
    id: 'seoul_sangil',
    name: '서울상일초등학교',
    level: 'elementary',
    region: '서울 강동',
    neis: { atptCode: 'B10', schoolCode: '7130131' },
    scrape: { kind: 'sen-es', host: 'seoulsangil.sen.es.kr' },
  },
  seoul_sunrin: {
    id: 'seoul_sunrin',
    name: '서울선린초등학교',
    level: 'elementary',
    region: '서울 강동',
    neis: { atptCode: 'B10', schoolCode: '7130133' },
    scrape: { kind: 'sen-es', host: 'sunrin.sen.es.kr' },
  },
  seoul_sunsa: {
    id: 'seoul_sunsa',
    name: '서울선사초등학교',
    level: 'elementary',
    region: '서울 강동',
    neis: { atptCode: 'B10', schoolCode: '7130134' },
    scrape: { kind: 'sen-es', host: 'sunsa.sen.es.kr' },
  },
  seoul_seongnae: {
    id: 'seoul_seongnae',
    name: '서울성내초등학교',
    level: 'elementary',
    region: '서울 강동',
    neis: { atptCode: 'B10', schoolCode: '7130135' },
    scrape: { kind: 'sen-es', host: 'seongnae.sen.es.kr' },
  },
  seoul_seongil: {
    id: 'seoul_seongil',
    name: '서울성일초등학교',
    level: 'elementary',
    region: '서울 강동',
    neis: { atptCode: 'B10', schoolCode: '7130136' },
    scrape: { kind: 'sen-es', host: 'seongil.sen.es.kr' },
  },
  seoul_shinmyung: {
    id: 'seoul_shinmyung',
    name: '서울신명초등학교',
    level: 'elementary',
    region: '서울 강동',
    neis: { atptCode: 'B10', schoolCode: '7130142' },
    scrape: { kind: 'sen-es', host: 'shinmyung.sen.es.kr' },
  },
  seoul_shinam: {
    id: 'seoul_shinam',
    name: '서울신암초등학교',
    level: 'elementary',
    region: '서울 강동',
    neis: { atptCode: 'B10', schoolCode: '7130143' },
    scrape: { kind: 'sen-es', host: 'shinam.sen.es.kr' },
  },
  seoul_wirye: {
    id: 'seoul_wirye',
    name: '서울위례초등학교',
    level: 'elementary',
    region: '서울 강동',
    neis: { atptCode: 'B10', schoolCode: '7130149' },
    scrape: { kind: 'sen-es', host: 'wirye.sen.es.kr' },
  },
  seoul_cheondong: {
    id: 'seoul_cheondong',
    name: '서울천동초등학교',
    level: 'elementary',
    region: '서울 강동',
    neis: { atptCode: 'B10', schoolCode: '7130157' },
    scrape: { kind: 'sen-es', host: 'scd.sen.es.kr' },
  },
  seoul_chunil: {
    id: 'seoul_chunil',
    name: '서울천일초등학교',
    level: 'elementary',
    region: '서울 강동',
    neis: { atptCode: 'B10', schoolCode: '7130158' },
    scrape: { kind: 'sen-es', host: 'chunil.sen.es.kr' },
  },
  seoul_chunho: {
    id: 'seoul_chunho',
    name: '서울천호초등학교',
    level: 'elementary',
    region: '서울 강동',
    neis: { atptCode: 'B10', schoolCode: '7130159' },
    scrape: { kind: 'sen-es', host: 'chunho.sen.es.kr' },
  },
  seoul_hansan: {
    id: 'seoul_hansan',
    name: '서울한산초등학교',
    level: 'elementary',
    region: '서울 강동',
    neis: { atptCode: 'B10', schoolCode: '7130164' },
    scrape: { kind: 'sen-es', host: 'hansan.sen.es.kr' },
  },
};
```

### Step 2-B — index.ts 갱신
- `import { GANGDONG_SCHOOLS } from './seoul/gangdong';`
- `...GANGDONG_SCHOOLS,`
- 주석에 `seoul/gangdong.ts — 서울 강동구 29교 (Stage 14-6)`

### Step 2-C — 빌드 + dev probe

```powershell
npm run build 2>&1 | Select-Object -Last 20
curl.exe -s "http://localhost:3000/api/meal/photo?schoolId=seoul_jamsil&ymd=20260428"     # 14-5 회귀
curl.exe -s "http://localhost:3000/api/meal/photo?schoolId=seoul_doonchon&ymd=20260428"   # 신규 강동
curl.exe -s "http://localhost:3000/api/meal/photo?schoolId=seoul_chunho&ymd=20260428"     # 신규 강동
curl.exe -s "http://localhost:3000/api/meal/photo?schoolId=seoul_gangdong&ymd=20260428"   # 신규 강동
```

### Step 2-D — work-log + commit + push

`docs/work-log.md` 추가:

```
## Stage 14-6 — 서울 강동구 29교 (2026-05-02)

Phase A 다섯 번째 자치구. 모두 sen.es.kr, 사립 0교, id 충돌 없음.
약칭 host 다수 (gme→seoul_gangmyeong, gbe→seoul_gangbit,
scd→seoul_cheondong).
```

```powershell
git add src/lib/schools/seoul/gangdong.ts src/lib/schools/index.ts docs/work-log.md
git commit -m "feat(seoul): Stage 14-6 — 강동구 29교"
git push origin dev
```

---

## Stage 14-7 — 금천구 18교

### Step 3-A — 새 파일 작성: `src/lib/schools/seoul/geumcheon.ts`

```ts
/**
 * 서울 금천구 18교 — Stage 14-7 (2026-05-02), Phase A 마지막 자치구.
 *
 * 모두 sen.es.kr 패턴. 사립 0교. id 충돌 없음.
 * 첫 학교 (donggwang.sen.es.kr) 만 학교명에 "서울" prefix 없음 (동광초등학교) —
 * id 도 prefix 없이 `donggwang`.
 */

import type { SchoolConfig } from '../index';

export const GEUMCHEON_SCHOOLS: Record<string, SchoolConfig> = {
  donggwang: {
    id: 'donggwang',
    name: '동광초등학교',
    level: 'elementary',
    region: '서울 금천',
    neis: { atptCode: 'B10', schoolCode: '7041099' },
    scrape: { kind: 'sen-es', host: 'donggwang.sen.es.kr' },
  },
  seoul_gasan: {
    id: 'seoul_gasan',
    name: '서울가산초등학교',
    level: 'elementary',
    region: '서울 금천',
    neis: { atptCode: 'B10', schoolCode: '7041100' },
    scrape: { kind: 'sen-es', host: 'gasan.sen.es.kr' },
  },
  seoul_geumnarae: {
    id: 'seoul_geumnarae',
    name: '서울금나래초등학교',
    level: 'elementary',
    region: '서울 금천',
    neis: { atptCode: 'B10', schoolCode: '7041260' },
    scrape: { kind: 'sen-es', host: 'geumnarae.sen.es.kr' },
  },
  seoul_geumdong: {
    id: 'seoul_geumdong',
    name: '서울금동초등학교',
    level: 'elementary',
    region: '서울 금천',
    neis: { atptCode: 'B10', schoolCode: '7041110' },
    scrape: { kind: 'sen-es', host: 'geumdong.sen.es.kr' },
  },
  seoul_geumsan: {
    id: 'seoul_geumsan',
    name: '서울금산초등학교',
    level: 'elementary',
    region: '서울 금천',
    neis: { atptCode: 'B10', schoolCode: '7041111' },
    scrape: { kind: 'sen-es', host: 'gumsan.sen.es.kr' },
  },
  seoul_geumcheon: {
    id: 'seoul_geumcheon',
    name: '서울금천초등학교',
    level: 'elementary',
    region: '서울 금천',
    neis: { atptCode: 'B10', schoolCode: '7041112' },
    scrape: { kind: 'sen-es', host: 'kumcheon.sen.es.kr' },
  },
  seoul_doksan: {
    id: 'seoul_doksan',
    name: '서울독산초등학교',
    level: 'elementary',
    region: '서울 금천',
    neis: { atptCode: 'B10', schoolCode: '7041123' },
    scrape: { kind: 'sen-es', host: 'doksan.sen.es.kr' },
  },
  seoul_doosan: {
    id: 'seoul_doosan',
    name: '서울두산초등학교',
    level: 'elementary',
    region: '서울 금천',
    neis: { atptCode: 'B10', schoolCode: '7041125' },
    scrape: { kind: 'sen-es', host: 'doosan.sen.es.kr' },
  },
  seoul_mungyo: {
    id: 'seoul_mungyo',
    name: '서울문교초등학교',
    level: 'elementary',
    region: '서울 금천',
    neis: { atptCode: 'B10', schoolCode: '7041127' },
    scrape: { kind: 'sen-es', host: 'mungyo.sen.es.kr' },
  },
  seoul_munbaek: {
    id: 'seoul_munbaek',
    name: '서울문백초등학교',
    level: 'elementary',
    region: '서울 금천',
    neis: { atptCode: 'B10', schoolCode: '7041129' },
    scrape: { kind: 'sen-es', host: 'munbaek.sen.es.kr' },
  },
  seoul_munsung: {
    id: 'seoul_munsung',
    name: '서울문성초등학교',
    level: 'elementary',
    region: '서울 금천',
    neis: { atptCode: 'B10', schoolCode: '7041130' },
    scrape: { kind: 'sen-es', host: 'munsung.sen.es.kr' },
  },
  seoul_backsan: {
    id: 'seoul_backsan',
    name: '서울백산초등학교',
    level: 'elementary',
    region: '서울 금천',
    neis: { atptCode: 'B10', schoolCode: '7041132' },
    scrape: { kind: 'sen-es', host: 'backsan.sen.es.kr' },
  },
  seoul_siheung: {
    id: 'seoul_siheung',
    name: '서울시흥초등학교',
    level: 'elementary',
    region: '서울 금천',
    neis: { atptCode: 'B10', schoolCode: '7041135' },
    scrape: { kind: 'sen-es', host: 'siheung.sen.es.kr' },
  },
  seoul_sinheung: {
    id: 'seoul_sinheung',
    name: '서울신흥초등학교',
    level: 'elementary',
    region: '서울 금천',
    neis: { atptCode: 'B10', schoolCode: '7041141' },
    scrape: { kind: 'sen-es', host: 'sinheung.sen.es.kr' },
  },
  seoul_ancheon: {
    id: 'seoul_ancheon',
    name: '서울안천초등학교',
    level: 'elementary',
    region: '서울 금천',
    neis: { atptCode: 'B10', schoolCode: '7041142' },
    scrape: { kind: 'sen-es', host: 'ancheon.sen.es.kr' },
  },
  seoul_yeongnam: {
    id: 'seoul_yeongnam',
    name: '서울영남초등학교',
    level: 'elementary',
    region: '서울 금천',
    neis: { atptCode: 'B10', schoolCode: '7041144' },
    scrape: { kind: 'sen-es', host: 'seoulyeongnam.sen.es.kr' },
  },
  seoul_jungshim: {
    id: 'seoul_jungshim',
    name: '서울정심초등학교',
    level: 'elementary',
    region: '서울 금천',
    neis: { atptCode: 'B10', schoolCode: '7041160' },
    scrape: { kind: 'sen-es', host: 'jungshim.sen.es.kr' },
  },
  seoul_topdong: {
    id: 'seoul_topdong',
    name: '서울탑동초등학교',
    level: 'elementary',
    region: '서울 금천',
    neis: { atptCode: 'B10', schoolCode: '7041161' },
    scrape: { kind: 'sen-es', host: 'topdong.sen.es.kr' },
  },
};
```

### Step 3-B — index.ts 갱신
- `import { GEUMCHEON_SCHOOLS } from './seoul/geumcheon';`
- `...GEUMCHEON_SCHOOLS,`
- 주석에 `seoul/geumcheon.ts — 서울 금천구 18교 (Stage 14-7)`

### Step 3-C — 빌드 + dev probe + status 갱신 (마지막 한 번)

```powershell
npm run build 2>&1 | Select-Object -Last 20
curl.exe -s "http://localhost:3000/api/meal/photo?schoolId=seoul_chunho&ymd=20260428"     # 14-6 회귀
curl.exe -s "http://localhost:3000/api/meal/photo?schoolId=donggwang&ymd=20260428"        # 신규 금천 (서울 prefix 없는 학교)
curl.exe -s "http://localhost:3000/api/meal/photo?schoolId=seoul_geumcheon&ymd=20260428"  # 신규 금천
curl.exe -s "http://localhost:3000/api/meal/photo?schoolId=seoul_doksan&ymd=20260428"     # 신규 금천
```

probe 모두 정상이면 status 재생성:

```powershell
node scripts/generate-school-status.mjs --ymd 20260428 > docs/school-status.md
```

20~30분 소요 (264교 × probeMonth). 끝나면 헤더 검증:
- 등록 264교
- 송파·강동·금천 섹션 추가
- 사진 가능 ~95% 추정

### Step 3-D — work-log + commit + push (Phase A 완료 항목)

`docs/work-log.md` 추가:

```
## Stage 14-7 — 서울 금천구 18교 (2026-05-02)

Phase A 마지막 자치구. 모두 sen.es.kr, 사립 0교, id 충돌 없음.
첫 학교가 서울 prefix 없는 "동광초등학교" — id `donggwang`.

## Phase A 완료 (2026-05-02)

서울 6개 자치구 + 경기 4도시 누적 264교 = 25개 자치구 중 6 / 25.
다음 = Phase B (영등포·구로·양천·강서·노원·도봉) 100여교.
```

```powershell
git add src/lib/schools/seoul/geumcheon.ts src/lib/schools/index.ts docs/work-log.md docs/school-status.md
git commit -m "feat(seoul): Stage 14-7 — 금천구 18교 (Phase A 완료)"
git push origin dev
```

---

## Step 4 — 사용자에게 종합 보고

3구 다 끝난 뒤 다음 메시지:

1. ✅ Stage 14-5 송파 41교 / 14-6 강동 29교 / 14-7 금천 18교 — Phase A 완료
2. 등록 누적: 142 + 88 = 264교
3. 사진 가능 비율 (status 결과)
4. 자치구별 ⬜ 학교 list — 후속 사용자 확인 task
5. 회귀 변동 사항 (없음 / 어떤 학교)
6. push 완료, commit hash 3개

---

## 절대 하지 말 것

- 강남 host 새로 추출 (이미 노트북에서 끝)
- id 작명 규칙 재해석 (본 runbook 그대로)
- main 브랜치로 머지
- schools.ts (구) 파일 만들거나 수정
- non-sen.es 도메인 발견 시 본 stage 안에서 처리 — 즉시 멈추고 보고
- 14-5/14-6 사이에 status 갱신 (마지막 14-7 끝에만 한 번)
