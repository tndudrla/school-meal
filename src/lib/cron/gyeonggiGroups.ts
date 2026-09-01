/**
 * 경기 region → 수원 / 나머지 (4도시) 분할 (Stage 15, 2026-09-02 도입).
 *
 * 분할 기준: 도메인 격리. 수원 101교는 `*-e.goesw.kr` 단일 인프라 (goeay/goegu
 * 에 이은 세 번째 경기 도메인) 라 work-log 도메인 위험도 "높음" 등급. 미검증
 * 인프라의 첫 실사용 wall time·성공률을 격리 관측하고, 문제 발생 시 기존
 * 4도시 75교를 말려들게 하지 않기 위해 전용 cron 으로 분리.
 *
 * ⚠️ `seoulDistricts.ts` 와 달리 allowlist 가 아니다 — 의도된 차이.
 * 서울 25구는 닫힌 집합이라 allowlist 가 맞지만, 경기는 시·군이 계속 추가되는
 * 열린 집합이다. `isGyeonggiRest` 를 allowlist (과천/의왕/안양/군포 나열) 로
 * 구현하면 다음 경기 시·군이 어느 cron 에도 안 속해 조용히 사진 갱신이 멈춘다.
 * 반드시 여집합 (`경기 ` 전체 − 수원) 으로 유지할 것.
 *
 * 회귀 방지 불변식: 두 술어의 합집합 == `경기 ` prefix 전체, 교집합 == 공집합.
 * `isGyeonggiRest` 는 `isSuwon` 을 호출한다 — 문자열 비교를 인라인하지 말 것.
 * 나중에 `isSuwon` 이 확장되면 (예: 수원 구 단위 분할) 인라인 사본은 따라가지
 * 않아 두 술어가 겹치거나 벌어진다. 단일 진실 원천은 `isSuwon` 하나다.
 * 새 경기 시·군 추가 시 자동으로 `isGyeonggiRest` 에 포함된다.
 * 검증: /api/dev/cron-coverage (AC-17 고아 검출기) 실행 — 새 region 추가 시 필수.
 */

/** region 이 수원인지. 전용 cron `refresh-photos-suwon` 의 필터 술어. */
export function isSuwon(region: string): boolean {
  return region === '경기 수원';
}

/**
 * region 이 수원을 제외한 경기 (과천·의왕·안양·군포 + 미래의 새 시·군) 인지.
 * 기존 cron `refresh-photos-gyeonggi` 의 필터 술어. 여집합 구현 — 위 주석 참조.
 */
export function isGyeonggiRest(region: string): boolean {
  return region.startsWith('경기 ') && !isSuwon(region);
}
