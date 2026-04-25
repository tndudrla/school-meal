/**
 * 경기도교육청(goeay.kr) 학교 홈페이지의 주간 식단 페이지에서
 * 날짜별 급식 사진 URL을 추출한다.
 *
 * 페이지 구조 (청계초등학교 기준):
 *   form action = /{sysId}/ad/fm/foodmenu/selectFoodMenuView.do (POST)
 *   parameters  = { mi, sysId, schDt: 'YYYY-MM-DD' }
 *   - thead 의 <th> 7개에 YYYY-MM-DD 날짜 표기
 *   - tbody 중식 행의 <td> 7개에 각 날짜 이미지 (없으면 기본 아이콘)
 */

export interface SchoolScrapeTarget {
  host: string; // 예: chonggye-e.goeay.kr
  sysId: string; // 예: chonggye-e
  mi: string; // 예: 9904 (식단 페이지 메뉴 ID)
}

const WEEK_CACHE = new Map<string, { at: number; data: Record<string, string> }>();
const WEEK_TTL_MS = 60 * 60 * 1000; // 1시간

function cacheKey(target: SchoolScrapeTarget, weekStartYmd: string) {
  return `${target.sysId}:${target.mi}:${weekStartYmd}`;
}

// 주 시작일(일요일 기준 YYYY-MM-DD) 계산
function getWeekStart(ymd: string): string {
  const d = new Date(
    parseInt(ymd.substring(0, 4)),
    parseInt(ymd.substring(4, 6)) - 1,
    parseInt(ymd.substring(6, 8))
  );
  // 이 페이지는 일요일~토요일을 한 화면에 보여주므로 일요일 기준
  const sunday = new Date(d);
  sunday.setDate(d.getDate() - d.getDay());
  return `${sunday.getFullYear()}-${String(sunday.getMonth() + 1).padStart(2, '0')}-${String(sunday.getDate()).padStart(2, '0')}`;
}

// YYYYMMDD → YYYY-MM-DD
function ymdToDashed(ymd: string): string {
  return `${ymd.substring(0, 4)}-${ymd.substring(4, 6)}-${ymd.substring(6, 8)}`;
}

// YYYY-MM-DD → YYYYMMDD
function dashedToYmd(dashed: string): string {
  return dashed.replace(/-/g, '');
}

/**
 * 주 단위로 HTML을 받아 날짜별 사진 URL을 추출한다.
 * 반환: { 'YYYYMMDD': 'https://.../img_xxx.jpg' } — 사진 없는 날짜는 미포함
 */
export async function fetchWeekPhotos(
  target: SchoolScrapeTarget,
  ymd: string
): Promise<Record<string, string>> {
  const weekStart = getWeekStart(ymd);
  const key = cacheKey(target, weekStart);

  const cached = WEEK_CACHE.get(key);
  if (cached && Date.now() - cached.at < WEEK_TTL_MS) {
    return cached.data;
  }

  const url = `https://${target.host}/${target.sysId}/ad/fm/foodmenu/selectFoodMenuView.do`;
  const body = new URLSearchParams({
    mi: target.mi,
    sysId: target.sysId,
    schDt: weekStart,
  });

  // 캐싱은 위쪽 WEEK_CACHE(인메모리, 1시간 TTL)가 담당.
  // Next.js Data Cache는 GET만 자동 적용되어 POST에는 next: { revalidate } 옵션이 무효.
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (compatible; school-meal-bot)',
    },
    body: body.toString(),
  });

  if (!res.ok) {
    throw new Error(`school page fetch failed: ${res.status}`);
  }

  const html = await res.text();
  const data = parseWeekPhotos(html);

  WEEK_CACHE.set(key, { at: Date.now(), data });
  return data;
}

/**
 * HTML 문자열에서 날짜별 사진 URL 매핑을 추출.
 * - thead <th> 에서 날짜 7개 (일~토) 순서 획득
 * - tbody 중식 <tr> 의 <td> 7개를 같은 순서로 훑으며 업로드된 이미지 추출
 * - 기본 아이콘(/images/ad/fm/meal_icon.png)은 무시
 */
export function parseWeekPhotos(html: string): Record<string, string> {
  const result: Record<string, string> = {};

  // 1. thead 에서 날짜 추출
  const theadMatch = html.match(/<thead[\s\S]*?<\/thead>/i);
  if (!theadMatch) return result;
  const dates: string[] = [];
  const thDateRe = /<br\s*\/?>\s*(\d{4}-\d{2}-\d{2})/g;
  let m: RegExpExecArray | null;
  while ((m = thDateRe.exec(theadMatch[0])) !== null) {
    dates.push(m[1]);
  }
  if (dates.length === 0) return result;

  // 2. tbody 에서 "중식" 행 추출
  const tbodyMatch = html.match(/<tbody[\s\S]*?<\/tbody>/i);
  if (!tbodyMatch) return result;

  // 중식 행만 대상 (석식/조식 등 다른 행이 섞이면 첫 행 사용)
  const lunchRowMatch = tbodyMatch[0].match(
    /<tr[^>]*>\s*<th[^>]*>\s*중식\s*<\/th>([\s\S]*?)<\/tr>/
  );
  const rowInner = lunchRowMatch ? lunchRowMatch[1] : tbodyMatch[0];

  // 3. <td> 를 순서대로 분리
  const tdRe = /<td\b[^>]*>([\s\S]*?)<\/td>/g;
  const cells: string[] = [];
  while ((m = tdRe.exec(rowInner)) !== null) {
    cells.push(m[1]);
  }

  // 4. 각 td 에서 업로드된 사진 추출
  const cellCount = Math.min(cells.length, dates.length);
  for (let i = 0; i < cellCount; i++) {
    const imgMatch = cells[i].match(
      /<img[^>]+src=["'](\/upload\/[^"']+\.(?:jpg|jpeg|png|webp))["']/i
    );
    if (imgMatch) {
      result[dashedToYmd(dates[i])] = imgMatch[1];
    }
  }

  return result;
}

export function toAbsolutePhotoUrl(target: SchoolScrapeTarget, path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `https://${target.host}${path}`;
}

export async function fetchPhotoForDate(
  target: SchoolScrapeTarget,
  ymd: string
): Promise<string | null> {
  const map = await fetchWeekPhotos(target, ymd);
  const path = map[ymd];
  if (!path) return null;
  return toAbsolutePhotoUrl(target, path);
}

export { ymdToDashed };
