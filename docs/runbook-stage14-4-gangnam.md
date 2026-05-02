# Runbook — Stage 14-4 강남구 (시범 실행, 1구)

> 수집서버PC Cursor 안의 Claude Code 가 받아 실행할 지시서.
> 노트북에서 강남 host 추출·충돌 분석 끝낸 상태 (2026-05-02). 본 runbook 은
> **list 그대로 등록만** 시키는 형태 — 새로 host 추출하거나 작명 규칙
> 다시 적용하지 말 것.

## 전제

- 작업 브랜치: `dev`
- 작업 디렉터리: `C:\Users\admin\workspace\school-meal`
- dev 서버: 별도 PowerShell 탭에서 `npm run dev` 떠 있어야 함
  (Step 5 dev probe 호출용. 본 runbook 시작 전에 사용자가 직접 띄움)
- 환경변수: `.env.local` 에 Supabase + NEIS 키 셋업 완료
- 본 stage 가 끝날 때까지 노트북(다른 환경) 은 schools/·docs/work-log·docs/school-status 손대지 않기로 합의

## 작업 단위

서울 강남구 34교 등록. 모두 sen.es.kr, 사립 0교. id 충돌 없음 확인 완료.

## Step 1 — 새 파일 작성: `src/lib/schools/seoul/gangnam.ts`

아래 내용 그대로 작성. **id·name·schoolCode·host 한 글자도 바꾸지 말 것.**

