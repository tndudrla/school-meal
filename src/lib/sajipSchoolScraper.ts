/**
 * 사립 학교 (`*.es.kr`) 의 PHP 게시판형 식단 사진 scraper.
 * Stage 14-1-2 (2026-05-02) — 계성초 (`gyeseong1882.es.kr`) 가 첫 케이스.
 *
 * 페이지 구조:
 *   `/bbs/list.html?category=<bbsCategory>&yStr=YYYY&mStr=M&sw=6`
 *   → tbody 안 td 마다 `{day}<br/><span onClick="..."><img src="/data/bbs/<bbsCategory>/<timestamp>.jpg"/>...</span></td>`
 *   sw=6 (또는 마지막 주차 이상) 으로 호출하면 한 페이지에 그 달 평일 사진 다.
 *
 *   bbsCategory 는 학교마다 다를 수 있음 (계성: `special_food_plan`).
 *   현재는 `bbsCategory` 를 scrape config 에 명시. 다른 사립 추가 시 확장.
 */

const UA = 'Mozilla/5.0 (compatible; school-meal-bot)';
const FETCH_TIMEOUT_MS = 10000;

export interface SajipBbsScrapeTarget {
  kind: 'sajip-bbs';
  host: string; // 예: www.gyeseong1882.es.kr
  bbsCategory: string; // 예: special_food_plan
}

const MONTH_CACHE = new Map<string, { at: number; data: Record<string, string> }>();
const MONTH_TTL_MS = 60 * 60 * 1000; // 1시간

async function fetchWithTimeout(url: string, init: RequestInit = {}): Promise<Response> {
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
 * 한 달 한 페이지에서 td → day + photo path 추출.
 * 반환: `{ day(number 1~31): '/data/bbs/<cat>/<ts>.jpg' }`
 */
export function parseSajipMonth(html: string, bbsCategory: string): Record<number, string> {
  const result: Record<number, string> = {};
  // <td>{day} <br /> ... <img src="/data/bbs/<cat>/<ts>.{ext}" />
  // sw 별로 빈 td (`&nbsp;`) 도 있어 day + img 둘 다 있는 td 만.
  const tdRe = /<td\b[^>]*>([\s\S]*?)<\/td>/g;
  const imgRe = new RegExp(
    `\\/data\\/bbs\\/${bbsCategory.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\/([\\d]+\\.(?:jpg|jpeg|png|webp))`,
    'i'
  );
  let m: RegExpExecArray | null;
  while ((m = tdRe.exec(html)) !== null) {
    const inner = m[1];
    const dayM = inner.match(/^\s*(\d{1,2})\s*<br/);
    if (!dayM) continue;
    const day = parseInt(dayM[1], 10);
    if (day < 1 || day > 31) continue;
    const imgM = inner.match(imgRe);
    if (!imgM) continue;
    if (result[day]) continue; // 중복 방지 (같은 day 가 여러 sw 에 노출)
    result[day] = `/data/bbs/${bbsCategory}/${imgM[1]}`;
  }
  return result;
}

/** YYYYMMDD → 그 주 월요일 YYYYMMDD. 1주치(월~금) 추출 기준. */
function getMondayYmd(ymd: string): string {
  const y = parseInt(ymd.substring(0, 4), 10);
  const m = parseInt(ymd.substring(4, 6), 10) - 1;
  const d = parseInt(ymd.substring(6, 8), 10);
  const date = new Date(y, m, d);
  const day = date.getDay(); // 0 일 ~ 6 토
  const offset = day === 0 ? 1 : 1 - day;
  date.setDate(date.getDate() + offset);
  return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
}

/**
 * 한 주(월~금) 사진 매핑.
 * 반환: { 'YYYYMMDD': '/data/bbs/<cat>/<ts>.jpg' }
 */
export async function fetchSajipBbsWeekPhotos(
  target: SajipBbsScrapeTarget,
  ymd: string
): Promise<Record<string, string>> {
  const monday = getMondayYmd(ymd);
  const yyyy = monday.substring(0, 4);
  const mm = monday.substring(4, 6);
  const cacheKey = `${target.host}:${target.bbsCategory}:${yyyy}-${mm}`;

  let monthMap: Record<number, string>;
  const cached = MONTH_CACHE.get(cacheKey);
  if (cached && Date.now() - cached.at < MONTH_TTL_MS) {
    // 캐시는 day → relPath. ymd 로 변환은 아래에서.
    const out: Record<string, string> = {};
    for (const [day, p] of Object.entries(cached.data)) {
      out[`${yyyy}${mm}${String(day).padStart(2, '0')}`] = p;
    }
    return filterToWeek(out, monday);
  }

  // sw=6 으로 한 달치 한 번에 (4월~12월 모든 달이 1~6주차 안에 다 들어감)
  const url = `https://${target.host}/bbs/list.html?category=${encodeURIComponent(
    target.bbsCategory
  )}&yStr=${yyyy}&mStr=${parseInt(mm, 10)}&sw=6`;
  let html: string;
  try {
    const res = await fetchWithTimeout(url);
    if (!res.ok) return {};
    html = await res.text();
  } catch {
    return {};
  }

  const dayMap = parseSajipMonth(html, target.bbsCategory);
  monthMap = dayMap;

  // day → ymd 변환
  const ymdMap: Record<string, string> = {};
  for (const [day, p] of Object.entries(monthMap)) {
    ymdMap[`${yyyy}${mm}${String(day).padStart(2, '0')}`] = p;
  }

  // 빈 결과는 캐시 안 함 (사이트 일시 장애 흡수)
  if (Object.keys(ymdMap).length > 0) {
    MONTH_CACHE.set(cacheKey, { at: Date.now(), data: monthMap as unknown as Record<string, string> });
  }

  return filterToWeek(ymdMap, monday);
}

/** monday 부터 5일치 (월~금) 만 통과시킴. */
function filterToWeek(ymdMap: Record<string, string>, monday: string): Record<string, string> {
  const yyyy = monday.substring(0, 4);
  const mm = monday.substring(4, 6);
  const dd = monday.substring(6, 8);
  const mondayDate = new Date(parseInt(yyyy, 10), parseInt(mm, 10) - 1, parseInt(dd, 10));
  const allowed = new Set<string>();
  for (let i = 0; i < 5; i++) {
    const d = new Date(mondayDate);
    d.setDate(mondayDate.getDate() + i);
    allowed.add(
      `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
    );
  }
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(ymdMap)) {
    if (allowed.has(k)) out[k] = v;
  }
  return out;
}
