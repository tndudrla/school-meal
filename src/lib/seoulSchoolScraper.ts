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
 * 학교 루트 페이지 HTML 에서 식단 캘린더 menuId 발견.
 * 캐시 hit 우선. 실패 시 throw (caller 가 잡아서 빈 weekMap).
 *
 * 전략 (Stage 14-1-1, 2026-05-02):
 *   학교마다 식단 페이지 라벨이 너무 다양 ('급식일정', '급식메뉴', '급식식단표',
 *   '급식안내', '학교급식', '오늘의 식단', '급식 전체보기' 등 10+ 패턴).
 *   라벨 정규식 우선순위만으로는 robust 하지 않아, **후보 추출 → 각 후보로
 *   캘린더 POST → fnDetail count 가장 큰 menuId 채택** 방식.
 *
 *   비용: 학교당 root 1회 + 후보 N(보통 2~4)회 POST. menuId 캐시 24h →
 *   학교당 24h 에 1회만 발생. cron 시점에 흡수 → 사용자 경험 영향 0.
 */
export async function discoverMenuId(host: string): Promise<string> {
  const cached = MENU_ID_CACHE.get(host);
  if (cached && Date.now() - cached.at < MENU_ID_TTL_MS) {
    return cached.menuId;
  }

  const res = await fetchWithTimeout(`https://${host}/`);
  if (!res.ok) throw new Error(`root fetch failed: ${res.status}`);
  const html = await res.text();

  const candidates = extractMenuCandidates(html);
  if (candidates.length === 0) {
    throw new Error('menuId 후보 추출 실패 — 급식 라벨 link 없음');
  }

  // 각 후보 캘린더 probe — 가장 큰 fnDetail count 가 진짜 식단 페이지
  const scored = await Promise.all(
    candidates.map(async (c) => {
      const count = await probeCalendarFnDetail(host, c.menuId);
      return { ...c, count };
    })
  );
  scored.sort((a, b) => b.count - a.count);
  const best = scored[0];
  if (!best || best.count === 0) {
    // 모든 후보가 fnDetail 0 — 학교가 식단 안 올리는 케이스. 캐시는 안 함
    // (학교가 나중에 올리기 시작하면 다시 발견되도록)
    throw new Error('모든 menuId 후보의 fnDetail 0 — 학교 식단 페이지 없음');
  }

  MENU_ID_CACHE.set(host, { at: Date.now(), menuId: best.menuId });
  return best.menuId;
}

/**
 * root HTML 에서 가능한 menuId 후보 모두 추출.
 *
 *  (a) `<a href="/{N}/subMenu.do">급식*|식단*|식사*</a>` — sub link
 *  (b) `onclick="moveQuickMenuURL('CTC...', '{N}', '...')"` + 인접 텍스트에
 *      식단 라벨 — quickmenu (sub link 없는 학교, 예: isu)
 *
 * 같은 menuId 가 여러 라벨로 노출되는 경우 한 번만. 식단·급식 라벨 없는
 * link 는 처음부터 후보 X (학교 메뉴 수십개 다 probe 하면 부담).
 */
