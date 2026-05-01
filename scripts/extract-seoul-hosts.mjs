#!/usr/bin/env node
// 일회성: NEIS B10 서초구 24교의 host (HMPG_ADRES) 만 추출.
// stdout: id\tname\thost\tatptCode\tschoolCode  (탭 구분)

import 'node:fs';

const NEIS_BASE = 'https://open.neis.go.kr/hub/schoolInfo';
const KEY = process.env.NEIS_API_KEY ?? '';
if (!KEY) {
  console.error('NEIS_API_KEY env required');
  process.exit(2);
}

function hostFromHmpg(raw) {
  if (!raw) return null;
  const trimmed = raw.trim();
  return trimmed.replace(/^https?:\/\//i, '').split('/')[0].trim().toLowerCase() || null;
}

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
  if (!res.ok) { console.error(`HTTP ${res.status}`); process.exit(2); }
  const data = await res.json();
  if (data.RESULT && data.RESULT.CODE !== 'INFO-000') break;
  const rows = data.schoolInfo?.[1]?.row ?? [];
  for (const r of rows) {
    if ((r.ORG_RDNMA ?? '').includes('서초구')) collected.push(r);
  }
  if (rows.length < 1000) break;
}

console.error(`[info] 서초구 초등학교 ${collected.length}개`);
for (const r of collected) {
  const host = hostFromHmpg(r.HMPG_ADRES);
  console.log(`${r.SCHUL_NM}\t${host ?? ''}\t${r.SD_SCHUL_CODE}`);
}
