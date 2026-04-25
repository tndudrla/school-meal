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

  // 안양시 41개교 — scripts/build-school-config.mjs 자동 추출
  // (동안구 26 + 만안구 15. 모두 *-e.goeay.kr 패턴)
  kwanyang: {
    id: 'kwanyang',
    name: '관양초등학교',
    level: 'elementary',
    region: '경기 안양',
    neis: { atptCode: 'J10', schoolCode: '7569012' },
    scrape: { host: 'kwanyang-e.goeay.kr', sysId: 'kwanyang-e', mi: '1753' },
  },
  kwiin: {
    id: 'kwiin',
    name: '귀인초등학교',
    level: 'elementary',
    region: '경기 안양',
    neis: { atptCode: 'J10', schoolCode: '7569013' },
    scrape: { host: 'kwiin-e.goeay.kr', sysId: 'kwiin-e', mi: '6187' },
  },
  nanum: {
    id: 'nanum',
    name: '나눔초등학교',
    level: 'elementary',
    region: '경기 안양',
    neis: { atptCode: 'J10', schoolCode: '7569014' },
    scrape: { host: 'nanum-e.goeay.kr', sysId: 'nanum-e', mi: '1848' },
  },
  daran: {
    id: 'daran',
    name: '달안초등학교',
    level: 'elementary',
    region: '경기 안양',
    neis: { atptCode: 'J10', schoolCode: '7569015' },
    scrape: { host: 'daran-e.goeay.kr', sysId: 'daran-e', mi: '6258' },
  },
  dongan: {
    id: 'dongan',
    name: '동안초등학교',
    level: 'elementary',
    region: '경기 안양',
    neis: { atptCode: 'J10', schoolCode: '7569017' },
    scrape: { host: 'dongan-e.goeay.kr', sysId: 'dongan-e', mi: '6342' },
  },
  minbaeg: {
    id: 'minbaeg',
    name: '민백초등학교',
    level: 'elementary',
    region: '경기 안양',
    neis: { atptCode: 'J10', schoolCode: '7569021' },
    scrape: { host: 'minbaeg-e.goeay.kr', sysId: 'minbaeg-e', mi: '2479' },
  },
  beolmal: {
    id: 'beolmal',
    name: '벌말초등학교',
    level: 'elementary',
    region: '경기 안양',
    neis: { atptCode: 'J10', schoolCode: '7569023' },
    scrape: { host: 'beolmal-e.goeay.kr', sysId: 'beolmal-e', mi: '3838' },
  },
  bumgye: {
    id: 'bumgye',
    name: '범계초등학교',
    level: 'elementary',
    region: '경기 안양',
    neis: { atptCode: 'J10', schoolCode: '7569024' },
    scrape: { host: 'bumgye-e.goeay.kr', sysId: 'bumgye-e', mi: '3632' },
  },
  burim: {
    id: 'burim',
    name: '부림초등학교',
    level: 'elementary',
    region: '경기 안양',
    neis: { atptCode: 'J10', schoolCode: '7569025' },
    scrape: { host: 'burim-e.goeay.kr', sysId: 'burim-e', mi: '3066' },
  },
  bisan: {
    id: 'bisan',
    name: '비산초등학교',
    level: 'elementary',
    region: '경기 안양',
    neis: { atptCode: 'J10', schoolCode: '7569026' },
    scrape: { host: 'bisan-e.goeay.kr', sysId: 'bisan-e', mi: '3851' },
  },
  sammoru: {
    id: 'sammoru',
    name: '샘모루초등학교',
    level: 'elementary',
    region: '경기 안양',
    neis: { atptCode: 'J10', schoolCode: '7569029' },
    scrape: { host: 'sammoru-e.goeay.kr', sysId: 'sammoru-e', mi: '6894' },
  },
  kwanak: {
    id: 'kwanak',
    name: '안양관악초등학교',
    level: 'elementary',
    region: '경기 안양',
    neis: { atptCode: 'J10', schoolCode: '7569033' },
    scrape: { host: 'kwanak-e.goeay.kr', sysId: 'kwanak-e', mi: '7058' },
  },
  aynam: {
    id: 'aynam',
    name: '안양남초등학교',
    level: 'elementary',
    region: '경기 안양',
    neis: { atptCode: 'J10', schoolCode: '7569034' },
    scrape: { host: 'aynam-e.goeay.kr', sysId: 'aynam-e', mi: '2737' },
  },
  aydh: {
    id: 'aydh',
    name: '안양덕현초등학교',
    level: 'elementary',
    region: '경기 안양',
    neis: { atptCode: 'J10', schoolCode: '7569035' },
    scrape: { host: 'aydh-e.goeay.kr', sysId: 'aydh-e', mi: '7132' },
  },
  anyangdong: {
    id: 'anyangdong',
    name: '안양동초등학교',
    level: 'elementary',
    region: '경기 안양',
    neis: { atptCode: 'J10', schoolCode: '7569036' },
    scrape: { host: 'anyangdong-e.goeay.kr', sysId: 'anyangdong-e', mi: '4637' },
  },
  aybuan: {
    id: 'aybuan',
    name: '안양부안초등학교',
    level: 'elementary',
    region: '경기 안양',
    neis: { atptCode: 'J10', schoolCode: '7569037' },
    scrape: { host: 'aybuan-e.goeay.kr', sysId: 'aybuan-e', mi: '1941' },
  },
  buheung: {
    id: 'buheung',
    name: '안양부흥초등학교',
    level: 'elementary',
    region: '경기 안양',
    neis: { atptCode: 'J10', schoolCode: '7569038' },
    scrape: { host: 'buheung-e.goeay.kr', sysId: 'buheung-e', mi: '2336' },
  },
  ayshingi: {
    id: 'ayshingi',
    name: '안양신기초등학교',
    level: 'elementary',
    region: '경기 안양',
    neis: { atptCode: 'J10', schoolCode: '7569040' },
    scrape: { host: 'ayshingi-e.goeay.kr', sysId: 'ayshingi-e', mi: '2056' },
  },
  ayja: {
    id: 'ayja',
    name: '안양중앙초등학교',
    level: 'elementary',
    region: '경기 안양',
    neis: { atptCode: 'J10', schoolCode: '7569042' },
    scrape: { host: 'ayja-e.goeay.kr', sysId: 'ayja-e', mi: '7373' },
  },
  indeogwon: {
    id: 'indeogwon',
    name: '인덕원초등학교',
    level: 'elementary',
    region: '경기 안양',
    neis: { atptCode: 'J10', schoolCode: '7569046' },
    scrape: { host: 'indeogwon-e.goeay.kr', sysId: 'indeogwon-e', mi: '7495' },
  },
  pc: {
    id: 'pc',
    name: '평촌초등학교',
    level: 'elementary',
    region: '경기 안양',
    neis: { atptCode: 'J10', schoolCode: '7569047' },
    scrape: { host: 'pc-e.goeay.kr', sysId: 'pc-e', mi: '7709' },
  },
  haeoleum: {
    id: 'haeoleum',
    name: '해오름초등학교',
    level: 'elementary',
    region: '경기 안양',
    neis: { atptCode: 'J10', schoolCode: '7569175' },
    scrape: { host: 'haeoleum-e.goeay.kr', sysId: 'haeoleum-e', mi: '3522' },
  },
  ayhogye: {
    id: 'ayhogye',
    name: '호계초등학교',
    level: 'elementary',
    region: '경기 안양',
    neis: { atptCode: 'J10', schoolCode: '7569048' },
    scrape: { host: 'ayhogye-e.goeay.kr', sysId: 'ayhogye-e', mi: '3975' },
  },
  hoseong: {
    id: 'hoseong',
    name: '호성초등학교',
    level: 'elementary',
    region: '경기 안양',
    neis: { atptCode: 'J10', schoolCode: '7569049' },
    scrape: { host: 'hoseong-e.goeay.kr', sysId: 'hoseong-e', mi: '7806' },
  },
  howon: {
    id: 'howon',
    name: '호원초등학교',
    level: 'elementary',
    region: '경기 안양',
    neis: { atptCode: 'J10', schoolCode: '7569050' },
    scrape: { host: 'howon-e.goeay.kr', sysId: 'howon-e', mi: '7863' },
  },
  heesung: {
    id: 'heesung',
    name: '희성초등학교',
    level: 'elementary',
    region: '경기 안양',
    neis: { atptCode: 'J10', schoolCode: '7569052' },
    scrape: { host: 'heesung-e.goeay.kr', sysId: 'heesung-e', mi: '3004' },
  },
  dukchon: {
    id: 'dukchon',
    name: '덕천초등학교',
    level: 'elementary',
    region: '경기 안양',
    neis: { atptCode: 'J10', schoolCode: '7569016' },
    scrape: { host: 'dukchon-e.goeay.kr', sysId: 'dukchon-e', mi: '4827' },
  },
  manan: {
    id: 'manan',
    name: '만안초등학교',
    level: 'elementary',
    region: '경기 안양',
    neis: { atptCode: 'J10', schoolCode: '7569019' },
    scrape: { host: 'manan-e.goeay.kr', sysId: 'manan-e', mi: '10584' },
  },
  myeonghak: {
    id: 'myeonghak',
    name: '명학초등학교',
    level: 'elementary',
    region: '경기 안양',
    neis: { atptCode: 'J10', schoolCode: '7569020' },
    scrape: { host: 'myeonghak-e.goeay.kr', sysId: 'myeonghak-e', mi: '6493' },
  },
  bakdal: {
    id: 'bakdal',
    name: '박달초등학교',
    level: 'elementary',
    region: '경기 안양',
    neis: { atptCode: 'J10', schoolCode: '7569022' },
    scrape: { host: 'bakdal-e.goeay.kr', sysId: 'bakdal-e', mi: '3355' },
  },
  sambong: {
    id: 'sambong',
    name: '삼봉초등학교',
    level: 'elementary',
    region: '경기 안양',
    neis: { atptCode: 'J10', schoolCode: '7569027' },
    scrape: { host: 'sambong-e.goeay.kr', sysId: 'sambong-e', mi: '9678' },
  },
  samsung: {
    id: 'samsung',
    name: '삼성초등학교',
    level: 'elementary',
    region: '경기 안양',
    neis: { atptCode: 'J10', schoolCode: '7569028' },
    scrape: { host: 'samsung-e.goeay.kr', sysId: 'samsung-e', mi: '6769' },
  },
  suksu: {
    id: 'suksu',
    name: '석수초등학교',
    level: 'elementary',
    region: '경기 안양',
    neis: { atptCode: 'J10', schoolCode: '7569030' },
    scrape: { host: 'suksu-e.goeay.kr', sysId: 'suksu-e', mi: '7001' },
  },
  sinan: {
    id: 'sinan',
    name: '신안초등학교',
    level: 'elementary',
    region: '경기 안양',
    neis: { atptCode: 'J10', schoolCode: '7569031' },
    scrape: { host: 'sinan-e.goeay.kr', sysId: 'sinan-e', mi: '2212' },
  },
  ayseo: {
    id: 'ayseo',
    name: '안양서초등학교',
    level: 'elementary',
    region: '경기 안양',
    neis: { atptCode: 'J10', schoolCode: '7569039' },
    scrape: { host: 'ayseo-e.goeay.kr', sysId: 'ayseo-e', mi: '7235' },
  },
  ayangji: {
    id: 'ayangji',
    name: '안양양지초등학교',
    level: 'elementary',
    region: '경기 안양',
    neis: { atptCode: 'J10', schoolCode: '7569041' },
    scrape: { host: 'ayangji-e.goeay.kr', sysId: 'ayangji-e', mi: '2324' },
  },
  anyang: {
    id: 'anyang',
    name: '안양초등학교',
    level: 'elementary',
    region: '경기 안양',
    neis: { atptCode: 'J10', schoolCode: '7569032' },
    scrape: { host: 'anyang-e.goeay.kr', sysId: 'anyang-e', mi: '4500' },
  },
  ayhoam: {
    id: 'ayhoam',
    name: '안양호암초등학교',
    level: 'elementary',
    region: '경기 안양',
    neis: { atptCode: 'J10', schoolCode: '7569043' },
    scrape: { host: 'ayhoam-e.goeay.kr', sysId: 'ayhoam-e', mi: '4658' },
  },
  anil: {
    id: 'anil',
    name: '안일초등학교',
    level: 'elementary',
    region: '경기 안양',
    neis: { atptCode: 'J10', schoolCode: '7569044' },
    scrape: { host: 'anil-e.goeay.kr', sysId: 'anil-e', mi: '1867' },
  },
  yeonhyeon: {
    id: 'yeonhyeon',
    name: '연현초등학교',
    level: 'elementary',
    region: '경기 안양',
    neis: { atptCode: 'J10', schoolCode: '7569045' },
    scrape: { host: 'yeonhyeon-e.goeay.kr', sysId: 'yeonhyeon-e', mi: '3010' },
  },
  hwachang: {
    id: 'hwachang',
    name: '화창초등학교',
    level: 'elementary',
    region: '경기 안양',
    neis: { atptCode: 'J10', schoolCode: '7569051' },
    scrape: { host: 'hwachang-e.goeay.kr', sysId: 'hwachang-e', mi: '5338' },
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