```ts
/**
 * 서울 강남구 34교 — Stage 14-4 (2026-05-02), Phase A 세 번째 자치구.
 *
 * 모두 sen.es.kr 패턴. 사립 0교. id 충돌 없음 (노트북에서 분석 완료).
 * NEIS HMPG_ADRES 일괄 추출값 그대로 (id 와 subdomain 다른 케이스 다수 —
 * seouldaegok·sdaedo·seouldaejin·seouldoseong·srng 등).
 */

import type { SchoolConfig } from '../index';

export const GANGNAM_SCHOOLS: Record<string, SchoolConfig> = {
  seoul_gaewon: {
    id: 'seoul_gaewon',
    name: '서울개원초등학교',
    level: 'elementary',
    region: '서울 강남',
    neis: { atptCode: 'B10', schoolCode: '7091369' },
    scrape: { kind: 'sen-es', host: 'gaewon.sen.es.kr' },
  },
  seoul_gaeil: {
    id: 'seoul_gaeil',
    name: '서울개일초등학교',
    level: 'elementary',
    region: '서울 강남',
    neis: { atptCode: 'B10', schoolCode: '7091370' },
    scrape: { kind: 'sen-es', host: 'gaeil.sen.es.kr' },
  },
  seoul_gaepo: {
    id: 'seoul_gaepo',
    name: '서울개포초등학교',
    level: 'elementary',
    region: '서울 강남',
    neis: { atptCode: 'B10', schoolCode: '7091371' },
    scrape: { kind: 'sen-es', host: 'gaepo.sen.es.kr' },
  },
  seoul_gaehyeon: {
    id: 'seoul_gaehyeon',
    name: '서울개현초등학교',
    level: 'elementary',
    region: '서울 강남',
    neis: { atptCode: 'B10', schoolCode: '7091496' },
    scrape: { kind: 'sen-es', host: 'gaehyeon.sen.es.kr' },
  },
  seoul_kuryong: {
    id: 'seoul_kuryong',
    name: '서울구룡초등학교',
    level: 'elementary',
    region: '서울 강남',
    neis: { atptCode: 'B10', schoolCode: '7091372' },
    scrape: { kind: 'sen-es', host: 'kuryong.sen.es.kr' },
  },
  seoul_nonhyun: {
    id: 'seoul_nonhyun',
    name: '서울논현초등학교',
    level: 'elementary',
    region: '서울 강남',
    neis: { atptCode: 'B10', schoolCode: '7091373' },
    scrape: { kind: 'sen-es', host: 'nonhyun.sen.es.kr' },
  },
  seoul_daegok: {
    id: 'seoul_daegok',
    name: '서울대곡초등학교',
    level: 'elementary',
    region: '서울 강남',
    neis: { atptCode: 'B10', schoolCode: '7091374' },
    scrape: { kind: 'sen-es', host: 'seouldaegok.sen.es.kr' },
  },
  seoul_daedo: {
    id: 'seoul_daedo',
    name: '서울대도초등학교',
    level: 'elementary',
    region: '서울 강남',
    neis: { atptCode: 'B10', schoolCode: '7091375' },
    scrape: { kind: 'sen-es', host: 'sdaedo.sen.es.kr' },
  },
  seoul_daemo: {
    id: 'seoul_daemo',
    name: '서울대모초등학교',
    level: 'elementary',
    region: '서울 강남',
    neis: { atptCode: 'B10', schoolCode: '7091376' },
    scrape: { kind: 'sen-es', host: 'daemo.sen.es.kr' },
  },
  seoul_daewang: {
    id: 'seoul_daewang',
    name: '서울대왕초등학교',
    level: 'elementary',
    region: '서울 강남',
    neis: { atptCode: 'B10', schoolCode: '7091377' },
    scrape: { kind: 'sen-es', host: 'daewang.sen.es.kr' },
  },
  seoul_daejin: {
    id: 'seoul_daejin',
    name: '서울대진초등학교',
    level: 'elementary',
    region: '서울 강남',
    neis: { atptCode: 'B10', schoolCode: '7091378' },
    scrape: { kind: 'sen-es', host: 'seouldaejin.sen.es.kr' },
  },
  seoul_daecheong: {
    id: 'seoul_daecheong',
    name: '서울대청초등학교',
    level: 'elementary',
    region: '서울 강남',
    neis: { atptCode: 'B10', schoolCode: '7091379' },
    scrape: { kind: 'sen-es', host: 'daecheong.sen.es.kr' },
  },
  seoul_daechi: {
    id: 'seoul_daechi',
    name: '서울대치초등학교',
    level: 'elementary',
    region: '서울 강남',
    neis: { atptCode: 'B10', schoolCode: '7091380' },
    scrape: { kind: 'sen-es', host: 'daechi.sen.es.kr' },
  },
  seoul_daehyun: {
    id: 'seoul_daehyun',
    name: '서울대현초등학교',
    level: 'elementary',
    region: '서울 강남',
    neis: { atptCode: 'B10', schoolCode: '7091381' },
    scrape: { kind: 'sen-es', host: 'daehyun.sen.es.kr' },
  },
  seoul_dogok: {
    id: 'seoul_dogok',
    name: '서울도곡초등학교',
    level: 'elementary',
    region: '서울 강남',
    neis: { atptCode: 'B10', schoolCode: '7091382' },
    scrape: { kind: 'sen-es', host: 'dogok.sen.es.kr' },
  },
  seoul_doseong: {
    id: 'seoul_doseong',
    name: '서울도성초등학교',
    level: 'elementary',
    region: '서울 강남',
    neis: { atptCode: 'B10', schoolCode: '7091383' },
    scrape: { kind: 'sen-es', host: 'seouldoseong.sen.es.kr' },
  },
  seoul_bongeun: {
    id: 'seoul_bongeun',
    name: '서울봉은초등학교',
    level: 'elementary',
    region: '서울 강남',
    neis: { atptCode: 'B10', schoolCode: '7091390' },
    scrape: { kind: 'sen-es', host: 'bongeun.sen.es.kr' },
  },
  seoul_samneung: {
    id: 'seoul_samneung',
    name: '서울삼릉초등학교',
    level: 'elementary',
    region: '서울 강남',
    neis: { atptCode: 'B10', schoolCode: '7091391' },
    scrape: { kind: 'sen-es', host: 'srng.sen.es.kr' },
  },
  seoul_semyung: {
    id: 'seoul_semyung',
    name: '서울세명초등학교',
    level: 'elementary',
    region: '서울 강남',
    neis: { atptCode: 'B10', schoolCode: '7091458' },
    scrape: { kind: 'sen-es', host: 'semyung.sen.es.kr' },
  },
  seoul_suseo: {
    id: 'seoul_suseo',
    name: '서울수서초등학교',
    level: 'elementary',
    region: '서울 강남',
    neis: { atptCode: 'B10', schoolCode: '7091397' },
    scrape: { kind: 'sen-es', host: 'suseo.sen.es.kr' },
  },
  seoul_shingu: {
    id: 'seoul_shingu',
    name: '서울신구초등학교',
    level: 'elementary',
    region: '서울 강남',
    neis: { atptCode: 'B10', schoolCode: '7091398' },
    scrape: { kind: 'sen-es', host: 'shingu.sen.es.kr' },
  },
  seoul_apgujeong: {
    id: 'seoul_apgujeong',
    name: '서울압구정초등학교',
    level: 'elementary',
    region: '서울 강남',
    neis: { atptCode: 'B10', schoolCode: '7091401' },
    scrape: { kind: 'sen-es', host: 'apgujeong.sen.es.kr' },
  },
  seoul_yangjeon: {
    id: 'seoul_yangjeon',
    name: '서울양전초등학교',
    level: 'elementary',
    region: '서울 강남',
    neis: { atptCode: 'B10', schoolCode: '7091403' },
    scrape: { kind: 'sen-es', host: 'yangjeon.sen.es.kr' },
  },
  seoul_eonbuk: {
    id: 'seoul_eonbuk',
    name: '서울언북초등학교',
    level: 'elementary',
    region: '서울 강남',
    neis: { atptCode: 'B10', schoolCode: '7091405' },
    scrape: { kind: 'sen-es', host: 'eonbuk.sen.es.kr' },
  },
  seoul_eonju: {
    id: 'seoul_eonju',
    name: '서울언주초등학교',
    level: 'elementary',
    region: '서울 강남',
    neis: { atptCode: 'B10', schoolCode: '7091406' },
    scrape: { kind: 'sen-es', host: 'eonju.sen.es.kr' },
  },
  seoul_yeoksam: {
    id: 'seoul_yeoksam',
    name: '서울역삼초등학교',
    level: 'elementary',
    region: '서울 강남',
    neis: { atptCode: 'B10', schoolCode: '7091407' },
    scrape: { kind: 'sen-es', host: 'yeoksam.sen.es.kr' },
  },
  seoul_younghee: {
    id: 'seoul_younghee',
    name: '서울영희초등학교',
    level: 'elementary',
    region: '서울 강남',
    neis: { atptCode: 'B10', schoolCode: '7091408' },
    scrape: { kind: 'sen-es', host: 'younghee.sen.es.kr' },
  },
  seoul_wangbuk: {
    id: 'seoul_wangbuk',
    name: '서울왕북초등학교',
    level: 'elementary',
    region: '서울 강남',
    neis: { atptCode: 'B10', schoolCode: '7091409' },
    scrape: { kind: 'sen-es', host: 'wangbuk.sen.es.kr' },
  },
  seoul_yulhyeon: {
    id: 'seoul_yulhyeon',
    name: '서울율현초등학교',
    level: 'elementary',
    region: '서울 강남',
    neis: { atptCode: 'B10', schoolCode: '7091468' },
    scrape: { kind: 'sen-es', host: 'yulhyeon.sen.es.kr' },
  },
  seoul_ilwon: {
    id: 'seoul_ilwon',
    name: '서울일원초등학교',
    level: 'elementary',
    region: '서울 강남',
    neis: { atptCode: 'B10', schoolCode: '7091414' },
    scrape: { kind: 'sen-es', host: 'ilwon.sen.es.kr' },
  },
  seoul_jagok: {
    id: 'seoul_jagok',
    name: '서울자곡초등학교',
    level: 'elementary',
    region: '서울 강남',
    neis: { atptCode: 'B10', schoolCode: '7091469' },
    scrape: { kind: 'sen-es', host: 'jagok.sen.es.kr' },
  },
  seoul_cheongdam: {
    id: 'seoul_cheongdam',
    name: '서울청담초등학교',
    level: 'elementary',
    region: '서울 강남',
    neis: { atptCode: 'B10', schoolCode: '7091416' },
    scrape: { kind: 'sen-es', host: 'cheongdam.sen.es.kr' },
  },
  seoul_poi: {
    id: 'seoul_poi',
    name: '서울포이초등학교',
    level: 'elementary',
    region: '서울 강남',
    neis: { atptCode: 'B10', schoolCode: '7091417' },
    scrape: { kind: 'sen-es', host: 'poi.sen.es.kr' },
  },
  seoul_hakdong: {
    id: 'seoul_hakdong',
    name: '서울학동초등학교',
    level: 'elementary',
    region: '서울 강남',
    neis: { atptCode: 'B10', schoolCode: '7091418' },
    scrape: { kind: 'sen-es', host: 'hakdong.sen.es.kr' },
  },
};
```

