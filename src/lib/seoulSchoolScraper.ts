/**
 * 서울교육청(sen.es.kr) 학교 사진 scraper. (Stage 14-1, 2026-05-02)
 *
 * 페이지 구조 (서울서초초등학교 기준 — `seocho.sen.es.kr`):
 *   1) 학교 루트 `/` HTML 안에 '급식일정' link `href="/{menuId}/subMenu.do"`
 *      → menuId 는 학교마다 다름 (서초 = 77335). 런타임 발견 + 24h 캐시.
 *   2) 캘린더 페이지 `/{menuId}/subMenu.do` 의 <td> 안 onclick:
 *        onclick="fnDetail('{mlsvId}', this);" 텍스트 'MMDD'
 *      → 날짜 → mlsvId 매핑 추출 (월~금만)
 *   3) detail AJAX:
 *        POST /dggb/module/mlsv/selectMlsvDetailPopup.do  body: mlsvId={N}
 *      → 응답 HTML 안 사진 src:
 *        /dggb/module/file/selectImageView.do?atchFileId=...&fileSn=0
 *
 * 반환 형태는 schoolScraper.ts 의 Goeay 와 동일:
 *   Record<YYYYMMDD, 상대경로>
 */

const UA = 'Mozilla/5.0 (compatible; school-meal-bot)';
const FETCH_TIMEOUT_MS = 10000;

export interface SenEsScrapeTarget {
  kind: 'sen-es';
  host: string; // 예: seocho.sen.es.kr (사립 케이스: www.gyeseong1882.es.kr)
  // menuId 는 런타임 자동 발견. 학교마다 다르고 거의 안 바뀌어 24h 캐시.
}

// ----- 캐시 ------------------------------------------------------------------

// host → menuId. TTL 24h (학교 menuId 정책 변경은 드물지만 영영 캐시는 위험).
const MENU_ID_CACHE = new Map<string, { at: number; menuId: string }>();
const MENU_ID_TTL_MS = 24 * 60 * 60 * 1000;

// host:weekStart → weekMap. 빈 결과는 캐시 안 함 (goeay 와 동일 정책).
const WEEK_CACHE = new Map<string, { at: number; data: Record<string, string> }>();
const WEEK_TTL_MS = 60 * 60 * 1000;

// ----- 유틸 -----------------------------------------------------------------

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

/** YYYYMMDD → 그 주 월요일 YYYYMMDD. 1주치(월~금) 추출 기준. */
function getMondayYmd(ymd: string): string {
  const y = parseInt(ymd.substring(0, 4), 10);
  const m = parseInt(ymd.substring(4, 6), 10) - 1;
  const d = parseInt(ymd.substring(6, 8), 10);
  const date = new Date(y, m, d);
  const day = date.getDay(); // 0 일 ~ 6 토
  // 일요일이면 다음 월요일, 그 외엔 가까운 월요일로
  const offset = day === 0 ? 1 : 1 - day;
  date.setDate(date.getDate() + offset);
  return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
}

/** YYYYMMDD 의 yyyy + mmdd 결합. */
function combineYmd(yyyy: string, mmdd: string): string {
  return `${yyyy}${mmdd}`;
}

// ----- menuId 자동 발견 -----------------------------------------------------

/**
 * 학교 루트 페이지 HTML 에서 '급식일정' 링크 → menuId 추출.
 * 캐시 hit 우선. 실패 시 throw (caller 가 잡아서 빈 weekMap).
 */
export async function discoverMenuId(host: string): Promise<string> {
  const cached = MENU_ID_CACHE.get(host);
  if (cached && Date.now() - cached.at < MENU_ID_TTL_MS) {
    return cached.menuId;
  }

  const res = await fetchWithTimeout(`https://${host}/`);
  if (!res.ok) throw new Error(`root fetch failed: ${res.status}`);
  const html = await res.text();

  const menuId = parseMenuIdFromHtml(html);
  if (!menuId) {
    throw new Error('menuId 추출 실패 — 급식일정 링크 못 찾음');
  }

  MENU_ID_CACHE.set(host, { at: Date.now(), menuId });
  return menuId;
}

/**
 * HTML 에서 '급식일정' (또는 '급식') 라벨 가까이의 `/{N}/subMenu.do` link 추출.
 * 학교마다 메뉴 라벨이 약간 흔들릴 수 있어 텍스트 우선 + fallback 으로 첫 매치.
 */
