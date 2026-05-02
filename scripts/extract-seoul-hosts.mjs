#!/usr/bin/env node
/**
 * NEIS B10 (서울) 자치구별 초등학교 host (HMPG_ADRES) 추출.
 * Stage 14-2 (2026-05-02) — 자치구 인자화로 14-2~14-25 재사용.
 *
 * 사용:
 *   NEIS_API_KEY=... node scripts/extract-seoul-hosts.mjs --district 동작구
 *   NEIS_API_KEY=... node scripts/extract-seoul-hosts.mjs                 # 기본 서초구
 *
 * stdout: <학교명>\t<host>\t<schoolCode>  (탭 구분, 한 줄 한 학교)
 * stderr: 진행 로그
 */

const NEIS_BASE = 'https://open.neis.go.kr/hub/schoolInfo';
const KEY = process.env.NEIS_API_KEY ?? '';
if (!KEY) {
  console.error('NEIS_API_KEY env required');
  process.exit(2);
}

function parseArgs(argv) {
  const args = { district: '서초구' };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--district') args.district = argv[++i];
    else if (a.startsWith('--district=')) args.district = a.split('=')[1];
  }
  return args;
}

function hostFromHmpg(raw) {
  if (!raw) return null;
  const trimmed = raw.trim();
  return trimmed.replace(/^https?:\/\//i, '').split('/')[0].trim().toLowerCase() || null;
}

const args = parseArgs(process.argv);
const district = args.district;

const collected = [];
for (let page = 1; page < 50; page++) {
  const u = new URL(NEIS_BASE);
  u.searchParams.set('Type', 'json');
  u.searchParams.set('pSize', '1000');
  u.searchParams.set('pIndex', String(page));
  u.searchParams.set('ATPT_OFCDC_SC_CODE', 'B10');
  u.searchParams.set('SCHUL_KND_SC_NM', '초등학교');
  u.searchParams.set('KEY', KEY);
  const res = await fetch(u.toString());
  if (!res.ok) {
    console.error(`HTTP ${res.status}`);
    process.exit(2);
  }
  const data = await res.json();
  if (data.RESULT && data.RESULT.CODE !== 'INFO-000') break;
  const rows = data.schoolInfo?.[1]?.row ?? [];
  for (const r of rows) {
    if ((r.ORG_RDNMA ?? '').includes(district)) collected.push(r);
  }
  if (rows.length < 1000) break;
}

console.error(`[info] ${district} 초등학교 ${collected.length}개`);
for (const r of collected) {
  const host = hostFromHmpg(r.HMPG_ADRES);
  console.log(`${r.SCHUL_NM}\t${host ?? ''}\t${r.SD_SCHUL_CODE}`);
}
