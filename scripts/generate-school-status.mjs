#!/usr/bin/env node
/**
 * docs/school-status.md 자동 생성 (Stage 14-2 도입, 2026-05-02).
 *
 * 모든 등록 학교의 사진 추출 가능 여부를 한 번에 측정 → md 표 생성.
 *
 * 사용 (dev 서버 별도 띄워둬야 함):
 *   1. 다른 터미널에서: npm run dev
 *   2. 본 스크립트: node scripts/generate-school-status.mjs [--ymd 20260428]
 *
 * 측정 기준:
 *   - 한 학교의 1주일치 (월~금) 중 한 ymd 라도 사진 있으면 ✅
 *   - 모두 null 이면 ⬜
 *   - scrape 생략된 학교는 ➖ (NEIS only, 사진 미지원 의도)
 *
 * 학교 목록 source: src/lib/schools/ 디렉터리 모든 ts 정규식 파싱.
 */

import fs from 'node:fs/promises';
import path from 'node:path';

const DEV_BASE = 'http://localhost:3000';
const TARGET_YMD = process.argv.find((a) => a.startsWith('--ymd='))?.split('=')[1] ?? '20260428';

/**
 * 사용자 직접 학교 사이트 확인 결과로 갱신된 사유.
 * 자동 측정 (한 주 fail) → 사용자 직접 확인 → 정확한 원인 매핑.
 * 사용자가 새로 확인한 학교 발견 시 여기에 추가.
 */
const VERIFIED_REASONS = {
  // 서울 서초구 (2026-05-02 사용자 확인)
  seoul_banpo: '미업로드 (사용자 확인 2026-05-02)',
  seoul_sindong: '미업로드 — 4/24까지만 (사용자 확인 2026-05-02)',
  seoul_eonnam: '미업로드 — 4/21까지만 (사용자 확인 2026-05-02)',
  // 경기 (2026-05-02 사용자 확인)
  kwanmun: '미업로드 (사용자 확인 2026-05-02)',
  poil: '미업로드 (사용자 확인 2026-05-02)',
  kwanyang: '외부 접근 차단 (사용자 확인 2026-05-02 — "잘못된 접속 정보" alert)',
  anyang: '미업로드 (사용자 확인 2026-05-02)',
};

// ----- 학교 목록 추출 -------------------------------------------------------

async function readAllSchools() {
  const files = await collectSchoolFiles('src/lib/schools');
  const result = [];
  for (const f of files) {
    const txt = await fs.readFile(f, 'utf8');
    result.push(...parseSchoolsFromText(txt, f));
  }
  return result;
}

async function collectSchoolFiles(dir) {
  const out = [];
  const ents = await fs.readdir(dir, { withFileTypes: true });
  for (const e of ents) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await collectSchoolFiles(full)));
    else if (e.name.endsWith('.ts') && e.name !== 'index.ts') out.push(full);
  }
  return out;
}

function parseSchoolsFromText(txt, filePath) {
  // entry 단위 파싱: id 발견 시 시작, 다음 } 까지 한 학교 블록
  const lines = txt.split(/\r?\n/);
  const result = [];
  let cur = null;
  let braceDepth = 0;
  let inEntry = false;
  for (const line of lines) {
    const idM = line.match(/^\s*id:\s*'([a-z0-9_-]+)'/);
    if (idM && !inEntry) {
      cur = { id: idM[1], name: '', region: '', hasScrape: false, scrapeKind: null, file: filePath };
      inEntry = true;
      braceDepth = 1; // id 줄을 만나는 시점에 우리는 entry { ... } 의 안. 추정.
      continue;
    }
    if (!inEntry) continue;

    const nM = line.match(/^\s*name:\s*'([^']+)'/);
    if (nM) cur.name = nM[1];
    const rM = line.match(/^\s*region:\s*'([^']+)'/);
    if (rM) cur.region = rM[1];
    const sM = line.match(/^\s*scrape:\s*\{[\s\S]*?kind:\s*'([^']+)'/);
    if (sM) {
      cur.hasScrape = true;
      cur.scrapeKind = sM[1];
    }
    // multi-line scrape: { ... kind: 'X' ... }
    const skM = line.match(/^\s*kind:\s*'([^']+)'/);
    if (skM && cur.hasScrape === false) {
      // 이전 줄이 scrape: { 였을 가능성
      cur.hasScrape = true;
      cur.scrapeKind = skM[1];
    }

    // entry 종료 — `},` 패턴 (단일 indent level 닫힘)
    if (/^\s{2}\},?\s*$/.test(line)) {
      result.push(cur);
      cur = null;
      inEntry = false;
    }
  }
  return result;
}

// ----- 사진 fetch -----------------------------------------------------------

async function probePhoto(schoolId, ymd) {
  try {
    const res = await fetch(`${DEV_BASE}/api/meal/photo?schoolId=${schoolId}&ymd=${ymd}`);
    if (!res.ok) return { ok: false, err: `HTTP ${res.status}` };
    const data = await res.json();
    return { ok: !!data.photoUrl, photoUrl: data.photoUrl, source: data.source };
  } catch (e) {
    return { ok: false, err: e.message };
  }
}

/**
 * 한 주(월~금) 5일 측정. 한 ymd 라도 OK면 학교 OK.
 * monday 는 ymd 의 그 주 월요일.
 */