export function parseMenuIdFromHtml(html: string): string | null {
  // 1차: '급식' 라벨 포함된 anchor 의 href
  const labelRe = /<a[^>]+href=["']\/(\d+)\/subMenu\.do["'][^>]*>([^<]*급식[^<]*)<\/a>/g;
  const m1 = labelRe.exec(html);
  if (m1) return m1[1];

  // 2차: 첫 subMenu.do 링크 (대부분의 학교 사이트가 급식일정을 메인 메뉴 상단에 둠)
  const anyRe = /href=["']\/(\d+)\/subMenu\.do["']/;
  const m2 = html.match(anyRe);
  if (m2) return m2[1];

  return null;
}

// ----- 캘린더 파싱 (date → mlsvId) -----------------------------------------

/**
 * 캘린더 HTML 에서 (YYYY 인자) 와 onclick="fnDetail('mlsvId',...)" 텍스트 'MMDD' 매칭.
 * 한 날짜에 mlsvId 여러 개 있으면 첫 번째만. 월~금 5일치만 반환.
 */
export function parseCalendarMlsvIds(
  html: string,
  yyyy: string,
  weekdays: string[] // 월~금 ['MMDD','MMDD','MMDD','MMDD','MMDD']
): Record<string, string> {
  const result: Record<string, string> = {};
  // <a ... onclick="fnDetail('NNNNNN', this);" ...>MMDD</a>
  const re = /onclick=["']fnDetail\(\s*'(\d+)'\s*,\s*this\s*\)\s*;?["'][^>]*>(\d{4})</g;
  let m: RegExpExecArray | null;
  const seen = new Set<string>();
  while ((m = re.exec(html)) !== null) {
    const mlsvId = m[1];
    const mmdd = m[2];
    if (!weekdays.includes(mmdd)) continue;
    if (seen.has(mmdd)) continue; // 같은 날 중복은 첫 번째만
    seen.add(mmdd);
    result[combineYmd(yyyy, mmdd)] = mlsvId;
  }
  return result;
}

// ----- detail AJAX → 사진 src ----------------------------------------------

/**
 * detail popup AJAX 호출. body: mlsvId={N} (form-urlencoded).
 */
export async function fetchDetailHtml(host: string, mlsvId: string): Promise<string> {
  const url = `https://${host}/dggb/module/mlsv/selectMlsvDetailPopup.do`;
  const body = new URLSearchParams({ mlsvId });
  const res = await fetchWithTimeout(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'text/html,*/*',
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: body.toString(),
  });
  if (!res.ok) throw new Error(`detail fetch failed: ${res.status}`);
  return await res.text();
}

/**
 * detail HTML 에서 사진 src 추출. 영양교사가 보통 1장이라 첫 매치만.
 *
 * URL 변형 두 가지 관찰됨:
 *   (a) /dggb/module/file/selectImageView.do?atchFileId=...&fileSn=0
 *   (b) /dggb/module/file/selectImageView.do;jsessionid=XXX?atchFileId=...&fileSn=0
 *      세션 식별자가 path 에 박힌 형태 (Java EE 의 jsessionid path param).
 *
 * 둘 다 atchFileId 가 query 에 있어야 진짜 사진. 단순 `selectImageView.do` 만
 * 있고 atchFileId 가 없으면 placeholder/icon 일 가능성 → 거름.
 */
export function parsePhotoSrc(html: string): string | null {
  const re =
    /<img[^>]+src=["'](\/dggb\/module\/file\/selectImageView\.do[^"']*\?[^"']*atchFileId=[^"']+)["']/i;
  const m = html.match(re);
  if (!m) return null;
  // jsessionid path param 제거 — 매 응답마다 달라져 photoMirror 의 source_url
  // 비교가 매번 mismatch → 불필요한 재다운로드. path 와 query 만 보존하면
  // 같은 사진은 같은 URL 로 정규화돼 미러 idempotency 회복.
  return m[1].replace(/;jsessionid=[^?]+(?=\?)/i, '');
}

// ----- 주간 사진 추출 --------------------------------------------------------

/**
 * 한 주(월~금) 사진 URL 매핑.
 * 반환: { 'YYYYMMDD': '/dggb/module/file/selectImageView.do?...' }
 */
export async function fetchSenEsWeekPhotos(
  target: SenEsScrapeTarget,
  ymd: string
): Promise<Record<string, string>> {
  const monday = getMondayYmd(ymd);
  const cacheK = `${target.host}:${monday}`;

  const cached = WEEK_CACHE.get(cacheK);
  if (cached && Date.now() - cached.at < WEEK_TTL_MS) {
    return cached.data;
  }

  // 월~금 5일치 (YYYYMMDD)
  const yyyy = monday.substring(0, 4);
  const mondayDate = new Date(
    parseInt(yyyy, 10),
    parseInt(monday.substring(4, 6), 10) - 1,
    parseInt(monday.substring(6, 8), 10)
  );
  const mmdds: string[] = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(mondayDate);
    d.setDate(mondayDate.getDate() + i);
    mmdds.push(
      `${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
    );
  }

  // 1. menuId 발견
  let menuId: string;
  try {
    menuId = await discoverMenuId(target.host);
  } catch {
    return {};
  }

  // 2. 캘린더 페이지 fetch — POST 로 명시적 year/month 전송.
  //    GET 로 호출하면 "현재 월" 페이지를 받는데, 해당 월 식단이 아직 등록 안
  //    됐으면 onclick 0건. 영양교사가 보통 한 주씩 미리 올려서, 월초 며칠은
  //    빈 상태가 정상 흐름. 명시적 month POST 로 ymd 가 속한 달을 직접 요청.
  let calendarHtml: string;
  try {
    const params = new URLSearchParams({
      srhMlsvYear: yyyy,
      srhMlsvMonth: monday.substring(4, 6),
    });
    const res = await fetchWithTimeout(`https://${target.host}/${menuId}/subMenu.do`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    if (!res.ok) return {};
    calendarHtml = await res.text();
  } catch {
    return {};
  }

  // 3. date → mlsvId 추출 (월~금)
  const mlsvByDate = parseCalendarMlsvIds(calendarHtml, yyyy, mmdds);
  if (Object.keys(mlsvByDate).length === 0) return {};

  // 4. 각 mlsvId 에 대해 detail AJAX 병렬 호출
  // 한 학교 5 req 라 학교 서버 부담 미미 + 한 번에 ~3초 안에 끝남
  const data: Record<string, string> = {};
  await Promise.all(
    Object.entries(mlsvByDate).map(async ([dateYmd, mlsvId]) => {
      try {
        const detail = await fetchDetailHtml(target.host, mlsvId);
        const src = parsePhotoSrc(detail);
        if (src) data[dateYmd] = src;
      } catch {
        // 한 날짜 실패는 다른 날짜를 막지 않음
      }
    })
  );

  if (Object.keys(data).length > 0) {
    WEEK_CACHE.set(cacheK, { at: Date.now(), data });
  }
  return data;
}
