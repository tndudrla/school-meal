#!/usr/bin/env node
/**
 * 학교 SchoolConfig 자동 생성기 (일회성 도구).
 *
 * NEIS Open API 로 학교 정보를 받고, 그 학교 홈페이지의 main.do 에서
 * 식단 메뉴 mi 를 정규식 추출해 src/lib/schools.ts 에 붙여넣을 수 있는
 * 객체 리터럴을 표준출력에 찍는다.
 *
 * 두 모드:
 *   --names <파일경로>   한 줄에 한 학교명. 학교당 NEIS 1회 호출 (무키 OK).
 *   --city  <시이름>     NEIS 키 있을 때 시 단위 일괄 조회. 무키면 실패.
 *
 * 사용 예:
 *   node scripts/build-school-config.mjs --names schools-uiwang.txt > out.txt
 *   node scripts/build-school-config.mjs --city 의왕시
 *
 * stdout 에는 SchoolConfig 들, stderr 에는 진행/요약 로그.
 *
 * 의존성: Node 20+ 표준 라이브러리만 (fetch, fs/promises).
 */

import fs from 'node:fs/promises';

// ----- 설정 ------------------------------------------------------------------

const NEIS_BASE = 'https://open.neis.go.kr/hub/schoolInfo';
// ATPT 코드 (시도교육청). default J10 = 경기. --atpt 로 다른 시도 지정 가능.
//   J10 경기, B10 서울, C10 부산, D10 대구, ...
// 같은 빌드 실행은 단일 시도만 처리 (출력 region 도 그 시도 기준으로 고정).
const DEFAULT_ATPT = 'J10';
const NEIS_KEY = process.env.NEIS_API_KEY ?? '';
const UA = 'Mozilla/5.0 (compatible; school-meal-build-script)';
const FETCH_TIMEOUT_MS = 15000;

// ----- 인자 파싱 ------------------------------------------------------------

function parseArgs(argv) {
  const args = { mode: null, value: null, atpt: DEFAULT_ATPT, idPrefix: '' };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--names') {
      args.mode = 'names';
      args.value = argv[++i];
    } else if (a === '--city') {
      args.mode = 'city';
      args.value = argv[++i];
    } else if (a === '--atpt') {
      args.atpt = (argv[++i] ?? '').toUpperCase();
    } else if (a === '--id-prefix') {
      args.idPrefix = argv[++i] ?? '';
    } else if (a === '-h' || a === '--help') {
      printHelpAndExit(0);
    }
  }
  if (!args.mode || !args.value) printHelpAndExit(1);
  if (!/^[A-Z]\d{2}$/.test(args.atpt)) {
    console.error(`[error] --atpt 값이 잘못됨: ${args.atpt}. 예: J10, B10, C10`);
    process.exit(2);
  }
  return args;
}

function printHelpAndExit(code) {
  const out = code === 0 ? console.log : console.error;
  out(`사용법:
  node scripts/build-school-config.mjs [--atpt <코드>] --names <파일경로>
      한 줄에 한 학교명을 적은 텍스트 파일. NEIS 무키로도 동작.

  node scripts/build-school-config.mjs [--atpt <코드>] --city <시이름>
      예: --city 의왕시. NEIS_API_KEY 환경변수 필요 (키 없으면 종료).

  --atpt <코드>  시도교육청 코드. 미지정 시 J10 (경기). 예: B10 서울, C10 부산.
  --id-prefix <s>  자동 생성 id 앞에 붙일 접두. 미지정 시 없음 (기존 동작).
                   예: --id-prefix suwon_ → suwon_gosaek (Stage 15 시별 네임스페이스)
`);
  process.exit(code);
}

// ----- 공통 유틸 ------------------------------------------------------------

async function fetchWithTimeout(url, init = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, {
      ...init,
      signal: ctrl.signal,
      headers: { 'User-Agent': UA, ...(init.headers ?? {}) },
    });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * "경기도 의왕시 ..." → "경기 의왕"
 * "서울특별시 서초구 ..." → "서울 서초"
 * 다른 광역시·도도 같은 패턴으로 처리.
 *
 * 접미가 생략된 주소도 허용 (Stage 15): 수원 영통초·송죽초의 ORG_RDNMA 가
 * "경기 수원시 ..." 로 등록돼 있어 (NEIS 데이터 품질 편차) 접미 필수 정규식이
 * region '' 을 내던 버그 수정. 접미 optional 이어도 lazy 매치가 "경기도" 를
 * "경기"+도 로 정확히 쪼개므로 기존 주소 출력은 불변.
 */
