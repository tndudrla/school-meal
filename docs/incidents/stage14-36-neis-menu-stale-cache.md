# Stage 14-36 — NEIS 급식 메뉴 `null` 캐시 사고

- 발생일: 2026-08-28
- 영향: 운영 `/api/meal`이 NEIS에 존재하는 당일 메뉴를 `{"meal":null}`로 반환
- 대표 사례: 경기 과천 청계초등학교, 2026-08-28 중식
- 최종 상태: 2026-08-28 18:41 KST 자동 재검증 후 정상 복구
- 소스 변경: 없음. 본 Stage는 운영 조사·복구 확인·후속 대응 계획 기록이다.

## 1. 사용자 증상

청계초 학교 홈페이지에는 2026-08-28 중식과 사진이 게시돼 있었지만, 서비스에서는
급식 메뉴가 표시되지 않았다.

운영 API도 같은 증상을 보였다.

```json
{"meal":null}
```

## 2. 원본 데이터 검증

학교 레지스트리의 청계초 NEIS 식별자는 다음과 같으며 실제 학교 정보와 일치했다.

- 교육청 코드: `J10`
- 학교 코드: `7569109`
- 코드 위치: `src/lib/schools/gyeonggi.ts`

같은 식별자로 NEIS `mealServiceDietInfo`를 직접 조회하면 2026-08-28 중식이
정상 반환됐다.

- 보리밥
- 닭곰탕&당면
- 숙주미나리무침
- 꽃떡갈비
- 배추김치
- 참외
- 536.3 Kcal

따라서 학교 코드 오류나 NEIS 원본 데이터 부재는 아니었다.

## 3. 관찰 타임라인

| KST | 관찰 |
|---|---|
| 17:41 | 청계초 및 경기·서울 대표 학교 `/api/meal`이 모두 `meal:null` |
| 17:55 | 청계초 재조회도 `meal:null` |
| 18:02 | 두 차례 재조회 모두 `meal:null` |
| 18:41:05 | 사용자 브라우저 첫 조회는 여전히 `meal:null` |
| 18:41:41 | 서버 재조회에서 청계초 정상 메뉴 반환 |
| 18:42 | 청계초·과천초·서울개원초·서울상명초 대표 4개교 모두 정상 반환 |

18:41 첫 요청과 약 36초 뒤 요청의 결과가 달라졌다. 이는 Next.js time-based
revalidation의 stale-while-revalidate 동작, 즉 첫 요청에는 stale 값을 제공하고
백그라운드 갱신 완료 후 다음 요청에 fresh 값을 제공하는 흐름과 일치한다.

## 4. 가장 강하게 지지되는 원인

### 4.1 provider 오류와 정상 무자료를 구분하지 않음

`src/lib/neis.ts`는 NEIS 응답의 top-level `RESULT`가 `INFO-000`이 아니면 모두
`null`로 반환한다.

```ts
if (data.RESULT && data.RESULT.CODE !== 'INFO-000') {
  return null;
}
```

이 때문에 다음 상태가 사용자와 cron에 모두 같은 `meal:null`로 보인다.

- 실제 급식정보 없음
- 인증키 오류
- 호출 제한
- NEIS 일시 장애
- 예상하지 못한 응답 구조

### 4.2 검증 전 원시 응답을 1시간 캐시

NEIS 호출은 `fetch(..., { next: { revalidate: 3600 } })`을 사용한다. NEIS는
provider 오류도 HTTP 200 JSON으로 반환할 수 있으므로, 애플리케이션이 오류로
분류하기 전에 raw 오류 응답이 fetch cache에 저장될 수 있다.

### 4.3 17시 cron의 과도한 동시 요청 가능성

`refresh-neis`는 등록 학교 전체에 대해 오늘·내일 요청을 하나의 `Promise.all`로
실행한다. 685개교 기준 한 회차에 약 1,370건이 같은 NEIS host로 동시에 전송된다.

17시 cron 이후 여러 학교가 동시에 `null`이었던 점과, 한 시간 이상 지난 뒤
stale 재검증을 거쳐 함께 회복된 점을 고려하면 다음 흐름이 가장 유력하다.

1. cron 대량 동시 요청 중 일부 provider 오류 또는 제한 응답 발생
2. 오류 응답이 `null`로 변환되고 raw fetch cache에 저장
3. 사용자에게 정상 빈 메뉴처럼 노출
4. cache stale 진입 후 첫 요청이 background revalidation 촉발
5. NEIS 정상 응답으로 cache가 교체되며 서비스 자동 복구

