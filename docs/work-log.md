# 작업 기록

## 🎯 북극성 (서비스 최종 목표)

> **전국 초·중·고 학교의 급식을 한 곳에서 보고 공유할 수 있는 서비스.**

이 프로젝트의 모든 작업 결정은 "지금 청계초에 동작하는 게 1만 개 학교에서도 동작하는가?"라는
질문에 답할 수 있어야 한다. 단일 학교 가정·하드코딩·학교 서버 의존은 점진적으로 제거한다.

이 문서는 6개월 후에도 왜 어떤 결정을 내렸는지 추적하기 위한 기록이다.

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
- **사진 OG 용 리사이즈**: 1280px 원본 그대로 미러 중. 540×630 OG 사이즈로
  pre-resize 하면 Storage·egress 모두 절감 (sharp 또는 Supabase Edge Function).
- **모니터링/알림**: cron 실패 시 Slack/Discord 웹훅.