## Step 2 — `src/lib/schools/index.ts` 갱신

- 18~21번 라인 근처 import 블록에 다음 한 줄 추가 (다른 자치구 import 들과 같이):
  ```ts
  import { GANGNAM_SCHOOLS } from './seoul/gangnam';
  ```
- 43~48번 라인 `SCHOOLS` 객체에 spread 추가:
  ```ts
  export const SCHOOLS: Record<string, SchoolConfig> = {
    ...GYEONGGI_SCHOOLS,
    ...SEOCHO_SCHOOLS,
    ...DONGJAK_SCHOOLS,
    ...GWANAK_SCHOOLS,
    ...GANGNAM_SCHOOLS,
  };
  ```
- 디렉터리 구조 주석 (5~12번 라인) 에 `seoul/gangnam.ts — 서울 강남구 34교 (Stage 14-4)` 한 줄 추가.

## Step 3 — 빌드 검증

```powershell
npm run build 2>&1 | Select-Object -Last 20
```

`✓ Compiled successfully` 가 나와야 성공. 다음 중 하나라도 보이면 즉시 멈추고 보고:
- 타입 에러 (e.g., `Type 'X' is not assignable to type 'SchoolConfig'`)
- import path 오류
- 런타임 에러

## Step 4 — dev probe (회귀 0 + 신규 샘플 3교)