async function probeWeek(schoolId, ymd) {
  const y = parseInt(ymd.substring(0, 4), 10);
  const m = parseInt(ymd.substring(4, 6), 10) - 1;
  const d = parseInt(ymd.substring(6, 8), 10);
  const date = new Date(y, m, d);
  const day = date.getDay();
  const offset = day === 0 ? 1 : 1 - day;
  date.setDate(date.getDate() + offset);
  const tries = [];
  for (let i = 0; i < 5; i++) {
    const dt = new Date(date);
    dt.setDate(date.getDate() + i);
    tries.push(
      `${dt.getFullYear()}${String(dt.getMonth() + 1).padStart(2, '0')}${String(dt.getDate()).padStart(2, '0')}`
    );
  }
  for (const t of tries) {
    const r = await probePhoto(schoolId, t);
    if (r.ok) return { ok: true, ymd: t, photoUrl: r.photoUrl, source: r.source };
  }
  return { ok: false };
}

// ----- 메인 ------------------------------------------------------------------

const schools = await readAllSchools();
console.error(`[info] 학교 ${schools.length}개 측정 시작 (기준 주: ${TARGET_YMD})`);

const results = [];
for (const s of schools) {
  if (!s.hasScrape) {
    results.push({ ...s, status: 'no-scrape', reason: 'NEIS 메뉴만 (사진 미지원 의도)' });
    continue;
  }
  const r = await probeWeek(s.id, TARGET_YMD);
  if (r.ok) {
    results.push({ ...s, status: 'ok', photoUrl: r.photoUrl, source: r.source, ymd: r.ymd });
  } else {
    const reason = VERIFIED_REASONS[s.id] ?? '미업로드 또는 외부 차단 (미확인)';
    results.push({ ...s, status: 'fail', reason });
  }
}

// region 별 그룹핑
const groups = new Map();
for (const r of results) {
  if (!groups.has(r.region)) groups.set(r.region, []);
  groups.get(r.region).push(r);
}

// 등록 region 순서 (경기 → 서울 자치구)
const regionOrder = [
  '경기 과천',
  '경기 의왕',
  '경기 안양',
  '경기 군포',
  '서울 서초',
  '서울 동작',
  '서울 관악',
  '서울 강남',
  '서울 송파',
  '서울 강동',
  '서울 금천',
  '서울 영등포',
  '서울 구로',
  '서울 양천',
  '서울 강서',
  '서울 마포',
  '서울 서대문',
  '서울 은평',
  '서울 용산',
  '서울 종로',
  '서울 중',
  '서울 성동',
  '서울 광진',
  '서울 동대문',
  '서울 중랑',
  '서울 성북',
  '서울 강북',
  '서울 도봉',
  '서울 노원',
];
const orderedRegions = [
  ...regionOrder.filter((r) => groups.has(r)),
  ...[...groups.keys()].filter((r) => !regionOrder.includes(r)),
];

// md 생성
const lines = [];
lines.push('# 학교 등록·사진 현황');
lines.push('');
lines.push(`> 자동 생성: \`scripts/generate-school-status.mjs\``);
lines.push(`> 측정 기준: 4/28 이 속한 한 주 (월~금) 중 하루라도 사진 있으면 ✅.`);
lines.push(`> 마지막 갱신: ${new Date().toISOString().slice(0, 10)} (기준 ymd ${TARGET_YMD})`);
lines.push('');

// 요약
const total = results.length;
const ok = results.filter((r) => r.status === 'ok').length;
const fail = results.filter((r) => r.status === 'fail').length;
const noScrape = results.filter((r) => r.status === 'no-scrape').length;
lines.push('## 요약');
lines.push('');
lines.push(`- 등록: **${total}교**`);
lines.push(`- 사진 가능 ✅: **${ok}교** (${((ok / total) * 100).toFixed(1)}%)`);
lines.push(`- 사진 실패 ⬜: ${fail}교 (학교 미업로드 또는 외부 차단)`);
if (noScrape > 0) lines.push(`- scrape 미지원 ➖: ${noScrape}교 (NEIS 메뉴만)`);
lines.push('');

// region 별 그룹
lines.push('## 자치구별 현황');
lines.push('');
for (const region of orderedRegions) {
  const list = groups.get(region);
  if (!list) continue;
  const okCount = list.filter((r) => r.status === 'ok').length;
  const total = list.length;
  lines.push(`### ${region} — ${okCount}/${total} 사진 가능`);
  lines.push('');
  lines.push('| 상태 | id | 학교 | 비고 |');
  lines.push('|---|---|---|---|');
  for (const r of list) {
    let icon, note;
    if (r.status === 'ok') {
      icon = '✅';
      note = `(${r.scrapeKind})`;
    } else if (r.status === 'fail') {
      icon = '⬜';
      note = r.reason;
    } else {
      icon = '➖';
      note = r.reason;
    }
    lines.push(`| ${icon} | \`${r.id}\` | ${r.name} | ${note} |`);
  }
  lines.push('');
}

// stdout 으로 md
console.log(lines.join('\n'));
console.error(`[summary] 등록 ${total}, OK ${ok}, FAIL ${fail}, no-scrape ${noScrape}`);