function regionFromAddress(addr) {
  if (!addr) return '';
  // 도/특별시/광역시/자치시 접미 제거 + 시/구/군 단위 한 단어 추출
  const m = addr.match(
    /^([가-힣]+?)(?:특별시|광역시|특별자치시|특별자치도|도)?\s+([가-힣]+?)(?:시|구|군)/
  );
  if (m) return `${m[1]} ${m[2]}`;
  return '';
}

/** HMPG_ADRES 응답에서 host 만 추출. 잡음 제거. */
function hostFromHmpg(raw) {
  if (!raw) return null;
  // 학교 입력 데이터에 앞뒤 공백·탭 섞이는 케이스 관찰됨 (안양 평촌초 등)
  const trimmed = raw.trim();
  // "https://...", "host/...", 또는 host 단독 모두 처리
  const stripped = trimmed.replace(/^https?:\/\//i, '').split('/')[0].trim();
  return stripped ? stripped.toLowerCase() : null;
}

/**
 * host 가 학교 CMS 도메인이면 sysId 반환.
 * 관찰된 패턴:
 *   - *-e.goeay.kr (경기 안양/과천 등)
 *   - *.goegu.kr  (경기 의왕/군포 등)
 *   - *-e.goesw.kr (경기 수원 — Stage 15. goeay 와 동일 CMS, 파서 호환 실측 완료)
 *   - *.sen.es.kr (서울 초등) — sysId 자리는 학교 약칭 (seocho, banpo 등)
 *
 * sen.es.kr 의 sysId 는 mi 추출 단계 (selectFoodMenuView.do) 에서 어차피
 * 매치 안 됨 → buildOne 이 scrape 생략된 base 객체만 출력 (의도된 동작).
 */
function sysIdFromHost(host) {
  if (!host) return null;
  // 경기 패턴 (goeay/goegu/goesw — 같은 CMS 계열, kind: 'goeay' 파서 공유)
  const ggn = host.match(/^([a-z0-9-]+)\.(goeay|goegu|goesw)\.kr$/i);
  if (ggn) return ggn[1];
  // 서울 sen.es.kr 패턴 (예: seocho.sen.es.kr → seocho)
  const senEs = host.match(/^([a-z0-9-]+)\.sen\.es\.kr$/i);
  if (senEs) return senEs[1];
  return null;
}

/**
 * host → schoolScraper.ts 의 scrape.kind 값 (Stage 15, F-2 버그 수정).
 * 이 스크립트가 kind 도입 (Stage 14-1) 이전 버전이라 출력에 kind 가 없어
 * 그대로 붙이면 TS union (SchoolScrape) 불만족 → 컴파일 에러가 났다.
 */
function kindFromHost(host) {
  if (/\.(goeay|goegu|goesw)\.kr$/i.test(host)) return 'goeay';
  if (/\.sen\.es\.kr$/i.test(host)) return 'sen-es';
  return null;
}

/**
 * sysId 에서 학교 id (URL 친화 키) 생성.
 * - `-e` 접미 (goeay 패턴): chonggye-e → chonggye
 * - `cho` 접미 (goegu 패턴): naedongcho → naedong
 * - 그 외 (서울 sen.es 등): 그대로 사용. id 충돌은 used set 으로 회피.
 */
function idFromSysId(sysId) {
  return sysId.replace(/-e$/, '').replace(/cho$/, '');
}

// ----- NEIS 조회 -------------------------------------------------------------

async function neisQuery(searchTerm, page = 1, atpt = DEFAULT_ATPT) {
  const u = new URL(NEIS_BASE);
  u.searchParams.set('Type', 'json');
  u.searchParams.set('pSize', '100');
  u.searchParams.set('pIndex', String(page));
  u.searchParams.set('ATPT_OFCDC_SC_CODE', atpt);
  u.searchParams.set('SCHUL_NM', searchTerm);
  if (NEIS_KEY) u.searchParams.set('KEY', NEIS_KEY);

  const res = await fetchWithTimeout(u.toString());
  if (!res.ok) throw new Error(`NEIS HTTP ${res.status}`);
  const data = await res.json();
  if (data.RESULT && data.RESULT.CODE !== 'INFO-000') return [];
  return data.schoolInfo?.[1]?.row ?? [];
}

async function neisSearchByName(name, atpt = DEFAULT_ATPT) {
  // NEIS 두 가지 quirk:
  // 1. SCHUL_NM 풀네임 일치 시 0건 돌려주는 학교가 있음 (예: 백운호수초등학교)
  //    → 풀네임 실패 시 "초등학교" 떼고 키워드 폴백
  // 2. 무키 호출은 pSize/pIndex 가 강제 5 + 첫 페이지만 → 키워드 너무 흔하면
  //    상위 5건에 안 들어와 묻힘. 키 있으면 페이징, 없으면 풀네임 우선 전략
  // 전략: 풀네임 시도 → 빈 결과 시 키워드 폴백
  const fullResults = await neisQuery(name, 1, atpt);
  if (fullResults.length > 0) return fullResults;

  const keyword = name.replace(/(초|중|고)등학교$/u, '');
  if (keyword === name) return []; // 키워드 변형 없음

  // 키 있을 때만 페이징 누적, 무키는 첫 페이지만
  const collected = [];
  const maxPages = NEIS_KEY ? 20 : 1;
  for (let page = 1; page <= maxPages; page++) {
    const rows = await neisQuery(keyword, page, atpt);
    if (rows.length === 0) break;
    collected.push(...rows);
    if (rows.length < 100) break;
  }
  return collected;
}

async function neisSearchByCity(cityName, atpt = DEFAULT_ATPT) {
  if (!NEIS_KEY) {
    console.error(
      `[error] --city 모드는 NEIS_API_KEY 환경변수가 필요합니다.
        무키 호출은 pSize 가 5 로 강제돼 시 단위 조회가 비효율.
        대신 --names 파일경로 모드로 전환하세요.`
    );
    process.exit(2);
  }
  // 키 있을 때 — 페이징해 가며 ORG_RDNMA 에 시 이름 포함된 학교만 채택
  const collected = [];
  for (let page = 1; page < 50; page++) {
    const u = new URL(NEIS_BASE);
    u.searchParams.set('Type', 'json');
    u.searchParams.set('pSize', '1000');
    u.searchParams.set('pIndex', String(page));
    u.searchParams.set('ATPT_OFCDC_SC_CODE', atpt);
    u.searchParams.set('SCHUL_KND_SC_NM', '초등학교');
    u.searchParams.set('KEY', NEIS_KEY);
    const res = await fetchWithTimeout(u.toString());
    if (!res.ok) throw new Error(`NEIS HTTP ${res.status} (page ${page})`);
    const data = await res.json();
    if (data.RESULT && data.RESULT.CODE !== 'INFO-000') break;
    const rows = data.schoolInfo?.[1]?.row ?? [];
    for (const r of rows) {
      if ((r.ORG_RDNMA ?? '').includes(cityName)) collected.push(r);
    }
    if (rows.length < 1000) break;
  }
  return collected;
}

// ----- 학교 메인 페이지에서 mi 추출 -----------------------------------------

async function fetchMiFromMain(host, sysId) {
  const url = `https://${host}/${sysId}/main.do`;
  let res;
  try {
    res = await fetchWithTimeout(url);
  } catch (err) {
    return { mi: null, reason: `main.do fetch 실패: ${err.message}` };
  }
  if (!res.ok) return { mi: null, reason: `main.do HTTP ${res.status}` };
  const html = await res.text();

  // 패턴 A — 일반 anchor: href="/{sysId}/ad/fm/foodmenu/selectFoodMenuView.do?mi=4417"
  const a = html.match(/selectFoodMenuView\.do\?mi=(\d+)/);
  if (a) return { mi: a[1], reason: null };

  // 패턴 B — onclick 권한 체크: onclick="menuAccessCheck('1754', 'kwanyang-e')"
  // 학교가 식단 메뉴에 인증/권한을 걸어둔 케이스. mi 는 첫 번째 인자.
  const b = html.match(
    /menuAccessCheck\(\s*['"](\d+)['"]\s*,\s*['"][^'"]+['"]\s*\)[^<]*<\/a>\s*<\/li>\s*<li>\s*<a[^>]*onclick="menuAccessCheck\(\s*['"](\d+)['"]/
  );
  // 위 정교한 시퀀스 매치는 "급식실" 이후 식단 mi 를 짚으려는 건데,
  // 단순화해 onclick 의 모든 mi 를 모은 뒤, 식단 키워드 근처 mi 를 잡는 게 안전.
  const onclickMis = [...html.matchAll(/menuAccessCheck\(\s*['"](\d+)['"]/g)].map(
    (mm) => mm[1]
  );
  // "식단" 라벨 가까이의 anchor 안 mi 를 찾는다 (간단히 식단 앞 200자 이내)
  const sikdanIdx = html.indexOf('식단');
  if (sikdanIdx >= 0 && onclickMis.length > 0) {
    const window = html.slice(Math.max(0, sikdanIdx - 200), sikdanIdx + 200);
    const wm = window.match(/menuAccessCheck\(\s*['"](\d+)['"]/);
    if (wm) return { mi: wm[1], reason: null };
  }
  return { mi: null, reason: 'selectFoodMenuView/menuAccessCheck 식단 링크 없음' };
}

// ----- 학교 1개를 SchoolConfig 객체로 -------------------------------------

// prefetchedMi: mi 프리페치 결과 ({ mi, reason }) — 미전달 시 직접 fetch (기존 동작)
async function buildOne(neisRow, used, atpt = DEFAULT_ATPT, idPrefix = '', prefetchedMi) {
  const name = neisRow.SCHUL_NM;
  const schoolCode = neisRow.SD_SCHUL_CODE;
  const addr = neisRow.ORG_RDNMA;
  const region = regionFromAddress(addr);
  const host = hostFromHmpg(neisRow.HMPG_ADRES);
  const sysId = host ? sysIdFromHost(host) : null;

  // 초등학교가 아닌 경우(중학교 등 동명이 같이 잡힌 경우) 거름.
  if (neisRow.SCHUL_KND_SC_NM && neisRow.SCHUL_KND_SC_NM !== '초등학교') {
    return { skip: true, name, reason: `초등학교 아님 (${neisRow.SCHUL_KND_SC_NM})` };
  }

  // id 자동 — 충돌 방지. --id-prefix 는 접두만 붙일 뿐 충돌 회피 로직은 동일
  let id = idPrefix + (sysId ? idFromSysId(sysId) : neisRow.SCHUL_NM);
  if (used.has(id)) {
    let i = 2;
    while (used.has(`${id}-${i}`)) i++;
    id = `${id}-${i}`;
  }
  used.add(id);

  const base = {
    id,
    name,
    level: 'elementary',
    region,
    neis: { atptCode: atpt, schoolCode },
  };

  if (!host || !sysId) {
    return {
      skip: false,
      config: base,
      warning: `host 가 *-e.goeay.kr / *.goegu.kr / *.sen.es.kr 패턴 아님 (HMPG_ADRES=${neisRow.HMPG_ADRES ?? '없음'}) → scrape 생략`,
    };
  }

  // 서울 sen.es.kr 은 캘린더 + AJAX 구조라 main.do 의 selectFoodMenuView.do
  // 패턴이 없음. 시도하면 어차피 실패 → main.do 호출 1회 절약 + warning 도
  // 명시적으로 "서울은 메뉴만" 메시지로.
  if (/\.sen\.es\.kr$/i.test(host)) {
    return {
      skip: false,
      config: base,
      warning: `서울 sen.es.kr 도메인 — 사진 scraper 미지원 (Stage 14-1 예정) → scrape 생략, 메뉴만 노출`,
    };
  }

  const { mi, reason } = prefetchedMi ?? (await fetchMiFromMain(host, sysId));
  if (!mi) {
    return {
      skip: false,
      config: base,
      warning: `mi 추출 실패 (${reason}) → scrape 생략, 메뉴만 노출`,
    };
  }

  return {
    skip: false,
    config: { ...base, scrape: { kind: kindFromHost(host), host, sysId, mi } },
    warning: null,
  };
}

// ----- mi 프리페치 (동시성 5 워커 풀) ----------------------------------------
//
// Stage 15 (F-4): 기존 완전 sequential (학교당 timeout 15s → 101교 최악 25분)
// 을 동시성 5 로 개선. photoMirror.ts 의 CONCURRENCY = 5 와 같은 보수값 —
// 학교 서버 예의 차원에서 요청 간 200ms 간격도 둔다.
// 출력 순서·id 배정은 main 루프가 원본 행 순서로 sequential 하게 수행하므로
// 프리페치 도입 전과 stdout 이 동일하다 (--names 회귀 검증 근거).

const MI_CONCURRENCY = 5;
const MI_GAP_MS = 200;

async function prefetchMis(neisRows) {
  const targets = [];
  neisRows.forEach((row, idx) => {
    if (row.SCHUL_KND_SC_NM && row.SCHUL_KND_SC_NM !== '초등학교') return;
    const host = hostFromHmpg(row.HMPG_ADRES);
    const sysId = host ? sysIdFromHost(host) : null;
    if (!host || !sysId) return;
    if (/\.sen\.es\.kr$/i.test(host)) return; // buildOne 이 mi fetch 전에 조기 반환하는 케이스
    targets.push({ idx, host, sysId });
  });
  const results = new Map();
  let cursor = 0;
  async function worker() {
    while (cursor < targets.length) {
      const t = targets[cursor++];
      results.set(t.idx, await fetchMiFromMain(t.host, t.sysId));
      await new Promise((r) => setTimeout(r, MI_GAP_MS));
    }
  }
  const n = Math.min(MI_CONCURRENCY, targets.length);
  await Promise.all(Array.from({ length: n }, worker));
  return results;
}

// ----- 출력 형식 ------------------------------------------------------------

function emitSchoolConfig(c) {
  // schools.ts 의 인덴테이션과 같은 모양
  const lines = [];
  lines.push(`  ${c.id}: {`);
  lines.push(`    id: '${c.id}',`);
  lines.push(`    name: '${c.name}',`);
  lines.push(`    level: '${c.level}',`);
  lines.push(`    region: '${c.region}',`);
  lines.push(
    `    neis: { atptCode: '${c.neis.atptCode}', schoolCode: '${c.neis.schoolCode}' },`
  );
  if (c.scrape) {
    // kind 를 맨 앞에 — 기존 등록 파일 (gyeonggi.ts 등) 의 필드 순서와 동일
    lines.push(
      `    scrape: { kind: '${c.scrape.kind}', host: '${c.scrape.host}', sysId: '${c.scrape.sysId}', mi: '${c.scrape.mi}' },`
    );
  }
  lines.push(`  },`);
  return lines.join('\n');
}

// ----- 메인 -----------------------------------------------------------------

async function main() {
  const args = parseArgs(process.argv);
  const startedAt = Date.now();

  console.error(`[info] ATPT=${args.atpt}`);

  let neisRows;
  if (args.mode === 'names') {
    const file = await fs.readFile(args.value, 'utf-8');
    const names = file
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('#'));
    console.error(`[info] 학교명 ${names.length}개 입력됨`);

    neisRows = [];
    for (const name of names) {
      const rows = await neisSearchByName(name, args.atpt);
      // 정확히 학교명 일치 + 지정 ATPT 인 행만 채택
      const exact = rows.filter(
        (r) => r.SCHUL_NM === name && r.ATPT_OFCDC_SC_CODE === args.atpt
      );
      if (exact.length === 0) {
        console.error(`[warn] "${name}" — NEIS 정확 매치 없음, 스킵`);
        continue;
      }
      if (exact.length > 1) {
        console.error(
          `[warn] "${name}" — 동명 ${exact.length}개. 첫 번째 사용 (${exact[0].ORG_RDNMA})`
        );
      }
      neisRows.push(exact[0]);
    }
  } else {
    console.error(`[info] --city ${args.value} 일괄 조회`);
    neisRows = await neisSearchByCity(args.value, args.atpt);
    console.error(`[info] ${neisRows.length}개 학교 매치`);
  }

  const used = new Set();
  let success = 0;
  let withScrape = 0;
  let skipped = 0;

  // mi 는 동시성 5 로 프리페치, id 배정·출력은 원본 순서 sequential 유지
  const mis = await prefetchMis(neisRows);

  for (const [idx, row] of neisRows.entries()) {
    const result = await buildOne(row, used, args.atpt, args.idPrefix, mis.get(idx));
    if (result.skip) {
      console.error(`[skip] ${result.name} — ${result.reason}`);
      skipped++;
      continue;
    }
    if (result.warning) console.error(`[warn] ${result.config.name} — ${result.warning}`);
    if (result.config.scrape) withScrape++;
    success++;
    process.stdout.write(emitSchoolConfig(result.config) + '\n');
  }

  const dt = ((Date.now() - startedAt) / 1000).toFixed(1);
  console.error(
    `\n[done] 학교 ${success}개 출력 (mi 자동: ${withScrape} / scrape 생략: ${success - withScrape}), 스킵 ${skipped} / ${dt}s`
  );

  // 한 학교라도 scrape 가 빠진 게 있으면 경고로 종료 코드 표시
  if (success === 0) process.exit(3);
}

main().catch((err) => {
  console.error('[fatal]', err);
  process.exit(1);
});
