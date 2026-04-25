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
const ATPT = 'J10'; // 경기도교육청. 다른 시도 추가 시 명시 필요.
const NEIS_KEY = process.env.NEIS_API_KEY ?? '';
const UA = 'Mozilla/5.0 (compatible; school-meal-build-script)';
const FETCH_TIMEOUT_MS = 15000;

// ----- 인자 파싱 ------------------------------------------------------------

function parseArgs(argv) {
  const args = { mode: null, value: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--names') {
      args.mode = 'names';
      args.value = argv[++i];
    } else if (a === '--city') {
      args.mode = 'city';
      args.value = argv[++i];
    } else if (a === '-h' || a === '--help') {
      printHelpAndExit(0);
    }
  }
  if (!args.mode || !args.value) printHelpAndExit(1);
  return args;
}

function printHelpAndExit(code) {
  const out = code === 0 ? console.log : console.error;
  out(`사용법:
  node scripts/build-school-config.mjs --names <파일경로>
      한 줄에 한 학교명을 적은 텍스트 파일. NEIS 무키로도 동작.

  node scripts/build-school-config.mjs --city <시이름>
      예: --city 의왕시. NEIS_API_KEY 환경변수 필요 (키 없으면 종료).
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

/** "경기도 의왕시 ..." → "경기 의왕" */
function regionFromAddress(addr) {
  if (!addr) return '경기';
  const m = addr.match(/^([가-힣]+?)도\s+([가-힣]+?시)/);
  if (m) {
    return `${m[1]} ${m[2].replace(/시$/, '')}`;
  }
  return '경기';
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
 * host 가 경기교육청 학교 CMS 도메인이면 sysId 반환.
 * 관찰된 패턴: *-e.goeay.kr (과천 등), *.goegu.kr (의왕 등)
 */
function sysIdFromHost(host) {
  if (!host) return null;
  // host 의 첫 라벨이 sysId — 예: gwacheon-e.goeay.kr → gwacheon-e
  //                              baekunhosucho.goegu.kr → baekunhosucho
  const m = host.match(/^([a-z0-9-]+)\.(goeay|goegu)\.kr$/i);
  return m ? m[1] : null;
}

/**
 * sysId 에서 학교 id (URL 친화 키) 생성.
 * - `-e` 접미 (goeay 패턴): chonggye-e → chonggye
 * - `cho` 접미 (goegu 패턴): naedongcho → naedong
 */
function idFromSysId(sysId) {
  return sysId.replace(/-e$/, '').replace(/cho$/, '');
}

// ----- NEIS 조회 -------------------------------------------------------------

async function neisQuery(searchTerm, page = 1) {
  const u = new URL(NEIS_BASE);
  u.searchParams.set('Type', 'json');
  u.searchParams.set('pSize', '100');
  u.searchParams.set('pIndex', String(page));
  u.searchParams.set('ATPT_OFCDC_SC_CODE', ATPT);
  u.searchParams.set('SCHUL_NM', searchTerm);
  if (NEIS_KEY) u.searchParams.set('KEY', NEIS_KEY);

  const res = await fetchWithTimeout(u.toString());
  if (!res.ok) throw new Error(`NEIS HTTP ${res.status}`);
  const data = await res.json();
  if (data.RESULT && data.RESULT.CODE !== 'INFO-000') return [];
  return data.schoolInfo?.[1]?.row ?? [];
}

async function neisSearchByName(name) {
  // NEIS 두 가지 quirk:
  // 1. SCHUL_NM 풀네임 일치 시 0건 돌려주는 학교가 있음 (예: 백운호수초등학교)
  //    → 풀네임 실패 시 "초등학교" 떼고 키워드 폴백
  // 2. 무키 호출은 pSize/pIndex 가 강제 5 + 첫 페이지만 → 키워드 너무 흔하면
  //    상위 5건에 안 들어와 묻힘. 키 있으면 페이징, 없으면 풀네임 우선 전략
  // 전략: 풀네임 시도 → 빈 결과 시 키워드 폴백
  const fullResults = await neisQuery(name);
  if (fullResults.length > 0) return fullResults;

  const keyword = name.replace(/(초|중|고)등학교$/u, '');
  if (keyword === name) return []; // 키워드 변형 없음

  // 키 있을 때만 페이징 누적, 무키는 첫 페이지만
  const collected = [];
  const maxPages = NEIS_KEY ? 20 : 1;
  for (let page = 1; page <= maxPages; page++) {
    const rows = await neisQuery(keyword, page);
    if (rows.length === 0) break;
    collected.push(...rows);
    if (rows.length < 100) break;
  }
  return collected;
}

async function neisSearchByCity(cityName) {
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
    u.searchParams.set('ATPT_OFCDC_SC_CODE', ATPT);
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

async function buildOne(neisRow, used) {
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

  // id 자동 — 충돌 방지
  let id = sysId ? idFromSysId(sysId) : neisRow.SCHUL_NM;
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
    neis: { atptCode: ATPT, schoolCode },
  };

  if (!host || !sysId) {
    return {
      skip: false,
      config: base,
      warning: `host 가 *-e.goeay.kr 패턴 아님 (HMPG_ADRES=${neisRow.HMPG_ADRES ?? '없음'}) → scrape 생략`,
    };
  }

  const { mi, reason } = await fetchMiFromMain(host, sysId);
  if (!mi) {
    return {
      skip: false,
      config: base,
      warning: `mi 추출 실패 (${reason}) → scrape 생략, 메뉴만 노출`,
    };
  }

  return {
    skip: false,
    config: { ...base, scrape: { host, sysId, mi } },
    warning: null,
  };
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
    lines.push(
      `    scrape: { host: '${c.scrape.host}', sysId: '${c.scrape.sysId}', mi: '${c.scrape.mi}' },`
    );
  }
  lines.push(`  },`);
  return lines.join('\n');
}

// ----- 메인 -----------------------------------------------------------------

async function main() {
  const args = parseArgs(process.argv);
  const startedAt = Date.now();

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
      const rows = await neisSearchByName(name);
      // 정확히 학교명 일치 + ATPT J10 인 행만 채택
      const exact = rows.filter(
        (r) => r.SCHUL_NM === name && r.ATPT_OFCDC_SC_CODE === ATPT
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
    neisRows = await neisSearchByCity(args.value);
    console.error(`[info] ${neisRows.length}개 학교 매치`);
  }

  const used = new Set();
  let success = 0;
  let withScrape = 0;
  let skipped = 0;

  for (const row of neisRows) {
    const result = await buildOne(row, used);
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
