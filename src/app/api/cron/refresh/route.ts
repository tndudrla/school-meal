import { NextRequest, NextResponse } from 'next/server';
import { CHONGGYE_TARGET, fetchWeekPhotos } from '@/lib/schoolScraper';
import { fetchMealFromNeis } from '@/lib/neis';
import { formatDate } from '@/lib/utils';

/**
 * 주기적으로 NEIS 메뉴 + 학교 홈페이지 사진을 미리 불러와 캐시를 데움.
 * Vercel Cron에서 호출하거나, 수동으로 GET /api/cron/refresh 로 트리거.
 *
 * 보호:
 *   - CRON_SECRET 환경변수가 설정되어 있으면, Authorization: Bearer <secret> 요구
 *   - Vercel Cron은 자동으로 이 헤더를 붙여줌
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get('authorization');
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
  }

  const today = new Date();
  const ymd = formatDate(today);

  const results: Record<string, unknown> = { triggeredAt: new Date().toISOString(), ymd };

  // 1. NEIS 메뉴 오늘·내일 미리 캐싱
  const schoolCode = '7569109';
  const atptCode = 'J10';
  try {
    const [todayMeal, tomorrowMeal] = await Promise.all([
      fetchMealFromNeis({ atptCode, schoolCode, ymd, apiKey: process.env.NEIS_API_KEY }),
      (() => {
        const t = new Date(today);
        t.setDate(t.getDate() + 1);
        return fetchMealFromNeis({
          atptCode,
          schoolCode,
          ymd: formatDate(t),
          apiKey: process.env.NEIS_API_KEY,
        });
      })(),
    ]);
    results.neis = { today: !!todayMeal, tomorrow: !!tomorrowMeal };
  } catch (err) {
    results.neisError = err instanceof Error ? err.message : String(err);
  }

  // 2. 청계초 홈페이지 이번주 사진 캐싱
  try {
    const photos = await fetchWeekPhotos(CHONGGYE_TARGET, ymd);
    results.photos = { count: Object.keys(photos).length, ymds: Object.keys(photos) };
  } catch (err) {
    results.photosError = err instanceof Error ? err.message : String(err);
  }

  return NextResponse.json(results);
}
