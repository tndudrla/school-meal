#!/usr/bin/env node
/**
 * Seoul sen.es.kr 학교 진단 도구 (Stage 14-1-1, 2026-05-02).
 *
 * 한 자치구 학교들의 root 페이지를 fetch 해 menuId 후보들을 모두 추출하고,
 * 각 후보로 캘린더 페이지 POST → fnDetail 매치 수 측정 → 어느 menuId 가
 * 진짜 식단 페이지인지 진단.
 *
 * 사용:
 *   node scripts/audit-seoul-schools.mjs
 *     → src/lib/schools.ts 에서 seoul_ prefix 학교 자동 수집
 *
 *   node scripts/audit-seoul-schools.mjs --district 동작구
 *     → NEIS 로 자치구 추출 (NEIS_API_KEY 필요)
 *
 * 출력: 한 학교당 한 줄
 *   <id>  <host>  bestMenuId=<N>  fnDetail=<count>  candidates=[label1@N, ...]
 *
 * stderr: 요약 (진단 가능 학교 수)
 */

import fs from 'node:fs/promises';

const UA = 'Mozilla/5.0 (compatible; school-meal-bot)';
const FETCH_TIMEOUT_MS = 15000;

// ----- 공통 -------------------------------------------------------------------

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

function parseArgs(argv) {
  const args = { district: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--district') args.district = argv[++i];
    else if (a.startsWith('--district=')) args.district = a.split('=')[1];
  }
  return args;
}

// ----- 학교 목록 수집 ---------------------------------------------------------

/**
 * src/lib/schools.ts 또는 src/lib/schools/seoul/*.ts 에서 seoul_ prefix 학교의
 * { id, host } 만 추출. 정규식 파싱이라 ts 빌드 불필요.
 */
async function readSeoulSchoolsFromSource() {
  // 우선 src/lib/schools.ts 단일 파일 케이스 (Stage 14-1 시점)
  const path = 'src/lib/schools.ts';
  try {
    const txt = await fs.readFile(path, 'utf8');
    return parseSeoulSchoolsFromText(txt);
  } catch {
    // 향후 분리됐을 때 대비 (Stage 14-2+)
    return [];
  }
}

function parseSeoulSchoolsFromText(txt) {
  // 학교 entry 단순 파싱: id 가 'seoul_*' 면 다음 } 까지 블록으로 보고 host 검색.
  const result = [];
  const lines = txt.split(/\r?\n/);
  let curId = null;
  let curHost = null;
  for (const line of lines) {
    const idM = line.match(/^\s*id:\s*'(seoul_[a-z0-9_]+)'/);
    if (idM) {
      // 이전 학교 마무리
      if (curId) result.push({ id: curId, host: curHost });
      curId = idM[1];
      curHost = null;
      continue;
    }
    if (curId) {
      const hostM = line.match(/host:\s*'([^']+)'/);
      if (hostM) curHost = hostM[1];
      // 블록 끝 (괄호) — id 가 다음 학교에서 갱신되거나 SCHOOLS 종료
    }
  }
  if (curId) result.push({ id: curId, host: curHost });
  return result;
}

// ----- NEIS 폴백 (자치구 인자) -----------------------------------------------

