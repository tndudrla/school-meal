/**
 * 서울 25 자치구 → 강남권/강북권 분할 (Stage 14-32, 2026-05-03 도입).
 *
 * 분할 기준: 한강 이남/이북. sen.es.kr 동시 outbound 부담 분산 + 학교 수
 * 균형 (304/306) 양쪽 다 만족. 자치구 region 명은 region 필드의 prefix
 * 떼낸 짧은 이름과 일치 ("서울 강남" → "강남").
 *
 * 운영 메모:
 *   Stage 14-31 통합 서울 cron (610교) 의 600s 504 처방. sen.es.kr 도메인
 *   누적 wall time 이 chunk 30 sequential 안에서 batch 후반 4~5초까지 늘어
 *   600s 한도 초과. 그룹 분할로 batch 수가 21 → 11 로 줄어 누적 효과 자연
 *   해결. 학교 서버 부담 자체는 같은 시각 trigger 라 변동 없음.
 *
 * 새 자치구 등록 시 둘 중 한 list 에 추가. 두 list 의 합이 src/lib/schools/seoul/
 * 의 자치구 갯수와 일치해야 함 (회귀 방지 — 누락된 자치구는 어느 cron 도
 * 안 도는 사고).
 */

export const SEOUL_GROUP_1 = [
  // 강남권 (한강 이남 11구, 304교)
  '강남',
  '강동',
  '강서',
  '관악',
  '구로',
  '금천',
  '동작',
  '서초',
  '송파',
  '양천',
  '영등포',
] as const;

export const SEOUL_GROUP_2 = [
  // 강북권 (한강 이북 14구, 306교)
  '강북',
  '광진',
  '노원',
  '도봉',
  '동대문',
  '마포',
  '서대문',
  '성동',
  '성북',
  '용산',
  '은평',
  '종로',
  // Stage 15 (2026-09-02) 정정: '중' → '중구'. jung.ts 의 region 은 '서울 중구'
  // 로 등록돼 있어 slice(3) 결과 '중구' 가 '중' 과 불일치 → Stage 14-32 도입
  // 이후 중구 11교 (scrape 보유) 가 어느 사진 cron 에도 안 도는 고아 상태였다.
  // 앱이 미러 miss 시 학교 직접 폴백이라 증상이 조용히 묻혀 있었음.
  // AC-17 고아 검출기 (/api/dev/cron-coverage) 첫 실행에서 발견.
  '중구',
  '중랑',
] as const;

/**
 * "서울 X" region 이 강남권 (Seoul-1) 인지.
 * 라우트의 listSchools().filter() 로직.
 */
export function isSeoulGroup1(region: string): boolean {
  if (!region.startsWith('서울 ')) return false;
  const district = region.slice(3); // '서울 강남' → '강남'
  return (SEOUL_GROUP_1 as readonly string[]).includes(district);
}

/**
 * "서울 X" region 이 강북권 (Seoul-2) 인지.
 */
export function isSeoulGroup2(region: string): boolean {
  if (!region.startsWith('서울 ')) return false;
  const district = region.slice(3);
  return (SEOUL_GROUP_2 as readonly string[]).includes(district);
}