export function extractMenuCandidates(
  html: string
): Array<{ menuId: string; label: string }> {
  const candidates = new Map<string, string>(); // menuId → label
  const FOOD_LABEL = /급식|식단|식사/;

  // (a) sub link
  const subRe = /<a[^>]+href=["']\/(\d+)\/subMenu\.do["'][^>]*>([^<]+)<\/a>/g;
  let m: RegExpExecArray | null;
  while ((m = subRe.exec(html)) !== null) {
    const menuId = m[1];
    const label = m[2].trim();
    if (!FOOD_LABEL.test(label)) continue;
    if (!candidates.has(menuId)) candidates.set(menuId, label);
  }

  // (b) quickmenu — 인자 + 인접 500자 안 식단 라벨
  const qRe =
    /moveQuickMenuURL\(\s*['"]CTC\d+['"]\s*,\s*['"](\d+)['"][^)]*\)([\s\S]{0,500})/g;
  while ((m = qRe.exec(html)) !== null) {
    const menuId = m[1];
    const ctx = m[2];
    if (!FOOD_LABEL.test(ctx)) continue;
    if (candidates.has(menuId)) continue;
    const labelM = ctx.match(/(급식식단|식단|급식일정|급식안내|학교급식|급식)/);
    candidates.set(menuId, labelM ? labelM[1] : '(quickmenu)');
  }

  return [...candidates.entries()].map(([menuId, label]) => ({ menuId, label }));
}

/**
 * menuId 후보로 4월 캘린더 POST → fnDetail onclick 매치 수.
 * 0 이면 식단 페이지 아님 (게시판 등). 양수면 진짜 캘린더.
 *
 * Note: probe 는 4월 (검증된 달) 로 고정. 5월 갓 시작 시점엔 식단 미등록이라
 * fnDetail 0 일 수 있어 menuId 자동 발견이 실패. 4월 같은 안정 시점으로 probe.
 */
async function probeCalendarFnDetail(host: string, menuId: string): Promise<number> {
  try {
    const res = await fetchWithTimeout(`https://${host}/${menuId}/subMenu.do`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'srhMlsvYear=2026&srhMlsvMonth=04',
    });
    if (!res.ok) return 0;
    const html = await res.text();
    const matches = html.match(/onclick=["']fnDetail\(\s*'(\d+)'\s*,\s*this\s*\)\s*;?["']/g);
    return matches ? matches.length : 0;
  } catch {
    return 0;
  }
}

// ----- 캘린더 파싱 (date → mlsvId) -----------------------------------------

/**
 * 캘린더 HTML 에서 td 단위로 day + mlsvId 매핑 추출.
 *
 * 학교마다 anchor 텍스트가 너무 다양 (Stage 14-1-1 발견):
 *   - '>0428<' (4자리 MMDD) — 서초·매헌
 *   - '>28<' / '>1<' (1~2자리 day) — 일부 학교
 *   - '>학교급식<' / '>점심<' (한글 라벨) — isu 등
 *
 * → td 안에서 day 숫자(평문) 와 fnDetail mlsvId 를 함께 추출하는 게 robust.
 * 캘린더 한 칸 = `<td>...day_number...<a onclick="fnDetail('N',this)">label</a>...</td>`
 *
 * mm 은 외부에서 받은 month — fetch 시 명시한 srhMlsvMonth 와 동일.
 */
export function parseCalendarMlsvIds(
  html: string,
  yyyy: string,
  mm: string,
  weekdays: string[] // 월~금 ['MMDD','MMDD','MMDD','MMDD','MMDD']
): Record<string, string> {
  const result: Record<string, string> = {};
  // tbody 안 td 만 (thead 제외)
  const tbodyMatch = html.match(/<tbody[\s\S]*?<\/tbody>/i);
  if (!tbodyMatch) return result;
  const tbody = tbodyMatch[0];

  // 각 td 추출
  const tdRe = /<td\b[^>]*>([\s\S]*?)<\/td>/g;
  let td: RegExpExecArray | null;
  const seen = new Set<string>();
  while ((td = tdRe.exec(tbody)) !== null) {
    const inner = td[1];
    // (1) day 숫자 — 1~31, td 안 평문 가장 처음 매치
    //    빈 td (`&nbsp;`) 또는 다음 달 칸 거름
    const dayM = inner.match(/(?:^|>)\s*(\d{1,2})\s*(?:<|\n|\s)/);
    if (!dayM) continue;
    const day = parseInt(dayM[1], 10);
    if (day < 1 || day > 31) continue;
    // (2) fnDetail mlsvId — 같은 td 안. 여러 개면 첫 번째만 (특수메뉴 보단 점심)
    const fnM = inner.match(/onclick=["']fnDetail\(\s*'(\d+)'/);
    if (!fnM) continue;
    const mlsvId = fnM[1];

    const mmdd = `${mm}${String(day).padStart(2, '0')}`;
    if (!weekdays.includes(mmdd)) continue;
    if (seen.has(mmdd)) continue;
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
  const mm = monday.substring(4, 6);
  const mlsvByDate = parseCalendarMlsvIds(calendarHtml, yyyy, mm, mmdds);
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