async function fetchDistrictFromNeis(district) {
  const KEY = process.env.NEIS_API_KEY;
  if (!KEY) {
    console.error('[error] --district 옵션은 NEIS_API_KEY 필요');
    process.exit(2);
  }
  const all = [];
  for (let page = 1; page < 50; page++) {
    const u = new URL('https://open.neis.go.kr/hub/schoolInfo');
    u.searchParams.set('Type', 'json');
    u.searchParams.set('pSize', '1000');
    u.searchParams.set('pIndex', String(page));
    u.searchParams.set('ATPT_OFCDC_SC_CODE', 'B10');
    u.searchParams.set('SCHUL_KND_SC_NM', '초등학교');
    u.searchParams.set('KEY', KEY);
    const res = await fetch(u);
    const data = await res.json();
    if (data.RESULT && data.RESULT.CODE !== 'INFO-000') break;
    const rows = data.schoolInfo?.[1]?.row ?? [];
    all.push(...rows);
    if (rows.length < 1000) break;
  }
  return all
    .filter((r) => (r.ORG_RDNMA ?? '').includes(district))
    .map((r) => {
      const host = (r.HMPG_ADRES ?? '')
        .replace(/^https?:\/\//i, '')
        .split('/')[0]
        .trim()
        .toLowerCase();
      return {
        id: `seoul_${host.split('.')[0].replace(/-/g, '_')}`,
        host: /\.sen\.es\.kr$/.test(host) ? host : null,
      };
    });
}

// ----- 학교당 진단 ------------------------------------------------------------

/**
 * root 페이지에서 모든 가능한 menuId 후보 추출:
 *   (a) <a href="/N/subMenu.do">label</a>  형식 모든 매치 (label 보존)
 *   (b) onclick="moveQuickMenuURL('CTC...', 'N', '...')" 형식 + 인접 텍스트
 */
function extractMenuCandidates(html) {
  const candidates = [];
  // (a) sub link
  const subRe =
    /<a[^>]+href=["']\/(\d+)\/subMenu\.do["'][^>]*>([^<]+)<\/a>/g;
  let m;
  while ((m = subRe.exec(html)) !== null) {
    candidates.push({ menuId: m[1], label: m[2].trim(), source: 'sub' });
  }
  // (b) quickmenu — moveQuickMenuURL 호출 + 인접 텍스트
  // 한 호출의 두 번째 인자가 menuId, 그 다음 0~500 char 안의 한국어 라벨
  const qRe = /moveQuickMenuURL\(\s*['"]CTC\d+['"]\s*,\s*['"](\d+)['"][^)]*\)([\s\S]{0,500})/g;
  while ((m = qRe.exec(html)) !== null) {
    // 인접 영역에서 '식단', '급식', 가능한 라벨 단어 추출
    const ctx = m[2];
    const labelMatch = ctx.match(/(급식식단|식단|급식일정|급식안내|학교급식|급식)/);
    const label = labelMatch ? labelMatch[1] : '(quickmenu)';
    candidates.push({ menuId: m[1], label, source: 'qm' });
  }
  return candidates;
}

/**
 * menuId 로 캘린더 POST → fnDetail onclick 수 측정.
 * 0 보다 크면 진짜 캘린더 페이지.
 */
async function probeCalendar(host, menuId) {
  try {
    const res = await fetchWithTimeout(`https://${host}/${menuId}/subMenu.do`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'srhMlsvYear=2026&srhMlsvMonth=04',
    });
    if (!res.ok) return { count: 0, err: `HTTP ${res.status}` };
    const html = await res.text();
    const re = /onclick=["']fnDetail\(\s*'(\d+)'\s*,\s*this\s*\)\s*;?["']/g;
    const matches = [...html.matchAll(re)];
    return { count: matches.length };
  } catch (err) {
    return { count: 0, err: err.message };
  }
}

async function auditOne(school) {
  const { id, host } = school;
  if (!host) return { id, host: null, status: 'no-host' };

  let rootHtml;
  try {
    const res = await fetchWithTimeout(`https://${host}/`);
    if (!res.ok) return { id, host, status: `root HTTP ${res.status}` };
    rootHtml = await res.text();
  } catch (err) {
    return { id, host, status: `root err: ${err.message}` };
  }

  const candidates = extractMenuCandidates(rootHtml);
  // 같은 menuId 의 라벨 dedupe (가장 의미있는 라벨 우선 — 식단 > 급식일정 > 급식)
  const byMenuId = new Map();
  for (const c of candidates) {
    const prev = byMenuId.get(c.menuId);
    if (!prev) {
      byMenuId.set(c.menuId, c);
    } else {
      // 라벨 우선순위 — 더 좋은 라벨로 덮어쓰기
      const score = (l) => l.includes('식단') ? 3 : l.includes('급식일정') ? 2 : l.includes('급식') ? 1 : 0;
      if (score(c.label) > score(prev.label)) byMenuId.set(c.menuId, c);
    }
  }
  const dedupedCandidates = [...byMenuId.values()];

  // 후보들 중 '식단·급식·식사' 들어간 것만 우선 시도. 없으면 모든 후보.
  const mealCandidates = dedupedCandidates.filter((c) =>
    /식단|급식|식사/.test(c.label)
  );
  const probeList = mealCandidates.length > 0 ? mealCandidates : dedupedCandidates;

  // 각 후보 캘린더 probe (병렬)
  const probes = await Promise.all(
    probeList.map(async (c) => {
      const r = await probeCalendar(host, c.menuId);
      return { ...c, fnDetail: r.count, err: r.err };
    })
  );
  // fnDetail 가장 큰 후보 선택 (= 진짜 식단 페이지)
  probes.sort((a, b) => b.fnDetail - a.fnDetail);
  const best = probes[0];

  return {
    id,
    host,
    bestMenuId: best?.fnDetail > 0 ? best.menuId : null,
    bestLabel: best?.label,
    bestSource: best?.source,
    fnDetail: best?.fnDetail ?? 0,
    candidates: probes.map((p) => `${p.label}@${p.menuId}/${p.source}=${p.fnDetail}`),
  };
}

// ----- 메인 -------------------------------------------------------------------

const args = parseArgs(process.argv);

let schools;
if (args.district) {
  schools = await fetchDistrictFromNeis(args.district);
} else {
  schools = await readSeoulSchoolsFromSource();
}

console.error(`[info] 학교 ${schools.length}개 진단 시작`);

const results = [];
for (const s of schools) {
  const r = await auditOne(s);
  results.push(r);
  if (r.status) {
    console.log(`${r.id.padEnd(20)}  host=${r.host ?? '-'}  status=${r.status}`);
  } else {
    console.log(
      `${r.id.padEnd(20)}  host=${r.host}  bestMenuId=${r.bestMenuId ?? 'NONE'}  fnDetail=${r.fnDetail}  label='${r.bestLabel ?? '-'}'(${r.bestSource ?? '-'})  candidates=${r.candidates.join(', ')}`
    );
  }
}

const ok = results.filter((r) => r.fnDetail > 0).length;
const noHost = results.filter((r) => r.status === 'no-host').length;
const failed = results.length - ok - noHost;
console.error(`\n[summary] 사진 추출 가능: ${ok}/${results.length}, host 없음: ${noHost}, 실패: ${failed}`);
