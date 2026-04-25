/**
 * 학교 메타 레지스트리.
 *
 * 북극성: 전국 초·중·고로 확장. 새 학교 추가는 SCHOOLS 객체에 한 항목 등록으로 끝나야 한다.
 *
 * Stage 3 에서 사진 미러를 켜면 'scrape' 가 있는 학교만 미러 대상이 된다.
 * NEIS 만 지원하는 학교(다른 시도 교육청 도메인 등)는 'scrape' 생략 가능 — 메뉴는 보이고
 * 사진은 안 보인다.
 */

import type { SchoolScrapeTarget } from './schoolScraper';

export type SchoolLevel = 'elementary' | 'middle' | 'high';

export interface SchoolConfig {
  /** URL 친화 키. /?schoolId=chonggye, /api/og?schoolId=chonggye 등에 쓰임. */
  id: string;
  /** 사용자 노출 이름. */
  name: string;
  level: SchoolLevel;
  /** 사용자 노출용 짧은 지역 표기. */
  region: string;
  /** NEIS Open API 식별자. */
  neis: { atptCode: string; schoolCode: string };
  /** 학교 홈페이지 사진 스크래핑 가능한 경우의 설정. */
  scrape?: SchoolScrapeTarget;
}

// 과천시 6개 초등학교. NEIS 코드와 scrape host 는 NEIS Open API 의
// HMPG_ADRES 응답에서 직접 추출 (추정 아님). ATPT 모두 J10(경기도교육청).
//
// `mi`(메뉴 식별자) 는 청계초 = 9904 가 검증된 값. 다른 학교의 mi 는 우선 9904
// 로 두고, cron 응답의 photos.count 가 0 인 학교는 학교별로 점검 후 보정.
// 사진이 안 잡히는 학교는 잠정적으로 scrape 만 빼면 메뉴는 보이고 사진은 안
// 보이는 상태로 유지(기존 피처 플래그가 그 케이스 처리).
export const SCHOOLS: Record<string, SchoolConfig> = {
  gwacheon: {
    id: 'gwacheon',
    name: '과천초등학교',
    level: 'elementary',
    region: '경기 과천',
    neis: { atptCode: 'J10', schoolCode: '7569010' },
    scrape: { host: 'gwacheon-e.goeay.kr', sysId: 'gwacheon-e', mi: '4417' },
  },
  kwanmun: {
    id: 'kwanmun',
    name: '관문초등학교',
    level: 'elementary',
    region: '경기 과천',
    neis: { atptCode: 'J10', schoolCode: '7569011' },
    scrape: { host: 'kwanmun-e.goeay.kr', sysId: 'kwanmun-e', mi: '1690' },
  },
  munwon: {
    id: 'munwon',
    name: '문원초등학교',
    level: 'elementary',
    region: '경기 과천',
    neis: { atptCode: 'J10', schoolCode: '7569018' },
    scrape: { host: 'munwon-e.goeay.kr', sysId: 'munwon-e', mi: '6562' },
  },
  chonggye: {
    id: 'chonggye',
    name: '청계초등학교',
    level: 'elementary',
    region: '경기 과천',
    neis: { atptCode: 'J10', schoolCode: '7569109' },
    scrape: { host: 'chonggye-e.goeay.kr', sysId: 'chonggye-e', mi: '9904' },
  },
  gcgh: {
    id: 'gcgh',
    name: '과천갈현초등학교',
    level: 'elementary',
    region: '경기 과천',
    neis: { atptCode: 'J10', schoolCode: '7569213' },
    scrape: { host: 'gcgh-e.goeay.kr', sysId: 'gcgh-e', mi: '4317' },
  },
  yulmok: {
    id: 'yulmok',
    name: '과천율목초등학교',
    level: 'elementary',
    region: '경기 과천',
    neis: { atptCode: 'J10', schoolCode: '7569216' },
    scrape: { host: 'yulmok-e.goeay.kr', sysId: 'yulmok-e', mi: '10984' },
  },

  // 의왕시 15개교 — scripts/build-school-config.mjs 자동 추출
  galmoe: {
    id: 'galmoe',
    name: '갈뫼초등학교',
    level: 'elementary',
    region: '경기 의왕',
    neis: { atptCode: 'J10', schoolCode: '7642003' },
    scrape: { host: 'galmoecho.goegu.kr', sysId: 'galmoecho', mi: '1287' },
  },
  gocheon: {
    id: 'gocheon',
    name: '고천초등학교',
    level: 'elementary',
    region: '경기 의왕',
    neis: { atptCode: 'J10', schoolCode: '7642004' },
    scrape: { host: 'gocheoncho.goegu.kr', sysId: 'gocheoncho', mi: '1435' },
  },
  naedong: {
    id: 'naedong',
    name: '내동초등학교',
    level: 'elementary',
    region: '경기 의왕',
    neis: { atptCode: 'J10', schoolCode: '7642076' },
    scrape: { host: 'naedongcho.goegu.kr', sysId: 'naedongcho', mi: '3738' },
  },
  naeson: {
    id: 'naeson',
    name: '내손초등학교',
    level: 'elementary',
    region: '경기 의왕',
    neis: { atptCode: 'J10', schoolCode: '7642014' },
    scrape: { host: 'naesoncho.goegu.kr', sysId: 'naesoncho', mi: '4194' },
  },
  deokjang: {
    id: 'deokjang',
    name: '덕장초등학교',
    level: 'elementary',
    region: '경기 의왕',
    neis: { atptCode: 'J10', schoolCode: '7642016' },
    scrape: { host: 'deokjangcho.goegu.kr', sysId: 'deokjangcho', mi: '6782' },
  },
  morak: {
    id: 'morak',
    name: '모락초등학교',
    level: 'elementary',
    region: '경기 의왕',
    neis: { atptCode: 'J10', schoolCode: '7642077' },
    scrape: { host: 'morakcho.goegu.kr', sysId: 'morakcho', mi: '5491' },
  },
  baekwoon: {
    id: 'baekwoon',
    name: '백운초등학교',
    level: 'elementary',
    region: '경기 의왕',
    neis: { atptCode: 'J10', schoolCode: '7642020' },
    scrape: { host: 'baekwooncho.goegu.kr', sysId: 'baekwooncho', mi: '2348' },
  },
  baekunhosu: {
    id: 'baekunhosu',
    name: '백운호수초등학교',
    level: 'elementary',
    region: '경기 의왕',
    neis: { atptCode: 'J10', schoolCode: '7642141' },
    scrape: { host: 'baekunhosucho.goegu.kr', sysId: 'baekunhosucho', mi: '6442' },
  },
  ojeon: {
    id: 'ojeon',
    name: '오전초등학교',
    level: 'elementary',
    region: '경기 의왕',
    neis: { atptCode: 'J10', schoolCode: '7642025' },
    scrape: { host: 'ojeoncho.goegu.kr', sysId: 'ojeoncho', mi: '4851' },
  },
  wanggok: {
    id: 'wanggok',
    name: '왕곡초등학교',
    level: 'elementary',
    region: '경기 의왕',
    neis: { atptCode: 'J10', schoolCode: '7642026' },
    scrape: { host: 'wanggokcho.goegu.kr', sysId: 'wanggokcho', mi: '5675' },
  },
  uiwangdeokseong: {
    id: 'uiwangdeokseong',
    name: '의왕덕성초등학교',
    level: 'elementary',
    region: '경기 의왕',
    neis: { atptCode: 'J10', schoolCode: '7642028' },
    scrape: { host: 'uiwangdeokseongcho.goegu.kr', sysId: 'uiwangdeokseongcho', mi: '2771' },
  },
  uiwangbugok: {
    id: 'uiwangbugok',
    name: '의왕부곡초등학교',
    level: 'elementary',
    region: '경기 의왕',
    neis: { atptCode: 'J10', schoolCode: '7642029' },
    scrape: { host: 'uiwangbugokcho.goegu.kr', sysId: 'uiwangbugokcho', mi: '3003' },
  },
  uiwang: {
    id: 'uiwang',
    name: '의왕초등학교',
    level: 'elementary',
    region: '경기 의왕',
    neis: { atptCode: 'J10', schoolCode: '7642030' },
    scrape: { host: 'uiwangcho.goegu.kr', sysId: 'uiwangcho', mi: '3485' },
  },
  uiwangpureun: {
    id: 'uiwangpureun',
    name: '의왕푸른초등학교',
    level: 'elementary',
    region: '경기 의왕',
    neis: { atptCode: 'J10', schoolCode: '7642152' },
    scrape: { host: 'uiwangpureuncho.goegu.kr', sysId: 'uiwangpureuncho', mi: '7471' },
  },
  poil: {
    id: 'poil',
    name: '포일초등학교',
    level: 'elementary',
    region: '경기 의왕',
    neis: { atptCode: 'J10', schoolCode: '7642126' },
    scrape: { host: 'poilcho.goegu.kr', sysId: 'poilcho', mi: '5084' },
  },
};

export const DEFAULT_SCHOOL_ID = 'chonggye';

/**
 * id 로 학교 조회. 잘못된 id 는 기본 학교(청계초)로 폴백.
 * 의도적으로 throw 하지 않는다 — 잘못된 schoolId 가 넘어와도 서비스는 동작해야 한다.
 */
export function getSchool(id?: string | null): SchoolConfig {
  if (id && SCHOOLS[id]) return SCHOOLS[id];
  return SCHOOLS[DEFAULT_SCHOOL_ID];
}

/** 등록된 모든 학교. cron 등에서 순회 용도. */
export function listSchools(): SchoolConfig[] {
  return Object.values(SCHOOLS);
}
