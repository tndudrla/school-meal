# 작업 기록

## 🎯 북극성 (서비스 최종 목표)

> **전국 초·중·고 학교의 급식을 한 곳에서 보고 공유할 수 있는 서비스.**

이 프로젝트의 모든 작업 결정은 "지금 청계초에 동작하는 게 1만 개 학교에서도 동작하는가?"라는
질문에 답할 수 있어야 한다. 단일 학교 가정·하드코딩·학교 서버 의존은 점진적으로 제거한다.

이 문서는 6개월 후에도 왜 어떤 결정을 내렸는지 추적하기 위한 기록이다.

## 🤝 운영 방향성

**비영리** — 영양교사 선생님들에 대한 감사로 시작한 프로젝트.
광고·결제·유료 학교 등록 모두 안 함. 비영리/감사 메시지를 사이트나 이미지에
박지 않음 (광고 자리 비워둠 자체가 메시지). 자세한 결정 배경은 아래
[운영 방향성](#운영-방향성-2026-04-26-결정) 항목.

향후 결정 시 점검:
- 영양교사·학부모·학생에게 도움이 되는가?
- 학교 행정 부담이 늘지는 않는가?
- 수익 모델 질문에는 답할 게 없어도 괜찮다 (의도된 비영리)

## 📑 Stage 인덱스

미실행 후보(SW, 푸시, 다른 시도 학교 등)는 [`docs/backlog.md`](./backlog.md).

### 기반 (Stage 1~3)
- [Stage 1 — OG 사진 임베드 제거](#2026-04-25--stage-1-og-사진-임베드-제거-카톡-타임아웃-영구-해결) — 카톡 타임아웃 사고 처방
- [Stage 2 — 다중 학교 추상화](#2026-04-25--stage-2-다중-학교-추상화-확장-토대-마련) — schools 레지스트리
- [Stage 3 — Supabase 미러 도입](#2026-04-25--stage-3-supabase-미러--슬라이딩-윈도우-코드-배포-피처-off) — Storage 미러 + 7일 윈도우
- [Stage 3-1 — sharp 리사이즈](#2026-04-25--stage-3-1-sharp-리사이즈-도입-저장-공간-97-절감) — 저장 공간 97% 절감
- [Stage 3-2 — 운영 점검·구조 정리](#2026-04-25--stage-3-2-운영-점검--학교-확장-전-구조-정리)
- [Stage 3-3 — OG 307 redirect](#2026-04-25--stage-3-3-og-307-redirect-로-카톡-사진-카드-부활) — 카톡 사진 카드 부활

### 학교 확장 (Stage 4~6)
- [Stage 4 — 과천 6개 + 즐겨찾기](#2026-04-25--stage-4-과천-6개-초등학교-확장--즐겨찾기--미러-동시성-캡)
- [Stage 5 — 의왕 15개 + 자동 등록 스크립트](#2026-04-25--stage-5-학교-일괄-추가-스크립트--의왕-15개교-확장)
- [Stage 6 — 안양 41개 + 검색](#2026-04-25--stage-6-안양-41개교--검색-입력창--스크립트-quirk-보강)
- [누적 학습 — 학교 일괄 등록 실전 함정](#누적-학습--학교-일괄-등록의-실전-함정-stage-46-종합)

### 사용자 흐름 (Stage 7~9)
- [Stage 7 — 사용자별 홈 학교 설정](#2026-04-25--stage-7-사용자별-기본-학교홈-설정)
- [Stage 8 — URL 자동 동기화 제거](#2026-04-25--stage-8-url-자동-동기화-제거--공유-시점에만-url-빌드)
- [Stage 9 — 대표 URL OG 분리 / PWA / 메타](#stage-9--대표-url-og-분리--가독성pwa메타-정비-2026-04-26)
- [Stage 9-1 — 알레르기 코드 풀이](#stage-9-1--알레르기-코드-풀이-2026-04-26)

### 출력물·앱화 (Stage 10~11)
- [Stage 10 — 주간 식단표 가정통신문 PNG](#stage-10--주간-식단표-가정통신문-2026-04-26)
- [운영 방향성 결정](#운영-방향성-2026-04-26-결정) — 비영리
- [Stage 11 — 홈 화면 추가 유도](#stage-11--홈-화면-추가-유도-2026-04-26) — PWA install prompt
- [Stage 11-1~11-8 — 가벼운 미세 개선](#stage-11-1--11-8--가벼운-미세-개선-묶음-2026-04-26) — 폰트 임베드, lightbox, 토스트, 별칭 검색 등
- [Stage 11-9 — cron 영양교사 타이밍](#stage-11-9--cron-스케줄-영양교사-업로드-타이밍에-맞춤-2026-04-26)

### 군포 학교 추가 (별도 커밋, 2026-04-26)
경기 군포 13개 초등학교 등록 (군포의왕 통합 교육청). 단순 데이터 추가라
별 Stage 항목은 없음. 커밋 6b1466a 참고.

---

## 2026-04-25 — [Stage 1] OG 사진 임베드 제거 (카톡 타임아웃 영구 해결)

### 목표 (북극성과의 연결)

전국 확장 시 학교마다 사진 서버 응답 시간이 들쭉날쭉해질 텐데, OG 이미지 생성이 학교
서버 응답 속도에 의존하면 일부 학교 OG 미리보기가 깨져 사용자 경험이 일관되지 않게 된다.
1만 개 학교 중 하나만 느려져도 그 학교 사용자의 카톡 공유가 무너지는 SPOF 를 제거한다.

### 문제

`/api/og?ymd=...` 라우트 측정값:

```
ymd=20260422 (사진 있음): 27.8초, 1.07 MB ❌
ymd=20260427 (사진 없음): 0.2초, 63 KB    ✅
```

원인: `next/og` 의 `ImageResponse` 가 `<img src="https://chonggye-e.goeay.kr/...">` 를
만나면 서버 사이드에서 학교 사진을 다운로드·디코딩·재인코딩한다. 학교 서버 응답이
느릴 때 OG 라우트 자체가 27초씩 걸려 카카오톡 OG 봇이 타임아웃 → 빈 미리보기가
카톡 캐시에 박혀 매번 수동 OG 디버거 갱신이 필요한 사고.

### 변경

**파일**: `src/app/api/og/route.tsx`

- `fetchPhotoForDate(...)` 호출 제거 (학교 서버에 가지 않음)
- `import { CHONGGYE_TARGET, fetchPhotoForDate }` 제거
- 좌측 사진 영역을 항상 패턴 배경 + 도시락 이모지(🍱)로 통일
- 우측 메뉴 텍스트 카드는 그대로 유지

**유지**: `MealCard`(앱 내) 의 학교 사진 직접 표시는 변경 없음. OG 미리보기에만 사진을
넣지 않음. Stage 3 에서 Supabase 미러를 통해 안전하게 OG 사진을 다시 활성화할 예정.

### 검증

(배포 후 라이브에서 측정)

```bash
curl -o /dev/null -w "%{time_total}s %{size_download}\n" \
  "https://school-meal-phi.vercel.app/api/og?ymd=20260422"
# 기대: ~0.2초, ~60KB (사진 없는 응답과 동일 수준)
```

카카오톡 OG 디버거(https://developers.kakao.com/tool/clear/og) 에서 이전 ymd 들 한 번
갱신 후, 새 ymd 공유 → 일관된 텍스트 OG 카드 즉시 뜨는지 확인.

### 다음 단계

- **Stage 2**: `src/lib/schools.ts` 로 단일 학교 하드코딩(`SCHOOL_NAME`, `ATPT`,
  `SCHOOL_CODE`, `CHONGGYE_TARGET`) 추상화. 새 학교 추가가 한 줄 등록으로 가능하게.
- **Stage 3**: Supabase Storage 미러 + 슬라이딩 윈도우(오늘 + 과거 7일치 보존). OG 사진
  임베드를 Supabase 한정으로 재활성화.

---

## 2026-04-25 — [Stage 2] 다중 학교 추상화 (확장 토대 마련)

### 목표 (북극성과의 연결)

새 학교를 추가할 때 코드 곳곳을 수정하지 않고 **한 곳(`SCHOOLS` 객체)에 항목 하나
추가** 로 끝나야 한다. 라우트마다 학교 메타가 하드코딩되어 있으면 1만 개 학교 확장은
사실상 불가능하다. 이 단계는 외부 동작은 그대로 두고 내부 구조만 정리하는 리팩터.

### 변경

**신규**: `src/lib/schools.ts`
- `SchoolConfig` 타입(id, name, level, region, neis 식별자, scrape 설정 옵션)
- `SCHOOLS` 레지스트리 — 현재 청계초 하나만 등록
- `getSchool(id?)` — 미지정/잘못된 id 면 기본 학교(청계초)로 폴백 (throw 하지 않음)
- `listSchools()` — cron 등에서 모든 학교 순회용

**수정**: 4개 라우트 + 2개 클라이언트 — 모두 `?schoolId=` 받기
- `src/app/api/meal/route.ts` — 레거시 `atpt`, `school` 파라미터도 계속 호환
- `src/app/api/meal/photo/route.ts` — 학교에 `scrape` 설정이 없으면 photoUrl=null
- `src/app/api/og/route.tsx` — 하드코딩된 `SCHOOL_NAME`, `ATPT`, `SCHOOL_CODE` 제거,
  `getSchool(searchParams.get('schoolId'))` 로 대체. OG 이미지의 학교명도 동적
- `src/app/api/cron/refresh/route.ts` — `listSchools()` 순회. 한 학교 실패가 다른
  학교를 막지 않음. 응답 구조: `{ schools: [{ schoolId, neis, photos }, ...] }`
- `src/app/page.tsx` — `generateMetadata`, `HomePage` 가 `?schoolId=` 받음
- `src/components/MealView.tsx` — `schoolId` prop 추가, fetch URL 에 schoolId 전달.
  기본 학교는 URL 에서 schoolId 생략(짧은 URL 유지), 다른 학교만 URL 에 박힘

### 설계 결정 (왜 이렇게)

1. **잘못된 schoolId 도 폴백** — 1만 학교에서 사용자가 옛날 학교 ID 로 공유한 링크가
   돌아다닐 수 있다. 404 대신 기본 학교로 폴백해서 항상 무언가는 보여줌.
2. **레거시 `atpt`, `school` 파라미터 호환 유지** — 외부에서 `/api/meal` 직접 호출하는
   사용자가 있을 수 있어 깨지 않음.
3. **기본 학교는 URL 에서 schoolId 생략** — 청계초 사용자에게 깔끔한 URL 유지. 다른
   학교를 보는 사용자만 URL 에 `&schoolId=...` 가 박힘.
4. **`scrape` 설정은 옵션** — NEIS 만 지원하는 학교(다른 시도 교육청 도메인 등)는
   `scrape` 생략 가능. 메뉴는 보이고 사진은 자연스럽게 미지원.

### 검증

```bash
# 1. 기본 호출 (청계초)
curl http://localhost:3000/api/meal?ymd=20260420
# → {"meal":{"date":"20260420",...}}

# 2. schoolId=chonggye 명시 (동일 응답)
curl 'http://localhost:3000/api/meal?ymd=20260420&schoolId=chonggye'

# 3. 잘못된 schoolId (폴백 동작)
curl 'http://localhost:3000/api/meal?ymd=20260420&schoolId=bogus'
# → 청계초 응답 (폴백 성공)

# 4. cron 응답 구조
curl http://localhost:3000/api/cron/refresh
# → {"triggeredAt":..., "schools":[{"schoolId":"chonggye", "neis":{...}, "photos":{...}}]}
```

ESLint, TypeScript, `npm run build` 모두 통과.

### 새 학교 추가 시 절차 (Stage 2 완성으로 이렇게 단순해짐)

1. 학교의 NEIS 식별자(`atptCode`, `schoolCode`) 파악
2. (옵션) 학교 홈페이지 사진 페이지의 `host`, `sysId`, `mi` 파악
3. `SCHOOLS` 객체에 항목 한 줄 추가:
   ```ts
   gwacheon: {
     id: 'gwacheon',
     name: '과천초등학교',
     level: 'elementary',
     region: '경기 과천',
     neis: { atptCode: 'J10', schoolCode: '7530014' },
     scrape: { host: 'gwacheon-e.goeay.kr', sysId: 'gwacheon-e', mi: '9904' },
   },
   ```
4. 끝. `?schoolId=gwacheon` 으로 즉시 접근 가능.

### 다음 단계

- **Stage 3**: Supabase Storage 미러 + 슬라이딩 윈도우. `SUPABASE_SERVICE_ROLE_KEY`
  환경변수 유무로 게이팅 → 키 없으면 Stage 1+2 동작 그대로 유지(피처 플래그).
- 사용자가 직접 해야 할 것: Supabase 프로젝트 셋업 + 환경변수 등록 (Stage 3 코드
  배포는 그 전에 가능).

---

## 2026-04-25 — [Stage 3] Supabase 미러 + 슬라이딩 윈도우 (코드 배포, 피처 OFF)

### 목표 (북극성과의 연결)

전국 1만 학교 확장 시에도 OG/앱이 학교 서버 응답 속도에 의존하지 않게 한다. 학교
사진을 Supabase Storage 에 미러링하고, **오늘 + 과거 7일치만 보존**하는 슬라이딩
윈도우로 운영해 저장 비용을 거의 일정하게 유지한다.

### 슬라이딩 윈도우 결정 근거 (사용자 통찰)

전체 데이터 보관 시 비용 추정:

| 보관 정책 | 1교 | 1000교 | 10000교 |
|---|---|---|---|
| 무한 누적 (1년) | 36 MB | 36 GB | 360 GB ❌ Pro 도 부족 |
| **슬라이딩 7일** | 0.7 MB | 0.7 GB | 7 GB ✅ |

7일치만 보존하면 장기적으로도 Free tier(1GB) → Pro($25/250GB) 안에서 충분히 운영
가능. 과거 데이터는 사용자 가치가 낮음(학부모는 오늘·이번주 위주로 봄).

### 변경 (피처 플래그 OFF 상태로 배포)

**신규**:
- `supabase/migrations/0001_meal_photos.sql` — `meal_photos` 테이블, RLS, Storage
  버킷 정책 안내. PK `(school_id, ymd)`, 인덱스 `ymd`, 변경 감지용 `content_hash`.
- `src/lib/supabase/admin.ts` — `getServiceRoleClient()`(쓰기), `getAnonClient()`(읽기).
  키 없으면 `null` 반환 (피처 플래그). 모듈 단위 캐싱.
- `src/lib/photoMirror.ts` — 핵심 모듈 4개 함수:
  - `mirrorWeekForSchool(school, todayYmd)`: 한 학교의 주간 사진을 Supabase 에 미러.
    URL/해시 동일 시 다운로드 스킵, 다운로드 15초 타임아웃, ymd 단위로 실패 격리.
  - `pruneOldPhotos(todayYmd)`: 슬라이딩 윈도우. `ymd < today-7일` 인 행과 Storage
    객체 일괄 삭제.
  - `getMirroredPhotoUrl(schoolId, ymd)`: anon 으로 조회. 미러 미스 시 null.
  - `isMirrorEnabled()`: service_role 키 유무 체크.

**수정**:
- `src/app/api/cron/refresh/route.ts` — `mirrorOn` 일 때만 학교별 `mirrorWeekForSchool`
  + 마지막에 `pruneOldPhotos`. 응답에 `mirrorEnabled`, `mirror`, `prune` 추가.
- `src/app/api/og/route.tsx` — Stage 1 에서 끈 사진 임베드를 **Supabase 미러 한정** 으로
  재활성화. 미러 미스 시 자동 폴백(이모지 카드).
- `src/app/api/meal/photo/route.ts` — Supabase 미러 우선 → 학교 직접 폴백 → null.
  응답에 `source: 'mirror' | 'origin'` 추가.
- `README.md` — `SUPABASE_SERVICE_ROLE_KEY` 환경변수 추가 안내.

### 피처 플래그 동작 (검증 완료)

`SUPABASE_SERVICE_ROLE_KEY` 없이 `npm run dev` 후 검증:

```bash
# 1. cron — mirrorEnabled: false, prune: skipped
curl http://localhost:3000/api/cron/refresh
→ {"mirrorEnabled":false, "schools":[{"schoolId":"chonggye", "neis":..., "photos":...}], "prune":{"enabled":false,"pruned":0}}

# 2. /api/meal/photo — origin 폴백
curl 'http://localhost:3000/api/meal/photo?ymd=20260420'
→ {"photoUrl":"https://chonggye-e.goeay.kr/...", "source":"origin"}

# 3. /api/og 응답시간 — Stage 1 수준 유지
curl -o /dev/null -w "%{time_total}s\n" 'http://localhost:3000/api/og?ymd=20260422'
→ 0.25초
```

ESLint, TypeScript, `npm run build` 모두 통과. 라이브 사이트 동작 100% 동일.

### 사용자 활성화 절차 (수동, Claude 가 못 하는 부분)

1. **Supabase 프로젝트 준비**: https://supabase.com/dashboard → Region: Northeast Asia
   Seoul (한국). 기존 프로젝트 재사용 가능.
2. **API 키 3개 복사**: Project Settings → API
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ 절대 클라이언트 노출 금지
3. **SQL 실행**: Dashboard → SQL Editor → New query →
   `supabase/migrations/0001_meal_photos.sql` 내용 전체 붙여넣고 Run.
4. **Storage 버킷 생성**: Dashboard → Storage → New bucket → 이름 `meal-photos`,
   **Public 체크**.
5. **Storage 정책**: Storage → meal-photos → Policies → "New policy" → SQL 파일
   하단 주석의 select 정책 추가.
6. **Vercel 환경변수**: Project → Settings → Environment Variables → Production +
   Preview 양쪽에 위 3개 키 추가. 저장 후 자동 재배포.
7. **첫 cron 수동 트리거**:
   ```bash
   curl -H "Authorization: Bearer <CRON_SECRET>" \
     https://school-meal-phi.vercel.app/api/cron/refresh
   ```
   응답에서 `mirrorEnabled: true`, `mirror.uploaded > 0` 확인.
8. **카톡 OG 디버거 갱신** (https://developers.kakao.com/tool/clear/og) → 새 ymd 카톡
   공유 → 사진 박힌 OG 미리보기 확인.

### 비용 모니터링 (활성화 후)

- Supabase Dashboard → Storage 사용량 (학교당 ~700KB 예상)
- Vercel → Functions → cron 실행 로그에서 `mirror.uploaded`, `prune.pruned` 추이
- 100 학교 넘어가면 OG 라우트 트래픽 증가 → Vercel Pro 검토 시점

### 다음 단계 (Stage 3 이후)

- **Phase 3 시작**: 학교 검색 페이지 (`/search`), 학교 선택 UI. 현재는 코드에 학교를
  직접 추가해야 하지만 사용자가 검색해서 추가 가능하게.
- **모니터링/알림**: cron 실패 시 Slack/Discord 웹훅.

---

## 2026-04-25 — [Stage 3-1] sharp 리사이즈 도입 (저장 공간 97% 절감)

### 목표 (북극성과의 연결)

전국 1만 학교로 확장 시 저장 공간이 핵심 비용. 청계초 사진을 실측해본 결과 **장당
5.4MB** 였음. 그대로 미러하면:

- 1만 학교 × 7일 × 5MB = **350GB** → Supabase Free(1GB) · Pro(250GB) 모두 초과 ❌

`sharp` 로 1280px JPEG q=80 리사이즈하면 **5.4MB → ~150KB (97% 절감)**:

- 1만 학교 × 7일 × 150KB = **10.5GB** → Pro 250GB 안에서 충분 ✅

### 발단

Stage 3 활성화 후 cron 첫 호출에서 사진 3장 모두 download 단계 abort. 학교 사진이
5MB+ 라 15초 타임아웃 초과. 타임아웃을 45s 로 늘리고 cron maxDuration 을 60s 로
명시했으나 그래도 **`FUNCTION_INVOCATION_TIMEOUT`** 발생.

근본 해결은 두 갈래:
1. 타임아웃 더 늘리기 + 학교 분할 cron (임시방편, 저장 공간 문제 미해결)
2. **다운로드 후 즉시 sharp 리사이즈로 저장 효율 동시 해결** ← 사용자 통찰로 채택

### 변경

- `package.json`: `sharp ^0.34.5` 추가 (Vercel 빌드 시 네이티브 바이너리 자동 처리)
- `src/lib/photoMirror.ts`:
  - 다운로드 직후 `sharp(buf).rotate().resize(1280, fit:'inside').jpeg({quality:80, mozjpeg:true})` 적용
  - 결과는 모두 `.jpg` 로 통일 (원본 png/webp 도 jpeg 로 변환 → 캐시·CDN 효율 ↑)
  - `extFromUrl`, `contentTypeOf` 헬퍼 제거 (더 이상 필요 없음)
  - `content_hash` 는 리사이즈 결과 기준 (내용 변화 정확히 반영)

### 검증 (배포 후)

```bash
# cron 호출 기대 결과
curl.exe -H "Authorization: Bearer <CRON_SECRET>" \
  "https://school-meal-phi.vercel.app/api/cron/refresh"

# mirror.uploaded: 3, mirror.failed: 0 기대
# Supabase Storage → meal-photos → chonggye/ 폴더에
#   20260420.jpg (~150KB), 20260421.jpg, 20260422.jpg 3개 파일
```

### 다음 단계

- 카톡 OG 디버거(https://developers.kakao.com/tool/clear/og) 갱신 후 카톡 공유
  → 사진 박힌 OG 미리보기 확인
- 디버그용 `failures` 배열 응답은 동작 안정화 확인 후 제거 가능 (작은 정리)

---

## 2026-04-25 — [Stage 3-2] 운영 점검 + 학교 확장 전 구조 정리

### 배경

Stage 3 미러 파이프라인이 안정화된 시점(이번 주 운영 이슈 두 건 — 수동 삭제 후
재업로드 미동작, Vercel 60s 타임아웃 — 모두 해결됨)에서, Stage 4(학교 추가) 로
넘어가기 전에 두 가지를 묶어서 진행:

1. 현재 데이터 흐름을 6개월 후에도 추적 가능하게 기록 (이 섹션)
2. 단 하나 남은 구조적 부채 정리 (`CHONGGYE_TARGET` 흡수)

### 사진은 어디서 오는가

**결론**: Supabase Storage 미러를 **우선** 조회, 미러에 없으면 학교 홈페이지에서
**직접 스크래핑** 으로 폴백. OG 이미지는 미러 only(학교 직접 폴백 없음).

| 호출 경로 | 우선 | 폴백 | 근거 |
| --- | --- | --- | --- |
| 앱 (`/api/meal/photo`) | Supabase 미러 | 학교 직접 | `src/app/api/meal/photo/route.ts:34-49` |
| OG (`/api/og`) | Supabase 미러 | 도시락 이모지 🍱 | `src/app/api/og/route.tsx:31` |

흐름:
- 브라우저 `MealView` 가 `/api/meal/photo?ymd=...&schoolId=...` 호출
  (`src/components/MealView.tsx:105-107`)
- 서버 핸들러가 `getMirroredPhotoUrl()` 먼저 시도 → hit 이면 `source:'mirror'`
  로 즉시 반환 (1h CDN 캐시)
- 미러 miss 시 `fetchPhotoForDate()` 가 학교 홈페이지에 붙어 `source:'origin'` 반환
- 둘 다 실패하면 `photoUrl: null` + 1분 캐시 (학교 회복 즉시 반영)

OG 가 학교 직접 폴백을 의도적으로 안 가는 이유는 [Stage 1] 섹션 참조 — 학교 서버
27초 응답 → 카톡 OG 봇 타임아웃 → 빈 미리보기가 카카오 캐시에 박히는 사고의 근본 처방.

미러 활성화 전제: `SUPABASE_SERVICE_ROLE_KEY` 환경변수가 설정돼야 함
(`src/lib/photoMirror.ts:10-11`). 미설정이면 모든 미러 함수가 no-op → 항상 학교
직접 경로로 떨어짐. 현재 cron 응답에 `mirrorEnabled:true` 가 보이므로 프로덕션은
ON 상태.

### 급식 정보(메뉴·칼로리)는 하루 몇 번 / 언제 / 어떻게

**결론**: cron 으로 **하루 2회 워밍** + 사용자 요청 시점. 데이터 소스는 NEIS open
API. 두 단계 캐시(Next.js fetch 캐시 1h + Vercel CDN 1h) 로 NEIS 실호출은 거의 흡수.

cron 스케줄 — `vercel.json:4-5`:
- `0 23 * * *` UTC = **KST 오전 8시**
- `0 6  * * *` UTC = **KST 오후 3시**
- `maxDuration: 60` (Vercel Hobby 한도, `src/app/api/cron/refresh/route.ts`)

cron 한 번에 학교별로 하는 일:
1. NEIS 메뉴(오늘+내일) 미리 fetch → Next.js 캐시 워밍
2. 학교 홈페이지 사진 URL 수집
3. Supabase 미러 업로드 (`mirrorWeekForSchool`)
4. 7일 지난 사진 prune (`pruneOldPhotos`, 슬라이딩 윈도우)

사용자 요청 시 NEIS 실호출은 두 단계 캐시로 거의 일어나지 않음:
- Next.js 데이터 캐시: `fetch(..., { next: { revalidate: 3600 } })`
  (`src/lib/neis.ts:30`) — 같은 (학교, ymd) 조합은 1시간 동안 캐시값 반환
- Vercel CDN: 응답에 `Cache-Control: s-maxage=3600` — 엣지에서 한 번 더 흡수

→ **NEIS 가 실제로 호출되는 건 학교·날짜 조합당 하루 2~3회 수준** (cron 두 번 +
첫 트래픽 한 번). 사용자 트래픽이 늘어도 NEIS 부하는 거의 그대로.

### 변경 — 학교 확장 전 구조 정리

**파일**:
- `src/lib/schoolScraper.ts`
- `src/lib/schools.ts`

**문제**: `CHONGGYE_TARGET` 상수가 `schoolScraper.ts` 안에 정의돼 있고
`schools.ts` 가 import 해 사용하는 구조. 새 학교를 추가하려면 두 파일을 동시에
건드려야 했다. "새 학교 = `SCHOOLS` 객체에 한 항목 등록" 원칙([Stage 2] 에서 세움)
에 어긋나는 마지막 부채.

**조치**:
- `schoolScraper.ts` 의 `CHONGGYE_TARGET` export 삭제 — 이 파일은 이제 학교별 정보를
  모르는 순수 스크래핑 유틸로 정리됨
- `schools.ts` 에서 `scrape:` 항목을 인라인 객체 리터럴(`{ host, sysId, mi }`) 로 정의

이후 새 학교 추가 절차: `SCHOOLS` 객체에 한 항목만 등록하면 끝. 다른 파일을
건드리지 않음.

### 의도적으로 안 한 것

- `src/config/schools/` 디렉터리 분리 — 학교 10개 넘어가면 검토. 지금은 과한 면도
- Supabase 학교 메타 테이블 마이그레이션 — Stage 5+ 영역
- `MirrorResult.failures` 디버그 필드 제거 — 이번 주 운영 이슈 두 건의 진단에
  실제로 도움됐음. 1~2주 무사고 운영 후 별도 PR 로 정리

### 검증

- `npx tsc --noEmit` 통과
- 기존 OG/`/api/meal`/cron 동작은 동일 (`CHONGGYE_TARGET` 의 값은 그대로,
  위치만 이동)
- `grep -r CHONGGYE_TARGET src/` → 0건 (다른 import 처 없음 확인)

---

## 2026-04-25 — [Stage 3-3] OG 307 redirect 로 카톡 사진 카드 부활

### 문제

카톡으로 청계초 4월 22일(수, 사진 있는 날) URL 공유 시, 미리보기에 사진이
없고 이모지 카드만 표시. 운영 OG 라우트를 직접 까보니:

```
$ curl -I "https://school-meal-phi.vercel.app/api/og?ymd=20260422&schoolId=chonggye"
HTTP/1.1 500 Internal Server Error
```

원인 추정: `next/og` 의 `ImageResponse` 가 JSX 안의 `<img src="https://...supabase.co/...">`
를 만나면 서버 사이드에서 그 URL 을 fetch·디코딩·재인코딩하는데, 이 경로가
운영에서 일관되게 동작하지 않음. Stage 1 의 학교 직접 URL 27초 사고와 같은
부류 — 외부 이미지를 OG 빌드 안에서 합성하는 모델 자체가 SPOF.

또한 사용자 의도는 "사진 있을 때는 이미지·텍스트를 합친 카드가 아니라 사진
풀카드". 카톡은 본문 텍스트로 학교·메뉴를 이미 보여주므로 OG 에서 텍스트
중복은 가독성만 떨어뜨림.

### 변경

**파일**: `src/app/api/og/route.tsx`

흐름을 두 갈래로 단순화:

- 사진 있는 날: `ImageResponse` 를 만들지 않고 미러 URL 로 **307 redirect**.
  카톡/SNS OG 봇이 Supabase CDN 이미지를 그대로 카드로 표시 → 사진 풀카드.
- 사진 없는 날: 기존 메뉴 텍스트 카드 ImageResponse 폴백 유지 (좌측은 항상
  이모지로 단순화 — 분기 사라짐).

```tsx
const mirroredPhotoUrl = await getMirroredPhotoUrl(school.id, ymd).catch(() => null);
if (mirroredPhotoUrl) {
  return new Response(null, {
    status: 307,
    headers: {
      Location: mirroredPhotoUrl,
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
```

부수 효과: 사진 있는 날엔 NEIS API 도 호출 안 함 → 응답 더 빨라짐.

### 검증

```
$ curl.exe -I "https://school-meal-phi.vercel.app/api/og?ymd=20260422&schoolId=chonggye"
HTTP/1.1 307 Temporary Redirect
Location: https://...supabase.co/storage/v1/object/public/meal-photos/chonggye/20260422.jpg
```

카카오 OG 디버거(`https://developers.kakao.com/tool/clear/og`) 에서 캐시 초기화
후 미리보기 → 사진 풀카드 정상 렌더링 확인.

채팅창에 이미 박힌 옛 OG 카드는 **카톡 클라이언트 자체 캐시** 라 즉시 갱신
안 됨. 새 채팅방에 공유하거나 URL 에 더미 쿼리(`&v=1`) 를 붙여 새 URL 로
보내면 새 OG 로 박힘.

### 비고

- redirect 응답의 `Cache-Control` 은 Vercel 이 `public` 으로 덮어쓰는 것으로
  관찰. 그래도 라우트 내부가 가벼워(미러 1회 조회 + 307) 운영상 부담 없음.
- 사진 없는 학교/날짜의 ImageResponse 폴백 경로는 변경 없음 — 카톡 캐시
  무결성 유지.

---

## 2026-04-25 — [Stage 4] 과천 6개 초등학교 확장 + 즐겨찾기 + 미러 동시성 캡

### 목표 (북극성과의 연결)

청계초 1개에서 과천시 6개 초등학교로 첫 다중 학교 확장. **북극성(전국 1만
학교)** 의 첫 실측 검증 — 학교 등록·미러·OG·UI 가 N개 학교에서 자연스럽게
동작하는지. 동시에 사용자가 관심 학교를 빠르게 보는 즐겨찾기 UX 추가, 그리고
대규모 확장 토대로 미러 다운로드의 동시성을 캡한다.

### 변경 (커밋 순서)

#### 1. `744beac` perf(mirror): 학교당 동시 다운로드 캡 3

학교 첫 등록 시 7개 ymd 가 **모두 동시에** fetch 되던 동작을 3개 배치 단위로
직렬화. 정상 운영 중엔 select-existing 으로 대부분 skip 되어 영향 없지만, 6개
학교를 한꺼번에 추가하면 42장 동시 다운로드 → 학교 서버 폭격 + Vercel 60s
한도 위험. 라운드 사이는 직렬, 배치 안은 병렬.

```ts
const CONCURRENCY = 3;
for (let i = 0; i < entries.length; i += CONCURRENCY) {
  const batch = entries.slice(i, i + CONCURRENCY);
  outcomes.push(...await Promise.all(batch.map(runOne)));
}
```

학교당 7장이면 3+3+1 라운드, 라운드당 ~10s 가정 시 ~30s 이내. 1만 학교 시점에도
학교 서버 입장에서 동시 3 요청은 무리 없는 상한 — 진짜 확장 토대.

#### 2. `8d86974` feat(schools): 과천 5개 초등학교 추가

`SCHOOLS` 객체에 5개 항목 추가. 출처는 NEIS Open API 의 `schoolInfo` 엔드포인트
(주소에 "과천" 포함만 채택). scrape host 는 응답의 `HMPG_ADRES` 에서 직접 추출.

| id | name | schoolCode | host |
| --- | --- | --- | --- |
| `gwacheon` | 과천초등학교 | 7569010 | gwacheon-e.goeay.kr |
| `kwanmun` | 관문초등학교 | 7569011 | kwanmun-e.goeay.kr |
| `munwon` | 문원초등학교 | 7569018 | munwon-e.goeay.kr |
| `chonggye` | 청계초등학교 | 7569109 | chonggye-e.goeay.kr (기존) |
| `gcgh` | 과천갈현초등학교 | 7569213 | gcgh-e.goeay.kr |
| `yulmok` | 과천율목초등학교 | 7569216 | yulmok-e.goeay.kr |

DEFAULT_SCHOOL_ID 는 청계초 그대로 유지 (레거시 URL 호환).

**미해결**: `mi`(메뉴 식별자) 는 청계초 = 9904 가 검증된 값. 다른 학교의 mi 는
우선 9904 로 두고, 첫 cron 응답에서 `photos.count` 가 0 인 학교는 학교별로
점검·보정. 안 되는 학교는 `scrape` 만 빼서 메뉴는 보이고 사진은 안 보이는
상태로 유지(피처 플래그가 그 케이스 처리).

#### 3. `fa52f33` feat(ui): 학교 선택 바텀시트 + 즐겨찾기

새 컴포넌트 `SchoolSwitcher`. 헤더의 `🍱 {학교명}` 을 버튼으로 만들어 누르면
하단에서 시트가 슬라이드 업. 상단 섹션 "⭐ 즐겨찾기", 하단 섹션 "전체 학교".
각 항목 우측에 별 토글.

저장: `localStorage.favoriteSchoolIds = string[]`. 서버 동기화 안 함 (계정/로그인
없음 — 기기-로컬이 자연스러움). SSR 안전 (`typeof window` 가드, mount 시 로드).

학교 선택 → `setActiveSchoolId(...)` → 기존 `MealView` 의 URL 동기화 useEffect
가 `?schoolId=...` 쿼리를 자동 갱신. 기존 패턴 재사용으로 변경 면적 최소화.

### 의도적으로 안 한 것

- **Cron 분할 / 큐 도입**: 6개 단계엔 과함. 동시성 캡으로 토대 마련, 100개 학교
  넘으면 별도 Stage.
- **즐겨찾기 서버 동기화**: 계정 도입 시점에.
- **학교 검색 입력창**: 6개면 리스트가 빠름. 학교 수 늘면 추가.
- **학교별 mi 자동 추출**: 9904 로 시도하고 안 되는 학교만 잘라냄. 자동화는
  스크래퍼 보강 필요 → 별도 Stage.

### 검증 (배포 후 — 후속 메모 필요)

```bash
curl.exe -H "Authorization: Bearer <CRON_SECRET>" \
  "https://school-meal-phi.vercel.app/api/cron/refresh"
```

응답 `schools[]` 6건 확인 포인트:
- `neis.today/tomorrow`: 모두 true 또는 false 일관 (NEIS 코드 정합)
- `photos.count`: 청계초는 1~3, 나머지는 mi=9904 일치 여부에 따라 0~3
- `mirror.uploaded` + `mirror.skipped` 합이 photos.count 와 일치
- 함수 실행 시간 60s 안에 끝나는지 (Vercel 로그)

→ 후속: 결과 확인 후 mi 재조정 / 안 되는 학교 scrape 제거.

UI 검증:
- localhost dev 서버 / 배포 후 헤더 학교명 클릭 → 시트 열림
- 별 토글 → 즐겨찾기 섹션에 학교 추가/제거
- 새로고침 후 즐겨찾기 유지 (localStorage 영속성)
- 모바일 뷰포트(480px) 에서 깨짐 없음

---

## 2026-04-25 — [Stage 5] 학교 일괄 추가 스크립트 + 의왕 15개교 확장

### 목표 (북극성과의 연결)

Stage 4 에서 과천 6개교를 등록했지만, **학교당 mi 식별자를 사람이 브라우저에서
수동 추출** 해야 한다는 큰 마찰이 남았다. 의왕·안양·다른 시도 확장에 학교
수십~수백 개 추가가 필요한 상황에서 수동 추출은 1만 학교 북극성과 양립 불가.

이 Stage 의 결과물:
1. 학교 SchoolConfig 자동 생성 스크립트 (`scripts/build-school-config.mjs`)
2. 그 스크립트로 의왕시 15개 초등학교 일괄 등록
3. 운영 검증 — 의왕 학교 사진까지 미러에 자동 수급 확인

### 결정적 단서 — main.do 의 메뉴 anchor

mi 자동 추출이 가능한지가 Stage 5 의 핵심 가설이었다. 학교 메인
(`https://{host}/{sysId}/main.do`) HTML 안에 식단 메뉴 anchor 가 그대로
박혀있다는 걸 발견:

```html
<a href="/{sysId}/ad/fm/foodmenu/selectFoodMenuView.do?mi=4417">식단안내</a>
```

청계초·과천 5개교에 대해 검증 — Stage 4 에서 사람이 수동으로 따온 mi 와 100%
일치. 자동화 가능 확정.

### 변경

#### `4bc50cc` feat(scripts): 학교 SchoolConfig 자동 생성기

**파일**: `scripts/build-school-config.mjs` (신설, Node 20+ 표준 라이브러리만)

두 모드:
- `--names <파일>`: 한 줄 한 학교명. NEIS 무키로도 동작 (학교당 1 호출)
- `--city <시이름>`: NEIS_API_KEY 있을 때 시 단위 일괄 조회

학교당 처리:
1. NEIS schoolInfo 조회 → SD_SCHUL_CODE, ORG_RDNMA, HMPG_ADRES
2. host 추출 + sysId 인식 (goeay/goegu 두 패턴)
3. main.do fetch + `selectFoodMenuView\.do\?mi=(\d+)` 정규식
4. id 자동 — sysId 에서 `-e` 또는 `cho` 접미 제거
5. 실패 시 `scrape` 만 비우고 진행 (메뉴는 노출, 사진만 안 나옴)

NEIS API 의 두 quirk 발견·우회:
- **풀네임 정확 일치 시 0건** (예: "백운호수초등학교" → 0건, "백운호수" → OK)
  → 풀네임 우선 시도 후 빈 결과면 키워드 폴백
- **무키 호출은 pSize/pIndex 강제 5** → 키워드가 너무 흔하면("과천") 매치
  10건 중 5건만 와서 풀네임 일부 묻힘. 풀네임 우선 전략으로 우회

#### `dc3a565` feat(schools): 의왕 15개 초등학교 추가

스크립트 출력을 schools.ts 에 그대로 붙여넣음. 15/15 모두 mi 자동 추출 성공
(`scrape 생략 0개`).

**도메인 패턴 발견**: 의왕은 `*.goegu.kr` (과천의 `*-e.goeay.kr` 와 다름).
스크래퍼 코드는 host 가 동적이라 코드 변경 없이 그대로 동작. 학교 ID 는 sysId
에서 `cho` 접미 떼는 규칙 추가 (`naedongcho` → `naedong`).

### 검증 결과

- 모달 region 그룹핑 자동 분리: `경기 과천(6)` / `경기 의왕(15)` 정상
- 의왕 학교 선택 후 메뉴·사진 정상 노출 (사용자 직접 확인)
- 운영 cron 첫 응답에 과천 6개만 포함 (의왕은 별도 호출에서 처리된 듯) — UI
  에 사진이 보이는 걸로 미러 동작은 확정. 다음 cron(KST 8시) 응답에서 21건
  다 나올지 후속 확인

### 비고

- NEIS 무키 한도(하루 1000회 + pSize=5) 가 페이징 일괄 조회를 막아 `--city`
  모드는 키 있을 때만 동작. 학교명 명단을 사람이 한 번 모으면 `--names` 로
  키 없이도 충분히 진행 가능 — 의왕 15개교가 그 케이스
- `goegu.kr` 패턴이 발견되면서 다른 시도 확장 시 추가 도메인 패턴 가능성 ↑.
  스크립트의 `sysIdFromHost` 정규식만 갱신하면 됨 (지금은 goeay|goegu)
- `MirrorResult.failures` 디버그 필드는 의왕 첫 부트스트랩에서도 사고 없이
  통과 — 1~2주 더 운영 후 제거 검토

### 다음 후보

- 안양시 초등학교 추가 (위키에서 41개교 명단 확인됨)
- NEIS_API_KEY 발급 후 `--city` 모드로 다른 시 일괄 추가
- 학교 수 50개 넘으면 SchoolSwitcher 에 검색 입력창 추가

---

## 2026-04-25 — [Stage 6] 안양 41개교 + 검색 입력창 + 스크립트 quirk 보강

### 목표 (북극성과의 연결)

Stage 5 의 자동 생성기를 실전에서 굴려본다. 안양시 41개교를 한 번에 추가하면서
스크립트가 처음 만나는 학교 홈페이지 패턴들 — `mi` 가 일반 anchor 가 아닌 곳,
host 에 공백, 동명이인 학교 등 — 을 어떻게 처리하는지 검증·보강.
학교가 60개 넘게 되니 모달에 검색이 필수가 된다.

### 운영 학교 합계

이번 Stage 끝나면 운영 학교 **62개교**:
- 경기 과천: 6
- 경기 의왕: 15
- 경기 안양: 41 (동안구 26 + 만안구 15)

### 변경

#### `cfe37bf` feat(schools): 안양 41개교 + 스크립트 보강

스크립트 첫 실행 결과: 41/41 NEIS 매치, **38/41 mi 자동 추출** (93%). 실패한
3개교에서 새 패턴 두 가지 발견:

**버그 1 — `HMPG_ADRES` 의 앞뒤 공백** (평촌초·해오름초)
```
HMPG_ADRES=" pc-e.goeay.kr"          ← 앞 공백
HMPG_ADRES="haeoleum-e.goeay.kr "    ← 뒤 공백
```
NEIS 데이터 입력 시 공백이 섞인 케이스. `hostFromHmpg` 에서 trim 추가로 해결.

**버그 2 — 식단 메뉴가 `onclick` 권한 체크** (관양초)
```html
<!-- 일반 anchor (대부분의 학교) -->
<a href="/{sysId}/ad/fm/foodmenu/selectFoodMenuView.do?mi=1753">식단안내</a>
<!-- onclick 권한 체크 (관양초 등) -->
<a onclick="menuAccessCheck('1754', 'kwanyang-e')">식단계획</a>
```
학교가 식단 페이지에 인증을 걸면 anchor 가 아닌 onclick 함수로 박힘. mi 는
함수 첫 인자에 들어있으니 정규식 추가로 해결. 식단 키워드 근처 윈도우(±200자)
의 `menuAccessCheck` 만 채택해 다른 메뉴(급식실 등) 와 혼동 방지.

두 버그 수정 후 재실행 → **41/41 mi 자동 추출 (100%)**.

**기타 케이스**:
- 삼성초 동명 2개 (안양 + 화성) → "첫 번째 사용" 경고 후 진행. 안양시 학교가
  먼저 매치되어 OK
- 안양호암초만 region 정규식 미스 ("경기 안양" 대신 "경기"). schools.ts 에
  붙여넣을 때 1줄 수동 보정. 향후 region 추출 정규식 보강 필요

#### `6df79d4` feat(ui): 학교 선택 모달에 검색 입력창

학교 62개로 늘면서 region 그룹 6 + 의왕 15 + 안양 41 = 모달이 답답함.
상단 고정바에 검색 입력창. 학교명/지역 부분일치, 정규화는 trim + lowercase.

검색 동작:
- 검색어 없음 → 기존 즐겨찾기 + region 그룹 뷰
- 검색어 있음 → 단일 결과 리스트 (`검색 결과 (N)`)
- 0건 → "매치되는 학교가 없어요" 가이드 카드
- ✕ 버튼으로 검색어 즉시 비움 (전체 뷰로 복귀)
- 모달 닫을 때 검색어 초기화 (다음 진입 시 깨끗)

### 의도적으로 안 한 것

- **학교 자동 보정 region** — 1개 케이스(안양호암초) 만 영향이라 수동 보정.
  `regionFromAddress` 정규식 강화는 다음 시 추가 시 같이
- **검색 결과의 즐겨찾기 우선 정렬** — 단순 매치 순서로 충분. 학교 수 100+ 넘으면
  검토
- **다른 시 자동 발견** — `--city` 모드 키 발급 후 검토. 지금은 위키 명단 + 
  `--names` 가 잘 동작

### 다음 후보

- NEIS_API_KEY 발급 (주요 정공법) → `--city` 일괄 모드 활성화
- 군포·시흥 등 인접 시 추가 (필요 시)
- 동명 학교 다수 케이스의 명확한 disambiguation (지금은 첫 매치 자동 채택)
- 검색창에 즐겨찾기 ⭐ 우선 정렬

---

## 누적 학습 — 학교 일괄 등록의 실전 함정 (Stage 4~6 종합)

학교 1 → 62개교 확장하면서 만난 패턴들. 다음 시 추가 시 체크리스트:

### NEIS API quirk

- **풀네임 정확 일치 시 0건 응답하는 학교 존재** — 스크립트는 풀네임 시도 후
  실패 시 키워드(접미 떼고) 폴백
- **무키 호출은 `pSize`/`pIndex` 강제 5건** — 키워드가 흔하면 일부 학교가
  상위 5에 안 들어와 묻힘. 풀네임 우선 전략으로 우회
- **동명 학교** — `삼성초등학교` 가 안양·화성 둘. ATPT + ORG_RDNMA 시 필터로
  어느 정도 거르되, 그래도 동일 시도 안에 동명일 수 있음

### 학교 홈페이지 CMS 패턴

- **공식 도메인 두 종류**: `*-e.goeay.kr` (과천·안양 등 다수), `*.goegu.kr`
  (의왕). 둘 다 같은 CMS 라 path 구조 동일 (`/{sysId}/ad/fm/foodmenu/...`)
- **HMPG_ADRES 데이터 정합성 약함**: 앞뒤 공백, http/https 혼재, `/main.do`
  꼬리. trim + URL 파싱 두 단계로 정리
- **식단 메뉴 노출 방식 두 가지**:
  - 일반 anchor (`<a href="...selectFoodMenuView.do?mi=...">`) — 대부분
  - onclick 권한 체크 (`menuAccessCheck('mi', 'sysId')`) — 학교가 인증 걸면
    이 형태. mi 는 첫 인자
- **학교 정책에 따른 사진 운영 차이** — 같은 CMS 여도 사진 안 올리는 학교
  존재 (관문초). 우리가 손댈 게 없는 부분, photos.count=0 으로 노출

### 운영 부담 실측 (Vercel Hobby)

- 학교당 cron 처리 — NEIS 메뉴 워밍 + 사진 7일치 미러. 정상 운영 중엔
  select-existing 으로 다운로드 거의 skip → 학교당 ~1초
- 학교 첫 등록 부트스트랩 — 학교당 사진 ~5장 동시 다운로드. 동시성 캡 3 으로
  제한해 60s 한도 안에 들어옴. 21 → 62개교 늘어나며 함수 시간 측정 중요해짐

### UI 확장 임계값

- ~10개교: 모달에 평면 리스트로 충분
- ~20개교: region 그룹핑 필요
- ~50개교 이상: 검색 입력창 필수
- 100+: 검색에 즐겨찾기 우선 정렬, 즐겨찾기 만 보기 토글 등 검토

---

## 2026-04-25 — [Stage 7] 사용자별 기본 학교(홈) 설정

### 목표 (북극성과의 연결)

학교 62개교 운영 중. "내가 자주 보는 학교가 첫 화면에 떠 있으면 좋겠다" 가
자연스러운 요구. 모든 사용자가 청계초로 떨어지는 동작은 1만 학교 시점에
명백히 잘못된 디폴트.

### 우선순위 결정

```
첫 진입 시 활성 학교
  ├─ ?schoolId=X 있음 → X (공유 링크 — 카톡 공유 케이스 우선)
  └─ 없음
       ├─ localStorage.homeSchoolId 있음 → 그 학교
       └─ 없음 → DEFAULT_SCHOOL_ID (chonggye)
```

URL 우선이라 카톡으로 받은 링크는 의도대로 동작. 직접 진입(URL 비어있음) 만
홈 학교로 떨어짐.

### 변경

#### `b7ba1ca` feat(ui): 사용자별 기본 학교(홈) 설정

**파일 1**: `src/components/SchoolSwitcher.tsx`
- `HOME_KEY = 'homeSchoolId'` 상수, `homeSchoolId` state 추가
- mount 시 useEffect 로 localStorage 로드 (즐겨찾기와 같은 패턴)
- `toggleHomeSchool(schoolId)` — 같은 학교 누르면 해제(null), 다른 학교면 교체
- `SchoolRow` 에 `home` prop + 🏠 토글 버튼 (별표 ⭐ 옆)
- 홈 학교는 학교명 앞에 🏠 이모지 prefix 로 시각 표시 (모달 안에서만)

**파일 2**: `src/components/MealView.tsx`
- mount 시 useEffect 1개 추가:
  - `schoolId` prop 있으면(URL 명시) → 손대지 않음
  - 없으면 localStorage 읽고, `SCHOOLS[home]` 에 존재하면 `setActiveSchoolId(home)`
  - 잘못된 id 는 무시 — 학교 삭제 시점에 안전

### SSR 깜빡임 처방

`page.tsx` 는 server component 라 첫 HTML 에 `school.name` 이 박혀 나간다. 사용자가
"의왕 왕곡초" 를 홈으로 설정해뒀어도 첫 paint 에 청계초가 잠시 보이고 mount 직후
왕곡초로 덮인다.

`page.tsx` 를 client-only 로 바꿔 깜빡임을 0 으로 만들 수도 있지만:
- OG 메타데이터·SEO 가 server-side 결정에 의존
- 깜빡임은 mount 직후 50ms 이내라 사용자 인지 한계 근처
- 공유 링크 케이스는 SSR 도 정확한 학교를 박고 나가므로 깜빡임 없음

→ **page.tsx server component 유지** 가 더 큰 가치 보존. 깜빡임은 의도적
트레이드오프.

### 검증

- 새 시크릿 창에서 `/` 진입 → 청계초 (DEFAULT) 노출
- 모달에서 의왕 왕곡초 선택 → 🏠 토글 → 모달 닫고 새 탭에서 `/` 진입 → 왕곡초
- URL `/?schoolId=chonggye` 직접 입력 → 청계초 (URL 우선)
- localStorage 의 `homeSchoolId` 값이 의왕 왕곡초로 저장됨 확인
- 같은 학교에 🏠 다시 누르면 해제, 다른 학교에 누르면 교체 확인

### 의도적으로 안 한 것

- **page.tsx client-only 전환** — OG/SEO 비용 > 깜빡임 비용
- **URL 에 homeSchoolId 자동 박기** — URL 은 지금 보는 학교, homeSchoolId 는
  디바이스 설정. 의미가 달라 분리
- **계정 기반 서버 동기화** — 계정/로그인 도입 시점에. 마이그레이션 단순(string)
- **즐겨찾기와 홈 통합** — 홈=1개, 즐겨찾기=N개 로 별개 개념. 사용 데이터 본 뒤
  통합 검토

---

## 2026-04-25 — [Stage 8] URL 자동 동기화 제거 — 공유 시점에만 URL 빌드

### 사용자 보고

> "핸드폰에 처음 이 사이트 들어간 다음에, 즐겨찾기로 추가하려면 이미 뒤에
> 날짜조건 등이 붙어 있는 경우가 있는 것 같아"

핸드폰 브라우저로 사이트 진입 → 사용자가 날짜·학교 몇 번 누르는 사이 URL 이
실시간으로 `?ymd=...&schoolId=...` 로 갱신됨 → 그 시점에 즐겨찾기 추가하면
그 날짜·학교가 영구히 박혀, 며칠 뒤 누르면 옛날 페이지가 뜸.

### 진단

`MealView.tsx` 의 useEffect 가 `selectedYmd`/`school.id` 변경마다
`window.history.replaceState` 로 URL 을 자동 동기화. 공유 가능성을 위한
의도였지만, 실제로는:
- 사용자가 사이트 탐색 중에 주소창을 따로 복사하는 일은 거의 없음
- 즐겨찾기 추가, 핸드폰 공유 시트의 "공유" 옵션 등에서 그 시점의 URL 이
  의도치 않게 캡처됨
- OG/메타데이터·API 들은 모두 server-side 결정이라 클라이언트 URL 동기화와
  완전히 무관 — **잃는 게 없는 동기화**

### 변경

#### `8bca3bf` fix(ui): URL 자동 동기화 제거

**파일 1**: `src/components/MealView.tsx`
- URL 동기화 useEffect 통째로 삭제
- 대신 `getShareUrl: () => string` 을 useCallback 으로 정의
  - `origin + pathname` 부터 깨끗한 base
  - `selectedYmd` 항상 set
  - 기본 학교가 아닐 때만 `schoolId` set
- MealCard 에 `getShareUrl` prop 으로 전달

**파일 2**: `src/components/MealCard.tsx`
- Props 에 `getShareUrl?: () => string` 추가 (옵션 — 미지정 시 폴백)
- `handleShare` 의 `new URL(window.location.href) + set('ymd', ymd)` 로직 제거
- 받은 `getShareUrl()` 을 그대로 share/clipboard 에 사용

### URL 의 의미가 정리됨

| 케이스 | URL 형태 |
| --- | --- |
| 직접 진입 / 즐겨찾기 | 깨끗한 `/` |
| 사용자가 날짜·학교 바꾸는 중 | 주소창 변하지 않음 |
| 카톡으로 받은 공유 링크 | `?schoolId=X&ymd=Y` 박힘 |
| 사용자가 공유 버튼 누름 | 그 시점 상태로 URL 빌드 → 공유 |

핸드폰 즐겨찾기 → 깨끗한 `/` → 다음 진입 시 [Stage 7] 의 홈 학교 + 오늘.
의도대로 자연 동작.

### Stage 7 와의 상호작용

홈 학교 적용 흐름 (`MealView.tsx` mount useEffect) 은 변경 없음:
- URL 에 schoolId 있으면 우선 (공유 링크 케이스)
- 없으면 localStorage `homeSchoolId`

이번 변경으로 "URL 에 schoolId 가 박히는 빈도" 가 줄어들 뿐, 흐름 자체는 같음.

### 잃는 것 — 그리고 받아들이는 이유

- **새로고침 시 그날 날짜 유지 안 됨** — 새로고침하면 오늘로 복귀. 단 학교는
  Stage 7 홈으로 유지라 큰 손실 아님. "오늘 날짜 보기" 가 가장 자주 쓰는
  케이스
- **사용자가 탐색 중 주소창 복사** — 이제 그 URL 은 `/` 라 무의미. 대신 공유
  버튼이 정확한 URL 빌드. 사용 패턴이 한 번 이동 — 더 명확한 감각

### 의도적으로 안 한 것

- **URL 갱신 자체를 완전 제거** — 공유 버튼은 여전히 빌드 필요. 자동 동기화만
  뺌
- **서버 redirect 로 URL 정리** — 공유 받는 사람의 URL 망가뜨림. 너무 공격적
- **Stage 7 흐름 변경** — 그대로

---

## Stage 9 — 대표 URL OG 분리 + 가독성/PWA/메타 정비 (2026-04-26)

사용자가 8가지 개선 사항을 한꺼번에 제안. 그 중 일부는 이미 구현돼 있고
(알레르기 표시, 요일 세로 배치, OG 메타 풍부) 일부는 단독으로도 큰 작업
(피드백 시스템, 주간 식단표 인쇄). 한 PR 로 묶기엔 검증이 어려워, 이번
Stage 에서는 **1·6·7·8 — 카톡 OG 분리 + 가독성 + PWA + 메타 강화** 만 처리.

남은 항목은 단독 Stage 로 분리:
- **Stage 10 후보**: 카톡 사진 불발 진단 (재현 비결정적)
- **Stage 11 후보**: 익명 피드백 + 어드민 (DB·API·UI·인증)
- **Stage 12 후보**: 주간 식단표 인쇄/공유 디자인

### 1번 — 대표 URL 카톡 카드 분리

**이전 동작**: 어떤 URL 이든 NEIS 호출 → 학교/날짜 식단으로 OG 메타 구성.
사용자가 `https://school-meal-phi.vercel.app/` 만 공유해도 카카오 카드에
"청계초등학교 4월 26일(일) 급식" 이 박혀, 학교 한정 사이트로 오해 유발.

**이후**: `?schoolId` 와 `?ymd` **둘 다 없으면** "오늘의 급식" 일반 카드.

| URL | 카카오 카드 |
| --- | --- |
| `/` (대표) | "오늘의 급식" + 부제 |
| `/?ymd=20260426` | 청계초 4월 26일 급식 (날짜만 있어도 풍성) |
| `/?schoolId=ch&ymd=20260426` | 그 학교/날짜 풍성 카드 |

**핵심 분기 규칙**: `!rawYmd && !rawSchoolId` 한 개. `page.tsx` 의
`generateMetadata` 와 `og/route.tsx` 둘 다 같은 분기 — 일관성 확보.

OG 라우트는 일반 카드 케이스에서 NEIS·미러 모두 안 침. 정적 응답에 가까움.
`s-maxage=86400` 으로 하루 캐시 (학교 한정 카드는 1시간).

### 6번 — 요일 탭 가독성

사용자 인식: "월27 처럼 한 단어로 읽힘". 실제 코드는 이미 세로 배치
(`WeekPicker.tsx`). 문제는 **시각적 분리가 약함**:
- `mb-0.5` (2px) — 요일·숫자 사이 너무 좁음
- `opacity-85` — 요일이 흐려져 숫자에 흡수

**조치**:
- `mb-0.5` → `mb-1.5` (6px)
- `opacity-85` 제거 + 비활성 상태에 `text-stone-500` 명시 (active 는 흰
  텍스트 유지하려 조건부)

### 7번 — PWA (manifest + 아이콘)

기존 `public/` 에는 `next.svg` 등 기본만 있고 manifest·아이콘 없음.

Next.js 16 의 file convention 활용 → 외부 디자인 자산 의존도 0:
- `app/icon.tsx` (32×32) — 빌드 타임 ImageResponse, 오렌지 배경 + 🍱
- `app/apple-icon.tsx` (180×180) — 같은 디자인, 라운드 corner 36px
- `app/manifest.ts` — `/manifest.webmanifest` 로 자동 서빙

**왜 정적 .png 안 두고 ImageResponse 인가**: 디자인 툴 없이 아이콘 생성
가능 + Next.js 가 자동 캐싱 (Static Routes 로 분류됨, 빌드 출력 확인).

### 8번 — 메타 태그

이미 풍부했음 (`page.tsx` 의 openGraph/twitter). 누락은 단 하나:
- `metadataBase` — `/api/og` 같은 상대 경로가 일부 OG 봇(특히 카톡)에서
  절대 URL 로 자동 변환 안 됨. `metadataBase: new URL(...)` 로 해결
- `appleWebApp` — iOS Safari "홈 화면에 추가" 시 상태바·제목 동작
- `viewport.themeColor` — Next.js 14+ 에서 metadata 가 아닌 viewport 로
  분리됨. `themeColor: '#FB923C'` 로 모바일 브라우저 상단 색

JSON-LD 구조화 데이터는 검색 노출용인데 학부모는 카톡 공유로 발견. 우선
순위 낮음 → 보류.

### 빌드 출력에서 확인된 새 라우트

```
○ /apple-icon
○ /icon
○ /manifest.webmanifest
```

모두 Static — 정적 prerender 됨. 런타임 호출 비용 0.

### 의도적으로 안 한 것

- **2번 (카톡 사진 불발)** — "때로는 보이고 때로는 안 보임" 비결정적 재현.
  추측 패치 금지, 단독 진단 Stage 로 분리
- **3번 (익명 피드백)** — DB 스키마 + RLS + 어드민 인증 단독 Stage 분량
- **5번 (주간 식단표 인쇄)** — 인쇄용 디자인은 시간 잡아먹는 영역. 단독
  Stage
- **JSON-LD/구조화 데이터** — 학부모는 카톡 공유로 발견, 검색 노출 우선
  순위 낮음
- **PWA service worker / 푸시 알림** — manifest + 아이콘만으로 "홈 화면
  추가" 가능. 오프라인·푸시는 별개 Stage
- **6번을 가로배치 → 세로배치로 구조 변경** — 이미 세로임. 시각 분리만
  강화하는 게 진짜 처방

---

## Stage 9-1 — 알레르기 코드 풀이 (2026-04-26)

**문제**: 메뉴 옆 `(1.5.8)` 같은 숫자가 NEIS 표준 코드인데 학부모가 무슨
뜻인지 모름. 풀어주는 게 친절.

**조치**:
- `src/lib/allergies.ts` — 식약처 19종 표준 매핑 (1=난류, 2=우유, …, 19=잣)
- `formatAllergyNames(["1","5"])` → "난류, 대두"
- `MealCard` 의 `(1.5.8)` 표시를 button 으로 바꾸고 점선 underline. 탭하면
  화면 하단 토스트로 "난류, 대두, 메밀" 2.5초

**왜 항상 풀어 보여주지 않고 탭으로 했나** — 메뉴마다 풀어 박으면 화면이
시끄러움. 알레르기 있는 사람만 필요. 평상시엔 작은 `(1.5.8)` 만 보이고
필요할 때 한 번 누르면 알 수 있게.

토스트 위치는 카드 사진 영역 안 absolute 였던 것을 화면 하단 fixed 로
이동 — 알레르기 풀이는 카드의 어느 부분(메뉴 리스트)을 눌러도 같은 위치에
떠야 함.

---

## Stage 10 — 주간 식단표 가정통신문 (2026-04-26)

### 목적

학부모용 가정통신문. 한 주 식단을 미리 알리는 용도. 받는 사람은 모바일에서
이미지로 보거나, 인쇄해서 집에 붙임. 사진 없음 (주 시작 전 시점이라 학교
사진이 아직 없음).

이게 "오늘 한 끼" UX 와는 단위가 다른 별개 결과물 — 한 주를 한 장의
이미지로 압축해야 카톡·인쇄 흐름이 자연스러움. 매번 5번 스크린샷 찍기는
비효율.

### 결정 — PNG 이미지 한 장

후보 비교:
- **PNG (채택)**: ImageResponse 로 서버 생성. 카톡/저장/인쇄 다 됨. 외부
  의존성 0 (next/og 이미 OG 라우트에서 사용 중)
- PDF: 한글 폰트 임베드 결로 큼, pdfkit/jspdf 등 라이브러리 도입 부담
- HTML 인쇄 전용 페이지: 공유까지 수용 못 함. 사용자가 인쇄 후 별도
  스크린샷 찍어 카톡 보내야 함 — 두 메커니즘 관리 비용 증가

PNG 가 모든 사용 케이스를 한 메커니즘으로 만족.

### 사이즈 — 1240×1754 (A4 2:3 비율)

- A4 = 210×297mm = 2:3
- 1240×1754 = ~150 DPI 인쇄 품질
- 모바일 화면에서도 충분히 큰 폰트 가능
- 기존 OG 1200×630(가로 카드)와 충돌 없는 별도 라우트(`/api/week`)

### 트리거 — 주 네비게이션 우측 작은 버튼 한 개

처음엔 "저장 + 공유 둘" 옵션도 검토했으나 모바일은 `navigator.share` 가
"앨범/카톡/문자" 다 포함하고 PC 는 share 미지원 → 자동으로 다운로드 폴백.
**OS 가 알아서 분기** 라 UI 슬롯은 하나로 묶는 게 더 자연스러움.

`◀ 주범위 ▶ 📤` — 주 네비 우측에 작은 download 아이콘.

### `navigator.share({ files })` vs `{ url }`

처음엔 `url` 로 보내려 했으나 카톡 OG 봇이 일반 카드(사이트 OG)를 만들고
식단표 PNG 가 안 박힘. **파일** 로 보내야 카톡이 이미지 첨부로 인식.

```ts
const blob = await fetch('/api/week?...').then(r => r.blob());
const file = new File([blob], filename, { type: 'image/png' });
if (navigator.canShare?.({ files: [file] })) {
  await navigator.share({ files: [file], title: '주간 식단표' });
}
// PC 폴백: <a download> 자동 클릭
```

### NEIS 5번 호출 비용

`fetchMealFromNeis` 가 이미 `revalidate: 3600` 캐시 + cron 매일 워밍 →
실제 NEIS 호출은 학교당 하루 2~3회 수준. 주간 라우트에서 5번 Promise.all
병렬 호출해도 캐시 hit 면 즉시.

### 변경 파일

- `src/app/api/week/route.tsx` — 신규. ImageResponse 1240×1754, 5일 세로 스택
- `src/components/WeekExportButton.tsx` — 신규. share API + 다운로드 폴백
- `src/components/MealView.tsx` — 주 네비 우측에 버튼 끼움 (▶ 옆)

### 의도적으로 안 한 것

- **사진 포함** — 주 시작 전이라 사진 없음. 회고용 결과물(지난 주) 은 별
  Stage
- **PDF 출력** — PNG 가 인쇄까지 만족
- **/print/week 전용 페이지** — 공유 흐름 따로 만들어야 함
- **저장·공유 별도 버튼** — share API 가 OS 분기 다 함
- **알레르기 19종 매핑 표 푸터에 출력** — 풀이된 이름이 이미 메뉴 옆에 있어
  중복. 푸터엔 "식약처 19종 기준" 한 줄만
- **개별 학생 알레르기 필터링** — 학교 단위 사이트라 개인화 안 함

---

## 운영 방향성 (2026-04-26 결정)

이 서비스는 **비영리** 로 운영한다. 영양교사 선생님들이 매일 따뜻한 급식을
차려주시는 그 노고에 감사하는 마음으로 시작한 프로젝트.

### 따라오는 의사결정 가이드

- **광고 X** — 배너, 인터스티셜, 제휴 마케팅 모두 안 함
- **결제·후원 버튼 X** — 학부모 결제 흐름은 만들지 않음. 비영리지만
  "기부 받음" 도 아님
- **유료 학교 등록 X** — 새 학교 추가는 무료, 등록 절차도 없음
- **메시지로 비영리/감사 텍스트를 사이트·이미지에 박지 않는다** — 사용자가
  "굳이 어디에 내용 넣을 필요 없다" 결정. 방향성은 코드와 운영에서 자연스럽게
  드러나면 충분. 광고 자리 비워둠 자체가 메시지

### 향후 결정 시 참고

이 줄에 부합하는지 점검:
- 새 기능이 영양교사·학부모·학생에게 도움이 되는가?
- 학교 행정 부담이 늘어나지 않는가?
- "수익 모델은?" 질문에는 답할 게 없어도 괜찮다 (의도된 비영리)

---

## Stage 11 — 홈 화면 추가 유도 (2026-04-26)

### 발견

사용자가 직접 "홈 화면에 추가" 해보고 **앱처럼 쓸 수 있다는 걸 발견**.
Stage 9 에서 manifest + apple-icon + appleWebApp 까지 깔아둬 PWA 인프라는
이미 작동 중이었으나, 일반 방문자는 그 메뉴를 알 길이 없음:
- iOS Safari: 공유 → "홈 화면에 추가" 5단계, 자동 안내 없음
- Android Chrome: 주소창 옆 "설치" 아이콘 작아 눈에 안 띔

처방: 사이트 하단에 작은 안내 배너 + 안드로이드는 직접 설치 다이얼로그.

### 플랫폼별 동작

**Android Chrome** — `beforeinstallprompt` 가로채기:
- 페이지 로드 시 브라우저가 BIP 이벤트 발사 (Chrome 의 휴리스틱 통과 시점)
- 이벤트 객체 보관 → 우리 "추가하기" 버튼 누르면 `evt.prompt()` 호출
- OS 가 설치 다이얼로그 띄움
- `appinstalled` 이벤트 → 배너 자동 숨김

**iOS Safari** — BIP 표준 미지원:
- 배너 누르면 모달이 떠서 3단계 그림 안내
  (공유 버튼 ⤴ → "홈 화면에 추가" → "추가")
- 모달 닫기 = "확인" / "다시 보지 않기"

**카카오 인앱 브라우저** — 차단:
- userAgent 에 `KAKAOTALK` 포함 시 배너 안 띄움
- 외부 브라우저로 열기 안내까지 가면 사용자 피로 ↑, 사이트는 정상 동작

### 표시 조건

다음 중 하나라도 true 면 숨김:
- 이미 standalone (홈 화면에서 켰을 때) — `display-mode: standalone` 또는
  iOS 의 `navigator.standalone === true`
- localStorage `dismissedInstallBanner === '1'` (X 누름)
- 데스크톱 (모바일 우선)
- 카톡 인앱 UA

### 변경 파일

- `src/components/InstallPrompt.tsx` — 신규. BIP + iOS 모달 + 닫기 기억
- `src/components/MealView.tsx` — 사진 안내 박스와 이메일/인스타 줄 사이 끼움

### 의도적으로 안 한 것

- **데스크톱 배너** — PWA 활용도 낮고 "홈 화면" 개념도 모호
- **카톡에서 외부 브라우저로 안내** — 사용자 피로
- **자동 prompt 호출** — OS 가 막음, 사용자 인터랙션 필요
- **A2HS 통계/추적** — 비영리, 운영 지표 안 모음
- **푸시 알림 권한** — 별 Stage. 지금은 install 만
- **Service Worker (오프라인 캐싱)** — 별 Stage
- **닫기 후 일정 시간 뒤 재노출** — 닫음 = 영구 닫음. 재표시는 사용자 짜증

---

## Stage 11-1 ~ 11-8 — 가벼운 미세 개선 묶음 (2026-04-26)

8개 작은 개선을 한 묶음으로. 각각 단독 Stage 만큼 큰 결정 없음.
나머지 미실행 후보는 `docs/backlog.md` 로 분리 관리.

### 11-1. PNG 한국어 폰트 임베드 (Pretendard)

`next/og` ImageResponse 의 satori 가 시스템 폰트 못 읽는 케이스 보험.
기존 OG 카드는 잘 보였으나 환경에 따라 깨질 위험. Pretendard otf 를
jsdelivr CDN 에서 fetch (next fetch 캐시 1일) → ArrayBuffer 로 fonts 옵션.

- `src/lib/og-fonts.ts` 신규 — Regular/Bold 둘 다 로드, in-memory 캐시
- og 라우트·week 라우트 둘 다 적용
- 폰트 fetch 실패 시 빈 배열 → 자동 sans-serif 폴백 (이미지 자체는 동작)
- fontFamily 를 `'Pretendard, sans-serif'` 로 (Pretendard 없으면 sans-serif)

### 11-2. 사진 클릭 → 전체 화면 lightbox

기존 카드의 작은 사진 → 탭하면 화면 전체로 확대. 다시 탭/X 누르면 닫기.

- `MealCard.tsx` 의 `<img>` 를 `<button>` 으로 감싸 클릭 핸들러
- `lightbox` state + 모달 (z-50, backdrop blur)

### 11-3. 토스트 위치 safe-area 보정

`fixed bottom-6` 만으로는 아이폰 홈 인디케이터·안드 제스처 바와 겹침
가능성. PWA standalone 모드에선 더 자주.

- `bottom: max(1.5rem, calc(env(safe-area-inset-bottom) + 1rem))`
- `MealCard.tsx`, `WeekExportButton.tsx` 둘 다 적용

### 11-4. 로딩 스켈레톤

기존: `🍱 맛있는 메뉴 가져오는 중...` 텍스트 → 카드 깜빡임 거슬림.
변경: 실제 카드와 같은 크기의 회색 박스 + 메뉴 라인 5개 (animate-pulse).

### 11-5. 공유 링크 진입 시 즐겨찾기 빠른 추가

URL 에 schoolId 가 있고(공유 받음) 그 학교가 favorites 에 없으면 작은
배너로 "즐겨찾기에 추가할까요?" 한 번 안내.

- `SharedLinkBanner.tsx` 신규
- localStorage `sharedLinkBanner:<schoolId>` 로 학교별 닫기 기억
  (다른 학교 공유 받으면 또 뜸)
- 위치: 사진 안내 박스 위 (URL 진입 케이스라 일찍 노출)

### 11-6. 학교 검색 별칭 매칭

기존: `name` + `region` 단순 includes 만 — '양정' 검색해도 '군포양정초'
못 찾는 경우 있음.

조치: 학교명에서 '초등학교/중학교/고등학교/초/중/고' 접미사,
'군포/의왕/안양/과천/서울/경기' prefix 떼낸 별칭으로도 매칭.

### 11-7. 요일 탭 오늘 표시 강화

기존: 노란 배경만 — 주말에 봤을 때 오늘 위치 즉시 안 보임.
조치: 우상단 작은 빨간 점 + ring-2 ring-yellow-400/40 ring-offset-1.
active 일 때도 빨간 점 보임 (오늘 = 동시에 active 가능).

### 11-8. 첫 방문자 주간 식단표 안내 풍선

WeekExportButton 옆에 1.5초 후 작은 풍선 한 번. localStorage
`sawWeekExportHint` 기록 → 한 번 보거나 export 한 번 하면 다시 안 뜸.

### 변경 파일 요약

- 신규: `src/lib/og-fonts.ts`, `src/components/SharedLinkBanner.tsx`
- 수정: `MealCard.tsx`, `MealView.tsx`, `WeekPicker.tsx`,
  `WeekExportButton.tsx`, `SchoolSwitcher.tsx`, `og/route.tsx`,
  `week/route.tsx`
- 신규 doc: `docs/backlog.md` (남은 미실행 후보들)

---

## Stage 11-9 — cron 스케줄 영양교사 업로드 타이밍에 맞춤 (2026-04-26)

### 발견

사용자(현직 관계자) 보고: **영양교사 선생님들이 보통 점심 후 1~2시에 사진을
업로드** 한다. 기존 cron 은 KST 08:00·15:00 로, 15:00 은 1~2시 업로드 직후가
아니라 1~2시간 늦은 시점이었음.

### 변경

vercel.json 의 cron 스케줄 (UTC 기준):

| KST | UTC | 의도 |
| --- | --- | --- |
| 08:00 | `0 23 * * *` | 등교 전 NEIS 워밍 (오늘+내일 메뉴 캐시) |
| 14:30 | `30 5 * * *` | **신규** — 영양교사 업로드 골든타임 직후 미러 |
| 17:00 | `0 8 * * *` | **변경** (15:00 → 17:00) — 늦게 올라온 사진 백업 |

### 왜 14:30 인가

학교 일과:
- 12:30 점심 시작
- 13:00~14:00 학생 식사 종료, 영양교사가 사진 업로드
- 14:00 직후가 사진이 가장 잘 잡히는 골든타임

cron 은 정시에 정확히 실행되지 않고 약간의 jitter 있어 14:30 으로 여유.
업로드를 마친 직후 미러링되어 OG 카드(카톡 공유) 에 즉시 반영됨.

### 17:00 백업 슬롯

일부 학교는 14시 이후에 늦게 올리는 케이스도 있어 17:00 한 번 더. 8시간
간격(14:30 → 17:00 → 다음날 08:00) 이 적당.

### Vercel Hobby cron 제한

Hobby 플랜은 cron 일일 실행 횟수 제한이 있음. 3회는 통상 허용 범위 내지만,
플랫폼 정책 변경 시 모니터링 필요.

### 참고 — UTC ↔ KST

KST = UTC + 9. 즉 KST 14:30 = UTC 05:30 (당일). KST 08:00 = UTC 23:00 (전일).

### 변경 파일

- `vercel.json` — crons 배열 3개로
- `AGENTS.md` — "하루 2회" → "하루 3회" 설명 갱신