dev 서버는 사용자가 별도 탭에서 떠있는 상태 — `npm run dev` 새로 띄우지 말 것.

```powershell
# 회귀 검증 — 기존 학교 미러 hit 그대로인지
curl.exe -s "http://localhost:3000/api/meal/photo?schoolId=chonggye&ymd=20260428"
curl.exe -s "http://localhost:3000/api/meal/photo?schoolId=seoul_seocho&ymd=20260428"
curl.exe -s "http://localhost:3000/api/meal/photo?schoolId=seoul_kwanak&ymd=20260428"

# 신규 강남구 샘플 3교
curl.exe -s "http://localhost:3000/api/meal/photo?schoolId=seoul_gaepo&ymd=20260428"
curl.exe -s "http://localhost:3000/api/meal/photo?schoolId=seoul_daechi&ymd=20260428"
curl.exe -s "http://localhost:3000/api/meal/photo?schoolId=seoul_eonbuk&ymd=20260428"
```

각각 JSON 한 줄 응답 (`{"photoUrl":"...","source":"mirror"|"origin"}` 또는 `{"photoUrl":null}`) 정상.
신규 강남구는 미러가 아직 안 채워져있어 `source:"origin"` 또는 `null` 이 정상. **HTTP 5xx 또는 HTML 에러 페이지가 나오면 즉시 멈추고 보고**.

## Step 5 — status 갱신

```powershell
node scripts/generate-school-status.mjs --ymd 20260428 > docs/school-status.md
```

약 5~10분 소요 (probeMonth — 첫 OK 즉시 종료). 끝나면 `docs/school-status.md` 의 헤더에서:
- 등록 학교 수: **176교** (142 + 34) 가 정확히 출력되는지
- 강남구 섹션이 새로 추가됐는지
- 회귀 — 동작·관악·서초 학교들이 ✅ 그대로인지 (개별 ⬜ 가 늘어나면 보고)

## Step 6 — work-log Stage 14-4 항목 추가

`docs/work-log.md` 의 마지막 Stage 항목 다음에 새 항목 추가. 형식은
직전 Stage 14-3 (관악구 22교) 항목 그대로 따라하되 본문은 다음 요지:

```
## Stage 14-4 — 서울 강남구 34교 (2026-05-02)

Phase A 세 번째 자치구. 모두 sen.es.kr, 사립 0교, id 충돌 없음 (노트북
사전 분석 결과). 작명 규칙 = host subdomain 기반 + `seoul`/`s` prefix strip
(예: seouldaegok→seoul_daegok, sdaedo→seoul_daedo, srng→seoul_samneung).

수집서버PC Cursor Claude Code 가 시범 실행한 첫 stage — 노트북에서
runbook (docs/runbook-stage14-4-gangnam.md) 받아 한 번에 등록. 결과:
누적 176교 (142 + 34), 사진 가능 ~95% 추정.
```

## Step 7 — commit + push

```powershell
git status
```

다음 파일들이 변경되어 있어야 함:
- `src/lib/schools/seoul/gangnam.ts` (새 파일)
- `src/lib/schools/index.ts` (import + spread + 주석)
- `docs/school-status.md` (자동 갱신)
- `docs/work-log.md` (Stage 14-4 항목)

```powershell
git add src/lib/schools/seoul/gangnam.ts `
        src/lib/schools/index.ts `
        docs/school-status.md `
        docs/work-log.md
git commit -m "feat(seoul): Stage 14-4 — 강남구 34교"
git push origin dev
```

## Step 8 — 사용자에게 보고

다음 항목을 한 메시지로:
1. ✅ Stage 14-4 강남구 34교 등록 완료
2. status 결과 요약: 등록 N교 / 사진 가능 M교 (X.X%)
3. 강남구만 본 결과: 사진 가능 N/34
4. 회귀 (동작·관악·서초) 변동 사항 (없음 / 어떤 학교 ⬜)
5. push 완료 + commit hash

이걸 받은 사용자 (노트북) 가 다음 결정:
- 회귀·결과 OK → 송파·강동·금천 3구 한 번에 진행
- 이슈 발견 → 수정 후 다음 stage

## 절대 하지 말 것 (방어)

- `npm run dev` 새로 띄우기 — 이미 떠있음
- 강남 학교 list 새로 NEIS 에서 다시 추출 — 본 runbook 의 list 가 정본
- id 작명 규칙 재해석 — 본 runbook 그대로
- main 브랜치로 머지 / push — `dev` 브랜치만
- schools.ts (구) 파일 만들거나 수정 — 디렉터리 분리 구조 유지
- non-sen.es 도메인 학교 발견시 본 stage 안에서 처리 — 강남 34교 모두 sen.es 로 검증됨, 만약 그렇지 않은 경우 발견 시 즉시 멈추고 보고