당시 코드가 provider 오류 코드를 로그에 남기지 않으므로 정확한 NEIS 오류 코드는
사후 확정할 수 없다. 따라서 위 결론은 운영 증거에 가장 잘 맞는 추론이며, 확정적
원인 코드는 후속 관측성 개선 후 재발 시 확인해야 한다.

## 5. 인증키 확인 결과

- NEIS 포털에서 발급 상태 `정상` 확인
- Vercel `NEIS_API_KEY`가 Production 환경에 등록된 것 확인
- 로컬에 설정된 키로 NEIS 원본 단건 조회 성공
- 인증키 값은 화면 공유 과정에서 노출됐으므로 재발급·교체 권장

키의 영구 폐기보다는 cron 동시호출과 오류 캐시가 이번 현상을 더 잘 설명한다.
단, Vercel에 저장된 실제 값의 공백·따옴표·불일치는 별도 보안 점검 대상으로 남긴다.

## 6. 사진 파이프라인 확인

사진 장애도 함께 조사했으나 전체 미러 장애는 아니었다.

- 15:59 오늘 미러 286건
- 16:06 오늘 미러 382건
- 16:12 오늘 미러 401건
- 경기·서울 1·서울 2 그룹 모두 비슷한 비율로 증가
- 청계초 및 서울 대표 학교의 Supabase JPEG가 HTTP 200 반환

다만 `/api/meal/photo`는 학교 원본 조회 결과가 `null`이어도 성공 응답과 같은
1시간 CDN 캐시를 적용한다. 사진이 늦게 올라오면 미러가 생긴 뒤에도 기존
`null` 응답 때문에 최대 1시간 이상 `사진 준비중`으로 남을 수 있다. 이 문제는
NEIS 사고와 별도 후속 변경으로 처리한다.

## 7. 재발 방지 계획

### 7.1 NEIS 응답 계약

- 정상 데이터: `Meal` 반환
- 명시적인 정상 무자료: `null` 반환
- `ERROR-*`, 쿼터, 인증, 알 수 없는 구조: `NeisProviderError` throw
- 인증키·전체 요청 URL은 로그와 응답에 남기지 않음

### 7.2 캐시 경계

- NEIS raw fetch는 `no-store`
- 검증·파싱 완료된 `Meal | null`만 애플리케이션 캐시에 저장
- provider 오류는 캐시하지 않음
- 정상 빈 결과는 짧게 캐시
- cron 시작 시 메뉴 cache tag를 명시적으로 만료하고 fresh warm

### 7.3 cron 부하와 관측성

- 전체 `Promise.all`을 50~100개 학교 chunk로 전환
- `hasMeal`, `noData`, `providerError` 별도 집계
- `ERROR-290` 같은 인증 오류는 cron 실패 처리
- provider error 비율이 임계치를 넘으면 HTTP 502로 종료
- 오류 로그에는 학교 ID, ymd, provider error code만 기록

### 7.4 테스트

- 정상 메뉴 JSON 파싱
- `INFO-200`은 `null`
- `ERROR-290`은 provider error
- 호출 제한 응답은 provider error
- provider 오류가 캐시에 남지 않는지 확인
- 청계초 known-date 운영 스모크 테스트

## 8. 운영 체크리스트

1. 노출된 NEIS 키 재발급 및 Vercel Production 교체
2. 환경변수 변경 후 Production 재배포
3. 전체 cron 실행 전에 known-date 단건 API 검증
4. cron 동시성 개선 배포 후 수동 warm
5. 대표 지역별 메뉴 응답 확인
6. 24시간 동안 세 cron 회차의 provider error와 성공 건수 관찰

## 9. 완료 기준

- NEIS 원본에 데이터가 있으면 운영 `/api/meal`도 같은 메뉴를 반환한다.
- provider 오류가 `meal:null`로 숨겨지지 않는다.
- provider 오류 응답이 장기 캐시되지 않는다.
- 전역 인증·쿼터 장애가 cron HTTP 성공으로 끝나지 않는다.
- 사진, OG, 주간 식단표 경로가 회귀하지 않는다.
- 관련 테스트, 타입검사, lint, build가 통과한다.

## 10. 후속 작업 상태

이번 Stage에서는 운영 복구 확인과 사고 기록까지만 완료했다. 위 재발 방지 코드는
별도 구현·검증·배포가 필요하다. 실행 계획 원본은 로컬 OMX 계획 문서
`.omx/plans/neis-incident-response.md`에 보관했다.
